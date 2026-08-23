function ReportActions({ onBack, onNewAnalysis, onSave, onDownload }) {
  return (
    <div className="report-actions">
      <button className="report-secondary-button" onClick={onBack}>
        ← Back to Physical Analysis
      </button>

      <div className="report-right-actions">
        <button className="report-secondary-button" onClick={onNewAnalysis}>
          New Analysis
        </button>

        <button className="report-secondary-button" onClick={onSave}>
          Save Report
        </button>

        <button className="report-primary-button" onClick={onDownload}>
          Download Report
        </button>
      </div>

      <style>{`
        .report-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;

          margin-top: 25px;
          padding-top: 22px;

          border-top:
            1px solid rgba(255, 221, 177, 0.09);
        }

        .report-right-actions {
          display: flex;
          gap: 10px;
        }

        .report-primary-button,
        .report-secondary-button {
          padding: 13px 18px;

          border-radius: 14px;

          font-size: 12px;
          font-weight: 850;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .report-secondary-button {
          color: #ffe0b5;

          background:
            rgba(255, 255, 255, 0.05);

          border:
            1px solid rgba(255, 220, 170, 0.11);
        }

        .report-secondary-button:hover {
          background:
            rgba(255, 255, 255, 0.08);
        }

        .report-primary-button {
          border: none;

          color: #2a160b;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d38a46,
              #9e572f
            );
        }

        .report-primary-button:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 760px) {
          .report-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .report-right-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .report-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ReportActions;
