from typing import List

from ..defect_profile import (
    DefectProfile,
)

from .schema import (
    RoastingReadinessTrigger,
    RoastingRecommendation,
)


# =========================================================
# ROASTING READINESS RECOMMENDATION SERVICE
# =========================================================
#
# New design:
#
#   Detected defect
#       -> defect-specific readiness trigger
#       -> required pre-roast action
#
# final_score, grade, quality_status, sensor_status and
# physical_status DO NOT trigger these recommendations.
#
# =========================================================

class RoastingRecommendationService:

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
    # ADD TRIGGER
    # =====================================================

    @staticmethod
    def _add_trigger(
        triggers: List[
            RoastingReadinessTrigger
        ],
        *,
        defect: str,
        readiness: str,
        title: str,
        reason: str,
        required_action: str,
        evidence_class: str,
        detected_count=None,
    ) -> None:

        triggers.append(
            RoastingReadinessTrigger(
                defect=defect,
                readiness=readiness,
                title=title,
                reason=reason,
                required_action=(
                    required_action
                ),
                evidence_class=(
                    evidence_class
                ),
                detected_count=(
                    detected_count
                ),
            )
        )


    # =====================================================
    # GENERATE
    # =====================================================

    def generate(
        self,
        *,
        defect_profile: DefectProfile,
    ) -> RoastingRecommendation:

        sensor = (
            defect_profile.sensor
        )

        physical = (
            defect_profile.physical
        )

        yield_counts = (
            defect_profile.yield_counts
        )

        inspection = (
            defect_profile.inspection
        )

        triggers: List[
            RoastingReadinessTrigger
        ] = []

        reasons: List[str] = []

        prerequisites: List[str] = []

        warnings: List[str] = []


        # =================================================
        # INSPECTION COMPLETENESS
        # =================================================
        #
        # Missing data is NOT treated as a coffee defect.
        # It is only a readiness gate.
        #
        # =================================================

        if (
            not inspection.sensor_complete
            or
            not inspection.physical_complete
        ):

            if (
                not inspection.sensor_complete
            ):
                reasons.append(
                    (
                        "The required voting-sensor "
                        "inspection data is incomplete."
                    )
                )

                prerequisites.append(
                    (
                        "Complete the sensor inspection "
                        "before a direct roasting release "
                        "decision is made."
                    )
                )

            if (
                not inspection.physical_complete
            ):
                reasons.append(
                    (
                        "The physical AI inspection does "
                        "not contain a valid bean sample."
                    )
                )

                prerequisites.append(
                    (
                        "Complete the physical AI "
                        "inspection before roasting."
                    )
                )


        # =================================================
        # 1. MQ2 ABNORMAL
        # =================================================

        if sensor.mq2_abnormal:

            self._add_trigger(
                triggers,
                defect="MQ2_ABNORMAL",
                readiness="CONDITIONAL",
                title=(
                    "Verify Smoke or Combustible "
                    "Volatile Exposure"
                ),
                reason=(
                    "An abnormal MQ-2 response was "
                    "detected. MQ-2 is a broad smoke and "
                    "flammable-gas sensor, so this signal "
                    "requires verification rather than "
                    "being treated as a confirmed coffee "
                    "defect."
                ),
                required_action=(
                    "Hold direct roasting temporarily, "
                    "inspect for smoke, fuel or other "
                    "combustible-vapour exposure, and "
                    "repeat the sensor assessment in a "
                    "clean environment."
                ),
                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),
            )


        # =================================================
        # 2. MQ3 ABNORMAL
        # =================================================

        if sensor.mq3_abnormal:

            self._add_trigger(
                triggers,
                defect="MQ3_ABNORMAL",
                readiness="CONDITIONAL",
                title=(
                    "Verify Alcohol-Sensitive "
                    "Volatile Condition"
                ),
                reason=(
                    "An abnormal MQ-3 response was "
                    "detected. MQ-3 is alcohol-sensitive "
                    "and does not by itself confirm coffee "
                    "fermentation."
                ),
                required_action=(
                    "Inspect for unusual fermentative "
                    "odour or external alcohol/solvent "
                    "vapours and repeat the sensor "
                    "assessment before roasting."
                ),
                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),
            )


        # =================================================
        # 3. MQ135 ABNORMAL
        # =================================================

        if sensor.mq135_abnormal:

            self._add_trigger(
                triggers,
                defect="MQ135_ABNORMAL",
                readiness="CONDITIONAL",
                title=(
                    "Verify Environmental VOC "
                    "or Odour Exposure"
                ),
                reason=(
                    "An abnormal MQ-135 response was "
                    "detected. MQ-135 responds broadly to "
                    "air-quality gases and vapours and is "
                    "not coffee-defect-specific."
                ),
                required_action=(
                    "Inspect storage for chemicals, fuels, "
                    "smoke or strong odours, move the "
                    "sample to a clean ventilated area if "
                    "needed, and repeat the assessment."
                ),
                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),
            )


        # =================================================
        # 4. MOISTURE DEFECT
        # =================================================

        if sensor.moisture_defect:

            self._add_trigger(
                triggers,
                defect="MOISTURE_DEFECT",
                readiness="NOT_READY",
                title=(
                    "Verify and Correct Moisture "
                    "Before Roasting"
                ),
                reason=(
                    "The experimental moisture sensor "
                    "response indicates a moisture anomaly. "
                    "The current raw sensor response does "
                    "not identify whether actual bean "
                    "moisture is too high or too low."
                ),
                required_action=(
                    "Do not roast directly. Verify actual "
                    "bean moisture using an appropriate "
                    "calibrated/reference method, correct "
                    "the moisture condition as required, "
                    "and reassess the batch."
                ),
                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
            )


        # =================================================
        # 5. TEMPERATURE ABNORMAL
        # =================================================

        if sensor.temperature_abnormal:

            self._add_trigger(
                triggers,
                defect="TEMPERATURE_ABNORMAL",
                readiness="CONDITIONAL",
                title=(
                    "Stabilize Pre-Roast "
                    "Environmental Temperature"
                ),
                reason=(
                    "An abnormal environmental temperature "
                    "condition was flagged by a separately "
                    "validated temperature rule."
                ),
                required_action=(
                    "Stabilize the storage and pre-roast "
                    "environment and reassess the batch "
                    "before direct roasting."
                ),
                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
            )


        # =================================================
        # 6. HUMIDITY ABNORMAL
        # =================================================

        if sensor.humidity_abnormal:

            self._add_trigger(
                triggers,
                defect="HUMIDITY_ABNORMAL",
                readiness="CONDITIONAL",
                title=(
                    "Stabilize Humidity and Check "
                    "for Moisture Reabsorption"
                ),
                reason=(
                    "The experimental humidity response "
                    "indicates abnormal humidity exposure, "
                    "which can contribute to moisture "
                    "reabsorption and storage-quality "
                    "deterioration."
                ),
                required_action=(
                    "Move the batch to a dry, ventilated "
                    "environment, prevent further humidity "
                    "exposure, and recheck bean moisture "
                    "before roasting."
                ),
                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
            )


        # =================================================
        # 7. BROKEN BEANS
        # =================================================
        #
        # physical.broken already includes:
        #
        #   original broken
        #   +
        #   black_and_broken
        #
        # =================================================

        if physical.broken > 0:

            self._add_trigger(
                triggers,
                defect="BROKEN_BEANS",
                readiness="CONDITIONAL",
                title=(
                    "Sort Broken Beans Before Roasting"
                ),
                reason=(
                    f"{physical.broken} beans show a "
                    "broken-shape defect in the normalized "
                    "recommendation profile. Broken beans "
                    "can roast faster than whole beans and "
                    "increase uneven-roast or charring risk."
                ),
                required_action=(
                    "Perform secondary sorting and separate "
                    "the broken fraction before selecting "
                    "the final roasting lot."
                ),
                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
                detected_count=(
                    physical.broken
                ),
            )


        # =================================================
        # 8. BLACK BEANS
        # =================================================
        #
        # physical.black already includes:
        #
        #   original black
        #   +
        #   black_and_broken
        #
        # =================================================

        if physical.black > 0:

            self._add_trigger(
                triggers,
                defect="BLACK_BEANS",
                readiness="CONDITIONAL",
                title=(
                    "Remove Black Beans Before Roasting"
                ),
                reason=(
                    f"{physical.black} beans show a "
                    "black-colour defect in the normalized "
                    "recommendation profile. Black beans "
                    "are a recognized green-coffee defect "
                    "with significant sensory-quality "
                    "concern."
                ),
                required_action=(
                    "Remove the detected black-bean "
                    "fraction and reassess the remaining "
                    "coffee lot before roasting."
                ),
                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
                detected_count=(
                    physical.black
                ),
            )


        # =================================================
        # BUILD EXPLAINABILITY ARRAYS
        # =================================================

        for trigger in triggers:

            reasons.append(
                trigger.reason
            )

            prerequisites.append(
                trigger.required_action
            )

            if (
                trigger.readiness
                ==
                "NOT_READY"
            ):
                warnings.append(
                    trigger.title
                )


        # =================================================
        # AGGREGATE FINAL READINESS
        # =================================================
        #
        # Research-defined priority:
        #
        #   NOT_READY
        #       >
        #   CONDITIONAL
        #       >
        #   READY
        #
        # Every individual defect trigger remains visible.
        #
        # =================================================

        inspection_complete = (
            inspection.sensor_complete
            and
            inspection.physical_complete
        )

        has_not_ready = any(
            trigger.readiness
            ==
            "NOT_READY"
            for trigger in triggers
        )

        has_conditional = any(
            trigger.readiness
            ==
            "CONDITIONAL"
            for trigger in triggers
        )


        if has_not_ready:

            readiness_status = (
                "NOT_READY"
            )

            roasting_eligibility = (
                "NOT_RECOMMENDED"
            )

            direct_roasting_allowed = False

            recommended_direction = (
                "CORRECT_AND_REASSESS_BEFORE_ROASTING"
            )

            title = (
                "Batch Not Ready for Roasting"
            )

            summary = (
                "At least one detected defect requires "
                "correction and reassessment before the "
                "batch should proceed to roasting."
            )


        elif (
            has_conditional
            or
            not inspection_complete
        ):

            readiness_status = (
                "CONDITIONAL"
            )

            roasting_eligibility = (
                "CONDITIONAL"
            )

            direct_roasting_allowed = False

            recommended_direction = (
                "COMPLETE_REQUIRED_ACTIONS_BEFORE_ROASTING"
            )

            title = (
                "Conditional Roasting Readiness"
            )

            summary = (
                "The batch should proceed to roasting only "
                "after the listed defect-specific actions "
                "and any missing inspections are completed."
            )


        else:

            readiness_status = (
                "READY"
            )

            roasting_eligibility = (
                "READY"
            )

            direct_roasting_allowed = True

            recommended_direction = (
                "STANDARD_PRE_ROAST_PREPARATION"
            )

            title = (
                "Batch Ready for Roasting"
            )

            summary = (
                "No active Processing Intelligence defect "
                "was detected and the required inspection "
                "data is complete. Normal pre-roast quality "
                "controls can continue."
            )

            prerequisites.append(
                (
                    "Complete normal pre-roast cleaning "
                    "and standard factory quality controls."
                )
            )


        # =================================================
        # COMPATIBILITY PERCENTAGES
        # =================================================

        total = (
            yield_counts.total_beans
        )

        broken_percentage = (
            self._percentage(
                physical.broken,
                total,
            )
        )

        severe_defect_percentage = (
            self._percentage(
                physical.black,
                total,
            )
        )


        return RoastingRecommendation(

            readiness_status=(
                readiness_status
            ),

            roasting_eligibility=(
                roasting_eligibility
            ),

            direct_roasting_allowed=(
                direct_roasting_allowed
            ),

            recommended_direction=(
                recommended_direction
            ),

            title=title,

            summary=summary,

            triggers=triggers,

            active_defect_count=(
                defect_profile
                .active_defect_count
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

            unknown_percentage=0.0,

            inspection_complete=(
                inspection_complete
            ),

            methodology_note=(
                "Roasting readiness is generated from "
                "explicit defect evidence, not from the "
                "final quality score, grade, overall "
                "sensor status or physical status. "
                "MQ sensor rules are sensor-technical "
                "verification rules because the MQ devices "
                "are broad gas sensors and do not confirm a "
                "specific coffee defect. Moisture, humidity "
                "and physical-defect actions are "
                "standard-supported research rules. The "
                "READY / CONDITIONAL / NOT_READY aggregation "
                "priority is research-defined."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

roasting_recommendation_service = (
    RoastingRecommendationService()
)
