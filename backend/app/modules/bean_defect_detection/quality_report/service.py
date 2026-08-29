from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from .processing_intelligence.service import (
    processing_intelligence_service,
)

from .processing_intelligence.defect_profile import (
    build_defect_profile,
)

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

from .. import sensor_quality_config as sensor_config


# =========================================================
# QUALITY REPORT SERVICE
# =========================================================

class QualityReportService:

    # =====================================================
    # SENSOR THRESHOLDS
    # =====================================================
    #
    # Research-defined decision thresholds derived from the
    # latest experimental GOOD / BAD coffee bean dataset.
    #
    # Every response is:
    #
    #     delta = sample - baseline
    #
    # Five sensors participate in the quality vote:
    #
    #   MQ-2
    #     GOOD observed: -11 to +18
    #     BAD observed : +241 to +343
    #     midpoint     : (18 + 241) / 2 = 129.5
    #
    #   MQ-3
    #     GOOD observed: -1 to +2
    #     BAD observed : +75 to +118
    #     midpoint     : (2 + 75) / 2 = 38.5
    #
    #   MQ-135
    #     GOOD observed: -8 to +1
    #     BAD observed : +18 to +58
    #     midpoint     : (1 + 18) / 2 = 9.5
    #
    #   Moisture
    #     GOOD observed: -11 to +11
    #     BAD observed : -368 to -21
    #     midpoint between -21 and -11 = -16
    #
    #   Humidity
    #     GOOD observed: -7.1% to +4.2%
    #     BAD observed : +17.2% to +26.9%
    #     midpoint     : (4.2 + 17.2) / 2 = 10.7
    #
    # Temperature is retained as supporting environmental
    # information only because the observed GOOD and BAD
    # temperature ranges overlap.
    #
    # IMPORTANT:
    # These are research-defined experimental boundaries,
    # not official SCA grading thresholds.
    # =====================================================

# =====================================================
# SENSOR QUALITY CONFIG
# =====================================================

    MQ2_BAD_THRESHOLD = (
        sensor_config.MQ2_BAD_THRESHOLD
    )

    MQ3_BAD_THRESHOLD = (
        sensor_config.MQ3_BAD_THRESHOLD
    )

    MQ135_BAD_THRESHOLD = (
        sensor_config.MQ135_BAD_THRESHOLD
    )

    MOISTURE_BAD_THRESHOLD = (
        sensor_config.MOISTURE_BAD_THRESHOLD
    )

    HUMIDITY_BAD_THRESHOLD = (
        sensor_config.HUMIDITY_BAD_THRESHOLD
    )

    TOTAL_VOTING_SENSORS = (
        sensor_config.TOTAL_VOTING_SENSORS
    )

    SENSOR_VOTE_WEIGHT = (
        sensor_config.SENSOR_VOTE_WEIGHT
    )

    GOOD_MAX_BAD_VOTES = (
        sensor_config.GOOD_MAX_BAD_VOTES
    )

    REVIEW_BAD_VOTES = (
        sensor_config.REVIEW_BAD_VOTES
    )

    BAD_MIN_BAD_VOTES = (
        sensor_config.BAD_MIN_BAD_VOTES
    )


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
    # SENSOR BAD-VOTE HELPER
    # =====================================================
    #
    # Returns:
    #   True  -> sensor gives one BAD vote
    #   False -> sensor does not give a BAD vote
    #   None  -> response unavailable / invalid
    #
    # Temperature is intentionally not included here.
    # =====================================================

    def _is_bad_sensor_response(
        self,
        sensor_name: str,
        response: Optional[float],
    ) -> Optional[bool]:

        if response is None:
            return None

        value = self._safe_float(
            response
        )

        if value is None:
            return None

        if sensor_name == "mq2":
            return (
                value
                >=
                self.MQ2_BAD_THRESHOLD
            )

        if sensor_name == "mq3":
            return (
                value
                >=
                self.MQ3_BAD_THRESHOLD
            )

        if sensor_name == "mq135":
            return (
                value
                >=
                self.MQ135_BAD_THRESHOLD
            )

        if sensor_name == "moisture":
            return (
                value
                <=
                self.MOISTURE_BAD_THRESHOLD
            )

        if sensor_name == "humidity":
            return (
                value
                >=
                self.HUMIDITY_BAD_THRESHOLD
            )

        return None


    # =====================================================
    # SENSOR ASSESSMENT
    # =====================================================
    #
    # Five equal-weight sensor votes are used:
    #
    #   MQ-2       >= 129.5  -> BAD vote
    #   MQ-3       >= 38.5   -> BAD vote
    #   MQ-135     >= 9.5    -> BAD vote
    #   Moisture   <= -16.0  -> BAD vote
    #   Humidity   >= 10.7   -> BAD vote
    #
    # Sensor score:
    #
    #   100 - (bad_count * 20)
    #
    # Status:
    #
    #   0-1 BAD votes -> GOOD
    #   2 BAD votes   -> REVIEW
    #   3-5 BAD votes -> BAD
    #
    # Temperature remains supporting information only.
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

                # Compatibility fields retained for the
                # existing response schema / frontend.
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

                mq3_response=None,
                humidity_response=None,
                moisture_response=None,
                temperature_response=None,
            )


        # -------------------------------------------------
        # GET ALL SENSOR RESPONSES
        # -------------------------------------------------

        mq2_response = (
            self._get_sensor_response(
                sensor_result,
                "mq2",
            )
        )

        mq3_response = (
            self._get_sensor_response(
                sensor_result,
                "mq3",
            )
        )

        mq135_response = (
            self._get_sensor_response(
                sensor_result,
                "mq135",
            )
        )

        moisture_response = (
            self._get_sensor_response(
                sensor_result,
                "moisture",
            )
        )

        humidity_response = (
            self._get_sensor_response(
                sensor_result,
                "humidity",
            )
        )

        temperature_response = (
            self._get_sensor_response(
                sensor_result,
                "temperature",
            )
        )


        # -------------------------------------------------
        # FIVE SENSOR BAD VOTES
        # -------------------------------------------------

        mq2_bad = (
            self._is_bad_sensor_response(
                "mq2",
                mq2_response,
            )
        )

        mq3_bad = (
            self._is_bad_sensor_response(
                "mq3",
                mq3_response,
            )
        )

        mq135_bad = (
            self._is_bad_sensor_response(
                "mq135",
                mq135_response,
            )
        )

        moisture_bad = (
            self._is_bad_sensor_response(
                "moisture",
                moisture_response,
            )
        )

        humidity_bad = (
            self._is_bad_sensor_response(
                "humidity",
                humidity_response,
            )
        )


        votes = [
            mq2_bad,
            mq3_bad,
            mq135_bad,
            moisture_bad,
            humidity_bad,
        ]


        # -------------------------------------------------
        # MISSING / INVALID VOTING SENSOR
        # -------------------------------------------------
        #
        # A quality classification should not be forced when
        # one of the five voting sensor responses is missing.
        # -------------------------------------------------

        if any(
            vote is None
            for vote in votes
        ):

            sensor_score = 0.0

            sensor_status = (
                "REVIEW"
            )

        else:

            # ---------------------------------------------
            # BAD VOTE COUNT
            # ---------------------------------------------

            bad_count = sum(
                1
                for vote in votes
                if vote
            )


            # ---------------------------------------------
            # SENSOR SCORE
            #
            # 0 BAD -> 100
            # 1 BAD -> 80
            # 2 BAD -> 60
            # 3 BAD -> 40
            # 4 BAD -> 20
            # 5 BAD -> 0
            # ---------------------------------------------

            sensor_score = (
                100.0
                -
                (
                    bad_count
                    *
                    self.SENSOR_VOTE_WEIGHT
                )
            )

            sensor_score = round(
                self._clamp(
                    sensor_score
                ),
                2,
            )


            # ---------------------------------------------
            # SENSOR STATUS
            # ---------------------------------------------

            if (
                bad_count
                >=
                self.BAD_MIN_BAD_VOTES
            ):
                sensor_status = "BAD"

            elif (
                bad_count
                ==
                self.REVIEW_BAD_VOTES
            ):
                sensor_status = "REVIEW"

            else:
                sensor_status = "GOOD"

        # -------------------------------------------------
        # EXISTING PER-SENSOR SCORE FIELDS
        # -------------------------------------------------
        #
        # The current schema contains mq2_score and
        # mq135_score. They are retained for compatibility.
        # In the new voting method:
        #
        #   100 = no BAD vote from that sensor
        #   0   = BAD vote from that sensor
        #
        # They are NOT used to calculate the final sensor
        # score; the five equal votes above are used.
        # -------------------------------------------------

        mq2_score = (
            0.0
            if mq2_bad is True
            else
            100.0
            if mq2_bad is False
            else
            0.0
        )

        mq135_score = (
            0.0
            if mq135_bad is True
            else
            100.0
            if mq135_bad is False
            else
            0.0
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
            ),

            mq135_score=(
                mq135_score
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
        # RE-CREATE THE FIVE VOTES FOR EXPLAINABILITY
        # -------------------------------------------------

        mq2_bad = (
            self._is_bad_sensor_response(
                "mq2",
                sensor_assessment.mq2_response,
            )
        )

        mq3_bad = (
            self._is_bad_sensor_response(
                "mq3",
                sensor_assessment.mq3_response,
            )
        )

        mq135_bad = (
            self._is_bad_sensor_response(
                "mq135",
                sensor_assessment.mq135_response,
            )
        )

        moisture_bad = (
            self._is_bad_sensor_response(
                "moisture",
                sensor_assessment.moisture_response,
            )
        )

        humidity_bad = (
            self._is_bad_sensor_response(
                "humidity",
                sensor_assessment.humidity_response,
            )
        )


        votes = [
            mq2_bad,
            mq3_bad,
            mq135_bad,
            moisture_bad,
            humidity_bad,
        ]

        available_vote_count = sum(
            1
            for vote in votes
            if vote is not None
        )

        bad_count = sum(
            1
            for vote in votes
            if vote is True
        )


        # -------------------------------------------------
        # MQ-2
        # -------------------------------------------------

        if mq2_bad is None:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="MQ-2 Response Unavailable",
                    description=(
                        "A valid MQ-2 response could not "
                        "be calculated for the five-sensor vote."
                    ),
                    status="warning",
                )
            )

        elif mq2_bad:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="MQ-2 BAD Vote",
                    description=(
                        f"MQ-2 response was "
                        f"{sensor_assessment.mq2_response:.2f}, "
                        f"meeting or exceeding the "
                        f"experimental BAD threshold of "
                        f"{self.MQ2_BAD_THRESHOLD:.1f}."
                    ),
                    status="danger",
                )
            )

        else:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="MQ-2 GOOD Vote",
                    description=(
                        f"MQ-2 response was "
                        f"{sensor_assessment.mq2_response:.2f}, "
                        f"below the experimental BAD "
                        f"threshold of "
                        f"{self.MQ2_BAD_THRESHOLD:.1f}."
                    ),
                    status="normal",
                )
            )


        # -------------------------------------------------
        # MQ-3
        # -------------------------------------------------

        if mq3_bad is None:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="MQ-3 Response Unavailable",
                    description=(
                        "A valid MQ-3 response could not "
                        "be calculated for the five-sensor vote."
                    ),
                    status="warning",
                )
            )

        elif mq3_bad:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="MQ-3 BAD Vote",
                    description=(
                        f"MQ-3 response was "
                        f"{sensor_assessment.mq3_response:.2f}, "
                        f"meeting or exceeding the "
                        f"experimental BAD threshold of "
                        f"{self.MQ3_BAD_THRESHOLD:.1f}."
                    ),
                    status="danger",
                )
            )

        else:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="MQ-3 GOOD Vote",
                    description=(
                        f"MQ-3 response was "
                        f"{sensor_assessment.mq3_response:.2f}, "
                        f"below the experimental BAD "
                        f"threshold of "
                        f"{self.MQ3_BAD_THRESHOLD:.1f}."
                    ),
                    status="normal",
                )
            )


        # -------------------------------------------------
        # MQ-135
        # -------------------------------------------------

        if mq135_bad is None:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="MQ-135 Response Unavailable",
                    description=(
                        "A valid MQ-135 response could not "
                        "be calculated for the five-sensor vote."
                    ),
                    status="warning",
                )
            )

        elif mq135_bad:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="MQ-135 BAD Vote",
                    description=(
                        f"MQ-135 response was "
                        f"{sensor_assessment.mq135_response:.2f}, "
                        f"meeting or exceeding the "
                        f"experimental BAD threshold of "
                        f"{self.MQ135_BAD_THRESHOLD:.1f}."
                    ),
                    status="danger",
                )
            )

        else:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="MQ-135 GOOD Vote",
                    description=(
                        f"MQ-135 response was "
                        f"{sensor_assessment.mq135_response:.2f}, "
                        f"below the experimental BAD "
                        f"threshold of "
                        f"{self.MQ135_BAD_THRESHOLD:.1f}."
                    ),
                    status="normal",
                )
            )


        # -------------------------------------------------
        # MOISTURE
        # -------------------------------------------------

        if moisture_bad is None:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="Moisture Response Unavailable",
                    description=(
                        "A valid moisture response could not "
                        "be calculated for the five-sensor vote."
                    ),
                    status="warning",
                )
            )

        elif moisture_bad:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="Moisture BAD Vote",
                    description=(
                        f"Moisture response was "
                        f"{sensor_assessment.moisture_response:.2f}, "
                        f"meeting the experimental BAD "
                        f"condition of <= "
                        f"{self.MOISTURE_BAD_THRESHOLD:.1f}."
                    ),
                    status="danger",
                )
            )

        else:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="Moisture GOOD Vote",
                    description=(
                        f"Moisture response was "
                        f"{sensor_assessment.moisture_response:.2f}, "
                        f"above the experimental BAD "
                        f"boundary of "
                        f"{self.MOISTURE_BAD_THRESHOLD:.1f}."
                    ),
                    status="normal",
                )
            )


        # -------------------------------------------------
        # HUMIDITY
        # -------------------------------------------------

        if humidity_bad is None:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="Humidity Response Unavailable",
                    description=(
                        "A valid humidity response could not "
                        "be calculated for the five-sensor vote."
                    ),
                    status="warning",
                )
            )

        elif humidity_bad:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="Humidity BAD Vote",
                    description=(
                        f"Humidity response was "
                        f"{sensor_assessment.humidity_response:.2f}%, "
                        f"meeting or exceeding the "
                        f"experimental BAD threshold of "
                        f"{self.HUMIDITY_BAD_THRESHOLD:.1f}%."
                    ),
                    status="danger",
                )
            )

        else:

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="Humidity GOOD Vote",
                    description=(
                        f"Humidity response was "
                        f"{sensor_assessment.humidity_response:.2f}%, "
                        f"below the experimental BAD "
                        f"threshold of "
                        f"{self.HUMIDITY_BAD_THRESHOLD:.1f}%."
                    ),
                    status="normal",
                )
            )


        # -------------------------------------------------
        # TEMPERATURE - SUPPORTING ONLY
        # -------------------------------------------------

        if (
            sensor_assessment.temperature_response
            is not None
        ):

            findings.append(
                QualityFinding(
                    category="sensor",
                    title="Temperature Supporting Reading",
                    description=(
                        f"Temperature response was "
                        f"{sensor_assessment.temperature_response:.2f} °C. "
                        f"Temperature is recorded as supporting "
                        f"environmental information and does not "
                        f"contribute a GOOD or BAD vote because "
                        f"the experimental GOOD and BAD ranges overlapped."
                    ),
                    status="info",
                )
            )


        # -------------------------------------------------
        # OVERALL SENSOR FINDING
        # -------------------------------------------------

        if available_vote_count < self.TOTAL_VOTING_SENSORS:

            findings.append(
                QualityFinding(
                    category="sensor",

                    title=(
                        "Sensor Result Requires Review"
                    ),

                    description=(
                        f"Only {available_vote_count} of "
                        f"{self.TOTAL_VOTING_SENSORS} voting sensor "
                        f"responses were available. A complete "
                        f"five-sensor quality decision could not "
                        f"be produced."
                    ),

                    status="warning",
                )
            )

            return findings


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
                        f"{bad_count} of "
                        f"{self.TOTAL_VOTING_SENSORS} sensors "
                        f"produced BAD votes. The sensor "
                        f"quality score is "
                        f"{sensor_assessment.sensor_score:.2f}/100, "
                        f"so the sample is classified as GOOD."
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
                        f"{bad_count} of "
                        f"{self.TOTAL_VOTING_SENSORS} sensors "
                        f"produced BAD votes. The sensor "
                        f"quality score is "
                        f"{sensor_assessment.sensor_score:.2f}/100, "
                        f"so the sample is classified as BAD."
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
                        f"{bad_count} of "
                        f"{self.TOTAL_VOTING_SENSORS} sensors "
                        f"produced BAD votes. Two BAD votes "
                        f"produce a REVIEW result. The sensor "
                        f"quality score is "
                        f"{sensor_assessment.sensor_score:.2f}/100."
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
                        f"{counts.unknown} "
                        f"{'bean' if counts.unknown == 1 else 'beans'} "
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
                        "Three or more of the five "
                        "voting sensors produced BAD "
                        "votes using the experimental "
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
                        "Exactly two of the five "
                        "voting sensors produced BAD "
                        "votes, so the sensor result "
                        "requires review."
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
        # ADVANCED PROCESSING INTELLIGENCE
        # -------------------------------------------------
        #
        # The processing-intelligence engine receives the
        # already-calculated quality assessment results.
        #
        # It generates:
        #
        # 1. Roasting recommendation
        # 2. Pre-roast preparation plan
        # 3. Roast quality risk
        # 4. Batch usage recommendation
        # 5. Estimated usable yield
        # 6. Final production decision
        #
        # -------------------------------------------------

        processing_counts = {

            "total_beans": (
                physical_assessment.total_beans
            ),

            "good": (
                physical_assessment.counts.good
            ),

            "broken": (
                physical_assessment.counts.broken
            ),

            "black": (
                physical_assessment.counts.black
            ),

            "black_and_broken": (
                physical_assessment
                .counts
                .black_and_broken
            ),

            "unknown": (
                physical_assessment.counts.unknown
            ),
        }


        # -------------------------------------------------
        # DEFECT-DRIVEN PROCESSING INTELLIGENCE INPUT
        # -------------------------------------------------
        #
        # Reuse the same research-defined sensor thresholds
        # already used by the five-vote sensor assessment.
        #
        # Temperature remains supporting information only
        # because the experimental GOOD and BAD ranges overlap.
        # No unvalidated temperature threshold is added here.
        #
        # -------------------------------------------------

        sensor_defects = {

            "mq2_abnormal": (
                self._is_bad_sensor_response(
                    "mq2",
                    sensor_assessment.mq2_response,
                )
                is True
            ),

            "mq3_abnormal": (
                self._is_bad_sensor_response(
                    "mq3",
                    sensor_assessment.mq3_response,
                )
                is True
            ),

            "mq135_abnormal": (
                self._is_bad_sensor_response(
                    "mq135",
                    sensor_assessment.mq135_response,
                )
                is True
            ),

            "moisture_defect": (
                self._is_bad_sensor_response(
                    "moisture",
                    sensor_assessment.moisture_response,
                )
                is True
            ),

            "temperature_abnormal": False,

            "humidity_abnormal": (
                self._is_bad_sensor_response(
                    "humidity",
                    sensor_assessment.humidity_response,
                )
                is True
            ),
        }


        # -------------------------------------------------
        # NORMALIZED DEFECT PROFILE
        # -------------------------------------------------
        #
        # Modules 1, 2, 3, 4, 6 and 7:
        #
        #   broken = broken + black_and_broken
        #   black  = black + black_and_broken
        #
        # Module 5 - Usable Yield:
        #
        #   good
        #   broken
        #   black
        #   black_and_broken
        #
        # remain separate.
        #
        # -------------------------------------------------

        defect_profile = build_defect_profile(
            sensor_defects=sensor_defects,
            counts=processing_counts,
        )


        # Temporary development log.
        # This lets us confirm the new normalized input before
        # replacing the old processing-intelligence service.

        print(
            "PROCESSING INTELLIGENCE DEFECT PROFILE:",
            defect_profile.model_dump(),
        )


        # -------------------------------------------------
        # EXISTING PROCESSING INTELLIGENCE
        # -------------------------------------------------
        #
        # Keep the old service call unchanged for this step.
        # The next migration step will update service.py to
        # consume defect_profile and generate the seven new
        # defect-driven modules.
        #
        # -------------------------------------------------

        processing_intelligence = (
            processing_intelligence_service.generate(

                sensor_status=(
                    sensor_assessment.status
                ),

                physical_status=(
                    physical_assessment.status
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

                counts=(
                    processing_counts
                ),

                sample_weight=(
                    request
                    .physical_result
                    .sample_weight
                ),

                weight_calibrated=(
                    request
                    .physical_result
                    .weight_calibrated
                ),

                defect_profile=(
                     defect_profile
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

            processing_intelligence=(
                processing_intelligence
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
                "assessment uses five equal-weight "
                "experimental votes from MQ-2, MQ-3, "
                "MQ-135, moisture, and humidity. Each "
                "BAD vote reduces the sensor score by "
                "20 points. Zero or one BAD vote is "
                "classified as GOOD, two BAD votes as "
                "REVIEW, and three or more BAD votes "
                "as BAD. Temperature is retained only "
                "as supporting environmental data "
                "because the observed GOOD and BAD "
                "temperature ranges overlapped. The "
                "sensor decision thresholds were "
                "derived from the experimental good "
                "and defective coffee bean samples "
                "collected for this research. The "
                "physical AI score uses weighted defect "
                "severity, where black and "
                "black-and-broken beans receive the "
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