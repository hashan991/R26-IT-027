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
        /*
          QualityFindings / Explainable Quality Analysis
          Light coffee-theme redesign.
          IMPORTANT: All assessment logic, thresholds, scoring, voting,
          grade calculation and finding generation remain unchanged.
        */

        .quality-findings,
        .quality-findings * {
          box-sizing: border-box;
        }

        .quality-findings {
          width: 100%;
          color: #342117;
        }

        /* =================================================
           MAIN HEADER
        ================================================= */

        .quality-findings .xai-main-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 20px;
        }

        .quality-findings .xai-main-label {
          display: block;
          margin-bottom: 7px;
          color: #9d6030;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1.35px;
          text-transform: uppercase;
        }

        .quality-findings .xai-main-header h3 {
          margin: 0;
          color: #2d1a12;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 28px;
          line-height: 1.2;
        }

        .quality-findings .xai-main-header p {
          max-width: 760px;
          margin: 9px 0 0;
          color: #786a61;
          font-size: 13px;
          line-height: 1.65;
        }

        .quality-findings .xai-flow-badge {
          display: flex;
          align-items: center;
          gap: 11px;
          flex-shrink: 0;
          padding: 11px 14px;
          border: 1px solid #e4d5c3;
          border-radius: 14px;
          background: #fff9f2;
        }

        .quality-findings .xai-logo {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #fff8ef;
          background: #4b2818;
          font-size: 10px;
          font-weight: 900;
        }

        .quality-findings .xai-flow-badge strong {
          display: block;
          color: #3c271c;
          font-size: 12px;
        }

        .quality-findings .xai-flow-badge span {
          display: block;
          margin-top: 3px;
          color: #85746a;
          font-size: 10px;
        }

        /* =================================================
           EXPLANATION SECTIONS
        ================================================= */

        .quality-findings .explanation-section {
          margin-top: 18px;
          padding: 24px;
          border: 1px solid #e4d7ca;
          border-radius: 18px;
          background: #fffdfa;
          box-shadow: 0 8px 24px rgba(65, 38, 24, 0.045);
        }

        .quality-findings .explanation-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 17px;
          border-bottom: 1px solid #eadfd5;
        }

        .quality-findings .section-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quality-findings .section-number {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 12px;
          color: #fff8ef;
          background: #4b2818;
          font-size: 11px;
          font-weight: 900;
        }

        .quality-findings .section-identity span {
          display: block;
          color: #9e6030;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .quality-findings .section-identity h4 {
          margin: 5px 0 0;
          color: #332016;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          line-height: 1.3;
        }

        /* =================================================
           RESULT PILLS
        ================================================= */

        .quality-findings .result-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          padding: 7px 11px;
          border: 1px solid #ddd1c5;
          border-radius: 999px;
          color: #65574e;
          background: #f8f4ef;
          font-size: 10px;
          font-weight: 850;
          text-transform: uppercase;
        }

        .quality-findings .result-pill > span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .quality-findings .result-good,
        .quality-findings .result-excellent {
          color: #357348;
          background: #edf7ef;
          border-color: #c9e1cd;
        }

        .quality-findings .result-review,
        .quality-findings .result-needs-review {
          color: #895916;
          background: #fff6e8;
          border-color: #ead3a8;
        }

        .quality-findings .result-bad,
        .quality-findings .result-poor {
          color: #a74736;
          background: #fdf0ed;
          border-color: #e8c2ba;
        }

        /* =================================================
           FINAL DECISION FLOW
        ================================================= */

        .quality-findings .final-decision-flow {
          margin-top: 18px;
          display: grid;
          grid-template-columns:
            minmax(145px, 1fr)
            auto
            minmax(145px, 1fr)
            auto
            minmax(145px, 1fr)
            auto
            minmax(120px, 0.75fr);
          align-items: stretch;
          gap: 9px;
        }

        .quality-findings .flow-card,
        .quality-findings .grade-result-card {
          min-height: 112px;
          padding: 16px;
          border: 1px solid #e4d8cd;
          border-radius: 14px;
          background: #fffaf5;
        }

        .quality-findings .flow-card > span,
        .quality-findings .grade-result-card > span {
          display: block;
          color: #837268;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.75px;
          text-transform: uppercase;
        }

        .quality-findings .flow-card > strong {
          display: inline-block;
          margin-top: 7px;
          color: #372117;
          font-size: 28px;
          font-weight: 900;
          line-height: 1;
        }

        .quality-findings .flow-card > small {
          margin-left: 3px;
          color: #87756a;
          font-size: 10px;
        }

        .quality-findings .flow-card p {
          margin: 7px 0 0;
          color: #78695f;
          font-size: 11px;
        }

        .quality-findings .flow-card-highlight {
          background: #fbf1e5;
          border-color: #dfc6aa;
        }

        .quality-findings .grade-result-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
          background: #f4e5d3;
          border-color: #d8baa0;
        }

        .quality-findings .grade-result-card strong {
          display: block;
          margin-top: 7px;
          color: #482718;
          font-size: 34px;
          line-height: 1;
        }

        .quality-findings .flow-arrow,
        .quality-findings .trace-arrow {
          display: grid;
          place-items: center;
          color: #a36638;
          font-size: 19px;
          font-weight: 900;
        }

        /* =================================================
           CONTRIBUTIONS
        ================================================= */

        .quality-findings .contribution-row {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
        }

        .quality-findings .contribution-row > div {
          padding: 11px 13px;
          border: 1px solid #eadfd5;
          border-radius: 11px;
          background: #faf6f1;
        }

        .quality-findings .contribution-row span {
          color: #7e6e64;
          font-size: 10px;
        }

        .quality-findings .contribution-row strong {
          display: block;
          margin-top: 4px;
          color: #38241a;
          font-size: 13px;
        }

        /* =================================================
           REASON / FINAL STATUS
        ================================================= */

        .quality-findings .reason-box {
          margin-top: 14px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 15px;
          border: 1px solid #e7d6c4;
          border-radius: 13px;
          background: #fff8f0;
        }

        .quality-findings .reason-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #fff8ef;
          background: #4b2818;
          font-size: 14px;
          font-weight: 900;
        }

        .quality-findings .reason-box span {
          display: block;
          color: #9a5d2f;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .quality-findings .reason-box strong {
          display: block;
          margin-top: 4px;
          color: #3b261b;
          font-size: 13px;
        }

        .quality-findings .reason-box p {
          margin: 6px 0 0;
          color: #75675e;
          font-size: 12px;
          line-height: 1.6;
        }

        .quality-findings .final-status-explanation {
          margin-top: 12px;
          padding: 15px;
          border: 1px solid #e7ddd3;
          border-radius: 13px;
          background: #faf6f2;
        }

        .quality-findings .final-status-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .quality-findings
          .final-status-heading
          > div:first-child
          > span {
          display: block;
          color: #9a5d2f;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .quality-findings
          .final-status-heading
          > div:first-child
          > strong {
          display: block;
          margin-top: 4px;
          color: #3b261b;
          font-size: 16px;
        }

        .quality-findings .component-statuses {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .quality-findings .component-statuses > span {
          padding: 6px 9px;
          border: 1px solid #e3d7cb;
          border-radius: 8px;
          color: #74655b;
          background: #fffdfa;
          font-size: 10px;
        }

        .quality-findings .component-statuses strong {
          color: #3d291f;
        }

        .quality-findings .final-status-explanation p {
          margin: 10px 0 0;
          color: #75675e;
          font-size: 12px;
          line-height: 1.6;
        }

        /* =================================================
           SENSOR EVIDENCE
        ================================================= */

        .quality-findings .primary-sensor-evidence {
          margin-top: 17px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
        }

        .quality-findings .sensor-evidence-card {
          padding: 16px;
          border: 1px solid #e2d7cc;
          border-radius: 14px;
          background: #fffaf6;
        }

        .quality-findings .sensor-evidence-good {
          background: #f0f8f1;
          border-color: #c9e2cd;
        }

        .quality-findings .sensor-evidence-danger {
          background: #fff1ed;
          border-color: #e9c5bc;
        }

        .quality-findings .sensor-evidence-neutral {
          background: #f7f4f1;
          border-color: #ddd3ca;
        }

        .quality-findings .sensor-evidence-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 9px;
        }

        .quality-findings .sensor-evidence-header > div > span {
          color: #86766b;
          font-size: 9px;
          font-weight: 850;
          text-transform: uppercase;
        }

        .quality-findings .sensor-evidence-header h5 {
          margin: 4px 0 0;
          color: #38241a;
          font-size: 15px;
        }

        .quality-findings .threshold-badge {
          padding: 6px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 850;
        }

        .quality-findings .threshold-good {
          color: #347247;
          background: #dcefe0;
        }

        .quality-findings .threshold-danger {
          color: #a44636;
          background: #f5d9d3;
        }

        .quality-findings .threshold-neutral {
          color: #74665c;
          background: #e9e3dd;
        }

        .quality-findings .threshold-comparison {
          margin-top: 15px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 10px;
        }

        .quality-findings
          .threshold-comparison
          > div:not(.comparison-symbol) {
          padding: 11px;
          border: 1px solid #eadfd5;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.72);
        }

        .quality-findings .threshold-comparison span {
          display: block;
          color: #806f65;
          font-size: 10px;
        }

        .quality-findings .threshold-comparison strong {
          display: block;
          margin-top: 5px;
          color: #352218;
          font-size: 20px;
        }

        .quality-findings .comparison-symbol {
          color: #9a5f31;
          font-size: 18px;
          font-weight: 900;
        }

        .quality-findings .sensor-vote-rule {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 9px 10px;
          border: 1px solid #e7ddd3;
          border-radius: 9px;
          background: #faf6f1;
        }

        .quality-findings .sensor-vote-rule span {
          color: #7d6d63;
          font-size: 9px;
          font-weight: 750;
        }

        .quality-findings .sensor-vote-rule strong {
          color: #4a3023;
          font-size: 10px;
        }

        .quality-findings .temperature-supporting-box {
          margin-top: 11px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px;
          border: 1px solid #dfd6cd;
          border-radius: 12px;
          background: #f8f5f2;
        }

        .quality-findings
          .temperature-supporting-box
          > div:first-child
          > span {
          display: block;
          color: #9a5d2f;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.75px;
          text-transform: uppercase;
        }

        .quality-findings
          .temperature-supporting-box
          > div:first-child
          > strong {
          display: block;
          margin-top: 4px;
          color: #3d291f;
          font-size: 12px;
        }

        .quality-findings
          .temperature-supporting-box
          > div:last-child {
          text-align: right;
        }

        .quality-findings
          .temperature-supporting-box
          > div:last-child
          > strong {
          display: block;
          color: #3b261b;
          font-size: 19px;
        }

        .quality-findings .temperature-supporting-box small {
          display: block;
          max-width: 500px;
          margin-top: 4px;
          color: #7a6b61;
          font-size: 10px;
          line-height: 1.5;
        }

        /* =================================================
           SENSOR DECISION LOGIC
        ================================================= */

        .quality-findings .decision-logic-box {
          margin-top: 12px;
          padding: 15px;
          border: 1px solid #e5d9ce;
          border-radius: 13px;
          background: #faf6f1;
        }

        .quality-findings .logic-heading span {
          display: block;
          color: #9a5d2f;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.75px;
          text-transform: uppercase;
        }

        .quality-findings .logic-heading strong {
          display: block;
          margin-top: 4px;
          color: #3c281e;
          font-size: 12px;
        }

        .quality-findings .sensor-vote-summary {
          margin-top: 11px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 9px;
        }

        .quality-findings .sensor-vote-summary > div {
          padding: 11px;
          border: 1px solid #e7ddd3;
          border-radius: 10px;
          background: #fffdfa;
        }

        .quality-findings .sensor-vote-summary span {
          display: block;
          color: #7d6d63;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .quality-findings .sensor-vote-summary strong {
          display: block;
          margin-top: 5px;
          color: #38241a;
          font-size: 15px;
        }

        .quality-findings .logic-rules {
          margin-top: 11px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
        }

        .quality-findings .logic-rules > div {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 7px;
          padding: 10px;
          border: 1px solid #e7ddd3;
          border-radius: 9px;
          color: #75665c;
          background: #fffdfa;
          font-size: 10px;
        }

        .quality-findings .logic-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .quality-findings .good-dot {
          background: #62b873;
        }

        .quality-findings .warning-dot {
          background: #d69a46;
        }

        .quality-findings .danger-dot {
          background: #cc6552;
        }

        .quality-findings .logic-rules strong {
          color: #3f2b20;
          font-size: 10px;
        }

        .quality-findings .sensor-score-formula {
          margin-top: 9px;
          padding: 10px 11px;
          border: 1px solid #e3cfba;
          border-radius: 9px;
          background: #fbf0e4;
        }

        .quality-findings .sensor-score-formula span {
          display: block;
          color: #9b5f31;
          font-size: 9px;
          font-weight: 850;
          text-transform: uppercase;
        }

        .quality-findings .sensor-score-formula strong {
          display: block;
          margin-top: 4px;
          color: #4a3022;
          font-size: 11px;
        }

        /* =================================================
           EVIDENCE TRACE / FINDINGS
        ================================================= */

        .quality-findings .evidence-trace {
          margin-top: 20px;
        }

        .quality-findings .evidence-trace > span {
          color: #9a5d2f;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .quality-findings .evidence-trace h5 {
          margin: 4px 0 0;
          color: #3b271c;
          font-size: 14px;
        }

        .quality-findings .xai-finding-list {
          margin-top: 10px;
          display: grid;
          gap: 9px;
        }

        .quality-findings .xai-finding-item {
          display: grid;
          grid-template-columns: auto auto 1fr;
          align-items: flex-start;
          gap: 10px;
          padding: 13px;
          border: 1px solid #e6ddd4;
          border-radius: 12px;
          background: #fffaf6;
        }

        .quality-findings .finding-number {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          color: #65564c;
          background: #eee5dc;
          font-size: 9px;
          font-weight: 850;
        }

        .quality-findings .finding-status-icon {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 900;
        }

        .quality-findings .finding-normal .finding-status-icon {
          color: #347247;
          background: #dcefe0;
        }

        .quality-findings .finding-warning .finding-status-icon {
          color: #8b5b16;
          background: #f7e6c7;
        }

        .quality-findings .finding-danger .finding-status-icon {
          color: #a44636;
          background: #f5d9d3;
        }

        .quality-findings .finding-info .finding-status-icon {
          color: #486f95;
          background: #dce9f4;
        }

        .quality-findings .finding-content > span {
          display: block;
          color: #9a5d2f;
          font-size: 9px;
          font-weight: 850;
          text-transform: uppercase;
        }

        .quality-findings .finding-content > strong {
          display: block;
          margin-top: 3px;
          color: #3b271c;
          font-size: 12px;
        }

        .quality-findings .finding-content p {
          margin: 5px 0 0;
          color: #75675e;
          font-size: 11px;
          line-height: 1.55;
        }

        .quality-findings .xai-no-findings {
          margin-top: 10px;
          padding: 11px;
          border: 1px solid #e7ddd4;
          border-radius: 10px;
          color: #76685e;
          background: #faf7f3;
          font-size: 11px;
        }

        /* =================================================
           PHYSICAL DETECTION EVIDENCE
        ================================================= */

        .quality-findings .physical-detection-grid {
          margin-top: 17px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 9px;
        }

        .quality-findings .detection-card {
          min-height: 105px;
          padding: 14px;
          border: 1px solid #e5d9ce;
          border-radius: 12px;
          background: #fffaf6;
        }

        .quality-findings .detection-card > span {
          display: block;
          color: #806f65;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .quality-findings .detection-card > strong {
          display: block;
          margin-top: 7px;
          color: #342117;
          font-size: 26px;
          line-height: 1;
        }

        .quality-findings .detection-card > small {
          display: block;
          margin-top: 5px;
          color: #7d6d63;
          font-size: 9px;
        }

        .quality-findings .detection-good {
          background: #f0f8f1;
          border-color: #c9e2cd;
        }

        .quality-findings .detection-good > span {
          color: #39764a;
        }

        .quality-findings .detection-warning {
          background: #fff7e9;
          border-color: #ead5aa;
        }

        .quality-findings .detection-warning > span {
          color: #91601c;
        }

        .quality-findings .detection-danger {
          background: #fff0ec;
          border-color: #e9c4bb;
        }

        .quality-findings .detection-danger > span {
          color: #a64838;
        }

        .quality-findings .detection-neutral {
          background: #f5f2ef;
          border-color: #ddd4cb;
        }

        .quality-findings .detection-neutral > span {
          color: #75675d;
        }

        /* =================================================
           PHYSICAL IMPACT
        ================================================= */

        .quality-findings .physical-impact-grid {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 9px;
        }

        .quality-findings .physical-impact-grid > div {
          padding: 11px 12px;
          border: 1px solid #e7ddd4;
          border-radius: 10px;
          background: #faf6f1;
        }

        .quality-findings .physical-impact-grid span {
          color: #7c6c62;
          font-size: 10px;
        }

        .quality-findings .physical-impact-grid strong {
          display: block;
          margin-top: 4px;
          color: #3a261c;
          font-size: 14px;
        }

        .quality-findings .physical-impact-grid small {
          display: block;
          margin-top: 3px;
          color: #8a7a70;
          font-size: 9px;
        }

        /* =================================================
           PHYSICAL SCORE TRACE
        ================================================= */

        .quality-findings .physical-score-trace {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          gap: 8px;
          align-items: stretch;
        }

        .quality-findings
          .physical-score-trace
          > div:not(.trace-arrow) {
          min-height: 92px;
          padding: 12px;
          border: 1px solid #e5dad0;
          border-radius: 11px;
          background: #fffaf6;
        }

        .quality-findings .physical-score-trace span {
          display: block;
          color: #7d6d63;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .quality-findings .physical-score-trace strong {
          display: inline-block;
          margin-top: 6px;
          color: #3b271c;
          font-size: 18px;
        }

        .quality-findings .physical-score-trace small {
          margin-left: 2px;
          color: #85756a;
          font-size: 9px;
        }

        .quality-findings .trace-result {
          background: #fbefe2 !important;
          border-color: #dfc7ad !important;
        }

        /* =================================================
           PHYSICAL STATUS RANGES
        ================================================= */

        .quality-findings .physical-status-ranges {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .quality-findings .physical-status-ranges > div {
          padding: 10px;
          border: 1px solid #e4dad1;
          border-radius: 9px;
          background: #faf7f3;
        }

        .quality-findings .physical-status-ranges strong {
          display: block;
          color: #6f6158;
          font-size: 10px;
        }

        .quality-findings .physical-status-ranges span {
          display: block;
          margin-top: 3px;
          color: #88786d;
          font-size: 9px;
        }

        .quality-findings .physical-status-ranges .active-range {
          background: #f6e7d6;
          border-color: #d8b898;
        }

        .quality-findings
          .physical-status-ranges
          .active-range
          strong {
          color: #754322;
        }

        /* =================================================
           XAI SCOPE
        ================================================= */

        .quality-findings .xai-scope-note {
          margin-top: 15px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px;
          border: 1px solid #e6ddd4;
          border-radius: 12px;
          background: #faf7f3;
        }

        .quality-findings .scope-icon {
          width: 23px;
          height: 23px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid #d6b48d;
          border-radius: 50%;
          color: #995d30;
          font-size: 9px;
          font-weight: 900;
        }

        .quality-findings .xai-scope-note strong {
          color: #3b281e;
          font-size: 11px;
        }

        .quality-findings .xai-scope-note p {
          margin: 4px 0 0;
          color: #75675e;
          font-size: 10px;
          line-height: 1.55;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1100px) {
          .quality-findings .final-decision-flow {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .quality-findings .flow-arrow {
            display: none;
          }

          .quality-findings .primary-sensor-evidence {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .quality-findings .physical-detection-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .quality-findings .physical-score-trace {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .quality-findings .trace-arrow {
            display: none;
          }
        }

        @media (max-width: 820px) {
          .quality-findings .xai-main-header,
          .quality-findings .explanation-section-header,
          .quality-findings .final-status-heading,
          .quality-findings .temperature-supporting-box {
            align-items: flex-start;
            flex-direction: column;
          }

          .quality-findings
            .temperature-supporting-box
            > div:last-child {
            text-align: left;
          }

          .quality-findings .primary-sensor-evidence,
          .quality-findings .sensor-vote-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .quality-findings .logic-rules {
            grid-template-columns: 1fr;
          }

          .quality-findings .physical-impact-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .quality-findings .explanation-section {
            padding: 17px;
          }

          .quality-findings .xai-main-header h3 {
            font-size: 24px;
          }

          .quality-findings .final-decision-flow,
          .quality-findings .contribution-row,
          .quality-findings .primary-sensor-evidence,
          .quality-findings .sensor-vote-summary,
          .quality-findings .physical-detection-grid,
          .quality-findings .physical-impact-grid,
          .quality-findings .physical-score-trace,
          .quality-findings .physical-status-ranges {
            grid-template-columns: 1fr;
          }

          .quality-findings .threshold-comparison {
            grid-template-columns: 1fr;
          }

          .quality-findings .comparison-symbol {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default QualityFindings;
