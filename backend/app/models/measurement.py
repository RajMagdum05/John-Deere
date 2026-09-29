from sqlalchemy import Column, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Measurement(Base):
    __tablename__ = "measurements"
    
    id = Column(String, primary_key=True, index=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), index=True)
    timestamp = Column(DateTime, index=True)
    fuel_consumption_rate = Column(Float)  # liters per hour
    fuel_level = Column(Float)  # percentage
    speed = Column(Float)  # km/h
    engine_hours = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="measurements")
