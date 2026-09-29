from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.database import get_db
from app.models import Farmer, Equipment, Measurement, FieldOperation, OperatorStat
from app.services.ml_models import OperatorEfficiencyML

router = APIRouter(prefix="/api/farmer", tags=["Farmer Dashboard"])
ml_service = OperatorEfficiencyML()


@router.get("/efficiency")
def get_farmer_efficiency(db: Session = Depends(get_db)):
    """Get farmer's overall fuel efficiency metrics"""
    try:
        equipment = db.query(Equipment).first()
        equipment_id = equipment.id if equipment else "demo_equipment"
    except Exception:
        db.rollback()
        equipment_id = "demo_equipment"
    
    # Run ML analysis
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
    
    # Flatten recommendations from all operators
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
def get_farmer_alerts(db: Session = Depends(get_db)):
    """Get today's list of operational alerts for farmer machines"""
    return [
        {
            "id": "alert-1",
            "equipment_id": "demo-6120b",
            "equipment_name": "6120B Tractor",
            "type": "high_idle_time",
            "value": 46,
            "unit": "minutes",
            "timestamp": "2026-09-29T10:30:00Z",
        },
        {
            "id": "alert-2",
            "equipment_id": "demo-5050d",
            "equipment_name": "5050D Tractor",
            "type": "low_fuel",
            "value": 18,
            "unit": "%",
            "timestamp": "2026-09-29T11:15:00Z",
        },
        {
            "id": "alert-3",
            "equipment_id": "demo-boom-sprayer",
            "equipment_name": "Boom Sprayer",
            "type": "high_speed_variation",
            "value": "",
            "unit": "",
            "timestamp": "2026-09-29T12:00:00Z",
        },
    ]


@router.get("/alerts/{alert_id}/pattern")
def get_alert_pattern(alert_id: str, db: Session = Depends(get_db)):
    """Get repeated pattern details for an alert"""
    return {
        "id": f"pattern-{alert_id}",
        "alert_id": alert_id,
        "alert_type": "High idle time",
        "equipment_id": "demo-6120b",
        "equipment_name": "6120B Tractor",
        "occurrence_count": 4,
        "occurrence_dates": ["Sep 23", "Sep 25", "Sep 27", "Sep 29"],
        "values": [46, 52, 38, 44],
        "unit": "min",
        "common_operation_type": "Tillage",
        "common_field_name": "Field B",
        "likely_cause": "Operator waits during turnaround without turning off engine",
        "confidence": "high",
    }


