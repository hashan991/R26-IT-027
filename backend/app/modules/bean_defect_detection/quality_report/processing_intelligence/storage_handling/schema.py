from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# =========================================================
# SINGLE STORAGE / HANDLING RECOMMENDATION
# =========================================================

class StorageHandlingItem(BaseModel):

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

    priority: Literal[
        "CRITICAL",
        "HIGH",
        "MEDIUM",
        "LOW",
    ]

    status: Literal[
        "ISOLATE_AND_VERIFY",
        "CLEAN_STORAGE_REQUIRED",
        "HOLD_FOR_MOISTURE_VERIFICATION",
        "STABILIZE_ENVIRONMENT",
        "DRY_STORAGE_REQUIRED",
        "HANDLE_WITH_CARE",
        "SEGREGATE_REJECTS",
    ]

    title: str

    recommendation: str

    reason: str

    evidence_class: Literal[
        "STANDARD_DIRECT",
        "STANDARD_SUPPORTED_RESEARCH_RULE",
        "SENSOR_TECHNICAL_RULE",
    ]

    # Short source identifiers are returned so the report can
    # show which technical/standards basis supports the rule.
    source_basis: List[str] = Field(
        default_factory=list
    )

    detected_count: Optional[int] = Field(
        default=None,
        ge=0,
    )


# =========================================================
# MODULE 6 RESPONSE
# =========================================================

class StorageHandlingRecommendation(BaseModel):

    module: Literal[
        "STORAGE_AND_HANDLING_RECOMMENDATION"
    ] = "STORAGE_AND_HANDLING_RECOMMENDATION"

    overall_status: Literal[
        "NORMAL_STORAGE",
        "ACTION_REQUIRED",
        "HOLD_AND_PROTECT",
        "INSPECTION_REQUIRED",
    ]

    title: str

    summary: str

    recommendations: List[
        StorageHandlingItem
    ] = Field(
        default_factory=list
    )

    total_recommendations: int = Field(
        default=0,
        ge=0,
    )

    active_defect_count: int = Field(
        default=0,
        ge=0,
    )

    inspection_complete: bool = True

    requires_isolation: bool = False

    requires_dry_storage: bool = False

    requires_environment_stabilization: bool = False

    requires_retest: bool = False

    requires_gentle_handling: bool = False

    requires_reject_segregation: bool = False

    methodology_note: str
