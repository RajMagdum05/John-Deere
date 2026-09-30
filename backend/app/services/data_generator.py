"""
Simulated Data Generator for John Deere Equipment Telemetry

Generates realistic equipment data in JD API format for demo purposes.
Simulates 6 days of historical data with realistic patterns and anomalies.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
import random
import math

# Equipment configuration (matches JD equipment types)
EQUIPMENT_CONFIG = [
    {
        "id": "equip-001",
        "name": "6120B Tractor",
        "model": "6120B",
        "type": "tractor",
        "fuel_capacity": 150,  # litres
        "avg_speed": 8.0,  # km/h
        "avg_fuel_consumption": 6.5,  # L/hour
    },
    {
        "id": "equip-002",
        "name": "5050D Tractor",
        "model": "5050D",
        "type": "tractor",
        "fuel_capacity": 120,
        "avg_speed": 6.5,
        "avg_fuel_consumption": 5.2,
    },
    {
        "id": "equip-003",
        "name": "Boom Sprayer",
        "model": "Boom Sprayer",
        "type": "sprayer",
        "fuel_capacity": 80,
        "avg_speed": 12.0,
        "avg_fuel_consumption": 4.8,
    },
    {
        "id": "equip-004",
        "name": "5310 Tractor",
        "model": "5310",
        "type": "tractor",
        "fuel_capacity": 100,
        "avg_speed": 7.0,
        "avg_fuel_consumption": 5.8,
    },
]

# Field locations (simulated farm in Maharashtra)
FIELDS = [
    {"name": "Field A", "lat": 18.5204, "lon": 73.8567},
    {"name": "Field B", "lat": 18.5250, "lon": 73.8600},
    {"name": "Field C", "lat": 18.5180, "lon": 73.8520},
    {"name": "Garage", "lat": 18.5150, "lon": 73.8500},
    {"name": "Shed", "lat": 18.5160, "lon": 73.8510},
]

# Work schedule (typical farmer work hours)
WORK_HOURS = {
    "morning": {"start": 6, "end": 12},
    "afternoon": {"start": 14, "end": 18},
}

def generate_telemetry_for_day(
    equipment_id: str,
    day_offset: int,
    include_anomalies: bool = True
) -> List[Dict[str, Any]]:
    """
    Generate telemetry data for one equipment for one day.
    
    Args:
        equipment_id: Equipment identifier
        day_offset: Days ago (0 = today, 1 = yesterday, etc.)
        include_anomalies: Whether to include realistic anomalies (high idle, etc.)
    
    Returns:
        List of telemetry records (one per hour during work hours)
    """
    # Find equipment config
    equip_config = next((e for e in EQUIPMENT_CONFIG if e["id"] == equipment_id), None)
    if not equip_config:
        return []
    
    # Calculate date
    base_date = datetime.utcnow() - timedelta(days=day_offset)
    
    telemetry_records = []
    
    # Determine work schedule for this day
    # Some days work morning only, some days both sessions
    work_sessions = []
    if day_offset % 3 != 0:  # Every 3rd day is lighter work
        work_sessions = ["morning", "afternoon"]
    else:
        work_sessions = ["morning"]
    
    # Generate telemetry for each work session
    for session_name in work_sessions:
        session = WORK_HOURS[session_name]
        
        for hour in range(session["start"], session["end"] + 1):
            timestamp = base_date.replace(hour=hour, minute=0, second=0)
            
            # Determine machine state
            # 20% chance of being idle during work hours (realistic)
            is_idle = random.random() < 0.2
            
            # Add anomalies for specific patterns
            # High idle time pattern (for demo: happens 4 times in 6 days)
            has_high_idle = (
                include_anomalies and
                day_offset in [1, 2, 4, 5] and  # Days 2,3,5,6 (1-indexed)
                hour in [10, 11, 15, 16] and  # Mid-morning or mid-afternoon
                random.random() < 0.7
            )
            
            # Low fuel efficiency pattern (for demo: happens 3 times)
            has_low_efficiency = (
                include_anomalies and
                day_offset in [0, 3, 5] and  # Days 1,4,6
                hour in [14, 15, 16] and
                random.random() < 0.6
            )
            
            # Calculate telemetry values
            if is_idle or has_high_idle:
                # Machine is running but not moving (high idle)
                speed = 0.0
                fuel_level = max(0, equip_config["fuel_capacity"] * 0.95 - random.uniform(0, 5))
                machine_state = "idle"
                fuel_consumption = equip_config["avg_fuel_consumption"] * 0.3  # Idle consumes less
            else:
                # Machine is working
                speed = equip_config["avg_speed"] * random.uniform(0.8, 1.2)
                fuel_level = max(0, equip_config["fuel_capacity"] * random.uniform(0.6, 0.9))
                machine_state = "working"
                fuel_consumption = equip_config["avg_fuel_consumption"]
                
                # Low fuel efficiency = higher consumption
                if has_low_efficiency:
                    fuel_consumption *= 1.4
            
            # Select field location
            if machine_state == "working":
                field = random.choice(FIELDS[:3])  # Field A, B, or C
            else:
                field = FIELDS[3]  # Garage
            
            # Create telemetry record (matches JD API format)
            record = {
                "equipment_id": equipment_id,
                "timestamp": timestamp.isoformat() + "Z",
                "speed": round(speed, 1),
                "fuel_level": round(fuel_level, 1),
                "fuel_consumption": round(fuel_consumption, 2),
                "location": {
                    "latitude": field["lat"] + random.uniform(-0.001, 0.001),
                    "longitude": field["lon"] + random.uniform(-0.001, 0.001),
                    "field_name": field["name"],
                },
                "machine_state": machine_state,
                "engine_hours": 1200.0 + (6 - day_offset) * 8 + hour,  # Cumulative hours
                "anomalies": [],
            }
            
            # Add detected anomalies
            if has_high_idle:
                record["anomalies"].append({
                    "type": "high_idle_time",
                    "severity": "medium",
                    "message": "Engine idle for extended period",
                })
            
            if has_low_efficiency:
                record["anomalies"].append({
                    "type": "low_fuel_efficiency",
                    "severity": "low",
                    "message": "Fuel consumption higher than expected",
                })
            
            telemetry_records.append(record)
    
    return telemetry_records


def generate_6day_simulation() -> Dict[str, Any]:
    """
    Generate complete 6-day simulation for all equipment.
    
    Returns:
        Dictionary with all equipment data for 6 days
    """
    simulation_data = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "days": 6,
        "equipment": [],
    }
    
    for equip_config in EQUIPMENT_CONFIG:
        equipment_data = {
            "id": equip_config["id"],
            "name": equip_config["name"],
            "model": equip_config["model"],
            "type": equip_config["type"],
            "daily_data": [],
        }
        
        # Generate data for each day (Day 1 = 6 days ago, Day 6 = yesterday)
        for day_offset in range(6, 0, -1):  # 6,5,4,3,2,1
            daily_telemetry = generate_telemetry_for_day(
                equipment_id=equip_config["id"],
                day_offset=day_offset,
                include_anomalies=True
            )
            
            # Calculate daily summary
            total_work_hours = len(daily_telemetry)
            idle_hours = sum(1 for t in daily_telemetry if t["machine_state"] == "idle")
            avg_fuel = sum(t["fuel_consumption"] for t in daily_telemetry) / max(1, len(daily_telemetry))
            
            daily_summary = {
                "day": 7 - day_offset,  # Day 1,2,3,4,5,6
                "date": (datetime.utcnow() - timedelta(days=day_offset)).strftime("%Y-%m-%d"),
                "telemetry": daily_telemetry,
                "summary": {
                    "total_work_hours": total_work_hours,
                    "idle_hours": idle_hours,
                    "avg_fuel_consumption": round(avg_fuel, 2),
                    "anomaly_count": sum(len(t["anomalies"]) for t in daily_telemetry),
                }
            }
            
            equipment_data["daily_data"].append(daily_summary)
        
        simulation_data["equipment"].append(equipment_data)
    
    return simulation_data


def get_live_telemetry(equipment_id: str) -> Dict[str, Any]:
    """
    Generate current (live) telemetry for equipment.
    This simulates real-time data on Day 7.
    
    Returns:
        Current telemetry record
    """
    equip_config = next((e for e in EQUIPMENT_CONFIG if e["id"] == equipment_id), None)
    if not equip_config:
        return {}
    
    # Simulate current work state
    current_hour = datetime.utcnow().hour
    
    # Check if within work hours
    is_work_hour = (
        (6 <= current_hour <= 12) or  # Morning
        (14 <= current_hour <= 18)    # Afternoon
    )
    
    if is_work_hour:
        # Equipment is working
        speed = equip_config["avg_speed"] * random.uniform(0.8, 1.2)
        fuel_level = equip_config["fuel_capacity"] * random.uniform(0.6, 0.9)
        machine_state = "working"
        field = random.choice(FIELDS[:3])
    else:
        # Equipment is at rest
        speed = 0.0
        fuel_level = equip_config["fuel_capacity"] * 0.95
        machine_state = "off"
        field = FIELDS[3]  # Garage
    
    return {
        "equipment_id": equipment_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "speed": round(speed, 1),
        "fuel_level": round(fuel_level, 1),
        "fuel_consumption": equip_config["avg_fuel_consumption"] if machine_state == "working" else 0,
        "location": {
            "latitude": field["lat"],
            "longitude": field["lon"],
            "field_name": field["name"],
        },
        "machine_state": machine_state,
        "engine_hours": 1250.0 + random.uniform(0, 10),
        "anomalies": [],
    }
