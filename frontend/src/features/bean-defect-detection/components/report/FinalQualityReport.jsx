import QualityScore from "./QualityScore";
import QualityFindings from "./QualityFindings";
import Recommendations from "./Recommendations";
import ReportActions from "./ReportActions";

function FinalQualityReport({
  sensorResult,
  physicalResult,
  onBack,
  onNewAnalysis,
}) {
  /*
    TEMPORARY QUALITY FUSION

    Me calculation eka frontend eke final version eke
    thiyanne naha.

    Passe FastAPI backend quality fusion endpoint
    eken final result eka enawa.
  */

  const sensorScore = sensorResult?.sensorScore ?? 0;

  const physicalScore = physicalResult?.physicalScore ?? 0;

  const finalScore = Math.round(sensorScore * 0.5 + physicalScore * 0.5);

  const getGrade = (score) => {
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    return "Reject";
  };

  const getQualityStatus = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 55) return "Needs Review";
    return "Poor";
  };

  const defectCounts = physicalResult?.defect_counts || {};

  /*
    TEMPORARY SENSOR FINDINGS
  */

  const sensorFindings = [
    {
      title: "Sensor Analysis Completed",
      description: `Sensor quality score is ${sensorScore}/100.`,
      status: sensorScore >= 70 ? "normal" : "warning",
    },

    ...(sensorResult?.findings || []).map((finding, index) => ({
      title: `Sensor Finding ${index + 1}`,
      description: finding,
      status: finding.toLowerCase().includes("high") ? "warning" : "normal",
    })),
  ];

  /*
    TEMPORARY PHYSICAL FINDINGS

    defect_counts backend result eka use karanawa.
  */

  const physicalFindings = [];

  Object.entries(defectCounts).forEach(([defect, count]) => {
    physicalFindings.push({
      title: `${defect} Detected`,
      description: `${count} ${defect} detection(s) identified during physical AI inspection.`,
      status: count > 0 ? "warning" : "normal",
    });
  });

  if (physicalFindings.length === 0) {
    physicalFindings.push({
      title: "Physical Analysis Completed",
      description: "No defect count information was returned.",
      status: "normal",
    });
  }

  /*
    TEMPORARY DEFECT-BASED RECOMMENDATIONS
  */

  const recommendations = [];

  Object.entries(defectCounts).forEach(([defect, count]) => {
    if (count <= 0) return;

    const defectName = defect.toLowerCase();

    if (defectName.includes("black") || defectName.includes("dark")) {
      recommendations.push({
        title: "Remove Black or Dark Beans",
        description: `${count} black/dark bean defect(s) were detected.`,
        action:
          "Sort and remove affected beans before roasting or further processing.",
        priority: "High",
        type: "danger",
      });
    }

    if (defectName.includes("broken") || defectName.includes("chipped")) {
      recommendations.push({
        title: "Sort Broken Beans",
        description: `${count} broken or chipped bean defect(s) were detected.`,
        action: "Perform additional sorting before the roasting stage.",
        priority: "Medium",
        type: "warning",
      });
    }

    if (defectName.includes("white") || defectName.includes("immature")) {
      recommendations.push({
        title: "Review Immature Beans",
        description: `${count} white or immature bean defect(s) were detected.`,
        action: "Remove immature beans to improve batch consistency.",
        priority: "Medium",
        type: "warning",
      });
    }
  });

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Batch Can Continue",
      description: "No major physical defect recommendation was generated.",
      action:
        "Continue to the next production stage after normal quality checks.",
      priority: "Normal",
      type: "success",
    });
  }

  const handleSave = () => {
    console.log("SAVE REPORT", {
      sensorResult,
      physicalResult,
      finalScore,
    });

    alert("Save Report API will be connected next.");
  };

  const handleDownload = () => {
    alert("PDF report generation will be connected later.");
  };

  return (
    <section className="final-report">
      <div className="final-report-card">
        {/* HEADER */}

        <div className="final-report-header">
          <div>
            <span className="final-step-label">STEP 03 — FINAL ASSESSMENT</span>

            <h2>Final Coffee Bean Quality Report</h2>

            <p>
              Combined quality assessment generated from sensor measurements and
              physical AI inspection.
            </p>
          </div>

          <span className="report-status">Report Generated</span>
        </div>

        {/* BATCH INFORMATION */}

        <div className="batch-information">
          <div>
            <span>Inspection Type</span>
            <strong>Coffee Bean Quality Assessment</strong>
          </div>

          <div>
            <span>Sensor Analysis</span>
            <strong>Completed</strong>
          </div>

          <div>
            <span>Physical Analysis</span>
            <strong>Completed</strong>
          </div>

          <div>
            <span>Report Status</span>
            <strong>Finalized</strong>
          </div>
        </div>

        {/* FINAL SCORE */}

        <div className="report-section-block">
          <QualityScore
            finalScore={finalScore}
            grade={getGrade(finalScore)}
            status={getQualityStatus(finalScore)}
            sensorScore={sensorScore}
            physicalScore={physicalScore}
          />
        </div>

        {/* FINDINGS */}

        <div className="report-section-block">
          <QualityFindings
            sensorFindings={sensorFindings}
            physicalFindings={physicalFindings}
          />
        </div>

        {/* RECOMMENDATIONS */}

        <div className="report-section-block">
          <Recommendations recommendations={recommendations} />
        </div>

        {/* ACTIONS */}

        <ReportActions
          onBack={onBack}
          onNewAnalysis={onNewAnalysis}
          onSave={handleSave}
          onDownload={handleDownload}
        />
      </div>

      <style>{`
        .final-report {
          margin-top: 30px;
        }

        .final-report-card {
          padding: 28px;

          border-radius: 28px;

          border:
            1px solid rgba(255, 222, 178, 0.15);

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.095),
              rgba(255, 255, 255, 0.035)
            ),
            rgba(39, 22, 13, 0.78);

          backdrop-filter: blur(20px);

          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.3),
            inset 0 1px 0
              rgba(255, 255, 255, 0.08);
        }

        .final-report-header {
          display: flex;

          align-items: flex-start;
          justify-content: space-between;

          gap: 25px;

          margin-bottom: 24px;
        }

        .final-step-label {
          display: block;

          margin-bottom: 7px;

          color: #dfa15d;

          font-size: 11px;
          font-weight: 900;

          letter-spacing: 1.7px;
        }

        .final-report-header h2 {
          margin: 0;

          color: #fff3e1;

          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .final-report-header p {
          max-width: 680px;

          margin: 9px 0 0;

          color:
            rgba(255, 239, 215, 0.58);

          font-size: 14px;
          line-height: 1.6;
        }

        .report-status {
          flex-shrink: 0;

          padding: 8px 12px;

          border-radius: 999px;

          color: #a8e7b0;

          background:
            rgba(63, 169, 78, 0.1);

          border:
            1px solid
              rgba(95, 200, 108, 0.17);

          font-size: 11px;
          font-weight: 850;
        }

        .batch-information {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 11px;

          margin-bottom: 20px;
        }

        .batch-information > div {
          padding: 14px;

          border-radius: 16px;

          background:
            rgba(0, 0, 0, 0.14);

          border:
            1px solid
              rgba(255, 220, 170, 0.08);
        }

        .batch-information span {
          display: block;

          margin-bottom: 5px;

          color:
            rgba(255, 238, 212, 0.4);

          font-size: 9px;

          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        .batch-information strong {
          color: #ffe8c5;

          font-size: 11px;
        }

        .report-section-block {
          margin-top: 17px;

          padding: 20px;

          border-radius: 22px;

          background:
            rgba(0, 0, 0, 0.11);

          border:
            1px solid
              rgba(255, 220, 170, 0.08);
        }

        @media (max-width: 850px) {
          .batch-information {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 620px) {
          .final-report-card {
            padding: 18px;
          }

          .final-report-header {
            flex-direction: column;
          }

          .batch-information {
            grid-template-columns: 1fr;
          }

          .report-section-block {
            padding: 15px;
          }
        }
      `}</style>
    </section>
  );
}

export default FinalQualityReport;
