from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import FarmAction, Alert, PatternAnalysis
from app.services.llm_analysis import analyze_alert_pattern

router = APIRouter(prefix="/api/farmer", tags=["Farm Alerts & Actions"])


class ActionCommitmentRequest(BaseModel):
    alert_id: Optional[str] = "alert-001"
    action_type: Optional[str] = "reduce_idle_time"
    action_text: Optional[str] = "Turn off engine during 5+ min waits"
    commitment: Optional[str] = "committed"  # "committed" or "ignored"
    farmer_id: Optional[str] = "demo-farmer-001"
    timestamp: Optional[str] = None


@router.get("/live-machines")
def get_live_machines():
    """
    Get live machines currently active in the field with operation, status, fuel, and speed.
    """
    return [
        {
            "id": "machine-001",
            "name": "5050D Tractor",
            "operation": "Tillage",
            "status": "Working",
            "fuel": "12.3 L/hr",
            "speed": "8.5 km/h",
            "fuel_consumption": 12.3,
            "last_update": "2026-09-30T10:30:00Z",
        },
        {
            "id": "machine-002",
            "name": "6120B Tractor",
            "operation": "Spraying",
            "status": "Working",
            "fuel": "9.8 L/hr",
            "speed": "6.2 km/h",
            "fuel_consumption": 9.8,
            "last_update": "2026-09-30T10:30:00Z",
        },
        {
            "id": "machine-003",
            "name": "Sprayer",
            "operation": "Harvesting",
            "status": "Idle",
            "fuel": "0.5 L/hr",
            "speed": "0 km/h",
            "fuel_consumption": 0.5,
            "last_update": "2026-09-30T10:30:00Z",
        },
    ]


@router.get("/alerts")
def get_farmer_alerts(
    date: str = Query(default="2026-09-29", description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    """
    Fetch alerts for current day (Day 7) with pattern status and occurrence counts.
    """
    return [
        {
            "id": "alert-001",
            "type": "high_idle_time",
            "equipment_id": "demo-6120b",
            "equipment_name": "6120B Tractor",
            "value": 46,
            "unit": "minutes",
            "has_pattern": True,
            "occurrence_count": 4,
            "timestamp": f"{date}T10:30:00Z",
        },
        {
            "id": "alert-002",
            "type": "low_fuel_efficiency",
            "equipment_id": "demo-5050d",
            "equipment_name": "5050D Tractor",
            "value": 8.8,
            "unit": "L/hr",
            "has_pattern": True,
            "occurrence_count": 3,
            "timestamp": f"{date}T11:15:00Z",
        },
        {
            "id": "alert-003",
            "type": "speed_anomaly",
            "equipment_id": "demo-5310",
            "equipment_name": "5310 Tractor",
            "value": 3.1,
            "unit": "km/h",
            "has_pattern": False,
            "occurrence_count": 1,
            "timestamp": f"{date}T11:45:00Z",
        },
        {
            "id": "alert-004",
            "type": "gps_boundary",
            "equipment_id": "demo-boom-sprayer",
            "equipment_name": "Boom Sprayer",
            "value": 2.1,
            "unit": "ha",
            "has_pattern": False,
            "occurrence_count": 1,
            "timestamp": f"{date}T12:00:00Z",
        },
    ]


@router.get("/alerts/{alert_id}/pattern")
def get_alert_pattern_details(alert_id: str, db: Session = Depends(get_db)):
    """
    Get pattern analysis with LLM-generated insights.
    """
    aid = alert_id.lower()
    if "fuel" in aid or "alert-002" in aid or "alert-2" in aid:
        raw_meta = {
            "alert_type": "low_fuel_efficiency",
            "equipment_name": "5050D Tractor",
            "equipment_id": "demo-5050d",
            "occurrence_count": 3,
            "occurrence_dates": ["Sep 24", "Sep 26", "Sep 29"],
            "values": [7.9, 9.1, 8.8],
            "unit": "L/hr",
            "fuel_savings_estimate": "Save up to 8 litres per day",
        }
    elif "speed" in aid or "alert-003" in aid:
        raw_meta = {
            "alert_type": "speed_anomaly",
            "equipment_name": "5310 Tractor",
            "equipment_id": "demo-5310",
            "occurrence_count": 3,
            "occurrence_dates": ["Sep 24", "Sep 26", "Sep 28"],
            "values": [3.2, 2.8, 3.5],
            "unit": "km/h",
            "fuel_savings_estimate": "Save up to 5 litres per day",
        }
    elif "sprayer" in aid or "gps" in aid or "alert-004" in aid:
        raw_meta = {
            "alert_type": "gps_boundary",
            "equipment_name": "Boom Sprayer",
            "equipment_id": "demo-boom-sprayer",
            "occurrence_count": 3,
            "occurrence_dates": ["Sep 25", "Sep 28", "Sep 29"],
            "values": [2.3, 1.8, 2.1],
            "unit": "ha",
            "fuel_savings_estimate": "Save 4-6 L fuel & prevent chemical waste",
        }
    else:
        # Default: High Idle Time
        raw_meta = {
            "alert_type": "high_idle_time",
            "equipment_name": "6120B Tractor",
            "equipment_id": "demo-6120b",
            "occurrence_count": 4,
            "occurrence_dates": ["Sep 23", "Sep 25", "Sep 27", "Sep 29"],
            "values": [41, 44, 46, 52],
            "unit": "minutes",
            "fuel_savings_estimate": "Can save up to 10 litres per day (approx ₹870/day)",
        }

    # Run LLM pattern analysis
    llm_result = analyze_alert_pattern(
        alert_id=alert_id,
        alert_type=raw_meta["alert_type"],
        equipment_name=raw_meta["equipment_name"],
        occurrence_count=raw_meta["occurrence_count"],
        occurrence_dates=raw_meta["occurrence_dates"],
        values=raw_meta["values"],
        unit=raw_meta["unit"],
    )

    return {
        "id": f"pattern-{alert_id}",
        "alert_id": alert_id,
        "alert_type": raw_meta["alert_type"],
        "equipment_id": raw_meta["equipment_id"],
        "equipment_name": raw_meta["equipment_name"],
        "occurrence_count": raw_meta["occurrence_count"],
        "occurrence_dates": raw_meta["occurrence_dates"],
        "values": raw_meta["values"],
        "unit": raw_meta["unit"],
        "likely_cause": llm_result["likely_cause"],
        "action_recommendation": llm_result["action_recommendation"],
        "fuel_savings_estimate": raw_meta.get("fuel_savings_estimate"),
        "confidence": "high",
    }


@router.post("/actions")
def save_farmer_action(
    payload: ActionCommitmentRequest,
    db: Session = Depends(get_db),
):
    """
    Save farmer's action commitment.
    """
    alert_id = payload.alert_id or "alert-001"
    action_id = f"action-{alert_id.replace('alert-', '')}"
    commitment = payload.commitment or "committed"

    try:
        existing = db.query(FarmAction).filter(FarmAction.id == action_id).first()
        if existing:
            existing.status = commitment
            existing.commitment = commitment
            existing.action_type = payload.action_type
            existing.action_text = payload.action_text
        else:
            new_action = FarmAction(
                id=action_id,
                alert_id=alert_id,
                farmer_id=payload.farmer_id or "demo-farmer-001",
                action_type=payload.action_type or "reduce_idle_time",
                action_text=payload.action_text,
                commitment=commitment,
                status=commitment,
                confidence="high",
            )
            db.add(new_action)
        db.commit()
    except Exception:
        db.rollback()

    return {
        "id": action_id,
        "status": commitment,
        "action_id": action_id,
    }


@router.post("/actions/{action_id}/notify")
def trigger_tractor_sound_notification(
    action_id: str,
    db: Session = Depends(get_db),
):
    """
    Trigger sound notification to tractor terminal.
    """
    equipment_name = "6120B Tractor"
    if "5050" in action_id or "002" in action_id or "2" in action_id:
        equipment_name = "5050D Tractor"
    elif "5310" in action_id or "003" in action_id or "3" in action_id:
        equipment_name = "5310 Tractor"
    elif "sprayer" in action_id or "004" in action_id or "4" in action_id:
        equipment_name = "Boom Sprayer"

    return {
        "status": "notification_sent",
        "message": f"Sound notification sent to {equipment_name}",
    }


@router.get("/actions/{action_id}/result")
def get_action_result_verification(
    action_id: str,
    db: Session = Depends(get_db),
):
    """
    Get next-day measured results proving the committed action worked.
    """
    aid = action_id.lower()
    if "5050" in aid or "002" in aid or "2" in aid:
        return {
            "action_id": action_id,
            "alert_type": "low_fuel_efficiency",
            "equipment_name": "5050D Tractor",
            "before_value": 8.8,
            "after_value": 7.1,
            "unit": "L/hr",
            "improvement_percent": 19,
            "litres_saved": 8,
            "cost_saved": 10.00,
            "currency": "USD",
        }
    elif "5310" in aid or "003" in aid or "3" in aid:
        return {
            "action_id": action_id,
            "alert_type": "speed_anomaly",
            "equipment_name": "5310 Tractor",
            "before_value": 3.1,
            "after_value": 4.8,
            "unit": "km/h",
            "improvement_percent": 35,
            "litres_saved": 5,
            "cost_saved": 6.25,
            "currency": "USD",
        }
    else:
        # Default: 6120B High Idle Time (Sep 29: 46 min -> Sep 30: 24 min)
        return {
            "action_id": action_id,
            "alert_type": "high_idle_time",
            "equipment_name": "6120B Tractor",
            "before_value": 46,
            "after_value": 24,
            "unit": "minutes",
            "improvement_percent": 48,
            "litres_saved": 10,
            "cost_saved": 12.50,
            "currency": "USD",
        }
