from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from .schema import (
    GenerateQualityReportRequest,
    PhysicalDefectCounts,
    PhysicalScoreBreakdown,
    QualityFinding,
    QualityRecommendation,
    QualityReportResponse,
    SensorResultInput,
    SensorScoreBreakdown,
)


# =========================================================
# QUALITY REPORT SERVICE
# =========================================================

class QualityReportService:

    # =====================================================
    # SENSOR THRESHOLDS
    # =====================================================
    #
    # These values were derived from the current
    # experimental good / bad coffee bean dataset.
    #
    # MQ-2
    # Good response range: 22 - 44
    # Bad response range: 102 - 277
    #
    # Decision midpoint:
    # (44 + 102) / 2 = 73
    #
    # MQ-135
    # Good response range: 9 - 15
    # Bad response range: 30 - 103
    #
    # Decision midpoint:
    # (15 + 30) / 2 = 22.5
    #
    # =====================================================

    MQ2_GOOD_MAX = 44.0
    MQ2_BAD_THRESHOLD = 73.0
    MQ2_BAD_MAX = 277.0

    MQ135_GOOD_MAX = 15.0
    MQ135_BAD_THRESHOLD = 22.5
    MQ135_BAD_MAX = 103.0


    # =====================================================
    # SUPPORTING SENSOR REFERENCE VALUES
    # =====================================================
    #
    # These do NOT directly decide GOOD / BAD.
    #
    # They are supporting indicators only.
    #
    # =====================================================

    MQ3_GOOD_MAX = 1.0

    HUMIDITY_GOOD_MAX = 15.4


    # =====================================================
    # PHYSICAL AI DEFECT WEIGHTS
    # =====================================================

    BROKEN_WEIGHT = 0.35

    BLACK_WEIGHT = 1.00

    BLACK_AND_BROKEN_WEIGHT = 1.00

    UNKNOWN_WEIGHT = 0.50


    # =====================================================
    # FINAL FUSION WEIGHTS
    # =====================================================

    SENSOR_WEIGHT = 0.50

    PHYSICAL_WEIGHT = 0.50


    # =====================================================
    # HELPER - CLAMP NUMBER
    # =====================================================

    @staticmethod
    def _clamp(
        value: float,
        minimum: float = 0.0,
        maximum: float = 100.0,
    ) -> float:

        return max(
            minimum,
            min(
                maximum,
                value,
            ),
        )


    # =====================================================
    # HELPER - SAFE FLOAT
    # =====================================================

    @staticmethod
    def _safe_float(
        value,
    ) -> Optional[float]:

        if value is None:
            return None

        try:
            return float(value)

        except (
            TypeError,
            ValueError,
        ):
            return None


    # =====================================================
    # HELPER - SAFE INTEGER
    # =====================================================

    @staticmethod
    def _safe_int(
        value,
        default: int = 0,
    ) -> int:

        if value is None:
            return default

        try:
            return int(value)

        except (
            TypeError,
            ValueError,
        ):
            return default


    # =====================================================
    # GET SENSOR RESPONSE
    # =====================================================
    #
    # Priority:
    #
    # 1. comparison.<sensor>.response
    #
    # 2. sample - baseline
    #
    # =====================================================

    def _get_sensor_response(
        self,
        sensor_result: SensorResultInput,
        sensor_name: str,
    ) -> Optional[float]:

        # -------------------------------------------------
        # METHOD 1
        # comparison response
        # -------------------------------------------------

        if sensor_result.comparison:

            comparison_value = getattr(
                sensor_result.comparison,
                sensor_name,
                None,
            )

            if (
                comparison_value
                and
                comparison_value.response
                is not None
            ):

                return self._safe_float(
                    comparison_value.response
                )


        # -------------------------------------------------
        # METHOD 2
        # sample - baseline
        # -------------------------------------------------

        if (
            sensor_result.baseline
            and
            sensor_result.sample
        ):

            baseline_value = getattr(
                sensor_result.baseline,
                sensor_name,
                None,
            )

            sample_value = getattr(
                sensor_result.sample,
                sensor_name,
                None,
            )


            baseline_value = self._safe_float(
                baseline_value
            )

            sample_value = self._safe_float(
                sample_value
            )


            if (
                baseline_value is not None
                and
                sample_value is not None
            ):

                return round(
                    sample_value
                    -
                    baseline_value,
                    2,
                )


        return None


    # =====================================================
    # MQ-2 SCORE
    # =====================================================
    #
    # <= 44
    #     100 points
    #
    # 44 - 73
    #     100 -> 70
    #
    # 73 - 277
    #     70 -> 0
    #
    # =====================================================

    def _calculate_mq2_score(
        self,
        response: Optional[float],
    ) -> Optional[float]:

        if response is None:
            return None


        # -------------------------------------------------
        # GOOD REFERENCE ZONE
        # -------------------------------------------------

        if (
            response
            <=
            self.MQ2_GOOD_MAX
        ):

            return 100.0


        # -------------------------------------------------
        # REVIEW / TRANSITION ZONE
        # -------------------------------------------------

        if (
            response
            <
            self.MQ2_BAD_THRESHOLD
        ):

            score = (
                100.0
                -
                (
                    30.0
                    *
                    (
                        response
                        -
                        self.MQ2_GOOD_MAX
                    )
                    /
                    (
                        self.MQ2_BAD_THRESHOLD
                        -
                        self.MQ2_GOOD_MAX
                    )
                )
            )


            return round(
                self._clamp(
                    score,
                ),
                2,
            )


        # -------------------------------------------------
        # BAD ZONE
        # -------------------------------------------------

        score = (
            70.0
            *
            (
                self.MQ2_BAD_MAX
                -
                response
            )
            /
            (
                self.MQ2_BAD_MAX
                -
                self.MQ2_BAD_THRESHOLD
            )
        )


        return round(
            self._clamp(
                score,
            ),
            2,
        )


    # =====================================================
    # MQ-135 SCORE
    # =====================================================
    #
    # <= 15
    #     100 points
    #
    # 15 - 22.5
    #     100 -> 70
    #
    # 22.5 - 103
    #     70 -> 0
    #
    # =====================================================

    def _calculate_mq135_score(
        self,
        response: Optional[float],
    ) -> Optional[float]:

        if response is None:
            return None


        # -------------------------------------------------
        # GOOD ZONE
        # -------------------------------------------------

        if (
            response
            <=
            self.MQ135_GOOD_MAX
        ):

            return 100.0


        # -------------------------------------------------
        # REVIEW / TRANSITION ZONE
        # -------------------------------------------------

        if (
            response
            <
            self.MQ135_BAD_THRESHOLD
        ):

            score = (
                100.0
                -
                (
                    30.0
                    *
                    (
                        response
                        -
                        self.MQ135_GOOD_MAX
                    )
                    /
                    (
                        self.MQ135_BAD_THRESHOLD
                        -
                        self.MQ135_GOOD_MAX
                    )
                )
            )


            return round(
                self._clamp(
                    score,
                ),
                2,
            )


        # -------------------------------------------------
        # BAD ZONE
        # -------------------------------------------------

        score = (
            70.0
            *
            (
                self.MQ135_BAD_MAX
                -
                response
            )
            /
            (
                self.MQ135_BAD_MAX
                -
                self.MQ135_BAD_THRESHOLD
            )
        )


        return round(
            self._clamp(
                score,
            ),
            2,
        )


    # =====================================================
    # SENSOR ASSESSMENT
    # =====================================================

    def _calculate_sensor_assessment(
        self,
        sensor_result: SensorResultInput,
    ) -> SensorScoreBreakdown:

        # -------------------------------------------------
        # SENSOR STEP SKIPPED
        # -------------------------------------------------

        if sensor_result.skipped:

            return SensorScoreBreakdown(
                mq2_response=None,
                mq135_response=None,

                mq2_score=0.0,
                mq135_score=0.0,

                sensor_score=0.0,

                status="SKIPPED",

                mq2_threshold=(
                    self.MQ2_BAD_THRESHOLD
                ),

                mq135_threshold=(
                    self.MQ135_BAD_THRESHOLD
                ),
            )


        # -------------------------------------------------
        # GET PRIMARY RESPONSES
        # -------------------------------------------------

        mq2_response = (
            self._get_sensor_response(
                sensor_result,
                "mq2",
            )
        )


        mq135_response = (
            self._get_sensor_response(
                sensor_result,
                "mq135",
            )
        )


        # -------------------------------------------------
        # SUPPORTING RESPONSES
        # -------------------------------------------------

        mq3_response = (
            self._get_sensor_response(
                sensor_result,
                "mq3",
            )
        )


        humidity_response = (
            self._get_sensor_response(
                sensor_result,
                "humidity",
            )
        )


        moisture_response = (
            self._get_sensor_response(
                sensor_result,
                "moisture",
            )
        )


        temperature_response = (
            self._get_sensor_response(
                sensor_result,
                "temperature",
            )
        )


        # -------------------------------------------------
        # PRIMARY SENSOR SCORES
        # -------------------------------------------------

        mq2_score = (
            self._calculate_mq2_score(
                mq2_response
            )
        )


        mq135_score = (
            self._calculate_mq135_score(
                mq135_response
            )
        )


        # -------------------------------------------------
        # SENSOR SCORE
        # -------------------------------------------------

        available_scores = [
            score
            for score in [
                mq2_score,
                mq135_score,
            ]
            if score is not None
        ]


        if available_scores:

            sensor_score = round(
                sum(
                    available_scores
                )
                /
                len(
                    available_scores
                ),
                2,
            )

        else:

            sensor_score = 0.0


        # -------------------------------------------------
        # SENSOR STATUS
        # -------------------------------------------------

        # If one primary sensor is missing,
        # result requires review.

        if (
            mq2_response is None
            or
            mq135_response is None
        ):

            sensor_status = (
                "REVIEW"
            )


        # Both below bad threshold
        # = GOOD

        elif (
            mq2_response
            <
            self.MQ2_BAD_THRESHOLD
            and
            mq135_response
            <
            self.MQ135_BAD_THRESHOLD
        ):

            sensor_status = (
                "GOOD"
            )


        # Both above bad threshold
        # = BAD

        elif (
            mq2_response
            >=
            self.MQ2_BAD_THRESHOLD
            and
            mq135_response
            >=
            self.MQ135_BAD_THRESHOLD
        ):

            sensor_status = (
                "BAD"
            )


        # Only one threshold exceeded

        else:

            sensor_status = (
                "REVIEW"
            )


        return SensorScoreBreakdown(

            mq2_response=(
                mq2_response
            ),

            mq135_response=(
                mq135_response
            ),

            mq2_score=(
                mq2_score
                if mq2_score
                is not None
                else 0.0
            ),

            mq135_score=(
                mq135_score
                if mq135_score
                is not None
                else 0.0
            ),

            sensor_score=(
                sensor_score
            ),

            status=(
                sensor_status
            ),

            mq2_threshold=(
                self.MQ2_BAD_THRESHOLD
            ),

            mq135_threshold=(
                self.MQ135_BAD_THRESHOLD
            ),

            mq3_response=(
                mq3_response
            ),

            humidity_response=(
                humidity_response
            ),

            moisture_response=(
                moisture_response
            ),

            temperature_response=(
                temperature_response
            ),
        )


    # =====================================================
    # NORMALIZE DEFECT KEY
    # =====================================================

    @staticmethod
    def _normalize_defect_key(
        value: str,
    ) -> str:

        return (
            str(value)
            .strip()
            .lower()
            .replace("-", "_")
            .replace(" ", "_")
            .replace("+", "_and_")
        )


    # =====================================================
    # GET DEFECT COUNT FROM DICTIONARY
    # =====================================================

    def _get_defect_count(
        self,
        defect_counts,
        possible_names,
    ) -> int:

        if not defect_counts:
            return 0


        normalized_counts = {
            self._normalize_defect_key(
                key
            ):
            self._safe_int(
                value
            )

            for key, value
            in defect_counts.items()
        }


        for name in possible_names:

            normalized_name = (
                self._normalize_defect_key(
                    name
                )
            )


            if (
                normalized_name
                in
                normalized_counts
            ):

                return max(
                    0,
                    normalized_counts[
                        normalized_name
                    ],
                )


        return 0


    # =====================================================
    # EXTRACT PHYSICAL COUNTS
    # =====================================================

    def _extract_physical_counts(
        self,
        physical_result,
    ) -> PhysicalDefectCounts:

        raw_data = (
            physical_result.model_dump()
        )


        defect_counts = (
            physical_result.defect_counts
            or {}
        )


        # -------------------------------------------------
        # GOOD
        # -------------------------------------------------

        good = (
            physical_result.good_count
        )


        if good is None:

            good = self._get_defect_count(
                defect_counts,
                [
                    "good",
                    "normal",
                    "good_whole",
                ],
            )


        # -------------------------------------------------
        # BROKEN
        # -------------------------------------------------

        broken = (
            physical_result.broken_count
        )


        if broken is None:

            broken = self._get_defect_count(
                defect_counts,
                [
                    "broken",
                    "broken_chipped",
                    "chipped",
                ],
            )


        # -------------------------------------------------
        # BLACK
        # -------------------------------------------------

        black = (
            physical_result.black_count
        )


        if black is None:

            black = self._get_defect_count(
                defect_counts,
                [
                    "black",
                    "black_dark",
                    "dark",
                ],
            )


        # -------------------------------------------------
        # BLACK + BROKEN
        # -------------------------------------------------

        black_and_broken = (
            physical_result
            .black_and_broken_count
        )


        # Some existing AI versions may use:
        #
        # black_broken_count
        # blackBrokenCount

        if black_and_broken is None:

            black_and_broken = (
                raw_data.get(
                    "black_broken_count"
                )
            )


        if black_and_broken is None:

            black_and_broken = (
                raw_data.get(
                    "blackBrokenCount"
                )
            )


        if black_and_broken is None:

            black_and_broken = (
                self._get_defect_count(
                    defect_counts,
                    [
                        "black_and_broken",
                        "black_broken",
                        "black+broken",
                        "black_and_broken_count",
                    ],
                )
            )


        # -------------------------------------------------
        # UNKNOWN
        # -------------------------------------------------

        unknown = (
            physical_result
            .unknown_count
        )


        if unknown is None:

            unknown = (
                self._get_defect_count(
                    defect_counts,
                    [
                        "unknown",
                        "other",
                    ],
                )
            )


        return PhysicalDefectCounts(

            good=max(
                0,
                self._safe_int(
                    good
                ),
            ),

            broken=max(
                0,
                self._safe_int(
                    broken
                ),
            ),

            black=max(
                0,
                self._safe_int(
                    black
                ),
            ),

            black_and_broken=max(
                0,
                self._safe_int(
                    black_and_broken
                ),
            ),

            unknown=max(
                0,
                self._safe_int(
                    unknown
                ),
            ),
        )


    # =====================================================
    # PHYSICAL AI ASSESSMENT
    # =====================================================

    def _calculate_physical_assessment(
        self,
        physical_result,
    ) -> PhysicalScoreBreakdown:

        counts = (
            self._extract_physical_counts(
                physical_result
            )
        )


        # -------------------------------------------------
        # TOTAL FROM COUNTS
        # -------------------------------------------------

        calculated_total = (
            counts.good
            +
            counts.broken
            +
            counts.black
            +
            counts.black_and_broken
            +
            counts.unknown
        )


        # -------------------------------------------------
        # BACKEND TOTAL
        # -------------------------------------------------

        reported_total = (
            self._safe_int(
                physical_result.total_beans
            )
        )


        if (
            reported_total
            >
            0
        ):

            total_beans = (
                reported_total
            )

        else:

            total_beans = (
                calculated_total
            )


        # -------------------------------------------------
        # NO AI DATA
        # -------------------------------------------------

        if (
            total_beans
            <=
            0
        ):

            return PhysicalScoreBreakdown(

                total_beans=0,

                counts=counts,

                broken_weight=(
                    self.BROKEN_WEIGHT
                ),

                black_weight=(
                    self.BLACK_WEIGHT
                ),

                black_and_broken_weight=(
                    self.BLACK_AND_BROKEN_WEIGHT
                ),

                unknown_weight=(
                    self.UNKNOWN_WEIGHT
                ),

                weighted_defect_units=0.0,

                weighted_defect_load=0.0,

                physical_score=0.0,

                status="NO_DATA",
            )


        # -------------------------------------------------
        # WEIGHTED DEFECT UNITS
        # -------------------------------------------------
        #
        # black + broken bean is treated as a
        # severe defect once.
        #
        # It is NOT double-penalized.
        #
        # -------------------------------------------------

        weighted_defect_units = (

            counts.black
            *
            self.BLACK_WEIGHT

            +

            counts.black_and_broken
            *
            self.BLACK_AND_BROKEN_WEIGHT

            +

            counts.broken
            *
            self.BROKEN_WEIGHT

            +

            counts.unknown
            *
            self.UNKNOWN_WEIGHT

        )


        # -------------------------------------------------
        # WEIGHTED DEFECT LOAD
        # -------------------------------------------------

        weighted_defect_load = (

            weighted_defect_units
            /
            total_beans

        )


        weighted_defect_load = max(
            0.0,
            min(
                1.0,
                weighted_defect_load,
            ),
        )


        # -------------------------------------------------
        # PHYSICAL QUALITY SCORE
        # -------------------------------------------------

        physical_score = (

            100.0
            *
            (
                1.0
                -
                weighted_defect_load
            )

        )


        physical_score = round(
            self._clamp(
                physical_score
            ),
            2,
        )


        # -------------------------------------------------
        # PHYSICAL STATUS
        #
        # Research physical assessment boundaries:
        #
        # 90 - 100  Excellent
        # 75 - 89   Good
        # 60 - 74   Review
        # < 60      Poor
        # -------------------------------------------------

        if (
            physical_score
            >=
            90
        ):

            physical_status = (
                "EXCELLENT"
            )


        elif (
            physical_score
            >=
            75
        ):

            physical_status = (
                "GOOD"
            )


        elif (
            physical_score
            >=
            60
        ):

            physical_status = (
                "REVIEW"
            )


        else:

            physical_status = (
                "POOR"
            )


        return PhysicalScoreBreakdown(

            total_beans=(
                total_beans
            ),

            counts=(
                counts
            ),

            broken_weight=(
                self.BROKEN_WEIGHT
            ),

            black_weight=(
                self.BLACK_WEIGHT
            ),

            black_and_broken_weight=(
                self.BLACK_AND_BROKEN_WEIGHT
            ),

            unknown_weight=(
                self.UNKNOWN_WEIGHT
            ),

            weighted_defect_units=round(
                weighted_defect_units,
                2,
            ),

            weighted_defect_load=round(
                weighted_defect_load,
                4,
            ),

            physical_score=(
                physical_score
            ),

            status=(
                physical_status
            ),
        )


    # =====================================================
    # FINAL GRADE
    # =====================================================
    #
    # Research-defined system grade.
    #
    # This is NOT claimed as an official SCA grade.
    #
    # =====================================================

    @staticmethod
    def _get_final_grade(
        final_score: float,
    ) -> str:

        if final_score >= 85:
            return "A"

        if final_score >= 70:
            return "B"

        if final_score >= 55:
            return "C"

        return "Reject"


    # =====================================================
    # FINAL QUALITY STATUS
    # =====================================================

    @staticmethod
    def _get_final_status(
        final_score: float,
        sensor_status: str,
        physical_status: str,
    ) -> str:

        # -------------------------------------------------
        # INCOMPLETE ANALYSIS
        # -------------------------------------------------

        if (
            sensor_status == "SKIPPED"
            or
            physical_status == "NO_DATA"
        ):
            return "Needs Review"


        # -------------------------------------------------
        # QUALITY CONTROL SAFEGUARD
        #
        # Even if the 50/50 numerical score is high,
        # a clearly BAD sensor result or POOR physical
        # result must not be automatically accepted.
        # -------------------------------------------------

        if (
            sensor_status == "BAD"
            or
            physical_status == "POOR"
        ):
            return "Needs Review"


        # -------------------------------------------------
        # UNCERTAIN COMPONENT
        # -------------------------------------------------

        if (
            sensor_status == "REVIEW"
            or
            physical_status == "REVIEW"
        ):
            return "Needs Review"


        # -------------------------------------------------
        # NORMAL SCORE-BASED STATUS
        # -------------------------------------------------

        if final_score >= 85:
            return "Excellent"

        if final_score >= 70:
            return "Good"

        if final_score >= 55:
            return "Needs Review"

        return "Poor"


    # =====================================================
    # BUILD SENSOR FINDINGS
    # =====================================================

    def _build_sensor_findings(
        self,
        sensor_assessment:
            SensorScoreBreakdown,
    ) -> List[QualityFinding]:

        findings: List[
            QualityFinding
        ] = []


        # -------------------------------------------------
        # SKIPPED
        # -------------------------------------------------

        if (
            sensor_assessment.status
            ==
            "SKIPPED"
        ):

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "Sensor Analysis Skipped"
                    ),

                    description=(
                        "Sensor quality analysis "
                        "was not completed for "
                        "this sample."
                    ),

                    status="warning",
                )
            )


            return findings


        # -------------------------------------------------
        # MQ-2
        # -------------------------------------------------

        if (
            sensor_assessment.mq2_response
            is None
        ):

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "MQ-2 Response Unavailable"
                    ),

                    description=(
                        "A valid MQ-2 response "
                        "could not be calculated."
                    ),

                    status="warning",
                )
            )


        elif (
            sensor_assessment.mq2_response
            >=
            self.MQ2_BAD_THRESHOLD
        ):

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "High MQ-2 Response"
                    ),

                    description=(
                        f"MQ-2 response was "
                        f"{sensor_assessment.mq2_response:.2f}, "
                        f"which exceeded the "
                        f"experimental decision "
                        f"threshold of "
                        f"{self.MQ2_BAD_THRESHOLD:.1f}."
                    ),

                    status="danger",
                )
            )


        else:

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "MQ-2 Response Acceptable"
                    ),

                    description=(
                        f"MQ-2 response was "
                        f"{sensor_assessment.mq2_response:.2f} "
                        f"and remained below the "
                        f"experimental bad-bean "
                        f"threshold."
                    ),

                    status="normal",
                )
            )


        # -------------------------------------------------
        # MQ-135
        # -------------------------------------------------

        if (
            sensor_assessment.mq135_response
            is None
        ):

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "MQ-135 Response Unavailable"
                    ),

                    description=(
                        "A valid MQ-135 response "
                        "could not be calculated."
                    ),

                    status="warning",
                )
            )


        elif (
            sensor_assessment.mq135_response
            >=
            self.MQ135_BAD_THRESHOLD
        ):

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "High MQ-135 Response"
                    ),

                    description=(
                        f"MQ-135 response was "
                        f"{sensor_assessment.mq135_response:.2f}, "
                        f"which exceeded the "
                        f"experimental decision "
                        f"threshold of "
                        f"{self.MQ135_BAD_THRESHOLD:.1f}."
                    ),

                    status="danger",
                )
            )


        else:

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "MQ-135 Response Acceptable"
                    ),

                    description=(
                        f"MQ-135 response was "
                        f"{sensor_assessment.mq135_response:.2f} "
                        f"and remained below the "
                        f"experimental bad-bean "
                        f"threshold."
                    ),

                    status="normal",
                )
            )


        # -------------------------------------------------
        # MQ-3 SUPPORTING INDICATOR
        # -------------------------------------------------

        if (
            sensor_assessment.mq3_response
            is not None
            and
            sensor_assessment.mq3_response
            >
            self.MQ3_GOOD_MAX
        ):

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "Elevated MQ-3 Response"
                    ),

                    description=(
                        f"MQ-3 response was "
                        f"{sensor_assessment.mq3_response:.2f}. "
                        f"This is treated as a "
                        f"supporting indicator "
                        f"and does not independently "
                        f"determine bean quality."
                    ),

                    status="warning",
                )
            )


        # -------------------------------------------------
        # HUMIDITY SUPPORTING INDICATOR
        # -------------------------------------------------

        if (
            sensor_assessment.humidity_response
            is not None
            and
            sensor_assessment.humidity_response
            >
            self.HUMIDITY_GOOD_MAX
        ):

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "Elevated Humidity Response"
                    ),

                    description=(
                        f"Humidity increased by "
                        f"{sensor_assessment.humidity_response:.2f}%. "
                        f"This measurement is "
                        f"used as supporting "
                        f"quality information."
                    ),

                    status="warning",
                )
            )


        # -------------------------------------------------
        # OVERALL SENSOR FINDING
        # -------------------------------------------------

        if (
            sensor_assessment.status
            ==
            "GOOD"
        ):

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "Good Sensor Profile"
                    ),

                    description=(
                        f"The combined sensor "
                        f"quality score is "
                        f"{sensor_assessment.sensor_score:.2f}/100. "
                        f"The primary gas sensor "
                        f"responses are consistent "
                        f"with the experimental "
                        f"good-bean profile."
                    ),

                    status="normal",
                )
            )


        elif (
            sensor_assessment.status
            ==
            "BAD"
        ):

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "Defective Sensor Profile"
                    ),

                    description=(
                        f"The combined sensor "
                        f"quality score is "
                        f"{sensor_assessment.sensor_score:.2f}/100. "
                        f"Both primary sensor "
                        f"responses exceeded their "
                        f"experimental thresholds."
                    ),

                    status="danger",
                )
            )


        else:

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "Sensor Result Requires Review"
                    ),

                    description=(
                        f"The sensor quality score "
                        f"is "
                        f"{sensor_assessment.sensor_score:.2f}/100. "
                        f"The sensor responses did "
                        f"not produce a clear "
                        f"good or bad decision."
                    ),

                    status="warning",
                )
            )


        return findings


    # =====================================================
    # BUILD PHYSICAL FINDINGS
    # =====================================================

    def _build_physical_findings(
        self,
        assessment:
            PhysicalScoreBreakdown,
    ) -> List[QualityFinding]:

        findings: List[
            QualityFinding
        ] = []


        # -------------------------------------------------
        # NO DATA
        # -------------------------------------------------

        if (
            assessment.status
            ==
            "NO_DATA"
        ):

            findings.append(
                QualityFinding(
                    category="physical",

                    title=(
                        "Physical AI Data Unavailable"
                    ),

                    description=(
                        "No coffee bean detections "
                        "were available for the "
                        "physical quality assessment."
                    ),

                    status="warning",
                )
            )


            return findings


        counts = (
            assessment.counts
        )


        # -------------------------------------------------
        # TOTAL BEANS
        # -------------------------------------------------

        findings.append(
            QualityFinding(
                category="physical",

                title=(
                    "Physical AI Analysis Completed"
                ),

                description=(
                    f"{assessment.total_beans} "
                    f"coffee beans were included "
                    f"in the physical AI "
                    f"quality assessment."
                ),

                status="info",
            )
        )


        # -------------------------------------------------
        # GOOD
        # -------------------------------------------------

        if counts.good > 0:

            findings.append(
                QualityFinding(
                    category="physical",

                    title=(
                        "Good Beans Detected"
                    ),

                    description=(
                        f"{counts.good} beans "
                        f"were classified as "
                        f"good whole beans."
                    ),

                    status="normal",
                )
            )


        # -------------------------------------------------
        # BROKEN
        # -------------------------------------------------

        if counts.broken > 0:

            findings.append(
                QualityFinding(
                    category="physical",

                    title=(
                        "Broken Beans Detected"
                    ),

                    description=(
                        f"{counts.broken} broken "
                        f"or chipped beans were "
                        f"identified."
                    ),

                    status="warning",
                )
            )


        # -------------------------------------------------
        # BLACK
        # -------------------------------------------------

        if counts.black > 0:

            findings.append(
                QualityFinding(
                    category="physical",

                    title=(
                        "Black Beans Detected"
                    ),

                    description=(
                        f"{counts.black} black "
                        f"or dark beans were "
                        f"identified."
                    ),

                    status="danger",
                )
            )


        # -------------------------------------------------
        # BLACK + BROKEN
        # -------------------------------------------------

        if (
            counts.black_and_broken
            >
            0
        ):

            findings.append(
                QualityFinding(
                    category="physical",

                    title=(
                        "Black and Broken Beans Detected"
                    ),

                    description=(
                        f"{counts.black_and_broken} "
                        f"beans contained both "
                        f"black-color and broken-shape "
                        f"defects."
                    ),

                    status="danger",
                )
            )


        # -------------------------------------------------
        # UNKNOWN
        # -------------------------------------------------

        if counts.unknown > 0:

            findings.append(
                QualityFinding(
                    category="physical",

                    title=(
                        "Uncertain Bean Classifications"
                    ),

                    description=(
                        f"{counts.unknown} beans "
                        f"could not be confidently "
                        f"assigned to the main "
                        f"quality categories."
                    ),

                    status="warning",
                )
            )


        # -------------------------------------------------
        # SCORE
        # -------------------------------------------------

        findings.append(
            QualityFinding(
                category="physical",

                title=(
                    "Physical Quality Score"
                ),

                description=(
                    f"The weighted physical "
                    f"AI quality score is "
                    f"{assessment.physical_score:.2f}/100."
                ),

                status=(
                    "normal"
                    if assessment.physical_score
                    >= 75
                    else
                    "warning"
                    if assessment.physical_score
                    >= 60
                    else
                    "danger"
                ),
            )
        )


        return findings


    # =====================================================
    # BUILD RECOMMENDATIONS
    # =====================================================

    def _build_recommendations(
        self,
        sensor_assessment:
            SensorScoreBreakdown,
        physical_assessment:
            PhysicalScoreBreakdown,
    ) -> List[QualityRecommendation]:

        recommendations: List[
            QualityRecommendation
        ] = []


        counts = (
            physical_assessment.counts
        )


        # -------------------------------------------------
        # SENSOR BAD
        # -------------------------------------------------

        if (
            sensor_assessment.status
            ==
            "BAD"
        ):

            recommendations.append(
                QualityRecommendation(
                    title=(
                        "Hold Batch for Additional Inspection"
                    ),

                    description=(
                        "Both primary gas sensor "
                        "responses exceeded the "
                        "experimental bad-bean "
                        "decision thresholds."
                    ),

                    action=(
                        "Do not continue the batch "
                        "directly to roasting. "
                        "Perform additional sorting "
                        "and quality inspection."
                    ),

                    priority="High",

                    type="danger",
                )
            )


        # -------------------------------------------------
        # SENSOR REVIEW
        # -------------------------------------------------

        elif (
            sensor_assessment.status
            ==
            "REVIEW"
        ):

            recommendations.append(
                QualityRecommendation(
                    title=(
                        "Review Sensor Measurements"
                    ),

                    description=(
                        "The primary sensor "
                        "responses produced an "
                        "uncertain quality result."
                    ),

                    action=(
                        "Repeat the sensor analysis "
                        "or perform an additional "
                        "manual inspection before "
                        "making a final processing "
                        "decision."
                    ),

                    priority="Medium",

                    type="warning",
                )
            )


        # -------------------------------------------------
        # BLACK
        # -------------------------------------------------

        if counts.black > 0:

            recommendations.append(
                QualityRecommendation(
                    title=(
                        "Remove Black or Dark Beans"
                    ),

                    description=(
                        f"{counts.black} black "
                        f"or dark beans were "
                        f"detected by the physical "
                        f"AI system."
                    ),

                    action=(
                        "Sort and remove the "
                        "affected beans before "
                        "roasting or further "
                        "processing."
                    ),

                    priority="High",

                    type="danger",
                )
            )


        # -------------------------------------------------
        # BLACK + BROKEN
        # -------------------------------------------------

        if (
            counts.black_and_broken
            >
            0
        ):

            recommendations.append(
                QualityRecommendation(
                    title=(
                        "Remove Severe Combined Defects"
                    ),

                    description=(
                        f"{counts.black_and_broken} "
                        f"beans showed both black "
                        f"color and broken shape "
                        f"defects."
                    ),

                    action=(
                        "Remove these beans during "
                        "the sorting stage before "
                        "the batch proceeds to "
                        "roasting."
                    ),

                    priority="High",

                    type="danger",
                )
            )


        # -------------------------------------------------
        # BROKEN
        # -------------------------------------------------

        if counts.broken > 0:

            recommendations.append(
                QualityRecommendation(
                    title=(
                        "Sort Broken Beans"
                    ),

                    description=(
                        f"{counts.broken} broken "
                        f"or chipped beans were "
                        f"identified."
                    ),

                    action=(
                        "Perform secondary sorting "
                        "to reduce the number of "
                        "broken beans before "
                        "roasting."
                    ),

                    priority="Medium",

                    type="warning",
                )
            )


        # -------------------------------------------------
        # UNKNOWN
        # -------------------------------------------------

        if counts.unknown > 0:

            recommendations.append(
                QualityRecommendation(
                    title=(
                        "Review Uncertain Beans"
                    ),

                    description=(
                        f"{counts.unknown} bean "
                        f"classification(s) were "
                        f"uncertain."
                    ),

                    action=(
                        "Inspect uncertain beans "
                        "manually or repeat the "
                        "physical AI analysis."
                    ),

                    priority="Medium",

                    type="warning",
                )
            )


        # -------------------------------------------------
        # NO PROBLEMS
        # -------------------------------------------------

        if (
            len(
                recommendations
            )
            ==
            0
        ):

            recommendations.append(
                QualityRecommendation(
                    title=(
                        "Batch Can Continue"
                    ),

                    description=(
                        "No significant quality "
                        "issue was identified by "
                        "the sensor or physical "
                        "AI assessment."
                    ),

                    action=(
                        "Continue the batch to "
                        "the next production stage "
                        "after normal quality "
                        "control checks."
                    ),

                    priority="Normal",

                    type="success",
                )
            )


        return recommendations


    # =====================================================
    # BUILD FINAL FINDING
    # =====================================================

    def _build_final_finding(
        self,
        final_score: float,
        grade: str,
        quality_status: str,
    ) -> QualityFinding:

        if final_score >= 85:

            finding_status = (
                "normal"
            )


        elif final_score >= 55:

            finding_status = (
                "warning"
            )


        else:

            finding_status = (
                "danger"
            )


        return QualityFinding(
            category="final",

            title=(
                "Final Coffee Bean Quality Assessment"
            ),

            description=(
                f"The final combined quality "
                f"score is "
                f"{final_score:.2f}/100. "
                f"The research-defined system "
                f"grade is {grade} and the "
                f"overall quality status is "
                f"{quality_status}."
            ),

            status=(
                finding_status
            ),
        )


    # =====================================================
    # GENERATE REPORT ID
    # =====================================================

    @staticmethod
    def _generate_report_id() -> str:

        timestamp = (
            datetime.now(
                timezone.utc
            )
            .strftime(
                "%Y%m%d%H%M%S"
            )
        )


        short_id = (
            str(
                uuid4()
            )
            .split("-")[0]
            .upper()
        )


        return (
            f"BQR-"
            f"{timestamp}-"
            f"{short_id}"
        )


    # =====================================================
    # GENERATE FINAL QUALITY REPORT
    # =====================================================

    def generate_report(
        self,
        request:
            GenerateQualityReportRequest,
    ) -> QualityReportResponse:

        # -------------------------------------------------
        # SENSOR ASSESSMENT
        # -------------------------------------------------

        sensor_assessment = (
            self._calculate_sensor_assessment(
                request.sensor_result
            )
        )


        # -------------------------------------------------
        # PHYSICAL ASSESSMENT
        # -------------------------------------------------

        physical_assessment = (
            self._calculate_physical_assessment(
                request.physical_result
            )
        )


        # -------------------------------------------------
        # FINAL 50 / 50 QUALITY FUSION
        # -------------------------------------------------

        final_score = (

            sensor_assessment.sensor_score
            *
            self.SENSOR_WEIGHT

            +

            physical_assessment.physical_score
            *
            self.PHYSICAL_WEIGHT

        )


        final_score = round(
            self._clamp(
                final_score
            ),
            2,
        )


        # -------------------------------------------------
        # FINAL GRADE
        # -------------------------------------------------

        grade = (
            self._get_final_grade(
                final_score
            )
        )


        # -------------------------------------------------
        # FINAL STATUS
        # -------------------------------------------------

        quality_status = (
            self._get_final_status(
                final_score=final_score,
                sensor_status=sensor_assessment.status,
                physical_status=physical_assessment.status,
            )
        )


        # -------------------------------------------------
        # FINDINGS
        # -------------------------------------------------

        findings = []


        findings.extend(
            self._build_sensor_findings(
                sensor_assessment
            )
        )


        findings.extend(
            self._build_physical_findings(
                physical_assessment
            )
        )


        findings.append(
            self._build_final_finding(
                final_score=(
                    final_score
                ),

                grade=(
                    grade
                ),

                quality_status=(
                    quality_status
                ),
            )
        )


        # -------------------------------------------------
        # RECOMMENDATIONS
        # -------------------------------------------------

        recommendations = (
            self._build_recommendations(

                sensor_assessment=(
                    sensor_assessment
                ),

                physical_assessment=(
                    physical_assessment
                ),
            )
        )


        # -------------------------------------------------
        # REPORT
        # -------------------------------------------------

        report = QualityReportResponse(

            report_id=(
                self._generate_report_id()
            ),

            generated_at=(
                datetime.now(
                    timezone.utc
                )
            ),

            inspection_type=(
                "Coffee Bean Quality Assessment"
            ),

            sensor_assessment=(
                sensor_assessment
            ),

            physical_assessment=(
                physical_assessment
            ),

            sensor_weight=(
                self.SENSOR_WEIGHT
            ),

            physical_weight=(
                self.PHYSICAL_WEIGHT
            ),

            final_score=(
                final_score
            ),

            grade=(
                grade
            ),

            quality_status=(
                quality_status
            ),

            findings=(
                findings
            ),

            recommendations=(
                recommendations
            ),

            sensor_result=(
                request.sensor_result
                .model_dump()
            ),

            physical_result=(
                request.physical_result
                .model_dump()
            ),

            methodology=(
                "The final coffee bean quality score "
                "uses an equal 50/50 fusion of the "
                "sensor-based quality score and the "
                "physical AI quality score. The sensor "
                "decision thresholds were derived from "
                "the experimental good and defective "
                "coffee bean samples collected for this "
                "research. The physical AI score uses "
                "weighted defect severity, where black "
                "and black-and-broken beans receive the "
                "highest penalty, broken beans receive "
                "a lower penalty, and uncertain "
                "classifications receive a moderate "
                "penalty. The A/B/C/Reject grade is a "
                "research-defined system grade and is "
                "not presented as an official SCA grade."
            ),
        )


        return report


# =========================================================
# GLOBAL SERVICE INSTANCE
# =========================================================

quality_report_service = (
    QualityReportService()
)