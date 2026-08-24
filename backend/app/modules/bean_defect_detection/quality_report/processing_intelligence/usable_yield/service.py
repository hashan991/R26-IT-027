from typing import Any, Dict, List, Optional

from .schema import UsableYield


# =========================================================
# USABLE YIELD SERVICE
# =========================================================

class UsableYieldService:

    # =====================================================
    # RESEARCH-DEFINED YIELD BANDS
    # =====================================================
    #
    # These values are used to describe the estimated
    # recoverable portion of the inspected sample.
    #
    # HIGH      >= 90%
    # MODERATE  >= 75%
    # LOW       >= 50%
    # CRITICAL  < 50%
    #
    # These are research-defined decision-support bands,
    # not official coffee grading standards.
    # =====================================================

    HIGH_YIELD_THRESHOLD = 90.0

    MODERATE_YIELD_THRESHOLD = 75.0

    LOW_YIELD_THRESHOLD = 50.0


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
        default: Optional[float] = None,
    ) -> Optional[float]:

        try:
            if value is None:
                return default

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
    # CLAMP COUNT
    # =====================================================

    @staticmethod
    def _clamp_count(
        count: int,
        total: int,
    ) -> int:

        return max(
            0,
            min(
                count,
                total,
            ),
        )


    # =====================================================
    # YIELD STATUS
    # =====================================================

    def _get_yield_status(
        self,
        percentage: float,
    ) -> str:

        if (
            percentage
            >= self.HIGH_YIELD_THRESHOLD
        ):
            return "HIGH"


        if (
            percentage
            >= self.MODERATE_YIELD_THRESHOLD
        ):
            return "MODERATE"


        if (
            percentage
            >= self.LOW_YIELD_THRESHOLD
        ):
            return "LOW"


        return "CRITICAL"


    # =====================================================
    # RECOVERY POTENTIAL
    # =====================================================

    @staticmethod
    def _get_recovery_potential(
        *,
        clean_good_percentage: float,
        potential_recoverable_percentage: float,
        severe_reject_percentage: float,
    ) -> str:

        # -------------------------------------------------
        # HIGH RECOVERY POTENTIAL
        #
        # Large portion survives severe-defect removal,
        # even if some sorting is still needed.
        # -------------------------------------------------

        if (
            potential_recoverable_percentage
            >= 85.0
            and
            severe_reject_percentage
            <= 15.0
        ):
            return "HIGH"


        # -------------------------------------------------
        # MEDIUM RECOVERY POTENTIAL
        # -------------------------------------------------

        if (
            potential_recoverable_percentage
            >= 60.0
        ):
            return "MEDIUM"


        # -------------------------------------------------
        # LOW RECOVERY POTENTIAL
        # -------------------------------------------------

        if (
            potential_recoverable_percentage
            > 0
            or
            clean_good_percentage
            > 0
        ):
            return "LOW"


        return "NONE"


    # =====================================================
    # GENERATE USABLE YIELD
    # =====================================================

    def generate(
        self,
        *,
        counts: Dict[str, Any],
        sample_weight: Optional[float] = None,
        weight_calibrated: bool = False,
    ) -> UsableYield:

        # -------------------------------------------------
        # EXTRACT COUNTS
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


        # =================================================
        # NO DATA
        # =================================================

        if (
            total <= 0
        ):

            return UsableYield(

                yield_basis=(
                    "COUNT_BASED"
                ),

                title=(
                    "Usable Yield Cannot Be Estimated"
                ),

                summary=(
                    "Physical bean count data is not "
                    "available, so the system cannot "
                    "estimate the usable portion of the "
                    "sample."
                ),

                total_beans=0,

                clean_good_count=0,

                clean_good_percentage=0.0,

                severe_reject_count=0,

                severe_reject_percentage=0.0,

                potential_recoverable_count=0,

                potential_recoverable_percentage=0.0,

                broken_count=0,

                broken_percentage=0.0,

                unknown_count=0,

                unknown_percentage=0.0,

                yield_status=(
                    "NO_DATA"
                ),

                recovery_potential=(
                    "UNKNOWN"
                ),

                sorting_required=False,

                severe_defect_removal_required=False,

                manual_review_required=False,

                weight_based_yield_available=False,

                input_weight_grams=None,

                estimated_usable_weight_grams=None,

                estimated_reject_weight_grams=None,

                interpretation=[
                    (
                        "Complete the physical AI "
                        "inspection before estimating "
                        "usable yield."
                    ),
                ],

                methodology_note=(
                    "Usable yield requires physical "
                    "bean classification counts. No "
                    "yield estimate is generated when "
                    "physical inspection data is "
                    "unavailable."
                ),
            )


        # =================================================
        # NORMALIZE COUNTS
        # =================================================

        good = self._clamp_count(
            good,
            total,
        )


        broken = self._clamp_count(
            broken,
            total,
        )


        black = self._clamp_count(
            black,
            total,
        )


        black_and_broken = (
            self._clamp_count(
                black_and_broken,
                total,
            )
        )


        unknown = self._clamp_count(
            unknown,
            total,
        )


        # =================================================
        # STRICT CLEAN GOOD YIELD
        # =================================================
        #
        # Only AI-classified GOOD whole beans.
        # =================================================

        clean_good_count = good


        clean_good_percentage = (
            self._percentage(
                clean_good_count,
                total,
            )
        )


        # =================================================
        # SEVERE REJECT PORTION
        # =================================================
        #
        # Current research rule:
        #
        # black
        # +
        # black_and_broken
        #
        # are considered severe defects recommended for
        # removal before further processing.
        #
        # black_and_broken is counted only once.
        # =================================================

        severe_reject_count = (
            black
            + black_and_broken
        )


        severe_reject_count = (
            self._clamp_count(
                severe_reject_count,
                total,
            )
        )


        severe_reject_percentage = (
            self._percentage(
                severe_reject_count,
                total,
            )
        )


        # =================================================
        # POTENTIAL RECOVERABLE YIELD
        # =================================================
        #
        # Recoverable portion:
        #
        # Total
        # -
        # severe rejects
        #
        # This can include:
        #
        # good
        # broken
        # unknown
        #
        # IMPORTANT:
        # broken and unknown are not automatically
        # considered production-ready.
        # =================================================

        potential_recoverable_count = (
            total
            - severe_reject_count
        )


        potential_recoverable_count = (
            self._clamp_count(
                potential_recoverable_count,
                total,
            )
        )


        potential_recoverable_percentage = (
            self._percentage(
                potential_recoverable_count,
                total,
            )
        )


        # =================================================
        # CONDITIONAL PORTIONS
        # =================================================

        broken_percentage = (
            self._percentage(
                broken,
                total,
            )
        )


        unknown_percentage = (
            self._percentage(
                unknown,
                total,
            )
        )


        # =================================================
        # YIELD STATUS
        # =================================================

        yield_status = (
            self._get_yield_status(
                potential_recoverable_percentage
            )
        )


        # =================================================
        # RECOVERY POTENTIAL
        # =================================================

        recovery_potential = (
            self._get_recovery_potential(

                clean_good_percentage=(
                    clean_good_percentage
                ),

                potential_recoverable_percentage=(
                    potential_recoverable_percentage
                ),

                severe_reject_percentage=(
                    severe_reject_percentage
                ),
            )
        )


        # =================================================
        # ACTION FLAGS
        # =================================================

        severe_defect_removal_required = (
            severe_reject_count
            > 0
        )


        sorting_required = (
            broken
            > 0
            or
            severe_reject_count
            > 0
        )


        manual_review_required = (
            unknown
            > 0
        )


        # =================================================
        # WEIGHT-BASED YIELD
        # =================================================
        #
        # IMPORTANT:
        #
        # Even if total sample weight is available,
        # count percentage should not automatically be
        # converted into reject/usable mass because bean
        # classes may have different individual masses.
        #
        # Therefore the current module keeps weight-based
        # yield disabled.
        #
        # Later this can be extended using:
        #
        # - calibrated load cell
        # - sorted defect-category weights
        # - or a validated mass estimation model
        #
        # =================================================

        measured_weight = (
            self._safe_float(
                sample_weight
            )
        )


        weight_based_yield_available = False

        input_weight_grams = None

        estimated_usable_weight_grams = None

        estimated_reject_weight_grams = None


        if (
            weight_calibrated
            and
            measured_weight is not None
            and
            measured_weight > 0
        ):

            # Store the trusted input weight,
            # but still do NOT estimate usable/reject
            # mass from bean-count percentages.

            input_weight_grams = round(
                measured_weight,
                2,
            )


        # =================================================
        # INTERPRETATION
        # =================================================

        interpretation: List[str] = []


        interpretation.append(
            (
                f"{clean_good_count} of "
                f"{total} inspected beans "
                f"({clean_good_percentage:.2f}%) "
                "were classified as clean good "
                "whole beans."
            )
        )


        if (
            severe_reject_count
            > 0
        ):

            interpretation.append(
                (
                    f"{severe_reject_count} beans "
                    f"({severe_reject_percentage:.2f}%) "
                    "contain severe black or "
                    "black-and-broken defects and are "
                    "recommended for removal."
                )
            )


        else:

            interpretation.append(
                (
                    "No severe black or "
                    "black-and-broken defects were "
                    "identified for immediate removal."
                )
            )


        interpretation.append(
            (
                f"The estimated potential recoverable "
                f"portion is "
                f"{potential_recoverable_count} beans "
                f"({potential_recoverable_percentage:.2f}%)."
            )
        )


        if (
            broken
            > 0
        ):

            interpretation.append(
                (
                    f"{broken} broken beans "
                    f"({broken_percentage:.2f}%) remain "
                    "within the potential recoverable "
                    "portion and require secondary "
                    "sorting or separate handling."
                )
            )


        if (
            unknown
            > 0
        ):

            interpretation.append(
                (
                    f"{unknown} uncertain beans "
                    f"({unknown_percentage:.2f}%) require "
                    "manual inspection or repeated AI "
                    "analysis before final use."
                )
            )


        # =================================================
        # TITLE / SUMMARY
        # =================================================

        if (
            yield_status == "HIGH"
        ):

            title = (
                "High Potential Usable Yield"
            )

            summary = (
                "Most of the inspected batch remains "
                "potentially usable after removal of "
                "identified severe defects."
            )


        elif (
            yield_status == "MODERATE"
        ):

            title = (
                "Moderate Potential Usable Yield"
            )

            summary = (
                "A substantial portion of the batch "
                "may remain usable, but corrective "
                "sorting is recommended before "
                "production use."
            )


        elif (
            yield_status == "LOW"
        ):

            title = (
                "Low Potential Usable Yield"
            )

            summary = (
                "A significant portion of the inspected "
                "batch contains severe defects. The "
                "remaining portion requires careful "
                "sorting and quality reassessment."
            )


        else:

            title = (
                "Critical Usable Yield Condition"
            )

            summary = (
                "Less than half of the inspected batch "
                "remains potentially recoverable after "
                "identified severe defects are removed."
            )


        # =================================================
        # RETURN
        # =================================================

        return UsableYield(

            yield_basis=(
                "COUNT_BASED"
            ),

            title=title,

            summary=summary,

            total_beans=(
                total
            ),

            clean_good_count=(
                clean_good_count
            ),

            clean_good_percentage=(
                clean_good_percentage
            ),

            severe_reject_count=(
                severe_reject_count
            ),

            severe_reject_percentage=(
                severe_reject_percentage
            ),

            potential_recoverable_count=(
                potential_recoverable_count
            ),

            potential_recoverable_percentage=(
                potential_recoverable_percentage
            ),

            broken_count=(
                broken
            ),

            broken_percentage=(
                broken_percentage
            ),

            unknown_count=(
                unknown
            ),

            unknown_percentage=(
                unknown_percentage
            ),

            yield_status=(
                yield_status
            ),

            recovery_potential=(
                recovery_potential
            ),

            sorting_required=(
                sorting_required
            ),

            severe_defect_removal_required=(
                severe_defect_removal_required
            ),

            manual_review_required=(
                manual_review_required
            ),

            weight_based_yield_available=(
                weight_based_yield_available
            ),

            input_weight_grams=(
                input_weight_grams
            ),

            estimated_usable_weight_grams=(
                estimated_usable_weight_grams
            ),

            estimated_reject_weight_grams=(
                estimated_reject_weight_grams
            ),

            interpretation=(
                interpretation
            ),

            methodology_note=(
                "This usable-yield estimate is "
                "count-based. Clean good yield includes "
                "only beans classified as good whole "
                "beans. Potential recoverable yield is "
                "calculated after removing severe black "
                "and black-and-broken defects. Broken "
                "and uncertain beans may remain within "
                "the recoverable portion but require "
                "additional sorting or inspection. "
                "Weight-based yield is not calculated "
                "until a validated mass-based method is "
                "available."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

usable_yield_service = (
    UsableYieldService()
)