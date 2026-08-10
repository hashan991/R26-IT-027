function DetectionSummary({ result }) {
  const defectCounts = result?.defect_counts || {};
  const detections = result?.detections || [];

  return (
    <div className="detection-summary">
      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Defects</span>
          <strong>{result?.total_defects ?? 0}</strong>
        </div>

        <div className="summary-card">
          <span>Defect Types</span>
          <strong>{Object.keys(defectCounts).length}</strong>
        </div>

        <div className="summary-card">
          <span>Detections</span>
          <strong>{detections.length}</strong>
        </div>
      </div>

      <div className="defect-count-section">
        <h3>Detected Defects</h3>

        {Object.keys(defectCounts).length > 0 ? (
          <div className="defect-count-grid">
            {Object.entries(defectCounts).map(([name, count]) => (
              <div className="defect-count-card" key={name}>
                <div>
                  <span className="defect-dot"></span>

                  <div>
                    <strong>{name}</strong>
                    <span>{count} detected</span>
                  </div>
                </div>

                <b>{count}</b>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-defects">No defect count information available.</p>
        )}
      </div>

      <style>{`
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .summary-card {
          padding: 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,221,176,0.1);
        }

        .summary-card span {
          display: block;
          margin-bottom: 7px;
          color: rgba(255,238,212,0.5);
          font-size: 11px;
        }

        .summary-card strong {
          color: #ffd18d;
          font-size: 28px;
        }

        .defect-count-section {
          margin-top: 23px;
        }

        .defect-count-section h3 {
          margin: 0 0 14px;
          color: #fff2df;
          font-size: 17px;
        }

        .defect-count-grid {
          display: grid;
          gap: 10px;
        }

        .defect-count-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 14px;
          border-radius: 16px;
          background: rgba(0,0,0,0.16);
          border: 1px solid rgba(255,220,170,0.09);
        }

        .defect-count-card > div {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .defect-dot {
          width: 9px;
          height: 9px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #d89049;
          box-shadow: 0 0 10px rgba(216,144,73,0.5);
        }

        .defect-count-card strong {
          display: block;
          color: #fff0da;
          text-transform: capitalize;
          font-size: 14px;
        }

        .defect-count-card span {
          display: block;
          margin-top: 3px;
          color: rgba(255,237,211,0.43);
          font-size: 11px;
        }

        .defect-count-card b {
          color: #ffd18d;
          font-size: 20px;
        }

        .no-defects {
          color: rgba(255,238,212,0.45);
        }

        @media (max-width: 560px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default DetectionSummary;
