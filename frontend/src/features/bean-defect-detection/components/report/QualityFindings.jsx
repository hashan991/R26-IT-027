import {
  SENSOR_THRESHOLDS,
  TOTAL_VOTING_SENSORS,
  SENSOR_VOTE_WEIGHT,
  GOOD_MAX_BAD_VOTES,
  REVIEW_BAD_VOTES,
  BAD_MIN_BAD_VOTES,
} from "/src/features/bean-defect-detection/config/sensorQualityConfig";

function QualityFindings({
  finalScore = 0,
  grade = "-",
  qualityStatus = "Needs Review",

  sensorFindings = [],
  physicalFindings = [],

  sensorAssessment = {},
  physicalAssessment = {},

  sensorWeight = 0.5,
  physicalWeight = 0.5,
}) {
  // =========================================================
  // HELPERS
  // =========================================================

  const formatValue = (value, decimals = 2) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return number.toFixed(decimals);
  };

  const normalizeStatus = (status) => {
    const value = String(status || "normal")
      .toLowerCase()
      .trim();

    if (value === "danger" || value === "bad" || value === "poor") {
      return "danger";
    }

    if (value === "warning" || value === "review" || value === "needs review") {
      return "warning";
    }

    if (value === "info") {
      return "info";
    }

    return "normal";
  };

  const statusClass = (status) =>
    String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

  const getFindingIcon = (status) => {
    const value = normalizeStatus(status);

    if (value === "danger") {
      return "×";
    }

    if (value === "warning") {
      return "!";
    }

    if (value === "info") {
      return "i";
    }

    return "✓";
  };

  // =========================================================
  // MAIN VALUES
  // =========================================================

  const sensorStatus = sensorAssessment.status || "NO DATA";

  const physicalStatus = physicalAssessment.status || "NO DATA";

  const sensorScore = Number(sensorAssessment.sensor_score ?? 0);

  const physicalScore = Number(physicalAssessment.physical_score ?? 0);

  const calculatedSensorContribution = sensorScore * Number(sensorWeight || 0);

  const calculatedPhysicalContribution =
    physicalScore * Number(physicalWeight || 0);

  // =========================================================
  // FIVE-SENSOR VOTING VALUES
  // =========================================================
  //
  // Response = Sample - Baseline
  //
  // BAD vote thresholds:
  //
  // MQ-2      >= 129.5
  // MQ-3      >= 38.5
  // MQ-135    >= 9.5
  // Moisture  <= -16.0
  // Humidity  >= 10.7
  //
  // Temperature is supporting information only.
  // =========================================================

  const mq2Response = sensorAssessment.mq2_response;

  const mq3Response = sensorAssessment.mq3_response;

  const mq135Response = sensorAssessment.mq135_response;

  const moistureResponse = sensorAssessment.moisture_response;

  const humidityResponse = sensorAssessment.humidity_response;

  const temperatureResponse = sensorAssessment.temperature_response;

const mq2Threshold = Number(
  sensorAssessment.mq2_threshold ?? SENSOR_THRESHOLDS.mq2.badThreshold,
);

const mq3Threshold = Number(
  sensorAssessment.mq3_threshold ?? SENSOR_THRESHOLDS.mq3.badThreshold,
);

const mq135Threshold = Number(
  sensorAssessment.mq135_threshold ?? SENSOR_THRESHOLDS.mq135.badThreshold,
);

const moistureThreshold = Number(
  sensorAssessment.moisture_threshold ??
    SENSOR_THRESHOLDS.moisture.badThreshold,
);

const humidityThreshold = Number(
  sensorAssessment.humidity_threshold ??
    SENSOR_THRESHOLDS.humidity.badThreshold,
);

  // =========================================================
  // SENSOR INDIVIDUAL VOTE STATE
  // =========================================================

  const getSensorVoteState = ({
    response,
    threshold,
    direction = "high",
    backendBad,
  }) => {
    if (
      response === null ||
      response === undefined ||
      response === "" ||
      threshold === null ||
      threshold === undefined
    ) {
      return {
        bad: null,
        label: "NO DATA",
        className: "neutral",
        symbol: "?",
        ruleSymbol: direction === "low" ? "≤" : "≥",
      };
    }

    const responseNumber = Number(response);

    const thresholdNumber = Number(threshold);

    if (!Number.isFinite(responseNumber) || !Number.isFinite(thresholdNumber)) {
      return {
        bad: null,
        label: "NO DATA",
        className: "neutral",
        symbol: "?",
        ruleSymbol: direction === "low" ? "≤" : "≥",
      };
    }

    const calculatedBad =
      direction === "low"
        ? responseNumber <= thresholdNumber
        : responseNumber >= thresholdNumber;

    const bad = typeof backendBad === "boolean" ? backendBad : calculatedBad;

    if (bad) {
      return {
        bad: true,
        label: "BAD VOTE",
        className: "danger",
        symbol: direction === "low" ? "≤" : "≥",
        ruleSymbol: direction === "low" ? "≤" : "≥",
      };
    }

    return {
      bad: false,
      label: "GOOD VOTE",
      className: "good",
      symbol: direction === "low" ? ">" : "<",
      ruleSymbol: direction === "low" ? "≤" : "≥",
    };
  };

  const mq2State = getSensorVoteState({
    response: mq2Response,
    threshold: mq2Threshold,
    direction: "high",
    backendBad: sensorAssessment.mq2_bad,
  });

  const mq3State = getSensorVoteState({
    response: mq3Response,
    threshold: mq3Threshold,
    direction: "high",
    backendBad: sensorAssessment.mq3_bad,
  });

  const mq135State = getSensorVoteState({
    response: mq135Response,
    threshold: mq135Threshold,
    direction: "high",
    backendBad: sensorAssessment.mq135_bad,
  });

  const moistureState = getSensorVoteState({
    response: moistureResponse,
    threshold: moistureThreshold,
    direction: "low",
    backendBad: sensorAssessment.moisture_bad,
  });

  const humidityState = getSensorVoteState({
    response: humidityResponse,
    threshold: humidityThreshold,
    direction: "high",
    backendBad: sensorAssessment.humidity_bad,
  });

  const votingSensors = [
    {
      name: "MQ-2",
      type: "VOTING SENSOR",
      response: mq2Response,
      threshold: mq2Threshold,
      state: mq2State,
      direction: "high",
    },

    {
      name: "MQ-3",
      type: "VOTING SENSOR",
      response: mq3Response,
      threshold: mq3Threshold,
      state: mq3State,
      direction: "high",
    },

    {
      name: "MQ-135",
      type: "VOTING SENSOR",
      response: mq135Response,
      threshold: mq135Threshold,
      state: mq135State,
      direction: "high",
    },

    {
      name: "Moisture",
      type: "VOTING SENSOR",
      response: moistureResponse,
      threshold: moistureThreshold,
      state: moistureState,
      direction: "low",
    },

    {
      name: "Humidity",
      type: "VOTING SENSOR",
      response: humidityResponse,
      threshold: humidityThreshold,
      state: humidityState,
      direction: "high",
    },
  ];

  const calculatedValidVoteCount = votingSensors.filter(
    (sensor) => sensor.state.bad !== null,
  ).length;

  const calculatedBadCount = votingSensors.filter(
    (sensor) => sensor.state.bad === true,
  ).length;

  const backendBadCount = Number(sensorAssessment.bad_count);

  const backendValidVoteCount = Number(sensorAssessment.valid_vote_count);

  const backendTotalVotingSensors = Number(
    sensorAssessment.total_voting_sensors,
  );

  const badCount = Number.isFinite(backendBadCount)
    ? backendBadCount
    : calculatedBadCount;

  const validVoteCount = Number.isFinite(backendValidVoteCount)
    ? backendValidVoteCount
    : calculatedValidVoteCount;

  const totalVotingSensors =
    Number.isFinite(backendTotalVotingSensors) && backendTotalVotingSensors > 0
      ? backendTotalVotingSensors
      : TOTAL_VOTING_SENSORS;

  const goodVoteCount = Math.max(0, validVoteCount - badCount);

  // =========================================================
  // SENSOR DECISION EXPLANATION
  // =========================================================

  const getSensorDecisionExplanation = () => {
    if (sensorStatus === "SKIPPED") {
      return (
        "The sensor inspection was skipped. " +
        "A reliable sensor quality status could not be generated."
      );
    }

    if (validVoteCount < totalVotingSensors) {
      return (
        `Only ${validVoteCount} of ${totalVotingSensors} voting sensor responses were valid. ` +
        "A complete five-sensor decision could not be generated, so the sample requires REVIEW."
      );
    }

    if (badCount >= BAD_MIN_BAD_VOTES) {
      return (
        `${badCount} of ${totalVotingSensors} sensors produced BAD votes. ` +
        "Because three or more BAD votes form the BAD decision zone, " +
        "the sensor assessment returned BAD."
      );
    }

    if (badCount === REVIEW_BAD_VOTES) {
      return (
        `Exactly ${badCount} of ${totalVotingSensors} sensors produced BAD votes. ` +
        "According to the research-defined voting rule, two BAD votes indicate mixed evidence, " +
        "so the sensor assessment returned REVIEW."
      );
    }

    return (
      `${badCount} of ${totalVotingSensors} sensors produced BAD votes and ` +
      `${goodVoteCount} produced GOOD votes. ` +
      "Because zero or one BAD vote is within the GOOD decision zone, " +
      "the sensor assessment returned GOOD."
    );
  };

  // =========================================================
  // PHYSICAL VALUES
  // =========================================================

  const counts = physicalAssessment.counts || {};

  const totalBeans = Number(physicalAssessment.total_beans ?? 0);

  const goodCount = Number(counts.good ?? 0);

  const brokenCount = Number(counts.broken ?? 0);

  const blackCount = Number(counts.black ?? 0);

  const blackBrokenCount = Number(counts.black_and_broken ?? 0);

  const unknownCount = Number(counts.unknown ?? 0);

  const weightedDefectUnits = physicalAssessment.weighted_defect_units;

  const weightedDefectLoad = physicalAssessment.weighted_defect_load;

  const brokenWeight = physicalAssessment.broken_weight;

  const blackWeight = physicalAssessment.black_weight;

  const blackBrokenWeight = physicalAssessment.black_and_broken_weight;

  const unknownWeight = physicalAssessment.unknown_weight;

  // =========================================================
  // PHYSICAL EXPLANATION
  // =========================================================

  const getPhysicalDecisionExplanation = () => {
    if (physicalStatus === "NO_DATA") {
      return (
        "No valid coffee bean detections were available. " +
        "A physical quality decision could not be generated."
      );
    }

    if (physicalStatus === "EXCELLENT") {
      return (
        `The physical quality score was ${formatValue(physicalScore)}/100. ` +
        "This falls within the 90–100 range, therefore the physical status is EXCELLENT."
      );
    }

    if (physicalStatus === "GOOD") {
      return (
        `The physical quality score was ${formatValue(physicalScore)}/100. ` +
        "This falls within the 75–89.99 range, therefore the physical status is GOOD."
      );
    }

    if (physicalStatus === "REVIEW") {
      return (
        `The physical quality score was ${formatValue(physicalScore)}/100. ` +
        "This falls within the 60–74.99 range, therefore the physical status requires REVIEW."
      );
    }

    if (physicalStatus === "POOR") {
      return (
        `The physical quality score was ${formatValue(physicalScore)}/100. ` +
        "This is below 60. The detected defect burden therefore resulted in a POOR physical status."
      );
    }

    return "The physical quality result was generated from the detected bean categories and their weighted defect impact.";
  };

  // =========================================================
  // FINAL GRADE EXPLANATION
  // =========================================================

  const getGradeRange = () => {
    const score = Number(finalScore);

    if (score >= 85) {
      return {
        text: "85.00 – 100.00",
        explanation: "The final score is 85 or higher.",
      };
    }

    if (score >= 70) {
      return {
        text: "70.00 – 84.99",
        explanation: "The final score is between 70 and 84.99.",
      };
    }

    if (score >= 55) {
      return {
        text: "55.00 – 69.99",
        explanation: "The final score is between 55 and 69.99.",
      };
    }

    return {
      text: "Below 55.00",
      explanation: "The final score is below 55.",
    };
  };

  const gradeRange = getGradeRange();

  // =========================================================
  // FINAL QUALITY STATUS EXPLANATION
  // =========================================================

  const getFinalStatusExplanation = () => {
    if (sensorStatus === "SKIPPED") {
      return (
        "The sensor analysis was skipped. " +
        "The final quality status is therefore marked as Needs Review."
      );
    }

    if (physicalStatus === "NO_DATA") {
      return (
        "Physical AI data is unavailable. " +
        "The final quality status is therefore marked as Needs Review."
      );
    }

    if (sensorStatus === "BAD") {
      return (
        "The sensor assessment returned BAD. " +
        "The quality-control safeguard prevents automatic acceptance, " +
        "therefore the final quality status is Needs Review."
      );
    }

    if (physicalStatus === "POOR") {
      return (
        "The physical AI assessment returned POOR. " +
        "The quality-control safeguard prevents automatic acceptance, " +
        "therefore the final quality status is Needs Review."
      );
    }

    if (sensorStatus === "REVIEW" && physicalStatus === "REVIEW") {
      return (
        "Both the sensor assessment and physical AI assessment require review. " +
        "Therefore, the final quality status is Needs Review."
      );
    }

    if (sensorStatus === "REVIEW") {
      return (
        "The sensor assessment contains mixed or uncertain evidence and returned REVIEW. " +
        "Therefore, the final quality status is Needs Review."
      );
    }

    if (physicalStatus === "REVIEW") {
      return (
        "The physical AI assessment returned REVIEW. " +
        "Therefore, the final quality status is Needs Review."
      );
    }

    const score = Number(finalScore);

    if (score >= 85) {
      return (
        "Both component assessments passed the quality safeguards " +
        "and the final score is at least 85. " +
        "Therefore, the final quality status is Excellent."
      );
    }

    if (score >= 70) {
      return (
        "Both component assessments passed the quality safeguards " +
        "and the final score is between 70 and 84.99. " +
        "Therefore, the final quality status is Good."
      );
    }

    if (score >= 55) {
      return (
        "The final numerical score falls within the review range. " +
        "Therefore, the final quality status is Needs Review."
      );
    }

    return (
      "The final numerical score is below 55. " +
      "Therefore, the final quality status is Poor."
    );
  };

  // =========================================================
  // FINDING LIST COMPONENT
  // =========================================================

  const renderFindingList = (findings, label) => {
    if (!findings.length) {
      return (
        <div className="xai-no-findings">
          No additional {label} findings available.
        </div>
      );
    }

    return (
      <div className="xai-finding-list">
        {findings.map((item, index) => {
          const itemStatus = normalizeStatus(item.status);

          return (
            <div
              className={`
                  xai-finding-item
                  finding-${itemStatus}
                `}
              key={index}
            >
              <div className="finding-number">{index + 1}</div>

              <div className="finding-status-icon">
                {getFindingIcon(item.status)}
              </div>

              <div className="finding-content">
                <span>EVIDENCE</span>

                <strong>{item.title}</strong>

                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="quality-findings">
      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

      <div className="xai-main-header">
        <div>
          <span className="xai-main-label">EXPLAINABLE QUALITY ANALYSIS</span>

          <h3>Why Did the System Produce These Results?</h3>

          <p>
            The assessment is explained through three decision levels: final
            quality decision, sensor decision, and physical AI decision.
          </p>
        </div>

        <div className="xai-flow-badge">
          <div className="xai-logo">XAI</div>

          <div>
            <strong>Decision Trace</strong>

            <span>Evidence → Reasoning → Result</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          01 FINAL QUALITY DECISION EXPLANATION
      ===================================================== */}

      <section className="explanation-section">
        <div className="explanation-section-header">
          <div className="section-identity">
            <div className="section-number">01</div>

            <div>
              <span>FINAL DECISION EXPLANATION</span>

              <h4>Why did the sample receive Grade {grade}?</h4>
            </div>
          </div>

          <div
            className={`
              result-pill
              result-${statusClass(qualityStatus)}
            `}
          >
            <span />
            Grade {grade}
          </div>
        </div>

        {/* FINAL FLOW */}

        <div className="final-decision-flow">
          {/* SENSOR */}

          <div className="flow-card">
            <span>SENSOR SCORE</span>

            <strong>{formatValue(sensorScore)}</strong>

            <small>/ 100</small>

            <p>Weight {formatValue(Number(sensorWeight) * 100, 0)}%</p>
          </div>

          <div className="flow-arrow">+</div>

          {/* PHYSICAL */}

          <div className="flow-card">
            <span>PHYSICAL SCORE</span>

            <strong>{formatValue(physicalScore)}</strong>

            <small>/ 100</small>

            <p>Weight {formatValue(Number(physicalWeight) * 100, 0)}%</p>
          </div>

          <div className="flow-arrow">→</div>

          {/* FINAL */}

          <div className="flow-card flow-card-highlight">
            <span>FINAL SCORE</span>

            <strong>{formatValue(finalScore)}</strong>

            <small>/ 100</small>

            <p>Combined result</p>
          </div>

          <div className="flow-arrow">→</div>

          {/* GRADE */}

          <div className="grade-result-card">
            <span>FINAL GRADE</span>

            <strong>{grade}</strong>
          </div>
        </div>

        {/* CONTRIBUTIONS */}

        <div className="contribution-row">
          <div>
            <span>Sensor Contribution</span>

            <strong>{formatValue(calculatedSensorContribution)}</strong>
          </div>

          <div>
            <span>Physical Contribution</span>

            <strong>{formatValue(calculatedPhysicalContribution)}</strong>
          </div>

          <div>
            <span>Grade Range</span>

            <strong>{gradeRange.text}</strong>
          </div>
        </div>

        {/* WHY GRADE */}

        <div className="reason-box">
          <div className="reason-icon">→</div>

          <div>
            <span>WHY GRADE {grade}?</span>

            <strong>
              Final Score {formatValue(finalScore)}
              /100
            </strong>

            <p>
              {gradeRange.explanation} According to the research-defined grading
              ranges, this produces Grade {grade}.
            </p>
          </div>
        </div>

        {/* FINAL STATUS */}

        <div className="final-status-explanation">
          <div className="final-status-heading">
            <div>
              <span>FINAL QUALITY STATUS</span>

              <strong>{qualityStatus}</strong>
            </div>

            <div className="component-statuses">
              <span>
                Sensor:
                <strong> {sensorStatus}</strong>
              </span>

              <span>
                Physical:
                <strong> {physicalStatus}</strong>
              </span>
            </div>
          </div>

          <p>{getFinalStatusExplanation()}</p>
        </div>
      </section>

      {/* =====================================================
          02 SENSOR STATUS EXPLANATION
      ===================================================== */}

      <section className="explanation-section">
        <div className="explanation-section-header">
          <div className="section-identity">
            <div className="section-number">02</div>

            <div>
              <span>SENSOR STATUS EXPLANATION</span>

              <h4>Why did the sensor analysis return {sensorStatus}?</h4>
            </div>
          </div>

          <div
            className={`
              result-pill
              result-${statusClass(sensorStatus)}
            `}
          >
            <span />

            {sensorStatus}
          </div>
        </div>

        {/* FIVE-SENSOR VOTING EVIDENCE */}

        <div className="primary-sensor-evidence">
          {votingSensors.map((sensor) => (
            <div
              className={`
                sensor-evidence-card
                sensor-evidence-${sensor.state.className}
              `}
              key={sensor.name}
            >
              <div className="sensor-evidence-header">
                <div>
                  <span>{sensor.type}</span>

                  <h5>{sensor.name}</h5>
                </div>

                <span
                  className={`
                    threshold-badge
                    threshold-${sensor.state.className}
                  `}
                >
                  {sensor.state.label}
                </span>
              </div>

              <div className="threshold-comparison">
                <div>
                  <span>Response Δ</span>

                  <strong>{formatValue(sensor.response)}</strong>
                </div>

                <div className="comparison-symbol">{sensor.state.symbol}</div>

                <div>
                  <span>BAD Threshold</span>

                  <strong>{formatValue(sensor.threshold)}</strong>
                </div>
              </div>

              <div className="sensor-vote-rule">
                <span>BAD vote rule</span>

                <strong>
                  Δ {sensor.state.ruleSymbol} {formatValue(sensor.threshold)}
                </strong>
              </div>
            </div>
          ))}
        </div>

        {/* TEMPERATURE SUPPORTING INFORMATION */}

        <div className="temperature-supporting-box">
          <div>
            <span>SUPPORTING ENVIRONMENTAL READING</span>

            <strong>Temperature Δ</strong>
          </div>

          <div>
            <strong>{formatValue(temperatureResponse)}</strong>

            <small>
              Not used as a quality vote because the experimental GOOD and BAD
              temperature ranges overlapped.
            </small>
          </div>
        </div>

        {/* SENSOR DECISION LOGIC */}

        <div className="decision-logic-box">
          <div className="logic-heading">
            <span>DECISION LOGIC</span>

            <strong>Five-Sensor Voting Interpretation</strong>
          </div>

          <div className="sensor-vote-summary">
            <div>
              <span>VALID VOTES</span>

              <strong>
                {validVoteCount}/{totalVotingSensors}
              </strong>
            </div>

            <div>
              <span>GOOD VOTES</span>

              <strong>{goodVoteCount}</strong>
            </div>

            <div>
              <span>BAD VOTES</span>

              <strong>{badCount}</strong>
            </div>

            <div>
              <span>SENSOR SCORE</span>

              <strong>{formatValue(sensorScore)}/100</strong>
            </div>
          </div>

          <div className="logic-rules">
            <div>
              <span className="logic-dot good-dot" />
              0–{GOOD_MAX_BAD_VOTES} BAD votes
              <strong>GOOD</strong>
            </div>

            <div>
              <span className="logic-dot warning-dot" />
              Exactly {REVIEW_BAD_VOTES} BAD votes
              <strong>REVIEW</strong>
            </div>

            <div>
              <span className="logic-dot danger-dot" />
              {BAD_MIN_BAD_VOTES}–{TOTAL_VOTING_SENSORS} BAD votes
              <strong>BAD</strong>
            </div>
          </div>

          <div className="sensor-score-formula">
            <span>SCORE FORMULA</span>

            <strong>
              {" "}
              Sensor Score = 100 - (BAD Votes × {SENSOR_VOTE_WEIGHT})
            </strong>
          </div>
        </div>

        {/* SENSOR EXPLANATION */}

        <div className="reason-box">
          <div className="reason-icon">→</div>

          <div>
            <span>WHY THIS SENSOR STATUS?</span>

            <strong>Sensor Status = {sensorStatus}</strong>

            <p>{getSensorDecisionExplanation()}</p>
          </div>
        </div>

        {/* ADDITIONAL SENSOR FINDINGS */}

        <div className="evidence-trace">
          <span>SENSOR EVIDENCE TRACE</span>

          <h5>Additional Sensor Findings</h5>
        </div>

        {renderFindingList(sensorFindings, "sensor")}
      </section>

      {/* =====================================================
          03 PHYSICAL AI STATUS EXPLANATION
      ===================================================== */}

      <section className="explanation-section">
        <div className="explanation-section-header">
          <div className="section-identity">
            <div className="section-number">03</div>

            <div>
              <span>PHYSICAL AI STATUS EXPLANATION</span>

              <h4>Why did the physical AI return {physicalStatus}?</h4>
            </div>
          </div>

          <div
            className={`
              result-pill
              result-${statusClass(physicalStatus)}
            `}
          >
            <span />

            {physicalStatus}
          </div>
        </div>

        {/* AI DETECTION EVIDENCE */}

        <div className="physical-detection-grid">
          <div className="detection-card detection-good">
            <span>GOOD</span>

            <strong>{goodCount}</strong>

            <small>beans</small>
          </div>

          <div className="detection-card detection-warning">
            <span>BROKEN</span>

            <strong>{brokenCount}</strong>

            <small>beans</small>
          </div>

          <div className="detection-card detection-danger">
            <span>BLACK</span>

            <strong>{blackCount}</strong>

            <small>beans</small>
          </div>

          <div className="detection-card detection-danger">
            <span>BLACK + BROKEN</span>

            <strong>{blackBrokenCount}</strong>

            <small>beans</small>
          </div>

          <div className="detection-card detection-neutral">
            <span>UNKNOWN</span>

            <strong>{unknownCount}</strong>

            <small>beans</small>
          </div>
        </div>

        {/* DEFECT IMPACT */}

        <div className="physical-impact-grid">
          <div>
            <span>Broken Weight</span>

            <strong>{formatValue(brokenWeight)}</strong>

            <small>partial impact</small>
          </div>

          <div>
            <span>Black Weight</span>

            <strong>{formatValue(blackWeight)}</strong>

            <small>severe impact</small>
          </div>

          <div>
            <span>Black + Broken Weight</span>

            <strong>{formatValue(blackBrokenWeight)}</strong>

            <small>severe impact</small>
          </div>

          <div>
            <span>Unknown Weight</span>

            <strong>{formatValue(unknownWeight)}</strong>

            <small>uncertainty impact</small>
          </div>
        </div>

        {/* PHYSICAL SCORE TRACE */}

        <div className="physical-score-trace">
          <div>
            <span>TOTAL BEANS</span>

            <strong>{totalBeans}</strong>
          </div>

          <div className="trace-arrow">→</div>

          <div>
            <span>WEIGHTED DEFECT UNITS</span>

            <strong>{formatValue(weightedDefectUnits)}</strong>
          </div>

          <div className="trace-arrow">→</div>

          <div>
            <span>DEFECT LOAD</span>

            <strong>
              {weightedDefectLoad !== null && weightedDefectLoad !== undefined
                ? `${(Number(weightedDefectLoad) * 100).toFixed(2)}%`
                : "-"}
            </strong>
          </div>

          <div className="trace-arrow">→</div>

          <div className="trace-result">
            <span>PHYSICAL SCORE</span>

            <strong>{formatValue(physicalScore)}</strong>

            <small>/100</small>
          </div>
        </div>

        {/* PHYSICAL STATUS RANGE */}

        <div className="physical-status-ranges">
          <div className={physicalScore >= 90 ? "active-range" : ""}>
            <strong>EXCELLENT</strong>

            <span>90 – 100</span>
          </div>

          <div
            className={
              physicalScore >= 75 && physicalScore < 90 ? "active-range" : ""
            }
          >
            <strong>GOOD</strong>

            <span>75 – 89.99</span>
          </div>

          <div
            className={
              physicalScore >= 60 && physicalScore < 75 ? "active-range" : ""
            }
          >
            <strong>REVIEW</strong>

            <span>60 – 74.99</span>
          </div>

          <div className={physicalScore < 60 ? "active-range" : ""}>
            <strong>POOR</strong>

            <span>Below 60</span>
          </div>
        </div>

        {/* WHY PHYSICAL */}

        <div className="reason-box">
          <div className="reason-icon">→</div>

          <div>
            <span>WHY THIS PHYSICAL STATUS?</span>

            <strong>Physical Status = {physicalStatus}</strong>

            <p>{getPhysicalDecisionExplanation()}</p>
          </div>
        </div>

        {/* PHYSICAL FINDINGS */}

        <div className="evidence-trace">
          <span>PHYSICAL AI EVIDENCE TRACE</span>

          <h5>Detected Quality Findings</h5>
        </div>

        {renderFindingList(physicalFindings, "physical")}
      </section>

      {/* =====================================================
          XAI SCOPE
      ===================================================== */}

      <div className="xai-scope-note">
        <div className="scope-icon">i</div>

        <div>
          <strong>Explainability Scope</strong>

          <p>
            This report provides a traceable decision-support explanation from
            measured sensor evidence and AI-detected physical conditions to
            component statuses and the final quality decision. It does not claim
            to interpret the internal neural network parameters themselves.
          </p>
        </div>
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`

        .quality-findings,
        .quality-findings * {
          box-sizing: border-box;
        }


        .quality-findings {
          width: 100%;
        }


        /* =================================================
           MAIN HEADER
        ================================================= */

        .xai-main-header {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 24px;

          margin-bottom: 18px;
        }


        .xai-main-label {
          display: block;

          margin-bottom: 6px;

          color: #dca05e;

          font-size: 9px;

          font-weight: 950;

          letter-spacing: 1.7px;
        }


        .xai-main-header h3 {
          margin: 0;

          color: #fff1dc;

          font-size: 23px;
        }


        .xai-main-header p {
          max-width: 680px;

          margin:
            7px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.4
            );

          font-size: 10px;

          line-height: 1.55;
        }


        .xai-flow-badge {
          display: flex;

          align-items: center;

          gap: 10px;

          flex-shrink: 0;

          padding:
            10px 13px;

          border-radius: 14px;

          background:
            rgba(
              217,
              145,
              72,
              0.07
            );

          border:
            1px solid
            rgba(
              229,
              165,
              98,
              0.11
            );
        }


        .xai-logo {
          width: 38px;
          height: 38px;

          display: grid;

          place-items: center;

          border-radius: 10px;

          color: #2b170b;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d08946
            );

          font-size: 8px;

          font-weight: 950;
        }


        .xai-flow-badge strong {
          display: block;

          color: #f0d9bb;

          font-size: 9px;
        }


        .xai-flow-badge span {
          display: block;

          margin-top: 3px;

          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 7px;
        }


        /* =================================================
           SECTION
        ================================================= */

        .explanation-section {
          margin-top: 15px;

          padding: 21px;

          border-radius: 20px;

          background:
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.035
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            ),
            rgba(
              0,
              0,
              0,
              0.09
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.075
            );
        }


        .explanation-section-header {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          padding-bottom: 15px;

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.04
            );
        }


        .section-identity {
          display: flex;

          align-items: center;

          gap: 11px;
        }


        .section-number {
          width: 42px;
          height: 42px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 12px;

          color: #28160b;

          background:
            linear-gradient(
              145deg,
              #ffdda5,
              #ce8242
            );

          font-size: 9px;

          font-weight: 950;
        }


        .section-identity span {
          display: block;

          color: #dca05e;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1.1px;
        }


        .section-identity h4 {
          margin:
            4px 0 0;

          color: #f4dfc1;

          font-size: 14px;
        }


        /* =================================================
           RESULT PILLS
        ================================================= */

        .result-pill {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding:
            7px 11px;

          flex-shrink: 0;

          border-radius: 999px;

          color:
            rgba(
              255,
              235,
              207,
              0.6
            );

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
              255,
              255,
              0.065
            );

          font-size: 8px;

          font-weight: 950;

          text-transform:
            uppercase;
        }


        .result-pill > span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            currentColor;
        }


        .result-good,
        .result-excellent {
          color: #a6e6af;

          background:
            rgba(
              59,
              156,
              75,
              0.09
            );

          border-color:
            rgba(
              96,
              198,
              108,
              0.15
            );
        }


        .result-review,
        .result-needs-review {
          color: #ffd18d;

          background:
            rgba(
              202,
              135,
              47,
              0.1
            );

          border-color:
            rgba(
              229,
              162,
              72,
              0.16
            );
        }


        .result-bad,
        .result-poor {
          color: #ffab97;

          background:
            rgba(
              181,
              58,
              43,
              0.1
            );

          border-color:
            rgba(
              222,
              85,
              65,
              0.16
            );
        }


        /* =================================================
           FINAL DECISION FLOW
        ================================================= */

        .final-decision-flow {
          margin-top: 16px;

          display: grid;

          grid-template-columns:
            minmax(130px, 1fr)
            auto
            minmax(130px, 1fr)
            auto
            minmax(130px, 1fr)
            auto
            minmax(110px, 0.7fr);

          align-items: stretch;

          gap: 8px;
        }


        .flow-card,
        .grade-result-card {
          padding: 14px;

          border-radius: 14px;

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
              170,
              0.06
            );
        }


        .flow-card > span,
        .grade-result-card > span {
          display: block;

          color:
            rgba(
              255,
              235,
              207,
              0.3
            );

          font-size: 7px;

          font-weight: 900;

          letter-spacing:
            0.8px;
        }


        .flow-card > strong {
          display: inline-block;

          margin-top: 5px;

          color: #ffe0aa;

          font-size: 23px;
        }


        .flow-card > small {
          margin-left: 3px;

          color:
            rgba(
              255,
              235,
              207,
              0.25
            );

          font-size: 7px;
        }


        .flow-card p {
          margin:
            5px 0 0;

          color:
            rgba(
              255,
              235,
              207,
              0.25
            );

          font-size: 7px;
        }


        .flow-card-highlight {
          background:
            rgba(
              208,
              133,
              62,
              0.07
            );

          border-color:
            rgba(
              223,
              157,
              89,
              0.12
            );
        }


        .grade-result-card {
          display: flex;

          flex-direction: column;

          justify-content: center;

          text-align: center;

          background:
            linear-gradient(
              145deg,
              rgba(
                215,
                140,
                67,
                0.11
              ),
              rgba(
                255,
                255,
                255,
                0.015
              )
            );
        }


        .grade-result-card strong {
          display: block;

          margin-top: 5px;

          color: #ffe0a6;

          font-size: 31px;

          line-height: 1;
        }


        .flow-arrow,
        .trace-arrow {
          display: grid;

          place-items: center;

          color:
            rgba(
              230,
              166,
              99,
              0.58
            );

          font-size: 16px;

          font-weight: 900;
        }


        /* =================================================
           CONTRIBUTION ROW
        ================================================= */

        .contribution-row {
          margin-top: 9px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              1fr
            );

          gap: 8px;
        }


        .contribution-row > div {
          padding:
            9px 11px;

          border-radius: 10px;

          background:
            rgba(
              0,
              0,
              0,
              0.08
            );
        }


        .contribution-row span {
          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 7px;
        }


        .contribution-row strong {
          display: block;

          margin-top: 3px;

          color: #e8d2b4;

          font-size: 10px;
        }


        /* =================================================
           REASON BOX
        ================================================= */

        .reason-box {
          margin-top: 13px;

          display: flex;

          align-items: flex-start;

          gap: 10px;

          padding: 13px;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              rgba(
                213,
                140,
                67,
                0.065
              ),
              rgba(
                255,
                255,
                255,
                0.015
              )
            );

          border:
            1px solid
            rgba(
              225,
              158,
              91,
              0.09
            );
        }


        .reason-icon {
          width: 30px;
          height: 30px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 9px;

          color: #2a160b;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d08946
            );

          font-size: 13px;

          font-weight: 950;
        }


        .reason-box span {
          display: block;

          color: #dca05e;

          font-size: 6px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .reason-box strong {
          display: block;

          margin-top: 3px;

          color: #f3dec0;

          font-size: 11px;
        }


        .reason-box p {
          margin:
            5px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.34
            );

          font-size: 8px;

          line-height: 1.55;
        }


        /* =================================================
           FINAL STATUS EXPLANATION
        ================================================= */

        .final-status-explanation {
          margin-top: 11px;

          padding: 13px;

          border-radius: 13px;

          background:
            rgba(
              255,
              255,
              255,
              0.022
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.055
            );
        }


        .final-status-heading {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;
        }


        .final-status-heading
        > div:first-child
        > span {
          display: block;

          color: #dca05e;

          font-size: 7px;

          font-weight: 900;
        }


        .final-status-heading
        > div:first-child
        > strong {
          display: block;

          margin-top: 3px;

          color: #f1dabb;

          font-size: 14px;
        }


        .component-statuses {
          display: flex;

          flex-wrap: wrap;

          gap: 8px;
        }


        .component-statuses > span {
          padding:
            5px 8px;

          border-radius: 8px;

          color:
            rgba(
              255,
              235,
              207,
              0.36
            );

          background:
            rgba(
              0,
              0,
              0,
              0.1
            );

          font-size: 7px;
        }


        .component-statuses strong {
          color: #edd5b6;
        }


        .final-status-explanation p {
          margin:
            9px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.34
            );

          font-size: 8px;

          line-height: 1.55;
        }


        /* =================================================
           SENSOR EVIDENCE
        ================================================= */

        .primary-sensor-evidence {
          margin-top: 16px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 10px;
        }


        .sensor-evidence-card {
          padding: 15px;

          border-radius: 14px;

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
              170,
              0.06
            );
        }


        .sensor-evidence-good {
          background:
            rgba(
              54,
              150,
              70,
              0.055
            );

          border-color:
            rgba(
              91,
              194,
              105,
              0.13
            );
        }


        .sensor-evidence-danger {
          background:
            rgba(
              178,
              56,
              42,
              0.06
            );

          border-color:
            rgba(
              220,
              83,
              63,
              0.14
            );
        }


        .sensor-evidence-header {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 8px;
        }


        .sensor-evidence-header
        > div
        > span {
          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 6px;

          font-weight: 900;
        }


        .sensor-evidence-header h5 {
          margin:
            3px 0 0;

          color: #efd8b9;

          font-size: 13px;
        }


        .threshold-badge {
          padding:
            5px 7px;

          border-radius: 999px;

          font-size: 6px;

          font-weight: 900;
        }


        .threshold-good {
          color: #a3e4ac;

          background:
            rgba(
              61,
              158,
              76,
              0.1
            );
        }


        .threshold-danger {
          color: #ffab97;

          background:
            rgba(
              183,
              57,
              43,
              0.12
            );
        }


        .threshold-neutral {
          color:
            rgba(
              255,
              235,
              207,
              0.4
            );

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );
        }


        .threshold-comparison {
          margin-top: 14px;

          display: grid;

          grid-template-columns:
            1fr auto 1fr;

          align-items: center;

          gap: 10px;
        }


        .threshold-comparison
        > div:not(
          .comparison-symbol
        ) {
          padding: 10px;

          border-radius: 10px;

          background:
            rgba(
              0,
              0,
              0,
              0.09
            );
        }


        .threshold-comparison span {
          display: block;

          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 7px;
        }


        .threshold-comparison strong {
          display: block;

          margin-top: 4px;

          color: #ffe0aa;

          font-size: 18px;
        }


        .comparison-symbol {
          color: #dca05e;

          font-size: 17px;

          font-weight: 950;
        }


        .sensor-vote-rule {
          margin-top: 9px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 8px;

          padding:
            8px 9px;

          border-radius: 9px;

          background:
            rgba(
              0,
              0,
              0,
              0.08
            );
        }


        .sensor-vote-rule span {
          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 6px;

          font-weight: 800;
        }


        .sensor-vote-rule strong {
          color: #ead3b4;

          font-size: 8px;
        }


        .temperature-supporting-box {
          margin-top: 10px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding: 12px;

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              0.02
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.05
            );
        }


        .temperature-supporting-box
        > div:first-child
        > span {
          display: block;

          color: #dca05e;

          font-size: 6px;

          font-weight: 900;

          letter-spacing: 0.8px;
        }


        .temperature-supporting-box
        > div:first-child
        > strong {
          display: block;

          margin-top: 3px;

          color: #ead4b6;

          font-size: 10px;
        }


        .temperature-supporting-box
        > div:last-child {
          text-align: right;
        }


        .temperature-supporting-box
        > div:last-child
        > strong {
          display: block;

          color: #ffe0aa;

          font-size: 16px;
        }


        .temperature-supporting-box small {
          display: block;

          max-width: 430px;

          margin-top: 3px;

          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 7px;

          line-height: 1.45;
        }


        /* =================================================
           LOGIC
        ================================================= */

        .decision-logic-box {
          margin-top: 11px;

          padding: 13px;

          border-radius: 13px;

          background:
            rgba(
              0,
              0,
              0,
              0.08
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.05
            );
        }


        .logic-heading span {
          display: block;

          color: #dca05e;

          font-size: 6px;

          font-weight: 900;
        }


        .logic-heading strong {
          display: block;

          margin-top: 3px;

          color: #ead4b6;

          font-size: 10px;
        }


        .sensor-vote-summary {
          margin-top: 10px;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 8px;
        }


        .sensor-vote-summary > div {
          padding:
            9px 10px;

          border-radius: 9px;

          background:
            rgba(
              255,
              255,
              255,
              0.02
            );
        }


        .sensor-vote-summary span {
          display: block;

          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 6px;

          font-weight: 850;
        }


        .sensor-vote-summary strong {
          display: block;

          margin-top: 4px;

          color: #ffe0aa;

          font-size: 12px;
        }


        .sensor-score-formula {
          margin-top: 8px;

          padding:
            8px 9px;

          border-radius: 9px;

          background:
            rgba(
              216,
              145,
              72,
              0.055
            );

          border:
            1px solid
            rgba(
              226,
              160,
              92,
              0.08
            );
        }


        .sensor-score-formula span {
          display: block;

          color: #dca05e;

          font-size: 6px;

          font-weight: 900;
        }


        .sensor-score-formula strong {
          display: block;

          margin-top: 3px;

          color: #ead4b6;

          font-size: 9px;
        }


        .logic-rules {
          margin-top: 10px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              1fr
            );

          gap: 8px;
        }


        .logic-rules > div {
          display: grid;

          grid-template-columns:
            auto 1fr auto;

          align-items: center;

          gap: 6px;

          padding:
            8px 9px;

          border-radius: 9px;

          background:
            rgba(
              255,
              255,
              255,
              0.02
            );
        }


        .logic-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;
        }


        .good-dot {
          background: #79cc86;
        }


        .warning-dot {
          background: #dea04f;
        }


        .danger-dot {
          background: #da6653;
        }


        .logic-rules p {
          margin: 0;

          color:
            rgba(
              255,
              235,
              207,
              0.3
            );

          font-size: 7px;
        }


        .logic-rules strong {
          color: #ead3b4;

          font-size: 7px;
        }


        /* =================================================
           EVIDENCE TRACE
        ================================================= */

        .evidence-trace {
          margin-top: 18px;
        }


        .evidence-trace > span {
          color: #dca05e;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1.1px;
        }


        .evidence-trace h5 {
          margin:
            3px 0 0;

          color: #ead4b6;

          font-size: 11px;
        }


        .xai-finding-list {
          margin-top: 9px;

          display: grid;

          gap: 8px;
        }


        .xai-finding-item {
          display: grid;

          grid-template-columns:
            auto auto 1fr;

          align-items: flex-start;

          gap: 9px;

          padding: 11px;

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              0.022
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.05
            );
        }


        .finding-number {
          width: 23px;
          height: 23px;

          display: grid;

          place-items: center;

          border-radius: 7px;

          color:
            rgba(
              255,
              232,
              200,
              0.46
            );

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          font-size: 7px;

          font-weight: 900;
        }


        .finding-status-icon {
          width: 24px;
          height: 24px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          font-size: 9px;

          font-weight: 950;
        }


        .finding-normal
        .finding-status-icon {
          color: #a6e5ae;

          background:
            rgba(
              65,
              164,
              79,
              0.12
            );
        }


        .finding-warning
        .finding-status-icon {
          color: #ffd18c;

          background:
            rgba(
              208,
              138,
              48,
              0.12
            );
        }


        .finding-danger
        .finding-status-icon {
          color: #ffaaa0;

          background:
            rgba(
              190,
              61,
              49,
              0.13
            );
        }


        .finding-info
        .finding-status-icon {
          color: #adccec;

          background:
            rgba(
              78,
              131,
              183,
              0.12
            );
        }


        .finding-content > span {
          display: block;

          color:
            rgba(
              220,
              159,
              93,
              0.6
            );

          font-size: 6px;

          font-weight: 900;
        }


        .finding-content > strong {
          display: block;

          margin-top: 2px;

          color: #f1dbbd;

          font-size: 10px;
        }


        .finding-content p {
          margin:
            4px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.34
            );

          font-size: 8px;

          line-height: 1.5;
        }


        .xai-no-findings {
          margin-top: 9px;

          padding: 10px;

          border-radius: 10px;

          color:
            rgba(
              255,
              235,
              207,
              0.35
            );

          background:
            rgba(
              255,
              255,
              255,
              0.02
            );

          font-size: 8px;
        }


        /* =================================================
           PHYSICAL DETECTIONS
        ================================================= */

        .physical-detection-grid {
          margin-top: 16px;

          display: grid;

          grid-template-columns:
            repeat(
              5,
              minmax(
                0,
                1fr
              )
            );

          gap: 8px;
        }


        .detection-card {
          padding: 12px;

          border-radius: 12px;

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
              170,
              0.05
            );
        }


        .detection-card > span {
          display: block;

          font-size: 6px;

          font-weight: 900;

          letter-spacing: 0.8px;
        }


        .detection-card > strong {
          display: block;

          margin-top: 5px;

          color: #ffe0aa;

          font-size: 23px;
        }


        .detection-card > small {
          display: block;

          margin-top: 3px;

          color:
            rgba(
              255,
              235,
              207,
              0.25
            );

          font-size: 6px;
        }


        .detection-good {
          background:
            rgba(
              53,
              148,
              69,
              0.055
            );

          border-color:
            rgba(
              91,
              190,
              104,
              0.13
            );
        }


        .detection-good > span {
          color: #8cd297;
        }


        .detection-warning {
          background:
            rgba(
              188,
              120,
              39,
              0.055
            );

          border-color:
            rgba(
              218,
              153,
              67,
              0.13
            );
        }


        .detection-warning > span {
          color: #e2aa5e;
        }


        .detection-danger {
          background:
            rgba(
              171,
              51,
              40,
              0.06
            );

          border-color:
            rgba(
              217,
              80,
              60,
              0.14
            );
        }


        .detection-danger > span {
          color: #e77e6a;
        }


        .detection-neutral > span {
          color:
            rgba(
              255,
              225,
              187,
              0.42
            );
        }


        /* =================================================
           PHYSICAL IMPACT
        ================================================= */

        .physical-impact-grid {
          margin-top: 9px;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              1fr
            );

          gap: 8px;
        }


        .physical-impact-grid > div {
          padding:
            9px 10px;

          border-radius: 10px;

          background:
            rgba(
              0,
              0,
              0,
              0.08
            );
        }


        .physical-impact-grid span {
          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 7px;
        }


        .physical-impact-grid strong {
          display: block;

          margin-top: 3px;

          color: #ead3b4;

          font-size: 11px;
        }


        .physical-impact-grid small {
          display: block;

          margin-top: 2px;

          color:
            rgba(
              255,
              235,
              207,
              0.2
            );

          font-size: 6px;
        }


        /* =================================================
           PHYSICAL SCORE TRACE
        ================================================= */

        .physical-score-trace {
          margin-top: 11px;

          display: grid;

          grid-template-columns:
            1fr auto 1fr auto 1fr auto 1fr;

          gap: 7px;

          align-items: stretch;
        }


        .physical-score-trace
        > div:not(
          .trace-arrow
        ) {
          padding: 11px;

          border-radius: 11px;

          background:
            rgba(
              255,
              255,
              255,
              0.022
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.05
            );
        }


        .physical-score-trace span {
          display: block;

          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 6px;

          font-weight: 900;
        }


        .physical-score-trace strong {
          display: inline-block;

          margin-top: 4px;

          color: #efd5b5;

          font-size: 15px;
        }


        .physical-score-trace small {
          margin-left: 2px;

          color:
            rgba(
              255,
              235,
              207,
              0.23
            );

          font-size: 6px;
        }


        .trace-result {
          background:
            rgba(
              210,
              136,
              63,
              0.06
            ) !important;
        }


        /* =================================================
           PHYSICAL RANGE
        ================================================= */

        .physical-status-ranges {
          margin-top: 9px;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              1fr
            );

          gap: 7px;
        }


        .physical-status-ranges
        > div {
          padding:
            8px 9px;

          border-radius: 9px;

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.04
            );
        }


        .physical-status-ranges
        strong {
          display: block;

          color:
            rgba(
              255,
              234,
              204,
              0.42
            );

          font-size: 7px;
        }


        .physical-status-ranges
        span {
          display: block;

          margin-top: 2px;

          color:
            rgba(
              255,
              235,
              207,
              0.22
            );

          font-size: 6px;
        }


        .physical-status-ranges
        .active-range {
          background:
            rgba(
              214,
              141,
              68,
              0.09
            );

          border-color:
            rgba(
              228,
              162,
              92,
              0.15
            );
        }


        .physical-status-ranges
        .active-range strong {
          color: #ffd18d;
        }


        /* =================================================
           XAI SCOPE
        ================================================= */

        .xai-scope-note {
          margin-top: 14px;

          display: flex;

          align-items: flex-start;

          gap: 9px;

          padding: 12px;

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.05
            );
        }


        .scope-icon {
          width: 21px;
          height: 21px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: #dca05e;

          border:
            1px solid
            rgba(
              220,
              160,
              94,
              0.2
            );

          font-size: 7px;

          font-weight: 900;
        }


        .xai-scope-note strong {
          color: #ead3b4;

          font-size: 9px;
        }


        .xai-scope-note p {
          margin:
            3px 0 0;

          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 7px;

          line-height: 1.5;
        }


        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (
          max-width: 1050px
        ) {

          .final-decision-flow {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }


          .flow-arrow {
            display: none;
          }


          .primary-sensor-evidence {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }


          .sensor-vote-summary {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }


          .physical-detection-grid {
            grid-template-columns:
              repeat(
                3,
                1fr
              );
          }


          .physical-score-trace {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }


          .trace-arrow {
            display: none;
          }

        }


        @media (
          max-width: 800px
        ) {

          .xai-main-header {
            flex-direction: column;
          }


          .explanation-section-header {
            align-items: flex-start;

            flex-direction: column;
          }


          .primary-sensor-evidence {
            grid-template-columns:
              1fr;
          }


          .temperature-supporting-box {
            align-items: flex-start;

            flex-direction: column;
          }


          .temperature-supporting-box
          > div:last-child {
            text-align: left;
          }


          .sensor-vote-summary {
            grid-template-columns:
              1fr;
          }


          .logic-rules {
            grid-template-columns:
              1fr;
          }


          .physical-impact-grid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }


          .final-status-heading {
            align-items: flex-start;

            flex-direction: column;
          }

        }


        @media (
          max-width: 600px
        ) {

          .explanation-section {
            padding: 16px;
          }


          .final-decision-flow,
          .contribution-row,
          .physical-detection-grid,
          .physical-impact-grid,
          .physical-score-trace,
          .physical-status-ranges {
            grid-template-columns:
              1fr;
          }


          .threshold-comparison {
            grid-template-columns:
              1fr;
          }


          .comparison-symbol {
            display: none;
          }

        }

      `}</style>
    </div>
  );
}

export default QualityFindings;
