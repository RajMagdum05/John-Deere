import random
import asyncio
import threading
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.models import Farmer, Equipment, Measurement, FieldOperation

DEMO_SEED = 20260929
DEMO_FARMER_ID = "demo-farmer-pimpri"
DEMO_FARMER_ORG_ID = "demo_pimpri_farm"
DEMO_FARMER_NAME = "Rajesh Kumar"
DEMO_FARMER_EMAIL = "rajesh.demo@farmactionloop.local"
DEMO_FARMER_LOCATION = "Pimpri, Maharashtra"

DEMO_EQUIPMENT_FIXTURES = [
    {
        "id": "demo-5050d",
        "stable_key": "demo-5050d",
        "name": "5050D Tractor",
        "john_deere_id": "jd-demo-5050d",
        "model": "5050D",
        "equipment_type": "TRACTOR",
        "serial_number": "DEMO-5050D-001",
    },
    {
        "id": "demo-5310",
        "stable_key": "demo-5310",
        "name": "5310 Tractor",
        "john_deere_id": "jd-demo-5310",
        "model": "5310",
        "equipment_type": "TRACTOR",
        "serial_number": "DEMO-5310-001",
    },
    {
        "id": "demo-6120b",
        "stable_key": "demo-6120b",
        "name": "6120B Tractor",
        "john_deere_id": "jd-demo-6120b",
        "model": "6120B",
        "equipment_type": "TRACTOR",
        "serial_number": "DEMO-6120B-001",
    },
    {
        "id": "demo-boom-sprayer",
        "stable_key": "demo-boom-sprayer",
        "name": "Boom Sprayer",
        "john_deere_id": "jd-demo-sprayer",
        "model": "Boom Sprayer",
        "equipment_type": "SPRAYER",
        "serial_number": "DEMO-SPRAYER-001",
    },
]


class SimulationStateManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._state: Dict[str, Any] = {
            "status": "not_started",
            "progress": 0,
            "current_day": 0,
            "message": "Ready to prepare 7 days of demo telemetry data.",
            "started_at": None,
            "completed_at": None,
            "error": None,
        }

    def get_state(self) -> Dict[str, Any]:
        with self._lock:
            return dict(self._state)

    def set_running(self):
        with self._lock:
            self._state["status"] = "running"
            self._state["progress"] = 0
            self._state["current_day"] = 0
            self._state["message"] = "Preparing connected equipment..."
            self._state["started_at"] = datetime.now(timezone.utc)
            self._state["completed_at"] = None
            self._state["error"] = None

    def update_day(self, day: int, progress: int, message: str):
        with self._lock:
            self._state["current_day"] = day
            self._state["progress"] = progress
            self._state["message"] = message

    def set_completed(self, message: str = "Demo farm data is ready."):
        with self._lock:
            self._state["status"] = "completed"
            self._state["progress"] = 100
            self._state["current_day"] = 7
            self._state["message"] = message
            self._state["completed_at"] = datetime.now(timezone.utc)

    def set_failed(self, error_msg: str):
        with self._lock:
            self._state["status"] = "failed"
            self._state["message"] = error_msg
            self._state["error"] = error_msg
            self._state["completed_at"] = datetime.now(timezone.utc)


simulation_state = SimulationStateManager()


def ensure_tables_exist():
    """Ensure all SQLAlchemy tables are created in the database."""
    Base.metadata.create_all(bind=engine)


def ensure_demo_fixtures(db: Session) -> Farmer:
    """Ensure the single demo farmer and 4 demo equipment fixtures exist."""
    ensure_tables_exist()

    farmer = db.query(Farmer).filter(Farmer.id == DEMO_FARMER_ID).first()
    if not farmer:
        farmer = Farmer(
            id=DEMO_FARMER_ID,
            john_deere_org_id=DEMO_FARMER_ORG_ID,
            name=DEMO_FARMER_NAME,
            email=DEMO_FARMER_EMAIL,
            location=DEMO_FARMER_LOCATION,
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

    for item in DEMO_EQUIPMENT_FIXTURES:
        equipment = db.query(Equipment).filter(Equipment.id == item["id"]).first()
        if not equipment:
            equipment = Equipment(
                id=item["id"],
                john_deere_id=item["john_deere_id"],
                farmer_id=farmer.id,
                model=item["model"],
                equipment_type=item["equipment_type"],
                serial_number=item["serial_number"],
                status="ACTIVE",
                is_connected=False,
                connected_at=None,
            )
            db.add(equipment)
        else:
            # Ensure model/type/serial match
            equipment.model = item["model"]
            equipment.equipment_type = item["equipment_type"]
            equipment.serial_number = item["serial_number"]

    db.commit()
    return farmer


def get_display_name(equipment: Equipment) -> str:
    for item in DEMO_EQUIPMENT_FIXTURES:
        if item["id"] == equipment.id or item["model"] == equipment.model:
            return item["name"]
    return f"{equipment.model} {equipment.equipment_type.capitalize()}"


def connect_equipment_device(db: Session, equipment_id: str) -> Optional[Equipment]:
    ensure_demo_fixtures(db)
    equipment = (
        db.query(Equipment)
        .filter(Equipment.id == equipment_id, Equipment.farmer_id == DEMO_FARMER_ID)
        .first()
    )
    if not equipment:
        return None

    equipment.is_connected = True
    if not equipment.connected_at:
        equipment.connected_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(equipment)
    return equipment


def connect_all_equipment_devices(db: Session) -> List[Equipment]:
    ensure_demo_fixtures(db)
    devices = db.query(Equipment).filter(Equipment.farmer_id == DEMO_FARMER_ID).all()
    now = datetime.now(timezone.utc)
    for dev in devices:
        dev.is_connected = True
        if not dev.connected_at:
            dev.connected_at = now
    db.commit()
    return devices


def disconnect_equipment_device(db: Session, equipment_id: str) -> Optional[Equipment]:
    ensure_demo_fixtures(db)
    equipment = (
        db.query(Equipment)
        .filter(Equipment.id == equipment_id, Equipment.farmer_id == DEMO_FARMER_ID)
        .first()
    )
    if not equipment:
        return None

    equipment.is_connected = False
    equipment.connected_at = None

    db.commit()
    db.refresh(equipment)
    return equipment


def reset_all_equipment_connections(db: Session) -> List[Equipment]:
    ensure_demo_fixtures(db)
    devices = db.query(Equipment).filter(Equipment.farmer_id == DEMO_FARMER_ID).all()
    for dev in devices:
        dev.is_connected = False
        dev.connected_at = None
    db.commit()
    return devices


async def run_telemetry_simulation_task():
    """Deterministic 7-day telemetry generator background task."""
    rng = random.Random(DEMO_SEED)

    try:
        simulation_state.set_running()
        await asyncio.sleep(0.3)

        db: Session = SessionLocal()
        try:
            ensure_demo_fixtures(db)
            connected_devices = (
                db.query(Equipment)
                .filter(Equipment.farmer_id == DEMO_FARMER_ID, Equipment.is_connected == True)
                .all()
            )

            if not connected_devices:
                simulation_state.set_failed("No connected equipment found to simulate.")
                return

            connected_ids = [d.id for d in connected_devices]

            # Clear existing demo measurements and operations for connected machines
            db.query(Measurement).filter(
                Measurement.equipment_id.in_(connected_ids),
                Measurement.id.like("demo-meas-%"),
            ).delete(synchronize_session=False)

            db.query(FieldOperation).filter(
                FieldOperation.equipment_id.in_(connected_ids),
                FieldOperation.id.like("demo-op-%"),
            ).delete(synchronize_session=False)

            db.commit()

            # Milestones for 7 days
            milestones = [
                (1, 14, "Creating Day 1 machine activity..."),
                (2, 28, "Generating Day 2 field telemetry..."),
                (3, 42, "Mapping Day 3 tillage and work sessions..."),
                (4, 57, "Recording Day 4 fuel and speed telemetry..."),
                (5, 71, "Simulating Day 5 machine operations..."),
                (6, 85, "Compiling Day 6 field coverage data..."),
                (7, 100, "Finalizing Day 7 farm summary..."),
            ]

            # Fixed end date: 2026-09-29T18:00:00Z
            end_date = datetime(2026, 9, 29, 18, 0, 0, tzinfo=timezone.utc)

            base_engine_hours = {
                "demo-5050d": 340.0,
                "demo-5310": 520.0,
                "demo-6120b": 810.0,
                "demo-boom-sprayer": 160.0,
            }

            for day_idx, (day_num, progress, msg) in enumerate(milestones):
                simulation_state.update_day(day_num, progress, msg)
                await asyncio.sleep(0.35)

                day_start_date = end_date - timedelta(days=(7 - day_num))
                day_base = datetime(
                    day_start_date.year,
                    day_start_date.month,
                    day_start_date.day,
                    8,
                    0,
                    0,
                    tzinfo=timezone.utc,
                )

                for dev in connected_devices:
                    op_type = "TILLAGE"
                    if dev.id == "demo-boom-sprayer":
                        op_type = "SPRAYING"
                    elif dev.id == "demo-5050d" and day_num in (3, 6):
                        op_type = "HAULAGE"
                    elif dev.id == "demo-6120b" and day_num in (2, 5):
                        op_type = "HAULAGE"

                    area = 3.5 + rng.uniform(0.5, 2.5)
                    if dev.id == "demo-boom-sprayer":
                        area = 8.0 + rng.uniform(2.0, 5.0)

                    op_id = f"demo-op-{dev.id}-d{day_num}"
                    op_start = day_base + timedelta(minutes=rng.randint(0, 30))
                    op_end = op_start + timedelta(hours=rng.uniform(4.5, 6.5))

                    field_op = FieldOperation(
                        id=op_id,
                        equipment_id=dev.id,
                        operation_type=op_type,
                        start_time=op_start,
                        end_time=op_end,
                        area_hectares=round(area, 2),
                    )
                    db.add(field_op)

                    num_meas = rng.randint(10, 14)
                    meas_interval = (op_end - op_start).total_seconds() / num_meas

                    fuel_level = 92.0 - (day_num * 5.0) + rng.uniform(-2.0, 2.0)
                    fuel_level = max(20.0, min(95.0, fuel_level))

                    curr_engine_hours = base_engine_hours.get(dev.id, 200.0) + (day_num * 5.2)

                    # 6120B pattern: 4 out of 7 days have higher idle / speed variation / higher fuel consumption
                    is_anomaly_day_6120 = (dev.id == "demo-6120b") and (day_num in (1, 3, 5, 7))

                    for m_idx in range(num_meas):
                        m_time = op_start + timedelta(seconds=m_idx * meas_interval)

                        if dev.id == "demo-5050d":
                            speed = round(rng.uniform(7.2, 8.8), 2)
                            fuel_rate = round(rng.uniform(7.5, 8.8), 2)
                        elif dev.id == "demo-5310":
                            speed = round(rng.uniform(7.0, 9.8), 2)
                            fuel_rate = round(rng.uniform(8.5, 10.2), 2)
                        elif dev.id == "demo-6120b":
                            if is_anomaly_day_6120:
                                # High variability, lower working speed with periods of idle / higher fuel rate
                                speed = round(rng.uniform(3.5, 12.5), 2)
                                fuel_rate = round(rng.uniform(12.0, 15.2), 2)
                            else:
                                speed = round(rng.uniform(8.0, 10.0), 2)
                                fuel_rate = round(rng.uniform(9.5, 11.0), 2)
                        else:  # Sprayer
                            speed = round(rng.uniform(5.2, 6.8), 2)
                            fuel_rate = round(rng.uniform(4.2, 5.8), 2)

                        lat = round(18.6200 + rng.uniform(-0.015, 0.015), 5)
                        lon = round(73.8000 + rng.uniform(-0.015, 0.015), 5)

                        meas = Measurement(
                            id=f"demo-meas-{dev.id}-d{day_num}-{m_idx}",
                            equipment_id=dev.id,
                            timestamp=m_time,
                            fuel_consumption_rate=fuel_rate,
                            fuel_level=round(fuel_level - (m_idx * 0.8), 1),
                            speed=speed,
                            engine_hours=round(curr_engine_hours + (m_idx * (meas_interval / 3600.0)), 2),
                            latitude=lat,
                            longitude=lon,
                        )
                        db.add(meas)

                db.commit()

            simulation_state.set_completed("Demo farm data is ready.")

        finally:
            db.close()

    except Exception as e:
        simulation_state.set_failed(f"Simulation failed: {str(e)}")


def get_today_summary_data(db: Session) -> Dict[str, Any]:
    """Retrieve today summary stats based on current database state."""
    ensure_demo_fixtures(db)
    farmer = db.query(Farmer).filter(Farmer.id == DEMO_FARMER_ID).first()

    connected_count = (
        db.query(Equipment)
        .filter(Equipment.farmer_id == DEMO_FARMER_ID, Equipment.is_connected == True)
        .count()
    )

    operations_count = (
        db.query(FieldOperation)
        .filter(FieldOperation.id.like("demo-op-%"))
        .count()
    )

    data_ready = operations_count > 0

    latest_date_str = None
    if data_ready:
        latest_op = (
            db.query(FieldOperation)
            .filter(FieldOperation.id.like("demo-op-%"))
            .order_by(FieldOperation.end_time.desc())
            .first()
        )
        if latest_op and latest_op.end_time:
            latest_date_str = latest_op.end_time.strftime("%Y-%m-%d")
        else:
            latest_date_str = "2026-09-29"

    return {
        "data_ready": data_ready,
        "farmer": {
            "name": farmer.name if farmer else DEMO_FARMER_NAME,
            "location": farmer.location if farmer else DEMO_FARMER_LOCATION,
        },
        "connected_machines": connected_count,
        "simulated_days": 7 if data_ready else 0,
        "latest_activity_date": latest_date_str,
        "message": (
            "Your demo farm data is ready."
            if data_ready
            else "Connect equipment and prepare data to view your farm summary."
        ),
    }
