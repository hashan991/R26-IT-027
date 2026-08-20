function PhysicalAssessmentCard({ physicalAssessment = {} }) {
  // =========================================================
  // STATUS
  // =========================================================

  const status = physicalAssessment.status || "NO DATA";

  const statusClass = String(status).toLowerCase().replace(/\s+/g, "-");

  // =========================================================
  // BASIC VALUES
  // =========================================================

  const physicalScore = Math.max(
    0,
    Math.min(100, Number(physicalAssessment.physical_score ?? 0)),
  );

  const totalBeans = Number(physicalAssessment.total_beans ?? 0);

  const counts = physicalAssessment.counts || {};

  const goodCount = Number(counts.good ?? 0);

  const brokenCount = Number(counts.broken ?? 0);

  const blackCount = Number(counts.black ?? 0);

  const blackAndBrokenCount = Number(counts.black_and_broken ?? 0);

  const unknownCount = Number(counts.unknown ?? 0);

  // =========================================================
  // PERCENTAGE
  // Descriptive distribution only
  // =========================================================

  const getPercentage = (count) => {
    if (totalBeans <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, (Number(count) / totalBeans) * 100));
  };

  // =========================================================
  // DEFECT / CATEGORY DATA
  // =========================================================

  const categories = [
    {
      key: "good",
      label: "Good Beans",
      shortLabel: "GOOD",
      count: goodCount,
      className: "good",
      description: "Beans classified as physically acceptable.",
    },

    {
      key: "broken",
      label: "Broken Beans",
      shortLabel: "BROKEN",
      count: brokenCount,
      className: "broken",
      description:
        "Beans detected with broken or chipped shape characteristics.",
    },

    {
      key: "black",
      label: "Black Beans",
      shortLabel: "BLACK",
      count: blackCount,
      className: "black",
      description: "Beans detected within the black defect category.",
    },

    {
      key: "black-and-broken",
      label: "Black + Broken",
      shortLabel: "BLACK + BROKEN",
      count: blackAndBrokenCount,
      className: "black-broken",
      description: "Beans showing both black and broken characteristics.",
    },

    {
      key: "unknown",
      label: "Unknown",
      shortLabel: "UNKNOWN",
      count: unknownCount,
      className: "unknown",
      description: "Detections that could not be assigned to a final category.",
    },
  ];

  // =========================================================
  // STATUS MESSAGE
  // =========================================================

  const getStatusMessage = () => {
    switch (statusClass) {
      case "excellent":
        return "The physical AI inspection indicates excellent overall physical quality.";

      case "good":
        return "The physical AI inspection indicates good overall physical quality.";

      case "review":
      case "needs-review":
        return "The physical inspection contains conditions that should be reviewed.";

      case "poor":
        return "The physical AI inspection indicates poor overall physical quality.";

      case "no-data":
        return "No valid physical assessment data is currently available.";

      default:
        return "Physical AI assessment result generated from the detected coffee bean categories.";
    }
  };

  return (
    <div className="physical-assessment-card">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="physical-header">
        <div>
          <span className="physical-header-label">PHYSICAL AI ASSESSMENT</span>

          <h3>Physical Quality Analysis</h3>

          <p>
            Computer vision based assessment generated from detected coffee bean
            physical conditions.
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN STATUS
      ===================================================== */}

      <div
        className={`
          physical-status-panel
          physical-status-${statusClass}
        `}
      >
        <div className="physical-status-left">
          <span className="physical-status-caption">
            PHYSICAL QUALITY STATUS
          </span>

          <div className="physical-status-main">
            <span className="physical-status-icon">
              <span />
            </span>

            <div>
              <strong>{status}</strong>

              <p>{getStatusMessage()}</p>
            </div>
          </div>
        </div>

        {/* SCORE SECONDARY */}

        <div className="physical-score-box">
          <span>PHYSICAL SCORE</span>

          <div>
            <strong>{physicalScore.toFixed(2)}</strong>

            <small>/100</small>
          </div>

          <div className="physical-score-track">
            <div
              className="physical-score-fill"
              style={{
                width: `${physicalScore}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          SAMPLE OVERVIEW
      ===================================================== */}

      <div className="physical-overview">
        <div className="physical-overview-main">
          <span>TOTAL DETECTED BEANS</span>

          <strong>{totalBeans}</strong>

          <small>beans analyzed</small>
        </div>

        <div className="physical-overview-details">
          <div>
            <span>Good</span>

            <strong>{goodCount}</strong>
          </div>

          <div>
            <span>Defect Categories</span>

            <strong>{brokenCount + blackCount + blackAndBrokenCount}</strong>
          </div>

          <div>
            <span>Unknown</span>

            <strong>{unknownCount}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          CATEGORY HEADING
      ===================================================== */}

      <div className="physical-category-heading">
        <div>
          <span>DETECTION SUMMARY</span>

          <h4>Bean Category Distribution</h4>
        </div>

        <p>Counts and percentages describe the detected sample distribution.</p>
      </div>

      {/* =====================================================
          CATEGORY CARDS
      ===================================================== */}

      <div className="physical-category-grid">
        {categories.map((category) => {
          const percentage = getPercentage(category.count);

          return (
            <div
              key={category.key}
              className={`
                  physical-category-card
                  category-${category.className}
                `}
            >
              {/* CARD TOP */}

              <div className="category-card-top">
                <div
                  className={`
                      category-icon
                      category-icon-${category.className}
                    `}
                >
                  {category.className === "good"
                    ? "G"
                    : category.className === "broken"
                      ? "B"
                      : category.className === "black"
                        ? "BL"
                        : category.className === "black-broken"
                          ? "B+"
                          : "?"}
                </div>

                <div className="category-title">
                  <span>{category.shortLabel}</span>

                  <h4>{category.label}</h4>
                </div>

                <div className="category-count">
                  <strong>{category.count}</strong>

                  <span>beans</span>
                </div>
              </div>

              {/* PERCENTAGE */}

              <div className="category-percentage-row">
                <span>Sample Distribution</span>

                <strong>{percentage.toFixed(1)}%</strong>
              </div>

              {/* BAR */}

              <div className="category-track">
                <div
                  className={`
                      category-fill
                      category-fill-${category.className}
                    `}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              {/* DESCRIPTION */}

              <p className="category-description">{category.description}</p>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          DISTRIBUTION SUMMARY
      ===================================================== */}

      <div className="distribution-summary">
        <div className="distribution-summary-heading">
          <div>
            <span>SAMPLE DISTRIBUTION</span>

            <h4>Physical Detection Overview</h4>
          </div>

          <strong>{totalBeans} Beans</strong>
        </div>

        <div className="distribution-bar">
          {totalBeans > 0 && (
            <>
              <div
                className="distribution-part distribution-good"
                style={{
                  width: `${getPercentage(goodCount)}%`,
                }}
                title={`Good: ${goodCount}`}
              />

              <div
                className="distribution-part distribution-broken"
                style={{
                  width: `${getPercentage(brokenCount)}%`,
                }}
                title={`Broken: ${brokenCount}`}
              />

              <div
                className="distribution-part distribution-black"
                style={{
                  width: `${getPercentage(blackCount)}%`,
                }}
                title={`Black: ${blackCount}`}
              />

              <div
                className="distribution-part distribution-black-broken"
                style={{
                  width: `${getPercentage(blackAndBrokenCount)}%`,
                }}
                title={`Black + Broken: ${blackAndBrokenCount}`}
              />

              <div
                className="distribution-part distribution-unknown"
                style={{
                  width: `${getPercentage(unknownCount)}%`,
                }}
                title={`Unknown: ${unknownCount}`}
              />
            </>
          )}
        </div>

        <div className="distribution-legend">
          <div>
            <span className="legend-dot legend-good" />
            Good
          </div>

          <div>
            <span className="legend-dot legend-broken" />
            Broken
          </div>

          <div>
            <span className="legend-dot legend-black" />
            Black
          </div>

          <div>
            <span className="legend-dot legend-black-broken" />
            Black + Broken
          </div>

          <div>
            <span className="legend-dot legend-unknown" />
            Unknown
          </div>
        </div>
      </div>

      {/* =====================================================
          NOTE
      ===================================================== */}

      <div className="physical-note">
        <span className="physical-note-icon">i</span>

        <p>
          The physical status and score are generated using the research-defined
          physical quality assessment method. Category percentages are
          descriptive values calculated from the detected bean counts.
        </p>
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        .physical-assessment-card {
          width: 100%;

          padding: 24px;

          border-radius: 22px;

          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(
                214,
                142,
                70,
                0.08
              ),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.045
              ),
              rgba(
                255,
                255,
                255,
                0.015
              )
            ),
            rgba(
              0,
              0,
              0,
              0.12
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.09
            );
        }


        /* =================================================
           HEADER
        ================================================= */

        .physical-header-label {
          display: block;

          color: #dda05e;

          font-size: 8px;

          font-weight: 950;

          letter-spacing:
            1.6px;
        }


        .physical-header h3 {
          margin:
            5px 0 0;

          color: #fff0d8;

          font-size: 19px;
        }


        .physical-header p {
          max-width: 570px;

          margin:
            6px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.38
            );

          font-size: 10px;

          line-height: 1.55;
        }


        /* =================================================
           MAIN STATUS
        ================================================= */

        .physical-status-panel {
          margin-top: 18px;

          min-height: 155px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 28px;

          padding: 22px;

          border-radius: 18px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.07
            );
        }


        .physical-status-caption {
          display: block;

          color:
            rgba(
              255,
              234,
              204,
              0.38
            );

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1.4px;
        }


        .physical-status-main {
          margin-top: 9px;

          display: flex;

          align-items: center;

          gap: 12px;
        }


        .physical-status-icon {
          width: 34px;
          height: 34px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 50%;

          background:
            currentColor;
        }


        .physical-status-icon span {
          width: 11px;
          height: 11px;

          border-radius: 50%;

          background: #20140d;
        }


        .physical-status-main strong {
          display: block;

          font-size: 34px;

          font-weight: 950;

          line-height: 1;

          text-transform:
            uppercase;
        }


        .physical-status-main p {
          max-width: 480px;

          margin:
            8px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.35
            );

          font-size: 9px;

          line-height: 1.5;
        }


        /* EXCELLENT */

        .physical-status-excellent {
          color: #a5e8ad;

          background:
            linear-gradient(
              135deg,
              rgba(
                56,
                160,
                72,
                0.11
              ),
              rgba(
                0,
                0,
                0,
                0.08
              )
            );

          border-color:
            rgba(
              93,
              196,
              106,
              0.18
            );
        }


        /* GOOD */

        .physical-status-good {
          color: #a8e5af;

          background:
            linear-gradient(
              135deg,
              rgba(
                62,
                153,
                76,
                0.09
              ),
              rgba(
                0,
                0,
                0,
                0.08
              )
            );

          border-color:
            rgba(
              93,
              194,
              105,
              0.15
            );
        }


        /* REVIEW */

        .physical-status-review,
        .physical-status-needs-review {
          color: #ffd18d;

          background:
            linear-gradient(
              135deg,
              rgba(
                201,
                137,
                54,
                0.10
              ),
              rgba(
                0,
                0,
                0,
                0.08
              )
            );

          border-color:
            rgba(
              226,
              163,
              77,
              0.17
            );
        }


        /* POOR */

        .physical-status-poor {
          color: #ffad97;

          background:
            linear-gradient(
              135deg,
              rgba(
                181,
                62,
                46,
                0.11
              ),
              rgba(
                0,
                0,
                0,
                0.08
              )
            );

          border-color:
            rgba(
              221,
              89,
              66,
              0.18
            );
        }


        /* NO DATA */

        .physical-status-no-data {
          color:
            rgba(
              255,
              234,
              205,
              0.6
            );

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );
        }


        /* =================================================
           SCORE SECONDARY
        ================================================= */

        .physical-score-box {
          min-width: 180px;

          padding: 16px 18px;

          flex-shrink: 0;

          border-radius: 15px;

          background:
            rgba(
              0,
              0,
              0,
              0.12
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );
        }


        .physical-score-box > span {
          display: block;

          color:
            rgba(
              255,
              235,
              207,
              0.3
            );

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .physical-score-box > div:nth-child(2) {
          margin-top: 5px;

          display: flex;

          align-items: baseline;

          justify-content:
            flex-end;

          gap: 3px;
        }


        .physical-score-box strong {
          color: #f1dbbc;

          font-size: 25px;
        }


        .physical-score-box small {
          color:
            rgba(
              255,
              235,
              207,
              0.3
            );

          font-size: 8px;
        }


        .physical-score-track {
          height: 6px;

          margin-top: 10px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(
              255,
              255,
              255,
              0.06
            );
        }


        .physical-score-fill {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #9e5a32,
              #ffd18c
            );

          transition:
            width 0.7s ease;
        }


        /* =================================================
           SAMPLE OVERVIEW
        ================================================= */

        .physical-overview {
          margin-top: 14px;

          display: grid;

          grid-template-columns:
            minmax(180px, 0.75fr)
            minmax(0, 2fr);

          gap: 11px;
        }


        .physical-overview-main {
          padding: 17px;

          border-radius: 15px;

          background:
            rgba(
              215,
              143,
              72,
              0.065
            );

          border:
            1px solid
            rgba(
              224,
              158,
              91,
              0.09
            );
        }


        .physical-overview-main span {
          display: block;

          color: #dca05e;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .physical-overview-main strong {
          display: block;

          margin-top: 5px;

          color: #ffe0aa;

          font-size: 34px;

          line-height: 1;
        }


        .physical-overview-main small {
          display: block;

          margin-top: 5px;

          color:
            rgba(
              255,
              235,
              207,
              0.29
            );

          font-size: 7px;
        }


        .physical-overview-details {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 8px;
        }


        .physical-overview-details > div {
          padding: 15px;

          display: flex;

          flex-direction: column;

          justify-content: center;

          border-radius: 14px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.055
            );
        }


        .physical-overview-details span {
          color:
            rgba(
              255,
              235,
              207,
              0.29
            );

          font-size: 7px;
        }


        .physical-overview-details strong {
          margin-top: 5px;

          color: #efd9ba;

          font-size: 20px;
        }


        /* =================================================
           CATEGORY HEADING
        ================================================= */

        .physical-category-heading {
          margin-top: 21px;

          display: flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap: 20px;
        }


        .physical-category-heading
        > div
        > span {
          color: #dca05e;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1.3px;
        }


        .physical-category-heading h4 {
          margin:
            4px 0 0;

          color: #f1ddc0;

          font-size: 14px;
        }


        .physical-category-heading p {
          max-width: 290px;

          margin: 0;

          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 8px;

          line-height: 1.45;

          text-align: right;
        }


        /* =================================================
           CATEGORY GRID
        ================================================= */

        .physical-category-grid {
          margin-top: 12px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 11px;
        }


        .physical-category-card {
          min-height: 180px;

          padding: 15px;

          border-radius: 15px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.065
            );

          transition:
            transform 0.2s ease,
            border-color 0.2s ease;
        }


        .physical-category-card:hover {
          transform:
            translateY(-2px);
        }


        /* GOOD */

        .category-good {
          background:
            linear-gradient(
              145deg,
              rgba(
                58,
                153,
                73,
                0.10
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            );

          border-color:
            rgba(
              92,
              198,
              106,
              0.18
            );
        }


        /* BROKEN */

        .category-broken {
          background:
            linear-gradient(
              145deg,
              rgba(
                188,
                126,
                44,
                0.10
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            );

          border-color:
            rgba(
              221,
              158,
              71,
              0.17
            );
        }


        /* BLACK */

        .category-black {
          background:
            linear-gradient(
              145deg,
              rgba(
                163,
                69,
                51,
                0.11
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            );

          border-color:
            rgba(
              207,
              92,
              70,
              0.17
            );
        }


        /* BLACK + BROKEN */

        .category-black-broken {
          background:
            linear-gradient(
              145deg,
              rgba(
                171,
                51,
                43,
                0.14
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            );

          border-color:
            rgba(
              217,
              75,
              61,
              0.20
            );
        }


        /* UNKNOWN */

        .category-unknown {
          background:
            linear-gradient(
              145deg,
              rgba(
                135,
                122,
                104,
                0.08
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            );
        }


        /* =================================================
           CATEGORY TOP
        ================================================= */

        .category-card-top {
          display: flex;

          align-items: center;

          gap: 8px;
        }


        .category-icon {
          width: 37px;
          height: 37px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 10px;

          font-size: 8px;

          font-weight: 950;
        }


        .category-icon-good {
          color: #18351e;

          background: #99d5a1;
        }


        .category-icon-broken {
          color: #38230d;

          background: #e2ad65;
        }


        .category-icon-black {
          color: #2d1510;

          background: #dd8e79;
        }


        .category-icon-black-broken {
          color: #321310;

          background: #e77f6c;
        }


        .category-icon-unknown {
          color: #251c16;

          background: #c9ad8f;
        }


        .category-title {
          flex: 1;

          min-width: 0;
        }


        .category-title span {
          display: block;

          color:
            rgba(
              255,
              232,
              199,
              0.27
            );

          font-size: 6px;

          font-weight: 900;

          letter-spacing: 0.7px;
        }


        .category-title h4 {
          margin:
            3px 0 0;

          color: #f0d9ba;

          font-size: 11px;
        }


        .category-count {
          text-align: right;

          flex-shrink: 0;
        }


        .category-count strong {
          display: block;

          color: #ffe0aa;

          font-size: 21px;

          line-height: 1;
        }


        .category-count span {
          display: block;

          margin-top: 3px;

          color:
            rgba(
              255,
              235,
              207,
              0.25
            );

          font-size: 6px;
        }


        /* =================================================
           CATEGORY PERCENTAGE
        ================================================= */

        .category-percentage-row {
          margin-top: 14px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 8px;
        }


        .category-percentage-row span {
          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 7px;
        }


        .category-percentage-row strong {
          color: #efd5b2;

          font-size: 9px;
        }


        .category-track {
          height: 6px;

          margin-top: 7px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(
              255,
              255,
              255,
              0.055
            );
        }


        .category-fill {
          height: 100%;

          border-radius: inherit;
        }


        .category-fill-good {
          background: #74c982;
        }


        .category-fill-broken {
          background: #d69b4e;
        }


        .category-fill-black {
          background: #ce735d;
        }


        .category-fill-black-broken {
          background: #db5f4e;
        }


        .category-fill-unknown {
          background: #a68e75;
        }


        .category-description {
          margin:
            10px 0 0;

          color:
            rgba(
              255,
              235,
              207,
              0.25
            );

          font-size: 7px;

          line-height: 1.45;
        }


        /* =================================================
           DISTRIBUTION SUMMARY
        ================================================= */

        .distribution-summary {
          margin-top: 14px;

          padding: 15px;

          border-radius: 15px;

          background:
            rgba(
              0,
              0,
              0,
              0.09
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.055
            );
        }


        .distribution-summary-heading {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;
        }


        .distribution-summary-heading
        > div
        > span {
          color: #dca05e;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1.1px;
        }


        .distribution-summary-heading h4 {
          margin:
            3px 0 0;

          color: #eed9bb;

          font-size: 12px;
        }


        .distribution-summary-heading
        > strong {
          color: #ffd18d;

          font-size: 11px;
        }


        .distribution-bar {
          width: 100%;

          height: 11px;

          margin-top: 13px;

          display: flex;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(
              255,
              255,
              255,
              0.05
            );
        }


        .distribution-part {
          height: 100%;

          min-width: 0;
        }


        .distribution-good {
          background: #72c880;
        }


        .distribution-broken {
          background: #d49a4d;
        }


        .distribution-black {
          background: #c96e59;
        }


        .distribution-black-broken {
          background: #dc5e4c;
        }


        .distribution-unknown {
          background: #9c856e;
        }


        .distribution-legend {
          margin-top: 10px;

          display: flex;

          flex-wrap: wrap;

          gap: 12px;
        }


        .distribution-legend > div {
          display: flex;

          align-items: center;

          gap: 5px;

          color:
            rgba(
              255,
              235,
              207,
              0.35
            );

          font-size: 7px;
        }


        .legend-dot {
          width: 7px;
          height: 7px;

          flex-shrink: 0;

          border-radius: 50%;
        }


        .legend-good {
          background: #72c880;
        }


        .legend-broken {
          background: #d49a4d;
        }


        .legend-black {
          background: #c96e59;
        }


        .legend-black-broken {
          background: #dc5e4c;
        }


        .legend-unknown {
          background: #9c856e;
        }


        /* =================================================
           NOTE
        ================================================= */

        .physical-note {
          margin-top: 12px;

          display: flex;

          align-items:
            flex-start;

          gap: 8px;

          padding:
            11px 12px;

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.05
            );
        }


        .physical-note-icon {
          width: 18px;
          height: 18px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: #dda05e;

          border:
            1px solid
            rgba(
              221,
              160,
              94,
              0.2
            );

          font-size: 7px;

          font-weight: 900;
        }


        .physical-note p {
          margin:
            1px 0 0;

          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 8px;

          line-height: 1.5;
        }


        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (
          max-width: 1000px
        ) {

          .physical-category-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

        }


        @media (
          max-width: 760px
        ) {

          .physical-overview {
            grid-template-columns:
              1fr;
          }


          .physical-overview-details {
            grid-template-columns:
              repeat(
                3,
                1fr
              );
          }

        }


        @media (
          max-width: 620px
        ) {

          .physical-assessment-card {
            padding: 18px;
          }


          .physical-status-panel {
            flex-direction:
              column;

            align-items:
              stretch;
          }


          .physical-score-box {
            width: 100%;
          }


          .physical-score-box
          > div:nth-child(2) {
            justify-content:
              flex-start;
          }


          .physical-category-heading {
            flex-direction:
              column;

            align-items:
              flex-start;
          }


          .physical-category-heading p {
            text-align: left;
          }


          .physical-category-grid {
            grid-template-columns:
              1fr;
          }


          .physical-overview-details {
            grid-template-columns:
              1fr;
          }


          .distribution-summary-heading {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .physical-status-main strong {
            font-size: 28px;
          }

        }

      `}</style>
    </div>
  );
}

export default PhysicalAssessmentCard;
