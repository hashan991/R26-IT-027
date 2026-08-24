function DeviceStatus({
  connected = false,
  device = "Arduino Sensor Module",
  port = "--",
  baudRate = "--",
}) {
  return (
    <div className="device-status-card">
      <div className="device-left">
        <div className="device-icon">USB</div>

        <div>
          <span className="device-label">SENSOR DEVICE</span>

          <strong>{device}</strong>

          <div className="device-meta">
            <span>Port: {port}</span>

            <span>Baud: {baudRate}</span>
          </div>
        </div>
      </div>

      <div
        className={`connection-status ${
          connected ? "device-connected" : "device-disconnected"
        }`}
      >
        <span className="connection-dot"></span>

        {connected ? "Connected" : "Disconnected"}
      </div>

      <style>{`
        .device-status-card {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          padding: 18px 20px;

          border-radius: 20px;

          background:
            rgba(0, 0, 0, 0.18);

          border:
            1px solid rgba(
              255,
              222,
              178,
              0.11
            );
        }

        .device-left {
          display: flex;
          align-items: center;

          gap: 14px;
        }

        .device-icon {
          width: 48px;
          height: 48px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border-radius: 14px;

          color: #2b170c;

          font-size: 11px;
          font-weight: 950;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d28a47
            );
        }

        .device-label {
          display: block;

          margin-bottom: 4px;

          color:
            rgba(
              255,
              238,
              212,
              0.45
            );

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1px;
        }

        .device-left strong {
          display: block;

          color: #fff2dc;

          font-size: 14px;
        }

        .device-meta {
          display: flex;

          gap: 12px;

          margin-top: 5px;
        }

        .device-meta span {
          color:
            rgba(
              255,
              238,
              212,
              0.4
            );

          font-size: 10px;
        }

        .connection-status {
          display: flex;
          align-items: center;

          gap: 8px;

          padding: 8px 12px;

          border-radius: 999px;

          font-size: 11px;
          font-weight: 850;
        }

        .connection-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;
        }

        .device-connected {
          color: #a7e7ae;

          background:
            rgba(
              61,
              168,
              76,
              0.1
            );

          border:
            1px solid rgba(
              90,
              200,
              104,
              0.18
            );
        }

        .device-connected
        .connection-dot {
          background: #75d783;

          box-shadow:
            0 0 12px #75d783;
        }

        .device-disconnected {
          color: #ffaaa0;

          background:
            rgba(
              196,
              60,
              50,
              0.1
            );

          border:
            1px solid rgba(
              218,
              79,
              67,
              0.18
            );
        }

        .device-disconnected
        .connection-dot {
          background: #e56c61;
        }

        @media (max-width: 580px) {
          .device-status-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .device-meta {
            flex-direction: column;
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
}

export default DeviceStatus;
