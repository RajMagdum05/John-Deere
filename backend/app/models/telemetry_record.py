from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

try:
    from app.database import Base
except ImportError:
    from backend.app.database import Base


class TelemetryRecord(Base):
    """Equipment telemetry data (daily records)"""
    __tablename__ = "telemetry_records"
    
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), index=True)
    timestamp = Column(DateTime, index=True)
    speed = Column(Float)
    fuel_level = Column(Float)
    fuel_consumption = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    field_name = Column(String)
    machine_state = Column(String)  # working, idle, off
    engine_hours = Column(Float)
    anomalies = Column(JSON)  # List of anomaly dicts
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="telemetry_records")
