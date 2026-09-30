from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

try:
    from app.database import Base
except ImportError:
    from backend.app.database import Base


class Recommendation(Base):
    """LLM-generated recommendation"""
    __tablename__ = "recommendations"
    
    id = Column(String, primary_key=True, index=True)
    pattern_id = Column(String, ForeignKey("patterns.id"), index=True)
    farmer_id = Column(String, ForeignKey("farmers.id"), index=True)
    action_text = Column(Text)
    expected_result = Column(Text)
    priority = Column(String)  # high, medium, low
    confidence = Column(Float)
    fuel_savings_estimate = Column(Float)
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    pattern = relationship("Pattern", back_populates="recommendations")
    actions = relationship("FarmerAction", back_populates="recommendation")
