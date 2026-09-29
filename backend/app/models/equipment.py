from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(String, primary_key=True, index=True)
    john_deere_id = Column(String, unique=True, index=True)
    farmer_id = Column(String, ForeignKey("farmers.id"))
    model = Column(String)
    equipment_type = Column(String)
    serial_number = Column(String)
    status = Column(String, default="ACTIVE")
    is_connected = Column(Boolean, default=False, nullable=True)
    connected_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    farmer = relationship("Farmer", back_populates="equipment")
    measurements = relationship("Measurement", back_populates="equipment")
    field_operations = relationship("FieldOperation", back_populates="equipment")
