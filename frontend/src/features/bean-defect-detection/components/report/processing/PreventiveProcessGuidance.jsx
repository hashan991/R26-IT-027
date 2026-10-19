import { useState } from "react";

function PreventiveProcessGuidance({ data }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!data) {
    return null;
  }

  // -------------------------------------------------------
  // Data
  // -------------------------------------------------------

  const guidanceItems = Array.isArray(data.guidance)
    ? data.guidance
    : [];

  const activeDefectCount = Number(data.active_defect_count ?? 0);

  const totalGuidanceItems = Number(
    data.total_guidance_items ?? guidanceItems.length ?? 0,
  );

  const inspectionComplete = data.inspection_complete !== false;

  // -------------------------------------------------------
  // Helpers
  // -------------------------------------------------------

  const formatEnum = (value) =>
    String(value || "")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const getProcessIcon = (processArea) => {
    const icons = {
      STORAGE_ENVIRONMENT_CONTROL: "◈",
      FERMENTATION_CONTROL: "◌",
      STORAGE_CONTAMINATION_CONTROL: "◇",
      DRYING_PROCESS_CONTROL: "☀",
      TEMPERATURE_CONTROL: "◒",
      HUMIDITY_AND_STORAGE_CONTROL: "≈",
      PULPING_AND_HULLING_CONTROL: "⚙",
      HARVEST_AND_POST_HARVEST_CONTROL: "✦",
    };

    return icons[processArea] || "•";
  };

  const getEvidenceLabel = (evidenceClass) => {
    const labels = {
      SENSOR_TECHNICAL_RULE: "Sensor Technical",
      STANDARD_SUPPORTED_RESEARCH_RULE: "Standard-Supported",
      CREDIBLE_SOURCE_DIRECT: "Credible Source Direct",
      STANDARD_DIRECT: "Standard Direct",
    };

    return labels[evidenceClass] || formatEnum(evidenceClass);
  };

  const getMainMeaning = () => {
    if (!inspectionComplete) {
      return "The inspection is incomplete. Review the current batch before using these recommendations for future process improvement.";
    }

    if (guidanceItems.length === 0) {
      return "No defect-specific preventive action is currently required. Continue normal documented quality-control practices.";
    }

    return "Use the recommendations below to reduce the chance of similar defects occurring in future coffee batches.";
  };

  return (
    <section className="preventive-guidance-module">
      <style>{`
        .preventive-guidance-module {
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

        .preventive-guidance-module * {
          box-sizing: border-box;
        }

        /* --------------------------------------------------
           MAIN CONTAINER
        -------------------------------------------------- */

        .preventive-shell {
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

        .preventive-decision {
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

        .preventive-kicker {
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

        .preventive-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0b68e;
          box-shadow:
            0 0 0 5px
            rgba(224, 182, 142, 0.12);
        }

        .preventive-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 22px;
        }

        .preventive-heading {
          flex: 1;
        }

        .preventive-heading h3 {
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

        .preventive-heading p {
          max-width: 830px;
          margin: 12px 0 0;
          color: #eadfd5;
          font-size: 14px;
          line-height: 1.68;
        }

        .preventive-status {
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

        .preventive-status.complete {
          color: #d7f8df;
          background:
            rgba(46, 125, 70, 0.18);
          border-color:
            rgba(112, 212, 140, 0.28);
        }

        .preventive-status.incomplete {
          color: #fff0c7;
          background:
            rgba(196, 132, 27, 0.20);
          border-color:
            rgba(239, 190, 90, 0.32);
        }

        /* --------------------------------------------------
           MAIN METRICS
        -------------------------------------------------- */

        .preventive-metrics {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 12px;
          margin-top: 24px;
        }

        .preventive-metric {
          padding: 15px 16px;
          border:
            1px solid
            rgba(255,255,255,0.11);
          border-radius: 16px;
          background:
            rgba(255,255,255,0.07);
          backdrop-filter: blur(8px);
        }

        .preventive-metric span {
          display: block;
          color: #cbb8a8;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .preventive-metric strong {
          display: block;
          margin-top: 6px;
          color: #fff;
          font-size: 18px;
          line-height: 1.2;
        }

        /* --------------------------------------------------
           CONTENT
        -------------------------------------------------- */

        .preventive-content {
          padding: 25px;
        }

        /* --------------------------------------------------
           SIMPLE MEANING
        -------------------------------------------------- */

        .preventive-meaning-card {
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

        .preventive-meaning-label {
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

        .preventive-meaning-label::before {
          content: "→";
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          color: #fff;
          background: #765036;
        }

        .preventive-meaning-card h4 {
          margin: 0;
          color: #34271f;
          font-size: 20px;
          line-height: 1.28;
        }

        .preventive-meaning-card p {
          max-width: 920px;
          margin: 8px 0 0;
          color: #64574e;
          font-size: 13px;
          line-height: 1.7;
        }

        /* --------------------------------------------------
           SECTION HEADING
        -------------------------------------------------- */

        .preventive-main-section {
          margin-top: 24px;
        }

        .preventive-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 13px;
        }

        .preventive-section-heading h4 {
          margin: 0;
          color: #32261f;
          font-size: 17px;
        }

        .preventive-section-heading p {
          margin: 4px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        .preventive-count-pill {
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
           MAIN GUIDANCE CARDS
        -------------------------------------------------- */

        .preventive-main-list {
          display: grid;
          gap: 12px;
        }

        .preventive-main-card {
          display: grid;
          grid-template-columns:
            auto minmax(0, 1fr);
          gap: 13px;
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: 17px;
          background: #fff;
          box-shadow:
            0 7px 20px
            rgba(64, 41, 28, 0.04);
        }

        .preventive-main-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 13px;
          color: #67452e;
          background: #eee1d2;
          font-size: 18px;
          font-weight: 950;
        }

        .preventive-main-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
        }

        .preventive-chip {
          display: inline-flex;
          align-items: center;
          min-height: 24px;
          padding: 0 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .preventive-chip.process {
          color: #65452e;
          background: #f3eadf;
        }

        .preventive-chip.defect {
          color: #5e5148;
          background: #eeeae6;
        }

        .preventive-chip.future {
          color: #3d7148;
          background: #e8f3e9;
        }

        .preventive-main-card h5 {
          margin: 7px 0 0;
          color: #34271f;
          font-size: 15px;
          line-height: 1.35;
        }

        .preventive-main-guidance,
        .preventive-main-goal {
          margin-top: 11px;
          padding: 12px 13px;
          border-radius: 12px;
        }

        .preventive-main-guidance {
          border:
            1px solid
            rgba(122, 81, 50, 0.10);
          background: #f8f1e7;
        }

        .preventive-main-goal {
          border:
            1px solid
            rgba(80, 110, 75, 0.10);
          background: #f4f7f1;
        }

        .preventive-main-guidance span,
        .preventive-main-goal span {
          display: block;
          margin-bottom: 5px;
          color: #8b7768;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .preventive-main-guidance p,
        .preventive-main-goal p {
          margin: 0;
          color: #51463f;
          font-size: 12px;
          line-height: 1.65;
        }

        /* --------------------------------------------------
           EMPTY STATE
        -------------------------------------------------- */

        .preventive-empty {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 19px;
          border:
            1px solid
            #dbe9dd;
          border-radius: 15px;
          background: #f2f8f3;
        }

        .preventive-empty-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          border-radius: 12px;
          color: #416349;
          background: #dfeeda;
          font-weight: 900;
        }

        .preventive-empty strong {
          display: block;
          color: #3f583f;
          font-size: 14px;
        }

        .preventive-empty p {
          margin: 5px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.55;
        }

        /* --------------------------------------------------
           DETAILS BUTTON
        -------------------------------------------------- */

        .preventive-details-toggle-wrap {
          display: flex;
          justify-content: center;
          margin-top: 25px;
        }

        .preventive-details-toggle {
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

        .preventive-details-toggle:hover {
          background: #68452d;
          transform: translateY(-1px);
        }

        /* --------------------------------------------------
           DETAILED ANALYSIS
        -------------------------------------------------- */

        .preventive-details {
          margin-top: 28px;
          padding-top: 27px;
          border-top:
            1px solid
            var(--line);
        }

        .preventive-details-header {
          margin-bottom: 22px;
        }

        .preventive-details-header span {
          display: block;
          color: #8b674c;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .preventive-details-header h4 {
          margin: 5px 0 0;
          color: #33271f;
          font-size: 21px;
        }

        .preventive-details-header p {
          max-width: 760px;
          margin: 7px 0 0;
          color: var(--text-soft);
          font-size: 12px;
          line-height: 1.65;
        }

        .preventive-detail-section + .preventive-detail-section {
          margin-top: 26px;
        }

        /* --------------------------------------------------
           DETAIL CARDS
        -------------------------------------------------- */

        .preventive-detail-list {
          display: grid;
          gap: 14px;
        }

        .preventive-detail-card {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 17px;
          background: #fff;
        }

        .preventive-detail-head {
          display: grid;
          grid-template-columns:
            auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 15px 16px;
          background: #fcf8f3;
        }

        .preventive-detail-title h5 {
          margin: 6px 0 0;
          color: #34271f;
          font-size: 15px;
          line-height: 1.35;
        }

        .preventive-detected-box {
          min-width: 72px;
          padding: 7px 9px;
          border-radius: 11px;
          color: #5d4432;
          background: #f4eadf;
          text-align: center;
        }

        .preventive-detected-box span {
          display: block;
          color: #9a806b;
          font-size: 8px;
          font-weight: 850;
          text-transform: uppercase;
        }

        .preventive-detected-box strong {
          display: block;
          margin-top: 2px;
          font-size: 17px;
        }

        .preventive-detail-body {
          display: grid;
          grid-template-columns:
            minmax(0, 1.2fr)
            minmax(0, 1fr);
          gap: 13px;
          padding: 15px 16px;
        }

        .preventive-detail-box {
          padding: 13px 14px;
          border-radius: 13px;
          background: #f8f4ef;
          border:
            1px solid
            rgba(91, 61, 40, 0.08);
        }

        .preventive-detail-box span {
          display: block;
          margin-bottom: 5px;
          color: #8b7768;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .preventive-detail-box p {
          margin: 0;
          color: #51463f;
          font-size: 12px;
          line-height: 1.68;
        }

        .preventive-detail-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          padding: 10px 16px;
          border-top:
            1px solid
            var(--line);
          background: #faf7f2;
        }

        .preventive-footer-chip {
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

        .preventive-evidence-list {
          display: grid;
          gap: 8px;
          margin-top: 10px;
        }

        .preventive-evidence-item {
          display: grid;
          grid-template-columns:
            auto 1fr;
          gap: 9px;
          align-items: flex-start;
          padding: 9px 10px;
          border-radius: 10px;
          background: #fff;
          border:
            1px solid
            rgba(91, 61, 40, 0.08);
        }

        .preventive-evidence-dot {
          width: 7px;
          height: 7px;
          margin-top: 6px;
          border-radius: 50%;
          background: #8a6548;
        }

        .preventive-evidence-item p {
          margin: 0;
          color: #716257;
          font-size: 11px;
          line-height: 1.6;
        }

        /* --------------------------------------------------
           TECHNICAL SUMMARY
        -------------------------------------------------- */

        .preventive-technical-grid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 10px;
        }

        .preventive-technical-card {
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: #fff;
        }

        .preventive-technical-card span {
          display: block;
          color: #8a7566;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .preventive-technical-card strong {
          display: block;
          margin-top: 6px;
          color: #46362d;
          font-size: 15px;
          line-height: 1.3;
        }

        /* --------------------------------------------------
           METHODOLOGY
        -------------------------------------------------- */

        .preventive-methodology-card {
          padding: 15px 16px;
          border-left:
            4px solid
            #8b6345;
          border-radius:
            0 13px 13px 0;
          background: #f3eadf;
        }

        .preventive-methodology-card strong {
          display: block;
          margin-bottom: 5px;
          color: #5c3d29;
          font-size: 10px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .preventive-methodology-card p {
          margin: 0;
          color: #6f5e52;
          font-size: 11px;
          line-height: 1.67;
        }

        /* --------------------------------------------------
           RESPONSIVE
        -------------------------------------------------- */

        @media (max-width: 900px) {
          .preventive-header {
            flex-direction: column;
          }

          .preventive-metrics,
          .preventive-technical-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .preventive-detail-body {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .preventive-decision,
          .preventive-content {
            padding: 18px;
          }

          .preventive-metrics,
          .preventive-technical-grid {
            grid-template-columns: 1fr;
          }

          .preventive-detail-head {
            grid-template-columns:
              auto 1fr;
          }

          .preventive-detected-box {
            grid-column: 1 / -1;
            text-align: left;
          }

          .preventive-detected-box span,
          .preventive-detected-box strong {
            display: inline;
          }

          .preventive-detected-box strong {
            margin-left: 6px;
          }
        }
      `}</style>

      <div className="preventive-shell">

        {/* ==================================================
            MAIN DECISION
        ================================================== */}

        <header className="preventive-decision">

          <div className="preventive-kicker">
            <span className="preventive-kicker-dot" />
            Future Process Prevention
          </div>

          <div className="preventive-header">

            <div className="preventive-heading">

              <h3>
                {data.title || "Preventive Process Guidance"}
              </h3>

              <p>
                {data.summary ||
                  "Defect-driven recommendations for reducing recurrence in future coffee batches."}
              </p>

            </div>

            <span
              className={`preventive-status ${
                inspectionComplete
                  ? "complete"
                  : "incomplete"
              }`}
            >
              {inspectionComplete
                ? "Inspection Complete"
                : "Inspection Incomplete"}
            </span>

          </div>

          <div className="preventive-metrics">

            <div className="preventive-metric">
              <span>Guidance Items</span>

              <strong>
                {totalGuidanceItems}
              </strong>
            </div>

            <div className="preventive-metric">
              <span>Active Defects</span>

              <strong>
                {activeDefectCount}
              </strong>
            </div>

            <div className="preventive-metric">
              <span>Guidance Scope</span>

              <strong>
                Future Batches
              </strong>
            </div>

          </div>

        </header>

        <div className="preventive-content">

          {/* ==================================================
              SIMPLE USER-FACING MEANING
          ================================================== */}

          <div className="preventive-meaning-card">

            <div className="preventive-meaning-label">
              What Should We Improve For Future Batches?
            </div>

            <h4>
              Prevent Recurrence of Current Defects
            </h4>

            <p>
              {getMainMeaning()}
            </p>

          </div>

          {/* ==================================================
              ALL GUIDANCE ITEMS ON MAIN SCREEN
          ================================================== */}

          <section className="preventive-main-section">

            <div className="preventive-section-heading">

              <div>
                <h4>
                  Recommended Process Improvements
                </h4>

                <p>
                  All preventive recommendations for future coffee batches are shown below.
                </p>
              </div>

              <span className="preventive-count-pill">
                {guidanceItems.length} Guidance Item
                {guidanceItems.length === 1 ? "" : "s"}
              </span>

            </div>

            {guidanceItems.length > 0 ? (
              <div className="preventive-main-list">

                {guidanceItems.map((item, index) => (
                  <article
                    className="preventive-main-card"
                    key={`${item.defect || "guidance"}-${index}`}
                  >

                    <div className="preventive-main-icon">
                      {getProcessIcon(item.process_area)}
                    </div>

                    <div>

                      <div className="preventive-main-meta">

                        {item.process_area && (
                          <span className="preventive-chip process">
                            {formatEnum(item.process_area)}
                          </span>
                        )}

                        {item.defect && (
                          <span className="preventive-chip defect">
                            {formatEnum(item.defect)}
                          </span>
                        )}

                        {item.applies_to_future_batches !== false && (
                          <span className="preventive-chip future">
                            Future Batches
                          </span>
                        )}

                      </div>

                      <h5>
                        {item.title || "Preventive Guidance"}
                      </h5>

                      <div className="preventive-main-guidance">

                        <span>
                          Preventive Guidance
                        </span>

                        <p>
                          {item.guidance ||
                            "Continue documented preventive quality-control practices."}
                        </p>

                      </div>

                      {item.prevention_goal && (
                        <div className="preventive-main-goal">

                          <span>
                            Prevention Goal
                          </span>

                          <p>
                            {item.prevention_goal}
                          </p>

                        </div>
                      )}

                    </div>

                  </article>
                ))}

              </div>
            ) : (
              <div className="preventive-empty">

                <div className="preventive-empty-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    No Defect-Specific Preventive Action
                  </strong>

                  <p>
                    No active Processing Intelligence defect currently triggers a preventive process recommendation. Continue normal documented quality controls.
                  </p>
                </div>

              </div>
            )}

          </section>

          {/* ==================================================
              DETAILS BUTTON
          ================================================== */}

          <div className="preventive-details-toggle-wrap">

            <button
              type="button"
              className="preventive-details-toggle"
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
            <div className="preventive-details">

              <div className="preventive-details-header">

                <span>
                  Additional Technical Information
                </span>

                <h4>
                  Detailed Preventive Guidance Analysis
                </h4>

                <p>
                  This section provides detected counts, evidence classes,
                  evidence basis and methodology behind the preventive
                  recommendations.
                </p>

              </div>

              {/* ----------------------------------------------
                  Detailed guidance evidence
              ---------------------------------------------- */}

              <section className="preventive-detail-section">

                <div className="preventive-section-heading">

                  <div>
                    <h4>
                      Guidance Evidence
                    </h4>

                    <p>
                      Supporting evidence and technical details for each preventive recommendation.
                    </p>
                  </div>

                </div>

                {guidanceItems.length > 0 ? (
                  <div className="preventive-detail-list">

                    {guidanceItems.map((item, index) => {
                      const evidenceBasis = Array.isArray(
                        item.evidence_basis,
                      )
                        ? item.evidence_basis
                        : [];

                      return (
                        <article
                          className="preventive-detail-card"
                          key={`detail-${item.defect || "guidance"}-${index}`}
                        >

                          <div className="preventive-detail-head">

                            <div className="preventive-main-icon">
                              {getProcessIcon(item.process_area)}
                            </div>

                            <div className="preventive-detail-title">

                              <div className="preventive-main-meta">

                                {item.process_area && (
                                  <span className="preventive-chip process">
                                    {formatEnum(item.process_area)}
                                  </span>
                                )}

                                {item.defect && (
                                  <span className="preventive-chip defect">
                                    {formatEnum(item.defect)}
                                  </span>
                                )}

                              </div>

                              <h5>
                                {item.title || "Preventive Guidance"}
                              </h5>

                            </div>

                            {item.detected_count !== null &&
                              item.detected_count !== undefined && (
                                <div className="preventive-detected-box">

                                  <span>
                                    Detected
                                  </span>

                                  <strong>
                                    {item.detected_count}
                                  </strong>

                                </div>
                              )}

                          </div>

                          <div className="preventive-detail-body">

                            <div className="preventive-detail-box">

                              <span>
                                Preventive Guidance
                              </span>

                              <p>
                                {item.guidance ||
                                  "No preventive guidance was provided."}
                              </p>

                            </div>

                            <div className="preventive-detail-box">

                              <span>
                                Prevention Goal
                              </span>

                              <p>
                                {item.prevention_goal ||
                                  "No prevention goal was provided."}
                              </p>

                              {evidenceBasis.length > 0 && (
                                <div className="preventive-evidence-list">

                                  {evidenceBasis.map(
                                    (
                                      evidence,
                                      evidenceIndex,
                                    ) => (
                                      <div
                                        className="preventive-evidence-item"
                                        key={evidenceIndex}
                                      >
                                        <span className="preventive-evidence-dot" />

                                        <p>
                                          {evidence}
                                        </p>
                                      </div>
                                    ),
                                  )}

                                </div>
                              )}

                            </div>

                          </div>

                          <div className="preventive-detail-footer">

                            {item.evidence_class && (
                              <span className="preventive-footer-chip">
                                Evidence:{" "}
                                {getEvidenceLabel(
                                  item.evidence_class,
                                )}
                              </span>
                            )}

                            <span className="preventive-footer-chip">
                              Scope:{" "}
                              {item.applies_to_future_batches !== false
                                ? "Future Batches"
                                : "Current Batch"}
                            </span>

                          </div>

                        </article>
                      );
                    })}

                  </div>
                ) : (
                  <div className="preventive-empty">

                    <div className="preventive-empty-icon">
                      ✓
                    </div>

                    <div>
                      <strong>
                        No Detailed Guidance Evidence
                      </strong>

                      <p>
                        There are no active preventive guidance items for this batch.
                      </p>
                    </div>

                  </div>
                )}

              </section>

              {/* ----------------------------------------------
                  Technical summary
              ---------------------------------------------- */}

              <section className="preventive-detail-section">

                <div className="preventive-section-heading">

                  <div>
                    <h4>
                      Technical Assessment
                    </h4>

                    <p>
                      Supporting indicators returned by the preventive-guidance backend module.
                    </p>
                  </div>

                </div>

                <div className="preventive-technical-grid">

                  <div className="preventive-technical-card">
                    <span>
                      Guidance Items
                    </span>

                    <strong>
                      {totalGuidanceItems}
                    </strong>
                  </div>

                  <div className="preventive-technical-card">
                    <span>
                      Active Defects
                    </span>

                    <strong>
                      {activeDefectCount}
                    </strong>
                  </div>

                  <div className="preventive-technical-card">
                    <span>
                      Inspection
                    </span>

                    <strong>
                      {inspectionComplete
                        ? "Complete"
                        : "Incomplete"}
                    </strong>
                  </div>

                  <div className="preventive-technical-card">
                    <span>
                      Guidance Scope
                    </span>

                    <strong>
                      Future Batches
                    </strong>
                  </div>

                  <div className="preventive-technical-card">
                    <span>
                      Current-Batch Correction
                    </span>

                    <strong>
                      No
                    </strong>
                  </div>

                  <div className="preventive-technical-card">
                    <span>
                      Prevention Focus
                    </span>

                    <strong>
                      Defect Recurrence Reduction
                    </strong>
                  </div>

                </div>

              </section>

              {/* ----------------------------------------------
                  Methodology
              ---------------------------------------------- */}

              {data.methodology_note && (
                <section className="preventive-detail-section">

                  <div className="preventive-methodology-card">

                    <strong>
                      Methodology & Research Transparency
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

export default PreventiveProcessGuidance;
