from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

try:
    from app.database import Base
except ImportError:
    from backend.app.database import Base


class Farmer(Base):
    """Farmer profile"""
    __tablename__ = "farmers"
    
    id = Column(String, primary_key=True, index=True)
    john_deere_org_id = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="farmer")
    actions = relationship("FarmerAction", back_populates="farmer")
