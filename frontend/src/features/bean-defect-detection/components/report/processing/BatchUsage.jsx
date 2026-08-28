function BatchUsage({ data }) {
  if (!data) {
    return null;
  }

  const suitabilityClass = (value) =>
    String(value || "")
      .toLowerCase()
      .replaceAll("_", "-");

  return (
    <div className="batch-usage-card">
      <div className="usage-header">
        <div>
          <span>BATCH USAGE RECOMMENDATION</span>

          <h3>{data.title}</h3>

          <p>{data.summary}</p>
        </div>

        <strong>{data.primary_recommendation?.replaceAll("_", " ")}</strong>
      </div>

      <div className="recommended-use">
        <span>Recommended Use</span>

        <strong>{data.recommended_use}</strong>
      </div>

      <div className="usage-options">
        {data.usage_options?.map((option, index) => (
          <div className="usage-option" key={index}>
            <div>
              <strong>{option.use_case}</strong>

              <p>{option.explanation}</p>
            </div>

            <span className={suitabilityClass(option.suitability)}>
              {option.suitability}
            </span>
          </div>
        ))}
      </div>

      <style>{`

        .batch-usage-card {
          margin-top: 16px;

          padding: 20px;

          border-radius: 22px;

          background:
            rgba(0, 0, 0, 0.13);

          border:
            1px solid
            rgba(255, 220, 170, 0.08);
        }


        .usage-header {
          display: flex;

          justify-content: space-between;

          gap: 20px;
        }


        .usage-header > div > span {
          color: #d99d5d;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.2px;
        }


        .usage-header h3 {
          margin: 6px 0;

          color: #ffe8ca;
        }


        .usage-header p {
          max-width: 650px;

          margin: 0;

          color:
            rgba(255, 235, 210, 0.48);

          font-size: 11px;

          line-height: 1.6;
        }


        .usage-header > strong {
          color: #ffc17d;

          font-size: 10px;
        }


        .recommended-use {
          margin-top: 15px;

          padding: 12px;

          border-radius: 13px;

          background:
            rgba(218, 147, 79, 0.07);
        }


        .recommended-use span {
          display: block;

          color:
            rgba(255, 229, 195, 0.4);

          font-size: 8px;
        }


        .recommended-use strong {
          display: block;

          margin-top: 4px;

          color: #f5d5ac;

          font-size: 11px;
        }


        .usage-options {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 9px;

          margin-top: 14px;
        }


        .usage-option {
          display: flex;

          justify-content: space-between;

          gap: 12px;

          padding: 12px;

          border-radius: 13px;

          background:
            rgba(255, 255, 255, 0.025);
        }


        .usage-option > div {
          flex: 1;
        }


        .usage-option strong {
          color: #ecd2ae;

          font-size: 10px;
        }


        .usage-option p {
          margin: 4px 0 0;

          color:
            rgba(255, 236, 211, 0.4);

          font-size: 9px;

          line-height: 1.5;
        }


        .usage-option > span {
          flex-shrink: 0;

          font-size: 7px;

          font-weight: 900;
        }


        .usage-option > span.suitable {
          color: #94dc9e;
        }


        .usage-option > span.conditional {
          color: #f1c570;
        }


        .usage-option > span.not-recommended {
          color: #ff9480;
        }


        @media(max-width: 700px) {
          .usage-options {
            grid-template-columns: 1fr;
          }
        }

      `}</style>
    </div>
  );
}

export default BatchUsage;
