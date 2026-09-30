from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class FarmAction(Base):
    __tablename__ = "farm_actions"

    id = Column(String, primary_key=True, index=True)
    alert_id = Column(String, nullable=True, index=True)
    farmer_id = Column(String, ForeignKey("farmers.id"), index=True, nullable=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), index=True, nullable=True)
    action_type = Column(String, nullable=True)
    action_text = Column(String, nullable=True)
    commitment = Column(String, default="committed", nullable=True)  # 'committed' or 'ignored'
    priority = Column(Integer, default=1, nullable=True)
    status = Column(String, default="committed", nullable=True)
    title_key = Column(String, nullable=True)
    evidence_json = Column(JSON, nullable=True)
    steps_json = Column(JSON, nullable=True)
    expected_outcome_json = Column(JSON, nullable=True)
    confidence = Column(String, default="high", nullable=True)
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
