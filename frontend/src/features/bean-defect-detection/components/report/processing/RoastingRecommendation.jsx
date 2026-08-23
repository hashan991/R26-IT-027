function RoastingRecommendation({ data }) {
  if (!data) {
    return null;
  }

  const getClass = (status) =>
    String(status || "")
      .toLowerCase()
      .replaceAll("_", "-");

  return (
    <div className="roasting-card">
      <div className="section-heading">
        <div>
          <span>ROASTING GUIDANCE</span>

          <h3>{data.title}</h3>
        </div>

        <strong
          className={`eligibility ${getClass(data.roasting_eligibility)}`}
        >
          {data.roasting_eligibility}
        </strong>
      </div>

      <p className="roasting-summary">{data.summary}</p>

      <div className="roasting-meta">
        <div>
          <span>Direct Roasting</span>

          <strong>
            {data.direct_roasting_allowed ? "Allowed" : "Not Allowed"}
          </strong>
        </div>

        <div>
          <span>Direction</span>

          <strong>{data.recommended_direction?.replaceAll("_", " ")}</strong>
        </div>
      </div>

      <div className="percentage-row">
        <div>
          <span>Broken</span>
          <strong>{data.broken_percentage?.toFixed(2)}%</strong>
        </div>

        <div>
          <span>Severe Defects</span>
          <strong>{data.severe_defect_percentage?.toFixed(2)}%</strong>
        </div>

        <div>
          <span>Unknown</span>
          <strong>{data.unknown_percentage?.toFixed(2)}%</strong>
        </div>
      </div>

      {data.reasons?.length > 0 && (
        <div className="roast-list">
          <h4>Decision Reasons</h4>

          {data.reasons.map((reason, index) => (
            <p key={index}>
              <span>•</span>
              {reason}
            </p>
          ))}
        </div>
      )}

      {data.prerequisites?.length > 0 && (
        <div className="roast-list">
          <h4>Before Roasting</h4>

          {data.prerequisites.map((item, index) => (
            <p key={index}>
              <span>✓</span>
              {item}
            </p>
          ))}
        </div>
      )}

      <style>{`

        .roasting-card {
          padding: 20px;

          border-radius: 22px;

          background:
            rgba(0, 0, 0, 0.13);

          border:
            1px solid
            rgba(255, 220, 170, 0.09);
        }


        .section-heading {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 15px;
        }


        .section-heading span {
          color: #d89c5a;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.2px;
        }


        .section-heading h3 {
          margin: 5px 0 0;

          color: #ffecd0;

          font-size: 18px;
        }


        .eligibility {
          padding: 6px 9px;

          border-radius: 999px;

          font-size: 8px;

          color: #ffd18d;

          background:
            rgba(255, 190, 90, 0.08);
        }


        .eligibility.ready {
          color: #a9e9b3;
        }


        .eligibility.not-recommended {
          color: #ff9b87;
        }


        .roasting-summary {
          margin: 12px 0;

          color:
            rgba(255, 235, 207, 0.52);

          font-size: 11px;

          line-height: 1.6;
        }


        .roasting-meta,
        .percentage-row {
          display: grid;

          gap: 9px;

          margin-top: 12px;
        }


        .roasting-meta {
          grid-template-columns:
            repeat(2, 1fr);
        }


        .percentage-row {
          grid-template-columns:
            repeat(3, 1fr);
        }


        .roasting-meta > div,
        .percentage-row > div {
          padding: 10px;

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.025);
        }


        .roasting-meta span,
        .percentage-row span {
          display: block;

          color:
            rgba(255, 237, 212, 0.35);

          font-size: 8px;
        }


        .roasting-meta strong,
        .percentage-row strong {
          display: block;

          margin-top: 4px;

          color: #f4d8b4;

          font-size: 10px;
        }


        .roast-list {
          margin-top: 14px;
        }


        .roast-list h4 {
          margin: 0 0 7px;

          color: #e1a663;

          font-size: 10px;
        }


        .roast-list p {
          display: flex;

          gap: 7px;

          margin: 5px 0;

          color:
            rgba(255, 236, 211, 0.5);

          font-size: 10px;

          line-height: 1.5;
        }

      `}</style>
    </div>
  );
}

export default RoastingRecommendation;
