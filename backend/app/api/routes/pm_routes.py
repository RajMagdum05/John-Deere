from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
from app.database import get_db

router = APIRouter(prefix="/api/pm", tags=["PM Dashboard"])


@router.get("/aggregate-metrics")
def get_aggregate_metrics(db: Session = Depends(get_db)):
    """Get aggregate metrics across all farmers (mock data for PM dashboard)"""
    return {
        "active_users": 1247,
        "total_fuel_tracked": 5280000,
        "total_fuel_cost": 475200000,
        "total_savings_enabled": 95040000,
        "avg_satisfaction": 4.3,
        "renewal_rate": 0.93
    }


@router.get("/feature-usage")
def get_feature_usage(db: Session = Depends(get_db)):
    """Get feature usage statistics"""
    return [
        {"feature": "Operator Rankings", "usage": 0.82, "impact": "High"},
        {"feature": "Fuel Savings Calc", "usage": 0.78, "impact": "High"},
        {"feature": "Recommendations", "usage": 0.65, "impact": "Medium"},
        {"feature": "Trend Analysis", "usage": 0.54, "impact": "Medium"},
        {"feature": "Export Report", "usage": 0.34, "impact": "Low"}
    ]


@router.get("/pain-points")
def get_pain_points(db: Session = Depends(get_db)):
    """Get top farmer pain points (from support tickets & reviews)"""
    return [
        {"issue": "Can't compare operators", "percentage": 0.42, "status": "SOLVED"},
        {"issue": "Don't know fuel budget", "percentage": 0.28, "status": "SOLVED"},
        {"issue": "Operators ignore feedback", "percentage": 0.18, "status": "NEW FEATURE"},
        {"issue": "App is slow on mobile", "percentage": 0.12, "status": "ESCALATED"}
    ]


@router.get("/churn-prediction")
def get_churn_prediction(db: Session = Depends(get_db)):
    """Get churn risk analysis"""
    return {
        "high_risk_users": 374,
        "percentage": 0.30,
        "top_reasons": [
            {"reason": "No login in 30+ days", "percentage": 0.58},
            {"reason": "Low feature usage", "percentage": 0.23},
            {"reason": "Negative app reviews", "percentage": 0.19}
        ]
    }
