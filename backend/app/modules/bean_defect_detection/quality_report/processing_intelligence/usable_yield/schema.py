from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# =========================================================
# MODULE 5 - USABLE YIELD ESTIMATION
# =========================================================
#
# IMPORTANT DESIGN RULE:
#
# Module 5 keeps the four original physical AI categories
# separate:
#
#   good
#   broken
#   black
#   black_and_broken
#
# Unlike recommendation Modules 1, 2, 3, 4, 6 and 7,
# black_and_broken is NOT merged into broken or black here.
#
# =========================================================

class UsableYield(BaseModel):

    module: Literal[
        "USABLE_YIELD_ESTIMATION"
    ] = "USABLE_YIELD_ESTIMATION"

    # Count-based only.
    yield_basis: Literal[
        "COUNT_BASED_CLASSIFIED_BEANS",
        "NO_DATA",
    ]

    title: str

    summary: str

    # -----------------------------------------------------
    # SAMPLE SIZE / CLASSIFICATION COVERAGE
    # -----------------------------------------------------

    # Total reported by the physical inspection.
    # This may include unknown / unclassified beans.
    total_beans: int = Field(
        default=0,
        ge=0,
    )

    # Only:
    # good + broken + black + black_and_broken
    classified_total_beans: int = Field(
        default=0,
        ge=0,
    )

    classification_coverage_percentage: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
    )

    # -----------------------------------------------------
    # ORIGINAL PHYSICAL AI CATEGORIES
    # -----------------------------------------------------

    good_count: int = Field(
        default=0,
        ge=0,
    )

    broken_count: int = Field(
        default=0,
        ge=0,
    )

    black_count: int = Field(
        default=0,
        ge=0,
    )

    black_and_broken_count: int = Field(
        default=0,
        ge=0,
    )

    unknown_count: int = Field(
        default=0,
        ge=0,
    )

    good_percentage: float = 0.0

    broken_percentage: float = 0.0

    black_percentage: float = 0.0

    black_and_broken_percentage: float = 0.0

    unknown_percentage: float = 0.0

    # -----------------------------------------------------
    # CANONICAL MODULE 5 OUTPUTS
    # -----------------------------------------------------
    #
    # Clean Usable:
    #     good
    #
    # Potential Recoverable:
    #     good + broken
    #
    # Severe Reject:
    #     black + black_and_broken
    #
    # Potential Recoverable and Severe Reject partition the
    # classified sample.
    #
    # Clean Usable is a subset of Potential Recoverable.
    #
    # -----------------------------------------------------

    clean_usable_count: int = Field(
        default=0,
        ge=0,
    )

    clean_usable_percentage: float = 0.0

    potential_recoverable_count: int = Field(
        default=0,
        ge=0,
    )

    potential_recoverable_percentage: float = 0.0

    severe_reject_count: int = Field(
        default=0,
        ge=0,
    )

    severe_reject_percentage: float = 0.0

    # -----------------------------------------------------
    # BACKWARD-COMPATIBILITY FIELDS
    # -----------------------------------------------------
    #
    # Existing UI versions may still read clean_good_*.
    #
    # -----------------------------------------------------

    clean_good_count: int = Field(
        default=0,
        ge=0,
    )

    clean_good_percentage: float = 0.0

    # No arbitrary HIGH / MEDIUM / LOW percentage thresholds
    # are used in the new Module 5.
    yield_status: Literal[
        "ESTIMATED",
        "NO_DATA",
    ]

    # Broken beans create recoverable-sorting potential.
    # This is descriptive, not a commercial acceptance grade.
    recovery_potential: Literal[
        "PRESENT",
        "NONE",
        "NO_DATA",
    ]

    sorting_required: bool = False

    severe_defect_removal_required: bool = False

    manual_review_required: bool = False

    # -----------------------------------------------------
    # SAMPLE WEIGHT
    # -----------------------------------------------------
    #
    # Sample weight may be displayed as contextual metadata,
    # but count fractions are NOT converted into grams because
    # bean-count share is not a validated mass-share method.
    #
    # -----------------------------------------------------

    input_weight_grams: Optional[float] = Field(
        default=None,
        ge=0.0,
    )

    weight_calibrated: bool = False

    weight_based_yield_available: bool = False

    estimated_usable_weight_grams: Optional[float] = None

    estimated_reject_weight_grams: Optional[float] = None

    interpretation: List[str] = Field(
        default_factory=list
    )

    methodology_note: str
