from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Integer, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class OperatorStat(Base):
    __tablename__ = "operator_stats"
    
    id = Column(String, primary_key=True, index=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), index=True)
    operator_identifier = Column(String, index=True)  # inferred operator (Operator A, B, C)
    avg_efficiency = Column(Float)  # liters per hectare
    total_fuel = Column(Float)
    total_area = Column(Float)
    operation_count = Column(Integer)
    rank = Column(Integer)
    is_anomaly = Column(Boolean, default=False)
    trend_direction = Column(String)  # improving, declining, stable
    recommendations = Column(JSON)
    churn_risk = Column(Float)  # for PM dashboard
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    equipment = relationship("Equipment")
