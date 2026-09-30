import os
import sys

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.llm import generate_action

examples = [
    {
        "name": "Scenario 1: High Idle Time during Tillage",
        "alert": {
            "type": "High Idle Time",
            "equipment_name": "6120B Tractor",
        },
        "pattern": {
            "occurrence_count": 4,
            "likely_cause": "Operator waits with engine idling during turnarounds and field adjustments",
            "common_operation_type": "Tillage",
            "common_field_name": "Field B",
            "avg_fuel_impact": 3.2,
        },
    },
    {
        "name": "Scenario 2: Excessive Speed Variation during Crop Spraying",
        "alert": {
            "type": "Speed Inconsistency",
            "equipment_name": "Boom Sprayer",
        },
        "pattern": {
            "occurrence_count": 5,
            "likely_cause": "Operator surges speed between 4 km/h and 14 km/h causing uneven spray coverage",
            "common_operation_type": "Spraying",
            "common_field_name": "North Orchard (Field A)",
            "avg_fuel_impact": 2.1,
        },
    },
    {
        "name": "Scenario 3: Suboptimal Gear Selection & High RPM during Road Transport",
        "alert": {
            "type": "High RPM / Wrong Gear",
            "equipment_name": "5310 Tractor",
        },
        "pattern": {
            "occurrence_count": 6,
            "likely_cause": "Operating in 3rd Low instead of 4th High during road transport with empty trailer",
            "common_operation_type": "Haulage / Transport",
            "common_field_name": "Connecting Road Route 4",
            "avg_fuel_impact": 4.5,
        },
    },
    {
        "name": "Scenario 4: High Wheel Slip and Aggressive Throttle",
        "alert": {
            "type": "Excessive Wheel Slip",
            "equipment_name": "5050D Tractor",
        },
        "pattern": {
            "occurrence_count": 3,
            "likely_cause": "High throttle on wet clay soil with improper ballast weight",
            "common_operation_type": "Primary Tillage / Plowing",
            "common_field_name": "South Lowland (Field C)",
            "avg_fuel_impact": 2.8,
        },
    },
    {
        "name": "Scenario 5: Extended Hydraulic Pump Engagement while Stationary",
        "alert": {
            "type": "Auxiliary Hydraulic Overload",
            "equipment_name": "6120B Tractor",
        },
        "pattern": {
            "occurrence_count": 4,
            "likely_cause": "Hydraulic lever locked in detent position while tractor is parked",
            "common_operation_type": "Implement Loading",
            "common_field_name": "Shed / Loading Bay",
            "avg_fuel_impact": 3.6,
        },
    },
]

print("================================================================")
print("🚜 GEMINI AI ACTION GENERATION - MULTI-SCENARIO TEST SUITE")
print("================================================================\n")

for idx, ex in enumerate(examples, 1):
    print(f"--- [{idx}/5] {ex['name']} ---")
    print(f"Machine: {ex['alert']['equipment_name']} | Issue: {ex['alert']['type']} | Occurrences: {ex['pattern']['occurrence_count']}x")
    print(f"Likely Cause: {ex['pattern']['likely_cause']}")
    print("-" * 60)
    
    recommendation = generate_action(ex["pattern"], ex["alert"])
    print(recommendation)
    print("\n" + "=" * 64 + "\n")
