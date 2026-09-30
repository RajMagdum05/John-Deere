import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import FarmAction
from app.services.demo_telemetry_service import (
    DEMO_FARMER_ID,
    ensure_demo_fixtures,
    populate_demo_telemetry_sync,
)
from app.services.session_analytics_service import extract_session_features
from app.services.action_plan_service import ActionPlanService


class TestFarmActionLoop(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        db = SessionLocal()
        try:
            ensure_demo_fixtures(db)
            populate_demo_telemetry_sync(db)
        finally:
            db.close()

    def test_session_feature_calculation_produces_valid_fuel_per_acre(self):
        db = SessionLocal()
        try:
            sessions = extract_session_features(db, farmer_id=DEMO_FARMER_ID)
            self.assertGreater(len(sessions), 0)
            for s in sessions:
                self.assertGreater(s.duration_hours, 0)
                self.assertGreater(s.fuel_per_acre, 0)
                self.assertGreaterEqual(s.idle_proxy_ratio, 0.0)
                self.assertLessEqual(s.idle_proxy_ratio, 1.0)
        finally:
            db.close()

    def test_analysis_endpoint_and_deterministic_generation(self):
        # Run analysis via POST endpoint
        response = self.client.post("/api/demo/farmer/actions/analyze")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["analysis_ready"])
        self.assertGreater(data["sessions_analyzed"], 0)
        self.assertLessEqual(data["actions_generated"], 3)
        self.assertGreater(data["actions_generated"], 0)

        # Retrieve actions
        get_res = self.client.get("/api/demo/farmer/actions")
        self.assertEqual(get_res.status_code, 200)
        actions_data = get_res.json()
        self.assertTrue(actions_data["analysis_ready"])
        actions = actions_data["actions"]
        self.assertLessEqual(len(actions), 3)
        self.assertGreater(len(actions), 0)

        # Check action structure
        for act in actions:
            self.assertIn("id", act)
            self.assertIn("priority", act)
            self.assertIn("status", act)
            self.assertIn("action_type", act)
            self.assertIn("equipment", act)
            self.assertIn("evidence", act)
            self.assertIn("steps", act)
            self.assertIn(act["confidence"], ["low", "medium", "high"])

    def test_rerunning_analysis_does_not_duplicate_actions(self):
        # Run analysis first time
        res1 = self.client.post("/api/demo/farmer/actions/analyze")
        self.assertEqual(res1.status_code, 200)

        get1 = self.client.get("/api/demo/farmer/actions")
        count1 = len(get1.json()["actions"])

        # Run analysis second time
        res2 = self.client.post("/api/demo/farmer/actions/analyze")
        self.assertEqual(res2.status_code, 200)

        get2 = self.client.get("/api/demo/farmer/actions")
        count2 = len(get2.json()["actions"])

        self.assertEqual(count1, count2)
        self.assertLessEqual(count2, 3)

    def test_update_action_status_and_validation(self):
        get_res = self.client.get("/api/demo/farmer/actions")
        actions = get_res.json()["actions"]
        self.assertGreater(len(actions), 0)
        target_action = actions[0]
        action_id = target_action["id"]

        # Valid update to 'will_try'
        update_res = self.client.post(
            f"/api/demo/farmer/actions/{action_id}/status",
            json={"status": "will_try"},
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["status"], "will_try")

        # Valid update to 'tried'
        update_res2 = self.client.post(
            f"/api/demo/farmer/actions/{action_id}/status",
            json={"status": "tried"},
        )
        self.assertEqual(update_res2.status_code, 200)
        self.assertEqual(update_res2.json()["status"], "tried")

        # Invalid status returns 400 or 422
        invalid_res = self.client.post(
            f"/api/demo/farmer/actions/{action_id}/status",
            json={"status": "invalid_status_value"},
        )
        self.assertIn(invalid_res.status_code, [400, 422])

    def test_summary_endpoint(self):
        response = self.client.get("/api/demo/farmer/actions/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["analysis_ready"])
        self.assertTrue(data["attention_needed"])
        self.assertGreater(data["action_count"], 0)
        self.assertIsNotNone(data["top_action"])
        self.assertIn("id", data["top_action"])
        self.assertIn("priority", data["top_action"])


if __name__ == "__main__":
    unittest.main()
