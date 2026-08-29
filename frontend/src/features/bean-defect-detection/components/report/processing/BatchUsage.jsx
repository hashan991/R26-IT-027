function BatchUsage({ data }) {
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

  const recommendations = Array.isArray(data.recommendations)
    ? data.recommendations
    : [];

  const restrictions = Array.isArray(data.restrictions)
    ? data.restrictions
    : [];

  const usageOptions = Array.isArray(data.usage_options)
    ? data.usage_options
    : [];

  const alternativeUses = Array.isArray(data.alternative_uses)
    ? data.alternative_uses
    : [];

  const recommendationRank = {
    INSPECTION_REQUIRED: 7,
    HOLD_FOR_VERIFICATION: 6,
    HOLD_AND_STABILIZE: 5,
    CONDITION_AND_REASSESS: 4,
    STABILIZE_AND_REASSESS: 3,
    SORT_AND_USE: 2,
    DIRECT_USE: 1,
  };

  const sortedRecommendations = [...recommendations].sort(
    (a, b) =>
      (recommendationRank[String(b?.recommendation || "").toUpperCase()] || 0) -
      (recommendationRank[String(a?.recommendation || "").toUpperCase()] || 0),
  );

  const controlFlags = [
    {
      key: "direct_use_allowed",
      label: "Direct Use",
      short: "USE",
      active: Boolean(data.direct_use_allowed),
    },
    {
      key: "sorting_required",
      label: "Sorting",
      short: "SORT",
      active: Boolean(data.sorting_required),
    },
    {
      key: "stabilization_required",
      label: "Stabilization",
      short: "STAB",
      active: Boolean(data.stabilization_required),
    },
    {
      key: "conditioning_required",
      label: "Conditioning",
      short: "COND",
      active: Boolean(data.conditioning_required),
    },
    {
      key: "verification_required",
      label: "Verification",
      short: "VER",
      active: Boolean(data.verification_required),
    },
    {
      key: "reinspection_required",
      label: "Reinspection",
      short: "RE",
      active: Boolean(data.reinspection_required),
    },
    {
      key: "rework_required",
      label: "Rework",
      short: "RWK",
      active: Boolean(data.rework_required),
    },
  ];

  const activeControls = controlFlags.filter((item) => item.active);

  const primaryRecommendation = data.primary_recommendation || "DIRECT_USE";

  const getRecommendationIcon = (recommendation) => {
    const icons = {
      SORT_AND_USE: "⇄",
      STABILIZE_AND_REASSESS: "◒",
      CONDITION_AND_REASSESS: "≈",
      HOLD_AND_STABILIZE: "◐",
      HOLD_FOR_VERIFICATION: "!",
      INSPECTION_REQUIRED: "!",
      DIRECT_USE: "✓",
    };

    return icons[recommendation] || "•";
  };

  const getSuitabilityClass = (value) => normalizeClass(value || "CONDITIONAL");

  return (
    <section className="batch-usage-module">
      <style>{`
        .batch-usage-module {
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

        .batch-usage-module * {
          box-sizing: border-box;
        }

        .batch-usage-shell {
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

        .batch-usage-hero {
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

        .batch-usage-hero::after {
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

        .batch-usage-hero-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .batch-usage-kicker {
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

        .batch-usage-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0b68e;
          box-shadow: 0 0 0 5px rgba(224, 182, 142, 0.12);
        }

        .batch-usage-title {
          margin: 0;
          max-width: 760px;
          color: #fff8f1;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .batch-usage-summary {
          position: relative;
          z-index: 1;
          max-width: 850px;
          margin: 13px 0 0;
          color: #eadfd5;
          font-size: 14px;
          line-height: 1.72;
        }

        .batch-usage-status-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex: 0 0 auto;
        }

        .batch-usage-status {
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

        .batch-usage-status.direct-use {
          color: #d7f8df;
          background: rgba(46, 125, 70, 0.18);
          border-color: rgba(112, 212, 140, 0.26);
        }

        .batch-usage-status.sort-and-use {
          color: #edf5d4;
          background: rgba(96, 121, 45, 0.20);
          border-color: rgba(156, 185, 91, 0.26);
        }

        .batch-usage-status.stabilize-and-reassess,
        .batch-usage-status.condition-and-reassess {
          color: #fff0c7;
          background: rgba(196, 132, 27, 0.19);
          border-color: rgba(239, 190, 90, 0.30);
        }

        .batch-usage-status.hold-and-stabilize,
        .batch-usage-status.hold-for-verification,
        .batch-usage-status.inspection-required {
          color: #ffd8d0;
          background: rgba(165, 57, 39, 0.20);
          border-color: rgba(240, 123, 101, 0.30);
        }

        .batch-usage-mode {
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

        .batch-usage-metrics {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 11px;
          margin-top: 22px;
        }

        .batch-usage-metric {
          min-width: 0;
          padding: 14px 15px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.065);
          backdrop-filter: blur(7px);
        }

        .batch-usage-metric span {
          display: block;
          color: #cbb8a8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .batch-usage-metric strong {
          display: block;
          margin-top: 6px;
          overflow-wrap: anywhere;
          color: #fff;
          font-size: 18px;
          line-height: 1.18;
        }

        .batch-usage-content {
          padding: 24px;
        }

        .batch-usage-section + .batch-usage-section {
          margin-top: 25px;
        }

        .batch-usage-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 13px;
        }

        .batch-usage-section-heading h4 {
          margin: 0;
          color: #32261f;
          font-size: 17px;
          letter-spacing: -0.015em;
        }

        .batch-usage-section-heading p {
          margin: 4px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .batch-usage-count-pill {
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

        .batch-usage-use-card {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 14px;
          align-items: flex-start;
          padding: 18px;
          border-radius: 18px;
          border: 1px solid rgba(122, 81, 50, 0.14);
          background:
            linear-gradient(
              135deg,
              rgba(248, 241, 231, 0.95),
              rgba(255,255,255,0.90)
            );
        }

        .batch-usage-use-icon {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: #eadac8;
          color: #68452e;
          font-size: 18px;
          font-weight: 900;
        }

        .batch-usage-use-card span {
          display: block;
          margin-bottom: 5px;
          color: #8c725f;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .batch-usage-use-card p {
          margin: 0;
          color: #55483f;
          font-size: 13px;
          line-height: 1.7;
        }

        .batch-usage-controls {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .batch-usage-control {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 67px;
          padding: 11px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: rgba(255,255,255,0.64);
        }

        .batch-usage-control.active {
          border-color: rgba(122, 81, 50, 0.25);
          box-shadow: inset 0 0 0 1px rgba(122, 81, 50, 0.04);
        }

        .batch-usage-control.inactive {
          opacity: 0.47;
          background: rgba(255,255,255,0.34);
        }

        .batch-usage-control-code {
          display: grid;
          place-items: center;
          flex: 0 0 40px;
          height: 40px;
          border-radius: 12px;
          background: #eee0d1;
          color: #573a27;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.04em;
        }

        .batch-usage-control strong {
          display: block;
          color: #3d3028;
          font-size: 11px;
          line-height: 1.25;
        }

        .batch-usage-control small {
          display: block;
          margin-top: 3px;
          color: #7a6d63;
          font-size: 9px;
          font-weight: 700;
        }

        .batch-usage-recommendations {
          display: grid;
          gap: 14px;
        }

        .batch-usage-item {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 19px;
          background: rgba(255,255,255,0.78);
          box-shadow: 0 8px 24px rgba(64, 41, 28, 0.05);
        }

        .batch-usage-item-head {
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

        .batch-usage-item-icon {
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

        .batch-usage-item-icon.hold-for-verification,
        .batch-usage-item-icon.inspection-required {
          color: #9f392a;
          background: #f9dfd9;
        }

        .batch-usage-item-icon.hold-and-stabilize,
        .batch-usage-item-icon.condition-and-reassess {
          color: #9a5f0e;
          background: #fff0d6;
        }

        .batch-usage-item-icon.stabilize-and-reassess {
          color: #72611d;
          background: #f2ecd7;
        }

        .batch-usage-item-icon.sort-and-use {
          color: #4d6c3f;
          background: #e7f0e3;
        }

        .batch-usage-item-meta {
          min-width: 0;
        }

        .batch-usage-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 5px;
        }

        .batch-usage-defect-chip,
        .batch-usage-recommendation-chip {
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

        .batch-usage-defect-chip {
          color: #65452e;
          background: #f3eadf;
        }

        .batch-usage-recommendation-chip {
          color: #5e5148;
          background: #eeeae6;
        }

        .batch-usage-recommendation-chip.hold-for-verification,
        .batch-usage-recommendation-chip.inspection-required {
          color: #9c3527;
          background: #fee4df;
        }

        .batch-usage-recommendation-chip.hold-and-stabilize,
        .batch-usage-recommendation-chip.condition-and-reassess {
          color: #8a5a16;
          background: #fff0d6;
        }

        .batch-usage-recommendation-chip.stabilize-and-reassess {
          color: #72611d;
          background: #f2ecd7;
        }

        .batch-usage-recommendation-chip.sort-and-use {
          color: #357142;
          background: #e8f3e9;
        }

        .batch-usage-item h5 {
          margin: 0;
          color: #34271f;
          font-size: 15px;
          line-height: 1.35;
        }

        .batch-usage-detected-box {
          min-width: 72px;
          padding: 8px 10px;
          border-radius: 13px;
          text-align: center;
          color: #5d4432;
          background: #f4eadf;
          border: 1px solid #ead9c7;
        }

        .batch-usage-detected-box span {
          display: block;
          color: #9a806b;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .batch-usage-detected-box strong {
          display: block;
          margin-top: 2px;
          font-size: 18px;
        }

        .batch-usage-item-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 13px;
          padding: 16px 17px;
        }

        .batch-usage-explanation,
        .batch-usage-required-action {
          padding: 14px 15px;
          border-radius: 14px;
        }

        .batch-usage-explanation {
          background: #f7f7f5;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .batch-usage-required-action {
          background: #f8f1e7;
          border: 1px solid rgba(122, 81, 50, 0.10);
        }

        .batch-usage-item-body span {
          display: block;
          margin-bottom: 5px;
          color: #8b7768;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .batch-usage-item-body p {
          margin: 0;
          color: #51463f;
          font-size: 12px;
          line-height: 1.68;
        }

        .batch-usage-item-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
          padding: 10px 17px;
          border-top: 1px solid var(--line);
          background: rgba(250,247,242,0.72);
        }

        .batch-usage-evidence {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 0 8px;
          border-radius: 8px;
          color: #5d5148;
          background: #e9e2db;
          font-size: 9px;
          font-weight: 900;
        }

        .batch-usage-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 11px;
        }

        .batch-usage-summary-card {
          padding: 15px;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.70);
        }

        .batch-usage-summary-card span {
          display: block;
          color: #8a7566;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .batch-usage-summary-card strong {
          display: block;
          margin-top: 6px;
          color: #46362d;
          font-size: 17px;
          line-height: 1.25;
        }

        .batch-usage-restrictions {
          display: grid;
          gap: 9px;
        }

        .batch-usage-restriction {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: flex-start;
          padding: 12px 13px;
          border-radius: 14px;
          border: 1px solid #ead8c9;
          background: #fff7ef;
        }

        .batch-usage-restriction-icon {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 9px;
          background: #e6c7aa;
          color: #68452e;
          font-size: 12px;
          font-weight: 900;
        }

        .batch-usage-restriction p {
          margin: 3px 0 0;
          color: #68574c;
          font-size: 11px;
          line-height: 1.6;
        }

        .batch-usage-options {
          display: grid;
          gap: 10px;
        }

        .batch-usage-option {
          padding: 14px;
          border-radius: 15px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.70);
        }

        .batch-usage-option-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .batch-usage-option h5 {
          margin: 0;
          color: #3d3028;
          font-size: 13px;
        }

        .batch-usage-suitability {
          display: inline-flex;
          min-height: 24px;
          align-items: center;
          padding: 0 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .batch-usage-suitability.suitable {
          color: #357142;
          background: #e8f3e9;
        }

        .batch-usage-suitability.conditional {
          color: #8a5a16;
          background: #fff0d6;
        }

        .batch-usage-suitability.not-recommended {
          color: #9c3527;
          background: #fee4df;
        }

        .batch-usage-option p {
          margin: 8px 0 0;
          color: #66584f;
          font-size: 11px;
          line-height: 1.6;
        }

        .batch-usage-option ul {
          margin: 8px 0 0;
          padding-left: 18px;
        }

        .batch-usage-option li {
          margin: 5px 0;
          color: #76675c;
          font-size: 10px;
          line-height: 1.5;
        }

        .batch-usage-empty {
          padding: 22px;
          border: 1px dashed rgba(91, 61, 40, 0.22);
          border-radius: 17px;
          background: rgba(255,255,255,0.52);
          text-align: center;
        }

        .batch-usage-empty strong {
          display: block;
          color: #3f583f;
          font-size: 14px;
        }

        .batch-usage-empty p {
          margin: 5px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .batch-usage-methodology {
          padding: 15px 16px;
          border-left: 4px solid #8b6345;
          border-radius: 0 14px 14px 0;
          background: #f3eadf;
        }

        .batch-usage-methodology strong {
          display: block;
          margin-bottom: 5px;
          color: #5c3d29;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .batch-usage-methodology p {
          margin: 0;
          color: #6f5e52;
          font-size: 11px;
          line-height: 1.67;
        }

        @media (max-width: 1050px) {
          .batch-usage-controls {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .batch-usage-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .batch-usage-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .batch-usage-item-body {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .batch-usage-hero,
          .batch-usage-content {
            padding: 18px;
          }

          .batch-usage-hero-top {
            flex-direction: column;
          }

          .batch-usage-status-wrap {
            align-items: flex-start;
          }

          .batch-usage-metrics,
          .batch-usage-controls,
          .batch-usage-summary-grid {
            grid-template-columns: 1fr;
          }

          .batch-usage-item-head {
            grid-template-columns: auto 1fr;
          }

          .batch-usage-detected-box {
            grid-column: 1 / -1;
            text-align: left;
          }

          .batch-usage-detected-box span,
          .batch-usage-detected-box strong {
            display: inline;
          }

          .batch-usage-detected-box strong {
            margin-left: 7px;
          }
        }
      `}</style>

      <div className="batch-usage-shell">
        <header className="batch-usage-hero">
          <div className="batch-usage-hero-top">
            <div>
              <div className="batch-usage-kicker">
                <span className="batch-usage-kicker-dot" />
                Module 4 · Pre-Roast Processing Intelligence
              </div>

              <h3 className="batch-usage-title">
                {data.title || "Batch Usage Recommendation"}
              </h3>
            </div>

            <div className="batch-usage-status-wrap">
              <span
                className={`batch-usage-status ${normalizeClass(
                  primaryRecommendation,
                )}`}
              >
                {humanize(primaryRecommendation)}
              </span>

              <span className="batch-usage-mode">
                Decision Mode: Defect Driven
              </span>
            </div>
          </div>

          <p className="batch-usage-summary">
            {data.summary ||
              "Defect-driven batch-use guidance is available for this coffee lot."}
          </p>

          <div className="batch-usage-metrics">
            <div className="batch-usage-metric">
              <span>Primary Recommendation</span>
              <strong>{humanize(primaryRecommendation)}</strong>
            </div>

            <div className="batch-usage-metric">
              <span>Active Defects</span>
              <strong>
                {data.active_defect_count ?? recommendations.length}
              </strong>
            </div>

            <div className="batch-usage-metric">
              <span>Inspection</span>
              <strong>
                {data.inspection_complete === false ? "Review" : "Complete"}
              </strong>
            </div>

            <div className="batch-usage-metric">
              <span>Direct Use</span>
              <strong>
                {data.direct_use_allowed ? "Allowed" : "Not Allowed"}
              </strong>
            </div>
          </div>
        </header>

        <div className="batch-usage-content">
          <div className="batch-usage-section">
            <div className="batch-usage-section-heading">
              <div>
                <h4>Recommended Batch Use</h4>
                <p>
                  The overall recommendation is the most restrictive active
                  defect-related condition.
                </p>
              </div>
            </div>

            <div className="batch-usage-use-card">
              <div className="batch-usage-use-icon">
                {getRecommendationIcon(primaryRecommendation)}
              </div>

              <div>
                <span>Recommended Use</span>
                <p>
                  {data.recommended_use ||
                    "Continue normal pre-roast quality controls before assigning the batch to production use."}
                </p>
              </div>
            </div>
          </div>

          <div className="batch-usage-section">
            <div className="batch-usage-section-heading">
              <div>
                <h4>Operational Controls</h4>
                <p>
                  Processing controls activated by the current batch-use
                  recommendation.
                </p>
              </div>

              <span className="batch-usage-count-pill">
                {activeControls.length} active
              </span>
            </div>

            <div className="batch-usage-controls">
              {controlFlags.map((item) => (
                <div
                  className={`batch-usage-control ${
                    item.active ? "active" : "inactive"
                  }`}
                  key={item.key}
                >
                  <div className="batch-usage-control-code">{item.short}</div>

                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.active ? "Active" : "Not triggered"}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="batch-usage-section">
            <div className="batch-usage-section-heading">
              <div>
                <h4>Defect-Specific Usage Recommendations</h4>
                <p>
                  Every active defect keeps its own recommendation and required
                  action.
                </p>
              </div>

              <span className="batch-usage-count-pill">
                {sortedRecommendations.length} recommendation
                {sortedRecommendations.length === 1 ? "" : "s"}
              </span>
            </div>

            {sortedRecommendations.length > 0 ? (
              <div className="batch-usage-recommendations">
                {sortedRecommendations.map((item, index) => (
                  <article
                    className="batch-usage-item"
                    key={`${item.defect || "usage"}-${index}`}
                  >
                    <div className="batch-usage-item-head">
                      <div
                        className={`batch-usage-item-icon ${normalizeClass(
                          item.recommendation,
                        )}`}
                      >
                        {getRecommendationIcon(item.recommendation)}
                      </div>

                      <div className="batch-usage-item-meta">
                        <div className="batch-usage-tags">
                          <span className="batch-usage-defect-chip">
                            {humanize(item.defect)}
                          </span>

                          <span
                            className={`batch-usage-recommendation-chip ${normalizeClass(
                              item.recommendation,
                            )}`}
                          >
                            {humanize(item.recommendation)}
                          </span>
                        </div>

                        <h5>{item.title || "Batch Usage Recommendation"}</h5>
                      </div>

                      {item.detected_count !== null &&
                        item.detected_count !== undefined && (
                          <div className="batch-usage-detected-box">
                            <span>Detected</span>
                            <strong>{item.detected_count}</strong>
                          </div>
                        )}
                    </div>

                    <div className="batch-usage-item-body">
                      <div className="batch-usage-explanation">
                        <span>Why This Recommendation</span>
                        <p>
                          {item.explanation ||
                            "No recommendation explanation was provided."}
                        </p>
                      </div>

                      <div className="batch-usage-required-action">
                        <span>Required Action</span>
                        <p>
                          {item.required_action ||
                            "Complete the relevant quality-control action before normal use."}
                        </p>
                      </div>
                    </div>

                    <div className="batch-usage-item-footer">
                      {item.evidence_class && (
                        <span className="batch-usage-evidence">
                          {humanize(item.evidence_class)}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="batch-usage-empty">
                <strong>No defect-specific usage restriction triggered</strong>
                <p>
                  The batch may continue through normal pre-roast preparation
                  and standard quality controls.
                </p>
              </div>
            )}
          </div>

          <div className="batch-usage-section">
            <div className="batch-usage-section-heading">
              <div>
                <h4>Batch Composition Indicators</h4>
                <p>
                  Physical-property percentages are shown for explainability.
                  Broken and severe defect percentages may overlap.
                </p>
              </div>
            </div>

            <div className="batch-usage-summary-grid">
              <div className="batch-usage-summary-card">
                <span>Good Beans</span>
                <strong>{Number(data.good_percentage ?? 0).toFixed(2)}%</strong>
              </div>

              <div className="batch-usage-summary-card">
                <span>Broken Property</span>
                <strong>
                  {Number(data.broken_percentage ?? 0).toFixed(2)}%
                </strong>
              </div>

              <div className="batch-usage-summary-card">
                <span>Severe / Black Property</span>
                <strong>
                  {Number(data.severe_defect_percentage ?? 0).toFixed(2)}%
                </strong>
              </div>

              <div className="batch-usage-summary-card">
                <span>Unknown</span>
                <strong>
                  {Number(data.unknown_percentage ?? 0).toFixed(2)}%
                </strong>
              </div>

              <div className="batch-usage-summary-card">
                <span>Sensor Mode</span>
                <strong>
                  {humanize(data.sensor_status || "DEFECT_DRIVEN")}
                </strong>
              </div>

              <div className="batch-usage-summary-card">
                <span>Physical Mode</span>
                <strong>
                  {humanize(data.physical_status || "DEFECT_DRIVEN")}
                </strong>
              </div>

              <div className="batch-usage-summary-card">
                <span>Final Grade Input</span>
                <strong>{humanize(data.final_grade || "NOT_USED")}</strong>
              </div>

              <div className="batch-usage-summary-card">
                <span>Blend Evaluation</span>
                <strong>
                  {data.blend_evaluation_required ? "Required" : "Not Used"}
                </strong>
              </div>
            </div>
          </div>

          {restrictions.length > 0 && (
            <div className="batch-usage-section">
              <div className="batch-usage-section-heading">
                <div>
                  <h4>Restrictions Before Release</h4>
                  <p>
                    Conditions that should be satisfied before normal batch use.
                  </p>
                </div>

                <span className="batch-usage-count-pill">
                  {restrictions.length} restriction
                  {restrictions.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="batch-usage-restrictions">
                {restrictions.map((restriction, index) => (
                  <div className="batch-usage-restriction" key={index}>
                    <div className="batch-usage-restriction-icon">!</div>
                    <p>{restriction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(usageOptions.length > 0 || alternativeUses.length > 0) && (
            <div className="batch-usage-section">
              <div className="batch-usage-section-heading">
                <div>
                  <h4>Compatibility Usage Information</h4>
                  <p>
                    Legacy usage fields are shown only when returned by the
                    backend.
                  </p>
                </div>
              </div>

              {usageOptions.length > 0 && (
                <div className="batch-usage-options">
                  {usageOptions.map((option, index) => {
                    const conditions = Array.isArray(option.conditions)
                      ? option.conditions
                      : [];

                    return (
                      <div className="batch-usage-option" key={index}>
                        <div className="batch-usage-option-top">
                          <h5>{option.use_case || "Usage Option"}</h5>

                          <span
                            className={`batch-usage-suitability ${getSuitabilityClass(
                              option.suitability,
                            )}`}
                          >
                            {humanize(option.suitability)}
                          </span>
                        </div>

                        <p>{option.explanation}</p>

                        {conditions.length > 0 && (
                          <ul>
                            {conditions.map((condition, conditionIndex) => (
                              <li key={conditionIndex}>{condition}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {alternativeUses.length > 0 && (
                <div className="batch-usage-restrictions">
                  {alternativeUses.map((item, index) => (
                    <div className="batch-usage-restriction" key={index}>
                      <div className="batch-usage-restriction-icon">→</div>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {data.methodology_note && (
            <div className="batch-usage-section">
              <div className="batch-usage-methodology">
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

export default BatchUsage;
