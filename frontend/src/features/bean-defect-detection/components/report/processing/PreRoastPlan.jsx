function PreRoastPlan({ data }) {
  if (!data) {
    return null;
  }

  return (
    <div className="pre-roast-card">
      <div className="pre-roast-header">
        <div>
          <span>PRE-ROAST PREPARATION PLAN</span>

          <h3>{data.title}</h3>

          <p>{data.summary}</p>
        </div>

        <div className="prep-level">
          <small>Preparation Level</small>

          <strong>{data.estimated_preparation_level}</strong>
        </div>
      </div>

      <div className="prep-summary">
        <div>
          <span>Total Actions</span>
          <strong>{data.total_actions}</strong>
        </div>

        <div>
          <span>Mandatory</span>
          <strong>{data.mandatory_actions}</strong>
        </div>

        <div>
          <span>Physical Retest</span>
          <strong>{data.physical_retest_required ? "YES" : "NO"}</strong>
        </div>

        <div>
          <span>Sensor Retest</span>
          <strong>{data.sensor_retest_required ? "YES" : "NO"}</strong>
        </div>
      </div>

      <div className="prep-actions">
        {data.actions?.map((action) => (
          <div className="prep-action" key={action.step_number}>
            <div className="step-circle">{action.step_number}</div>

            <div className="prep-action-body">
              <div className="prep-action-top">
                <strong>{action.title}</strong>

                <span className={`priority ${action.priority?.toLowerCase()}`}>
                  {action.priority}
                </span>
              </div>

              <p>{action.description}</p>

              <small>
                {action.action_type}
                {action.required ? " • REQUIRED" : ""}
              </small>
            </div>
          </div>
        ))}
      </div>

      <style>{`

        .pre-roast-card {
          margin-top: 16px;

          padding: 20px;

          border-radius: 22px;

          background:
            rgba(0, 0, 0, 0.13);

          border:
            1px solid
            rgba(255, 220, 170, 0.08);
        }


        .pre-roast-header {
          display: flex;

          justify-content: space-between;

          gap: 20px;
        }


        .pre-roast-header > div:first-child > span {
          color: #d99d5d;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.2px;
        }


        .pre-roast-header h3 {
          margin: 6px 0;

          color: #ffecd1;
        }


        .pre-roast-header p {
          max-width: 650px;

          margin: 0;

          color:
            rgba(255, 235, 209, 0.5);

          font-size: 11px;

          line-height: 1.6;
        }


        .prep-level {
          text-align: right;
        }


        .prep-level small {
          display: block;

          color:
            rgba(255, 235, 210, 0.35);

          font-size: 8px;
        }


        .prep-level strong {
          display: block;

          margin-top: 5px;

          color: #ffb870;

          font-size: 12px;
        }


        .prep-summary {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 9px;

          margin-top: 16px;
        }


        .prep-summary div {
          padding: 10px;

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.025);
        }


        .prep-summary span {
          display: block;

          color:
            rgba(255, 236, 210, 0.35);

          font-size: 8px;
        }


        .prep-summary strong {
          display: block;

          margin-top: 4px;

          color: #f1d5b1;

          font-size: 11px;
        }


        .prep-actions {
          margin-top: 18px;
        }


        .prep-action {
          display: flex;

          gap: 12px;

          padding: 12px 0;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.05);
        }


        .step-circle {
          width: 30px;

          height: 30px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: #2d190d;

          background: #d99c5c;

          font-size: 10px;

          font-weight: 900;
        }


        .prep-action-body {
          flex: 1;
        }


        .prep-action-top {
          display: flex;

          justify-content: space-between;

          gap: 15px;
        }


        .prep-action-top strong {
          color: #f5dec0;

          font-size: 11px;
        }


        .prep-action p {
          margin: 5px 0;

          color:
            rgba(255, 235, 210, 0.44);

          font-size: 10px;

          line-height: 1.5;
        }


        .prep-action small {
          color:
            rgba(255, 217, 167, 0.45);

          font-size: 7px;
        }


        .priority {
          font-size: 7px;

          font-weight: 900;
        }


        .priority.critical {
          color: #ff8976;
        }


        .priority.high {
          color: #ffae70;
        }


        .priority.medium {
          color: #f3cf7f;
        }


        .priority.low {
          color: #a8d9a9;
        }


        @media(max-width: 700px) {
          .prep-summary {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

      `}</style>
    </div>
  );
}

export default PreRoastPlan;
