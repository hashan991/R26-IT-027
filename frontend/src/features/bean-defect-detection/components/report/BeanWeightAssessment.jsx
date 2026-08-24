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

        .bean-weight-card,
        .bean-weight-card * {
          box-sizing: border-box;
        }


        .bean-weight-card {
          width: 100%;

          padding: 24px;

          border-radius: 22px;

          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(
                214,
                142,
                70,
                0.08
              ),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.045
              ),
              rgba(
                255,
                255,
                255,
                0.015
              )
            ),
            rgba(
              0,
              0,
              0,
              0.12
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.09
            );
        }


        /* =================================================
           HEADER
        ================================================= */

        .bean-weight-header {
          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          gap: 20px;
        }


        .bean-weight-label {
          display: block;

          color: #dda05e;

          font-size: 8px;

          font-weight: 950;

          letter-spacing:
            1.6px;
        }


        .bean-weight-header h3 {
          margin:
            5px 0 0;

          color: #fff0d8;

          font-size: 19px;
        }


        .bean-weight-header p {
          max-width: 560px;

          margin:
            6px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.38
            );

          font-size: 10px;

          line-height: 1.55;
        }


        /* =================================================
           CALIBRATION BADGE
        ================================================= */

        .weight-calibration-badge {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          flex-shrink: 0;

          padding:
            6px 10px;

          border-radius: 999px;

          font-size: 7px;

          font-weight: 950;

          letter-spacing:
            0.4px;
        }


        .weight-calibration-badge
        > span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            currentColor;
        }


        .weight-calibrated {
          color: #a5e7ad;

          background:
            rgba(
              59,
              157,
              74,
              0.09
            );

          border:
            1px solid
            rgba(
              94,
              197,
              107,
              0.15
            );
        }


        .weight-uncalibrated {
          color: #ffd18c;

          background:
            rgba(
              205,
              137,
              48,
              0.09
            );

          border:
            1px solid
            rgba(
              228,
              162,
              73,
              0.15
            );
        }


        /* =================================================
           MAIN WEIGHT
        ================================================= */

        .weight-main-panel {
          margin-top: 18px;

          min-height: 155px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 25px;

          padding: 21px;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              rgba(
                213,
                139,
                67,
                0.08
              ),
              rgba(
                255,
                255,
                255,
                0.015
              )
            );

          border:
            1px solid
            rgba(
              228,
              162,
              92,
              0.1
            );
        }


        .weight-main-value
        > span {
          display: block;

          color:
            rgba(
              255,
              234,
              204,
              0.38
            );

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1.2px;
        }


        .weight-main-value
        > div {
          margin-top: 6px;

          display: flex;

          align-items: baseline;

          gap: 7px;
        }


        .weight-main-value
        strong {
          color: #ffe0a8;

          font-size: 42px;

          line-height: 1;

          letter-spacing:
            -1.5px;
        }


        .weight-main-value
        small {
          color:
            rgba(
              255,
              235,
              205,
              0.42
            );

          font-size: 12px;

          font-weight: 800;
        }


        .weight-main-value p {
          margin:
            9px 0 0;

          color:
            rgba(
              255,
              238,
              212,
              0.32
            );

          font-size: 8px;
        }


        .weight-icon-area {
          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 7px;

          flex-shrink: 0;
        }


        .weight-scale-icon {
          width: 55px;
          height: 55px;

          display: grid;

          place-items: center;

          border-radius: 16px;

          color: #29170b;

          background:
            linear-gradient(
              145deg,
              #ffe0a5,
              #cf8543
            );

          font-size: 15px;

          font-weight: 950;

          box-shadow:
            0 8px 25px
            rgba(
              205,
              132,
              65,
              0.12
            );
        }


        .weight-icon-area
        > span {
          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 6px;
        }


        /* =================================================
           INFO GRID
        ================================================= */

        .weight-information-grid {
          margin-top: 12px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 9px;
        }


        .weight-info-card {
          padding: 14px;

          border-radius: 14px;

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
              0.06
            );
        }


        .weight-info-card
        > span {
          display: block;

          color:
            rgba(
              255,
              235,
              207,
              0.29
            );

          font-size: 7px;

          font-weight: 900;

          letter-spacing:
            0.7px;
        }


        .weight-info-card
        > strong {
          display: block;

          margin-top: 6px;

          color: #efd8b9;

          font-size: 19px;
        }


        .weight-info-card
        > small {
          display: block;

          margin-top: 4px;

          color:
            rgba(
              255,
              235,
              207,
              0.22
            );

          font-size: 6px;
        }


        /* =================================================
           TRACE
        ================================================= */

        .weight-trace {
          margin-top: 11px;

          display: grid;

          grid-template-columns:
            1fr
            auto
            1fr
            auto
            1fr;

          align-items: stretch;

          gap: 8px;
        }


        .weight-trace
        > div:not(
          .weight-trace-symbol
        ) {
          padding: 11px;

          border-radius: 11px;

          background:
            rgba(
              0,
              0,
              0,
              0.08
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.05
            );
        }


        .weight-trace span {
          display: block;

          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 6px;

          font-weight: 900;
        }


        .weight-trace strong {
          display: block;

          margin-top: 4px;

          color: #ecd4b4;

          font-size: 13px;
        }


        .weight-trace-symbol {
          display: grid;

          place-items: center;

          color: #dca05e;

          font-size: 16px;

          font-weight: 950;
        }


        .weight-trace-result {
          background:
            rgba(
              212,
              137,
              64,
              0.065
            ) !important;

          border-color:
            rgba(
              228,
              161,
              90,
              0.11
            ) !important;
        }


        /* =================================================
           NO DATA
        ================================================= */

        .weight-no-data {
          margin-top: 12px;

          display: flex;

          align-items: center;

          gap: 10px;

          padding: 13px;

          border-radius: 13px;

          background:
            rgba(
              196,
              124,
              42,
              0.055
            );

          border:
            1px solid
            rgba(
              221,
              153,
              67,
              0.1
            );
        }


        .weight-no-data-icon {
          width: 30px;
          height: 30px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 9px;

          color: #ffd18c;

          background:
            rgba(
              211,
              140,
              48,
              0.12
            );

          font-size: 10px;

          font-weight: 950;
        }


        .weight-no-data strong {
          color: #ecd5b6;

          font-size: 10px;
        }


        .weight-no-data p {
          margin:
            3px 0 0;

          color:
            rgba(
              255,
              235,
              207,
              0.28
            );

          font-size: 7px;
        }


        /* =================================================
           NOTE
        ================================================= */

        .weight-note {
          margin-top: 12px;

          display: flex;

          align-items: flex-start;

          gap: 8px;

          padding:
            10px 11px;

          border-radius: 11px;

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.045
            );
        }


        .weight-note
        > span {
          width: 18px;
          height: 18px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: #dda05e;

          border:
            1px solid
            rgba(
              221,
              160,
              94,
              0.2
            );

          font-size: 7px;

          font-weight: 900;
        }


        .weight-note p {
          margin:
            1px 0 0;

          color:
            rgba(
              255,
              235,
              207,
              0.27
            );

          font-size: 7px;

          line-height: 1.5;
        }


        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (
          max-width: 750px
        ) {

          .weight-information-grid {
            grid-template-columns:
              1fr;
          }


          .weight-trace {
            grid-template-columns:
              1fr;
          }


          .weight-trace-symbol {
            display: none;
          }

        }


        @media (
          max-width: 600px
        ) {

          .bean-weight-card {
            padding: 18px;
          }


          .bean-weight-header {
            flex-direction:
              column;
          }


          .weight-main-panel {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .weight-main-value
          strong {
            font-size: 35px;
          }

        }

      `}</style>
    </div>
  );
}

export default BeanWeightAssessment;
