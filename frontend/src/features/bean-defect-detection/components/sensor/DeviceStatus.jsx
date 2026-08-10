function DeviceStatus({ connected = false }) {
  return (
    <div className="device-status-card">
      <div className="device-left">
        <div className="device-icon">⌁</div>

        <div>
          <span>Sensor Device</span>
          <strong>Arduino Quality Module</strong>
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
          background: rgba(0, 0, 0, 0.18);
          border: 1px solid rgba(255, 222, 178, 0.11);
        }

        .device-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .device-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #2b170d;
          font-size: 23px;
          background: linear-gradient(135deg, #ffe0a3, #d28a47);
        }

        .device-left span {
          display: block;
          margin-bottom: 4px;
          color: rgba(255, 238, 212, 0.48);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .device-left strong {
          color: #fff2dc;
          font-size: 15px;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .connection-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .device-connected {
          color: #a7e7ae;
          background: rgba(61, 168, 76, 0.1);
          border: 1px solid rgba(90, 200, 104, 0.18);
        }

        .device-connected .connection-dot {
          background: #75d783;
          box-shadow: 0 0 12px #75d783;
        }

        .device-disconnected {
          color: #ffaaa0;
          background: rgba(196, 60, 50, 0.1);
          border: 1px solid rgba(218, 79, 67, 0.18);
        }

        .device-disconnected .connection-dot {
          background: #e56c61;
        }

        @media (max-width: 580px) {
          .device-status-card {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default DeviceStatus;
