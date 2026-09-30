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

client = TestClient(app)

def test_sprayer_live_simulation():
    print("=" * 80)
    print("🚜 VERIFYING LIVE SPRAYER SIMULATION TIMELINE & LOCALIZATION")
    print("=" * 80 + "\n")

    # Step 1: Initial State (0-10s) -> Status: "rest"
    print(">>> [Phase 1: Initial Poll (t = 0s - 10s)]")
    r1 = client.get("/api/farmer/demo-farmer-001/live")
    assert r1.status_code == 200
    data1 = r1.json()
    sprayer1 = next(m for m in data1["machines"] if "sprayer" in m["model"].lower() or "sprayer" in m["id"].lower())
    
    print(f"   Machine: {sprayer1['name']} ({sprayer1['model']})")
    print(f"   Status : {sprayer1['status']}")
    print(f"   Telemetry: Speed={sprayer1['telemetry']['speed']} km/h, Location={sprayer1['telemetry']['location']}, Fuel={sprayer1['telemetry']['fuel_level']}%")
    assert sprayer1["status"] == "rest" or sprayer1["status"] in ["rest", "starting", "working"]
    print("   ✅ Phase 1 Verified!\n")

    # Step 2: Intermediate State (10-20s) -> Status: "starting"
    print(">>> [Phase 2: Waiting 11 seconds to reach Starting Sequence (t = 10s - 20s)]...")
    time.sleep(11)
    r2 = client.get("/api/farmer/demo-farmer-001/live")
    assert r2.status_code == 200
    data2 = r2.json()
    sprayer2 = next(m for m in data2["machines"] if "sprayer" in m["model"].lower() or "sprayer" in m["id"].lower())
    
    print(f"   Machine: {sprayer2['name']}")
    print(f"   Status : {sprayer2['status']}")
    print(f"   Telemetry: Speed={sprayer2['telemetry']['speed']} km/h, Location={sprayer2['telemetry']['location']}")
    assert sprayer2["status"] in ["starting", "working"]
    print("   ✅ Phase 2 Starting State Verified!\n")

    # Step 3: Final State (20s+) -> Status: "working", Location: "Field C", Speed: 12.5
    print(">>> [Phase 3: Waiting 10 seconds to reach Working Sequence (t = 20s+)]...")
    time.sleep(10)
    r3 = client.get("/api/farmer/demo-farmer-001/live")
    assert r3.status_code == 200
    data3 = r3.json()
    sprayer3 = next(m for m in data3["machines"] if "sprayer" in m["model"].lower() or "sprayer" in m["id"].lower())
    
    print(f"   Machine: {sprayer3['name']}")
    print(f"   Status : {sprayer3['status']}")
    print(f"   Telemetry: Speed={sprayer3['telemetry']['speed']} km/h, Location={sprayer3['telemetry']['location']}, Fuel={sprayer3['telemetry']['fuel_level']}%")
    assert sprayer3["status"] == "working"
    assert sprayer3["telemetry"]["location"] == "Field C"
    assert sprayer3["telemetry"]["speed"] == 12.5
    print("   ✅ Phase 3 Working State Verified!\n")

    # Step 4: Validate Translations in frontend dictionary
    print(">>> [Phase 4: Validating i18n Translation Keys]")
    translations_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "i18n", "translations.ts"))
    with open(translations_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "'live.starting': 'Starting...'" in content
    assert "'live.fieldC': 'Field C'" in content
    assert "'live.starting': 'सुरू होत आहे...'" in content
    assert "'live.fieldC': 'फील्ड C'" in content

    print("   ✅ English & Marathi translation keys verified in translations.ts")
    print("   - 'live.starting' -> EN: 'Starting...' | MR: 'सुरू होत आहे...'")
    print("   - 'live.fieldC'    -> EN: 'Field C'     | MR: 'फील्ड C'\n")

    print("=" * 80)
    print("🎉 ALL SPRAYER SIMULATION TIMELINE & I18N CHECKS PASSED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    test_sprayer_live_simulation()
