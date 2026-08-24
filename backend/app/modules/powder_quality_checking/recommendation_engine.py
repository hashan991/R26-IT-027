# ============================================================
# Smart Coffee Manufacturing
# Coffee Powder Quality Recommendation Engine
# ============================================================


def generate_recommendation(
    moisture,
    humidity,
    temperature,
    red,
    green,
    blue,
    status,
    moisture_status="PASS",
    color_status="PASS",
    temperature_status="PASS",
    humidity_status="PASS",
    quality_score=0,
):
    """
    Generate corrective recommendations using the result
    produced by the powder quality engine.
    """

    moisture = float(moisture or 0)
    humidity = float(humidity or 0)
    temperature = float(temperature or 0)

    status = str(status or "UNKNOWN").upper()

    moisture_status = str(
        moisture_status or "PASS"
    ).upper()

    color_status = str(
        color_status or "PASS"
    ).upper()

    temperature_status = str(
        temperature_status or "PASS"
    ).upper()

    humidity_status = str(
        humidity_status or "PASS"
    ).upper()

    recommendation = {
        "quality_issue": {
            "title": "Quality Parameters Accepted",
            "severity": "LOW",
            "description": (
                "Batch parameters are within the "
                "acceptable production limits."
            ),
        },

        "root_causes": [],

        "immediate_actions": [],

        "future_prevention": [],

        "expected_outcome": "",

        "next_action": "",

        "risk_level": "LOW",

        "recovery_probability": 100,

        "recovery_possible": False,
    }

    # ========================================================
    # 1. HUMIDITY HOLD
    # ========================================================

    if humidity_status == "HOLD":

        recommendation["quality_issue"] = {
            "title": "High Storage Humidity Risk",
            "severity": "HIGH",
            "description": (
                f"Humidity reached {humidity:.1f}%. "
                "The batch is outside the acceptable "
                "storage humidity range."
            ),
        }

        recommendation["root_causes"] = [
            "High storage humidity condition",
            "Possible moisture absorption by coffee powder",
            "Environmental control instability",
        ]

        recommendation["immediate_actions"] = [
            {
                "step": 1,
                "action": "Hold the batch",
                "reason": (
                    "High humidity may reduce powder stability."
                ),
            },
            {
                "step": 2,
                "action": "Reduce storage humidity",
                "reason": (
                    "Restore acceptable environmental conditions."
                ),
            },
            {
                "step": 3,
                "action": "Retest the batch",
                "reason": (
                    "Confirm recovery before packaging."
                ),
            },
        ]

        recommendation["future_prevention"] = [
            "Enable humidity threshold alerts",
            "Maintain controlled storage humidity",
            "Monitor environmental trends continuously",
        ]

        recommendation["expected_outcome"] = (
            "Correct humidity control should improve "
            "batch stability."
        )

        recommendation["next_action"] = (
            "Correct humidity condition and retest batch"
        )

        recommendation["risk_level"] = "HIGH"
        recommendation["recovery_probability"] = 75
        recommendation["recovery_possible"] = True

    # ========================================================
    # 2. MOISTURE HOLD
    # ========================================================

    elif moisture_status == "HOLD":

        recommendation["quality_issue"] = {
            "title": "Critical Moisture Deviation",
            "severity": "HIGH",
            "description": (
                f"Moisture sensor reading {moisture:.0f} "
                "is outside the acceptable calibrated range."
            ),
        }

        recommendation["root_causes"] = [
            "Moisture level deviation detected",
            "Possible insufficient drying process",
            "Possible storage condition issue",
        ]

        recommendation["immediate_actions"] = [
            {
                "step": 1,
                "action": "Hold the batch from packaging",
                "reason": (
                    "Moisture quality requires correction."
                ),
            },
            {
                "step": 2,
                "action": "Inspect the drying process",
                "reason": (
                    "Determine the cause of the moisture deviation."
                ),
            },
            {
                "step": 3,
                "action": "Retest moisture",
                "reason": (
                    "Validate recovery before release."
                ),
            },
        ]

        recommendation["future_prevention"] = [
            "Define drying completion thresholds",
            "Record drying cycle parameters",
            "Validate moisture before packaging",
        ]

        recommendation["expected_outcome"] = (
            "Corrective processing may restore "
            "acceptable moisture quality."
        )

        recommendation["next_action"] = (
            "Correct moisture condition and retest"
        )

        recommendation["risk_level"] = "HIGH"
        recommendation["recovery_probability"] = 70
        recommendation["recovery_possible"] = True

    # ========================================================
    # 3. COLOR HOLD
    # ========================================================

    elif color_status == "HOLD":

        recommendation["quality_issue"] = {
            "title": "Coffee Powder Colour Inconsistency",
            "severity": "HIGH",
            "description": (
                "Coffee powder colour is significantly "
                "different from the calibrated reference."
            ),
        }

        recommendation["root_causes"] = [
            "Coffee colour inconsistency detected",
            "Possible roasting parameter variation",
            "Possible processing inconsistency",
        ]

        recommendation["immediate_actions"] = [
            {
                "step": 1,
                "action": "Hold the batch for inspection",
                "reason": (
                    "Major colour deviation requires validation."
                ),
            },
            {
                "step": 2,
                "action": "Review roasting parameters",
                "reason": (
                    "Roasting variation may cause colour deviation."
                ),
            },
            {
                "step": 3,
                "action": "Perform another RGB measurement",
                "reason": (
                    "Confirm the detected colour deviation."
                ),
            },
        ]

        recommendation["future_prevention"] = [
            "Maintain consistent roasting parameters",
            "Calibrate RGB sensors regularly",
            "Monitor colour variation for every batch",
        ]

        recommendation["expected_outcome"] = (
            "Correct roasting control should improve "
            "coffee powder colour consistency."
        )

        recommendation["next_action"] = (
            "Inspect roasting process and retest batch"
        )

        recommendation["risk_level"] = "HIGH"
        recommendation["recovery_probability"] = 70
        recommendation["recovery_possible"] = True

    # ========================================================
    # 4. TEMPERATURE HOLD
    # ========================================================

    elif temperature_status == "HOLD":

        recommendation["quality_issue"] = {
            "title": "High Temperature Exposure",
            "severity": "HIGH",
            "description": (
                f"Temperature reached {temperature:.1f}°C. "
                "The batch is outside the acceptable range."
            ),
        }

        recommendation["root_causes"] = [
            "High temperature exposure detected",
            "Possible storage environment problem",
        ]

        recommendation["immediate_actions"] = [
            {
                "step": 1,
                "action": "Move batch to a controlled environment",
                "reason": "Reduce thermal exposure.",
            },
            {
                "step": 2,
                "action": "Monitor temperature until stable",
                "reason": (
                    "Confirm environmental recovery."
                ),
            },
            {
                "step": 3,
                "action": "Retest quality parameters",
                "reason": (
                    "Validate the batch before release."
                ),
            },
        ]

        recommendation["future_prevention"] = [
            "Enable temperature alerts",
            "Maintain controlled storage temperature",
        ]

        recommendation["expected_outcome"] = (
            "Temperature stabilization should prevent "
            "additional quality degradation."
        )

        recommendation["next_action"] = (
            "Stabilize temperature and retest batch"
        )

        recommendation["risk_level"] = "HIGH"
        recommendation["recovery_probability"] = 75
        recommendation["recovery_possible"] = True

    # ========================================================
    # 5. WARN
    # ========================================================

    elif status == "WARN":

        warning_causes = []

        if moisture_status == "WARN":
            warning_causes.append(
                "Moisture level requires attention"
            )

        if color_status == "WARN":
            warning_causes.append(
                "Minor coffee colour variation detected"
            )

        if temperature_status == "WARN":
            warning_causes.append(
                "Temperature slightly above optimal range"
            )

        if humidity_status == "WARN":
            warning_causes.append(
                "Humidity slightly above optimal range"
            )

        recommendation["quality_issue"] = {
            "title": "Minor Quality Deviation",
            "severity": "MEDIUM",
            "description": (
                "One or more quality parameters require "
                "additional verification."
            ),
        }

        recommendation["root_causes"] = (
            warning_causes
            or ["Minor production variation detected"]
        )

        recommendation["immediate_actions"] = [
            {
                "step": 1,
                "action": "Continue monitoring the batch",
                "reason": "Observe the quality trend.",
            },
            {
                "step": 2,
                "action": "Perform additional inspection",
                "reason": (
                    "Confirm packaging readiness."
                ),
            },
        ]

        recommendation["future_prevention"] = [
            "Maintain stable production conditions",
            "Monitor sensor trends continuously",
        ]

        recommendation["expected_outcome"] = (
            "The batch may proceed after successful validation."
        )

        recommendation["next_action"] = (
            "Review and validate before release"
        )

        recommendation["risk_level"] = "MEDIUM"
        recommendation["recovery_probability"] = 90
        recommendation["recovery_possible"] = True

    # ========================================================
    # 6. PASS
    # ========================================================

    else:

        recommendation["quality_issue"] = {
            "title": "Quality Parameters Accepted",
            "severity": "LOW",
            "description": (
                "The batch satisfies the current coffee "
                "powder quality requirements."
            ),
        }

        recommendation["root_causes"] = [
            "No critical quality deviation detected"
        ]

        recommendation["immediate_actions"] = [
            {
                "step": 1,
                "action": "Approve packaging process",
                "reason": (
                    "Current quality requirements are satisfied."
                ),
            }
        ]

        recommendation["future_prevention"] = [
            "Continue standard quality monitoring",
            "Maintain current production conditions",
        ]

        recommendation["expected_outcome"] = (
            "The batch is ready for packaging."
        )

        recommendation["next_action"] = (
            "Proceed with packaging"
        )

        recommendation["risk_level"] = "LOW"
        recommendation["recovery_probability"] = 100
        recommendation["recovery_possible"] = False

    return recommendation