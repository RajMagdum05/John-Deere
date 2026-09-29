from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class FarmAction(Base):
    __tablename__ = "farm_actions"

    id = Column(String, primary_key=True, index=True)
    farmer_id = Column(String, ForeignKey("farmers.id"), index=True, nullable=False)
    equipment_id = Column(String, ForeignKey("equipment.id"), index=True, nullable=False)
    action_type = Column(String, nullable=False)
    priority = Column(Integer, nullable=False)
    status = Column(String, default="recommended", nullable=False)
    title_key = Column(String, nullable=False)
    evidence_json = Column(JSON, nullable=True)
    steps_json = Column(JSON, nullable=True)
    expected_outcome_json = Column(JSON, nullable=True)
    confidence = Column(String, nullable=False)
    action_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    farmer = relationship("Farmer")
    equipment = relationship("Equipment")
