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

    coffee-quality-ai-platform/
    └── models/
        └── sales_prediction/
            └── final_coffee_xai_model.pkl
    """

    current_file = Path(__file__).resolve()

    # service.py location:
    # backend/app/modules/market_suitability_prediction/service.py
    #
    # parents[0] = market_suitability_prediction
    # parents[1] = modules
    # parents[2] = app
    # parents[3] = backend
    # parents[4] = coffee-quality-ai-platform

    project_root = current_file.parents[4]

    paths: list[Path] = []

    # Optional custom model path from environment variable
    env_path = os.getenv("SALES_MODEL_PATH")

    if env_path:
        paths.append(Path(env_path))

    paths.extend(
        [
            # Main / recommended path
            project_root
            / "models"
            / "sales_prediction"
            / "final_coffee_xai_model.pkl",

            # Fallback when running from project root
            Path.cwd()
            / "models"
            / "sales_prediction"
            / "final_coffee_xai_model.pkl",

            # Fallback when running inside backend/
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
    Load the model bundle only once.

    It is reused for all API requests.
    """

    model_path = _get_model_path()

    print(
        f"Loading coffee prediction model from: {model_path}"
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
            f"Invalid model bundle. Missing keys: {missing}"
        )

    return bundle


# ============================================================
# CREATE SHAP EXPLAINERS
# ============================================================

@lru_cache(maxsize=1)
def load_xai_explainers():
    """
    Create SHAP explainers once and reuse them.
    """

    bundle = load_model_bundle()

    sales_explainer = shap.TreeExplainer(
        bundle["sales_model"]
    )

    quality_explainer = None

    if "quality_model" in bundle:
        quality_explainer = shap.TreeExplainer(
            bundle["quality_model"]
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
# WEATHER PROFILE
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
            f"Weather profile is missing month {month}"
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
                weather_row[column]
            )

        for column
        in weather_columns
    }


# ============================================================
# PREVIOUS MONTH SALES
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

    prev_year, prev_month = (
        _previous_year_month(
            year,
            month,
        )
    )


    # --------------------------------------------------------
    # Exact previous calendar month
    # --------------------------------------------------------

    exact_previous_month = training_data[
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

    if not exact_previous_month.empty:

        previous_sales = float(
            exact_previous_month.iloc[-1][
                "Coffee_Sales_Units"
            ]
        )

        source = (
            "Actual previous-month sales from "
            f"{MONTH_NAMES[prev_month]} {prev_year}"
        )

        return (
            previous_sales,
            source,
        )


    # --------------------------------------------------------
    # Historical average for previous month type
    # --------------------------------------------------------

    same_month_history = training_data[
        training_data[
            "Month_Num"
        ]
        == prev_month
    ]

    if not same_month_history.empty:

        previous_sales = float(
            same_month_history[
                "Coffee_Sales_Units"
            ].mean()
        )

        source = (
            "Average historical sales for "
            "previous month type: "
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

    sales = bundle[
        "training_data"
    ][
        "Coffee_Sales_Units"
    ]

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

    month_rows = training_data[
        training_data[
            "Month_Num"
        ]
        == month
    ]

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
# PREVIOUS MONTH VS CURRENT MONTH COMPARISON
# ============================================================

def _get_monthly_comparison(
    bundle: Dict[str, Any],
    year: int,
    month: int,
    predicted_sales: float,
):

    training_data: pd.DataFrame = (
        bundle["training_data"]
    )


    previous_year, previous_month = (
        _previous_year_month(
            year,
            month,
        )
    )


    # --------------------------------------------
    # Get previous month sales
    # --------------------------------------------

    previous_month_data = training_data[
        (
            training_data["Year"]
            == previous_year
        )
        &
        (
            training_data["Month_Num"]
            == previous_month
        )
    ]


    if not previous_month_data.empty:

        previous_sales = float(
            previous_month_data.iloc[-1][
                "Coffee_Sales_Units"
            ]
        )

        previous_source = "Actual previous month sales"


    else:

        historical_month_data = training_data[
            training_data["Month_Num"]
            ==
            previous_month
        ]


        if not historical_month_data.empty:

            previous_sales = float(
                historical_month_data[
                    "Coffee_Sales_Units"
                ].mean()
            )

            previous_source = (
                "Historical average previous month sales"
            )

        else:

            previous_sales = float(
                training_data[
                    "Coffee_Sales_Units"
                ].mean()
            )

            previous_source = (
                "Overall historical average"
            )


    # --------------------------------------------
    # Calculate difference
    # --------------------------------------------

    difference = (
        predicted_sales
        -
        previous_sales
    )


    percentage = 0


    if previous_sales != 0:

        percentage = (
            difference
            /
            previous_sales
        ) * 100



    return {


        "previous_month": {


            "month":
                MONTH_NAMES[
                    previous_month
                ],


            "year":
                previous_year,


            "sales_units":
                round(
                    previous_sales,
                    2
                )

        },


        "current_prediction": {


            "month":
                MONTH_NAMES[
                    month
                ],


            "year":
                year,


            "sales_units":
                round(
                    predicted_sales,
                    2
                )

        },


        "change": {


            "difference":
                round(
                    difference,
                    2
                ),


            "percentage":
                round(
                    percentage,
                    2
                )

        },


        "source":
            previous_source

    }


# ============================================================
# MAIN SALES + QUALITY + XAI PREDICTION
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
    # Load model bundle
    # --------------------------------------------------------

    bundle = load_model_bundle()


    # --------------------------------------------------------
    # Load SHAP explainers
    # --------------------------------------------------------

    (
        sales_explainer,
        quality_explainer,
    ) = load_xai_explainers()


    # --------------------------------------------------------
    # Get weather
    # --------------------------------------------------------

    weather = _get_weather_profile(
        bundle,
        month,
    )


    # --------------------------------------------------------
    # Get previous month sales
    # --------------------------------------------------------

    (
        previous_sales,
        previous_sales_source,
    ) = _get_previous_month_sales(
        bundle,
        year,
        month,
    )


    # ========================================================
    # BASE FEATURES
    # ========================================================

    base_features: Dict[str, float] = {

        "Year":
            float(
                year
            ),

        "Month_Num":
            float(
                month
            ),

        "Prev_Month_Sales":
            previous_sales,

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

        **weather,
    }


    # ========================================================
    # SALES INPUT
    # ========================================================

    sales_features = bundle[
        "sales_features"
    ]

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
    # SALES SHAP XAI
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
                index
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


    # strongest 5 factors

    sales_explanation = sorted(
        sales_explanation,

        key=lambda item:
            item[
                "absolute_impact"
            ],

        reverse=True,
    )[:5]


    # ========================================================
    # QUALITY DEFAULT VALUES
    # ========================================================

    predicted_quality_label: Optional[str] = None

    predicted_quality_probabilities: Optional[
        Dict[str, float]
    ] = None

    quality_explanation = None


    # ========================================================
    # QUALITY MODEL
    # ========================================================

    if all(
        key in bundle
        for key in [
            "quality_model",
            "quality_features",
            "quality_encoder",
        ]
    ):

        quality_features = bundle[
            "quality_features"
        ]


        # ----------------------------------------------------
        # QUALITY INPUT
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # QUALITY PREDICTION
        # ----------------------------------------------------

        encoded_quality = int(
            bundle[
                "quality_model"
            ].predict(
                quality_input
            )[0]
        )


        # ----------------------------------------------------
        # DECODE QUALITY LABEL
        # ----------------------------------------------------

        predicted_quality_label = str(
            bundle[
                "quality_encoder"
            ].inverse_transform(
                [
                    encoded_quality
                ]
            )[0]
        )


        # ====================================================
        # QUALITY PROBABILITIES
        # ====================================================

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

            classes = bundle[
                "quality_model"
            ].classes_

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


        # ====================================================
        # QUALITY SHAP XAI
        # ====================================================

        if quality_explainer is not None:

            quality_shap_result = (
                quality_explainer(
                    quality_input
                )
            )

            quality_explanation = []

            for index, feature in enumerate(
                quality_features
            ):

                shap_value = float(
                    quality_shap_result.values[
                        0,
                        index,
                        encoded_quality
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


            # strongest 5 quality factors

            quality_explanation = sorted(
                quality_explanation,

                key=lambda item:
                    item[
                        "absolute_impact"
                    ],

                reverse=True,
            )[:5]


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

    monthly_comparison = _get_monthly_comparison(
    bundle,
    year,
    month,
    predicted_sales_raw,
    )


    # ========================================================
    # FINAL API RESPONSE
    # ========================================================

    return {

        # ----------------------------------------------------
        # USER INPUT
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # SALES
        # ----------------------------------------------------

        "predicted_sales_units":
            predicted_sales_units,

        "predicted_sales_units_raw":
            round(
                predicted_sales_raw,
                2,
            ),


        # ----------------------------------------------------
        # QUALITY
        # ----------------------------------------------------

        "predicted_quality_label":
            predicted_quality_label,

        "predicted_quality_probabilities":
            predicted_quality_probabilities,


        # ----------------------------------------------------
        # SALES LEVEL
        # ----------------------------------------------------

        "sales_level":
            level,


        # ----------------------------------------------------
        # MONTHLY CHANGE
        # ----------------------------------------------------

        "sales_change_vs_monthly_average_pct":
        change_pct,


        "monthly_comparison":
        monthly_comparison,


        # ----------------------------------------------------
        # WEATHER
        # ----------------------------------------------------

        "weather_profile": {

            key:
                round(
                    value,
                    2,
                )

            for key, value
            in weather.items()
        },


        # ----------------------------------------------------
        # ALL FEATURES USED BY MODEL
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
        # EXPLAINABLE AI
        # ----------------------------------------------------

        "xai": {

            "sales_explanation":
                sales_explanation,

            "quality_explanation":
                quality_explanation,
        },


        # ----------------------------------------------------
        # DATA SOURCES
        # ----------------------------------------------------

        "data_sources": {

            "weather_source":
                (
                    "Monthly weather profile saved "
                    "inside the trained model bundle"
                ),

            "previous_month_sales_source":
                previous_sales_source,

            "model_file":
                str(
                    _get_model_path()
                ),
        },


        # ----------------------------------------------------
        # MESSAGE
        # ----------------------------------------------------

        "message": (

            f"Predicted coffee sales for "
            f"{MONTH_NAMES[month]} {year}: "
            f"{predicted_sales_units:,} units "
            f"({level})."
        ),
    }