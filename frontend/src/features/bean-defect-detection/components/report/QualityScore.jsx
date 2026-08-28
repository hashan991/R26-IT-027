function QualityScore({
  finalScore = 0,
  grade = "-",
  status = "Waiting",
  sensorScore = 0,
  physicalScore = 0,
}) {
  const safeFinalScore = Math.max(0, Math.min(100, Number(finalScore) || 0));

  const safeSensorScore = Math.max(0, Math.min(100, Number(sensorScore) || 0));

  const safePhysicalScore = Math.max(
    0,
    Math.min(100, Number(physicalScore) || 0),
  );

  const normalizedStatus = String(status).toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="quality-score-section">
      {/* =====================================================
          MAIN QUALITY RESULT
      ===================================================== */}

      <div className="quality-result-card">
        <div className="quality-result-top">
          <div>
            <span className="result-eyebrow">FINAL QUALITY ASSESSMENT</span>

            <h3>Coffee Bean Quality Grade</h3>

            <p>
              Final assessment based on sensor quality evaluation and physical
              AI inspection.
            </p>
          </div>

          <span className="assessment-complete-badge">Assessment Complete</span>
        </div>

        <div className="main-result-grid">
          {/* GRADE */}

          <div className="grade-display">
            <span className="grade-caption">QUALITY GRADE</span>

            <div className="grade-letter">{grade}</div>

            <span className={`main-status status-${normalizedStatus}`}>
              {status}
            </span>
          </div>

          {/* SCORE */}

          <div className="score-summary">
            <span className="score-summary-label">Overall Quality Score</span>

            <div className="score-value-row">
              <strong>{safeFinalScore.toFixed(2)}</strong>

              <span>/100</span>
            </div>

            <div className="overall-score-track">
              <div
                className="overall-score-fill"
                style={{
                  width: `${safeFinalScore}%`,
                }}
              />
            </div>

            <p>Research-defined quality assessment score.</p>
          </div>
        </div>
      </div>

      {/* =====================================================
          ASSESSMENT SCORES
      ===================================================== */}

      <div className="assessment-heading">
        <div>
          <span>ASSESSMENT SUMMARY</span>

          <h3>Quality Analysis Scores</h3>
        </div>

        <p>Supporting scores used in the final quality assessment.</p>
      </div>

      <div className="sub-score-grid">
        {/* SENSOR */}

        <div className="sub-score-card">
          <div className="sub-score-card-top">
            <div className="score-icon">S</div>

            <div className="score-title">
              <span>SENSOR ANALYSIS</span>
              <h4>Sensor Quality</h4>
            </div>

            <div className="sub-score-number">
              <strong>{safeSensorScore.toFixed(2)}</strong>

              <span>/100</span>
            </div>
          </div>

          <div className="score-track">
            <div
              className="score-fill"
              style={{
                width: `${safeSensorScore}%`,
              }}
            />
          </div>

          <div className="score-scale">
            <span>0</span>
            <span>100</span>
          </div>

          <p>
            Quality result derived from coffee bean sensor response analysis.
          </p>
        </div>

        {/* PHYSICAL */}

        <div className="sub-score-card">
          <div className="sub-score-card-top">
            <div className="score-icon">AI</div>

            <div className="score-title">
              <span>COMPUTER VISION</span>
              <h4>Physical Quality</h4>
            </div>

            <div className="sub-score-number">
              <strong>{safePhysicalScore.toFixed(2)}</strong>

              <span>/100</span>
            </div>
          </div>

          <div className="score-track">
            <div
              className="score-fill"
              style={{
                width: `${safePhysicalScore}%`,
              }}
            />
          </div>

          <div className="score-scale">
            <span>0</span>
            <span>100</span>
          </div>

          <p>
            Physical quality result based on detected coffee bean defect
            patterns.
          </p>
        </div>
      </div>

      {/* =====================================================
          NOTE
      ===================================================== */}

      {/* <div className="score-method-note">
        <span className="note-icon">i</span>

        <p>
          The displayed scores and grade are generated using the
          research-defined coffee bean quality assessment methodology.
        </p>
      </div>

       =====================================================
          CSS
      ===================================================== */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .quality-score-section {
          width: 100%;
        }

        /* =================================================
           MAIN RESULT
        ================================================= */

        .quality-result-card {
          position: relative;
          overflow: hidden;

          padding: 27px;

          border-radius: 24px;

          background:
            radial-gradient(
              circle at 18% 45%,
              rgba(213, 139, 68, 0.14),
              transparent 42%
            ),
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0.015)
            ),
            rgba(0, 0, 0, 0.14);

          border:
            1px solid rgba(255, 220, 170, 0.1);

          box-shadow:
            inset 0 1px 0
              rgba(255, 255, 255, 0.04),
            0 15px 45px
              rgba(0, 0, 0, 0.12);
        }

        .quality-result-card::after {
          content: "";

          position: absolute;

          width: 250px;
          height: 250px;

          right: -100px;
          bottom: -130px;

          border-radius: 50%;

          background:
            rgba(216, 139, 68, 0.06);

          filter: blur(6px);
        }

        .quality-result-top {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;
        }

        .result-eyebrow {
          display: block;

          color: #dda05e;

          font-size: 9px;
          font-weight: 950;

          letter-spacing: 1.7px;
        }

        .quality-result-top h3 {
          margin: 6px 0 0;

          color: #fff0db;

          font-size: 21px;
        }

        .quality-result-top p {
          max-width: 530px;

          margin: 7px 0 0;

          color:
            rgba(255, 238, 212, 0.42);

          font-size: 11px;
          line-height: 1.55;
        }

        .assessment-complete-badge {
          flex-shrink: 0;

          padding: 7px 11px;

          border-radius: 999px;

          color: #a9e7b0;

          background:
            rgba(64, 169, 78, 0.09);

          border:
            1px solid
            rgba(99, 201, 110, 0.15);

          font-size: 9px;
          font-weight: 850;
        }

        .main-result-grid {
          position: relative;
          z-index: 2;

          margin-top: 24px;

          display: grid;

          grid-template-columns:
            minmax(220px, 0.9fr)
            minmax(280px, 1.3fr);

          gap: 20px;
        }

        /* =================================================
           LARGE GRADE
        ================================================= */

        .grade-display {
          min-height: 245px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 22px;

          border-radius: 21px;

          background:
            radial-gradient(
              circle,
              rgba(255, 211, 151, 0.1),
              rgba(0, 0, 0, 0.08)
            );

          border:
            1px solid
            rgba(255, 220, 170, 0.09);
        }

        .grade-caption {
          color:
            rgba(255, 233, 201, 0.36);

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 1.6px;
        }

        .grade-letter {
          margin: 8px 0 10px;

          color: #ffe0a8;

          font-size: 105px;
          font-weight: 950;

          line-height: 0.95;

          letter-spacing: -6px;

          text-shadow:
            0 10px 35px
            rgba(222, 143, 67, 0.18);
        }

        .main-status {
          padding: 7px 13px;

          border-radius: 999px;

          font-size: 10px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .status-excellent,
        .status-good {
          color: #a7e7ae;

          background:
            rgba(65, 170, 80, 0.1);

          border:
            1px solid
            rgba(99, 201, 110, 0.17);
        }

        .status-needs-review,
        .status-review {
          color: #ffd28f;

          background:
            rgba(198, 134, 52, 0.1);

          border:
            1px solid
            rgba(229, 166, 80, 0.17);
        }

        .status-poor,
        .status-bad {
          color: #ffae98;

          background:
            rgba(191, 65, 46, 0.1);

          border:
            1px solid
            rgba(227, 95, 71, 0.16);
        }

        .status-waiting {
          color:
            rgba(255, 237, 210, 0.55);

          background:
            rgba(255, 255, 255, 0.035);

          border:
            1px solid
            rgba(255, 255, 255, 0.07);
        }

        /* =================================================
           SCORE SUMMARY
        ================================================= */

        .score-summary {
          min-height: 245px;

          display: flex;
          flex-direction: column;
          justify-content: center;

          padding: 27px;

          border-radius: 21px;

          background:
            rgba(255, 255, 255, 0.025);

          border:
            1px solid
            rgba(255, 220, 170, 0.08);
        }

        .score-summary-label {
          color:
            rgba(255, 235, 207, 0.4);

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1px;

          text-transform: uppercase;
        }

        .score-value-row {
          margin-top: 7px;

          display: flex;

          align-items: baseline;

          gap: 5px;
        }

        .score-value-row strong {
          color: #ffe1ad;

          font-size: 48px;

          line-height: 1;

          letter-spacing: -2px;
        }

        .score-value-row span {
          color:
            rgba(255, 235, 205, 0.35);

          font-size: 11px;
        }

        .overall-score-track {
          height: 9px;

          margin-top: 19px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.065);
        }

        .overall-score-fill {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #9e5c32,
              #ffd18e
            );

          transition:
            width 0.8s ease;
        }

        .score-summary p {
          max-width: 330px;

          margin:
            13px 0 0;

          color:
            rgba(255, 238, 212, 0.32);

          font-size: 9px;

          line-height: 1.55;
        }

        /* =================================================
           SECTION HEADING
        ================================================= */

        .assessment-heading {
          margin-top: 20px;

          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 20px;
        }

        .assessment-heading > div > span {
          color: #dca05e;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.4px;
        }

        .assessment-heading h3 {
          margin: 4px 0 0;

          color: #f2dec1;

          font-size: 16px;
        }

        .assessment-heading p {
          max-width: 290px;

          margin: 0;

          color:
            rgba(255, 235, 207, 0.31);

          text-align: right;

          font-size: 8px;

          line-height: 1.45;
        }

        /* =================================================
           SUB SCORES
        ================================================= */

        .sub-score-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 15px;

          margin-top: 12px;
        }

        .sub-score-card {
          padding: 19px;

          border-radius: 19px;

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.045),
              rgba(255, 255, 255, 0.017)
            );

          border:
            1px solid
            rgba(255, 220, 170, 0.085);
        }

        .sub-score-card-top {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .score-icon {
          width: 39px;
          height: 39px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 11px;

          color: #2b180c;

          background:
            linear-gradient(
              145deg,
              #ffdda7,
              #ce8041
            );

          font-size: 9px;

          font-weight: 950;
        }

        .score-title {
          min-width: 0;

          flex: 1;
        }

        .score-title span {
          display: block;

          color: #d99b58;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 1px;
        }

        .score-title h4 {
          margin: 3px 0 0;

          color: #f2ddc1;

          font-size: 12px;
        }

        .sub-score-number {
          flex-shrink: 0;

          text-align: right;
        }

        .sub-score-number strong {
          color: #ffd18f;

          font-size: 20px;
        }

        .sub-score-number span {
          margin-left: 2px;

          color:
            rgba(255, 235, 205, 0.32);

          font-size: 8px;
        }

        .score-track {
          height: 8px;

          margin-top: 15px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.065);
        }

        .score-fill {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #9e5b32,
              #f5bd77
            );

          transition:
            width 0.8s ease;
        }

        .score-scale {
          margin-top: 5px;

          display: flex;

          justify-content: space-between;

          color:
            rgba(255, 236, 208, 0.2);

          font-size: 7px;
        }

        .sub-score-card p {
          margin: 10px 0 0;

          color:
            rgba(255, 238, 212, 0.34);

          font-size: 9px;

          line-height: 1.5;
        }

        /* =================================================
           NOTE
        ================================================= */

        .score-method-note {
          margin-top: 14px;

          display: flex;

          align-items: flex-start;

          gap: 9px;

          padding: 12px 14px;

          border-radius: 13px;

          background:
            rgba(255, 255, 255, 0.02);

          border:
            1px solid
            rgba(255, 220, 170, 0.06);
        }

        .note-icon {
          width: 20px;
          height: 20px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: #dda05e;

          border:
            1px solid
            rgba(221, 160, 94, 0.22);

          font-size: 8px;

          font-weight: 900;
        }

        .score-method-note p {
          margin: 1px 0 0;

          color:
            rgba(255, 235, 207, 0.3);

          font-size: 8px;

          line-height: 1.55;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 800px) {
          .main-result-grid {
            grid-template-columns: 1fr;
          }

          .sub-score-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .quality-result-card {
            padding: 20px;
          }

          .quality-result-top,
          .assessment-heading {
            flex-direction: column;

            align-items: flex-start;
          }

          .assessment-heading p {
            text-align: left;
          }

          .grade-letter {
            font-size: 85px;
          }

          .score-value-row strong {
            font-size: 40px;
          }
        }
      `}</style>
    </div>
  );
}

export default QualityScore;
