function PreRoastPlan({ data }) {
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

  const readinessStatus = data.readiness_status || "READY";

  return (
    <section className="pre-roast-plan-module">
      <style>{`
        .pre-roast-plan-module {
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

        .pre-roast-plan-module * {
          box-sizing: border-box;
        }

        .pre-roast-shell {
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

        .pre-roast-hero {
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

        .pre-roast-hero::after {
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

        .pre-roast-hero-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .pre-roast-kicker {
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

        .pre-roast-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0b68e;
          box-shadow: 0 0 0 5px rgba(224, 182, 142, 0.12);
        }

        .pre-roast-title {
          margin: 0;
          max-width: 760px;
          color: #fff8f1;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .pre-roast-summary {
          position: relative;
          z-index: 1;
          max-width: 850px;
          margin: 13px 0 0;
          color: #eadfd5;
          font-size: 14px;
          line-height: 1.72;
        }

        .pre-roast-status-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex: 0 0 auto;
        }

        .pre-roast-status {
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

        .pre-roast-status.ready {
          color: #d7f8df;
          background: rgba(46, 125, 70, 0.18);
          border-color: rgba(112, 212, 140, 0.26);
        }

        .pre-roast-status.ready-after-preparation {
          color: #fff0c7;
          background: rgba(196, 132, 27, 0.19);
          border-color: rgba(239, 190, 90, 0.30);
        }

        .pre-roast-status.inspection-required {
          color: #ffd8d0;
          background: rgba(165, 57, 39, 0.20);
          border-color: rgba(240, 123, 101, 0.30);
        }

        .pre-roast-level {
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

        .pre-roast-metrics {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 11px;
          margin-top: 22px;
        }

        .pre-roast-metric {
          min-width: 0;
          padding: 14px 15px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.065);
          backdrop-filter: blur(7px);
        }

        .pre-roast-metric span {
          display: block;
          color: #cbb8a8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pre-roast-metric strong {
          display: block;
          margin-top: 6px;
          overflow-wrap: anywhere;
          color: #fff;
          font-size: 18px;
          line-height: 1.18;
        }

        .pre-roast-content {
          padding: 24px;
        }

        .pre-roast-section + .pre-roast-section {
          margin-top: 25px;
        }

        .pre-roast-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 13px;
        }

        .pre-roast-section-heading h4 {
          margin: 0;
          color: #32261f;
          font-size: 17px;
          letter-spacing: -0.015em;
        }

        .pre-roast-section-heading p {
          margin: 4px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .pre-roast-count-pill {
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

        .pre-roast-controls {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .pre-roast-control {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 68px;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: rgba(255,255,255,0.64);
        }

        .pre-roast-control.active {
          border-color: rgba(122, 81, 50, 0.25);
          box-shadow: inset 0 0 0 1px rgba(122, 81, 50, 0.04);
        }

        .pre-roast-control.inactive {
          opacity: 0.47;
          background: rgba(255,255,255,0.34);
        }

        .pre-roast-control-code {
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

        .pre-roast-control strong {
          display: block;
          color: #3d3028;
          font-size: 12px;
        }

        .pre-roast-control small {
          display: block;
          margin-top: 3px;
          color: #7a6d63;
          font-size: 10px;
          font-weight: 700;
        }

        .pre-roast-action-list {
          display: grid;
          gap: 14px;
        }

        .pre-roast-action {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 19px;
          background: rgba(255,255,255,0.78);
          box-shadow: 0 8px 24px rgba(64, 41, 28, 0.05);
        }

        .pre-roast-action-head {
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

        .pre-roast-action-icon {
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

        .pre-roast-action-icon.critical {
          color: #9f392a;
          background: #f9dfd9;
        }

        .pre-roast-action-icon.high {
          color: #8a5a16;
          background: #f8ead1;
        }

        .pre-roast-action-icon.medium {
          color: #71601c;
          background: #f2ecd7;
        }

        .pre-roast-action-icon.low {
          color: #3d7148;
          background: #e3efe5;
        }

        .pre-roast-action-meta {
          min-width: 0;
        }

        .pre-roast-action-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 5px;
        }

        .pre-roast-defect-chip,
        .pre-roast-priority-chip,
        .pre-roast-required-chip {
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

        .pre-roast-defect-chip {
          color: #65452e;
          background: #f3eadf;
        }

        .pre-roast-priority-chip {
          color: #5e5148;
          background: #eeeae6;
        }

        .pre-roast-priority-chip.critical {
          color: #9c3527;
          background: #fee4df;
        }

        .pre-roast-priority-chip.high {
          color: #8a5a16;
          background: #fff0d6;
        }

        .pre-roast-priority-chip.medium {
          color: #72611d;
          background: #f2ecd7;
        }

        .pre-roast-priority-chip.low {
          color: #357142;
          background: #e8f3e9;
        }

        .pre-roast-required-chip {
          color: #4b6849;
          background: #eaf3e8;
        }

        .pre-roast-action h5 {
          margin: 0;
          color: #34271f;
          font-size: 15px;
          line-height: 1.35;
        }

        .pre-roast-step-box {
          min-width: 72px;
          padding: 8px 10px;
          border-radius: 13px;
          text-align: center;
          color: #5d4432;
          background: #f4eadf;
          border: 1px solid #ead9c7;
        }

        .pre-roast-step-box span {
          display: block;
          color: #9a806b;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .pre-roast-step-box strong {
          display: block;
          margin-top: 2px;
          font-size: 18px;
        }

        .pre-roast-action-body {
          padding: 16px 17px;
        }

        .pre-roast-description {
          padding: 14px 15px;
          border-radius: 14px;
          background: #f8f1e7;
          border: 1px solid rgba(122, 81, 50, 0.10);
        }

        .pre-roast-description span {
          display: block;
          margin-bottom: 5px;
          color: #8b7768;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pre-roast-description p {
          margin: 0;
          color: #51463f;
          font-size: 12px;
          line-height: 1.68;
        }

        .pre-roast-action-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
          padding: 10px 17px;
          border-top: 1px solid var(--line);
          background: rgba(250,247,242,0.72);
        }

        .pre-roast-action-type,
        .pre-roast-evidence,
        .pre-roast-detected {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 0 8px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 900;
        }

        .pre-roast-action-type {
          color: #62462f;
          background: #eee2d4;
        }

        .pre-roast-evidence {
          color: #5d5148;
          background: #e9e2db;
        }

        .pre-roast-detected {
          margin-left: auto;
          color: #6c5a4c;
          background: #fff;
          border: 1px solid rgba(76, 56, 42, 0.10);
        }

        .pre-roast-empty {
          padding: 22px;
          border: 1px dashed rgba(91, 61, 40, 0.22);
          border-radius: 17px;
          background: rgba(255,255,255,0.52);
          text-align: center;
        }

        .pre-roast-empty strong {
          display: block;
          color: #3f583f;
          font-size: 14px;
        }

        .pre-roast-empty p {
          margin: 5px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .pre-roast-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
        }

        .pre-roast-summary-card {
          padding: 15px;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.70);
        }

        .pre-roast-summary-card span {
          display: block;
          color: #8a7566;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .pre-roast-summary-card strong {
          display: block;
          margin-top: 6px;
          color: #46362d;
          font-size: 17px;
          line-height: 1.25;
        }

        .pre-roast-methodology {
          padding: 15px 16px;
          border-left: 4px solid #8b6345;
          border-radius: 0 14px 14px 0;
          background: #f3eadf;
        }

        .pre-roast-methodology strong {
          display: block;
          margin-bottom: 5px;
          color: #5c3d29;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .pre-roast-methodology p {
          margin: 0;
          color: #6f5e52;
          font-size: 11px;
          line-height: 1.67;
        }

        @media (max-width: 980px) {
          .pre-roast-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pre-roast-controls {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pre-roast-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .pre-roast-hero,
          .pre-roast-content {
            padding: 18px;
          }

          .pre-roast-hero-top {
            flex-direction: column;
          }

          .pre-roast-status-wrap {
            align-items: flex-start;
          }

          .pre-roast-metrics,
          .pre-roast-controls,
          .pre-roast-summary-grid {
            grid-template-columns: 1fr;
          }

          .pre-roast-action-head {
            grid-template-columns: auto 1fr;
          }

          .pre-roast-step-box {
            grid-column: 1 / -1;
            text-align: left;
          }

          .pre-roast-step-box span,
          .pre-roast-step-box strong {
            display: inline;
          }

          .pre-roast-step-box strong {
            margin-left: 7px;
          }

          .pre-roast-detected {
            width: 100%;
            margin-left: 0;
          }
        }
      `}</style>

      <div className="pre-roast-shell">
        <header className="pre-roast-hero">
          <div className="pre-roast-hero-top">
            <div>
              <div className="pre-roast-kicker">
                <span className="pre-roast-kicker-dot" />
                Module 2 · Pre-Roast Processing Intelligence
              </div>

              <h3 className="pre-roast-title">
                {data.title || "Pre-Roast Corrective Actions"}
              </h3>
            </div>

            <div className="pre-roast-status-wrap">
              <span
                className={`pre-roast-status ${normalizeClass(readinessStatus)}`}
              >
                {humanize(readinessStatus)}
              </span>

              <span className="pre-roast-level">
                Preparation:{" "}
                {humanize(data.estimated_preparation_level || "MINIMAL")}
              </span>
            </div>
          </div>

          <p className="pre-roast-summary">
            {data.summary ||
              "Defect-driven corrective actions are available for the current batch."}
          </p>

          <div className="pre-roast-metrics">
            <div className="pre-roast-metric">
              <span>Total Actions</span>
              <strong>{data.total_actions ?? actions.length}</strong>
            </div>

            <div className="pre-roast-metric">
              <span>Mandatory</span>
              <strong>
                {data.mandatory_actions ??
                  actions.filter((item) => item.required !== false).length}
              </strong>
            </div>

            <div className="pre-roast-metric">
              <span>Active Defects</span>
              <strong>{data.active_defect_count ?? actions.length}</strong>
            </div>

            <div className="pre-roast-metric">
              <span>Inspection</span>
              <strong>
                {data.inspection_complete === false ? "Review" : "Complete"}
              </strong>
            </div>
          </div>
        </header>

        <div className="pre-roast-content">
          <div className="pre-roast-section">
            <div className="pre-roast-section-heading">
              <div>
                <h4>Required Corrective Controls</h4>
                <p>
                  Operational follow-up controls activated by the current defect
                  profile.
                </p>
              </div>

              <span className="pre-roast-count-pill">
                {activeControls.length} active
              </span>
            </div>

            <div className="pre-roast-controls">
              {controlFlags.map((item) => (
                <div
                  className={`pre-roast-control ${
                    item.active ? "active" : "inactive"
                  }`}
                  key={item.key}
                >
                  <div className="pre-roast-control-code">{item.short}</div>

                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.active ? "Required" : "Not triggered"}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pre-roast-section">
            <div className="pre-roast-section-heading">
              <div>
                <h4>Defect-Specific Corrective Actions</h4>
                <p>
                  Each active defect independently produces the action required
                  before the next roasting decision.
                </p>
              </div>

              <span className="pre-roast-count-pill">
                {sortedActions.length} action
                {sortedActions.length === 1 ? "" : "s"}
              </span>
            </div>

            {sortedActions.length > 0 ? (
              <div className="pre-roast-action-list">
                {sortedActions.map((item, index) => (
                  <article
                    className="pre-roast-action"
                    key={`${item.defect || "action"}-${item.step_number || index}`}
                  >
                    <div className="pre-roast-action-head">
                      <div
                        className={`pre-roast-action-icon ${normalizeClass(
                          item.priority,
                        )}`}
                      >
                        {getActionIcon(item.action_type)}
                      </div>

                      <div className="pre-roast-action-meta">
                        <div className="pre-roast-action-tags">
                          <span className="pre-roast-defect-chip">
                            {humanize(item.defect)}
                          </span>

                          <span
                            className={`pre-roast-priority-chip ${normalizeClass(
                              item.priority,
                            )}`}
                          >
                            {item.priority || "N/A"}
                          </span>

                          {item.required !== false && (
                            <span className="pre-roast-required-chip">
                              Required
                            </span>
                          )}
                        </div>

                        <h5>{item.title || "Corrective Action"}</h5>
                      </div>

                      <div className="pre-roast-step-box">
                        <span>Step</span>
                        <strong>{item.step_number ?? index + 1}</strong>
                      </div>
                    </div>

                    <div className="pre-roast-action-body">
                      <div className="pre-roast-description">
                        <span>Corrective Instruction</span>
                        <p>
                          {item.description ||
                            "Complete the required corrective action before release."}
                        </p>
                      </div>
                    </div>

                    <div className="pre-roast-action-footer">
                      {item.action_type && (
                        <span className="pre-roast-action-type">
                          {humanize(item.action_type)}
                        </span>
                      )}

                      {item.evidence_class && (
                        <span className="pre-roast-evidence">
                          {humanize(item.evidence_class)}
                        </span>
                      )}

                      {item.detected_count !== null &&
                        item.detected_count !== undefined && (
                          <span className="pre-roast-detected">
                            Detected count: {item.detected_count}
                          </span>
                        )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="pre-roast-empty">
                <strong>No corrective pre-roast action triggered</strong>
                <p>
                  Continue normal factory cleaning, inspection and pre-roast
                  quality-control procedures.
                </p>
              </div>
            )}
          </div>

          <div className="pre-roast-section">
            <div className="pre-roast-section-heading">
              <div>
                <h4>Preparation Summary</h4>
                <p>
                  Current release state and the main corrective-processing
                  indicators returned by the backend.
                </p>
              </div>
            </div>

            <div className="pre-roast-summary-grid">
              <div className="pre-roast-summary-card">
                <span>Readiness Status</span>
                <strong>{humanize(readinessStatus)}</strong>
              </div>

              <div className="pre-roast-summary-card">
                <span>Preparation Level</span>
                <strong>
                  {humanize(data.estimated_preparation_level || "MINIMAL")}
                </strong>
              </div>

              <div className="pre-roast-summary-card">
                <span>Reinspection</span>
                <strong>
                  {data.reinspection_required ? "Required" : "Not Required"}
                </strong>
              </div>

              <div className="pre-roast-summary-card">
                <span>Sensor Retest</span>
                <strong>
                  {data.sensor_retest_required ? "Required" : "Not Required"}
                </strong>
              </div>

              <div className="pre-roast-summary-card">
                <span>Physical Retest</span>
                <strong>
                  {data.physical_retest_required ? "Required" : "Not Required"}
                </strong>
              </div>

              <div className="pre-roast-summary-card">
                <span>Manual Inspection</span>
                <strong>
                  {data.manual_inspection_required
                    ? "Required"
                    : "Not Required"}
                </strong>
              </div>
            </div>
          </div>

          {data.methodology_note && (
            <div className="pre-roast-section">
              <div className="pre-roast-methodology">
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

export default PreRoastPlan;
