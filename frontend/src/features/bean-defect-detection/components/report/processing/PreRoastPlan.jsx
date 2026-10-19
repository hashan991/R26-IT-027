import { useState } from "react";

function PreRoastPlan({ data }) {
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
  // Corrective actions
  // -------------------------------------------------------

  const actions = Array.isArray(data.actions) ? data.actions : [];

  const priorityRank = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const sortedActions = [...actions].sort((a, b) => {
    const priorityDifference =
      (priorityRank[String(b?.priority || "").toUpperCase()] || 0) -
      (priorityRank[String(a?.priority || "").toUpperCase()] || 0);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return Number(a?.step_number || 0) - Number(b?.step_number || 0);
  });

  // Required actions shown on the main screen.
  // They remain sorted by priority and then by step number.
  const requiredActions = sortedActions.filter(
    (item) => item.required !== false
  );

  // -------------------------------------------------------
  // Control flags
  // -------------------------------------------------------

  const controlFlags = [
    {
      key: "reinspection_required",
      label: "Reinspection",
      short: "RE",
      active: Boolean(data.reinspection_required),
    },
    {
      key: "sensor_retest_required",
      label: "Sensor Retest",
      short: "SEN",
      active: Boolean(data.sensor_retest_required),
    },
    {
      key: "physical_retest_required",
      label: "Physical Retest",
      short: "PHY",
      active: Boolean(data.physical_retest_required),
    },
    {
      key: "manual_inspection_required",
      label: "Manual Inspection",
      short: "MAN",
      active: Boolean(data.manual_inspection_required),
    },
    {
      key: "severe_defect_removal_required",
      label: "Severe Defect Removal",
      short: "REM",
      active: Boolean(data.severe_defect_removal_required),
    },
    {
      key: "broken_sorting_required",
      label: "Broken Bean Sorting",
      short: "SORT",
      active: Boolean(data.broken_sorting_required),
    },
  ];

  const activeControls = controlFlags.filter((item) => item.active);

  // -------------------------------------------------------
  // Status values
  // -------------------------------------------------------

  const readinessStatus = data.readiness_status || "READY";

  const preparationLevel = data.estimated_preparation_level || "MINIMAL";

  const requiredActionCount = requiredActions.length;

  // -------------------------------------------------------
  // Icons
  // -------------------------------------------------------

  const getActionIcon = (actionType) => {
    const icons = {
      HOLD_AND_VERIFY: "!",
      INSPECT_AND_RETEST: "↻",
      VERIFY_AND_CORRECT_MOISTURE: "≈",
      STABILIZE_ENVIRONMENT: "◒",
      CONTROL_HUMIDITY: "◌",
      SECONDARY_SORT: "⇄",
      REMOVE_AND_SEGREGATE: "×",
    };

    return icons[actionType] || "•";
  };

  return (
    <section className="pre-roast-plan-module">
      <style>{`
        .pre-roast-plan-module {
          --coffee-950: #20150f;
          --coffee-900: #2d1d14;
          --coffee-800: #3d281b;
          --coffee-700: #5a3a25;
          --coffee-600: #7a5132;

          --cream-50: #fffdf9;
          --cream-100: #fbf6ee;
          --cream-200: #f2e7d8;

          --green-50: #edf7ef;
          --green-600: #397349;

          --amber-50: #fff6df;
          --amber-600: #94651b;

          --red-50: #fff0ec;
          --red-600: #a34334;

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

        .pre-roast-plan-module * {
          box-sizing: border-box;
        }

        /* --------------------------------------------------
           MAIN CONTAINER
        -------------------------------------------------- */

        .pre-roast-shell {
          overflow: hidden;

          border:
            1px solid
            var(--line);

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
           TOP DECISION AREA
        -------------------------------------------------- */

        .pre-roast-decision {
          position: relative;

          padding: 28px;

          color: white;

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

        .decision-kicker {
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

        .decision-kicker-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #e0b68e;

          box-shadow:
            0 0 0 5px
            rgba(224, 182, 142, 0.12);
        }

        .decision-header {
          display: flex;

          align-items: flex-start;
          justify-content: space-between;

          gap: 22px;
        }

        .decision-heading {
          flex: 1;
        }

        .decision-heading h3 {
          margin: 0;

          color: #fff8f1;

          font-size:
            clamp(
              25px,
              3vw,
              35px
            );

          line-height: 1.12;

          letter-spacing:
            -0.035em;
        }

        .decision-heading p {
          max-width: 780px;

          margin:
            12px 0 0;

          color: #eadfd5;

          font-size: 14px;

          line-height: 1.68;
        }

        /* --------------------------------------------------
           STATUS BADGE
        -------------------------------------------------- */

        .decision-status {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          min-height: 42px;

          padding:
            0 15px;

          border:
            1px solid
            rgba(255,255,255,0.18);

          border-radius: 999px;

          background:
            rgba(255,255,255,0.08);

          backdrop-filter:
            blur(9px);

          color: white;

          font-size: 11px;
          font-weight: 900;

          letter-spacing: 0.06em;

          text-align: center;
          text-transform: uppercase;
        }

        .decision-status.ready {
          color: #d7f8df;

          background:
            rgba(46, 125, 70, 0.18);

          border-color:
            rgba(112, 212, 140, 0.28);
        }

        .decision-status.ready-after-preparation {
          color: #fff0c7;

          background:
            rgba(196, 132, 27, 0.20);

          border-color:
            rgba(239, 190, 90, 0.32);
        }

        .decision-status.inspection-required {
          color: #ffd8d0;

          background:
            rgba(165, 57, 39, 0.22);

          border-color:
            rgba(240, 123, 101, 0.32);
        }

        /* --------------------------------------------------
           MAIN METRICS
        -------------------------------------------------- */

        .decision-metrics {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 12px;

          margin-top: 24px;
        }

        .decision-metric {
          padding: 15px 16px;

          border:
            1px solid
            rgba(255,255,255,0.11);

          border-radius: 16px;

          background:
            rgba(255,255,255,0.07);

          backdrop-filter:
            blur(8px);
        }

        .decision-metric span {
          display: block;

          color: #cbb8a8;

          font-size: 9px;
          font-weight: 850;

          letter-spacing: 0.08em;

          text-transform: uppercase;
        }

        .decision-metric strong {
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

        .pre-roast-content {
          padding: 25px;
        }

        /* --------------------------------------------------
           PRIMARY ACTION
        -------------------------------------------------- */

        .required-actions-main {
          width: 100%;
        }

        .required-actions-list {
          display: grid;
          gap: 14px;
          margin-top: 12px;
        }

        .main-action-step {
          display: inline-flex;
          align-items: center;
          min-height: 25px;
          margin-bottom: 9px;
          padding: 0 9px;
          border-radius: 999px;
          color: #66462f;
          background: #eee0d1;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .primary-action-card {
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

        .primary-action-label {
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

        .primary-action-label::before {
          content: "→";

          display: grid;
          place-items: center;

          width: 26px;
          height: 26px;

          border-radius: 8px;

          color: white;
          background: #765036;
        }

        .primary-action-card h4 {
          margin: 0;

          color: #34271f;

          font-size: 20px;

          line-height: 1.28;
        }

        .primary-action-card p {
          max-width: 900px;

          margin:
            8px 0 0;

          color: #64574e;

          font-size: 13px;

          line-height: 1.7;
        }

        .primary-action-meta {
          display: flex;

          flex-wrap: wrap;

          gap: 7px;

          margin-top: 13px;
        }

        .primary-chip {
          display: inline-flex;

          align-items: center;

          min-height: 27px;

          padding:
            0 9px;

          border-radius: 999px;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.05em;

          text-transform: uppercase;
        }

        .primary-chip.priority {
          color: #815318;
          background: #f8e8cc;
        }

        .primary-chip.required {
          color: #3c6c46;
          background: #e5f1e6;
        }

        .primary-chip.defect {
          color: #66462f;
          background: #eee2d4;
        }

        /* --------------------------------------------------
           ACTIVE CONTROLS
        -------------------------------------------------- */

        .active-controls-section {
          margin-top: 23px;
        }

        .section-title-row {
          display: flex;

          align-items: flex-end;
          justify-content: space-between;

          gap: 15px;

          margin-bottom: 12px;
        }

        .section-title-row h4 {
          margin: 0;

          color: #352920;

          font-size: 17px;
        }

        .section-title-row p {
          margin:
            4px 0 0;

          color: var(--text-soft);

          font-size: 12px;

          line-height: 1.55;
        }

        .section-count {
          flex: 0 0 auto;

          padding:
            6px 10px;

          border-radius: 999px;

          color: #5d402d;
          background: #f2e7d8;

          font-size: 10px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .active-controls-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 10px;
        }

        .active-control-card {
          display: flex;

          align-items: center;

          gap: 11px;

          min-height: 66px;

          padding: 12px;

          border:
            1px solid
            rgba(122, 81, 50, 0.17);

          border-radius: 15px;

          background: white;
        }

        .active-control-code {
          display: grid;

          place-items: center;

          flex:
            0 0 40px;

          height: 40px;

          border-radius: 11px;

          color: #573a27;
          background: #eee0d1;

          font-size: 9px;
          font-weight: 900;
        }

        .active-control-card strong {
          display: block;

          color: #3d3028;

          font-size: 12px;
        }

        .active-control-card small {
          display: block;

          margin-top: 3px;

          color: #3d7148;

          font-size: 10px;
          font-weight: 800;
        }

        .no-controls-card {
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
           DETAILS BUTTON
        -------------------------------------------------- */

        .details-toggle-wrap {
          display: flex;

          justify-content: center;

          margin-top: 25px;
        }

        .details-toggle {
          min-height: 44px;

          padding:
            0 18px;

          border:
            1px solid
            #72513a;

          border-radius: 12px;

          color: white;
          background: #543724;

          cursor: pointer;

          font-size: 12px;
          font-weight: 850;

          transition:
            transform 0.15s ease,
            background 0.15s ease;
        }

        .details-toggle:hover {
          background: #68452d;

          transform:
            translateY(-1px);
        }

        /* --------------------------------------------------
           DETAILED ANALYSIS
        -------------------------------------------------- */

        .detailed-analysis {
          margin-top: 28px;

          padding-top: 27px;

          border-top:
            1px solid
            var(--line);
        }

        .details-header {
          margin-bottom: 22px;
        }

        .details-header span {
          display: block;

          color: #8b674c;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.09em;

          text-transform: uppercase;
        }

        .details-header h4 {
          margin:
            5px 0 0;

          color: #33271f;

          font-size: 21px;
        }

        .details-header p {
          max-width: 750px;

          margin:
            7px 0 0;

          color: var(--text-soft);

          font-size: 12px;

          line-height: 1.65;
        }

        .detail-section + .detail-section {
          margin-top: 26px;
        }

        /* --------------------------------------------------
           ALL CONTROL FLAGS
        -------------------------------------------------- */

        .control-details-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 10px;
        }

        .control-detail-card {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 12px;

          border:
            1px solid
            var(--line);

          border-radius: 14px;

          background: white;
        }

        .control-detail-card.inactive {
          opacity: 0.55;

          background: #faf8f5;
        }

        .control-detail-icon {
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

        .control-detail-card strong {
          display: block;

          color: #3d3028;

          font-size: 11px;
        }

        .control-detail-card small {
          display: block;

          margin-top: 3px;

          color: #7a6d63;

          font-size: 10px;
        }

        /* --------------------------------------------------
           ACTION CARDS
        -------------------------------------------------- */

        .action-list {
          display: grid;

          gap: 13px;
        }

        .action-card {
          overflow: hidden;

          border:
            1px solid
            var(--line);

          border-radius: 17px;

          background: white;

          box-shadow:
            0 7px 20px
            rgba(64, 41, 28, 0.04);
        }

        .action-card-head {
          display: grid;

          grid-template-columns:
            auto minmax(0, 1fr) auto;

          align-items: center;

          gap: 12px;

          padding: 15px 16px;

          background: #fcf8f3;
        }

        .action-icon {
          display: grid;

          place-items: center;

          width: 40px;
          height: 40px;

          border-radius: 12px;

          color: #67452e;
          background: #eee1d2;

          font-weight: 950;
        }

        .action-icon.critical {
          color: #9f392a;
          background: #f9dfd9;
        }

        .action-icon.high {
          color: #8a5a16;
          background: #f8ead1;
        }

        .action-icon.medium {
          color: #71601c;
          background: #f2ecd7;
        }

        .action-icon.low {
          color: #3d7148;
          background: #e3efe5;
        }

        .action-tags {
          display: flex;

          flex-wrap: wrap;

          gap: 6px;

          margin-bottom: 4px;
        }

        .action-tag {
          padding:
            4px 8px;

          border-radius: 999px;

          background: #efe6dc;

          color: #65452e;

          font-size: 8px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .action-tag.required {
          color: #416849;
          background: #e6f1e6;
        }

        .action-tag.critical {
          color: #9c3527;
          background: #fee4df;
        }

        .action-tag.high {
          color: #8a5a16;
          background: #fff0d6;
        }

        .action-tag.medium {
          color: #72611d;
          background: #f2ecd7;
        }

        .action-tag.low {
          color: #357142;
          background: #e8f3e9;
        }

        .action-card h5 {
          margin: 0;

          color: #34271f;

          font-size: 15px;
        }

        .action-step {
          min-width: 65px;

          padding:
            7px 9px;

          border-radius: 11px;

          color: #5d4432;
          background: #f4eadf;

          text-align: center;
        }

        .action-step span {
          display: block;

          color: #9a806b;

          font-size: 8px;
          font-weight: 850;

          text-transform: uppercase;
        }

        .action-step strong {
          display: block;

          margin-top: 2px;

          font-size: 17px;
        }

        .action-card-body {
          padding: 15px 16px;
        }

        .action-card-body p {
          margin: 0;

          color: #51463f;

          font-size: 12px;

          line-height: 1.7;
        }

        .action-card-footer {
          display: flex;

          flex-wrap: wrap;

          gap: 7px;

          padding:
            10px 16px;

          border-top:
            1px solid
            var(--line);

          background: #faf7f2;
        }

        .footer-chip {
          display: inline-flex;

          align-items: center;

          min-height: 25px;

          padding:
            0 8px;

          border-radius: 7px;

          color: #5d5148;
          background: #ebe4dd;

          font-size: 9px;
          font-weight: 850;
        }

        /* --------------------------------------------------
           TECHNICAL SUMMARY
        -------------------------------------------------- */

        .technical-summary-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 10px;
        }

        .technical-summary-card {
          padding: 14px;

          border:
            1px solid
            var(--line);

          border-radius: 14px;

          background: white;
        }

        .technical-summary-card span {
          display: block;

          color: #8a7566;

          font-size: 9px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .technical-summary-card strong {
          display: block;

          margin-top: 6px;

          color: #46362d;

          font-size: 15px;

          line-height: 1.3;
        }

        /* --------------------------------------------------
           METHODOLOGY
        -------------------------------------------------- */

        .methodology-card {
          padding: 15px 16px;

          border-left:
            4px solid
            #8b6345;

          border-radius:
            0 13px 13px 0;

          background: #f3eadf;
        }

        .methodology-card strong {
          display: block;

          margin-bottom: 5px;

          color: #5c3d29;

          font-size: 10px;

          letter-spacing: 0.07em;

          text-transform: uppercase;
        }

        .methodology-card p {
          margin: 0;

          color: #6f5e52;

          font-size: 11px;

          line-height: 1.67;
        }

        /* --------------------------------------------------
           EMPTY STATE
        -------------------------------------------------- */

        .empty-action-card {
          padding: 20px;

          border:
            1px dashed
            rgba(91, 61, 40, 0.22);

          border-radius: 15px;

          background: #faf8f4;

          text-align: center;
        }

        .empty-action-card strong {
          display: block;

          color: #3f583f;

          font-size: 14px;
        }

        .empty-action-card p {
          margin:
            5px 0 0;

          color: var(--text-soft);

          font-size: 12px;
        }

        /* --------------------------------------------------
           RESPONSIVE
        -------------------------------------------------- */

        @media (max-width: 900px) {
          .decision-header {
            flex-direction: column;
          }

          .decision-metrics,
          .active-controls-grid,
          .control-details-grid,
          .technical-summary-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 620px) {
          .pre-roast-decision,
          .pre-roast-content {
            padding: 18px;
          }

          .decision-metrics,
          .active-controls-grid,
          .control-details-grid,
          .technical-summary-grid {
            grid-template-columns: 1fr;
          }

          .action-card-head {
            grid-template-columns:
              auto 1fr;
          }

          .action-step {
            grid-column:
              1 / -1;

            text-align: left;
          }

          .action-step span,
          .action-step strong {
            display: inline;
          }

          .action-step strong {
            margin-left: 6px;
          }
        }
      `}</style>

      <div className="pre-roast-shell">
        {/* ==================================================
            MAIN DECISION
        ================================================== */}

        <header className="pre-roast-decision">
          <div className="decision-kicker">
            <span className="decision-kicker-dot" />
            Pre-Roast Processing Decision
          </div>

          <div className="decision-header">
            <div className="decision-heading">
              <h3>{data.title || "Pre-Roast Corrective Actions"}</h3>

              <p>
                {data.summary ||
                  "The system has evaluated the current batch and generated the required preparation decision before roasting."}
              </p>
            </div>

            <span
              className={`decision-status ${normalizeClass(readinessStatus)}`}
            >
              {humanize(readinessStatus)}
            </span>
          </div>

          {/* Main user-facing metrics */}

          <div className="decision-metrics">
            <div className="decision-metric">
              <span>Current Status</span>

              <strong>{humanize(readinessStatus)}</strong>
            </div>

            <div className="decision-metric">
              <span>Preparation Level</span>

              <strong>{humanize(preparationLevel)}</strong>
            </div>

            <div className="decision-metric">
              <span>Required Actions</span>

              <strong>{requiredActionCount}</strong>
            </div>
          </div>
        </header>

        <div className="pre-roast-content">
          {/* ==================================================
              WHAT SHOULD THE USER DO NOW?
          ================================================== */}

          <div className="required-actions-main">
            <div className="primary-action-label">What Should I Do Now?</div>

            {requiredActions.length > 0 ? (
              <div className="required-actions-list">
                {requiredActions.map((action, index) => (
                  <div
                    className="primary-action-card"
                    key={`${action.defect || "action"}-${
                      action.step_number ?? index
                    }`}
                  >
                    <div className="main-action-step">
                      Step {action.step_number ?? index + 1}
                    </div>

                    <h4>
                      {action.title || "Complete Required Corrective Action"}
                    </h4>

                    <p>
                      {action.description ||
                        "Complete the required corrective action before continuing to the roasting stage."}
                    </p>

                    <div className="primary-action-meta">
                      {action.priority && (
                        <span className="primary-chip priority">
                          {humanize(action.priority)} Priority
                        </span>
                      )}

                      {action.defect && (
                        <span className="primary-chip defect">
                          {humanize(action.defect)}
                        </span>
                      )}

                      <span className="primary-chip required">Required</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="primary-action-card">
                <h4>No Corrective Action Required</h4>

                <p>
                  The current batch can continue through the normal factory
                  pre-roast preparation process.
                </p>
              </div>
            )}
          </div>

          {/* ==================================================
              ONLY ACTIVE CONTROLS
          ================================================== */}

          <section className="active-controls-section">
            <div className="section-title-row">
              <div>
                <h4>Required Controls</h4>

                <p>Only controls that require attention are shown here.</p>
              </div>

              <span className="section-count">
                {activeControls.length} Active
              </span>
            </div>

            {activeControls.length > 0 ? (
              <div className="active-controls-grid">
                {activeControls.map((item) => (
                  <div className="active-control-card" key={item.key}>
                    <div className="active-control-code">{item.short}</div>

                    <div>
                      <strong>{item.label}</strong>

                      <small>Required</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-controls-card">
                No additional corrective controls are currently required.
              </div>
            )}
          </section>

          {/* ==================================================
              DETAILS BUTTON
          ================================================== */}

          <div className="details-toggle-wrap">
            <button
              type="button"
              className="details-toggle"
              aria-expanded={showDetails}
              onClick={() => setShowDetails((current) => !current)}
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
            <div className="detailed-analysis">
              <div className="details-header">
                <span>Additional Technical Information</span>

                <h4>Detailed Pre-Roast Analysis</h4>

                <p>
                  This section provides the supporting corrective actions,
                  control status, evidence and methodology for users who need
                  additional technical detail.
                </p>
              </div>

              {/* ----------------------------------------------
                  All control flags
              ---------------------------------------------- */}

              <section className="detail-section">
                <div className="section-title-row">
                  <div>
                    <h4>Control Status</h4>

                    <p>
                      Complete operational control status for the current batch.
                    </p>
                  </div>
                </div>

                <div className="control-details-grid">
                  {controlFlags.map((item) => (
                    <div
                      key={item.key}
                      className={`control-detail-card ${
                        item.active ? "" : "inactive"
                      }`}
                    >
                      <div className="control-detail-icon">{item.short}</div>

                      <div>
                        <strong>{item.label}</strong>

                        <small>
                          {item.active ? "Required" : "Not Triggered"}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ----------------------------------------------
                  Defect-specific actions
              ---------------------------------------------- */}

              <section className="detail-section">
                <div className="section-title-row">
                  <div>
                    <h4>Defect-Specific Corrective Actions</h4>

                    <p>Actions are ordered by priority and processing step.</p>
                  </div>

                  <span className="section-count">
                    {sortedActions.length} Action
                    {sortedActions.length === 1 ? "" : "s"}
                  </span>
                </div>

                {sortedActions.length > 0 ? (
                  <div className="action-list">
                    {sortedActions.map((item, index) => (
                      <article
                        className="action-card"
                        key={`${item.defect || "action"}-${
                          item.step_number || index
                        }`}
                      >
                        <div className="action-card-head">
                          <div
                            className={`action-icon ${normalizeClass(
                              item.priority,
                            )}`}
                          >
                            {getActionIcon(item.action_type)}
                          </div>

                          <div>
                            <div className="action-tags">
                              {item.defect && (
                                <span className="action-tag">
                                  {humanize(item.defect)}
                                </span>
                              )}

                              {item.priority && (
                                <span
                                  className={`action-tag ${normalizeClass(
                                    item.priority,
                                  )}`}
                                >
                                  {humanize(item.priority)}
                                </span>
                              )}

                              {item.required !== false && (
                                <span className="action-tag required">
                                  Required
                                </span>
                              )}
                            </div>

                            <h5>{item.title || "Corrective Action"}</h5>
                          </div>

                          <div className="action-step">
                            <span>Step</span>

                            <strong>{item.step_number ?? index + 1}</strong>
                          </div>
                        </div>

                        <div className="action-card-body">
                          <p>
                            {item.description ||
                              "Complete the required corrective action before release."}
                          </p>
                        </div>

                        {(item.action_type ||
                          item.evidence_class ||
                          (item.detected_count !== null &&
                            item.detected_count !== undefined)) && (
                          <div className="action-card-footer">
                            {item.action_type && (
                              <span className="footer-chip">
                                Action: {humanize(item.action_type)}
                              </span>
                            )}

                            {item.evidence_class && (
                              <span className="footer-chip">
                                Evidence: {humanize(item.evidence_class)}
                              </span>
                            )}

                            {item.detected_count !== null &&
                              item.detected_count !== undefined && (
                                <span className="footer-chip">
                                  Detected: {item.detected_count}
                                </span>
                              )}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-action-card">
                    <strong>No corrective pre-roast action triggered</strong>

                    <p>
                      Continue normal factory cleaning, inspection and pre-roast
                      quality-control procedures.
                    </p>
                  </div>
                )}
              </section>

              {/* ----------------------------------------------
                  Technical summary
              ---------------------------------------------- */}

              <section className="detail-section">
                <div className="section-title-row">
                  <div>
                    <h4>Technical Assessment</h4>

                    <p>
                      Supporting processing indicators returned by the backend.
                    </p>
                  </div>
                </div>

                <div className="technical-summary-grid">
                  <div className="technical-summary-card">
                    <span>Readiness Status</span>

                    <strong>{humanize(readinessStatus)}</strong>
                  </div>

                  <div className="technical-summary-card">
                    <span>Preparation Level</span>

                    <strong>{humanize(preparationLevel)}</strong>
                  </div>

                  <div className="technical-summary-card">
                    <span>Total Actions</span>

                    <strong>{data.total_actions ?? actions.length}</strong>
                  </div>

                  <div className="technical-summary-card">
                    <span>Active Defects</span>

                    <strong>
                      {data.active_defect_count ?? actions.length}
                    </strong>
                  </div>

                  <div className="technical-summary-card">
                    <span>Inspection</span>

                    <strong>
                      {data.inspection_complete === false
                        ? "Review Required"
                        : "Complete"}
                    </strong>
                  </div>

                  <div className="technical-summary-card">
                    <span>Reinspection</span>

                    <strong>
                      {data.reinspection_required ? "Required" : "Not Required"}
                    </strong>
                  </div>

                  <div className="technical-summary-card">
                    <span>Sensor Retest</span>

                    <strong>
                      {data.sensor_retest_required
                        ? "Required"
                        : "Not Required"}
                    </strong>
                  </div>

                  <div className="technical-summary-card">
                    <span>Physical Retest</span>

                    <strong>
                      {data.physical_retest_required
                        ? "Required"
                        : "Not Required"}
                    </strong>
                  </div>

                  <div className="technical-summary-card">
                    <span>Manual Inspection</span>

                    <strong>
                      {data.manual_inspection_required
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
                <section className="detail-section">
                  <div className="methodology-card">
                    <strong>Methodology Transparency</strong>

                    <p>{data.methodology_note}</p>
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

export default PreRoastPlan;
