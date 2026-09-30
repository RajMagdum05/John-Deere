"""
Initialize database with demo data.
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta

try:
    from app.database import Base, engine, get_db
    from app.models import (
        Farmer,
        Equipment,
        Pattern,
        Recommendation,
        FarmerAction,
        ImpactMetric,
        TelemetryRecord,
    )
    from app.services.data_generator import EQUIPMENT_CONFIG
except ImportError:
    from backend.app.database import Base, engine, get_db
    from backend.app.models import (
        Farmer,
        Equipment,
        Pattern,
        Recommendation,
        FarmerAction,
        ImpactMetric,
        TelemetryRecord,
    )
    from backend.app.services.data_generator import EQUIPMENT_CONFIG


def init_db():
    """Initialize database with demo farmer and equipment."""
    
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Ensure added columns exist in existing PostgreSQL tables if applicable
    if "postgresql" in str(engine.url):
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE farmers ADD COLUMN IF NOT EXISTS phone VARCHAR;"))
                conn.execute(text("ALTER TABLE equipment ADD COLUMN IF NOT EXISTS name VARCHAR;"))
                conn.execute(text("ALTER TABLE equipment ADD COLUMN IF NOT EXISTS fuel_capacity FLOAT;"))
                conn.commit()
            except Exception:
                pass
    
    # Get DB session
    db = next(get_db())
    
    try:
        # Check if demo farmer exists
        demo_farmer = db.query(Farmer).filter(Farmer.id == "demo-farmer-001").first()
        
        if not demo_farmer:
            print("Creating demo farmer...")
            demo_farmer = Farmer(
                id="demo-farmer-001",
                name="Demo Farmer",
                email="demo@farmer.com",
                phone="+91 98765 43210",
                location="Pune, Maharashtra",
            )
            db.add(demo_farmer)
            db.commit()
        
        for equip_config in EQUIPMENT_CONFIG:
            eq = db.query(Equipment).filter(Equipment.id == equip_config["id"]).first()
            if not eq:
                eq = Equipment(
                    id=equip_config["id"],
                    farmer_id="demo-farmer-001",
                    name=equip_config["name"],
                    model=equip_config["model"],
                    equipment_type=equip_config["type"],
                    fuel_capacity=equip_config["fuel_capacity"],
                    is_connected=True,
                )
                db.add(eq)
            else:
                eq.farmer_id = "demo-farmer-001"
                eq.name = equip_config["name"]
                eq.model = equip_config["model"]
                eq.equipment_type = equip_config["type"]
                eq.fuel_capacity = equip_config["fuel_capacity"]
                eq.is_connected = True
        db.commit()

        # Check if demo recommendation exists
        demo_rec = db.query(Recommendation).filter(Recommendation.id == "rec-001").first()
        if not demo_rec:
            print("Creating demo pattern & recommendation...")
            demo_pattern = Pattern(
                id="pattern-001",
                equipment_id="equip-001",
                farmer_id="demo-farmer-001",
                pattern_type="high_idle_time",
                occurrence_count=4,
                likely_cause="Operator leaves engine running during breaks or waits",
                common_operation_type="General operation",
                common_field_name="Field B",
                peak_times="09:00-12:00",
                avg_fuel_impact=2.5,
                confidence=0.92,
            )
            db.add(demo_pattern)

            demo_rec = Recommendation(
                id="rec-001",
                pattern_id="pattern-001",
                farmer_id="demo-farmer-001",
                action_text="Tell your operator to turn off engine during 5+ minute waits on Field B.",
                expected_result="Save 2.5 L/hour of fuel per occurrence, approx 10 L/day.",
                priority="high",
                confidence=0.92,
                fuel_savings_estimate=2.5,
            )
            db.add(demo_rec)
            db.commit()
            print("Demo recommendation rec-001 created!")
    
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
        raise
    
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
