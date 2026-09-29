from sqlalchemy.orm import Session
from app.models import Farmer, Equipment, Measurement, FieldOperation, OperatorStat
from datetime import datetime, timedelta
from typing import Dict, List


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_farmer_overview(self, farmer_id: str) -> Dict:
        """Get farmer's overall metrics"""
        # Mock data for now
        return {
            "total_fuel": 4250,
            "total_area": 380,
            "avg_efficiency": 1.12,
            "total_cost": 382500,
            "potential_savings": 76500
        }
    
    def get_pm_aggregate_metrics(self) -> Dict:
        """Get aggregate metrics across all farmers (for PM dashboard)"""
        # Mock data
        return {
            "active_users": 1247,
            "total_fuel_tracked": 5280000,
            "total_fuel_cost": 475200000,
            "total_savings_enabled": 95040000,
            "avg_satisfaction": 4.3,
            "renewal_rate": 0.93
        }
    
    def get_feature_usage(self) -> List[Dict]:
        """Get feature usage statistics (mock data)"""
        return [
            {"feature": "Operator Rankings", "usage": 0.82, "impact": "High"},
            {"feature": "Fuel Savings Calc", "usage": 0.78, "impact": "High"},
            {"feature": "Recommendations", "usage": 0.65, "impact": "Medium"},
            {"feature": "Trend Analysis", "usage": 0.54, "impact": "Medium"},
            {"feature": "Export Report", "usage": 0.34, "impact": "Low"}
        ]
    
    def get_pain_points(self) -> List[Dict]:
        """Get top farmer pain points (from research)"""
        return [
            {"issue": "Can't compare operators", "percentage": 0.42, "status": "SOLVED"},
            {"issue": "Don't know fuel budget", "percentage": 0.28, "status": "SOLVED"},
            {"issue": "Operators ignore feedback", "percentage": 0.18, "status": "NEW FEATURE"},
            {"issue": "App is slow on mobile", "percentage": 0.12, "status": "ESCALATED"}
        ]
