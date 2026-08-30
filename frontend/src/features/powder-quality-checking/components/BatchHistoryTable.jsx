import { motion } from "framer-motion";

import { useEffect, useState } from "react";

import { Activity } from "lucide-react";

import apiClient from "../api/apiClient";

import { useRefresh } from "../context/RefreshContext";

// =====================================================
// FORMAT BACKEND UTC TIME TO USER LOCAL TIME
// =====================================================

const formatBackendTime = (timestamp) => {
  if (!timestamp) {
    return "--";
  }

  let normalizedTimestamp = timestamp;

  // MongoDB UTC datetime can arrive without timezone marker.
  // If timezone is missing, treat it as UTC.
  const hasTimezone =
    timestamp.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(timestamp);

  if (!hasTimezone) {
    normalizedTimestamp = `${timestamp}Z`;
  }

  const date = new Date(normalizedTimestamp);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",

    minute: "2-digit",
  });
};

// =====================================================
// CREATE UNIQUE MINUTE KEY
// =====================================================

const getMinuteKey = (timestamp, batchId) => {
  if (!timestamp) {
    return null;
  }

  let normalizedTimestamp = timestamp;

  const hasTimezone =
    timestamp.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(timestamp);

  if (!hasTimezone) {
    normalizedTimestamp = `${timestamp}Z`;
  }

  const date = new Date(normalizedTimestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return [
    batchId || "LIVE-ARDUINO",
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ].join("-");
};

export default function BatchHistoryTable() {
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const refreshContext = useRefresh();

  const refreshSignal = refreshContext?.refreshSignal || 0;

  // =====================================================
  // FETCH SAVED SENSOR / AI HISTORY
  // =====================================================

  const fetchBatchHistory = async () => {
    try {
      const response = await apiClient.get("/sensor/history?limit=500");

      const records = response.data?.data || [];

      // =====================================================
      // ONE SAVED RESULT PER MINUTE
      //
      // /device/read saves every live reading to MongoDB.
      //
      // If /device/read is accidentally called multiple times
      // during the same minute, keep only the latest one.
      // =====================================================

      const minuteRecords = new Map();

      records.forEach((item) => {
        const minuteKey = getMinuteKey(
          item.time,

          item.batch_id,
        );

        if (!minuteKey) {
          return;
        }

        // Backend history arrives chronological order.
        // Replacing the same key means the latest reading
        // inside that minute remains in the Map.

        minuteRecords.set(
          minuteKey,

          item,
        );
      });

      // =====================================================
      // NEWEST MINUTE FIRST
      // =====================================================

      const latestRecords = Array.from(minuteRecords.values())

        .reverse()

        .slice(0, 20);

      // =====================================================
      // FORMAT BACKEND DATA FOR EXISTING TABLE UI
      // =====================================================

      const formatted = latestRecords.map((item) => {
        const aiDecision = item.ai_decision || {};

        return {
          id: item.batch_id ?? "LIVE-ARDUINO",

          time: formatBackendTime(item.time),

          decision:
            aiDecision.decision ?? aiDecision.status ?? item.status ?? "HOLD",

          release: aiDecision.release_status ?? "REVIEW_REQUIRED",

          condition: Number(
            aiDecision.condition_score ??
              aiDecision.quality_score ??
              item.quality_score ??
              0,
          ),

          confidence: Number(aiDecision.confidence ?? 0),

          risk: aiDecision.risk_level ?? item.risk_level ?? "UNKNOWN",

          rootCause: aiDecision.root_cause ?? aiDecision.root_causes ?? [],

          actions:
            aiDecision.recommended_actions ?? aiDecision.recovery_actions ?? [],
        };
      });

      setBatches(formatted);

      setError("");
    } catch (err) {
      console.error("Batch history error:", err);

      setError("Unable to load production history");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HISTORY AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchBatchHistory();

    // AUTO REFRESH EVERY 60 SECONDS
    //
    // Dashboard /device/read also runs every minute,
    // so this table retrieves the newly saved reading.

    const interval = setInterval(() => {
      fetchBatchHistory();
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshSignal]);

  const decisionStyle = (status) => {
    switch (status) {
      case "PASS":
        return "bg-green-500/20 text-green-400";

      case "WARN":
        return "bg-yellow-500/20 text-yellow-400";

      case "HOLD":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const releaseStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-400 bg-green-500/10";

      case "BLOCKED":
        return "text-red-400 bg-red-500/10";

      case "REVIEW_REQUIRED":
        return "text-yellow-400 bg-yellow-500/10";

      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const riskStyle = (risk) => {
    switch (risk) {
      case "HIGH":
        return "text-red-400";

      case "MEDIUM":
        return "text-yellow-400";

      case "LOW":
        return "text-green-400";

      default:
        return "text-gray-400";
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
mt-10
bg-white/5
backdrop-blur-xl
border
border-white/10
rounded-3xl
p-6
shadow-xl
"
    >
      <div
        className="
flex
justify-between
items-center
mb-6
"
      >
        <div>
          <h2
            className="
text-2xl
font-bold
text-white
"
          >
            AI Production History
          </h2>

          <p
            className="
text-gray-400
mt-1
"
          >
            Explainable coffee quality decisions
          </p>
        </div>

        <div
          className="
flex
items-center
gap-2
px-4
py-2
rounded-full
bg-green-500/10
text-green-400
text-sm
"
        >
          <Activity size={16} />
          Live Monitoring
        </div>
      </div>

      {loading && (
        <div
          className="
text-center
py-10
text-gray-400
"
        >
          Loading AI history...
        </div>
      )}

      {error && (
        <div
          className="
text-center
py-10
text-red-400
"
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          className="
max-h-[420px]
overflow-y-auto
pr-2
custom-scroll
"
        >
          <table
            className="
w-full
text-left
"
          >
            <thead
              className="
sticky
top-0
bg-[#111]
"
            >
              <tr
                className="
border-b
border-white/10
text-gray-400
"
              >
                <th className="py-4">Batch ID</th>

                <th>Time</th>

                <th>Decision</th>

                <th>Release</th>

                <th>Condition</th>

                <th>Confidence</th>

                <th>Risk</th>
              </tr>
            </thead>

            <tbody>
              {batches.map((batch, index) => (
                <tr
                  key={index}
                  className="
border-b
border-white/5
hover:bg-white/5
transition
"
                >
                  <td
                    className="
py-4
text-white
font-medium
"
                  >
                    {batch.id}
                  </td>

                  <td
                    className="
text-gray-300
"
                  >
                    {batch.time}
                  </td>

                  <td>
                    <span
                      className={`
px-3
py-1
rounded-full
text-sm
${decisionStyle(batch.decision)}
`}
                    >
                      {batch.decision}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`
px-3
py-1
rounded-full
text-sm
${releaseStyle(batch.release)}
`}
                    >
                      {batch.release}
                    </span>
                  </td>

                  <td
                    className="
text-white
font-semibold
"
                  >
                    {batch.condition}%
                  </td>

                  <td>
                    <div
                      className="
flex
items-center
gap-3
"
                    >
                      <span
                        className="
text-white
"
                      >
                        {batch.confidence}%
                      </span>

                      <div
                        className="
w-20
h-2
bg-white/10
rounded-full
overflow-hidden
"
                      >
                        <div
                          className="
h-full
bg-purple-500
"
                          style={{
                            width: `${batch.confidence}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td
                    className={`
font-semibold
${riskStyle(batch.risk)}
`}
                  >
                    {batch.risk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
