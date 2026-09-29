from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict


ActionStatus = Literal[
    "recommended",
    "will_try",
    "tried",
    "not_relevant",
    "outcome_pending",
    "improved",
    "inconclusive",
]

UpdatableActionStatus = Literal[
    "will_try",
    "tried",
    "not_relevant",
]

ConfidenceLevel = Literal["low", "medium", "high"]


class AnalysisRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    analysis_ready: bool
    sessions_analyzed: int
    actions_generated: int
    message: str


class ActionEquipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    model: str


class ActionEvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    recent_session_count: int
    unusual_session_count: int
    fuel_per_acre_current: Optional[float] = None
    fuel_per_acre_baseline: Optional[float] = None
    fuel_deviation_percent: Optional[float] = None
    idle_ratio_current: Optional[float] = None
    idle_ratio_baseline: Optional[float] = None
    speed_variation_current: Optional[float] = None
    speed_variation_baseline: Optional[float] = None
    trend_direction: Optional[str] = None
    comparable_operation_type: Optional[str] = None
    confidence: ConfidenceLevel


class ActionStepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    step_id: int
    action: str
    threshold_minutes: Optional[int] = None


class ExpectedOutcomeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    unit: str = "litres"
    estimated_min: float
    estimated_max: float
    label: str = "estimated_opportunity"


class FarmActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    priority: int
    status: ActionStatus
    action_type: str
    equipment: ActionEquipmentResponse
    operation_type: str
    confidence: ConfidenceLevel
    evidence: ActionEvidenceResponse
    steps: List[ActionStepResponse]
    expected_outcome: Optional[ExpectedOutcomeResponse] = None
    created_at: datetime


class FarmActionListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    analysis_ready: bool
    actions: List[FarmActionResponse]


class UpdateActionStatusRequest(BaseModel):
    status: UpdatableActionStatus


class TopActionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    priority: int
    action_type: str
    equipment_name: str
    confidence: ConfidenceLevel


class FarmActionSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    analysis_ready: bool
    attention_needed: bool
    action_count: int
    top_action: Optional[TopActionSummary] = None
