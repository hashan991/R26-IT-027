from typing import List

from ..defect_profile import (
    DefectProfile,
)

from .schema import (
    PreRoastCorrectiveAction,
    PreRoastPlan,
)


# =========================================================
# PRE-ROAST CORRECTIVE ACTIONS SERVICE
# =========================================================
#
# New defect-driven Module 2:
#
#   Detected defect
#       -> independent corrective action
#
# Multiple active defects produce multiple actions.
#
# final_score / grade / sensor_status / physical_status
# DO NOT trigger these corrective actions.
#
# =========================================================

class PreRoastPlanService:

    # =====================================================
    # ADD ACTION
    # =====================================================

    @staticmethod
    def _add_action(
        actions: List[
            PreRoastCorrectiveAction
        ],
        *,
        defect: str,
        title: str,
        description: str,
        action_type: str,
        priority: str,
        evidence_class: str,
        detected_count=None,
    ) -> None:

        actions.append(
            PreRoastCorrectiveAction(

                step_number=(
                    len(actions)
                    + 1
                ),

                defect=defect,

                title=title,

                description=(
                    description
                ),

                action_type=(
                    action_type
                ),

                priority=priority,

                required=True,

                evidence_class=(
                    evidence_class
                ),

                detected_count=(
                    detected_count
                ),
            )
        )


    # =====================================================
    # PREPARATION LEVEL
    # =====================================================
    #
    # Priority aggregation is research-defined.
    #
    # CRITICAL action present -> CRITICAL
    # HIGH action present     -> EXTENSIVE
    # MEDIUM only             -> MODERATE
    # No actions              -> MINIMAL
    #
    # =====================================================

    @staticmethod
    def _get_preparation_level(
        actions: List[
            PreRoastCorrectiveAction
        ],
    ) -> str:

        priorities = {
            action.priority
            for action in actions
        }

        if "CRITICAL" in priorities:
            return "CRITICAL"

        if "HIGH" in priorities:
            return "EXTENSIVE"

        if "MEDIUM" in priorities:
            return "MODERATE"

        return "MINIMAL"


    # =====================================================
    # GENERATE MODULE 2
    # =====================================================

    def generate(
        self,
        *,
        defect_profile: DefectProfile,
    ) -> PreRoastPlan:

        sensor = (
            defect_profile.sensor
        )

        physical = (
            defect_profile.physical
        )

        inspection = (
            defect_profile.inspection
        )

        actions: List[
            PreRoastCorrectiveAction
        ] = []


        # =================================================
        # 1. MQ2 ABNORMAL
        # =================================================

        if sensor.mq2_abnormal:

            self._add_action(
                actions,

                defect="MQ2_ABNORMAL",

                title=(
                    "Inspect Smoke and Combustible "
                    "Vapour Exposure"
                ),

                description=(
                    "Temporarily hold direct roasting. "
                    "Inspect the coffee storage and testing "
                    "area for smoke, fuel, combustion "
                    "exhaust or other combustible vapour "
                    "sources. Move the batch to a clean, "
                    "well-ventilated area if needed and "
                    "repeat the MQ-2 assessment before "
                    "release."
                ),

                action_type=(
                    "HOLD_AND_VERIFY"
                ),

                priority="HIGH",

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),
            )


        # =================================================
        # 2. MQ3 ABNORMAL
        # =================================================

        if sensor.mq3_abnormal:

            self._add_action(
                actions,

                defect="MQ3_ABNORMAL",

                title=(
                    "Inspect Alcohol-Sensitive "
                    "Volatile Condition"
                ),

                description=(
                    "Hold direct roasting while the signal "
                    "is verified. Inspect for unusual "
                    "alcohol-like or fermentative odours "
                    "and remove external alcohol, solvent "
                    "or volatile sources from the testing "
                    "environment. Repeat the MQ-3 "
                    "assessment before further processing. "
                    "The MQ-3 result does not by itself "
                    "confirm coffee fermentation."
                ),

                action_type=(
                    "INSPECT_AND_RETEST"
                ),

                priority="HIGH",

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),
            )


        # =================================================
        # 3. MQ135 ABNORMAL
        # =================================================

        if sensor.mq135_abnormal:

            self._add_action(
                actions,

                defect="MQ135_ABNORMAL",

                title=(
                    "Inspect VOC and Odour "
                    "Contamination Sources"
                ),

                description=(
                    "Inspect the surrounding environment "
                    "for chemicals, fuels, smoke, strong "
                    "odours or other volatile sources. "
                    "Transfer the batch to a clean, "
                    "odour-free and well-ventilated area "
                    "when necessary, then repeat the "
                    "MQ-135 assessment before roasting."
                ),

                action_type=(
                    "INSPECT_AND_RETEST"
                ),

                priority="HIGH",

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),
            )


        # =================================================
        # 4. MOISTURE DEFECT
        # =================================================
        #
        # The current project sensor rule identifies only an
        # experimental moisture RESPONSE anomaly.
        #
        # It does NOT prove a standardized coffee-moisture %.
        #
        # =================================================

        if sensor.moisture_defect:

            self._add_action(
                actions,

                defect="MOISTURE_DEFECT",

                title=(
                    "Verify and Correct Bean Moisture"
                ),

                description=(
                    "Do not roast the batch immediately. "
                    "Verify the actual green-coffee "
                    "moisture condition using an "
                    "appropriate calibrated or reference "
                    "measurement method. Determine whether "
                    "the coffee is excessively moist or "
                    "over-dry, correct the condition as "
                    "required, and repeat the assessment "
                    "before roasting."
                ),

                action_type=(
                    "VERIFY_AND_CORRECT_MOISTURE"
                ),

                priority="CRITICAL",

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
            )


        # =================================================
        # 5. TEMPERATURE ABNORMAL
        # =================================================
        #
        # The current project sets temperature_abnormal=False
        # until a separate validated temperature rule exists.
        #
        # This rule is ready for future activation.
        #
        # =================================================

        if sensor.temperature_abnormal:

            self._add_action(
                actions,

                defect="TEMPERATURE_ABNORMAL",

                title=(
                    "Stabilize Pre-Roast Temperature"
                ),

                description=(
                    "Move the batch away from excessive "
                    "heat and rapid temperature changes. "
                    "Stabilize the storage and pre-roast "
                    "environment, then reassess the batch "
                    "before direct roasting."
                ),

                action_type=(
                    "STABILIZE_ENVIRONMENT"
                ),

                priority="MEDIUM",

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
            )


        # =================================================
        # 6. HUMIDITY ABNORMAL
        # =================================================

        if sensor.humidity_abnormal:

            self._add_action(
                actions,

                defect="HUMIDITY_ABNORMAL",

                title=(
                    "Control Humidity and Prevent "
                    "Moisture Reabsorption"
                ),

                description=(
                    "Move the batch to a dry, "
                    "well-ventilated and protected area. "
                    "Prevent further humid-air exposure, "
                    "condensation and re-wetting. Recheck "
                    "the humidity condition and verify bean "
                    "moisture before roasting."
                ),

                action_type=(
                    "CONTROL_HUMIDITY"
                ),

                priority="HIGH",

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
            )


        # =================================================
        # 7. BROKEN BEANS
        # =================================================
        #
        # physical.broken includes:
        #
        #   broken + black_and_broken
        #
        # No separate BLACK_AND_BROKEN corrective-action
        # category is generated.
        #
        # =================================================

        if physical.broken > 0:

            self._add_action(
                actions,

                defect="BROKEN_BEANS",

                title=(
                    "Secondary Sort Broken Beans"
                ),

                description=(
                    f"{physical.broken} beans contribute "
                    "to the normalized broken-bean defect "
                    "profile. Perform secondary sorting to "
                    "separate broken or chipped material "
                    "before the final roasting lot is "
                    "prepared."
                ),

                action_type=(
                    "SECONDARY_SORT"
                ),

                priority="MEDIUM",

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
        # physical.black includes:
        #
        #   black + black_and_broken
        #
        # =================================================

        if physical.black > 0:

            self._add_action(
                actions,

                defect="BLACK_BEANS",

                title=(
                    "Remove and Segregate Black Beans"
                ),

                description=(
                    f"{physical.black} beans contribute "
                    "to the normalized black-bean defect "
                    "profile. Remove the affected beans "
                    "during sorting and keep the rejected "
                    "material physically separated from "
                    "the usable coffee lot before "
                    "reinspection."
                ),

                action_type=(
                    "REMOVE_AND_SEGREGATE"
                ),

                priority="CRITICAL",

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                detected_count=(
                    physical.black
                ),
            )


        # =================================================
        # DERIVED MODULE FLAGS
        # =================================================

        inspection_complete = (
            inspection.sensor_complete
            and
            inspection.physical_complete
        )


        sensor_retest_required = any(
            action.defect
            in {
                "MQ2_ABNORMAL",
                "MQ3_ABNORMAL",
                "MQ135_ABNORMAL",
                "MOISTURE_DEFECT",
                "TEMPERATURE_ABNORMAL",
                "HUMIDITY_ABNORMAL",
            }
            for action in actions
        )


        physical_retest_required = any(
            action.defect
            in {
                "BROKEN_BEANS",
                "BLACK_BEANS",
            }
            for action in actions
        )


        manual_inspection_required = any(
            action.defect
            in {
                "MQ2_ABNORMAL",
                "MQ3_ABNORMAL",
                "MQ135_ABNORMAL",
                "BROKEN_BEANS",
                "BLACK_BEANS",
            }
            for action in actions
        )


        severe_defect_removal_required = (
            physical.black
            > 0
        )


        broken_sorting_required = (
            physical.broken
            > 0
        )


        reinspection_required = (
            len(actions)
            > 0
            or
            not inspection_complete
        )


        preparation_level = (
            self._get_preparation_level(
                actions
            )
        )


        # =================================================
        # READINESS STATUS
        # =================================================

        if not inspection_complete:

            readiness_status = (
                "INSPECTION_REQUIRED"
            )

            title = (
                "Complete Quality Inspection "
                "Before Corrective Release"
            )

            summary = (
                "The corrective-action module cannot "
                "support a complete pre-roast release "
                "because one or more required inspections "
                "are incomplete. Complete the missing "
                "inspection and then apply all detected "
                "defect-specific corrective actions."
            )


        elif actions:

            readiness_status = (
                "READY_AFTER_PREPARATION"
            )

            title = (
                "Pre-Roast Corrective Actions Required"
            )

            summary = (
                f"{len(actions)} defect-specific "
                "corrective action(s) must be completed "
                "before the batch is considered ready for "
                "the next roasting decision."
            )


        else:

            readiness_status = (
                "READY"
            )

            title = (
                "No Corrective Pre-Roast Action Required"
            )

            summary = (
                "No active Processing Intelligence defect "
                "requires a corrective pre-roast action. "
                "Continue normal factory cleaning and "
                "quality-control procedures."
            )


        # =================================================
        # RESPONSE
        # =================================================

        return PreRoastPlan(

            readiness_status=(
                readiness_status
            ),

            title=title,

            summary=summary,

            total_actions=(
                len(actions)
            ),

            mandatory_actions=(
                sum(
                    1
                    for action in actions
                    if action.required
                )
            ),

            actions=actions,

            reinspection_required=(
                reinspection_required
            ),

            sensor_retest_required=(
                sensor_retest_required
            ),

            physical_retest_required=(
                physical_retest_required
            ),

            manual_inspection_required=(
                manual_inspection_required
            ),

            severe_defect_removal_required=(
                severe_defect_removal_required
            ),

            broken_sorting_required=(
                broken_sorting_required
            ),

            estimated_preparation_level=(
                preparation_level
            ),

            active_defect_count=(
                defect_profile
                .active_defect_count
            ),

            inspection_complete=(
                inspection_complete
            ),

            methodology_note=(
                "Module 2 is defect-driven. Each active "
                "sensor or physical defect independently "
                "produces its relevant corrective action. "
                "Overall final score, grade, sensor status "
                "and physical status do not trigger these "
                "actions. MQ-2, MQ-3 and MQ-135 actions are "
                "sensor-technical verification rules "
                "because these sensors are broad and "
                "non-specific. Moisture, environmental and "
                "physical-defect actions are "
                "standard-supported research rules. "
                "CRITICAL/HIGH/MEDIUM priorities and the "
                "aggregated preparation level are "
                "research-defined workflow labels."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

pre_roast_plan_service = (
    PreRoastPlanService()
)
