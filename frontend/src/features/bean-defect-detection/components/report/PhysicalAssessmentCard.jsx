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
        /*
          PhysicalAssessmentCard UI refresh
          - Keeps all existing assessment/count/score logic unchanged
          - Uses scoped selectors so this component does not clash with
            SensorAssessmentCard or other report components
        */

        .physical-assessment-card,
        .physical-assessment-card * {
          box-sizing: border-box;
        }

        .physical-assessment-card {
          width: 100%;
          padding: 26px;
          border: 1px solid #e4d5c4;
          border-radius: 20px;
          background: #fffdfa;
          color: #2f1b13;
          box-shadow: 0 10px 30px rgba(64, 35, 22, 0.06);
        }

        /* =================================================
           HEADER
        ================================================= */

        .physical-assessment-card .physical-header-label {
          display: block;
          color: #9a5b2e;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.35px;
          text-transform: uppercase;
        }

        .physical-assessment-card .physical-header h3 {
          margin: 6px 0 0;
          color: #2c180f;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          font-weight: 700;
          line-height: 1.18;
        }

        .physical-assessment-card .physical-header p {
          max-width: 760px;
          margin: 9px 0 0;
          color: #78685e;
          font-size: 13px;
          line-height: 1.65;
        }

        /* =================================================
           MAIN STATUS
        ================================================= */

        .physical-assessment-card .physical-status-panel {
          margin-top: 20px;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 22px;
          border: 1px solid #e4d5c4;
          border-radius: 17px;
          background: #faf5ef;
        }

        .physical-assessment-card .physical-status-left {
          min-width: 0;
          flex: 1;
        }

        .physical-assessment-card .physical-status-caption {
          display: block;
          color: #8c7668;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.15px;
          text-transform: uppercase;
        }

        .physical-assessment-card .physical-status-main {
          margin-top: 9px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .physical-assessment-card .physical-status-icon {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: currentColor;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
        }

        .physical-assessment-card .physical-status-icon span {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #fffdfa;
        }

        .physical-assessment-card .physical-status-main strong {
          display: block;
          color: currentColor;
          font-size: 29px;
          font-weight: 900;
          line-height: 1;
          text-transform: uppercase;
        }

        .physical-assessment-card .physical-status-main p {
          max-width: 620px;
          margin: 8px 0 0;
          color: #6f6158;
          font-size: 13px;
          line-height: 1.55;
        }

        .physical-assessment-card .physical-status-excellent,
        .physical-assessment-card .physical-status-good {
          color: #2f6b45;
          background: #edf6ef;
          border-color: #c4dfca;
        }

        .physical-assessment-card .physical-status-review,
        .physical-assessment-card .physical-status-needs-review {
          color: #8b5a18;
          background: #fff7e9;
          border-color: #ead3a7;
        }

        .physical-assessment-card .physical-status-poor {
          color: #a84737;
          background: #fdf0ed;
          border-color: #e7c1b9;
        }

        .physical-assessment-card .physical-status-no-data {
          color: #74675e;
          background: #f6f2ed;
          border-color: #ddd3c8;
        }

        /* =================================================
           PHYSICAL SCORE
        ================================================= */

        .physical-assessment-card .physical-score-box {
          width: 195px;
          min-width: 195px;
          padding: 16px 18px;
          flex-shrink: 0;
          border: 1px solid #ddcfc1;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.78);
        }

        .physical-assessment-card .physical-score-box > span {
          display: block;
          color: #89776a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.95px;
          text-transform: uppercase;
        }

        .physical-assessment-card .physical-score-box > div:nth-child(2) {
          margin-top: 5px;
          display: flex;
          align-items: baseline;
          justify-content: flex-end;
          gap: 4px;
        }

        .physical-assessment-card .physical-score-box strong {
          color: #2f1b13;
          font-size: 31px;
          font-weight: 900;
          line-height: 1;
        }

        .physical-assessment-card .physical-score-box small {
          color: #8b786b;
          font-size: 11px;
          font-weight: 700;
        }

        .physical-assessment-card .physical-score-track {
          height: 7px;
          margin-top: 11px;
          overflow: hidden;
          border-radius: 999px;
          background: #e9dfd5;
        }

        .physical-assessment-card .physical-score-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #7e4729, #c88745);
          transition: width 0.7s ease;
        }

        /* =================================================
           SAMPLE OVERVIEW
        ================================================= */

        .physical-assessment-card .physical-overview {
          margin-top: 16px;
          display: grid;
          grid-template-columns: minmax(190px, 0.75fr) minmax(0, 2fr);
          gap: 12px;
        }

        .physical-assessment-card .physical-overview-main {
          min-height: 122px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #ead9c7;
          border-radius: 15px;
          background: #fbf3e9;
        }

        .physical-assessment-card .physical-overview-main span {
          display: block;
          color: #9b6033;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.95px;
          text-transform: uppercase;
        }

        .physical-assessment-card .physical-overview-main strong {
          display: block;
          margin-top: 6px;
          color: #382117;
          font-size: 37px;
          font-weight: 900;
          line-height: 1;
        }

        .physical-assessment-card .physical-overview-main small {
          display: block;
          margin-top: 7px;
          color: #79695f;
          font-size: 11px;
        }

        .physical-assessment-card .physical-overview-details {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }

        .physical-assessment-card .physical-overview-details > div {
          min-height: 122px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #e8ddd2;
          border-radius: 14px;
          background: #fffaf5;
        }

        .physical-assessment-card .physical-overview-details span {
          color: #7d6c61;
          font-size: 11px;
          line-height: 1.35;
        }

        .physical-assessment-card .physical-overview-details strong {
          margin-top: 7px;
          color: #342016;
          font-size: 24px;
          font-weight: 850;
          line-height: 1;
        }

        /* =================================================
           CATEGORY HEADING
        ================================================= */

        .physical-assessment-card .physical-category-heading {
          margin-top: 26px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          padding-top: 2px;
        }

        .physical-assessment-card .physical-category-heading > div > span {
          color: #9b6033;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.05px;
          text-transform: uppercase;
        }

        .physical-assessment-card .physical-category-heading h4 {
          margin: 4px 0 0;
          color: #2f1b13;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          line-height: 1.25;
        }

        .physical-assessment-card .physical-category-heading p {
          max-width: 390px;
          margin: 0;
          color: #7b6c62;
          font-size: 12px;
          line-height: 1.5;
          text-align: right;
        }

        /* =================================================
           CATEGORY GRID
        ================================================= */

        .physical-assessment-card .physical-category-grid {
          margin-top: 13px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .physical-assessment-card .physical-category-card {
          min-height: 185px;
          padding: 16px;
          border: 1px solid #e4d8cd;
          border-radius: 15px;
          background: #fffaf6;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .physical-assessment-card .physical-category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 9px 22px rgba(68, 38, 25, 0.07);
        }

        .physical-assessment-card .category-good {
          background: #f1f8f1;
          border-color: #c9e2cd;
        }

        .physical-assessment-card .category-broken {
          background: #fff8ec;
          border-color: #ead8b5;
        }

        .physical-assessment-card .category-black {
          background: #fff3ef;
          border-color: #ebcac1;
        }

        .physical-assessment-card .category-black-broken {
          background: #fcefeb;
          border-color: #e7bdb4;
        }

        .physical-assessment-card .category-unknown {
          background: #f7f3ef;
          border-color: #ded4ca;
        }

        /* =================================================
           CATEGORY CARD TOP
        ================================================= */

        .physical-assessment-card .category-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .physical-assessment-card .category-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 11px;
          font-size: 10px;
          font-weight: 900;
        }

        .physical-assessment-card .category-icon-good {
          color: #214d2e;
          background: #c9e8cf;
        }

        .physical-assessment-card .category-icon-broken {
          color: #704814;
          background: #f0d49f;
        }

        .physical-assessment-card .category-icon-black {
          color: #7b392e;
          background: #efc0b5;
        }

        .physical-assessment-card .category-icon-black-broken {
          color: #7f3027;
          background: #edafa2;
        }

        .physical-assessment-card .category-icon-unknown {
          color: #594b42;
          background: #ded0c3;
        }

        .physical-assessment-card .category-title {
          min-width: 0;
          flex: 1;
        }

        .physical-assessment-card .category-title span {
          display: block;
          color: #8d7c70;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.75px;
          text-transform: uppercase;
        }

        .physical-assessment-card .category-title h4 {
          margin: 3px 0 0;
          color: #342016;
          font-size: 14px;
          line-height: 1.25;
        }

        .physical-assessment-card .category-count {
          flex-shrink: 0;
          text-align: right;
        }

        .physical-assessment-card .category-count strong {
          display: block;
          color: #332017;
          font-size: 24px;
          font-weight: 900;
          line-height: 1;
        }

        .physical-assessment-card .category-count span {
          display: block;
          margin-top: 4px;
          color: #8a796e;
          font-size: 9px;
        }

        /* =================================================
           CATEGORY PERCENTAGE
        ================================================= */

        .physical-assessment-card .category-percentage-row {
          margin-top: 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .physical-assessment-card .category-percentage-row span {
          color: #796a60;
          font-size: 11px;
        }

        .physical-assessment-card .category-percentage-row strong {
          color: #493126;
          font-size: 12px;
          font-weight: 850;
        }

        .physical-assessment-card .category-track {
          height: 7px;
          margin-top: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(86, 60, 45, 0.10);
        }

        .physical-assessment-card .category-fill {
          height: 100%;
          border-radius: inherit;
        }

        .physical-assessment-card .category-fill-good {
          background: #62b873;
        }

        .physical-assessment-card .category-fill-broken {
          background: #d59a47;
        }

        .physical-assessment-card .category-fill-black {
          background: #c96c58;
        }

        .physical-assessment-card .category-fill-black-broken {
          background: #d85749;
        }

        .physical-assessment-card .category-fill-unknown {
          background: #9b8571;
        }

        .physical-assessment-card .category-description {
          margin: 12px 0 0;
          color: #78695f;
          font-size: 11px;
          line-height: 1.55;
        }

        /* =================================================
           DISTRIBUTION SUMMARY
        ================================================= */

        .physical-assessment-card .distribution-summary {
          margin-top: 16px;
          padding: 17px;
          border: 1px solid #e7dacd;
          border-radius: 15px;
          background: #faf5ef;
        }

        .physical-assessment-card .distribution-summary-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .physical-assessment-card
          .distribution-summary-heading
          > div
          > span {
          color: #9b6033;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.95px;
          text-transform: uppercase;
        }

        .physical-assessment-card .distribution-summary-heading h4 {
          margin: 4px 0 0;
          color: #342016;
          font-size: 15px;
        }

        .physical-assessment-card .distribution-summary-heading > strong {
          color: #6e4024;
          font-size: 13px;
          font-weight: 850;
        }

        .physical-assessment-card .distribution-bar {
          width: 100%;
          height: 12px;
          margin-top: 14px;
          display: flex;
          overflow: hidden;
          border-radius: 999px;
          background: #e9dfd5;
        }

        .physical-assessment-card .distribution-part {
          height: 100%;
          min-width: 0;
        }

        .physical-assessment-card .distribution-good {
          background: #62b873;
        }

        .physical-assessment-card .distribution-broken {
          background: #d59a47;
        }

        .physical-assessment-card .distribution-black {
          background: #c96c58;
        }

        .physical-assessment-card .distribution-black-broken {
          background: #d85749;
        }

        .physical-assessment-card .distribution-unknown {
          background: #9b8571;
        }

        .physical-assessment-card .distribution-legend {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px 18px;
        }

        .physical-assessment-card .distribution-legend > div {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #6f6259;
          font-size: 11px;
        }

        .physical-assessment-card .legend-dot {
          width: 9px;
          height: 9px;
          flex-shrink: 0;
          border-radius: 50%;
        }

        .physical-assessment-card .legend-good {
          background: #62b873;
        }

        .physical-assessment-card .legend-broken {
          background: #d59a47;
        }

        .physical-assessment-card .legend-black {
          background: #c96c58;
        }

        .physical-assessment-card .legend-black-broken {
          background: #d85749;
        }

        .physical-assessment-card .legend-unknown {
          background: #9b8571;
        }

        /* =================================================
           NOTE
        ================================================= */

        .physical-assessment-card .physical-note {
          margin-top: 14px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 13px 14px;
          border: 1px solid #eadfd5;
          border-radius: 12px;
          background: #fffaf5;
        }

        .physical-assessment-card .physical-note-icon {
          width: 21px;
          height: 21px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid #d8b58f;
          border-radius: 50%;
          color: #9c5d2e;
          font-size: 10px;
          font-weight: 900;
        }

        .physical-assessment-card .physical-note p {
          margin: 1px 0 0;
          color: #77685e;
          font-size: 11px;
          line-height: 1.55;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1050px) {
          .physical-assessment-card .physical-category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .physical-assessment-card .physical-status-panel {
            align-items: stretch;
            flex-direction: column;
          }

          .physical-assessment-card .physical-score-box {
            width: 100%;
            min-width: 0;
          }

          .physical-assessment-card .physical-score-box > div:nth-child(2) {
            justify-content: flex-start;
          }

          .physical-assessment-card .physical-overview {
            grid-template-columns: 1fr;
          }

          .physical-assessment-card .physical-category-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .physical-assessment-card .physical-category-heading p {
            max-width: none;
            text-align: left;
          }
        }

        @media (max-width: 680px) {
          .physical-assessment-card {
            padding: 18px;
            border-radius: 16px;
          }

          .physical-assessment-card .physical-header h3 {
            font-size: 23px;
          }

          .physical-assessment-card .physical-status-main strong {
            font-size: 25px;
          }

          .physical-assessment-card .physical-overview-details {
            grid-template-columns: 1fr;
          }

          .physical-assessment-card .physical-category-grid {
            grid-template-columns: 1fr;
          }

          .physical-assessment-card .distribution-summary-heading {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default PhysicalAssessmentCard;
