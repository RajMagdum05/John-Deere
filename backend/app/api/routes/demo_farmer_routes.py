from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Farmer, Equipment
from app.schemas.demo_farmer import (
    DemoFarmerResponse,
    DemoEquipmentResponse,
    EquipmentListResponse,
    SimulationStatusResponse,
    SimulationStartResponse,
    TodaySummaryResponse,
    TodayFarmerSummary,
)
from app.services.demo_telemetry_service import (
    DEMO_FARMER_ID,
    ensure_demo_fixtures,
    get_display_name,
    connect_equipment_device,
    disconnect_equipment_device,
    connect_all_equipment_devices,
    reset_all_equipment_connections,
    simulation_state,
    run_telemetry_simulation_task,
    get_today_summary_data,
)

router = APIRouter(prefix="/api/demo/farmer", tags=["Demo Farmer Onboarding"])


@router.get("/equipment", response_model=EquipmentListResponse)
def get_demo_equipment(db: Session = Depends(get_db)):
    """Retrieve demo farmer and 4 equipment fixtures."""
    farmer = ensure_demo_fixtures(db)
    devices = (
        db.query(Equipment)
        .filter(Equipment.farmer_id == DEMO_FARMER_ID)
        .order_by(Equipment.id.asc())
        .all()
    )

    equip_list = [
        DemoEquipmentResponse(
            id=d.id,
            stable_key=d.id,
            name=get_display_name(d),
            model=d.model or d.id,
            equipment_type=d.equipment_type or "TRACTOR",
            serial_number=d.serial_number or "",
            is_connected=bool(d.is_connected),
            connected_at=d.connected_at,
        )
        for d in devices
    ]

    return EquipmentListResponse(
        farmer=DemoFarmerResponse(
            id=farmer.id,
            name=farmer.name or "Rajesh Kumar",
            location=farmer.location or "Pimpri, Maharashtra",
        ),
        equipment=equip_list,
    )


@router.post("/devices/connect")
def connect_demo_device(payload: dict, db: Session = Depends(get_db)):
    """Generic device connect endpoint matching POST /api/demo/devices/connect."""
    device_id = payload.get("device_id", "")
    farmer_id = payload.get("farmer_id", DEMO_FARMER_ID)
    
    # Match against equipment
    device = connect_equipment_device(db, device_id)
    if not device:
        # Fallback by model match
        all_eq = db.query(Equipment).filter(Equipment.farmer_id == DEMO_FARMER_ID).all()
        for eq in all_eq:
            if device_id.lower() in (eq.model or '').lower() or device_id.lower() in eq.id.lower():
                device = connect_equipment_device(db, eq.id)
                break

    return {
        "status": "connected",
        "device_id": device.id if device else device_id,
        "farmer_id": farmer_id,
    }


@router.post("/equipment/{equipment_id}/connect", response_model=DemoEquipmentResponse)
def connect_equipment(equipment_id: str, db: Session = Depends(get_db)):
    """Connect a single equipment item."""
    device = connect_equipment_device(db, equipment_id)
    if not device:
        raise HTTPException(
            status_code=404,
            detail=f"Equipment '{equipment_id}' not found for demo farmer."
        )

    return DemoEquipmentResponse(
        id=device.id,
        stable_key=device.id,
        name=get_display_name(device),
        model=device.model or device.id,
        equipment_type=device.equipment_type or "TRACTOR",
        serial_number=device.serial_number or "",
        is_connected=bool(device.is_connected),
        connected_at=device.connected_at,
    )


@router.post("/equipment/connect-all", response_model=List[DemoEquipmentResponse])
def connect_all_equipment(db: Session = Depends(get_db)):
    """Connect all demo equipment items."""
    devices = connect_all_equipment_devices(db)
    return [
        DemoEquipmentResponse(
            id=d.id,
            stable_key=d.id,
            name=get_display_name(d),
            model=d.model or d.id,
            equipment_type=d.equipment_type or "TRACTOR",
            serial_number=d.serial_number or "",
            is_connected=bool(d.is_connected),
            connected_at=d.connected_at,
        )
        for d in devices
    ]


@router.post("/equipment/{equipment_id}/disconnect", response_model=DemoEquipmentResponse)
def disconnect_equipment(equipment_id: str, db: Session = Depends(get_db)):
    """Disconnect a single equipment item."""
    device = disconnect_equipment_device(db, equipment_id)
    if not device:
        raise HTTPException(
            status_code=404,
            detail=f"Equipment '{equipment_id}' not found for demo farmer."
        )

    return DemoEquipmentResponse(
        id=device.id,
        stable_key=device.id,
        name=get_display_name(device),
        model=device.model or device.id,
        equipment_type=device.equipment_type or "TRACTOR",
        serial_number=device.serial_number or "",
        is_connected=bool(device.is_connected),
        connected_at=device.connected_at,
    )


@router.post("/equipment/reset-connections", response_model=List[DemoEquipmentResponse])
def reset_all_connections(db: Session = Depends(get_db)):
    """Reset all demo equipment to disconnected."""
    devices = reset_all_equipment_connections(db)
    return [
        DemoEquipmentResponse(
            id=d.id,
            stable_key=d.id,
            name=get_display_name(d),
            model=d.model or d.id,
            equipment_type=d.equipment_type or "TRACTOR",
            serial_number=d.serial_number or "",
            is_connected=bool(d.is_connected),
            connected_at=d.connected_at,
        )
        for d in devices
    ]


@router.get("/simulation/status", response_model=SimulationStatusResponse)
def get_simulation_status():
    """Retrieve current simulation progress status."""
    state = simulation_state.get_state()
    return SimulationStatusResponse(
        status=state["status"],
        progress=state["progress"],
        current_day=state["current_day"],
        message=state["message"],
        started_at=state["started_at"],
        completed_at=state["completed_at"],
        error=state["error"],
    )


@router.post("/simulation/start", response_model=SimulationStartResponse)
def start_simulation(
    background_tasks: BackgroundTasks,
    reset: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """Start the 7-day telemetry simulation background task."""
    ensure_demo_fixtures(db)
    connected_count = (
        db.query(Equipment)
        .filter(Equipment.farmer_id == DEMO_FARMER_ID, Equipment.is_connected == True)
        .count()
    )

    if connected_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Connect at least one machine before starting data preparation."
        )

    state = simulation_state.get_state()
    if state["status"] == "running":
        return SimulationStartResponse(
            status="running",
            message="Data preparation is already in progress.",
        )

    if state["status"] == "completed" and not reset:
        return SimulationStartResponse(
            status="completed",
            message="Data preparation is already completed. Pass reset=true to rerun.",
        )

    background_tasks.add_task(run_telemetry_simulation_task)

    return SimulationStartResponse(
        status="running",
        message="Started 7-day data preparation simulation.",
    )


@router.get("/today-summary", response_model=TodaySummaryResponse)
def get_today_summary(db: Session = Depends(get_db)):
    """Retrieve today summary overview."""
    data = get_today_summary_data(db)
    return TodaySummaryResponse(
        data_ready=data["data_ready"],
        farmer=TodayFarmerSummary(
            name=data["farmer"]["name"],
            location=data["farmer"]["location"],
        ),
        connected_machines=data["connected_machines"],
        simulated_days=data["simulated_days"],
        latest_activity_date=data["latest_activity_date"],
        message=data["message"],
    )
