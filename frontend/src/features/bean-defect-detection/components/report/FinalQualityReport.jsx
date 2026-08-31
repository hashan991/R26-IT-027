import { useEffect, useRef, useState } from "react";

import QualityScore from "./QualityScore";
import QualityFindings from "./QualityFindings";
import Recommendations from "./Recommendations";
import ReportActions from "./ReportActions";
import SensorAssessmentCard from "./SensorAssessmentCard";
import PhysicalAssessmentCard from "./PhysicalAssessmentCard";
import BeanWeightAssessment from "./BeanWeightAssessment";

import {
  generateBeanQualityReport,
  saveBeanQualityReport,
} from "../../services/qualityService";

import ProcessingIntelligence from "./processing/ProcessingIntelligence";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function FinalQualityReport({
  sensorResult,
  physicalResult,
  onBack,
  onNewAnalysis,
  initialReport = null,
  savedMode = false,
  autoDownload = false,
}) {
  // =========================================================
  // REPORT STATE
  // =========================================================

  const [report, setReport] = useState(initialReport || null);

  // =========================================================
  // LOADING
  // =========================================================

  const [loading, setLoading] = useState(!initialReport);

  // =========================================================
  // ERROR
  // =========================================================

  const [error, setError] = useState("");

  // =========================================================
  // PDF EXPORT
  // =========================================================

  const reportRef = useRef(null);

  const [pdfGenerating, setPdfGenerating] = useState(false);

  //save repoart
  const [savingReport, setSavingReport] = useState(false);

  const [reportSaved, setReportSaved] = useState(Boolean(initialReport));

  const autoDownloadTriggeredRef = useRef(false);

  // =========================================================
  // GENERATE REPORT FROM BACKEND
  // =========================================================

  useEffect(() => {
    if (initialReport) {
      setReport(initialReport);
      setLoading(false);
      setError("");
      setReportSaved(true);
      autoDownloadTriggeredRef.current = false;

      return;
    }

    const generateReport = async () => {
      try {
        setLoading(true);
        setError("");
        setReport(null);
        setReportSaved(false);

        console.log("===== SENSOR RESULT RECEIVED BY FINAL REPORT =====");
        console.log(sensorResult);

        console.log("===== PHYSICAL RESULT RECEIVED BY FINAL REPORT =====");
        console.log(physicalResult);

        const data = await generateBeanQualityReport(
          sensorResult,
          physicalResult,
        );

        console.log("===== BACKEND FINAL REPORT RESPONSE =====");
        console.log(data);

        if (!data) {
          throw new Error("Backend returned an empty final report response.");
        }

        setReport(data);

        console.log(
          "===== FINAL REPORT READY FOR RENDER =====",
          data?.report_id,
        );
      } catch (requestError) {
        console.error("Final report generation failed:", requestError);

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
  }, [initialReport, sensorResult, physicalResult]);

  // =========================================================
  // RETRY REPORT GENERATION
  // =========================================================

  const handleRetry = async () => {
    if (initialReport) {
      setError("");
      setReport(initialReport);
      setLoading(false);

      return;
    }

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
  // AUTO DOWNLOAD FOR SAVED HISTORY REPORT
  // IMPORTANT:
  // Hooks must execute before any conditional return.
  // =========================================================

  useEffect(() => {
    if (
      !autoDownload ||
      !report ||
      loading ||
      error ||
      autoDownloadTriggeredRef.current
    ) {
      return;
    }

    autoDownloadTriggeredRef.current = true;

    const timer = window.setTimeout(() => {
      handleDownload();
    }, 650);

    return () => window.clearTimeout(timer);
  }, [autoDownload, report, loading, error]);

  // =========================================================
  // LOADING UI
  // =========================================================

  if (loading) {
    return (
      <section className="final-report">
        <div className="final-report-loading-card">
          <div className="report-loader"></div>

          <h2>
            {savedMode
              ? "Loading Saved Quality Report"
              : "Generating Final Quality Report"}
          </h2>

          <p>
            {savedMode
              ? "Preparing the saved coffee bean quality assessment for viewing."
              : "Combining sensor analysis and physical AI results to calculate the final coffee bean quality assessment."}
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

  const handleSave = async () => {
    if (!report) {
      alert("No report is available to save.");

      return;
    }

    if (savingReport) {
      return;
    }

    try {
      setSavingReport(true);

      const response = await saveBeanQualityReport(report);

      console.log("REPORT SAVED:", response);

      setReportSaved(true);

      alert(`Report ${response.report_id} saved successfully.`);
    } catch (saveError) {
      console.error("Report save failed:", saveError);

      alert(
        saveError.response?.data?.detail ||
          "Unable to save the report. Please try again.",
      );
    } finally {
      setSavingReport(false);
    }
  };

  // =========================================================
  // DOWNLOAD FULL REPORT AS PDF
  // =========================================================
  //
  // The report is rendered in smaller logical blocks instead of
  // capturing one extremely tall canvas. This is safer for long
  // reports containing all 7 Processing Intelligence modules.
  //
  // =========================================================

  async function handleDownload() {
    if (pdfGenerating) {
      return;
    }

    if (!reportRef.current) {
      alert("Report content is not available.");
      return;
    }

    try {
      setPdfGenerating(true);

      // Wait for fonts before taking the snapshot.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const reportElement = reportRef.current;

      // Give the browser one frame to finish any pending layout/paint.
      await new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });

      // =====================================================
      // PDF SETTINGS
      // =====================================================

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const marginX = 7;
      const marginTop = 7;
      const marginBottom = 10;

      const printableWidth = pageWidth - marginX * 2;
      const printableHeight = pageHeight - marginTop - marginBottom;

      /*
        IMPORTANT:
        The previous exporter rendered every top-level report section as a
        separate canvas. If the next section did not fit in the remaining
        page space, it was moved to a completely new page. That is why the
        downloaded PDF contained very large empty areas.

        The new exporter captures the SAME final report as ONE continuous
        canvas, then slices that canvas into A4 pages. This keeps the PDF
        visually much closer to the generated report shown in the browser.
      */

      // =====================================================
      // SAFE PAGE-BREAK ELEMENTS
      // =====================================================

      const SAFE_BREAK_SELECTORS = [
        // Main report structure
        ".final-report-header",
        ".report-read-guide",
        ".batch-information",
        ".report-group-heading",
        ".report-section-block",
        ".methodology-card",

        // Executive result
        ".quality-result-card",
        ".grade-display",
        ".score-summary",

        // Weight
        ".bean-weight-card",
        ".weight-main-panel",
        ".weight-information-grid",
        ".weight-trace",
        ".weight-note",

        // Sensor assessment
        ".sensor-assessment-card",
        ".sensor-status-panel",
        ".sensor-voting-summary",
        ".sensor-grid",
        ".sensor-card",
        ".sensor-legend",
        ".sensor-note",

        // Physical assessment
        ".physical-assessment-card",
        ".physical-status-panel",
        ".physical-overview",
        ".physical-category-heading",
        ".physical-category-grid",
        ".physical-category-card",
        ".distribution-summary",
        ".physical-note",

        // Explainability
        ".quality-findings",
        ".explanation-section",
        ".reason-box",
        ".final-status-explanation",
        ".primary-sensor-evidence",
        ".sensor-evidence-card",
        ".decision-logic-box",
        ".xai-finding-item",
        ".physical-detection-grid",
        ".detection-card",
        ".physical-score-trace",

        // Recommendations
        ".recommendations-section",
        ".recommendation-card",
        ".recommendation-item",

        // Processing Intelligence parent
        ".processing-intelligence",
        ".pi-header",
        ".pi-flow",
        ".pi-module-heading",
        ".pi-module-section",
        ".pi-warning",
        ".pi-methodology",

        // Module 1
        ".roasting-hero",
        ".roasting-section",
        ".roasting-trigger",
        ".roasting-direction-card",
        ".roasting-info-card",
        ".roasting-list-card",
        ".roasting-methodology",

        // Module 2
        ".pre-roast-hero",
        ".pre-roast-section",
        ".pre-roast-action",
        ".pre-roast-control",
        ".pre-roast-summary-card",
        ".pre-roast-methodology",

        // Module 3
        ".roast-risk-hero",
        ".roast-risk-section",
        ".roast-risk-item",
        ".roast-risk-summary-card",
        ".roast-risk-control-item",
        ".roast-risk-methodology",

        // Module 4
        ".batch-usage-hero",
        ".batch-usage-section",
        ".batch-usage-item",
        ".batch-usage-control",
        ".batch-usage-summary-card",
        ".batch-usage-option",
        ".batch-usage-restriction",
        ".batch-usage-methodology",

        // Module 5
        ".yield-hero",
        ".yield-section",
        ".yield-outcome-card",
        ".yield-category",
        ".yield-control",
        ".yield-summary-card",
        ".yield-weight-card",
        ".yield-interpretation",
        ".yield-methodology",

        // Module 6
        ".storage-hero",
        ".storage-section",
        ".storage-control",
        ".storage-recommendation",
        ".storage-recommendation-card",
        ".storage-item",
        ".storage-methodology",

        // Module 7
        ".preventive-guidance-header",
        ".preventive-guidance-metrics",
        ".preventive-guidance-card",
        ".preventive-guidance-item",
        ".preventive-empty-state",
        ".preventive-methodology",
      ];

      // =====================================================
      // GET SAFE BREAKPOINTS FROM THE LIVE DOM
      // =====================================================

      const sourceRect = reportElement.getBoundingClientRect();

      const domBreakpoints = [];

      reportElement
        .querySelectorAll(SAFE_BREAK_SELECTORS.join(","))
        .forEach((element) => {
          // Action buttons are not part of the PDF.
          if (
            element.classList.contains("pdf-exclude") ||
            element.closest(".pdf-exclude")
          ) {
            return;
          }

          const rect = element.getBoundingClientRect();

          const top = rect.top - sourceRect.top;
          const bottom = rect.bottom - sourceRect.top;

          if (top > 4 && top < sourceRect.height - 4) {
            domBreakpoints.push(top);
          }

          if (bottom > 4 && bottom < sourceRect.height - 4) {
            domBreakpoints.push(bottom);
          }
        });

      // =====================================================
      // CAPTURE THE COMPLETE REPORT ONCE
      // =====================================================

      const canvas = await html2canvas(reportElement, {
        scale: 1.35,
        useCORS: true,
        allowTaint: false,
        logging: false,

        /*
          null means: preserve the real report background exactly as it is
          rendered in the browser instead of forcing an artificial dark or
          light background on every individual report section.
        */
        backgroundColor: null,

        scrollX: 0,
        scrollY: -window.scrollY,

        windowWidth: Math.max(
          document.documentElement.clientWidth,
          Math.ceil(reportElement.scrollWidth),
          1200,
        ),

        onclone: (clonedDocument) => {
          // Buttons/actions should never appear inside the PDF.
          clonedDocument.querySelectorAll(".pdf-exclude").forEach((element) => {
            element.style.display = "none";
          });

          /*
            Keep the same Step 03 theme context in the cloned DOM.
            No component colors/layouts are rewritten here; these variables
            only ensure the clone resolves the same shared theme tokens.
          */
          const clonedReport = clonedDocument.querySelector(".final-report");

          if (clonedReport) {
            clonedReport.style.setProperty("--bq-bg", "#f7f2eb");
            clonedReport.style.setProperty("--bq-surface", "#fffdf9");
            clonedReport.style.setProperty("--bq-surface-soft", "#fbf6ef");
            clonedReport.style.setProperty("--bq-surface-warm", "#f3e8d9");
            clonedReport.style.setProperty("--bq-border", "#e5dbcf");
            clonedReport.style.setProperty("--bq-border-strong", "#d8c9ba");
            clonedReport.style.setProperty("--bq-ink", "#2f211b");
            clonedReport.style.setProperty("--bq-ink-soft", "#604f45");
            clonedReport.style.setProperty("--bq-muted", "#81736a");
            clonedReport.style.setProperty("--bq-coffee-950", "#2b160f");
            clonedReport.style.setProperty("--bq-coffee-900", "#351c13");
            clonedReport.style.setProperty("--bq-coffee-800", "#4b2a1d");
            clonedReport.style.setProperty("--bq-caramel-deep", "#a96d35");
            clonedReport.style.setProperty("--bq-green-deep", "#496b53");
            clonedReport.style.setProperty("--bq-green-soft", "#edf5ee");
            clonedReport.style.setProperty("--bq-red", "#a75147");
          }
        },
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("The report canvas could not be generated.");
      }

      // =====================================================
      // MAP DOM BREAKPOINTS TO CANVAS PIXELS
      // =====================================================

      const canvasScaleY =
        sourceRect.height > 0 ? canvas.height / sourceRect.height : 1;

      const safeBreakpoints = Array.from(
        new Set(
          domBreakpoints
            .map((point) => Math.round(point * canvasScaleY))
            .filter((point) => point > 5 && point < canvas.height - 5),
        ),
      ).sort((a, b) => a - b);

      // =====================================================
      // A4 SLICE SETTINGS
      // =====================================================

      const pxPerMm = canvas.width / printableWidth;

      const maxSliceHeightPx = Math.max(
        1,
        Math.floor(printableHeight * pxPerMm),
      );

      const pageBackground = {
        r: 247,
        g: 242,
        b: 235,
      };

      const paintPageBackground = () => {
        pdf.setFillColor(pageBackground.r, pageBackground.g, pageBackground.b);

        pdf.rect(0, 0, pageWidth, pageHeight, "F");
      };

      const chooseSafeSliceEnd = (startY, desiredEndY) => {
        if (desiredEndY >= canvas.height) {
          return canvas.height;
        }

        /*
          Prefer a logical boundary only when it is close to the natural
          A4 page bottom. This avoids the huge blank areas produced by the
          old block-by-block exporter.

          A safe point must use at least 82% of the available page height.
        */
        const minimumUsefulEnd = startY + maxSliceHeightPx * 0.82;

        const candidates = safeBreakpoints.filter(
          (point) => point >= minimumUsefulEnd && point <= desiredEndY - 6,
        );

        if (candidates.length > 0) {
          return candidates[candidates.length - 1];
        }

        // No nearby safe boundary: use the normal page bottom.
        return desiredEndY;
      };

      // =====================================================
      // CONTINUOUS CANVAS -> A4 PAGES
      // =====================================================

      let sourceY = 0;
      let firstPage = true;

      while (sourceY < canvas.height) {
        if (!firstPage) {
          pdf.addPage();
        }

        firstPage = false;

        paintPageBackground();

        const desiredEndY = Math.min(sourceY + maxSliceHeightPx, canvas.height);

        const sliceEndY = chooseSafeSliceEnd(sourceY, desiredEndY);

        const sliceHeightPx = Math.max(1, sliceEndY - sourceY);

        const sliceCanvas = document.createElement("canvas");

        sliceCanvas.width = canvas.width;

        sliceCanvas.height = sliceHeightPx;

        const sliceContext = sliceCanvas.getContext("2d");

        /*
          The canvas itself already contains the real report background.
          This fallback only covers any transparent pixels at its edge.
        */
        sliceContext.fillStyle = "#fffdf9";

        sliceContext.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        sliceContext.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx,
        );

        const sliceHeightMm = sliceHeightPx / pxPerMm;

        pdf.addImage(
          sliceCanvas.toDataURL("image/jpeg", 0.94),
          "JPEG",
          marginX,
          marginTop,
          printableWidth,
          sliceHeightMm,
          undefined,
          "FAST",
        );

        sourceY = sliceEndY;
      }

      // =====================================================
      // PAGE NUMBERS
      // =====================================================

      const totalPages = pdf.getNumberOfPages();

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        pdf.setPage(pageNumber);

        pdf.setTextColor(96, 79, 69);

        pdf.setFontSize(7.5);

        pdf.text(
          `Coffee Bean Quality Report  |  Page ${pageNumber} of ${totalPages}`,
          pageWidth - marginX,
          pageHeight - 4,
          {
            align: "right",
          },
        );
      }

      // =====================================================
      // PDF METADATA + FILE NAME
      // =====================================================

      const rawReportId = report?.report_id || "coffee-bean-quality-report";

      const safeReportId = String(rawReportId)
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
        .trim();

      pdf.setProperties({
        title: `Coffee Bean Quality Report - ${rawReportId}`,
        subject: "Coffee bean sensor and physical AI quality assessment report",
        author: "Coffee Quality AI Platform",
        creator: "Coffee Quality AI Platform",
      });

      pdf.save(`${safeReportId || "coffee-bean-quality-report"}.pdf`);
    } catch (downloadError) {
      console.error("PDF generation failed:", downloadError);

      alert("Unable to generate the PDF report. Please try again.");
    } finally {
      setPdfGenerating(false);
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="final-report">
      <div className="final-report-card" ref={reportRef}>
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="final-report-header">
          <div>
            <span className="final-step-label">
              {savedMode
                ? "SAVED REPORT — HISTORICAL ASSESSMENT"
                : "STEP 03 — FINAL ASSESSMENT"}
            </span>

            <h2>Final Coffee Bean Quality Report</h2>

            <p>
              {savedMode
                ? "Previously saved coffee bean quality assessment loaded from report history."
                : "Final quality assessment generated by combining the sensor-based assessment and physical AI inspection."}
            </p>
          </div>

          <span className="report-status">
            {savedMode
              ? "Saved Report"
              : reportSaved
                ? "Report Saved"
                : "Report Generated"}
          </span>
        </div>

        {/* =================================================
            REPORT READING GUIDE
        ================================================= */}

        <div className="report-read-guide">
          <div className="report-read-guide-heading">
            <div>
              <span>HOW TO READ THIS REPORT</span>
              <strong>
                Start with the decision, then review the evidence and actions.
              </strong>
            </div>

            <span className="report-read-guide-badge">Complete Assessment</span>
          </div>

          <div className="report-read-guide-grid">
            <div className="report-read-guide-item">
              <span>01</span>
              <div>
                <strong>Final Decision</strong>
                <small>Grade, status and overall quality score.</small>
              </div>
            </div>

            <div className="report-read-guide-item">
              <span>02</span>
              <div>
                <strong>Inspection Evidence</strong>
                <small>
                  Sensor, weight and physical AI assessment details.
                </small>
              </div>
            </div>

            <div className="report-read-guide-item">
              <span>03</span>
              <div>
                <strong>Why This Result</strong>
                <small>Explainable decision trace and detected findings.</small>
              </div>
            </div>

            <div className="report-read-guide-item">
              <span>04</span>
              <div>
                <strong>What To Do Next</strong>
                <small>
                  Recommendations and pre-roast processing guidance.
                </small>
              </div>
            </div>
          </div>
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

        <div className="report-group-heading report-group-heading-primary">
          <div className="report-group-number">01</div>
          <div>
            <span>EXECUTIVE QUALITY DECISION</span>
            <h3>Final Quality Result</h3>
            <p>Review the overall grade and the two assessment scores first.</p>
          </div>
        </div>

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
         SAMPLE WEIGHT ANALYSIS
          ================================================= */}

        <div className="report-group-heading">
          <div className="report-group-number">02</div>
          <div>
            <span>INSPECTION EVIDENCE</span>
            <h3>Sample & Assessment Details</h3>
            <p>
              Supporting weight, sensor and physical AI evidence used by the
              report.
            </p>
          </div>
        </div>

        <div className="report-section-block">
          <BeanWeightAssessment
            physicalResult={report.physical_result || physicalResult || {}}
            physicalAssessment={physicalAssessment}
          />
        </div>

        {/* =================================================
          ASSESSMENT SUMMARY
          ================================================= */}

        <div className="assessment-summary-stacked">
          <div className="assessment-summary-item">
            <SensorAssessmentCard sensorAssessment={sensorAssessment} />
          </div>

          <div className="assessment-summary-item">
            <PhysicalAssessmentCard physicalAssessment={physicalAssessment} />
          </div>
        </div>

        {/* =================================================
            FINDINGS
        ================================================= */}

        <div className="report-group-heading">
          <div className="report-group-number">03</div>
          <div>
            <span>EXPLAINABLE QUALITY ANALYSIS</span>
            <h3>Why the System Reached This Decision</h3>
            <p>
              Follow the evidence, rules and score contribution behind the final
              result.
            </p>
          </div>
        </div>

        <div className="report-section-block">
          <QualityFindings
            finalScore={finalScore}
            grade={grade}
            qualityStatus={qualityStatus}
            sensorFindings={sensorFindings}
            physicalFindings={physicalFindings}
            sensorAssessment={sensorAssessment}
            physicalAssessment={physicalAssessment}
            sensorWeight={report.sensor_weight ?? 0.5}
            physicalWeight={report.physical_weight ?? 0.5}
          />
        </div>

        {/* =================================================
            RECOMMENDATIONS
        ================================================= 

        <div className="report-group-heading">
          <div className="report-group-number">04</div>
          <div>
            <span>DECISION SUPPORT</span>
            <h3>Recommended Quality Actions</h3>
            <p>
              Use these defect-driven actions before moving the batch forward.
            </p>
          </div>
        </div>

        <div className="report-section-block">
          <Recommendations recommendations={report.recommendations || []} />
        </div>*/}

        {/* =================================================
            PROCESSING INTELLIGENCE
       ================================================= */}

        {report.processing_intelligence && (
          <>
            <div className="report-group-heading report-group-heading-processing">
              <div className="report-group-number">05</div>
              <div>
                <span>PRE-ROAST MANUFACTURING INTELLIGENCE</span>
                <h3>Processing Guidance</h3>
                <p>
                  Translate detected defects into readiness, risk, usage, yield,
                  storage and prevention guidance.
                </p>
              </div>
            </div>

            <ProcessingIntelligence data={report.processing_intelligence} />
          </>
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

        <div className="pdf-exclude">
          {savedMode ? (
            <div className="saved-report-actions">
              <button
                type="button"
                className="saved-report-action secondary"
                onClick={onBack}
              >
                ← Back to History
              </button>

              <button
                type="button"
                className="saved-report-action primary"
                onClick={handleDownload}
                disabled={pdfGenerating}
              >
                {pdfGenerating ? "Generating PDF..." : "Download PDF"}
              </button>

              <button
                type="button"
                className="saved-report-action secondary"
                onClick={onNewAnalysis}
              >
                New Analysis
              </button>
            </div>
          ) : (
            <ReportActions
              onBack={onBack}
              onNewAnalysis={onNewAnalysis}
              onSave={handleSave}
              onDownload={handleDownload}
            />
          )}
        </div>
      </div>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style>{`

        .final-report {
          margin-top: 30px;
        }


        .pdf-exclude {
          width: 100%;
        }


        .saved-report-actions {
          margin-top: 20px;

          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 10px;

          flex-wrap: wrap;
        }


        .saved-report-action {
          min-height: 42px;

          padding:
            0 16px;

          border-radius: 12px;

          cursor: pointer;

          font-size: 10px;

          font-weight: 900;

          letter-spacing:
            0.04em;

          text-transform:
            uppercase;

          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            opacity 160ms ease;
        }


        .saved-report-action:hover:not(:disabled) {
          transform:
            translateY(-1px);

          box-shadow:
            0 8px 20px
            rgba(
              0,
              0,
              0,
              0.16
            );
        }


        .saved-report-action.primary {
          border: none;

          color: #2c190f;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d79656
            );
        }


        .saved-report-action.secondary {
          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.13
            );

          color: #f3d7b2;

          background:
            rgba(
              255,
              255,
              255,
              0.045
            );
        }


        .saved-report-action:disabled {
          opacity: 0.55;

          cursor: wait;
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

        .final-report .final-report-card .assessment-summary-stacked {
          width: 100% !important;
          margin-top: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 22px !important;
        }

        .final-report .final-report-card .assessment-summary-item {
          width: 100% !important;
          min-width: 0 !important;
          display: block !important;
        }

        .final-report .final-report-card .assessment-summary-item > * {
          width: 100% !important;
          max-width: none !important;
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
          .assessment-summary-stacked {
            flex-direction: column !important;
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


          .saved-report-actions {
            align-items:
              stretch;

            flex-direction:
              column;
          }


          .saved-report-action {
            width: 100%;
          }
        }

      `}</style>
    </section>
  );
}

export default FinalQualityReport;
