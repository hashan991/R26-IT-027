from typing import Any, Dict, List

from .schema import (
    PreRoastAction,
    PreRoastPlan,
)


# =========================================================
# PRE-ROAST PLAN SERVICE
# =========================================================

class PreRoastPlanService:

    # =====================================================
    # RESEARCH-DEFINED THRESHOLDS
    # =====================================================

    BROKEN_WARNING_PERCENTAGE = 5.0

    BROKEN_HIGH_PERCENTAGE = 15.0

    SEVERE_WARNING_PERCENTAGE = 5.0

    SEVERE_HIGH_PERCENTAGE = 20.0

    UNKNOWN_WARNING_PERCENTAGE = 3.0


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
    # ADD ACTION
    # =====================================================

    @staticmethod
    def _add_action(
        actions: List[PreRoastAction],
        *,
        title: str,
        description: str,
        action_type: str,
        priority: str,
        required: bool = True,
    ) -> None:

        actions.append(
            PreRoastAction(
                step_number=(
                    len(actions)
                    + 1
                ),
                title=title,
                description=description,
                action_type=action_type,
                priority=priority,
                required=required,
            )
        )


    # =====================================================
    # GENERATE PRE-ROAST PLAN
    # =====================================================

    def generate(
        self,
        *,
        sensor_status: str,
        physical_status: str,
        grade: str,
        quality_status: str,
        counts: Dict[str, Any],
    ) -> PreRoastPlan:

        # -------------------------------------------------
        # NORMALIZE INPUTS
        # -------------------------------------------------

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


        # -------------------------------------------------
        # COUNTS
        # -------------------------------------------------

        total = self._safe_int(
            counts.get(
                "total_beans",
                0,
            )
        )


        good = self._safe_int(
            counts.get(
                "good",
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


        black_and_broken = self._safe_int(
            counts.get(
                "black_and_broken",
                0,
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


        # -------------------------------------------------
        # FLAGS
        # -------------------------------------------------

        sensor_retest_required = False

        physical_retest_required = False

        manual_inspection_required = False

        severe_defect_removal_required = False

        broken_sorting_required = False

        reinspection_required = False


        actions: List[
            PreRoastAction
        ] = []


        # =================================================
        # NO PHYSICAL DATA
        # =================================================

        if (
            total <= 0
            or
            physical_status
            == "NO_DATA"
        ):

            self._add_action(
                actions,
                title=(
                    "Complete Physical AI Inspection"
                ),
                description=(
                    "A complete physical bean inspection "
                    "must be performed before the batch "
                    "can be prepared for roasting."
                ),
                action_type="INSPECT",
                priority="CRITICAL",
                required=True,
            )


            self._add_action(
                actions,
                title=(
                    "Generate New Quality Assessment"
                ),
                description=(
                    "Repeat the quality assessment after "
                    "physical inspection data becomes "
                    "available."
                ),
                action_type="RETEST",
                priority="HIGH",
                required=True,
            )


            return PreRoastPlan(

                readiness_status=(
                    "INSPECTION_REQUIRED"
                ),

                title=(
                    "Physical Inspection Required"
                ),

                summary=(
                    "The batch cannot be prepared for "
                    "roasting because physical quality "
                    "inspection data is incomplete."
                ),

                total_actions=len(
                    actions
                ),

                mandatory_actions=len(
                    [
                        action
                        for action
                        in actions
                        if action.required
                    ]
                ),

                actions=actions,

                reinspection_required=True,

                sensor_retest_required=False,

                physical_retest_required=True,

                manual_inspection_required=False,

                severe_defect_removal_required=False,

                broken_sorting_required=False,

                estimated_preparation_level=(
                    "CRITICAL"
                ),

                methodology_note=(
                    "The preparation plan is generated "
                    "using research-defined raw-bean "
                    "quality rules and requires complete "
                    "quality evidence before roasting."
                ),
            )


        # =================================================
        # SEVERE DEFECT REMOVAL
        # =================================================

        if (
            black > 0
        ):

            severe_defect_removal_required = True


            self._add_action(
                actions,
                title=(
                    "Remove Black Beans"
                ),
                description=(
                    f"Remove the {black} black or dark "
                    "beans identified by the physical "
                    "AI inspection before roasting."
                ),
                action_type="REMOVE",
                priority=(
                    "CRITICAL"
                    if severe_defect_percentage
                    >= self.SEVERE_HIGH_PERCENTAGE
                    else "HIGH"
                ),
                required=True,
            )


        if (
            black_and_broken > 0
        ):

            severe_defect_removal_required = True


            self._add_action(
                actions,
                title=(
                    "Remove Black-and-Broken Beans"
                ),
                description=(
                    f"Remove the {black_and_broken} beans "
                    "that contain both black-color and "
                    "broken-shape defects."
                ),
                action_type="REMOVE",
                priority=(
                    "CRITICAL"
                    if severe_defect_percentage
                    >= self.SEVERE_HIGH_PERCENTAGE
                    else "HIGH"
                ),
                required=True,
            )


        # =================================================
        # BROKEN BEAN SORTING
        # =================================================

        if (
            broken > 0
        ):

            broken_sorting_required = True


            self._add_action(
                actions,
                title=(
                    "Secondary Sort Broken Beans"
                ),
                description=(
                    f"{broken} broken or chipped beans "
                    f"were detected "
                    f"({broken_percentage:.2f}% of the "
                    "inspected batch). Perform secondary "
                    "sorting before roasting."
                ),
                action_type="SORT",
                priority=(
                    "HIGH"
                    if broken_percentage
                    >= self.BROKEN_HIGH_PERCENTAGE
                    else "MEDIUM"
                ),
                required=(
                    broken_percentage
                    >= self.BROKEN_WARNING_PERCENTAGE
                ),
            )


        # =================================================
        # UNKNOWN / UNCERTAIN BEANS
        # =================================================

        if (
            unknown > 0
        ):

            manual_inspection_required = True


            self._add_action(
                actions,
                title=(
                    "Inspect Uncertain Beans"
                ),
                description=(
                    f"{unknown} bean classification(s) "
                    "were uncertain. Inspect these beans "
                    "manually before roasting or repeat "
                    "the physical AI inspection."
                ),
                action_type="INSPECT",
                priority=(
                    "HIGH"
                    if unknown_percentage
                    >= self.UNKNOWN_WARNING_PERCENTAGE
                    else "MEDIUM"
                ),
                required=True,
            )


        # =================================================
        # SENSOR CONDITION
        # =================================================

        if (
            sensor_status == "BAD"
        ):

            sensor_retest_required = True


            self._add_action(
                actions,
                title=(
                    "Repeat Sensor Quality Analysis"
                ),
                description=(
                    "The sensor assessment indicates a "
                    "defective bean profile. Repeat the "
                    "sensor analysis after sorting and "
                    "before roasting."
                ),
                action_type="RETEST",
                priority="CRITICAL",
                required=True,
            )


        elif (
            sensor_status == "REVIEW"
        ):

            sensor_retest_required = True


            self._add_action(
                actions,
                title=(
                    "Review Sensor Measurements"
                ),
                description=(
                    "The sensor assessment requires "
                    "additional review. Confirm the "
                    "sensor readings before roasting."
                ),
                action_type="RETEST",
                priority="HIGH",
                required=True,
            )


        elif (
            sensor_status == "SKIPPED"
        ):

            sensor_retest_required = True


            self._add_action(
                actions,
                title=(
                    "Complete Sensor Analysis"
                ),
                description=(
                    "Sensor-based quality analysis was "
                    "skipped. Complete the sensor test "
                    "before final roasting release."
                ),
                action_type="RETEST",
                priority="HIGH",
                required=True,
            )


        # =================================================
        # PHYSICAL RETEST CONDITION
        # =================================================

        if (
            physical_status
            in {
                "POOR",
                "REVIEW",
            }
            or
            severe_defect_removal_required
            or
            broken_sorting_required
            or
            manual_inspection_required
        ):

            physical_retest_required = True

            reinspection_required = True


            self._add_action(
                actions,
                title=(
                    "Repeat Physical AI Inspection"
                ),
                description=(
                    "After sorting and defect removal, "
                    "repeat the physical AI inspection "
                    "to confirm that the batch quality "
                    "has improved."
                ),
                action_type="RETEST",
                priority=(
                    "HIGH"
                    if physical_status
                    == "POOR"
                    else "MEDIUM"
                ),
                required=True,
            )


        # =================================================
        # SENSOR RETEST ALSO MEANS REINSPECTION
        # =================================================

        if (
            sensor_retest_required
        ):
            reinspection_required = True


        # =================================================
        # NORMAL PRE-ROAST CLEANING
        # =================================================

        self._add_action(
            actions,
            title=(
                "Perform Standard Pre-Roast Cleaning"
            ),
            description=(
                "Complete normal cleaning and remove "
                "foreign material before loading the "
                "batch into the roasting stage."
            ),
            action_type="CLEAN",
            priority="LOW",
            required=True,
        )


        # =================================================
        # FINAL RELEASE / HOLD ACTION
        # =================================================

        if (
            grade == "Reject"
            or
            (
                sensor_status == "BAD"
                and
                physical_status == "POOR"
            )
        ):

            self._add_action(
                actions,
                title=(
                    "Hold Batch From Roasting"
                ),
                description=(
                    "Do not release the current batch "
                    "to roasting until corrective "
                    "actions and quality reassessment "
                    "are completed."
                ),
                action_type="HOLD",
                priority="CRITICAL",
                required=True,
            )


        elif (
            reinspection_required
            or
            quality_status
            == "Needs Review"
        ):

            self._add_action(
                actions,
                title=(
                    "Release Only After Reinspection"
                ),
                description=(
                    "The batch may proceed to roasting "
                    "only after the required preparation "
                    "steps are completed and the new "
                    "quality assessment is acceptable."
                ),
                action_type="RELEASE",
                priority="HIGH",
                required=True,
            )


        else:

            self._add_action(
                actions,
                title=(
                    "Release Batch to Roasting"
                ),
                description=(
                    "After standard cleaning, the batch "
                    "can proceed to the roasting stage."
                ),
                action_type="RELEASE",
                priority="LOW",
                required=True,
            )


        # =================================================
        # PREPARATION LEVEL
        # =================================================

        if (
            grade == "Reject"
            or
            (
                sensor_status == "BAD"
                and
                physical_status == "POOR"
            )
        ):

            preparation_level = (
                "CRITICAL"
            )


        elif (
            physical_status == "POOR"
            or
            severe_defect_percentage
            >= self.SEVERE_HIGH_PERCENTAGE
        ):

            preparation_level = (
                "EXTENSIVE"
            )


        elif (
            reinspection_required
            or
            broken_percentage
            >= self.BROKEN_WARNING_PERCENTAGE
            or
            severe_defect_percentage
            >= self.SEVERE_WARNING_PERCENTAGE
        ):

            preparation_level = (
                "MODERATE"
            )


        else:

            preparation_level = (
                "MINIMAL"
            )


        # =================================================
        # READINESS STATUS
        # =================================================

        if (
            grade == "Reject"
            or
            (
                sensor_status == "BAD"
                and
                physical_status == "POOR"
            )
        ):

            readiness_status = (
                "NOT_READY"
            )


        elif (
            reinspection_required
            or
            severe_defect_removal_required
            or
            broken_sorting_required
            or
            manual_inspection_required
        ):

            readiness_status = (
                "READY_AFTER_PREPARATION"
            )


        else:

            readiness_status = (
                "READY"
            )


        # =================================================
        # SUMMARY
        # =================================================

        if (
            readiness_status
            == "READY"
        ):

            title = (
                "Batch Ready for Standard "
                "Pre-Roast Preparation"
            )

            summary = (
                "No major corrective preparation is "
                "required. Complete standard cleaning "
                "and release the batch to roasting."
            )


        elif (
            readiness_status
            == "READY_AFTER_PREPARATION"
        ):

            title = (
                "Corrective Pre-Roast "
                "Preparation Required"
            )

            summary = (
                "The batch can potentially proceed to "
                "roasting after the listed sorting, "
                "inspection, cleaning, and re-testing "
                "steps are completed."
            )


        else:

            title = (
                "Batch Not Ready for Roasting"
            )

            summary = (
                "The current quality condition requires "
                "major corrective action before the "
                "batch can be considered for roasting."
            )


        # =================================================
        # RETURN
        # =================================================

        mandatory_actions = len(
            [
                action
                for action
                in actions
                if action.required
            ]
        )


        return PreRoastPlan(

            readiness_status=(
                readiness_status
            ),

            title=title,

            summary=summary,

            total_actions=len(
                actions
            ),

            mandatory_actions=(
                mandatory_actions
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

            methodology_note=(
                "This pre-roast preparation plan is "
                "generated from research-defined raw "
                "coffee bean quality rules. The system "
                "converts detected defects and quality "
                "assessment results into recommended "
                "pre-processing actions before roasting."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

pre_roast_plan_service = (
    PreRoastPlanService()
)