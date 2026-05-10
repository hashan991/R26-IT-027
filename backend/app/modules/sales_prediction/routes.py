from fastapi import APIRouter, HTTPException, Query

from .schema import SalesPredictionRequest, SalesPredictionResponse
from .service import MONTH_NAMES, predict_sales

router = APIRouter()


@router.get("/health")
def sales_prediction_health():
    return {"status": "ok", "module": "Sales Prediction"}


@router.get("/months")
def get_months():
    return [{"value": number, "label": name} for number, name in MONTH_NAMES.items()]


@router.post("/predict", response_model=SalesPredictionResponse)
def predict_sales_post(payload: SalesPredictionRequest):
    try:
        return predict_sales(payload.year, payload.month)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/predict", response_model=SalesPredictionResponse)
def predict_sales_get(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
):
    try:
        return predict_sales(year, month)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
