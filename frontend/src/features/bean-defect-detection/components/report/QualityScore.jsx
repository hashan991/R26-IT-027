function QualityScore({
  finalScore = 0,
  grade = "-",
  status = "Waiting",
  sensorScore = 0,
  physicalScore = 0,
}) {
  return (
    <div className="quality-score-section">
      <div className="overall-score">
        <span className="score-label">OVERALL QUALITY SCORE</span>

        <div className="score-circle">
          <strong>{finalScore}</strong>
          <span>/100</span>
        </div>

        <div className="grade-row">
          <span className="grade-badge">Grade {grade}</span>

          <span className="quality-status">{status}</span>
        </div>
      </div>

      <div className="sub-score-grid">
        <div className="sub-score-card">
          <div className="sub-score-header">
            <span>Sensor Quality</span>
            <strong>{sensorScore}/100</strong>
          </div>

          <div className="score-track">
            <div
              className="score-fill"
              style={{
                width: `${Math.min(sensorScore, 100)}%`,
              }}
            ></div>
          </div>

          <p>Sensor-based coffee bean quality assessment</p>
        </div>

        <div className="sub-score-card">
          <div className="sub-score-header">
            <span>Physical Quality</span>
            <strong>{physicalScore}/100</strong>
          </div>

          <div className="score-track">
            <div
              className="score-fill"
              style={{
                width: `${Math.min(physicalScore, 100)}%`,
              }}
            ></div>
          </div>

          <p>Computer vision based physical quality assessment</p>
        </div>
      </div>

      <style>{`
        .quality-score-section {
          width: 100%;
        }

        .overall-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;

          padding: 30px;

          border-radius: 24px;

          background:
            radial-gradient(
              circle at center,
              rgba(214, 142, 70, 0.14),
              transparent 60%
            ),
            rgba(0, 0, 0, 0.15);

          border:
            1px solid rgba(255, 220, 170, 0.1);
        }

        .score-label {
          color: #dda05e;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.8px;
        }

        .score-circle {
          width: 150px;
          height: 150px;

          margin: 20px 0;

          display: flex;
          align-items: baseline;
          justify-content: center;

          padding-top: 45px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(255, 213, 153, 0.12),
              rgba(0, 0, 0, 0.12)
            );

          border: 4px solid rgba(221, 148, 75, 0.6);

          box-shadow:
            0 0 35px rgba(216, 139, 68, 0.16),
            inset 0 0 25px rgba(255, 211, 150, 0.05);
        }

        .score-circle strong {
          color: #ffe0aa;
          font-size: 48px;
          letter-spacing: -2px;
        }

        .score-circle span {
          margin-left: 4px;

          color: rgba(255, 238, 211, 0.46);
          font-size: 13px;
        }

        .grade-row {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .grade-badge,
        .quality-status {
          padding: 8px 14px;

          border-radius: 999px;

          font-size: 12px;
          font-weight: 900;
        }

        .grade-badge {
          color: #2b170c;

          background:
            linear-gradient(
              135deg,
              #ffe1a6,
              #d68e49
            );
        }

        .quality-status {
          color: #a9e7b0;

          background: rgba(64, 169, 78, 0.1);

          border:
            1px solid rgba(99, 201, 110, 0.17);
        }

        .sub-score-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);

          gap: 15px;
          margin-top: 17px;
        }

        .sub-score-card {
          padding: 19px;

          border-radius: 19px;

          background: rgba(255, 255, 255, 0.045);

          border:
            1px solid rgba(255, 220, 170, 0.09);
        }

        .sub-score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 10px;
        }

        .sub-score-header span {
          color: rgba(255, 239, 214, 0.6);
          font-size: 12px;
        }

        .sub-score-header strong {
          color: #ffd18d;
          font-size: 16px;
        }

        .score-track {
          height: 8px;

          margin-top: 12px;

          overflow: hidden;

          border-radius: 999px;

          background: rgba(255, 255, 255, 0.07);
        }

        .score-fill {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #a95f34,
              #ffd18c
            );
        }

        .sub-score-card p {
          margin: 10px 0 0;

          color: rgba(255, 238, 212, 0.4);

          font-size: 11px;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .sub-score-grid {
            grid-template-columns: 1fr;
          }

          .score-circle {
            width: 130px;
            height: 130px;
            padding-top: 39px;
          }

          .score-circle strong {
            font-size: 41px;
          }
        }
      `}</style>
    </div>
  );
}

export default QualityScore;
