import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_demo_equipment():
    response = client.get("/api/demo/farmer/equipment")
    assert response.status_code == 200
    data = response.json()
    assert "farmer" in data
    assert data["farmer"]["name"] == "Rajesh Kumar"
    assert "equipment" in data
    assert len(data["equipment"]) == 4
    for equip in data["equipment"]:
        assert "id" in equip
        assert "is_connected" in equip


def test_connect_single_equipment():
    response = client.post("/api/demo/farmer/equipment/demo-5050d/connect")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "demo-5050d"
    assert data["is_connected"] is True
    assert data["connected_at"] is not None


def test_disconnect_single_equipment():
    response = client.post("/api/demo/farmer/equipment/demo-5050d/disconnect")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "demo-5050d"
    assert data["is_connected"] is False
    assert data["connected_at"] is None


def test_connect_all_equipment():
    response = client.post("/api/demo/farmer/equipment/connect-all")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    assert all(d["is_connected"] is True for d in data)


def test_reset_equipment_connections():
    response = client.post("/api/demo/farmer/equipment/reset-connections")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    assert all(d["is_connected"] is False for d in data)


def test_simulation_status_endpoint():
    response = client.get("/api/demo/farmer/simulation/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "progress" in data
    assert "current_day" in data


def test_today_summary_endpoint():
    response = client.get("/api/demo/farmer/today-summary")
    assert response.status_code == 200
    data = response.json()
    assert "data_ready" in data
    assert "farmer" in data
    assert "connected_machines" in data
