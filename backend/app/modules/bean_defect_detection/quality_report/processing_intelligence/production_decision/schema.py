from typing import List, Literal

from pydantic import BaseModel


# =========================================================
# PRODUCTION DECISION TYPES
# =========================================================

ProductionDecisionCode = Literal[
    "RELEASE_FOR_ROASTING",
    "RE_SORT_AND_RE_TEST",
    "HOLD_FOR_INSPECTION",
    "REWORK_AND_REASSESS",
    "EVALUATE_FOR_COMMERCIAL_USE",
    "REJECT_BATCH",
]


ProductionStatus = Literal[
    "READY",
    "CONDITIONAL",
    "HOLD",
    "REWORK",
    "REJECTED",
]


ProductionStage = Literal[
    "ROASTING",
    "SECONDARY_SORTING",
    "QUALITY_REINSPECTION",
    "MANUAL_INSPECTION",
    "REWORK",
    "PRODUCT_ALLOCATION",
    "REJECT_HANDLING",
]


ActionPriority = Literal[
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
]


# =========================================================
# PRODUCTION ACTION
# =========================================================

class ProductionAction(BaseModel):

    step_number: int

    title: str

    description: str

    stage: ProductionStage

    priority: ActionPriority

    required: bool


# =========================================================
# DECISION SOURCE SUMMARY
# =========================================================

class ProductionDecisionEvidence(BaseModel):

    roasting_eligibility: str

    roast_risk: str

    pre_roast_readiness: str

    batch_usage_recommendation: str

    yield_status: str

    recovery_potential: str


# =========================================================
# COMPLETE PRODUCTION DECISION
# =========================================================

class ProductionDecision(BaseModel):

    decision: ProductionDecisionCode

    production_status: ProductionStatus

    title: str

    summary: str

    immediate_action: str

    next_stage: ProductionStage

    # -----------------------------------------------------
    # RELEASE CONTROL
    # -----------------------------------------------------

    can_proceed_to_roasting: bool

    release_authorized: bool

    batch_hold_required: bool

    rework_required: bool

    reinspection_required: bool

    manual_review_required: bool


    # -----------------------------------------------------
    # DECISION EXPLANATION
    # -----------------------------------------------------

    decision_reasons: List[str]

    required_actions: List[
        ProductionAction
    ]

    release_conditions: List[str]


    # -----------------------------------------------------
    # INPUT EVIDENCE
    # -----------------------------------------------------

    evidence: ProductionDecisionEvidence


    # -----------------------------------------------------
    # FINAL PRODUCT DIRECTION
    # -----------------------------------------------------

    recommended_product_direction: str

    disposition_note: str

    methodology_note: str