"""API test placeholder."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "John Deere Operator Efficiency API"}


def test_farmer_efficiency():
    response = client.get("/api/farmer/efficiency")
    assert response.status_code == 200
    data = response.json()
    assert "total_fuel" in data
    assert "avg_efficiency" in data


def test_farmer_operators():
    response = client.get("/api/farmer/operators")
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_farmer_recommendations():
    response = client.get("/api/farmer/recommendations")
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert "operator" in response.json()[0]
    assert "recommendation" in response.json()[0]


def test_pm_aggregate_metrics():
    response = client.get("/api/pm/aggregate-metrics")
    assert response.status_code == 200
    data = response.json()
    assert "active_users" in data
    assert "total_fuel_tracked" in data


def test_pm_feature_usage():
    response = client.get("/api/pm/feature-usage")
    assert response.status_code == 200
    assert len(response.json()) == 5

