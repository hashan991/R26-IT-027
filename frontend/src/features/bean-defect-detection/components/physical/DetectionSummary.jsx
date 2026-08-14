function DetectionSummary({ result }) {
  const categoryCounts = result?.category_counts || {};

  const totalBeans = result?.total_beans ?? result?.total_count ?? 0;

  const goodCount = result?.good_count ?? categoryCounts.good ?? 0;

  const brokenCount = result?.broken_count ?? categoryCounts.broken ?? 0;

  const blackCount = result?.black_count ?? categoryCounts.black ?? 0;

  const blackBrokenCount =
    result?.black_broken_count ?? categoryCounts.black_and_broken ?? 0;

  const unknownCount = result?.unknown_count ?? categoryCounts.unknown ?? 0;

  const totalDefects =
    result?.total_defects ?? brokenCount + blackCount + blackBrokenCount;

  const goodPercentage = result?.good_percentage ?? 0;

  const defectPercentage = result?.defect_percentage ?? 0;

  const categories = [
    {
      key: "good",
      label: "Good",
      count: goodCount,
      description: "Normal brown + whole",
    },
    {
      key: "broken",
      label: "Broken",
      count: brokenCount,
      description: "Normal brown + broken",
    },
    {
      key: "black",
      label: "Black",
      count: blackCount,
      description: "Black + whole",
    },
    {
      key: "black_and_broken",
      label: "Black + Broken",
      count: blackBrokenCount,
      description: "Black + broken",
    },
    {
      key: "unknown",
      label: "Unknown",
      count: unknownCount,
      description: "Unmatched AI combination",
    },
  ];

  return (
    <div className="detection-summary">
      {/* MAIN SUMMARY */}
      <div className="summary-heading">
        <span>PHYSICAL QUALITY SUMMARY</span>
        <h3>Bean Analysis Results</h3>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Beans</span>
          <strong>{totalBeans}</strong>
        </div>

        <div className="summary-card good-card">
          <span>Good Beans</span>
          <strong>{goodCount}</strong>
        </div>

        <div className="summary-card defect-card">
          <span>Defective Beans</span>
          <strong>{totalDefects}</strong>
        </div>

        <div className="summary-card">
          <span>Unknown</span>
          <strong>{unknownCount}</strong>
        </div>
      </div>

      {/* QUALITY PERCENTAGES */}
      <div className="quality-rate-grid">
        <div className="quality-rate-card">
          <div className="rate-header">
            <span>Good Rate</span>

            <strong>{Number(goodPercentage).toFixed(1)}%</strong>
          </div>

          <div className="rate-track">
            <div
              className="good-rate-fill"
              style={{
                width: `${Math.min(100, Number(goodPercentage))}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="quality-rate-card">
          <div className="rate-header">
            <span>Defect Rate</span>

            <strong>{Number(defectPercentage).toFixed(1)}%</strong>
          </div>

          <div className="rate-track">
            <div
              className="defect-rate-fill"
              style={{
                width: `${Math.min(100, Number(defectPercentage))}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="defect-count-section">
        <div className="category-heading">
          <span>AI CLASSIFICATION</span>
          <h3>Bean Category Breakdown</h3>
        </div>

        <div className="defect-count-grid">
          {categories.map((category) => (
            <div
              className={`defect-count-card category-${category.key}`}
              key={category.key}
            >
              <div>
                <span className="defect-dot"></span>

                <div>
                  <strong>{category.label}</strong>

                  <span>{category.description}</span>
                </div>
              </div>

              <b>{category.count}</b>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .summary-heading > span,
        .category-heading > span {
          display: block;
          margin-bottom: 4px;
          color: #dca05e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .summary-heading h3,
        .category-heading h3 {
          margin: 0 0 15px;
          color: #fff2de;
          font-size: 20px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .summary-card {
          padding: 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,221,176,0.1);
        }

        .summary-card span {
          display: block;
          margin-bottom: 7px;
          color: rgba(255,238,212,0.5);
          font-size: 11px;
        }

        .summary-card strong {
          color: #ffd18d;
          font-size: 28px;
        }

        .good-card strong {
          color: #9ee6a8;
        }

        .defect-card strong {
          color: #ffb18a;
        }

        .quality-rate-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 14px;
        }

        .quality-rate-card {
          padding: 15px;
          border-radius: 16px;
          background: rgba(0,0,0,0.14);
          border: 1px solid rgba(255,220,170,0.09);
        }

        .rate-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .rate-header span {
          color: rgba(255,238,212,0.55);
          font-size: 11px;
          font-weight: 700;
        }

        .rate-header strong {
          color: #fff0da;
          font-size: 14px;
        }

        .rate-track {
          width: 100%;
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
        }

        .good-rate-fill,
        .defect-rate-fill {
          height: 100%;
          border-radius: inherit;
        }

        .good-rate-fill {
          background: linear-gradient(
            90deg,
            #5e9d63,
            #aee2a5
          );
        }

        .defect-rate-fill {
          background: linear-gradient(
            90deg,
            #a65335,
            #e3a06a
          );
        }

        .defect-count-section {
          margin-top: 23px;
        }

        .defect-count-grid {
          display: grid;
          gap: 10px;
        }

        .defect-count-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;

          padding: 14px;

          border-radius: 16px;

          background: rgba(0,0,0,0.16);

          border:
            1px solid rgba(255,220,170,0.09);
        }

        .defect-count-card > div {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .defect-dot {
          width: 9px;
          height: 9px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #d89049;

          box-shadow:
            0 0 10px rgba(216,144,73,0.5);
        }

        .category-good .defect-dot {
          background: #79c982;
          box-shadow:
            0 0 10px rgba(121,201,130,0.5);
        }

        .category-broken .defect-dot {
          background: #f0a250;
        }

        .category-black .defect-dot {
          background: #e36156;
        }

        .category-black_and_broken .defect-dot {
          background: #d068c7;
        }

        .category-unknown .defect-dot {
          background: #d8c25d;
        }

        .defect-count-card strong {
          display: block;

          color: #fff0da;

          font-size: 14px;
        }

        .defect-count-card span {
          display: block;

          margin-top: 3px;

          color: rgba(255,237,211,0.43);

          font-size: 11px;
        }

        .defect-count-card b {
          color: #ffd18d;
          font-size: 20px;
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 560px) {
          .summary-grid,
          .quality-rate-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default DetectionSummary;
