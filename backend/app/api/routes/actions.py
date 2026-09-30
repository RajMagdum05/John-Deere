"""
API routes for farmer actions.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

try:
    from app.database import get_db
    from app.models import FarmerAction, Recommendation, ImpactMetric
except ImportError:
    from backend.app.database import get_db
    from backend.app.models import FarmerAction, Recommendation, ImpactMetric

router = APIRouter(prefix="/api/actions", tags=["Actions"])


@router.post("/{recommendation_id}")
def confirm_action(
    recommendation_id: str,
    action_type: str = "completed",
    notes: str = "",
    db: Session = Depends(get_db)
):
    """
    Farmer confirms they will take / have taken action.
    """
    # Get recommendation
    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id
    ).first()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # Create action record
    equipment_id = recommendation.pattern.equipment_id if recommendation.pattern else None
    action = FarmerAction(
        id=f"action-{int(datetime.utcnow().timestamp() * 1000)}",
        recommendation_id=recommendation_id,
        farmer_id=recommendation.farmer_id,
        equipment_id=equipment_id,
        action_type=action_type,
        notes=notes,
        completed_at=datetime.utcnow() if action_type == "completed" else None,
    )
    
    db.add(action)
    db.commit()
    db.refresh(action)
    
    # Calculate / record sample impact metric if completed
    if action_type == "completed":
        fuel_savings = recommendation.fuel_savings_estimate or 2.8
        impact = ImpactMetric(
            farmer_id=recommendation.farmer_id,
            equipment_id=equipment_id or "equip-001",
            action_id=action.id,
            metric_type="fuel_savings",
            before_value=6.5,
            after_value=round(6.5 - (fuel_savings * 0.4), 2),
            improvement_percent=round((fuel_savings / 6.5) * 100, 1),
            measured_at=datetime.utcnow(),
        )
        db.add(impact)
        db.commit()
    
    return {
        "action_id": action.id,
        "status": "recorded",
        "message": "Action recorded successfully",
    }


@router.get("/farmer/{farmer_id}")
def get_farmer_actions(farmer_id: str, db: Session = Depends(get_db)):
    """
    Get all actions for a farmer.
    """
    actions = db.query(FarmerAction).filter(
        FarmerAction.farmer_id == farmer_id
    ).order_by(FarmerAction.created_at.desc()).all()
    
    return {
        "actions": [
            {
                "id": action.id,
                "recommendation_id": action.recommendation_id,
                "action_type": action.action_type,
                "notes": action.notes,
                "completed_at": action.completed_at.isoformat() if action.completed_at else None,
                "created_at": action.created_at.isoformat(),
            }
            for action in actions
        ]
    }


@router.get("/impact/{farmer_id}")
def get_impact_metrics(farmer_id: str, db: Session = Depends(get_db)):
    """
    Get impact metrics for a farmer (before/after comparison).
    """
    metrics = db.query(ImpactMetric).filter(
        ImpactMetric.farmer_id == farmer_id
    ).all()
    
    # Calculate summary
    total_fuel_saved = sum(m.before_value - m.after_value for m in metrics if m.metric_type == "fuel_savings")
    avg_improvement = sum(m.improvement_percent for m in metrics) / max(1, len(metrics)) if metrics else 0.0
    
    return {
        "metrics": [
            {
                "id": m.id,
                "metric_type": m.metric_type,
                "before_value": m.before_value,
                "after_value": m.after_value,
                "improvement_percent": m.improvement_percent,
                "measured_at": m.measured_at.isoformat() if m.measured_at else None,
            }
            for m in metrics
        ],
        "summary": {
            "total_fuel_saved_litres": round(total_fuel_saved, 2),
            "avg_improvement_percent": round(avg_improvement, 2),
            "total_actions": len(metrics),
        }
    }
