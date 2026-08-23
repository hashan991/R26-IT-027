function RoastRisk({ data }) {
  if (!data) {
    return null;
  }

  return (
    <div className="risk-card">
      <div className="risk-header">
        <div>
          <span>ROAST QUALITY RISK</span>

          <h3>{data.title}</h3>
        </div>

        <div className="overall-risk">
          <strong>{data.overall_risk_score?.toFixed(2)}</strong>

          <small>/100</small>

          <span>{data.overall_risk}</span>
        </div>
      </div>

      <p className="risk-summary">{data.summary}</p>

      <div className="risk-items">
        {data.risks?.map((risk, index) => (
          <div className="risk-item" key={index}>
            <div>
              <strong>{risk.risk_name}</strong>

              <p>{risk.explanation}</p>
            </div>

            <div className="risk-value">
              <strong>{risk.risk_score?.toFixed(2)}</strong>

              <span>{risk.risk_level}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="risk-controls">
        <h4>Recommended Controls</h4>

        {data.recommended_controls?.map((item, index) => (
          <p key={index}>✓ {item}</p>
        ))}
      </div>

      <style>{`

        .risk-card {
          padding: 20px;

          border-radius: 22px;

          background:
            rgba(0, 0, 0, 0.13);

          border:
            1px solid
            rgba(255, 220, 170, 0.08);
        }


        .risk-header {
          display: flex;

          justify-content: space-between;

          gap: 15px;
        }


        .risk-header > div:first-child > span {
          color: #d99c5b;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.2px;
        }


        .risk-header h3 {
          margin: 5px 0 0;

          color: #ffe8ca;

          font-size: 18px;
        }


        .overall-risk {
          text-align: right;
        }


        .overall-risk strong {
          color: #ff9a82;

          font-size: 24px;
        }


        .overall-risk small {
          color:
            rgba(255, 235, 210, 0.35);

          font-size: 8px;
        }


        .overall-risk span {
          display: block;

          color: #ff9a82;

          font-size: 8px;

          font-weight: 900;
        }


        .risk-summary {
          margin: 12px 0;

          color:
            rgba(255, 235, 210, 0.5);

          font-size: 11px;

          line-height: 1.6;
        }


        .risk-item {
          display: flex;

          justify-content: space-between;

          gap: 15px;

          padding: 11px;

          margin-top: 8px;

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.025);
        }


        .risk-item > div:first-child {
          flex: 1;
        }


        .risk-item strong {
          color: #efd4b0;

          font-size: 10px;
        }


        .risk-item p {
          margin: 4px 0 0;

          color:
            rgba(255, 236, 212, 0.38);

          font-size: 9px;

          line-height: 1.5;
        }


        .risk-value {
          text-align: right;
        }


        .risk-value strong {
          display: block;

          color: #ffc18b;

          font-size: 15px;
        }


        .risk-value span {
          display: block;

          color:
            rgba(255, 200, 150, 0.65);

          font-size: 7px;

          font-weight: 900;
        }


        .risk-controls {
          margin-top: 13px;
        }


        .risk-controls h4 {
          margin: 0 0 6px;

          color: #dfa25f;

          font-size: 9px;
        }


        .risk-controls p {
          margin: 4px 0;

          color:
            rgba(255, 236, 210, 0.45);

          font-size: 9px;
        }

      `}</style>
    </div>
  );
}

export default RoastRisk;
