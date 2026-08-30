function UsableYield({ data }) {
  if (!data) {
    return null;
  }

  const normalizeClass = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replaceAll("_", "-")
      .replaceAll(" ", "-");

  const humanize = (value) =>
    String(value || "")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const safeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const formatPercent = (value) => `${safeNumber(value, 0).toFixed(2)}%`;

  const yieldStatus = data.yield_status || "NO_DATA";
  const yieldBasis = data.yield_basis || "NO_DATA";
  const recoveryPotential = data.recovery_potential || "NO_DATA";

  const classifiedTotal = safeNumber(
    data.classified_total_beans ?? data.classified_total,
    0,
  );
  const totalBeans = safeNumber(data.total_beans, 0);
  const coveragePercentage = safeNumber(
    data.classification_coverage_percentage ?? data.coverage_percentage,
    totalBeans > 0 ? (classifiedTotal / totalBeans) * 100 : 0,
  );

  const cleanUsableCount = safeNumber(
    data.clean_usable_count ?? data.clean_good_count,
    0,
  );

  const cleanUsablePercentage = safeNumber(
    data.clean_usable_percentage ?? data.clean_good_percentage,
    0,
  );

  const potentialRecoverableCount = safeNumber(
    data.potential_recoverable_count,
    0,
  );

  const potentialRecoverablePercentage = safeNumber(
    data.potential_recoverable_percentage,
    0,
  );

  const severeRejectCount = safeNumber(data.severe_reject_count, 0);

  const severeRejectPercentage = safeNumber(data.severe_reject_percentage, 0);

  const categoryRows = [
    {
      key: "good",
      label: "Good Beans",
      count: safeNumber(data.good_count ?? data.good, 0),
      percentage: safeNumber(data.good_percentage, 0),
      type: "good",
      description: "Clean usable whole-bean fraction.",
    },
    {
      key: "broken",
      label: "Broken Beans",
      count: safeNumber(data.broken_count ?? data.broken, 0),
      percentage: safeNumber(data.broken_percentage, 0),
      type: "broken",
      description:
        "Potentially recoverable physical fraction after suitable sorting.",
    },
    {
      key: "black",
      label: "Black Beans",
      count: safeNumber(data.black_count ?? data.black, 0),
      percentage: safeNumber(data.black_percentage, 0),
      type: "black",
      description: "Severe reject fraction.",
    },
    {
      key: "black_and_broken",
      label: "Black + Broken",
      count: safeNumber(
        data.black_and_broken_count ?? data.black_and_broken,
        0,
      ),
      percentage: safeNumber(data.black_and_broken_percentage, 0),
      type: "black-and-broken",
      description:
        "Combined severe-defect category retained separately for yield estimation.",
    },
    {
      key: "unknown",
      label: "Unknown / Unclassified",
      count: safeNumber(data.unknown_count ?? data.unknown, 0),
      percentage: safeNumber(data.unknown_percentage, 0),
      type: "unknown",
      description: "Beans outside the four classified yield categories.",
    },
  ];

  const maxCategoryCount = Math.max(
    ...categoryRows.map((item) => item.count),
    1,
  );

  const getBarWidth = (item) => {
    if (item.percentage > 0) {
      return Math.min(100, Math.max(0, item.percentage));
    }

    return Math.min(100, Math.max(0, (item.count / maxCategoryCount) * 100));
  };

  const flags = [
    {
      key: "sorting_required",
      label: "Sorting",
      short: "SORT",
      active: Boolean(data.sorting_required),
    },
    {
      key: "severe_defect_removal_required",
      label: "Severe Defect Removal",
      short: "REM",
      active: Boolean(data.severe_defect_removal_required),
    },
    {
      key: "manual_review_required",
      label: "Manual Review",
      short: "REV",
      active: Boolean(data.manual_review_required),
    },
  ];

  const activeFlags = flags.filter((item) => item.active);

  const sampleWeight = data.sample_weight;
  const hasSampleWeight =
    sampleWeight !== null &&
    sampleWeight !== undefined &&
    Number.isFinite(Number(sampleWeight));

  const estimatedUsableWeight = data.estimated_usable_weight;
  const estimatedRejectWeight = data.estimated_reject_weight;

  return (
    <section className="usable-yield-module">
      <style>{`
        .usable-yield-module {
          --coffee-950: #20150f;
          --coffee-900: #2d1d14;
          --coffee-800: #3d281b;
          --coffee-700: #5a3a25;
          --coffee-600: #7a5132;
          --coffee-500: #9a6a45;
          --cream-50: #fffdf9;
          --cream-100: #fbf6ee;
          --cream-200: #f2e7d8;
          --text-main: #2a211c;
          --text-soft: #74665c;
          --line: rgba(91, 61, 40, 0.14);
          --shadow: 0 18px 55px rgba(67, 43, 28, 0.10);
          width: 100%;
          color: var(--text-main);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .usable-yield-module * {
          box-sizing: border-box;
        }

        .yield-shell {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 24px;
          background:
            radial-gradient(
              circle at top right,
              rgba(154, 106, 69, 0.12),
              transparent 32%
            ),
            linear-gradient(145deg, #fffdf9 0%, #fbf6ee 100%);
          box-shadow: var(--shadow);
        }

        .yield-hero {
          position: relative;
          overflow: hidden;
          padding: 26px;
          color: #fff;
          background:
            radial-gradient(
              circle at 88% 10%,
              rgba(255,255,255,0.10),
              transparent 27%
            ),
            linear-gradient(
              135deg,
              #2c1d15 0%,
              #4e3020 58%,
              #684127 100%
            );
        }

        .yield-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            );
          background-size: 24px 24px;
          mask-image: linear-gradient(to bottom, black, transparent);
        }

        .yield-hero-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .yield-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;
          color: #dbc4ad;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .yield-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0b68e;
          box-shadow: 0 0 0 5px rgba(224, 182, 142, 0.12);
        }

        .yield-title {
          margin: 0;
          max-width: 760px;
          color: #fff8f1;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .yield-summary {
          position: relative;
          z-index: 1;
          max-width: 850px;
          margin: 13px 0 0;
          color: #eadfd5;
          font-size: 14px;
          line-height: 1.72;
        }

        .yield-status-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex: 0 0 auto;
        }

        .yield-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(9px);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.075em;
          text-transform: uppercase;
        }

        .yield-status.estimated {
          color: #d7f8df;
          background: rgba(46, 125, 70, 0.18);
          border-color: rgba(112, 212, 140, 0.26);
        }

        .yield-status.no-data {
          color: #ffd8d0;
          background: rgba(165, 57, 39, 0.20);
          border-color: rgba(240, 123, 101, 0.30);
        }

        .yield-basis-badge {
          display: inline-flex;
          min-height: 29px;
          align-items: center;
          padding: 0 10px;
          border-radius: 999px;
          color: #e8d8ca;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .yield-metrics {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 11px;
          margin-top: 22px;
        }

        .yield-metric {
          min-width: 0;
          padding: 14px 15px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.065);
          backdrop-filter: blur(7px);
        }

        .yield-metric span {
          display: block;
          color: #cbb8a8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .yield-metric strong {
          display: block;
          margin-top: 6px;
          overflow-wrap: anywhere;
          color: #fff;
          font-size: 18px;
          line-height: 1.18;
        }

        .yield-coverage-wrap {
          position: relative;
          z-index: 1;
          margin-top: 15px;
          padding: 14px 15px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.055);
        }

        .yield-coverage-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .yield-coverage-head span {
          color: #cbb8a8;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .yield-coverage-head strong {
          color: #fff;
          font-size: 15px;
        }

        .yield-coverage-track {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
        }

        .yield-coverage-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #c79562,
            #e0bd8a
          );
        }

        .yield-content {
          padding: 24px;
        }

        .yield-section + .yield-section {
          margin-top: 25px;
        }

        .yield-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 13px;
        }

        .yield-section-heading h4 {
          margin: 0;
          color: #32261f;
          font-size: 17px;
          letter-spacing: -0.015em;
        }

        .yield-section-heading p {
          margin: 4px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .yield-count-pill {
          flex: 0 0 auto;
          padding: 6px 9px;
          border-radius: 999px;
          background: #f2e7d8;
          color: #5d402d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .yield-outcome-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .yield-outcome-card {
          position: relative;
          overflow: hidden;
          min-height: 150px;
          padding: 18px;
          border-radius: 18px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.76);
        }

        .yield-outcome-card::before {
          content: "";
          position: absolute;
          width: 92px;
          height: 92px;
          right: -34px;
          top: -36px;
          border-radius: 50%;
          opacity: 0.45;
        }

        .yield-outcome-card.clean::before {
          background: #dcebdc;
        }

        .yield-outcome-card.recoverable::before {
          background: #f0e4c8;
        }

        .yield-outcome-card.reject::before {
          background: #f1d6d0;
        }

        .yield-outcome-card span {
          position: relative;
          z-index: 1;
          display: block;
          color: #8a7566;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .yield-outcome-value {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: baseline;
          gap: 7px;
          margin-top: 10px;
        }

        .yield-outcome-value strong {
          color: #3f3027;
          font-size: 32px;
          line-height: 1;
        }

        .yield-outcome-value small {
          color: #907c6c;
          font-size: 11px;
          font-weight: 800;
        }

        .yield-outcome-card p {
          position: relative;
          z-index: 1;
          margin: 12px 0 0;
          color: #6c5d53;
          font-size: 11px;
          line-height: 1.55;
        }

        .yield-category-list {
          display: grid;
          gap: 11px;
        }

        .yield-category {
          padding: 14px 15px;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.72);
        }

        .yield-category-top {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 12px;
          align-items: center;
        }

        .yield-category-name {
          min-width: 0;
        }

        .yield-category-name strong {
          display: block;
          color: #3f3128;
          font-size: 12px;
        }

        .yield-category-name small {
          display: block;
          margin-top: 3px;
          color: #817267;
          font-size: 10px;
          line-height: 1.45;
        }

        .yield-category-count,
        .yield-category-percent {
          min-width: 64px;
          text-align: right;
        }

        .yield-category-count span,
        .yield-category-percent span {
          display: block;
          color: #9a8879;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .yield-category-count strong,
        .yield-category-percent strong {
          display: block;
          margin-top: 2px;
          color: #5a4537;
          font-size: 14px;
        }

        .yield-category-track {
          height: 7px;
          overflow: hidden;
          margin-top: 11px;
          border-radius: 999px;
          background: #eee7df;
        }

        .yield-category-fill {
          height: 100%;
          min-width: 0;
          border-radius: inherit;
          background: #9b7352;
        }

        .yield-category-fill.good {
          background: #6f936d;
        }

        .yield-category-fill.broken {
          background: #c39a59;
        }

        .yield-category-fill.black,
        .yield-category-fill.black-and-broken {
          background: #ad5f4d;
        }

        .yield-category-fill.unknown {
          background: #90877f;
        }

        .yield-controls {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .yield-control {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 68px;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: rgba(255,255,255,0.64);
        }

        .yield-control.active {
          border-color: rgba(122, 81, 50, 0.25);
          box-shadow: inset 0 0 0 1px rgba(122, 81, 50, 0.04);
        }

        .yield-control.inactive {
          opacity: 0.47;
          background: rgba(255,255,255,0.34);
        }

        .yield-control-code {
          display: grid;
          place-items: center;
          flex: 0 0 42px;
          height: 42px;
          border-radius: 12px;
          background: #eee0d1;
          color: #573a27;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.04em;
        }

        .yield-control strong {
          display: block;
          color: #3d3028;
          font-size: 12px;
        }

        .yield-control small {
          display: block;
          margin-top: 3px;
          color: #7a6d63;
          font-size: 10px;
          font-weight: 700;
        }

        .yield-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
        }

        .yield-summary-card {
          padding: 15px;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.70);
        }

        .yield-summary-card span {
          display: block;
          color: #8a7566;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .yield-summary-card strong {
          display: block;
          margin-top: 6px;
          color: #46362d;
          font-size: 16px;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .yield-weight-card {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 14px;
          align-items: flex-start;
          padding: 17px;
          border-radius: 17px;
          border: 1px solid var(--line);
          background: #faf6ef;
        }

        .yield-weight-icon {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: #eadac8;
          color: #68452e;
          font-size: 17px;
          font-weight: 900;
        }

        .yield-weight-card h5 {
          margin: 0;
          color: #3f3027;
          font-size: 13px;
        }

        .yield-weight-card p {
          margin: 6px 0 0;
          color: #716158;
          font-size: 11px;
          line-height: 1.6;
        }

        .yield-weight-values {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .yield-weight-chip {
          padding: 7px 9px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid #eadfd3;
          color: #5f4a3b;
          font-size: 10px;
          font-weight: 850;
        }

        .yield-interpretation,
        .yield-methodology {
          padding: 15px 16px;
          border-radius: 14px;
        }

        .yield-interpretation {
          border: 1px solid #e7ddd2;
          background: #faf7f2;
        }

        .yield-methodology {
          border-left: 4px solid #8b6345;
          border-radius: 0 14px 14px 0;
          background: #f3eadf;
        }

        .yield-interpretation strong,
        .yield-methodology strong {
          display: block;
          margin-bottom: 5px;
          color: #5c3d29;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .yield-interpretation p,
        .yield-methodology p {
          margin: 0;
          color: #6f5e52;
          font-size: 11px;
          line-height: 1.67;
        }

        .yield-no-data {
          padding: 22px;
          border: 1px dashed rgba(91, 61, 40, 0.22);
          border-radius: 17px;
          background: rgba(255,255,255,0.52);
          text-align: center;
        }

        .yield-no-data strong {
          display: block;
          color: #77503d;
          font-size: 14px;
        }

        .yield-no-data p {
          margin: 5px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        @media (max-width: 980px) {
          .yield-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .yield-outcome-grid,
          .yield-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .yield-controls {
            grid-template-columns: 1fr;
          }

          .yield-category-top {
            grid-template-columns: 1fr auto;
          }

          .yield-category-percent {
            grid-column: 2;
          }

          .yield-category-count {
            grid-column: 2;
            grid-row: 1;
          }
        }

        @media (max-width: 650px) {
          .yield-hero,
          .yield-content {
            padding: 18px;
          }

          .yield-hero-top {
            flex-direction: column;
          }

          .yield-status-wrap {
            align-items: flex-start;
          }

          .yield-metrics,
          .yield-outcome-grid,
          .yield-summary-grid {
            grid-template-columns: 1fr;
          }

          .yield-category-top {
            grid-template-columns: 1fr;
          }

          .yield-category-count,
          .yield-category-percent {
            grid-column: auto;
            grid-row: auto;
            text-align: left;
          }

          .yield-weight-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="yield-shell">
        <header className="yield-hero">
          <div className="yield-hero-top">
            <div>
              <div className="yield-kicker">
                <span className="yield-kicker-dot" />
                Module 5 · Pre-Roast Processing Intelligence
              </div>

              <h3 className="yield-title">
                {data.title || "Usable Yield Estimation"}
              </h3>
            </div>

            <div className="yield-status-wrap">
              <span className={`yield-status ${normalizeClass(yieldStatus)}`}>
                {humanize(yieldStatus)}
              </span>

              <span className="yield-basis-badge">{humanize(yieldBasis)}</span>
            </div>
          </div>

          <p className="yield-summary">
            {data.summary ||
              "Count-based usable-yield estimation for the classified physical coffee-bean categories."}
          </p>

          <div className="yield-metrics">
            <div className="yield-metric">
              <span>Total Beans</span>
              <strong>{totalBeans}</strong>
            </div>

            <div className="yield-metric">
              <span>Classified Beans</span>
              <strong>{classifiedTotal}</strong>
            </div>

            <div className="yield-metric">
              <span>Coverage</span>
              <strong>{coveragePercentage.toFixed(2)}%</strong>
            </div>

            <div className="yield-metric">
              <span>Recovery Potential</span>
              <strong>{humanize(recoveryPotential)}</strong>
            </div>
          </div>

          <div className="yield-coverage-wrap">
            <div className="yield-coverage-head">
              <span>Classified Coverage</span>
              <strong>{coveragePercentage.toFixed(2)}%</strong>
            </div>

            <div className="yield-coverage-track">
              <div
                className="yield-coverage-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, coveragePercentage))}%`,
                }}
              />
            </div>
          </div>
        </header>

        <div className="yield-content">
          {yieldStatus === "NO_DATA" ? (
            <div className="yield-no-data">
              <strong>No usable-yield estimate available</strong>
              <p>
                A count-based estimate requires classified physical bean data.
              </p>
            </div>
          ) : (
            <>
              <div className="yield-section">
                <div className="yield-section-heading">
                  <div>
                    <h4>Yield Outcome Summary</h4>
                    <p>
                      Canonical usable, recoverable and severe-reject groups
                      derived from classified bean counts.
                    </p>
                  </div>
                </div>

                <div className="yield-outcome-grid">
                  <div className="yield-outcome-card clean">
                    <span>Clean Usable</span>

                    <div className="yield-outcome-value">
                      <strong>{cleanUsableCount}</strong>
                      <small>{cleanUsablePercentage.toFixed(2)}%</small>
                    </div>

                    <p>Good beans available as the clean usable fraction.</p>
                  </div>

                  <div className="yield-outcome-card recoverable">
                    <span>Potential Recoverable</span>

                    <div className="yield-outcome-value">
                      <strong>{potentialRecoverableCount}</strong>
                      <small>
                        {potentialRecoverablePercentage.toFixed(2)}%
                      </small>
                    </div>

                    <p>
                      Good plus broken beans before any required secondary
                      sorting decision.
                    </p>
                  </div>

                  <div className="yield-outcome-card reject">
                    <span>Severe Reject</span>

                    <div className="yield-outcome-value">
                      <strong>{severeRejectCount}</strong>
                      <small>{severeRejectPercentage.toFixed(2)}%</small>
                    </div>

                    <p>
                      Black and black-and-broken categories treated as the
                      severe reject fraction.
                    </p>
                  </div>
                </div>
              </div>

              <div className="yield-section">
                <div className="yield-section-heading">
                  <div>
                    <h4>Classified Bean Distribution</h4>
                    <p>
                      Module 5 keeps Good, Broken, Black and Black + Broken
                      categories separate rather than normalizing overlapping
                      physical defect properties.
                    </p>
                  </div>

                  <span className="yield-count-pill">
                    {classifiedTotal} classified
                  </span>
                </div>

                <div className="yield-category-list">
                  {categoryRows.map((item) => (
                    <div className="yield-category" key={item.key}>
                      <div className="yield-category-top">
                        <div className="yield-category-name">
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </div>

                        <div className="yield-category-count">
                          <span>Count</span>
                          <strong>{item.count}</strong>
                        </div>

                        <div className="yield-category-percent">
                          <span>Share</span>
                          <strong>{formatPercent(item.percentage)}</strong>
                        </div>
                      </div>

                      <div className="yield-category-track">
                        <div
                          className={`yield-category-fill ${item.type}`}
                          style={{
                            width: `${getBarWidth(item)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="yield-section">
                <div className="yield-section-heading">
                  <div>
                    <h4>Yield Control Flags</h4>
                    <p>
                      Operational actions indicated by the classified physical
                      result.
                    </p>
                  </div>

                  <span className="yield-count-pill">
                    {activeFlags.length} active
                  </span>
                </div>

                <div className="yield-controls">
                  {flags.map((item) => (
                    <div
                      className={`yield-control ${
                        item.active ? "active" : "inactive"
                      }`}
                      key={item.key}
                    >
                      <div className="yield-control-code">{item.short}</div>

                      <div>
                        <strong>{item.label}</strong>
                        <small>
                          {item.active ? "Required" : "Not triggered"}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="yield-section">
                <div className="yield-section-heading">
                  <div>
                    <h4>Estimation Basis</h4>
                    <p>
                      Transparency fields describing how this module should be
                      interpreted.
                    </p>
                  </div>
                </div>

                <div className="yield-summary-grid">
                  <div className="yield-summary-card">
                    <span>Yield Basis</span>
                    <strong>{humanize(yieldBasis)}</strong>
                  </div>

                  <div className="yield-summary-card">
                    <span>Recovery Potential</span>
                    <strong>{humanize(recoveryPotential)}</strong>
                  </div>

                  <div className="yield-summary-card">
                    <span>Weight Calibrated</span>
                    <strong>{data.weight_calibrated ? "Yes" : "No"}</strong>
                  </div>

                  <div className="yield-summary-card">
                    <span>Weight-Based Yield</span>
                    <strong>
                      {data.weight_based_yield_available
                        ? "Available"
                        : "Unavailable"}
                    </strong>
                  </div>

                  <div className="yield-summary-card">
                    <span>Unknown Count</span>
                    <strong>
                      {safeNumber(data.unknown_count ?? data.unknown, 0)}
                    </strong>
                  </div>

                  <div className="yield-summary-card">
                    <span>Classified Coverage</span>
                    <strong>{coveragePercentage.toFixed(2)}%</strong>
                  </div>
                </div>
              </div>

              <div className="yield-section">
                <div className="yield-section-heading">
                  <div>
                    <h4>Sample Weight Context</h4>
                    <p>
                      Sample weight is contextual only unless a validated
                      count-to-weight method is available.
                    </p>
                  </div>
                </div>

                <div className="yield-weight-card">
                  <div className="yield-weight-icon">g</div>

                  <div>
                    <h5>
                      {hasSampleWeight
                        ? `Sample weight: ${Number(sampleWeight).toFixed(2)} g`
                        : "Sample weight not available"}
                    </h5>

                    <p>
                      The count-based yield module does not convert bean counts
                      into grams unless a calibrated and validated weight basis
                      is explicitly available.
                    </p>

                    <div className="yield-weight-values">
                      <span className="yield-weight-chip">
                        Calibrated: {data.weight_calibrated ? "Yes" : "No"}
                      </span>

                      <span className="yield-weight-chip">
                        Weight Yield:{" "}
                        {data.weight_based_yield_available
                          ? "Available"
                          : "Unavailable"}
                      </span>

                      {estimatedUsableWeight !== null &&
                        estimatedUsableWeight !== undefined && (
                          <span className="yield-weight-chip">
                            Estimated Usable:{" "}
                            {safeNumber(estimatedUsableWeight, 0).toFixed(2)} g
                          </span>
                        )}

                      {estimatedRejectWeight !== null &&
                        estimatedRejectWeight !== undefined && (
                          <span className="yield-weight-chip">
                            Estimated Reject:{" "}
                            {safeNumber(estimatedRejectWeight, 0).toFixed(2)} g
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {data.interpretation && (
            <div className="yield-section">
              <div className="yield-interpretation">
                <strong>Yield Interpretation</strong>
                <p>{data.interpretation}</p>
              </div>
            </div>
          )}

          {data.methodology_note && (
            <div className="yield-section">
              <div className="yield-methodology">
                <strong>Methodology Transparency</strong>
                <p>{data.methodology_note}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default UsableYield;
