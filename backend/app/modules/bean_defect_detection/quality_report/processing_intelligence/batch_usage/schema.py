from typing import List, Literal

from pydantic import BaseModel


# =========================================================
# BATCH USAGE SUITABILITY
# =========================================================

UsageSuitability = Literal[
    "SUITABLE",
    "CONDITIONAL",
    "NOT_RECOMMENDED",
]


# =========================================================
# INDIVIDUAL BATCH USAGE OPTION
# =========================================================

class BatchUsageOption(BaseModel):

    use_case: str

    suitability: UsageSuitability

    explanation: str

    conditions: List[str]


# =========================================================
# COMPLETE BATCH USAGE RECOMMENDATION
# =========================================================

class BatchUsageRecommendation(BaseModel):

    # -----------------------------------------------------
    # MAIN RECOMMENDATION
    # -----------------------------------------------------

    primary_recommendation: Literal[
        "PREMIUM_EVALUATION",
        "STANDARD_PRODUCT",
        "COMMERCIAL_BLEND",
        "ECONOMY_PRODUCT",
        "REWORK_ONLY",
        "INSPECTION_REQUIRED",
        "REJECT",
    ]

    title: str

    summary: str

    recommended_use: str

    alternative_uses: List[str]

    # -----------------------------------------------------
    # USAGE OPTIONS
    # -----------------------------------------------------

    usage_options: List[
        BatchUsageOption
    ]

    # -----------------------------------------------------
    # PROCESS REQUIREMENTS
    # -----------------------------------------------------

    direct_use_allowed: bool

    rework_required: bool

    sorting_required: bool

    reinspection_required: bool

    blend_evaluation_required: bool

    # -----------------------------------------------------
    # QUALITY PROFILE
    # -----------------------------------------------------

    good_percentage: float

    broken_percentage: float

    severe_defect_percentage: float

    unknown_percentage: float

    sensor_status: str

    physical_status: str

    final_grade: str

    # -----------------------------------------------------
    # RESTRICTIONS
    # -----------------------------------------------------

    restrictions: List[str]

    methodology_note: str