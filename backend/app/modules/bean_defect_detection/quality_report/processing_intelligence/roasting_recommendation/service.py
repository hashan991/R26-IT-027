from typing import Any, Dict

from .schema import RoastingRecommendation


# =========================================================
# ROASTING RECOMMENDATION SERVICE
# =========================================================

class RoastingRecommendationService:

    # =====================================================
    # RESEARCH-DEFINED RULE THRESHOLDS
    # =====================================================
    #
    # These values are used only for this research system's
    # decision-support logic.
    #
    # They are NOT official SCA roasting standards.
    # =====================================================

    BROKEN_LOW_THRESHOLD = 5.0
    BROKEN_HIGH_THRESHOLD = 15.0

    SEVERE_LOW_THRESHOLD = 5.0
    SEVERE_HIGH_THRESHOLD = 20.0

    UNKNOWN_WARNING_THRESHOLD = 3.0


    # =====================================================
    # SAFE INTEGER
    # =====================================================

    @staticmethod
    def _safe_int(
        value: Any,
        default: int = 0,
    ) -> int:

        try:
            return int(value)

        except (
            TypeError,
            ValueError,
        ):
            return default


    # =====================================================
    # SAFE FLOAT
    # =====================================================

    @staticmethod
    def _safe_float(
        value: Any,
        default: float = 0.0,
    ) -> float:

        try:
            return float(value)

        except (
            TypeError,
            ValueError,
        ):
            return default


    # =====================================================
    # PERCENTAGE
    # =====================================================

    @staticmethod
    def _percentage(
        count: int,
        total: int,
    ) -> float:

        if total <= 0:
            return 0.0

        return round(
            (
                count
                / total
            )
            * 100,
            2,
        )


    # =====================================================
    # GENERATE ROASTING RECOMMENDATION
    # =====================================================

    def generate(
        self,
        *,
        sensor_status: str,
        physical_status: str,
        final_score: float,
        grade: str,
        quality_status: str,
        counts: Dict[str, Any],
    ) -> RoastingRecommendation:

        # -------------------------------------------------
        # NORMALIZE INPUTS
        # -------------------------------------------------

        sensor_status = (
            sensor_status
            or "SKIPPED"
        ).upper()


        physical_status = (
            physical_status
            or "NO_DATA"
        ).upper()


        quality_status = (
            quality_status
            or "Needs Review"
        )


        grade = (
            grade
            or "Reject"
        )


        final_score = self._safe_float(
            final_score
        )


        # -------------------------------------------------
        # DEFECT COUNTS
        # -------------------------------------------------

        total = self._safe_int(
            counts.get(
                "total_beans",
                0,
            )
        )


        broken = self._safe_int(
            counts.get(
                "broken",
                0,
            )
        )


        black = self._safe_int(
            counts.get(
                "black",
                0,
            )
        )


        black_and_broken = self._safe_int(
            counts.get(
                "black_and_broken",
                0,
            )
        )


        unknown = self._safe_int(
            counts.get(
                "unknown",
                0,
            )
        )


        # -------------------------------------------------
        # PERCENTAGES
        # -------------------------------------------------

        broken_percentage = (
            self._percentage(
                broken,
                total,
            )
        )


        severe_defect_count = (
            black
            + black_and_broken
        )


        severe_defect_percentage = (
            self._percentage(
                severe_defect_count,
                total,
            )
        )


        unknown_percentage = (
            self._percentage(
                unknown,
                total,
            )
        )


        # -------------------------------------------------
        # COMMON OUTPUT ARRAYS
        # -------------------------------------------------

        reasons = []

        prerequisites = []

        warnings = []


        # =================================================
        # NO PHYSICAL DATA
        # =================================================

        if (
            total <= 0
            or
            physical_status == "NO_DATA"
        ):

            return RoastingRecommendation(

                roasting_eligibility=(
                    "CONDITIONAL"
                ),

                direct_roasting_allowed=False,

                recommended_direction=(
                    "RE_INSPECT_BEFORE_ROASTING"
                ),

                title=(
                    "Physical Inspection Required "
                    "Before Roasting"
                ),

                summary=(
                    "The system does not have enough "
                    "physical AI inspection data to "
                    "support a direct roasting decision."
                ),

                reasons=[
                    (
                        "Physical bean quality data "
                        "is unavailable or incomplete."
                    ),
                ],

                prerequisites=[
                    (
                        "Complete the physical AI "
                        "inspection."
                    ),
                    (
                        "Generate a new quality "
                        "assessment before roasting."
                    ),
                ],

                warnings=[
                    (
                        "Direct roasting is not "
                        "recommended without complete "
                        "physical quality evidence."
                    ),
                ],

                broken_percentage=0.0,

                severe_defect_percentage=0.0,

                unknown_percentage=0.0,

                methodology_note=(
                    "This roasting recommendation is "
                    "a research-defined decision-support "
                    "output based on the available raw "
                    "bean quality assessment. It is not "
                    "an official roasting standard."
                ),
            )


        # =================================================
        # BUILD REASONS
        # =================================================

        if (
            severe_defect_percentage
            > 0
        ):
            reasons.append(
                (
                    f"{severe_defect_percentage:.2f}% "
                    "of inspected beans contain severe "
                    "black or black-and-broken defects."
                )
            )


        if (
            broken_percentage
            > 0
        ):
            reasons.append(
                (
                    f"{broken_percentage:.2f}% "
                    "of inspected beans were classified "
                    "as broken or chipped."
                )
            )


        if (
            unknown_percentage
            > 0
        ):
            reasons.append(
                (
                    f"{unknown_percentage:.2f}% "
                    "of inspected beans remain "
                    "uncertain."
                )
            )


        if (
            sensor_status == "GOOD"
        ):
            reasons.append(
                (
                    "The sensor assessment is "
                    "consistent with the experimental "
                    "good-bean profile."
                )
            )


        elif (
            sensor_status == "REVIEW"
        ):
            reasons.append(
                (
                    "The sensor assessment requires "
                    "additional review."
                )
            )


        elif (
            sensor_status == "BAD"
        ):
            reasons.append(
                (
                    "The sensor assessment indicates "
                    "a defective bean profile."
                )
            )


        elif (
            sensor_status == "SKIPPED"
        ):
            reasons.append(
                (
                    "The sensor quality assessment "
                    "was skipped."
                )
            )


        # =================================================
        # CRITICAL / REJECT CONDITION
        # =================================================

        if (
            grade == "Reject"
            or
            (
                sensor_status == "BAD"
                and
                physical_status == "POOR"
            )
        ):

            prerequisites.extend(
                [
                    (
                        "Do not send the current batch "
                        "directly to roasting."
                    ),
                    (
                        "Perform intensive re-sorting "
                        "or reject the affected batch."
                    ),
                    (
                        "Repeat sensor and physical AI "
                        "quality inspections after any "
                        "corrective action."
                    ),
                ]
            )


            warnings.append(
                (
                    "The current quality condition "
                    "presents a high risk of producing "
                    "an inconsistent or defective "
                    "roasted batch."
                )
            )


            return RoastingRecommendation(

                roasting_eligibility=(
                    "NOT_RECOMMENDED"
                ),

                direct_roasting_allowed=False,

                recommended_direction=(
                    "DO_NOT_ROAST"
                ),

                title=(
                    "Roasting Not Recommended"
                ),

                summary=(
                    "The current raw coffee bean batch "
                    "does not meet the research system's "
                    "minimum condition for direct "
                    "roasting."
                ),

                reasons=reasons,

                prerequisites=prerequisites,

                warnings=warnings,

                broken_percentage=(
                    broken_percentage
                ),

                severe_defect_percentage=(
                    severe_defect_percentage
                ),

                unknown_percentage=(
                    unknown_percentage
                ),

                methodology_note=(
                    "The recommendation is generated "
                    "using research-defined raw-bean "
                    "quality rules. Exact roast "
                    "temperature and time are not "
                    "generated from the current inputs."
                ),
            )


        # =================================================
        # SEVERE PHYSICAL DEFECT CONDITION
        # =================================================

        if (
            physical_status == "POOR"
            or
            severe_defect_percentage
            >= self.SEVERE_HIGH_THRESHOLD
        ):

            prerequisites.extend(
                [
                    (
                        "Remove black beans before "
                        "roasting."
                    ),
                    (
                        "Remove black-and-broken beans "
                        "before roasting."
                    ),
                    (
                        "Perform secondary sorting."
                    ),
                    (
                        "Repeat physical AI inspection "
                        "after sorting."
                    ),
                ]
            )


            if (
                sensor_status
                in {
                    "BAD",
                    "REVIEW",
                    "SKIPPED",
                }
            ):
                prerequisites.append(
                    (
                        "Repeat the sensor assessment "
                        "before releasing the batch to "
                        "roasting."
                    )
                )


            warnings.append(
                (
                    "Direct roasting may carry a high "
                    "quality risk because severe "
                    "physical defects are present."
                )
            )


            return RoastingRecommendation(

                roasting_eligibility=(
                    "CONDITIONAL"
                ),

                direct_roasting_allowed=False,

                recommended_direction=(
                    "RE_SORT_BEFORE_ROASTING"
                ),

                title=(
                    "Re-Sort Before Roasting"
                ),

                summary=(
                    "The batch may only be considered "
                    "for roasting after severe defects "
                    "are removed and the batch is "
                    "re-inspected."
                ),

                reasons=reasons,

                prerequisites=prerequisites,

                warnings=warnings,

                broken_percentage=(
                    broken_percentage
                ),

                severe_defect_percentage=(
                    severe_defect_percentage
                ),

                unknown_percentage=(
                    unknown_percentage
                ),

                methodology_note=(
                    "This recommendation uses "
                    "research-defined defect severity "
                    "rules and does not represent an "
                    "official SCA roast profile."
                ),
            )


        # =================================================
        # SENSOR BAD / REVIEW CONDITION
        # =================================================

        if (
            sensor_status
            in {
                "BAD",
                "REVIEW",
                "SKIPPED",
            }
        ):

            prerequisites.append(
                (
                    "Repeat or review the sensor "
                    "assessment before roasting."
                )
            )


            prerequisites.append(
                (
                    "Confirm that the batch passes "
                    "quality inspection after review."
                )
            )


            warnings.append(
                (
                    "The sensor condition does not "
                    "support unconditional release "
                    "for roasting."
                )
            )


            return RoastingRecommendation(

                roasting_eligibility=(
                    "CONDITIONAL"
                ),

                direct_roasting_allowed=False,

                recommended_direction=(
                    "RE_INSPECT_BEFORE_ROASTING"
                ),

                title=(
                    "Quality Reinspection Required"
                ),

                summary=(
                    "Physical quality may be acceptable, "
                    "but the sensor assessment requires "
                    "review before the batch proceeds "
                    "to roasting."
                ),

                reasons=reasons,

                prerequisites=prerequisites,

                warnings=warnings,

                broken_percentage=(
                    broken_percentage
                ),

                severe_defect_percentage=(
                    severe_defect_percentage
                ),

                unknown_percentage=(
                    unknown_percentage
                ),

                methodology_note=(
                    "The roasting release decision "
                    "requires both sensor and physical "
                    "quality information. This is a "
                    "research-defined decision rule."
                ),
            )


        # =================================================
        # MODERATE DEFECT CONDITION
        # =================================================

        if (
            broken_percentage
            >= self.BROKEN_LOW_THRESHOLD
            or
            severe_defect_percentage
            >= self.SEVERE_LOW_THRESHOLD
            or
            unknown_percentage
            >= self.UNKNOWN_WARNING_THRESHOLD
            or
            grade in {
                "B",
                "C",
            }
            or
            quality_status
            == "Needs Review"
        ):

            if (
                severe_defect_percentage
                > 0
            ):
                prerequisites.append(
                    (
                        "Remove identified black and "
                        "black-and-broken defects."
                    )
                )


            if (
                broken_percentage
                >= self.BROKEN_LOW_THRESHOLD
            ):
                prerequisites.append(
                    (
                        "Perform secondary sorting "
                        "to reduce broken beans."
                    )
                )


            if (
                unknown_percentage
                >= self.UNKNOWN_WARNING_THRESHOLD
            ):
                prerequisites.append(
                    (
                        "Manually inspect uncertain "
                        "bean classifications."
                    )
                )


            prerequisites.append(
                (
                    "Verify the batch condition before "
                    "starting the roasting stage."
                )
            )


            warnings.append(
                (
                    "The batch contains quality "
                    "variation that may reduce roasting "
                    "uniformity."
                )
            )


            return RoastingRecommendation(

                roasting_eligibility=(
                    "CONDITIONAL"
                ),

                direct_roasting_allowed=False,

                recommended_direction=(
                    "CONTROLLED_ROASTING"
                ),

                title=(
                    "Conditional Roasting Recommended"
                ),

                summary=(
                    "The batch can potentially proceed "
                    "to roasting after the recommended "
                    "quality preparation steps are "
                    "completed."
                ),

                reasons=reasons,

                prerequisites=prerequisites,

                warnings=warnings,

                broken_percentage=(
                    broken_percentage
                ),

                severe_defect_percentage=(
                    severe_defect_percentage
                ),

                unknown_percentage=(
                    unknown_percentage
                ),

                methodology_note=(
                    "Controlled roasting refers to "
                    "additional process attention and "
                    "quality monitoring. Exact roast "
                    "temperature, time, and curve are "
                    "not predicted by the current "
                    "quality model."
                ),
            )


        # =================================================
        # HIGH-QUALITY CONDITION
        # =================================================

        reasons.append(
            (
                f"The final quality score is "
                f"{final_score:.2f}/100 with "
                f"research-defined Grade {grade}."
            )
        )


        prerequisites.append(
            (
                "Complete the normal pre-roast "
                "cleaning and preparation process."
            )
        )


        return RoastingRecommendation(

            roasting_eligibility="READY",

            direct_roasting_allowed=True,

            recommended_direction=(
                "STANDARD_ROASTING"
            ),

            title=(
                "Batch Ready for Roasting"
            ),

            summary=(
                "The combined sensor and physical "
                "quality assessment supports release "
                "of the batch to the roasting stage."
            ),

            reasons=reasons,

            prerequisites=prerequisites,

            warnings=[],

            broken_percentage=(
                broken_percentage
            ),

            severe_defect_percentage=(
                severe_defect_percentage
            ),

            unknown_percentage=(
                unknown_percentage
            ),

            methodology_note=(
                "This is a research-defined roasting "
                "release recommendation based on raw "
                "bean quality. Roast temperature, "
                "duration, and detailed roast curve "
                "require additional roasting-specific "
                "inputs."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

roasting_recommendation_service = (
    RoastingRecommendationService()
)