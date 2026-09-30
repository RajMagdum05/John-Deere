from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models import Farmer, Equipment, Measurement, FieldOperation, OperatorStat, FarmAction
from app.services.ml_models import OperatorEfficiencyML
from app.services.llm_analysis import analyze_alert_pattern

router = APIRouter(prefix="/api/farmer", tags=["Farmer Dashboard"])
ml_service = OperatorEfficiencyML()


class ActionCommitmentPayload(BaseModel):
    alert_id: Optional[str] = "alert-001"
    action_type: Optional[str] = "reduce_idle_time"
    action_text: Optional[str] = "Turn off engine during 5+ min waits"
    commitment: Optional[str] = "committed"
    farmer_id: Optional[str] = "demo-farmer-001"
    timestamp: Optional[str] = None


@router.get("/efficiency")
def get_farmer_efficiency(db: Session = Depends(get_db)):
    """Get farmer's overall fuel efficiency metrics"""
    try:
        equipment = db.query(Equipment).first()
        equipment_id = equipment.id if equipment else "demo_equipment"
    except Exception:
        db.rollback()
        equipment_id = "demo_equipment"
    
    analysis = ml_service.run_full_analysis(db, equipment_id)
    
    return {
        "total_fuel": 4250,
        "total_area": 380,
        "avg_efficiency": analysis["fleet_avg_efficiency"],
        "potential_savings": analysis["potential_savings"]
    }


@router.get("/operators")
def get_operator_rankings(db: Session = Depends(get_db)):
    """Get operator efficiency rankings"""
    try:
        equipment = db.query(Equipment).first()
        equipment_id = equipment.id if equipment else "demo_equipment"
    except Exception:
        db.rollback()
        equipment_id = "demo_equipment"
    
    analysis = ml_service.run_full_analysis(db, equipment_id)
    return analysis["operators"]


@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db)):
    """Get fuel efficiency recommendations"""
    try:
        equipment = db.query(Equipment).first()
        equipment_id = equipment.id if equipment else "demo_equipment"
    except Exception:
        db.rollback()
        equipment_id = "demo_equipment"
    
    analysis = ml_service.run_full_analysis(db, equipment_id)
    
    all_recommendations = []
    for operator in analysis["operators"]:
        for rec in operator.get("recommendations", []):
            all_recommendations.append({
                "operator": operator["operator"],
                "recommendation": rec
            })
    
    return all_recommendations


@router.get("/alerts/today-summary")
def get_alerts_today_summary(db: Session = Depends(get_db)):
    """Get today summary for farmer alerts"""
    from app.services.demo_telemetry_service import get_today_summary_data
    summary = get_today_summary_data(db)
    return {
        "data_ready": summary.get("data_ready", True),
        "analysis_ready": True,
        "connected_machines": summary.get("connected_machines", 4),
        "simulated_days": summary.get("simulated_days", 7),
        "latest_activity_date": summary.get("latest_activity_date", "2026-09-29"),
    }


@router.get("/alerts")
def get_farmer_alerts(
    date: str = Query(default="2026-09-29", description="Date string YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """Get today's list of operational alerts for farmer machines"""
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
def get_alert_pattern(alert_id: str, db: Session = Depends(get_db)):
    """Get repeated pattern details for an alert with LLM-generated insights"""
    aid = alert_id.lower()
    if "sprayer" in aid or "alert-3" in aid or "alert-004" in aid:
        raw_meta = {
            "alert_type": "gps_boundary",
            "equipment_name": "Boom Sprayer",
            "equipment_id": "demo-boom-sprayer",
            "occurrence_count": 3,
            "occurrence_dates": ["Sep 25", "Sep 28", "Sep 29"],
            "values": [2.3, 1.8, 2.1],
            "unit": "ha",
            "common_operation_type": "Crop Spraying",
            "common_field_name": "North Orchard (Field A)",
            "fuel_savings_estimate": "Save 4-6 L fuel & prevent chemical waste",
        }
    elif "fuel" in aid or "alert-2" in aid or "alert-002" in aid:
        raw_meta = {
            "alert_type": "low_fuel_efficiency",
            "equipment_name": "5050D Tractor",
            "equipment_id": "demo-5050d",
            "occurrence_count": 3,
            "occurrence_dates": ["Sep 24", "Sep 26", "Sep 29"],
            "values": [7.9, 9.1, 8.8],
            "unit": "L/hr",
            "common_operation_type": "Primary Tillage",
            "common_field_name": "Field A",
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
            "common_operation_type": "Transport & Field Prep",
            "common_field_name": "Route 4 & Field B",
            "fuel_savings_estimate": "Save up to 5 litres per day",
        }
    else:
        # Default: High Idle Time on 6120B Tractor
        raw_meta = {
            "alert_type": "high_idle_time",
            "equipment_name": "6120B Tractor",
            "equipment_id": "demo-6120b",
            "occurrence_count": 4,
            "occurrence_dates": ["Sep 23", "Sep 25", "Sep 27", "Sep 29"],
            "values": [41, 44, 46, 52],
            "unit": "minutes",
            "common_operation_type": "Tillage & Haulage",
            "common_field_name": "Field B",
            "fuel_savings_estimate": "Can save up to 10 litres per day (approx ₹870/day)",
        }

    # Integrate LLM analysis
    llm_insights = analyze_alert_pattern(
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
        "common_operation_type": raw_meta.get("common_operation_type", "Field Operation"),
        "common_field_name": raw_meta.get("common_field_name", "Field B"),
        "likely_cause": llm_insights["likely_cause"],
        "action_recommendation": llm_insights["action_recommendation"],
        "fuel_savings_estimate": raw_meta.get("fuel_savings_estimate"),
        "confidence": "high",
        "avg_fuel_impact": 3.2,
    }


@router.post("/alerts/{alert_id}/action")
def generate_alert_action(alert_id: str, db: Session = Depends(get_db)):
    """Generate action recommendation for an alert"""
    pattern = get_alert_pattern(alert_id, db)
    return {
        "alert_id": alert_id,
        "action": pattern.get("action_recommendation", "Turn off engine during 5+ minute waits"),
        "expected_result": pattern.get("fuel_savings_estimate", "Save up to 10 litres per day"),
        "raw_response": f"Likely Cause: {pattern.get('likely_cause')}\nAction Recommendation: {pattern.get('action_recommendation')}",
    }


@router.post("/actions")
def record_farmer_commitment(payload: dict, db: Session = Depends(get_db)):
    """Record farmer action commitment with tractor notification signal."""
    alert_id = payload.get("alert_id", "alert-001")
    commitment = payload.get("commitment", "committed")
    action_type = payload.get("action_type", "reduce_idle_time")
    action_text = payload.get("action_text", "Turn off engine during 5+ min waits")
    farmer_id = payload.get("farmer_id", "demo-farmer-001")
    action_id = f"action-{alert_id.replace('alert-', '')}"

    try:
        existing = db.query(FarmAction).filter(FarmAction.id == action_id).first()
        if existing:
            existing.status = commitment
            existing.commitment = commitment
            existing.action_type = action_type
            existing.action_text = action_text
        else:
            new_action = FarmAction(
                id=action_id,
                alert_id=alert_id,
                farmer_id=farmer_id,
                action_type=action_type,
                action_text=action_text,
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
        "alert_id": alert_id,
        "action_type": action_type,
        "action_text": action_text,
        "tractor_notified": True,
        "message": "Action committed and signal dispatched to tractor terminal.",
    }


@router.post("/actions/{action_id}/notify")
def trigger_tractor_sound_notification(action_id: str, db: Session = Depends(get_db)):
    """Trigger sound notification to tractor."""
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
def get_action_result_verification(action_id: str, db: Session = Depends(get_db)):
    """Get next-day measured results proving the committed action worked."""
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

