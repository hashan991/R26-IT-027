import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import FinalQualityReport from "../components/report/FinalQualityReport";

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

      </div>
    </main>
  );
}


const pageStyles = `
  .saved-report-page {
    min-height: 100vh;

    padding:
      28px
      clamp(14px, 3vw, 38px)
      60px;

    background:
      radial-gradient(
        circle at 85% 0%,
        rgba(173, 111, 62, 0.13),
        transparent 28%
      ),
      linear-gradient(
        180deg,
        #1a110c 0%,
        #24170f 45%,
        #1a110c 100%
      );

    color: #f5e8d6;

    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .saved-report-page * {
    box-sizing: border-box;
  }

  .saved-report-shell {
    width: min(
      1500px,
      100%
    );

    margin: 0 auto;
  }

  .saved-report-toolbar {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 20px;

    padding: 16px;

    border:
      1px solid
      rgba(
        255,
        220,
        170,
        0.11
      );

    border-radius: 18px;

    background:
      linear-gradient(
        145deg,
        rgba(
          255,
          255,
          255,
          0.07
        ),
        rgba(
          255,
          255,
          255,
          0.025
        )
      );

    box-shadow:
      0 18px 45px
      rgba(
        0,
        0,
        0,
        0.18
      );

    backdrop-filter:
      blur(16px);
  }

  .saved-report-toolbar-left {
    min-width: 0;

    display: flex;

    align-items: center;

    gap: 15px;
  }

  .saved-report-toolbar-left > div {
    min-width: 0;
  }

  .saved-report-toolbar-left span,
  .saved-report-toolbar-meta span {
    display: block;

    margin-bottom: 4px;

    color:
      rgba(
        240,
        199,
        150,
        0.55
      );

    font-size: 8px;

    font-weight: 900;

    letter-spacing:
      0.09em;
  }

  .saved-report-toolbar-left strong {
    display: block;

    overflow: hidden;

    text-overflow:
      ellipsis;

    color: #f8dfc0;

    font-size: 12px;

    white-space: nowrap;
  }

  .saved-report-toolbar-meta {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(
          80px,
          auto
        )
      );

    gap: 10px;
  }

  .saved-report-toolbar-meta > div {
    padding:
      9px 11px;

    border-radius: 11px;

    background:
      rgba(
        255,
        255,
        255,
        0.035
      );
  }

  .saved-report-toolbar-meta strong {
    color: #f2d7b7;

    font-size: 10px;
  }

  .saved-page-button {
    min-height: 40px;

    padding:
      0 14px;

    border-radius: 11px;

    cursor: pointer;

    font-size: 10px;

    font-weight: 900;

    transition:
      transform
      160ms ease,
      box-shadow
      160ms ease;
  }

  .saved-page-button:hover {
    transform:
      translateY(-1px);

    box-shadow:
      0 8px 18px
      rgba(
        0,
        0,
        0,
        0.15
      );
  }

  .saved-page-button.primary {
    border: none;

    color: #2d190f;

    background:
      linear-gradient(
        135deg,
        #ffe0a3,
        #d69150
      );
  }

  .saved-page-button.secondary {
    border:
      1px solid
      rgba(
        255,
        220,
        170,
        0.12
      );

    color: #f1d5b1;

    background:
      rgba(
        255,
        255,
        255,
        0.045
      );
  }

  .saved-report-state-card {
    min-height: 400px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content:
      center;

    padding: 34px;

    text-align: center;

    border:
      1px solid
      rgba(
        255,
        220,
        170,
        0.12
      );

    border-radius: 26px;

    background:
      rgba(
        43,
        27,
        18,
        0.88
      );

    box-shadow:
      0 25px 70px
      rgba(
        0,
        0,
        0,
        0.24
      );
  }

  .saved-report-state-card.error {
    border-color:
      rgba(
        255,
        130,
        105,
        0.18
      );
  }

  .saved-report-kicker {
    color: #d99b59;

    font-size: 9px;

    font-weight: 900;

    letter-spacing:
      0.12em;
  }

  .saved-report-state-card h1 {
    margin:
      9px 0 0;

    color: #fff0db;

    font-size: 25px;
  }

  .saved-report-state-card p {
    max-width: 620px;

    margin:
      10px auto 0;

    color:
      rgba(
        255,
        235,
        207,
        0.52
      );

    font-size: 12px;

    line-height: 1.65;
  }

  .saved-report-state-card p strong {
    color: #efc796;
  }

  .saved-report-loader {
    width: 48px;

    height: 48px;

    margin-bottom: 18px;

    border-radius: 50%;

    border:
      4px solid
      rgba(
        255,
        214,
        157,
        0.13
      );

    border-top-color:
      #dfa15d;

    animation:
      savedReportSpin
      0.8s
      linear
      infinite;
  }

  .saved-report-error-icon {
    width: 54px;

    height: 54px;

    margin-bottom: 17px;

    display: grid;

    place-items: center;

    border-radius: 16px;

    color: #38170f;

    background: #ef9079;

    font-size: 26px;

    font-weight: 950;
  }

  .saved-report-state-actions {
    display: flex;

    justify-content:
      center;

    gap: 10px;

    margin-top: 20px;
  }

  @keyframes savedReportSpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  @media (
    max-width: 850px
  ) {
    .saved-report-toolbar {
      align-items:
        stretch;

      flex-direction:
        column;
    }

    .saved-report-toolbar-meta {
      grid-template-columns:
        repeat(
          3,
          1fr
        );
    }
  }

  @media (
    max-width: 580px
  ) {
    .saved-report-page {
      padding:
        16px
        10px
        40px;
    }

    .saved-report-toolbar-left {
      align-items:
        stretch;

      flex-direction:
        column;
    }

    .saved-report-toolbar-meta {
      grid-template-columns:
        1fr;
    }

    .saved-report-state-actions {
      width: 100%;

      flex-direction:
        column;
    }

    .saved-report-state-actions
    .saved-page-button {
      width: 100%;
    }
  }
`;


export default SavedQualityReportPage;
