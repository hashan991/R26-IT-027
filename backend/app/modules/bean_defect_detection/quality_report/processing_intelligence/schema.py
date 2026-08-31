from typing import Any, Optional

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


# =========================================================
# COMPLETE PROCESSING INTELLIGENCE RESPONSE
# =========================================================
#
# Stable seven-module response shape.
#
# Modules 6 and 7 are Optional during the migration period.
# Once their services are added, this schema does not need
# to change again.
#
# =========================================================

class ProcessingIntelligence(BaseModel):

    # 1. Roasting Readiness Recommendation
    roasting_recommendation: (
        RoastingRecommendation
    )

    # 2. Pre-Roast Corrective Actions
    #
    # Field name retained for current API/frontend
    # compatibility.
    pre_roast_plan: PreRoastPlan

    # 3. Roast Quality Risks
    roast_quality_risk: RoastQualityRisk

    # 4. Batch Usage Recommendation
    batch_usage: BatchUsageRecommendation

    # 5. Usable Yield Estimation
    usable_yield: UsableYield

    # 6. Storage & Handling Recommendation
    #
    # Any is temporary only because the module schema is not
    # created yet. It can accept the future Pydantic model
    # without requiring another change to this root schema.
    storage_handling: Optional[Any] = None

    # 7. Preventive Process Guidance
    preventive_process_guidance: (
        Optional[Any]
    ) = None
