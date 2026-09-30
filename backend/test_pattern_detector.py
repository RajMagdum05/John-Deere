"""Test pattern detection service."""

import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.data_generator import generate_6day_simulation
from app.services.pattern_detector import detect_patterns

# Generate simulation data
print("Generating 6-day simulation...")
simulation = generate_6day_simulation()

# Collect all telemetry records across all equipment and days
all_telemetry = []
for equip in simulation["equipment"]:
    for day in equip["daily_data"]:
        all_telemetry.extend(day["telemetry"])

print(f"Total telemetry records collected: {len(all_telemetry)}")
print()

# Detect patterns
print("Detecting patterns...")
patterns = detect_patterns(all_telemetry)

print(f"Total patterns detected: {len(patterns)}\n")
for p in patterns:
    print(f"[{p['type'].upper()}] Equipment: {p['equipment_id']}")
    print(f"  Occurrences: {p['occurrence_count']}, Conf: {p['confidence']}")
    print(f"  Likely Cause: {p['likely_cause']}")
    print(f"  Field: {p['common_field_name']}, Peak: {p['peak_times']}")
    print(f"  Est. Fuel Impact: {p['avg_fuel_impact']} L/hr")
    print()

print("Pattern Detection Test Passed!")
