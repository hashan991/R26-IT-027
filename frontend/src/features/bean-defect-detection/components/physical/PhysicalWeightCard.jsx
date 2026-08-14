import { useEffect, useRef, useState } from "react";

import { getPhysicalWeight } from "../../services/beanService";

function PhysicalWeightCard({ capturedWeight, onCaptureWeight }) {
  const [liveWeight, setLiveWeight] = useState(null);

  const [connected, setConnected] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const requestRunningRef = useRef(false);

  // =========================================================
  // READ WEIGHT
  // =========================================================

  const readWeight = async () => {
    if (requestRunningRef.current) {
      return;
    }

    requestRunningRef.current = true;

    try {
      const data = await getPhysicalWeight();

      setConnected(Boolean(data.connected));

      if (data.weight_grams !== null && data.weight_grams !== undefined) {
        setLiveWeight(Number(data.weight_grams));
      } else {
        setLiveWeight(null);
      }

      setError("");
    } catch (error) {
      console.error("Physical weight reading failed:", error);

      // 401 is handled globally by api.js
      if (error.response?.status !== 401) {
        setError("Unable to read the load cell.");
      }

      setConnected(false);
    } finally {
      setLoading(false);

      requestRunningRef.current = false;
    }
  };

  // =========================================================
  // LIVE WEIGHT POLLING
  // =========================================================

  useEffect(() => {
    readWeight();

    const interval = setInterval(readWeight, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // CAPTURE CURRENT WEIGHT
  // =========================================================

  const handleCaptureWeight = () => {
    if (liveWeight === null || !connected) {
      return;
    }

    onCaptureWeight(Number(liveWeight.toFixed(2)));
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="physical-weight-card">
      <div className="weight-card-header">
        <div>
          <span>LOAD CELL MEASUREMENT</span>

          <h3>Coffee Bean Sample Weight</h3>
        </div>

        <span
          className={
            connected ? "weight-status connected" : "weight-status disconnected"
          }
        >
          <span className="status-dot"></span>

          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <p className="weight-description">
        Measure the current coffee bean sample using the HX711 load cell before
        running the physical AI analysis.
      </p>

      {/* LIVE WEIGHT */}
      <div className="live-weight-area">
        <span className="live-weight-label">LIVE WEIGHT</span>

        {loading ? (
          <div className="weight-loading">Reading load cell...</div>
        ) : (
          <div className="weight-value">
            <strong>
              {liveWeight !== null ? liveWeight.toFixed(2) : "--"}
            </strong>

            <span>g</span>
          </div>
        )}

        <span className="weight-device">HX711 Load Cell • Arduino</span>
      </div>

      {/* ERROR */}
      {error && <div className="weight-error">{error}</div>}

      {/* CAPTURE BUTTON */}
      <button
        type="button"
        className="capture-weight-button"
        onClick={handleCaptureWeight}
        disabled={!connected || liveWeight === null || loading}
      >
        ⚖ Capture Current Weight
      </button>

      {/* CAPTURED WEIGHT */}
      {capturedWeight !== null && capturedWeight !== undefined && (
        <div className="captured-weight-box">
          <div>
            <span>CAPTURED SAMPLE WEIGHT</span>

            <strong>{Number(capturedWeight).toFixed(2)} g</strong>
          </div>

          <span className="captured-check">✓</span>
        </div>
      )}

      <style>{`
        .physical-weight-card {
          margin-bottom: 18px;
          padding: 20px;

          border-radius: 22px;

          background:
            rgba(0,0,0,0.14);

          border:
            1px solid
            rgba(255,220,170,0.09);
        }

        .weight-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          gap: 20px;
        }

        .weight-card-header > div > span {
          display: block;

          margin-bottom: 5px;

          color: #dca05e;

          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .weight-card-header h3 {
          margin: 0;

          color: #fff2de;

          font-size: 20px;
        }

        .weight-status {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          padding: 7px 10px;

          border-radius: 999px;

          font-size: 10px;
          font-weight: 850;
        }

        .weight-status.connected {
          color: #aee8b3;

          background:
            rgba(88,175,99,0.1);

          border:
            1px solid
            rgba(88,175,99,0.16);
        }

        .weight-status.disconnected {
          color: #ffb39d;

          background:
            rgba(205,78,55,0.1);

          border:
            1px solid
            rgba(205,78,55,0.16);
        }

        .status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: currentColor;

          box-shadow:
            0 0 8px currentColor;
        }

        .weight-description {
          max-width: 650px;

          margin:
            8px 0 18px;

          color:
            rgba(255,238,212,0.46);

          font-size: 12px;
          line-height: 1.6;
        }

        .live-weight-area {
          min-height: 150px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          padding: 20px;

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.055),
              rgba(255,255,255,0.018)
            );

          border:
            1px solid
            rgba(255,220,170,0.08);
        }

        .live-weight-label {
          margin-bottom: 6px;

          color:
            rgba(255,238,212,0.45);

          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .weight-value {
          display: flex;

          align-items: baseline;

          gap: 7px;
        }

        .weight-value strong {
          color: #ffd18d;

          font-size: 48px;
          font-weight: 950;

          letter-spacing: -2px;
        }

        .weight-value span {
          color:
            rgba(255,227,186,0.65);

          font-size: 17px;
          font-weight: 800;
        }

        .weight-device {
          margin-top: 7px;

          color:
            rgba(255,238,212,0.35);

          font-size: 9px;
        }

        .weight-loading {
          padding: 15px;

          color: #ffd18d;

          font-size: 13px;
        }

        .weight-error {
          margin-top: 12px;

          padding: 10px 12px;

          border-radius: 12px;

          color: #ffb09a;

          background:
            rgba(198,70,48,0.08);

          border:
            1px solid
            rgba(198,70,48,0.12);

          font-size: 11px;
        }

        .capture-weight-button {
          width: 100%;

          margin-top: 14px;

          padding: 13px 16px;

          border: none;
          border-radius: 14px;

          color: #2b170c;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d38a46,
              #9e572f
            );

          font-size: 12px;
          font-weight: 900;

          cursor: pointer;
        }

        .capture-weight-button:disabled {
          opacity: 0.4;

          cursor: not-allowed;
        }

        .captured-weight-box {
          margin-top: 13px;

          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 15px;

          padding: 14px;

          border-radius: 15px;

          background:
            rgba(80,170,92,0.08);

          border:
            1px solid
            rgba(80,170,92,0.15);
        }

        .captured-weight-box > div > span {
          display: block;

          margin-bottom: 4px;

          color: #8fd49a;

          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .captured-weight-box strong {
          color: #c7efca;

          font-size: 18px;
        }

        .captured-check {
          width: 30px;
          height: 30px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          color: #1e2d1f;

          background: #9fe0a7;

          font-size: 14px;
          font-weight: 950;
        }

        @media (max-width: 620px) {
          .weight-card-header {
            flex-direction: column;
          }

          .weight-value strong {
            font-size: 40px;
          }
        }
      `}</style>
    </div>
  );
}

export default PhysicalWeightCard;
