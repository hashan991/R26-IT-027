from typing import List

from ..defect_profile import (
    DefectProfile,
)

from .schema import (
    StorageHandlingItem,
    StorageHandlingRecommendation,
)


# =========================================================
# STORAGE & HANDLING RECOMMENDATION SERVICE
# =========================================================
#
# Module 6 is defect-driven.
#
# It answers:
#
#   "How should the current batch be stored, isolated or
#    handled before roasting / further processing?"
#
# final_score, grade, quality_status, sensor_status and
# physical_status DO NOT trigger these recommendations.
#
# IMPORTANT:
# MQ sensor responses are broad/non-specific. Their rules
# therefore request isolation/verification and never claim
# that a specific coffee defect has been confirmed.
#
# =========================================================

class StorageHandlingService:

    # =====================================================
    # ADD RECOMMENDATION
    # =====================================================

    @staticmethod
    def _add_recommendation(
        recommendations: List[
            StorageHandlingItem
        ],
        *,
        defect: str,
        priority: str,
        status: str,
        title: str,
        recommendation: str,
        reason: str,
        evidence_class: str,
        source_basis: List[str],
        detected_count=None,
    ) -> None:

        recommendations.append(
            StorageHandlingItem(
                defect=defect,
                priority=priority,
                status=status,
                title=title,
                recommendation=(
                    recommendation
                ),
                reason=reason,
                evidence_class=(
                    evidence_class
                ),
                source_basis=(
                    source_basis
                ),
                detected_count=(
                    detected_count
                ),
            )
        )


    # =====================================================
    # GENERATE MODULE 6
    # =====================================================

    def generate(
        self,
        *,
        defect_profile: DefectProfile,
    ) -> StorageHandlingRecommendation:

        sensor = (
            defect_profile.sensor
        )

        physical = (
            defect_profile.physical
        )

        inspection = (
            defect_profile.inspection
        )

        recommendations: List[
            StorageHandlingItem
        ] = []


        # =================================================
        # 1. MQ2 ABNORMAL
        # =================================================

        if sensor.mq2_abnormal:

            self._add_recommendation(
                recommendations,

                defect="MQ2_ABNORMAL",

                priority="HIGH",

                status=(
                    "ISOLATE_AND_VERIFY"
                ),

                title=(
                    "Isolate from Smoke and "
                    "Combustible Vapour Sources"
                ),

                recommendation=(
                    "Temporarily isolate the batch from "
                    "smoke, fuel vapours, combustion "
                    "exhaust and other combustible-gas "
                    "sources. Keep the coffee in a clean, "
                    "well-ventilated area and repeat the "
                    "MQ-2 assessment before release."
                ),

                reason=(
                    "MQ-2 is a broad smoke and flammable-"
                    "gas sensor. An abnormal response can "
                    "indicate environmental exposure, but "
                    "it does not confirm a specific coffee "
                    "defect."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),

                source_basis=[
                    "WINSEN_MQ2",
                    "ISO_8455_STORAGE_TRANSPORT",
                ],
            )


        # =================================================
        # 2. MQ3 ABNORMAL
        # =================================================

        if sensor.mq3_abnormal:

            self._add_recommendation(
                recommendations,

                defect="MQ3_ABNORMAL",

                priority="HIGH",

                status=(
                    "ISOLATE_AND_VERIFY"
                ),

                title=(
                    "Isolate from Alcohol and "
                    "Volatile Sources"
                ),

                recommendation=(
                    "Store the batch separately from "
                    "alcohol, solvents and other volatile "
                    "sources. Inspect for unusual odour "
                    "and repeat the MQ-3 assessment in a "
                    "clean-air environment before further "
                    "processing."
                ),

                reason=(
                    "MQ-3 is alcohol-sensitive and broad "
                    "enough that the response must be "
                    "verified. The signal does not by "
                    "itself confirm fermentation."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),

                source_basis=[
                    "WINSEN_MQ3B",
                    "ISO_8455_STORAGE_TRANSPORT",
                    "FAO_POSTHARVEST_GUIDANCE",
                ],
            )


        # =================================================
        # 3. MQ135 ABNORMAL
        # =================================================

        if sensor.mq135_abnormal:

            self._add_recommendation(
                recommendations,

                defect="MQ135_ABNORMAL",

                priority="HIGH",

                status=(
                    "CLEAN_STORAGE_REQUIRED"
                ),

                title=(
                    "Use Clean Odour-Free Storage"
                ),

                recommendation=(
                    "Keep the batch away from chemicals, "
                    "fuels, smoke, cleaning agents, "
                    "fertilizers and other strong-smelling "
                    "materials. Use clean, odour-free and "
                    "well-ventilated storage and repeat "
                    "the sensor assessment."
                ),

                reason=(
                    "MQ-135 responds broadly to several "
                    "gases and vapours. Green coffee can "
                    "also absorb undesirable environmental "
                    "odours during poor storage."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),

                source_basis=[
                    "WINSEN_MQ135",
                    "ISO_8455_STORAGE_TRANSPORT",
                    "FAO_STORAGE_GUIDANCE",
                ],
            )


        # =================================================
        # 4. MOISTURE DEFECT
        # =================================================
        #
        # Current moisture_defect is an experimental sensor
        # response anomaly, NOT a calibrated coffee moisture
        # percentage.
        #
        # Therefore this module does not claim that the batch
        # is directly outside the ICO 8-12.5% range.
        #
        # =================================================

        if sensor.moisture_defect:

            self._add_recommendation(
                recommendations,

                defect="MOISTURE_DEFECT",

                priority="CRITICAL",

                status=(
                    "HOLD_FOR_MOISTURE_VERIFICATION"
                ),

                title=(
                    "Protect Batch from Moisture Changes"
                ),

                recommendation=(
                    "Hold the batch separately in a dry, "
                    "protected area. Prevent re-wetting and "
                    "additional moisture change. Verify "
                    "actual green-coffee moisture using an "
                    "appropriate calibrated/reference "
                    "method before long-term storage or "
                    "roasting release."
                ),

                reason=(
                    "The project sensor indicates a "
                    "moisture-response anomaly, but it does "
                    "not determine whether actual bean "
                    "moisture is high or low. Verification "
                    "is required before release."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    "ISO_8455_STORAGE_TRANSPORT",
                    "ISO_6673_MOISTURE_REFERENCE",
                    "ISO_24115_MOISTURE_METER_CALIBRATION",
                    "ICO_CQP_MOISTURE_GUIDANCE",
                ],
            )


        # =================================================
        # 5. TEMPERATURE ABNORMAL
        # =================================================
        #
        # This rule activates only if a separately validated
        # temperature_abnormal flag is supplied.
        #
        # The current project keeps this flag False until a
        # validated threshold exists.
        #
        # =================================================

        if sensor.temperature_abnormal:

            self._add_recommendation(
                recommendations,

                defect="TEMPERATURE_ABNORMAL",

                priority="MEDIUM",

                status=(
                    "STABILIZE_ENVIRONMENT"
                ),

                title=(
                    "Stabilize Storage Temperature"
                ),

                recommendation=(
                    "Move the batch away from excessive "
                    "heat and rapid temperature changes. "
                    "Maintain a stable storage environment "
                    "and reassess the condition before "
                    "further processing."
                ),

                reason=(
                    "Green-coffee storage guidance "
                    "emphasizes stable environmental "
                    "conditions that preserve quality. "
                    "This project does not assign an "
                    "unvalidated universal temperature "
                    "limit."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    "ISO_8455_STORAGE_TRANSPORT",
                    "FAO_STORAGE_GUIDANCE",
                ],
            )


        # =================================================
        # 6. HUMIDITY ABNORMAL
        # =================================================

        if sensor.humidity_abnormal:

            self._add_recommendation(
                recommendations,

                defect="HUMIDITY_ABNORMAL",

                priority="CRITICAL",

                status=(
                    "DRY_STORAGE_REQUIRED"
                ),

                title=(
                    "Move to Dry Ventilated Storage"
                ),

                recommendation=(
                    "Move the batch to a dry, protected "
                    "and well-ventilated storage area. "
                    "Prevent rain entry, leaks, "
                    "condensation, damp-floor contact and "
                    "further humid-air exposure. Recheck "
                    "the environmental condition and bean "
                    "moisture before roasting."
                ),

                reason=(
                    "Humid storage can cause moisture "
                    "reabsorption and increase the risk of "
                    "mould, musty quality deterioration "
                    "and other storage damage."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    "ISO_8455_STORAGE_TRANSPORT",
                    "FAO_STORAGE_GUIDANCE",
                    "FAO_POSTHARVEST_GUIDANCE",
                ],
            )


        # =================================================
        # 7. BROKEN BEANS
        # =================================================
        #
        # defect_profile.physical.broken is normalized as:
        #
        #     broken + black_and_broken
        #
        # No separate BLACK_AND_BROKEN storage recommendation
        # is created.
        #
        # =================================================

        if physical.broken > 0:

            self._add_recommendation(
                recommendations,

                defect="BROKEN_BEANS",

                priority="MEDIUM",

                status=(
                    "HANDLE_WITH_CARE"
                ),

                title=(
                    "Prevent Additional Bean Breakage"
                ),

                recommendation=(
                    "Handle the batch gently during "
                    "transfer, sorting and storage. Avoid "
                    "unnecessary impact or rough mechanical "
                    "handling, and keep the sorted broken "
                    "fraction separated from the prepared "
                    "whole-bean lot."
                ),

                reason=(
                    f"{physical.broken} beans contribute "
                    "to the normalized broken-bean defect "
                    "profile. Rough handling can increase "
                    "mechanical damage and reduce batch "
                    "uniformity."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    "ISO_10470_DEFECT_REFERENCE",
                    "FAO_GREEN_COFFEE_DEFECTS",
                ],

                detected_count=(
                    physical.broken
                ),
            )


        # =================================================
        # 8. BLACK BEANS
        # =================================================
        #
        # defect_profile.physical.black is normalized as:
        #
        #     black + black_and_broken
        #
        # =================================================

        if physical.black > 0:

            self._add_recommendation(
                recommendations,

                defect="BLACK_BEANS",

                priority="CRITICAL",

                status=(
                    "SEGREGATE_REJECTS"
                ),

                title=(
                    "Separate Black Bean Rejects"
                ),

                recommendation=(
                    "Remove detected black beans during "
                    "sorting and keep the rejected material "
                    "physically separated from the clean "
                    "usable coffee. Do not store the reject "
                    "fraction together with the prepared "
                    "roasting lot."
                ),

                reason=(
                    f"{physical.black} beans contribute "
                    "to the normalized black-bean defect "
                    "profile. Black beans are recognized "
                    "green-coffee defects with significant "
                    "quality and sensory concern."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    "ISO_10470_DEFECT_REFERENCE",
                    "FAO_GREEN_COFFEE_DEFECTS",
                    "FAO_STORAGE_SEPARATION_GUIDANCE",
                ],

                detected_count=(
                    physical.black
                ),
            )


        # =================================================
        # DERIVED FLAGS
        # =================================================

        inspection_complete = (
            inspection.sensor_complete
            and
            inspection.physical_complete
        )


        requires_isolation = any(
            item.status
            ==
            "ISOLATE_AND_VERIFY"
            for item in recommendations
        )


        requires_dry_storage = any(
            item.status
            in {
                "HOLD_FOR_MOISTURE_VERIFICATION",
                "DRY_STORAGE_REQUIRED",
            }
            for item in recommendations
        )


        requires_environment_stabilization = any(
            item.status
            in {
                "STABILIZE_ENVIRONMENT",
                "DRY_STORAGE_REQUIRED",
                "CLEAN_STORAGE_REQUIRED",
            }
            for item in recommendations
        )


        requires_retest = any(
            item.defect
            in {
                "MQ2_ABNORMAL",
                "MQ3_ABNORMAL",
                "MQ135_ABNORMAL",
                "MOISTURE_DEFECT",
                "TEMPERATURE_ABNORMAL",
                "HUMIDITY_ABNORMAL",
            }
            for item in recommendations
        )


        requires_gentle_handling = (
            physical.broken
            > 0
        )


        requires_reject_segregation = (
            physical.black
            > 0
        )


        # =================================================
        # OVERALL STORAGE / HANDLING STATUS
        # =================================================
        #
        # Research-defined aggregation:
        #
        # Missing inspection
        #     -> INSPECTION_REQUIRED
        #
        # Any CRITICAL storage/handling recommendation
        #     -> HOLD_AND_PROTECT
        #
        # Other active recommendation
        #     -> ACTION_REQUIRED
        #
        # No active recommendation
        #     -> NORMAL_STORAGE
        #
        # =================================================

        has_critical = any(
            item.priority
            ==
            "CRITICAL"
            for item in recommendations
        )


        if not inspection_complete:

            overall_status = (
                "INSPECTION_REQUIRED"
            )

            title = (
                "Storage and Handling Review Required"
            )

            summary = (
                "One or more required inspections are "
                "incomplete. Apply the available "
                "defect-specific storage controls and "
                "complete the missing inspection before "
                "normal release."
            )


        elif has_critical:

            overall_status = (
                "HOLD_AND_PROTECT"
            )

            title = (
                "Protect and Control Current Batch"
            )

            summary = (
                "At least one critical storage or handling "
                "condition is active. Hold the batch under "
                "the specified protective controls until "
                "the required verification, segregation "
                "or environmental correction is complete."
            )


        elif recommendations:

            overall_status = (
                "ACTION_REQUIRED"
            )

            title = (
                "Storage or Handling Action Required"
            )

            summary = (
                f"{len(recommendations)} defect-specific "
                "storage/handling recommendation(s) are "
                "active for the current batch."
            )


        else:

            overall_status = (
                "NORMAL_STORAGE"
            )

            title = (
                "Normal Green Coffee Storage"
            )

            summary = (
                "No active Processing Intelligence defect "
                "requires an additional storage or handling "
                "control. Continue normal clean, dry and "
                "protected green-coffee storage practices."
            )


        # =================================================
        # RESPONSE
        # =================================================

        return StorageHandlingRecommendation(

            overall_status=(
                overall_status
            ),

            title=title,

            summary=summary,

            recommendations=(
                recommendations
            ),

            total_recommendations=(
                len(recommendations)
            ),

            active_defect_count=(
                defect_profile
                .active_defect_count
            ),

            inspection_complete=(
                inspection_complete
            ),

            requires_isolation=(
                requires_isolation
            ),

            requires_dry_storage=(
                requires_dry_storage
            ),

            requires_environment_stabilization=(
                requires_environment_stabilization
            ),

            requires_retest=(
                requires_retest
            ),

            requires_gentle_handling=(
                requires_gentle_handling
            ),

            requires_reject_segregation=(
                requires_reject_segregation
            ),

            methodology_note=(
                "Module 6 is defect-driven and does not use "
                "the final quality score, grade or overall "
                "quality status as recommendation triggers. "
                "Each active defect produces its own storage "
                "or handling control. MQ sensor actions are "
                "sensor-technical verification rules because "
                "MQ-2, MQ-3 and MQ-135 are broad, non-specific "
                "gas sensors. Moisture, humidity, temperature "
                "and physical-defect recommendations are "
                "standard-supported research rules. The "
                "CRITICAL/HIGH/MEDIUM priorities and the "
                "overall status aggregation are research-"
                "defined workflow labels."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

storage_handling_service = (
    StorageHandlingService()
)
