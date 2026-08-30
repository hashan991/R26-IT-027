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
    model_validator,
)

from .. import sensor_quality_config as sensor_config


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
    # SENSOR RESPONSES
    #
    # Response = Sample - Baseline
    # -----------------------------------------------------

    mq2_response: Optional[float] = None

    mq3_response: Optional[float] = None

    mq135_response: Optional[float] = None

    moisture_response: Optional[float] = None

    humidity_response: Optional[float] = None

    # Temperature is retained as supporting environmental
    # information only. It is NOT one of the five quality
    # voting sensors because the experimental GOOD and BAD
    # ranges overlapped.
    temperature_response: Optional[float] = None


    # -----------------------------------------------------
    # LEGACY / COMPATIBILITY INDIVIDUAL SCORES
    #
    # Existing frontend components may still read these
    # fields. The new final sensor score is NOT calculated
    # by averaging these values.
    #
    # service.py uses the five-sensor voting method for the
    # authoritative sensor score.
    # -----------------------------------------------------

    mq2_score: float = 0.0

    mq135_score: float = 0.0


    # -----------------------------------------------------
    # FINAL SENSOR SCORE
    #
    # Five voting sensors have equal weight:
    #
    # Sensor Score = 100 - (BAD vote count x 20)
    #
    # 0 BAD votes -> 100
    # 1 BAD vote  -> 80
    # 2 BAD votes -> 60
    # 3 BAD votes -> 40
    # 4 BAD votes -> 20
    # 5 BAD votes -> 0
    # -----------------------------------------------------

    sensor_score: float = 0.0


    # -----------------------------------------------------
    # SENSOR DECISION
    #
    # 0-1 BAD votes -> GOOD
    # 2 BAD votes   -> REVIEW
    # 3-5 BAD votes -> BAD
    # -----------------------------------------------------

    status: Literal[
        "GOOD",
        "REVIEW",
        "BAD",
        "SKIPPED",
    ]


    # -----------------------------------------------------
    # EXPERIMENTALLY DERIVED BAD-DECISION THRESHOLDS
    #
    # Delta = Sample - Baseline
    #
    # These are research-defined thresholds derived from
    # the collected GOOD / BAD coffee bean experiments.
    # They are not presented as official coffee-industry
    # grading standards.
    # -----------------------------------------------------

    mq2_threshold: float = (
        sensor_config.MQ2_BAD_THRESHOLD
    )

    mq3_threshold: float = (
        sensor_config.MQ3_BAD_THRESHOLD
    )

    mq135_threshold: float = (
        sensor_config.MQ135_BAD_THRESHOLD
    )

    moisture_threshold: float = (
        sensor_config.MOISTURE_BAD_THRESHOLD
    )

    humidity_threshold: float = (
        sensor_config.HUMIDITY_BAD_THRESHOLD
    )


    # -----------------------------------------------------
    # INDIVIDUAL FIVE-SENSOR VOTES
    #
    # True  = this sensor gives a BAD vote
    # False = this sensor gives a GOOD vote
    # None  = response unavailable / invalid
    # -----------------------------------------------------

    mq2_bad: Optional[bool] = None

    mq3_bad: Optional[bool] = None

    mq135_bad: Optional[bool] = None

    moisture_bad: Optional[bool] = None

    humidity_bad: Optional[bool] = None


    # -----------------------------------------------------
    # VOTING SUMMARY
    # -----------------------------------------------------

    bad_count: int = 0

    valid_vote_count: int = 0

    total_voting_sensors: int = (
    sensor_config.TOTAL_VOTING_SENSORS
    )

    # Explicit methodology flag for report/UI clarity.
    temperature_used_for_decision: bool = False


    # -----------------------------------------------------
    # AUTOMATIC VOTE METADATA
    #
    # The backend service remains responsible for the final
    # score and GOOD / REVIEW / BAD status.
    #
    # This validator derives the per-sensor vote metadata
    # from the returned responses so the Final Report can
    # show BAD Votes X/5 without requiring duplicate logic
    # in the frontend.
    # -----------------------------------------------------

    @model_validator(mode="after")
    def populate_sensor_vote_metadata(self):

        if self.status == "SKIPPED":
            self.mq2_bad = None
            self.mq3_bad = None
            self.mq135_bad = None
            self.moisture_bad = None
            self.humidity_bad = None

            self.bad_count = 0
            self.valid_vote_count = 0
            self.total_voting_sensors = 5
            self.temperature_used_for_decision = False

            return self


        self.mq2_bad = (
            None
            if self.mq2_response is None
            else self.mq2_response >= self.mq2_threshold
        )

        self.mq3_bad = (
            None
            if self.mq3_response is None
            else self.mq3_response >= self.mq3_threshold
        )

        self.mq135_bad = (
            None
            if self.mq135_response is None
            else self.mq135_response >= self.mq135_threshold
        )

        self.moisture_bad = (
            None
            if self.moisture_response is None
            else self.moisture_response <= self.moisture_threshold
        )

        self.humidity_bad = (
            None
            if self.humidity_response is None
            else self.humidity_response >= self.humidity_threshold
        )


        votes = [
            self.mq2_bad,
            self.mq3_bad,
            self.mq135_bad,
            self.moisture_bad,
            self.humidity_bad,
        ]


        self.valid_vote_count = sum(
            vote is not None
            for vote in votes
        )

        self.bad_count = sum(
            vote is True
            for vote in votes
        )

        self.total_voting_sensors = 5

        self.temperature_used_for_decision = False

        return self


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
        "physical AI quality assessment. The sensor "
        "assessment uses five equally weighted voting "
        "sensors: MQ-2, MQ-3, MQ-135, moisture, and "
        "humidity. Each BAD vote reduces the sensor score "
        "by 20 points. Temperature is retained as supporting "
        "environmental information and is not used as a "
        "quality vote."
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