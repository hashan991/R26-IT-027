import { useCallback, useEffect, useRef, useState } from "react";

import DeviceStatus from "./DeviceStatus";
import SensorMetricCard from "./SensorMetricCard";

import {
  getSensorStatus,
  getLatestSensorReading,
  sendSensorIndicatorCommand,
} from "../../services/sensorService";

import SensorScanWorkflow from "./SensorScanWorkflow";

function SensorAnalysis({ onComplete }) {
  // =========================================================
  // CONFIGURATION
  // =========================================================

  // Last readings 10 use karala stability check කරනවා
  const REQUIRED_STABILITY_READINGS = 10;

  /*
    IMPORTANT:
    මේවා initial testing thresholds.

    Final research thresholds නෙවෙයි.
    Repeated experiments වලින් පස්සේ tune කරන්න.
  */
  const STABILITY_THRESHOLDS = {
    mq2Percent: 6,
    mq3Percent: 6,
    mq135Percent: 5,
    moisturePercent: 3,

    // Absolute range
    temperatureRange: 0.5,
    humidityRange: 2.0,
  };

  // =========================================================
  // STATES
  // =========================================================

  const [deviceStatus, setDeviceStatus] = useState({
    connected: false,
    port: "--",
    baud_rate: "--",
    device: "Arduino Sensor Module",
  });

  // Current/latest displayed sensor values
  const [sensorData, setSensorData] = useState(null);

  // Last 10 readings
  const [readingHistory, setReadingHistory] = useState([]);

  // collecting | stabilizing | stable
  const [stabilityStatus, setStabilityStatus] = useState("collecting");

  // Individual stability results
  const [stabilityDetails, setStabilityDetails] = useState({
    mq2: false,
    mq3: false,
    mq135: false,
    moisture: false,
    temperature: false,
    humidity: false,
  });

  const [reading, setReading] = useState(false);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  /*
    false = page open unama monitoring automatically
    start wenne naha.
  */
  const [autoReading, setAutoReading] = useState(false);

  // Stop monitoring kalama reading snapshot eka lock කරනවා
  const [lockedAt, setLockedAt] = useState(null);

  // =========================================================
  // SENSOR SCAN WORKFLOW RESULT
  // =========================================================
  //
  // SensorScanWorkflow component එකේ capture වෙන
  // Baseline / Sample data parent component එකේ
  // save කරගෙන Final Quality Report එකට pass කරනවා.
  //
  // =========================================================

  const [scanResult, setScanResult] = useState({
    stage: "idle",

    baseline: null,
    sample: null,

    baselineCapturedAt: null,
    sampleCapturedAt: null,

    completed: false,
  });

  // =========================================================
  // REFS
  // =========================================================

  // Prevent API requests overlapping
  const requestRunningRef = useRef(false);

  // Component mount status
  const mountedRef = useRef(true);

  /*
    Monitoring stop kalama old async request response
    ekak awith UI overwrite කරන එක prevent කරන්න.
  */
  const monitoringSessionRef = useRef(0);

  // =========================================================
  // COMPONENT MOUNT / UNMOUNT
  // =========================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // =========================================================
  // PERCENTAGE VARIATION
  // =========================================================

  const calculatePercentVariation = (values) => {
    if (!values || values.length === 0) {
      return Infinity;
    }

    const numericValues = values.filter(
      (value) =>
        value !== null && value !== undefined && Number.isFinite(Number(value)),
    );

    if (numericValues.length !== values.length) {
      return Infinity;
    }

    const convertedValues = numericValues.map(Number);

    const maximum = Math.max(...convertedValues);

    const minimum = Math.min(...convertedValues);

    const mean =
      convertedValues.reduce((total, value) => total + value, 0) /
      convertedValues.length;

    if (mean === 0) {
      return Infinity;
    }

    return ((maximum - minimum) / Math.abs(mean)) * 100;
  };

  // =========================================================
  // ABSOLUTE RANGE
  // =========================================================

  const calculateRange = (values) => {
    if (!values || values.length === 0) {
      return Infinity;
    }

    const numericValues = values.filter(
      (value) =>
        value !== null && value !== undefined && Number.isFinite(Number(value)),
    );

    if (numericValues.length !== values.length) {
      return Infinity;
    }

    const convertedValues = numericValues.map(Number);

    return Math.max(...convertedValues) - Math.min(...convertedValues);
  };

  // =========================================================
  // CHECK SENSOR STABILITY
  // =========================================================

  const checkStability = (history) => {
    // ---------------------------------------------
    // Need minimum 10 readings
    // ---------------------------------------------

    if (history.length < REQUIRED_STABILITY_READINGS) {
      return {
        status: "collecting",

        details: {
          mq2: false,
          mq3: false,
          mq135: false,
          moisture: false,
          temperature: false,
          humidity: false,
        },
      };
    }

    // ---------------------------------------------
    // Extract values
    // ---------------------------------------------

    const mq2Values = history.map((item) => item.mq2);

    const mq3Values = history.map((item) => item.mq3);

    const mq135Values = history.map((item) => item.mq135);

    const moistureValues = history.map((item) => item.moisture);

    const temperatureValues = history.map((item) => item.temperature);

    const humidityValues = history.map((item) => item.humidity);

    // ---------------------------------------------
    // Calculate variations
    // ---------------------------------------------

    const mq2Variation = calculatePercentVariation(mq2Values);

    const mq3Variation = calculatePercentVariation(mq3Values);

    const mq135Variation = calculatePercentVariation(mq135Values);

    const moistureVariation = calculatePercentVariation(moistureValues);

    const temperatureRange = calculateRange(temperatureValues);

    const humidityRange = calculateRange(humidityValues);

    // ---------------------------------------------
    // Individual sensor stability
    // ---------------------------------------------

    const details = {
      mq2: mq2Variation <= STABILITY_THRESHOLDS.mq2Percent,

      mq3: mq3Variation <= STABILITY_THRESHOLDS.mq3Percent,

      mq135: mq135Variation <= STABILITY_THRESHOLDS.mq135Percent,

      moisture: moistureVariation <= STABILITY_THRESHOLDS.moisturePercent,

      temperature: temperatureRange <= STABILITY_THRESHOLDS.temperatureRange,

      humidity: humidityRange <= STABILITY_THRESHOLDS.humidityRange,
    };

    // ---------------------------------------------
    // Overall status
    // ---------------------------------------------

    const allStable = Object.values(details).every(Boolean);

    return {
      status: allStable ? "stable" : "stabilizing",

      details,
    };
  };

  // =========================================================
  // CHECK DEVICE STATUS
  // =========================================================

  const checkDeviceStatus = useCallback(async () => {
    try {
      const status = await getSensorStatus();

      if (!mountedRef.current) {
        return null;
      }

      setDeviceStatus(status);

      return status;
    } catch (error) {
      console.error("Device status check failed:", error);

      if (!mountedRef.current) {
        return null;
      }

      setDeviceStatus((previous) => ({
        ...previous,
        connected: false,
      }));

      return null;
    }
  }, []);

  // =========================================================
  // DEVICE STATUS AUTO CHECK
  // =========================================================

  /*
    Monitoring STOP wela thibbath
    Arduino connect/disconnect status eka
    seconds 3කට වරක් check වෙනවා.
  */

  useEffect(() => {
    if (autoReading) {
      return;
    }

    let cancelled = false;
    let timer = null;

    const statusLoop = async () => {
      if (cancelled) {
        return;
      }

      await checkDeviceStatus();

      if (!cancelled) {
        timer = setTimeout(statusLoop, 3000);
      }
    };

    statusLoop();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [autoReading, checkDeviceStatus]);

  // =========================================================
  // ADD READING TO HISTORY
  // =========================================================

  const updateReadingHistory = (data) => {
    setReadingHistory((previous) => {
      /*
        Always keep only latest 10 readings.
      */
      const updated = [...previous, data].slice(-REQUIRED_STABILITY_READINGS);

      const stability = checkStability(updated);

      setStabilityStatus(stability.status);

      setStabilityDetails(stability.details);

      return updated;
    });
  };

  // =========================================================
  // READ SENSOR DATA
  // =========================================================

  const readSensors = useCallback(async ({ sessionId = null } = {}) => {
    // Already request ekak running නම්
    if (requestRunningRef.current) {
      return false;
    }

    requestRunningRef.current = true;

    try {
      setReading(true);

      setError("");

      // -----------------------------------------------------
      // 1. CHECK ARDUINO STATUS
      // -----------------------------------------------------

      const status = await getSensorStatus();

      if (!mountedRef.current) {
        return false;
      }

      /*
          User monitoring stop karala nam
          previous session response ignore කරන්න.
        */
      if (sessionId !== null && sessionId !== monitoringSessionRef.current) {
        return false;
      }

      setDeviceStatus(status);

      // -----------------------------------------------------
      // ARDUINO NOT CONNECTED
      // -----------------------------------------------------

      if (!status.connected) {
        setError("Arduino sensor module is not connected.");

        /*
            Live monitoring active wela device disconnect
            unoth live readings reset කරනවා.
          */
        if (sessionId !== null) {
          setSensorData(null);

          setReadingHistory([]);

          setStabilityStatus("collecting");

          setStabilityDetails({
            mq2: false,
            mq3: false,
            mq135: false,
            moisture: false,
            temperature: false,
            humidity: false,
          });

          setLockedAt(null);
        }

        return false;
      }

      // -----------------------------------------------------
      // 2. READ REAL SENSOR VALUES
      // -----------------------------------------------------

      const data = await getLatestSensorReading();

      if (!mountedRef.current) {
        return false;
      }

      /*
          Stop clicked during request
        */
      if (sessionId !== null && sessionId !== monitoringSessionRef.current) {
        return false;
      }

      // -----------------------------------------------------
      // 3. UPDATE CURRENT VALUES
      // -----------------------------------------------------

      setSensorData(data);

      setLastUpdated(new Date());

      // -----------------------------------------------------
      // 4. UPDATE STABILITY HISTORY
      // -----------------------------------------------------

      updateReadingHistory(data);

      return true;
    } catch (error) {
      console.error("Sensor reading failed:", error);

      if (!mountedRef.current) {
        return false;
      }

      if (sessionId !== null && sessionId !== monitoringSessionRef.current) {
        return false;
      }

      setError(
        error?.response?.data?.detail ||
          error?.message ||
          "Unable to read sensor data.",
      );

      setDeviceStatus((previous) => ({
        ...previous,
        connected: false,
      }));

      return false;
    } finally {
      if (mountedRef.current) {
        setReading(false);
      }

      requestRunningRef.current = false;
    }
  }, []);

  // =========================================================
  // LIVE MONITORING LOOP
  // =========================================================

  useEffect(() => {
    if (!autoReading) {
      return;
    }

    let cancelled = false;
    let timer = null;

    const sessionId = monitoringSessionRef.current;

    const liveLoop = async () => {
      if (cancelled) {
        return;
      }

      await readSensors({
        sessionId,
      });

      if (
        !cancelled &&
        mountedRef.current &&
        sessionId === monitoringSessionRef.current
      ) {
        /*
          Arduino itself sends data every ~2 seconds,
          so frontend also updates every 2 seconds.
        */
        timer = setTimeout(liveLoop, 2000);
      }
    };

    liveLoop();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [autoReading, readSensors]);

  // =========================================================
  // START / STOP MONITORING
  // =========================================================

  const handleToggleMonitoring = () => {
    // =====================================================
    // STOP MONITORING
    // =====================================================

    if (autoReading) {
      // Invalidate current live session
      monitoringSessionRef.current += 1;

      setAutoReading(false);

      /*
        Lock latest reading.
        Stability status/history preserve කරනවා.
      */
      if (sensorData) {
        setLockedAt(new Date());
      }

      return;
    }

    // =====================================================
    // START NEW MONITORING SESSION
    // =====================================================

    monitoringSessionRef.current += 1;

    setError("");

    setLockedAt(null);

    /*
      New monitoring session ekak nisa
      old stability history remove කරනවා.
    */
    setReadingHistory([]);

    setStabilityStatus("collecting");

    setStabilityDetails({
      mq2: false,
      mq3: false,
      mq135: false,
      moisture: false,
      temperature: false,
      humidity: false,
    });

    setAutoReading(true);
  };

  // =========================================================
  // COMPLETE SENSOR STEP
  // =========================================================

  // =========================================================
  // COMPLETE SENSOR STEP
  // =========================================================

  const handleComplete = async () => {
    setError("");

    // Sensor data nathnam
    if (!sensorData) {
      setError(
        "No sensor readings are available. Start the sensor test and collect sensor data first.",
      );
      return;
    }

    // Complete Baseline -> Sample workflow first
    if (!scanResult.completed || !scanResult.baseline || !scanResult.sample) {
      setError(
        "Complete the Baseline → Sample sensor workflow before continuing to Physical AI Analysis.",
      );
      return;
    }

    // Monitoring thama run wenawanam
    if (autoReading) {
      setError(
        "Sensor monitoring is still active. Wait until the sample reading is captured and the task is complete.",
      );
      return;
    }

    // API reading ekak thama process wenawanam
    if (reading) {
      setError("Sensor reading is still in progress. Please wait.");
      return;
    }

    // Snapshot lock wela nathnam
    if (!lockedAt) {
      setError(
        "The final sample reading has not been locked yet. Please wait until the sensor task is complete.",
      );
      return;
    }

    // Sensors stable nathnam
    if (stabilityStatus !== "stable") {
      setError(
        "The final sample readings are not stable yet. Wait until all sensors become stable.",
      );
      return;
    }

    // =========================================================
    // COMPLETE SENSOR RESULT
    // =========================================================

    const result = {
      skipped: false,

      // -----------------------------------------------------
      // Latest / final sensor snapshot
      // -----------------------------------------------------

      readings: {
        mq2: sensorData.mq2,
        mq3: sensorData.mq3,
        mq135: sensorData.mq135,
        moisture: sensorData.moisture,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
      },

      // -----------------------------------------------------
      // Complete experimental workflow
      //
      // Backend quality-report service can calculate:
      // Sensor Response = Sample - Baseline
      // -----------------------------------------------------

      baseline: scanResult.baseline,

      sample: scanResult.sample,

      /*
        comparison intentionally stays null here.

        The backend already supports calculating the
        relative sensor response using:

        sample - baseline

        when comparison is not supplied.
      */
      comparison: null,

      // -----------------------------------------------------
      // Device information
      // -----------------------------------------------------

      device: {
        ...deviceStatus,
      },

      // -----------------------------------------------------
      // Final stability information
      // -----------------------------------------------------

      stability: {
        status: stabilityStatus,
        samples: readingHistory.length,

        details: {
          ...stabilityDetails,
        },
      },

      // -----------------------------------------------------
      // Workflow capture times
      // -----------------------------------------------------

      baselineCapturedAt: scanResult.baselineCapturedAt,

      sampleCapturedAt: scanResult.sampleCapturedAt,

      lockedAt: lockedAt.toISOString(),

      collectedAt: new Date().toISOString(),
    };

    console.log("STEP 1 SENSOR RESULT:", result);

    console.log("STEP 1 SENSOR RESULT JSON:", JSON.stringify(result, null, 2));

    // =========================================================
    // TURN OFF RESULT LED BEFORE PHYSICAL AI ANALYSIS
    // =========================================================
    //
    // GOOD result  -> Green LED remains ON on the result screen.
    // BAD result   -> Red LED remains ON on the result screen.
    // When the user clicks Continue to Physical AI Analysis,
    // RESET is sent to Arduino before moving to Step 2.
    //
    // =========================================================

    try {
      await sendSensorIndicatorCommand("RESET");

      console.log("Arduino indicator reset before Physical AI Analysis");
    } catch (error) {
      console.error(
        "Unable to reset Arduino indicator before Physical AI Analysis:",
        error,
      );
    }

    // Continue to Step 2 after the RESET attempt.
    onComplete(result);
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (date) => {
    if (!date) {
      return "--";
    }

    return date.toLocaleTimeString();
  };

  // =========================================================
  // STABILITY TEXT
  // =========================================================

  const getStabilityTitle = () => {
    if (stabilityStatus === "collecting") {
      return `Collecting Data ${readingHistory.length}/${REQUIRED_STABILITY_READINGS}`;
    }

    if (stabilityStatus === "stabilizing") {
      return "Sensors Stabilizing...";
    }

    return "Sensors Stable";
  };

  const getStabilityDescription = () => {
    if (stabilityStatus === "collecting") {
      return "Collecting enough readings before stability can be evaluated.";
    }

    if (stabilityStatus === "stabilizing") {
      return "Sensor values are still changing. Keep monitoring until the readings become stable.";
    }

    return "All monitored sensor values are within the current stability limits.";
  };

  const resetStabilityTracking = useCallback(() => {
    setReadingHistory([]);

    setStabilityStatus("collecting");

    setStabilityDetails({
      mq2: false,
      mq3: false,
      mq135: false,
      moisture: false,
      temperature: false,
      humidity: false,
    });
  }, []);

  // =========================================================
  // SENSOR STABILITY CHART CONFIG
  // =========================================================

  const SENSOR_STABILITY_ITEMS = [
    {
      key: "mq2",
      label: "MQ-2",
      unit: "Raw",
      description: "Gas response",
      formatValue: (value) => Math.round(Number(value)).toString(),
      metricType: "percent",
      threshold: STABILITY_THRESHOLDS.mq2Percent,
      thresholdLabel: `${STABILITY_THRESHOLDS.mq2Percent}%`,
    },
    {
      key: "mq3",
      label: "MQ-3",
      unit: "Raw",
      description: "VOC response",
      formatValue: (value) => Math.round(Number(value)).toString(),
      metricType: "percent",
      threshold: STABILITY_THRESHOLDS.mq3Percent,
      thresholdLabel: `${STABILITY_THRESHOLDS.mq3Percent}%`,
    },
    {
      key: "mq135",
      label: "MQ-135",
      unit: "Raw",
      description: "Air quality response",
      formatValue: (value) => Math.round(Number(value)).toString(),
      metricType: "percent",
      threshold: STABILITY_THRESHOLDS.mq135Percent,
      thresholdLabel: `${STABILITY_THRESHOLDS.mq135Percent}%`,
    },
    {
      key: "moisture",
      label: "Moisture",
      unit: "Raw",
      description: "Moisture reading",
      formatValue: (value) => Math.round(Number(value)).toString(),
      metricType: "percent",
      threshold: STABILITY_THRESHOLDS.moisturePercent,
      thresholdLabel: `${STABILITY_THRESHOLDS.moisturePercent}%`,
    },
    {
      key: "temperature",
      label: "Temp",
      unit: "°C",
      description: "Temperature",
      formatValue: (value) => Number(value).toFixed(1),
      metricType: "range",
      threshold: STABILITY_THRESHOLDS.temperatureRange,
      thresholdLabel: `${STABILITY_THRESHOLDS.temperatureRange} °C`,
    },
    {
      key: "humidity",
      label: "Humidity",
      unit: "%",
      description: "Relative humidity",
      formatValue: (value) => Number(value).toFixed(1),
      metricType: "range",
      threshold: STABILITY_THRESHOLDS.humidityRange,
      thresholdLabel: `${STABILITY_THRESHOLDS.humidityRange} %`,
    },
  ];

  // =========================================================
  // CHART HELPERS
  // =========================================================

  const getSensorSeries = (key) => {
    return readingHistory
      .map((item) => Number(item?.[key]))
      .filter((value) => Number.isFinite(value));
  };

  const getSensorChartStatus = (key) => {
    if (readingHistory.length < REQUIRED_STABILITY_READINGS) {
      return {
        state: "collecting",
        label: `${readingHistory.length}/${REQUIRED_STABILITY_READINGS}`,
      };
    }

    return stabilityDetails[key]
      ? {
          state: "stable",
          label: "Stable",
        }
      : {
          state: "stabilizing",
          label: "Changing",
        };
  };

  const getSensorMetricSummary = (sensor, values) => {
    if (!values.length) {
      return {
        metricLabel: sensor.metricType === "percent" ? "Variation" : "Range",
        metricValue: "--",
        thresholdLabel: sensor.thresholdLabel,
      };
    }

    if (sensor.metricType === "percent") {
      return {
        metricLabel: "Variation",
        metricValue: `${calculatePercentVariation(values).toFixed(2)}%`,
        thresholdLabel: sensor.thresholdLabel,
      };
    }

    return {
      metricLabel: "Range",
      metricValue: `${calculateRange(values).toFixed(2)} ${sensor.unit}`,
      thresholdLabel: sensor.thresholdLabel,
    };
  };

  const getChartColors = (state) => {
    if (state === "stable") {
      return {
        stroke: "#71dd84",
        fill: "rgba(113, 221, 132, 0.16)",
        point: "#9ef0aa",
      };
    }

    if (state === "stabilizing") {
      return {
        stroke: "#ffb36c",
        fill: "rgba(255, 179, 108, 0.14)",
        point: "#ffd29a",
      };
    }

    return {
      stroke: "#e2b56f",
      fill: "rgba(226, 181, 111, 0.12)",
      point: "#ffe1a6",
    };
  };

  const buildSparklineData = (
    values,
    width = 220,
    height = 72,
    padding = 8,
  ) => {
    if (!values.length) {
      return null;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;

    const points = values.map((value, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) / Math.max(values.length - 1, 1);

      const normalized = (value - min) / span;

      const y = height - padding - normalized * (height - padding * 2);

      return {
        x,
        y,
      };
    });

    const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

    const areaPoints = [
      `${padding},${height - padding}`,
      ...points.map((point) => `${point.x},${point.y}`),
      `${width - padding},${height - padding}`,
    ].join(" ");

    const lastPoint = points[points.length - 1];

    return {
      linePoints,
      areaPoints,
      lastPoint,
    };
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="sensor-analysis">
      <div className="sensor-main-card">
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="sensor-heading">
          <div>
            <span className="sensor-step-label">STEP 01 — SENSOR ANALYSIS</span>

            <h2>Sensor Quality Inspection</h2>

            <p>
              Follow the guided baseline and coffee-sample test below. The
              system will monitor each sensor, validate stability, and lock the
              final sample measurements automatically.
            </p>
          </div>

          <div className="header-status-area">
            {/* LIVE STATUS */}

            <span
              className={`monitor-status-chip ${
                autoReading
                  ? "monitor-status-live"
                  : sensorData && lockedAt
                    ? "monitor-status-locked"
                    : ""
              }`}
            >
              <span
                className={`monitor-status-dot ${
                  autoReading
                    ? "monitor-dot-live"
                    : sensorData && lockedAt
                      ? "monitor-dot-locked"
                      : ""
                }`}
              ></span>

              {autoReading
                ? "Live Monitoring"
                : sensorData && lockedAt
                  ? "Monitoring Stopped"
                  : "Monitoring Ready"}
            </span>

            {/* STABILITY STATUS */}

            <span
              className={`header-stability-chip header-stability-${stabilityStatus}`}
            >
              {stabilityStatus === "stable"
                ? "✓ Stable"
                : stabilityStatus === "stabilizing"
                  ? "● Stabilizing"
                  : `${readingHistory.length}/${REQUIRED_STABILITY_READINGS}`}
            </span>
          </div>
        </div>

        {/* ===================================================
            SENSOR STEP QUICK GUIDE
        =================================================== */}

        <div className="sensor-quick-guide">
          <div className="quick-guide-copy">
            <span>HOW THIS STEP WORKS</span>
            <strong>
              Complete the sensor inspection in three guided actions.
            </strong>
          </div>

          <div className="quick-guide-steps">
            <div className="quick-guide-item">
              <span>1</span>
              <div>
                <strong>Verify device</strong>
                <small>Confirm the sensor module is connected.</small>
              </div>
            </div>

            <div className="quick-guide-item">
              <span>2</span>
              <div>
                <strong>Capture baseline</strong>
                <small>Measure the empty chamber until stable.</small>
              </div>
            </div>

            <div className="quick-guide-item">
              <span>3</span>
              <div>
                <strong>Scan coffee sample</strong>
                <small>
                  Add beans, wait for exposure, then lock the result.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            DEVICE + MANUAL MONITORING
        =================================================== */}

        <div className="sensor-setup-grid">
          <DeviceStatus
            connected={deviceStatus.connected}
            device={deviceStatus.device}
            port={deviceStatus.port}
            baudRate={deviceStatus.baud_rate}
          />

          <div className="sensor-toolbar">
            <div>
              <span className="toolbar-kicker">LIVE SENSOR MONITOR</span>
              <span className="toolbar-title">
                Sensor connection & readings
              </span>

              <span className="toolbar-description">
                {!sensorData
                  ? "Use the guided task below or start monitoring manually."
                  : autoReading
                    ? `Live updating — Last update: ${formatTime(lastUpdated)}`
                    : `Monitoring stopped — Snapshot time: ${formatTime(
                        lockedAt || lastUpdated,
                      )}`}
              </span>
            </div>

            <div className="toolbar-actions">
              <button
                className={`monitor-toggle-button ${
                  autoReading ? "stop-monitor-button" : "start-monitor-button"
                }`}
                onClick={handleToggleMonitoring}
              >
                {autoReading ? (
                  <>
                    <span className="stop-square"></span>
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <span className="play-symbol">▶</span>
                    Start Monitoring
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="sensor-error">
            <div className="sensor-error-icon">!</div>

            <div>
              <strong>Sensor Connection Status</strong>

              <span>{error}</span>

              {autoReading && (
                <small>
                  The system will continue checking for the Arduino
                  automatically.
                </small>
              )}
            </div>
          </div>
        )}

        {/* ===================================================
            SENSOR CARDS
        =================================================== */}

        <div className="sensor-section-heading">
          <div>
            <span>LIVE MEASUREMENTS</span>
            <h3>Current Sensor Readings</h3>
          </div>
        </div>

        <div className="sensor-grid">
          <SensorMetricCard
            icon="MQ2"
            label="MQ-2"
            value={sensorData?.mq2}
            unit="Raw"
            measured={!!sensorData}
            description="MQ-2 gas sensor response"
          />

          <SensorMetricCard
            icon="MQ3"
            label="MQ-3"
            value={sensorData?.mq3}
            unit="Raw"
            measured={!!sensorData}
            description="MQ-3 volatile compound sensor response"
          />

          <SensorMetricCard
            icon="AQ"
            label="MQ-135"
            value={sensorData?.mq135}
            unit="Raw"
            measured={!!sensorData}
            description="MQ-135 air quality and gas response"
          />

          <SensorMetricCard
            icon="💧"
            label="Moisture"
            value={sensorData?.moisture}
            unit="Raw"
            measured={!!sensorData}
            description="Raw coffee bean moisture sensor reading"
          />

          <SensorMetricCard
            icon="🌡"
            label="Temperature"
            value={
              sensorData?.temperature != null
                ? Number(sensorData.temperature).toFixed(1)
                : null
            }
            unit="°C"
            measured={!!sensorData}
            description="Temperature around the coffee bean sample"
          />

          <SensorMetricCard
            icon="RH"
            label="Humidity"
            value={
              sensorData?.humidity != null
                ? Number(sensorData.humidity).toFixed(1)
                : null
            }
            unit="%"
            measured={!!sensorData}
            description="Relative humidity around the coffee bean sample"
          />
        </div>

        {/* ===================================================
            GUIDED SAMPLE SCAN WORKFLOW
        =================================================== */}

        <div className="sensor-primary-workflow">
          <div className="sensor-section-heading sensor-section-heading-light">
            <div>
              <span>PRIMARY TASK</span>
              <h3>Guided Coffee Bean Sensor Test</h3>
            </div>
          </div>

          <div className="scan-workflow-dark-wrap">
            <SensorScanWorkflow
              sensorData={sensorData}
              stabilityStatus={stabilityStatus}
              autoReading={autoReading}
              reading={reading}
              handleToggleMonitoring={handleToggleMonitoring}
              resetStabilityTracking={resetStabilityTracking}
              onWorkflowChange={setScanResult}
            />
          </div>
        </div>
        {/* ===================================================
            STABILITY INDICATOR
        =================================================== */}

        <div className="sensor-section-heading sensor-diagnostics-heading">
          

          
        </div>

        <div className={`stability-panel stability-panel-${stabilityStatus}`}>
          <div
            className={`stability-main-icon stability-icon-${stabilityStatus}`}
          >
            {stabilityStatus === "stable"
              ? "✓"
              : stabilityStatus === "stabilizing"
                ? "≈"
                : "…"}
          </div>

          <div className="stability-content">
            <div className="stability-title-row">
              <strong>{getStabilityTitle()}</strong>

              {reading && <span className="small-reading-spinner"></span>}
            </div>

            <p>{getStabilityDescription()}</p>

            {/* Collecting progress */}

            {stabilityStatus === "collecting" && (
              <div className="stability-progress-track">
                <div
                  className="stability-progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      (readingHistory.length / REQUIRED_STABILITY_READINGS) *
                        100,
                    )}%`,
                  }}
                ></div>
              </div>
            )}
          </div>

          <div className={`stability-badge stability-badge-${stabilityStatus}`}>
            {stabilityStatus === "collecting"
              ? "COLLECTING"
              : stabilityStatus === "stabilizing"
                ? "WAIT"
                : "STABLE"}
          </div>
        </div>
        {/* ===================================================
            INDIVIDUAL SENSOR STABILITY CHARTS
        =================================================== */}

        {readingHistory.length > 0 && (
          <div className="stability-chart-section">
            <div className="stability-chart-header">
              <div>
                <strong>Individual Sensor Stability</strong>

                <p>
                  Visualize the last{" "}
                  {Math.min(readingHistory.length, REQUIRED_STABILITY_READINGS)}{" "}
                  readings of each sensor and identify whether each signal has
                  stabilized.
                </p>
              </div>
            </div>

            <div className="stability-chart-grid">
              {SENSOR_STABILITY_ITEMS.map((sensor) => {
                const values = getSensorSeries(sensor.key);

                const chartData = buildSparklineData(values);

                const status = getSensorChartStatus(sensor.key);

                const summary = getSensorMetricSummary(sensor, values);

                const colors = getChartColors(status.state);

                const currentValue = values.length
                  ? values[values.length - 1]
                  : null;

                return (
                  <div
                    key={sensor.key}
                    className={`stability-chart-card stability-chart-card-${status.state}`}
                  >
                    <div className="chart-card-top">
                      <div>
                        <div className="chart-sensor-name">{sensor.label}</div>

                        <div className="chart-sensor-description">
                          {sensor.description}
                        </div>
                      </div>

                      <span
                        className={`chart-status-badge chart-status-${status.state}`}
                      >
                        <span className="chart-status-dot"></span>
                        {status.label}
                      </span>
                    </div>

                    <div className="chart-current-reading">
                      <span className="chart-current-value">
                        {currentValue !== null
                          ? sensor.formatValue(currentValue)
                          : "--"}
                      </span>

                      <span className="chart-current-unit">{sensor.unit}</span>
                    </div>

                    <div className="chart-box">
                      {chartData ? (
                        <svg
                          className="sensor-mini-chart"
                          viewBox="0 0 220 72"
                          preserveAspectRatio="none"
                        >
                          <line
                            x1="8"
                            y1="64"
                            x2="212"
                            y2="64"
                            className="chart-base-line"
                          />

                          <polygon
                            points={chartData.areaPoints}
                            fill={colors.fill}
                          />

                          <polyline
                            points={chartData.linePoints}
                            fill="none"
                            stroke={colors.stroke}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <circle
                            cx={chartData.lastPoint.x}
                            cy={chartData.lastPoint.y}
                            r="4.5"
                            fill={colors.point}
                            stroke={colors.stroke}
                            strokeWidth="2"
                          />
                        </svg>
                      ) : (
                        <div className="chart-empty-state">
                          Waiting for readings...
                        </div>
                      )}
                    </div>

                    <div className="chart-meta-row">
                      <div className="chart-meta-item">
                        <span>{summary.metricLabel}</span>
                        <strong>{summary.metricValue}</strong>
                      </div>

                      <div className="chart-meta-item">
                        <span>Threshold</span>
                        <strong>{summary.thresholdLabel}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================
            SENSOR DATA STATUS
        =================================================== */}

        {sensorData && (
          <div
            className={`sensor-success ${
              lockedAt && !autoReading ? "sensor-locked-success" : ""
            }`}
          >
            <div className="success-icon">
              {lockedAt && !autoReading ? "🔒" : "✓"}
            </div>

            <div className="success-info">
              <strong>
                {autoReading
                  ? stabilityStatus === "stable"
                    ? "Sensor readings are stable"
                    : "Live sensor monitoring is active"
                  : lockedAt && stabilityStatus === "stable"
                    ? "Stable sensor readings locked successfully"
                    : lockedAt
                      ? "Monitoring stopped before readings became stable"
                      : "Sensor data received"}
              </strong>

              <span>
                {autoReading
                  ? stabilityStatus === "stable"
                    ? "The last 10 readings are within the current stability limits. You can stop monitoring and lock the values."
                    : "Keep monitoring until the stability indicator becomes green."
                  : lockedAt && stabilityStatus === "stable"
                    ? "These readings are frozen and ready to be used for this inspection."
                    : lockedAt
                      ? "Start monitoring again and wait until the sensors become stable."
                      : "Valid sensor data is available."}
              </span>
            </div>

            <div
              className={`reading-indicator ${
                lockedAt && !autoReading ? "locked-indicator" : ""
              }`}
            >
              <span></span>

              {autoReading
                ? stabilityStatus === "stable"
                  ? "STABLE"
                  : "LIVE"
                : lockedAt && stabilityStatus === "stable"
                  ? "LOCKED"
                  : "STOPPED"}
            </div>
          </div>
        )}

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="sensor-actions">
          <div className="sensor-helper">
            {!scanResult.completed
              ? "Complete the Baseline → Sample sensor workflow first."
              : !sensorData
                ? "Sensor data is not available."
                : autoReading
                  ? "Sensor monitoring is still active. Wait until the sample stage is complete."
                  : reading
                    ? "Sensor reading is still in progress."
                    : !lockedAt
                      ? "Waiting for the final sample reading to be locked."
                      : stabilityStatus !== "stable"
                        ? "Final sample readings are not stable yet."
                        : "Sensor test complete. Baseline and sample data are ready for the Final Quality Report."}
          </div>

          <button
            className="continue-button"
            disabled={
              !scanResult.completed ||
              !scanResult.baseline ||
              !scanResult.sample ||
              !sensorData ||
              autoReading ||
              reading ||
              !lockedAt ||
              stabilityStatus !== "stable"
            }
            onClick={handleComplete}
          >
            Continue to Physical AI Analysis →
          </button>
        </div>
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`

        .sensor-analysis {
          margin-top: 30px;
        }


        .sensor-main-card {
          padding: 28px;

          border-radius: 28px;

          border:
            1px solid rgba(
              255,
              222,
              178,
              0.15
            );

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.095),
              rgba(255, 255, 255, 0.035)
            ),
            rgba(39, 22, 13, 0.78);

          backdrop-filter: blur(20px);

          box-shadow:
            0 25px 70px
              rgba(0, 0, 0, 0.3),
            inset 0 1px 0
              rgba(
                255,
                255,
                255,
                0.08
              );
        }


        /* ===================================================
           HEADER
        =================================================== */

        .sensor-heading {
          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          gap: 25px;

          margin-bottom: 25px;
        }


        .sensor-step-label {
          display: block;

          margin-bottom: 7px;

          color: #dfa15d;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 1.7px;
        }


        .sensor-heading h2 {
          margin: 0;

          color: #fff3e1;

          font-size: 28px;

          letter-spacing: -0.5px;
        }


        .sensor-heading p {
          max-width: 700px;

          margin: 9px 0 0;

          color:
            rgba(
              255,
              239,
              215,
              0.58
            );

          font-size: 14px;

          line-height: 1.6;
        }


        .header-status-area {
          display: flex;

          align-items: center;

          justify-content:
            flex-end;

          flex-wrap: wrap;

          gap: 8px;
        }


        .monitor-status-chip,
        .header-stability-chip {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding: 8px 12px;

          border-radius: 999px;

          font-size: 10px;

          font-weight: 850;
        }


        .monitor-status-chip {
          color:
            rgba(
              255,
              237,
              211,
              0.55
            );

          background:
            rgba(
              255,
              255,
              255,
              0.04
            );

          border:
            1px solid
              rgba(
                255,
                220,
                170,
                0.08
              );
        }


        .monitor-status-live {
          color: #a8e8b0;

          background:
            rgba(
              64,
              169,
              78,
              0.09
            );

          border-color:
            rgba(
              93,
              199,
              106,
              0.16
            );
        }


        .monitor-status-locked {
          color: #ffd59a;

          background:
            rgba(
              215,
              143,
              70,
              0.09
            );

          border-color:
            rgba(
              230,
              158,
              89,
              0.17
            );
        }


        .monitor-status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background:
            rgba(
              255,
              220,
              170,
              0.35
            );
        }


        .monitor-dot-live {
          background: #70d87e;

          box-shadow:
            0 0 10px #70d87e;

          animation:
            livePulse
            1.4s
            ease-in-out
            infinite;
        }


        .monitor-dot-locked {
          background: #e6a65f;
        }


        /* ===================================================
           HEADER STABILITY CHIP
        =================================================== */

        .header-stability-chip {
          border:
            1px solid transparent;
        }


        .header-stability-collecting {
          color: #ffd18c;

          background:
            rgba(
              215,
              145,
              52,
              0.09
            );

          border-color:
            rgba(
              229,
              160,
              69,
              0.15
            );
        }


        .header-stability-stabilizing {
          color: #ffbf82;

          background:
            rgba(
              213,
              112,
              46,
              0.1
            );

          border-color:
            rgba(
              224,
              128,
              60,
              0.17
            );
        }


        .header-stability-stable {
          color: #9ee7a8;

          background:
            rgba(
              61,
              168,
              76,
              0.1
            );

          border-color:
            rgba(
              92,
              199,
              105,
              0.18
            );
        }


        /* ===================================================
           TOOLBAR
        =================================================== */

        .sensor-toolbar {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          margin: 25px 0 18px;
        }


        .toolbar-title {
          display: block;

          color: #fff1dc;

          font-size: 16px;

          font-weight: 800;
        }


        .toolbar-description {
          display: block;

          margin-top: 4px;

          color:
            rgba(
              255,
              237,
              211,
              0.45
            );

          font-size: 12px;
        }


        .toolbar-actions {
          display: flex;

          align-items: center;

          gap: 9px;
        }


        /* ===================================================
           START / STOP BUTTON
        =================================================== */

        .monitor-toggle-button {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          padding: 11px 15px;

          border-radius: 13px;

          cursor: pointer;

          font-size: 11px;

          font-weight: 850;

          transition: 0.2s ease;
        }


        .start-monitor-button {
          color: #a9e8b1;

          background:
            rgba(
              64,
              169,
              78,
              0.1
            );

          border:
            1px solid
              rgba(
                96,
                199,
                108,
                0.18
              );
        }


        .start-monitor-button:hover {
          background:
            rgba(
              64,
              169,
              78,
              0.16
            );
        }


        .stop-monitor-button {
          color: #ffb1a7;

          background:
            rgba(
              195,
              63,
              52,
              0.11
            );

          border:
            1px solid
              rgba(
                224,
                87,
                74,
                0.2
              );
        }


        .stop-monitor-button:hover {
          background:
            rgba(
              195,
              63,
              52,
              0.17
            );
        }


        .play-symbol {
          font-size: 9px;
        }


        .stop-square {
          width: 8px;
          height: 8px;

          border-radius: 2px;

          background: #ef887d;
        }


        /* ===================================================
           SENSOR GRID
        =================================================== */

        .sensor-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 14px;
        }


        /* ===================================================
           ERROR
        =================================================== */

        .sensor-error {
          display: flex;

          align-items: flex-start;

          gap: 12px;

          margin-bottom: 18px;

          padding: 15px;

          border-radius: 16px;

          background:
            rgba(
              200,
              60,
              50,
              0.1
            );

          border:
            1px solid
              rgba(
                225,
                90,
                75,
                0.18
              );
        }


        .sensor-error-icon {
          width: 34px;
          height: 34px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          color: #ffaaa0;

          background:
            rgba(
              200,
              60,
              50,
              0.16
            );

          font-weight: 900;
        }


        .sensor-error strong {
          display: block;

          color: #ffaaa0;

          font-size: 12px;
        }


        .sensor-error span,
        .sensor-error small {
          display: block;

          margin-top: 4px;

          color:
            rgba(
              255,
              210,
              205,
              0.6
            );

          font-size: 11px;

          line-height: 1.5;
        }


        /* ===================================================
           STABILITY PANEL
        =================================================== */

        .stability-panel {
          display: grid;

          grid-template-columns:
            auto 1fr auto;

          align-items: center;

          gap: 14px;

          margin-top: 20px;

          padding: 17px;

          border-radius: 18px;

          transition:
            0.3s ease;
        }


        .stability-panel-collecting {
          background:
            rgba(
              194,
              130,
              52,
              0.08
            );

          border:
            1px solid
              rgba(
                218,
                153,
                70,
                0.14
              );
        }


        .stability-panel-stabilizing {
          background:
            rgba(
              196,
              94,
              40,
              0.08
            );

          border:
            1px solid
              rgba(
                224,
                125,
                63,
                0.16
              );
        }


        .stability-panel-stable {
          background:
            rgba(
              58,
              157,
              72,
              0.09
            );

          border:
            1px solid
              rgba(
                86,
                190,
                99,
                0.18
              );
        }


        .stability-main-icon {
          width: 42px;
          height: 42px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          font-weight: 950;
        }


        .stability-icon-collecting {
          color: #ffd18c;

          background:
            rgba(
              215,
              145,
              52,
              0.14
            );
        }


        .stability-icon-stabilizing {
          color: #ffb476;

          background:
            rgba(
              207,
              105,
              42,
              0.14
            );
        }


        .stability-icon-stable {
          color: #9ee7a8;

          background:
            rgba(
              62,
              167,
              76,
              0.15
            );
        }


        .stability-title-row {
          display: flex;

          align-items: center;

          gap: 8px;
        }


        .stability-content strong {
          color: #ffe7c5;

          font-size: 13px;
        }


        .stability-content p {
          margin: 5px 0 0;

          color:
            rgba(
              255,
              237,
              211,
              0.48
            );

          font-size: 11px;

          line-height: 1.5;
        }


        .stability-progress-track {
          height: 6px;

          margin-top: 10px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(
              255,
              255,
              255,
              0.07
            );
        }


        .stability-progress-fill {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #a96538,
              #ffd18b
            );

          transition:
            width
            0.35s ease;
        }


        .stability-badge {
          padding: 7px 10px;

          border-radius: 999px;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 0.8px;
        }


        .stability-badge-collecting {
          color: #ffd18c;

          background:
            rgba(
              215,
              145,
              52,
              0.1
            );
        }


        .stability-badge-stabilizing {
          color: #ffb476;

          background:
            rgba(
              207,
              105,
              42,
              0.1
            );
        }


        .stability-badge-stable {
          color: #9ee7a8;

          background:
            rgba(
              62,
              167,
              76,
              0.12
            );
        }


        .small-reading-spinner {
          width: 12px;
          height: 12px;

          border-radius: 50%;

          border:
            2px solid
              rgba(
                255,
                255,
                255,
                0.15
              );

          border-top-color:
            #ffd18c;

          animation:
            sensorSpin
            0.7s linear
            infinite;
        }

        /* ===================================================
           INDIVIDUAL STABILITY CHARTS
        =================================================== */

        .stability-chart-section {
          margin-top: 18px;
        }

        .stability-chart-header {
          margin-bottom: 12px;
        }

        .stability-chart-header strong {
          display: block;

          color: #ffe8c5;

          font-size: 14px;
        }

        .stability-chart-header p {
          margin: 6px 0 0;

          color: rgba(255, 237, 211, 0.48);

          font-size: 11px;

          line-height: 1.5;
        }

        .stability-chart-grid {
          display: grid;

          grid-template-columns: repeat(6, minmax(0, 1fr));

          gap: 12px;
        }

        .stability-chart-card {
          padding: 12px;

          border-radius: 18px;

          background: rgba(255, 255, 255, 0.035);

          border: 1px solid rgba(255, 220, 170, 0.08);

          min-width: 0;

          transition: 0.25s ease;
        }

        .stability-chart-card-collecting {
          background: rgba(214, 158, 78, 0.06);

          border-color: rgba(226, 177, 96, 0.14);
        }

        .stability-chart-card-stabilizing {
          background: rgba(214, 113, 55, 0.06);

          border-color: rgba(230, 138, 79, 0.14);
        }

        .stability-chart-card-stable {
          background: rgba(70, 171, 83, 0.07);

          border-color: rgba(92, 198, 106, 0.15);
        }

        .chart-card-top {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 10px;
        }

        .chart-sensor-name {
          color: #fff1dd;

          font-size: 12px;

          font-weight: 850;
        }

        .chart-sensor-description {
          margin-top: 3px;

          color: rgba(255, 237, 211, 0.42);

          font-size: 10px;

          line-height: 1.4;
        }

        .chart-status-badge {
          display: inline-flex;

          align-items: center;

          gap: 5px;

          padding: 5px 8px;

          border-radius: 999px;

          font-size: 9px;

          font-weight: 900;

          white-space: nowrap;
        }

        .chart-status-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;
        }

        .chart-status-collecting {
          color: #f1cc8c;

          background: rgba(226, 177, 96, 0.1);
        }

        .chart-status-collecting .chart-status-dot {
          background: #f1cc8c;
        }

        .chart-status-stabilizing {
          color: #ffb878;

          background: rgba(226, 125, 73, 0.11);
        }

        .chart-status-stabilizing .chart-status-dot {
          background: #ffb878;
        }

        .chart-status-stable {
          color: #9fe5a8;

          background: rgba(92, 198, 106, 0.12);
        }

        .chart-status-stable .chart-status-dot {
          background: #78dd88;

          box-shadow: 0 0 10px rgba(120, 221, 136, 0.5);
        }

        .chart-current-reading {
          display: flex;

          align-items: flex-end;

          gap: 5px;

          margin-top: 12px;
        }

        .chart-current-value {
          color: #fff4e4;

          font-size: 21px;

          font-weight: 900;

          line-height: 1;
        }

        .chart-current-unit {
          color: rgba(255, 237, 211, 0.5);

          font-size: 10px;

          font-weight: 700;

          padding-bottom: 2px;
        }

        .chart-box {
          height: 82px;

          margin-top: 10px;

          border-radius: 14px;

          overflow: hidden;

          background: rgba(0, 0, 0, 0.12);

          border: 1px solid rgba(255, 220, 170, 0.05);

          display: flex;

          align-items: center;

          justify-content: center;
        }

        .sensor-mini-chart {
          width: 100%;
          height: 100%;
          display: block;
        }

        .chart-base-line {
          stroke: rgba(255, 255, 255, 0.08);
          stroke-width: 1;
        }

        .chart-empty-state {
          color: rgba(255, 237, 211, 0.4);

          font-size: 11px;
        }

        .chart-meta-row {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 8px;

          margin-top: 10px;
        }

        .chart-meta-item {
          padding: 8px;

          border-radius: 12px;

          background: rgba(255, 255, 255, 0.04);

          border: 1px solid rgba(255, 220, 170, 0.05);
        }

        .chart-meta-item span {
          display: block;

          color: rgba(255, 237, 211, 0.42);

          font-size: 9px;

          margin-bottom: 4px;
        }

        .chart-meta-item strong {
          color: #ffe7c5;

          font-size: 11px;
        }

        /* ===================================================
           SUCCESS / LOCKED
        =================================================== */

        .sensor-success {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-top: 20px;

          padding: 15px;

          border-radius: 17px;

          background:
            rgba(
              62,
              166,
              76,
              0.08
            );

          border:
            1px solid
              rgba(
                92,
                196,
                105,
                0.15
              );
        }


        .sensor-locked-success {
          background:
            rgba(
              206,
              133,
              62,
              0.08
            );

          border-color:
            rgba(
              225,
              151,
              78,
              0.16
            );
        }


        .success-icon {
          width: 35px;
          height: 35px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          color: #a8e8b0;

          background:
            rgba(
              72,
              177,
              85,
              0.13
            );
        }


        .success-info {
          flex: 1;
        }


        .sensor-success strong {
          display: block;

          color: #c8edcc;

          font-size: 12px;
        }


        .sensor-success span {
          display: block;

          margin-top: 3px;

          color:
            rgba(
              210,
              239,
              214,
              0.5
            );

          font-size: 11px;

          line-height: 1.5;
        }


        .reading-indicator {
          display: flex;

          align-items: center;

          gap: 6px;

          color: #9de7a7;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .reading-indicator > span {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #6dd67b;

          box-shadow:
            0 0 10px #6dd67b;

          animation:
            livePulse
            1.3s
            ease-in-out
            infinite;
        }


        .locked-indicator {
          color: #e8ad68;
        }


        .locked-indicator > span {
          background: #e2a15a;

          box-shadow:
            0 0 9px
              rgba(
                226,
                161,
                90,
                0.5
              );

          animation: none;
        }


        /* ===================================================
           BOTTOM ACTIONS
        =================================================== */

        .sensor-actions {
          margin-top: 25px;

          padding-top: 22px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          border-top:
            1px solid
              rgba(
                255,
                221,
                177,
                0.09
              );
        }


        .sensor-helper {
          max-width: 620px;

          color:
            rgba(
              255,
              238,
              214,
              0.48
            );

          font-size: 12px;

          line-height: 1.5;
        }


        .continue-button {
          flex-shrink: 0;

          padding: 13px 18px;

          border: none;

          border-radius: 14px;

          color: #29160c;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d58b46,
              #9f582f
            );

          cursor: pointer;

          font-size: 13px;

          font-weight: 850;

          box-shadow:
            0 14px 30px
              rgba(
                200,
                119,
                56,
                0.18
              );

          transition:
            0.2s ease;
        }


        .continue-button:hover:not(:disabled) {
          transform:
            translateY(-2px);
        }


        .continue-button:disabled {
          opacity: 0.4;

          cursor: not-allowed;

          transform: none;
        }


        /* ===================================================
           ANIMATIONS
        =================================================== */

        @keyframes sensorSpin {

          to {
            transform:
              rotate(360deg);
          }

        }


        @keyframes livePulse {

          0%,
          100% {
            opacity: 0.45;

            transform:
              scale(0.85);
          }

          50% {
            opacity: 1;

            transform:
              scale(1.15);
          }

        }




        /* ===================================================
           LIGHT SENSOR ANALYSIS + DARK IMPORTED CARDS
           White/Cream outer area, espresso child cards
        =================================================== */

        .sensor-analysis {
          margin-top: 30px;
          color: #30231d;
        }

        .sensor-main-card {
          padding: 28px;
          border-radius: 26px;
          border: 1px solid rgba(90, 55, 38, 0.10);
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(197, 138, 77, 0.08),
              transparent 30%
            ),
            linear-gradient(
              180deg,
              #fffdf9 0%,
              #fbf6ef 100%
            );
          backdrop-filter: none;
          box-shadow:
            0 14px 34px rgba(43, 24, 18, 0.07),
            inset 0 1px 0 rgba(255,255,255,.90);
        }

        /* ---------- HEADER ---------- */

        .sensor-step-label {
          color: #8a5b3d;
        }

        .sensor-heading h2 {
          color: #2b1812;
          font-family: Georgia, "Times New Roman", serif;
        }

        .sensor-heading p {
          color: #75665d;
        }

        .monitor-status-chip {
          color: #75665d;
          background: #f7efe7;
          border-color: rgba(90,55,38,.09);
        }

        .monitor-status-dot {
          background: #b9a79a;
        }

        .monitor-status-live {
          color: #45694b;
          background: #edf4ed;
          border-color: #d5e5d7;
        }

        .monitor-dot-live {
          background: #628267;
          box-shadow: 0 0 10px rgba(98,130,103,.35);
        }

        .monitor-status-locked {
          color: #7a563d;
          background: #f3e7da;
          border-color: #e6d3bf;
        }

        .monitor-dot-locked {
          background: #b97843;
        }

        .header-stability-collecting {
          color: #816139;
          background: #f8efdf;
          border-color: #ead8b9;
        }

        .header-stability-stabilizing {
          color: #965d34;
          background: #f7e6d8;
          border-color: #e8cdb6;
        }

        .header-stability-stable {
          color: #44694a;
          background: #edf4ed;
          border-color: #d5e5d7;
        }

        /* ===================================================
           DARK IMPORTED DEVICE CARD
        =================================================== */

        .sensor-main-card .device-status-card {
          color: #fff2df !important;
          background:
            radial-gradient(
              circle at 96% 0%,
              rgba(217, 146, 70, 0.09),
              transparent 34%
            ),
            linear-gradient(
              145deg,
              #4a2b1f 0%,
              #382018 58%,
              #2a1710 100%
            ) !important;
          border: 1px solid rgba(255,222,178,.10) !important;
          box-shadow:
            0 10px 26px rgba(43,24,18,.13),
            inset 0 1px 0 rgba(255,255,255,.04) !important;
        }

        .sensor-main-card .device-icon {
          color: #2b170c !important;
          background:
            linear-gradient(
              145deg,
              #f3c66f,
              #d48a39
            ) !important;
          border-color: rgba(255,225,176,.18) !important;
        }

        .sensor-main-card .device-label {
          color: #dca467 !important;
        }

        .sensor-main-card .device-left strong {
          color: #fff3df !important;
        }

        .sensor-main-card .device-meta span {
          color: #ead3bc !important;
          background: rgba(255,255,255,.045) !important;
          border-color: rgba(255,222,178,.08) !important;
        }

        .sensor-main-card .device-meta small {
          color: rgba(255,226,194,.48) !important;
        }

        .sensor-main-card .device-connected {
          color: #a7e7ae !important;
          background: rgba(61,168,76,.11) !important;
          border-color: rgba(90,200,104,.18) !important;
        }

        .sensor-main-card .device-disconnected {
          color: #ffaaa0 !important;
          background: rgba(196,60,50,.11) !important;
          border-color: rgba(218,79,67,.18) !important;
        }

        /* ---------- SENSOR TOOLBAR ---------- */

        .toolbar-title {
          color: #34231c;
        }

        .toolbar-description {
          color: #84736a;
        }

        .start-monitor-button {
          color: #fff;
          background: #4f6f53;
          border-color: #4f6f53;
        }

        .start-monitor-button:hover {
          background: #456449;
        }

        .stop-monitor-button {
          color: #91463b;
          background: #fff0ed;
          border-color: #efcec8;
        }

        /* ===================================================
           DARK SENSOR METRIC CARDS
        =================================================== */

        .sensor-main-card .sensor-metric-card {
          min-height: 188px !important;
          border-radius: 18px !important;
          color: #fff2df !important;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(217,146,70,.07),
              transparent 36%
            ),
            linear-gradient(
              145deg,
              #4a2b1f 0%,
              #392119 60%,
              #2d1912 100%
            ) !important;
          border: 1px solid rgba(255,222,178,.10) !important;
          box-shadow:
            0 9px 24px rgba(43,24,18,.12),
            inset 0 1px 0 rgba(255,255,255,.035) !important;
        }

        .sensor-main-card .sensor-metric-card:hover {
          transform: translateY(-3px);
          border-color: rgba(239,181,112,.20) !important;
          box-shadow:
            0 13px 31px rgba(43,24,18,.16),
            inset 0 1px 0 rgba(255,255,255,.05) !important;
        }

        .sensor-main-card .sensor-icon {
          color: #ffe0a3 !important;
          background: rgba(221,149,77,.13) !important;
          border-color: rgba(255,210,150,.12) !important;
        }

        .sensor-main-card .sensor-name {
          color: #ead3bc !important;
        }

        .sensor-main-card .sensor-value-row strong {
          color: #fff4e1 !important;
        }

        .sensor-main-card .sensor-value-row span {
          color: #dca467 !important;
        }

        .sensor-main-card .sensor-metric-card p {
          color: rgba(255,239,214,.48) !important;
        }

        .sensor-main-card .sensor-measured {
          color: #a6e8ae !important;
          background: rgba(78,180,91,.12) !important;
          border-color: rgba(107,210,119,.18) !important;
        }

        .sensor-main-card .sensor-waiting {
          color: #ffd48f !important;
          background: rgba(222,153,55,.10) !important;
          border-color: rgba(237,168,74,.15) !important;
        }

        /* ===================================================
           DARK SENSOR SCAN WORKFLOW CARD
        =================================================== */

        .scan-workflow-dark-wrap {
          margin-top: 18px;
          padding: 12px;
          border-radius: 22px;
          color: #fff2df;
          background:
            radial-gradient(
              circle at 96% 0%,
              rgba(217,146,70,.07),
              transparent 34%
            ),
            linear-gradient(
              145deg,
              #46271c 0%,
              #351e16 58%,
              #28160f 100%
            );
          border: 1px solid rgba(255,222,178,.10);
          box-shadow:
            0 10px 28px rgba(43,24,18,.13),
            inset 0 1px 0 rgba(255,255,255,.04);
        }

        .scan-workflow-dark-wrap > * {
          margin-top: 0 !important;
        }

        /* ---------- ERROR / STABILITY STAY LIGHT ---------- */

        .sensor-error {
          color: #94443c;
          background: #fff0ed;
          border-color: #efcec8;
        }

        .sensor-error-icon {
          color: #94443c;
          background: #f8dfdb;
        }

        .sensor-error strong {
          color: #8f4037;
        }

        .sensor-error span,
        .sensor-error small {
          color: #866b65;
        }

        .stability-panel {
          border-radius: 16px;
        }

        .stability-panel-collecting {
          background: #f8efdf;
          border-color: #ead8b9;
        }

        .stability-panel-stabilizing {
          background: #f7e7da;
          border-color: #e8cdb6;
        }

        .stability-panel-stable {
          background: #edf4ed;
          border-color: #d5e5d7;
        }

        .stability-content strong {
          color: #3a2921;
        }

        .stability-content p {
          color: #77665d;
        }

        .stability-progress-track {
          background: rgba(90,55,38,.09);
        }

        .stability-progress-fill {
          background:
            linear-gradient(
              90deg,
              #9a6338,
              #c58a4d
            );
        }

        /* ---------- CHARTS LIGHT ---------- */

        .stability-chart-header strong {
          color: #34231c;
        }

        .stability-chart-header p {
          color: #7d6d63;
        }

        .stability-chart-card {
          background: #fffdf9;
          border-color: rgba(90,55,38,.09);
          box-shadow: 0 6px 18px rgba(43,24,18,.035);
        }

        .stability-chart-card-collecting {
          background: #fcf6ec;
          border-color: #ead8b9;
        }

        .stability-chart-card-stabilizing {
          background: #fbf0e8;
          border-color: #e8cdb6;
        }

        .stability-chart-card-stable {
          background: #f2f7f2;
          border-color: #d5e5d7;
        }

        .chart-sensor-name,
        .chart-current-value {
          color: #34231c;
        }

        .chart-sensor-description {
          color: #8a796e;
        }

        .chart-current-unit {
          color: #9a6338;
        }

        .chart-box,
        .chart-meta-item {
          background: #f7f1ea;
          border-color: rgba(90,55,38,.07);
        }

        .chart-base-line {
          stroke: rgba(90,55,38,.12);
        }

        .chart-empty-state,
        .chart-meta-item span {
          color: #97877d;
        }

        .chart-meta-item strong {
          color: #4a372e;
        }

        /* ---------- SUCCESS / ACTION ---------- */

        .sensor-success {
          background: #edf4ed;
          border-color: #d5e5d7;
        }

        .sensor-locked-success {
          background: #f6eadc;
          border-color: #e6d3bf;
        }

        .sensor-success strong {
          color: #3f6345;
        }

        .sensor-success span {
          color: #657267;
        }

        .sensor-locked-success strong {
          color: #6d4934;
        }

        .sensor-locked-success span {
          color: #7c685b;
        }

        .sensor-actions {
          border-top-color: rgba(90,55,38,.09);
        }

        .sensor-helper {
          color: #78685f;
        }

        .continue-button {
          min-height: 46px;
          color: #fffaf3;
          background:
            linear-gradient(
              135deg,
              #5a3726,
              #7a4b33,
              #a86c40
            );
          box-shadow: 0 11px 24px rgba(43,24,18,.16);
        }

        .continue-button:disabled {
          color: #a49388;
          background: #e8ddd2;
          box-shadow: none;
          opacity: 1;
        }

        @media (max-width: 620px) {
          .sensor-main-card {
            padding: 18px;
          }

          .scan-workflow-dark-wrap {
            padding: 8px;
          }
        }




        /* ===================================================
           FINAL DARK CARD FIX
           Keep outer Sensor Analysis light, but make all
           internal status / stability / chart cards espresso.
        =================================================== */

        /* Collecting / Stabilizing / Stable main panel */
        .stability-panel {
          border: 1px solid rgba(255, 222, 178, 0.10) !important;

          background:
            radial-gradient(
              circle at 96% 0%,
              rgba(217, 146, 70, 0.07),
              transparent 34%
            ),
            linear-gradient(
              145deg,
              #48291d 0%,
              #382018 58%,
              #2b1811 100%
            ) !important;

          box-shadow:
            0 9px 24px rgba(43, 24, 18, 0.12),
            inset 0 1px 0 rgba(255,255,255,.035);
        }

        .stability-panel-collecting {
          border-color: rgba(232, 174, 104, 0.16) !important;
        }

        .stability-panel-stabilizing {
          border-color: rgba(224, 125, 63, 0.17) !important;
        }

        .stability-panel-stable {
          border-color: rgba(95, 183, 107, 0.18) !important;
        }

        .stability-content strong {
          color: #fff0dc !important;
        }

        .stability-content p {
          color: rgba(255, 237, 211, 0.52) !important;
        }

        .stability-icon-collecting {
          color: #ffd18c !important;
          background: rgba(215,145,52,.14) !important;
        }

        .stability-icon-stabilizing {
          color: #ffb476 !important;
          background: rgba(207,105,42,.14) !important;
        }

        .stability-icon-stable {
          color: #9ee7a8 !important;
          background: rgba(62,167,76,.15) !important;
        }

        .stability-badge-collecting {
          color: #ffd18c !important;
          background: rgba(215,145,52,.11) !important;
        }

        .stability-badge-stabilizing {
          color: #ffb476 !important;
          background: rgba(207,105,42,.11) !important;
        }

        .stability-badge-stable {
          color: #9ee7a8 !important;
          background: rgba(62,167,76,.13) !important;
        }

        .stability-progress-track {
          background: rgba(255,255,255,.075) !important;
        }

        .stability-progress-fill {
          background:
            linear-gradient(
              90deg,
              #a96538,
              #e8ad64,
              #ffd18b
            ) !important;
        }

        /* Section title remains dark because it sits on light outer background */
        .stability-chart-header strong {
          color: #34231c !important;
        }

        .stability-chart-header p {
          color: #7d6d63 !important;
        }

        /* All 6 individual sensor stability cards */
        .stability-chart-card {
          color: #fff2df !important;

          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(217,146,70,.065),
              transparent 38%
            ),
            linear-gradient(
              145deg,
              #492a1e 0%,
              #392119 60%,
              #2c1912 100%
            ) !important;

          border:
            1px solid rgba(255, 222, 178, 0.10) !important;

          box-shadow:
            0 9px 24px rgba(43, 24, 18, 0.115),
            inset 0 1px 0 rgba(255,255,255,.035) !important;
        }

        .stability-chart-card:hover {
          transform: translateY(-3px);

          border-color:
            rgba(235, 177, 108, 0.20) !important;

          box-shadow:
            0 13px 30px rgba(43,24,18,.16),
            inset 0 1px 0 rgba(255,255,255,.045) !important;
        }

        .stability-chart-card-collecting {
          background:
            linear-gradient(
              145deg,
              #4b2b1e,
              #392119,
              #2c1912
            ) !important;

          border-color:
            rgba(226, 177, 96, 0.18) !important;
        }

        .stability-chart-card-stabilizing {
          background:
            linear-gradient(
              145deg,
              #4b281c,
              #392018,
              #2b1811
            ) !important;

          border-color:
            rgba(230, 138, 79, 0.18) !important;
        }

        .stability-chart-card-stable {
          background:
            linear-gradient(
              145deg,
              #3e2a20,
              #30231a,
              #281a14
            ) !important;

          border-color:
            rgba(92, 190, 103, 0.19) !important;
        }

        .chart-sensor-name {
          color: #fff1de !important;
        }

        .chart-sensor-description {
          color: rgba(255, 237, 211, 0.48) !important;
        }

        .chart-current-value {
          color: #fff4e2 !important;
        }

        .chart-current-unit {
          color: #e0a565 !important;
        }

        .chart-status-collecting {
          color: #ffd18c !important;
          background: rgba(215,145,52,.12) !important;
        }

        .chart-status-stabilizing {
          color: #ffb476 !important;
          background: rgba(207,105,42,.12) !important;
        }

        .chart-status-stable {
          color: #9ee7a8 !important;
          background: rgba(62,167,76,.13) !important;
        }

        .chart-status-collecting .chart-status-dot {
          background: #e7ad62 !important;
        }

        .chart-status-stabilizing .chart-status-dot {
          background: #dc824c !important;
        }

        .chart-status-stable .chart-status-dot {
          background: #70d87e !important;
        }

        /* Graph area */
        .chart-box {
          background:
            rgba(0, 0, 0, 0.17) !important;

          border:
            1px solid rgba(255, 220, 170, 0.075) !important;
        }

        .chart-base-line {
          stroke: rgba(255, 220, 170, 0.12) !important;
        }

        .chart-empty-state {
          color: rgba(255, 237, 211, 0.39) !important;
        }

        /* Variation / Threshold cards */
        .chart-meta-item {
          background:
            rgba(255, 255, 255, 0.045) !important;

          border:
            1px solid rgba(255, 220, 170, 0.075) !important;
        }

        .chart-meta-item span {
          color: rgba(255, 237, 211, 0.42) !important;
        }

        .chart-meta-item strong {
          color: #f3d3aa !important;
        }

        /* Bottom live / locked sensor status card */
        .sensor-success {
          color: #d5edd8 !important;

          background:
            linear-gradient(
              145deg,
              #3b2a20,
              #2e2119
            ) !important;

          border:
            1px solid rgba(95, 183, 107, 0.18) !important;

          box-shadow:
            0 8px 22px rgba(43,24,18,.10);
        }

        .sensor-success strong {
          color: #bcebc2 !important;
        }

        .sensor-success span {
          color: rgba(211,239,215,.58) !important;
        }

        .sensor-locked-success {
          background:
            linear-gradient(
              145deg,
              #42291c,
              #302019
            ) !important;

          border-color:
            rgba(230,158,89,.18) !important;
        }

        .sensor-locked-success strong {
          color: #f1c892 !important;
        }

        .sensor-locked-success span {
          color: rgba(255,225,190,.56) !important;
        }


        /* ===================================================
           RESPONSIVE
        =================================================== */

        @media (
          max-width: 900px
        ) {

          .sensor-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }


        @media (
          max-width: 700px
        ) {

          .sensor-heading,
          .sensor-toolbar,
          .sensor-actions {
            flex-direction:
              column;

            align-items:
              stretch;
          }


          .header-status-area {
            justify-content:
              flex-start;
          }


          .toolbar-actions {
            width: 100%;
          }


          .toolbar-actions button {
            width: 100%;
          }

        }


        @media (
          max-width: 620px
        ) {

          .sensor-main-card {
            padding: 18px;

            border-radius: 22px;
          }


          .sensor-grid {
            grid-template-columns:
              1fr;
          }


          .stability-panel {
            grid-template-columns:
              auto 1fr;
          }


          .stability-badge {
            grid-column:
              1 / -1;

            width:
              fit-content;
          }


          .continue-button {
            width: 100%;
          }


          .sensor-success {
            align-items:
              flex-start;
          }

        }

      `}</style>
    </section>
  );
}

export default SensorAnalysis;
