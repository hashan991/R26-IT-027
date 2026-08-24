from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SensorReadingRequest(BaseModel):
    batch_id: str = Field(min_length=1)

    moisture: float
    red: float
    green: float
    blue: float

    temperature: float
    humidity: float

    status: Optional[str] = None


class QualityIssue(BaseModel):
    title: str
    severity: str
    description: str


class ActionItem(BaseModel):
    step: Optional[int] = None
    action: str
    reason: Optional[str] = None


class PowderQualityResult(BaseModel):
    status: str

    quality_score: float = 0
    confidence: float = 0

    decision: Optional[str] = None
    release_status: Optional[str] = None
    risk_level: Optional[str] = None

    quality_issue: Optional[Dict[str, Any]] = None

    root_causes: List[Any] = []
    immediate_actions: List[Any] = []
    future_prevention: List[Any] = []

    expected_outcome: Optional[str] = None
    next_action: Optional[str] = None

    recovery_probability: Optional[float] = None
    recovery_possible: Optional[bool] = None


class SensorReadingResponse(BaseModel):
    message: str
    batch_id: str
    saved: bool
    ai_decision: Dict[str, Any]


class CreateBatchRequest(BaseModel):
    batch_id: str = Field(min_length=1)


class BatchCreateResponse(BaseModel):
    message: str
    batch_id: str
    status: str