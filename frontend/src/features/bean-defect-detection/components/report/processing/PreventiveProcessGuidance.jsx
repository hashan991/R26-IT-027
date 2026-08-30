import React from "react";

function PreventiveProcessGuidance({ data }) {
  if (!data) {
    return null;
  }

  const guidanceItems = Array.isArray(data.guidance)
    ? data.guidance
    : [];

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

  const activeDefectCount = Number(data.active_defect_count ?? 0);

  const totalGuidanceItems = Number(
    data.total_guidance_items ?? guidanceItems.length ?? 0,
  );

  const inspectionComplete = data.inspection_complete !== false;

  return (
    <section className="preventive-guidance-shell">
      <div className="preventive-guidance-header">
        <div className="preventive-guidance-heading">
          <span className="preventive-guidance-kicker">
            MODULE 7 · FUTURE PROCESS PREVENTION
          </span>

          <h3>{data.title || "Preventive Process Guidance"}</h3>

          <p>
            {data.summary ||
              "Defect-driven recommendations for reducing recurrence in future coffee batches."}
          </p>
        </div>

        <div className="preventive-guidance-status">
          <span
            className={`preventive-status-pill ${
              inspectionComplete ? "complete" : "incomplete"
            }`}
          >
            {inspectionComplete
              ? "Inspection Complete"
              : "Inspection Incomplete"}
          </span>
        </div>
      </div>

      <div className="preventive-guidance-metrics">
        <div className="preventive-metric-card">
          <span>Guidance Items</span>
          <strong>{totalGuidanceItems}</strong>
          <small>Future-process recommendations</small>
        </div>

        <div className="preventive-metric-card">
          <span>Active Defects</span>
          <strong>{activeDefectCount}</strong>
          <small>Defect conditions considered</small>
        </div>

        <div className="preventive-metric-card">
          <span>Guidance Scope</span>
          <strong className="preventive-text-value">FUTURE</strong>
          <small>Not current-batch correction</small>
        </div>
      </div>

      {guidanceItems.length > 0 ? (
        <div className="preventive-guidance-list">
          {guidanceItems.map((item, index) => {
            const evidenceBasis = Array.isArray(item.evidence_basis)
              ? item.evidence_basis
              : [];

            return (
              <article
                className="preventive-guidance-card"
                key={`${item.defect || "guidance"}-${index}`}
              >
                <div className="preventive-card-top">
                  <div className="preventive-process-icon">
                    {getProcessIcon(item.process_area)}
                  </div>

                  <div className="preventive-card-heading">
                    <div className="preventive-card-meta">
                      <span className="preventive-process-area">
                        {formatEnum(item.process_area)}
                      </span>

                      <span className="preventive-defect-chip">
                        {formatEnum(item.defect)}
                      </span>
                    </div>

                    <h4>{item.title || "Preventive Guidance"}</h4>
                  </div>

                  {item.detected_count !== null &&
                    item.detected_count !== undefined && (
                      <div className="preventive-count-box">
                        <span>Detected</span>
                        <strong>{item.detected_count}</strong>
                      </div>
                    )}
                </div>

                <div className="preventive-card-body">
                  <div className="preventive-info-block guidance-block">
                    <div className="preventive-info-label">
                      <span>01</span>
                      Preventive Guidance
                    </div>

                    <p>{item.guidance}</p>
                  </div>

                  <div className="preventive-info-block goal-block">
                    <div className="preventive-info-label">
                      <span>02</span>
                      Prevention Goal
                    </div>

                    <p>{item.prevention_goal}</p>
                  </div>

                  <div className="preventive-card-footer">
                    <div className="preventive-evidence">
                      <span>Evidence Class</span>

                      <strong>{getEvidenceLabel(item.evidence_class)}</strong>
                    </div>

                    <div className="preventive-future-badge">
                      {item.applies_to_future_batches !== false
                        ? "Applies to Future Batches"
                        : "Current Batch"}
                    </div>
                  </div>

                  {evidenceBasis.length > 0 && (
                    <details className="preventive-evidence-details">
                      <summary>
                        View Evidence Basis
                        <span>{evidenceBasis.length}</span>
                      </summary>

                      <div className="preventive-evidence-list">
                        {evidenceBasis.map((evidence, evidenceIndex) => (
                          <div
                            className="preventive-evidence-item"
                            key={evidenceIndex}
                          >
                            <span className="preventive-evidence-dot" />
                            <p>{evidence}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="preventive-empty-state">
          <div className="preventive-empty-icon">✓</div>

          <div>
            <h4>No Defect-Specific Preventive Action</h4>

            <p>
              No active Processing Intelligence defect currently triggers a
              preventive process recommendation. Continue normal documented
              quality controls.
            </p>
          </div>
        </div>
      )}

      {data.methodology_note && (
        <details className="preventive-methodology">
          <summary>
            <span>Methodology & Research Transparency</span>
            <strong>View</strong>
          </summary>

          <p>{data.methodology_note}</p>
        </details>
      )}

      <style>{`
        .preventive-guidance-shell {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 22px;
          padding: 26px;
          border: 1px solid rgba(111, 78, 55, 0.14);
          border-radius: 24px;
          background:
            radial-gradient(circle at top right, rgba(186, 145, 88, 0.13), transparent 34%),
            linear-gradient(145deg, #fffdf9 0%, #faf5ec 100%);
          box-shadow: 0 18px 45px rgba(69, 45, 28, 0.08);
          color: #33261e;
        }

        .preventive-guidance-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .preventive-guidance-heading {
          max-width: 760px;
        }

        .preventive-guidance-kicker {
          display: inline-flex;
          margin-bottom: 9px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: #8a603d;
        }

        .preventive-guidance-heading h3 {
          margin: 0;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.15;
          color: #2e2018;
        }

        .preventive-guidance-heading p {
          margin: 10px 0 0;
          max-width: 720px;
          color: #6d5b4f;
          line-height: 1.7;
          font-size: 14px;
        }

        .preventive-guidance-status {
          display: flex;
          justify-content: flex-end;
        }

        .preventive-status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .preventive-status-pill.complete {
          color: #2f6944;
          background: #eaf5ed;
          border: 1px solid #cde6d4;
        }

        .preventive-status-pill.incomplete {
          color: #8a5624;
          background: #fff2df;
          border: 1px solid #f0d2a7;
        }

        .preventive-guidance-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .preventive-metric-card {
          min-height: 112px;
          padding: 17px;
          border-radius: 18px;
          border: 1px solid rgba(105, 75, 53, 0.12);
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 8px 22px rgba(75, 50, 31, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .preventive-metric-card span {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: #92765f;
        }

        .preventive-metric-card strong {
          margin-top: 5px;
          font-size: 28px;
          line-height: 1;
          color: #473327;
        }

        .preventive-metric-card strong.preventive-text-value {
          font-size: 17px;
          margin-top: 8px;
          letter-spacing: 0.07em;
          color: #745238;
        }

        .preventive-metric-card small {
          margin-top: 8px;
          font-size: 11px;
          color: #8b796d;
        }

        .preventive-guidance-list {
          display: grid;
          gap: 16px;
        }

        .preventive-guidance-card {
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(105, 75, 53, 0.13);
          background: #fff;
          box-shadow: 0 10px 30px rgba(72, 47, 29, 0.055);
        }

        .preventive-card-top {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 18px 19px;
          border-bottom: 1px solid #eee5dc;
          background: linear-gradient(90deg, #fffaf3, #ffffff);
        }

        .preventive-process-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: #efe2d1;
          color: #70492d;
          font-size: 21px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .preventive-card-heading {
          min-width: 0;
        }

        .preventive-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          align-items: center;
          margin-bottom: 6px;
        }

        .preventive-process-area,
        .preventive-defect-chip {
          display: inline-flex;
          align-items: center;
          min-height: 25px;
          padding: 4px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .preventive-process-area {
          color: #68472f;
          background: #f2e5d6;
        }

        .preventive-defect-chip {
          color: #6d5b4e;
          background: #f3f1ee;
          border: 1px solid #e8e2dc;
        }

        .preventive-card-heading h4 {
          margin: 0;
          color: #33241b;
          font-size: 17px;
          line-height: 1.35;
        }

        .preventive-count-box {
          min-width: 72px;
          padding: 9px 12px;
          border-radius: 14px;
          text-align: center;
          background: #f8f1e8;
          border: 1px solid #eadbc9;
        }

        .preventive-count-box span {
          display: block;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9a806b;
        }

        .preventive-count-box strong {
          display: block;
          margin-top: 2px;
          font-size: 19px;
          color: #64452f;
        }

        .preventive-card-body {
          padding: 19px;
          display: grid;
          gap: 14px;
        }

        .preventive-info-block {
          padding: 15px 16px;
          border-radius: 15px;
        }

        .preventive-info-block.guidance-block {
          background: #fbf6ef;
          border-left: 4px solid #9d7551;
        }

        .preventive-info-block.goal-block {
          background: #f6f7f2;
          border-left: 4px solid #748266;
        }

        .preventive-info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 7px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: #75583f;
        }

        .preventive-info-label span {
          width: 23px;
          height: 23px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          font-size: 9px;
          color: #fff;
          background: #765438;
        }

        .preventive-info-block p {
          margin: 0;
          font-size: 13px;
          line-height: 1.72;
          color: #5f5148;
        }

        .preventive-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding-top: 3px;
        }

        .preventive-evidence {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .preventive-evidence span {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9a8a7e;
        }

        .preventive-evidence strong {
          font-size: 12px;
          color: #5e4939;
        }

        .preventive-future-badge {
          padding: 7px 11px;
          border-radius: 10px;
          background: #edf4ea;
          color: #526a49;
          font-size: 10px;
          font-weight: 800;
        }

        .preventive-evidence-details,
        .preventive-methodology {
          border-radius: 14px;
          border: 1px solid #e8e0d7;
          background: #fcfaf7;
        }

        .preventive-evidence-details summary,
        .preventive-methodology summary {
          cursor: pointer;
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          color: #674f3d;
          font-size: 11px;
          font-weight: 800;
        }

        .preventive-evidence-details summary::-webkit-details-marker,
        .preventive-methodology summary::-webkit-details-marker {
          display: none;
        }

        .preventive-evidence-details summary span {
          min-width: 23px;
          height: 23px;
          padding: 0 6px;
          border-radius: 999px;
          display: inline-grid;
          place-items: center;
          background: #eee5db;
          font-size: 10px;
        }

        .preventive-evidence-list {
          display: grid;
          gap: 9px;
          padding: 0 14px 14px;
        }

        .preventive-evidence-item {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 9px;
          align-items: flex-start;
          padding: 10px 11px;
          border-radius: 11px;
          background: #fff;
          border: 1px solid #eee7df;
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
          font-size: 11px;
          line-height: 1.6;
          color: #716257;
        }

        .preventive-empty-state {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border-radius: 18px;
          border: 1px solid #d9e7d6;
          background: #f4f9f2;
        }

        .preventive-empty-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #45613d;
          background: #dfeeda;
          font-size: 19px;
          font-weight: 900;
        }

        .preventive-empty-state h4 {
          margin: 0;
          color: #3c5237;
        }

        .preventive-empty-state p {
          margin: 5px 0 0;
          color: #6a7865;
          font-size: 12px;
          line-height: 1.6;
        }

        .preventive-methodology {
          margin-top: 2px;
        }

        .preventive-methodology summary {
          padding: 14px 16px;
        }

        .preventive-methodology summary strong {
          color: #927154;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .preventive-methodology p {
          margin: 0;
          padding: 0 16px 16px;
          color: #75665b;
          font-size: 11px;
          line-height: 1.7;
        }

        @media (max-width: 820px) {
          .preventive-guidance-shell {
            padding: 20px;
            border-radius: 20px;
          }

          .preventive-guidance-header {
            flex-direction: column;
          }

          .preventive-guidance-status {
            justify-content: flex-start;
          }

          .preventive-guidance-metrics {
            grid-template-columns: 1fr;
          }

          .preventive-card-top {
            grid-template-columns: auto 1fr;
          }

          .preventive-count-box {
            grid-column: 1 / -1;
            text-align: left;
          }

          .preventive-count-box span,
          .preventive-count-box strong {
            display: inline;
          }

          .preventive-count-box strong {
            margin-left: 7px;
          }
        }

        @media (max-width: 560px) {
          .preventive-guidance-shell {
            padding: 15px;
          }

          .preventive-card-top {
            padding: 15px;
          }

          .preventive-card-body {
            padding: 15px;
          }

          .preventive-process-icon {
            width: 40px;
            height: 40px;
          }

          .preventive-card-heading h4 {
            font-size: 15px;
          }

          .preventive-card-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}

export default PreventiveProcessGuidance;
