from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Farmer(Base):
    __tablename__ = "farmers"
    
    id = Column(String, primary_key=True, index=True)
    john_deere_org_id = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="farmer")
