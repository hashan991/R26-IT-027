import { useEffect, useState } from "react";

import QualityScore from "./QualityScore";
import QualityFindings from "./QualityFindings";
import Recommendations from "./Recommendations";
import ReportActions from "./ReportActions";

import { generateBeanQualityReport } from "../../services/qualityService";

import ProcessingIntelligence from "./processing/ProcessingIntelligence";

function FinalQualityReport({
  sensorResult,
  physicalResult,
  onBack,
  onNewAnalysis,
}) {
  // =========================================================
  // REPORT STATE
  // =========================================================

  const [report, setReport] = useState(null);

  // =========================================================
  // LOADING
  // =========================================================

  const [loading, setLoading] = useState(true);

  // =========================================================
  // ERROR
  // =========================================================

  const [error, setError] = useState("");

  // =========================================================
  // GENERATE REPORT FROM BACKEND
  // =========================================================

  useEffect(() => {
    const generateReport = async () => {
      try {
        setLoading(true);

        setError("");

        setReport(null);

        const data = await generateBeanQualityReport(
          sensorResult,
          physicalResult,
        );

        setReport(data);
      } catch (requestError) {
        console.error("Final report generation failed:", requestError);

        // 401 is handled globally by api.js
        if (requestError.response?.status !== 401) {
          const message =
            requestError.response?.data?.detail ||
            "Failed to generate the final coffee bean quality report.";

          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [sensorResult, physicalResult]);

  // =========================================================
  // RETRY REPORT GENERATION
  // =========================================================

  const handleRetry = async () => {
    try {
      setLoading(true);

      setError("");

      setReport(null);

      const data = await generateBeanQualityReport(
        sensorResult,
        physicalResult,
      );

      setReport(data);
    } catch (requestError) {
      console.error("Report retry failed:", requestError);

      if (requestError.response?.status !== 401) {
        const message =
          requestError.response?.data?.detail ||
          "Failed to generate the report.";

        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOADING UI
  // =========================================================

  if (loading) {
    return (
      <section className="final-report">
        <div className="final-report-loading-card">
          <div className="report-loader"></div>

          <h2>Generating Final Quality Report</h2>

          <p>
            Combining sensor analysis and physical AI results to calculate the
            final coffee bean quality assessment.
          </p>
        </div>

        <style>{`

          .final-report {
            margin-top: 30px;
          }


          .final-report-loading-card {
            min-height: 360px;

            padding: 30px;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            text-align: center;

            border-radius: 28px;

            border:
              1px solid
              rgba(
                255,
                222,
                178,
                0.15
              );

            background:
              linear-gradient(
                145deg,
                rgba(
                  255,
                  255,
                  255,
                  0.095
                ),
                rgba(
                  255,
                  255,
                  255,
                  0.035
                )
              ),
              rgba(
                39,
                22,
                13,
                0.78
              );

            backdrop-filter:
              blur(20px);
          }


          .report-loader {
            width: 48px;

            height: 48px;

            margin-bottom: 20px;

            border-radius: 50%;

            border:
              4px solid
              rgba(
                255,
                214,
                157,
                0.14
              );

            border-top-color:
              #dfa15d;

            animation:
              reportSpin
              0.8s
              linear
              infinite;
          }


          .final-report-loading-card h2 {
            margin: 0;

            color: #fff1db;

            font-size: 22px;
          }


          .final-report-loading-card p {
            max-width: 460px;

            margin:
              10px 0 0;

            color:
              rgba(
                255,
                238,
                212,
                0.5
              );

            font-size: 13px;

            line-height: 1.6;
          }


          @keyframes reportSpin {
            to {
              transform:
                rotate(360deg);
            }
          }

        `}</style>
      </section>
    );
  }

  // =========================================================
  // ERROR UI
  // =========================================================

  if (error || !report) {
    return (
      <section className="final-report">
        <div className="final-report-error-card">
          <div className="report-error-icon">!</div>

          <h2>Report Generation Failed</h2>

          <p>{error || "No report data was returned."}</p>

          <div className="report-error-actions">
            <button
              type="button"
              className="error-back-button"
              onClick={onBack}
            >
              ← Back
            </button>

            <button
              type="button"
              className="retry-report-button"
              onClick={handleRetry}
            >
              ↻ Try Again
            </button>
          </div>
        </div>

        <style>{`

          .final-report {
            margin-top: 30px;
          }


          .final-report-error-card {
            padding: 35px;

            text-align: center;

            border-radius: 28px;

            border:
              1px solid
              rgba(
                255,
                120,
                100,
                0.18
              );

            background:
              rgba(
                67,
                24,
                18,
                0.8
              );
          }


          .report-error-icon {
            width: 60px;

            height: 60px;

            margin:
              0 auto 15px;

            display: grid;

            place-items:
              center;

            border-radius: 18px;

            color: #32130d;

            background:
              #ff9e87;

            font-size: 28px;

            font-weight: 950;
          }


          .final-report-error-card h2 {
            margin: 0;

            color: #ffe2da;
          }


          .final-report-error-card p {
            margin:
              10px auto 20px;

            max-width: 500px;

            color:
              rgba(
                255,
                226,
                218,
                0.65
              );

            font-size: 13px;
          }


          .report-error-actions {
            display: flex;

            justify-content: center;

            gap: 10px;
          }


          .error-back-button,
          .retry-report-button {
            padding:
              11px 17px;

            border-radius: 12px;

            font-size: 11px;

            font-weight: 850;

            cursor: pointer;
          }


          .error-back-button {
            color: #ffe1c1;

            background:
              rgba(
                255,
                255,
                255,
                0.05
              );

            border:
              1px solid
              rgba(
                255,
                220,
                170,
                0.12
              );
          }


          .retry-report-button {
            border: none;

            color: #2b170c;

            background:
              linear-gradient(
                135deg,
                #ffe0a3,
                #d38a46
              );
          }

        `}</style>
      </section>
    );
  }

  // =========================================================
  // BACKEND REPORT VALUES
  // =========================================================

  const sensorAssessment = report.sensor_assessment || {};

  const physicalAssessment = report.physical_assessment || {};

  const finalScore = report.final_score ?? 0;

  const grade = report.grade || "Reject";

  const qualityStatus = report.quality_status || "Needs Review";

  // =========================================================
  // FINDINGS
  // =========================================================
  //
  // QualityFindings component currently expects:
  //
  // sensorFindings
  // physicalFindings
  //
  // Therefore backend findings are separated here.
  //
  // =========================================================

  const sensorFindings = (report.findings || [])
    .filter((finding) => finding.category === "sensor")
    .map((finding) => ({
      title: finding.title,

      description: finding.description,

      status: finding.status,
    }));

  const physicalFindings = (report.findings || [])
    .filter((finding) => finding.category === "physical")
    .map((finding) => ({
      title: finding.title,

      description: finding.description,

      status: finding.status,
    }));

  // =========================================================
  // FINAL FINDING
  // =========================================================

  const finalFinding = (report.findings || []).find(
    (finding) => finding.category === "final",
  );

  // =========================================================
  // REPORT DATE
  // =========================================================

  const generatedDate = report.generated_at
    ? new Date(report.generated_at).toLocaleString()
    : "-";

  // =========================================================
  // SAVE REPORT
  // =========================================================
  //
  // MongoDB save API will be connected later.
  //
  // =========================================================

  const handleSave = () => {
    console.log("FINAL QUALITY REPORT", report);

    alert(
      "Report generation is complete. MongoDB save will be connected next.",
    );
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================
  //
  // PDF endpoint will be connected later.
  //
  // =========================================================

  const handleDownload = () => {
    alert("PDF report generation will be connected next.");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="final-report">
      <div className="final-report-card">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="final-report-header">
          <div>
            <span className="final-step-label">STEP 03 — FINAL ASSESSMENT</span>

            <h2>Final Coffee Bean Quality Report</h2>

            <p>
              Final quality assessment generated by combining the sensor-based
              assessment and physical AI inspection.
            </p>
          </div>

          <span className="report-status">Report Generated</span>
        </div>

        {/* =================================================
            REPORT INFORMATION
        ================================================= */}

        <div className="batch-information">
          <div>
            <span>Report ID</span>

            <strong>{report.report_id || "-"}</strong>
          </div>

          <div>
            <span>Generated</span>

            <strong>{generatedDate}</strong>
          </div>

          <div>
            <span>Sensor Analysis</span>

            <strong
              className={`assessment-value ${
                sensorAssessment.status?.toLowerCase() || ""
              }`}
            >
              {sensorAssessment.status || "-"}
            </strong>
          </div>

          <div>
            <span>Physical Analysis</span>

            <strong
              className={`assessment-value ${
                physicalAssessment.status?.toLowerCase() || ""
              }`}
            >
              {physicalAssessment.status || "-"}
            </strong>
          </div>
        </div>

        {/* =================================================
            SCORE
        ================================================= */}

        <div className="report-section-block">
          <QualityScore
            finalScore={finalScore}
            grade={grade}
            status={qualityStatus}
            sensorScore={sensorAssessment.sensor_score ?? 0}
            physicalScore={physicalAssessment.physical_score ?? 0}
          />
        </div>

        {/* =================================================
            ASSESSMENT SUMMARY
        ================================================= */}

        <div className="assessment-summary-grid">
          {/* SENSOR */}

          <div className="assessment-summary-card">
            <span className="assessment-label">SENSOR ASSESSMENT</span>

            <div className="assessment-score-row">
              <strong>
                {Number(sensorAssessment.sensor_score ?? 0).toFixed(2)}
              </strong>

              <small>/ 100</small>
            </div>

            <span
              className={`assessment-status ${
                sensorAssessment.status?.toLowerCase() || ""
              }`}
            >
              {sensorAssessment.status || "-"}
            </span>

            <div className="assessment-details">
              <div>
                <span>MQ-2 Response</span>

                <strong>{sensorAssessment.mq2_response ?? "-"}</strong>
              </div>

              <div>
                <span>MQ-135 Response</span>

                <strong>{sensorAssessment.mq135_response ?? "-"}</strong>
              </div>

              <div>
                <span>MQ-2 Score</span>

                <strong>{sensorAssessment.mq2_score ?? "-"}</strong>
              </div>

              <div>
                <span>MQ-135 Score</span>

                <strong>{sensorAssessment.mq135_score ?? "-"}</strong>
              </div>
            </div>
          </div>

          {/* PHYSICAL */}

          <div className="assessment-summary-card">
            <span className="assessment-label">PHYSICAL AI ASSESSMENT</span>

            <div className="assessment-score-row">
              <strong>
                {Number(physicalAssessment.physical_score ?? 0).toFixed(2)}
              </strong>

              <small>/ 100</small>
            </div>

            <span
              className={`assessment-status ${
                physicalAssessment.status?.toLowerCase() || ""
              }`}
            >
              {physicalAssessment.status || "-"}
            </span>

            <div className="assessment-details">
              <div>
                <span>Total Beans</span>

                <strong>{physicalAssessment.total_beans ?? 0}</strong>
              </div>

              <div>
                <span>Good</span>

                <strong>{physicalAssessment.counts?.good ?? 0}</strong>
              </div>

              <div>
                <span>Broken</span>

                <strong>{physicalAssessment.counts?.broken ?? 0}</strong>
              </div>

              <div>
                <span>Black</span>

                <strong>{physicalAssessment.counts?.black ?? 0}</strong>
              </div>

              <div>
                <span>Black + Broken</span>

                <strong>
                  {physicalAssessment.counts?.black_and_broken ?? 0}
                </strong>
              </div>

              <div>
                <span>Unknown</span>

                <strong>{physicalAssessment.counts?.unknown ?? 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FINAL DECISION
        ================================================= */}

        <div className="final-decision-card">
          <div>
            <span>FINAL QUALITY DECISION</span>

            <h3>Grade {grade}</h3>

            <p>
              {finalFinding?.description || `Final score: ${finalScore}/100.`}
            </p>
          </div>

          <div className="final-decision-right">
            <strong>{Number(finalScore).toFixed(2)}</strong>

            <small>/ 100</small>

            <span>{qualityStatus}</span>
          </div>
        </div>

        {/* =================================================
            FINDINGS
        ================================================= */}

        <div className="report-section-block">
          <QualityFindings
            sensorFindings={sensorFindings}
            physicalFindings={physicalFindings}
          />
        </div>

        {/* =================================================
            RECOMMENDATIONS
        ================================================= */}

        <div className="report-section-block">
          <Recommendations recommendations={report.recommendations || []} />
        </div>

        {/* =================================================
            PROCESSING INTELLIGENCE
       ================================================= */}

        {report.processing_intelligence && (
          <ProcessingIntelligence data={report.processing_intelligence} />
        )}

        {/* =================================================
            METHODOLOGY
        ================================================= */}

        <div className="methodology-card">
          <span>ASSESSMENT METHODOLOGY</span>

          <p>{report.methodology}</p>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <ReportActions
          onBack={onBack}
          onNewAnalysis={onNewAnalysis}
          onSave={handleSave}
          onDownload={handleDownload}
        />
      </div>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style>{`

        .final-report {
          margin-top: 30px;
        }


        .final-report-card {
          padding: 28px;

          border-radius: 28px;

          border:
            1px solid
            rgba(
              255,
              222,
              178,
              0.15
            );

          background:
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.095
              ),
              rgba(
                255,
                255,
                255,
                0.035
              )
            ),
            rgba(
              39,
              22,
              13,
              0.78
            );

          backdrop-filter:
            blur(20px);

          box-shadow:
            0 25px 70px
            rgba(
              0,
              0,
              0,
              0.3
            ),
            inset
            0 1px 0
            rgba(
              255,
              255,
              255,
              0.08
            );
        }


        /* =================================================
           HEADER
        ================================================= */

        .final-report-header {
          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 25px;

          margin-bottom: 24px;
        }


        .final-step-label {
          display: block;

          margin-bottom: 7px;

          color: #dfa15d;

          font-size: 11px;

          font-weight: 900;

          letter-spacing:
            1.7px;
        }


        .final-report-header h2 {
          margin: 0;

          color: #fff3e1;

          font-size: 28px;

          letter-spacing:
            -0.5px;
        }


        .final-report-header p {
          max-width: 680px;

          margin:
            9px 0 0;

          color:
            rgba(
              255,
              239,
              215,
              0.58
            );

          font-size: 14px;

          line-height: 1.6;
        }


        .report-status {
          flex-shrink: 0;

          padding:
            8px 12px;

          border-radius:
            999px;

          color: #a8e7b0;

          background:
            rgba(
              63,
              169,
              78,
              0.1
            );

          border:
            1px solid
            rgba(
              95,
              200,
              108,
              0.17
            );

          font-size: 11px;

          font-weight: 850;
        }


        /* =================================================
           INFORMATION
        ================================================= */

        .batch-information {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              1fr
            );

          gap: 11px;

          margin-bottom: 20px;
        }


        .batch-information > div {
          min-width: 0;

          padding: 14px;

          border-radius: 16px;

          background:
            rgba(
              0,
              0,
              0,
              0.14
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.08
            );
        }


        .batch-information span {
          display: block;

          margin-bottom: 5px;

          color:
            rgba(
              255,
              238,
              212,
              0.4
            );

          font-size: 9px;

          text-transform:
            uppercase;

          letter-spacing:
            0.7px;
        }


        .batch-information strong {
          display: block;

          overflow-wrap:
            anywhere;

          color: #ffe8c5;

          font-size: 11px;
        }


        /* =================================================
           SECTION
        ================================================= */

        .report-section-block {
          margin-top: 17px;

          padding: 20px;

          border-radius: 22px;

          background:
            rgba(
              0,
              0,
              0,
              0.11
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.08
            );
        }


        /* =================================================
           ASSESSMENT SUMMARY
        ================================================= */

        .assessment-summary-grid {
          margin-top: 17px;

          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 17px;
        }


        .assessment-summary-card {
          padding: 20px;

          border-radius: 22px;

          background:
            rgba(
              0,
              0,
              0,
              0.13
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.08
            );
        }


        .assessment-label {
          display: block;

          color: #dca05e;

          font-size: 9px;

          font-weight: 900;

          letter-spacing:
            1.2px;
        }


        .assessment-score-row {
          margin-top: 9px;

          display: flex;

          align-items:
            baseline;

          gap: 5px;
        }


        .assessment-score-row strong {
          color: #fff0da;

          font-size: 34px;

          line-height: 1;
        }


        .assessment-score-row small {
          color:
            rgba(
              255,
              235,
              207,
              0.42
            );

          font-size: 11px;
        }


        .assessment-status {
          display: inline-flex;

          margin-top: 10px;

          padding:
            6px 10px;

          border-radius:
            999px;

          color: #ffd397;

          background:
            rgba(
              255,
              211,
              151,
              0.08
            );

          border:
            1px solid
            rgba(
              255,
              211,
              151,
              0.12
            );

          font-size: 9px;

          font-weight: 900;
        }


        .assessment-status.good,
        .assessment-status.excellent {
          color: #a5e6ad;

          background:
            rgba(
              77,
              169,
              91,
              0.08
            );
        }


        .assessment-status.bad,
        .assessment-status.poor {
          color: #ffad96;

          background:
            rgba(
              196,
              69,
              47,
              0.08
            );
        }


        .assessment-details {
          margin-top: 16px;

          display: grid;

          grid-template-columns:
            repeat(
              2,
              1fr
            );

          gap: 9px;
        }


        .assessment-details > div {
          padding: 10px;

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );
        }


        .assessment-details span {
          display: block;

          margin-bottom: 4px;

          color:
            rgba(
              255,
              235,
              207,
              0.36
            );

          font-size: 8px;
        }


        .assessment-details strong {
          color: #f1dcc0;

          font-size: 11px;
        }


        /* =================================================
           FINAL DECISION
        ================================================= */

        .final-decision-card {
          margin-top: 17px;

          padding: 22px;

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap: 25px;

          border-radius: 22px;

          background:
            linear-gradient(
              135deg,
              rgba(
                218,
                147,
                79,
                0.11
              ),
              rgba(
                0,
                0,
                0,
                0.14
              )
            );

          border:
            1px solid
            rgba(
              255,
              211,
              150,
              0.12
            );
        }


        .final-decision-card > div:first-child {
          max-width: 680px;
        }


        .final-decision-card > div:first-child > span {
          display: block;

          color: #dfa15d;

          font-size: 9px;

          font-weight: 900;

          letter-spacing:
            1.3px;
        }


        .final-decision-card h3 {
          margin:
            6px 0 7px;

          color: #fff0d9;

          font-size: 24px;
        }


        .final-decision-card p {
          margin: 0;

          color:
            rgba(
              255,
              238,
              212,
              0.48
            );

          font-size: 12px;

          line-height: 1.6;
        }


        .final-decision-right {
          flex-shrink: 0;

          text-align: right;
        }


        .final-decision-right strong {
          color: #ffe2aa;

          font-size: 36px;
        }


        .final-decision-right small {
          margin-left: 4px;

          color:
            rgba(
              255,
              231,
              194,
              0.4
            );

          font-size: 10px;
        }


        .final-decision-right span {
          display: block;

          margin-top: 5px;

          color: #ffd49a;

          font-size: 11px;

          font-weight: 900;

          text-transform:
            uppercase;
        }


        /* =================================================
           METHODOLOGY
        ================================================= */

        .methodology-card {
          margin-top: 17px;

          padding: 17px;

          border-radius: 17px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.07
            );
        }


        .methodology-card span {
          display: block;

          margin-bottom: 7px;

          color: #dca05e;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1.2px;
        }


        .methodology-card p {
          margin: 0;

          color:
            rgba(
              255,
              235,
              207,
              0.4
            );

          font-size: 10px;

          line-height: 1.7;
        }


        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (
          max-width: 900px
        ) {
          .assessment-summary-grid {
            grid-template-columns:
              1fr;
          }


          .batch-information {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }
        }


        @media (
          max-width: 620px
        ) {
          .final-report-card {
            padding: 18px;
          }


          .final-report-header,
          .final-decision-card {
            flex-direction:
              column;

            align-items:
              flex-start;
          }


          .final-decision-right {
            text-align: left;
          }


          .batch-information {
            grid-template-columns:
              1fr;
          }


          .assessment-details {
            grid-template-columns:
              1fr;
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
