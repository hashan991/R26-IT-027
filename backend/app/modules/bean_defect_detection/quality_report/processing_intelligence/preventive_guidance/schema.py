from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# =========================================================
# SINGLE PREVENTIVE PROCESS GUIDANCE ITEM
# =========================================================

class PreventiveGuidanceItem(BaseModel):

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

    process_area: Literal[
        "STORAGE_ENVIRONMENT_CONTROL",
        "FERMENTATION_CONTROL",
        "STORAGE_CONTAMINATION_CONTROL",
        "DRYING_PROCESS_CONTROL",
        "TEMPERATURE_CONTROL",
        "HUMIDITY_AND_STORAGE_CONTROL",
        "PULPING_AND_HULLING_CONTROL",
        "HARVEST_AND_POST_HARVEST_CONTROL",
    ]

    title: str

    guidance: str

    prevention_goal: str

    # This module is explicitly about preventing recurrence
    # in future batches, not correcting the current batch.
    applies_to_future_batches: bool = True

    evidence_class: Literal[
        "CREDIBLE_SOURCE_DIRECT",
        "STANDARD_SUPPORTED_RESEARCH_RULE",
        "SENSOR_TECHNICAL_RULE",
    ]

    evidence_basis: List[str] = Field(
        default_factory=list
    )

    detected_count: Optional[int] = Field(
        default=None,
        ge=0,
    )


# =========================================================
# MODULE 7 RESPONSE
# =========================================================

class PreventiveProcessGuidance(BaseModel):

    module: Literal[
        "PREVENTIVE_PROCESS_GUIDANCE"
    ] = "PREVENTIVE_PROCESS_GUIDANCE"

    title: str

    summary: str

    total_guidance_items: int = Field(
        default=0,
        ge=0,
    )

    guidance: List[
        PreventiveGuidanceItem
    ] = Field(
        default_factory=list
    )

    active_defect_count: int = Field(
        default=0,
        ge=0,
    )

    inspection_complete: bool = True

    methodology_note: str
