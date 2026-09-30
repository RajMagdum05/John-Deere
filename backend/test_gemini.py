import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.utils.llm import generate_action
except ImportError:
    from backend.app.utils.llm import generate_action

# Test with sample data
test_pattern = {
    "occurrence_count": 4,
    "likely_cause": "Operator leaves engine running during breaks",
    "common_operation_type": "Tillage",
    "common_field_name": "Field B",
    "avg_fuel_impact": 3.2,
}

test_alert = {
    "type": "High Idle Time",
    "equipment_name": "6120B Tractor",
}

action = generate_action(test_pattern, test_alert)
print("Generated Action:")
print(action)
