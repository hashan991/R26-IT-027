// =========================================================
// SENSOR QUALITY CONFIGURATION
// =========================================================
//
// Response / Delta:
//     Sample - Baseline
//
// IMPORTANT:
// Keep these values synchronized with backend:
// sensor_quality_config.py
//
// =========================================================

// =========================================================
// SENSOR THRESHOLDS
// =========================================================

export const SENSOR_THRESHOLDS = {
  mq2: {
    badThreshold: 70,
    direction: "high",
  },

  mq3: {
    badThreshold: 28,
    direction: "high",
  },

  mq135: {
    badThreshold: 9.5,
    direction: "high",
  },

  moisture: {
    badThreshold: -16.0,
    direction: "low",
  },

  humidity: {
    badThreshold: 10.7,
    direction: "high",
  },
};

// =========================================================
// SENSOR VOTING CONFIGURATION
// =========================================================

export const TOTAL_VOTING_SENSORS = 5;

export const SENSOR_VOTE_WEIGHT = 20;

// =========================================================
// SENSOR STATUS RULES
// =========================================================

export const GOOD_MAX_BAD_VOTES = 1;

export const REVIEW_BAD_VOTES = 2;

export const BAD_MIN_BAD_VOTES = 3;

// =========================================================
// TEMPERATURE
// =========================================================
//
// Temperature is supporting environmental information only.
// It does NOT participate in GOOD / REVIEW / BAD voting.
//
// =========================================================

export const TEMPERATURE_USED_FOR_DECISION = false;
