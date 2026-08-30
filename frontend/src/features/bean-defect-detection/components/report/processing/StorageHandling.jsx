function StorageHandling({ data }) {
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

  return (
    <section className="storage-handling-module">
      <style>{`
        .storage-handling-module {
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

        .storage-handling-module * {
          box-sizing: border-box;
        }

        .storage-shell {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 24px;
          background:
            radial-gradient(circle at top right, rgba(154, 106, 69, 0.13), transparent 30%),
            linear-gradient(145deg, #fffdf9 0%, #fbf6ee 100%);
          box-shadow: var(--shadow);
        }

        .storage-hero {
          position: relative;
          padding: 26px;
          background:
            radial-gradient(circle at 88% 10%, rgba(255,255,255,0.10), transparent 26%),
            linear-gradient(135deg, #2b1d15 0%, #4b3020 58%, #664126 100%);
          color: #fff;
        }

        .storage-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 24px 24px;
          mask-image: linear-gradient(to bottom, black, transparent);
        }

        .storage-hero-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .storage-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #dbc4ad;
        }

        .storage-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0b68e;
          box-shadow: 0 0 0 5px rgba(224, 182, 142, 0.12);
        }

        .storage-title {
          margin: 0;
          max-width: 720px;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .storage-summary {
          position: relative;
          z-index: 1;
          max-width: 830px;
          margin: 13px 0 0;
          color: #eadfd5;
          font-size: 14px;
          line-height: 1.72;
        }

        .storage-status {
          position: relative;
          z-index: 1;
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(9px);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .storage-status.normal-storage {
          color: #d7f8df;
          background: rgba(46, 125, 70, 0.18);
          border-color: rgba(112, 212, 140, 0.26);
        }

        .storage-status.action-required {
          color: #fff0c7;
          background: rgba(196, 132, 27, 0.19);
          border-color: rgba(239, 190, 90, 0.30);
        }

        .storage-status.hold-and-protect,
        .storage-status.inspection-required {
          color: #ffd8d0;
          background: rgba(165, 57, 39, 0.20);
          border-color: rgba(240, 123, 101, 0.30);
        }

        .storage-metrics {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 22px;
        }

        .storage-metric {
          padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.065);
          backdrop-filter: blur(7px);
        }

        .storage-metric span {
          display: block;
          color: #cbb8a8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .storage-metric strong {
          display: block;
          margin-top: 5px;
          color: #fff;
          font-size: 20px;
          line-height: 1;
        }

        .storage-content {
          padding: 24px;
        }

        .storage-section + .storage-section {
          margin-top: 25px;
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
          font-size: 17px;
          letter-spacing: -0.015em;
        }

        .storage-section-heading p {
          margin: 4px 0 0;
          color: var(--text-soft);
          font-size: 12px;
        }

        .storage-count-pill {
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

        .storage-controls {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .storage-control {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 68px;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: rgba(255,255,255,0.64);
        }

        .storage-control-code {
          display: grid;
          flex: 0 0 40px;
          height: 40px;
          place-items: center;
          border-radius: 12px;
          background: #eee0d1;
          color: #573a27;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        .storage-control strong {
          display: block;
          font-size: 12px;
        }

        .storage-control small {
          display: block;
          margin-top: 3px;
          color: #7a6d63;
          font-size: 10px;
          font-weight: 700;
        }

        .storage-control.inactive {
          opacity: 0.48;
          background: rgba(255,255,255,0.34);
        }

        .storage-control.active {
          border-color: rgba(122, 81, 50, 0.25);
          box-shadow: inset 0 0 0 1px rgba(122, 81, 50, 0.04);
        }

        .storage-recommendations {
          display: grid;
          gap: 14px;
        }

        .storage-item {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 19px;
          background: rgba(255,255,255,0.76);
          box-shadow: 0 8px 24px rgba(64, 41, 28, 0.05);
        }

        .storage-item-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          padding: 17px 18px 14px;
        }

        .storage-item-kicker {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
          margin-bottom: 7px;
        }

        .storage-defect-chip,
        .storage-priority,
        .storage-item-status {
          display: inline-flex;
          align-items: center;
          min-height: 24px;
          padding: 0 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.055em;
          text-transform: uppercase;
        }

        .storage-defect-chip {
          background: #f3eadf;
          color: #65452e;
        }

        .storage-priority {
          background: #eee;
          color: #555;
        }

        .storage-priority.critical {
          background: #fee4df;
          color: #a13728;
        }

        .storage-priority.high {
          background: #fff0d6;
          color: #9a5f0e;
        }

        .storage-priority.medium {
          background: #f2ecd7;
          color: #72611d;
        }

        .storage-priority.low {
          background: #e8f3e9;
          color: #357142;
        }

        .storage-item h5 {
          margin: 0;
          font-size: 15px;
          line-height: 1.35;
        }

        .storage-item-status {
          align-self: start;
          background: #ece7e2;
          color: #5e5148;
          text-align: center;
        }

        .storage-item-body {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          gap: 14px;
          padding: 0 18px 18px;
        }

        .storage-advice,
        .storage-reason {
          padding: 13px 14px;
          border-radius: 14px;
        }

        .storage-advice {
          background: #f8f1e7;
          border: 1px solid rgba(122, 81, 50, 0.10);
        }

        .storage-reason {
          background: #f7f7f6;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .storage-advice span,
        .storage-reason span {
          display: block;
          margin-bottom: 5px;
          color: #8b7768;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .storage-advice p,
        .storage-reason p {
          margin: 0;
          color: #51463f;
          font-size: 12px;
          line-height: 1.65;
        }

        .storage-item-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          border-top: 1px solid var(--line);
          background: rgba(250,247,242,0.72);
        }

        .storage-evidence {
          padding: 5px 8px;
          border-radius: 8px;
          background: #e9e2db;
          color: #5d5148;
          font-size: 9px;
          font-weight: 900;
        }

        .storage-source {
          padding: 5px 8px;
          border: 1px solid rgba(76, 56, 42, 0.10);
          border-radius: 8px;
          background: #fff;
          color: #72645a;
          font-size: 9px;
          font-weight: 800;
        }

        .storage-detected {
          margin-left: auto;
          color: #6c5a4c;
          font-size: 10px;
          font-weight: 800;
        }

        .storage-empty {
          padding: 22px;
          border: 1px dashed rgba(91, 61, 40, 0.22);
          border-radius: 17px;
          background: rgba(255,255,255,0.52);
          text-align: center;
        }

        .storage-empty strong {
          display: block;
          font-size: 14px;
        }

        .storage-empty p {
          margin: 5px 0 0;
          color: var(--text-soft);
          font-size: 12px;
        }

        .storage-methodology {
          padding: 15px 16px;
          border-left: 4px solid #8b6345;
          border-radius: 0 14px 14px 0;
          background: #f3eadf;
        }

        .storage-methodology strong {
          display: block;
          margin-bottom: 5px;
          color: #5c3d29;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .storage-methodology p {
          margin: 0;
          color: #6f5e52;
          font-size: 11px;
          line-height: 1.65;
        }

        @media (max-width: 900px) {
          .storage-controls {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .storage-item-body {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .storage-hero,
          .storage-content {
            padding: 18px;
          }

          .storage-hero-top {
            flex-direction: column;
          }

          .storage-metrics,
          .storage-controls {
            grid-template-columns: 1fr;
          }

          .storage-status {
            align-self: flex-start;
          }

          .storage-item-head {
            grid-template-columns: 1fr;
          }

          .storage-item-status {
            justify-self: start;
          }

          .storage-detected {
            width: 100%;
            margin-left: 0;
          }
        }
      `}</style>

      <div className="storage-shell">
        <header className="storage-hero">
          <div className="storage-hero-top">
            <div>
              <div className="storage-kicker">
                <span className="storage-kicker-dot" />
                Module 6 · Pre-Roast Processing Intelligence
              </div>

              <h3 className="storage-title">
                {data.title || "Storage & Handling Recommendation"}
              </h3>
            </div>

            <span
              className={`storage-status ${normalizeClass(
                data.overall_status,
              )}`}
            >
              {humanize(data.overall_status || "UNKNOWN")}
            </span>
          </div>

          <p className="storage-summary">
            {data.summary ||
              "Storage and handling guidance is available for the current batch."}
          </p>

          <div className="storage-metrics">
            <div className="storage-metric">
              <span>Recommendations</span>
              <strong>
                {data.total_recommendations ?? recommendations.length}
              </strong>
            </div>

            <div className="storage-metric">
              <span>Active Defects</span>
              <strong>{data.active_defect_count ?? 0}</strong>
            </div>

            <div className="storage-metric">
              <span>Inspection</span>
              <strong>
                {data.inspection_complete ? "Complete" : "Review"}
              </strong>
            </div>
          </div>
        </header>

        <div className="storage-content">
          <div className="storage-section">
            <div className="storage-section-heading">
              <div>
                <h4>Required Storage Controls</h4>
                <p>
                  Operational controls activated by the current defect profile.
                </p>
              </div>

              <span className="storage-count-pill">
                {activeControls.length} active
              </span>
            </div>

            <div className="storage-controls">
              {controlFlags.map((item) => (
                <div
                  className={`storage-control ${
                    item.active ? "active" : "inactive"
                  }`}
                  key={item.key}
                >
                  <div className="storage-control-code">{item.short}</div>

                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.active ? "Required" : "Not triggered"}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="storage-section">
            <div className="storage-section-heading">
              <div>
                <h4>Defect-Specific Recommendations</h4>
                <p>
                  Each detected defect is shown with its storage or handling
                  control.
                </p>
              </div>
            </div>

            {sortedRecommendations.length > 0 ? (
              <div className="storage-recommendations">
                {sortedRecommendations.map((item, index) => (
                  <article
                    className="storage-item"
                    key={`${item.defect || "storage"}-${index}`}
                  >
                    <div className="storage-item-head">
                      <div>
                        <div className="storage-item-kicker">
                          <span className="storage-defect-chip">
                            {humanize(item.defect)}
                          </span>

                          <span
                            className={`storage-priority ${normalizeClass(
                              item.priority,
                            )}`}
                          >
                            {item.priority || "N/A"}
                          </span>
                        </div>

                        <h5>
                          {item.title || "Storage / Handling Recommendation"}
                        </h5>
                      </div>

                      <span className="storage-item-status">
                        {humanize(item.status)}
                      </span>
                    </div>

                    <div className="storage-item-body">
                      <div className="storage-advice">
                        <span>Recommended Control</span>
                        <p>
                          {item.recommendation || "No recommendation text."}
                        </p>
                      </div>

                      <div className="storage-reason">
                        <span>Why This Matters</span>
                        <p>{item.reason || "No reason provided."}</p>
                      </div>
                    </div>

                    <div className="storage-item-footer">
                      {item.evidence_class && (
                        <span className="storage-evidence">
                          {humanize(item.evidence_class)}
                        </span>
                      )}

                      {(Array.isArray(item.source_basis)
                        ? item.source_basis
                        : []
                      ).map((source) => (
                        <span
                          className="storage-source"
                          key={`${item.defect}-${source}`}
                        >
                          {humanize(source)}
                        </span>
                      ))}

                      {item.detected_count !== null &&
                        item.detected_count !== undefined && (
                          <span className="storage-detected">
                            Detected count: {item.detected_count}
                          </span>
                        )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="storage-empty">
                <strong>No additional storage action triggered</strong>
                <p>
                  Continue normal clean, dry and protected green-coffee storage
                  practices.
                </p>
              </div>
            )}
          </div>

          {data.methodology_note && (
            <div className="storage-section">
              <div className="storage-methodology">
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

export default StorageHandling;
