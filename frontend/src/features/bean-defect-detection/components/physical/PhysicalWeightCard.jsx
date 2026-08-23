import { useEffect, useRef, useState } from "react";

import {
  getPhysicalWeight,
  zeroPhysicalWeight,
} from "../../services/beanService";

function PhysicalWeightCard({ capturedWeight, onCaptureWeight }) {
  const [liveWeight, setLiveWeight] = useState(null);

  const [connected, setConnected] = useState(false);

  const [loadCellReady, setLoadCellReady] = useState(false);

  const [zeroed, setZeroed] = useState(false);

  const [loading, setLoading] = useState(true);

  const [zeroing, setZeroing] = useState(false);

  const [error, setError] = useState("");

  const requestRunningRef = useRef(false);

  // =========================================================
  // READ LIVE WEIGHT
  // =========================================================

  const readWeight = async () => {
    if (requestRunningRef.current) {
      return;
    }

    requestRunningRef.current = true;

    try {
      const data = await getPhysicalWeight();

      setConnected(Boolean(data.connected));

      setLoadCellReady(Boolean(data.load_cell_ready));

      setZeroed(Boolean(data.zeroed));

      if (data.weight_grams !== null && data.weight_grams !== undefined) {
        setLiveWeight(Number(data.weight_grams));
      } else {
        setLiveWeight(null);
      }

      setError("");
    } catch (error) {
      console.error("Physical weight reading failed:", error);

      if (error.response?.status !== 401) {
        setError("Unable to read the load cell.");
      }

      setConnected(false);

      setLoadCellReady(false);

      setLiveWeight(null);
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
  // ZERO / TARE EMPTY TRAY
  // =========================================================

  const handleZeroScale = async () => {
    if (!connected || !loadCellReady || zeroing) {
      return;
    }

    const confirmed = window.confirm(
      "Make sure only the EMPTY TRAY is on the load cell. Zero the scale now?",
    );

    if (!confirmed) {
      return;
    }

    setZeroing(true);

    setError("");

    try {
      const data = await zeroPhysicalWeight();

      if (data.success) {
        setZeroed(true);

        setLiveWeight(0);

        // Read again using the newly stored tray zero.
        setTimeout(readWeight, 500);
      }
    } catch (error) {
      console.error("Load cell zero failed:", error);

      if (error.response?.status !== 401) {
        setError(
          error.response?.data?.detail || "Unable to zero the load cell.",
        );
      }
    } finally {
      setZeroing(false);
    }
  };

  // =========================================================
  // CAPTURE CURRENT WEIGHT
  // =========================================================

  const handleCaptureWeight = () => {
    if (liveWeight === null || !connected || !loadCellReady || !zeroed) {
      return;
    }

    onCaptureWeight(Number(liveWeight.toFixed(2)));
  };

  // =========================================================
  // DISPLAY STATUS
  // =========================================================

  const deviceConnected = connected && loadCellReady;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="physical-weight-card">
      {/* HEADER */}
      <div className="weight-card-header">
        <div>
          <span>LOAD CELL MEASUREMENT</span>

          <h3>Coffee Bean Sample Weight</h3>
        </div>

        <span
          className={
            deviceConnected
              ? "weight-status connected"
              : "weight-status disconnected"
          }
        >
          <span className="status-dot" />

          {deviceConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <p className="weight-description">
        Zero the load cell with the empty tray, then add the coffee bean sample
        and capture its measured weight before running the physical AI analysis.
      </p>

      {/* =====================================================
          SCALE ZERO
      ====================================================== */}

      <div className="scale-zero-section">
        <div className="scale-zero-info">
          <div>
            <span className="scale-step-label">STEP 1</span>

            <strong>Zero Empty Tray</strong>

            <p>Place only the empty tray on the load cell before zeroing.</p>
          </div>

          <div
            className={zeroed ? "zero-status zeroed" : "zero-status not-zeroed"}
          >
            {zeroed ? "✓ Scale Zeroed" : "Scale Not Zeroed"}
          </div>
        </div>

        <button
          type="button"
          className="zero-scale-button"
          onClick={handleZeroScale}
          disabled={!deviceConnected || zeroing}
        >
          {zeroing ? "Zeroing Scale..." : "Zero / Tare Empty Tray"}
        </button>
      </div>

      {/* =====================================================
          LIVE WEIGHT
      ====================================================== */}

      <div className="live-weight-area">
        <span className="live-weight-label">STEP 2 • LIVE WEIGHT</span>

        {loading ? (
          <div className="weight-loading">Reading load cell...</div>
        ) : !zeroed ? (
          <div className="weight-not-ready">
            <strong>--</strong>

            <span>Zero the empty tray first</span>
          </div>
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

      {/* =====================================================
          CAPTURE WEIGHT
      ====================================================== */}

      <button
        type="button"
        className="capture-weight-button"
        onClick={handleCaptureWeight}
        disabled={!deviceConnected || !zeroed || liveWeight === null || loading}
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

      {/* =====================================================
          STYLES
      ====================================================== */}

      <style>{`
        .physical-weight-card {
          margin-bottom: 18px;
          padding: 20px;

          border-radius: 22px;

          background:
            rgba(0, 0, 0, 0.14);

          border:
            1px solid
            rgba(255, 220, 170, 0.09);
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
            rgba(88, 175, 99, 0.1);

          border:
            1px solid
            rgba(88, 175, 99, 0.16);
        }


        .weight-status.disconnected {
          color: #ffb39d;

          background:
            rgba(205, 78, 55, 0.1);

          border:
            1px solid
            rgba(205, 78, 55, 0.16);
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
          max-width: 700px;

          margin:
            8px 0 18px;

          color:
            rgba(255, 238, 212, 0.46);

          font-size: 12px;
          line-height: 1.6;
        }


        /* ================================================
           ZERO SECTION
        ================================================= */

        .scale-zero-section {
          margin-bottom: 14px;

          padding: 16px;

          border-radius: 18px;

          background:
            rgba(255, 255, 255, 0.025);

          border:
            1px solid
            rgba(255, 220, 170, 0.08);
        }


        .scale-zero-info {
          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 20px;

          margin-bottom: 12px;
        }


        .scale-step-label {
          display: block;

          margin-bottom: 4px;

          color: #dca05e;

          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }


        .scale-zero-info strong {
          display: block;

          color: #fff0d9;

          font-size: 14px;
        }


        .scale-zero-info p {
          margin:
            4px 0 0;

          color:
            rgba(255, 238, 212, 0.4);

          font-size: 10px;
        }


        .zero-status {
          padding:
            7px 10px;

          border-radius: 999px;

          white-space: nowrap;

          font-size: 9px;
          font-weight: 900;
        }


        .zero-status.zeroed {
          color: #aee8b3;

          background:
            rgba(88, 175, 99, 0.1);

          border:
            1px solid
            rgba(88, 175, 99, 0.16);
        }


        .zero-status.not-zeroed {
          color: #ffd18d;

          background:
            rgba(211, 138, 70, 0.09);

          border:
            1px solid
            rgba(211, 138, 70, 0.14);
        }


        .zero-scale-button {
          width: 100%;

          padding:
            11px 14px;

          border-radius: 12px;

          border:
            1px solid
            rgba(255, 209, 141, 0.16);

          color: #ffd18d;

          background:
            rgba(211, 138, 70, 0.08);

          font-size: 11px;
          font-weight: 900;

          cursor: pointer;
        }


        .zero-scale-button:hover:not(:disabled) {
          background:
            rgba(211, 138, 70, 0.14);
        }


        .zero-scale-button:disabled {
          opacity: 0.4;

          cursor: not-allowed;
        }


        /* ================================================
           LIVE WEIGHT
        ================================================= */

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


        .weight-not-ready {
          display: flex;
          flex-direction: column;

          align-items: center;

          gap: 5px;
        }


        .weight-not-ready strong {
          color:
            rgba(255, 209, 141, 0.45);

          font-size: 44px;
        }


        .weight-not-ready span {
          color:
            rgba(255, 238, 212, 0.4);

          font-size: 10px;
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


        /* ================================================
           CAPTURE
        ================================================= */

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


          .scale-zero-info {
            flex-direction: column;
            align-items: flex-start;
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
