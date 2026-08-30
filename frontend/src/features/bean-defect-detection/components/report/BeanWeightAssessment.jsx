function BeanWeightAssessment({
  physicalResult = {},
  physicalAssessment = {},
}) {
  // =========================================================
  // WEIGHT VALUES
  // =========================================================

  const rawWeight =
    physicalResult.sampleWeight ??
    physicalResult.sample_weight ??
    physicalResult.weight ??
    physicalAssessment.sample_weight_grams ??
    physicalAssessment.sampleWeight ??
    null;

  const sampleWeight =
    rawWeight !== null && rawWeight !== undefined && rawWeight !== ""
      ? Number(rawWeight)
      : null;

  const weightUnit =
    physicalResult.weightUnit || physicalResult.weight_unit || "g";

  const totalBeans = Number(
    physicalAssessment.total_beans ??
      physicalResult.total_beans ??
      physicalResult.total_count ??
      0,
  );

  const weightCalibrated =
    physicalResult.weightCalibrated ??
    physicalResult.weight_calibrated ??
    false;

  // =========================================================
  // VALID WEIGHT
  // =========================================================

  const hasWeight =
    sampleWeight !== null && !Number.isNaN(sampleWeight) && sampleWeight >= 0;

  // =========================================================
  // AVERAGE BEAN WEIGHT
  // =========================================================

  const averageBeanWeight =
    hasWeight && totalBeans > 0 ? sampleWeight / totalBeans : null;

  // =========================================================
  // FORMAT
  // =========================================================

  const formatWeight = (value, decimals = 2) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "-";
    }

    return Number(value).toFixed(decimals);
  };

  return (
    <div className="bean-weight-card">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bean-weight-header">
        <div>
          <span className="bean-weight-label">SAMPLE WEIGHT ANALYSIS</span>

          <h3>Coffee Bean Weight</h3>

          <p>
            Weight information captured for the coffee bean sample used in the
            physical AI inspection.
          </p>
        </div>

        <span
          className={`
            weight-calibration-badge
            ${weightCalibrated ? "weight-calibrated" : "weight-uncalibrated"}
          `}
        >
          <span />

          {weightCalibrated ? "CALIBRATED" : "EXPERIMENTAL"}
        </span>
      </div>

      {/* =====================================================
          MAIN WEIGHT
      ===================================================== */}

      <div className="weight-main-panel">
        <div className="weight-main-value">
          <span>SAMPLE WEIGHT</span>

          <div>
            <strong>{hasWeight ? formatWeight(sampleWeight) : "-"}</strong>

            <small>{hasWeight ? weightUnit : ""}</small>
          </div>

          <p>Total measured weight of the inspected coffee bean sample.</p>
        </div>

        <div className="weight-icon-area">
          <div className="weight-scale-icon">W</div>

          <span>Load Cell Measurement</span>
        </div>
      </div>

      {/* =====================================================
          SAMPLE INFORMATION
      ===================================================== */}

      <div className="weight-information-grid">
        {/* TOTAL BEANS */}

        <div className="weight-info-card">
          <span>TOTAL DETECTED BEANS</span>

          <strong>{totalBeans > 0 ? totalBeans : "-"}</strong>

          <small>AI detected count</small>
        </div>

        {/* SAMPLE WEIGHT */}

        <div className="weight-info-card">
          <span>SAMPLE WEIGHT</span>

          <strong>
            {hasWeight ? `${formatWeight(sampleWeight)} ${weightUnit}` : "-"}
          </strong>

          <small>load cell reading</small>
        </div>

        {/* AVG WEIGHT */}

        <div className="weight-info-card">
          <span>AVG. DETECTED BEAN WEIGHT</span>

          <strong>
            {averageBeanWeight !== null
              ? `${formatWeight(averageBeanWeight, 3)} ${weightUnit}`
              : "-"}
          </strong>

          <small>sample weight ÷ detected beans</small>
        </div>
      </div>

      {/* =====================================================
          RELATIONSHIP TRACE
      ===================================================== */}

      {hasWeight && totalBeans > 0 && (
        <div className="weight-trace">
          <div>
            <span>SAMPLE WEIGHT</span>

            <strong>
              {formatWeight(sampleWeight)} {weightUnit}
            </strong>
          </div>

          <div className="weight-trace-symbol">÷</div>

          <div>
            <span>DETECTED BEANS</span>

            <strong>{totalBeans}</strong>
          </div>

          <div className="weight-trace-symbol">=</div>

          <div className="weight-trace-result">
            <span>AVERAGE</span>

            <strong>
              {formatWeight(averageBeanWeight, 3)} {weightUnit}
            </strong>
          </div>
        </div>
      )}

      {/* =====================================================
          NO DATA
      ===================================================== */}

      {!hasWeight && (
        <div className="weight-no-data">
          <div className="weight-no-data-icon">!</div>

          <div>
            <strong>Weight Data Unavailable</strong>

            <p>
              No valid sample weight was received for this physical inspection.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          NOTE
      ===================================================== */}

      <div className="weight-note">
        <span>i</span>

        <p>
          Sample weight and average detected bean weight are displayed as
          descriptive inspection information. They are not currently used to
          calculate the physical quality score or final grade.
        </p>
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`
        /*
          BeanWeightAssessment UI refresh
          - Keeps all current weight/calculation logic unchanged
          - Matches the light coffee theme used by the report
          - Uses scoped selectors to avoid CSS conflicts
        */

        .bean-weight-card,
        .bean-weight-card * {
          box-sizing: border-box;
        }

        .bean-weight-card {
          width: 100%;
          padding: 26px;
          border: 1px solid #e4d7ca;
          border-radius: 20px;
          background: #fffdfa;
          color: #342117;
          box-shadow: 0 10px 28px rgba(65, 38, 24, 0.055);
        }

        /* =================================================
           HEADER
        ================================================= */

        .bean-weight-card .bean-weight-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 22px;
        }

        .bean-weight-card .bean-weight-label {
          display: block;
          color: #9b5f31;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1.25px;
          text-transform: uppercase;
        }

        .bean-weight-card .bean-weight-header h3 {
          margin: 6px 0 0;
          color: #2f1c13;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          line-height: 1.2;
        }

        .bean-weight-card .bean-weight-header p {
          max-width: 720px;
          margin: 9px 0 0;
          color: #786a61;
          font-size: 13px;
          line-height: 1.65;
        }

        /* =================================================
           CALIBRATION BADGE
        ================================================= */

        .bean-weight-card .weight-calibration-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          padding: 7px 11px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.45px;
          text-transform: uppercase;
        }

        .bean-weight-card .weight-calibration-badge > span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .bean-weight-card .weight-calibrated {
          color: #347247;
          background: #edf7ef;
          border: 1px solid #c9e1cd;
        }

        .bean-weight-card .weight-uncalibrated {
          color: #8b5b16;
          background: #fff6e8;
          border: 1px solid #ead3a8;
        }

        /* =================================================
           MAIN WEIGHT PANEL
        ================================================= */

        .bean-weight-card .weight-main-panel {
          margin-top: 20px;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          padding: 23px;
          border: 1px solid #e1cdb7;
          border-radius: 17px;
          background: #fbf2e8;
        }

        .bean-weight-card .weight-main-value {
          min-width: 0;
          flex: 1;
        }

        .bean-weight-card .weight-main-value > span {
          display: block;
          color: #8a7669;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.05px;
          text-transform: uppercase;
        }

        .bean-weight-card .weight-main-value > div {
          margin-top: 7px;
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .bean-weight-card .weight-main-value strong {
          color: #3c2418;
          font-size: 44px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -1.2px;
        }

        .bean-weight-card .weight-main-value small {
          color: #806f64;
          font-size: 14px;
          font-weight: 750;
        }

        .bean-weight-card .weight-main-value p {
          margin: 10px 0 0;
          color: #74655c;
          font-size: 12px;
          line-height: 1.55;
        }

        .bean-weight-card .weight-icon-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .bean-weight-card .weight-scale-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #fff9f2;
          background: #4b2818;
          font-size: 16px;
          font-weight: 900;
          box-shadow: 0 8px 20px rgba(75, 40, 24, 0.12);
        }

        .bean-weight-card .weight-icon-area > span {
          color: #7d6d63;
          font-size: 10px;
          font-weight: 650;
          text-align: center;
        }

        /* =================================================
           INFORMATION GRID
        ================================================= */

        .bean-weight-card .weight-information-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
        }

        .bean-weight-card .weight-info-card {
          min-height: 118px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #e6dbd0;
          border-radius: 14px;
          background: #fffaf6;
        }

        .bean-weight-card .weight-info-card > span {
          display: block;
          color: #7e6e64;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.65px;
          text-transform: uppercase;
        }

        .bean-weight-card .weight-info-card > strong {
          display: block;
          margin-top: 7px;
          color: #39251b;
          font-size: 22px;
          font-weight: 850;
        }

        .bean-weight-card .weight-info-card > small {
          display: block;
          margin-top: 5px;
          color: #88786e;
          font-size: 10px;
          line-height: 1.4;
        }

        /* =================================================
           WEIGHT RELATIONSHIP TRACE
        ================================================= */

        .bean-weight-card .weight-trace {
          margin-top: 13px;
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          align-items: stretch;
          gap: 9px;
        }

        .bean-weight-card
          .weight-trace
          > div:not(.weight-trace-symbol) {
          min-height: 86px;
          padding: 13px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #e6ddd4;
          border-radius: 11px;
          background: #faf7f3;
        }

        .bean-weight-card .weight-trace span {
          display: block;
          color: #7f6f65;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .bean-weight-card .weight-trace strong {
          display: block;
          margin-top: 5px;
          color: #3c281e;
          font-size: 15px;
        }

        .bean-weight-card .weight-trace-symbol {
          display: grid;
          place-items: center;
          color: #9a5e30;
          font-size: 19px;
          font-weight: 900;
        }

        .bean-weight-card .weight-trace-result {
          background: #f7e8d7 !important;
          border-color: #d9ba99 !important;
        }

        /* =================================================
           NO DATA
        ================================================= */

        .bean-weight-card .weight-no-data {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 14px;
          border: 1px solid #ead3a8;
          border-radius: 13px;
          background: #fff7e9;
        }

        .bean-weight-card .weight-no-data-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          color: #8b5b16;
          background: #f7e5c2;
          font-size: 12px;
          font-weight: 900;
        }

        .bean-weight-card .weight-no-data strong {
          color: #4b3324;
          font-size: 12px;
        }

        .bean-weight-card .weight-no-data p {
          margin: 4px 0 0;
          color: #7b6b61;
          font-size: 11px;
          line-height: 1.5;
        }

        /* =================================================
           NOTE
        ================================================= */

        .bean-weight-card .weight-note {
          margin-top: 14px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 13px 14px;
          border: 1px solid #e7ddd4;
          border-radius: 11px;
          background: #faf7f3;
        }

        .bean-weight-card .weight-note > span {
          width: 21px;
          height: 21px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid #d5b38c;
          border-radius: 50%;
          color: #985d30;
          font-size: 10px;
          font-weight: 900;
        }

        .bean-weight-card .weight-note p {
          margin: 1px 0 0;
          color: #74665d;
          font-size: 11px;
          line-height: 1.6;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 850px) {
          .bean-weight-card .weight-information-grid {
            grid-template-columns: 1fr;
          }

          .bean-weight-card .weight-trace {
            grid-template-columns: 1fr;
          }

          .bean-weight-card .weight-trace-symbol {
            display: none;
          }
        }

        @media (max-width: 650px) {
          .bean-weight-card {
            padding: 18px;
            border-radius: 16px;
          }

          .bean-weight-card .bean-weight-header {
            flex-direction: column;
          }

          .bean-weight-card .weight-main-panel {
            align-items: flex-start;
            flex-direction: column;
          }

          .bean-weight-card .weight-main-value strong {
            font-size: 38px;
          }

          .bean-weight-card .weight-icon-area {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default BeanWeightAssessment;
