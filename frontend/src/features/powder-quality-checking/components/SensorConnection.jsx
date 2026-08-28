import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import apiClient from "../api/apiClient";

function SensorConnection() {
  const [connected, setConnected] = useState(false);
  const [lastData, setLastData] = useState(null);

  // =====================================================
  // CHECK REAL ARDUINO DEVICE STATUS
  // =====================================================

  const checkDeviceStatus = async () => {
    try {
      const response = await apiClient.get("/device/status");

      const isConnected = Boolean(response.data?.connected);

      setConnected(isConnected);

      if (isConnected) {
        setLastData(new Date());
      }
    } catch (error) {
      console.error("Powder sensor connection error:", error);

      setConnected(false);
    }
  };

  // =====================================================
  // DEVICE STATUS POLLING
  // =====================================================

  useEffect(() => {
    checkDeviceStatus();

    const timer = setInterval(() => {
      checkDeviceStatus();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="
        flex
        items-center
        justify-between
        bg-white/5
        backdrop-blur-xl
        border
        border-white/10
        rounded-2xl
        px-5
        py-4
        "
    >
      <div
        className="
            flex
            items-center
            gap-4
            "
      >
        <div
          className={`
            p-3
            rounded-xl
            ${connected ? "bg-green-500/10" : "bg-red-500/10"}
            `}
        >
          {connected ? (
            <Wifi className="text-green-400" />
          ) : (
            <WifiOff className="text-red-400" />
          )}
        </div>

        <div>
          <h3
            className="
            text-white
            font-semibold
            "
          >
            Sensor Connection
          </h3>

          <p
            className="
            text-sm
            text-gray-400
            "
          >
            Last data received:{" "}
            {lastData ? lastData.toLocaleTimeString() : "--"}
          </p>
        </div>
      </div>

      <div
        className={`
            flex
            items-center
            gap-2
            font-semibold
            ${connected ? "text-green-400" : "text-red-400"}
            `}
      >
        <span
          className="
            w-3
            h-3
            rounded-full
            bg-current
            animate-pulse
            "
        ></span>

        {connected ? "Connected" : "Disconnected"}
      </div>
    </div>
  );
}

export default SensorConnection;
