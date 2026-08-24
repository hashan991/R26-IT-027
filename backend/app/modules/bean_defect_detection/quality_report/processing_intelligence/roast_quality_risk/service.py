from typing import Any, Dict, List

from .schema import (
    RoastQualityRisk,
    RoastRiskItem,
)


# =========================================================
# ROAST QUALITY RISK SERVICE
# =========================================================

class RoastQualityRiskService:

    # =====================================================
    # RISK SCORE BOUNDARIES
    # =====================================================
    #
    # Research-defined risk bands:
    #
    # 0  - 24.99  → LOW
    # 25 - 49.99  → MEDIUM
    # 50 - 74.99  → HIGH
    # 75 - 100    → CRITICAL
    #
    # These are decision-support rules for this research
    # system and are not official SCA roasting limits.
    # =====================================================

    LOW_MAX = 24.99
    MEDIUM_MAX = 49.99
    HIGH_MAX = 74.99


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
        default: float = 0.0,
    ) -> float:

        try:
            return float(value)

        except (
            TypeError,
            ValueError,
        ):
            return default


    # =====================================================
    # CLAMP SCORE
    # =====================================================

    @staticmethod
    def _clamp(
        value: float,
        minimum: float = 0.0,
        maximum: float = 100.0,
    ) -> float:

        return max(
            minimum,
            min(
                maximum,
                value,
            ),
        )


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
    # CONVERT SCORE TO RISK LEVEL
    # =====================================================

    def _risk_level(
        self,
        score: float,
    ) -> str:

        score = self._clamp(
            score
        )


        if (
            score
            <= self.LOW_MAX
        ):
            return "LOW"


        if (
            score
            <= self.MEDIUM_MAX
        ):
            return "MEDIUM"


        if (
            score
            <= self.HIGH_MAX
        ):
            return "HIGH"


        return "CRITICAL"


    # =====================================================
    # SENSOR RISK CONTRIBUTION
    # =====================================================

    @staticmethod
    def _sensor_risk_contribution(
        sensor_status: str,
    ) -> float:

        sensor_status = (
            sensor_status
            or "SKIPPED"
        ).upper()


        if (
            sensor_status
            == "GOOD"
        ):
            return 0.0


        if (
            sensor_status
            == "REVIEW"
        ):
            return 20.0


        if (
            sensor_status
            == "BAD"
        ):
            return 40.0


        # SKIPPED or unknown
        return 15.0


    # =====================================================
    # UNEVEN ROASTING RISK
    # =====================================================

    def _calculate_uneven_roasting_risk(
        self,
        *,
        broken_percentage: float,
        unknown_percentage: float,
    ) -> RoastRiskItem:

        # Broken beans are the main driver.
        #
        # Unknown classifications contribute a smaller
        # uncertainty penalty.

        score = (
            broken_percentage
            * 3.0
            +
            unknown_percentage
            * 1.0
        )


        score = round(
            self._clamp(
                score
            ),
            2,
        )


        level = self._risk_level(
            score
        )


        drivers: List[str] = []


        if (
            broken_percentage
            > 0
        ):
            drivers.append(
                (
                    f"Broken beans represent "
                    f"{broken_percentage:.2f}% "
                    "of the inspected sample."
                )
            )


        if (
            unknown_percentage
            > 0
        ):
            drivers.append(
                (
                    f"{unknown_percentage:.2f}% "
                    "of beans have uncertain "
                    "classifications."
                )
            )


        if (
            not drivers
        ):
            drivers.append(
                (
                    "No meaningful broken-bean or "
                    "classification uncertainty was "
                    "detected."
                )
            )


        if (
            level == "LOW"
        ):
            explanation = (
                "The detected bean shape profile "
                "indicates a low risk of roasting "
                "variation caused by broken beans."
            )


        elif (
            level == "MEDIUM"
        ):
            explanation = (
                "A moderate amount of broken-bean "
                "variation may contribute to less "
                "uniform roasting behavior."
            )


        elif (
            level == "HIGH"
        ):
            explanation = (
                "The broken-bean level indicates a "
                "high risk of uneven roasting and "
                "batch inconsistency."
            )


        else:
            explanation = (
                "The physical shape variation is very "
                "high and may strongly reduce roasting "
                "uniformity unless corrective sorting "
                "is performed."
            )


        return RoastRiskItem(

            risk_name=(
                "Uneven Roasting Risk"
            ),

            risk_level=level,

            risk_score=score,

            explanation=explanation,

            drivers=drivers,
        )


    # =====================================================
    # DEFECT-RELATED FLAVOR RISK
    # =====================================================

    def _calculate_defect_flavor_risk(
        self,
        *,
        severe_defect_percentage: float,
        sensor_status: str,
    ) -> RoastRiskItem:

        sensor_contribution = (
            self._sensor_risk_contribution(
                sensor_status
            )
        )


        # Severe black / black-and-broken defects are
        # treated as the primary risk signal.
        #
        # Sensor assessment adds supporting evidence.

        score = (
            severe_defect_percentage
            * 2.0
            +
            sensor_contribution
        )


        score = round(
            self._clamp(
                score
            ),
            2,
        )


        level = self._risk_level(
            score
        )


        drivers: List[str] = []


        if (
            severe_defect_percentage
            > 0
        ):
            drivers.append(
                (
                    f"Severe black or black-and-broken "
                    f"defects represent "
                    f"{severe_defect_percentage:.2f}% "
                    "of the inspected sample."
                )
            )


        drivers.append(
            (
                f"Sensor assessment status: "
                f"{sensor_status}."
            )
        )


        if (
            level == "LOW"
        ):
            explanation = (
                "The available defect and sensor "
                "evidence indicates a low "
                "defect-related quality risk during "
                "roasting."
            )


        elif (
            level == "MEDIUM"
        ):
            explanation = (
                "Some defect-related quality risk is "
                "present. Sorting and quality review "
                "should be completed before roasting."
            )


        elif (
            level == "HIGH"
        ):
            explanation = (
                "The batch contains a high level of "
                "quality defects that may negatively "
                "affect the consistency of the roasted "
                "product."
            )


        else:
            explanation = (
                "The severe defect profile indicates a "
                "critical quality risk. Direct roasting "
                "is not recommended before corrective "
                "sorting and reassessment."
            )


        return RoastRiskItem(

            risk_name=(
                "Defect-Related Flavor Risk"
            ),

            risk_level=level,

            risk_score=score,

            explanation=explanation,

            drivers=drivers,
        )


    # =====================================================
    # BATCH UNIFORMITY RISK
    # =====================================================

    def _calculate_batch_uniformity_risk(
        self,
        *,
        broken_percentage: float,
        severe_defect_percentage: float,
        unknown_percentage: float,
    ) -> RoastRiskItem:

        # The uniformity score combines:
        #
        # broken beans       → shape variation
        # severe defects     → quality variation
        # unknown beans      → classification uncertainty

        score = (
            broken_percentage
            * 2.0
            +
            severe_defect_percentage
            * 1.2
            +
            unknown_percentage
            * 2.0
        )


        score = round(
            self._clamp(
                score
            ),
            2,
        )


        level = self._risk_level(
            score
        )


        drivers: List[str] = [
            (
                f"Broken bean proportion: "
                f"{broken_percentage:.2f}%."
            ),
            (
                f"Severe defect proportion: "
                f"{severe_defect_percentage:.2f}%."
            ),
            (
                f"Unknown classification proportion: "
                f"{unknown_percentage:.2f}%."
            ),
        ]


        if (
            level == "LOW"
        ):
            explanation = (
                "The physical defect distribution is "
                "relatively uniform and presents a low "
                "batch consistency risk."
            )


        elif (
            level == "MEDIUM"
        ):
            explanation = (
                "Moderate variation exists within the "
                "batch and may reduce roasting "
                "consistency."
            )


        elif (
            level == "HIGH"
        ):
            explanation = (
                "Substantial physical variation exists "
                "within the batch. Corrective sorting "
                "is recommended before roasting."
            )


        else:
            explanation = (
                "The batch contains extensive physical "
                "quality variation and has a critical "
                "uniformity risk."
            )


        return RoastRiskItem(

            risk_name=(
                "Batch Uniformity Risk"
            ),

            risk_level=level,

            risk_score=score,

            explanation=explanation,

            drivers=drivers,
        )


    # =====================================================
    # GENERATE COMPLETE ROAST RISK ASSESSMENT
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
    ) -> RoastQualityRisk:

        # -------------------------------------------------
        # NORMALIZE
        # -------------------------------------------------

        sensor_status = (
            sensor_status
            or "SKIPPED"
        ).upper()


        physical_status = (
            physical_status
            or "NO_DATA"
        ).upper()


        final_score = self._safe_float(
            final_score
        )


        grade = (
            grade
            or "Reject"
        )


        quality_status = (
            quality_status
            or "Needs Review"
        )


        # -------------------------------------------------
        # COUNTS
        # -------------------------------------------------

        total = self._safe_int(
            counts.get(
                "total_beans",
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


        # -------------------------------------------------
        # PERCENTAGES
        # -------------------------------------------------

        broken_percentage = (
            self._percentage(
                broken,
                total,
            )
        )


        severe_defect_count = (
            black
            + black_and_broken
        )


        severe_defect_percentage = (
            self._percentage(
                severe_defect_count,
                total,
            )
        )


        unknown_percentage = (
            self._percentage(
                unknown,
                total,
            )
        )


        sensor_contribution = (
            self._sensor_risk_contribution(
                sensor_status
            )
        )


        # =================================================
        # NO PHYSICAL DATA
        # =================================================

        if (
            total <= 0
            or
            physical_status
            == "NO_DATA"
        ):

            missing_data_risk = (
                RoastRiskItem(

                    risk_name=(
                        "Incomplete Inspection Risk"
                    ),

                    risk_level="HIGH",

                    risk_score=70.0,

                    explanation=(
                        "Physical AI inspection data is "
                        "not available. Roast quality "
                        "risk cannot be fully evaluated."
                    ),

                    drivers=[
                        (
                            "Physical defect counts are "
                            "missing or incomplete."
                        ),
                    ],
                )
            )


            return RoastQualityRisk(

                overall_risk="HIGH",

                overall_risk_score=70.0,

                title=(
                    "Roast Risk Assessment Incomplete"
                ),

                summary=(
                    "The system cannot produce a full "
                    "roast-quality risk assessment until "
                    "physical AI inspection is completed."
                ),

                broken_percentage=0.0,

                severe_defect_percentage=0.0,

                unknown_percentage=0.0,

                risks=[
                    missing_data_risk
                ],

                sensor_status=(
                    sensor_status
                ),

                sensor_risk_contribution=(
                    sensor_contribution
                ),

                requires_corrective_action=True,

                recommended_controls=[
                    (
                        "Complete the physical AI "
                        "inspection."
                    ),
                    (
                        "Generate a new roast-quality "
                        "risk assessment before roasting."
                    ),
                ],

                methodology_note=(
                    "The risk assessment requires "
                    "physical defect information. "
                    "A HIGH risk is assigned to "
                    "incomplete inspection to prevent "
                    "automatic roasting release."
                ),
            )


        # =================================================
        # CALCULATE INDIVIDUAL RISKS
        # =================================================

        uneven_risk = (
            self._calculate_uneven_roasting_risk(
                broken_percentage=(
                    broken_percentage
                ),
                unknown_percentage=(
                    unknown_percentage
                ),
            )
        )


        flavor_risk = (
            self._calculate_defect_flavor_risk(
                severe_defect_percentage=(
                    severe_defect_percentage
                ),
                sensor_status=(
                    sensor_status
                ),
            )
        )


        uniformity_risk = (
            self._calculate_batch_uniformity_risk(
                broken_percentage=(
                    broken_percentage
                ),
                severe_defect_percentage=(
                    severe_defect_percentage
                ),
                unknown_percentage=(
                    unknown_percentage
                ),
            )
        )


        risks = [
            uneven_risk,
            flavor_risk,
            uniformity_risk,
        ]


        # =================================================
        # OVERALL RISK
        # =================================================
        #
        # Conservative quality-control rule:
        #
        # The highest major risk is used as the overall
        # roast risk so that a severe problem is not hidden
        # by averaging it with low-risk categories.
        # =================================================

        overall_score = max(
            risk.risk_score
            for risk
            in risks
        )


        # -------------------------------------------------
        # ADD QUALITY STATUS SAFEGUARD
        # -------------------------------------------------

        if (
            physical_status == "POOR"
        ):
            overall_score = max(
                overall_score,
                75.0,
            )


        if (
            sensor_status == "BAD"
        ):
            overall_score = max(
                overall_score,
                75.0,
            )


        if (
            grade == "Reject"
        ):
            overall_score = max(
                overall_score,
                85.0,
            )


        overall_score = round(
            self._clamp(
                overall_score
            ),
            2,
        )


        overall_level = (
            self._risk_level(
                overall_score
            )
        )


        # =================================================
        # RECOMMENDED CONTROLS
        # =================================================

        controls: List[str] = []


        if (
            severe_defect_count
            > 0
        ):
            controls.append(
                (
                    "Remove black and "
                    "black-and-broken beans before "
                    "roasting."
                )
            )


        if (
            broken
            > 0
        ):
            controls.append(
                (
                    "Perform secondary sorting to "
                    "reduce broken-bean variation."
                )
            )


        if (
            unknown
            > 0
        ):
            controls.append(
                (
                    "Manually inspect uncertain "
                    "bean classifications."
                )
            )


        if (
            sensor_status
            in {
                "BAD",
                "REVIEW",
                "SKIPPED",
            }
        ):
            controls.append(
                (
                    "Repeat or review the sensor "
                    "quality assessment before roasting."
                )
            )


        if (
            overall_level
            in {
                "HIGH",
                "CRITICAL",
            }
        ):
            controls.append(
                (
                    "Repeat the physical AI inspection "
                    "after corrective sorting."
                )
            )


        if (
            not controls
        ):
            controls.append(
                (
                    "Continue with standard pre-roast "
                    "quality-control procedures."
                )
            )


        # =================================================
        # TITLE / SUMMARY
        # =================================================

        if (
            overall_level == "LOW"
        ):

            title = (
                "Low Roast Quality Risk"
            )

            summary = (
                "The current defect profile indicates "
                "a low risk of quality inconsistency "
                "during roasting."
            )


        elif (
            overall_level == "MEDIUM"
        ):

            title = (
                "Moderate Roast Quality Risk"
            )

            summary = (
                "Some physical quality variation is "
                "present. Pre-roast sorting and process "
                "attention are recommended."
            )


        elif (
            overall_level == "HIGH"
        ):

            title = (
                "High Roast Quality Risk"
            )

            summary = (
                "The current quality profile presents "
                "a high risk of inconsistent roasting. "
                "Corrective preparation should be "
                "completed before roasting."
            )


        else:

            title = (
                "Critical Roast Quality Risk"
            )

            summary = (
                "The current batch contains severe "
                "quality conditions that may strongly "
                "affect roast consistency. Direct "
                "roasting is not recommended before "
                "corrective action and reassessment."
            )


        # =================================================
        # RETURN
        # =================================================

        return RoastQualityRisk(

            overall_risk=(
                overall_level
            ),

            overall_risk_score=(
                overall_score
            ),

            title=title,

            summary=summary,

            broken_percentage=(
                broken_percentage
            ),

            severe_defect_percentage=(
                severe_defect_percentage
            ),

            unknown_percentage=(
                unknown_percentage
            ),

            risks=risks,

            sensor_status=(
                sensor_status
            ),

            sensor_risk_contribution=(
                sensor_contribution
            ),

            requires_corrective_action=(
                overall_level
                in {
                    "MEDIUM",
                    "HIGH",
                    "CRITICAL",
                }
            ),

            recommended_controls=(
                controls
            ),

            methodology_note=(
                "This roast-quality risk assessment is "
                "a research-defined decision-support "
                "model based on the raw-bean defect "
                "distribution and sensor quality status. "
                "It estimates roasting-process and "
                "quality risks; it does not predict a "
                "cupping score, flavor profile, or exact "
                "roasting temperature and duration."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

roast_quality_risk_service = (
    RoastQualityRiskService()
)