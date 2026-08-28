function ProductionDecision({ data }) {
  if (!data) {
    return null;
  }

  const statusClass = String(data.production_status || "").toLowerCase();

  return (
    <div className={`production-card ${statusClass}`}>
      <div className="production-header">
        <div>
          <span className="production-label">FINAL PRODUCTION DECISION</span>

          <h2>{data.title}</h2>

          <p>{data.summary}</p>
        </div>

        <div className="production-status">
          <small>STATUS</small>

          <strong>{data.production_status}</strong>
        </div>
      </div>

      <div className="decision-code">
        <span>Decision</span>

        <strong>{data.decision?.replaceAll("_", " ")}</strong>
      </div>

      <div className="production-flags">
        <div>
          <span>Roasting</span>
          <strong>{data.can_proceed_to_roasting ? "YES" : "NO"}</strong>
        </div>

        <div>
          <span>Release</span>
          <strong>{data.release_authorized ? "AUTHORIZED" : "BLOCKED"}</strong>
        </div>

        <div>
          <span>Batch Hold</span>
          <strong>{data.batch_hold_required ? "YES" : "NO"}</strong>
        </div>

        <div>
          <span>Rework</span>
          <strong>{data.rework_required ? "YES" : "NO"}</strong>
        </div>
      </div>

      <div className="immediate-action">
        <span>IMMEDIATE ACTION</span>

        <strong>{data.immediate_action}</strong>

        <small>Next Stage: {data.next_stage?.replaceAll("_", " ")}</small>
      </div>

      <div className="production-actions">
        <h4>Required Factory Actions</h4>

        {data.required_actions?.map((action) => (
          <div className="production-action" key={action.step_number}>
            <span className="production-step">{action.step_number}</span>

            <div>
              <strong>{action.title}</strong>

              <p>{action.description}</p>

              <small>
                {action.stage?.replaceAll("_", " ")}
                {" • "}
                {action.priority}
              </small>
            </div>
          </div>
        ))}
      </div>

      <style>{`

        .production-card {
          padding: 22px;

          border-radius: 24px;

          border:
            1px solid
            rgba(255, 184, 110, 0.16);

          background:
            linear-gradient(
              135deg,
              rgba(171, 91, 41, 0.15),
              rgba(0, 0, 0, 0.18)
            );
        }


        .production-card.ready {
          border-color:
            rgba(80, 190, 100, 0.18);
        }


        .production-card.rejected {
          border-color:
            rgba(235, 80, 65, 0.2);
        }


        .production-header {
          display: flex;

          justify-content: space-between;

          gap: 20px;
        }


        .production-label {
          color: #dfa15d;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1.4px;
        }


        .production-header h2 {
          margin: 6px 0;

          color: #fff0d7;

          font-size: 23px;
        }


        .production-header p {
          max-width: 690px;

          margin: 0;

          color:
            rgba(255, 237, 211, 0.5);

          font-size: 11px;

          line-height: 1.6;
        }


        .production-status {
          text-align: right;
        }


        .production-status small {
          display: block;

          color:
            rgba(255, 235, 209, 0.35);

          font-size: 7px;
        }


        .production-status strong {
          display: block;

          margin-top: 4px;

          color: #ffb575;

          font-size: 14px;
        }


        .decision-code {
          margin-top: 16px;

          padding: 12px;

          border-radius: 13px;

          background:
            rgba(255, 255, 255, 0.03);
        }


        .decision-code span {
          display: block;

          color:
            rgba(255, 236, 210, 0.36);

          font-size: 8px;
        }


        .decision-code strong {
          display: block;

          margin-top: 4px;

          color: #ffc487;

          font-size: 13px;
        }


        .production-flags {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 9px;

          margin-top: 12px;
        }


        .production-flags > div {
          padding: 11px;

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.025);
        }


        .production-flags span {
          display: block;

          color:
            rgba(255, 236, 210, 0.35);

          font-size: 8px;
        }


        .production-flags strong {
          display: block;

          margin-top: 4px;

          color: #f1cfaa;

          font-size: 10px;
        }


        .immediate-action {
          margin-top: 13px;

          padding: 14px;

          border-radius: 14px;

          background:
            rgba(218, 147, 79, 0.08);
        }


        .immediate-action > span {
          display: block;

          color: #dfa15d;

          font-size: 8px;

          font-weight: 900;
        }


        .immediate-action strong {
          display: block;

          margin-top: 5px;

          color: #f5d3aa;

          font-size: 12px;
        }


        .immediate-action small {
          display: block;

          margin-top: 4px;

          color:
            rgba(255, 231, 200, 0.4);

          font-size: 8px;
        }


        .production-actions {
          margin-top: 17px;
        }


        .production-actions h4 {
          color: #dfa15d;

          font-size: 10px;
        }


        .production-action {
          display: flex;

          gap: 11px;

          padding: 10px 0;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.05);
        }


        .production-step {
          width: 27px;

          height: 27px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: #321c0f;

          background: #dda05e;

          font-size: 9px;

          font-weight: 900;
        }


        .production-action strong {
          color: #efd5b4;

          font-size: 10px;
        }


        .production-action p {
          margin: 4px 0;

          color:
            rgba(255, 235, 209, 0.42);

          font-size: 9px;

          line-height: 1.5;
        }


        .production-action small {
          color:
            rgba(255, 204, 148, 0.45);

          font-size: 7px;
        }


        @media(max-width: 700px) {
          .production-flags {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .production-header {
            flex-direction: column;
          }
        }

      `}</style>
    </div>
  );
}

export default ProductionDecision;
