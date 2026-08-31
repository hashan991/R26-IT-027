# =========================================================
# SENSOR QUALITY CONFIGURATION
# =========================================================
#
# Response / Delta:
#     sample - baseline
#
# Research-defined thresholds derived from the
# collected GOOD / BAD coffee bean experiments.
#
# =========================================================


# =========================================================
# SENSOR THRESHOLDS
# =========================================================

MQ2_BAD_THRESHOLD = 70

MQ3_BAD_THRESHOLD = 28

MQ135_BAD_THRESHOLD = 9.5

MOISTURE_BAD_THRESHOLD = -16.0

HUMIDITY_BAD_THRESHOLD = 10.7


# =========================================================
# SENSOR VOTING CONFIGURATION
# =========================================================
#
# Five sensors participate:
#
# MQ-2
# MQ-3
# MQ-135
# Moisture
# Humidity
#
# Temperature is supporting information only.
#
# =========================================================

TOTAL_VOTING_SENSORS = 5

SENSOR_VOTE_WEIGHT = 20.0


# =========================================================
# SENSOR STATUS RULES
# =========================================================
#
# 0-1 BAD votes -> GOOD
# 2 BAD votes   -> REVIEW
# 3-5 BAD votes -> BAD
#
# =========================================================

GOOD_MAX_BAD_VOTES = 1

REVIEW_BAD_VOTES = 2

BAD_MIN_BAD_VOTES = 3