from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean, Text
from datetime import datetime
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False, index=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=True, index=True)
    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    has_pattern = Column(Boolean, default=False)
    occurrence_count = Column(Integer, default=0)


class PatternAnalysis(Base):
    __tablename__ = "pattern_analysis"

    id = Column(String, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=True, index=True)
    likely_cause = Column(Text, nullable=True)
    action_recommendation = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow)
