function RoastingRecommendation({ data }) {
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

  const triggers = Array.isArray(data.triggers) ? data.triggers : [];
  const reasons = Array.isArray(data.reasons) ? data.reasons : [];
  const prerequisites = Array.isArray(data.prerequisites)
    ? data.prerequisites
    : [];
  const warnings = Array.isArray(data.warnings) ? data.warnings : [];

  const readinessStatus = data.readiness_status || "READY";
  const roastingEligibility =
    data.roasting_eligibility ||
    (readinessStatus === "NOT_READY" ? "NOT_RECOMMENDED" : readinessStatus);

  const readinessRank = {
    NOT_READY: 3,
    CONDITIONAL: 2,
    READY: 1,
  };

  const sortedTriggers = [...triggers].sort(
    (a, b) =>
      (readinessRank[String(b?.readiness || "").toUpperCase()] || 0) -
      (readinessRank[String(a?.readiness || "").toUpperCase()] || 0),
  );

  const getReadinessIcon = (readiness) => {
    const value = String(readiness || "").toUpperCase();

    if (value === "NOT_READY") return "!";
    if (value === "CONDITIONAL") return "◐";
    return "✓";
  };

  return (
    <section className="roasting-readiness-module">
      <style>{`
        .roasting-readiness-module {
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

        .roasting-readiness-module * {
          box-sizing: border-box;
        }

        .roasting-shell {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 24px;
          background:
            radial-gradient(
              circle at top right,
              rgba(154, 106, 69, 0.12),
              transparent 31%
            ),
            linear-gradient(145deg, #fffdf9 0%, #fbf6ee 100%);
          box-shadow: var(--shadow);
        }

        .roasting-hero {
          position: relative;
          padding: 27px;
          overflow: hidden;
          color: #fff;
          background:
            radial-gradient(
              circle at 88% 8%,
              rgba(255,255,255,0.10),
              transparent 27%
            ),
            linear-gradient(
              135deg,
              #2b1d15 0%,
              #4d3020 58%,
              #6a4328 100%
            );
        }

        .roasting-hero::after {
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

        .roasting-hero-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .roasting-kicker {
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

        .roasting-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0b68e;
          box-shadow: 0 0 0 5px rgba(224, 182, 142, 0.12);
        }

        .roasting-title {
          margin: 0;
          max-width: 760px;
          color: #fff8f1;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .roasting-summary {
          position: relative;
          z-index: 1;
          max-width: 850px;
          margin: 13px 0 0;
          color: #eadfd5;
          font-size: 14px;
          line-height: 1.72;
        }

        .roasting-status-group {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex: 0 0 auto;
        }

        .roasting-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 0 13px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .roasting-status.ready {
          color: #d7f8df;
          background: rgba(46, 125, 70, 0.18);
          border-color: rgba(112, 212, 140, 0.26);
        }

        .roasting-status.conditional {
          color: #fff0c7;
          background: rgba(196, 132, 27, 0.19);
          border-color: rgba(239, 190, 90, 0.30);
        }

        .roasting-status.not-ready,
        .roasting-status.not-recommended {
          color: #ffd8d0;
          background: rgba(165, 57, 39, 0.20);
          border-color: rgba(240, 123, 101, 0.30);
        }

        .roasting-direct-badge {
          display: inline-flex;
          align-items: center;
          min-height: 29px;
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

        .roasting-metrics {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 11px;
          margin-top: 22px;
        }

        .roasting-metric {
          min-width: 0;
          padding: 14px 15px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.065);
          backdrop-filter: blur(7px);
        }

        .roasting-metric span {
          display: block;
          color: #cbb8a8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .roasting-metric strong {
          display: block;
          margin-top: 6px;
          overflow-wrap: anywhere;
          color: #fff;
          font-size: 17px;
          line-height: 1.2;
        }

        .roasting-content {
          padding: 24px;
        }

        .roasting-section + .roasting-section {
          margin-top: 25px;
        }

        .roasting-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 13px;
        }

        .roasting-section-heading h4 {
          margin: 0;
          color: #32261f;
          font-size: 17px;
          letter-spacing: -0.015em;
        }

        .roasting-section-heading p {
          margin: 4px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .roasting-count-pill {
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

        .roasting-direction-card {
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
              rgba(255,255,255,0.9)
            );
        }

        .roasting-direction-icon {
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

        .roasting-direction-card span {
          display: block;
          margin-bottom: 5px;
          color: #8c725f;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .roasting-direction-card p {
          margin: 0;
          color: #55483f;
          font-size: 13px;
          line-height: 1.7;
        }

        .roasting-trigger-list {
          display: grid;
          gap: 14px;
        }

        .roasting-trigger {
          overflow: hidden;
          border-radius: 19px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 8px 24px rgba(64, 41, 28, 0.05);
        }

        .roasting-trigger-head {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 13px;
          align-items: center;
          padding: 16px 17px;
          background:
            linear-gradient(
              90deg,
              rgba(250,246,240,0.95),
              rgba(255,255,255,0.92)
            );
          border-bottom: 1px solid rgba(91, 61, 40, 0.10);
        }

        .roasting-trigger-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 13px;
          background: #eee1d2;
          color: #67452e;
          font-size: 15px;
          font-weight: 950;
        }

        .roasting-trigger-icon.not-ready {
          color: #9f392a;
          background: #f9dfd9;
        }

        .roasting-trigger-icon.conditional {
          color: #8a5a16;
          background: #f8ead1;
        }

        .roasting-trigger-icon.ready {
          color: #3d7148;
          background: #e3efe5;
        }

        .roasting-trigger-meta {
          min-width: 0;
        }

        .roasting-trigger-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 5px;
        }

        .roasting-defect-chip,
        .roasting-readiness-chip {
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

        .roasting-defect-chip {
          color: #65452e;
          background: #f3eadf;
        }

        .roasting-readiness-chip {
          color: #5e5148;
          background: #eeeae6;
        }

        .roasting-readiness-chip.not-ready {
          color: #9c3527;
          background: #fee4df;
        }

        .roasting-readiness-chip.conditional {
          color: #8a5a16;
          background: #fff0d6;
        }

        .roasting-readiness-chip.ready {
          color: #357142;
          background: #e8f3e9;
        }

        .roasting-trigger h5 {
          margin: 0;
          color: #34271f;
          font-size: 15px;
          line-height: 1.35;
        }

        .roasting-detected-count {
          min-width: 70px;
          padding: 8px 10px;
          border-radius: 13px;
          text-align: center;
          color: #5d4432;
          background: #f4eadf;
          border: 1px solid #ead9c7;
        }

        .roasting-detected-count span {
          display: block;
          color: #9a806b;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .roasting-detected-count strong {
          display: block;
          margin-top: 2px;
          font-size: 18px;
        }

        .roasting-trigger-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 13px;
          padding: 16px 17px;
        }

        .roasting-trigger-block {
          padding: 13px 14px;
          border-radius: 14px;
        }

        .roasting-trigger-block.reason {
          background: #f7f7f5;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .roasting-trigger-block.action {
          background: #f8f1e7;
          border: 1px solid rgba(122, 81, 50, 0.10);
        }

        .roasting-trigger-block span {
          display: block;
          margin-bottom: 5px;
          color: #8b7768;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .roasting-trigger-block p {
          margin: 0;
          color: #51463f;
          font-size: 12px;
          line-height: 1.65;
        }

        .roasting-trigger-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          align-items: center;
          padding: 10px 17px;
          border-top: 1px solid var(--line);
          background: rgba(250,247,242,0.72);
        }

        .roasting-evidence {
          padding: 5px 8px;
          border-radius: 8px;
          background: #e9e2db;
          color: #5d5148;
          font-size: 9px;
          font-weight: 900;
        }

        .roasting-info-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .roasting-info-card {
          padding: 15px;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.70);
        }

        .roasting-info-card span {
          display: block;
          color: #8a7566;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .roasting-info-card strong {
          display: block;
          margin-top: 5px;
          color: #46362d;
          font-size: 17px;
        }

        .roasting-lists {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .roasting-list-card {
          min-width: 0;
          padding: 15px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: rgba(255,255,255,0.68);
        }

        .roasting-list-card h5 {
          margin: 0 0 9px;
          color: #4f3a2c;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .roasting-list-card ul {
          margin: 0;
          padding-left: 18px;
        }

        .roasting-list-card li {
          margin: 6px 0;
          color: #67584f;
          font-size: 11px;
          line-height: 1.55;
        }

        .roasting-list-empty {
          margin: 0;
          color: #968578;
          font-size: 11px;
        }

        .roasting-empty {
          padding: 22px;
          border: 1px dashed rgba(91, 61, 40, 0.22);
          border-radius: 17px;
          background: rgba(255,255,255,0.52);
          text-align: center;
        }

        .roasting-empty strong {
          display: block;
          color: #3f583f;
          font-size: 14px;
        }

        .roasting-empty p {
          margin: 5px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .roasting-methodology {
          padding: 15px 16px;
          border-left: 4px solid #8b6345;
          border-radius: 0 14px 14px 0;
          background: #f3eadf;
        }

        .roasting-methodology strong {
          display: block;
          margin-bottom: 5px;
          color: #5c3d29;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .roasting-methodology p {
          margin: 0;
          color: #6f5e52;
          font-size: 11px;
          line-height: 1.67;
        }

        @media (max-width: 980px) {
          .roasting-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .roasting-trigger-body,
          .roasting-lists {
            grid-template-columns: 1fr;
          }

          .roasting-info-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .roasting-hero,
          .roasting-content {
            padding: 18px;
          }

          .roasting-hero-top {
            flex-direction: column;
          }

          .roasting-status-group {
            align-items: flex-start;
          }

          .roasting-metrics,
          .roasting-info-grid {
            grid-template-columns: 1fr;
          }

          .roasting-trigger-head {
            grid-template-columns: auto 1fr;
          }

          .roasting-detected-count {
            grid-column: 1 / -1;
            text-align: left;
          }

          .roasting-detected-count span,
          .roasting-detected-count strong {
            display: inline;
          }

          .roasting-detected-count strong {
            margin-left: 7px;
          }
        }
      `}</style>

      <div className="roasting-shell">
        <header className="roasting-hero">
          <div className="roasting-hero-top">
            <div>
              <div className="roasting-kicker">
                <span className="roasting-kicker-dot" />
                Module 1 · Pre-Roast Processing Intelligence
              </div>

              <h3 className="roasting-title">
                {data.title || "Roasting Readiness Recommendation"}
              </h3>
            </div>

            <div className="roasting-status-group">
              <span
                className={`roasting-status ${normalizeClass(readinessStatus)}`}
              >
                {humanize(readinessStatus)}
              </span>

              <span className="roasting-direct-badge">
                Direct Roasting:{" "}
                {data.direct_roasting_allowed ? "Allowed" : "Not Allowed"}
              </span>
            </div>
          </div>

          <p className="roasting-summary">
            {data.summary ||
              "Defect-driven roasting readiness guidance is available for this batch."}
          </p>

          <div className="roasting-metrics">
            <div className="roasting-metric">
              <span>Readiness</span>
              <strong>{humanize(readinessStatus)}</strong>
            </div>

            <div className="roasting-metric">
              <span>Eligibility</span>
              <strong>{humanize(roastingEligibility)}</strong>
            </div>

            <div className="roasting-metric">
              <span>Active Defects</span>
              <strong>{data.active_defect_count ?? triggers.length}</strong>
            </div>

            <div className="roasting-metric">
              <span>Inspection</span>
              <strong>
                {data.inspection_complete === false ? "Review" : "Complete"}
              </strong>
            </div>
          </div>
        </header>

        <div className="roasting-content">
          <div className="roasting-section">
            <div className="roasting-section-heading">
              <div>
                <h4>Recommended Roast Direction</h4>
                <p>
                  High-level processing direction without inventing a roast
                  curve.
                </p>
              </div>
            </div>

            <div className="roasting-direction-card">
              <div className="roasting-direction-icon">→</div>

              <div>
                <span>Recommended Direction</span>
                <p>
                  {data.recommended_direction ||
                    "Continue standard pre-roast quality controls before roasting."}
                </p>
              </div>
            </div>
          </div>

          <div className="roasting-section">
            <div className="roasting-section-heading">
              <div>
                <h4>Defect-Specific Readiness Triggers</h4>
                <p>
                  Each detected sensor or physical defect independently
                  contributes its own readiness decision.
                </p>
              </div>

              <span className="roasting-count-pill">
                {sortedTriggers.length} trigger
                {sortedTriggers.length === 1 ? "" : "s"}
              </span>
            </div>

            {sortedTriggers.length > 0 ? (
              <div className="roasting-trigger-list">
                {sortedTriggers.map((item, index) => (
                  <article
                    className="roasting-trigger"
                    key={`${item.defect || "trigger"}-${index}`}
                  >
                    <div className="roasting-trigger-head">
                      <div
                        className={`roasting-trigger-icon ${normalizeClass(
                          item.readiness,
                        )}`}
                      >
                        {getReadinessIcon(item.readiness)}
                      </div>

                      <div className="roasting-trigger-meta">
                        <div className="roasting-trigger-tags">
                          <span className="roasting-defect-chip">
                            {humanize(item.defect)}
                          </span>

                          <span
                            className={`roasting-readiness-chip ${normalizeClass(
                              item.readiness,
                            )}`}
                          >
                            {humanize(item.readiness)}
                          </span>
                        </div>

                        <h5>{item.title || "Roasting Readiness Trigger"}</h5>
                      </div>

                      {item.detected_count !== null &&
                        item.detected_count !== undefined && (
                          <div className="roasting-detected-count">
                            <span>Detected</span>
                            <strong>{item.detected_count}</strong>
                          </div>
                        )}
                    </div>

                    <div className="roasting-trigger-body">
                      <div className="roasting-trigger-block reason">
                        <span>Reason</span>
                        <p>{item.reason || "No reason provided."}</p>
                      </div>

                      <div className="roasting-trigger-block action">
                        <span>Required Action</span>
                        <p>
                          {item.required_action ||
                            "Complete the recommended quality-control action."}
                        </p>
                      </div>
                    </div>

                    <div className="roasting-trigger-footer">
                      {item.evidence_class && (
                        <span className="roasting-evidence">
                          {humanize(item.evidence_class)}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="roasting-empty">
                <strong>
                  No defect-specific roasting restriction triggered
                </strong>
                <p>
                  Continue normal pre-roast verification and standard roasting
                  quality controls.
                </p>
              </div>
            )}
          </div>

          <div className="roasting-section">
            <div className="roasting-section-heading">
              <div>
                <h4>Physical Defect Indicators</h4>
                <p>
                  Compatibility percentages are displayed for transparency and
                  should not be added together because normalized defect
                  properties can overlap.
                </p>
              </div>
            </div>

            <div className="roasting-info-grid">
              <div className="roasting-info-card">
                <span>Broken Property</span>
                <strong>
                  {Number(data.broken_percentage ?? 0).toFixed(2)}%
                </strong>
              </div>

              <div className="roasting-info-card">
                <span>Severe / Black Property</span>
                <strong>
                  {Number(data.severe_defect_percentage ?? 0).toFixed(2)}%
                </strong>
              </div>

              <div className="roasting-info-card">
                <span>Unknown</span>
                <strong>
                  {Number(data.unknown_percentage ?? 0).toFixed(2)}%
                </strong>
              </div>
            </div>
          </div>

          <div className="roasting-section">
            <div className="roasting-section-heading">
              <div>
                <h4>Decision Support Details</h4>
                <p>
                  Supporting reasons, prerequisites and warnings returned by the
                  backend.
                </p>
              </div>
            </div>

            <div className="roasting-lists">
              <div className="roasting-list-card">
                <h5>Reasons</h5>

                {reasons.length > 0 ? (
                  <ul>
                    {reasons.map((item, index) => (
                      <li key={`reason-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="roasting-list-empty">No additional reasons.</p>
                )}
              </div>

              <div className="roasting-list-card">
                <h5>Prerequisites</h5>

                {prerequisites.length > 0 ? (
                  <ul>
                    {prerequisites.map((item, index) => (
                      <li key={`prerequisite-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="roasting-list-empty">
                    No additional prerequisites.
                  </p>
                )}
              </div>

              <div className="roasting-list-card">
                <h5>Warnings</h5>

                {warnings.length > 0 ? (
                  <ul>
                    {warnings.map((item, index) => (
                      <li key={`warning-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="roasting-list-empty">No additional warnings.</p>
                )}
              </div>
            </div>
          </div>

          {data.methodology_note && (
            <div className="roasting-section">
              <div className="roasting-methodology">
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

export default RoastingRecommendation;
