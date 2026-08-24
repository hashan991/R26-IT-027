# ============================================================
# Smart Coffee Manufacturing
# Coffee Powder Quality Evaluation Engine
#
# Latest CoffeeSense AI logic adapted for the main project.
# Analyzes:
# - Moisture
# - Coffee powder color
# - Temperature
# - Humidity
# ============================================================


# ============================================================
# REFERENCE COFFEE COLOR PROFILE
# ============================================================

REFERENCE_R = 324
REFERENCE_G = 392
REFERENCE_B = 329


# ============================================================
# THRESHOLDS
# ============================================================

MOISTURE_PASS_LIMIT = 430
MOISTURE_WARN_LIMIT = 350

COLOR_PASS_DISTANCE = 145
COLOR_WARN_DISTANCE = 190

TEMPERATURE_WARN_LIMIT = 35
TEMPERATURE_HOLD_LIMIT = 40

HUMIDITY_WARN_LIMIT = 60
HUMIDITY_HOLD_LIMIT = 70


# ============================================================
# COLOR DISTANCE
# ============================================================

def calculate_color_distance(red, green, blue):
    return (
        (red - REFERENCE_R) ** 2
        + (green - REFERENCE_G) ** 2
        + (blue - REFERENCE_B) ** 2
    ) ** 0.5


# ============================================================
# MOISTURE ANALYSIS
# ============================================================

def analyze_moisture(moisture):
    moisture = float(moisture)

    if moisture >= MOISTURE_PASS_LIMIT:
        return "PASS"

    if moisture >= MOISTURE_WARN_LIMIT:
        return "WARN"

    return "HOLD"


# ============================================================
# COLOR ANALYSIS
# ============================================================

def analyze_color(red, green, blue):
    distance = calculate_color_distance(
        float(red),
        float(green),
        float(blue),
    )

    if distance <= COLOR_PASS_DISTANCE:
        return "PASS"

    if distance <= COLOR_WARN_DISTANCE:
        return "WARN"

    return "HOLD"


# ============================================================
# ENVIRONMENT ANALYSIS
# ============================================================

def analyze_environment(temperature, humidity):
    temperature = float(temperature)
    humidity = float(humidity)

    temperature_status = "PASS"
    humidity_status = "PASS"

    # Temperature
    if temperature >= TEMPERATURE_HOLD_LIMIT:
        temperature_status = "HOLD"
    elif temperature >= TEMPERATURE_WARN_LIMIT:
        temperature_status = "WARN"

    # Humidity
    if humidity >= HUMIDITY_HOLD_LIMIT:
        humidity_status = "HOLD"
    elif humidity >= HUMIDITY_WARN_LIMIT:
        humidity_status = "WARN"

    return {
        "temperature_status": temperature_status,
        "humidity_status": humidity_status,
    }


# ============================================================
# FINAL STATUS
# ============================================================

def determine_final_status(statuses):
    if "HOLD" in statuses:
        return "HOLD"

    if "WARN" in statuses:
        return "WARN"

    return "PASS"


# ============================================================
# QUALITY SCORE
# ============================================================

def calculate_score(
    moisture_status,
    color_status,
    temperature_status,
    humidity_status,
):
    score = 100

    penalties = {
        "WARN": 10,
        "HOLD": 35,
    }

    statuses = [
        moisture_status,
        color_status,
        temperature_status,
        humidity_status,
    ]

    for status in statuses:
        score -= penalties.get(status, 0)

    return max(score, 0)


# ============================================================
# CONFIDENCE
# ============================================================

def calculate_confidence(final_status):
    if final_status == "PASS":
        return 95

    if final_status == "WARN":
        return 88

    return 90


# ============================================================
# ISSUE IDENTIFICATION
# ============================================================

def identify_issues(
    moisture_status,
    color_status,
    temperature_status,
    humidity_status,
):
    issues = []

    if moisture_status != "PASS":
        issues.append(
            "Moisture instability detected"
        )

    if color_status != "PASS":
        issues.append(
            "Coffee colour deviation detected"
        )

    if temperature_status != "PASS":
        issues.append(
            "Temperature risk detected"
        )

    if humidity_status != "PASS":
        issues.append(
            "Humidity storage risk detected"
        )

    return issues


# ============================================================
# ROOT CAUSE ANALYSIS
# ============================================================

def identify_root_causes(
    moisture_status,
    color_status,
    temperature_status,
    humidity_status,
):
    causes = []

    if moisture_status != "PASS":
        causes.extend([
            "Moisture level deviation detected",
            "Possible insufficient drying process",
        ])

    if color_status != "PASS":
        causes.extend([
            "Coffee colour inconsistency detected",
            "Possible roasting parameter variation",
        ])

    if humidity_status == "WARN":
        causes.append(
            "Storage humidity slightly above optimal range"
        )

    if humidity_status == "HOLD":
        causes.append(
            "High storage humidity condition"
        )

    if temperature_status == "WARN":
        causes.append(
            "Temperature exposure increasing quality risk"
        )

    if temperature_status == "HOLD":
        causes.append(
            "High temperature exposure detected"
        )

    if not causes:
        causes.append(
            "No abnormal production condition detected"
        )

    return causes


# ============================================================
# MAIN QUALITY ANALYSIS
# ============================================================

def run_quality_analysis(
    moisture,
    red,
    green,
    blue,
    temperature,
    humidity,
):
    moisture = float(moisture)
    red = float(red)
    green = float(green)
    blue = float(blue)
    temperature = float(temperature)
    humidity = float(humidity)

    # Moisture
    moisture_status = analyze_moisture(
        moisture
    )

    # Color
    color_status = analyze_color(
        red,
        green,
        blue,
    )

    # Environment
    environment = analyze_environment(
        temperature,
        humidity,
    )

    temperature_status = environment[
        "temperature_status"
    ]

    humidity_status = environment[
        "humidity_status"
    ]

    # Final status
    statuses = [
        moisture_status,
        color_status,
        temperature_status,
        humidity_status,
    ]

    final_status = determine_final_status(
        statuses
    )

    # Quality score
    quality_score = calculate_score(
        moisture_status,
        color_status,
        temperature_status,
        humidity_status,
    )

    # Confidence
    confidence = calculate_confidence(
        final_status
    )

    # Color distance
    color_distance = calculate_color_distance(
        red,
        green,
        blue,
    )

    # Issues
    issues = identify_issues(
        moisture_status,
        color_status,
        temperature_status,
        humidity_status,
    )

    # Root causes
    root_causes = identify_root_causes(
        moisture_status,
        color_status,
        temperature_status,
        humidity_status,
    )

    return {
        "status": final_status,
        "quality_score": quality_score,
        "confidence": confidence,

        "moisture_status": moisture_status,
        "color_status": color_status,
        "temperature_status": temperature_status,
        "humidity_status": humidity_status,

        "sensor_values": {
            "moisture": moisture,
            "red": red,
            "green": green,
            "blue": blue,
            "temperature": temperature,
            "humidity": humidity,
        },

        "color_distance": round(
            color_distance,
            2,
        ),

        "issues": issues,
        "root_causes": root_causes,
    }