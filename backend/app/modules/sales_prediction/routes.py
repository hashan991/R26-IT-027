import os
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, HTTPException, Query, status
from starlette.concurrency import run_in_threadpool

from .repository import (
    delete_sales_entry,
    get_sales_entry,
    list_sales_entries,
    upsert_sales_entry,
)
from .schema import (
    SalesEntryListResponse,
    SalesEntryPayload,
    SalesEntryResponse,
    SalesEntryUpdate,
    SalesPredictionRequest,
    SalesPredictionResponse,
    YearForecastRequest,
    YearForecastResponse,
)
from .service import (
    MONTH_NAMES,
    forecast_next_12_months,
    get_model_weather_profiles,
    predict_quality_for_weather,
    predict_sales,
)

from .weather_service import (
    fetch_current_month_weather,
    fetch_historical_monthly_profiles,
    fetch_forecast_monthly_profiles,
)

router = APIRouter()
APP_TIMEZONE = os.getenv("APP_TIMEZONE", "Asia/Colombo")


def _previous_year_month(year: int, month: int) -> tuple[int, int]:
    if month == 1:
        return year - 1, 12
    return year, month - 1


@router.get("/health")
def sales_prediction_health():
    return {"status": "ok", "module": "Sales Prediction"}


@router.get("/months")
def get_months():
    return [{"value": number, "label": name} for number, name in MONTH_NAMES.items()]


# ------------------------------------------------------------------
# Existing detailed single-month prediction endpoint
# ------------------------------------------------------------------

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


# ------------------------------------------------------------------
# Monthly sales CRUD
# ------------------------------------------------------------------

@router.post(
    "/entries",
    response_model=SalesEntryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_or_replace_sales_entry(payload: SalesEntryPayload):
    try:
        return await upsert_sales_entry(
            payload.year,
            payload.month,
            payload.sales_count,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/entries", response_model=SalesEntryListResponse)
async def get_all_sales_entries(limit: int = Query(120, ge=1, le=500)):
    try:
        return {"entries": await list_sales_entries(limit=limit)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/entries/previous", response_model=SalesEntryResponse)
async def get_previous_sales_entry():
    now = datetime.now(ZoneInfo(APP_TIMEZONE))
    previous_year, previous_month = _previous_year_month(now.year, now.month)
    entry = await get_sales_entry(previous_year, previous_month)

    if entry is None:
        raise HTTPException(
            status_code=404,
            detail="No sales record has been saved for the previous month.",
        )

    return entry


@router.get("/entries/{year}/{month}", response_model=SalesEntryResponse)
async def get_one_sales_entry(
    year: int,
    month: int,
):
    if month < 1 or month > 12:
        raise HTTPException(status_code=422, detail="Month must be between 1 and 12.")

    entry = await get_sales_entry(year, month)
    if entry is None:
        raise HTTPException(status_code=404, detail="Sales record not found.")

    return entry


@router.put("/entries/{year}/{month}", response_model=SalesEntryResponse)
async def update_one_sales_entry(
    year: int,
    month: int,
    payload: SalesEntryUpdate,
):
    if month < 1 or month > 12:
        raise HTTPException(status_code=422, detail="Month must be between 1 and 12.")

    return await upsert_sales_entry(year, month, payload.sales_count)


@router.delete("/entries/{year}/{month}")
async def remove_sales_entry(year: int, month: int):
    if month < 1 or month > 12:
        raise HTTPException(status_code=422, detail="Month must be between 1 and 12.")

    deleted = await delete_sales_entry(year, month)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sales record not found.")

    return {"message": "Sales record deleted successfully."}


# ------------------------------------------------------------------
# Weather API
# ------------------------------------------------------------------

@router.get("/weather/current-month")
async def current_month_weather():
    try:
        weather_payload = await run_in_threadpool(
            fetch_current_month_weather
        )

        year = int(
            weather_payload["year"]
        )

        month = int(
            weather_payload["month"]
        )

        # Try to use real previous-month sales
        # from MongoDB for the quality model.
        if month == 1:
            previous_year = year - 1
            previous_month = 12
        else:
            previous_year = year
            previous_month = month - 1

        previous_entry = (
            await get_sales_entry(
                previous_year,
                previous_month,
            )
        )

        previous_sales = None

        if previous_entry is not None:
            previous_sales = (
                previous_entry[
                    "sales_count"
                ]
            )

        quality_result = (
            await run_in_threadpool(
                predict_quality_for_weather,
                year,
                month,
                weather_payload[
                    "weather_profile"
                ],
                previous_sales,
            )
        )

        return {
            **weather_payload,
            **quality_result,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to retrieve current "
                f"weather/quality data: {exc}"
            ),
        ) from exc

# ------------------------------------------------------------------
# Database-driven recursive 12-month forecast
# ------------------------------------------------------------------

@router.post("/forecast/year", response_model=YearForecastResponse)
async def generate_year_forecast(payload: YearForecastRequest):
    # start_year/start_month represent the FIRST MONTH TO PREDICT.
    # The model needs the actual sales count from the month immediately before it.
    previous_year, previous_month = _previous_year_month(
        payload.start_year, payload.start_month
    )
    base_entry = await get_sales_entry(previous_year, previous_month)

    if base_entry is None:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Save the actual sales count for {MONTH_NAMES[previous_month]} "
                f"{previous_year} before generating the forecast from "
                f"{MONTH_NAMES[payload.start_month]} {payload.start_year}."
            ),
        )

    # Primary source: Open-Meteo long-range seasonal forecast.
    # Months outside the live forecast horizon automatically use historical
    # monthly climatology. If the weather service itself is unavailable, the
    # model-bundle monthly profile remains the final fallback.
    weather_sources = None
    try:
        weather_profiles, weather_sources, weather_source = await run_in_threadpool(
            fetch_forecast_monthly_profiles,
            payload.start_year,
            payload.start_month,
            12,
        )
    except Exception:
        try:
            weather_profiles, weather_source = await run_in_threadpool(
                fetch_historical_monthly_profiles
            )
        except Exception:
            weather_profiles = get_model_weather_profiles()
            weather_source = (
                "Fallback: monthly weather profile saved inside the trained model bundle"
            )

    try:
        return forecast_next_12_months(
            start_year=payload.start_year,
            start_month=payload.start_month,
            actual_sales=base_entry["sales_count"],
            weather_profiles=weather_profiles,
            weather_source=weather_source,
            weather_sources=weather_sources,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
