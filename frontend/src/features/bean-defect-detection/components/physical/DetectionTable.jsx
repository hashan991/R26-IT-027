function DetectionTable({ detections = [] }) {
  const formatConfidence = (confidence) => {
    if (confidence === undefined || confidence === null) {
      return "N/A";
    }

    const value = Number(confidence);

    if (Number.isNaN(value)) {
      return confidence;
    }

    return value <= 1 ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  const getConfidenceValue = (confidence) => {
    const value = Number(confidence);

    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.min(100, value <= 1 ? value * 100 : value);
  };

  return (
    <div className="detection-table-section">
      <div className="detection-table-header">
        <span>CONFIDENCE ANALYSIS</span>
        <h3>Detection Details</h3>
      </div>

      {detections.length > 0 ? (
        <div className="physical-table-wrap">
          <table className="physical-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Confidence</th>
              </tr>
            </thead>

            <tbody>
              {detections.map((item, index) => (
                <tr key={index}>
                  <td>
                    <span className="physical-class-chip">
                      {item.class_name}
                    </span>
                  </td>

                  <td>
                    <div className="confidence-data">
                      <strong>{formatConfidence(item.confidence)}</strong>

                      <div className="physical-confidence-track">
                        <div
                          style={{
                            width: `${getConfidenceValue(item.confidence)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-detection-table">
          No individual detections available.
        </p>
      )}

      <style>{`
        .detection-table-header > span {
          display: block;
          margin-bottom: 4px;
          color: #dca05e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .detection-table-header h3 {
          margin: 0 0 15px;
          color: #fff2de;
          font-size: 20px;
        }

        .physical-table-wrap {
          overflow-x: auto;
          border-radius: 17px;
          border: 1px solid rgba(255,220,170,0.09);
        }

        .physical-table {
          width: 100%;
          border-collapse: collapse;
        }

        .physical-table th,
        .physical-table td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid rgba(255,220,170,0.08);
        }

        .physical-table th {
          color: #e7b274;
          background: rgba(255,255,255,0.045);
          font-size: 10px;
          letter-spacing: 1px;
        }

        .physical-class-chip {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          color: #ffe0af;
          background: rgba(255,216,159,0.08);
          text-transform: capitalize;
          font-size: 11px;
          font-weight: 800;
        }

        .confidence-data strong {
          display: block;
          margin-bottom: 6px;
          color: #fff0da;
          font-size: 12px;
        }

        .physical-confidence-track {
          width: 100%;
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
        }

        .physical-confidence-track div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #ad6234,
            #ffd28b
          );
        }

        .empty-detection-table {
          color: rgba(255,238,212,0.45);
        }
      `}</style>
    </div>
  );
}

export default DetectionTable;
