from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class SalesPredictionRequest(BaseModel):
    year: int = Field(..., ge=2000, le=2100, description="Prediction year")
    month: int = Field(..., ge=1, le=12, description="Prediction month number, 1 to 12")


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
    data_sources: Dict[str, str]
    message: str
