from typing import Dict, List

from ..defect_profile import (
    DefectProfile,
)

from .schema import (
    BatchUsageDefectRecommendation,
    BatchUsageRecommendation,
)


# =========================================================
# BATCH USAGE RECOMMENDATION SERVICE
# =========================================================
#
# Module 4 is DEFECT-DRIVEN.
#
# Each detected defect independently creates a usage
# recommendation.
#
# final_score, grade, sensor_status, physical_status and
# quality_status DO NOT trigger Module 4 recommendations.
#
# =========================================================

class BatchUsageService:

    # =====================================================
    # AGGREGATION PRIORITY
    # =====================================================
    #
    # Higher value = more restrictive recommendation.
    #
    # No rule here automatically rejects the whole batch.
    #
    # =====================================================

    RECOMMENDATION_PRIORITY: Dict[
        str,
        int,
    ] = {
        "DIRECT_USE": 0,
        "SORT_AND_USE": 1,
        "STABILIZE_AND_REASSESS": 2,
        "CONDITION_AND_REASSESS": 3,
        "HOLD_AND_STABILIZE": 4,
        "HOLD_FOR_VERIFICATION": 5,
        "INSPECTION_REQUIRED": 6,
    }


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
    # ADD DEFECT RECOMMENDATION
    # =====================================================

    @staticmethod
    def _add_recommendation(
        recommendations: List[
            BatchUsageDefectRecommendation
        ],
        *,
        defect: str,
        recommendation: str,
        title: str,
        explanation: str,
        required_action: str,
        evidence_class: str,
        detected_count=None,
    ) -> None:

        recommendations.append(
            BatchUsageDefectRecommendation(

                defect=defect,

                recommendation=(
                    recommendation
                ),

                title=title,

                explanation=(
                    explanation
                ),

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
    # GET MOST RESTRICTIVE RECOMMENDATION
    # =====================================================

    def _get_primary_recommendation(
        self,
        recommendations: List[
            BatchUsageDefectRecommendation
        ],
        *,
        inspection_complete: bool,
    ) -> str:

        if not inspection_complete:
            return "INSPECTION_REQUIRED"

        if not recommendations:
            return "DIRECT_USE"

        return max(
            (
                item.recommendation
                for item in recommendations
            ),
            key=lambda value:
                self.RECOMMENDATION_PRIORITY[
                    value
                ],
        )


    # =====================================================
    # BUILD OVERALL TEXT
    # =====================================================

    @staticmethod
    def _get_overall_text(
        primary_recommendation: str,
    ):

        mapping = {

            "DIRECT_USE": {
                "title": (
                    "Batch Suitable for Direct Use"
                ),
                "summary": (
                    "No active Processing Intelligence "
                    "defect requires a special batch-use "
                    "restriction."
                ),
                "recommended_use": (
                    "The batch may continue through normal "
                    "pre-roast factory preparation and "
                    "standard quality controls."
                ),
            },

            "SORT_AND_USE": {
                "title": (
                    "Sort the Batch Before Use"
                ),
                "summary": (
                    "Physical defects were detected, but "
                    "the current evidence supports "
                    "continued use after defect removal or "
                    "secondary sorting."
                ),
                "recommended_use": (
                    "Complete the required sorting, remove "
                    "the affected fraction, reinspect the "
                    "remaining lot, and then evaluate it "
                    "for normal processing."
                ),
            },

            "STABILIZE_AND_REASSESS": {
                "title": (
                    "Stabilize the Batch Before Use"
                ),
                "summary": (
                    "The batch environment should be "
                    "stabilized before a direct processing "
                    "decision is made."
                ),
                "recommended_use": (
                    "Stabilize the pre-roast environment "
                    "and reassess the batch before release "
                    "to roasting."
                ),
            },

            "CONDITION_AND_REASSESS": {
                "title": (
                    "Condition and Reassess the Batch"
                ),
                "summary": (
                    "A moisture-related condition requires "
                    "verification and correction before "
                    "normal batch use."
                ),
                "recommended_use": (
                    "Verify the actual bean moisture "
                    "condition, correct it as required, and "
                    "repeat the quality assessment before "
                    "processing."
                ),
            },

            "HOLD_AND_STABILIZE": {
                "title": (
                    "Hold and Stabilize the Batch"
                ),
                "summary": (
                    "Abnormal humidity exposure requires a "
                    "temporary hold while the storage "
                    "condition is stabilized."
                ),
                "recommended_use": (
                    "Keep the batch in a dry protected "
                    "environment, prevent further moisture "
                    "reabsorption, and reassess moisture "
                    "and humidity before use."
                ),
            },

            "HOLD_FOR_VERIFICATION": {
                "title": (
                    "Hold Batch for Verification"
                ),
                "summary": (
                    "One or more non-specific gas-sensor "
                    "signals require verification before "
                    "the batch is assigned to direct "
                    "production use."
                ),
                "recommended_use": (
                    "Temporarily hold the batch, inspect "
                    "for environmental volatile or odour "
                    "sources, repeat the relevant sensor "
                    "assessment, and release only after the "
                    "condition is verified."
                ),
            },

            "INSPECTION_REQUIRED": {
                "title": (
                    "Complete Inspection Before Batch Use"
                ),
                "summary": (
                    "Required sensor or physical inspection "
                    "evidence is incomplete."
                ),
                "recommended_use": (
                    "Do not make a direct batch-use "
                    "decision until the required quality "
                    "inspection is complete."
                ),
            },
        }

        return mapping[
            primary_recommendation
        ]


    # =====================================================
    # GENERATE MODULE 4
    # =====================================================

    def generate(
        self,
        *,
        defect_profile: DefectProfile,
    ) -> BatchUsageRecommendation:

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

        recommendations: List[
            BatchUsageDefectRecommendation
        ] = []


        # =================================================
        # 1. MQ2 ABNORMAL
        # =================================================

        if sensor.mq2_abnormal:

            self._add_recommendation(
                recommendations,

                defect="MQ2_ABNORMAL",

                recommendation=(
                    "HOLD_FOR_VERIFICATION"
                ),

                title=(
                    "Hold for MQ-2 Signal Verification"
                ),

                explanation=(
                    "MQ-2 is a broad smoke and "
                    "flammable-gas sensor. An abnormal "
                    "response should not be treated as a "
                    "confirmed coffee defect, but it should "
                    "be verified before direct production "
                    "use."
                ),

                required_action=(
                    "Inspect for smoke, fuel, combustion "
                    "exhaust or other combustible-vapour "
                    "exposure and repeat the MQ-2 "
                    "assessment in a clean environment."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),
            )


        # =================================================
        # 2. MQ3 ABNORMAL
        # =================================================

        if sensor.mq3_abnormal:

            self._add_recommendation(
                recommendations,

                defect="MQ3_ABNORMAL",

                recommendation=(
                    "HOLD_FOR_VERIFICATION"
                ),

                title=(
                    "Hold for MQ-3 Signal Verification"
                ),

                explanation=(
                    "MQ-3 is alcohol-sensitive and the "
                    "signal does not by itself confirm "
                    "coffee fermentation. The batch should "
                    "therefore be verified before direct "
                    "use."
                ),

                required_action=(
                    "Inspect for unusual fermentative "
                    "odours and external alcohol or solvent "
                    "vapours, then repeat the MQ-3 "
                    "assessment."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),
            )


        # =================================================
        # 3. MQ135 ABNORMAL
        # =================================================

        if sensor.mq135_abnormal:

            self._add_recommendation(
                recommendations,

                defect="MQ135_ABNORMAL",

                recommendation=(
                    "HOLD_FOR_VERIFICATION"
                ),

                title=(
                    "Hold for VOC / Odour Verification"
                ),

                explanation=(
                    "MQ-135 responds broadly to several "
                    "air-quality gases and vapours. An "
                    "abnormal response requires "
                    "environmental verification rather "
                    "than automatic coffee-defect "
                    "confirmation."
                ),

                required_action=(
                    "Inspect for chemicals, fuels, smoke "
                    "and strong odours, move the coffee to "
                    "a clean ventilated environment when "
                    "necessary, and repeat the assessment."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),
            )


        # =================================================
        # 4. MOISTURE DEFECT
        # =================================================

        if sensor.moisture_defect:

            self._add_recommendation(
                recommendations,

                defect="MOISTURE_DEFECT",

                recommendation=(
                    "CONDITION_AND_REASSESS"
                ),

                title=(
                    "Verify Moisture Before Batch Use"
                ),

                explanation=(
                    "The experimental moisture response "
                    "indicates a moisture anomaly. Because "
                    "the current raw sensor response does "
                    "not directly provide standardized bean "
                    "moisture percentage, the actual "
                    "condition must be verified before use."
                ),

                required_action=(
                    "Verify actual bean moisture with an "
                    "appropriate calibrated or reference "
                    "method, correct the condition if "
                    "required, and reassess the batch."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
            )


        # =================================================
        # 5. TEMPERATURE ABNORMAL
        # =================================================

        if sensor.temperature_abnormal:

            self._add_recommendation(
                recommendations,

                defect="TEMPERATURE_ABNORMAL",

                recommendation=(
                    "STABILIZE_AND_REASSESS"
                ),

                title=(
                    "Stabilize Temperature Before Use"
                ),

                explanation=(
                    "An abnormal pre-roast environmental "
                    "temperature condition was flagged by "
                    "the separate temperature rule."
                ),

                required_action=(
                    "Move the batch away from excessive "
                    "heat or rapid temperature fluctuation, "
                    "stabilize the environment, and "
                    "reassess before processing."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
            )


        # =================================================
        # 6. HUMIDITY ABNORMAL
        # =================================================

        if sensor.humidity_abnormal:

            self._add_recommendation(
                recommendations,

                defect="HUMIDITY_ABNORMAL",

                recommendation=(
                    "HOLD_AND_STABILIZE"
                ),

                title=(
                    "Hold and Stabilize Humidity Condition"
                ),

                explanation=(
                    "Abnormal humidity exposure can "
                    "contribute to moisture reabsorption "
                    "and storage-quality deterioration."
                ),

                required_action=(
                    "Move the batch to dry, protected and "
                    "well-ventilated storage, prevent "
                    "condensation or re-wetting, and "
                    "reassess humidity and bean moisture."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),
            )


        # =================================================
        # 7. BROKEN BEANS
        # =================================================
        #
        # physical.broken already equals:
        #
        #   broken + black_and_broken
        #
        # =================================================

        if physical.broken > 0:

            self._add_recommendation(
                recommendations,

                defect="BROKEN_BEANS",

                recommendation=(
                    "SORT_AND_USE"
                ),

                title=(
                    "Sort Broken Beans Before Use"
                ),

                explanation=(
                    f"{physical.broken} beans contribute "
                    "to the normalized broken-bean defect "
                    "profile. Broken beans can roast "
                    "differently from whole beans and "
                    "should be controlled through sorting."
                ),

                required_action=(
                    "Perform secondary sorting, separate "
                    "the broken fraction, and reinspect the "
                    "remaining batch before normal use."
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
        # physical.black already equals:
        #
        #   black + black_and_broken
        #
        # One black bean does NOT automatically reject the
        # whole batch in this research module.
        #
        # =================================================

        if physical.black > 0:

            self._add_recommendation(
                recommendations,

                defect="BLACK_BEANS",

                recommendation=(
                    "SORT_AND_USE"
                ),

                title=(
                    "Remove Black Beans Before Use"
                ),

                explanation=(
                    f"{physical.black} beans contribute "
                    "to the normalized black-bean defect "
                    "profile. Black beans are a recognized "
                    "green-coffee defect with sensory "
                    "quality concern, but their presence "
                    "does not automatically reject the "
                    "entire batch in this module."
                ),

                required_action=(
                    "Remove the detected black-bean "
                    "fraction, keep rejected material "
                    "separate, and reassess the remaining "
                    "lot before normal processing."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                detected_count=(
                    physical.black
                ),
            )


        # =================================================
        # INSPECTION COMPLETENESS
        # =================================================

        inspection_complete = (
            inspection.sensor_complete
            and
            inspection.physical_complete
        )


        # =================================================
        # PRIMARY RECOMMENDATION
        # =================================================

        primary_recommendation = (
            self._get_primary_recommendation(

                recommendations,

                inspection_complete=(
                    inspection_complete
                ),
            )
        )


        overall_text = (
            self._get_overall_text(
                primary_recommendation
            )
        )


        # =================================================
        # ACTION FLAGS
        # =================================================

        direct_use_allowed = (
            primary_recommendation
            ==
            "DIRECT_USE"
        )


        sorting_required = any(
            item.recommendation
            ==
            "SORT_AND_USE"
            for item in recommendations
        )


        stabilization_required = any(
            item.recommendation
            in {
                "STABILIZE_AND_REASSESS",
                "HOLD_AND_STABILIZE",
            }
            for item in recommendations
        )


        conditioning_required = any(
            item.recommendation
            ==
            "CONDITION_AND_REASSESS"
            for item in recommendations
        )


        verification_required = any(
            item.recommendation
            ==
            "HOLD_FOR_VERIFICATION"
            for item in recommendations
        )


        reinspection_required = (
            not direct_use_allowed
        )


        rework_required = any(
            [
                sorting_required,
                stabilization_required,
                conditioning_required,
                verification_required,
            ]
        )


        # =================================================
        # RESTRICTIONS
        # =================================================

        restrictions: List[str] = []


        if not inspection_complete:

            restrictions.append(
                (
                    "Do not release the batch for direct "
                    "use until the required sensor and "
                    "physical inspections are complete."
                )
            )


        if verification_required:

            restrictions.append(
                (
                    "Do not treat abnormal MQ sensor "
                    "responses as confirmed coffee defects; "
                    "verify the environment and repeat the "
                    "relevant sensor assessment."
                )
            )


        if conditioning_required:

            restrictions.append(
                (
                    "Do not release the batch based only on "
                    "the raw moisture-sensor anomaly; "
                    "verify actual bean moisture first."
                )
            )


        if stabilization_required:

            restrictions.append(
                (
                    "Do not proceed to normal use until the "
                    "environmental condition has been "
                    "stabilized and reassessed."
                )
            )


        if sorting_required:

            restrictions.append(
                (
                    "Complete the required physical sorting "
                    "and reassess the remaining coffee lot "
                    "before normal processing."
                )
            )


        # =================================================
        # COMPATIBILITY PERCENTAGES
        # =================================================
        #
        # physical.broken and physical.black are defect
        # PROPERTY counts. They overlap for black_and_broken.
        #
        # Therefore broken_percentage and
        # severe_defect_percentage must not be added together.
        #
        # =================================================

        total = (
            yield_counts.total_beans
        )


        good_percentage = (
            self._percentage(
                yield_counts.good,
                total,
            )
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


        # =================================================
        # RESPONSE
        # =================================================

        return BatchUsageRecommendation(

            primary_recommendation=(
                primary_recommendation
            ),

            title=(
                overall_text[
                    "title"
                ]
            ),

            summary=(
                overall_text[
                    "summary"
                ]
            ),

            recommended_use=(
                overall_text[
                    "recommended_use"
                ]
            ),

            recommendations=(
                recommendations
            ),

            active_defect_count=(
                defect_profile
                .active_defect_count
            ),

            inspection_complete=(
                inspection_complete
            ),

            direct_use_allowed=(
                direct_use_allowed
            ),

            sorting_required=(
                sorting_required
            ),

            stabilization_required=(
                stabilization_required
            ),

            conditioning_required=(
                conditioning_required
            ),

            verification_required=(
                verification_required
            ),

            reinspection_required=(
                reinspection_required
            ),

            rework_required=(
                rework_required
            ),

            blend_evaluation_required=False,

            # Old product-tier suggestions are deliberately
            # not generated by the new defect-driven module.
            alternative_uses=[],

            usage_options=[],

            restrictions=restrictions,

            good_percentage=(
                good_percentage
            ),

            broken_percentage=(
                broken_percentage
            ),

            severe_defect_percentage=(
                severe_defect_percentage
            ),

            unknown_percentage=0.0,

            sensor_status=(
                "DEFECT_DRIVEN"
            ),

            physical_status=(
                "DEFECT_DRIVEN"
            ),

            final_grade=(
                "NOT_USED"
            ),

            methodology_note=(
                "Module 4 is defect-driven. Every active "
                "defect independently creates a batch-use "
                "recommendation, and the overall result is "
                "the most restrictive active condition. "
                "Final score, grade and overall sensor or "
                "physical status do not trigger these "
                "rules. MQ-2, MQ-3 and MQ-135 outputs are "
                "treated as non-specific verification "
                "signals. Moisture, environmental and "
                "physical-defect usage actions are "
                "standard-supported research rules. "
                "DIRECT_USE / SORT_AND_USE / "
                "STABILIZE_AND_REASSESS / "
                "CONDITION_AND_REASSESS / "
                "HOLD_AND_STABILIZE / "
                "HOLD_FOR_VERIFICATION and their priority "
                "order are research-defined software "
                "decision labels. No single detected black "
                "or broken bean automatically rejects the "
                "whole batch. The normalized broken and "
                "black defect-property counts both include "
                "black-and-broken beans, so their displayed "
                "percentages can overlap and must not be "
                "summed."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

batch_usage_service = (
    BatchUsageService()
)
