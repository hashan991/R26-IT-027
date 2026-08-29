from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# =========================================================
# SINGLE DEFECT-DRIVEN ROAST QUALITY RISK
# =========================================================

class RoastQualityRiskItem(BaseModel):

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

    risk_name: str

    # Severity labels are research-defined workflow labels.
    risk_level: Literal[
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    ]

    # Numeric display score mapped from the categorical
    # severity. It is NOT a probability of roast failure.
    risk_score: float = Field(
        ge=0.0,
        le=100.0,
    )

    explanation: str

    drivers: List[str] = Field(
        default_factory=list
    )

    recommended_control: str

    evidence_class: Literal[
        "STANDARD_DIRECT",
        "STANDARD_SUPPORTED_RESEARCH_RULE",
        "SENSOR_TECHNICAL_RULE",
    ]

    source_basis: List[str] = Field(
        default_factory=list
    )

    detected_count: Optional[int] = Field(
        default=None,
        ge=0,
    )


# =========================================================
# BACKWARD-COMPATIBILITY ALIASES
# =========================================================
#
# Different earlier project revisions may import one of
# these names from roast_quality_risk.schema.
#
# They all point to the new defect-driven risk item model.
#
# =========================================================

RoastRisk = RoastQualityRiskItem
RoastRiskItem = RoastQualityRiskItem
RoastRiskFactor = RoastQualityRiskItem
RiskItem = RoastQualityRiskItem


# =========================================================
# MODULE 3 - ROAST QUALITY RISKS RESPONSE
# =========================================================

class RoastQualityRisk(BaseModel):

    module: Literal[
        "ROAST_QUALITY_RISKS"
    ] = "ROAST_QUALITY_RISKS"

    # Highest active defect-risk severity.
    overall_risk: Literal[
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    ]

    # Highest research-defined categorical display score.
    # NOT a validated probability or official standard score.
    overall_risk_score: float = Field(
        ge=0.0,
        le=100.0,
    )

    title: str

    summary: str

    risks: List[
        RoastQualityRiskItem
    ] = Field(
        default_factory=list
    )

    active_risk_count: int = Field(
        default=0,
        ge=0,
    )

    active_defect_count: int = Field(
        default=0,
        ge=0,
    )

    inspection_complete: bool = True

    # -----------------------------------------------------
    # COMPATIBILITY / TRANSPARENCY FIELDS
    # -----------------------------------------------------

    # Recommendation physical counts overlap because
    # black-and-broken contributes to both black and broken.
    broken_percentage: float = 0.0

    severe_defect_percentage: float = 0.0

    # Unknown is intentionally not an active Processing
    # Intelligence defect. Retained only for existing UI
    # compatibility.
    unknown_percentage: float = 0.0

    # Old UI/API compatibility field. Module 3 no longer
    # uses an overall sensor-status trigger.
    sensor_status: str = "DEFECT_DRIVEN"

    # Highest active sensor-risk display score.
    sensor_risk_contribution: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
    )

    requires_corrective_action: bool = False

    recommended_controls: List[str] = Field(
        default_factory=list
    )

    methodology_note: str
