from fastapi import APIRouter, Query
from typing import Dict, Any

router = APIRouter(prefix="/api/pm", tags=["PM Dashboard"])

DASHBOARD_DATA_BY_RANGE: Dict[str, Dict[str, Any]] = {
    "7d": {
        "range": "7d",
        "days": 7,
        "total_alerts": 1000,
        "action_rate": 38,
        "success_rate": 78,
        "total_fuel_saved_litres": 1200,
        "avg_fuel_saved_litres": 10,
        "avg_improvement_percent": 48,
        "daily_cost_savings_inr": 104400,
        "farmers_acted": 380,
        "farmers_ignored": 620,
        "alert_performance": [
            {"type": "High Idle Time", "total": 400, "ignored": 220, "acted": 180, "ignore_rate": 55},
            {"type": "Low Fuel Efficiency", "total": 300, "ignored": 180, "acted": 120, "ignore_rate": 60},
            {"type": "Speed Anomaly", "total": 200, "ignored": 150, "acted": 50, "ignore_rate": 75},
            {"type": "GPS Boundary", "total": 100, "ignored": 65, "acted": 35, "ignore_rate": 65},
        ],
        "action_effectiveness": [
            {"action": "Turn off engine during 5+ min waits", "tried": 120, "success": 102, "success_rate": 85, "category": "Idle Reduction"},
            {"action": "Maintain steady speed on flat terrain", "tried": 95, "success": 68, "success_rate": 72, "category": "Speed Optimization"},
            {"action": "Reduce throttle on hills", "tried": 80, "success": 36, "success_rate": 45, "category": "Throttle Control"},
        ],
        "farmer_segments": [
            {"segment": "Large farms (>500 ha)", "farmers": 150, "action_rate": 45, "fill": "#367C2B"},
            {"segment": "Medium farms (100-500 ha)", "farmers": 200, "action_rate": 38, "fill": "#629E51"},
            {"segment": "Small farms (<100 ha)", "farmers": 150, "action_rate": 28, "fill": "#8CBF7D"},
        ],
        "time_patterns": [
            {"time": "Morning (6-12)", "alerts": 300, "ignored": 105, "acted": 195, "ignore_rate": 35},
            {"time": "Afternoon (12-18)", "alerts": 400, "ignored": 160, "acted": 240, "ignore_rate": 40},
            {"time": "Evening (18-24)", "alerts": 300, "ignored": 195, "acted": 105, "ignore_rate": 65},
        ],
        "product_recommendations": [
            {
                "priority": 1,
                "title": "Speed Anomaly Alert Performance",
                "insight": "75% of farmers ignore this alert",
                "suggestion": "Consider simplifying alert copy or adjusting threshold",
                "impact": "Could improve action rate by 20-30%",
            },
            {
                "priority": 2,
                "title": "Turn Off Engine Recommendation",
                "insight": "85% success rate when farmers follow this advice",
                "suggestion": "Promote this recommendation in farmer onboarding",
                "impact": "High-confidence insight to scale",
            },
            {
                "priority": 3,
                "title": "Reduce Throttle Advice",
                "insight": "Only 45% of farmers see improvement",
                "suggestion": "Review advice accuracy or add more context",
                "impact": "Investigation needed to improve effectiveness",
            },
            {
                "priority": 4,
                "title": "Evening Alert Delivery",
                "insight": "65% of evening alerts are ignored",
                "suggestion": "Consider time-based delivery optimization",
                "impact": "Better timing could reduce ignore rate",
            },
        ],
    },
    "30d": {
        "range": "30d",
        "days": 30,
        "total_alerts": 4200,
        "action_rate": 40,
        "success_rate": 80,
        "total_fuel_saved_litres": 5400,
        "avg_fuel_saved_litres": 11.2,
        "avg_improvement_percent": 50,
        "daily_cost_savings_inr": 469800,
        "farmers_acted": 1680,
        "farmers_ignored": 2520,
        "alert_performance": [
            {"type": "High Idle Time", "total": 1680, "ignored": 890, "acted": 790, "ignore_rate": 53},
            {"type": "Low Fuel Efficiency", "total": 1260, "ignored": 730, "acted": 530, "ignore_rate": 58},
            {"type": "Speed Anomaly", "total": 840, "ignored": 605, "acted": 235, "ignore_rate": 72},
            {"type": "GPS Boundary", "total": 420, "ignored": 252, "acted": 168, "ignore_rate": 60},
        ],
        "action_effectiveness": [
            {"action": "Turn off engine during 5+ min waits", "tried": 540, "success": 464, "success_rate": 86, "category": "Idle Reduction"},
            {"action": "Maintain steady speed on flat terrain", "tried": 410, "success": 303, "success_rate": 74, "category": "Speed Optimization"},
            {"action": "Reduce throttle on hills", "tried": 360, "success": 173, "success_rate": 48, "category": "Throttle Control"},
        ],
        "farmer_segments": [
            {"segment": "Large farms (>500 ha)", "farmers": 650, "action_rate": 48, "fill": "#367C2B"},
            {"segment": "Medium farms (100-500 ha)", "farmers": 850, "action_rate": 41, "fill": "#629E51"},
            {"segment": "Small farms (<100 ha)", "farmers": 620, "action_rate": 31, "fill": "#8CBF7D"},
        ],
        "time_patterns": [
            {"time": "Morning (6-12)", "alerts": 1300, "ignored": 416, "acted": 884, "ignore_rate": 32},
            {"time": "Afternoon (12-18)", "alerts": 1700, "ignored": 646, "acted": 1054, "ignore_rate": 38},
            {"time": "Evening (18-24)", "alerts": 1200, "ignored": 744, "acted": 456, "ignore_rate": 62},
        ],
        "product_recommendations": [
            {
                "priority": 1,
                "title": "Speed Anomaly Alert Performance",
                "insight": "72% of farmers ignore this alert over 30 days",
                "suggestion": "Consider simplifying alert copy or adjusting threshold",
                "impact": "Could improve action rate by 20-30%",
            },
            {
                "priority": 2,
                "title": "Turn Off Engine Recommendation",
                "insight": "86% success rate across 540 farmer trials",
                "suggestion": "Promote this recommendation in farmer onboarding",
                "impact": "High-confidence insight to scale",
            },
            {
                "priority": 3,
                "title": "Reduce Throttle Advice",
                "insight": "48% success rate indicates persistent struggle under load",
                "suggestion": "Review advice accuracy or add more context",
                "impact": "Investigation needed to improve effectiveness",
            },
            {
                "priority": 4,
                "title": "Evening Alert Delivery",
                "insight": "62% of evening alerts are ignored over 30 days",
                "suggestion": "Consider time-based delivery optimization",
                "impact": "Better timing could reduce ignore rate",
            },
        ],
    },
    "90d": {
        "range": "90d",
        "days": 90,
        "total_alerts": 12500,
        "action_rate": 42,
        "success_rate": 82,
        "total_fuel_saved_litres": 16800,
        "avg_fuel_saved_litres": 12.0,
        "avg_improvement_percent": 52,
        "daily_cost_savings_inr": 1461600,
        "farmers_acted": 5250,
        "farmers_ignored": 7250,
        "alert_performance": [
            {"type": "High Idle Time", "total": 5000, "ignored": 2500, "acted": 2500, "ignore_rate": 50},
            {"type": "Low Fuel Efficiency", "total": 3750, "ignored": 2062, "acted": 1688, "ignore_rate": 55},
            {"type": "Speed Anomaly", "total": 2500, "ignored": 1725, "acted": 775, "ignore_rate": 69},
            {"type": "GPS Boundary", "total": 1250, "ignored": 712, "acted": 538, "ignore_rate": 57},
        ],
        "action_effectiveness": [
            {"action": "Turn off engine during 5+ min waits", "tried": 1650, "success": 1452, "success_rate": 88, "category": "Idle Reduction"},
            {"action": "Maintain steady speed on flat terrain", "tried": 1280, "success": 985, "success_rate": 77, "category": "Speed Optimization"},
            {"action": "Reduce throttle on hills", "tried": 1100, "success": 561, "success_rate": 51, "category": "Throttle Control"},
        ],
        "farmer_segments": [
            {"segment": "Large farms (>500 ha)", "farmers": 1950, "action_rate": 51, "fill": "#367C2B"},
            {"segment": "Medium farms (100-500 ha)", "farmers": 2600, "action_rate": 44, "fill": "#629E51"},
            {"segment": "Small farms (<100 ha)", "farmers": 1850, "action_rate": 33, "fill": "#8CBF7D"},
        ],
        "time_patterns": [
            {"time": "Morning (6-12)", "alerts": 3900, "ignored": 1170, "acted": 2730, "ignore_rate": 30},
            {"time": "Afternoon (12-18)", "alerts": 5100, "ignored": 1836, "acted": 3264, "ignore_rate": 36},
            {"time": "Evening (18-24)", "alerts": 3500, "ignored": 2065, "acted": 1435, "ignore_rate": 59},
        ],
        "product_recommendations": [
            {
                "priority": 1,
                "title": "Speed Anomaly Alert Performance",
                "insight": "69% quarterly ignore rate shows structural friction",
                "suggestion": "Consider simplifying alert copy or adjusting threshold",
                "impact": "Could improve action rate by 20-30%",
            },
            {
                "priority": 2,
                "title": "Turn Off Engine Recommendation",
                "insight": "88% sustained success across 1,650 farmer actions",
                "suggestion": "Promote this recommendation in farmer onboarding",
                "impact": "High-confidence insight to scale",
            },
            {
                "priority": 3,
                "title": "Reduce Throttle Advice",
                "insight": "51% quarterly success rate confirms need for gear guidance",
                "suggestion": "Review advice accuracy or add more context",
                "impact": "Investigation needed to improve effectiveness",
            },
            {
                "priority": 4,
                "title": "Evening Alert Delivery",
                "insight": "59% quarterly evening drop-off vs 30% morning rate",
                "suggestion": "Consider time-based delivery optimization",
                "impact": "Better timing could reduce ignore rate",
            },
        ],
    },
}


@router.get("/dashboard")
async def get_pm_dashboard(
    range: str = Query("7d", description="Time range for metrics: 7d, 30d, 90d")
) -> Dict[str, Any]:
    """
    Get PM Dashboard metrics, alert performance, action effectiveness,
    and product insights for the requested date range.
    """
    normalized_range = range.lower() if range else "7d"
    if normalized_range not in DASHBOARD_DATA_BY_RANGE:
        normalized_range = "7d"
    return DASHBOARD_DATA_BY_RANGE[normalized_range]
