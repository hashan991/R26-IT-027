from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# =========================================================
# SINGLE DEFECT-DRIVEN BATCH USAGE RECOMMENDATION
# =========================================================

class BatchUsageDefectRecommendation(BaseModel):

    defect: Literal[
        "MQ2_ABNORMAL",
        "MQ3_ABNORMAL",
        "MQ135_ABNORMAL",
        "MOISTURE_DEFECT",
        "TEMPERATURE_ABNORMAL",
        "HUMIDITY_ABNORMAL",
        "BROKEN_BEANS",
        "BLACK_BEANS",
    ]

    recommendation: Literal[
        "SORT_AND_USE",
        "STABILIZE_AND_REASSESS",
        "CONDITION_AND_REASSESS",
        "HOLD_AND_STABILIZE",
        "HOLD_FOR_VERIFICATION",
    ]

    title: str

    explanation: str

    required_action: str

    evidence_class: Literal[
        "STANDARD_DIRECT",
        "STANDARD_SUPPORTED_RESEARCH_RULE",
        "SENSOR_TECHNICAL_RULE",
    ]

    detected_count: Optional[int] = Field(
        default=None,
        ge=0,
    )


# =========================================================
# LEGACY / FRONTEND COMPATIBILITY OPTION
# =========================================================
#
# Older frontend/report code may still expect usage_options.
# The new defect-driven Module 4 does NOT assign arbitrary
# premium/economy product tiers. This model is retained only
# so existing imports and rendering logic do not break.
#
# =========================================================

class BatchUsageOption(BaseModel):

    use_case: str

    suitability: Literal[
        "SUITABLE",
        "CONDITIONAL",
        "NOT_RECOMMENDED",
    ]

    explanation: str

    conditions: List[str] = Field(
        default_factory=list
    )


# Optional compatibility alias for older imports.
UsageOption = BatchUsageOption


# =========================================================
# MODULE 4 RESPONSE
# =========================================================

class BatchUsageRecommendation(BaseModel):

    module: Literal[
        "BATCH_USAGE_RECOMMENDATION"
    ] = "BATCH_USAGE_RECOMMENDATION"

    # -----------------------------------------------------
    # OVERALL RECOMMENDATION
    # -----------------------------------------------------
    #
    # Research-defined aggregation order:
    #
    # INSPECTION_REQUIRED
    #       >
    # HOLD_FOR_VERIFICATION
    #       >
    # HOLD_AND_STABILIZE
    #       >
    # CONDITION_AND_REASSESS
    #       >
    # STABILIZE_AND_REASSESS
    #       >
    # SORT_AND_USE
    #       >
    # DIRECT_USE
    #
    # -----------------------------------------------------

    primary_recommendation: Literal[
        "DIRECT_USE",
        "SORT_AND_USE",
        "STABILIZE_AND_REASSESS",
        "CONDITION_AND_REASSESS",
        "HOLD_AND_STABILIZE",
        "HOLD_FOR_VERIFICATION",
        "INSPECTION_REQUIRED",
    ]

    title: str

    summary: str

    recommended_use: str

    # Every active defect keeps its own recommendation.
    recommendations: List[
        BatchUsageDefectRecommendation
    ] = Field(
        default_factory=list
    )

    active_defect_count: int = Field(
        default=0,
        ge=0,
    )

    inspection_complete: bool = True

    # -----------------------------------------------------
    # ACTION FLAGS
    # -----------------------------------------------------

    direct_use_allowed: bool = False

    sorting_required: bool = False

    stabilization_required: bool = False

    conditioning_required: bool = False

    verification_required: bool = False

    reinspection_required: bool = False

    rework_required: bool = False

    # The new Module 4 does not make blend allocation
    # decisions. Kept only for backward compatibility.
    blend_evaluation_required: bool = False

    # -----------------------------------------------------
    # COMPATIBILITY / EXPLAINABILITY FIELDS
    # -----------------------------------------------------

    alternative_uses: List[str] = Field(
        default_factory=list
    )

    usage_options: List[
        BatchUsageOption
    ] = Field(
        default_factory=list
    )

    restrictions: List[str] = Field(
        default_factory=list
    )

    good_percentage: float = 0.0

    broken_percentage: float = 0.0

    severe_defect_percentage: float = 0.0

    unknown_percentage: float = 0.0

    # Overall status/grade fields are intentionally not used
    # by the new rule engine. They are retained only so older
    # frontend code that reads them does not fail.
    sensor_status: str = "DEFECT_DRIVEN"

    physical_status: str = "DEFECT_DRIVEN"

    final_grade: str = "NOT_USED"

    methodology_note: str
