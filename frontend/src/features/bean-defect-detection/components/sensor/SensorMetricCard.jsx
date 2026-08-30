function SensorMetricCard({
  label,
  value,
  unit,
  icon,
  description,
  measured = false,
}) {
  return (
    <div className="sensor-metric-card">
      <div className="sensor-card-top">
        <div className="sensor-icon">{icon}</div>

        <span
          className={`sensor-status ${
            measured ? "sensor-measured" : "sensor-waiting"
          }`}
        >
          {measured ? "Measured" : "Waiting"}
        </span>
      </div>

      <div className="sensor-name">{label}</div>

      <div className="sensor-value-row">
        <strong>{value ?? "--"}</strong>
        <span>{unit}</span>
      </div>

      <p>{description}</p>

      <style>{`
        /*
          SensorMetricCard UI refresh
          - Removes old dark embedded styles
          - Matches the light coffee theme
          - Keeps props/rendering logic unchanged
          - Scopes selectors to avoid CSS conflicts
        */

        .sensor-metric-card,
        .sensor-metric-card * {
          box-sizing: border-box;
        }

        .sensor-metric-card {
          width: 100%;
          min-width: 0;
          min-height: 190px;
          padding: 20px;
          border: 1px solid #e5d8cb;
          border-radius: 18px;
          background: #fffdfa;
          color: #342117;
          box-shadow: 0 8px 22px rgba(67, 39, 24, 0.045);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .sensor-metric-card:hover {
          transform: translateY(-2px);
          border-color: #d8c0a7;
          box-shadow: 0 12px 28px rgba(67, 39, 24, 0.075);
        }

        .sensor-metric-card .sensor-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .sensor-metric-card .sensor-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid #dcc3a9;
          border-radius: 13px;
          color: #704326;
          background: #f6e8d9;
          font-size: 18px;
          font-weight: 850;
        }

        .sensor-metric-card .sensor-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.65px;
          white-space: nowrap;
        }

        .sensor-metric-card .sensor-measured {
          color: #347247;
          background: #edf7ef;
          border: 1px solid #c8e1cd;
        }

        .sensor-metric-card .sensor-waiting {
          color: #8b5a16;
          background: #fff6e8;
          border: 1px solid #ead3a8;
        }

        .sensor-metric-card .sensor-name {
          margin-bottom: 7px;
          color: #6f6056;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.4;
        }

        .sensor-metric-card .sensor-value-row {
          display: flex;
          align-items: baseline;
          gap: 7px;
          min-width: 0;
        }

        .sensor-metric-card .sensor-value-row strong {
          min-width: 0;
          color: #2f1c13;
          font-size: 32px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.8px;
          overflow-wrap: anywhere;
        }

        .sensor-metric-card .sensor-value-row span {
          color: #9a5d2f;
          font-size: 13px;
          font-weight: 750;
        }

        .sensor-metric-card p {
          margin: 11px 0 0;
          color: #786a61;
          font-size: 12px;
          line-height: 1.55;
        }

        @media (max-width: 620px) {
          .sensor-metric-card {
            min-height: 0;
            padding: 17px;
            border-radius: 15px;
          }

          .sensor-metric-card .sensor-value-row strong {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}

export default SensorMetricCard;
