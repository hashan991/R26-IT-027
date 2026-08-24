from typing import List, Literal

from pydantic import BaseModel


# =========================================================
# RISK LEVEL TYPE
# =========================================================

RiskLevel = Literal[
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
]


# =========================================================
# INDIVIDUAL ROAST RISK
# =========================================================

class RoastRiskItem(BaseModel):

    risk_name: str

    risk_level: RiskLevel

    risk_score: float

    explanation: str

    drivers: List[str]


# =========================================================
# COMPLETE ROAST QUALITY RISK RESPONSE
# =========================================================

class RoastQualityRisk(BaseModel):

    overall_risk: RiskLevel

    overall_risk_score: float

    title: str

    summary: str

    # -----------------------------------------------------
    # DEFECT PROFILE USED FOR RISK ANALYSIS
    # -----------------------------------------------------

    broken_percentage: float

    severe_defect_percentage: float

    unknown_percentage: float

    # -----------------------------------------------------
    # INDIVIDUAL RISKS
    # -----------------------------------------------------

    risks: List[RoastRiskItem]

    # -----------------------------------------------------
    # SENSOR EFFECT
    # -----------------------------------------------------

    sensor_status: str

    sensor_risk_contribution: float

    # -----------------------------------------------------
    # DECISION SUPPORT
    # -----------------------------------------------------

    requires_corrective_action: bool

    recommended_controls: List[str]

    methodology_note: str