from sqlalchemy import Column, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class FieldOperation(Base):
    __tablename__ = "field_operations"
    
    id = Column(String, primary_key=True, index=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), index=True)
    operation_type = Column(String)  # planting, spraying, harvesting, etc.
    start_time = Column(DateTime, index=True)
    end_time = Column(DateTime)
    area_hectares = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="field_operations")
