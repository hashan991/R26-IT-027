# ============================================================
# Smart Coffee Manufacturing
# Coffee Powder Quality Service
#
# Connects:
# Sensor Data
#     ↓
# Quality Engine
#     ↓
# Hybrid Production Decision
#     ↓
# Recommendation Engine
#     ↓
# Final Powder Quality Result
# ============================================================


from .quality_engine import run_quality_analysis
from .recommendation_engine import generate_recommendation


# ============================================================
# RELEASE STATUS
# ============================================================

def get_release_status(decision: str):
    if decision == "PASS":
        return "APPROVED"

    if decision == "WARN":
        return "REVIEW_REQUIRED"

    return "BLOCKED"


# ============================================================
# RISK LEVEL
# ============================================================

def get_risk_level(decision: str):
    if decision == "PASS":
        return "LOW"

    if decision == "WARN":
        return "MEDIUM"

    return "HIGH"


# ============================================================
# HYBRID PRODUCTION DECISION
# ============================================================

def generate_final_decision(
    ai_status: str,
    arduino_status: str | None = None,
):
    """
    Combine AI quality status with the optional
    Arduino decision.

    HOLD has highest priority.
    WARN has second priority.
    Otherwise PASS.
    """

    ai_status = str(
        ai_status or "PASS"
    ).upper()

    valid_statuses = {
        "PASS",
        "WARN",
        "HOLD",
    }

    if arduino_status:
        arduino_status = str(
            arduino_status
        ).upper()

        if arduino_status not in valid_statuses:
            arduino_status = None

    statuses = [ai_status]

    if arduino_status:
        statuses.append(
            arduino_status
        )

    if "HOLD" in statuses:
        return "HOLD"

    if "WARN" in statuses:
        return "WARN"

    return "PASS"


# ============================================================
# EXTRACT ACTION TEXT
# ============================================================

def extract_recommended_actions(
    recommendation: dict,
):
    """
    Convert detailed recommendation action objects
    into a simple list for dashboard/production APIs.
    """

    actions = recommendation.get(
        "immediate_actions",
        [],
    )

    result = []

    for item in actions:

        if isinstance(item, dict):
            action = item.get("action")

            if action:
                result.append(action)

        elif isinstance(item, str):
            result.append(item)

    return result


# ============================================================
# MAIN POWDER QUALITY ANALYSIS SERVICE
# ============================================================

def analyze_powder_quality(
    moisture,
    red,
    green,
    blue,
    temperature,
    humidity,
    arduino_status=None,
):
    """
    Main service method used by powder API routes.
    """

    # --------------------------------------------------------
    # STEP 1 - AI QUALITY ANALYSIS
    # --------------------------------------------------------

    quality_result = run_quality_analysis(
        moisture=moisture,
        red=red,
        green=green,
        blue=blue,
        temperature=temperature,
        humidity=humidity,
    )

    ai_status = quality_result[
        "status"
    ]

    # --------------------------------------------------------
    # STEP 2 - HYBRID FINAL DECISION
    # --------------------------------------------------------

    final_decision = generate_final_decision(
        ai_status=ai_status,
        arduino_status=arduino_status,
    )

    release_status = get_release_status(
        final_decision
    )

    risk_level = get_risk_level(
        final_decision
    )

    # --------------------------------------------------------
    # STEP 3 - RECOMMENDATION
    # --------------------------------------------------------

    recommendation = generate_recommendation(
        moisture=moisture,
        humidity=humidity,
        temperature=temperature,
        red=red,
        green=green,
        blue=blue,

        status=final_decision,

        moisture_status=quality_result[
            "moisture_status"
        ],

        color_status=quality_result[
            "color_status"
        ],

        temperature_status=quality_result[
            "temperature_status"
        ],

        humidity_status=quality_result[
            "humidity_status"
        ],

        quality_score=quality_result[
            "quality_score"
        ],
    )

    # --------------------------------------------------------
    # STEP 4 - PRODUCTION ACTIONS
    # --------------------------------------------------------

    recommended_actions = (
        extract_recommended_actions(
            recommendation
        )
    )

    # --------------------------------------------------------
    # STEP 5 - FINAL RESULT
    # --------------------------------------------------------

    return {
        "status": final_decision,

        "decision": final_decision,

        "release_status": release_status,

        "risk_level": risk_level,

        "quality_score": quality_result[
            "quality_score"
        ],

        "condition_score": quality_result[
            "quality_score"
        ],

        "confidence": quality_result[
            "confidence"
        ],

        "ai_status": ai_status,

        "arduino_status": (
            str(arduino_status).upper()
            if arduino_status
            else None
        ),

        "parameter_status": {
            "moisture": quality_result[
                "moisture_status"
            ],

            "color": quality_result[
                "color_status"
            ],

            "temperature": quality_result[
                "temperature_status"
            ],

            "humidity": quality_result[
                "humidity_status"
            ],
        },

        "sensor_values": quality_result[
            "sensor_values"
        ],

        "color_distance": quality_result[
            "color_distance"
        ],

        "issues": quality_result[
            "issues"
        ],

        "root_cause": quality_result[
            "root_causes"
        ],

        "recommended_actions": (
            recommended_actions
        ),

        "next_action": recommendation.get(
            "next_action"
        ),

        "recommendation": recommendation,
    }