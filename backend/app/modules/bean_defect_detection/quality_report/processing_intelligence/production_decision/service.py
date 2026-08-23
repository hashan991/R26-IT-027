from typing import List

from ..roasting_recommendation.schema import (
    RoastingRecommendation,
)

from ..pre_roast_plan.schema import (
    PreRoastPlan,
)

from ..roast_quality_risk.schema import (
    RoastQualityRisk,
)

from ..batch_usage.schema import (
    BatchUsageRecommendation,
)

from ..usable_yield.schema import (
    UsableYield,
)

from .schema import (
    ProductionAction,
    ProductionDecision,
    ProductionDecisionEvidence,
)


# =========================================================
# PRODUCTION DECISION SERVICE
# =========================================================

class ProductionDecisionService:

    # =====================================================
    # ADD PRODUCTION ACTION
    # =====================================================

    @staticmethod
    def _add_action(
        actions: List[ProductionAction],
        *,
        title: str,
        description: str,
        stage: str,
        priority: str,
        required: bool = True,
    ) -> None:

        actions.append(
            ProductionAction(
                step_number=(
                    len(actions)
                    + 1
                ),

                title=title,

                description=description,

                stage=stage,

                priority=priority,

                required=required,
            )
        )


    # =====================================================
    # BUILD EVIDENCE
    # =====================================================

    @staticmethod
    def _build_evidence(
        *,
        roasting: RoastingRecommendation,
        pre_roast: PreRoastPlan,
        roast_risk: RoastQualityRisk,
        batch_usage: BatchUsageRecommendation,
        usable_yield: UsableYield,
    ) -> ProductionDecisionEvidence:

        return ProductionDecisionEvidence(

            roasting_eligibility=(
                roasting.roasting_eligibility
            ),

            roast_risk=(
                roast_risk.overall_risk
            ),

            pre_roast_readiness=(
                pre_roast.readiness_status
            ),

            batch_usage_recommendation=(
                batch_usage.primary_recommendation
            ),

            yield_status=(
                usable_yield.yield_status
            ),

            recovery_potential=(
                usable_yield.recovery_potential
            ),
        )


    # =====================================================
    # GENERATE FINAL PRODUCTION DECISION
    # =====================================================

    def generate(
        self,
        *,
        roasting: RoastingRecommendation,
        pre_roast: PreRoastPlan,
        roast_risk: RoastQualityRisk,
        batch_usage: BatchUsageRecommendation,
        usable_yield: UsableYield,
    ) -> ProductionDecision:

        # -------------------------------------------------
        # COMMON
        # -------------------------------------------------

        evidence = self._build_evidence(

            roasting=roasting,

            pre_roast=pre_roast,

            roast_risk=roast_risk,

            batch_usage=batch_usage,

            usable_yield=usable_yield,
        )


        actions: List[
            ProductionAction
        ] = []


        reasons: List[str] = []

        release_conditions: List[str] = []


        # =================================================
        # 1. INCOMPLETE INSPECTION
        # =================================================
        #
        # If any important upstream module indicates that
        # inspection evidence is missing, production must
        # be held.
        # =================================================

        if (
            pre_roast.readiness_status
            == "INSPECTION_REQUIRED"
            or
            batch_usage.primary_recommendation
            == "INSPECTION_REQUIRED"
            or
            usable_yield.yield_status
            == "NO_DATA"
        ):

            reasons.append(
                (
                    "The available quality inspection "
                    "data is incomplete."
                )
            )


            if (
                usable_yield.yield_status
                == "NO_DATA"
            ):
                reasons.append(
                    (
                        "Usable yield cannot be "
                        "estimated because physical "
                        "bean count data is unavailable."
                    )
                )


            self._add_action(
                actions,

                title=(
                    "Hold Current Batch"
                ),

                description=(
                    "Temporarily hold the batch until "
                    "all required quality inspections "
                    "are completed."
                ),

                stage=(
                    "QUALITY_REINSPECTION"
                ),

                priority=(
                    "CRITICAL"
                ),

                required=True,
            )


            self._add_action(
                actions,

                title=(
                    "Complete Missing Inspection"
                ),

                description=(
                    "Complete the missing sensor or "
                    "physical AI inspection before "
                    "making a production release "
                    "decision."
                ),

                stage=(
                    "QUALITY_REINSPECTION"
                ),

                priority=(
                    "CRITICAL"
                ),

                required=True,
            )


            release_conditions.extend(
                [
                    (
                        "Complete all required sensor "
                        "and physical quality tests."
                    ),
                    (
                        "Generate a new complete final "
                        "quality report."
                    ),
                    (
                        "Obtain an acceptable production "
                        "decision before roasting."
                    ),
                ]
            )


            return ProductionDecision(

                decision=(
                    "HOLD_FOR_INSPECTION"
                ),

                production_status="HOLD",

                title=(
                    "Hold Batch for Quality Inspection"
                ),

                summary=(
                    "The batch cannot be released to "
                    "production because the available "
                    "quality evidence is incomplete."
                ),

                immediate_action=(
                    "Hold the batch and complete the "
                    "missing quality inspections."
                ),

                next_stage=(
                    "QUALITY_REINSPECTION"
                ),

                can_proceed_to_roasting=False,

                release_authorized=False,

                batch_hold_required=True,

                rework_required=False,

                reinspection_required=True,

                manual_review_required=False,

                decision_reasons=reasons,

                required_actions=actions,

                release_conditions=(
                    release_conditions
                ),

                evidence=evidence,

                recommended_product_direction=(
                    "Product allocation cannot be "
                    "determined until inspection is "
                    "complete."
                ),

                disposition_note=(
                    "Do not roast or allocate the batch "
                    "to a finished product while the "
                    "inspection remains incomplete."
                ),

                methodology_note=(
                    "The production decision engine "
                    "uses a conservative quality-control "
                    "rule that prevents automatic "
                    "production release when required "
                    "inspection data is missing."
                ),
            )


        # =================================================
        # 2. FINAL REJECT CONDITION
        # =================================================
        #
        # Strongest rejection evidence:
        #
        # roasting says NOT_RECOMMENDED
        # +
        # batch usage says REJECT
        #
        # This avoids rejecting a batch from only one
        # isolated signal.
        # =================================================

        if (
            roasting.roasting_eligibility
            == "NOT_RECOMMENDED"
            and
            batch_usage.primary_recommendation
            == "REJECT"
        ):

            reasons.extend(
                [
                    (
                        "The roasting recommendation "
                        "does not support release of the "
                        "current batch to roasting."
                    ),
                    (
                        "The batch usage assessment "
                        "classifies the current batch as "
                        "unsuitable for direct production "
                        "use."
                    ),
                ]
            )


            if (
                roast_risk.overall_risk
                in {
                    "HIGH",
                    "CRITICAL",
                }
            ):
                reasons.append(
                    (
                        f"The overall roast quality risk "
                        f"is "
                        f"{roast_risk.overall_risk}."
                    )
                )


            if (
                usable_yield.yield_status
                in {
                    "LOW",
                    "CRITICAL",
                }
            ):
                reasons.append(
                    (
                        f"The estimated usable yield "
                        f"condition is "
                        f"{usable_yield.yield_status}."
                    )
                )


            self._add_action(
                actions,

                title=(
                    "Stop Production Release"
                ),

                description=(
                    "Do not release the current batch "
                    "to the roasting stage."
                ),

                stage=(
                    "REJECT_HANDLING"
                ),

                priority=(
                    "CRITICAL"
                ),

                required=True,
            )


            self._add_action(
                actions,

                title=(
                    "Move Batch to Reject or "
                    "Recovery Review"
                ),

                description=(
                    "Transfer the batch to the defined "
                    "reject-handling process. Recovery "
                    "may only be evaluated through a "
                    "separate controlled rework process."
                ),

                stage=(
                    "REJECT_HANDLING"
                ),

                priority=(
                    "CRITICAL"
                ),

                required=True,
            )


            return ProductionDecision(

                decision=(
                    "REJECT_BATCH"
                ),

                production_status=(
                    "REJECTED"
                ),

                title=(
                    "Reject Current Batch"
                ),

                summary=(
                    "Multiple quality decision modules "
                    "indicate that the current batch "
                    "should not proceed directly to "
                    "production."
                ),

                immediate_action=(
                    "Remove the batch from the normal "
                    "production flow."
                ),

                next_stage=(
                    "REJECT_HANDLING"
                ),

                can_proceed_to_roasting=False,

                release_authorized=False,

                batch_hold_required=True,

                rework_required=True,

                reinspection_required=True,

                manual_review_required=True,

                decision_reasons=reasons,

                required_actions=actions,

                release_conditions=[
                    (
                        "Any future recovery decision "
                        "requires major rework."
                    ),
                    (
                        "Repeat complete sensor and "
                        "physical quality inspection "
                        "after rework."
                    ),
                    (
                        "A new report must no longer "
                        "indicate reject status before "
                        "production use is reconsidered."
                    ),
                ],

                evidence=evidence,

                recommended_product_direction=(
                    "No direct finished-product use "
                    "is recommended in the current "
                    "condition."
                ),

                disposition_note=(
                    "The REJECT decision applies to the "
                    "current inspected condition. It "
                    "does not prevent a separately "
                    "validated recovery process after "
                    "major corrective action."
                ),

                methodology_note=(
                    "The rejection decision is "
                    "research-defined and requires "
                    "agreement between multiple "
                    "decision-support outputs rather "
                    "than relying on a single defect "
                    "measurement."
                ),
            )


        # =================================================
        # 3. MAJOR REWORK CONDITION
        # =================================================

        if (
            pre_roast.estimated_preparation_level
            in {
                "EXTENSIVE",
                "CRITICAL",
            }
            or
            batch_usage.primary_recommendation
            == "REWORK_ONLY"
            or
            (
                roast_risk.overall_risk
                == "CRITICAL"
                and
                roasting.direct_roasting_allowed
                is False
            )
        ):

            reasons.append(
                (
                    "The current batch requires "
                    "significant corrective preparation "
                    "before production release."
                )
            )


            if (
                roast_risk.overall_risk
                in {
                    "HIGH",
                    "CRITICAL",
                }
            ):
                reasons.append(
                    (
                        f"Roast quality risk is "
                        f"{roast_risk.overall_risk}."
                    )
                )


            if (
                usable_yield.severe_reject_count
                > 0
            ):
                reasons.append(
                    (
                        f"{usable_yield.severe_reject_count} "
                        "beans are currently classified "
                        "as severe rejects recommended "
                        "for removal."
                    )
                )


            self._add_action(
                actions,

                title=(
                    "Remove Severe Defects"
                ),

                description=(
                    "Remove black and "
                    "black-and-broken beans identified "
                    "during the physical AI inspection."
                ),

                stage=(
                    "SECONDARY_SORTING"
                ),

                priority=(
                    "CRITICAL"
                ),

                required=True,
            )


            if (
                usable_yield.broken_count
                > 0
            ):
                self._add_action(
                    actions,

                    title=(
                        "Secondary Sort Broken Beans"
                    ),

                    description=(
                        "Separate broken or chipped beans "
                        "to improve physical uniformity."
                    ),

                    stage=(
                        "SECONDARY_SORTING"
                    ),

                    priority=(
                        "HIGH"
                    ),

                    required=True,
                )


            if (
                usable_yield.unknown_count
                > 0
            ):
                self._add_action(
                    actions,

                    title=(
                        "Inspect Uncertain Beans"
                    ),

                    description=(
                        "Manually inspect beans with "
                        "uncertain AI classifications."
                    ),

                    stage=(
                        "MANUAL_INSPECTION"
                    ),

                    priority=(
                        "HIGH"
                    ),

                    required=True,
                )


            self._add_action(
                actions,

                title=(
                    "Repeat Quality Analysis"
                ),

                description=(
                    "Run the required sensor and "
                    "physical AI inspections again "
                    "after corrective processing."
                ),

                stage=(
                    "QUALITY_REINSPECTION"
                ),

                priority=(
                    "CRITICAL"
                ),

                required=True,
            )


            release_conditions.extend(
                [
                    (
                        "Complete all mandatory "
                        "pre-roast corrective actions."
                    ),
                    (
                        "Repeat physical AI inspection."
                    ),
                    (
                        "Repeat sensor analysis if "
                        "required by the new inspection."
                    ),
                    (
                        "Obtain an acceptable updated "
                        "production decision."
                    ),
                ]
            )


            return ProductionDecision(

                decision=(
                    "REWORK_AND_REASSESS"
                ),

                production_status=(
                    "REWORK"
                ),

                title=(
                    "Rework and Reassess Batch"
                ),

                summary=(
                    "The batch has potential recovery "
                    "value, but significant corrective "
                    "processing is required before it "
                    "can be considered for roasting or "
                    "product allocation."
                ),

                immediate_action=(
                    "Send the batch to corrective "
                    "sorting and defect-removal."
                ),

                next_stage=(
                    "REWORK"
                ),

                can_proceed_to_roasting=False,

                release_authorized=False,

                batch_hold_required=True,

                rework_required=True,

                reinspection_required=True,

                manual_review_required=(
                    usable_yield.manual_review_required
                ),

                decision_reasons=reasons,

                required_actions=actions,

                release_conditions=(
                    release_conditions
                ),

                evidence=evidence,

                recommended_product_direction=(
                    batch_usage.recommended_use
                ),

                disposition_note=(
                    "After successful rework, the batch "
                    "may be reconsidered for the product "
                    "uses recommended by the batch usage "
                    "module."
                ),

                methodology_note=(
                    "This decision prioritizes recovery "
                    "when the current batch is not ready "
                    "for production but still contains "
                    "potentially recoverable material."
                ),
            )


        # =================================================
        # 4. RE-SORT AND RE-TEST CONDITION
        # =================================================

        if (
            pre_roast.reinspection_required
            or
            pre_roast.readiness_status
            == "READY_AFTER_PREPARATION"
            or
            roasting.roasting_eligibility
            == "CONDITIONAL"
            or
            roast_risk.overall_risk
            in {
                "MEDIUM",
                "HIGH",
            }
        ):

            reasons.append(
                (
                    "The batch is not currently cleared "
                    "for direct roasting."
                )
            )


            if (
                pre_roast.severe_defect_removal_required
            ):
                reasons.append(
                    (
                        "Severe defect removal is "
                        "required before release."
                    )
                )


            if (
                pre_roast.broken_sorting_required
            ):
                reasons.append(
                    (
                        "Broken-bean sorting is required "
                        "to improve batch uniformity."
                    )
                )


            self._add_action(
                actions,

                title=(
                    "Complete Required Sorting"
                ),

                description=(
                    "Complete all mandatory sorting and "
                    "preparation actions identified in "
                    "the pre-roast plan."
                ),

                stage=(
                    "SECONDARY_SORTING"
                ),

                priority=(
                    "HIGH"
                ),

                required=True,
            )


            self._add_action(
                actions,

                title=(
                    "Re-Test Batch"
                ),

                description=(
                    "Repeat the required quality "
                    "inspections after sorting."
                ),

                stage=(
                    "QUALITY_REINSPECTION"
                ),

                priority=(
                    "HIGH"
                ),

                required=True,
            )


            release_conditions.extend(
                [
                    (
                        "All mandatory pre-roast actions "
                        "must be completed."
                    ),
                    (
                        "Reinspection must confirm an "
                        "acceptable batch condition."
                    ),
                    (
                        "Roasting eligibility must be "
                        "READY before direct release."
                    ),
                ]
            )


            return ProductionDecision(

                decision=(
                    "RE_SORT_AND_RE_TEST"
                ),

                production_status=(
                    "CONDITIONAL"
                ),

                title=(
                    "Re-Sort and Re-Test Before Roasting"
                ),

                summary=(
                    "The batch has potential production "
                    "value, but quality corrections and "
                    "reinspection must be completed "
                    "before roasting."
                ),

                immediate_action=(
                    "Perform secondary sorting and "
                    "complete the required quality "
                    "reinspection."
                ),

                next_stage=(
                    "SECONDARY_SORTING"
                ),

                can_proceed_to_roasting=False,

                release_authorized=False,

                batch_hold_required=True,

                rework_required=True,

                reinspection_required=True,

                manual_review_required=(
                    pre_roast.manual_inspection_required
                ),

                decision_reasons=reasons,

                required_actions=actions,

                release_conditions=(
                    release_conditions
                ),

                evidence=evidence,

                recommended_product_direction=(
                    batch_usage.recommended_use
                ),

                disposition_note=(
                    "Do not roast the current batch "
                    "until the corrective actions and "
                    "reinspection are successfully "
                    "completed."
                ),

                methodology_note=(
                    "Conditional production release is "
                    "used when the batch may be suitable "
                    "after manageable corrective quality "
                    "actions."
                ),
            )


        # =================================================
        # 5. COMMERCIAL PRODUCT EVALUATION
        # =================================================

        if (
            batch_usage.primary_recommendation
            in {
                "COMMERCIAL_BLEND",
                "ECONOMY_PRODUCT",
            }
            and
            roasting.direct_roasting_allowed
            is True
        ):

            reasons.extend(
                [
                    (
                        "The batch is physically and "
                        "operationally suitable to move "
                        "forward, but product allocation "
                        "should follow the batch usage "
                        "recommendation."
                    ),
                    (
                        f"Recommended product direction: "
                        f"{batch_usage.recommended_use}"
                    ),
                ]
            )


            self._add_action(
                actions,

                title=(
                    "Release for Controlled "
                    "Product Evaluation"
                ),

                description=(
                    "Proceed with the appropriate "
                    "roasting and product evaluation "
                    "for the recommended commercial "
                    "use."
                ),

                stage=(
                    "PRODUCT_ALLOCATION"
                ),

                priority=(
                    "MEDIUM"
                ),

                required=True,
            )


            return ProductionDecision(

                decision=(
                    "EVALUATE_FOR_COMMERCIAL_USE"
                ),

                production_status=(
                    "CONDITIONAL"
                ),

                title=(
                    "Evaluate Batch for Commercial Use"
                ),

                summary=(
                    "The batch may proceed for controlled "
                    "production evaluation according to "
                    "the recommended product category."
                ),

                immediate_action=(
                    "Proceed to roasting and controlled "
                    "product suitability evaluation."
                ),

                next_stage=(
                    "PRODUCT_ALLOCATION"
                ),

                can_proceed_to_roasting=True,

                release_authorized=True,

                batch_hold_required=False,

                rework_required=False,

                reinspection_required=False,

                manual_review_required=False,

                decision_reasons=reasons,

                required_actions=actions,

                release_conditions=[
                    (
                        "Follow normal roasting quality "
                        "control."
                    ),
                    (
                        "Perform product-specific "
                        "evaluation before final market "
                        "allocation."
                    ),
                ],

                evidence=evidence,

                recommended_product_direction=(
                    batch_usage.recommended_use
                ),

                disposition_note=(
                    "This does not determine exact blend "
                    "ratios or guarantee final sensory "
                    "quality."
                ),

                methodology_note=(
                    "The production decision separates "
                    "raw-bean production suitability "
                    "from final product and sensory "
                    "validation."
                ),
            )


        # =================================================
        # 6. RELEASE FOR ROASTING
        # =================================================

        if (
            roasting.roasting_eligibility
            == "READY"
            and
            roasting.direct_roasting_allowed
            is True
            and
            pre_roast.readiness_status
            == "READY"
            and
            roast_risk.overall_risk
            == "LOW"
            and
            batch_usage.direct_use_allowed
            is True
        ):

            reasons.extend(
                [
                    (
                        "The roasting recommendation "
                        "supports direct roasting."
                    ),
                    (
                        "The pre-roast preparation "
                        "assessment indicates the batch "
                        "is ready."
                    ),
                    (
                        "Overall roast quality risk is "
                        "LOW."
                    ),
                    (
                        "The batch usage assessment "
                        "supports direct production use."
                    ),
                ]
            )


            self._add_action(
                actions,

                title=(
                    "Complete Standard Pre-Roast "
                    "Preparation"
                ),

                description=(
                    "Complete normal cleaning and "
                    "pre-roast handling procedures."
                ),

                stage=(
                    "ROASTING"
                ),

                priority=(
                    "LOW"
                ),

                required=True,
            )


            self._add_action(
                actions,

                title=(
                    "Release Batch to Roasting"
                ),

                description=(
                    "Transfer the approved batch to the "
                    "roasting stage."
                ),

                stage=(
                    "ROASTING"
                ),

                priority=(
                    "LOW"
                ),

                required=True,
            )


            return ProductionDecision(

                decision=(
                    "RELEASE_FOR_ROASTING"
                ),

                production_status="READY",

                title=(
                    "Batch Approved for Roasting"
                ),

                summary=(
                    "The combined processing intelligence "
                    "assessment supports release of the "
                    "current batch to the roasting "
                    "stage."
                ),

                immediate_action=(
                    "Complete standard preparation and "
                    "send the batch to roasting."
                ),

                next_stage=(
                    "ROASTING"
                ),

                can_proceed_to_roasting=True,

                release_authorized=True,

                batch_hold_required=False,

                rework_required=False,

                reinspection_required=False,

                manual_review_required=False,

                decision_reasons=reasons,

                required_actions=actions,

                release_conditions=[
                    (
                        "Maintain normal roasting and "
                        "production quality controls."
                    ),
                ],

                evidence=evidence,

                recommended_product_direction=(
                    batch_usage.recommended_use
                ),

                disposition_note=(
                    "Roasting release indicates that "
                    "raw-bean quality requirements in "
                    "this research system have been "
                    "satisfied. Final roasted-product "
                    "quality still requires normal "
                    "process and sensory validation."
                ),

                methodology_note=(
                    "Release is authorized only when "
                    "multiple processing-intelligence "
                    "modules agree that the batch is "
                    "ready and low-risk."
                ),
            )


        # =================================================
        # 7. CONSERVATIVE FALLBACK
        # =================================================

        reasons.append(
            (
                "The processing intelligence modules "
                "do not provide enough agreement for "
                "automatic production release."
            )
        )


        self._add_action(
            actions,

            title=(
                "Hold for Manual Quality Review"
            ),

            description=(
                "A quality inspector should review the "
                "complete report before determining the "
                "next production action."
            ),

            stage=(
                "MANUAL_INSPECTION"
            ),

            priority=(
                "HIGH"
            ),

            required=True,
        )


        return ProductionDecision(

            decision=(
                "HOLD_FOR_INSPECTION"
            ),

            production_status="HOLD",

            title=(
                "Manual Production Review Required"
            ),

            summary=(
                "Automatic release has been blocked "
                "because the decision-support outputs "
                "do not provide a sufficiently clear "
                "production decision."
            ),

            immediate_action=(
                "Hold the batch and request manual "
                "quality review."
            ),

            next_stage=(
                "MANUAL_INSPECTION"
            ),

            can_proceed_to_roasting=False,

            release_authorized=False,

            batch_hold_required=True,

            rework_required=False,

            reinspection_required=True,

            manual_review_required=True,

            decision_reasons=reasons,

            required_actions=actions,

            release_conditions=[
                (
                    "Complete manual quality review."
                ),
                (
                    "Repeat inspection where necessary."
                ),
                (
                    "Generate an updated production "
                    "decision before release."
                ),
            ],

            evidence=evidence,

            recommended_product_direction=(
                batch_usage.recommended_use
            ),

            disposition_note=(
                "The fallback rule intentionally "
                "prevents uncertain automated production "
                "decisions."
            ),

            methodology_note=(
                "When upstream decision-support modules "
                "do not clearly agree, the system uses "
                "a conservative hold-and-review policy."
            ),
        )


# =========================================================
# SERVICE INSTANCE
# =========================================================

production_decision_service = (
    ProductionDecisionService()
)