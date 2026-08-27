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

        * {
          box-sizing: border-box;
        }


        .sensor-assessment-card {
          width: 100%;

          padding: 24px;

          border-radius: 22px;

          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(
                214,
                142,
                70,
                0.08
              ),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.045
              ),
              rgba(
                255,
                255,
                255,
                0.015
              )
            ),
            rgba(
              0,
              0,
              0,
              0.12
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.09
            );
        }


        /* =================================================
           HEADER
        ================================================= */

        .sensor-header {
          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 20px;
        }


        .sensor-header-label {
          display: block;

          color: #dda05e;

          font-size: 8px;

          font-weight: 950;

          letter-spacing:
            1.6px;
        }


        .sensor-header h3 {
          margin:
            5px 0 0;

          color: #fff0d8;

          font-size: 19px;
        }


        .sensor-header p {
          max-width: 560px;

          margin:
            6px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.38
            );

          font-size: 10px;

          line-height: 1.55;
        }


        /* =================================================
           MAIN STATUS PANEL
        ================================================= */

        .sensor-status-panel {
          margin-top: 18px;

          min-height: 150px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 30px;

          padding: 22px;

          border-radius: 18px;

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
              0.07
            );
        }


        .status-caption {
          display: block;

          color:
            rgba(
              255,
              234,
              204,
              0.38
            );

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1.4px;
        }


        .status-main-row {
          margin-top: 7px;

          display: flex;

          align-items: center;

          gap: 11px;
        }


        .status-main-row strong {
          font-size: 34px;

          font-weight: 950;

          line-height: 1;

          text-transform:
            uppercase;
        }


        .status-indicator {
          width: 31px;
          height: 31px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          background:
            currentColor;
        }


        .status-indicator span {
          width: 10px;
          height: 10px;

          border-radius: 50%;

          background: #20140d;
        }


        .status-left p {
          margin:
            10px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.34
            );

          font-size: 9px;

          line-height: 1.5;
        }


        /* =================================================
           OVERALL GOOD
        ================================================= */

        .sensor-status-panel-good,
        .sensor-status-panel-excellent {
          color: #a7e6ae;

          background:
            linear-gradient(
              135deg,
              rgba(
                62,
                160,
                76,
                0.10
              ),
              rgba(
                0,
                0,
                0,
                0.09
              )
            );

          border-color:
            rgba(
              93,
              194,
              105,
              0.16
            );
        }


        /* =================================================
           OVERALL REVIEW
        ================================================= */

        .sensor-status-panel-review,
        .sensor-status-panel-needs-review {
          color: #ffd18d;

          background:
            linear-gradient(
              135deg,
              rgba(
                201,
                137,
                54,
                0.10
              ),
              rgba(
                0,
                0,
                0,
                0.09
              )
            );

          border-color:
            rgba(
              226,
              163,
              77,
              0.16
            );
        }


        /* =================================================
           OVERALL BAD
        ================================================= */

        .sensor-status-panel-bad,
        .sensor-status-panel-poor {
          color: #ffad97;

          background:
            linear-gradient(
              135deg,
              rgba(
                181,
                62,
                46,
                0.10
              ),
              rgba(
                0,
                0,
                0,
                0.09
              )
            );

          border-color:
            rgba(
              221,
              89,
              66,
              0.16
            );
        }


        /* =================================================
           WAITING / SKIPPED
        ================================================= */

        .sensor-status-panel-waiting,
        .sensor-status-panel-skipped {
          color:
            rgba(
              255,
              233,
              202,
              0.65
            );
        }


        /* =================================================
           SCORE - SECONDARY
        ================================================= */

        .status-score {
          min-width: 150px;

          padding:
            15px 18px;

          flex-shrink: 0;

          border-radius: 14px;

          text-align: right;

          background:
            rgba(
              0,
              0,
              0,
              0.12
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );
        }


        .status-score > span {
          display: block;

          margin-bottom: 5px;

          color:
            rgba(
              255,
              236,
              208,
              0.3
            );

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .status-score strong {
          color: #f2ddbf;

          font-size: 24px;
        }


        .status-score small {
          margin-left: 3px;

          color:
            rgba(
              255,
              235,
              205,
              0.3
            );

          font-size: 8px;
        }



        /* =================================================
           STATUS METRICS
        ================================================= */

        .status-metrics {
          display: flex;

          align-items: stretch;

          gap: 10px;

          flex-shrink: 0;
        }


        .vote-count-score {
          min-width: 125px;
        }


        /* =================================================
           FIVE-SENSOR VOTING SUMMARY
        ================================================= */

        .sensor-voting-summary {
          margin-top: 15px;

          padding: 15px;

          border-radius: 15px;

          background:
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
              0.055
            );
        }


        .voting-summary-heading {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 18px;
        }


        .voting-summary-heading > div > span {
          color: #dca05e;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1.3px;
        }


        .voting-summary-heading h4 {
          margin: 4px 0 0;

          color: #f1ddc0;

          font-size: 14px;
        }


        .voting-summary-heading p {
          max-width: 330px;

          margin: 0;

          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 8px;

          text-align: right;

          line-height: 1.45;
        }


        .voting-summary-grid {
          margin-top: 11px;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 9px;
        }


        .voting-summary-card {
          padding: 11px;

          border-radius: 11px;

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
              255,
              255,
              0.045
            );
        }


        .voting-summary-card span {
          display: block;

          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 7px;

          font-weight: 800;

          letter-spacing: 0.6px;

          text-transform: uppercase;
        }


        .voting-summary-card strong {
          display: block;

          margin-top: 6px;

          color: #ffe0aa;

          font-size: 15px;

          font-weight: 900;
        }


        /* =================================================
           SENSOR RESULTS HEADING
        ================================================= */

        .sensor-readings-heading {
          margin-top: 21px;

          display: flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap: 20px;
        }


        .sensor-readings-heading
        > div
        > span {
          color: #dca05e;

          font-size: 7px;

          font-weight: 900;

          letter-spacing:
            1.3px;
        }


        .sensor-readings-heading h4 {
          margin:
            4px 0 0;

          color: #f1ddc0;

          font-size: 14px;
        }


        .sensor-readings-heading p {
          max-width: 300px;

          margin: 0;

          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 8px;

          text-align: right;

          line-height: 1.45;
        }


        /* =================================================
           SENSOR GRID
        ================================================= */

        .sensor-grid {
          margin-top: 12px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 11px;
        }


        /* =================================================
           BASE SENSOR CARD
        ================================================= */

        .sensor-item-card {
          min-height: 215px;

          display: flex;

          flex-direction:
            column;

          padding: 16px;

          border-radius: 16px;

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
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.07
            );

          transition:
            transform
            0.2s ease,
            border-color
            0.2s ease,
            background
            0.2s ease;
        }


        .sensor-item-card:hover {
          transform:
            translateY(-2px);
        }


        /* =================================================
           GOOD CARD
        ================================================= */

        .sensor-card-good {
          background:
            linear-gradient(
              145deg,
              rgba(
                57,
                153,
                73,
                0.13
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            );

          border-color:
            rgba(
              92,
              198,
              106,
              0.24
            );

          box-shadow:
            inset
            0 0 25px
            rgba(
              68,
              171,
              83,
              0.025
            );
        }


        /* =================================================
           REVIEW CARD
        ================================================= */

        .sensor-card-review {
          background:
            linear-gradient(
              145deg,
              rgba(
                196,
                128,
                43,
                0.14
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            );

          border-color:
            rgba(
              230,
              164,
              76,
              0.25
            );

          box-shadow:
            inset
            0 0 25px
            rgba(
              220,
              151,
              59,
              0.025
            );
        }


        /* =================================================
           BAD CARD
        ================================================= */

        .sensor-card-bad {
          background:
            linear-gradient(
              145deg,
              rgba(
                181,
                57,
                43,
                0.15
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            );

          border-color:
            rgba(
              229,
              88,
              67,
              0.27
            );

          box-shadow:
            inset
            0 0 25px
            rgba(
              208,
              67,
              49,
              0.03
            );
        }


        /* =================================================
           SUPPORTING CARD
        ================================================= */

        .sensor-card-supporting {
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
            );
        }


        /* =================================================
           NO DATA CARD
        ================================================= */

        .sensor-card-no-data {
          opacity: 0.65;

          border-color:
            rgba(
              255,
              255,
              255,
              0.06
            );
        }


        /* =================================================
           SENSOR CARD HEADER
        ================================================= */

        .sensor-item-top {
          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 8px;
        }


        .sensor-item-identity {
          display: flex;

          align-items: center;

          min-width: 0;

          gap: 9px;
        }


        .sensor-item-icon {
          width: 37px;
          height: 37px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 10px;

          color: #2b180c;

          background:
            linear-gradient(
              145deg,
              #ffdda5,
              #ce8242
            );

          font-size: 8px;

          font-weight: 950;
        }


        .sensor-item-name {
          min-width: 0;
        }


        .sensor-item-name span {
          display: block;

          color:
            rgba(
              255,
              229,
              194,
              0.29
            );

          font-size: 6px;

          font-weight: 800;

          text-transform:
            uppercase;

          letter-spacing:
            0.8px;
        }


        .sensor-item-name h4 {
          margin:
            3px 0 0;

          color: #f3ddc0;

          font-size: 13px;
        }


        /* =================================================
           INDIVIDUAL RANGE STATUS
        ================================================= */

        .individual-sensor-status {
          flex-shrink: 0;

          display: inline-flex;

          align-items: center;

          gap: 5px;

          padding:
            5px 7px;

          border-radius: 999px;

          font-size: 6px;

          font-weight: 950;

          white-space: nowrap;

          letter-spacing:
            0.35px;
        }


        .individual-status-dot {
          width: 5px;
          height: 5px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            currentColor;
        }


        .individual-good {
          color: #9ee4a8;

          background:
            rgba(
              52,
              151,
              68,
              0.13
            );

          border:
            1px solid
            rgba(
              95,
              202,
              109,
              0.18
            );
        }


        .individual-review {
          color: #ffd18c;

          background:
            rgba(
              203,
              133,
              44,
              0.13
            );

          border:
            1px solid
            rgba(
              231,
              164,
              75,
              0.19
            );
        }


        .individual-bad {
          color: #ffad97;

          background:
            rgba(
              184,
              57,
              43,
              0.14
            );

          border:
            1px solid
            rgba(
              227,
              89,
              67,
              0.2
            );
        }


        .individual-supporting {
          color:
            rgba(
              255,
              222,
              180,
              0.48
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
              0.055
            );
        }


        .individual-no-data {
          color:
            rgba(
              255,
              235,
              205,
              0.35
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
              255,
              255,
              0.045
            );
        }


        /* =================================================
           RESPONSE
        ================================================= */

        .sensor-response {
          margin-top: 18px;
        }


        .sensor-response span {
          display: block;

          margin-bottom: 4px;

          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 7px;

          font-weight: 800;

          letter-spacing:
            0.8px;
        }


        .sensor-response strong {
          color: #ffe0aa;

          font-size: 27px;

          font-weight: 900;
        }


        /* =================================================
           RANGE DESCRIPTION
        ================================================= */

        .sensor-range-description {
          min-height: 32px;

          margin-top: 9px;

          display: flex;

          align-items:
            flex-start;

          gap: 6px;
        }


        .range-marker {
          width: 6px;
          height: 6px;

          margin-top: 4px;

          flex-shrink: 0;

          border-radius: 50%;
        }


        .range-marker-good {
          background: #81cf8c;
        }


        .range-marker-review {
          background: #e6aa58;
        }


        .range-marker-bad {
          background: #df715e;
        }


        .range-marker-supporting,
        .range-marker-no-data {
          background:
            rgba(
              255,
              224,
              182,
              0.3
            );
        }


        .sensor-range-description p {
          margin: 0;

          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 7px;

          line-height: 1.45;
        }


        /* =================================================
           CARD FOOTER
        ================================================= */

        .sensor-card-footer {
          margin-top: auto;

          padding-top: 10px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 8px;

          border-top:
            1px solid
            rgba(
              255,
              255,
              255,
              0.04
            );
        }


        .sensor-card-footer span {
          color:
            rgba(
              255,
              235,
              207,
              0.25
            );

          font-size: 7px;
        }


        .sensor-card-footer strong {
          color:
            rgba(
              255,
              219,
              169,
              0.67
            );

          font-size: 8px;

          text-align: right;
        }


        /* =================================================
           RANGE LEGEND
        ================================================= */

        .sensor-range-legend {
          margin-top: 15px;

          padding: 14px;

          border-radius: 14px;

          background:
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
              0.055
            );
        }


        .legend-heading > span {
          color: #dca05e;

          font-size: 7px;

          font-weight: 900;

          letter-spacing:
            1.2px;
        }


        .legend-items {
          margin-top: 10px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 9px;
        }


        .legend-items > div {
          display: flex;

          align-items:
            flex-start;

          gap: 7px;

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
        }


        .legend-dot {
          width: 8px;
          height: 8px;

          margin-top: 3px;

          flex-shrink: 0;

          border-radius: 50%;
        }


        .legend-good {
          background: #76cc84;
        }


        .legend-review {
          background: #df9f4d;
        }


        .legend-bad {
          background: #db6955;
        }


        .legend-supporting {
          background:
            rgba(
              255,
              224,
              182,
              0.4
            );
        }


        .legend-items strong {
          display: block;

          color: #ead6b9;

          font-size: 8px;
        }


        .legend-items small {
          display: block;

          margin-top: 2px;

          color:
            rgba(
              255,
              235,
              207,
              0.25
            );

          font-size: 6px;

          line-height: 1.4;
        }


        /* =================================================
           NOTE
        ================================================= */

        .sensor-note {
          margin-top: 12px;

          display: flex;

          align-items:
            flex-start;

          gap: 8px;

          padding:
            11px 12px;

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


        .sensor-note-icon {
          width: 18px;
          height: 18px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: #dda05e;

          border:
            1px solid
            rgba(
              221,
              160,
              94,
              0.2
            );

          font-size: 7px;

          font-weight: 900;
        }


        .sensor-note p {
          margin:
            1px 0 0;

          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 8px;

          line-height: 1.5;
        }


        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (
          max-width: 1000px
        ) {

          .sensor-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

        }


        @media (
          max-width: 1000px
        ) {

          .voting-summary-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

        }


        @media (
          max-width: 700px
        ) {

          .legend-items {
            grid-template-columns:
              1fr;
          }

        }


        @media (
          max-width: 620px
        ) {

          .sensor-assessment-card {
            padding: 18px;
          }


          .sensor-status-panel {
            flex-direction:
              column;

            align-items:
              stretch;
          }


          .status-metrics {
            width: 100%;

            flex-direction: column;
          }


          .status-score {
            width: 100%;

            text-align: left;
          }


          .voting-summary-heading {
            flex-direction: column;

            align-items: flex-start;
          }


          .voting-summary-heading p {
            text-align: left;
          }


          .voting-summary-grid {
            grid-template-columns: 1fr;
          }


          .sensor-readings-heading {
            flex-direction:
              column;

            align-items:
              flex-start;
          }


          .sensor-readings-heading p {
            text-align: left;
          }


          .sensor-grid {
            grid-template-columns:
              1fr;
          }


          .status-main-row strong {
            font-size: 28px;
          }


          .sensor-item-top {
            align-items:
              flex-start;
          }

        }

      `}</style>
    </div>
  );
}

export default SensorAssessmentCard;
