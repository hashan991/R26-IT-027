from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from .processing_intelligence.schema import (
    ProcessingIntelligence,
)

from pydantic import (
    AliasChoices,
    BaseModel,
    ConfigDict,
    Field,
)


# =========================================================
# BASE MODEL
# =========================================================
#
# Frontend / AI response eke additional fields තිබුණත්
# validation error ekak enna epa.
#
# =========================================================

class FlexibleModel(BaseModel):
    model_config = ConfigDict(
        extra="allow",
        populate_by_name=True,
    )


# =========================================================
# SENSOR RAW READINGS
# =========================================================

class SensorReadings(FlexibleModel):
    mq2: Optional[float] = None

    mq3: Optional[float] = None

    mq135: Optional[float] = None

    moisture: Optional[float] = None

    temperature: Optional[float] = None

    humidity: Optional[float] = None


# =========================================================
# SINGLE SENSOR COMPARISON
# =========================================================
#
# Example:
#
# MQ-2
# baseline       = 232
# sample         = 261
# recovery       = 235
# response       = +29
# recovery_error = +3
#
# =========================================================

class SensorComparisonValue(FlexibleModel):
    baseline: Optional[float] = None

    sample: Optional[float] = None

    recovery: Optional[float] = None

    response: Optional[float] = None

    recovery_error: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices(
            "recovery_error",
            "recoveryError",
        ),
    )


# =========================================================
# SENSOR COMPARISON COLLECTION
# =========================================================

class SensorComparison(FlexibleModel):
    mq2: Optional[SensorComparisonValue] = None

    mq3: Optional[SensorComparisonValue] = None

    mq135: Optional[SensorComparisonValue] = None

    moisture: Optional[SensorComparisonValue] = None

    temperature: Optional[SensorComparisonValue] = None

    humidity: Optional[SensorComparisonValue] = None


# =========================================================
# SENSOR RESULT INPUT
# =========================================================
#
# Step 1 frontend result me model ekata enawa.
#
# Both snake_case and camelCase fields support karanawa.
#
# =========================================================

class SensorResultInput(FlexibleModel):
    skipped: bool = False


    # -----------------------------------------------------
    # CURRENT / FINAL READINGS
    # -----------------------------------------------------

    readings: Optional[SensorReadings] = None


    # -----------------------------------------------------
    # OPTIONAL BASELINE / SAMPLE / RECOVERY READINGS
    # -----------------------------------------------------

    baseline: Optional[SensorReadings] = None

    sample: Optional[SensorReadings] = None

    recovery: Optional[SensorReadings] = None


    # -----------------------------------------------------
    # SENSOR COMPARISON DATA
    # -----------------------------------------------------

    comparison: Optional[SensorComparison] = None


    # -----------------------------------------------------
    # OLD / TEMPORARY FRONTEND SCORE
    #
    # Backend service.py final score eka recalculate karanawa.
    # -----------------------------------------------------

    sensor_score: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices(
            "sensor_score",
            "sensorScore",
        ),
    )


    # -----------------------------------------------------
    # EXISTING SENSOR FINDINGS
    # -----------------------------------------------------

    findings: List[str] = Field(
        default_factory=list,
    )


    # -----------------------------------------------------
    # DEVICE INFORMATION
    # -----------------------------------------------------

    device: Dict[str, Any] = Field(
        default_factory=dict,
    )


    # -----------------------------------------------------
    # STABILITY INFORMATION
    # -----------------------------------------------------

    stability: Dict[str, Any] = Field(
        default_factory=dict,
    )


    # -----------------------------------------------------
    # SENSOR LOCKED TIME
    # -----------------------------------------------------

    locked_at: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices(
            "locked_at",
            "lockedAt",
        ),
    )


    # -----------------------------------------------------
    # DATA COLLECTION TIME
    # -----------------------------------------------------

    collected_at: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices(
            "collected_at",
            "collectedAt",
        ),
    )


# =========================================================
# PHYSICAL AI RESULT INPUT
# =========================================================

class PhysicalResultInput(FlexibleModel):

    # -----------------------------------------------------
    # TOTAL BEANS
    # -----------------------------------------------------

    total_beans: Optional[int] = Field(
        default=None,
        validation_alias=AliasChoices(
            "total_beans",
            "totalBeans",
        ),
    )


    # -----------------------------------------------------
    # GOOD BEANS
    # -----------------------------------------------------

    good_count: Optional[int] = Field(
        default=None,
        validation_alias=AliasChoices(
            "good_count",
            "goodCount",
        ),
    )


    # -----------------------------------------------------
    # BROKEN BEANS
    # -----------------------------------------------------

    broken_count: Optional[int] = Field(
        default=None,
        validation_alias=AliasChoices(
            "broken_count",
            "brokenCount",
        ),
    )


    # -----------------------------------------------------
    # BLACK BEANS
    # -----------------------------------------------------

    black_count: Optional[int] = Field(
        default=None,
        validation_alias=AliasChoices(
            "black_count",
            "blackCount",
        ),
    )


    # -----------------------------------------------------
    # BLACK + BROKEN BEANS
    # -----------------------------------------------------

    black_and_broken_count: Optional[int] = Field(
        default=None,
        validation_alias=AliasChoices(
            "black_and_broken_count",
            "blackAndBrokenCount",
        ),
    )


    # -----------------------------------------------------
    # UNKNOWN
    # -----------------------------------------------------

    unknown_count: Optional[int] = Field(
        default=None,
        validation_alias=AliasChoices(
            "unknown_count",
            "unknownCount",
        ),
    )


    # -----------------------------------------------------
    # DEFECT COUNTS
    #
    # Existing AI response defect_counts thiyenawanam
    # me field eken direct accept karanawa.
    # -----------------------------------------------------

    defect_counts: Dict[str, int] = Field(
        default_factory=dict,
    )


    # -----------------------------------------------------
    # GOOD PERCENTAGE
    # -----------------------------------------------------

    good_percentage: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices(
            "good_percentage",
            "goodPercentage",
        ),
    )


    # -----------------------------------------------------
    # DEFECT PERCENTAGE
    # -----------------------------------------------------

    defect_percentage: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices(
            "defect_percentage",
            "defectPercentage",
        ),
    )


    # -----------------------------------------------------
    # AI DETECTIONS
    # -----------------------------------------------------

    detections: List[Dict[str, Any]] = Field(
        default_factory=list,
    )


    # -----------------------------------------------------
    # PREDICTED / ANNOTATED IMAGE
    # -----------------------------------------------------

    predicted_image_url: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices(
            "predicted_image_url",
            "predictedImageUrl",
        ),
    )


    # -----------------------------------------------------
    # IMAGE SOURCE
    #
    # phone / upload
    # -----------------------------------------------------

    image_source: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices(
            "image_source",
            "imageSource",
        ),
    )


    # -----------------------------------------------------
    # PHONE CAPTURE METADATA
    # -----------------------------------------------------

    phone_capture: Optional[Dict[str, Any]] = Field(
        default=None,
        validation_alias=AliasChoices(
            "phone_capture",
            "phoneCapture",
        ),
    )


    # -----------------------------------------------------
    # SAMPLE WEIGHT
    # -----------------------------------------------------

    sample_weight: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices(
            "sample_weight",
            "sampleWeight",
        ),
    )


    weight_unit: str = Field(
        default="g",
        validation_alias=AliasChoices(
            "weight_unit",
            "weightUnit",
        ),
    )


    weight_calibrated: bool = Field(
        default=False,
        validation_alias=AliasChoices(
            "weight_calibrated",
            "weightCalibrated",
        ),
    )


    # -----------------------------------------------------
    # OLD TEMPORARY PHYSICAL SCORE
    #
    # Backend service.py meka use nokara
    # actual defect counts walin recalculate karanawa.
    # -----------------------------------------------------

    physical_score: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices(
            "physical_score",
            "physicalScore",
        ),
    )


# =========================================================
# GENERATE REPORT REQUEST
# =========================================================
#
# Frontend:
#
# {
#   "sensor_result": {...},
#   "physical_result": {...}
# }
#
# =========================================================

class GenerateQualityReportRequest(BaseModel):
    sensor_result: SensorResultInput

    physical_result: PhysicalResultInput


# =========================================================
# SENSOR SCORE BREAKDOWN
# =========================================================

class SensorScoreBreakdown(BaseModel):

    # -----------------------------------------------------
    # MAIN SENSOR RESPONSES
    # -----------------------------------------------------

    mq2_response: Optional[float] = None

    mq135_response: Optional[float] = None


    # -----------------------------------------------------
    # INDIVIDUAL SCORES
    # -----------------------------------------------------

    mq2_score: float = 0.0

    mq135_score: float = 0.0


    # -----------------------------------------------------
    # FINAL SENSOR SCORE
    # -----------------------------------------------------

    sensor_score: float = 0.0


    # -----------------------------------------------------
    # SENSOR DECISION
    # -----------------------------------------------------

    status: Literal[
        "GOOD",
        "REVIEW",
        "BAD",
        "SKIPPED",
    ]


    # -----------------------------------------------------
    # CURRENT EXPERIMENTAL THRESHOLDS
    # -----------------------------------------------------

    mq2_threshold: float = 73.0

    mq135_threshold: float = 22.5


    # -----------------------------------------------------
    # SUPPORTING SENSOR INFORMATION
    # -----------------------------------------------------

    mq3_response: Optional[float] = None

    humidity_response: Optional[float] = None

    moisture_response: Optional[float] = None

    temperature_response: Optional[float] = None


# =========================================================
# PHYSICAL DEFECT COUNTS
# =========================================================

class PhysicalDefectCounts(BaseModel):
    good: int = 0

    broken: int = 0

    black: int = 0

    black_and_broken: int = 0

    unknown: int = 0


# =========================================================
# PHYSICAL SCORE BREAKDOWN
# =========================================================

class PhysicalScoreBreakdown(BaseModel):
    total_beans: int = 0

    counts: PhysicalDefectCounts


    # -----------------------------------------------------
    # CURRENT RESEARCH WEIGHTS
    # -----------------------------------------------------

    broken_weight: float = 0.35

    black_weight: float = 1.0

    black_and_broken_weight: float = 1.0

    unknown_weight: float = 0.50


    # -----------------------------------------------------
    # WEIGHTED DEFECT CALCULATION
    # -----------------------------------------------------

    weighted_defect_units: float = 0.0

    weighted_defect_load: float = 0.0


    # -----------------------------------------------------
    # FINAL PHYSICAL SCORE
    # -----------------------------------------------------

    physical_score: float = 0.0


    # -----------------------------------------------------
    # PHYSICAL QUALITY STATUS
    # -----------------------------------------------------

    status: Literal[
        "EXCELLENT",
        "GOOD",
        "REVIEW",
        "POOR",
        "NO_DATA",
    ]


# =========================================================
# QUALITY FINDING
# =========================================================

class QualityFinding(BaseModel):
    category: Literal[
        "sensor",
        "physical",
        "final",
    ]

    title: str

    description: str

    status: Literal[
        "normal",
        "warning",
        "danger",
        "info",
    ] = "info"


# =========================================================
# RECOMMENDATION
# =========================================================

class QualityRecommendation(BaseModel):
    title: str

    description: str

    action: str

    priority: Literal[
        "Normal",
        "Low",
        "Medium",
        "High",
        "Critical",
    ] = "Normal"

    type: Literal[
        "success",
        "info",
        "warning",
        "danger",
    ] = "info"


# =========================================================
# FINAL QUALITY REPORT RESPONSE
# =========================================================

class QualityReportResponse(BaseModel):

    # -----------------------------------------------------
    # REPORT METADATA
    # -----------------------------------------------------

    report_id: Optional[str] = None

    generated_at: datetime


    # -----------------------------------------------------
    # REPORT TYPE
    # -----------------------------------------------------

    inspection_type: str = (
        "Coffee Bean Quality Assessment"
    )


    # -----------------------------------------------------
    # SENSOR ASSESSMENT
    # -----------------------------------------------------

    sensor_assessment: SensorScoreBreakdown


    # -----------------------------------------------------
    # PHYSICAL ASSESSMENT
    # -----------------------------------------------------

    physical_assessment: PhysicalScoreBreakdown


    # -----------------------------------------------------
    # FINAL 50 / 50 FUSION
    # -----------------------------------------------------

    sensor_weight: float = 0.50

    physical_weight: float = 0.50

    final_score: float


    # -----------------------------------------------------
    # RESEARCH-DEFINED GRADE
    # -----------------------------------------------------

    grade: Literal[
        "A",
        "B",
        "C",
        "Reject",
    ]


    # -----------------------------------------------------
    # FINAL STATUS
    # -----------------------------------------------------

    quality_status: Literal[
        "Excellent",
        "Good",
        "Needs Review",
        "Poor",
    ]


    # -----------------------------------------------------
    # QUALITY FINDINGS
    # -----------------------------------------------------

    findings: List[QualityFinding] = Field(
        default_factory=list,
    )


    # -----------------------------------------------------
    # DEFECT-BASED RECOMMENDATIONS
    # -----------------------------------------------------

    recommendations: List[
        QualityRecommendation
    ] = Field(
        default_factory=list,
    )

    # =====================================================
    # ADVANCED PROCESSING INTELLIGENCE
    # =====================================================

    processing_intelligence: ProcessingIntelligence

    # -----------------------------------------------------
    # ORIGINAL ANALYSIS DATA
    #
    # Final report / MongoDB save / PDF walata useful.
    # -----------------------------------------------------

    sensor_result: Optional[Dict[str, Any]] = None

    physical_result: Optional[Dict[str, Any]] = None


    # -----------------------------------------------------
    # METHODOLOGY NOTE
    # -----------------------------------------------------

    methodology: str = (
        "The final quality score uses an equal 50/50 "
        "fusion of sensor-based quality assessment and "
        "physical AI quality assessment."
    )


# =========================================================
# SAVE REPORT REQUEST
# =========================================================

class SaveQualityReportRequest(BaseModel):
    report: QualityReportResponse


# =========================================================
# SAVE REPORT RESPONSE
# =========================================================

class SaveQualityReportResponse(BaseModel):
    status: Literal[
        "success",
        "error",
    ]

    message: str

    report_id: Optional[str] = None