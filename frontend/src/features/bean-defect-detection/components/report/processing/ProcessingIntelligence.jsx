import RoastingRecommendation from "./RoastingRecommendation";
import PreRoastPlan from "./PreRoastPlan";
import RoastRisk from "./RoastRisk";
import BatchUsage from "./BatchUsage";
import UsableYield from "./UsableYield";
import StorageHandling from "./StorageHandling";
import PreventiveProcessGuidance from "./PreventiveProcessGuidance";

function ProcessingIntelligence({ data }) {
  if (!data) {
    return null;
  }

  const modules = [
    Boolean(data.roasting_recommendation),
    Boolean(data.pre_roast_plan),
    Boolean(data.roast_quality_risk),
    Boolean(data.batch_usage),
    Boolean(data.usable_yield),
    Boolean(data.storage_handling),
    Boolean(data.preventive_process_guidance),
  ];

  const availableModuleCount = modules.filter(Boolean).length;

  return (
    <section className="processing-intelligence">
      <div className="pi-header">
        <div className="pi-header-main">
          <div className="pi-header-topline">
            <span className="pi-label">
              PRE-ROAST PROCESSING INTELLIGENCE
            </span>

            <span className="pi-module-counter">
              {availableModuleCount} / 7 MODULES
            </span>
          </div>

          <h2>Defect-Driven Processing Intelligence</h2>

          <p>
            Pre-roast processing guidance generated from detected sensor and
            physical coffee bean defects. Each active defect independently
            activates its relevant readiness, corrective action, roast-risk,
            usage, storage and preventive-process guidance.
          </p>
        </div>

        <div className="pi-header-status">
          <span className="pi-badge">DEFECT-DRIVEN</span>
          <span className="pi-badge secondary">AI DECISION SUPPORT</span>
        </div>
      </div>

      <div className="pi-flow">
        <div className="pi-flow-step">
          <span>1</span>
          <strong>Detect Defects</strong>
        </div>

        <div className="pi-flow-line" />

        <div className="pi-flow-step">
          <span>2</span>
          <strong>Evaluate Risks</strong>
        </div>

        <div className="pi-flow-line" />

        <div className="pi-flow-step">
          <span>3</span>
          <strong>Recommend Actions</strong>
        </div>

        <div className="pi-flow-line" />

        <div className="pi-flow-step">
          <span>4</span>
          <strong>Prepare for Roasting</strong>
        </div>
      </div>

      {data.roasting_recommendation && (
        <div className="pi-module-section">
          <div className="pi-module-heading">
            <div className="pi-module-number">01</div>

            <div>
              <span>MODULE 1</span>
              <h3>Roasting Readiness Recommendation</h3>
            </div>
          </div>

          <RoastingRecommendation data={data.roasting_recommendation} />
        </div>
      )}

      <div className="pi-grid">
        {data.pre_roast_plan && (
          <div className="pi-module-section">
            <div className="pi-module-heading">
              <div className="pi-module-number">02</div>

              <div>
                <span>MODULE 2</span>
                <h3>Pre-Roast Corrective Actions</h3>
              </div>
            </div>

            <PreRoastPlan data={data.pre_roast_plan} />
          </div>
        )}

        {data.roast_quality_risk && (
          <div className="pi-module-section">
            <div className="pi-module-heading">
              <div className="pi-module-number">03</div>

              <div>
                <span>MODULE 3</span>
                <h3>Roast Quality Risks</h3>
              </div>
            </div>

            <RoastRisk data={data.roast_quality_risk} />
          </div>
        )}
      </div>

      <div className="pi-grid">
        {data.batch_usage && (
          <div className="pi-module-section">
            <div className="pi-module-heading">
              <div className="pi-module-number">04</div>

              <div>
                <span>MODULE 4</span>
                <h3>Batch Usage Recommendation</h3>
              </div>
            </div>

            <BatchUsage data={data.batch_usage} />
          </div>
        )}

        {data.usable_yield && (
          <div className="pi-module-section">
            <div className="pi-module-heading">
              <div className="pi-module-number">05</div>

              <div>
                <span>MODULE 5</span>
                <h3>Usable Yield Estimation</h3>
              </div>
            </div>

            <UsableYield data={data.usable_yield} />
          </div>
        )}
      </div>

      <div className="pi-grid">
        {data.storage_handling && (
          <div className="pi-module-section">
            <div className="pi-module-heading">
              <div className="pi-module-number">06</div>

              <div>
                <span>MODULE 6</span>
                <h3>Storage & Handling Recommendation</h3>
              </div>
            </div>

            <StorageHandling data={data.storage_handling} />
          </div>
        )}

        {data.preventive_process_guidance && (
          <div className="pi-module-section">
            <div className="pi-module-heading">
              <div className="pi-module-number">07</div>

              <div>
                <span>MODULE 7</span>
                <h3>Preventive Process Guidance</h3>
              </div>
            </div>

            <PreventiveProcessGuidance
              data={data.preventive_process_guidance}
            />
          </div>
        )}
      </div>

      {availableModuleCount < 7 && (
        <div className="pi-warning">
          <div className="pi-warning-icon">!</div>

          <div>
            <strong>Processing Intelligence is partially available</strong>

            <p>
              {availableModuleCount} of 7 processing modules were returned by
              the backend for this report.
            </p>
          </div>
        </div>
      )}

      <div className="pi-methodology">
        <div className="pi-methodology-icon">i</div>

        <div>
          <strong>Defect-Driven Decision Method</strong>

          <p>
            Processing recommendations are activated by detected defect
            evidence rather than by the final quality score or grade alone.
            Black-and-broken beans contribute to both the black and broken
            recommendation rules, while Usable Yield Estimation keeps Good,
            Broken, Black and Black + Broken categories separate.
          </p>
        </div>
      </div>

      <style>{`
        .processing-intelligence {
          margin-top: 24px;
          width: 100%;
        }

        .pi-header {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 18px;
          padding: 24px;
          overflow: hidden;
          border-radius: 24px;
          background:
            radial-gradient(
              circle at top right,
              rgba(217, 145, 70, 0.16),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              rgba(74, 42, 24, 0.94),
              rgba(24, 16, 12, 0.98)
            );
          border: 1px solid rgba(255, 210, 153, 0.12);
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.22);
        }

        .pi-header::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: -75px;
          top: -95px;
          border-radius: 50%;
          border: 1px solid rgba(245, 179, 103, 0.12);
        }

        .pi-header-main {
          position: relative;
          z-index: 1;
          max-width: 760px;
        }

        .pi-header-topline {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pi-label {
          color: #dda565;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .pi-module-counter {
          padding: 4px 7px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: rgba(255, 239, 218, 0.48);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.8px;
        }

        .pi-header h2 {
          margin: 8px 0 7px;
          color: #fff0da;
          font-size: 25px;
          line-height: 1.2;
        }

        .pi-header p {
          margin: 0;
          max-width: 700px;
          color: rgba(255, 238, 214, 0.55);
          font-size: 12px;
          line-height: 1.7;
        }

        .pi-header-status {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          flex-direction: column;
          gap: 8px;
        }

        .pi-badge {
          flex-shrink: 0;
          padding: 8px 11px;
          border-radius: 999px;
          color: #f4c17f;
          border: 1px solid rgba(248, 201, 138, 0.19);
          background: rgba(248, 201, 138, 0.07);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.6px;
        }

        .pi-badge.secondary {
          color: rgba(255, 239, 218, 0.48);
          border-color: rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.03);
        }

        .pi-flow {
          display: flex;
          align-items: center;
          margin-bottom: 18px;
          padding: 14px 18px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.055);
        }

        .pi-flow-step {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .pi-flow-step span {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border-radius: 8px;
          background: rgba(219, 153, 84, 0.1);
          border: 1px solid rgba(219, 153, 84, 0.16);
          color: #e4aa68;
          font-size: 9px;
          font-weight: 900;
        }

        .pi-flow-step strong {
          color: rgba(255, 239, 218, 0.64);
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .pi-flow-line {
          width: 100%;
          height: 1px;
          margin: 0 12px;
          background:
            linear-gradient(
              90deg,
              rgba(219, 153, 84, 0.2),
              rgba(255, 255, 255, 0.05)
            );
        }

.pi-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 22px;
  margin-top: 22px;
}
        .pi-module-section {
          min-width: 0;
          margin-top: 16px;
        }

        .pi-grid .pi-module-section {
          margin-top: 0;
        }

        .pi-module-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 0 0 9px;
          padding: 0 3px;
        }

        .pi-module-number {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 11px;
          color: #e7ad6b;
          background:
            linear-gradient(
              145deg,
              rgba(224, 155, 83, 0.13),
              rgba(224, 155, 83, 0.045)
            );
          border: 1px solid rgba(224, 155, 83, 0.14);
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.5px;
        }

        .pi-module-heading span {
          display: block;
          margin-bottom: 2px;
          color: rgba(223, 163, 99, 0.57);
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .pi-module-heading h3 {
          margin: 0;
          color: rgba(255, 239, 218, 0.82);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.3;
        }

        .pi-warning {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(225, 159, 82, 0.06);
          border: 1px solid rgba(225, 159, 82, 0.12);
        }

        .pi-warning-icon {
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          border-radius: 8px;
          background: rgba(225, 159, 82, 0.12);
          color: #e4aa68;
          font-size: 12px;
          font-weight: 900;
        }

        .pi-warning strong {
          color: #e9bb83;
          font-size: 10px;
        }

        .pi-warning p {
          margin: 4px 0 0;
          color: rgba(255, 239, 218, 0.46);
          font-size: 9px;
          line-height: 1.5;
        }

        .pi-methodology {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 18px;
          padding: 15px 16px;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.022);
          border: 1px solid rgba(255, 255, 255, 0.055);
        }

        .pi-methodology-icon {
          display: grid;
          place-items: center;
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          border-radius: 50%;
          color: rgba(255, 221, 178, 0.7);
          border: 1px solid rgba(255, 221, 178, 0.14);
          font-family: Georgia, serif;
          font-size: 12px;
          font-weight: 700;
        }

        .pi-methodology strong {
          color: rgba(255, 239, 218, 0.72);
          font-size: 10px;
        }

        .pi-methodology p {
          margin: 4px 0 0;
          max-width: 950px;
          color: rgba(255, 239, 218, 0.4);
          font-size: 9px;
          line-height: 1.65;
        }

        @media (max-width: 950px) {
          .pi-grid {
            grid-template-columns: 1fr;
          }

          .pi-flow {
            overflow-x: auto;
          }
        }

        @media (max-width: 700px) {
          .pi-header {
            flex-direction: column;
            padding: 19px;
          }

          .pi-header-status {
            align-items: flex-start;
            flex-direction: row;
            flex-wrap: wrap;
          }

          .pi-header h2 {
            font-size: 21px;
          }

          .pi-flow {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }

          .pi-flow-line {
            width: 1px;
            height: 13px;
            margin: 0 0 0 12px;
            background: rgba(219, 153, 84, 0.14);
          }
        }
      `}</style>
    </section>
  );
}

export default ProcessingIntelligence;
