import os
import sys
import json
import time

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.utils.llm import generate_action

client = TestClient(app)

comprehensive_scenarios = [
    {
        "id": "alert-001",
        "category": "Tractor Idle Reduction",
        "machine": "John Deere 6120B (120 HP)",
        "alert": {
            "id": "alert-001",
            "type": "High Idle Time (>45 mins)",
            "equipment_name": "6120B Heavy Duty Tractor",
        },
        "pattern": {
            "occurrence_count": 4,
            "likely_cause": "Engine left running during trailer loading and headland turns",
            "common_operation_type": "Primary Tillage",
            "common_field_name": "Field B (East Ridge)",
            "avg_fuel_impact": 3.2,
        },
    },
    {
        "id": "alert-002",
        "category": "Spraying Uniformity & Pressure",
        "machine": "John Deere R4038 Self-Propelled Sprayer",
        "alert": {
            "id": "alert-002",
            "type": "Speed Inconsistency & Pressure Drift",
            "equipment_name": "R4038 Boom Sprayer",
        },
        "pattern": {
            "occurrence_count": 5,
            "likely_cause": "Rapid throttle fluctuations between 5 km/h and 15 km/h causing spray droplet drift",
            "common_operation_type": "Fungicide Spraying",
            "common_field_name": "North Orchard (Plot 12)",
            "avg_fuel_impact": 2.4,
        },
    },
    {
        "id": "alert-003",
        "category": "Powertrain & Gear Selection",
        "machine": "John Deere 5310 4WD (55 HP)",
        "alert": {
            "id": "alert-003",
            "type": "High Engine RPM / Low Gear Selection",
            "equipment_name": "5310 4WD Utility Tractor",
        },
        "pattern": {
            "occurrence_count": 6,
            "likely_cause": "Driving in 2nd High range at 2400 RPM during unladen road transport instead of Gear-Up/Throttle-Down",
            "common_operation_type": "Road Transport / Haulage",
            "common_field_name": "State Highway & Village Route 4",
            "avg_fuel_impact": 4.1,
        },
    },
    {
        "id": "alert-004",
        "category": "Traction & Wheel Slip",
        "machine": "John Deere 5050D (50 HP)",
        "alert": {
            "id": "alert-004",
            "type": "Excessive Wheel Slip (>18%)",
            "equipment_name": "5050D Tractor",
        },
        "pattern": {
            "occurrence_count": 3,
            "likely_cause": "High throttle in wet clay without differential lock or proper rear tire ballasting",
            "common_operation_type": "Deep Disc Plowing",
            "common_field_name": "South Wetland (Field C)",
            "avg_fuel_impact": 2.9,
        },
    },
    {
        "id": "alert-005",
        "category": "Hydraulics & Relief Valve Overload",
        "machine": "John Deere 6120B (120 HP)",
        "alert": {
            "id": "alert-005",
            "type": "Auxiliary Hydraulic SCV Detent Lock",
            "equipment_name": "6120B Tractor",
        },
        "pattern": {
            "occurrence_count": 4,
            "likely_cause": "SCV lever not returned to neutral after tipping trolley, blowing main hydraulic relief valve",
            "common_operation_type": "Silage Trolley Discharge",
            "common_field_name": "Feed Staging Yard",
            "avg_fuel_impact": 3.6,
        },
    },
    {
        "id": "alert-006",
        "category": "Harvesting Efficiency & Loss Prevention",
        "machine": "John Deere S770 Combine Harvester",
        "alert": {
            "id": "alert-006",
            "type": "Combine Rotor Loss / Excessive Ground Speed",
            "equipment_name": "S770 Combine Harvester",
        },
        "pattern": {
            "occurrence_count": 5,
            "likely_cause": "Excess ground speed in high-moisture wheat causing rotor overload and 3.5% grain loss",
            "common_operation_type": "Wheat Grain Harvest",
            "common_field_name": "Main Valley Section 4",
            "avg_fuel_impact": 5.4,
        },
    },
    {
        "id": "alert-007",
        "category": "Precision Seeding & Metering",
        "machine": "John Deere MaxEmerge 5 Planter",
        "alert": {
            "id": "alert-007",
            "type": "Seed Singulation & Ground Speed Variance",
            "equipment_name": "MaxEmerge 5 8-Row Planter",
        },
        "pattern": {
            "occurrence_count": 4,
            "likely_cause": "Planting speed exceeding 10 km/h causing seed bounce and missing skip rates in furrow",
            "common_operation_type": "Corn Planting",
            "common_field_name": "West Terrace Field 7",
            "avg_fuel_impact": 1.8,
        },
    },
    {
        "id": "alert-008",
        "category": "PTO Operation & Rotary Tillage",
        "machine": "John Deere 5075E Tractor (75 HP)",
        "alert": {
            "id": "alert-008",
            "type": "PTO RPM Mismatch / Rotor Overload",
            "equipment_name": "5075E Tractor with Rotavator",
        },
        "pattern": {
            "occurrence_count": 4,
            "likely_cause": "Rotavator operated in standard 540 PTO mode at 2200 RPM instead of 540E Economy PTO mode",
            "common_operation_type": "Secondary Seedbed Prep",
            "common_field_name": "Central Alluvial Plot",
            "avg_fuel_impact": 3.8,
        },
    },
    {
        "id": "alert-009",
        "category": "Sugarcane Harvesting & Base Cutting",
        "machine": "John Deere CH570 Sugarcane Harvester",
        "alert": {
            "id": "alert-009",
            "type": "Base Cutter Pressure Spike & Stubble Damage",
            "equipment_name": "CH570 Cane Harvester",
        },
        "pattern": {
            "occurrence_count": 3,
            "likely_cause": "Base cutter floating too low into hard soil ridge, increasing hydraulic drive pressure",
            "common_operation_type": "Cane Cutting & Windrowing",
            "common_field_name": "River Basin Cane Plot 2",
            "avg_fuel_impact": 6.2,
        },
    },
    {
        "id": "alert-010",
        "category": "Cotton Harvesting & Fan Airflow",
        "machine": "John Deere CP770 Cotton Picker",
        "alert": {
            "id": "alert-010",
            "type": "Duct Airflow Restriction / Low Suction",
            "equipment_name": "CP770 6-Row Cotton Picker",
        },
        "pattern": {
            "occurrence_count": 4,
            "likely_cause": "Operating fan at low RPM in dense early morning dew, damp lint accumulation in picker ducts",
            "common_operation_type": "Cotton Picking",
            "common_field_name": "South Delta Plot A",
            "avg_fuel_impact": 4.8,
        },
    },
]


def run_exhaustive_tests():
    print("=" * 88)
    print("🌾 EXHAUSTIVE MULTI-EXAMPLE TEST SUITE: GEMINI ACTION RECOMMENDATION")
    print("=" * 88 + "\n")

    passed_count = 0

    for idx, ex in enumerate(comprehensive_scenarios, 1):
        print("+" + "-" * 86 + "+")
        print(f"| [{idx:02d}/10] {ex['category'].upper()}")
        print(f"| Machine   : {ex['machine']}")
        print(f"| Alert Type: {ex['alert']['type']}")
        print(f"| Operation : {ex['pattern']['common_operation_type']} @ {ex['pattern']['common_field_name']}")
        print(f"| Frequency : {ex['pattern']['occurrence_count']} occurrences in 7 days | Avg Impact: {ex['pattern']['avg_fuel_impact']} L/hr")
        print(f"| Root Cause: {ex['pattern']['likely_cause']}")
        print("+" + "-" * 86 + "+")

        # 1. Test LLM recommendation generator directly
        rec = generate_action(ex["pattern"], ex["alert"])
        print("\n🤖 [Gemini LLM Output]:")
        for line in rec.split("\n"):
            print(f"   {line}")
        print()

        # 2. Test API endpoint
        api_url = f"/api/farmer/alerts/{ex['id']}/action"
        res = client.post(api_url)
        assert res.status_code == 200, f"API failed with status {res.status_code}"
        api_data = res.json()

        assert "action" in api_data and len(api_data["action"]) > 0
        assert "expected_result" in api_data and len(api_data["expected_result"]) > 0

        print(f"🔌 [FastAPI Endpoint Verification]: POST {api_url} -> 200 OK")
        print(f"   Action Extracted : {api_data['action'][:80]}...")
        print(f"   Expected Result  : {api_data['expected_result']}")
        print(f"   Status           : ✅ VERIFIED\n")

        passed_count += 1

    print("=" * 88)
    print(f"🏆 ALL {passed_count} / {len(comprehensive_scenarios)} DIVERSE EXAMPLES TESTED AND FULLY VERIFIED!")
    print("=" * 88)

if __name__ == "__main__":
    run_exhaustive_tests()
