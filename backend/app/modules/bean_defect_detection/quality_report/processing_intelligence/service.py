from typing import Any, Dict, Optional

from .schema import (
    ProcessingIntelligence,
)

from .roasting_recommendation.service import (
    roasting_recommendation_service,
)

from .pre_roast_plan.service import (
    pre_roast_plan_service,
)

from .roast_quality_risk.service import (
    roast_quality_risk_service,
)

from .batch_usage.service import (
    batch_usage_service,
)

from .usable_yield.service import (
    usable_yield_service,
)

from .production_decision.service import (
    production_decision_service,
)


# =========================================================
# PROCESSING INTELLIGENCE SERVICE
# =========================================================

class ProcessingIntelligenceService:

    # =====================================================
    # NORMALIZE COUNTS
    # =====================================================

    @staticmethod
    def _normalize_counts(
        counts: Optional[Dict[str, Any]],
    ) -> Dict[str, int]:

        counts = counts or {}


        def safe_int(
            value: Any,
        ) -> int:

            try:
                return max(
                    0,
                    int(value),
                )

            except (
                TypeError,
                ValueError,
            ):
                return 0


        return {
            "total_beans": safe_int(
                counts.get(
                    "total_beans",
                    0,
                )
            ),

            "good": safe_int(
                counts.get(
                    "good",
                    0,
                )
            ),

            "broken": safe_int(
                counts.get(
                    "broken",
                    0,
                )
            ),

            "black": safe_int(
                counts.get(
                    "black",
                    0,
                )
            ),

            "black_and_broken": safe_int(
                counts.get(
                    "black_and_broken",
                    0,
                )
            ),

            "unknown": safe_int(
                counts.get(
                    "unknown",
                    0,
                )
            ),
        }


    # =====================================================
    # GENERATE COMPLETE PROCESSING INTELLIGENCE
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
        sample_weight: Optional[float] = None,
        weight_calibrated: bool = False,
    ) -> ProcessingIntelligence:

        # -------------------------------------------------
        # NORMALIZE COMMON INPUTS
        # -------------------------------------------------

        normalized_counts = (
            self._normalize_counts(
                counts
            )
        )


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


        try:
            final_score = float(
                final_score
            )

        except (
            TypeError,
            ValueError,
        ):
            final_score = 0.0


        final_score = max(
            0.0,
            min(
                100.0,
                final_score,
            ),
        )


        # =================================================
        # 1. ROASTING RECOMMENDATION
        # =================================================

        roasting_recommendation = (
            roasting_recommendation_service.generate(

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
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
                    normalized_counts
                ),
            )
        )


        # =================================================
        # 2. PRE-ROAST PREPARATION PLAN
        # =================================================

        pre_roast_plan = (
            pre_roast_plan_service.generate(

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
                ),

                grade=(
                    grade
                ),

                quality_status=(
                    quality_status
                ),

                counts=(
                    normalized_counts
                ),
            )
        )


        # =================================================
        # 3. ROAST QUALITY RISK
        # =================================================

        roast_quality_risk = (
            roast_quality_risk_service.generate(

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
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
                    normalized_counts
                ),
            )
        )


        # =================================================
        # 4. BATCH USAGE RECOMMENDATION
        # =================================================

        batch_usage = (
            batch_usage_service.generate(

                sensor_status=(
                    sensor_status
                ),

                physical_status=(
                    physical_status
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
                    normalized_counts
                ),
            )
        )


        # =================================================
        # 5. USABLE YIELD
        # =================================================

        usable_yield = (
            usable_yield_service.generate(

                counts=(
                    normalized_counts
                ),

                sample_weight=(
                    sample_weight
                ),

                weight_calibrated=(
                    weight_calibrated
                ),
            )
        )


        # =================================================
        # 6. FINAL PRODUCTION DECISION
        # =================================================
        #
        # IMPORTANT:
        #
        # Production Decision does not recalculate raw
        # quality information.
        #
        # It consumes the previous five intelligence
        # outputs and produces the factory-level decision.
        # =================================================

        production_decision = (
            production_decision_service.generate(

                roasting=(
                    roasting_recommendation
                ),

                pre_roast=(
                    pre_roast_plan
                ),

                roast_risk=(
                    roast_quality_risk
                ),

                batch_usage=(
                    batch_usage
                ),

                usable_yield=(
                    usable_yield
                ),
            )
        )


        # =================================================
        # COMPLETE RESPONSE
        # =================================================

        return ProcessingIntelligence(

            roasting_recommendation=(
                roasting_recommendation
            ),

            pre_roast_plan=(
                pre_roast_plan
            ),

            roast_quality_risk=(
                roast_quality_risk
            ),

            batch_usage=(
                batch_usage
            ),

            usable_yield=(
                usable_yield
            ),

            production_decision=(
                production_decision
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

processing_intelligence_service = (
    ProcessingIntelligenceService()
)