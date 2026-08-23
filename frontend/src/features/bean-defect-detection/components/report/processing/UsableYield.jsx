function UsableYield({ data }) {
  if (!data) {
    return null;
  }

  return (
    <div className="yield-card">
      <div className="yield-header">
        <div>
          <span>ESTIMATED USABLE YIELD</span>

          <h3>{data.title}</h3>

          <p>{data.summary}</p>
        </div>

        <div className="yield-status">
          <small>Yield Status</small>

          <strong>{data.yield_status}</strong>
        </div>
      </div>

      <div className="yield-main">
        <div>
          <span>Clean Good Yield</span>

          <strong>{data.clean_good_percentage?.toFixed(2)}%</strong>

          <small>{data.clean_good_count} beans</small>
        </div>

        <div>
          <span>Severe Reject</span>

          <strong>{data.severe_reject_percentage?.toFixed(2)}%</strong>

          <small>{data.severe_reject_count} beans</small>
        </div>

        <div>
          <span>Potential Recoverable</span>

          <strong>{data.potential_recoverable_percentage?.toFixed(2)}%</strong>

          <small>{data.potential_recoverable_count} beans</small>
        </div>
      </div>

      <div className="yield-extra">
        <span>
          Recovery Potential:
          <strong> {data.recovery_potential}</strong>
        </span>

        <span>
          Basis:
          <strong> {data.yield_basis?.replaceAll("_", " ")}</strong>
        </span>
      </div>

      {data.interpretation?.length > 0 && (
        <div className="yield-interpretation">
          {data.interpretation.map((item, index) => (
            <p key={index}>• {item}</p>
          ))}
        </div>
      )}

      <style>{`

        .yield-card {
          margin-top: 16px;

          padding: 20px;

          border-radius: 22px;

          background:
            rgba(0, 0, 0, 0.13);

          border:
            1px solid
            rgba(255, 220, 170, 0.08);
        }


        .yield-header {
          display: flex;

          justify-content: space-between;

          gap: 20px;
        }


        .yield-header > div:first-child > span {
          color: #d99d5c;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.2px;
        }


        .yield-header h3 {
          margin: 6px 0;

          color: #ffe8ca;
        }


        .yield-header p {
          max-width: 650px;

          margin: 0;

          color:
            rgba(255, 235, 210, 0.47);

          font-size: 11px;

          line-height: 1.6;
        }


        .yield-status {
          text-align: right;
        }


        .yield-status small {
          display: block;

          color:
            rgba(255, 235, 210, 0.35);

          font-size: 8px;
        }


        .yield-status strong {
          display: block;

          margin-top: 4px;

          color: #ffc07c;
        }


        .yield-main {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 10px;

          margin-top: 16px;
        }


        .yield-main > div {
          padding: 14px;

          border-radius: 14px;

          background:
            rgba(255, 255, 255, 0.025);
        }


        .yield-main span {
          display: block;

          color:
            rgba(255, 236, 210, 0.38);

          font-size: 8px;
        }


        .yield-main strong {
          display: block;

          margin-top: 4px;

          color: #f4d1a8;

          font-size: 22px;
        }


        .yield-main small {
          display: block;

          margin-top: 2px;

          color:
            rgba(255, 231, 199, 0.38);

          font-size: 8px;
        }


        .yield-extra {
          display: flex;

          gap: 20px;

          margin-top: 12px;

          color:
            rgba(255, 235, 210, 0.38);

          font-size: 9px;
        }


        .yield-extra strong {
          color: #eec999;
        }


        .yield-interpretation {
          margin-top: 14px;
        }


        .yield-interpretation p {
          margin: 5px 0;

          color:
            rgba(255, 235, 210, 0.43);

          font-size: 9px;

          line-height: 1.5;
        }


        @media(max-width: 700px) {
          .yield-main {
            grid-template-columns: 1fr;
          }
        }

      `}</style>
    </div>
  );
}

export default UsableYield;
