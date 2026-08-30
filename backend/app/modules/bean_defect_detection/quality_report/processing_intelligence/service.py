from typing import Any, Dict, Optional

from .schema import (
    ProcessingIntelligence,
)

from .defect_profile import (
    DefectProfile,
    build_defect_profile,
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


# =========================================================
# OPTIONAL FUTURE MODULE IMPORTS
# =========================================================
#
# Modules 6 and 7 may not exist yet while the migration is
# in progress.
#
# This keeps THIS orchestrator file stable. When the new
# module files are later added, Uvicorn reload will import
# them automatically and no change to this service.py is
# required.
#
# =========================================================

try:
    from .storage_handling.service import (
        storage_handling_service,
    )

except ImportError:
    storage_handling_service = None


try:
    from .preventive_guidance.service import (
        preventive_guidance_service,
    )

except ImportError:
    preventive_guidance_service = None


# =========================================================
# PROCESSING INTELLIGENCE SERVICE
# =========================================================
#
# FINAL ORCHESTRATOR SHAPE
#
# 1. Roasting Readiness Recommendation
# 2. Pre-Roast Corrective Actions
# 3. Roast Quality Risks
# 4. Batch Usage Recommendation
# 5. Usable Yield Estimation
# 6. Storage & Handling Recommendation
# 7. Preventive Process Guidance
#
# IMPORTANT:
# This file is intentionally migration-safe so it does not
# need to be edited again while Modules 3-7 are migrated.
#
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
    # MODULE 3 COMPATIBILITY GENERATOR
    # =====================================================
    #
    # New Module 3 will use:
    #
    #     generate(defect_profile=defect_profile)
    #
    # Until that migration is completed, the old service
    # still accepts legacy quality-summary parameters.
    #
    # =====================================================

    @staticmethod
    def _generate_roast_risk(
        *,
        defect_profile: DefectProfile,
        sensor_status: str,
        physical_status: str,
        final_score: float,
        grade: str,
        quality_status: str,
        normalized_counts: Dict[str, int],
    ):

        try:
            return (
                roast_quality_risk_service
                .generate(
                    defect_profile=(
                        defect_profile
                    ),
                )
            )

        except TypeError as error:

            if (
                "defect_profile"
                not in str(error)
            ):
                raise

            return (
                roast_quality_risk_service
                .generate(

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


    # =====================================================
    # MODULE 4 COMPATIBILITY GENERATOR
    # =====================================================

    @staticmethod
    def _generate_batch_usage(
        *,
        defect_profile: DefectProfile,
        sensor_status: str,
        physical_status: str,
        final_score: float,
        grade: str,
        quality_status: str,
        normalized_counts: Dict[str, int],
    ):

        try:
            return (
                batch_usage_service
                .generate(
                    defect_profile=(
                        defect_profile
                    ),
                )
            )

        except TypeError as error:

            if (
                "defect_profile"
                not in str(error)
            ):
                raise

            return (
                batch_usage_service
                .generate(

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


    # =====================================================
    # MODULE 5 COMPATIBILITY GENERATOR
    # =====================================================
    #
    # Final Module 5 will use defect_profile.yield_counts.
    #
    # Until migrated, the existing service receives raw
    # counts plus the sample-weight fields.
    #
    # =====================================================

    @staticmethod
    def _generate_usable_yield(
        *,
        defect_profile: DefectProfile,
        normalized_counts: Dict[str, int],
        sample_weight: Optional[float],
        weight_calibrated: bool,
    ):

        try:
            return (
                usable_yield_service
                .generate(

                    defect_profile=(
                        defect_profile
                    ),

                    sample_weight=(
                        sample_weight
                    ),

                    weight_calibrated=(
                        weight_calibrated
                    ),
                )
            )

        except TypeError as error:

            if (
                "defect_profile"
                not in str(error)
            ):
                raise

            return (
                usable_yield_service
                .generate(

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


    # =====================================================
    # MODULE 6 GENERATOR
    # =====================================================

    @staticmethod
    def _generate_storage_handling(
        *,
        defect_profile: DefectProfile,
    ):

        if storage_handling_service is None:
            return None

        return (
            storage_handling_service
            .generate(
                defect_profile=(
                    defect_profile
                ),
            )
        )


    # =====================================================
    # MODULE 7 GENERATOR
    # =====================================================

    @staticmethod
    def _generate_preventive_guidance(
        *,
        defect_profile: DefectProfile,
    ):

        if preventive_guidance_service is None:
            return None

        return (
            preventive_guidance_service
            .generate(
                defect_profile=(
                    defect_profile
                ),
            )
        )


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
        defect_profile: Optional[
            DefectProfile
        ] = None,
    ) -> ProcessingIntelligence:

        # -------------------------------------------------
        # NORMALIZE LEGACY COMPATIBILITY INPUTS
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


        # -------------------------------------------------
        # DEFECT PROFILE FALLBACK
        # -------------------------------------------------
        #
        # Updated quality_report/service.py should always
        # pass the real defect_profile.
        #
        # This fallback exists only to prevent an immediate
        # crash from an older caller during migration.
        #
        # -------------------------------------------------

        if defect_profile is None:

            defect_profile = (
                build_defect_profile(
                    sensor_defects={},
                    counts=(
                        normalized_counts
                    ),
                    sensor_complete=False,
                    physical_complete=(
                        normalized_counts[
                            "total_beans"
                        ]
                        > 0
                    ),
                )
            )


        # =================================================
        # 1. ROASTING READINESS RECOMMENDATION
        # =================================================

        roasting_recommendation = (
            roasting_recommendation_service
            .generate(
                defect_profile=(
                    defect_profile
                ),
            )
        )


        # =================================================
        # 2. PRE-ROAST CORRECTIVE ACTIONS
        # =================================================

        pre_roast_plan = (
            pre_roast_plan_service
            .generate(
                defect_profile=(
                    defect_profile
                ),
            )
        )


        # =================================================
        # 3. ROAST QUALITY RISKS
        # =================================================

        roast_quality_risk = (
            self._generate_roast_risk(

                defect_profile=(
                    defect_profile
                ),

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

                normalized_counts=(
                    normalized_counts
                ),
            )
        )


        # =================================================
        # 4. BATCH USAGE RECOMMENDATION
        # =================================================

        batch_usage = (
            self._generate_batch_usage(

                defect_profile=(
                    defect_profile
                ),

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

                normalized_counts=(
                    normalized_counts
                ),
            )
        )


        # =================================================
        # 5. USABLE YIELD ESTIMATION
        # =================================================

        usable_yield = (
            self._generate_usable_yield(

                defect_profile=(
                    defect_profile
                ),

                normalized_counts=(
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
        # 6. STORAGE & HANDLING RECOMMENDATION
        # =================================================

        storage_handling = (
            self._generate_storage_handling(
                defect_profile=(
                    defect_profile
                ),
            )
        )


        # =================================================
        # 7. PREVENTIVE PROCESS GUIDANCE
        # =================================================

        preventive_process_guidance = (
            self._generate_preventive_guidance(
                defect_profile=(
                    defect_profile
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

            storage_handling=(
                storage_handling
            ),

            preventive_process_guidance=(
                preventive_process_guidance
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

processing_intelligence_service = (
    ProcessingIntelligenceService()
)
