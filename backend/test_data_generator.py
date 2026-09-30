"""Test the data generator."""

import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.data_generator import generate_6day_simulation, get_live_telemetry

# Test 6-day simulation
print("Generating 6-day simulation...")
simulation = generate_6day_simulation()

print(f"Generated data for {len(simulation['equipment'])} equipment")
print(f"Days: {simulation['days']}")
print()

for equipment in simulation['equipment']:
    print(f"Equipment: {equipment['name']} ({equipment['model']})")
    for day_data in equipment['daily_data']:
        print(f"  Day {day_data['day']}: {day_data['summary']['total_work_hours']} hours, "
              f"{day_data['summary']['idle_hours']} idle, "
              f"{day_data['summary']['anomaly_count']} anomalies")
    print()

# Test live telemetry
print("Testing live telemetry...")
for equip_id in ["equip-001", "equip-002", "equip-003", "equip-004"]:
    live = get_live_telemetry(equip_id)
    print(f"{equip_id}: {live['machine_state']}, speed={live['speed']} km/h, "
          f"fuel={live['fuel_level']}%")

print("\nDone!")
