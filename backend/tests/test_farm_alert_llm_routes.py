import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.llm_analysis import parse_llm_response, analyze_alert_pattern

client = TestClient(app)


def test_get_farmer_alerts_endpoint():
    response = client.get("/api/farmer/alerts?date=2026-09-29")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    
    # Check alert-001 structure
    idle_alert = next((a for a in data if a["id"] == "alert-001"), None)
    assert idle_alert is not None
    assert idle_alert["type"] == "high_idle_time"
    assert idle_alert["equipment_name"] == "6120B Tractor"
    assert idle_alert["value"] == 46
    assert idle_alert["unit"] == "minutes"
    assert idle_alert["has_pattern"] is True
    assert idle_alert["occurrence_count"] == 4


def test_get_farmer_pattern_details():
    response = client.get("/api/farmer/alerts/alert-001/pattern")
    assert response.status_code == 200
    pattern = response.json()
    
    assert pattern["alert_id"] == "alert-001"
    assert pattern["equipment_name"] == "6120B Tractor"
    assert pattern["occurrence_count"] == 4
    assert len(pattern["occurrence_dates"]) == 4
    assert len(pattern["values"]) == 4
    assert "likely_cause" in pattern
    assert len(pattern["likely_cause"]) > 0
    assert "action_recommendation" in pattern
    assert len(pattern["action_recommendation"]) > 0


def test_post_farmer_action_commitment():
    payload = {
        "alert_id": "alert-001",
        "action_type": "reduce_idle_time",
        "action_text": "Turn off engine during 5+ min waits",
        "commitment": "committed",
        "farmer_id": "demo-farmer-001",
    }
    response = client.post("/api/farmer/actions", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "committed"
    assert res_data["action_id"] == "action-001"


def test_post_farmer_action_notify():
    response = client.post("/api/farmer/actions/action-001/notify")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "notification_sent"
    assert "6120B Tractor" in data["message"]


def test_llm_parsing_and_analysis_fallback():
    sample_text = """
Likely Cause: Operator waits during turnarounds at field edge.
Action Recommendation: Turn off tractor ignition during delays exceeding 5 minutes.
"""
    cause, action = parse_llm_response(sample_text)
    assert cause == "Operator waits during turnarounds at field edge."
    assert action == "Turn off tractor ignition during delays exceeding 5 minutes."

    # Test fallback
    result = analyze_alert_pattern(
        alert_id="test-alert-999",
        alert_type="high_idle_time",
        equipment_name="6120B Tractor",
        occurrence_count=4,
        occurrence_dates=["Sep 23", "Sep 25", "Sep 27", "Sep 29"],
        values=[41, 44, 46, 52],
        unit="minutes",
    )
    assert "likely_cause" in result
    assert "action_recommendation" in result
