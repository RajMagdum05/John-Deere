import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import Farmer, Equipment, Measurement
from datetime import datetime, timedelta

client = TestClient(app)


def test_live_data_endpoint():
    db = SessionLocal()
    try:
        farmer_id = "test-live-farmer"
        equip_id = "test-live-tractor"

        # Cleanup existing
        db.query(Measurement).filter(Measurement.equipment_id == equip_id).delete()
        db.query(Equipment).filter(Equipment.id == equip_id).delete()
        db.query(Farmer).filter(Farmer.id == farmer_id).delete()
        db.commit()

        # Create farmer & equipment
        farmer = Farmer(
            id=farmer_id,
            name="Live Farmer",
            email="live@farm.test",
            john_deere_org_id="org_live",
        )
        equip = Equipment(
            id=equip_id,
            farmer_id=farmer_id,
            model="5050D",
            equipment_type="TRACTOR",
            is_connected=True,
        )
        db.add(farmer)
        db.add(equip)
        db.commit()

        # Add recent measurement (< 5 mins)
        meas = Measurement(
            id="test-live-meas-1",
            equipment_id=equip_id,
            timestamp=datetime.utcnow() - timedelta(minutes=1),
            speed=4.5,
            fuel_level=78.0,
            fuel_consumption_rate=5.2,
        )
        db.add(meas)
        db.commit()

        # Request live data
        response = client.get(f"/api/farmer/{farmer_id}/live")
        assert response.status_code == 200
        data = response.json()
        assert data["farmer_id"] == farmer_id
        assert len(data["machines"]) == 1
        assert data["machines"][0]["id"] == equip_id
        assert data["machines"][0]["status"] == "working"
        assert data["machines"][0]["telemetry"]["speed"] == 4.5
        assert data["machines"][0]["telemetry"]["fuel_level"] == 78.0

        # Clean up
        db.query(Measurement).filter(Measurement.equipment_id == equip_id).delete()
        db.query(Equipment).filter(Equipment.id == equip_id).delete()
        db.query(Farmer).filter(Farmer.id == farmer_id).delete()
        db.commit()
    finally:
        db.close()


def test_day_data_endpoint():
    response_d1 = client.get("/api/farmer/demo-farmer-001/day/1")
    assert response_d1.status_code == 200
    data_d1 = response_d1.json()
    assert data_d1["day"] == 1
    assert data_d1["farmer_id"] == "demo-farmer-001"
    assert len(data_d1["machines"]) == 4

    response_d7 = client.get("/api/farmer/demo-farmer-001/day/7")
    assert response_d7.status_code == 200
    data_d7 = response_d7.json()
    assert data_d7["day"] == 7
    assert len(data_d7["machines"]) == 4

    # Invalid day check
    response_inv = client.get("/api/farmer/demo-farmer-001/day/9")
    assert response_inv.status_code == 400

