from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime

try:
    from app.database import Base
except ImportError:
    from backend.app.database import Base


class Equipment(Base):
    """Equipment (tractor, sprayer, etc.)"""
    __tablename__ = "equipment"
    
    id = Column(String, primary_key=True, index=True)
    john_deere_id = Column(String, unique=True, index=True, nullable=True)
    farmer_id = Column(String, ForeignKey("farmers.id"), index=True)
    name = Column(String, index=True, nullable=True)
    model = Column(String, nullable=True)
    equipment_type = Column(String, nullable=True)  # tractor, sprayer, implement
    fuel_capacity = Column(Float, nullable=True)
    serial_number = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")
    is_connected = Column(Boolean, default=False, nullable=True)
    connected_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    farmer = relationship("Farmer", back_populates="equipment")
    measurements = relationship("Measurement", back_populates="equipment")
    field_operations = relationship("FieldOperation", back_populates="equipment")
    telemetry_records = relationship("TelemetryRecord", back_populates="equipment")
    patterns = relationship("Pattern", back_populates="equipment")
