function QualityFindings({ sensorFindings = [], physicalFindings = [] }) {
  return (
    <div className="quality-findings">
      <div className="findings-header">
        <span>QUALITY ANALYSIS</span>
        <h3>Quality Findings</h3>
      </div>

      <div className="findings-grid">
        <div className="finding-group">
          <div className="finding-group-title">
            <div className="finding-icon">S</div>

            <div>
              <strong>Sensor Findings</strong>
              <span>Sensor-based quality observations</span>
            </div>
          </div>

          {sensorFindings.length > 0 ? (
            <div className="finding-list">
              {sensorFindings.map((item, index) => (
                <div
                  className={`finding-item finding-${item.status || "normal"}`}
                  key={index}
                >
                  <div className="finding-status-icon">
                    {item.status === "warning"
                      ? "!"
                      : item.status === "poor"
                        ? "×"
                        : "✓"}
                  </div>

                  <div>
                    <strong>{item.title}</strong>

                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-findings">No sensor findings available.</p>
          )}
        </div>

        <div className="finding-group">
          <div className="finding-group-title">
            <div className="finding-icon">AI</div>

            <div>
              <strong>Physical Findings</strong>
              <span>Computer vision quality observations</span>
            </div>
          </div>

          {physicalFindings.length > 0 ? (
            <div className="finding-list">
              {physicalFindings.map((item, index) => (
                <div
                  className={`finding-item finding-${item.status || "normal"}`}
                  key={index}
                >
                  <div className="finding-status-icon">
                    {item.status === "warning"
                      ? "!"
                      : item.status === "poor"
                        ? "×"
                        : "✓"}
                  </div>

                  <div>
                    <strong>{item.title}</strong>

                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-findings">No physical findings available.</p>
          )}
        </div>
      </div>

      <style>{`
        .quality-findings {
          width: 100%;
        }

        .findings-header {
          margin-bottom: 16px;
        }

        .findings-header > span {
          display: block;
          margin-bottom: 5px;

          color: #dca05e;

          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .findings-header h3 {
          margin: 0;

          color: #fff1dc;
          font-size: 21px;
        }

        .findings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .finding-group {
          padding: 19px;

          border-radius: 20px;

          background: rgba(0,0,0,0.15);

          border:
            1px solid rgba(255,220,170,0.09);
        }

        .finding-group-title {
          display: flex;
          align-items: center;

          gap: 12px;

          margin-bottom: 16px;
        }

        .finding-icon {
          width: 42px;
          height: 42px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border-radius: 13px;

          color: #2a160b;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d08946
            );

          font-size: 12px;
          font-weight: 950;
        }

        .finding-group-title strong {
          display: block;

          color: #fff0da;

          font-size: 14px;
        }

        .finding-group-title span {
          display: block;

          margin-top: 3px;

          color: rgba(255,237,211,0.4);

          font-size: 10px;
        }

        .finding-list {
          display: grid;
          gap: 10px;
        }

        .finding-item {
          display: grid;
          grid-template-columns: auto 1fr;

          gap: 11px;

          align-items: flex-start;

          padding: 12px;

          border-radius: 15px;

          background:
            rgba(255,255,255,0.035);

          border:
            1px solid rgba(255,220,170,0.07);
        }

        .finding-status-icon {
          width: 27px;
          height: 27px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          font-size: 11px;
          font-weight: 950;
        }

        .finding-normal .finding-status-icon {
          color: #a7e7af;

          background:
            rgba(69,170,82,0.12);
        }

        .finding-warning .finding-status-icon {
          color: #ffd18c;

          background:
            rgba(215,145,52,0.12);
        }

        .finding-poor .finding-status-icon {
          color: #ffaaa0;

          background:
            rgba(201,64,53,0.12);
        }

        .finding-item strong {
          color: #ffe9c9;

          font-size: 12px;
        }

        .finding-item p {
          margin: 4px 0 0;

          color: rgba(255,238,212,0.42);

          font-size: 11px;
          line-height: 1.5;
        }

        .no-findings {
          margin: 0;

          color: rgba(255,238,212,0.4);

          font-size: 12px;
        }

        @media (max-width: 800px) {
          .findings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default QualityFindings;
