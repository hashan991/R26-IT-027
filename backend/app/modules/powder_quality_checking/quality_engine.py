# ============================================================
# Smart Coffee Manufacturing
# Coffee Powder Quality Evaluation Engine
#
# CoffeeSense AI logic aligned with Arduino UNO.
#
# Primary decision factors:
# - Moisture
# - Temperature
# - Humidity
#
# Supporting indicator:
# - Coffee powder color
#
# IMPORTANT:
# Color is analyzed and reported,
# but does NOT block the final production decision.
# ============================================================


# ============================================================
# COFFEE COLOR REFERENCE PROFILES
# ============================================================

# Arduino Profile A
REFERENCE_A_R = 488
REFERENCE_A_G = 601
REFERENCE_A_B = 482

# Arduino Profile B
REFERENCE_B_R = 580
REFERENCE_B_G = 786
REFERENCE_B_B = 700


# ============================================================
# THRESHOLDS
#
# Must stay aligned with Arduino C++ calibration.
# ============================================================

# Moisture
MOISTURE_PASS_LIMIT = 450
MOISTURE_WARN_LIMIT = 350

# Color
# Supporting indicator only.
COLOR_PASS_DISTANCE = 200
COLOR_WARN_DISTANCE = 400

# Temperature
TEMPERATURE_WARN_LIMIT = 40
TEMPERATURE_HOLD_LIMIT = 45

# Humidity
HUMIDITY_WARN_LIMIT = 70
HUMIDITY_HOLD_LIMIT = 80


# ============================================================
# COLOR DISTANCE
# ============================================================

def _euclidean_color_distance(
    red,
    green,
    blue,
    reference_red,
    reference_green,
    reference_blue,
):
    return (
        (red - reference_red) ** 2
        + (green - reference_green) ** 2
        + (blue - reference_blue) ** 2
    ) ** 0.5


def calculate_color_distance(
    red,
    green,
    blue,
):
    """
    Calculate color distance against both
    calibrated coffee color profiles.

    The closest profile is used.
    """

    red = float(red)
    green = float(green)
    blue = float(blue)

    distance_a = _euclidean_color_distance(
        red,
        green,
        blue,
        REFERENCE_A_R,
        REFERENCE_A_G,
        REFERENCE_A_B,
    )

    distance_b = _euclidean_color_distance(
        red,
        green,
        blue,
        REFERENCE_B_R,
        REFERENCE_B_G,
        REFERENCE_B_B,
    )

    return min(
        distance_a,
        distance_b,
    )


# ============================================================
# MOISTURE ANALYSIS
#
# Arduino:
#
# >= 450  -> PASS
# >= 350  -> WARN
# < 350   -> HOLD
# ============================================================

def analyze_moisture(
    moisture,
):
    moisture = float(
        moisture
    )

    if moisture >= MOISTURE_PASS_LIMIT:
        return "PASS"

    if moisture >= MOISTURE_WARN_LIMIT:
        return "WARN"

    return "HOLD"


# ============================================================
# COLOR ANALYSIS
#
# Supporting indicator only.
# ============================================================

def analyze_color(
    red,
    green,
    blue,
):
    distance = calculate_color_distance(
        red,
        green,
        blue,
    )

    if distance <= COLOR_PASS_DISTANCE:
        return "PASS"

    if distance <= COLOR_WARN_DISTANCE:
        return "WARN"

    return "HOLD"


# ============================================================
# ENVIRONMENT ANALYSIS
#
# Temperature:
#
# < 40    -> PASS
# 40-44.9 -> WARN
# >= 45   -> HOLD
#
# Humidity:
#
# < 70    -> PASS
# 70-79.9 -> WARN
# >= 80   -> HOLD
# ============================================================

def analyze_environment(
    temperature,
    humidity,
):
    temperature = float(
        temperature
    )

    humidity = float(
        humidity
    )

    temperature_status = "PASS"
    humidity_status = "PASS"

    # --------------------------------------------------------
    # TEMPERATURE
    # --------------------------------------------------------

    if temperature >= TEMPERATURE_HOLD_LIMIT:
        temperature_status = "HOLD"

    elif temperature >= TEMPERATURE_WARN_LIMIT:
        temperature_status = "WARN"

    # --------------------------------------------------------
    # HUMIDITY
    # --------------------------------------------------------

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
#
# EXACT ARDUINO PRIORITY:
#
# 1. Moisture HOLD -> HOLD
# 2. Moisture WARN -> WARN
# 3. Humidity HOLD -> HOLD
# 4. Humidity WARN -> WARN
# 5. Temperature HOLD -> HOLD
# 6. Temperature WARN -> WARN
# 7. Otherwise PASS
#
# Color does NOT block PASS.
# ============================================================

def determine_final_status(
    moisture_status,
    temperature_status,
    humidity_status,
):

    # --------------------------------------------------------
    # MOISTURE
    # --------------------------------------------------------

    if moisture_status == "HOLD":
        return "HOLD"

    if moisture_status == "WARN":
        return "WARN"

    # --------------------------------------------------------
    # HUMIDITY
    # --------------------------------------------------------

    if humidity_status == "HOLD":
        return "HOLD"

    if humidity_status == "WARN":
        return "WARN"

    # --------------------------------------------------------
    # TEMPERATURE
    # --------------------------------------------------------

    if temperature_status == "HOLD":
        return "HOLD"

    if temperature_status == "WARN":
        return "WARN"

    # --------------------------------------------------------
    # COLOR IS SUPPORTING ONLY
    # --------------------------------------------------------

    return "PASS"


# ============================================================
# QUALITY SCORE
#
# Only primary production decision parameters affect
# the quality score.
#
# Color remains diagnostic/supporting information.
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

    # --------------------------------------------------------
    # PRIMARY PARAMETERS ONLY
    # --------------------------------------------------------

    primary_statuses = [
        moisture_status,
        temperature_status,
        humidity_status,
    ]

    for status in primary_statuses:

        score -= penalties.get(
            status,
            0,
        )

    return max(
        score,
        0,
    )


# ============================================================
# CONFIDENCE
# ============================================================

def calculate_confidence(
    final_status,
):

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


    # Primary production parameters only

    if moisture_status != "PASS":

        issues.append(
            "Moisture instability detected"
        )


    if temperature_status != "PASS":

        issues.append(
            "Temperature risk detected"
        )


    if humidity_status != "PASS":

        issues.append(
            "Humidity storage risk detected"
        )


    # RGB is supporting evidence only
    # It should not appear as quality issue
    # when batch is PASS


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

    # --------------------------------------------------------
    # MOISTURE
    # --------------------------------------------------------

    if moisture_status != "PASS":

        causes.extend([
            "Moisture level deviation detected",
            "Possible insufficient drying process",
        ])

    # --------------------------------------------------------
    # COLOR
    #
    # Supporting diagnostic information only.
    # --------------------------------------------------------

    # RGB colour is diagnostic evidence only.
    # Root cause should be generated only
    # when production risk exists.

    # --------------------------------------------------------
    # HUMIDITY
    # --------------------------------------------------------

    if humidity_status == "WARN":

        causes.append(
            "Storage humidity slightly above optimal range"
        )

    if humidity_status == "HOLD":

        causes.append(
            "High storage humidity condition"
        )

    # --------------------------------------------------------
    # TEMPERATURE
    # --------------------------------------------------------

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

    moisture = float(
        moisture
    )

    red = float(
        red
    )

    green = float(
        green
    )

    blue = float(
        blue
    )

    temperature = float(
        temperature
    )

    humidity = float(
        humidity
    )


    # ========================================================
    # MOISTURE
    # ========================================================

    moisture_status = analyze_moisture(
        moisture
    )


    # ========================================================
    # COLOR
    #
    # Supporting indicator only.
    # ========================================================

    color_status = analyze_color(
        red,
        green,
        blue,
    )


    # ========================================================
    # ENVIRONMENT
    # ========================================================

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


    # ========================================================
    # FINAL STATUS
    #
    # Color intentionally excluded from final decision.
    # ========================================================

    final_status = determine_final_status(
        moisture_status,
        temperature_status,
        humidity_status,
    )


    # ========================================================
    # QUALITY SCORE
    # ========================================================

    quality_score = calculate_score(
        moisture_status,
        color_status,
        temperature_status,
        humidity_status,
    )


    # ========================================================
    # CONFIDENCE
    # ========================================================

    confidence = calculate_confidence(
        final_status
    )


    # ========================================================
    # COLOR DISTANCE
    # ========================================================

    color_distance = calculate_color_distance(
        red,
        green,
        blue,
    )


    # ========================================================
    # ISSUES
    # ========================================================

    issues = identify_issues(
        moisture_status,
        color_status,
        temperature_status,
        humidity_status,
    )


    # ========================================================
    # ROOT CAUSES
    # ========================================================

    root_causes = identify_root_causes(
        moisture_status,
        color_status,
        temperature_status,
        humidity_status,
    )


    # ========================================================
    # RESULT
    # ========================================================

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