from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# =========================================================
# SINGLE DEFECT READINESS TRIGGER
# =========================================================

class RoastingReadinessTrigger(BaseModel):

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

    readiness: Literal[
        "READY",
        "CONDITIONAL",
        "NOT_READY",
    ]

    title: str

    reason: str

    required_action: str

    evidence_class: Literal[
        "STANDARD_DIRECT",
        "STANDARD_SUPPORTED_RESEARCH_RULE",
        "SENSOR_TECHNICAL_RULE",
        "RESEARCH_DEFINED_AGGREGATION",
    ]

    detected_count: Optional[int] = Field(
        default=None,
        ge=0,
    )


# =========================================================
# ROASTING READINESS RECOMMENDATION RESPONSE
# =========================================================

class RoastingRecommendation(BaseModel):

    module: Literal[
        "ROASTING_READINESS_RECOMMENDATION"
    ] = "ROASTING_READINESS_RECOMMENDATION"

    # New canonical readiness field.
    readiness_status: Literal[
        "READY",
        "CONDITIONAL",
        "NOT_READY",
    ]

    # Compatibility field retained for the existing frontend.
    roasting_eligibility: Literal[
        "READY",
        "CONDITIONAL",
        "NOT_RECOMMENDED",
    ]

    direct_roasting_allowed: bool

    # Kept as string so the new rule engine can use
    # descriptive directions without inventing roast curves.
    recommended_direction: str

    title: str

    summary: str

    # Every active defect produces its own trigger.
    triggers: List[
        RoastingReadinessTrigger
    ] = Field(
        default_factory=list
    )

    active_defect_count: int = Field(
        default=0,
        ge=0,
    )

    # Compatibility / explainability fields.
    reasons: List[str] = Field(
        default_factory=list
    )

    prerequisites: List[str] = Field(
        default_factory=list
    )

    warnings: List[str] = Field(
        default_factory=list
    )

    # These are retained for the current UI.
    # Recommendation physical counts can overlap because
    # black-and-broken contributes to both black and broken.
    broken_percentage: float = 0.0

    severe_defect_percentage: float = 0.0

    # Unknown is not a Processing Intelligence defect.
    # Field retained temporarily for frontend compatibility.
    unknown_percentage: float = 0.0

    inspection_complete: bool = True

    methodology_note: str
