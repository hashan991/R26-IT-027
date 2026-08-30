from typing import List

from ..defect_profile import (
    DefectProfile,
)

from .schema import (
    PreventiveGuidanceItem,
    PreventiveProcessGuidance,
)


# =========================================================
# PREVENTIVE PROCESS GUIDANCE SERVICE
# =========================================================
#
# MODULE 7 PURPOSE
#
# Current detected defect
#       -> likely process / handling weakness
#       -> preventive process guidance
#       -> reduce recurrence in FUTURE batches
#
# IMPORTANT:
#
# This module does NOT replace Module 2 corrective actions.
# Module 2 deals with the CURRENT batch.
# Module 7 deals with FUTURE process prevention.
#
# final_score / grade / overall sensor status /
# overall physical status do NOT trigger these rules.
#
# =========================================================

class PreventiveGuidanceService:

    # =====================================================
    # ADD GUIDANCE ITEM
    # =====================================================

    @staticmethod
    def _add_guidance(
        guidance_items: List[
            PreventiveGuidanceItem
        ],
        *,
        defect: str,
        process_area: str,
        title: str,
        guidance: str,
        prevention_goal: str,
        evidence_class: str,
        evidence_basis: List[str],
        detected_count=None,
    ) -> None:

        guidance_items.append(
            PreventiveGuidanceItem(
                defect=defect,
                process_area=process_area,
                title=title,
                guidance=guidance,
                prevention_goal=(
                    prevention_goal
                ),
                applies_to_future_batches=True,
                evidence_class=(
                    evidence_class
                ),
                evidence_basis=(
                    evidence_basis
                ),
                detected_count=(
                    detected_count
                ),
            )
        )


    # =====================================================
    # GENERATE MODULE 7
    # =====================================================

    def generate(
        self,
        *,
        defect_profile: DefectProfile,
    ) -> PreventiveProcessGuidance:

        sensor = (
            defect_profile.sensor
        )

        physical = (
            defect_profile.physical
        )

        inspection = (
            defect_profile.inspection
        )

        guidance_items: List[
            PreventiveGuidanceItem
        ] = []


        # =================================================
        # 1. MQ2 ABNORMAL
        # =================================================
        #
        # MQ-2 is a broad smoke / combustible-gas sensor.
        # It does NOT confirm a coffee defect.
        #
        # =================================================

        if sensor.mq2_abnormal:

            self._add_guidance(
                guidance_items,

                defect="MQ2_ABNORMAL",

                process_area=(
                    "STORAGE_ENVIRONMENT_CONTROL"
                ),

                title=(
                    "Strengthen Smoke and Fuel "
                    "Exposure Control"
                ),

                guidance=(
                    "For future batches, keep green coffee "
                    "and the sensor-testing area away from "
                    "smoke, fuel vapours, combustion "
                    "exhaust and other flammable volatile "
                    "sources. Maintain a clean, "
                    "well-ventilated storage and testing "
                    "environment, and use a consistent "
                    "clean-air sensor baseline before each "
                    "assessment session."
                ),

                prevention_goal=(
                    "Reduce repeated abnormal MQ-2 "
                    "responses caused by environmental "
                    "smoke or combustible-vapour exposure."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),

                evidence_basis=[
                    (
                        "Winsen MQ-2 technical guidance: "
                        "MQ-2 is sensitive to smoke and "
                        "flammable gases."
                    ),
                    (
                        "ISO 8455 storage/transport guidance "
                        "supports protecting green coffee "
                        "from contamination during storage "
                        "and handling."
                    ),
                ],
            )


        # =================================================
        # 2. MQ3 ABNORMAL
        # =================================================
        #
        # MQ-3 is alcohol-sensitive.
        #
        # IMPORTANT:
        # An MQ-3 response does NOT confirm fermentation.
        # It only triggers a preventive review of
        # fermentation and volatile-exposure controls.
        #
        # =================================================

        if sensor.mq3_abnormal:

            self._add_guidance(
                guidance_items,

                defect="MQ3_ABNORMAL",

                process_area=(
                    "FERMENTATION_CONTROL"
                ),

                title=(
                    "Improve Fermentation and "
                    "Volatile-Exposure Control"
                ),

                guidance=(
                    "For future batches, standardize "
                    "fermentation time, avoid unnecessary "
                    "processing delays, thoroughly clean "
                    "fermentation tanks and washing "
                    "channels between batches, and keep "
                    "green coffee and the sensor-testing "
                    "area away from external alcohol or "
                    "solvent vapours. The MQ-3 response "
                    "does not confirm fermentation; it "
                    "triggers preventive review of "
                    "fermentation and volatile-exposure "
                    "controls."
                ),

                prevention_goal=(
                    "Reduce recurrence of uncontrolled "
                    "fermentation conditions and external "
                    "alcohol-sensitive volatile exposure."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),

                evidence_basis=[
                    (
                        "Winsen MQ-3/MQ-3B technical "
                        "guidance: the sensor is "
                        "alcohol-sensitive."
                    ),
                    (
                        "FAO post-harvest guidance links "
                        "excessive fermentation and poor "
                        "tank/channel hygiene with "
                        "undesirable coffee flavour defects."
                    ),
                ],
            )


        # =================================================
        # 3. MQ135 ABNORMAL
        # =================================================
        #
        # MQ-135 is a broad air-quality / VOC-type sensor.
        # It is not coffee-defect-specific.
        #
        # =================================================

        if sensor.mq135_abnormal:

            self._add_guidance(
                guidance_items,

                defect="MQ135_ABNORMAL",

                process_area=(
                    "STORAGE_CONTAMINATION_CONTROL"
                ),

                title=(
                    "Strengthen Storage Contamination "
                    "Control"
                ),

                guidance=(
                    "For future batches, physically "
                    "separate green coffee from fuels, "
                    "fertilizers, pesticides, cleaning "
                    "chemicals, smoke and other "
                    "strong-smelling materials. Maintain "
                    "clean, odour-free and well-ventilated "
                    "storage and sensor-testing areas."
                ),

                prevention_goal=(
                    "Reduce environmental VOC and odour "
                    "exposure that can affect stored "
                    "coffee or create repeated abnormal "
                    "MQ-135 responses."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),

                evidence_basis=[
                    (
                        "Winsen MQ-135 technical guidance: "
                        "MQ-135 responds broadly to several "
                        "air-quality gases and vapours."
                    ),
                    (
                        "FAO green-coffee storage guidance "
                        "warns that coffee can absorb "
                        "undesirable odours from fuels and "
                        "chemical materials."
                    ),
                ],
            )


        # =================================================
        # 4. MOISTURE DEFECT
        # =================================================
        #
        # Current project input is an experimental sensor
        # moisture anomaly, NOT a calibrated coffee-moisture
        # percentage.
        #
        # Therefore this module does not claim that the
        # current sample is outside a standardized numeric
        # moisture range.
        #
        # =================================================

        if sensor.moisture_defect:

            self._add_guidance(
                guidance_items,

                defect="MOISTURE_DEFECT",

                process_area=(
                    "DRYING_PROCESS_CONTROL"
                ),

                title=(
                    "Standardize Green Coffee Drying"
                ),

                guidance=(
                    "For future batches, standardize the "
                    "drying process, maintain uniform "
                    "drying across the lot, turn or mix "
                    "coffee regularly where appropriate, "
                    "avoid both insufficient drying and "
                    "excessive drying, protect coffee from "
                    "rain and re-wetting, and verify actual "
                    "bean moisture with a calibrated or "
                    "reference method before hulling or "
                    "storage."
                ),

                prevention_goal=(
                    "Reduce future moisture inconsistency, "
                    "microbial deterioration risk and "
                    "over-drying-related bean brittleness."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                evidence_basis=[
                    (
                        "ICO Coffee Quality-Improvement "
                        "Programme provides green-coffee "
                        "moisture guidance when actual "
                        "moisture is measured appropriately."
                    ),
                    (
                        "ISO 6673 provides a reference "
                        "method for green-coffee water "
                        "content/loss in mass measurement."
                    ),
                    (
                        "ISO 24115 addresses calibration "
                        "of green-coffee moisture meters."
                    ),
                    (
                        "FAO post-harvest guidance explains "
                        "that insufficient drying can "
                        "support deterioration, while "
                        "over-drying can increase "
                        "brittleness and breakage."
                    ),
                ],
            )


        # =================================================
        # 5. TEMPERATURE ABNORMAL
        # =================================================
        #
        # The project's current defect profile keeps this
        # False until a separately validated temperature
        # rule is available.
        #
        # No universal numeric ISO temperature threshold is
        # invented here.
        #
        # =================================================

        if sensor.temperature_abnormal:

            self._add_guidance(
                guidance_items,

                defect="TEMPERATURE_ABNORMAL",

                process_area=(
                    "TEMPERATURE_CONTROL"
                ),

                title=(
                    "Improve Storage and Drying "
                    "Temperature Control"
                ),

                guidance=(
                    "For future batches, maintain a stable "
                    "storage environment, avoid direct heat "
                    "and rapid temperature fluctuations, "
                    "and control mechanical drying "
                    "conditions so the coffee is not "
                    "exposed to excessive or uneven heat."
                ),

                prevention_goal=(
                    "Reduce pre-roast condition instability "
                    "and heat-related quality deterioration."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                evidence_basis=[
                    (
                        "ISO 8455 supports storage and "
                        "transport conditions that preserve "
                        "green-coffee quality."
                    ),
                    (
                        "FAO drying guidance warns that "
                        "excessively hot, rapid or uneven "
                        "drying can reduce coffee quality."
                    ),
                ],
            )


        # =================================================
        # 6. HUMIDITY ABNORMAL
        # =================================================

        if sensor.humidity_abnormal:

            self._add_guidance(
                guidance_items,

                defect="HUMIDITY_ABNORMAL",

                process_area=(
                    "HUMIDITY_AND_STORAGE_CONTROL"
                ),

                title=(
                    "Improve Humidity and Re-Wetting "
                    "Prevention"
                ),

                guidance=(
                    "For future batches, use dry, "
                    "well-ventilated and leak-protected "
                    "storage, prevent rain entry and "
                    "condensation, keep coffee away from "
                    "damp floors and walls, protect bags "
                    "during transport, and monitor storage "
                    "humidity so dried coffee does not "
                    "reabsorb moisture."
                ),

                prevention_goal=(
                    "Reduce moisture reabsorption, mould "
                    "risk and musty quality deterioration "
                    "during storage and transport."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                evidence_basis=[
                    (
                        "ISO 8455 provides green-coffee "
                        "storage and transport guidance "
                        "aimed at minimizing quality "
                        "deterioration and contamination."
                    ),
                    (
                        "FAO storage guidance links humid "
                        "storage, re-wetting and condensation "
                        "with moisture uptake, mould and "
                        "musty quality defects."
                    ),
                ],
            )


        # =================================================
        # 7. BROKEN BEANS
        # =================================================
        #
        # physical.broken already includes:
        #
        #   broken + black_and_broken
        #
        # There is NO separate BLACK_AND_BROKEN preventive
        # recommendation.
        #
        # =================================================

        if physical.broken > 0:

            self._add_guidance(
                guidance_items,

                defect="BROKEN_BEANS",

                process_area=(
                    "PULPING_AND_HULLING_CONTROL"
                ),

                title=(
                    "Reduce Mechanical Bean Breakage"
                ),

                guidance=(
                    "For future batches, inspect and "
                    "correct pulper and huller settings, "
                    "avoid excessive cylinder speed, "
                    "maintain processing equipment, and "
                    "avoid excessive drying before hulling "
                    "because overly dry beans become more "
                    "brittle and are more likely to break."
                ),

                prevention_goal=(
                    "Reduce mechanically damaged and "
                    "broken green coffee beans before "
                    "future roasting stages."
                ),

                evidence_class=(
                    "CREDIBLE_SOURCE_DIRECT"
                ),

                evidence_basis=[
                    (
                        "FAO green-coffee defect guidance "
                        "directly associates broken beans "
                        "with inadequate pulper/huller "
                        "adjustment, excessive cylinder "
                        "speed and hulling coffee that is "
                        "too dry."
                    ),
                    (
                        "FAO guidance also notes that broken "
                        "beans can roast faster than whole "
                        "beans and may char."
                    ),
                ],

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
        #   black + black_and_broken
        #
        # There is NO separate BLACK_AND_BROKEN guidance.
        #
        # =================================================

        if physical.black > 0:

            self._add_guidance(
                guidance_items,

                defect="BLACK_BEANS",

                process_area=(
                    "HARVEST_AND_POST_HARVEST_CONTROL"
                ),

                title=(
                    "Reduce Black Bean Formation"
                ),

                guidance=(
                    "For future batches, improve ripe-cherry "
                    "selection, avoid mixing deteriorated or "
                    "fallen cherries into clean lots, "
                    "control fermentation duration, keep "
                    "fermentation tanks and washing "
                    "channels clean, ensure proper and "
                    "uniform drying, and prevent repeated "
                    "wetting during drying, storage and "
                    "transport."
                ),

                prevention_goal=(
                    "Reduce recurrence of black-bean "
                    "defects associated with harvesting, "
                    "fermentation, drying and re-wetting "
                    "problems."
                ),

                evidence_class=(
                    "CREDIBLE_SOURCE_DIRECT"
                ),

                evidence_basis=[
                    (
                        "FAO green-coffee defect guidance "
                        "identifies black beans as an "
                        "important defect and associates "
                        "them with deteriorated/fallen "
                        "cherries, prolonged fermentation, "
                        "poor drying and intermittent "
                        "wetting."
                    ),
                    (
                        "FAO post-harvest guidance also "
                        "supports improved fermentation "
                        "hygiene and controlled drying to "
                        "reduce quality defects."
                    ),
                ],

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
        # MODULE SUMMARY
        # =================================================

        if guidance_items:

            title = (
                "Preventive Process Improvements "
                "Recommended"
            )

            summary = (
                f"{len(guidance_items)} defect-driven "
                "preventive process guidance item(s) were "
                "generated to reduce recurrence of the "
                "detected conditions in future coffee "
                "batches."
            )

        else:

            title = (
                "No Defect-Specific Preventive "
                "Guidance Triggered"
            )

            summary = (
                "No active Processing Intelligence defect "
                "currently triggers a defect-specific "
                "preventive process recommendation. "
                "Continue normal documented harvesting, "
                "processing, drying, storage, equipment "
                "maintenance and contamination-control "
                "procedures."
            )


        # =================================================
        # RESPONSE
        # =================================================

        return PreventiveProcessGuidance(

            title=title,

            summary=summary,

            total_guidance_items=(
                len(
                    guidance_items
                )
            ),

            guidance=(
                guidance_items
            ),

            active_defect_count=(
                defect_profile
                .active_defect_count
            ),

            inspection_complete=(
                inspection_complete
            ),

            methodology_note=(
                "Module 7 is defect-driven and is intended "
                "for future process prevention rather than "
                "current-batch correction. Each active "
                "defect independently produces preventive "
                "guidance for the relevant process area. "
                "Final score, grade and overall quality "
                "statuses do not trigger these rules. "
                "MQ-2, MQ-3 and MQ-135 guidance is treated "
                "as sensor-technical because these sensors "
                "are broad and non-specific. The current "
                "moisture flag is an experimental sensor "
                "anomaly and is not presented as a "
                "standardized moisture percentage. "
                "Black-and-broken beans do not receive a "
                "separate recommendation: they already "
                "contribute to both the normalized broken "
                "and black defect profiles."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

preventive_guidance_service = (
    PreventiveGuidanceService()
)
