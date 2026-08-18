import { useEffect, useRef, useState } from "react";

// =========================================================
// CONFIGURATION
// =========================================================

// Coffee beans දාලා Scan Now click කරපු පස්සේ
// stability checking start කරන්න කලින් wait කරන කාලය.
const SAMPLE_EXPOSURE_TIME = 1;

// =========================================================
// SENSOR QUALITY SCORING
// =========================================================
//
// IMPORTANT:
// These thresholds mirror the current backend quality-report
// sensor scoring logic so Step 1 shows the same score/status
// that will later appear in the Final Quality Report.
//
// They are research-defined experimental thresholds, not an
// official coffee-industry grading standard.
// =========================================================

const MQ2_GOOD_MAX = 44;
const MQ2_BAD_THRESHOLD = 73;
const MQ2_BAD_MAX = 277;

const MQ135_GOOD_MAX = 15;
const MQ135_BAD_THRESHOLD = 22.5;
const MQ135_BAD_MAX = 103;

function SensorScanWorkflow({
  sensorData,
  stabilityStatus,
  autoReading,
  reading,
  handleToggleMonitoring,
  resetStabilityTracking,
  onWorkflowChange,
}) {
  // =========================================================
  // WORKFLOW STAGES
  // =========================================================

  /*
    idle

    baseline-monitoring
    baseline-complete

    sample-exposure
    sample-monitoring
    sample-complete

    recovery-monitoring

    complete
  */

  const [stage, setStage] = useState("idle");

  // =========================================================
  // CAPTURED SENSOR DATA
  // =========================================================

  const [baselineData, setBaselineData] = useState(null);

  const [sampleData, setSampleData] = useState(null);

  const [recoveryData, setRecoveryData] = useState(null);

  // =========================================================
  // CAPTURE TIMES
  // =========================================================

  const [baselineTime, setBaselineTime] = useState(null);

  const [sampleTime, setSampleTime] = useState(null);

  const [recoveryTime, setRecoveryTime] = useState(null);

  // =========================================================
  // SAMPLE EXPOSURE TIMER
  // =========================================================

  const [exposureTimeLeft, setExposureTimeLeft] =
    useState(SAMPLE_EXPOSURE_TIME);

  // =========================================================
  // SEND WORKFLOW DATA TO PARENT SENSOR ANALYSIS
  // =========================================================

  useEffect(() => {
    if (!onWorkflowChange) {
      return;
    }

    onWorkflowChange({
      stage,

      baseline: baselineData,
      sample: sampleData,
      recovery: recoveryData,

      baselineCapturedAt: baselineTime?.toISOString?.() || null,
      sampleCapturedAt: sampleTime?.toISOString?.() || null,
      recoveryCapturedAt: recoveryTime?.toISOString?.() || null,

      completed: stage === "complete",
    });
  }, [
    stage,
    baselineData,
    sampleData,
    recoveryData,
    baselineTime,
    sampleTime,
    recoveryTime,
    onWorkflowChange,
  ]);

  // =========================================================
  // REFS
  // =========================================================

  /*
    Stable status එක render වෙනකොට
    එකම reading එක multiple times capture
    වෙන එක prevent කරනවා.
  */
  const captureLockRef = useRef(false);

  // =========================================================
  // RESET CAPTURE LOCK
  // =========================================================

  useEffect(() => {
    captureLockRef.current = false;
  }, [stage]);

  // =========================================================
  // AUTOMATIC STABLE READING CAPTURE
  // =========================================================

  useEffect(() => {
    /*
      Reading capture කරන්න conditions:

      1. Live monitoring active
      2. Stability status = stable
      3. Sensor data available
      4. Current stage monitoring stage එකක්
      5. Already capture කරලා නැහැ
    */

    if (!autoReading) {
      return;
    }

    if (stabilityStatus !== "stable") {
      return;
    }

    if (!sensorData) {
      return;
    }

    if (captureLockRef.current) {
      return;
    }

    /*
      IMPORTANT:

      sample-exposure මෙතන නැහැ.

      ඒ නිසා 120 seconds exposure period
      ඇතුළත sensors stable වුණත්
      sample automatically capture වෙන්නේ නැහැ.
    */
    const monitoringStages = [
      "baseline-monitoring",
      "sample-monitoring",
      "recovery-monitoring",
    ];

    if (!monitoringStages.includes(stage)) {
      return;
    }

    // Duplicate capture prevent
    captureLockRef.current = true;

    // Current stable sensor snapshot
    const capturedReading = {
      ...sensorData,
    };

    const capturedTime = new Date();

    // =====================================================
    // 1. BASELINE CAPTURE
    // =====================================================

    if (stage === "baseline-monitoring") {
      setBaselineData(capturedReading);

      setBaselineTime(capturedTime);

      /*
        Baseline stable වුණා.
        Live monitoring automatically stop කරනවා.
      */
      

      setStage("baseline-complete");

      return;
    }

    // =====================================================
    // 2. SAMPLE CAPTURE
    // =====================================================

    if (stage === "sample-monitoring") {
      setSampleData(capturedReading);

      setSampleTime(capturedTime);

      /*
        Sample stable වුණා.
        Monitoring stop කරනවා.
      */
      

      setStage("sample-complete");

      return;
    }

    // =====================================================
    // 3. RECOVERY CAPTURE
    // =====================================================

    if (stage === "recovery-monitoring") {
      setRecoveryData(capturedReading);

      setRecoveryTime(capturedTime);

      /*
        Recovery stable වුණා.
        Monitoring stop කරනවා.
      */
      handleToggleMonitoring();

      setStage("complete");
    }
  }, [stabilityStatus, sensorData, autoReading, stage, handleToggleMonitoring]);

  // =========================================================
  // START TASK
  // =========================================================

  const handleStartTask = () => {
    /*
      New sample test එකක් start කරන නිසා
      old data clear කරනවා.
    */

    setBaselineData(null);

    setSampleData(null);

    setRecoveryData(null);

    setBaselineTime(null);

    setSampleTime(null);

    setRecoveryTime(null);

    setExposureTimeLeft(SAMPLE_EXPOSURE_TIME);

    captureLockRef.current = false;

    /*
      Stability history reset කරනවා.
    */
    if (resetStabilityTracking) {
      resetStabilityTracking();
    }

    setStage("baseline-monitoring");

    /*
      Parent SensorAnalysis live monitoring
      START කරනවා.
    */
    if (!autoReading) {
      handleToggleMonitoring();
    }
  };

  // =========================================================
  // SCAN NOW
  // =========================================================

  const handleScanNow = () => {
    if (stage !== "baseline-complete") {
      return;
    }

    captureLockRef.current = false;

    /*
      120-second exposure countdown
      නැවත reset කරනවා.
    */
    setExposureTimeLeft(SAMPLE_EXPOSURE_TIME);

    /*
      IMPORTANT:

      Sample-monitoring stage එකට
      immediately යන්නේ නැහැ.

      මුලින් sample-exposure.
    */
    setStage("sample-exposure");

    /*
      Live sensor values පෙන්වනවා.

      Stability status exposure period
      එක ඇතුළත capture සඳහා use කරන්නේ නැහැ.
    */
    if (!autoReading) {
      handleToggleMonitoring();
    }
  };

  // =========================================================
  // SAMPLE EXPOSURE COUNTDOWN
  // =========================================================

  useEffect(() => {
    if (stage !== "sample-exposure") {
      return;
    }

    // -----------------------------------------------------
    // COUNTDOWN COMPLETE
    // -----------------------------------------------------

    if (exposureTimeLeft <= 0) {
      /*
        120 seconds ඇතුළත collect වුණු
        old stability readings remove කරනවා.

        දැන් ඉඳලා අලුත් readings 10ක්
        collect කරලා stability check කරනවා.
      */
      if (resetStabilityTracking) {
        resetStabilityTracking();
      }

      captureLockRef.current = false;

      /*
        දැන් තමයි real sample stability
        checking stage එක start වෙන්නේ.
      */
      setStage("sample-monitoring");

      return;
    }

    // -----------------------------------------------------
    // COUNT DOWN EVERY SECOND
    // -----------------------------------------------------

    const timer = setTimeout(() => {
      setExposureTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [stage, exposureTimeLeft, resetStabilityTracking]);

  // =========================================================
  // END TASK
  // =========================================================

  const handleEndTask = () => {
    if (stage !== "sample-complete") {
      return;
    }

    captureLockRef.current = false;

    /*
      Recovery stage එකට කලින්
      previous sample stability history
      remove කරනවා.
    */
    if (resetStabilityTracking) {
      resetStabilityTracking();
    }

    setStage("recovery-monitoring");

    /*
      Live monitoring START
    */
    if (!autoReading) {
      handleToggleMonitoring();
    }
  };

  // =========================================================
  // NEW TEST
  // =========================================================

  const handleNewTest = () => {
    /*
      Monitoring තව active නම් stop කරනවා.
    */
    if (autoReading) {
      handleToggleMonitoring();
    }

    if (resetStabilityTracking) {
      resetStabilityTracking();
    }

    setStage("idle");

    setBaselineData(null);

    setSampleData(null);

    setRecoveryData(null);

    setBaselineTime(null);

    setSampleTime(null);

    setRecoveryTime(null);

    setExposureTimeLeft(SAMPLE_EXPOSURE_TIME);

    captureLockRef.current = false;
  };

  // =========================================================
  // CALCULATE DIFFERENCE
  // =========================================================

  /*
    Sample Response

    Sample - Baseline
  */

  const calculateDifference = (sample, baseline, decimals = 0) => {
    if (
      sample === null ||
      sample === undefined ||
      baseline === null ||
      baseline === undefined
    ) {
      return "--";
    }

    const difference = Number(sample) - Number(baseline);

    if (decimals > 0) {
      return difference >= 0
        ? `+${difference.toFixed(decimals)}`
        : difference.toFixed(decimals);
    }

    return difference >= 0
      ? `+${Math.round(difference)}`
      : `${Math.round(difference)}`;
  };

  // =========================================================
  // RECOVERY DIFFERENCE
  // =========================================================

  /*
    Recovery Error

    Recovery - Baseline
  */

  const calculateRecoveryDifference = (recovery, baseline, decimals = 0) => {
    if (
      recovery === null ||
      recovery === undefined ||
      baseline === null ||
      baseline === undefined
    ) {
      return "--";
    }

    const difference = Number(recovery) - Number(baseline);

    if (decimals > 0) {
      return difference >= 0
        ? `+${difference.toFixed(decimals)}`
        : difference.toFixed(decimals);
    }

    return difference >= 0
      ? `+${Math.round(difference)}`
      : `${Math.round(difference)}`;
  };

  // =========================================================
  // FORMAT VALUE
  // =========================================================

  const formatValue = (value, decimals = 0) => {
    if (value === null || value === undefined) {
      return "--";
    }

    if (decimals > 0) {
      return Number(value).toFixed(decimals);
    }

    return value;
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
  // SENSOR QUALITY ASSESSMENT
  // =========================================================

  const clampScore = (value) => {
    return Math.max(0, Math.min(100, Number(value)));
  };

  const calculateNumericDifference = (sample, baseline) => {
    if (
      sample === null ||
      sample === undefined ||
      baseline === null ||
      baseline === undefined
    ) {
      return null;
    }

    const sampleValue = Number(sample);
    const baselineValue = Number(baseline);

    if (!Number.isFinite(sampleValue) || !Number.isFinite(baselineValue)) {
      return null;
    }

    return Number((sampleValue - baselineValue).toFixed(2));
  };

  const calculateMq2Score = (response) => {
    if (response === null || response === undefined) {
      return null;
    }

    const value = Number(response);

    if (!Number.isFinite(value)) {
      return null;
    }

    if (value <= MQ2_GOOD_MAX) {
      return 100;
    }

    if (value < MQ2_BAD_THRESHOLD) {
      const score =
        100 -
        (30 * (value - MQ2_GOOD_MAX)) /
          (MQ2_BAD_THRESHOLD - MQ2_GOOD_MAX);

      return Number(clampScore(score).toFixed(2));
    }

    const score =
      (70 * (MQ2_BAD_MAX - value)) /
      (MQ2_BAD_MAX - MQ2_BAD_THRESHOLD);

    return Number(clampScore(score).toFixed(2));
  };

  const calculateMq135Score = (response) => {
    if (response === null || response === undefined) {
      return null;
    }

    const value = Number(response);

    if (!Number.isFinite(value)) {
      return null;
    }

    if (value <= MQ135_GOOD_MAX) {
      return 100;
    }

    if (value < MQ135_BAD_THRESHOLD) {
      const score =
        100 -
        (30 * (value - MQ135_GOOD_MAX)) /
          (MQ135_BAD_THRESHOLD - MQ135_GOOD_MAX);

      return Number(clampScore(score).toFixed(2));
    }

    const score =
      (70 * (MQ135_BAD_MAX - value)) /
      (MQ135_BAD_MAX - MQ135_BAD_THRESHOLD);

    return Number(clampScore(score).toFixed(2));
  };

  const mq2QualityResponse = calculateNumericDifference(
    sampleData?.mq2,
    baselineData?.mq2,
  );

  const mq135QualityResponse = calculateNumericDifference(
    sampleData?.mq135,
    baselineData?.mq135,
  );

  const mq2QualityScore = calculateMq2Score(mq2QualityResponse);

  const mq135QualityScore = calculateMq135Score(mq135QualityResponse);

  const availablePrimaryScores = [mq2QualityScore, mq135QualityScore].filter(
    (score) => score !== null && score !== undefined,
  );

  const sensorQualityScore = availablePrimaryScores.length
    ? Number(
        (
          availablePrimaryScores.reduce((total, score) => total + score, 0) /
          availablePrimaryScores.length
        ).toFixed(2),
      )
    : 0;

  const getSensorQualityStatus = () => {
    if (mq2QualityResponse === null || mq135QualityResponse === null) {
      return "REVIEW";
    }

    if (
      mq2QualityResponse < MQ2_BAD_THRESHOLD &&
      mq135QualityResponse < MQ135_BAD_THRESHOLD
    ) {
      return "GOOD";
    }

    if (
      mq2QualityResponse >= MQ2_BAD_THRESHOLD &&
      mq135QualityResponse >= MQ135_BAD_THRESHOLD
    ) {
      return "BAD";
    }

    return "REVIEW";
  };

  const sensorQualityStatus = getSensorQualityStatus();

  const formatQualityNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      return "--";
    }

    const numericValue = Number(value);

    if (Number.isInteger(numericValue)) {
      return numericValue.toString();
    }

    return numericValue.toFixed(decimals);
  };

  // =========================================================
  // GET ACTIVE STAGE
  // =========================================================

  const getActiveStage = () => {
    if (stage === "idle" || stage === "baseline-monitoring") {
      return 1;
    }

    if (
      stage === "baseline-complete" ||
      stage === "sample-exposure" ||
      stage === "sample-monitoring"
    ) {
      return 2;
    }

    return 3;
  };

  const activeStage = getActiveStage();

  // =========================================================
  // EXPOSURE PROGRESS
  // =========================================================

  const exposureProgress = Math.min(
    100,
    Math.max(
      0,
      ((SAMPLE_EXPOSURE_TIME - exposureTimeLeft) / SAMPLE_EXPOSURE_TIME) * 100,
    ),
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="scan-workflow">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="scan-workflow-header">
        <div>
          <span className="scan-section-label">SAMPLE TEST WORKFLOW</span>

          <h3>Coffee Bean Sensor Scan</h3>

          <p>
            Capture the empty baseline, expose the sensors to the coffee bean
            sample, scan the stable sample response, and verify sensor recovery
            after removing the beans.
          </p>
        </div>

        <span
          className={`scan-task-status ${
            stage === "complete" ? "scan-task-complete" : ""
          }`}
        >
          {stage === "complete"
            ? "✓ Task Complete"
            : stage === "idle"
              ? "Ready"
              : "Task Running"}
        </span>
      </div>

      {/* =====================================================
          THREE STAGES
      ===================================================== */}

      <div className="scan-stage-grid">
        {/* ===================================================
            STAGE 1 - BASELINE
        =================================================== */}

        <div
          className={`scan-stage-card ${
            activeStage === 1
              ? "scan-stage-active"
              : baselineData
                ? "scan-stage-finished"
                : ""
          }`}
        >
          <div className="scan-stage-number">{baselineData ? "✓" : "1"}</div>

          <div>
            <strong>Baseline</strong>

            <span>Empty chamber</span>
          </div>
        </div>

        {/* ===================================================
            STAGE 2 - SAMPLE
        =================================================== */}

        <div
          className={`scan-stage-card ${
            activeStage === 2
              ? "scan-stage-active"
              : sampleData
                ? "scan-stage-finished"
                : ""
          }`}
        >
          <div className="scan-stage-number">{sampleData ? "✓" : "2"}</div>

          <div>
            <strong>Sample Scan</strong>

            <span>Coffee beans inside</span>
          </div>
        </div>

        {/* ===================================================
            STAGE 3 - RECOVERY
        =================================================== */}

        <div
          className={`scan-stage-card ${
            activeStage === 3
              ? "scan-stage-active"
              : recoveryData
                ? "scan-stage-finished"
                : ""
          }`}
        >
          <div className="scan-stage-number">{recoveryData ? "✓" : "3"}</div>

          <div>
            <strong>Recovery</strong>

            <span>Beans removed</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          CURRENT STAGE CONTENT
      ===================================================== */}

      <div className="scan-stage-content">
        {/* ===================================================
            IDLE
        =================================================== */}

        {stage === "idle" && (
          <div className="scan-instruction">
            <div className="scan-instruction-icon">1</div>

            <div className="scan-instruction-text">
              <strong>Prepare the empty test chamber</strong>

              <span>
                Make sure no coffee beans are inside the chamber. Start the task
                to collect a stable baseline reading.
              </span>
            </div>

            <button
              className="scan-primary-button"
              onClick={handleStartTask}
              disabled={reading}
            >
              ▶ Start Task
            </button>
          </div>
        )}

        {/* ===================================================
            BASELINE MONITORING
        =================================================== */}

        {stage === "baseline-monitoring" && (
          <div className="scan-monitoring-box">
            <div className="scan-monitoring-left">
              <div className="scan-pulse">
                <span></span>
              </div>

              <div>
                <strong>Collecting Baseline</strong>

                <span>
                  Waiting until the empty-chamber sensor readings become stable.
                </span>
              </div>
            </div>

            <div className={`scan-stability-state scan-${stabilityStatus}`}>
              {stabilityStatus === "stable"
                ? "✓ Stable"
                : stabilityStatus === "stabilizing"
                  ? "● Stabilizing..."
                  : "● Collecting..."}
            </div>
          </div>
        )}

        {/* ===================================================
            BASELINE COMPLETE
        =================================================== */}

        {stage === "baseline-complete" && (
          <>
            <div className="scan-success-box">
              <div className="scan-success-icon">✓</div>

              <div>
                <strong>Baseline Captured</strong>

                <span>
                  Stable empty-chamber reading captured at{" "}
                  {formatTime(baselineTime)}.
                </span>
              </div>
            </div>

            <div className="scan-instruction">
              <div className="scan-instruction-icon">2</div>

              <div className="scan-instruction-text">
                <strong>Place the coffee bean sample</strong>

                <span>
                  Put the coffee beans inside the chamber and close the lid.
                  Then click Scan Now to begin the 120-second sample exposure
                  period.
                </span>
              </div>

              <button
                className="scan-primary-button"
                onClick={handleScanNow}
                disabled={reading}
              >
                Scan Now →
              </button>
            </div>
          </>
        )}

        {/* ===================================================
            SAMPLE EXPOSURE - 120 SECOND COUNTDOWN
        =================================================== */}

        {stage === "sample-exposure" && (
          <div className="sample-exposure-wrapper">
            <div className="sample-exposure-box">
              <div className="exposure-left">
                <div className="exposure-icon">⏱</div>

                <div>
                  <strong>Sample Exposure in Progress</strong>

                  <span>
                    The coffee bean sample is interacting with the sensors.
                    Stability analysis will start automatically when the
                    exposure timer reaches zero.
                  </span>
                </div>
              </div>

              <div className="exposure-timer">
                <strong>{exposureTimeLeft}</strong>

                <span>seconds</span>
              </div>
            </div>

            {/* EXPOSURE PROGRESS */}

            <div className="exposure-progress">
              <div
                className="exposure-progress-fill"
                style={{
                  width: `${exposureProgress}%`,
                }}
              ></div>
            </div>

            <div className="exposure-note">
              <span className="exposure-live-dot"></span>
              Live sensor values are being monitored. These exposure readings
              are not used for final stability validation.
            </div>
          </div>
        )}

        {/* ===================================================
            SAMPLE STABILITY MONITORING
        =================================================== */}

        {stage === "sample-monitoring" && (
          <div className="scan-monitoring-box">
            <div className="scan-monitoring-left">
              <div className="scan-pulse">
                <span></span>
              </div>

              <div>
                <strong>Checking Sample Stability</strong>

                <span>
                  The 120-second exposure is complete. New sensor readings are
                  now being collected for sample stability validation.
                </span>
              </div>
            </div>

            <div className={`scan-stability-state scan-${stabilityStatus}`}>
              {stabilityStatus === "stable"
                ? "✓ Stable"
                : stabilityStatus === "stabilizing"
                  ? "● Stabilizing..."
                  : "● Collecting..."}
            </div>
          </div>
        )}

        {/* ===================================================
            SAMPLE COMPLETE
        =================================================== */}

        {stage === "sample-complete" && (
          <>
            <div className="scan-success-box">
              <div className="scan-success-icon">✓</div>

              <div>
                <strong>Sample Scan Complete</strong>

                <span>
                  Stable coffee bean sample reading captured at{" "}
                  {formatTime(sampleTime)}.
                </span>
              </div>
            </div>

            <div className="scan-instruction">
              <div className="scan-instruction-icon">3</div>

              <div className="scan-instruction-text">
                <strong>Remove the coffee beans</strong>

                <span>
                  Remove the coffee bean sample from the chamber. Then click End
                  Task to start the sensor recovery measurement.
                </span>
              </div>

              <button
                className="scan-primary-button"
                onClick={handleEndTask}
                disabled={reading}
              >
                End Task →
              </button>
            </div>
          </>
        )}

        {/* ===================================================
            RECOVERY MONITORING
        =================================================== */}

        {stage === "recovery-monitoring" && (
          <div className="scan-monitoring-box">
            <div className="scan-monitoring-left">
              <div className="scan-pulse">
                <span></span>
              </div>

              <div>
                <strong>Checking Sensor Recovery</strong>

                <span>
                  Waiting for sensor readings to stabilize after removing the
                  coffee bean sample.
                </span>
              </div>
            </div>

            <div className={`scan-stability-state scan-${stabilityStatus}`}>
              {stabilityStatus === "stable"
                ? "✓ Stable"
                : stabilityStatus === "stabilizing"
                  ? "● Recovering..."
                  : "● Collecting..."}
            </div>
          </div>
        )}

        {/* ===================================================
            TEST COMPLETE
        =================================================== */}

        {stage === "complete" && (
          <>
            <div className="scan-task-complete-box">
              <div className="complete-checkmark">✓</div>

              <div>
                <strong>Coffee Bean Sensor Test Complete</strong>

                <span>
                  Baseline, sample, and recovery sensor readings were captured
                  successfully.
                </span>
              </div>
            </div>

            {/* =================================================
                CAPTURE TIMES
            ================================================= */}

            <div className="capture-time-grid">
              <div>
                <span>Baseline</span>

                <strong>{formatTime(baselineTime)}</strong>
              </div>

              <div>
                <span>Sample</span>

                <strong>{formatTime(sampleTime)}</strong>
              </div>

              <div>
                <span>Recovery</span>

                <strong>{formatTime(recoveryTime)}</strong>
              </div>
            </div>

            {/* =================================================
                RESULTS
            ================================================= */}

            <div className="scan-result-section">
              <div className="scan-result-heading">
                <div>
                  <span>TEST RESULTS</span>

                  <h4>Sensor Data Comparison</h4>
                </div>

                <button className="new-test-button" onClick={handleNewTest}>
                  ↻ New Test
                </button>
              </div>

              <div className="scan-result-table-wrapper">
                <table className="scan-result-table">
                  <thead>
                    <tr>
                      <th>Sensor</th>

                      <th>Baseline</th>

                      <th>Sample</th>

                      <th>Recovery</th>

                      <th>Response</th>

                      <th>Recovery Error</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* MQ-2 */}

                    <tr>
                      <td>MQ-2</td>

                      <td>{formatValue(baselineData?.mq2)}</td>

                      <td>{formatValue(sampleData?.mq2)}</td>

                      <td>{formatValue(recoveryData?.mq2)}</td>

                      <td className="response-value">
                        {calculateDifference(
                          sampleData?.mq2,
                          baselineData?.mq2,
                        )}
                      </td>

                      <td className="recovery-value">
                        {calculateRecoveryDifference(
                          recoveryData?.mq2,
                          baselineData?.mq2,
                        )}
                      </td>
                    </tr>

                    {/* MQ-3 */}

                    <tr>
                      <td>MQ-3</td>

                      <td>{formatValue(baselineData?.mq3)}</td>

                      <td>{formatValue(sampleData?.mq3)}</td>

                      <td>{formatValue(recoveryData?.mq3)}</td>

                      <td className="response-value">
                        {calculateDifference(
                          sampleData?.mq3,
                          baselineData?.mq3,
                        )}
                      </td>

                      <td className="recovery-value">
                        {calculateRecoveryDifference(
                          recoveryData?.mq3,
                          baselineData?.mq3,
                        )}
                      </td>
                    </tr>

                    {/* MQ-135 */}

                    <tr>
                      <td>MQ-135</td>

                      <td>{formatValue(baselineData?.mq135)}</td>

                      <td>{formatValue(sampleData?.mq135)}</td>

                      <td>{formatValue(recoveryData?.mq135)}</td>

                      <td className="response-value">
                        {calculateDifference(
                          sampleData?.mq135,
                          baselineData?.mq135,
                        )}
                      </td>

                      <td className="recovery-value">
                        {calculateRecoveryDifference(
                          recoveryData?.mq135,
                          baselineData?.mq135,
                        )}
                      </td>
                    </tr>

                    {/* MOISTURE */}

                    <tr>
                      <td>Moisture</td>

                      <td>{formatValue(baselineData?.moisture)}</td>

                      <td>{formatValue(sampleData?.moisture)}</td>

                      <td>{formatValue(recoveryData?.moisture)}</td>

                      <td className="response-value">
                        {calculateDifference(
                          sampleData?.moisture,
                          baselineData?.moisture,
                        )}
                      </td>

                      <td className="recovery-value">
                        {calculateRecoveryDifference(
                          recoveryData?.moisture,
                          baselineData?.moisture,
                        )}
                      </td>
                    </tr>

                    {/* TEMPERATURE */}

                    <tr>
                      <td>Temperature</td>

                      <td>{formatValue(baselineData?.temperature, 1)} °C</td>

                      <td>{formatValue(sampleData?.temperature, 1)} °C</td>

                      <td>{formatValue(recoveryData?.temperature, 1)} °C</td>

                      <td className="response-value">
                        {calculateDifference(
                          sampleData?.temperature,
                          baselineData?.temperature,
                          1,
                        )}{" "}
                        °C
                      </td>

                      <td className="recovery-value">
                        {calculateRecoveryDifference(
                          recoveryData?.temperature,
                          baselineData?.temperature,
                          1,
                        )}{" "}
                        °C
                      </td>
                    </tr>

                    {/* HUMIDITY */}

                    <tr>
                      <td>Humidity</td>

                      <td>{formatValue(baselineData?.humidity, 1)} %</td>

                      <td>{formatValue(sampleData?.humidity, 1)} %</td>

                      <td>{formatValue(recoveryData?.humidity, 1)} %</td>

                      <td className="response-value">
                        {calculateDifference(
                          sampleData?.humidity,
                          baselineData?.humidity,
                          1,
                        )}{" "}
                        %
                      </td>

                      <td className="recovery-value">
                        {calculateRecoveryDifference(
                          recoveryData?.humidity,
                          baselineData?.humidity,
                          1,
                        )}{" "}
                        %
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  SENSOR QUALITY ASSESSMENT
              ================================================= */}

              <div
                className={`sensor-quality-assessment sensor-quality-${sensorQualityStatus.toLowerCase()}`}
              >
                <div className="sensor-quality-header">
                  <div>
                    <span className="sensor-quality-label">
                      SENSOR QUALITY ASSESSMENT
                    </span>

                    <h4>Sensor Score & Status</h4>

                    <p>
                      Calculated from the stable sample response relative to the
                      captured baseline using the same current scoring rules as
                      the final quality report.
                    </p>
                  </div>

                  <div
                    className={`sensor-quality-status sensor-quality-status-${sensorQualityStatus.toLowerCase()}`}
                  >
                    {sensorQualityStatus}
                  </div>
                </div>

                <div className="sensor-quality-main-grid">
                  <div className="sensor-quality-score-card">
                    <span>Sensor Score</span>

                    <div className="sensor-quality-score-value">
                      <strong>{formatQualityNumber(sensorQualityScore)}</strong>
                      <small>/100</small>
                    </div>

                    <div className="sensor-quality-score-track">
                      <div
                        className="sensor-quality-score-fill"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, sensorQualityScore),
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="sensor-quality-detail-grid">
                    <div className="sensor-quality-detail-card">
                      <span>MQ-2 Response</span>
                      <strong>
                        {formatQualityNumber(mq2QualityResponse)}
                      </strong>
                      <small>Sample − Baseline</small>
                    </div>

                    <div className="sensor-quality-detail-card">
                      <span>MQ-2 Score</span>
                      <strong>{formatQualityNumber(mq2QualityScore)}</strong>
                      <small>/100</small>
                    </div>

                    <div className="sensor-quality-detail-card">
                      <span>MQ-135 Response</span>
                      <strong>
                        {formatQualityNumber(mq135QualityResponse)}
                      </strong>
                      <small>Sample − Baseline</small>
                    </div>

                    <div className="sensor-quality-detail-card">
                      <span>MQ-135 Score</span>
                      <strong>{formatQualityNumber(mq135QualityScore)}</strong>
                      <small>/100</small>
                    </div>
                  </div>
                </div>

                <div className="sensor-quality-note">
                  <span>i</span>

                  <p>
                    This is the Step 1 sensor assessment only. The final coffee
                    bean grade is calculated later by combining the sensor score
                    with the Physical AI score.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`

        .scan-workflow {
          margin-top: 28px;

          padding: 24px;

          border-radius: 22px;

          border:
            1px solid
            rgba(
              255,
              218,
              168,
              0.11
            );

          background:
            rgba(
              18,
              10,
              6,
              0.25
            );
        }


        /* ===================================================
           HEADER
        =================================================== */

        .scan-workflow-header {
          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          gap: 20px;

          margin-bottom: 22px;
        }


        .scan-section-label {
          display: block;

          margin-bottom: 5px;

          color: #d89958;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1.4px;
        }


        .scan-workflow-header h3 {
          margin: 0;

          color: #fff0d9;

          font-size: 20px;
        }


        .scan-workflow-header p {
          max-width: 680px;

          margin: 7px 0 0;

          color:
            rgba(
              255,
              236,
              210,
              0.48
            );

          font-size: 12px;

          line-height: 1.55;
        }


        .scan-task-status {
          flex-shrink: 0;

          padding: 7px 11px;

          border-radius: 999px;

          color: #ffd29b;

          background:
            rgba(
              211,
              134,
              62,
              0.08
            );

          border:
            1px solid
            rgba(
              222,
              149,
              77,
              0.13
            );

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 0.6px;
        }


        .scan-task-complete {
          color: #a1e7aa;

          background:
            rgba(
              58,
              166,
              73,
              0.09
            );

          border-color:
            rgba(
              91,
              194,
              104,
              0.15
            );
        }


        /* ===================================================
           STAGE CARDS
        =================================================== */

        .scan-stage-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 10px;

          margin-bottom: 18px;
        }


        .scan-stage-card {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 13px;

          border-radius: 15px;

          color:
            rgba(
              255,
              236,
              211,
              0.4
            );

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px solid
            rgba(
              255,
              220,
              175,
              0.06
            );

          transition: 0.25s ease;
        }


        .scan-stage-active {
          color: #ffd7a3;

          background:
            rgba(
              205,
              128,
              55,
              0.08
            );

          border-color:
            rgba(
              220,
              146,
              74,
              0.14
            );
        }


        .scan-stage-finished {
          color: #a2e6aa;

          background:
            rgba(
              61,
              162,
              74,
              0.08
            );

          border-color:
            rgba(
              91,
              192,
              103,
              0.14
            );
        }


        .scan-stage-number {
          width: 29px;

          height: 29px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            rgba(
              255,
              255,
              255,
              0.06
            );

          font-size: 10px;

          font-weight: 900;
        }


        .scan-stage-card strong {
          display: block;

          font-size: 11px;
        }


        .scan-stage-card span {
          display: block;

          margin-top: 2px;

          font-size: 9px;

          opacity: 0.65;
        }


        /* ===================================================
           CONTENT
        =================================================== */

        .scan-stage-content {
          margin-top: 8px;
        }


        /* ===================================================
           INSTRUCTION
        =================================================== */

        .scan-instruction {
          display: flex;

          align-items: center;

          gap: 14px;

          padding: 17px;

          border-radius: 17px;

          background:
            rgba(
              255,
              255,
              255,
              0.035
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


        .scan-instruction-icon {
          width: 39px;

          height: 39px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          color: #ffd296;

          background:
            rgba(
              211,
              133,
              58,
              0.13
            );

          font-size: 12px;

          font-weight: 900;
        }


        .scan-instruction-text {
          flex: 1;
        }


        .scan-instruction-text strong {
          display: block;

          color: #ffe7c6;

          font-size: 12px;
        }


        .scan-instruction-text span {
          display: block;

          margin-top: 4px;

          color:
            rgba(
              255,
              235,
              210,
              0.48
            );

          font-size: 11px;

          line-height: 1.5;
        }


        .scan-primary-button {
          flex-shrink: 0;

          padding: 11px 15px;

          border: none;

          border-radius: 12px;

          color: #2c170c;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d89049
            );

          cursor: pointer;

          font-size: 11px;

          font-weight: 900;

          transition: 0.2s ease;
        }


        .scan-primary-button:hover:not(:disabled) {
          transform:
            translateY(-1px);
        }


        .scan-primary-button:disabled {
          opacity: 0.45;

          cursor: not-allowed;
        }


        /* ===================================================
           MONITORING
        =================================================== */

        .scan-monitoring-box {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 16px;

          padding: 18px;

          border-radius: 17px;

          background:
            rgba(
              205,
              127,
              54,
              0.07
            );

          border:
            1px solid
            rgba(
              221,
              146,
              72,
              0.14
            );
        }


        .scan-monitoring-left {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .scan-pulse {
          width: 37px;

          height: 37px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            rgba(
              66,
              168,
              78,
              0.1
            );
        }


        .scan-pulse span {
          width: 9px;

          height: 9px;

          border-radius: 50%;

          background: #73d980;

          box-shadow:
            0 0 12px #73d980;

          animation:
            scanPulse
            1.3s
            infinite;
        }


        .scan-monitoring-left strong {
          display: block;

          color: #ffe4c0;

          font-size: 12px;
        }


        .scan-monitoring-left span {
          display: block;

          margin-top: 3px;

          color:
            rgba(
              255,
              235,
              210,
              0.48
            );

          font-size: 10px;

          line-height: 1.5;
        }


        .scan-stability-state {
          flex-shrink: 0;

          padding: 7px 10px;

          border-radius: 999px;

          font-size: 9px;

          font-weight: 900;
        }


        .scan-collecting {
          color: #ffd096;

          background:
            rgba(
              210,
              138,
              59,
              0.09
            );
        }


        .scan-stabilizing {
          color: #ffb279;

          background:
            rgba(
              201,
              96,
              41,
              0.1
            );
        }


        .scan-stable {
          color: #9fe6a8;

          background:
            rgba(
              61,
              165,
              74,
              0.1
            );
        }


        /* ===================================================
           120 SECOND SAMPLE EXPOSURE
        =================================================== */

        .sample-exposure-wrapper {
          padding: 18px;

          border-radius: 17px;

          background:
            rgba(
              195,
              128,
              53,
              0.07
            );

          border:
            1px solid
            rgba(
              221,
              151,
              75,
              0.14
            );
        }


        .sample-exposure-box {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;
        }


        .exposure-left {
          display: flex;

          align-items: center;

          gap: 13px;
        }


        .exposure-icon {
          width: 42px;

          height: 42px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          color: #ffd395;

          background:
            rgba(
              213,
              139,
              59,
              0.13
            );

          font-size: 17px;
        }


        .exposure-left strong {
          display: block;

          color: #ffe4bd;

          font-size: 12px;
        }


        .exposure-left span {
          display: block;

          max-width: 600px;

          margin-top: 4px;

          color:
            rgba(
              255,
              235,
              207,
              0.5
            );

          font-size: 10px;

          line-height: 1.5;
        }


        .exposure-timer {
          min-width: 88px;

          text-align: center;

          padding: 10px 13px;

          border-radius: 13px;

          background:
            rgba(
              255,
              255,
              255,
              0.05
            );

          border:
            1px solid
            rgba(
              255,
              220,
              173,
              0.1
            );
        }


        .exposure-timer strong {
          display: block;

          color: #ffd392;

          font-size: 24px;

          line-height: 1;
        }


        .exposure-timer span {
          display: block;

          margin-top: 5px;

          color:
            rgba(
              255,
              234,
              207,
              0.45
            );

          font-size: 9px;

          text-transform:
            uppercase;

          letter-spacing: 0.7px;
        }


        .exposure-progress {
          width: 100%;

          height: 7px;

          margin-top: 16px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(
              255,
              255,
              255,
              0.06
            );
        }


        .exposure-progress-fill {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #a76134,
              #ffd292
            );

          transition:
            width 1s linear;
        }


        .exposure-note {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-top: 11px;

          color:
            rgba(
              255,
              230,
              198,
              0.46
            );

          font-size: 9px;

          line-height: 1.45;
        }


        .exposure-live-dot {
          width: 7px;

          height: 7px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #71d87e;

          box-shadow:
            0 0 9px #71d87e;

          animation:
            scanPulse
            1.3s
            infinite;
        }


        /* ===================================================
           SUCCESS BOX
        =================================================== */

        .scan-success-box {
          display: flex;

          align-items: center;

          gap: 11px;

          margin-bottom: 12px;

          padding: 14px;

          border-radius: 15px;

          background:
            rgba(
              58,
              163,
              72,
              0.08
            );

          border:
            1px solid
            rgba(
              89,
              191,
              102,
              0.14
            );
        }


        .scan-success-icon {
          width: 33px;

          height: 33px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          color: #a5e9ad;

          background:
            rgba(
              68,
              174,
              81,
              0.14
            );

          font-weight: 900;
        }


        .scan-success-box strong {
          display: block;

          color: #c8efcd;

          font-size: 11px;
        }


        .scan-success-box span {
          display: block;

          margin-top: 3px;

          color:
            rgba(
              206,
              237,
              211,
              0.5
            );

          font-size: 10px;
        }


        /* ===================================================
           TASK COMPLETE
        =================================================== */

        .scan-task-complete-box {
          display: flex;

          align-items: center;

          gap: 13px;

          padding: 18px;

          border-radius: 18px;

          background:
            rgba(
              55,
              157,
              69,
              0.09
            );

          border:
            1px solid
            rgba(
              87,
              189,
              99,
              0.16
            );
        }


        .complete-checkmark {
          width: 42px;

          height: 42px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          color: #a6e9ae;

          background:
            rgba(
              66,
              173,
              79,
              0.15
            );

          font-size: 16px;

          font-weight: 900;
        }


        .scan-task-complete-box strong {
          display: block;

          color: #c9efce;

          font-size: 13px;
        }


        .scan-task-complete-box span {
          display: block;

          margin-top: 4px;

          color:
            rgba(
              207,
              239,
              212,
              0.5
            );

          font-size: 10px;
        }


        /* ===================================================
           CAPTURE TIMES
        =================================================== */

        .capture-time-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 9px;

          margin-top: 12px;
        }


        .capture-time-grid > div {
          padding: 11px;

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              0.03
            );

          border:
            1px solid
            rgba(
              255,
              220,
              175,
              0.07
            );
        }


        .capture-time-grid span {
          display: block;

          color:
            rgba(
              255,
              232,
              204,
              0.4
            );

          font-size: 8px;

          text-transform:
            uppercase;

          letter-spacing: 0.7px;
        }


        .capture-time-grid strong {
          display: block;

          margin-top: 4px;

          color: #ffe0b6;

          font-size: 10px;
        }


        /* ===================================================
           SENSOR QUALITY ASSESSMENT
        =================================================== */

        .sensor-quality-assessment {
          margin-top: 18px;

          padding: 18px;

          border-radius: 18px;

          background:
            rgba(
              255,
              255,
              255,
              0.03
            );

          border:
            1px solid
            rgba(
              255,
              220,
              175,
              0.08
            );
        }


        .sensor-quality-good {
          background:
            rgba(
              55,
              157,
              69,
              0.075
            );

          border-color:
            rgba(
              87,
              189,
              99,
              0.16
            );
        }


        .sensor-quality-review {
          background:
            rgba(
              205,
              127,
              54,
              0.07
            );

          border-color:
            rgba(
              221,
              146,
              72,
              0.14
            );
        }


        .sensor-quality-bad {
          background:
            rgba(
              190,
              65,
              50,
              0.075
            );

          border-color:
            rgba(
              225,
              90,
              75,
              0.16
            );
        }


        .sensor-quality-header {
          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          gap: 18px;

          margin-bottom: 15px;
        }


        .sensor-quality-label {
          display: block;

          color: #d89958;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .sensor-quality-header h4 {
          margin: 4px 0 0;

          color: #ffe8c9;

          font-size: 16px;
        }


        .sensor-quality-header p {
          max-width: 680px;

          margin: 6px 0 0;

          color:
            rgba(
              255,
              235,
              210,
              0.48
            );

          font-size: 10px;

          line-height: 1.5;
        }


        .sensor-quality-status {
          flex-shrink: 0;

          padding: 8px 12px;

          border-radius: 999px;

          font-size: 10px;

          font-weight: 950;

          letter-spacing: 0.8px;
        }


        .sensor-quality-status-good {
          color: #a3e8ac;

          background:
            rgba(
              61,
              165,
              74,
              0.12
            );

          border:
            1px solid
            rgba(
              91,
              194,
              104,
              0.17
            );
        }


        .sensor-quality-status-review {
          color: #ffd096;

          background:
            rgba(
              210,
              138,
              59,
              0.11
            );

          border:
            1px solid
            rgba(
              222,
              149,
              77,
              0.16
            );
        }


        .sensor-quality-status-bad {
          color: #ffaaa0;

          background:
            rgba(
              200,
              60,
              50,
              0.12
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


        .sensor-quality-main-grid {
          display: grid;

          grid-template-columns:
            minmax(180px, 0.8fr)
            minmax(0, 2fr);

          gap: 12px;
        }


        .sensor-quality-score-card,
        .sensor-quality-detail-card {
          padding: 14px;

          border-radius: 15px;

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          border:
            1px solid
            rgba(
              255,
              220,
              175,
              0.07
            );
        }


        .sensor-quality-score-card > span,
        .sensor-quality-detail-card > span {
          display: block;

          color:
            rgba(
              255,
              232,
              204,
              0.45
            );

          font-size: 9px;

          font-weight: 800;

          text-transform:
            uppercase;

          letter-spacing: 0.55px;
        }


        .sensor-quality-score-value {
          display: flex;

          align-items: flex-end;

          gap: 5px;

          margin-top: 8px;
        }


        .sensor-quality-score-value strong {
          color: #fff0d5;

          font-size: 31px;

          line-height: 1;

          font-weight: 950;
        }


        .sensor-quality-score-value small {
          padding-bottom: 3px;

          color:
            rgba(
              255,
              233,
              203,
              0.45
            );

          font-size: 10px;

          font-weight: 800;
        }


        .sensor-quality-score-track {
          width: 100%;

          height: 6px;

          margin-top: 12px;

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


        .sensor-quality-score-fill {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #a76134,
              #ffd292
            );

          transition:
            width
            0.35s ease;
        }


        .sensor-quality-detail-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 9px;
        }


        .sensor-quality-detail-card strong {
          display: block;

          margin-top: 7px;

          color: #ffe5bd;

          font-size: 19px;

          font-weight: 900;
        }


        .sensor-quality-detail-card small {
          display: block;

          margin-top: 3px;

          color:
            rgba(
              255,
              232,
              204,
              0.38
            );

          font-size: 8px;

          line-height: 1.35;
        }


        .sensor-quality-note {
          display: flex;

          align-items: flex-start;

          gap: 8px;

          margin-top: 12px;

          padding: 10px 12px;

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );
        }


        .sensor-quality-note > span {
          width: 20px;

          height: 20px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          color: #ffd49b;

          background:
            rgba(
              211,
              133,
              58,
              0.12
            );

          font-size: 10px;

          font-weight: 900;
        }


        .sensor-quality-note p {
          margin: 1px 0 0;

          color:
            rgba(
              255,
              232,
              204,
              0.43
            );

          font-size: 9px;

          line-height: 1.5;
        }


        /* ===================================================
           RESULT TABLE
        =================================================== */

        .scan-result-section {
          margin-top: 18px;
        }


        .scan-result-heading {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          margin-bottom: 12px;
        }


        .scan-result-heading span {
          display: block;

          color: #cc8c4e;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .scan-result-heading h4 {
          margin: 4px 0 0;

          color: #ffe8c9;

          font-size: 15px;
        }


        .new-test-button {
          padding: 8px 11px;

          border-radius: 10px;

          color: #ffd9aa;

          background:
            rgba(
              255,
              255,
              255,
              0.05
            );

          border:
            1px solid
            rgba(
              255,
              220,
              175,
              0.1
            );

          cursor: pointer;

          font-size: 10px;

          font-weight: 800;
        }


        .scan-result-table-wrapper {
          overflow-x: auto;

          border-radius: 15px;

          border:
            1px solid
            rgba(
              255,
              220,
              175,
              0.08
            );
        }


        .scan-result-table {
          width: 100%;

          min-width: 780px;

          border-collapse:
            collapse;
        }


        .scan-result-table th {
          padding: 11px 13px;

          text-align: left;

          color:
            rgba(
              255,
              226,
              188,
              0.58
            );

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          font-size: 9px;

          text-transform:
            uppercase;

          letter-spacing: 0.7px;
        }


        .scan-result-table td {
          padding: 11px 13px;

          color:
            rgba(
              255,
              237,
              215,
              0.72
            );

          border-top:
            1px solid
            rgba(
              255,
              220,
              175,
              0.055
            );

          font-size: 10px;
        }


        .scan-result-table td:first-child {
          color: #ffe1b7;

          font-weight: 850;
        }


        .response-value {
          color: #a6e6ae !important;

          font-weight: 900;
        }


        .recovery-value {
          color: #ffd39d !important;

          font-weight: 850;
        }


        /* ===================================================
           ANIMATION
        =================================================== */

        @keyframes scanPulse {

          0%,
          100% {
            opacity: 0.45;

            transform:
              scale(0.8);
          }


          50% {
            opacity: 1;

            transform:
              scale(1.2);
          }

        }


        /* ===================================================
           RESPONSIVE
        =================================================== */

        @media (
          max-width: 720px
        ) {

          .scan-workflow-header,
          .scan-monitoring-box,
          .scan-instruction,
          .sample-exposure-box {
            flex-direction:
              column;

            align-items:
              stretch;
          }


          .scan-stage-grid {
            grid-template-columns:
              1fr;
          }


          .capture-time-grid {
            grid-template-columns:
              1fr;
          }


          .sensor-quality-header {
            flex-direction:
              column;

            align-items:
              stretch;
          }


          .sensor-quality-main-grid {
            grid-template-columns:
              1fr;
          }


          .sensor-quality-detail-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }


          .scan-primary-button {
            width: 100%;
          }


          .exposure-timer {
            width: 100%;

            box-sizing:
              border-box;
          }

        }

      `}</style>
    </div>
  );
}

export default SensorScanWorkflow;
