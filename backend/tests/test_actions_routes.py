import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import Farmer, Equipment, Pattern, Recommendation, FarmerAction, ImpactMetric

# Setup SQLite in-memory test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_database():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    
    # Clean tables
    db.query(ImpactMetric).delete()
    db.query(FarmerAction).delete()
    db.query(Recommendation).delete()
    db.query(Pattern).delete()
    db.query(Equipment).delete()
    db.query(Farmer).delete()
    db.commit()

    # Seed test data
    farmer = Farmer(
        id="demo-farmer-001",
        name="Demo Farmer",
        email="demo@farmer.com",
        phone="+91 98765 43210",
        location="Pune, Maharashtra",
    )
    equip = Equipment(
        id="equip-001",
        farmer_id="demo-farmer-001",
        name="6120B Tractor",
        model="6120B",
        equipment_type="tractor",
        fuel_capacity=150.0,
    )
    pattern = Pattern(
        id="pattern-001",
        equipment_id="equip-001",
        farmer_id="demo-farmer-001",
        pattern_type="high_idle_time",
        occurrence_count=4,
        likely_cause="Operator leaves engine running during breaks",
        common_operation_type="General operation",
        common_field_name="Field B",
        peak_times="09:00-12:00",
        avg_fuel_impact=2.5,
        confidence=0.92,
    )
    rec = Recommendation(
        id="rec-001",
        pattern_id="pattern-001",
        farmer_id="demo-farmer-001",
        action_text="Turn off engine during waits on Field B",
        expected_result="Save 2.5 L/hr fuel",
        priority="high",
        confidence=0.92,
        fuel_savings_estimate=2.5,
    )
    db.add(farmer)
    db.add(equip)
    db.add(pattern)
    db.add(rec)
    db.commit()
    db.close()

    yield

    app.dependency_overrides.pop(get_db, None)


client = TestClient(app)


def test_action_flow():
    # 1. Test action confirmation with rec-001
    response = client.post("/api/actions/rec-001?action_type=completed&notes=Turned+off+engine")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "recorded"
    assert "action_id" in data

    # 2. Test get farmer actions
    response = client.get("/api/actions/farmer/demo-farmer-001")
    assert response.status_code == 200
    actions_data = response.json()
    assert "actions" in actions_data
    assert len(actions_data["actions"]) == 1
    assert actions_data["actions"][0]["action_type"] == "completed"

    # 3. Test get impact metrics
    response = client.get("/api/actions/impact/demo-farmer-001")
    assert response.status_code == 200
    impact_data = response.json()
    assert "metrics" in impact_data
    assert "summary" in impact_data
    assert impact_data["summary"]["total_actions"] == 1


def test_action_not_found():
    response = client.post("/api/actions/nonexistent-rec?action_type=completed")
    assert response.status_code == 404
