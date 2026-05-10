import math
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
import pandas as pd

MONTH_NAMES = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
}


def _candidate_model_paths() -> list[Path]:
    """Return possible locations for the model file.

    Recommended location:
        coffee-quality-ai-platform/models/sales_prediction/final_coffee_year_month_model.pkl
    """
    current_file = Path(__file__).resolve()
    project_root = current_file.parents[4]  # .../coffee-quality-ai-platform

    paths: list[Path] = []

    env_path = os.getenv("SALES_MODEL_PATH")
    if env_path:
        paths.append(Path(env_path))

    paths.extend(
        [
            project_root / "models" / "sales_prediction" / "final_coffee_year_month_model.pkl",
            project_root / "models" / "market_suitability_prediction" / "final_coffee_year_month_model.pkl",
            Path.cwd() / "models" / "sales_prediction" / "final_coffee_year_month_model.pkl",
            Path.cwd().parent / "models" / "sales_prediction" / "final_coffee_year_month_model.pkl",
        ]
    )
    return paths


def _get_model_path() -> Path:
    for path in _candidate_model_paths():
        if path.exists():
            return path

    checked = "\n".join(str(path) for path in _candidate_model_paths())
    raise FileNotFoundError(
        "Sales prediction model file not found. Place final_coffee_year_month_model.pkl in "
        "models/sales_prediction/ or set SALES_MODEL_PATH. Checked:\n" + checked
    )


@lru_cache(maxsize=1)
def load_model_bundle() -> Dict[str, Any]:
    """Load the joblib .pkl bundle once and reuse it for all API requests."""
    model_path = _get_model_path()
    bundle = joblib.load(model_path)

    required_keys = [
        "sales_model",
        "sales_features",
        "monthly_weather_profile",
        "training_data",
    ]
    missing = [key for key in required_keys if key not in bundle]
    if missing:
        raise ValueError(f"Invalid model bundle. Missing keys: {missing}")

    return bundle


def _previous_year_month(year: int, month: int) -> Tuple[int, int]:
    if month == 1:
        return year - 1, 12
    return year, month - 1


def _get_weather_profile(bundle: Dict[str, Any], month: int) -> Dict[str, float]:
    profile = bundle["monthly_weather_profile"]

    if month not in profile.index:
        raise ValueError(f"Weather profile is missing month {month}")

    weather_row = profile.loc[month]
    weather_columns = [
        "Rainfall_mm",
        "Humidity_pct",
        "Avg_High_C",
        "Avg_Low_C",
        "Rainy_Days",
        "Cloud_pct",
        "Wind_mph",
    ]

    return {column: float(weather_row[column]) for column in weather_columns}


def _get_previous_month_sales(bundle: Dict[str, Any], year: int, month: int) -> Tuple[float, str]:
    training_data: pd.DataFrame = bundle["training_data"]
    prev_year, prev_month = _previous_year_month(year, month)

    exact_previous_month = training_data[
        (training_data["Year"] == prev_year) & (training_data["Month_Num"] == prev_month)
    ]

    if not exact_previous_month.empty:
        return float(exact_previous_month.iloc[-1]["Coffee_Sales_Units"]), (
            f"Actual previous-month sales from {MONTH_NAMES[prev_month]} {prev_year}"
        )

    same_month_history = training_data[training_data["Month_Num"] == prev_month]
    if not same_month_history.empty:
        return float(same_month_history["Coffee_Sales_Units"].mean()), (
            f"Average historical sales for previous month type: {MONTH_NAMES[prev_month]}"
        )

    return float(training_data["Coffee_Sales_Units"].mean()), "Overall historical average sales"


def _sales_level(bundle: Dict[str, Any], predicted_sales: float) -> str:
    sales = bundle["training_data"]["Coffee_Sales_Units"]
    q25 = float(sales.quantile(0.25))
    q75 = float(sales.quantile(0.75))

    if predicted_sales >= q75:
        return "High demand"
    if predicted_sales <= q25:
        return "Low demand"
    return "Medium demand"


def _monthly_average_change(bundle: Dict[str, Any], month: int, predicted_sales: float) -> Optional[float]:
    training_data: pd.DataFrame = bundle["training_data"]
    month_rows = training_data[training_data["Month_Num"] == month]
    if month_rows.empty:
        return None

    monthly_average = float(month_rows["Coffee_Sales_Units"].mean())
    if monthly_average == 0:
        return None

    return round(((predicted_sales - monthly_average) / monthly_average) * 100, 2)


def predict_sales(year: int, month: int) -> Dict[str, Any]:
    if month < 1 or month > 12:
        raise ValueError("Month must be between 1 and 12")

    bundle = load_model_bundle()

    weather = _get_weather_profile(bundle, month)
    previous_sales, previous_sales_source = _get_previous_month_sales(bundle, year, month)

    base_features: Dict[str, float] = {
        "Year": float(year),
        "Month_Num": float(month),
        "Prev_Month_Sales": previous_sales,
        "Month_Sin": float(math.sin(2 * math.pi * month / 12)),
        "Month_Cos": float(math.cos(2 * math.pi * month / 12)),
        **weather,
    }

    sales_features = bundle["sales_features"]
    sales_input = pd.DataFrame([{feature: base_features[feature] for feature in sales_features}])
    predicted_sales_raw = float(bundle["sales_model"].predict(sales_input)[0])
    predicted_sales_units = int(round(predicted_sales_raw))

    predicted_quality_label: Optional[str] = None
    predicted_quality_probabilities: Optional[Dict[str, float]] = None

    if all(key in bundle for key in ["quality_model", "quality_features", "quality_encoder"]):
        quality_features = bundle["quality_features"]
        quality_input = pd.DataFrame([{feature: base_features[feature] for feature in quality_features}])
        encoded_quality = int(bundle["quality_model"].predict(quality_input)[0])
        predicted_quality_label = str(bundle["quality_encoder"].inverse_transform([encoded_quality])[0])

        if hasattr(bundle["quality_model"], "predict_proba"):
            probabilities = bundle["quality_model"].predict_proba(quality_input)[0]
            classes = bundle["quality_model"].classes_
            decoded_classes = bundle["quality_encoder"].inverse_transform(classes)
            predicted_quality_probabilities = {
                str(label): round(float(probability), 4)
                for label, probability in zip(decoded_classes, probabilities)
            }

    level = _sales_level(bundle, predicted_sales_raw)
    change_pct = _monthly_average_change(bundle, month, predicted_sales_raw)

    return {
        "input": {
            "year": year,
            "month": month,
            "month_name": MONTH_NAMES[month],
        },
        "predicted_sales_units": predicted_sales_units,
        "predicted_sales_units_raw": round(predicted_sales_raw, 2),
        "predicted_quality_label": predicted_quality_label,
        "predicted_quality_probabilities": predicted_quality_probabilities,
        "sales_level": level,
        "sales_change_vs_monthly_average_pct": change_pct,
        "weather_profile": {key: round(value, 2) for key, value in weather.items()},
        "model_features": {key: round(float(value), 4) for key, value in base_features.items()},
        "data_sources": {
            "weather_source": "Monthly weather profile saved inside the trained model bundle",
            "previous_month_sales_source": previous_sales_source,
            "model_file": str(_get_model_path()),
        },
        "message": (
            f"Predicted coffee sales for {MONTH_NAMES[month]} {year}: "
            f"{predicted_sales_units:,} units ({level})."
        ),
    }
