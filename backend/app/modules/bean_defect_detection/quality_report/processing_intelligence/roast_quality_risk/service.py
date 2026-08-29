from typing import List

from ..defect_profile import (
    DefectProfile,
)

from .schema import (
    RoastQualityRisk,
    RoastQualityRiskItem,
)


# =========================================================
# ROAST QUALITY RISKS SERVICE
# =========================================================
#
# MODULE 3 - DEFECT-DRIVEN DESIGN
#
# Each active defect independently generates a roast-quality
# risk item.
#
# Overall final score, grade, sensor status and physical
# status DO NOT trigger Module 3 risks.
#
# =========================================================

class RoastQualityRiskService:

    # =====================================================
    # RESEARCH-DEFINED SEVERITY DISPLAY SCORES
    # =====================================================
    #
    # These numbers are NOT probabilities and are NOT
    # official ISO / ICO / SCA risk scores.
    #
    # They only provide a consistent numeric representation
    # for the categorical workflow severity.
    #
    # =====================================================

    RISK_SCORE = {
        "LOW": 25.0,
        "MEDIUM": 50.0,
        "HIGH": 75.0,
        "CRITICAL": 100.0,
    }


    RISK_RANK = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
        "CRITICAL": 4,
    }


    SENSOR_DEFECTS = {
        "MQ2_ABNORMAL",
        "MQ3_ABNORMAL",
        "MQ135_ABNORMAL",
        "MOISTURE_DEFECT",
        "TEMPERATURE_ABNORMAL",
        "HUMIDITY_ABNORMAL",
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
                /
                total
            )
            *
            100,
            2,
        )


    # =====================================================
    # ADD RISK
    # =====================================================

    def _add_risk(
        self,
        risks: List[
            RoastQualityRiskItem
        ],
        *,
        defect: str,
        risk_name: str,
        risk_level: str,
        explanation: str,
        drivers: List[str],
        recommended_control: str,
        evidence_class: str,
        source_basis: List[str],
        detected_count=None,
    ) -> None:

        risks.append(
            RoastQualityRiskItem(

                defect=defect,

                risk_name=(
                    risk_name
                ),

                risk_level=(
                    risk_level
                ),

                risk_score=(
                    self.RISK_SCORE[
                        risk_level
                    ]
                ),

                explanation=(
                    explanation
                ),

                drivers=drivers,

                recommended_control=(
                    recommended_control
                ),

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
    # OVERALL RISK
    # =====================================================

    def _get_overall_risk(
        self,
        risks: List[
            RoastQualityRiskItem
        ],
    ) -> str:

        if not risks:
            return "LOW"

        return max(
            (
                risk.risk_level
                for risk in risks
            ),
            key=lambda level:
                self.RISK_RANK[
                    level
                ],
        )


    # =====================================================
    # GENERATE
    # =====================================================

    def generate(
        self,
        *,
        defect_profile: DefectProfile,
    ) -> RoastQualityRisk:

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

        risks: List[
            RoastQualityRiskItem
        ] = []


        # =================================================
        # 1. MQ2 ABNORMAL
        # =================================================

        if sensor.mq2_abnormal:

            self._add_risk(
                risks,

                defect="MQ2_ABNORMAL",

                risk_name=(
                    "Possible Smoke or Combustible "
                    "Volatile Contamination Risk"
                ),

                risk_level="HIGH",

                explanation=(
                    "An abnormal MQ-2 response may indicate "
                    "exposure to smoke or combustible "
                    "volatile gases. Such exposure can "
                    "create an off-odour or contamination "
                    "concern before roasting. The MQ-2 "
                    "signal is broad and does not confirm a "
                    "specific coffee defect."
                ),

                drivers=[
                    (
                        "The research-defined MQ-2 defect "
                        "flag is active."
                    ),
                    (
                        "MQ-2 is a broad smoke and "
                        "flammable-gas sensor."
                    ),
                ],

                recommended_control=(
                    "Verify the batch in a clean "
                    "environment, inspect for smoke, fuel "
                    "or combustible-vapour exposure, and "
                    "repeat the sensor assessment before "
                    "roasting."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),

                source_basis=[
                    (
                        "Winsen MQ-2 technical "
                        "documentation."
                    ),
                    (
                        "ISO 8455 green-coffee storage and "
                        "transport contamination-control "
                        "principles."
                    ),
                ],
            )


        # =================================================
        # 2. MQ3 ABNORMAL
        # =================================================

        if sensor.mq3_abnormal:

            self._add_risk(
                risks,

                defect="MQ3_ABNORMAL",

                risk_name=(
                    "Possible Fermentation-Related "
                    "Off-Flavour Risk"
                ),

                risk_level="HIGH",

                explanation=(
                    "An abnormal MQ-3 response indicates an "
                    "alcohol-sensitive volatile signal. "
                    "This may justify review for abnormal "
                    "fermentative odour or volatile "
                    "exposure, but the MQ-3 response does "
                    "not confirm fermentation by itself."
                ),

                drivers=[
                    (
                        "The research-defined MQ-3 defect "
                        "flag is active."
                    ),
                    (
                        "MQ-3 is alcohol-sensitive rather "
                        "than coffee-defect-specific."
                    ),
                ],

                recommended_control=(
                    "Inspect for unusual fermentative "
                    "odours and external alcohol or solvent "
                    "sources, then repeat the sensor "
                    "assessment before roasting."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),

                source_basis=[
                    (
                        "Winsen MQ-3B technical "
                        "documentation."
                    ),
                    (
                        "FAO green-coffee post-harvest "
                        "guidance on excessive fermentation "
                        "and flavour defects."
                    ),
                ],
            )


        # =================================================
        # 3. MQ135 ABNORMAL
        # =================================================

        if sensor.mq135_abnormal:

            self._add_risk(
                risks,

                defect="MQ135_ABNORMAL",

                risk_name=(
                    "Possible Environmental VOC or "
                    "Odour Contamination Risk"
                ),

                risk_level="HIGH",

                explanation=(
                    "An abnormal MQ-135 response may "
                    "indicate unusual environmental gases "
                    "or volatile compounds. Because MQ-135 "
                    "is broad and non-specific, the signal "
                    "is treated as a contamination-screening "
                    "risk rather than proof of a specific "
                    "coffee defect."
                ),

                drivers=[
                    (
                        "The research-defined MQ-135 defect "
                        "flag is active."
                    ),
                    (
                        "MQ-135 responds to multiple gases "
                        "and vapours."
                    ),
                ],

                recommended_control=(
                    "Inspect for chemical, fuel, smoke and "
                    "strong-odour exposure, move the batch "
                    "to a clean ventilated environment when "
                    "needed, and repeat the assessment."
                ),

                evidence_class=(
                    "SENSOR_TECHNICAL_RULE"
                ),

                source_basis=[
                    (
                        "Winsen MQ135 technical "
                        "documentation."
                    ),
                    (
                        "ISO 8455 and FAO guidance on "
                        "protecting green coffee from "
                        "contamination and strong odours."
                    ),
                ],
            )


        # =================================================
        # 4. MOISTURE DEFECT
        # =================================================

        if sensor.moisture_defect:

            self._add_risk(
                risks,

                defect="MOISTURE_DEFECT",

                risk_name=(
                    "Inconsistent Roast Development Risk"
                ),

                risk_level="HIGH",

                explanation=(
                    "The experimental moisture sensor "
                    "response indicates a moisture anomaly. "
                    "A non-uniform or unsuitable bean "
                    "moisture condition can contribute to "
                    "inconsistent roast development and "
                    "quality variation. The current raw "
                    "sensor response does not establish an "
                    "actual standardized moisture "
                    "percentage."
                ),

                drivers=[
                    (
                        "The research-defined moisture "
                        "defect flag is active."
                    ),
                    (
                        "The current sensor result is a "
                        "response anomaly, not a calibrated "
                        "green-coffee moisture percentage."
                    ),
                ],

                recommended_control=(
                    "Verify actual bean moisture using an "
                    "appropriate calibrated or reference "
                    "method, correct the moisture condition "
                    "as required, and reassess before "
                    "roasting."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    (
                        "ICO Coffee Quality-Improvement "
                        "Programme moisture guidance."
                    ),
                    (
                        "ISO 6673 reference moisture / "
                        "water-content determination."
                    ),
                    (
                        "ISO 24115 moisture-meter "
                        "calibration guidance."
                    ),
                ],
            )


        # =================================================
        # 5. TEMPERATURE ABNORMAL
        # =================================================
        #
        # Current project configuration keeps this False
        # until a separately validated temperature rule is
        # available.
        #
        # =================================================

        if sensor.temperature_abnormal:

            self._add_risk(
                risks,

                defect="TEMPERATURE_ABNORMAL",

                risk_name=(
                    "Pre-Roast Condition Instability Risk"
                ),

                risk_level="MEDIUM",

                explanation=(
                    "An abnormal pre-roast environmental "
                    "temperature condition can indicate an "
                    "unstable storage or handling "
                    "environment that may reduce process "
                    "consistency."
                ),

                drivers=[
                    (
                        "A separately validated temperature "
                        "abnormality flag is active."
                    ),
                ],

                recommended_control=(
                    "Stabilize the storage and pre-roast "
                    "environment and reassess the batch "
                    "before direct roasting."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    (
                        "ISO 8455 green-coffee storage and "
                        "transport quality-preservation "
                        "guidance."
                    ),
                    (
                        "FAO drying and storage guidance."
                    ),
                ],
            )


        # =================================================
        # 6. HUMIDITY ABNORMAL
        # =================================================

        if sensor.humidity_abnormal:

            self._add_risk(
                risks,

                defect="HUMIDITY_ABNORMAL",

                risk_name=(
                    "Moisture Reabsorption and "
                    "Musty/Mould Quality Risk"
                ),

                risk_level="HIGH",

                explanation=(
                    "Abnormal humidity exposure can promote "
                    "moisture reabsorption in green coffee "
                    "and increase the risk of storage "
                    "quality deterioration, including "
                    "musty or mould-related quality "
                    "problems."
                ),

                drivers=[
                    (
                        "The research-defined humidity "
                        "defect flag is active."
                    ),
                ],

                recommended_control=(
                    "Protect the batch from further humid "
                    "air, condensation and re-wetting, move "
                    "it to dry ventilated storage, and "
                    "verify bean moisture before roasting."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    (
                        "ISO 8455 green-coffee storage and "
                        "transport guidance."
                    ),
                    (
                        "FAO guidance on green-coffee "
                        "humidity, re-wetting and mould / "
                        "musty quality deterioration."
                    ),
                ],
            )


        # =================================================
        # 7. BROKEN BEANS
        # =================================================
        #
        # defect_profile.physical.broken already equals:
        #
        #   broken + black_and_broken
        #
        # =================================================

        if physical.broken > 0:

            self._add_risk(
                risks,

                defect="BROKEN_BEANS",

                risk_name=(
                    "Uneven Roasting and Charring Risk"
                ),

                risk_level="HIGH",

                explanation=(
                    "Broken or chipped beans can roast "
                    "faster than whole beans and can char, "
                    "increasing the risk of uneven roast "
                    "development and beverage-quality "
                    "variation."
                ),

                drivers=[
                    (
                        f"{physical.broken} beans contribute "
                        "to the normalized broken-bean "
                        "defect profile."
                    ),
                    (
                        "The normalized count includes "
                        "beans that are both black and "
                        "broken."
                    ),
                ],

                recommended_control=(
                    "Perform secondary sorting and separate "
                    "the broken fraction before the final "
                    "roasting lot is prepared."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    (
                        "FAO green-coffee defects and "
                        "post-harvest guidance describing "
                        "faster roasting and charring of "
                        "broken beans."
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
        # defect_profile.physical.black already equals:
        #
        #   black + black_and_broken
        #
        # =================================================

        if physical.black > 0:

            self._add_risk(
                risks,

                defect="BLACK_BEANS",

                risk_name=(
                    "Severe Sensory Quality "
                    "Degradation Risk"
                ),

                risk_level="CRITICAL",

                explanation=(
                    "Black beans are a recognized "
                    "green-coffee defect associated with "
                    "serious sensory-quality concern. FAO "
                    "guidance notes that black beans can "
                    "produce bitter and disagreeable "
                    "beverage effects."
                ),

                drivers=[
                    (
                        f"{physical.black} beans contribute "
                        "to the normalized black-bean "
                        "defect profile."
                    ),
                    (
                        "The normalized count includes "
                        "beans that are both black and "
                        "broken."
                    ),
                ],

                recommended_control=(
                    "Remove and segregate the black-bean "
                    "fraction before roasting and reassess "
                    "the remaining coffee lot."
                ),

                evidence_class=(
                    "STANDARD_SUPPORTED_RESEARCH_RULE"
                ),

                source_basis=[
                    (
                        "ISO 10470 green-coffee defect "
                        "reference framework."
                    ),
                    (
                        "FAO green-coffee defect guidance "
                        "on black-bean sensory effects."
                    ),
                ],

                detected_count=(
                    physical.black
                ),
            )


        # =================================================
        # AGGREGATE MODULE RESULT
        # =================================================

        overall_risk = (
            self._get_overall_risk(
                risks
            )
        )


        overall_risk_score = (
            max(
                (
                    risk.risk_score
                    for risk in risks
                ),
                default=0.0,
            )
        )


        sensor_risk_contribution = (
            max(
                (
                    risk.risk_score
                    for risk in risks
                    if risk.defect
                    in self.SENSOR_DEFECTS
                ),
                default=0.0,
            )
        )


        recommended_controls = []

        for risk in risks:

            if (
                risk.recommended_control
                not in recommended_controls
            ):
                recommended_controls.append(
                    risk.recommended_control
                )


        inspection_complete = (
            inspection.sensor_complete
            and
            inspection.physical_complete
        )


        requires_corrective_action = (
            len(risks)
            > 0
        )


        # =================================================
        # COMPATIBILITY PERCENTAGES
        # =================================================
        #
        # These are defect-property percentages, not mutually
        # exclusive yield categories.
        #
        # A black-and-broken bean contributes to BOTH the
        # normalized broken and normalized black properties.
        #
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


        # =================================================
        # TITLE / SUMMARY
        # =================================================

        if not inspection_complete:

            title = (
                "Roast Quality Risk Assessment "
                "Requires Complete Inspection"
            )

            if risks:
                summary = (
                    f"{len(risks)} active defect-related "
                    "roast risk(s) were identified, but "
                    "one or more required inspections are "
                    "incomplete. The listed risks remain "
                    "valid; complete the missing inspection "
                    "before relying on the overall batch "
                    "assessment."
                )
            else:
                summary = (
                    "No active defect-related roast risk "
                    "was identified from the available "
                    "evidence, but one or more required "
                    "inspections are incomplete. A complete "
                    "risk assessment requires the missing "
                    "inspection data."
                )


        elif overall_risk == "CRITICAL":

            title = (
                "Critical Roast Quality Risk"
            )

            summary = (
                f"{len(risks)} defect-driven roast-quality "
                "risk(s) were identified. At least one "
                "active defect carries a research-defined "
                "CRITICAL risk level and requires "
                "corrective action before roasting."
            )


        elif overall_risk == "HIGH":

            title = (
                "High Roast Quality Risk"
            )

            summary = (
                f"{len(risks)} defect-driven roast-quality "
                "risk(s) were identified. Corrective "
                "controls should be completed before the "
                "batch proceeds to roasting."
            )


        elif overall_risk == "MEDIUM":

            title = (
                "Moderate Roast Quality Risk"
            )

            summary = (
                f"{len(risks)} defect-driven roast-quality "
                "risk(s) were identified. The batch "
                "requires additional process control before "
                "direct roasting."
            )


        else:

            title = (
                "Low Detected Roast Quality Risk"
            )

            summary = (
                "No active Processing Intelligence defect "
                "currently generates a specific roast-"
                "quality risk. Continue normal pre-roast "
                "and roasting quality controls."
            )


        # =================================================
        # RESPONSE
        # =================================================

        return RoastQualityRisk(

            overall_risk=(
                overall_risk
            ),

            overall_risk_score=(
                overall_risk_score
            ),

            title=title,

            summary=summary,

            risks=risks,

            active_risk_count=(
                len(risks)
            ),

            active_defect_count=(
                defect_profile
                .active_defect_count
            ),

            inspection_complete=(
                inspection_complete
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

            sensor_risk_contribution=(
                sensor_risk_contribution
            ),

            requires_corrective_action=(
                requires_corrective_action
            ),

            recommended_controls=(
                recommended_controls
            ),

            methodology_note=(
                "Module 3 is defect-driven. Each active "
                "sensor or physical defect independently "
                "generates its relevant roast-quality risk. "
                "Final quality score, grade, overall sensor "
                "status and physical status do not trigger "
                "these risks. MQ sensor risks are screening "
                "and verification risks because MQ-2, "
                "MQ-3 and MQ-135 are broad, non-specific "
                "gas sensors. Moisture, humidity, broken-"
                "bean and black-bean risk interpretations "
                "are supported by recognized green-coffee "
                "quality and post-harvest guidance, while "
                "the exact LOW/MEDIUM/HIGH/CRITICAL labels "
                "and 25/50/75/100 display scores are "
                "research-defined. The numeric scores are "
                "not probabilities of roast failure."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

roast_quality_risk_service = (
    RoastQualityRiskService()
)
