import RoastingRecommendation from "./RoastingRecommendation";
import PreRoastPlan from "./PreRoastPlan";
import RoastRisk from "./RoastRisk";
import BatchUsage from "./BatchUsage";
import UsableYield from "./UsableYield";
import ProductionDecision from "./ProductionDecision";

function ProcessingIntelligence({ data }) {
  if (!data) {
    return null;
  }

  return (
    <section className="processing-intelligence">
      <div className="pi-header">
        <div>
          <span className="pi-label">ADVANCED DECISION SUPPORT</span>

          <h2>Processing Intelligence</h2>

          <p>
            Intelligent processing guidance generated from the final coffee bean
            quality assessment.
          </p>
        </div>

        <span className="pi-badge">AI DECISION SUPPORT</span>
      </div>

      <ProductionDecision data={data.production_decision} />

      <div className="pi-grid">
        <RoastingRecommendation data={data.roasting_recommendation} />

        <RoastRisk data={data.roast_quality_risk} />
      </div>

      <PreRoastPlan data={data.pre_roast_plan} />

      <BatchUsage data={data.batch_usage} />

      <UsableYield data={data.usable_yield} />

      <style>{`

        .processing-intelligence {
          margin-top: 22px;
        }


        .pi-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;

          margin-bottom: 18px;
          padding: 22px;

          border-radius: 22px;

          background:
            linear-gradient(
              135deg,
              rgba(218, 147, 79, 0.12),
              rgba(0, 0, 0, 0.15)
            );

          border:
            1px solid
            rgba(255, 214, 160, 0.12);
        }


        .pi-label {
          color: #dca05e;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1.5px;
        }


        .pi-header h2 {
          margin: 7px 0 5px;

          color: #fff0da;

          font-size: 24px;
        }


        .pi-header p {
          margin: 0;

          max-width: 650px;

          color:
            rgba(
              255,
              238,
              214,
              0.5
            );

          font-size: 12px;

          line-height: 1.6;
        }


        .pi-badge {
          flex-shrink: 0;

          padding: 7px 10px;

          border-radius: 999px;

          color: #f8c98a;

          border:
            1px solid
            rgba(248, 201, 138, 0.18);

          background:
            rgba(248, 201, 138, 0.06);

          font-size: 8px;

          font-weight: 900;
        }


        .pi-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 16px;

          margin-top: 16px;
        }


        @media (max-width: 850px) {
          .pi-grid {
            grid-template-columns: 1fr;
          }

          .pi-header {
            flex-direction: column;
          }
        }

      `}</style>
    </section>
  );
}

export default ProcessingIntelligence;
