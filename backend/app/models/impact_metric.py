from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

try:
    from app.database import Base
except ImportError:
    from backend.app.database import Base


class ImpactMetric(Base):
    """Before/after impact metrics"""
    __tablename__ = "impact_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(String, ForeignKey("farmers.id"), index=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), index=True)
    action_id = Column(String, ForeignKey("farmer_actions.id"), index=True)
    metric_type = Column(String)  # fuel_savings, idle_reduction, efficiency_gain
    before_value = Column(Float)
    after_value = Column(Float)
    improvement_percent = Column(Float)
    measured_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    farmer = relationship("Farmer")
    equipment = relationship("Equipment")
    action = relationship("FarmerAction")
