function RoastRisk({ data }) {
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

  const risks = Array.isArray(data.risks) ? data.risks : [];
  const recommendedControls = Array.isArray(data.recommended_controls)
    ? data.recommended_controls
    : [];

  const riskRank = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const sortedRisks = [...risks].sort(
    (a, b) =>
      (riskRank[String(b?.risk_level || "").toUpperCase()] || 0) -
      (riskRank[String(a?.risk_level || "").toUpperCase()] || 0),
  );

  const getRiskIcon = (riskLevel) => {
    const value = String(riskLevel || "").toUpperCase();

    if (value === "CRITICAL") return "!";
    if (value === "HIGH") return "▲";
    if (value === "MEDIUM") return "◐";
    return "✓";
  };

  const getRiskScoreWidth = (score) => {
    const value = Number(score ?? 0);

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(100, value));
  };

  const overallRisk = data.overall_risk || "LOW";
  const overallRiskScore = Number(data.overall_risk_score ?? 0);

  return (
    <section className="roast-risk-module">
      <style>{`
        .roast-risk-module {
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

        .roast-risk-module * {
          box-sizing: border-box;
        }

        .roast-risk-shell {
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

        .roast-risk-hero {
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

        .roast-risk-hero::after {
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

        .roast-risk-hero-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .roast-risk-kicker {
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

        .roast-risk-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0b68e;
          box-shadow: 0 0 0 5px rgba(224, 182, 142, 0.12);
        }

        .roast-risk-title {
          margin: 0;
          max-width: 760px;
          color: #fff8f1;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .roast-risk-summary {
          position: relative;
          z-index: 1;
          max-width: 850px;
          margin: 13px 0 0;
          color: #eadfd5;
          font-size: 14px;
          line-height: 1.72;
        }

        .roast-risk-status-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex: 0 0 auto;
        }

        .roast-risk-status {
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

        .roast-risk-status.low {
          color: #d7f8df;
          background: rgba(46, 125, 70, 0.18);
          border-color: rgba(112, 212, 140, 0.26);
        }

        .roast-risk-status.medium {
          color: #fff0c7;
          background: rgba(196, 132, 27, 0.19);
          border-color: rgba(239, 190, 90, 0.30);
        }

        .roast-risk-status.high {
          color: #ffe0b3;
          background: rgba(177, 104, 24, 0.22);
          border-color: rgba(231, 158, 79, 0.32);
        }

        .roast-risk-status.critical {
          color: #ffd8d0;
          background: rgba(165, 57, 39, 0.20);
          border-color: rgba(240, 123, 101, 0.30);
        }

        .roast-risk-action-badge {
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

        .roast-risk-metrics {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 11px;
          margin-top: 22px;
        }

        .roast-risk-metric {
          min-width: 0;
          padding: 14px 15px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.065);
          backdrop-filter: blur(7px);
        }

        .roast-risk-metric span {
          display: block;
          color: #cbb8a8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .roast-risk-metric strong {
          display: block;
          margin-top: 6px;
          overflow-wrap: anywhere;
          color: #fff;
          font-size: 18px;
          line-height: 1.18;
        }

        .roast-risk-score-wrap {
          position: relative;
          z-index: 1;
          margin-top: 15px;
          padding: 14px 15px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.055);
        }

        .roast-risk-score-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .roast-risk-score-head span {
          color: #cbb8a8;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .roast-risk-score-head strong {
          color: #fff;
          font-size: 15px;
        }

        .roast-risk-score-track {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
        }

        .roast-risk-score-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #86b487,
            #d8ae68 52%,
            #bb5a42 100%
          );
        }

        .roast-risk-content {
          padding: 24px;
        }

        .roast-risk-section + .roast-risk-section {
          margin-top: 25px;
        }

        .roast-risk-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 13px;
        }

        .roast-risk-section-heading h4 {
          margin: 0;
          color: #32261f;
          font-size: 17px;
          letter-spacing: -0.015em;
        }

        .roast-risk-section-heading p {
          margin: 4px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .roast-risk-count-pill {
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

        .roast-risk-list {
          display: grid;
          gap: 14px;
        }

        .roast-risk-item {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 19px;
          background: rgba(255,255,255,0.78);
          box-shadow: 0 8px 24px rgba(64, 41, 28, 0.05);
        }

        .roast-risk-item-head {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 13px;
          align-items: center;
          padding: 16px 17px;
          border-bottom: 1px solid rgba(91, 61, 40, 0.10);
          background:
            linear-gradient(
              90deg,
              rgba(250,246,240,0.95),
              rgba(255,255,255,0.92)
            );
        }

        .roast-risk-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 13px;
          color: #67452e;
          background: #eee1d2;
          font-size: 15px;
          font-weight: 950;
        }

        .roast-risk-icon.critical {
          color: #9f392a;
          background: #f9dfd9;
        }

        .roast-risk-icon.high {
          color: #9a5f0e;
          background: #fff0d6;
        }

        .roast-risk-icon.medium {
          color: #72611d;
          background: #f2ecd7;
        }

        .roast-risk-icon.low {
          color: #357142;
          background: #e8f3e9;
        }

        .roast-risk-item-meta {
          min-width: 0;
        }

        .roast-risk-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 5px;
        }

        .roast-risk-defect-chip,
        .roast-risk-level-chip {
          display: inline-flex;
          align-items: center;
          min-height: 23px;
          padding: 0 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .roast-risk-defect-chip {
          color: #65452e;
          background: #f3eadf;
        }

        .roast-risk-level-chip {
          color: #5e5148;
          background: #eeeae6;
        }

        .roast-risk-level-chip.critical {
          color: #9c3527;
          background: #fee4df;
        }

        .roast-risk-level-chip.high {
          color: #8a5a16;
          background: #fff0d6;
        }

        .roast-risk-level-chip.medium {
          color: #72611d;
          background: #f2ecd7;
        }

        .roast-risk-level-chip.low {
          color: #357142;
          background: #e8f3e9;
        }

        .roast-risk-item h5 {
          margin: 0;
          color: #34271f;
          font-size: 15px;
          line-height: 1.35;
        }

        .roast-risk-score-box {
          min-width: 76px;
          padding: 8px 10px;
          border-radius: 13px;
          text-align: center;
          color: #5d4432;
          background: #f4eadf;
          border: 1px solid #ead9c7;
        }

        .roast-risk-score-box span {
          display: block;
          color: #9a806b;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .roast-risk-score-box strong {
          display: block;
          margin-top: 2px;
          font-size: 18px;
        }

        .roast-risk-item-body {
          display: grid;
          gap: 13px;
          padding: 16px 17px;
        }

        .roast-risk-explanation,
        .roast-risk-control,
        .roast-risk-drivers {
          padding: 14px 15px;
          border-radius: 14px;
        }

        .roast-risk-explanation {
          background: #f7f7f5;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .roast-risk-control {
          background: #f8f1e7;
          border: 1px solid rgba(122, 81, 50, 0.10);
        }

        .roast-risk-drivers {
          background: #fbf8f3;
          border: 1px solid rgba(91, 61, 40, 0.08);
        }

        .roast-risk-item-body span {
          display: block;
          margin-bottom: 5px;
          color: #8b7768;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .roast-risk-item-body p {
          margin: 0;
          color: #51463f;
          font-size: 12px;
          line-height: 1.68;
        }

        .roast-risk-drivers ul {
          margin: 0;
          padding-left: 18px;
        }

        .roast-risk-drivers li {
          margin: 5px 0;
          color: #61544b;
          font-size: 11px;
          line-height: 1.55;
        }

        .roast-risk-item-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
          padding: 10px 17px;
          border-top: 1px solid var(--line);
          background: rgba(250,247,242,0.72);
        }

        .roast-risk-evidence,
        .roast-risk-source,
        .roast-risk-detected {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 0 8px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 900;
        }

        .roast-risk-evidence {
          color: #5d5148;
          background: #e9e2db;
        }

        .roast-risk-source {
          color: #72645a;
          background: #fff;
          border: 1px solid rgba(76, 56, 42, 0.10);
        }

        .roast-risk-detected {
          margin-left: auto;
          color: #6c5a4c;
          background: #fff;
          border: 1px solid rgba(76, 56, 42, 0.10);
        }

        .roast-risk-empty {
          padding: 22px;
          border: 1px dashed rgba(91, 61, 40, 0.22);
          border-radius: 17px;
          background: rgba(255,255,255,0.52);
          text-align: center;
        }

        .roast-risk-empty strong {
          display: block;
          color: #3f583f;
          font-size: 14px;
        }

        .roast-risk-empty p {
          margin: 5px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .roast-risk-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
        }

        .roast-risk-summary-card {
          padding: 15px;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.70);
        }

        .roast-risk-summary-card span {
          display: block;
          color: #8a7566;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .roast-risk-summary-card strong {
          display: block;
          margin-top: 6px;
          color: #46362d;
          font-size: 17px;
          line-height: 1.25;
        }

        .roast-risk-controls {
          display: grid;
          gap: 10px;
        }

        .roast-risk-control-item {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: flex-start;
          padding: 12px 13px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: rgba(255,255,255,0.68);
        }

        .roast-risk-control-number {
          display: grid;
          place-items: center;
          width: 27px;
          height: 27px;
          border-radius: 9px;
          color: #fff;
          background: #765438;
          font-size: 9px;
          font-weight: 900;
        }

        .roast-risk-control-item p {
          margin: 2px 0 0;
          color: #62554c;
          font-size: 11px;
          line-height: 1.6;
        }

        .roast-risk-methodology {
          padding: 15px 16px;
          border-left: 4px solid #8b6345;
          border-radius: 0 14px 14px 0;
          background: #f3eadf;
        }

        .roast-risk-methodology strong {
          display: block;
          margin-bottom: 5px;
          color: #5c3d29;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .roast-risk-methodology p {
          margin: 0;
          color: #6f5e52;
          font-size: 11px;
          line-height: 1.67;
        }

        @media (max-width: 980px) {
          .roast-risk-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .roast-risk-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .roast-risk-hero,
          .roast-risk-content {
            padding: 18px;
          }

          .roast-risk-hero-top {
            flex-direction: column;
          }

          .roast-risk-status-wrap {
            align-items: flex-start;
          }

          .roast-risk-metrics,
          .roast-risk-summary-grid {
            grid-template-columns: 1fr;
          }

          .roast-risk-item-head {
            grid-template-columns: auto 1fr;
          }

          .roast-risk-score-box {
            grid-column: 1 / -1;
            text-align: left;
          }

          .roast-risk-score-box span,
          .roast-risk-score-box strong {
            display: inline;
          }

          .roast-risk-score-box strong {
            margin-left: 7px;
          }

          .roast-risk-detected {
            width: 100%;
            margin-left: 0;
          }
        }
      `}</style>

      <div className="roast-risk-shell">
        <header className="roast-risk-hero">
          <div className="roast-risk-hero-top">
            <div>
              <div className="roast-risk-kicker">
                <span className="roast-risk-kicker-dot" />
                Module 3 · Pre-Roast Processing Intelligence
              </div>

              <h3 className="roast-risk-title">
                {data.title || "Roast Quality Risks"}
              </h3>
            </div>

            <div className="roast-risk-status-wrap">
              <span
                className={`roast-risk-status ${normalizeClass(overallRisk)}`}
              >
                {humanize(overallRisk)}
              </span>

              <span className="roast-risk-action-badge">
                Corrective Action:{" "}
                {data.requires_corrective_action ? "Required" : "Not Required"}
              </span>
            </div>
          </div>

          <p className="roast-risk-summary">
            {data.summary ||
              "Defect-driven roast-quality risks are shown for the current batch."}
          </p>

          <div className="roast-risk-metrics">
            <div className="roast-risk-metric">
              <span>Overall Risk</span>
              <strong>{humanize(overallRisk)}</strong>
            </div>

            <div className="roast-risk-metric">
              <span>Risk Score</span>
              <strong>{overallRiskScore.toFixed(0)} / 100</strong>
            </div>

            <div className="roast-risk-metric">
              <span>Active Risks</span>
              <strong>{data.active_risk_count ?? risks.length}</strong>
            </div>

            <div className="roast-risk-metric">
              <span>Inspection</span>
              <strong>
                {data.inspection_complete === false ? "Review" : "Complete"}
              </strong>
            </div>
          </div>

          <div className="roast-risk-score-wrap">
            <div className="roast-risk-score-head">
              <span>Research-Defined Severity Display Score</span>
              <strong>{overallRiskScore.toFixed(0)}%</strong>
            </div>

            <div className="roast-risk-score-track">
              <div
                className="roast-risk-score-fill"
                style={{
                  width: `${getRiskScoreWidth(overallRiskScore)}%`,
                }}
              />
            </div>
          </div>
        </header>

        <div className="roast-risk-content">
          <div className="roast-risk-section">
            <div className="roast-risk-section-heading">
              <div>
                <h4>Defect-Specific Roast Risks</h4>
                <p>
                  Each active defect independently generates its own
                  roast-quality risk and recommended control.
                </p>
              </div>

              <span className="roast-risk-count-pill">
                {sortedRisks.length} risk
                {sortedRisks.length === 1 ? "" : "s"}
              </span>
            </div>

            {sortedRisks.length > 0 ? (
              <div className="roast-risk-list">
                {sortedRisks.map((item, index) => {
                  const drivers = Array.isArray(item.drivers)
                    ? item.drivers
                    : [];

                  const sourceBasis = Array.isArray(item.source_basis)
                    ? item.source_basis
                    : [];

                  return (
                    <article
                      className="roast-risk-item"
                      key={`${item.defect || "risk"}-${index}`}
                    >
                      <div className="roast-risk-item-head">
                        <div
                          className={`roast-risk-icon ${normalizeClass(
                            item.risk_level,
                          )}`}
                        >
                          {getRiskIcon(item.risk_level)}
                        </div>

                        <div className="roast-risk-item-meta">
                          <div className="roast-risk-tags">
                            <span className="roast-risk-defect-chip">
                              {humanize(item.defect)}
                            </span>

                            <span
                              className={`roast-risk-level-chip ${normalizeClass(
                                item.risk_level,
                              )}`}
                            >
                              {item.risk_level || "N/A"}
                            </span>
                          </div>

                          <h5>{item.risk_name || "Roast Quality Risk"}</h5>
                        </div>

                        <div className="roast-risk-score-box">
                          <span>Score</span>
                          <strong>
                            {Number(item.risk_score ?? 0).toFixed(0)}
                          </strong>
                        </div>
                      </div>

                      <div className="roast-risk-item-body">
                        <div className="roast-risk-explanation">
                          <span>Risk Explanation</span>
                          <p>
                            {item.explanation ||
                              "No risk explanation was provided."}
                          </p>
                        </div>

                        {drivers.length > 0 && (
                          <div className="roast-risk-drivers">
                            <span>Risk Drivers</span>

                            <ul>
                              {drivers.map((driver, driverIndex) => (
                                <li key={driverIndex}>{driver}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="roast-risk-control">
                          <span>Recommended Control</span>
                          <p>
                            {item.recommended_control ||
                              "Complete the relevant pre-roast corrective control."}
                          </p>
                        </div>
                      </div>

                      <div className="roast-risk-item-footer">
                        {item.evidence_class && (
                          <span className="roast-risk-evidence">
                            {humanize(item.evidence_class)}
                          </span>
                        )}

                        {sourceBasis.map((source, sourceIndex) => (
                          <span
                            className="roast-risk-source"
                            key={`${item.defect || "risk"}-source-${sourceIndex}`}
                          >
                            {source}
                          </span>
                        ))}

                        {item.detected_count !== null &&
                          item.detected_count !== undefined && (
                            <span className="roast-risk-detected">
                              Detected count: {item.detected_count}
                            </span>
                          )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="roast-risk-empty">
                <strong>No defect-specific roast risk triggered</strong>
                <p>
                  Continue normal pre-roast preparation and standard roasting
                  quality controls.
                </p>
              </div>
            )}
          </div>

          <div className="roast-risk-section">
            <div className="roast-risk-section-heading">
              <div>
                <h4>Risk Assessment Summary</h4>
                <p>
                  Compatibility and transparency values returned by the
                  defect-driven backend module.
                </p>
              </div>
            </div>

            <div className="roast-risk-summary-grid">
              <div className="roast-risk-summary-card">
                <span>Active Defects</span>
                <strong>{data.active_defect_count ?? 0}</strong>
              </div>

              <div className="roast-risk-summary-card">
                <span>Sensor Risk Contribution</span>
                <strong>
                  {Number(data.sensor_risk_contribution ?? 0).toFixed(0)} / 100
                </strong>
              </div>

              <div className="roast-risk-summary-card">
                <span>Sensor Mode</span>
                <strong>
                  {humanize(data.sensor_status || "DEFECT_DRIVEN")}
                </strong>
              </div>

              <div className="roast-risk-summary-card">
                <span>Broken Property</span>
                <strong>
                  {Number(data.broken_percentage ?? 0).toFixed(2)}%
                </strong>
              </div>

              <div className="roast-risk-summary-card">
                <span>Severe / Black Property</span>
                <strong>
                  {Number(data.severe_defect_percentage ?? 0).toFixed(2)}%
                </strong>
              </div>

              <div className="roast-risk-summary-card">
                <span>Unknown</span>
                <strong>
                  {Number(data.unknown_percentage ?? 0).toFixed(2)}%
                </strong>
              </div>
            </div>
          </div>

          <div className="roast-risk-section">
            <div className="roast-risk-section-heading">
              <div>
                <h4>Recommended Controls</h4>
                <p>
                  Consolidated controls derived from all active roast-quality
                  risks.
                </p>
              </div>

              <span className="roast-risk-count-pill">
                {recommendedControls.length} control
                {recommendedControls.length === 1 ? "" : "s"}
              </span>
            </div>

            {recommendedControls.length > 0 ? (
              <div className="roast-risk-controls">
                {recommendedControls.map((control, index) => (
                  <div className="roast-risk-control-item" key={index}>
                    <div className="roast-risk-control-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <p>{control}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="roast-risk-empty">
                <strong>No additional corrective control required</strong>
                <p>
                  No active defect-driven roast-quality risk currently requires
                  an additional control.
                </p>
              </div>
            )}
          </div>

          {data.methodology_note && (
            <div className="roast-risk-section">
              <div className="roast-risk-methodology">
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

export default RoastRisk;
