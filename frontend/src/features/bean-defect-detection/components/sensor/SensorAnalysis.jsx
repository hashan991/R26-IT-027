import { useState } from "react";

import DeviceStatus from "./DeviceStatus";
import SensorMetricCard from "./SensorMetricCard";

function SensorAnalysis({ onComplete }) {
  const [reading, setReading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // TEMPORARY DATA
  // පස්සේ මේවා Arduino API එකෙන් එනවා.
  const [sensorData, setSensorData] = useState({
    moisture: {
      value: 12.4,
      unit: "%",
      status: "normal",
    },

    temperature: {
      value: 28.7,
      unit: "°C",
      status: "normal",
    },

    humidity: {
      value: 73.9,
      unit: "%",
      status: "warning",
    },

    mq2: {
      value: 230,
      unit: "Raw",
      status: "normal",
    },

    mq3: {
      value: 51,
      unit: "Raw",
      status: "normal",
    },

    mq135: {
      value: 63,
      unit: "Raw",
      status: "normal",
    },

    weight: {
      value: 7.0,
      unit: "g",
      status: "normal",
    },
  });

  const handleStartReading = () => {
    setReading(true);
    setCompleted(false);

    // temporary simulation
    setTimeout(() => {
      setSensorData((previous) => ({
        ...previous,
      }));

      setReading(false);
      setCompleted(true);
    }, 1800);
  };

  const handleComplete = () => {
    const result = {
      readings: sensorData,

      sensorScore: 86,

      qualityStatus: "Good",

      findings: [
        "Moisture level is within the acceptable range.",
        "Temperature reading is normal.",
        "Humidity is slightly higher than the preferred range.",
        "Gas sensor readings are within the current reference range.",
      ],
    };

    onComplete(result);
  };

  return (
    <section className="sensor-analysis">
      <div className="sensor-main-card">
        <div className="sensor-heading">
          <div>
            <span className="sensor-step-label">STEP 01 — SENSOR ANALYSIS</span>

            <h2>Sensor-Based Quality Analysis</h2>

            <p>
              Collect environmental and sensor measurements from the coffee bean
              sample before physical AI inspection.
            </p>
          </div>

          <span className="live-chip">
            {reading
              ? "Reading Sensors..."
              : completed
                ? "Analysis Ready"
                : "Waiting"}
          </span>
        </div>

        <DeviceStatus connected={true} />

        <div className="sensor-toolbar">
          <div>
            <span className="toolbar-title">Sample Sensor Readings</span>

            <span className="toolbar-description">
              Current measurements from the connected quality module
            </span>
          </div>

          <button
            className="read-sensor-button"
            onClick={handleStartReading}
            disabled={reading}
          >
            {reading ? (
              <>
                <span className="sensor-spinner"></span>
                Reading...
              </>
            ) : (
              <>↻ Start Sensor Reading</>
            )}
          </button>
        </div>

        <div className="sensor-grid">
          <SensorMetricCard
            icon="💧"
            label="Moisture"
            value={sensorData.moisture.value}
            unit={sensorData.moisture.unit}
            status={sensorData.moisture.status}
            description="Coffee bean moisture measurement"
          />

          <SensorMetricCard
            icon="🌡"
            label="Temperature"
            value={sensorData.temperature.value}
            unit={sensorData.temperature.unit}
            status={sensorData.temperature.status}
            description="Sample environment temperature"
          />

          <SensorMetricCard
            icon="◌"
            label="Humidity"
            value={sensorData.humidity.value}
            unit={sensorData.humidity.unit}
            status={sensorData.humidity.status}
            description="Relative humidity around sample"
          />

          <SensorMetricCard
            icon="M2"
            label="MQ-2"
            value={sensorData.mq2.value}
            unit={sensorData.mq2.unit}
            status={sensorData.mq2.status}
            description="Gas sensor response"
          />

          <SensorMetricCard
            icon="M3"
            label="MQ-3"
            value={sensorData.mq3.value}
            unit={sensorData.mq3.unit}
            status={sensorData.mq3.status}
            description="Volatile compound sensor response"
          />

          <SensorMetricCard
            icon="135"
            label="MQ-135"
            value={sensorData.mq135.value}
            unit={sensorData.mq135.unit}
            status={sensorData.mq135.status}
            description="Air quality and VOC response"
          />

          <SensorMetricCard
            icon="⚖"
            label="Sample Weight"
            value={sensorData.weight.value}
            unit={sensorData.weight.unit}
            status={sensorData.weight.status}
            description="Current coffee bean sample weight"
          />
        </div>

        {reading && (
          <div className="reading-progress">
            <div className="reading-line"></div>

            <div>
              <strong>Collecting sensor data...</strong>
              <span>
                Please keep the coffee bean sample stable during measurement.
              </span>
            </div>
          </div>
        )}

        {completed && (
          <div className="sensor-result-summary">
            <div>
              <span>Preliminary Sensor Quality</span>

              <strong>Good</strong>
            </div>

            <div>
              <span>Sensor Quality Score</span>

              <strong>
                86
                <small>/100</small>
              </strong>
            </div>
          </div>
        )}

        <div className="sensor-actions">
          <div className="sensor-helper">
            {completed
              ? "Sensor analysis completed. Continue to physical AI inspection."
              : "Run a sensor reading before continuing."}
          </div>

          <button
            className="continue-button"
            disabled={!completed || reading}
            onClick={handleComplete}
          >
            Continue to Physical AI Analysis →
          </button>
        </div>
      </div>

      <style>{`
        .sensor-analysis {
          margin-top: 30px;
        }

        .sensor-main-card {
          padding: 28px;
          border-radius: 28px;
          border: 1px solid rgba(255, 222, 178, 0.15);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.095),
              rgba(255, 255, 255, 0.035)
            ),
            rgba(39, 22, 13, 0.78);

          backdrop-filter: blur(20px);

          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .sensor-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
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
          max-width: 670px;
          margin: 9px 0 0;
          color: rgba(255, 239, 215, 0.58);
          font-size: 14px;
          line-height: 1.6;
        }

        .live-chip {
          flex-shrink: 0;
          padding: 8px 12px;
          border-radius: 999px;
          color: #ffd59a;
          background: rgba(255, 213, 154, 0.08);
          border: 1px solid rgba(255, 213, 154, 0.14);
          font-size: 11px;
          font-weight: 800;
        }

        .sensor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
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
          color: rgba(255, 237, 211, 0.45);
          font-size: 12px;
        }

        .read-sensor-button,
        .continue-button {
          border: none;
          border-radius: 14px;
          padding: 13px 17px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 850;
          transition: 0.2s ease;
        }

        .read-sensor-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #ffe1b7;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 219, 168, 0.14);
        }

        .read-sensor-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .read-sensor-button:disabled,
        .continue-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .sensor-spinner {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #ffd89d;
          animation: sensorSpin 0.7s linear infinite;
        }

        .sensor-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .reading-progress {
          margin-top: 20px;
          display: grid;
          grid-template-columns: 4px 1fr;
          gap: 14px;
          padding: 16px;
          border-radius: 17px;
          background: rgba(213, 141, 70, 0.07);
          border: 1px solid rgba(230, 164, 96, 0.12);
        }

        .reading-line {
          border-radius: 99px;
          background: linear-gradient(
            180deg,
            #ffe0a4,
            #c97538
          );

          animation: sensorPulse 1s ease-in-out infinite;
        }

        .reading-progress strong {
          display: block;
          color: #ffe8c7;
          font-size: 13px;
        }

        .reading-progress span {
          display: block;
          margin-top: 4px;
          color: rgba(255, 238, 214, 0.48);
          font-size: 12px;
        }

        .sensor-result-summary {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .sensor-result-summary > div {
          padding: 18px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.17);
          border: 1px solid rgba(255, 219, 168, 0.1);
        }

        .sensor-result-summary span {
          display: block;
          margin-bottom: 7px;
          color: rgba(255, 238, 212, 0.5);
          font-size: 12px;
        }

        .sensor-result-summary strong {
          color: #ffd18b;
          font-size: 26px;
        }

        .sensor-result-summary small {
          margin-left: 3px;
          color: rgba(255, 237, 210, 0.45);
          font-size: 12px;
        }

        .sensor-actions {
          margin-top: 25px;
          padding-top: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid rgba(255, 221, 177, 0.09);
        }

        .sensor-helper {
          color: rgba(255, 238, 214, 0.48);
          font-size: 12px;
        }

        .continue-button {
          color: #29160c;
          background: linear-gradient(
            135deg,
            #ffe0a3,
            #d58b46,
            #9f582f
          );

          box-shadow: 0 14px 30px rgba(200, 119, 56, 0.18);
        }

        .continue-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        @keyframes sensorSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sensorPulse {
          0%,
          100% {
            opacity: 0.55;
          }

          50% {
            opacity: 1;
          }
        }

        @media (max-width: 1000px) {
          .sensor-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 620px) {
          .sensor-main-card {
            padding: 18px;
            border-radius: 22px;
          }

          .sensor-heading,
          .sensor-toolbar,
          .sensor-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .sensor-grid {
            grid-template-columns: 1fr;
          }

          .sensor-result-summary {
            grid-template-columns: 1fr;
          }

          .read-sensor-button,
          .continue-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}

export default SensorAnalysis;
