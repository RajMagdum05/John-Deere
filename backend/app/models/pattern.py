from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

try:
    from app.database import Base
except ImportError:
    from backend.app.database import Base


class Pattern(Base):
    """Detected operational pattern"""
    __tablename__ = "patterns"
    
    id = Column(String, primary_key=True, index=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), index=True)
    farmer_id = Column(String, ForeignKey("farmers.id"), index=True)
    pattern_type = Column(String, index=True)  # high_idle_time, low_fuel_efficiency, etc.
    occurrence_count = Column(Integer)
    likely_cause = Column(Text)
    common_operation_type = Column(String)
    common_field_name = Column(String)
    peak_times = Column(String)
    avg_fuel_impact = Column(Float)
    confidence = Column(Float)
    detected_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="patterns")
    recommendations = relationship("Recommendation", back_populates="pattern")
