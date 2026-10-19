import { useState } from "react";

function RoastRisk({ data }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!data) {
    return null;
  }

  // -------------------------------------------------------
  // Helper functions
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // Data preparation
  // -------------------------------------------------------

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

  const overallRisk = data.overall_risk || "LOW";

  const overallRiskScore = Number(data.overall_risk_score ?? 0);

  const activeRiskCount = data.active_risk_count ?? sortedRisks.length;

  // -------------------------------------------------------
  // Helpers
  // -------------------------------------------------------

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

  const getRiskMeaning = () => {
    const value = String(overallRisk || "").toUpperCase();

    if (value === "CRITICAL") {
      return "Significant roast-quality problems are likely unless corrective action is completed before roasting.";
    }

    if (value === "HIGH") {
      return "Important roast-quality risks are present. Apply the recommended controls before roasting.";
    }

    if (value === "MEDIUM") {
      return "Some roast-quality risks are present. Controlled preparation is recommended before roasting.";
    }

    return "No major defect-driven roast-quality risk is currently indicated. Continue with normal roasting controls.";
  };

  return (
    <section className="roast-risk-module">
      <style>{`
        .roast-risk-module {
          --coffee-950: #20150f;
          --coffee-900: #2d1d14;
          --coffee-800: #3d281b;
          --coffee-700: #5a3a25;
          --coffee-600: #7a5132;

          --cream-50: #fffdf9;
          --cream-100: #fbf6ee;
          --cream-200: #f2e7d8;

          --text-main: #2a211c;
          --text-soft: #74665c;

          --line: rgba(91, 61, 40, 0.14);

          width: 100%;
          color: var(--text-main);

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .roast-risk-module * {
          box-sizing: border-box;
        }

        /* --------------------------------------------------
           MAIN CONTAINER
        -------------------------------------------------- */

        .roast-risk-shell {
          overflow: hidden;

          border: 1px solid var(--line);
          border-radius: 24px;

          background:
            linear-gradient(
              145deg,
              #fffdf9,
              #fbf6ee
            );

          box-shadow:
            0 18px 55px
            rgba(67, 43, 28, 0.10);
        }

        /* --------------------------------------------------
           DECISION HEADER
        -------------------------------------------------- */

        .roast-decision {
          position: relative;

          padding: 28px;

          color: #fff;

          background:
            radial-gradient(
              circle at 90% 5%,
              rgba(255,255,255,0.10),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #2c1d15 0%,
              #4e3020 58%,
              #684127 100%
            );
        }

        .roast-decision-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 10px;

          color: #dbc4ad;

          font-size: 11px;
          font-weight: 850;

          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .roast-decision-kicker-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #e0b68e;

          box-shadow:
            0 0 0 5px
            rgba(224, 182, 142, 0.12);
        }

        .roast-decision-header {
          display: flex;

          align-items: flex-start;
          justify-content: space-between;

          gap: 22px;
        }

        .roast-decision-heading {
          flex: 1;
        }

        .roast-decision-heading h3 {
          margin: 0;

          color: #fff8f1;

          font-size:
            clamp(
              25px,
              3vw,
              35px
            );

          line-height: 1.12;

          letter-spacing: -0.035em;
        }

        .roast-decision-heading p {
          max-width: 820px;

          margin: 12px 0 0;

          color: #eadfd5;

          font-size: 14px;

          line-height: 1.68;
        }

        /* --------------------------------------------------
           RISK STATUS
        -------------------------------------------------- */

        .roast-decision-status-wrap {
          display: flex;

          flex-direction: column;

          align-items: flex-end;

          gap: 8px;

          flex: 0 0 auto;
        }

        .roast-decision-status {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          min-height: 42px;

          padding: 0 15px;

          border:
            1px solid
            rgba(255,255,255,0.18);

          border-radius: 999px;

          background:
            rgba(255,255,255,0.08);

          backdrop-filter: blur(9px);

          font-size: 11px;
          font-weight: 900;

          letter-spacing: 0.06em;

          text-transform: uppercase;
        }

        .roast-decision-status.low {
          color: #d7f8df;

          background:
            rgba(46, 125, 70, 0.18);

          border-color:
            rgba(112, 212, 140, 0.28);
        }

        .roast-decision-status.medium {
          color: #fff0c7;

          background:
            rgba(196, 132, 27, 0.20);

          border-color:
            rgba(239, 190, 90, 0.32);
        }

        .roast-decision-status.high {
          color: #ffe0b3;

          background:
            rgba(177, 104, 24, 0.22);

          border-color:
            rgba(231, 158, 79, 0.32);
        }

        .roast-decision-status.critical {
          color: #ffd8d0;

          background:
            rgba(165, 57, 39, 0.22);

          border-color:
            rgba(240, 123, 101, 0.32);
        }

        .roast-corrective-badge {
          display: inline-flex;

          align-items: center;

          min-height: 29px;

          padding: 0 10px;

          border-radius: 999px;

          color: #e8d8ca;

          background:
            rgba(255,255,255,0.055);

          border:
            1px solid
            rgba(255,255,255,0.09);

          font-size: 9px;
          font-weight: 850;

          letter-spacing: 0.05em;

          text-transform: uppercase;
        }

        /* --------------------------------------------------
           MAIN METRICS
        -------------------------------------------------- */

        .roast-decision-metrics {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 12px;

          margin-top: 24px;
        }

        .roast-decision-metric {
          padding: 15px 16px;

          border:
            1px solid
            rgba(255,255,255,0.11);

          border-radius: 16px;

          background:
            rgba(255,255,255,0.07);

          backdrop-filter: blur(8px);
        }

        .roast-decision-metric span {
          display: block;

          color: #cbb8a8;

          font-size: 9px;
          font-weight: 850;

          letter-spacing: 0.08em;

          text-transform: uppercase;
        }

        .roast-decision-metric strong {
          display: block;

          margin-top: 6px;

          color: #fff;

          font-size: 18px;

          line-height: 1.2;

          overflow-wrap: anywhere;
        }

        /* --------------------------------------------------
           SCORE BAR
        -------------------------------------------------- */

        .roast-score-wrap {
          margin-top: 15px;

          padding: 14px 15px;

          border:
            1px solid
            rgba(255,255,255,0.10);

          border-radius: 16px;

          background:
            rgba(255,255,255,0.055);
        }

        .roast-score-head {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 12px;

          margin-bottom: 8px;
        }

        .roast-score-head span {
          color: #cbb8a8;

          font-size: 9px;
          font-weight: 850;

          letter-spacing: 0.08em;

          text-transform: uppercase;
        }

        .roast-score-head strong {
          color: #fff;

          font-size: 15px;
        }

        .roast-score-track {
          height: 8px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(255,255,255,0.08);
        }

        .roast-score-fill {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #86b487,
              #d8ae68 52%,
              #bb5a42 100%
            );
        }

        /* --------------------------------------------------
           MAIN CONTENT
        -------------------------------------------------- */

        .roast-risk-content {
          padding: 25px;
        }

        /* --------------------------------------------------
           WHAT DOES THIS MEAN?
        -------------------------------------------------- */

        .roast-meaning-card {
          padding: 20px;

          border:
            1px solid
            rgba(122, 81, 50, 0.18);

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              #fffaf4,
              #f7ede1
            );

          box-shadow:
            0 10px 30px
            rgba(64, 41, 28, 0.05);
        }

        .roast-meaning-label {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-bottom: 9px;

          color: #866448;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.09em;

          text-transform: uppercase;
        }

        .roast-meaning-label::before {
          content: "!";

          display: grid;
          place-items: center;

          width: 26px;
          height: 26px;

          border-radius: 8px;

          color: #fff;
          background: #765036;
        }

        .roast-meaning-card h4 {
          margin: 0;

          color: #34271f;

          font-size: 20px;

          line-height: 1.28;
        }

        .roast-meaning-card p {
          max-width: 920px;

          margin: 8px 0 0;

          color: #64574e;

          font-size: 13px;

          line-height: 1.7;
        }

        /* --------------------------------------------------
           SECTION HEADINGS
        -------------------------------------------------- */

        .roast-main-section {
          margin-top: 24px;
        }

        .roast-section-heading {
          display: flex;

          align-items: flex-end;
          justify-content: space-between;

          gap: 14px;

          margin-bottom: 13px;
        }

        .roast-section-heading h4 {
          margin: 0;

          color: #32261f;

          font-size: 17px;
        }

        .roast-section-heading p {
          margin: 4px 0 0;

          color: var(--text-soft);

          font-size: 12px;

          line-height: 1.55;
        }

        .roast-count-pill {
          flex: 0 0 auto;

          padding: 6px 10px;

          border-radius: 999px;

          background: #f2e7d8;

          color: #5d402d;

          font-size: 10px;
          font-weight: 900;

          text-transform: uppercase;
        }

        /* --------------------------------------------------
           MAIN RISK CARDS
        -------------------------------------------------- */

        .roast-main-risk-list {
          display: grid;

          gap: 12px;
        }

        .roast-main-risk-card {
          display: grid;

          grid-template-columns:
            auto minmax(0, 1fr);

          gap: 13px;

          padding: 16px;

          border:
            1px solid
            var(--line);

          border-radius: 17px;

          background: #fff;

          box-shadow:
            0 7px 20px
            rgba(64, 41, 28, 0.04);
        }

        .roast-main-risk-icon {
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

        .roast-main-risk-icon.critical {
          color: #9f392a;
          background: #f9dfd9;
        }

        .roast-main-risk-icon.high {
          color: #9a5f0e;
          background: #fff0d6;
        }

        .roast-main-risk-icon.medium {
          color: #72611d;
          background: #f2ecd7;
        }

        .roast-main-risk-icon.low {
          color: #357142;
          background: #e8f3e9;
        }

        .roast-main-risk-top {
          display: flex;

          flex-wrap: wrap;

          align-items: center;

          gap: 7px;
        }

        .roast-main-risk-card h5 {
          margin: 7px 0 0;

          color: #34271f;

          font-size: 15px;

          line-height: 1.35;
        }

        .roast-main-risk-card p {
          margin: 7px 0 0;

          color: #62554c;

          font-size: 12px;

          line-height: 1.65;
        }

        .roast-risk-chip {
          display: inline-flex;

          align-items: center;

          min-height: 24px;

          padding: 0 8px;

          border-radius: 999px;

          font-size: 9px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .roast-risk-chip.defect {
          color: #65452e;
          background: #f3eadf;
        }

        .roast-risk-chip.level {
          color: #5e5148;
          background: #eeeae6;
        }

        .roast-risk-chip.level.critical {
          color: #9c3527;
          background: #fee4df;
        }

        .roast-risk-chip.level.high {
          color: #8a5a16;
          background: #fff0d6;
        }

        .roast-risk-chip.level.medium {
          color: #72611d;
          background: #f2ecd7;
        }

        .roast-risk-chip.level.low {
          color: #357142;
          background: #e8f3e9;
        }

        .roast-risk-chip.score {
          color: #66462f;
          background: #eee0d1;
        }

        .roast-main-control {
          margin-top: 11px;

          padding: 11px 12px;

          border:
            1px solid
            rgba(122, 81, 50, 0.10);

          border-radius: 12px;

          background: #f8f1e7;
        }

        .roast-main-control span {
          display: block;

          margin-bottom: 4px;

          color: #8b7768;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 0.07em;

          text-transform: uppercase;
        }

        .roast-main-control p {
          margin: 0;

          color: #51463f;

          font-size: 11px;

          line-height: 1.6;
        }

        /* --------------------------------------------------
           RECOMMENDED CONTROLS
        -------------------------------------------------- */

        .roast-controls-list {
          display: grid;

          gap: 10px;
        }

        .roast-control-item {
          display: grid;

          grid-template-columns:
            auto 1fr;

          gap: 10px;

          align-items: flex-start;

          padding: 12px 13px;

          border:
            1px solid
            var(--line);

          border-radius: 14px;

          background: #fff;
        }

        .roast-control-number {
          display: grid;

          place-items: center;

          width: 28px;
          height: 28px;

          border-radius: 9px;

          color: #fff;
          background: #765438;

          font-size: 9px;
          font-weight: 900;
        }

        .roast-control-item p {
          margin: 3px 0 0;

          color: #62554c;

          font-size: 12px;

          line-height: 1.6;
        }

        /* --------------------------------------------------
           EMPTY STATE
        -------------------------------------------------- */

        .roast-empty {
          padding: 19px;

          border:
            1px dashed
            rgba(91, 61, 40, 0.22);

          border-radius: 15px;

          background: #faf8f4;

          text-align: center;
        }

        .roast-empty strong {
          display: block;

          color: #3f583f;

          font-size: 14px;
        }

        .roast-empty p {
          margin: 5px 0 0;

          color: var(--text-soft);

          font-size: 12px;

          line-height: 1.55;
        }

        /* --------------------------------------------------
           DETAILS BUTTON
        -------------------------------------------------- */

        .roast-details-toggle-wrap {
          display: flex;

          justify-content: center;

          margin-top: 25px;
        }

        .roast-details-toggle {
          min-height: 44px;

          padding: 0 18px;

          border:
            1px solid
            #72513a;

          border-radius: 12px;

          color: #fff;
          background: #543724;

          cursor: pointer;

          font-size: 12px;
          font-weight: 850;

          transition:
            transform 0.15s ease,
            background 0.15s ease;
        }

        .roast-details-toggle:hover {
          background: #68452d;

          transform: translateY(-1px);
        }

        /* --------------------------------------------------
           DETAILED ANALYSIS
        -------------------------------------------------- */

        .roast-detailed-analysis {
          margin-top: 28px;

          padding-top: 27px;

          border-top:
            1px solid
            var(--line);
        }

        .roast-details-header {
          margin-bottom: 22px;
        }

        .roast-details-header span {
          display: block;

          color: #8b674c;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.09em;

          text-transform: uppercase;
        }

        .roast-details-header h4 {
          margin: 5px 0 0;

          color: #33271f;

          font-size: 21px;
        }

        .roast-details-header p {
          max-width: 760px;

          margin: 7px 0 0;

          color: var(--text-soft);

          font-size: 12px;

          line-height: 1.65;
        }

        .roast-detail-section + .roast-detail-section {
          margin-top: 26px;
        }

        /* --------------------------------------------------
           DETAILED RISK CARDS
        -------------------------------------------------- */

        .roast-detail-risk-list {
          display: grid;

          gap: 14px;
        }

        .roast-detail-risk-card {
          overflow: hidden;

          border:
            1px solid
            var(--line);

          border-radius: 17px;

          background: #fff;
        }

        .roast-detail-risk-head {
          display: grid;

          grid-template-columns:
            auto minmax(0, 1fr) auto;

          gap: 12px;

          align-items: center;

          padding: 15px 16px;

          background: #fcf8f3;
        }

        .roast-detail-risk-score {
          min-width: 68px;

          padding: 7px 9px;

          border-radius: 11px;

          color: #5d4432;
          background: #f4eadf;

          text-align: center;
        }

        .roast-detail-risk-score span {
          display: block;

          color: #9a806b;

          font-size: 8px;
          font-weight: 850;

          text-transform: uppercase;
        }

        .roast-detail-risk-score strong {
          display: block;

          margin-top: 2px;

          font-size: 17px;
        }

        .roast-detail-risk-body {
          display: grid;

          gap: 12px;

          padding: 15px 16px;
        }

        .roast-detail-box {
          padding: 13px 14px;

          border-radius: 13px;

          background: #f8f4ef;

          border:
            1px solid
            rgba(91, 61, 40, 0.08);
        }

        .roast-detail-box span {
          display: block;

          margin-bottom: 5px;

          color: #8b7768;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.07em;

          text-transform: uppercase;
        }

        .roast-detail-box p {
          margin: 0;

          color: #51463f;

          font-size: 12px;

          line-height: 1.68;
        }

        .roast-detail-box ul {
          margin: 0;

          padding-left: 18px;
        }

        .roast-detail-box li {
          margin: 5px 0;

          color: #61544b;

          font-size: 11px;

          line-height: 1.55;
        }

        .roast-detail-footer {
          display: flex;

          flex-wrap: wrap;

          gap: 7px;

          padding: 10px 16px;

          border-top:
            1px solid
            var(--line);

          background: #faf7f2;
        }

        .roast-footer-chip {
          display: inline-flex;

          align-items: center;

          min-height: 25px;

          padding: 0 8px;

          border-radius: 7px;

          color: #5d5148;
          background: #ebe4dd;

          font-size: 9px;
          font-weight: 850;
        }

        /* --------------------------------------------------
           TECHNICAL SUMMARY
        -------------------------------------------------- */

        .roast-technical-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 10px;
        }

        .roast-technical-card {
          padding: 14px;

          border:
            1px solid
            var(--line);

          border-radius: 14px;

          background: #fff;
        }

        .roast-technical-card span {
          display: block;

          color: #8a7566;

          font-size: 9px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .roast-technical-card strong {
          display: block;

          margin-top: 6px;

          color: #46362d;

          font-size: 15px;

          line-height: 1.3;
        }

        /* --------------------------------------------------
           METHODOLOGY
        -------------------------------------------------- */

        .roast-methodology-card {
          padding: 15px 16px;

          border-left:
            4px solid
            #8b6345;

          border-radius:
            0 13px 13px 0;

          background: #f3eadf;
        }

        .roast-methodology-card strong {
          display: block;

          margin-bottom: 5px;

          color: #5c3d29;

          font-size: 10px;

          letter-spacing: 0.07em;

          text-transform: uppercase;
        }

        .roast-methodology-card p {
          margin: 0;

          color: #6f5e52;

          font-size: 11px;

          line-height: 1.67;
        }

        /* --------------------------------------------------
           RESPONSIVE
        -------------------------------------------------- */

        @media (max-width: 900px) {
          .roast-decision-header {
            flex-direction: column;
          }

          .roast-decision-status-wrap {
            align-items: flex-start;
          }

          .roast-decision-metrics,
          .roast-technical-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 620px) {
          .roast-decision,
          .roast-risk-content {
            padding: 18px;
          }

          .roast-decision-metrics,
          .roast-technical-grid {
            grid-template-columns: 1fr;
          }

          .roast-detail-risk-head {
            grid-template-columns:
              auto 1fr;
          }

          .roast-detail-risk-score {
            grid-column: 1 / -1;

            text-align: left;
          }

          .roast-detail-risk-score span,
          .roast-detail-risk-score strong {
            display: inline;
          }

          .roast-detail-risk-score strong {
            margin-left: 6px;
          }
        }
      `}</style>

      <div className="roast-risk-shell">

        {/* ==================================================
            MAIN DECISION
        ================================================== */}

        <header className="roast-decision">

          <div className="roast-decision-kicker">
            <span className="roast-decision-kicker-dot" />
            Roast Quality Risk Decision
          </div>

          <div className="roast-decision-header">

            <div className="roast-decision-heading">

              <h3>
                {data.title || "Roast Quality Risks"}
              </h3>

              <p>
                {data.summary ||
                  "The system has evaluated the current bean defects and identified the roast-quality risks that may affect this batch."}
              </p>

            </div>

            <div className="roast-decision-status-wrap">

              <span
                className={`roast-decision-status ${normalizeClass(
                  overallRisk,
                )}`}
              >
                {humanize(overallRisk)} Risk
              </span>

              <span className="roast-corrective-badge">
                Corrective Action:{" "}
                {data.requires_corrective_action
                  ? "Required"
                  : "Not Required"}
              </span>

            </div>

          </div>

          <div className="roast-decision-metrics">

            <div className="roast-decision-metric">
              <span>Overall Risk</span>

              <strong>
                {humanize(overallRisk)}
              </strong>
            </div>

            <div className="roast-decision-metric">
              <span>Risk Score</span>

              <strong>
                {overallRiskScore.toFixed(0)} / 100
              </strong>
            </div>

            <div className="roast-decision-metric">
              <span>Active Risks</span>

              <strong>
                {activeRiskCount}
              </strong>
            </div>

          </div>

          <div className="roast-score-wrap">

            <div className="roast-score-head">

              <span>
                Risk Severity
              </span>

              <strong>
                {overallRiskScore.toFixed(0)}%
              </strong>

            </div>

            <div className="roast-score-track">

              <div
                className="roast-score-fill"
                style={{
                  width: `${getRiskScoreWidth(
                    overallRiskScore,
                  )}%`,
                }}
              />

            </div>

          </div>

        </header>

        <div className="roast-risk-content">

          {/* ==================================================
              SIMPLE MEANING
          ================================================== */}

          <div className="roast-meaning-card">

            <div className="roast-meaning-label">
              What Does This Mean?
            </div>

            <h4>
              {humanize(overallRisk)} Roast Risk
            </h4>

            <p>
              {getRiskMeaning()}
            </p>

          </div>

          {/* ==================================================
              ALL ACTIVE RISKS ON MAIN SCREEN
          ================================================== */}

          <section className="roast-main-section">

            <div className="roast-section-heading">

              <div>
                <h4>
                  Risks to Watch Before Roasting
                </h4>

                <p>
                  All active roast-quality risks are shown here in priority order.
                </p>
              </div>

              <span className="roast-count-pill">
                {sortedRisks.length} Risk
                {sortedRisks.length === 1 ? "" : "s"}
              </span>

            </div>

            {sortedRisks.length > 0 ? (
              <div className="roast-main-risk-list">

                {sortedRisks.map((item, index) => (
                  <article
                    className="roast-main-risk-card"
                    key={`${item.defect || "risk"}-${index}`}
                  >

                    <div
                      className={`roast-main-risk-icon ${normalizeClass(
                        item.risk_level,
                      )}`}
                    >
                      {getRiskIcon(item.risk_level)}
                    </div>

                    <div>

                      <div className="roast-main-risk-top">

                        {item.defect && (
                          <span className="roast-risk-chip defect">
                            {humanize(item.defect)}
                          </span>
                        )}

                        {item.risk_level && (
                          <span
                            className={`roast-risk-chip level ${normalizeClass(
                              item.risk_level,
                            )}`}
                          >
                            {humanize(item.risk_level)}
                          </span>
                        )}

                        <span className="roast-risk-chip score">
                          Score{" "}
                          {Number(
                            item.risk_score ?? 0,
                          ).toFixed(0)}
                        </span>

                      </div>

                      <h5>
                        {item.risk_name ||
                          "Roast Quality Risk"}
                      </h5>

                      {item.explanation && (
                        <p>
                          {item.explanation}
                        </p>
                      )}

                      <div className="roast-main-control">

                        <span>
                          Recommended Control
                        </span>

                        <p>
                          {item.recommended_control ||
                            "Complete the relevant pre-roast corrective control."}
                        </p>

                      </div>

                    </div>

                  </article>
                ))}

              </div>
            ) : (
              <div className="roast-empty">

                <strong>
                  No defect-specific roast risk triggered
                </strong>

                <p>
                  Continue normal pre-roast preparation and standard roasting quality controls.
                </p>

              </div>
            )}

          </section>

          {/* ==================================================
              ALL RECOMMENDED CONTROLS ON MAIN SCREEN
          ================================================== */}

          <section className="roast-main-section">

            <div className="roast-section-heading">

              <div>
                <h4>
                  What Should I Do Before Roasting?
                </h4>

                <p>
                  Apply these controls before continuing with the roasting stage.
                </p>
              </div>

              <span className="roast-count-pill">
                {recommendedControls.length} Control
                {recommendedControls.length === 1 ? "" : "s"}
              </span>

            </div>

            {recommendedControls.length > 0 ? (
              <div className="roast-controls-list">

                {recommendedControls.map((control, index) => (
                  <div
                    className="roast-control-item"
                    key={index}
                  >

                    <div className="roast-control-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <p>
                      {control}
                    </p>

                  </div>
                ))}

              </div>
            ) : (
              <div className="roast-empty">

                <strong>
                  No additional corrective control required
                </strong>

                <p>
                  No active defect-driven roast-quality risk currently requires an additional control.
                </p>

              </div>
            )}

          </section>

          {/* ==================================================
              DETAILS BUTTON
          ================================================== */}

          <div className="roast-details-toggle-wrap">

            <button
              type="button"
              className="roast-details-toggle"
              aria-expanded={showDetails}
              onClick={() =>
                setShowDetails(
                  (current) => !current,
                )
              }
            >
              {showDetails
                ? "Hide Detailed Analysis"
                : "View Detailed Analysis"}
            </button>

          </div>

          {/* ==================================================
              DETAILED ANALYSIS
          ================================================== */}

          {showDetails && (
            <div className="roast-detailed-analysis">

              <div className="roast-details-header">

                <span>
                  Additional Technical Information
                </span>

                <h4>
                  Detailed Roast Risk Analysis
                </h4>

                <p>
                  This section provides the detailed risk drivers, evidence,
                  source basis, defect percentages and methodology behind the
                  main roast-risk decision.
                </p>

              </div>

              {/* ----------------------------------------------
                  Detailed risks
              ---------------------------------------------- */}

              <section className="roast-detail-section">

                <div className="roast-section-heading">

                  <div>
                    <h4>
                      Defect-Specific Risk Evidence
                    </h4>

                    <p>
                      Detailed explanation and evidence for each active risk.
                    </p>
                  </div>

                </div>

                {sortedRisks.length > 0 ? (
                  <div className="roast-detail-risk-list">

                    {sortedRisks.map((item, index) => {
                      const drivers = Array.isArray(
                        item.drivers,
                      )
                        ? item.drivers
                        : [];

                      const sourceBasis = Array.isArray(
                        item.source_basis,
                      )
                        ? item.source_basis
                        : [];

                      return (
                        <article
                          className="roast-detail-risk-card"
                          key={`detail-${item.defect || "risk"}-${index}`}
                        >

                          <div className="roast-detail-risk-head">

                            <div
                              className={`roast-main-risk-icon ${normalizeClass(
                                item.risk_level,
                              )}`}
                            >
                              {getRiskIcon(
                                item.risk_level,
                              )}
                            </div>

                            <div>

                              <div className="roast-main-risk-top">

                                {item.defect && (
                                  <span className="roast-risk-chip defect">
                                    {humanize(
                                      item.defect,
                                    )}
                                  </span>
                                )}

                                {item.risk_level && (
                                  <span
                                    className={`roast-risk-chip level ${normalizeClass(
                                      item.risk_level,
                                    )}`}
                                  >
                                    {humanize(
                                      item.risk_level,
                                    )}
                                  </span>
                                )}

                              </div>

                              <h5>
                                {item.risk_name ||
                                  "Roast Quality Risk"}
                              </h5>

                            </div>

                            <div className="roast-detail-risk-score">

                              <span>
                                Score
                              </span>

                              <strong>
                                {Number(
                                  item.risk_score ?? 0,
                                ).toFixed(0)}
                              </strong>

                            </div>

                          </div>

                          <div className="roast-detail-risk-body">

                            <div className="roast-detail-box">

                              <span>
                                Risk Explanation
                              </span>

                              <p>
                                {item.explanation ||
                                  "No risk explanation was provided."}
                              </p>

                            </div>

                            {drivers.length > 0 && (
                              <div className="roast-detail-box">

                                <span>
                                  Risk Drivers
                                </span>

                                <ul>
                                  {drivers.map(
                                    (
                                      driver,
                                      driverIndex,
                                    ) => (
                                      <li
                                        key={
                                          driverIndex
                                        }
                                      >
                                        {driver}
                                      </li>
                                    ),
                                  )}
                                </ul>

                              </div>
                            )}

                            <div className="roast-detail-box">

                              <span>
                                Recommended Control
                              </span>

                              <p>
                                {item.recommended_control ||
                                  "Complete the relevant pre-roast corrective control."}
                              </p>

                            </div>

                          </div>

                          {(item.evidence_class ||
                            sourceBasis.length > 0 ||
                            (item.detected_count !== null &&
                              item.detected_count !== undefined)) && (
                            <div className="roast-detail-footer">

                              {item.evidence_class && (
                                <span className="roast-footer-chip">
                                  Evidence:{" "}
                                  {humanize(
                                    item.evidence_class,
                                  )}
                                </span>
                              )}

                              {sourceBasis.map(
                                (
                                  source,
                                  sourceIndex,
                                ) => (
                                  <span
                                    className="roast-footer-chip"
                                    key={`source-${index}-${sourceIndex}`}
                                  >
                                    {source}
                                  </span>
                                ),
                              )}

                              {item.detected_count !== null &&
                                item.detected_count !== undefined && (
                                  <span className="roast-footer-chip">
                                    Detected:{" "}
                                    {
                                      item.detected_count
                                    }
                                  </span>
                                )}

                            </div>
                          )}

                        </article>
                      );
                    })}

                  </div>
                ) : (
                  <div className="roast-empty">

                    <strong>
                      No detailed risk evidence available
                    </strong>

                    <p>
                      No defect-specific roast-quality risk is currently active.
                    </p>

                  </div>
                )}

              </section>

              {/* ----------------------------------------------
                  Technical assessment
              ---------------------------------------------- */}

              <section className="roast-detail-section">

                <div className="roast-section-heading">

                  <div>
                    <h4>
                      Technical Assessment
                    </h4>

                    <p>
                      Supporting indicators returned by the backend risk module.
                    </p>
                  </div>

                </div>

                <div className="roast-technical-grid">

                  <div className="roast-technical-card">
                    <span>
                      Overall Risk
                    </span>

                    <strong>
                      {humanize(
                        overallRisk,
                      )}
                    </strong>
                  </div>

                  <div className="roast-technical-card">
                    <span>
                      Overall Risk Score
                    </span>

                    <strong>
                      {overallRiskScore.toFixed(
                        0,
                      )}{" "}
                      / 100
                    </strong>
                  </div>

                  <div className="roast-technical-card">
                    <span>
                      Active Risks
                    </span>

                    <strong>
                      {activeRiskCount}
                    </strong>
                  </div>

                  <div className="roast-technical-card">
                    <span>
                      Inspection
                    </span>

                    <strong>
                      {data.inspection_complete ===
                      false
                        ? "Review Required"
                        : "Complete"}
                    </strong>
                  </div>

                  <div className="roast-technical-card">
                    <span>
                      Active Defects
                    </span>

                    <strong>
                      {data.active_defect_count ??
                        0}
                    </strong>
                  </div>

                  <div className="roast-technical-card">
                    <span>
                      Sensor Risk Contribution
                    </span>

                    <strong>
                      {Number(
                        data.sensor_risk_contribution ??
                          0,
                      ).toFixed(0)}{" "}
                      / 100
                    </strong>
                  </div>

                  <div className="roast-technical-card">
                    <span>
                      Sensor Mode
                    </span>

                    <strong>
                      {humanize(
                        data.sensor_status ||
                          "DEFECT_DRIVEN",
                      )}
                    </strong>
                  </div>

                  <div className="roast-technical-card">
                    <span>
                      Broken Property
                    </span>

                    <strong>
                      {Number(
                        data.broken_percentage ??
                          0,
                      ).toFixed(2)}
                      %
                    </strong>
                  </div>

                  <div className="roast-technical-card">
                    <span>
                      Severe / Black Property
                    </span>

                    <strong>
                      {Number(
                        data.severe_defect_percentage ??
                          0,
                      ).toFixed(2)}
                      %
                    </strong>
                  </div>

                  <div className="roast-technical-card">
                    <span>
                      Unknown
                    </span>

                    <strong>
                      {Number(
                        data.unknown_percentage ??
                          0,
                      ).toFixed(2)}
                      %
                    </strong>
                  </div>

                </div>

              </section>

              {/* ----------------------------------------------
                  Methodology
              ---------------------------------------------- */}

              {data.methodology_note && (
                <section className="roast-detail-section">

                  <div className="roast-methodology-card">

                    <strong>
                      Methodology Transparency
                    </strong>

                    <p>
                      {data.methodology_note}
                    </p>

                  </div>

                </section>
              )}

            </div>
          )}

        </div>
      </div>
    </section>
  );
}

export default RoastRisk;
