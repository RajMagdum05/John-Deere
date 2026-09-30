import time
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from app.database import get_db
    from app.models import Equipment, Measurement
except ImportError:
    from backend.app.database import get_db
    from backend.app.models import Equipment, Measurement

# Global variable to track sprayer start time (for demo)
sprayer_start_time = None

router = APIRouter(prefix="/api/farmer", tags=["Live Data"])


def calculate_idle_minutes(measurement: Measurement) -> int:
    """
    Calculate idle minutes from measurement data.
    If speed is below 1.0 km/h with active fuel consumption, machine is idling.
    """
    if not measurement:
        return 0
    speed = measurement.speed if measurement.speed is not None else 0
    fuel_rate = measurement.fuel_consumption_rate if measurement.fuel_consumption_rate is not None else 0
    if speed < 1.0 and fuel_rate > 0:
        return 5
    return 0


@router.get("/{farmer_id}/live")
def get_live_data(farmer_id: str, db: Session = Depends(get_db)):
    """
    Get latest telemetry for all farmer's equipment.
    This endpoint is polled every 5 seconds from the frontend.
    """
    global sprayer_start_time
    
    # Get all equipment for this farmer
    equipment_list = db.query(Equipment).filter(
        Equipment.farmer_id == farmer_id
    ).all()
    
    if not equipment_list:
        equipment_list = db.query(Equipment).filter(
            Equipment.farmer_id.in_(["demo-farmer-pimpri", "demo-farmer-001"])
        ).all()
    
    if not equipment_list:
        # Fallback structured machines if database empty
        equipment_list = []
    
    machines = []
    
    # Track time since first live request (for sprayer simulation)
    if sprayer_start_time is None:
        sprayer_start_time = datetime.utcnow()
    
    time_since_start = (datetime.utcnow() - sprayer_start_time).total_seconds()
    
    if not equipment_list:
        # Create virtual demo list
        demo_specs = [
            ("demo-6120b", "6120B Tractor", "6120B"),
            ("demo-5050d", "5050D Tractor", "5050D"),
            ("demo-5310", "5310 Tractor", "5310"),
            ("equip-004", "Boom Sprayer", "Boom Sprayer"),
        ]
        for eq_id, eq_name, eq_model in demo_specs:
            if "sprayer" in eq_id or "sprayer" in eq_model.lower():
                if time_since_start < 10:
                    status = "rest"
                    telemetry = {"speed": 0, "fuel_level": 88, "location": "Shed", "idle_minutes": 0}
                elif time_since_start < 20:
                    status = "starting"
                    telemetry = {"speed": 0, "fuel_level": 88, "location": "Shed", "idle_minutes": 0}
                else:
                    status = "working"
                    telemetry = {"speed": 12.5, "fuel_level": 85, "location": "Field C", "idle_minutes": 0}
            elif "6120b" in eq_id:
                status = "working"
                telemetry = {"speed": 8.2, "fuel_level": 67, "location": "Field B", "idle_minutes": 12}
            elif "5050d" in eq_id:
                status = "working"
                telemetry = {"speed": 6.5, "fuel_level": 82, "location": "Field A", "idle_minutes": 5}
            else:
                status = "rest"
                telemetry = {"speed": 0, "fuel_level": 0, "location": "Garage/Shed", "idle_minutes": 0}
                
            machines.append({
                "id": eq_id,
                "name": eq_name,
                "model": eq_model,
                "status": status,
                "telemetry": telemetry,
            })
    else:
        for equipment in equipment_list:
            # Special handling for sprayer (equip-004 or sprayer in name/model/id)
            is_sprayer = (
                equipment.id == "equip-004"
                or "sprayer" in (equipment.model or "").lower()
                or "sprayer" in (equipment.id or "").lower()
            )
            
            if is_sprayer:
                # Simulate sprayer starting sequence
                if time_since_start < 10:
                    # First 10 seconds: Sprayer at rest
                    status = "rest"
                    telemetry = {
                        "speed": 0,
                        "fuel_level": 88,
                        "location": "Shed",
                        "idle_minutes": 0,
                    }
                elif time_since_start < 20:
                    # 10-20 seconds: Sprayer starting
                    status = "starting"
                    telemetry = {
                        "speed": 0,
                        "fuel_level": 88,
                        "location": "Shed",
                        "idle_minutes": 0,
                    }
                else:
                    # After 20 seconds: Sprayer working
                    status = "working"
                    telemetry = {
                        "speed": 12.5,
                        "fuel_level": 85,
                        "location": "Field C",
                        "idle_minutes": 0,
                    }
            else:
                # Normal equipment (tractors)
                latest_measurement = db.query(Measurement).filter(
                    Measurement.equipment_id == equipment.id,
                    Measurement.timestamp >= datetime.utcnow() - timedelta(minutes=5)
                ).order_by(Measurement.timestamp.desc()).first()
                
                if latest_measurement:
                    status = "working"
                    field_loc = getattr(latest_measurement, 'field_name', None) or ('Field B' if '6120' in (equipment.id or '').lower() else 'Field A')
                    telemetry = {
                        "speed": round(latest_measurement.speed, 1) if latest_measurement.speed is not None else 0,
                        "fuel_level": round(latest_measurement.fuel_level, 0) if latest_measurement.fuel_level is not None else 0,
                        "location": f"Field {field_loc}" if not field_loc.startswith("Field") else field_loc,
                        "idle_minutes": calculate_idle_minutes(latest_measurement),
                    }
                else:
                    is_working_demo = "6120b" in equipment.id.lower() or "5050d" in equipment.id.lower()
                    if is_working_demo:
                        status = "working"
                        if "6120b" in equipment.id.lower():
                            telemetry = {
                                "speed": 8.2,
                                "fuel_level": 67,
                                "location": "Field B",
                                "idle_minutes": 12,
                            }
                        else:
                            telemetry = {
                                "speed": 6.5,
                                "fuel_level": 82,
                                "location": "Field A",
                                "idle_minutes": 5,
                            }
                    else:
                        status = "rest"
                        telemetry = {
                            "speed": 0,
                            "fuel_level": 0,
                            "location": "Garage/Shed",
                            "idle_minutes": 0,
                        }
            
            equip_name = (
                getattr(equipment, 'name', None)
                or (f"{equipment.model} Tractor" if equipment.model and "tractor" not in equipment.model.lower() and getattr(equipment, 'equipment_type', None) == "TRACTOR" else (equipment.model or equipment.id))
            )
            
            machines.append({
                "id": equipment.id,
                "name": equip_name,
                "model": equipment.model,
                "status": status,
                "telemetry": telemetry,
            })
    
    return {
        "farmer_id": farmer_id,
        "timestamp": datetime.utcnow().isoformat(),
        "machines": machines,
        "sprayer_simulation": {
            "time_since_start": time_since_start,
            "sprayer_start_time": sprayer_start_time.isoformat() if sprayer_start_time else None,
        },
    }


@router.get("/{farmer_id}/day/{day}")
def get_day_data(farmer_id: str, day: int, db: Session = Depends(get_db)):
    """
    Get telemetry data for a specific day (Day 1-7).
    Day 7 returns live data (same as /live endpoint).
    Days 1-6 return historical data.
    """
    if day < 1 or day > 7:
        raise HTTPException(status_code=400, detail="Day must be between 1 and 7")
    
    target_farmer_id = farmer_id
    equipment_list = db.query(Equipment).filter(
        Equipment.farmer_id == target_farmer_id
    ).all()
    
    if not equipment_list:
        equipment_list = db.query(Equipment).filter(
            Equipment.farmer_id.in_(["demo-farmer-pimpri", "demo-farmer-001"])
        ).all()
        
    if not equipment_list:
        return {
            "day": day,
            "farmer_id": farmer_id,
            "timestamp": datetime.utcnow().isoformat(),
            "machines": [
                {
                    "id": "demo-6120b",
                    "name": "6120B Tractor",
                    "model": "6120B",
                    "status": "working",
                    "telemetry": {
                        "speed": 8.2,
                        "fuel_level": 67,
                        "location": "Field B",
                        "idle_minutes": 12,
                    },
                },
                {
                    "id": "demo-5050d",
                    "name": "5050D Tractor",
                    "model": "5050D",
                    "status": "working",
                    "telemetry": {
                        "speed": 6.5,
                        "fuel_level": 82,
                        "location": "Field A",
                        "idle_minutes": 5,
                    },
                },
                {
                    "id": "demo-5310",
                    "name": "5310 Tractor",
                    "model": "5310",
                    "status": "rest",
                    "telemetry": {
                        "speed": 0,
                        "fuel_level": 0,
                        "location": "Garage/Shed",
                        "idle_minutes": 0,
                    },
                },
                {
                    "id": "demo-boom-sprayer",
                    "name": "Boom Sprayer",
                    "model": "Boom Sprayer",
                    "status": "rest",
                    "telemetry": {
                        "speed": 0,
                        "fuel_level": 0,
                        "location": "Garage/Shed",
                        "idle_minutes": 0,
                    },
                },
            ],
        }
    
    machines = []
    
    for equipment in equipment_list:
        measurement = None
        if day == 7:
            # Day 7 = live data (last 5 minutes)
            measurement = db.query(Measurement).filter(
                Measurement.equipment_id == equipment.id,
                Measurement.timestamp >= datetime.utcnow() - timedelta(minutes=5)
            ).order_by(Measurement.timestamp.desc()).first()
        else:
            # Days 1-6 = historical data
            day_start = datetime.utcnow() - timedelta(days=(7 - day))
            day_start = day_start.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            measurement = db.query(Measurement).filter(
                Measurement.equipment_id == equipment.id,
                Measurement.timestamp >= day_start,
                Measurement.timestamp < day_end
            ).order_by(Measurement.timestamp.desc()).first()
        
        is_working_demo = "6120b" in equipment.id.lower() or "5050d" in equipment.id.lower()
        
        if measurement:
            status = "working"
            telemetry = {
                "speed": round(measurement.speed, 1) if measurement.speed is not None else 0,
                "fuel_level": round(measurement.fuel_level, 0) if measurement.fuel_level is not None else 0,
                "location": f"Field {getattr(measurement, 'field_name', None) or ('B' if '6120' in equipment.id else 'A')}",
                "idle_minutes": calculate_idle_minutes(measurement),
            }
        elif is_working_demo:
            status = "working"
            if "6120b" in equipment.id.lower():
                telemetry = {
                    "speed": 8.2,
                    "fuel_level": 67,
                    "location": "Field B",
                    "idle_minutes": 12,
                }
            else:
                telemetry = {
                    "speed": 6.5,
                    "fuel_level": 82,
                    "location": "Field A",
                    "idle_minutes": 5,
                }
        else:
            status = "rest"
            telemetry = {
                "speed": 0,
                "fuel_level": 0,
                "location": "Garage/Shed",
                "idle_minutes": 0,
            }
        
        equip_name = getattr(equipment, 'name', None) or (f"{equipment.model} Tractor" if equipment.model and "Tractor" not in equipment.model and equipment.equipment_type == "TRACTOR" else (equipment.model or equipment.id))
        
        machines.append({
            "id": equipment.id,
            "name": equip_name,
            "model": equipment.model,
            "status": status,
            "telemetry": telemetry,
        })
    
    return {
        "day": day,
        "farmer_id": farmer_id,
        "timestamp": datetime.utcnow().isoformat(),
        "machines": machines,
    }
