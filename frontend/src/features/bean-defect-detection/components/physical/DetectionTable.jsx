function DetectionTable({ detections = [] }) {
  const formatConfidence = (confidence) => {
    if (confidence === undefined || confidence === null) {
      return "N/A";
    }

    const value = Number(confidence);

    if (Number.isNaN(value)) {
      return "N/A";
    }

    return value <= 1 ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  const formatLabel = (value) => {
    if (!value) {
      return "Unknown";
    }

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getFinalClass = (className) => {
    switch (className) {
      case "good":
        return "result-good";

      case "broken":
        return "result-broken";

      case "black":
        return "result-black";

      case "black_and_broken":
        return "result-black-broken";

      default:
        return "result-unknown";
    }
  };

  return (
    <div className="detection-table-section">
      <div className="detection-table-header">
        <span>PER-BEAN AI ANALYSIS</span>

        <h3>Detection Details</h3>

        <p>
          Review the detector, color classifier, shape classifier and final
          category for each detected coffee bean.
        </p>
      </div>

      {detections.length > 0 ? (
        <div className="physical-table-wrap">
          <table className="physical-table">
            <thead>
              <tr>
                <th>Bean</th>

                <th>Detector</th>

                <th>Color</th>

                <th>Color Confidence</th>

                <th>Shape</th>

                <th>Shape Confidence</th>

                <th>Final Result</th>
              </tr>
            </thead>

            <tbody>
              {detections.map((item, index) => {
                const beanId = item.bean_id ?? index + 1;

                const detectorConfidence = item.detector?.confidence;

                const colorName = item.color?.class_name ?? "unknown";

                const colorConfidence = item.color?.confidence;

                const shapeName = item.shape?.class_name ?? "unknown";

                const shapeConfidence = item.shape?.confidence;

                const finalResult = item.class_name ?? "unknown";

                return (
                  <tr key={item.bean_id ?? index}>
                    {/* BEAN ID */}
                    <td>
                      <span className="bean-id-chip">#{beanId}</span>
                    </td>

                    {/* DETECTOR */}
                    <td>
                      <div className="ai-confidence-cell">
                        <strong>{formatConfidence(detectorConfidence)}</strong>

                        <span>Coffee Bean</span>
                      </div>
                    </td>

                    {/* COLOR */}
                    <td>
                      <span className="physical-class-chip color-chip">
                        {formatLabel(colorName)}
                      </span>
                    </td>

                    {/* COLOR CONFIDENCE */}
                    <td>
                      <div className="confidence-data">
                        <strong>{formatConfidence(colorConfidence)}</strong>
                      </div>
                    </td>

                    {/* SHAPE */}
                    <td>
                      <span className="physical-class-chip shape-chip">
                        {formatLabel(shapeName)}
                      </span>
                    </td>

                    {/* SHAPE CONFIDENCE */}
                    <td>
                      <div className="confidence-data">
                        <strong>{formatConfidence(shapeConfidence)}</strong>
                      </div>
                    </td>

                    {/* FINAL RESULT */}
                    <td>
                      <span
                        className={`
                            final-result-chip
                            ${getFinalClass(finalResult)}
                          `}
                      >
                        {formatLabel(finalResult)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-detection-table">
          No individual bean detections available.
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
          margin: 0;

          color: #fff2de;

          font-size: 20px;
        }

        .detection-table-header p {
          max-width: 600px;

          margin: 7px 0 15px;

          color: rgba(
            255,
            238,
            212,
            0.45
          );

          font-size: 11px;
          line-height: 1.55;
        }

        .physical-table-wrap {
          width: 100%;

          overflow-x: auto;

          border-radius: 17px;

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.09
            );
        }

        .physical-table {
          width: 100%;

          min-width: 950px;

          border-collapse: collapse;
        }

        .physical-table th,
        .physical-table td {
          padding: 13px;

          text-align: left;

          vertical-align: middle;

          border-bottom:
            1px solid
            rgba(
              255,
              220,
              170,
              0.08
            );
        }

        .physical-table tbody tr:last-child td {
          border-bottom: none;
        }

        .physical-table th {
          color: #e7b274;

          background:
            rgba(
              255,
              255,
              255,
              0.045
            );

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.8px;

          white-space: nowrap;
        }

        .physical-table tbody tr {
          transition:
            background 0.2s ease;
        }

        .physical-table tbody tr:hover {
          background:
            rgba(
              255,
              255,
              255,
              0.025
            );
        }

        .bean-id-chip {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          min-width: 38px;

          padding: 6px 8px;

          border-radius: 9px;

          color: #ffd18d;

          background:
            rgba(
              255,
              209,
              141,
              0.07
            );

          border:
            1px solid
            rgba(
              255,
              209,
              141,
              0.12
            );

          font-size: 11px;
          font-weight: 900;
        }

        .physical-class-chip {
          display: inline-flex;

          padding: 6px 10px;

          border-radius: 999px;

          color: #ffe0af;

          background:
            rgba(
              255,
              216,
              159,
              0.08
            );

          font-size: 10px;
          font-weight: 800;

          white-space: nowrap;
        }

        .color-chip {
          color: #ffd69c;

          background:
            rgba(
              221,
              156,
              89,
              0.1
            );
        }

        .shape-chip {
          color: #e8d9bd;

          background:
            rgba(
              255,
              255,
              255,
              0.065
            );
        }

        .confidence-data strong {
          color: #fff0da;

          font-size: 11px;
        }

        .ai-confidence-cell strong {
          display: block;

          color: #fff0da;

          font-size: 11px;
        }

        .ai-confidence-cell span {
          display: block;

          margin-top: 3px;

          color:
            rgba(
              255,
              237,
              211,
              0.38
            );

          font-size: 9px;
        }

        .final-result-chip {
          display: inline-flex;

          align-items: center;

          padding: 7px 11px;

          border-radius: 999px;

          font-size: 10px;
          font-weight: 900;

          white-space: nowrap;
        }

        .result-good {
          color: #b9efbd;

          background:
            rgba(
              92,
              180,
              101,
              0.12
            );

          border:
            1px solid
            rgba(
              92,
              180,
              101,
              0.19
            );
        }

        .result-broken {
          color: #ffd19c;

          background:
            rgba(
              224,
              145,
              68,
              0.12
            );

          border:
            1px solid
            rgba(
              224,
              145,
              68,
              0.19
            );
        }

        .result-black {
          color: #ffb0a4;

          background:
            rgba(
              210,
              74,
              59,
              0.12
            );

          border:
            1px solid
            rgba(
              210,
              74,
              59,
              0.19
            );
        }

        .result-black-broken {
          color: #f0afe7;

          background:
            rgba(
              192,
              81,
              180,
              0.12
            );

          border:
            1px solid
            rgba(
              192,
              81,
              180,
              0.19
            );
        }

        .result-unknown {
          color: #eee1a2;

          background:
            rgba(
              211,
              188,
              76,
              0.1
            );

          border:
            1px solid
            rgba(
              211,
              188,
              76,
              0.17
            );
        }

        .empty-detection-table {
          color:
            rgba(
              255,
              238,
              212,
              0.45
            );
        }
      `}</style>
    </div>
  );
}

export default DetectionTable;
