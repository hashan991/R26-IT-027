import { useState } from "react";

function StorageHandling({ data }) {
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

  const recommendations = Array.isArray(data.recommendations)
    ? data.recommendations
    : [];

  const controlFlags = [
    {
      key: "requires_isolation",
      label: "Isolation",
      short: "ISO",
      active: Boolean(data.requires_isolation),
    },
    {
      key: "requires_dry_storage",
      label: "Dry Storage",
      short: "DRY",
      active: Boolean(data.requires_dry_storage),
    },
    {
      key: "requires_environment_stabilization",
      label: "Environment Stabilization",
      short: "ENV",
      active: Boolean(data.requires_environment_stabilization),
    },
    {
      key: "requires_retest",
      label: "Retest",
      short: "TEST",
      active: Boolean(data.requires_retest),
    },
    {
      key: "requires_gentle_handling",
      label: "Gentle Handling",
      short: "CARE",
      active: Boolean(data.requires_gentle_handling),
    },
    {
      key: "requires_reject_segregation",
      label: "Reject Segregation",
      short: "SEP",
      active: Boolean(data.requires_reject_segregation),
    },
  ];

  const activeControls = controlFlags.filter((item) => item.active);

  const priorityRank = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const sortedRecommendations = [...recommendations].sort(
    (a, b) =>
      (priorityRank[String(b?.priority || "").toUpperCase()] || 0) -
      (priorityRank[String(a?.priority || "").toUpperCase()] || 0),
  );

  const overallStatus = data.overall_status || "UNKNOWN";

  const recommendationCount =
    data.total_recommendations ?? sortedRecommendations.length;

  // -------------------------------------------------------
  // Simple meaning for user-facing summary
  // -------------------------------------------------------

  const getStatusMeaning = () => {
    const value = String(overallStatus || "").toUpperCase();

    if (value === "HOLD_AND_PROTECT" || value === "INSPECTION_REQUIRED") {
      return "Do not continue with normal storage yet. Protect the batch and complete the required controls before release.";
    }

    if (value === "ACTION_REQUIRED") {
      return "Storage or handling action is required before the batch continues to normal storage.";
    }

    if (value === "NORMAL_STORAGE") {
      return "The batch can continue with normal clean, dry and protected storage practices.";
    }

    return "Review the storage and handling recommendations below before deciding the next action for this batch.";
  };

  return (
    <section className="storage-handling-module">
      <style>{`
        .storage-handling-module {
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

        .storage-handling-module * {
          box-sizing: border-box;
        }

        /* --------------------------------------------------
           MAIN CONTAINER
        -------------------------------------------------- */

        .storage-shell {
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

        .storage-decision {
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
              #2b1d15 0%,
              #4b3020 58%,
              #664126 100%
            );
        }

        .storage-decision-kicker {
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

        .storage-decision-kicker-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #e0b68e;

          box-shadow:
            0 0 0 5px
            rgba(224, 182, 142, 0.12);
        }

        .storage-decision-header {
          display: flex;

          align-items: flex-start;
          justify-content: space-between;

          gap: 22px;
        }

        .storage-decision-heading {
          flex: 1;
        }

        .storage-decision-heading h3 {
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

        .storage-decision-heading p {
          max-width: 820px;

          margin: 12px 0 0;

          color: #eadfd5;

          font-size: 14px;

          line-height: 1.68;
        }

        /* --------------------------------------------------
           STATUS
        -------------------------------------------------- */

        .storage-decision-status {
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

          text-align: center;
          text-transform: uppercase;
        }

        .storage-decision-status.normal-storage {
          color: #d7f8df;

          background:
            rgba(46, 125, 70, 0.18);

          border-color:
            rgba(112, 212, 140, 0.28);
        }

        .storage-decision-status.action-required {
          color: #fff0c7;

          background:
            rgba(196, 132, 27, 0.20);

          border-color:
            rgba(239, 190, 90, 0.32);
        }

        .storage-decision-status.hold-and-protect,
        .storage-decision-status.inspection-required {
          color: #ffd8d0;

          background:
            rgba(165, 57, 39, 0.22);

          border-color:
            rgba(240, 123, 101, 0.32);
        }

        /* --------------------------------------------------
           MAIN METRICS
        -------------------------------------------------- */

        .storage-decision-metrics {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 12px;

          margin-top: 24px;
        }

        .storage-decision-metric {
          padding: 15px 16px;

          border:
            1px solid
            rgba(255,255,255,0.11);

          border-radius: 16px;

          background:
            rgba(255,255,255,0.07);

          backdrop-filter: blur(8px);
        }

        .storage-decision-metric span {
          display: block;

          color: #cbb8a8;

          font-size: 9px;
          font-weight: 850;

          letter-spacing: 0.08em;

          text-transform: uppercase;
        }

        .storage-decision-metric strong {
          display: block;

          margin-top: 6px;

          color: #fff;

          font-size: 18px;

          line-height: 1.2;

          overflow-wrap: anywhere;
        }

        /* --------------------------------------------------
           CONTENT
        -------------------------------------------------- */

        .storage-content {
          padding: 25px;
        }

        /* --------------------------------------------------
           SIMPLE MEANING
        -------------------------------------------------- */

        .storage-meaning-card {
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

        .storage-meaning-label {
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

        .storage-meaning-label::before {
          content: "→";

          display: grid;
          place-items: center;

          width: 26px;
          height: 26px;

          border-radius: 8px;

          color: #fff;
          background: #765036;
        }

        .storage-meaning-card h4 {
          margin: 0;

          color: #34271f;

          font-size: 20px;

          line-height: 1.28;
        }

        .storage-meaning-card p {
          max-width: 920px;

          margin: 8px 0 0;

          color: #64574e;

          font-size: 13px;

          line-height: 1.7;
        }

        /* --------------------------------------------------
           SECTION HEADINGS
        -------------------------------------------------- */

        .storage-main-section {
          margin-top: 24px;
        }

        .storage-section-heading {
          display: flex;

          align-items: flex-end;
          justify-content: space-between;

          gap: 14px;

          margin-bottom: 13px;
        }

        .storage-section-heading h4 {
          margin: 0;

          color: #32261f;

          font-size: 17px;
        }

        .storage-section-heading p {
          margin: 4px 0 0;

          color: var(--text-soft);

          font-size: 12px;

          line-height: 1.55;
        }

        .storage-count-pill {
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
           ACTIVE CONTROLS
        -------------------------------------------------- */

        .storage-active-controls {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 10px;
        }

        .storage-active-control {
          display: flex;

          align-items: center;

          gap: 11px;

          min-height: 66px;

          padding: 12px;

          border:
            1px solid
            rgba(122, 81, 50, 0.17);

          border-radius: 15px;

          background: #fff;
        }

        .storage-active-control-code {
          display: grid;

          place-items: center;

          flex: 0 0 40px;

          height: 40px;

          border-radius: 11px;

          color: #573a27;
          background: #eee0d1;

          font-size: 9px;
          font-weight: 900;
        }

        .storage-active-control strong {
          display: block;

          color: #3d3028;

          font-size: 12px;
        }

        .storage-active-control small {
          display: block;

          margin-top: 3px;

          color: #3d7148;

          font-size: 10px;
          font-weight: 800;
        }

        .storage-no-controls {
          padding: 16px;

          border:
            1px solid
            #dbe9dd;

          border-radius: 15px;

          color: #416349;
          background: #f2f8f3;

          font-size: 12px;
          font-weight: 700;
        }

        /* --------------------------------------------------
           MAIN RECOMMENDATION CARDS
        -------------------------------------------------- */

        .storage-main-recommendations {
          display: grid;

          gap: 12px;
        }

        .storage-main-recommendation {
          padding: 17px;

          border:
            1px solid
            var(--line);

          border-radius: 17px;

          background: #fff;

          box-shadow:
            0 7px 20px
            rgba(64, 41, 28, 0.04);
        }

        .storage-main-recommendation-top {
          display: flex;

          flex-wrap: wrap;

          align-items: center;

          gap: 7px;

          margin-bottom: 8px;
        }

        .storage-chip {
          display: inline-flex;

          align-items: center;

          min-height: 24px;

          padding: 0 8px;

          border-radius: 999px;

          font-size: 9px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .storage-chip.defect {
          color: #65452e;
          background: #f3eadf;
        }

        .storage-chip.priority {
          color: #5e5148;
          background: #eeeae6;
        }

        .storage-chip.priority.critical {
          color: #9c3527;
          background: #fee4df;
        }

        .storage-chip.priority.high {
          color: #8a5a16;
          background: #fff0d6;
        }

        .storage-chip.priority.medium {
          color: #72611d;
          background: #f2ecd7;
        }

        .storage-chip.priority.low {
          color: #357142;
          background: #e8f3e9;
        }

        .storage-chip.status {
          color: #66462f;
          background: #eee0d1;
        }

        .storage-main-recommendation h5 {
          margin: 0;

          color: #34271f;

          font-size: 15px;

          line-height: 1.35;
        }

        .storage-main-advice {
          margin-top: 11px;

          padding: 12px 13px;

          border:
            1px solid
            rgba(122, 81, 50, 0.10);

          border-radius: 12px;

          background: #f8f1e7;
        }

        .storage-main-advice span {
          display: block;

          margin-bottom: 5px;

          color: #8b7768;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 0.07em;

          text-transform: uppercase;
        }

        .storage-main-advice p {
          margin: 0;

          color: #51463f;

          font-size: 12px;

          line-height: 1.65;
        }

        /* --------------------------------------------------
           EMPTY STATE
        -------------------------------------------------- */

        .storage-empty {
          padding: 19px;

          border:
            1px dashed
            rgba(91, 61, 40, 0.22);

          border-radius: 15px;

          background: #faf8f4;

          text-align: center;
        }

        .storage-empty strong {
          display: block;

          color: #3f583f;

          font-size: 14px;
        }

        .storage-empty p {
          margin: 5px 0 0;

          color: var(--text-soft);

          font-size: 12px;

          line-height: 1.55;
        }

        /* --------------------------------------------------
           DETAILS BUTTON
        -------------------------------------------------- */

        .storage-details-toggle-wrap {
          display: flex;

          justify-content: center;

          margin-top: 25px;
        }

        .storage-details-toggle {
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

        .storage-details-toggle:hover {
          background: #68452d;

          transform: translateY(-1px);
        }

        /* --------------------------------------------------
           DETAILED ANALYSIS
        -------------------------------------------------- */

        .storage-detailed-analysis {
          margin-top: 28px;

          padding-top: 27px;

          border-top:
            1px solid
            var(--line);
        }

        .storage-details-header {
          margin-bottom: 22px;
        }

        .storage-details-header span {
          display: block;

          color: #8b674c;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.09em;

          text-transform: uppercase;
        }

        .storage-details-header h4 {
          margin: 5px 0 0;

          color: #33271f;

          font-size: 21px;
        }

        .storage-details-header p {
          max-width: 760px;

          margin: 7px 0 0;

          color: var(--text-soft);

          font-size: 12px;

          line-height: 1.65;
        }

        .storage-detail-section + .storage-detail-section {
          margin-top: 26px;
        }

        /* --------------------------------------------------
           ALL CONTROL FLAGS
        -------------------------------------------------- */

        .storage-control-details-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 10px;
        }

        .storage-control-detail {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 12px;

          border:
            1px solid
            var(--line);

          border-radius: 14px;

          background: #fff;
        }

        .storage-control-detail.inactive {
          opacity: 0.55;

          background: #faf8f5;
        }

        .storage-control-detail-code {
          display: grid;

          place-items: center;

          width: 38px;
          height: 38px;

          border-radius: 10px;

          color: #5c3d29;
          background: #eee0d1;

          font-size: 9px;
          font-weight: 900;
        }

        .storage-control-detail strong {
          display: block;

          color: #3d3028;

          font-size: 11px;
        }

        .storage-control-detail small {
          display: block;

          margin-top: 3px;

          color: #7a6d63;

          font-size: 10px;
        }

        /* --------------------------------------------------
           DETAILED RECOMMENDATIONS
        -------------------------------------------------- */

        .storage-detail-list {
          display: grid;

          gap: 14px;
        }

        .storage-detail-card {
          overflow: hidden;

          border:
            1px solid
            var(--line);

          border-radius: 17px;

          background: #fff;
        }

        .storage-detail-head {
          display: flex;

          align-items: flex-start;
          justify-content: space-between;

          gap: 14px;

          padding: 15px 16px;

          background: #fcf8f3;
        }

        .storage-detail-head h5 {
          margin: 6px 0 0;

          color: #34271f;

          font-size: 15px;

          line-height: 1.35;
        }

        .storage-detail-status {
          flex: 0 0 auto;

          padding: 6px 8px;

          border-radius: 999px;

          color: #5e5148;
          background: #ece7e2;

          font-size: 9px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .storage-detail-body {
          display: grid;

          grid-template-columns:
            minmax(0, 1.35fr)
            minmax(0, 1fr);

          gap: 13px;

          padding: 15px 16px;
        }

        .storage-detail-box {
          padding: 13px 14px;

          border-radius: 13px;

          background: #f8f4ef;

          border:
            1px solid
            rgba(91, 61, 40, 0.08);
        }

        .storage-detail-box span {
          display: block;

          margin-bottom: 5px;

          color: #8b7768;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.07em;

          text-transform: uppercase;
        }

        .storage-detail-box p {
          margin: 0;

          color: #51463f;

          font-size: 12px;

          line-height: 1.68;
        }

        .storage-detail-footer {
          display: flex;

          flex-wrap: wrap;

          gap: 7px;

          padding: 10px 16px;

          border-top:
            1px solid
            var(--line);

          background: #faf7f2;
        }

        .storage-footer-chip {
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

        .storage-technical-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 10px;
        }

        .storage-technical-card {
          padding: 14px;

          border:
            1px solid
            var(--line);

          border-radius: 14px;

          background: #fff;
        }

        .storage-technical-card span {
          display: block;

          color: #8a7566;

          font-size: 9px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .storage-technical-card strong {
          display: block;

          margin-top: 6px;

          color: #46362d;

          font-size: 15px;

          line-height: 1.3;
        }

        /* --------------------------------------------------
           METHODOLOGY
        -------------------------------------------------- */

        .storage-methodology-card {
          padding: 15px 16px;

          border-left:
            4px solid
            #8b6345;

          border-radius:
            0 13px 13px 0;

          background: #f3eadf;
        }

        .storage-methodology-card strong {
          display: block;

          margin-bottom: 5px;

          color: #5c3d29;

          font-size: 10px;

          letter-spacing: 0.07em;

          text-transform: uppercase;
        }

        .storage-methodology-card p {
          margin: 0;

          color: #6f5e52;

          font-size: 11px;

          line-height: 1.67;
        }

        /* --------------------------------------------------
           RESPONSIVE
        -------------------------------------------------- */

        @media (max-width: 900px) {
          .storage-decision-header {
            flex-direction: column;
          }

          .storage-active-controls,
          .storage-control-details-grid,
          .storage-decision-metrics,
          .storage-technical-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .storage-detail-body {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .storage-decision,
          .storage-content {
            padding: 18px;
          }

          .storage-active-controls,
          .storage-control-details-grid,
          .storage-decision-metrics,
          .storage-technical-grid {
            grid-template-columns: 1fr;
          }

          .storage-detail-head {
            flex-direction: column;
          }

          .storage-detail-status {
            align-self: flex-start;
          }
        }
      `}</style>

      <div className="storage-shell">

        {/* ==================================================
            MAIN DECISION
        ================================================== */}

        <header className="storage-decision">

          <div className="storage-decision-kicker">
            <span className="storage-decision-kicker-dot" />
            Storage & Handling Decision
          </div>

          <div className="storage-decision-header">

            <div className="storage-decision-heading">

              <h3>
                {data.title || "Storage & Handling Recommendation"}
              </h3>

              <p>
                {data.summary ||
                  "The system has evaluated the current batch and generated the required storage and handling guidance."}
              </p>

            </div>

            <span
              className={`storage-decision-status ${normalizeClass(
                overallStatus,
              )}`}
            >
              {humanize(overallStatus)}
            </span>

          </div>

          <div className="storage-decision-metrics">

            <div className="storage-decision-metric">
              <span>Storage Status</span>

              <strong>
                {humanize(overallStatus)}
              </strong>
            </div>

            <div className="storage-decision-metric">
              <span>Recommendations</span>

              <strong>
                {recommendationCount}
              </strong>
            </div>

            <div className="storage-decision-metric">
              <span>Required Controls</span>

              <strong>
                {activeControls.length}
              </strong>
            </div>

          </div>

        </header>

        <div className="storage-content">

          {/* ==================================================
              SIMPLE MEANING
          ================================================== */}

          <div className="storage-meaning-card">

            <div className="storage-meaning-label">
              What Should I Do With This Batch?
            </div>

            <h4>
              {humanize(overallStatus)}
            </h4>

            <p>
              {getStatusMeaning()}
            </p>

          </div>

          {/* ==================================================
              ACTIVE CONTROLS ONLY
          ================================================== */}

          <section className="storage-main-section">

            <div className="storage-section-heading">

              <div>
                <h4>
                  Required Storage Controls
                </h4>

                <p>
                  Only controls that require attention are shown here.
                </p>
              </div>

              <span className="storage-count-pill">
                {activeControls.length} Active
              </span>

            </div>

            {activeControls.length > 0 ? (
              <div className="storage-active-controls">

                {activeControls.map((item) => (
                  <div
                    className="storage-active-control"
                    key={item.key}
                  >

                    <div className="storage-active-control-code">
                      {item.short}
                    </div>

                    <div>
                      <strong>
                        {item.label}
                      </strong>

                      <small>
                        Required
                      </small>
                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <div className="storage-no-controls">
                No additional storage or handling control is currently required.
              </div>
            )}

          </section>

          {/* ==================================================
              ALL RECOMMENDATIONS ON MAIN SCREEN
          ================================================== */}

          <section className="storage-main-section">

            <div className="storage-section-heading">

              <div>
                <h4>
                  What Should I Do Now?
                </h4>

                <p>
                  All current storage and handling recommendations are shown below.
                </p>
              </div>

              <span className="storage-count-pill">
                {sortedRecommendations.length} Recommendation
                {sortedRecommendations.length === 1 ? "" : "s"}
              </span>

            </div>

            {sortedRecommendations.length > 0 ? (
              <div className="storage-main-recommendations">

                {sortedRecommendations.map((item, index) => (
                  <article
                    className="storage-main-recommendation"
                    key={`${item.defect || "storage"}-${index}`}
                  >

                    <div className="storage-main-recommendation-top">

                      {item.defect && (
                        <span className="storage-chip defect">
                          {humanize(item.defect)}
                        </span>
                      )}

                      {item.priority && (
                        <span
                          className={`storage-chip priority ${normalizeClass(
                            item.priority,
                          )}`}
                        >
                          {humanize(item.priority)} Priority
                        </span>
                      )}

                      {item.status && (
                        <span className="storage-chip status">
                          {humanize(item.status)}
                        </span>
                      )}

                    </div>

                    <h5>
                      {item.title ||
                        "Storage / Handling Recommendation"}
                    </h5>

                    <div className="storage-main-advice">

                      <span>
                        Recommended Action
                      </span>

                      <p>
                        {item.recommendation ||
                          "Continue normal clean, dry and protected green-coffee storage practices."}
                      </p>

                    </div>

                  </article>
                ))}

              </div>
            ) : (
              <div className="storage-empty">

                <strong>
                  No additional storage action triggered
                </strong>

                <p>
                  Continue normal clean, dry and protected green-coffee storage practices.
                </p>

              </div>
            )}

          </section>

          {/* ==================================================
              DETAILS BUTTON
          ================================================== */}

          <div className="storage-details-toggle-wrap">

            <button
              type="button"
              className="storage-details-toggle"
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
            <div className="storage-detailed-analysis">

              <div className="storage-details-header">

                <span>
                  Additional Technical Information
                </span>

                <h4>
                  Detailed Storage & Handling Analysis
                </h4>

                <p>
                  This section provides the supporting reasons, evidence,
                  source basis, complete control status and methodology behind
                  the main storage decision.
                </p>

              </div>

              {/* ----------------------------------------------
                  Complete control status
              ---------------------------------------------- */}

              <section className="storage-detail-section">

                <div className="storage-section-heading">

                  <div>
                    <h4>
                      Complete Control Status
                    </h4>

                    <p>
                      All storage and handling control flags for the current batch.
                    </p>
                  </div>

                </div>

                <div className="storage-control-details-grid">

                  {controlFlags.map((item) => (
                    <div
                      key={item.key}
                      className={`storage-control-detail ${
                        item.active ? "" : "inactive"
                      }`}
                    >

                      <div className="storage-control-detail-code">
                        {item.short}
                      </div>

                      <div>
                        <strong>
                          {item.label}
                        </strong>

                        <small>
                          {item.active
                            ? "Required"
                            : "Not Triggered"}
                        </small>
                      </div>

                    </div>
                  ))}

                </div>

              </section>

              {/* ----------------------------------------------
                  Detailed recommendations
              ---------------------------------------------- */}

              <section className="storage-detail-section">

                <div className="storage-section-heading">

                  <div>
                    <h4>
                      Recommendation Evidence
                    </h4>

                    <p>
                      Detailed reason and supporting evidence for each recommendation.
                    </p>
                  </div>

                </div>

                {sortedRecommendations.length > 0 ? (
                  <div className="storage-detail-list">

                    {sortedRecommendations.map((item, index) => {
                      const sourceBasis = Array.isArray(item.source_basis)
                        ? item.source_basis
                        : [];

                      return (
                        <article
                          className="storage-detail-card"
                          key={`detail-${item.defect || "storage"}-${index}`}
                        >

                          <div className="storage-detail-head">

                            <div>

                              <div className="storage-main-recommendation-top">

                                {item.defect && (
                                  <span className="storage-chip defect">
                                    {humanize(item.defect)}
                                  </span>
                                )}

                                {item.priority && (
                                  <span
                                    className={`storage-chip priority ${normalizeClass(
                                      item.priority,
                                    )}`}
                                  >
                                    {humanize(item.priority)}
                                  </span>
                                )}

                              </div>

                              <h5>
                                {item.title ||
                                  "Storage / Handling Recommendation"}
                              </h5>

                            </div>

                            {item.status && (
                              <span className="storage-detail-status">
                                {humanize(item.status)}
                              </span>
                            )}

                          </div>

                          <div className="storage-detail-body">

                            <div className="storage-detail-box">

                              <span>
                                Recommended Control
                              </span>

                              <p>
                                {item.recommendation ||
                                  "No recommendation text was provided."}
                              </p>

                            </div>

                            <div className="storage-detail-box">

                              <span>
                                Why This Matters
                              </span>

                              <p>
                                {item.reason ||
                                  "No supporting reason was provided."}
                              </p>

                            </div>

                          </div>

                          {(item.evidence_class ||
                            sourceBasis.length > 0 ||
                            (item.detected_count !== null &&
                              item.detected_count !== undefined)) && (
                            <div className="storage-detail-footer">

                              {item.evidence_class && (
                                <span className="storage-footer-chip">
                                  Evidence:{" "}
                                  {humanize(item.evidence_class)}
                                </span>
                              )}

                              {sourceBasis.map((source, sourceIndex) => (
                                <span
                                  className="storage-footer-chip"
                                  key={`source-${index}-${sourceIndex}`}
                                >
                                  {humanize(source)}
                                </span>
                              ))}

                              {item.detected_count !== null &&
                                item.detected_count !== undefined && (
                                  <span className="storage-footer-chip">
                                    Detected: {item.detected_count}
                                  </span>
                                )}

                            </div>
                          )}

                        </article>
                      );
                    })}

                  </div>
                ) : (
                  <div className="storage-empty">

                    <strong>
                      No detailed recommendation evidence available
                    </strong>

                    <p>
                      No additional storage or handling recommendation is currently active.
                    </p>

                  </div>
                )}

              </section>

              {/* ----------------------------------------------
                  Technical assessment
              ---------------------------------------------- */}

              <section className="storage-detail-section">

                <div className="storage-section-heading">

                  <div>
                    <h4>
                      Technical Assessment
                    </h4>

                    <p>
                      Supporting indicators returned by the backend module.
                    </p>
                  </div>

                </div>

                <div className="storage-technical-grid">

                  <div className="storage-technical-card">
                    <span>
                      Overall Status
                    </span>

                    <strong>
                      {humanize(overallStatus)}
                    </strong>
                  </div>

                  <div className="storage-technical-card">
                    <span>
                      Recommendations
                    </span>

                    <strong>
                      {recommendationCount}
                    </strong>
                  </div>

                  <div className="storage-technical-card">
                    <span>
                      Active Controls
                    </span>

                    <strong>
                      {activeControls.length}
                    </strong>
                  </div>

                  <div className="storage-technical-card">
                    <span>
                      Active Defects
                    </span>

                    <strong>
                      {data.active_defect_count ?? 0}
                    </strong>
                  </div>

                  <div className="storage-technical-card">
                    <span>
                      Inspection
                    </span>

                    <strong>
                      {data.inspection_complete
                        ? "Complete"
                        : "Review Required"}
                    </strong>
                  </div>

                  <div className="storage-technical-card">
                    <span>
                      Isolation
                    </span>

                    <strong>
                      {data.requires_isolation
                        ? "Required"
                        : "Not Required"}
                    </strong>
                  </div>

                  <div className="storage-technical-card">
                    <span>
                      Dry Storage
                    </span>

                    <strong>
                      {data.requires_dry_storage
                        ? "Required"
                        : "Not Required"}
                    </strong>
                  </div>

                  <div className="storage-technical-card">
                    <span>
                      Retest
                    </span>

                    <strong>
                      {data.requires_retest
                        ? "Required"
                        : "Not Required"}
                    </strong>
                  </div>

                  <div className="storage-technical-card">
                    <span>
                      Reject Segregation
                    </span>

                    <strong>
                      {data.requires_reject_segregation
                        ? "Required"
                        : "Not Required"}
                    </strong>
                  </div>

                </div>

              </section>

              {/* ----------------------------------------------
                  Methodology
              ---------------------------------------------- */}

              {data.methodology_note && (
                <section className="storage-detail-section">

                  <div className="storage-methodology-card">

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

export default StorageHandling;
