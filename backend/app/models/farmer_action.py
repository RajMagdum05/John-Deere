from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

try:
    from app.database import Base
except ImportError:
    from backend.app.database import Base


class FarmerAction(Base):
    """Farmer's action confirmation"""
    __tablename__ = "farmer_actions"
    
    id = Column(String, primary_key=True, index=True)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), index=True, nullable=True)
    farmer_id = Column(String, ForeignKey("farmers.id"), index=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), index=True, nullable=True)
    action_type = Column(String)  # completed, planned, dismissed
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    recommendation = relationship("Recommendation", back_populates="actions")
    farmer = relationship("Farmer", back_populates="actions")
    equipment = relationship("Equipment")
