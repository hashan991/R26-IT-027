from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# =========================================================
# SINGLE PRE-ROAST CORRECTIVE ACTION
# =========================================================

class PreRoastCorrectiveAction(BaseModel):

    step_number: int = Field(
        ge=1,
    )

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

    title: str

    description: str

    action_type: Literal[
        "HOLD_AND_VERIFY",
        "INSPECT_AND_RETEST",
        "VERIFY_AND_CORRECT_MOISTURE",
        "STABILIZE_ENVIRONMENT",
        "CONTROL_HUMIDITY",
        "SECONDARY_SORT",
        "REMOVE_AND_SEGREGATE",
    ]

    # Priority levels are research-defined workflow priorities.
    priority: Literal[
        "CRITICAL",
        "HIGH",
        "MEDIUM",
        "LOW",
    ]

    required: bool = True

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
# BACKWARD-COMPATIBILITY ALIAS
# =========================================================
#
# Existing pre_roast_plan/__init__.py and possibly other
# legacy modules still import:
#
#     PreRoastAction
#
# Module 2 renamed that model to:
#
#     PreRoastCorrectiveAction
#
# Keep this alias during the migration so old imports do not
# break while the new defect-driven architecture is adopted.
#
# =========================================================

PreRoastAction = PreRoastCorrectiveAction


# =========================================================
# MODULE 2 RESPONSE
# =========================================================
#
# Class name PreRoastPlan is intentionally retained because
# existing processing-intelligence and production-decision
# code imports this model.
#
# The module itself now represents:
#
#     PRE-ROAST CORRECTIVE ACTIONS
#
# =========================================================

class PreRoastPlan(BaseModel):

    module: Literal[
        "PRE_ROAST_CORRECTIVE_ACTIONS"
    ] = "PRE_ROAST_CORRECTIVE_ACTIONS"

    # Compatibility values used by the current
    # production_decision service.
    readiness_status: Literal[
        "READY",
        "READY_AFTER_PREPARATION",
        "INSPECTION_REQUIRED",
    ]

    title: str

    summary: str

    total_actions: int = Field(
        default=0,
        ge=0,
    )

    mandatory_actions: int = Field(
        default=0,
        ge=0,
    )

    actions: List[
        PreRoastCorrectiveAction
    ] = Field(
        default_factory=list
    )

    reinspection_required: bool = False

    sensor_retest_required: bool = False

    physical_retest_required: bool = False

    manual_inspection_required: bool = False

    severe_defect_removal_required: bool = False

    broken_sorting_required: bool = False

    estimated_preparation_level: Literal[
        "MINIMAL",
        "MODERATE",
        "EXTENSIVE",
        "CRITICAL",
    ] = "MINIMAL"

    active_defect_count: int = Field(
        default=0,
        ge=0,
    )

    inspection_complete: bool = True

    methodology_note: str
