from typing import Any, Dict, List

from .schema import (
    BatchUsageOption,
    BatchUsageRecommendation,
)


# =========================================================
# BATCH USAGE RECOMMENDATION SERVICE
# =========================================================

class BatchUsageService:

    # =====================================================
    # RESEARCH-DEFINED THRESHOLDS
    # =====================================================
    #
    # These thresholds are used only for this research
    # decision-support system.
    #
    # They are NOT official SCA commercial grading rules.
    # =====================================================

    SEVERE_LOW_PERCENTAGE = 5.0

    SEVERE_HIGH_PERCENTAGE = 20.0

    BROKEN_LOW_PERCENTAGE = 5.0

    BROKEN_HIGH_PERCENTAGE = 15.0

    UNKNOWN_WARNING_PERCENTAGE = 3.0


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
    # CREATE USAGE OPTION
    # =====================================================

    @staticmethod
    def _create_usage_option(
        *,
        use_case: str,
        suitability: str,
        explanation: str,
        conditions: List[str] | None = None,
    ) -> BatchUsageOption:

        return BatchUsageOption(

            use_case=use_case,

            suitability=suitability,

            explanation=explanation,

            conditions=(
                conditions
                or []
            ),
        )


    # =====================================================
    # GENERATE BATCH USAGE RECOMMENDATION
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
    ) -> BatchUsageRecommendation:

        # -------------------------------------------------
        # NORMALIZE
        # -------------------------------------------------

        sensor_status = (
            sensor_status
            or "SKIPPED"
        ).upper()


        physical_status = (
            physical_status
            or "NO_DATA"
        ).upper()


        grade = (
            grade
            or "Reject"
        )


        quality_status = (
            quality_status
            or "Needs Review"
        )


        final_score = self._safe_float(
            final_score
        )


        # -------------------------------------------------
        # COUNTS
        # -------------------------------------------------

        total = self._safe_int(
            counts.get(
                "total_beans",
                0,
            )
        )


        good = self._safe_int(
            counts.get(
                "good",
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


        black_and_broken = (
            self._safe_int(
                counts.get(
                    "black_and_broken",
                    0,
                )
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

        good_percentage = (
            self._percentage(
                good,
                total,
            )
        )


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
        # DEFAULT FLAGS
        # -------------------------------------------------

        direct_use_allowed = False

        rework_required = False

        sorting_required = False

        reinspection_required = False

        blend_evaluation_required = False

        restrictions: List[str] = []

        alternative_uses: List[str] = []

        usage_options: List[
            BatchUsageOption
        ] = []


        # =================================================
        # NO PHYSICAL INSPECTION DATA
        # =================================================

        if (
            total <= 0
            or
            physical_status
            == "NO_DATA"
        ):

            usage_options.extend(
                [
                    self._create_usage_option(
                        use_case=(
                            "Premium Product Evaluation"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "Physical bean quality data "
                            "is incomplete."
                        ),
                        conditions=[
                            (
                                "Complete physical AI "
                                "inspection first."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Standard Coffee Product"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "The batch cannot be released "
                            "for production use without "
                            "physical quality evidence."
                        ),
                        conditions=[
                            (
                                "Complete inspection and "
                                "generate a new report."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Commercial Blend"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "Blend suitability cannot be "
                            "evaluated until inspection "
                            "is complete."
                        ),
                        conditions=[
                            (
                                "Complete physical quality "
                                "assessment."
                            ),
                        ],
                    ),
                ]
            )


            return BatchUsageRecommendation(

                primary_recommendation=(
                    "INSPECTION_REQUIRED"
                ),

                title=(
                    "Batch Usage Cannot Be Determined"
                ),

                summary=(
                    "The system does not have enough "
                    "physical quality data to recommend "
                    "a production use for this batch."
                ),

                recommended_use=(
                    "Complete quality inspection before "
                    "assigning the batch to a product."
                ),

                alternative_uses=[],

                usage_options=(
                    usage_options
                ),

                direct_use_allowed=False,

                rework_required=False,

                sorting_required=False,

                reinspection_required=True,

                blend_evaluation_required=False,

                good_percentage=0.0,

                broken_percentage=0.0,

                severe_defect_percentage=0.0,

                unknown_percentage=0.0,

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
                ),

                final_grade=(
                    grade
                ),

                restrictions=[
                    (
                        "Do not assign the batch to "
                        "production before physical "
                        "inspection is completed."
                    ),
                ],

                methodology_note=(
                    "Batch usage recommendations require "
                    "both physical defect information "
                    "and overall quality assessment. "
                    "The recommendations are "
                    "research-defined and are not "
                    "official commercial coffee grades."
                ),
            )


        # =================================================
        # COMMON QUALITY FLAGS
        # =================================================

        if (
            severe_defect_count
            > 0
        ):
            sorting_required = True


        if (
            broken_percentage
            >= self.BROKEN_LOW_PERCENTAGE
        ):
            sorting_required = True


        if (
            unknown_percentage
            > 0
        ):
            reinspection_required = True


        if (
            sensor_status
            in {
                "BAD",
                "REVIEW",
                "SKIPPED",
            }
        ):
            reinspection_required = True


        if (
            physical_status
            in {
                "POOR",
                "REVIEW",
            }
        ):
            reinspection_required = True


        # =================================================
        # REJECT CONDITION
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

            restrictions.extend(
                [
                    (
                        "Do not use the batch directly "
                        "for normal production."
                    ),
                    (
                        "Do not release the current batch "
                        "to roasting without corrective "
                        "action and reassessment."
                    ),
                ]
            )


            usage_options.extend(
                [
                    self._create_usage_option(
                        use_case=(
                            "Premium Product Evaluation"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "The current quality condition "
                            "does not support premium "
                            "product evaluation."
                        ),
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Standard Coffee Product"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "The batch does not currently "
                            "meet the research system's "
                            "minimum condition for direct "
                            "standard product use."
                        ),
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Commercial Blend"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "Direct blending is not "
                            "recommended while the batch "
                            "remains in a reject condition."
                        ),
                        conditions=[
                            (
                                "Consider only after major "
                                "rework and complete "
                                "reinspection."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Rework / Secondary Processing"
                        ),
                        suitability=(
                            "CONDITIONAL"
                        ),
                        explanation=(
                            "The batch may be evaluated "
                            "for recovery through sorting "
                            "and quality reassessment."
                        ),
                        conditions=[
                            (
                                "Remove severe defects."
                            ),
                            (
                                "Repeat sensor analysis."
                            ),
                            (
                                "Repeat physical AI "
                                "inspection."
                            ),
                        ],
                    ),
                ]
            )


            return BatchUsageRecommendation(

                primary_recommendation=(
                    "REJECT"
                ),

                title=(
                    "Batch Not Recommended for "
                    "Direct Production Use"
                ),

                summary=(
                    "The current quality result indicates "
                    "that the batch should not be used "
                    "directly in normal production."
                ),

                recommended_use=(
                    "Hold or reject the batch. "
                    "Only evaluate recovery after major "
                    "re-sorting and complete quality "
                    "reassessment."
                ),

                alternative_uses=[
                    (
                        "Rework / secondary sorting "
                        "followed by reassessment."
                    ),
                ],

                usage_options=(
                    usage_options
                ),

                direct_use_allowed=False,

                rework_required=True,

                sorting_required=True,

                reinspection_required=True,

                blend_evaluation_required=False,

                good_percentage=(
                    good_percentage
                ),

                broken_percentage=(
                    broken_percentage
                ),

                severe_defect_percentage=(
                    severe_defect_percentage
                ),

                unknown_percentage=(
                    unknown_percentage
                ),

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
                ),

                final_grade=(
                    grade
                ),

                restrictions=(
                    restrictions
                ),

                methodology_note=(
                    "The REJECT recommendation is a "
                    "research-defined system decision. "
                    "It is not an official SCA grade or "
                    "commercial classification."
                ),
            )


        # =================================================
        # MAJOR REWORK CONDITION
        # =================================================

        if (
            physical_status == "POOR"
            or
            severe_defect_percentage
            >= self.SEVERE_HIGH_PERCENTAGE
            or
            quality_status
            == "Needs Review"
        ):

            rework_required = True

            sorting_required = True

            reinspection_required = True

            blend_evaluation_required = True


            restrictions.extend(
                [
                    (
                        "Do not use this batch directly "
                        "for premium or standard product "
                        "production."
                    ),
                    (
                        "Remove severe defects before "
                        "evaluating any production use."
                    ),
                    (
                        "Repeat quality inspection after "
                        "re-sorting."
                    ),
                ]
            )


            usage_options.extend(
                [
                    self._create_usage_option(
                        use_case=(
                            "Premium Product Evaluation"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "The current defect profile "
                            "contains excessive quality "
                            "variation for premium product "
                            "evaluation."
                        ),
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Standard Coffee Product"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "Direct standard product use "
                            "is not recommended before "
                            "corrective sorting."
                        ),
                        conditions=[
                            (
                                "Improve batch quality "
                                "through sorting and "
                                "reinspection."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Commercial Blend"
                        ),
                        suitability=(
                            "CONDITIONAL"
                        ),
                        explanation=(
                            "The batch may potentially be "
                            "considered for a commercial "
                            "blend after severe defects "
                            "are removed."
                        ),
                        conditions=[
                            (
                                "Complete secondary "
                                "sorting."
                            ),
                            (
                                "Repeat physical AI "
                                "inspection."
                            ),
                            (
                                "Confirm acceptable "
                                "quality after rework."
                            ),
                            (
                                "Perform separate blend "
                                "evaluation before use."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Economy Product"
                        ),
                        suitability=(
                            "CONDITIONAL"
                        ),
                        explanation=(
                            "Lower-tier product use may "
                            "be evaluated only after "
                            "quality correction and "
                            "reinspection."
                        ),
                        conditions=[
                            (
                                "Remove severe defects."
                            ),
                            (
                                "Pass post-rework quality "
                                "inspection."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Rework / Secondary Processing"
                        ),
                        suitability=(
                            "SUITABLE"
                        ),
                        explanation=(
                            "The current batch should "
                            "first be directed to "
                            "corrective sorting and "
                            "quality recovery."
                        ),
                        conditions=[
                            (
                                "Remove black beans."
                            ),
                            (
                                "Remove black-and-broken "
                                "beans."
                            ),
                            (
                                "Sort broken beans."
                            ),
                            (
                                "Inspect uncertain beans."
                            ),
                        ],
                    ),
                ]
            )


            return BatchUsageRecommendation(

                primary_recommendation=(
                    "REWORK_ONLY"
                ),

                title=(
                    "Rework Required Before Product Use"
                ),

                summary=(
                    "The batch should not be assigned "
                    "directly to a finished coffee "
                    "product. Corrective sorting and "
                    "reinspection are required first."
                ),

                recommended_use=(
                    "Secondary sorting and quality "
                    "reassessment before any production "
                    "allocation."
                ),

                alternative_uses=[
                    (
                        "Commercial blend evaluation "
                        "after successful rework."
                    ),
                    (
                        "Economy product evaluation "
                        "after successful rework."
                    ),
                ],

                usage_options=(
                    usage_options
                ),

                direct_use_allowed=False,

                rework_required=True,

                sorting_required=(
                    sorting_required
                ),

                reinspection_required=True,

                blend_evaluation_required=True,

                good_percentage=(
                    good_percentage
                ),

                broken_percentage=(
                    broken_percentage
                ),

                severe_defect_percentage=(
                    severe_defect_percentage
                ),

                unknown_percentage=(
                    unknown_percentage
                ),

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
                ),

                final_grade=(
                    grade
                ),

                restrictions=(
                    restrictions
                ),

                methodology_note=(
                    "Commercial blend and economy "
                    "product suggestions are only "
                    "decision-support options. Exact "
                    "blend ratios and final product "
                    "quality require separate roasting "
                    "and sensory validation."
                ),
            )


        # =================================================
        # GRADE A — HIGH QUALITY CONDITION
        # =================================================

        if (
            grade == "A"
            and
            sensor_status == "GOOD"
            and
            physical_status
            in {
                "EXCELLENT",
                "GOOD",
            }
            and
            severe_defect_percentage
            < self.SEVERE_LOW_PERCENTAGE
        ):

            direct_use_allowed = True


            usage_options.extend(
                [
                    self._create_usage_option(
                        use_case=(
                            "Premium Product Evaluation"
                        ),
                        suitability=(
                            "CONDITIONAL"
                        ),
                        explanation=(
                            "The raw-bean quality profile "
                            "supports further premium "
                            "product evaluation."
                        ),
                        conditions=[
                            (
                                "Confirm roast performance."
                            ),
                            (
                                "Perform sensory / cupping "
                                "evaluation before making "
                                "a premium product claim."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Standard Coffee Product"
                        ),
                        suitability=(
                            "SUITABLE"
                        ),
                        explanation=(
                            "The current quality profile "
                            "supports standard production "
                            "use after normal preparation."
                        ),
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Commercial Blend"
                        ),
                        suitability=(
                            "SUITABLE"
                        ),
                        explanation=(
                            "The batch can also be "
                            "evaluated as a quality "
                            "component of a commercial "
                            "blend."
                        ),
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Economy Product"
                        ),
                        suitability=(
                            "SUITABLE"
                        ),
                        explanation=(
                            "The batch quality is adequate "
                            "for this use, although higher "
                            "value product evaluation may "
                            "be more appropriate."
                        ),
                    ),
                ]
            )


            return BatchUsageRecommendation(

                primary_recommendation=(
                    "PREMIUM_EVALUATION"
                ),

                title=(
                    "High-Quality Batch Usage Potential"
                ),

                summary=(
                    "The current sensor and physical "
                    "quality profile supports normal "
                    "production and further evaluation "
                    "for higher-value product use."
                ),

                recommended_use=(
                    "Standard production or premium "
                    "product evaluation after roasting "
                    "and sensory validation."
                ),

                alternative_uses=[
                    (
                        "Standard coffee product."
                    ),
                    (
                        "Commercial blend component."
                    ),
                ],

                usage_options=(
                    usage_options
                ),

                direct_use_allowed=True,

                rework_required=False,

                sorting_required=(
                    sorting_required
                ),

                reinspection_required=(
                    reinspection_required
                ),

                blend_evaluation_required=False,

                good_percentage=(
                    good_percentage
                ),

                broken_percentage=(
                    broken_percentage
                ),

                severe_defect_percentage=(
                    severe_defect_percentage
                ),

                unknown_percentage=(
                    unknown_percentage
                ),

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
                ),

                final_grade=(
                    grade
                ),

                restrictions=[
                    (
                        "Raw-bean quality alone cannot "
                        "confirm premium cup quality."
                    ),
                    (
                        "Premium positioning requires "
                        "roast and sensory evaluation."
                    ),
                ],

                methodology_note=(
                    "Premium evaluation means that the "
                    "batch may proceed to further "
                    "high-quality product assessment. "
                    "The system does not claim premium "
                    "coffee status from visual and sensor "
                    "analysis alone."
                ),
            )


        # =================================================
        # GRADE B — STANDARD PRODUCT CONDITION
        # =================================================

        if (
            grade == "B"
        ):

            if (
                severe_defect_percentage
                > 0
                or
                broken_percentage
                >= self.BROKEN_LOW_PERCENTAGE
            ):
                sorting_required = True


            rework_required = (
                sorting_required
            )


            direct_use_allowed = (
                not sorting_required
                and
                sensor_status
                == "GOOD"
                and
                physical_status
                in {
                    "EXCELLENT",
                    "GOOD",
                }
            )


            usage_options.extend(
                [
                    self._create_usage_option(
                        use_case=(
                            "Premium Product Evaluation"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "The current Grade B profile "
                            "is not sufficient for premium "
                            "product recommendation from "
                            "this system."
                        ),
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Standard Coffee Product"
                        ),
                        suitability=(
                            "CONDITIONAL"
                            if sorting_required
                            else "SUITABLE"
                        ),
                        explanation=(
                            "The batch may be suitable "
                            "for standard production "
                            "depending on completion of "
                            "the required quality "
                            "preparation."
                        ),
                        conditions=(
                            [
                                (
                                    "Complete sorting and "
                                    "reinspection."
                                ),
                            ]
                            if sorting_required
                            else []
                        ),
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Commercial Blend"
                        ),
                        suitability=(
                            "SUITABLE"
                            if not sorting_required
                            else "CONDITIONAL"
                        ),
                        explanation=(
                            "The batch may be evaluated "
                            "for use as a commercial blend "
                            "component."
                        ),
                        conditions=[
                            (
                                "Perform blend-specific "
                                "quality evaluation before "
                                "production."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Economy Product"
                        ),
                        suitability=(
                            "SUITABLE"
                        ),
                        explanation=(
                            "The current quality level can "
                            "support lower-tier product "
                            "evaluation after required "
                            "quality controls."
                        ),
                    ),
                ]
            )


            return BatchUsageRecommendation(

                primary_recommendation=(
                    "STANDARD_PRODUCT"
                    if not sorting_required
                    else "COMMERCIAL_BLEND"
                ),

                title=(
                    "Standard Production Use "
                    "Recommended"
                    if not sorting_required
                    else
                    "Conditional Product Use "
                    "Recommended"
                ),

                summary=(
                    "The Grade B batch has usable "
                    "production potential, but detected "
                    "defects determine whether sorting "
                    "is required before use."
                ),

                recommended_use=(
                    "Standard coffee production."
                    if not sorting_required
                    else
                    "Re-sort the batch and evaluate it "
                    "for standard production or a "
                    "commercial blend."
                ),

                alternative_uses=[
                    (
                        "Commercial blend."
                    ),
                    (
                        "Economy product."
                    ),
                ],

                usage_options=(
                    usage_options
                ),

                direct_use_allowed=(
                    direct_use_allowed
                ),

                rework_required=(
                    rework_required
                ),

                sorting_required=(
                    sorting_required
                ),

                reinspection_required=(
                    sorting_required
                    or
                    reinspection_required
                ),

                blend_evaluation_required=True,

                good_percentage=(
                    good_percentage
                ),

                broken_percentage=(
                    broken_percentage
                ),

                severe_defect_percentage=(
                    severe_defect_percentage
                ),

                unknown_percentage=(
                    unknown_percentage
                ),

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
                ),

                final_grade=(
                    grade
                ),

                restrictions=[
                    (
                        "Premium product quality is not "
                        "confirmed by this Grade B result."
                    ),
                    (
                        "Exact commercial blend ratio is "
                        "not generated by the current "
                        "system."
                    ),
                ],

                methodology_note=(
                    "Grade B usage recommendations are "
                    "research-defined. Final product "
                    "allocation should consider roasting "
                    "performance and sensory quality."
                ),
            )


        # =================================================
        # GRADE C — LOWER QUALITY / COMMERCIAL USE
        # =================================================

        if (
            grade == "C"
        ):

            rework_required = True

            sorting_required = True

            reinspection_required = True

            blend_evaluation_required = True


            usage_options.extend(
                [
                    self._create_usage_option(
                        use_case=(
                            "Premium Product Evaluation"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "The current quality profile "
                            "does not support premium "
                            "product evaluation."
                        ),
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Standard Coffee Product"
                        ),
                        suitability=(
                            "NOT_RECOMMENDED"
                        ),
                        explanation=(
                            "Direct standard product use "
                            "is not recommended at the "
                            "current quality level."
                        ),
                        conditions=[
                            (
                                "Quality must improve after "
                                "rework before reconsidering "
                                "standard product use."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Commercial Blend"
                        ),
                        suitability=(
                            "CONDITIONAL"
                        ),
                        explanation=(
                            "Commercial blend use may be "
                            "evaluated after corrective "
                            "sorting and reinspection."
                        ),
                        conditions=[
                            (
                                "Remove severe defects."
                            ),
                            (
                                "Repeat quality assessment."
                            ),
                            (
                                "Perform blend-specific "
                                "evaluation."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Economy Product"
                        ),
                        suitability=(
                            "CONDITIONAL"
                        ),
                        explanation=(
                            "Economy product use may be "
                            "considered after successful "
                            "rework and quality approval."
                        ),
                        conditions=[
                            (
                                "Complete secondary sorting."
                            ),
                            (
                                "Pass post-rework "
                                "inspection."
                            ),
                        ],
                    ),

                    self._create_usage_option(
                        use_case=(
                            "Rework / Secondary Processing"
                        ),
                        suitability=(
                            "SUITABLE"
                        ),
                        explanation=(
                            "Corrective processing is the "
                            "recommended immediate use of "
                            "the current batch."
                        ),
                    ),
                ]
            )


            return BatchUsageRecommendation(

                primary_recommendation=(
                    "REWORK_ONLY"
                ),

                title=(
                    "Rework Before Commercial Use"
                ),

                summary=(
                    "The Grade C quality profile "
                    "requires corrective processing "
                    "before the batch is allocated to "
                    "a finished product."
                ),

                recommended_use=(
                    "Re-sort and re-test the batch, "
                    "then evaluate commercial blend or "
                    "economy product use."
                ),

                alternative_uses=[
                    (
                        "Commercial blend after "
                        "successful rework."
                    ),
                    (
                        "Economy product after "
                        "successful rework."
                    ),
                ],

                usage_options=(
                    usage_options
                ),

                direct_use_allowed=False,

                rework_required=True,

                sorting_required=True,

                reinspection_required=True,

                blend_evaluation_required=True,

                good_percentage=(
                    good_percentage
                ),

                broken_percentage=(
                    broken_percentage
                ),

                severe_defect_percentage=(
                    severe_defect_percentage
                ),

                unknown_percentage=(
                    unknown_percentage
                ),

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
                ),

                final_grade=(
                    grade
                ),

                restrictions=[
                    (
                        "Do not use directly for premium "
                        "or standard product production."
                    ),
                    (
                        "Commercial or economy use "
                        "requires successful rework."
                    ),
                ],

                methodology_note=(
                    "Grade C usage recommendations are "
                    "research-defined and require "
                    "post-rework validation before "
                    "production use."
                ),
            )


        # =================================================
        # FALLBACK
        # =================================================

        return BatchUsageRecommendation(

            primary_recommendation=(
                "INSPECTION_REQUIRED"
            ),

            title=(
                "Additional Quality Review Required"
            ),

            summary=(
                "The available quality combination does "
                "not support an automatic batch usage "
                "decision."
            ),

            recommended_use=(
                "Hold the batch for manual quality "
                "review and repeat inspection."
            ),

            alternative_uses=[],

            usage_options=[
                self._create_usage_option(
                    use_case=(
                        "Production Use"
                    ),
                    suitability=(
                        "CONDITIONAL"
                    ),
                    explanation=(
                        "A complete quality review is "
                        "required before product "
                        "allocation."
                    ),
                    conditions=[
                        (
                            "Repeat quality inspection."
                        ),
                    ],
                ),
            ],

            direct_use_allowed=False,

            rework_required=False,

            sorting_required=(
                sorting_required
            ),

            reinspection_required=True,

            blend_evaluation_required=False,

            good_percentage=(
                good_percentage
            ),

            broken_percentage=(
                broken_percentage
            ),

            severe_defect_percentage=(
                severe_defect_percentage
            ),

            unknown_percentage=(
                unknown_percentage
            ),

            sensor_status=(
                sensor_status
            ),

            physical_status=(
                physical_status
            ),

            final_grade=(
                grade
            ),

            restrictions=[
                (
                    "Manual quality review is required "
                    "before production use."
                ),
            ],

            methodology_note=(
                "This fallback prevents automatic "
                "product allocation when the quality "
                "combination is uncertain."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

batch_usage_service = (
    BatchUsageService()
)