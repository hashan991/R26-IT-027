import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import FinalQualityReport from "../components/report/FinalQualityReport";

import "../styles/beanQuality.css";

import {
  getSavedBeanQualityReport,
} from "../services/qualityService";


function SavedQualityReportPage() {
  const navigate = useNavigate();

  const location = useLocation();

  const { reportId } = useParams();

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================================
  // QUERY PARAMS
  // =========================================================

  const searchParams =
    new URLSearchParams(
      location.search,
    );

  const autoDownload =
    searchParams.get("download") === "1";


  // =========================================================
  // LOAD SAVED REPORT FROM MONGODB
  // =========================================================

  const loadSavedReport = async () => {
    if (!reportId) {
      setError(
        "The saved report ID is missing.",
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError("");

      setReport(null);

      const data =
        await getSavedBeanQualityReport(
          reportId,
        );

      setReport(data);
    } catch (requestError) {
      console.error(
        "Unable to load saved report:",
        requestError,
      );

      if (
        requestError?.response?.status === 404
      ) {
        setError(
          "The requested quality report was not found. It may have been deleted.",
        );
      } else if (
        requestError?.response?.status !== 401
      ) {
        setError(
          requestError?.response?.data
            ?.detail ||
            "Unable to load the saved coffee bean quality report.",
        );
      }
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadSavedReport();
  }, [reportId]);


  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleBackToHistory = () => {
    navigate(
      "/beans/reports",
    );
  };


  const handleNewAnalysis = () => {
    navigate(
      "/beans",
    );
  };


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(date);
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="saved-report-page">
        <style>{pageStyles}</style>

        <div className="saved-report-shell">
          <div className="saved-report-state-card">
            <div className="saved-report-loader" />

            <span className="saved-report-kicker">
              QUALITY REPORT HISTORY
            </span>

            <h1>
              Loading Saved Report
            </h1>

            <p>
              Retrieving report{" "}
              <strong>
                {reportId || ""}
              </strong>{" "}
              from MongoDB.
            </p>
          </div>
        </div>
      </main>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error || !report) {
    return (
      <main className="saved-report-page">
        <style>{pageStyles}</style>

        <div className="saved-report-shell">
          <div className="saved-report-state-card error">
            <div className="saved-report-error-icon">
              !
            </div>

            <span className="saved-report-kicker">
              QUALITY REPORT HISTORY
            </span>

            <h1>
              Unable to Open Report
            </h1>

            <p>
              {error ||
                "No saved report data was returned."}
            </p>

            <div className="saved-report-state-actions">
              <button
                type="button"
                className="saved-page-button secondary"
                onClick={
                  handleBackToHistory
                }
              >
                ← Back to History
              </button>

              <button
                type="button"
                className="saved-page-button primary"
                onClick={
                  loadSavedReport
                }
              >
                ↻ Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="saved-report-page">
      <style>{pageStyles}</style>

      <div className="saved-report-shell">

        {/* =================================================
            HISTORY NAVIGATION
        ================================================= */}

        <section className="saved-report-toolbar">
          <div className="saved-report-toolbar-left">

            <button
              type="button"
              className="saved-page-button secondary"
              onClick={
                handleBackToHistory
              }
            >
              ← Report History
            </button>

            <div>
              <span>
                SAVED QUALITY REPORT
              </span>

              <strong>
                {report.report_id}
              </strong>
            </div>

          </div>

          <div className="saved-report-toolbar-meta">

            <div>
              <span>Saved</span>

              <strong>
                {formatDate(
                  report.saved_at,
                )}
              </strong>
            </div>

            <div>
              <span>Grade</span>

              <strong>
                {report.grade || "-"}
              </strong>
            </div>

            <div>
              <span>Score</span>

              <strong>
                {Number(
                  report.final_score || 0,
                ).toFixed(2)}
              </strong>
            </div>

          </div>
        </section>


        {/* =================================================
            REUSE THE SAME FINAL REPORT UI + PDF ENGINE
        ================================================= */}

        {/* =================================================
            SAVED REPORT — SAME STEP 03 RENDERING CONTEXT
        ================================================= */}

        <div className="bean-quality-page bean-quality-step-3 saved-report-live-theme">
          <div className="quality-container saved-report-quality-container">
            <section className="analysis-shell saved-report-analysis-shell">
              <FinalQualityReport
                sensorResult={
                  report.sensor_result || {}
                }
                physicalResult={
                  report.physical_result || {}
                }
                initialReport={report}
                savedMode
                autoDownload={
                  autoDownload
                }
                onBack={
                  handleBackToHistory
                }
                onNewAnalysis={
                  handleNewAnalysis
                }
              />
            </section>
          </div>
        </div>

      </div>
    </main>
  );
}


const pageStyles = `
  /*
    SavedQualityReportPage — exact Step 03 saved-report presentation

    IMPORTANT:
    This page only loads a saved report and passes the saved object
    back into FinalQualityReport through initialReport={report}.

    No changes to:
    - MongoDB/API calls
    - saved report data
    - score/grade logic
    - navigation
    - PDF generation
    - auto-download
  */

  .saved-report-page,
  .saved-report-page * {
    box-sizing: border-box;
  }

  .saved-report-page {
    min-height: 100vh;

    padding:
      28px
      clamp(14px, 3vw, 38px)
      60px;

    color: #2f211b;

    background:
      radial-gradient(
        circle at 88% 0%,
        rgba(199, 136, 69, 0.10),
        transparent 28%
      ),
      radial-gradient(
        circle at 8% 24%,
        rgba(97, 58, 41, 0.04),
        transparent 25%
      ),
      linear-gradient(
        180deg,
        #f7f2eb 0%,
        #f3e9de 50%,
        #f8f3ed 100%
      );

    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .saved-report-shell {
    width: min(1480px, 100%);
    margin: 0 auto;
  }

  /* =========================================================
     SAVED REPORT TOOLBAR
  ========================================================= */

  .saved-report-toolbar {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 22px;
    padding: 18px;

    overflow: hidden;

    border: 1px solid #e1d3c5;
    border-radius: 20px;

    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.98),
        rgba(250, 244, 237, 0.98)
      );

    box-shadow:
      0 14px 34px
      rgba(65, 41, 27, 0.07);
  }

  .saved-report-toolbar::after {
    content: "";

    position: absolute;

    width: 180px;
    height: 180px;

    top: -116px;
    right: -72px;

    border: 1px solid rgba(169, 109, 53, 0.10);
    border-radius: 50%;

    pointer-events: none;
  }

  .saved-report-toolbar-left {
    position: relative;
    z-index: 1;

    min-width: 0;

    display: flex;
    align-items: center;
    gap: 16px;
  }

  .saved-report-toolbar-left > div {
    min-width: 0;
  }

  .saved-report-toolbar-left span,
  .saved-report-toolbar-meta span {
    display: block;

    margin-bottom: 5px;

    color: #a96d35;

    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.09em;

    text-transform: uppercase;
  }

  .saved-report-toolbar-left strong {
    display: block;

    max-width: 520px;

    overflow: hidden;

    color: #351c13;

    font-size: 13px;
    font-weight: 800;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .saved-report-toolbar-meta {
    position: relative;
    z-index: 1;

    display: grid;

    grid-template-columns:
      repeat(3, minmax(96px, auto));

    gap: 10px;
  }

  .saved-report-toolbar-meta > div {
    min-width: 96px;

    padding: 10px 12px;

    border: 1px solid #e7ddd3;
    border-radius: 12px;

    background: rgba(255, 253, 249, 0.88);
  }

  .saved-report-toolbar-meta strong {
    display: block;

    color: #4b2a1d;

    font-size: 12px;
    font-weight: 850;
  }

  /* =========================================================
     BUTTONS
  ========================================================= */

  .saved-page-button {
    min-height: 42px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 0 15px;

    border-radius: 11px;

    cursor: pointer;

    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.02em;

    transition:
      transform 160ms ease,
      box-shadow 160ms ease,
      background 160ms ease,
      border-color 160ms ease;
  }

  .saved-page-button:hover {
    transform: translateY(-1px);

    box-shadow:
      0 8px 18px
      rgba(65, 41, 27, 0.10);
  }

  .saved-page-button.primary {
    color: #fffaf3;

    border: 1px solid #3d2117;

    background:
      linear-gradient(
        135deg,
        #4b2a1d,
        #351c13
      );
  }

  .saved-page-button.secondary {
    color: #613a29;

    border: 1px solid #d8c9ba;

    background: #fffdf9;
  }

  .saved-page-button.secondary:hover {
    border-color: #c9ad91;
    background: #f8eee4;
  }

  /* =========================================================
     LOADING / ERROR
  ========================================================= */

  .saved-report-state-card {
    min-height: 430px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 38px 30px;

    text-align: center;

    border: 1px solid #e2d6ca;
    border-radius: 22px;

    background:
      linear-gradient(
        145deg,
        #fffdf9,
        #fbf4ec
      );

    box-shadow:
      0 18px 45px
      rgba(65, 41, 27, 0.07);
  }

  .saved-report-state-card.error {
    border-color: #ead1cd;

    background:
      linear-gradient(
        145deg,
        #fffdf9,
        #fbefed
      );
  }

  .saved-report-kicker {
    color: #a96d35;

    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.12em;

    text-transform: uppercase;
  }

  .saved-report-state-card h1 {
    margin: 10px 0 0;

    color: #2f211b;

    font-family:
      Georgia,
      "Times New Roman",
      serif;

    font-size: 30px;
    font-weight: 500;
    line-height: 1.2;
  }

  .saved-report-state-card p {
    max-width: 640px;

    margin: 11px auto 0;

    color: #81736a;

    font-size: 13px;
    line-height: 1.65;
  }

  .saved-report-state-card p strong {
    color: #613a29;
  }

  .saved-report-loader {
    width: 50px;
    height: 50px;

    margin-bottom: 20px;

    border: 4px solid #e8ded4;
    border-top-color: #a96d35;
    border-radius: 50%;

    animation:
      savedReportSpin
      0.8s
      linear
      infinite;
  }

  .saved-report-error-icon {
    width: 56px;
    height: 56px;

    margin-bottom: 18px;

    display: grid;
    place-items: center;

    color: #a75147;

    border: 1px solid #e2b8b1;
    border-radius: 15px;

    background: #fbefed;

    font-size: 24px;
    font-weight: 900;
  }

  .saved-report-state-actions {
    display: flex;
    justify-content: center;

    gap: 10px;
    margin-top: 22px;
  }

  /* =========================================================
     EXACT LIVE STEP 03 HOST
  ========================================================= */

  /*
    The live BeanQualityPage renders FinalQualityReport inside:
      .bean-quality-page
        .quality-container
          .analysis-shell

    The saved page now recreates the same structure.
  */

  .saved-report-live-theme {
    --bq-bg: #f7f2eb;
    --bq-surface: #fffdf9;
    --bq-surface-soft: #fbf6ef;
    --bq-surface-warm: #f3e8d9;
    --bq-border: #e5dbcf;
    --bq-border-strong: #d8c9ba;
    --bq-ink: #2f211b;
    --bq-ink-soft: #604f45;
    --bq-muted: #81736a;
    --bq-coffee-950: #2b160f;
    --bq-coffee-900: #351c13;
    --bq-coffee-850: #3d2117;
    --bq-coffee-800: #4b2a1d;
    --bq-coffee-700: #613a29;
    --bq-caramel: #c78845;
    --bq-caramel-deep: #a96d35;
    --bq-caramel-soft: #f3e4d0;
    --bq-green: #68836e;
    --bq-green-deep: #496b53;
    --bq-green-soft: #edf5ee;
    --bq-red: #a75147;
    --bq-red-soft: #fbefed;
    --bq-amber: #a9772e;
    --bq-amber-soft: #fbf4e7;
    --bq-shadow: 0 18px 45px rgba(65, 41, 27, 0.08);
    --bq-shadow-soft: 0 8px 24px rgba(65, 41, 27, 0.055);

    min-height: 0 !important;

    margin: 22px 0 0 !important;
    padding: 0 !important;

    color: var(--bq-ink) !important;

    background: transparent !important;
  }

  .saved-report-quality-container {
    width: min(1320px, 100%) !important;

    margin: 0 auto !important;
    padding: 0 !important;
  }

  .saved-report-analysis-shell {
    margin: 0 !important;
    padding: 0 !important;

    border: 0 !important;
    border-radius: 0 !important;

    background: transparent !important;

    box-shadow: none !important;
    backdrop-filter: none !important;
  }

  /*
    Safety overrides:
    Even if FinalQualityReport still contains an older embedded dark style,
    the saved page keeps the same light report surface used by Step 03.
  */

  .saved-report-page
  .saved-report-live-theme
  .final-report {
    width: 100% !important;

    margin-top: 0 !important;

    color: var(--bq-ink) !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .final-report-card {
    width: 100% !important;

    padding: 24px !important;

    color: var(--bq-ink) !important;

    border: 1px solid var(--bq-border) !important;
    border-radius: 22px !important;

    background: var(--bq-surface) !important;

    box-shadow: var(--bq-shadow-soft) !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .report-read-guide {
    color: var(--bq-ink) !important;

    border: 1px solid #e7d8c8 !important;

    background: #fbf5ed !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .report-read-guide-heading strong,
  .saved-report-page
  .saved-report-live-theme
  .report-read-guide-item strong {
    color: var(--bq-ink) !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .report-read-guide-item small,
  .saved-report-page
  .saved-report-live-theme
  .report-group-heading p {
    color: var(--bq-muted) !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .batch-information {
    background: transparent !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .batch-information > div {
    color: var(--bq-ink) !important;

    border: 1px solid var(--bq-border) !important;

    background: #fffdf9 !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .batch-information span {
    color: var(--bq-muted) !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .batch-information strong {
    color: var(--bq-ink) !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .report-group-heading h3 {
    color: var(--bq-ink) !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .report-group-heading
  > div:nth-child(2)
  > span {
    color: var(--bq-caramel-deep) !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .report-group-number {
    color: var(--bq-coffee-800) !important;

    border: 1px solid #e1cfbc !important;

    background: #f5e9dc !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .report-section-block {
    background: transparent !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .methodology-card {
    color: var(--bq-ink-soft) !important;

    border: 1px solid var(--bq-border) !important;

    background: #fbf6ef !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .methodology-card span {
    color: var(--bq-caramel-deep) !important;
  }

  .saved-report-page
  .saved-report-live-theme
  .methodology-card p {
    color: var(--bq-muted) !important;
  }

  /* =========================================================
     ANIMATION
  ========================================================= */

  @keyframes savedReportSpin {
    to {
      transform: rotate(360deg);
    }
  }

  /* =========================================================
     RESPONSIVE
  ========================================================= */

  @media (max-width: 900px) {
    .saved-report-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .saved-report-toolbar-meta {
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 620px) {
    .saved-report-page {
      padding:
        16px
        10px
        42px;
    }

    .saved-report-toolbar {
      padding: 15px;
      border-radius: 16px;
    }

    .saved-report-toolbar-left {
      align-items: stretch;
      flex-direction: column;
    }

    .saved-report-toolbar-left strong {
      overflow: visible;
      text-overflow: clip;
      white-space: normal;
    }

    .saved-report-toolbar-meta {
      grid-template-columns: 1fr;
    }

    .saved-report-toolbar-meta > div {
      min-width: 0;
    }

    .saved-report-state-card {
      min-height: 380px;
      padding: 28px 18px;
    }

    .saved-report-state-card h1 {
      font-size: 25px;
    }

    .saved-report-state-actions {
      width: 100%;
      flex-direction: column;
    }

    .saved-report-state-actions
    .saved-page-button {
      width: 100%;
    }

    .saved-report-page
    .saved-report-live-theme
    .final-report-card {
      padding: 16px !important;
    }
  }
`;



export default SavedQualityReportPage;
