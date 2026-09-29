from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class DemoFarmerResponse(BaseModel):
    id: str
    name: str
    location: str


class DemoEquipmentResponse(BaseModel):
    id: str
    stable_key: str
    name: str
    model: str
    equipment_type: str
    serial_number: str
    is_connected: bool
    connected_at: Optional[datetime] = None


class EquipmentListResponse(BaseModel):
    farmer: DemoFarmerResponse
    equipment: List[DemoEquipmentResponse]


class SimulationStatusResponse(BaseModel):
    status: Literal["not_started", "running", "completed", "failed"]
    progress: int
    current_day: int
    message: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None


class SimulationStartResponse(BaseModel):
    status: str
    message: str


class TodayFarmerSummary(BaseModel):
    name: str
    location: str


class TodaySummaryResponse(BaseModel):
    data_ready: bool
    farmer: TodayFarmerSummary
    connected_machines: int
    simulated_days: int
    latest_activity_date: Optional[str] = None
    message: str
