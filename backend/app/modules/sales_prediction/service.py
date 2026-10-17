import math
import os

from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
import pandas as pd
import shap


# ============================================================
# MONTH NAMES
# ============================================================

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


# ============================================================
# MODEL FILE PATHS
# ============================================================

def _candidate_model_paths() -> list[Path]:
    """
    Return possible locations for the model file.

    Recommended location:

    R26-IT-027/
    └── models/
        └── sales_prediction/
            └── final_coffee_xai_model.pkl
    """

    current_file = Path(__file__).resolve()

    # service.py:
    # backend/app/modules/sales_prediction/service.py
    #
    # parents[0] = sales_prediction
    # parents[1] = modules
    # parents[2] = app
    # parents[3] = backend
    # parents[4] = project root

    project_root = current_file.parents[4]

    paths: list[Path] = []

    env_path = os.getenv("SALES_MODEL_PATH")

    if env_path:
        paths.append(
            Path(env_path)
        )

    paths.extend(
        [
            project_root
            / "models"
            / "sales_prediction"
            / "final_coffee_xai_model.pkl",

            Path.cwd()
            / "models"
            / "sales_prediction"
            / "final_coffee_xai_model.pkl",

            Path.cwd().parent
            / "models"
            / "sales_prediction"
            / "final_coffee_xai_model.pkl",
        ]
    )

    return paths


# ============================================================
# GET MODEL PATH
# ============================================================

def _get_model_path() -> Path:

    for path in _candidate_model_paths():

        if path.exists():
            return path

    checked = "\n".join(
        str(path)
        for path in _candidate_model_paths()
    )

    raise FileNotFoundError(
        "Sales prediction model file not found.\n\n"
        "Place final_coffee_xai_model.pkl inside:\n"
        "models/sales_prediction/\n\n"
        "Or set SALES_MODEL_PATH.\n\n"
        "Checked locations:\n"
        + checked
    )


# ============================================================
# LOAD MODEL BUNDLE
# ============================================================

@lru_cache(maxsize=1)
def load_model_bundle() -> Dict[str, Any]:
    """
    Load the trained model bundle once.

    The same model bundle is reused for API requests.
    """

    model_path = _get_model_path()

    print(
        f"Loading coffee prediction model from: "
        f"{model_path}"
    )

    bundle = joblib.load(
        model_path
    )

    required_keys = [
        "sales_model",
        "sales_features",
        "monthly_weather_profile",
        "training_data",
    ]

    missing = [
        key
        for key in required_keys
        if key not in bundle
    ]

    if missing:
        raise ValueError(
            f"Invalid model bundle. "
            f"Missing keys: {missing}"
        )

    return bundle


# ============================================================
# CREATE SHAP EXPLAINERS
# ============================================================

@lru_cache(maxsize=1)
def load_xai_explainers():

    bundle = load_model_bundle()

    sales_explainer = shap.TreeExplainer(
        bundle["sales_model"]
    )

    quality_explainer = None

    if "quality_model" in bundle:

        quality_explainer = (
            shap.TreeExplainer(
                bundle[
                    "quality_model"
                ]
            )
        )

    return (
        sales_explainer,
        quality_explainer,
    )


# ============================================================
# SHAP DIRECTION
# ============================================================

def _impact_direction(
    value: float
) -> str:

    if value > 0:
        return "positive"

    if value < 0:
        return "negative"

    return "neutral"


# ============================================================
# PREVIOUS YEAR / MONTH
# ============================================================

def _previous_year_month(
    year: int,
    month: int,
) -> Tuple[int, int]:

    if month == 1:

        return (
            year - 1,
            12,
        )

    return (
        year,
        month - 1,
    )


# ============================================================
# NEXT YEAR / MONTH
# ============================================================

def _next_year_month(
    year: int,
    month: int,
) -> Tuple[int, int]:

    if month == 12:

        return (
            year + 1,
            1,
        )

    return (
        year,
        month + 1,
    )


# ============================================================
# WEATHER PROFILE FROM MODEL BUNDLE
# ============================================================

def _get_weather_profile(
    bundle: Dict[str, Any],
    month: int,
) -> Dict[str, float]:

    profile = bundle[
        "monthly_weather_profile"
    ]

    if month not in profile.index:

        raise ValueError(
            f"Weather profile is missing "
            f"month {month}"
        )

    weather_row = profile.loc[
        month
    ]

    weather_columns = [
        "Rainfall_mm",
        "Humidity_pct",
        "Avg_High_C",
        "Avg_Low_C",
        "Rainy_Days",
        "Cloud_pct",
        "Wind_mph",
    ]

    return {
        column:
            float(
                weather_row[
                    column
                ]
            )

        for column
        in weather_columns
    }


# ============================================================
# ALL MODEL WEATHER PROFILES
# ============================================================

def get_model_weather_profiles() -> Dict[
    int,
    Dict[str, float],
]:

    bundle = load_model_bundle()

    return {
        month:
            _get_weather_profile(
                bundle,
                month,
            )

        for month
        in range(
            1,
            13,
        )
    }


# ============================================================
# PREVIOUS MONTH SALES FROM TRAINING DATA
# FALLBACK USED WHEN DATABASE SALES IS NOT PROVIDED
# ============================================================

def _get_previous_month_sales(
    bundle: Dict[str, Any],
    year: int,
    month: int,
) -> Tuple[float, str]:

    training_data: pd.DataFrame = (
        bundle[
            "training_data"
        ]
    )

    (
        prev_year,
        prev_month,
    ) = _previous_year_month(
        year,
        month,
    )

    # --------------------------------------------------------
    # Exact previous calendar month
    # --------------------------------------------------------

    exact_previous_month = (
        training_data[
            (
                training_data[
                    "Year"
                ]
                == prev_year
            )
            &
            (
                training_data[
                    "Month_Num"
                ]
                == prev_month
            )
        ]
    )

    if not exact_previous_month.empty:

        previous_sales = float(
            exact_previous_month.iloc[
                -1
            ][
                "Coffee_Sales_Units"
            ]
        )

        source = (
            "Actual previous-month sales "
            "from training data: "
            f"{MONTH_NAMES[prev_month]} "
            f"{prev_year}"
        )

        return (
            previous_sales,
            source,
        )

    # --------------------------------------------------------
    # Historical same-month average
    # --------------------------------------------------------

    same_month_history = (
        training_data[
            training_data[
                "Month_Num"
            ]
            == prev_month
        ]
    )

    if not same_month_history.empty:

        previous_sales = float(
            same_month_history[
                "Coffee_Sales_Units"
            ].mean()
        )

        source = (
            "Average historical sales "
            "for previous month type: "
            f"{MONTH_NAMES[prev_month]}"
        )

        return (
            previous_sales,
            source,
        )

    # --------------------------------------------------------
    # Final fallback
    # --------------------------------------------------------

    previous_sales = float(
        training_data[
            "Coffee_Sales_Units"
        ].mean()
    )

    return (
        previous_sales,
        "Overall historical average sales",
    )


# ============================================================
# SALES DEMAND LEVEL
# ============================================================

def _sales_level(
    bundle: Dict[str, Any],
    predicted_sales: float,
) -> str:

    sales = (
        bundle[
            "training_data"
        ][
            "Coffee_Sales_Units"
        ]
    )

    q25 = float(
        sales.quantile(
            0.25
        )
    )

    q75 = float(
        sales.quantile(
            0.75
        )
    )

    if predicted_sales >= q75:
        return "High demand"

    if predicted_sales <= q25:
        return "Low demand"

    return "Medium demand"


# ============================================================
# MONTHLY AVERAGE CHANGE
# ============================================================

def _monthly_average_change(
    bundle: Dict[str, Any],
    month: int,
    predicted_sales: float,
) -> Optional[float]:

    training_data: pd.DataFrame = (
        bundle[
            "training_data"
        ]
    )

    month_rows = (
        training_data[
            training_data[
                "Month_Num"
            ]
            == month
        ]
    )

    if month_rows.empty:
        return None

    monthly_average = float(
        month_rows[
            "Coffee_Sales_Units"
        ].mean()
    )

    if monthly_average == 0:
        return None

    change = (
        (
            predicted_sales
            - monthly_average
        )
        /
        monthly_average
    ) * 100

    return round(
        change,
        2,
    )


# ============================================================
# BUILD MODEL FEATURES
# ============================================================

def _build_base_features(
    year: int,
    month: int,
    previous_sales: float,
    weather: Dict[str, float],
) -> Dict[str, float]:

    return {

        "Year":
            float(
                year
            ),

        "Month_Num":
            float(
                month
            ),

        "Prev_Month_Sales":
            float(
                previous_sales
            ),

        "Month_Sin":
            float(
                math.sin(
                    2
                    * math.pi
                    * month
                    / 12
                )
            ),

        "Month_Cos":
            float(
                math.cos(
                    2
                    * math.pi
                    * month
                    / 12
                )
            ),

        **{
            key:
                float(
                    value
                )

            for key, value
            in weather.items()
        },
    }


# ============================================================
# COFFEE QUALITY PREDICTION
# LOW / MEDIUM / HIGH
# ============================================================

def _predict_quality_from_base_features(
    bundle: Dict[str, Any],
    base_features: Dict[str, float],
) -> Dict[str, Any]:

    predicted_quality_label: Optional[
        str
    ] = None

    predicted_quality_probabilities: Optional[
        Dict[str, float]
    ] = None

    quality_available = all(
        key in bundle
        for key in [
            "quality_model",
            "quality_features",
            "quality_encoder",
        ]
    )

    if not quality_available:

        return {
            "predicted_quality_label":
                None,

            "predicted_quality_probabilities":
                None,
        }

    quality_features = bundle[
        "quality_features"
    ]

    missing_features = [
        feature
        for feature in quality_features
        if feature not in base_features
    ]

    if missing_features:

        raise ValueError(
            "Missing quality model "
            f"features: {missing_features}"
        )

    quality_input = pd.DataFrame(
        [
            {
                feature:
                    base_features[
                        feature
                    ]

                for feature
                in quality_features
            }
        ]
    )

    # --------------------------------------------------------
    # Predict quality class
    # --------------------------------------------------------

    encoded_quality = int(
        bundle[
            "quality_model"
        ].predict(
            quality_input
        )[0]
    )

    # --------------------------------------------------------
    # Decode to LOW / MEDIUM / HIGH
    # --------------------------------------------------------

    predicted_quality_label = str(
        bundle[
            "quality_encoder"
        ].inverse_transform(
            [
                encoded_quality
            ]
        )[0]
    )

    # --------------------------------------------------------
    # Probabilities
    # --------------------------------------------------------

    if hasattr(
        bundle[
            "quality_model"
        ],
        "predict_proba",
    ):

        probabilities = (
            bundle[
                "quality_model"
            ].predict_proba(
                quality_input
            )[0]
        )

        classes = (
            bundle[
                "quality_model"
            ].classes_
        )

        decoded_classes = (
            bundle[
                "quality_encoder"
            ].inverse_transform(
                classes
            )
        )

        predicted_quality_probabilities = {

            str(label):
                round(
                    float(
                        probability
                    ),
                    4,
                )

            for label, probability
            in zip(
                decoded_classes,
                probabilities,
            )
        }

    return {

        "predicted_quality_label":
            predicted_quality_label,

        "predicted_quality_probabilities":
            predicted_quality_probabilities,
    }


# ============================================================
# QUALITY XAI EXPLANATION
# ============================================================

def _get_quality_explanation(
    bundle: Dict[str, Any],
    quality_explainer,
    base_features: Dict[str, float],
    predicted_quality_label: Optional[str],
) -> Optional[list]:

    if (
        quality_explainer is None
        or predicted_quality_label is None
    ):
        return None

    if not all(
        key in bundle
        for key in [
            "quality_model",
            "quality_features",
            "quality_encoder",
        ]
    ):
        return None

    quality_features = (
        bundle[
            "quality_features"
        ]
    )

    quality_input = pd.DataFrame(
        [
            {
                feature:
                    base_features[
                        feature
                    ]

                for feature
                in quality_features
            }
        ]
    )

    encoded_quality = int(
        bundle[
            "quality_encoder"
        ].transform(
            [
                predicted_quality_label
            ]
        )[0]
    )

    quality_shap_result = (
        quality_explainer(
            quality_input
        )
    )

    quality_explanation = []

    values = (
        quality_shap_result.values
    )

    for index, feature in enumerate(
        quality_features
    ):

        # RF classifier SHAP normally returns:
        # [row, feature, class]
        #
        # This fallback also supports
        # [row, feature] format.

        if getattr(
            values,
            "ndim",
            0,
        ) >= 3:

            shap_value = float(
                values[
                    0,
                    index,
                    encoded_quality,
                ]
            )

        else:

            shap_value = float(
                values[
                    0,
                    index,
                ]
            )

        feature_value = float(
            quality_input.iloc[
                0
            ][
                feature
            ]
        )

        quality_explanation.append(
            {
                "feature":
                    feature,

                "value":
                    round(
                        feature_value,
                        4,
                    ),

                "shap_value":
                    round(
                        shap_value,
                        4,
                    ),

                "absolute_impact":
                    round(
                        abs(
                            shap_value
                        ),
                        4,
                    ),

                "direction":
                    _impact_direction(
                        shap_value
                    ),
            }
        )

    return sorted(
        quality_explanation,

        key=lambda item:
            item[
                "absolute_impact"
            ],

        reverse=True,

    )[:5]


# ============================================================
# CURRENT WEATHER -> QUALITY PREDICTION
# USED BY /weather/current-month
# ============================================================

def predict_quality_for_weather(
    year: int,
    month: int,
    weather: Dict[str, float],
    previous_sales: Optional[
        float
    ] = None,
) -> Dict[str, Any]:

    if month < 1 or month > 12:

        raise ValueError(
            "Month must be between 1 and 12"
        )

    bundle = load_model_bundle()

    # --------------------------------------------------------
    # If DB value is not supplied,
    # fallback to historical model data.
    # --------------------------------------------------------

    if previous_sales is None:

        (
            previous_sales,
            previous_sales_source,
        ) = _get_previous_month_sales(
            bundle,
            year,
            month,
        )

    else:

        previous_sales_source = (
            "Actual previous-month sales "
            "saved in MongoDB"
        )

    base_features = (
        _build_base_features(
            year=year,
            month=month,
            previous_sales=previous_sales,
            weather=weather,
        )
    )

    quality_result = (
        _predict_quality_from_base_features(
            bundle,
            base_features,
        )
    )

    return {

        "predicted_quality_label":
            quality_result[
                "predicted_quality_label"
            ],

        "predicted_quality_probabilities":
            quality_result[
                "predicted_quality_probabilities"
            ],

        "quality_previous_sales_used":
            round(
                float(
                    previous_sales
                ),
                2,
            ),

        "quality_previous_sales_source":
            previous_sales_source,
    }


# ============================================================
# MAIN DETAILED SALES + QUALITY + XAI PREDICTION
# EXISTING /api/sales/predict ENDPOINT
# ============================================================

def predict_sales(
    year: int,
    month: int,
) -> Dict[str, Any]:

    # --------------------------------------------------------
    # Validate month
    # --------------------------------------------------------

    if month < 1 or month > 12:

        raise ValueError(
            "Month must be between 1 and 12"
        )

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    bundle = load_model_bundle()

    (
        sales_explainer,
        quality_explainer,
    ) = load_xai_explainers()

    # --------------------------------------------------------
    # Model-bundle monthly weather
    # --------------------------------------------------------

    weather = _get_weather_profile(
        bundle,
        month,
    )

    # --------------------------------------------------------
    # Previous sales
    # --------------------------------------------------------

    (
        previous_sales,
        previous_sales_source,
    ) = _get_previous_month_sales(
        bundle,
        year,
        month,
    )

    # --------------------------------------------------------
    # Base features
    # --------------------------------------------------------

    base_features = (
        _build_base_features(
            year=year,
            month=month,
            previous_sales=previous_sales,
            weather=weather,
        )
    )

    # ========================================================
    # SALES INPUT
    # ========================================================

    sales_features = bundle[
        "sales_features"
    ]

    missing_sales_features = [
        feature
        for feature in sales_features
        if feature not in base_features
    ]

    if missing_sales_features:

        raise ValueError(
            "Missing sales model "
            f"features: "
            f"{missing_sales_features}"
        )

    sales_input = pd.DataFrame(
        [
            {
                feature:
                    base_features[
                        feature
                    ]

                for feature
                in sales_features
            }
        ]
    )

    # ========================================================
    # SALES PREDICTION
    # ========================================================

    predicted_sales_raw = float(
        bundle[
            "sales_model"
        ].predict(
            sales_input
        )[0]
    )

    predicted_sales_units = int(
        round(
            predicted_sales_raw
        )
    )

    # ========================================================
    # SALES SHAP
    # ========================================================

    sales_shap_result = (
        sales_explainer(
            sales_input
        )
    )

    sales_explanation = []

    for index, feature in enumerate(
        sales_features
    ):

        shap_value = float(
            sales_shap_result.values[
                0,
                index,
            ]
        )

        feature_value = float(
            sales_input.iloc[
                0
            ][
                feature
            ]
        )

        sales_explanation.append(
            {
                "feature":
                    feature,

                "value":
                    round(
                        feature_value,
                        4,
                    ),

                "shap_value":
                    round(
                        shap_value,
                        4,
                    ),

                "absolute_impact":
                    round(
                        abs(
                            shap_value
                        ),
                        4,
                    ),

                "direction":
                    _impact_direction(
                        shap_value
                    ),
            }
        )

    sales_explanation = sorted(
        sales_explanation,

        key=lambda item:
            item[
                "absolute_impact"
            ],

        reverse=True,

    )[:5]

    # ========================================================
    # QUALITY PREDICTION
    # ========================================================

    quality_result = (
        _predict_quality_from_base_features(
            bundle,
            base_features,
        )
    )

    predicted_quality_label = (
        quality_result[
            "predicted_quality_label"
        ]
    )

    predicted_quality_probabilities = (
        quality_result[
            "predicted_quality_probabilities"
        ]
    )

    # ========================================================
    # QUALITY SHAP
    # ========================================================

    quality_explanation = (
        _get_quality_explanation(
            bundle,
            quality_explainer,
            base_features,
            predicted_quality_label,
        )
    )

    # ========================================================
    # SALES LEVEL
    # ========================================================

    level = _sales_level(
        bundle,
        predicted_sales_raw,
    )

    # ========================================================
    # MONTHLY COMPARISON
    # ========================================================

    change_pct = (
        _monthly_average_change(
            bundle,
            month,
            predicted_sales_raw,
        )
    )

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "input": {

            "year":
                year,

            "month":
                month,

            "month_name":
                MONTH_NAMES[
                    month
                ],
        },

        "predicted_sales_units":
            predicted_sales_units,

        "predicted_sales_units_raw":
            round(
                predicted_sales_raw,
                2,
            ),

        # ----------------------------------------------------
        # COFFEE QUALITY
        # ----------------------------------------------------

        "predicted_quality_label":
            predicted_quality_label,

        "predicted_quality_probabilities":
            predicted_quality_probabilities,

        # ----------------------------------------------------
        # DEMAND LEVEL
        # ----------------------------------------------------

        "sales_level":
            level,

        "sales_change_vs_monthly_average_pct":
            change_pct,

        # ----------------------------------------------------
        # WEATHER
        # ----------------------------------------------------

        "weather_profile": {

            key:
                round(
                    float(
                        value
                    ),
                    2,
                )

            for key, value
            in weather.items()
        },

        # ----------------------------------------------------
        # MODEL FEATURES
        # ----------------------------------------------------

        "model_features": {

            key:
                round(
                    float(
                        value
                    ),
                    4,
                )

            for key, value
            in base_features.items()
        },

        # ----------------------------------------------------
        # XAI
        # ----------------------------------------------------

        "xai": {

            "sales_explanation":
                sales_explanation,

            "quality_explanation":
                quality_explanation,
        },

        # ----------------------------------------------------
        # SOURCES
        # ----------------------------------------------------

        "data_sources": {

            "weather_source":
                (
                    "Monthly weather profile "
                    "saved inside the trained "
                    "model bundle"
                ),

            "previous_month_sales_source":
                previous_sales_source,

            "model_file":
                str(
                    _get_model_path()
                ),
        },

        "message": (

            f"Predicted coffee sales for "
            f"{MONTH_NAMES[month]} "
            f"{year}: "
            f"{predicted_sales_units:,} "
            f"units ({level}). "
            f"Coffee quality: "
            f"{predicted_quality_label or 'N/A'}."
        ),
    }


# ============================================================
# EXPLICIT SALES + QUALITY PREDICTION
# USED BY 12-MONTH RECURSIVE FORECAST
# ============================================================

def predict_sales_from_explicit_inputs(
    year: int,
    month: int,
    previous_sales: float,
    weather: Dict[str, float],
) -> Dict[str, Any]:

    if month < 1 or month > 12:

        raise ValueError(
            "Month must be between 1 and 12"
        )

    bundle = load_model_bundle()

    # --------------------------------------------------------
    # Build common features
    # --------------------------------------------------------

    base_features = (
        _build_base_features(
            year=year,
            month=month,
            previous_sales=previous_sales,
            weather=weather,
        )
    )

    # ========================================================
    # SALES PREDICTION
    # ========================================================

    sales_features = bundle[
        "sales_features"
    ]

    missing_features = [
        feature
        for feature in sales_features
        if feature not in base_features
    ]

    if missing_features:

        raise ValueError(
            "Missing model features for "
            "recursive forecast: "
            f"{missing_features}"
        )

    sales_input = pd.DataFrame(
        [
            {
                feature:
                    base_features[
                        feature
                    ]

                for feature
                in sales_features
            }
        ]
    )

    predicted_sales_raw = float(
        bundle[
            "sales_model"
        ].predict(
            sales_input
        )[0]
    )

    predicted_sales_units = int(
        round(
            predicted_sales_raw
        )
    )

    # ========================================================
    # COFFEE QUALITY PREDICTION
    # ========================================================

    quality_result = (
        _predict_quality_from_base_features(
            bundle,
            base_features,
        )
    )

    # ========================================================
    # RETURN
    # ========================================================

    return {

        "year":
            int(
                year
            ),

        "month":
            int(
                month
            ),

        "month_name":
            MONTH_NAMES[
                month
            ],

        "predicted_sales":
            predicted_sales_units,

        "predicted_sales_raw":
            round(
                predicted_sales_raw,
                2,
            ),

        "previous_sales_used":
            round(
                float(
                    previous_sales
                ),
                2,
            ),

        # ----------------------------------------------------
        # LOW / MEDIUM / HIGH
        # ----------------------------------------------------

        "predicted_quality_label":
            quality_result[
                "predicted_quality_label"
            ],

        # ----------------------------------------------------
        # LOW / MEDIUM / HIGH probabilities
        # ----------------------------------------------------

        "predicted_quality_probabilities":
            quality_result[
                "predicted_quality_probabilities"
            ],

        "weather_profile": {

            key:
                round(
                    float(
                        value
                    ),
                    2,
                )

            for key, value
            in weather.items()
        },
    }


# ============================================================
# RECURSIVE 12-MONTH FORECAST
# ============================================================

def forecast_next_12_months(
    start_year: int,
    start_month: int,
    actual_sales: float,
    weather_profiles: Optional[
        Dict[
            int,
            Dict[str, float],
        ]
    ] = None,
    weather_source: str = (
        "Monthly weather profile saved "
        "inside the trained model bundle"
    ),
    weather_sources: Optional[Dict[int, str]] = None,
) -> Dict[str, Any]:

    bundle = load_model_bundle()

    previous_sales = float(
        actual_sales
    )

    year = int(
        start_year
    )

    month = int(
        start_month
    )

    forecast = []

    # ========================================================
    # 12 FUTURE MONTHS
    # ========================================================

    for _ in range(
        12
    ):

        # The first iteration predicts start_year/start_month.
        # After each prediction we advance to the following month.

        # ----------------------------------------------------
        # Weather source
        # ----------------------------------------------------

        if (
            weather_profiles
            and
            month in weather_profiles
        ):

            weather = (
                weather_profiles[
                    month
                ]
            )

        else:

            weather = (
                _get_weather_profile(
                    bundle,
                    month,
                )
            )

        # ----------------------------------------------------
        # Sales + coffee quality prediction
        # ----------------------------------------------------

        result = (
            predict_sales_from_explicit_inputs(
                year=year,
                month=month,
                previous_sales=previous_sales,
                weather=weather,
            )
        )

        result[
            "weather_source"
        ] = (
            weather_sources.get(month, weather_source)
            if weather_sources
            else weather_source
        )

        forecast.append(
            result
        )

        # ----------------------------------------------------
        # RECURSIVE FORECAST
        #
        # Prediction of this month becomes
        # Prev_Month_Sales for next month.
        # ----------------------------------------------------

        previous_sales = float(
            result[
                "predicted_sales"
            ]
        )

        (
            year,
            month,
        ) = _next_year_month(
            year,
            month,
        )

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "base_period": {

            "year":
                int(start_year) - 1 if int(start_month) == 1 else int(start_year),

            "month":
                12 if int(start_month) == 1 else int(start_month) - 1,

            "month_name":
                MONTH_NAMES[12 if int(start_month) == 1 else int(start_month) - 1],

            "actual_sales":
                int(
                    round(
                        actual_sales
                    )
                ),
        },

        "forecast":
            forecast,

        "weather_source":
            weather_source,

        "message": (

            "Generated a 12-month recursive "
            "sales and coffee-quality forecast "
            "starting from "
            f"{MONTH_NAMES[int(start_month)]} "
            f"{int(start_year)}, using the previous month actual sales as the first input."
        ),
    }