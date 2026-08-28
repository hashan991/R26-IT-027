from typing import List, Literal

from pydantic import BaseModel


# =========================================================
# ROASTING RECOMMENDATION RESPONSE
# =========================================================

class RoastingRecommendation(BaseModel):

    # Can the current batch proceed toward roasting?
    roasting_eligibility: Literal[
        "READY",
        "CONDITIONAL",
        "NOT_RECOMMENDED",
    ]

    # Is direct roasting allowed without another QC action?
    direct_roasting_allowed: bool

    # High-level roasting direction.
    #
    # We intentionally avoid exact temperature/time values
    # because the current system does not yet use enough
    # roasting-specific variables such as density, variety,
    # origin, processing method, and roaster characteristics.
    recommended_direction: Literal[
        "STANDARD_ROASTING",
        "CONTROLLED_ROASTING",
        "RE_SORT_BEFORE_ROASTING",
        "RE_INSPECT_BEFORE_ROASTING",
        "DO_NOT_ROAST",
    ]

    # Human-readable recommendation title.
    title: str

    # Short overall explanation.
    summary: str

    # Main reasons that produced the recommendation.
    reasons: List[str]

    # Actions that must be completed before roasting.
    prerequisites: List[str]

    # Additional quality warnings.
    warnings: List[str]

    # Useful calculated values for transparency.
    broken_percentage: float

    severe_defect_percentage: float

    unknown_percentage: float

    # Research transparency note.
    methodology_note: str