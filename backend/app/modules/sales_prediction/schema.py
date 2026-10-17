from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SalesPredictionRequest(BaseModel):
    year: int = Field(..., ge=2000, le=2100, description="Prediction year")
    month: int = Field(..., ge=1, le=12, description="Prediction month number, 1 to 12")


class XAIExplanationItem(BaseModel):
    feature: str
    value: float
    shap_value: float
    absolute_impact: float
    direction: str


class XAIResponse(BaseModel):
    sales_explanation: List[XAIExplanationItem]
    quality_explanation: Optional[List[XAIExplanationItem]] = None


class SalesPredictionResponse(BaseModel):
    input: Dict[str, Any]
    predicted_sales_units: int
    predicted_sales_units_raw: float
    predicted_quality_label: Optional[str] = None
    predicted_quality_probabilities: Optional[Dict[str, float]] = None
    sales_level: str
    sales_change_vs_monthly_average_pct: Optional[float] = None
    weather_profile: Dict[str, float]
    model_features: Dict[str, float]
    xai: XAIResponse
    data_sources: Dict[str, str]
    message: str


class SalesEntryPayload(BaseModel):
    year: int = Field(..., ge=2000, le=2100)
    month: int = Field(..., ge=1, le=12)
    sales_count: int = Field(..., ge=0)


class SalesEntryUpdate(BaseModel):
    sales_count: int = Field(..., ge=0)


class SalesEntryResponse(BaseModel):
    id: Optional[str] = None
    year: int
    month: int
    sales_count: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class SalesEntryListResponse(BaseModel):
    entries: List[SalesEntryResponse]


class YearForecastRequest(BaseModel):
    start_year: int = Field(..., ge=2000, le=2100)
    start_month: int = Field(..., ge=1, le=12)


class ForecastMonthResult(BaseModel):
    year: int
    month: int
    month_name: str

    predicted_sales: int
    predicted_sales_raw: float

    previous_sales_used: float

    predicted_quality_label: Optional[str] = None

    predicted_quality_probabilities: Optional[
        Dict[str, float]
    ] = None

    weather_profile: Dict[str, float]

    weather_source: str


class YearForecastResponse(BaseModel):
    base_period: Dict[str, Any]
    forecast: List[ForecastMonthResult]
    weather_source: str
    message: str
