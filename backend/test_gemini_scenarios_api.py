import os
import sys
import json

# Force UTF-8 on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.utils.llm import generate_action

client = TestClient(app)

test_scenarios = [
    {
        "id": "alert-001",
        "title": "Scenario 1: High Idle Time during Tillage Turnarounds",
        "alert": {
            "id": "alert-001",
            "type": "High Idle Time",
            "equipment_name": "John Deere 6120B Tractor",
        },
        "pattern": {
            "occurrence_count": 4,
            "likely_cause": "Operator leaves engine running at high idle while waiting for grain cart and turnarounds",
            "common_operation_type": "Tillage",
            "common_field_name": "Field B (East)",
            "avg_fuel_impact": 3.2,
        },
    },
    {
        "id": "alert-002",
        "title": "Scenario 2: Boom Sprayer Speed Fluctuations & Over-application",
        "alert": {
            "id": "alert-002",
            "type": "Speed Variation / Pressure Mismatch",
            "equipment_name": "John Deere R4038 Sprayer",
        },
        "pattern": {
            "occurrence_count": 5,
            "likely_cause": "Aggressive acceleration between headlands causing fluctuating spray pressure and chemical waste",
            "common_operation_type": "Chemical Application / Spraying",
            "common_field_name": "North Orchard (Plot 12)",
            "avg_fuel_impact": 2.4,
        },
    },
    {
        "id": "alert-003",
        "title": "Scenario 3: Suboptimal Gear Selection & High RPM in Road Transport",
        "alert": {
            "id": "alert-003",
            "type": "High Engine RPM / Low Gear",
            "equipment_name": "John Deere 5310 4WD Tractor",
        },
        "pattern": {
            "occurrence_count": 6,
            "likely_cause": "Tractor driven at 2400+ RPM in 3rd range during empty trailer haulage instead of gear-up/throttle-back",
            "common_operation_type": "Haulage & Road Transport",
            "common_field_name": "State Highway & Farm Access Rd",
            "avg_fuel_impact": 4.1,
        },
    },
    {
        "id": "alert-004",
        "title": "Scenario 4: Excessive Wheel Slip on Wet Clay Plowing",
        "alert": {
            "id": "alert-004",
            "type": "Excessive Wheel Slip (>18%)",
            "equipment_name": "John Deere 5050D Tractor",
        },
        "pattern": {
            "occurrence_count": 3,
            "likely_cause": "Plowing without differential lock engaged with incorrect rear tire ballasting",
            "common_operation_type": "Primary Disc Plowing",
            "common_field_name": "South Wetland (Field C)",
            "avg_fuel_impact": 2.9,
        },
    },
    {
        "id": "alert-005",
        "title": "Scenario 5: Continuous Hydraulic SCV Detent Pressure",
        "alert": {
            "id": "alert-005",
            "type": "Hydraulic Pump Overload / SCV Detent",
            "equipment_name": "John Deere 6120B Tractor",
        },
        "pattern": {
            "occurrence_count": 4,
            "likely_cause": "Rear selective control valve lever not centered after implement cylinder lift, continuous relief valve blowing",
            "common_operation_type": "Loader / Implement Staging",
            "common_field_name": "Storage Shed & Yard",
            "avg_fuel_impact": 3.7,
        },
    },
    {
        "id": "alert-006",
        "title": "Scenario 6: Combine Harvester Rotor Loss and Ground Speed Mismatch",
        "alert": {
            "id": "alert-006",
            "type": "Combine Rotor Loss / High Speed",
            "equipment_name": "John Deere S770 Combine Harvester",
        },
        "pattern": {
            "occurrence_count": 5,
            "likely_cause": "Ground speed too fast for crop density causing rotor overload and grain loss",
            "common_operation_type": "Wheat Harvesting",
            "common_field_name": "Main Valley Section 4",
            "avg_fuel_impact": 5.2,
        },
    },
]


def test_api_endpoint_scenarios():
    print("=" * 80)
    print("🌱 TESTING GEMINI LLM ACTION GENERATION ACROSS 6 DIVERSE SCENARIOS")
    print("=" * 80 + "\n")

    # 1. Test standard API route
    print(">>> [Test 1] Testing Default Endpoint: POST /api/farmer/alerts/alert-001/action")
    res = client.post("/api/farmer/alerts/alert-001/action")
    print(f"Status Code: {res.status_code}")
    data = res.json()
    print("Returned JSON keys:", list(data.keys()))
    print(f"Action: {data.get('action')}")
    print(f"Expected Result: {data.get('expected_result')}\n")
    assert res.status_code == 200
    assert "action" in data
    assert "expected_result" in data

    # 2. Test each individual scenario with LLM generator
    for idx, sc in enumerate(test_scenarios, 1):
        print("=" * 80)
        print(f"🚜 [{idx}/{len(test_scenarios)}] {sc['title']}")
        print(f"   Machine   : {sc['alert']['equipment_name']}")
        print(f"   Alert     : {sc['alert']['type']}")
        print(f"   Operation : {sc['pattern']['common_operation_type']} ({sc['pattern']['common_field_name']})")
        print(f"   Occurred  : {sc['pattern']['occurrence_count']} times | Potential Fuel Loss: {sc['pattern']['avg_fuel_impact']} L/hr")
        print(f"   Root Cause: {sc['pattern']['likely_cause']}")
        print("-" * 80)

        result_text = generate_action(sc["pattern"], sc["alert"])
        print(result_text)
        print("-" * 80)

        # Verification
        assert len(result_text) > 20, "Response must not be empty"
        assert "operator" in result_text.lower() or "tell" in result_text.lower() or "expected" in result_text.lower()
        print(f"✅ Scenario {idx} PASSED validation.\n")

    print("=" * 80)
    print("🎯 ALL 6 SCENARIOS SUCCESSFULLY TESTED AND VERIFIED!")
    print("=" * 80)

if __name__ == "__main__":
    test_api_endpoint_scenarios()
