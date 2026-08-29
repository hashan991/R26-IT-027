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
  // PDF EXPORT
  // =========================================================

  const reportRef = useRef(null);

  const [pdfGenerating, setPdfGenerating] = useState(false);

//save repoart
  const [savingReport, setSavingReport] = useState(false);

  const [reportSaved, setReportSaved] = useState(false);

  // =========================================================
  // GENERATE REPORT FROM BACKEND
  // =========================================================

  useEffect(() => {
const generateReport = async () => {
  try {
    setLoading(true);
    setError("");
    setReport(null);

    console.log("===== SENSOR RESULT RECEIVED BY FINAL REPORT =====");
    console.log(sensorResult);

    console.log("===== PHYSICAL RESULT RECEIVED BY FINAL REPORT =====");
    console.log(physicalResult);

    const data = await generateBeanQualityReport(sensorResult, physicalResult);

    console.log("===== BACKEND FINAL REPORT RESPONSE =====");
    console.log(data);

    setReport(data);
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

  const handleDownload = async () => {
    if (pdfGenerating) {
      return;
    }

    if (!reportRef.current) {
      alert("Report content is not available.");
      return;
    }

    try {
      setPdfGenerating(true);

      // Wait until web fonts have finished loading so the PDF
      // closely matches the report shown in the browser.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const reportElement = reportRef.current;

      // -----------------------------------------------------
      // PDF SETTINGS
      // -----------------------------------------------------

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
      const blockGap = 3;

      const printableWidth = pageWidth - marginX * 2;
      const printableHeight =
        pageHeight - marginTop - marginBottom;

      const pageBackground = {
        r: 33,
        g: 21,
        b: 15,
      };

      let currentY = marginTop;

      const paintPageBackground = () => {
        pdf.setFillColor(
          pageBackground.r,
          pageBackground.g,
          pageBackground.b,
        );

        pdf.rect(
          0,
          0,
          pageWidth,
          pageHeight,
          "F",
        );
      };

      const createNewPage = () => {
        pdf.addPage();
        paintPageBackground();
        currentY = marginTop;
      };

      paintPageBackground();

      // -----------------------------------------------------
      // COLLECT PDF BLOCKS
      // -----------------------------------------------------
      //
      // Processing Intelligence is expanded into its internal
      // sections so the browser does not need to create one huge
      // canvas for all seven modules.
      //
      // -----------------------------------------------------

      const pdfBlocks = [];

      const addProcessingIntelligenceBlocks = (root) => {
        const children = Array.from(root.children);

        children.forEach((child) => {
          if (child.tagName === "STYLE") {
            return;
          }

          if (child.classList.contains("pdf-exclude")) {
            return;
          }

          if (child.classList.contains("pi-grid")) {
            const moduleSections = Array.from(
              child.querySelectorAll(
                ":scope > .pi-module-section",
              ),
            );

            if (moduleSections.length > 0) {
              moduleSections.forEach((section) => {
                pdfBlocks.push(section);
              });

              return;
            }
          }

          pdfBlocks.push(child);
        });
      };

      Array.from(reportElement.children).forEach(
        (child) => {
          if (child.tagName === "STYLE") {
            return;
          }

          if (child.classList.contains("pdf-exclude")) {
            return;
          }

          if (
            child.classList.contains(
              "processing-intelligence",
            )
          ) {
            addProcessingIntelligenceBlocks(child);
            return;
          }

          pdfBlocks.push(child);
        },
      );

      // -----------------------------------------------------
      // CANVAS -> JPEG
      // -----------------------------------------------------

      const canvasToJpeg = (canvas) =>
        canvas.toDataURL(
          "image/jpeg",
          0.94,
        );

      // -----------------------------------------------------
      // SAFE PAGE-BREAK POINTS
      // -----------------------------------------------------
      //
      // html2canvas produces a bitmap. If a tall bitmap is cut at
      // a fixed pixel height, cards/text can be sliced in half.
      // These selectors identify logical UI boundaries. Their top
      // and bottom Y positions are converted to canvas coordinates
      // and used as preferred PDF page-break positions.
      //
      // -----------------------------------------------------

      const SAFE_BREAK_SELECTORS = [
        ".pi-module-heading",

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

        // General top-level report blocks
        ".final-report-header",
        ".batch-information",
        ".report-section-block",
        ".assessment-summary-card",
        ".methodology-card",
      ];

      const getSafeBreakpoints = (sourceElement, canvas) => {
        if (!sourceElement || !canvas?.height) {
          return [];
        }

        const sourceRect =
          sourceElement.getBoundingClientRect();

        if (sourceRect.height <= 0) {
          return [];
        }

        const canvasScaleY =
          canvas.height / sourceRect.height;

        const points = [];

        sourceElement
          .querySelectorAll(
            SAFE_BREAK_SELECTORS.join(","),
          )
          .forEach((element) => {
            const rect =
              element.getBoundingClientRect();

            const top =
              (rect.top - sourceRect.top) *
              canvasScaleY;

            const bottom =
              (rect.bottom - sourceRect.top) *
              canvasScaleY;

            if (
              top > 2 &&
              top < canvas.height - 2
            ) {
              points.push(top);
            }

            if (
              bottom > 2 &&
              bottom < canvas.height - 2
            ) {
              points.push(bottom);
            }
          });

        return Array.from(
          new Set(
            points.map((point) =>
              Math.round(point),
            ),
          ),
        ).sort((a, b) => a - b);
      };

      // -----------------------------------------------------
      // ADD ONE CANVAS TO PDF
      // -----------------------------------------------------
      //
      // Small blocks stay together where possible. For a block
      // taller than one page, we prefer semantic DOM boundaries
      // instead of cutting at an arbitrary pixel row.
      //
      // -----------------------------------------------------

      const addCanvasToPdf = (canvas, sourceElement) => {
        if (!canvas.width || !canvas.height) {
          return;
        }

        const pxPerMm =
          canvas.width / printableWidth;

        const fullHeightMm =
          canvas.height / pxPerMm;

        const remainingHeight =
          pageHeight -
          marginBottom -
          currentY;

        // Entire block fits in the current page.
        if (
          fullHeightMm <= remainingHeight
        ) {
          pdf.addImage(
            canvasToJpeg(canvas),
            "JPEG",
            marginX,
            currentY,
            printableWidth,
            fullHeightMm,
            undefined,
            "FAST",
          );

          currentY +=
            fullHeightMm + blockGap;

          return;
        }

        // Entire block fits on one fresh page.
        if (
          fullHeightMm <= printableHeight
        ) {
          createNewPage();

          pdf.addImage(
            canvasToJpeg(canvas),
            "JPEG",
            marginX,
            currentY,
            printableWidth,
            fullHeightMm,
            undefined,
            "FAST",
          );

          currentY +=
            fullHeightMm + blockGap;

          return;
        }

        // The block itself is taller than one A4 page.
        // Start it on a new page when some previous content
        // already occupies the current page.
        if (currentY > marginTop + 0.5) {
          createNewPage();
        }

        const maxSliceHeightPx =
          Math.max(
            1,
            Math.floor(
              printableHeight * pxPerMm,
            ),
          );

        const safeBreakpoints =
          getSafeBreakpoints(
            sourceElement,
            canvas,
          );

        const chooseSafeSliceEnd = (
          startY,
          desiredEndY,
        ) => {
          if (desiredEndY >= canvas.height) {
            return canvas.height;
          }

          // Avoid creating tiny fragments. Prefer a semantic
          // breakpoint in roughly the last 65% of the page.
          const minimumUsefulEnd =
            startY +
            maxSliceHeightPx * 0.35;

          const candidates =
            safeBreakpoints.filter(
              (point) =>
                point > minimumUsefulEnd &&
                point <= desiredEndY - 8,
            );

          if (candidates.length > 0) {
            return candidates[
              candidates.length - 1
            ];
          }

          // If no preferred boundary exists before the page
          // limit, use the regular page limit as a fallback.
          // This should only happen when one individual card is
          // itself taller than a full A4 content area.
          return desiredEndY;
        };

        let sourceY = 0;

        while (sourceY < canvas.height) {
          const desiredEndY =
            Math.min(
              sourceY + maxSliceHeightPx,
              canvas.height,
            );

          const sliceEndY =
            chooseSafeSliceEnd(
              sourceY,
              desiredEndY,
            );

          const sliceHeightPx =
            Math.max(
              1,
              sliceEndY - sourceY,
            );

          const sliceCanvas =
            document.createElement("canvas");

          sliceCanvas.width =
            canvas.width;

          sliceCanvas.height =
            sliceHeightPx;

          const sliceContext =
            sliceCanvas.getContext("2d");

          sliceContext.fillStyle =
            "#21150f";

          sliceContext.fillRect(
            0,
            0,
            sliceCanvas.width,
            sliceCanvas.height,
          );

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

          const sliceHeightMm =
            sliceHeightPx / pxPerMm;

          pdf.addImage(
            canvasToJpeg(sliceCanvas),
            "JPEG",
            marginX,
            currentY,
            printableWidth,
            sliceHeightMm,
            undefined,
            "FAST",
          );

          sourceY = sliceEndY;

          if (sourceY < canvas.height) {
            createNewPage();
          } else {
            currentY +=
              sliceHeightMm +
              blockGap;
          }
        }
      };

      // -----------------------------------------------------
      // RENDER EACH REPORT BLOCK
      // -----------------------------------------------------

      for (const block of pdfBlocks) {
        const blockRect =
          block.getBoundingClientRect();

        if (
          blockRect.width <= 0 ||
          blockRect.height <= 0
        ) {
          continue;
        }

        const canvas =
          await html2canvas(block, {
            scale: 1.5,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#21150f",
            scrollX: 0,
            scrollY: -window.scrollY,
            windowWidth: Math.max(
              document.documentElement.clientWidth,
              1200,
            ),
            onclone: (clonedDocument) => {
              clonedDocument
                .querySelectorAll(".pdf-exclude")
                .forEach((element) => {
                  element.style.display = "none";
                });
            },
          });

        addCanvasToPdf(canvas, block);
      }

      // -----------------------------------------------------
      // PAGE NUMBERS
      // -----------------------------------------------------

      const totalPages =
        pdf.getNumberOfPages();

      for (
        let pageNumber = 1;
        pageNumber <= totalPages;
        pageNumber += 1
      ) {
        pdf.setPage(pageNumber);

        pdf.setTextColor(
          211,
          183,
          151,
        );

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

      // -----------------------------------------------------
      // PDF METADATA + FILE NAME
      // -----------------------------------------------------

      const rawReportId =
        report?.report_id ||
        "coffee-bean-quality-report";

      const safeReportId =
        String(rawReportId)
          .replace(
            /[<>:"/\\|?*\u0000-\u001F]/g,
            "-",
          )
          .trim();

      pdf.setProperties({
        title:
          `Coffee Bean Quality Report - ${rawReportId}`,
        subject:
          "Coffee bean sensor and physical AI quality assessment report",
        author:
          "Coffee Quality AI Platform",
        creator:
          "Coffee Quality AI Platform",
      });

      pdf.save(
        `${safeReportId || "coffee-bean-quality-report"}.pdf`,
      );
    } catch (downloadError) {
      console.error(
        "PDF generation failed:",
        downloadError,
      );

      alert(
        "Unable to generate the PDF report. Please try again.",
      );
    } finally {
      setPdfGenerating(false);
    }
  };

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
         SAMPLE WEIGHT ANALYSIS
          ================================================= */}

        <div className="report-section-block">
          <BeanWeightAssessment
            physicalResult={physicalResult}
            physicalAssessment={physicalAssessment}
          />
        </div>

        {/* =================================================
          ASSESSMENT SUMMARY
          ================================================= */}

        <div className="assessment-summary-grid">
          <SensorAssessmentCard sensorAssessment={sensorAssessment} />

          <PhysicalAssessmentCard physicalAssessment={physicalAssessment} />
        </div>

        {/* =================================================
            FINDINGS
        ================================================= */}

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

        <div className="pdf-exclude">
          <ReportActions
            onBack={onBack}
            onNewAnalysis={onNewAnalysis}
            onSave={handleSave}
            onDownload={handleDownload}
          />
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

  grid-template-columns: 1fr;

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
