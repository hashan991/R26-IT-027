import {
  SENSOR_THRESHOLDS,
  TOTAL_VOTING_SENSORS,
  SENSOR_VOTE_WEIGHT,
} from "/src/features/bean-defect-detection/config/sensorQualityConfig";

function SensorAssessmentCard({ sensorAssessment = {} }) {
  // =========================================================
  // OVERALL SENSOR STATUS
  // =========================================================

  const status = sensorAssessment.status || "Waiting";

  const statusClass = String(status).toLowerCase().replace(/\s+/g, "-");

  // =========================================================
  // EXPERIMENTALLY DERIVED FIVE-SENSOR THRESHOLDS
  // =========================================================
  //
  // Response = Sample - Baseline
  //
  // Voting sensors:
  //
  // MQ-2      BAD when response >= 129.5
  // MQ-3      BAD when response >= 38.5
  // MQ-135    BAD when response >= 9.5
  // Moisture  BAD when response <= -16
  // Humidity  BAD when response >= 10.7
  //
  // Temperature is supporting environmental information only.
  // =========================================================

  const thresholds = {
    mq2: Number(
      sensorAssessment.mq2_threshold ?? SENSOR_THRESHOLDS.mq2.badThreshold,
    ),

    mq3: Number(
      sensorAssessment.mq3_threshold ?? SENSOR_THRESHOLDS.mq3.badThreshold,
    ),

    mq135: Number(
      sensorAssessment.mq135_threshold ?? SENSOR_THRESHOLDS.mq135.badThreshold,
    ),

    moisture: Number(
      sensorAssessment.moisture_threshold ??
        SENSOR_THRESHOLDS.moisture.badThreshold,
    ),

    humidity: Number(
      sensorAssessment.humidity_threshold ??
        SENSOR_THRESHOLDS.humidity.badThreshold,
    ),
  };

  // =========================================================
  // FORMAT VALUE
  // =========================================================

  const formatValue = (value, decimals = 2) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return value;
    }

    return number.toFixed(decimals);
  };

  const formatThreshold = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "-";
    }

    return Number.isInteger(number) ? number.toString() : number.toFixed(1);
  };

  // =========================================================
  // SENSOR VOTE HELPERS
  // =========================================================

  const calculateBadVote = ({ response, backendBad, threshold, direction }) => {
    if (typeof backendBad === "boolean") {
      return backendBad;
    }

    if (response === null || response === undefined || response === "") {
      return null;
    }

    const numericResponse = Number(response);
    const numericThreshold = Number(threshold);

    if (
      !Number.isFinite(numericResponse) ||
      !Number.isFinite(numericThreshold)
    ) {
      return null;
    }

    if (direction === "low") {
      return numericResponse <= numericThreshold;
    }

    return numericResponse >= numericThreshold;
  };

  // =========================================================
  // SENSOR DATA
  // =========================================================

  const sensors = [
    {
      key: "mq2",
      name: "MQ-2",
      type: "Gas Sensor",
      response: sensorAssessment.mq2_response,
      threshold: thresholds.mq2,
      direction: "high",
      bad: sensorAssessment.mq2_bad,
      voting: true,
    },

    {
      key: "mq3",
      name: "MQ-3",
      type: "Gas Sensor",
      response: sensorAssessment.mq3_response,
      threshold: thresholds.mq3,
      direction: "high",
      bad: sensorAssessment.mq3_bad,
      voting: true,
    },

    {
      key: "mq135",
      name: "MQ-135",
      type: "Gas Sensor",
      response: sensorAssessment.mq135_response,
      threshold: thresholds.mq135,
      direction: "high",
      bad: sensorAssessment.mq135_bad,
      voting: true,
    },

    {
      key: "moisture",
      name: "Moisture",
      type: "Moisture Sensor",
      response: sensorAssessment.moisture_response,
      threshold: thresholds.moisture,
      direction: "low",
      bad: sensorAssessment.moisture_bad,
      voting: true,
    },

    {
      key: "humidity",
      name: "Humidity",
      type: "Environmental",
      response: sensorAssessment.humidity_response,
      threshold: thresholds.humidity,
      direction: "high",
      bad: sensorAssessment.humidity_bad,
      voting: true,
    },

    {
      key: "temperature",
      name: "Temperature",
      type: "Environmental",
      response: sensorAssessment.temperature_response,
      threshold: null,
      direction: null,
      bad: null,
      voting: false,
    },
  ];

  const sensorsWithVotes = sensors.map((sensor) => {
    if (!sensor.voting) {
      return {
        ...sensor,
        badVote: null,
      };
    }

    return {
      ...sensor,
      badVote: calculateBadVote({
        response: sensor.response,
        backendBad: sensor.bad,
        threshold: sensor.threshold,
        direction: sensor.direction,
      }),
    };
  });

  // =========================================================
  // VOTING SUMMARY
  // =========================================================

  const calculatedValidVoteCount = sensorsWithVotes.filter(
    (sensor) => sensor.voting && sensor.badVote !== null,
  ).length;

  const calculatedBadCount = sensorsWithVotes.filter(
    (sensor) => sensor.voting && sensor.badVote === true,
  ).length;

  const backendValidVoteCount = Number(sensorAssessment.valid_vote_count);
  const backendBadCount = Number(sensorAssessment.bad_count);
  const backendTotalVotingSensors = Number(
    sensorAssessment.total_voting_sensors,
  );

  const validVoteCount = Number.isFinite(backendValidVoteCount)
    ? backendValidVoteCount
    : calculatedValidVoteCount;

  const badCount = Number.isFinite(backendBadCount)
    ? backendBadCount
    : calculatedBadCount;

  const totalVotingSensors =
    Number.isFinite(backendTotalVotingSensors) && backendTotalVotingSensors > 0
      ? backendTotalVotingSensors
      : TOTAL_VOTING_SENSORS;

  // =========================================================
  // OVERALL SENSOR SCORE
  // =========================================================

  const backendSensorScore = Number(sensorAssessment.sensor_score);

  const fallbackSensorScore =
    validVoteCount === totalVotingSensors
      ? 100 - badCount * SENSOR_VOTE_WEIGHT
      : 0;

  const sensorScore = Math.max(
    0,
    Math.min(
      100,
      Number.isFinite(backendSensorScore)
        ? backendSensorScore
        : fallbackSensorScore,
    ),
  );

  // =========================================================
  // INDIVIDUAL SENSOR STATUS
  // =========================================================

  const getSensorVoteStatus = (sensor) => {
    if (!sensor.voting) {
      return {
        label: "SUPPORTING",
        className: "supporting",
        description:
          "Temperature is recorded as supporting environmental information and does not cast a quality vote.",
      };
    }

    if (sensor.badVote === null) {
      return {
        label: "NO DATA",
        className: "no-data",
        description:
          "A valid response was not available for this voting sensor.",
      };
    }

    const thresholdText =
      sensor.direction === "low"
        ? `BAD when Δ ≤ ${formatThreshold(sensor.threshold)}`
        : `BAD when Δ ≥ ${formatThreshold(sensor.threshold)}`;

    if (sensor.badVote) {
      return {
        label: "BAD VOTE",
        className: "bad",
        description: `${thresholdText}. This sensor contributes one BAD vote.`,
      };
    }

    return {
      label: "GOOD VOTE",
      className: "good",
      description: `${thresholdText}. The response remains on the GOOD side of the decision boundary.`,
    };
  };

  // =========================================================
  // SENSOR ICON
  // =========================================================

  const getSensorIcon = (sensorName) => {
    if (sensorName === "Temperature") {
      return "T";
    }

    if (sensorName === "Humidity") {
      return "H";
    }

    if (sensorName === "Moisture") {
      return "M";
    }

    if (sensorName === "MQ-2") {
      return "2";
    }

    if (sensorName === "MQ-135") {
      return "135";
    }

    if (sensorName === "MQ-3") {
      return "3";
    }

    return "S";
  };

  return (
    <div className="sensor-assessment-card">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sensor-header">
        <div>
          <span className="sensor-header-label">SENSOR ASSESSMENT</span>

          <h3>Sensor Quality Analysis</h3>

          <p>
            Five experimentally derived sensor decision boundaries are used for
            voting. Temperature is shown separately as supporting environmental
            information.
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN OVERALL STATUS
      ===================================================== */}

      <div
        className={`
          sensor-status-panel
          sensor-status-panel-${statusClass}
        `}
      >
        <div className="status-left">
          <span className="status-caption">SENSOR QUALITY STATUS</span>

          <div className="status-main-row">
            <span className="status-indicator">
              <span />
            </span>

            <strong>{status}</strong>
          </div>

          <p>
            0-1 BAD votes = GOOD, 2 BAD votes = REVIEW, and 3-5 BAD votes = BAD.
          </p>
        </div>

        <div className="status-metrics">
          <div className="status-score">
            <span>SENSOR SCORE</span>

            <div>
              <strong>{sensorScore.toFixed(2)}</strong>

              <small>/100</small>
            </div>
          </div>

          <div className="status-score vote-count-score">
            <span>BAD VOTES</span>

            <div>
              <strong>{badCount}</strong>

              <small>/{totalVotingSensors}</small>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          VOTING SUMMARY
      ===================================================== */}

      <div className="sensor-voting-summary">
        <div className="voting-summary-heading">
          <div>
            <span>FIVE-SENSOR VOTING</span>

            <h4>Decision Summary</h4>
          </div>

          <p>
            Each valid voting sensor contributes one equal 20-point share to the
            sensor score.
          </p>
        </div>

        <div className="voting-summary-grid">
          <div className="voting-summary-card">
            <span>Valid Votes</span>
            <strong>
              {validVoteCount}/{totalVotingSensors}
            </strong>
          </div>

          <div className="voting-summary-card">
            <span>BAD Votes</span>
            <strong>{badCount}</strong>
          </div>

          <div className="voting-summary-card">
            <span>GOOD Votes</span>
            <strong>{Math.max(0, validVoteCount - badCount)}</strong>
          </div>

          <div className="voting-summary-card">
            <span>Score Rule</span>
            <strong>100 - BAD × 20</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          SENSOR RESULT HEADING
      ===================================================== */}

      <div className="sensor-readings-heading">
        <div>
          <span>SENSOR RESULTS</span>

          <h4>Recorded Sensor Responses</h4>
        </div>

        <p>
          Δ represents Sample - Baseline. Five sensors cast GOOD/BAD votes;
          temperature does not participate in the quality decision.
        </p>
      </div>

      {/* =====================================================
          ALL SENSOR CARDS
      ===================================================== */}

      <div className="sensor-grid">
        {sensorsWithVotes.map((sensor) => {
          const voteStatus = getSensorVoteStatus(sensor);

          return (
            <div
              className={`
                sensor-item-card
                sensor-card-${voteStatus.className}
              `}
              key={sensor.key}
            >
              {/* ===========================================
                    SENSOR CARD HEADER
                =========================================== */}

              <div className="sensor-item-top">
                <div className="sensor-item-identity">
                  <div className="sensor-item-icon">
                    {getSensorIcon(sensor.name)}
                  </div>

                  <div className="sensor-item-name">
                    <span>{sensor.type}</span>

                    <h4>{sensor.name}</h4>
                  </div>
                </div>

                <span
                  className={`
                    individual-sensor-status
                    individual-${voteStatus.className}
                  `}
                >
                  <span className="individual-status-dot" />

                  {voteStatus.label}
                </span>
              </div>

              {/* ===========================================
                    RESPONSE
                =========================================== */}

              <div className="sensor-response">
                <span>RESPONSE Δ</span>

                <strong>{formatValue(sensor.response)}</strong>
              </div>

              {/* ===========================================
                    VOTE DESCRIPTION
                =========================================== */}

              <div className="sensor-range-description">
                <span
                  className={`
                    range-marker
                    range-marker-${voteStatus.className}
                  `}
                />

                <p>{voteStatus.description}</p>
              </div>

              {/* ===========================================
                    FOOTER
                =========================================== */}

              <div className="sensor-card-footer">
                {sensor.voting ? (
                  <>
                    <span>Decision Boundary</span>

                    <strong>
                      {sensor.direction === "low" ? "≤ " : "≥ "}
                      {formatThreshold(sensor.threshold)}
                    </strong>
                  </>
                ) : (
                  <>
                    <span>Assessment Role</span>

                    <strong>Supporting Only</strong>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          SENSOR VOTE LEGEND
      ===================================================== */}

      <div className="sensor-range-legend">
        <div className="legend-heading">
          <span>VOTING GUIDE</span>
        </div>

        <div className="legend-items">
          <div>
            <span className="legend-dot legend-good" />

            <div>
              <strong>GOOD Vote</strong>

              <small>
                Response remains on the acceptable side of the experimental
                decision boundary
              </small>
            </div>
          </div>

          <div>
            <span className="legend-dot legend-bad" />

            <div>
              <strong>BAD Vote</strong>

              <small>
                Response reaches or crosses the experimental BAD decision
                boundary
              </small>
            </div>
          </div>

          <div>
            <span className="legend-dot legend-supporting" />

            <div>
              <strong>Supporting Only</strong>

              <small>
                Recorded for environmental context but excluded from quality
                voting
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          NOTE
      ===================================================== */}

      <div className="sensor-note">
        <span className="sensor-note-icon">i</span>

        <p>
          The five voting sensors are MQ-2, MQ-3, MQ-135, Moisture, and
          Humidity. Each BAD vote reduces the sensor score by 20 points.
          Temperature is not used as a vote because the experimental GOOD and
          BAD temperature response ranges overlapped. These thresholds are
          research-defined from the collected experimental dataset and are not
          presented as an official coffee-industry grading standard.
        </p>
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`
        /* ==============================================================
           STEP 03 / SENSOR ASSESSMENT
           Scoped light coffee-theme styles.
           All selectors are intentionally nested under
           .sensor-assessment-card so other report components cannot
           overwrite this component's typography or legend styles.
        ============================================================== */

        .sensor-assessment-card,
        .sensor-assessment-card * {
          box-sizing: border-box;
        }

        .sensor-assessment-card {
          width: 100%;
          padding: 28px;
          border: 1px solid #e6d8cb;
          border-radius: 20px;
          background: #fffdf9;
          color: #2b190f;
          box-shadow: 0 10px 28px rgba(70, 39, 24, 0.045);
        }

        /* Header ------------------------------------------------------ */
        .sensor-assessment-card .sensor-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid #eee3d8;
        }

        .sensor-assessment-card .sensor-header-label {
          display: block;
          color: #9a542b;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.25px;
          text-transform: uppercase;
        }

        .sensor-assessment-card .sensor-header h3 {
          margin: 6px 0 0;
          color: #2a170f;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          font-weight: 500;
          line-height: 1.2;
        }

        .sensor-assessment-card .sensor-header p {
          max-width: 760px;
          margin: 8px 0 0;
          color: #6b5d53;
          font-size: 14px;
          line-height: 1.65;
        }

        /* Overall status --------------------------------------------- */
        .sensor-assessment-card .sensor-status-panel {
          margin-top: 18px;
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(250px, 0.8fr);
          gap: 18px;
          align-items: stretch;
          padding: 20px;
          border: 1px solid #d8e4d8;
          border-radius: 17px;
          background: #f3f8f2;
        }

        .sensor-assessment-card .sensor-status-panel-review,
        .sensor-assessment-card .sensor-status-panel-needs-review {
          border-color: #ead7b7;
          background: #fff8ed;
        }

        .sensor-assessment-card .sensor-status-panel-bad,
        .sensor-assessment-card .sensor-status-panel-poor {
          border-color: #ebcbc4;
          background: #fff2ef;
        }

        .sensor-assessment-card .status-left {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .sensor-assessment-card .status-caption {
          display: block;
          color: #5c725f;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.05px;
        }

        .sensor-assessment-card .status-main-row {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sensor-assessment-card .status-indicator {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #dff0e1;
          border: 1px solid #bcd9c0;
        }

        .sensor-assessment-card .status-indicator > span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #3d9d54;
        }

        .sensor-assessment-card .sensor-status-panel-review .status-indicator,
        .sensor-assessment-card .sensor-status-panel-needs-review .status-indicator {
          background: #f8e8c8;
          border-color: #e7c886;
        }

        .sensor-assessment-card .sensor-status-panel-review .status-indicator > span,
        .sensor-assessment-card .sensor-status-panel-needs-review .status-indicator > span {
          background: #c78324;
        }

        .sensor-assessment-card .sensor-status-panel-bad .status-indicator,
        .sensor-assessment-card .sensor-status-panel-poor .status-indicator {
          background: #f6d8d2;
          border-color: #e6b5aa;
        }

        .sensor-assessment-card .sensor-status-panel-bad .status-indicator > span,
        .sensor-assessment-card .sensor-status-panel-poor .status-indicator > span {
          background: #c95845;
        }

        .sensor-assessment-card .status-main-row strong {
          color: #2a170f;
          font-size: 30px;
          font-weight: 900;
          line-height: 1;
          text-transform: uppercase;
        }

        .sensor-assessment-card .status-left > p {
          margin: 10px 0 0;
          color: #617064;
          font-size: 13px;
          line-height: 1.55;
        }

        .sensor-assessment-card .status-metrics {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .sensor-assessment-card .status-score {
          min-width: 0;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #e2ddd6;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.9);
        }

        .sensor-assessment-card .status-score > span {
          color: #786a60;
          font-size: 10.5px;
          font-weight: 900;
          letter-spacing: 0.85px;
        }

        .sensor-assessment-card .status-score > div {
          margin-top: 8px;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .sensor-assessment-card .status-score strong {
          color: #2a170f;
          font-size: 29px;
          font-weight: 900;
          line-height: 1;
        }

        .sensor-assessment-card .status-score small {
          color: #7b6c62;
          font-size: 12px;
          font-weight: 700;
        }

        /* Voting summary --------------------------------------------- */
        .sensor-assessment-card .sensor-voting-summary {
          margin-top: 16px;
          padding: 18px;
          border: 1px solid #eadfd4;
          border-radius: 16px;
          background: #fbf6f0;
        }

        .sensor-assessment-card .voting-summary-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .sensor-assessment-card .voting-summary-heading > div > span {
          display: block;
          color: #a05b30;
          font-size: 10.5px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .sensor-assessment-card .voting-summary-heading h4 {
          margin: 5px 0 0;
          color: #2b190f;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 500;
        }

        .sensor-assessment-card .voting-summary-heading p {
          max-width: 420px;
          margin: 0;
          color: #706258;
          font-size: 12.5px;
          line-height: 1.5;
          text-align: right;
        }

        .sensor-assessment-card .voting-summary-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .sensor-assessment-card .voting-summary-card {
          min-height: 88px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #e4d7ca;
          border-radius: 12px;
          background: #fffdfa;
        }

        .sensor-assessment-card .voting-summary-card span {
          color: #796a60;
          font-size: 10.5px;
          font-weight: 800;
        }

        .sensor-assessment-card .voting-summary-card strong {
          margin-top: 7px;
          color: #b66f37;
          font-size: 21px;
          font-weight: 900;
          line-height: 1.18;
          word-break: break-word;
        }

        /* Results heading -------------------------------------------- */
        .sensor-assessment-card .sensor-readings-heading {
          margin-top: 22px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .sensor-assessment-card .sensor-readings-heading > div > span {
          display: block;
          color: #9e582f;
          font-size: 10.5px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .sensor-assessment-card .sensor-readings-heading h4 {
          margin: 5px 0 0;
          color: #2a170f;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 500;
        }

        .sensor-assessment-card .sensor-readings-heading p {
          max-width: 480px;
          margin: 0;
          color: #716359;
          font-size: 12.5px;
          line-height: 1.55;
          text-align: right;
        }

        /* Sensor cards ----------------------------------------------- */
        .sensor-assessment-card .sensor-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .sensor-assessment-card .sensor-item-card {
          min-width: 0;
          min-height: 225px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          border: 1px solid #e6ddd4;
          border-radius: 15px;
          background: #fffdf9;
        }

        .sensor-assessment-card .sensor-card-good {
          border-color: #c7e1cb;
          background: linear-gradient(145deg, #f1faf2, #fbfefb);
        }

        .sensor-assessment-card .sensor-card-bad {
          border-color: #e8c7c0;
          background: linear-gradient(145deg, #fff1ee, #fffaf8);
        }

        .sensor-assessment-card .sensor-card-supporting {
          border-color: #e6d7bf;
          background: linear-gradient(145deg, #fff9ee, #fffdf9);
        }

        .sensor-assessment-card .sensor-card-no-data {
          background: #f7f4f0;
        }

        .sensor-assessment-card .sensor-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .sensor-assessment-card .sensor-item-identity {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .sensor-assessment-card .sensor-item-icon {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #5a2e18;
          background: #f4e4d2;
          font-size: 10px;
          font-weight: 900;
        }

        .sensor-assessment-card .sensor-item-name {
          min-width: 0;
        }

        .sensor-assessment-card .sensor-item-name > span {
          display: block;
          color: #85766b;
          font-size: 9.5px;
          font-weight: 800;
          line-height: 1.2;
        }

        .sensor-assessment-card .sensor-item-name h4 {
          margin: 3px 0 0;
          color: #2c190f;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.2;
        }

        .sensor-assessment-card .individual-sensor-status {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 8px;
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 900;
          line-height: 1;
          white-space: nowrap;
        }

        .sensor-assessment-card .individual-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .sensor-assessment-card .individual-good {
          color: #2f8545;
          background: #e4f4e7;
          border: 1px solid #c5e3ca;
        }

        .sensor-assessment-card .individual-bad {
          color: #b64f3c;
          background: #fce7e3;
          border: 1px solid #efc4bc;
        }

        .sensor-assessment-card .individual-supporting {
          color: #a06b23;
          background: #f9edd6;
          border: 1px solid #ecd5a9;
        }

        .sensor-assessment-card .individual-no-data {
          color: #756b63;
          background: #eee9e4;
          border: 1px solid #ddd4cb;
        }

        .sensor-assessment-card .sensor-response {
          margin-top: 22px;
        }

        .sensor-assessment-card .sensor-response > span {
          display: block;
          color: #786b62;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.9px;
        }

        .sensor-assessment-card .sensor-response strong {
          display: block;
          margin-top: 5px;
          color: #25150e;
          font-size: 31px;
          font-weight: 900;
          line-height: 1.05;
        }

        .sensor-assessment-card .sensor-range-description {
          margin-top: 11px;
          display: flex;
          align-items: flex-start;
          gap: 7px;
        }

        .sensor-assessment-card .range-marker {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;
          margin-top: 5px;
          border-radius: 50%;
          background: #8b7e74;
        }

        .sensor-assessment-card .range-marker-good { background: #50ad65; }
        .sensor-assessment-card .range-marker-bad { background: #ce604d; }
        .sensor-assessment-card .range-marker-supporting { background: #d19843; }

        .sensor-assessment-card .sensor-range-description p {
          margin: 0;
          color: #62564e;
          font-size: 11.5px;
          line-height: 1.5;
        }

        .sensor-assessment-card .sensor-card-footer {
          margin-top: auto;
          padding-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-top: 1px solid #ece3db;
        }

        .sensor-assessment-card .sensor-card-footer span {
          color: #82746a;
          font-size: 10px;
          font-weight: 700;
        }

        .sensor-assessment-card .sensor-card-footer strong {
          color: #a66334;
          font-size: 11px;
          font-weight: 900;
          text-align: right;
        }

        /* Legend ------------------------------------------------------ */
        .sensor-assessment-card .sensor-range-legend {
          margin-top: 16px;
          padding: 16px;
          border: 1px solid #e7ddd3;
          border-radius: 15px;
          background: #fbf7f2;
        }

        .sensor-assessment-card .legend-heading > span {
          color: #9c572f;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .sensor-assessment-card .legend-items {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .sensor-assessment-card .legend-items > div {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .sensor-assessment-card .legend-dot {
          width: 9px;
          height: 9px;
          flex: 0 0 9px;
          margin-top: 4px;
          border-radius: 50%;
        }

        .sensor-assessment-card .legend-good { background: #56b36b; }
        .sensor-assessment-card .legend-bad { background: #cc614d; }
        .sensor-assessment-card .legend-supporting { background: #d39a43; }

        .sensor-assessment-card .legend-items strong {
          display: block;
          color: #342016;
          font-size: 11.5px;
          font-weight: 900;
        }

        .sensor-assessment-card .legend-items small {
          display: block;
          margin-top: 3px;
          color: #71645b;
          font-size: 10.5px;
          line-height: 1.45;
        }

        /* Research note ---------------------------------------------- */
        .sensor-assessment-card .sensor-note {
          margin-top: 14px;
          padding: 13px 14px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          border: 1px solid #eadfd5;
          border-radius: 13px;
          background: #faf6f1;
        }

        .sensor-assessment-card .sensor-note-icon {
          width: 22px;
          height: 22px;
          flex: 0 0 22px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #9d5b32;
          border: 1px solid #d8b99e;
          font-size: 10px;
          font-weight: 900;
        }

        .sensor-assessment-card .sensor-note p {
          margin: 1px 0 0;
          color: #685b52;
          font-size: 11.5px;
          line-height: 1.55;
        }

        @media (max-width: 980px) {
          .sensor-assessment-card .sensor-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .sensor-assessment-card .voting-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .sensor-assessment-card .sensor-status-panel {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .sensor-assessment-card {
            padding: 18px;
          }

          .sensor-assessment-card .voting-summary-heading,
          .sensor-assessment-card .sensor-readings-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .sensor-assessment-card .voting-summary-heading p,
          .sensor-assessment-card .sensor-readings-heading p {
            max-width: none;
            text-align: left;
          }

          .sensor-assessment-card .sensor-grid,
          .sensor-assessment-card .legend-items,
          .sensor-assessment-card .status-metrics {
            grid-template-columns: 1fr;
          }

          .sensor-assessment-card .status-main-row strong {
            font-size: 26px;
          }
        }
      `}</style>
    </div>
  );
}

export default SensorAssessmentCard;
