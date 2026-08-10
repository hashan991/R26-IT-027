function SensorMetricCard({
  label,
  value,
  unit,
  status = "normal",
  icon,
  description,
}) {
  return (
    <div className={`sensor-metric-card status-${status}`}>
      <div className="sensor-card-top">
        <div className="sensor-icon">{icon}</div>

        <span className={`sensor-status sensor-status-${status}`}>
          {status}
        </span>
      </div>

      <div className="sensor-name">{label}</div>

      <div className="sensor-value-row">
        <strong>{value}</strong>
        <span>{unit}</span>
      </div>

      <p>{description}</p>

      <style>{`
        .sensor-metric-card {
          padding: 20px;
          border-radius: 22px;
          border: 1px solid rgba(255, 222, 178, 0.12);
          background: rgba(255, 255, 255, 0.055);
          transition: 0.25s ease;
        }

        .sensor-metric-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.075);
        }

        .sensor-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .sensor-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          font-size: 20px;
          background: rgba(221, 149, 77, 0.12);
          border: 1px solid rgba(255, 210, 150, 0.12);
        }

        .sensor-status {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .sensor-status-normal {
          color: #a6e8ae;
          background: rgba(78, 180, 91, 0.12);
          border: 1px solid rgba(107, 210, 119, 0.18);
        }

        .sensor-status-warning {
          color: #ffd48f;
          background: rgba(222, 153, 55, 0.12);
          border: 1px solid rgba(237, 168, 74, 0.2);
        }

        .sensor-status-poor {
          color: #ffaaa0;
          background: rgba(210, 65, 52, 0.12);
          border: 1px solid rgba(230, 84, 70, 0.2);
        }

        .sensor-name {
          color: rgba(255, 239, 214, 0.62);
          font-size: 13px;
          margin-bottom: 7px;
        }

        .sensor-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .sensor-value-row strong {
          color: #fff3df;
          font-size: 30px;
          letter-spacing: -1px;
        }

        .sensor-value-row span {
          color: #dca467;
          font-size: 13px;
          font-weight: 700;
        }

        .sensor-metric-card p {
          margin: 10px 0 0;
          color: rgba(255, 239, 214, 0.42);
          font-size: 12px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

export default SensorMetricCard;
