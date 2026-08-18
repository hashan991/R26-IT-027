from pydantic import BaseModel

from .roasting_recommendation.schema import (
    RoastingRecommendation,
)

from .pre_roast_plan.schema import (
    PreRoastPlan,
)

from .roast_quality_risk.schema import (
    RoastQualityRisk,
)

from .batch_usage.schema import (
    BatchUsageRecommendation,
)

from .usable_yield.schema import (
    UsableYield,
)

from .production_decision.schema import (
    ProductionDecision,
)


# =========================================================
# COMPLETE PROCESSING INTELLIGENCE RESPONSE
# =========================================================

class ProcessingIntelligence(BaseModel):

    roasting_recommendation: RoastingRecommendation

    pre_roast_plan: PreRoastPlan

    roast_quality_risk: RoastQualityRisk

    batch_usage: BatchUsageRecommendation

    usable_yield: UsableYield

    production_decision: ProductionDecision