from typing import List, Literal, Optional

from pydantic import BaseModel


# =========================================================
# USABLE YIELD RESPONSE
# =========================================================

class UsableYield(BaseModel):

    # -----------------------------------------------------
    # GENERAL
    # -----------------------------------------------------

    yield_basis: Literal[
        "COUNT_BASED",
    ]

    title: str

    summary: str


    # -----------------------------------------------------
    # ORIGINAL SAMPLE
    # -----------------------------------------------------

    total_beans: int


    # -----------------------------------------------------
    # STRICT CLEAN YIELD
    #
    # Only beans classified as GOOD.
    # -----------------------------------------------------

    clean_good_count: int

    clean_good_percentage: float


    # -----------------------------------------------------
    # SEVERE REJECT PORTION
    #
    # Black + Black-and-Broken
    # -----------------------------------------------------

    severe_reject_count: int

    severe_reject_percentage: float


    # -----------------------------------------------------
    # RECOVERABLE PORTION
    #
    # Total - severe reject
    #
    # Includes:
    # good + broken + unknown
    #
    # Broken / unknown still require further handling.
    # -----------------------------------------------------

    potential_recoverable_count: int

    potential_recoverable_percentage: float


    # -----------------------------------------------------
    # CONDITIONAL PORTION
    # -----------------------------------------------------

    broken_count: int

    broken_percentage: float

    unknown_count: int

    unknown_percentage: float


    # -----------------------------------------------------
    # YIELD ASSESSMENT
    # -----------------------------------------------------

    yield_status: Literal[
        "HIGH",
        "MODERATE",
        "LOW",
        "CRITICAL",
        "NO_DATA",
    ]

    recovery_potential: Literal[
        "HIGH",
        "MEDIUM",
        "LOW",
        "NONE",
        "UNKNOWN",
    ]


    # -----------------------------------------------------
    # ACTION FLAGS
    # -----------------------------------------------------

    sorting_required: bool

    severe_defect_removal_required: bool

    manual_review_required: bool


    # -----------------------------------------------------
    # WEIGHT-BASED YIELD
    #
    # Not calculated yet because the current load-cell
    # measurement is not scientifically calibrated for
    # yield estimation.
    # -----------------------------------------------------

    weight_based_yield_available: bool

    input_weight_grams: Optional[float] = None

    estimated_usable_weight_grams: Optional[float] = None

    estimated_reject_weight_grams: Optional[float] = None


    # -----------------------------------------------------
    # SUPPORTING INFORMATION
    # -----------------------------------------------------

    interpretation: List[str]

    methodology_note: str