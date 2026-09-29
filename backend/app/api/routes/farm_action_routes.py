from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import FieldOperation, Equipment
from app.services.demo_telemetry_service import DEMO_FARMER_ID
from app.services.action_plan_service import ActionPlanService
from app.schemas.farm_action import (
    AnalysisRunResponse,
    FarmActionResponse,
    FarmActionListResponse,
    UpdateActionStatusRequest,
    FarmActionSummaryResponse,
    TopActionSummary,
)

router = APIRouter(prefix="/api/demo/farmer/actions", tags=["Farm Action Loop"])


@router.post("/analyze", response_model=AnalysisRunResponse)
def analyze_farm_patterns(db: Session = Depends(get_db)):
    """Run session analytics from stored simulated demo data and generate prioritized action guidance."""
    # Check if telemetry exists
    has_operations = (
        db.query(FieldOperation)
        .join(Equipment, FieldOperation.equipment_id == Equipment.id)
        .filter(Equipment.farmer_id == DEMO_FARMER_ID)
        .first()
    )
    if not has_operations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prepare demo farm data before running analysis.",
        )

    result = ActionPlanService.run_analysis_and_generate_actions(db, farmer_id=DEMO_FARMER_ID)
    return AnalysisRunResponse(
        analysis_ready=result.get("analysis_ready", True),
        sessions_analyzed=result.get("sessions_analyzed", 0),
        actions_generated=result.get("actions_generated", 0),
        message=result.get("message", "Farm patterns analysed successfully."),
    )


@router.get("", response_model=FarmActionListResponse)
def get_farm_actions(db: Session = Depends(get_db)):
    """Retrieve prioritized FarmAction records for the demo farmer."""
    actions = ActionPlanService.get_actions(db, farmer_id=DEMO_FARMER_ID)
    return FarmActionListResponse(
        analysis_ready=len(actions) > 0,
        actions=actions,
    )


@router.post("/{action_id}/status", response_model=FarmActionResponse)
def update_farm_action_status(
    action_id: str,
    payload: UpdateActionStatusRequest,
    db: Session = Depends(get_db),
):
    """Update action status (e.g. will_try, tried, not_relevant)."""
    if payload.status not in ["will_try", "tried", "not_relevant"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action status.",
        )

    updated_action = ActionPlanService.update_action_status(
        db, action_id=action_id, new_status=payload.status, farmer_id=DEMO_FARMER_ID
    )
    if not updated_action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action record not found or does not belong to the demo farmer.",
        )

    return updated_action


@router.get("/summary", response_model=FarmActionSummaryResponse)
def get_farm_action_summary(db: Session = Depends(get_db)):
    """Retrieve high-level summary of action guidance for Farmer Today overview."""
    actions = ActionPlanService.get_actions(db, farmer_id=DEMO_FARMER_ID)
    if not actions:
        return FarmActionSummaryResponse(
            analysis_ready=False,
            attention_needed=False,
            action_count=0,
            top_action=None,
        )

    top_act = actions[0]
    return FarmActionSummaryResponse(
        analysis_ready=True,
        attention_needed=True,
        action_count=len(actions),
        top_action=TopActionSummary(
            id=top_act.id,
            priority=top_act.priority,
            action_type=top_act.action_type,
            equipment_name=top_act.equipment.name,
            confidence=top_act.confidence,
        ),
    )
