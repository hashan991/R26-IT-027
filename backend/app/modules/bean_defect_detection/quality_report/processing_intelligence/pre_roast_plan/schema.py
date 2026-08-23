from typing import List, Literal

from pydantic import BaseModel


# =========================================================
# PRE-ROAST ACTION ITEM
# =========================================================

class PreRoastAction(BaseModel):

    step_number: int

    title: str

    description: str

    action_type: Literal[
        "SORT",
        "REMOVE",
        "INSPECT",
        "RETEST",
        "CLEAN",
        "HOLD",
        "RELEASE",
    ]

    priority: Literal[
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    ]

    required: bool


# =========================================================
# PRE-ROAST PLAN RESPONSE
# =========================================================

class PreRoastPlan(BaseModel):

    readiness_status: Literal[
        "READY",
        "READY_AFTER_PREPARATION",
        "NOT_READY",
        "INSPECTION_REQUIRED",
    ]

    title: str

    summary: str

    total_actions: int

    mandatory_actions: int

    actions: List[PreRoastAction]

    reinspection_required: bool

    sensor_retest_required: bool

    physical_retest_required: bool

    manual_inspection_required: bool

    severe_defect_removal_required: bool

    broken_sorting_required: bool

    estimated_preparation_level: Literal[
        "MINIMAL",
        "MODERATE",
        "EXTENSIVE",
        "CRITICAL",
    ]

    methodology_note: str