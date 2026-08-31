from typing import Optional

from ..defect_profile import (
    DefectProfile,
)

from .schema import (
    UsableYield,
)


# =========================================================
# MODULE 5 - USABLE YIELD ESTIMATION SERVICE
# =========================================================
#
# This module is intentionally PHYSICAL-COUNT-DRIVEN.
#
# Sensor abnormalities do not subtract arbitrary percentages
# from usable yield.
#
# Original categories remain separate:
#
#   good
#   broken
#   black
#   black_and_broken
#
# =========================================================

class UsableYieldService:

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
    # SAFE SAMPLE WEIGHT
    # =====================================================

    @staticmethod
    def _normalize_weight(
        sample_weight: Optional[float],
    ) -> Optional[float]:

        if sample_weight is None:
            return None

        try:
            value = float(
                sample_weight
            )

        except (
            TypeError,
            ValueError,
        ):
            return None

        if value < 0:
            return None

        return round(
            value,
            2,
        )


    # =====================================================
    # GENERATE
    # =====================================================

    def generate(
        self,
        *,
        defect_profile: DefectProfile,
        sample_weight: Optional[float] = None,
        weight_calibrated: bool = False,
    ) -> UsableYield:

        counts = (
            defect_profile
            .yield_counts
        )


        # =================================================
        # ORIGINAL FOUR PHYSICAL CATEGORIES
        # =================================================

        good = max(
            0,
            int(
                counts.good
            ),
        )

        broken = max(
            0,
            int(
                counts.broken
            ),
        )

        black = max(
            0,
            int(
                counts.black
            ),
        )

        black_and_broken = max(
            0,
            int(
                counts.black_and_broken
            ),
        )


        # =================================================
        # CLASSIFIED TOTAL
        # =================================================
        #
        # Unknown is intentionally NOT placed into Good,
        # Broken, Black or Black+Broken.
        #
        # Yield percentages are calculated from the known
        # four-category classified sample.
        #
        # =================================================

        classified_total = (
            good
            + broken
            + black
            + black_and_broken
        )


        provided_total = max(
            0,
            int(
                counts.total_beans
            ),
        )


        # Never allow reported total to be lower than the
        # sum of known classified categories.
        total_beans = max(
            provided_total,
            classified_total,
        )


        unknown = max(
            0,
            (
                total_beans
                - classified_total
            ),
        )


        # =================================================
        # NO DATA
        # =================================================

        normalized_weight = (
            self._normalize_weight(
                sample_weight
            )
        )


        if classified_total <= 0:

            return UsableYield(

                yield_basis="NO_DATA",

                title=(
                    "Usable Yield Data Unavailable"
                ),

                summary=(
                    "Usable yield cannot be estimated "
                    "because no classified physical bean "
                    "counts are available."
                ),

                total_beans=(
                    total_beans
                ),

                classified_total_beans=0,

                classification_coverage_percentage=0.0,

                good_count=0,

                broken_count=0,

                black_count=0,

                black_and_broken_count=0,

                unknown_count=(
                    unknown
                ),

                good_percentage=0.0,

                broken_percentage=0.0,

                black_percentage=0.0,

                black_and_broken_percentage=0.0,

                unknown_percentage=(
                    self._percentage(
                        unknown,
                        total_beans,
                    )
                ),

                clean_usable_count=0,

                clean_usable_percentage=0.0,

                potential_recoverable_count=0,

                potential_recoverable_percentage=0.0,

                severe_reject_count=0,

                severe_reject_percentage=0.0,

                clean_good_count=0,

                clean_good_percentage=0.0,

                yield_status="NO_DATA",

                recovery_potential="NO_DATA",

                sorting_required=False,

                severe_defect_removal_required=False,

                manual_review_required=(
                    unknown > 0
                ),

                input_weight_grams=(
                    normalized_weight
                ),

                weight_calibrated=(
                    bool(
                        weight_calibrated
                    )
                ),

                weight_based_yield_available=False,

                estimated_usable_weight_grams=None,

                estimated_reject_weight_grams=None,

                interpretation=[
                    (
                        "No classified physical bean data "
                        "is available for count-based usable "
                        "yield estimation."
                    )
                ],

                methodology_note=(
                    "Module 5 uses count-based physical AI "
                    "categories only. No mass-based yield "
                    "is calculated without a separately "
                    "validated category-mass measurement "
                    "method."
                ),
            )


        # =================================================
        # CATEGORY PERCENTAGES
        # =================================================
        #
        # All four category percentages use classified_total.
        #
        # Unknown percentage uses total_beans because Unknown
        # is outside the four known yield categories.
        #
        # =================================================

        good_percentage = (
            self._percentage(
                good,
                classified_total,
            )
        )

        broken_percentage = (
            self._percentage(
                broken,
                classified_total,
            )
        )

        black_percentage = (
            self._percentage(
                black,
                classified_total,
            )
        )

        black_and_broken_percentage = (
            self._percentage(
                black_and_broken,
                classified_total,
            )
        )

        unknown_percentage = (
            self._percentage(
                unknown,
                total_beans,
            )
        )

        classification_coverage_percentage = (
            self._percentage(
                classified_total,
                total_beans,
            )
            if total_beans > 0
            else 100.0
        )


        # =================================================
        # USABLE YIELD GROUPS
        # =================================================
        #
        # CLEAN USABLE
        #     Good only
        #
        # POTENTIAL RECOVERABLE
        #     Good + Broken
        #
        # SEVERE REJECT
        #     Black + Black&Broken
        #
        # IMPORTANT:
        # Black&Broken stays separate in source counts.
        #
        # =================================================

        clean_usable_count = (
            good
        )


        potential_recoverable_count = (
            good
            + broken
        )


        severe_reject_count = (
            black
            + black_and_broken
        )


        clean_usable_percentage = (
            self._percentage(
                clean_usable_count,
                classified_total,
            )
        )


        potential_recoverable_percentage = (
            self._percentage(
                potential_recoverable_count,
                classified_total,
            )
        )


        severe_reject_percentage = (
            self._percentage(
                severe_reject_count,
                classified_total,
            )
        )


        # =================================================
        # DESCRIPTIVE FLAGS
        # =================================================

        sorting_required = (
            broken > 0
            or
            black > 0
            or
            black_and_broken > 0
        )


        severe_defect_removal_required = (
            severe_reject_count
            > 0
        )


        manual_review_required = (
            unknown
            > 0
        )


        recovery_potential = (
            "PRESENT"
            if broken > 0
            else "NONE"
        )


        # =================================================
        # INTERPRETATION
        # =================================================

        interpretation = [

            (
                f"{good} of {classified_total} classified "
                f"beans ({clean_usable_percentage}%) are "
                "clean usable good beans."
            ),

            (
                f"{potential_recoverable_count} of "
                f"{classified_total} classified beans "
                f"({potential_recoverable_percentage}%) "
                "form the potential recoverable portion "
                "when good and broken beans are combined."
            ),

            (
                f"{severe_reject_count} of "
                f"{classified_total} classified beans "
                f"({severe_reject_percentage}%) are in "
                "the severe reject portion because they "
                "are black or black-and-broken."
            ),
        ]


        if broken > 0:

            interpretation.append(
                (
                    f"{broken} broken beans are kept as a "
                    "separate physical category and may "
                    "require secondary sorting before use."
                )
            )


        if black > 0:

            interpretation.append(
                (
                    f"{black} black beans are counted "
                    "separately in the severe reject "
                    "portion."
                )
            )


        if black_and_broken > 0:

            interpretation.append(
                (
                    f"{black_and_broken} black-and-broken "
                    "beans remain a separate Module 5 "
                    "category and are included in the "
                    "severe reject portion."
                )
            )


        if unknown > 0:

            interpretation.append(
                (
                    f"{unknown} bean(s) are outside the "
                    "four known yield categories and are "
                    "excluded from the yield denominator. "
                    f"Classification coverage is "
                    f"{classification_coverage_percentage}%."
                )
            )


        if normalized_weight is not None:

            interpretation.append(
                (
                    f"The captured sample weight is "
                    f"{normalized_weight} g. It is shown "
                    "as contextual information only; no "
                    "count-ratio-to-weight conversion is "
                    "performed."
                )
            )


        # =================================================
        # RESPONSE
        # =================================================

        return UsableYield(

            yield_basis=(
                "COUNT_BASED_CLASSIFIED_BEANS"
            ),

            title=(
                "Count-Based Usable Yield Estimate"
            ),

            summary=(
                "Usable yield is estimated from the four "
                "physical AI categories while keeping "
                "black-and-broken beans separate. Sensor "
                "abnormalities do not deduct arbitrary "
                "yield percentages."
            ),

            total_beans=(
                total_beans
            ),

            classified_total_beans=(
                classified_total
            ),

            classification_coverage_percentage=(
                classification_coverage_percentage
            ),

            good_count=(
                good
            ),

            broken_count=(
                broken
            ),

            black_count=(
                black
            ),

            black_and_broken_count=(
                black_and_broken
            ),

            unknown_count=(
                unknown
            ),

            good_percentage=(
                good_percentage
            ),

            broken_percentage=(
                broken_percentage
            ),

            black_percentage=(
                black_percentage
            ),

            black_and_broken_percentage=(
                black_and_broken_percentage
            ),

            unknown_percentage=(
                unknown_percentage
            ),

            clean_usable_count=(
                clean_usable_count
            ),

            clean_usable_percentage=(
                clean_usable_percentage
            ),

            potential_recoverable_count=(
                potential_recoverable_count
            ),

            potential_recoverable_percentage=(
                potential_recoverable_percentage
            ),

            severe_reject_count=(
                severe_reject_count
            ),

            severe_reject_percentage=(
                severe_reject_percentage
            ),

            # Backward-compatible aliases.
            clean_good_count=(
                clean_usable_count
            ),

            clean_good_percentage=(
                clean_usable_percentage
            ),

            # No arbitrary acceptance threshold is used.
            yield_status="ESTIMATED",

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

            input_weight_grams=(
                normalized_weight
            ),

            weight_calibrated=(
                bool(
                    weight_calibrated
                )
            ),

            weight_based_yield_available=False,

            estimated_usable_weight_grams=None,

            estimated_reject_weight_grams=None,

            interpretation=(
                interpretation
            ),

            methodology_note=(
                "Module 5 is a research-defined count-based "
                "usable-yield interpretation. Clean usable "
                "yield equals Good / Classified Total. "
                "Potential recoverable yield equals "
                "(Good + Broken) / Classified Total. "
                "Severe reject portion equals "
                "(Black + Black-and-Broken) / Classified "
                "Total. Black-and-broken remains a separate "
                "source category in this module. Unknown "
                "beans are excluded from the four-category "
                "yield denominator and reported as "
                "classification uncertainty. Sample weight "
                "is not converted into usable or reject "
                "grams because bean-count proportions do "
                "not establish category mass proportions."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

usable_yield_service = (
    UsableYieldService()
)
