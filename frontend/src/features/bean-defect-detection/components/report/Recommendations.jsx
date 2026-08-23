function Recommendations({ recommendations = [] }) {
  return (
    <div className="recommendation-section">
      <div className="recommendation-heading">
        <div>
          <span>DECISION SUPPORT</span>
          <h3>Defect-Based Recommendations</h3>

          <p>
            Recommended actions based on sensor and physical quality analysis.
          </p>
        </div>

        <div className="recommendation-ai-badge">AI</div>
      </div>

      {recommendations.length > 0 ? (
        <div className="recommendation-list">
          {recommendations.map((item, index) => (
            <div
              className={`recommendation-item recommendation-${
                item.type || "info"
              }`}
              key={index}
            >
              <div className="recommendation-number">{index + 1}</div>

              <div className="recommendation-content">
                <div className="recommendation-top">
                  <strong>{item.title}</strong>

                  {item.priority && (
                    <span className="priority-badge">{item.priority}</span>
                  )}
                </div>

                <p>{item.description}</p>

                {item.action && (
                  <div className="recommended-action">
                    <span>Recommended Action</span>
                    <strong>{item.action}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-recommendations">No recommendations generated.</div>
      )}

      <style>{`
        .recommendation-section {
          width: 100%;
        }

        .recommendation-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          gap: 20px;

          margin-bottom: 17px;
        }

        .recommendation-heading > div > span {
          display: block;

          margin-bottom: 5px;

          color: #dca05e;

          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .recommendation-heading h3 {
          margin: 0;

          color: #fff1dc;

          font-size: 21px;
        }

        .recommendation-heading p {
          max-width: 600px;

          margin: 7px 0 0;

          color: rgba(255,238,212,0.45);

          font-size: 12px;
          line-height: 1.5;
        }

        .recommendation-ai-badge {
          width: 46px;
          height: 46px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border-radius: 14px;

          color: #2b170c;

          background:
            linear-gradient(
              135deg,
              #ffe0a4,
              #d28a47
            );

          font-size: 13px;
          font-weight: 950;
        }

        .recommendation-list {
          display: grid;
          gap: 11px;
        }

        .recommendation-item {
          display: grid;
          grid-template-columns: auto 1fr;

          gap: 13px;

          padding: 15px;

          border-radius: 17px;

          background:
            rgba(0,0,0,0.15);

          border:
            1px solid rgba(255,220,170,0.08);
        }

        .recommendation-number {
          width: 32px;
          height: 32px;

          display: grid;
          place-items: center;

          border-radius: 11px;

          color: #2b170c;

          background: #d48b47;

          font-size: 11px;
          font-weight: 950;
        }

        .recommendation-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;
        }

        .recommendation-content strong {
          color: #ffe8c6;

          font-size: 13px;
        }

        .recommendation-content p {
          margin: 6px 0 0;

          color: rgba(255,238,212,0.45);

          font-size: 11px;
          line-height: 1.55;
        }

        .priority-badge {
          padding: 5px 8px;

          border-radius: 999px;

          color: #ffd49a;

          background:
            rgba(255,211,154,0.07);

          border:
            1px solid rgba(255,211,154,0.1);

          font-size: 9px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .recommended-action {
          margin-top: 10px;

          padding: 10px 11px;

          border-radius: 12px;

          background:
            rgba(255,255,255,0.035);

          border:
            1px solid rgba(255,220,170,0.06);
        }

        .recommended-action span {
          display: block;

          margin-bottom: 3px;

          color: rgba(255,238,212,0.35);

          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .recommended-action strong {
          color: #ffd294;

          font-size: 11px;
        }

        .recommendation-warning {
          border-left:
            3px solid rgba(218,147,57,0.65);
        }

        .recommendation-danger {
          border-left:
            3px solid rgba(206,75,62,0.65);
        }

        .recommendation-success {
          border-left:
            3px solid rgba(83,181,96,0.65);
        }

        .recommendation-info {
          border-left:
            3px solid rgba(210,137,70,0.65);
        }

        .no-recommendations {
          padding: 17px;

          border-radius: 15px;

          color: rgba(255,238,212,0.4);

          background:
            rgba(0,0,0,0.12);

          font-size: 12px;
        }

        @media (max-width: 560px) {
          .recommendation-heading {
            align-items: stretch;
            flex-direction: column;
          }

          .recommendation-top {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default Recommendations;
