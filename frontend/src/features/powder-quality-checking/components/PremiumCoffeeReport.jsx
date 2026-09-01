import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Coffee,
  Cpu,
  Database,
  Droplets,
  Gauge,
  Layers3,
  PackageCheck,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Thermometer,
  TrendingUp,
  Waves,
  Wind,
  Zap,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// =====================================================
// HELPERS
// =====================================================

const clamp = (value, min = 0, max = 100) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
};

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeDecision = (value) =>
  String(value || "MONITORING")
    .trim()
    .toUpperCase();

const formatValue = (value, digits = 1) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return Number.isInteger(number) ? String(number) : number.toFixed(digits);
};

const formatDateTime = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const asText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return (
      firstDefined(
        value.message,
        value.summary,
        value.description,
        value.title,
        value.action,
        value.recommendation,
        value.next_action,
        value.next_step,
        value.interpretation,
      ) || ""
    );
  }

  return "";
};

const toList = (...values) => {
  for (const value of values) {
    if (!value) {
      continue;
    }

    if (Array.isArray(value)) {
      const result = value.map((item) => asText(item)).filter(Boolean);

      if (result.length) {
        return result;
      }
    }

    if (typeof value === "string") {
      const result = value
        .split(/\n|•|;/)
        .map((item) => item.trim())
        .filter(Boolean);

      if (result.length) {
        return result;
      }
    }

    if (typeof value === "object") {
      const result = Object.values(value)
        .map((item) => asText(item))
        .filter(Boolean);

      if (result.length) {
        return result;
      }
    }
  }

  return [];
};

const getDecisionTone = (decision) => {
  switch (decision) {
    case "PASS":
      return {
        accent: "#34D399",
        soft: "rgba(52,211,153,0.12)",
        border: "rgba(52,211,153,0.30)",
        label: "Production Ready",
      };

    case "WARN":
      return {
        accent: "#FBBF24",
        soft: "rgba(251,191,36,0.12)",
        border: "rgba(251,191,36,0.30)",
        label: "Review Required",
      };

    case "HOLD":
      return {
        accent: "#FB7185",
        soft: "rgba(251,113,133,0.12)",
        border: "rgba(251,113,133,0.30)",
        label: "Production Hold",
      };

    default:
      return {
        accent: "#60A5FA",
        soft: "rgba(96,165,250,0.12)",
        border: "rgba(96,165,250,0.30)",
        label: "Monitoring",
      };
  }
};

const deriveReportIntelligence = ({ liveSensor, batchState }) => {
  const ai = liveSensor?.ai_decision || {};

  const recommendation = ai?.recommendation || {};

  const decision = normalizeDecision(
    firstDefined(
      ai.decision,
      ai.status,
      liveSensor?.decision,
      liveSensor?.status,
    ),
  );

  const qualityScore = clamp(
    firstDefined(
      ai.quality_score,
      ai.condition_score,
      ai.score,
      liveSensor?.quality_score,
      0,
    ),
  );

  const confidence = clamp(
    firstDefined(
      ai.confidence,
      ai.ai_confidence,
      ai.intelligent_confidence,
      liveSensor?.confidence,
      0,
    ),
  );

  const recovery = clamp(
    decision === "PASS"
      ? 100
      : firstDefined(
          recommendation?.recovery_probability,
          recommendation?.recovery_score,
          ai.recovery_probability,
          ai.recovery_score,
          liveSensor?.recovery_probability,
          0,
        ),
  );

  const riskLevel = String(
    firstDefined(
      ai.risk_level,
      liveSensor?.risk_level,
      decision === "PASS"
        ? "LOW"
        : decision === "WARN"
          ? "MEDIUM"
          : decision === "HOLD"
            ? "HIGH"
            : "MONITORING",
    ),
  ).toUpperCase();

  const releaseStatus = String(
    firstDefined(
      ai.release_status,
      ai.batch_release_status,
      liveSensor?.release_status,
      decision === "PASS"
        ? "READY"
        : decision === "HOLD"
          ? "BLOCKED"
          : decision === "WARN"
            ? "REVIEW_REQUIRED"
            : "MONITORING",
    ),
  ).toUpperCase();

  const rootCause =
    asText(
      firstDefined(
        ai.root_cause,
        liveSensor?.root_cause,
        ai.diagnosis,
        ai.explanation,
      ),
    ) ||
    (decision === "PASS"
      ? "No significant quality deviation was detected in the latest production assessment."
      : "Quality variation requires review before final release.");

  const recommendationText =
    asText(
      firstDefined(
        recommendation?.next_production_action,
        recommendation?.next_action,
        recommendation?.recommendation,
        recommendation?.summary,
        ai.next_action,
        ai.recommendation_text,
      ),
    ) ||
    (decision === "PASS"
      ? "Continue controlled production and proceed to the next manufacturing stage."
      : decision === "HOLD"
        ? "Complete corrective validation before making a release decision."
        : decision === "WARN"
          ? "Review the current batch condition and verify the flagged quality signals."
          : "Continue monitoring the batch until a clear quality decision is available.");

  const evidence = toList(
    ai.quality_evidence,
    ai.evidence,
    ai.reasons,
    ai.findings,
    recommendation?.evidence,
  );

  const correctiveActions = toList(
    recommendation?.corrective_actions,
    recommendation?.actions,
    recommendation?.workflow,
    ai.corrective_actions,
    ai.actions,
  );

  const prevention = toList(
    recommendation?.future_prevention,
    recommendation?.prevention,
    recommendation?.preventive_actions,
    ai.future_prevention,
    ai.prevention,
  );

  return {
    decision,
    qualityScore,
    confidence,
    recovery,
    riskLevel,
    releaseStatus,
    rootCause,
    recommendationText,
    evidence:
      evidence.length > 0
        ? evidence
        : [
            decision === "PASS"
              ? "Current quality indicators are within the system's accepted operating state."
              : "The AI decision engine detected one or more signals that require operational review.",
          ],
    correctiveActions:
      correctiveActions.length > 0
        ? correctiveActions
        : [
            decision === "PASS"
              ? "Maintain the current controlled production settings."
              : "Verify the latest sensor conditions and repeat quality validation.",
            decision === "HOLD"
              ? "Do not release the batch until corrective validation is completed."
              : "Document the review outcome before the next production decision.",
          ],
    prevention:
      prevention.length > 0
        ? prevention
        : [
            "Maintain stable environmental and production conditions.",
            "Continue scheduled sensor monitoring and AI quality validation.",
          ],
    batchId:
      batchState?.batch_id ||
      batchState?.last_completed_batch_id ||
      liveSensor?.batch_id ||
      "CURRENT-BATCH",
  };
};

const buildHistory = (history = [], batchId) => {
  const relevant = history
    .filter((item) => {
      if (!batchId) {
        return true;
      }

      return !item?.batch_id || item.batch_id === batchId;
    })
    .slice(-30);

  return relevant.map((item, index) => {
    const ai = item?.ai_decision || {};
    const recommendation = ai?.recommendation || {};

    const decision = normalizeDecision(
      firstDefined(ai?.decision, ai?.status, item?.decision, item?.status),
    );

    const recovery =
      decision === "PASS"
        ? 100
        : safeNumber(
            firstDefined(
              recommendation?.recovery_probability,
              recommendation?.recovery_score,
              ai?.recovery_probability,
              ai?.recovery_score,
              item?.recovery_probability,
              0,
            ),
          );

    return {
      index: index + 1,
      time: item?.time
        ? new Date(item.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : String(index + 1),

      temperature: safeNumber(item?.temperature),
      humidity: safeNumber(item?.humidity),
      moisture: safeNumber(item?.moisture),

      mq2: safeNumber(item?.mq2),
      mq3: safeNumber(item?.mq3),
      mq135: safeNumber(item?.mq135),

      qualityScore: clamp(
        firstDefined(
          ai?.quality_score,
          ai?.condition_score,
          ai?.score,
          item?.quality_score,
          0,
        ),
      ),

      confidence: clamp(
        firstDefined(ai?.confidence, ai?.ai_confidence, item?.confidence, 0),
      ),

      recovery: clamp(recovery),

      decision,
    };
  });
};

const getStats = (data, key) => {
  const values = data
    .map((item) => safeNumber(item?.[key], NaN))
    .filter(Number.isFinite);

  if (!values.length) {
    return {
      min: 0,
      max: 0,
      avg: 0,
    };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((sum, value) => sum + value, 0) / values.length,
  };
};

const getRelativeStability = (stats) => {
  const avg = Math.abs(safeNumber(stats?.avg));
  const range = Math.abs(safeNumber(stats?.max) - safeNumber(stats?.min));

  if (avg <= 0) {
    return 0;
  }

  const relativeSpread = (range / Math.max(avg, 1)) * 100;

  return clamp(100 - relativeSpread);
};

const getDecisionConsistency = (history = []) => {
  if (!history.length) {
    return 0;
  }

  const counts = history.reduce((acc, item) => {
    const decision = item?.decision || "UNKNOWN";

    acc[decision] = (acc[decision] || 0) + 1;

    return acc;
  }, {});

  const maximum = Math.max(0, ...Object.values(counts));

  return clamp((maximum / history.length) * 100);
};

const getDataContinuity = (history = []) => {
  if (!history.length) {
    return 0;
  }

  // The report requests the latest 30 readings.
  // This is only a visualization of available history density,
  // not an official backend quality metric.
  return clamp((Math.min(history.length, 30) / 30) * 100);
};

const getDecisionColor = (decision) => {
  switch (normalizeDecision(decision)) {
    case "PASS":
      return "#10B981";

    case "WARN":
      return "#F59E0B";

    case "HOLD":
      return "#F43F5E";

    default:
      return "#3B82F6";
  }
};

// =====================================================
// SMALL UI COMPONENTS
// =====================================================

function ReportBrandHeader({ page, title, batchId, generatedAt }) {
  return (
    <div
      className="
        relative
        z-10

        flex
        items-center
        justify-between

        rounded-[22px]

        border
        border-[#E1C49C]/55

        bg-white/68
        backdrop-blur-xl

        px-4
        py-3.5

        shadow-[0_10px_30px_rgba(95,58,27,0.07)]
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-11
            w-11

            items-center
            justify-center

            rounded-2xl

            border
            border-[#F1C66F]/30

            bg-gradient-to-br
            from-[#FFD987]
            via-[#E7AE4C]
            to-[#C27825]

            text-[#281307]

            shadow-[0_12px_32px_rgba(198,119,30,0.24)]
          "
        >
          <Coffee className="h-5 w-5" />
        </div>

        <div>
          <div
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[3.6px]

              text-[#E9B85D]
            "
          >
            CoffeeSense AI
          </div>

          <div
            className="
              mt-1

              text-[18px]
              font-black
              tracking-[-0.3px]

              text-[#2B170D]
            "
          >
            {title}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[2px]

            text-[#9B682F]
          "
        >
          {batchId}
        </div>

        <div
          className="
            mt-1
            text-[10px]
            font-semibold

            text-[#70513B]
          "
        >
          {formatDateTime(generatedAt)}
        </div>

        <div
          className="
            mt-1
            text-[9px]
            font-bold
            text-[#7B5F4A]
          "
        >
          Page {page}
        </div>
      </div>
    </div>
  );
}

function PageFooter({ batchId, page }) {
  return (
    <div
      className="
        absolute
        bottom-7
        left-8
        right-8

        flex
        items-center
        justify-between

        border-t
        border-[#D8BE9D]/55

        pt-3
      "
    >
      <span
        className="
          text-[8px]
          font-bold
          uppercase
          tracking-[2px]

          text-[#80614A]
        "
      >
        CoffeeSense AI - Industrial Coffee Quality Intelligence
      </span>

      <span
        className="
          text-[8px]
          font-black
          uppercase
          tracking-[1.6px]

          text-[#A96820]
        "
      >
        {batchId} / {page}
      </span>
    </div>
  );
}

function PageShell({ children, page, title, batchId, generatedAt }) {
  return (
    <section
      data-report-page="true"
      className="
        relative

        h-[1123px]
        w-[794px]

        overflow-hidden

        bg-gradient-to-br
        from-[#FBF7F1]
        via-[#F6EBDD]
        to-[#EED8BC]

        p-8

        text-[#2C170B]
      "
    >
      {/* Premium ambient decoration */}
      <div
        className="
          pointer-events-none
          absolute
          -right-28
          -top-36

          h-[410px]
          w-[410px]

          rounded-full

          bg-[#E4A840]/12

          blur-[105px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-44
          -left-24

          h-[430px]
          w-[430px]

          rounded-full

          bg-[#A85F27]/10

          blur-[120px]
        "
      />

      <div
        className="
          absolute
          inset-x-0
          top-0

          h-1

          bg-gradient-to-r
          from-transparent
          via-[#C7892E]
          to-transparent
        "
      />

      <div
        className="
          relative
          h-full

          rounded-[34px]

          border
          border-[#D8B98E]/55

          bg-gradient-to-br
          from-[#FFFDFC]
          via-[#FFF9F1]
          to-[#F7E9D5]

          px-7
          py-6

          shadow-[0_28px_80px_rgba(88,52,22,0.13)]
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-0

            rounded-[34px]

            bg-[radial-gradient(circle_at_12%_8%,rgba(229,173,80,0.13),transparent_25%),radial-gradient(circle_at_88%_26%,rgba(191,121,54,0.08),transparent_30%),radial-gradient(circle_at_52%_100%,rgba(226,190,134,0.10),transparent_38%)]
          "
        />

        <ReportBrandHeader
          page={page}
          title={title}
          batchId={batchId}
          generatedAt={generatedAt}
        />

        <div className="relative z-10 pt-6">{children}</div>

        <PageFooter batchId={batchId} page={page} />
      </div>
    </section>
  );
}

function SectionEyebrow({ icon: Icon, children }) {
  return (
    <div
      className="
        flex
        items-center
        gap-2

        text-[10px]
        font-black
        uppercase
        tracking-[2.4px]

        text-[#B87529]
      "
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </div>
  );
}

function ScoreRing({ label, value, icon: Icon, accent = "#F0B95E" }) {
  const percent = clamp(value);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div
      className="
        relative

        rounded-[24px]

        border
        border-[#D7BB98]/55

        bg-gradient-to-br
        from-white/95
        via-[#FFF9F1]/95
        to-[#F8E9D5]/90

        p-4

        shadow-[0_15px_38px_rgba(98,61,29,0.10)]

        ring-1
        ring-white/70
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <div
            className="
              flex
              items-center
              gap-2

              text-[10px]
              font-black
              uppercase
              tracking-[1.7px]

              text-[#765842]
            "
          >
            <Icon className="h-4 w-4" />
            {label}
          </div>

          <div
            className="
              mt-3
              text-[32px]
              font-black
              tracking-[-1px]

              text-[#2A170B]
            "
          >
            {Math.round(percent)}%
          </div>

          <div
            className="
              mt-1
              text-[10px]
              font-semibold

              text-[#826650]
            "
          >
            Intelligence index
          </div>
        </div>

        <svg viewBox="0 0 100 100" className="h-[82px] w-[82px]">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(129,89,53,0.10)"
            strokeWidth="8"
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            transform="rotate(-90 50 50)"
          />

          <text
            x="50"
            y="54"
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            fill="#2B170D"
          >
            {Math.round(percent)}
          </text>
        </svg>
      </div>
    </div>
  );
}

function SnapshotCard({
  icon: Icon,
  label,
  value,
  unit = "",
  hint,
  accentClass,
}) {
  return (
    <div
      className="
        rounded-[22px]

        border
        border-[#D7BB98]/50

        bg-gradient-to-br
        from-white/95
        via-white/82
        to-[#F8E8D4]/72

        p-4

        shadow-[0_12px_28px_rgba(90,53,23,0.07)]
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-[#DCC5A6]/45
            ${accentClass}
          `}
        >
          <Icon className="h-4 w-4" />
        </div>

        <Radio className="h-3.5 w-3.5 text-emerald-600" />
      </div>

      <div
        className="
          mt-4

          text-[9px]
          font-black
          uppercase
          tracking-[1.8px]

          text-[#765A46]
        "
      >
        {label}
      </div>

      <div
        className="
          mt-1

          text-[29px]
          font-black
          tracking-[-0.6px]

          text-[#2A170B]
        "
      >
        {value}
        {unit && (
          <span
            className="
              ml-1
              text-[15px]
              font-black
              text-[#B87529]
            "
          >
            {unit}
          </span>
        )}
      </div>

      <div
        className="
          mt-1
          text-[9px]
          font-semibold

          text-[#80644E]
        "
      >
        {hint}
      </div>
    </div>
  );
}

function MiniAreaChart({
  title,
  description,
  data,
  dataKey,
  lineColor,
  gradientId,
  unit,
  icon: Icon,
}) {
  return (
    <div
      className="
        rounded-[25px]

        border
        border-[#D7BB98]/55

        bg-gradient-to-br
        from-white/96
        via-[#FFF9F2]/94
        to-[#F7E8D4]/88

        p-4
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className="
              flex
              items-center
              gap-2

              text-[13px]
              font-black

              text-[#2A170B]
            "
          >
            <Icon
              className="h-4 w-4"
              style={{
                color: lineColor,
              }}
            />
            {title}
          </div>

          <p
            className="
              mt-1
              text-[10px]
              font-semibold

              text-[#7B5F4A]
            "
          >
            {description}
          </p>
        </div>

        <div
          className="
            rounded-full

            border
            border-emerald-300/55

            bg-emerald-50/90

            px-2
            py-1

            text-[7px]
            font-black
            uppercase
            tracking-[1px]

            text-emerald-700
          "
        >
          Live history
        </div>
      </div>

      <div className="mt-3 h-[205px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 8,
              right: 4,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(119,82,51,0.10)"
              strokeDasharray="4 7"
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              minTickGap={45}
              tick={{
                fill: "#7A5B45",
                fontSize: 8,
                fontWeight: 600,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={44}
              tick={{
                fill: "#7A5B45",
                fontSize: 8,
                fontWeight: 600,
              }}
            />

            <Tooltip
              contentStyle={{
                background: "#FFFDF9",
                border: "1px solid rgba(190,139,81,0.30)",
                borderRadius: 12,
                color: "#2B170D",
                fontSize: 10,
              }}
              labelStyle={{
                color: "#765842",
              }}
              formatter={(value) => [`${formatValue(value)}${unit}`, title]}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={lineColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SignalBar({ label, value, color, max = 1023 }) {
  const safe = Math.max(0, safeNumber(value));
  const width = Math.min(100, (safe / max) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div
          className="
            flex
            items-center
            gap-2

            text-[10px]
            font-black
            uppercase
            tracking-[1.5px]

            text-[#684A36]
          "
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 16px ${color}66`,
            }}
          />
          {label}
        </div>

        <div
          className="
            text-[18px]
            font-black

            text-[#2A170B]
          "
        >
          {formatValue(safe, 0)}
        </div>
      </div>

      <div
        className="
          h-2.5
          overflow-hidden
          rounded-full

          bg-[#E8D8C3]

          ring-1
          ring-[#D7C1A4]/40
        "
      >
        <div
          className="
            h-full
            rounded-full
          "
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 18px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}

function InsightList({
  items,
  icon: Icon = CheckCircle2,
  accent = "text-[#E6B55E]",
}) {
  return (
    <div className="space-y-2.5">
      {items.slice(0, 5).map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="
            flex
            items-start
            gap-3

            rounded-2xl

            border
            border-[#D9BF9E]/45

            bg-white/72

            px-3.5
            py-3
          "
        >
          <div
            className="
              mt-0.5

              flex
              h-7
              w-7
              shrink-0

              items-center
              justify-center

              rounded-lg

              bg-[#F8EADB]/85
            "
          >
            <Icon className={`h-3.5 w-3.5 ${accent}`} />
          </div>

          <p
            className="
              text-[10px]
              font-semibold
              leading-[1.6]

              text-[#624633]
            "
          >
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatStrip({ label, value, sub }) {
  return (
    <div
      className="
        rounded-2xl

        border
        border-[#D5B894]/46

        bg-white/78

        p-3.5
      "
    >
      <div
        className="
          text-[9px]
          font-black
          uppercase
          tracking-[1.6px]

          text-[#7B5D47]
        "
      >
        {label}
      </div>

      <div
        className="
          mt-1

          text-[20px]
          font-black

          text-[#2B170D]
        "
      >
        {value}
      </div>

      {sub && (
        <div
          className="
            mt-0.5
            text-[8px]
            font-semibold

            text-[#8A6C55]
          "
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function DecisionTimeline({ data = [] }) {
  const visible = data.slice(-24);

  return (
    <div
      className="
        rounded-[28px]

        border
        border-[#D7BB98]/55

        bg-gradient-to-br
        from-white/96
        via-[#FFF9F2]/94
        to-[#F7E8D4]/88

        p-5

        shadow-[0_14px_34px_rgba(92,55,25,0.08)]
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <SectionEyebrow icon={Clock3}>
            Production Decision Timeline
          </SectionEyebrow>

          <h3
            className="
              mt-2
              text-[21px]
              font-black
              tracking-[-0.45px]
              text-[#2B170D]
            "
          >
            AI Outcome Pulse
          </h3>

          <p
            className="
              mt-1
              text-[11px]
              font-semibold
              text-[#765A47]
            "
          >
            A compact time-ordered view of recent production decisions.
          </p>
        </div>

        <div
          className="
            rounded-full
            border
            border-[#D7BB98]/50
            bg-white/75
            px-3
            py-1.5
            text-[9px]
            font-black
            uppercase
            tracking-[1.2px]
            text-[#9B682F]
          "
        >
          {visible.length} samples
        </div>
      </div>

      <div
        className="
          mt-5
          flex
          items-end
          gap-1.5
        "
      >
        {visible.map((item, index) => {
          const height = 22 + (index % 5) * 5;

          const color = getDecisionColor(item?.decision);

          return (
            <div
              key={`${item?.time}-${index}`}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div
                className="
                  w-full
                  min-w-[5px]
                  rounded-full
                "
                style={{
                  height: `${height}px`,
                  background: `linear-gradient(180deg, ${color}, ${color}88)`,
                  boxShadow: `0 5px 14px ${color}25`,
                }}
                title={`${item?.time || index + 1}: ${item?.decision || "MONITORING"}`}
              />

              {index % 4 === 0 && (
                <span
                  className="
                    text-[8px]
                    font-bold
                    text-[#84664F]
                  "
                >
                  {item?.time}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-4
          border-t
          border-[#D9C3A7]/45
          pt-3
        "
      >
        {[
          ["PASS", "#10B981"],
          ["WARN", "#F59E0B"],
          ["HOLD", "#F43F5E"],
          ["MONITOR", "#3B82F6"],
        ].map(([label, color]) => (
          <div
            key={label}
            className="
              flex
              items-center
              gap-2
              text-[9px]
              font-black
              text-[#684B38]
            "
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}35`,
              }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function AiIntelligenceTrendChart({ data = [] }) {
  const hasQuality = data.some((item) => safeNumber(item?.qualityScore) > 0);

  const hasConfidence = data.some((item) => safeNumber(item?.confidence) > 0);

  const hasRecovery = data.some((item) => safeNumber(item?.recovery) > 0);

  return (
    <div
      className="
        rounded-[28px]

        border
        border-[#D7BB98]/55

        bg-gradient-to-br
        from-white/96
        via-[#FFF9F2]/95
        to-[#F5E2C7]/88

        p-5

        shadow-[0_14px_34px_rgba(92,55,25,0.08)]
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <SectionEyebrow icon={TrendingUp}>
            AI Intelligence Trend
          </SectionEyebrow>

          <h3
            className="
              mt-2
              text-[21px]
              font-black
              tracking-[-0.45px]
              text-[#2B170D]
            "
          >
            Quality Decision Signals
          </h3>

          <p
            className="
              mt-1
              text-[11px]
              font-semibold
              text-[#765A47]
            "
          >
            Historical AI scores when available in the saved decision payload.
          </p>
        </div>

        <div
          className="
            rounded-full
            border
            border-[#C9A76F]/45
            bg-[#FFF6E4]
            px-3
            py-1.5
            text-[9px]
            font-black
            uppercase
            tracking-[1.2px]
            text-[#A96820]
          "
        >
          0-100 index
        </div>
      </div>

      <div className="mt-4 h-[245px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 8,
              right: 10,
              left: -14,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(119,82,51,0.10)"
              strokeDasharray="5 7"
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              minTickGap={45}
              tick={{
                fill: "#765A47",
                fontSize: 9,
                fontWeight: 700,
              }}
            />

            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              width={38}
              tick={{
                fill: "#765A47",
                fontSize: 9,
                fontWeight: 700,
              }}
            />

            <Tooltip
              contentStyle={{
                background: "#FFFDF9",
                border: "1px solid rgba(190,139,81,0.30)",
                borderRadius: 14,
                color: "#2B170D",
                fontSize: 10,
                boxShadow: "0 12px 30px rgba(80,45,20,0.10)",
              }}
            />

            {hasQuality && (
              <Line
                type="monotone"
                dataKey="qualityScore"
                name="Quality Score"
                stroke="#D99A2B"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 4,
                }}
                isAnimationActive={false}
              />
            )}

            {hasConfidence && (
              <Line
                type="monotone"
                dataKey="confidence"
                name="AI Confidence"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 4,
                }}
                isAnimationActive={false}
              />
            )}

            {hasRecovery && (
              <Line
                type="monotone"
                dataKey="recovery"
                name="Recovery"
                stroke="#10B981"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 4,
                }}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        className="
          mt-3
          flex
          flex-wrap
          gap-4
          border-t
          border-[#D9C3A7]/45
          pt-3
        "
      >
        {[
          ["Quality", "#D99A2B", hasQuality],
          ["Confidence", "#3B82F6", hasConfidence],
          ["Recovery", "#10B981", hasRecovery],
        ].map(([label, color, available]) => (
          <div
            key={label}
            className="
              flex
              items-center
              gap-2
              text-[9px]
              font-black
            "
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: available ? color : "#D7C8B8",
              }}
            />

            <span className={available ? "text-[#5D402E]" : "text-[#9C8878]"}>
              {label}
              {!available ? " (not saved)" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StabilityRadar({ data = [] }) {
  return (
    <div
      className="
        rounded-[28px]

        border
        border-[#D7BB98]/55

        bg-gradient-to-br
        from-white/96
        via-[#FFF9F2]/94
        to-[#F5E5CF]/88

        p-5

        shadow-[0_14px_34px_rgba(92,55,25,0.08)]
      "
    >
      <div>
        <SectionEyebrow icon={Gauge}>Derived Stability View</SectionEyebrow>

        <h3
          className="
            mt-2
            text-[21px]
            font-black
            tracking-[-0.45px]
            text-[#2B170D]
          "
        >
          Production Stability Radar
        </h3>

        <p
          className="
            mt-1
            text-[10px]
            font-semibold
            leading-5
            text-[#765A47]
          "
        >
          Report visualization derived from recent spread, decision consistency
          and available history density. It is not a separate backend quality
          score.
        </p>
      </div>

      <div className="mt-2 h-[275px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="rgba(112,75,48,0.16)" />

            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: "#684B38",
                fontSize: 9,
                fontWeight: 800,
              }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />

            <Radar
              name="Stability"
              dataKey="value"
              stroke="#D6922C"
              fill="#E7AC46"
              fillOpacity={0.2}
              strokeWidth={2.5}
              isAnimationActive={false}
            />

            <Tooltip
              contentStyle={{
                background: "#FFFDF9",
                border: "1px solid rgba(190,139,81,0.30)",
                borderRadius: 14,
                color: "#2B170D",
                fontSize: 10,
              }}
              formatter={(value) => [
                `${Math.round(safeNumber(value))}%`,
                "Index",
              ]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VariationBarChart({ data = [] }) {
  return (
    <div
      className="
        rounded-[28px]

        border
        border-[#D7BB98]/55

        bg-white/88

        p-5

        shadow-[0_14px_34px_rgba(92,55,25,0.07)]
      "
    >
      <SectionEyebrow icon={BarChart3}>
        Relative Telemetry Variation
      </SectionEyebrow>

      <h3
        className="
          mt-2
          text-[21px]
          font-black
          tracking-[-0.45px]
          text-[#2B170D]
        "
      >
        Recent Sensor Spread
      </h3>

      <p
        className="
          mt-1
          text-[10px]
          font-semibold
          text-[#765A47]
        "
      >
        Relative range compared with the recent average for each sensor.
      </p>

      <div className="mt-4 h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 8,
              right: 18,
              left: 20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="rgba(119,82,51,0.10)"
              strokeDasharray="5 7"
            />

            <XAxis
              type="number"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#765A47",
                fontSize: 9,
                fontWeight: 700,
              }}
              tickFormatter={(value) => `${value}%`}
            />

            <YAxis
              type="category"
              dataKey="name"
              width={76}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#5D402E",
                fontSize: 10,
                fontWeight: 900,
              }}
            />

            <Tooltip
              contentStyle={{
                background: "#FFFDF9",
                border: "1px solid rgba(190,139,81,0.30)",
                borderRadius: 14,
                color: "#2B170D",
                fontSize: 10,
              }}
              formatter={(value) => [
                `${formatValue(value, 1)}%`,
                "Relative variation",
              ]}
            />

            <Bar
              dataKey="variation"
              fill="#E0A03B"
              radius={[0, 10, 10, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =====================================================
// MAIN REPORT COMPONENT
// =====================================================

/*
  2026 LIGHT LUXURY REPORT THEME
  --------------------------------
  Visual direction:
  - warm ivory + champagne glass surfaces
  - espresso typography for maximum readability
  - gold/amber highlights used selectively
  - colored telemetry charts remain vivid
  - dark backgrounds are intentionally limited
*/
function PremiumCoffeeReport({
  reportRef,
  liveSensor = {},
  batchState = {},
  history = [],
  generatedAt = new Date(),
}) {
  const intelligence = deriveReportIntelligence({
    liveSensor,
    batchState,
  });

  const tone = getDecisionTone(intelligence.decision);

  const historyData = buildHistory(history, intelligence.batchId);

  const tempStats = getStats(historyData, "temperature");

  const humidityStats = getStats(historyData, "humidity");

  const moistureStats = getStats(historyData, "moisture");

  const decisionCounts = historyData.reduce(
    (acc, item) => {
      const decision = item.decision || "UNKNOWN";

      acc[decision] = (acc[decision] || 0) + 1;

      return acc;
    },
    {
      PASS: 0,
      WARN: 0,
      HOLD: 0,
      MONITORING: 0,
      UNKNOWN: 0,
    },
  );

  const decisionPieData = [
    {
      name: "Pass",
      value: decisionCounts.PASS,
      color: "#34D399",
    },
    {
      name: "Warn",
      value: decisionCounts.WARN,
      color: "#FBBF24",
    },
    {
      name: "Hold",
      value: decisionCounts.HOLD,
      color: "#FB7185",
    },
    {
      name: "Other",
      value: decisionCounts.MONITORING + decisionCounts.UNKNOWN,
      color: "#60A5FA",
    },
  ].filter((item) => item.value > 0);

  const decisionSummaryData =
    decisionPieData.length > 0
      ? decisionPieData
      : [
          {
            name: "Current",
            value: 1,
            color: tone.accent,
          },
        ];

  const stabilityRadarData = [
    {
      subject: "Temperature",
      value: getRelativeStability(tempStats),
    },
    {
      subject: "Humidity",
      value: getRelativeStability(humidityStats),
    },
    {
      subject: "Moisture",
      value: getRelativeStability(moistureStats),
    },
    {
      subject: "Decision",
      value: getDecisionConsistency(historyData),
    },
    {
      subject: "Continuity",
      value: getDataContinuity(historyData),
    },
  ];

  const variationData = [
    {
      name: "Temperature",
      variation: 100 - getRelativeStability(tempStats),
    },
    {
      name: "Humidity",
      variation: 100 - getRelativeStability(humidityStats),
    },
    {
      name: "Moisture",
      variation: 100 - getRelativeStability(moistureStats),
    },
  ];

  const currentTemperature = firstDefined(
    liveSensor?.temperature,
    historyData.at(-1)?.temperature,
  );

  const currentHumidity = firstDefined(
    liveSensor?.humidity,
    historyData.at(-1)?.humidity,
  );

  const currentMoisture = firstDefined(
    liveSensor?.moisture,
    historyData.at(-1)?.moisture,
  );

  const rgb = {
    red: safeNumber(firstDefined(liveSensor?.red, liveSensor?.rgb?.red)),
    green: safeNumber(firstDefined(liveSensor?.green, liveSensor?.rgb?.green)),
    blue: safeNumber(firstDefined(liveSensor?.blue, liveSensor?.rgb?.blue)),
  };

  const pageTitle = "Coffee Powder Quality Intelligence Report";

  return (
    <div
      ref={reportRef}
      aria-hidden="true"
      className="
        fixed
        left-[-100000px]
        top-0

        z-[-9999]

        space-y-8

        bg-[#F3E7D7]

        p-0

        pointer-events-none
      "
    >
      {/* =====================================================
          PAGE 1 - EXECUTIVE INTELLIGENCE
      ===================================================== */}
      <PageShell
        page={1}
        title={pageTitle}
        batchId={intelligence.batchId}
        generatedAt={generatedAt}
      >
        <div
          className="
            grid
            grid-cols-[1.35fr_0.65fr]
            gap-5
          "
        >
          <div>
            <SectionEyebrow icon={Sparkles}>
              Executive Production Intelligence
            </SectionEyebrow>

            <h1
              className="
                mt-3
                max-w-[500px]

                text-[43px]
                font-black
                leading-[1.02]
                tracking-[-1.5px]

                text-[#2A170B]
              "
            >
              Batch Quality
              <span
                className="
                  block
                  bg-gradient-to-r
                  from-[#F4C66C]
                  via-[#E3A642]
                  to-[#C87925]
                  bg-clip-text
                  text-transparent
                "
              >
                Intelligence Summary
              </span>
            </h1>

            <p
              className="
                mt-4
                max-w-[520px]

                text-[11px]
                font-medium
                leading-5

                text-[#73533D]
              "
            >
              AI-assisted production quality overview combining current sensor
              conditions, decision confidence, recovery potential and batch
              release intelligence.
            </p>
          </div>

          <div
            className="
              rounded-[28px]

              border

              bg-white/74
              backdrop-blur-xl

              p-5

              shadow-[0_16px_38px_rgba(89,51,21,0.08)]
            "
            style={{
              borderColor: tone.border,
              background: `linear-gradient(145deg, ${tone.soft}, rgba(255,255,255,0.02))`,
            }}
          >
            <div
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[2px]

                text-[#81614A]
              "
            >
              Current AI Decision
            </div>

            <div
              className="
                mt-5
                text-[46px]
                font-black
                leading-none
                tracking-[-1.5px]
              "
              style={{
                color: tone.accent,
              }}
            >
              {intelligence.decision}
            </div>

            <div
              className="
                mt-3

                inline-flex
                items-center
                gap-2

                rounded-full

                border

                px-3
                py-1.5

                text-[8px]
                font-black
                uppercase
                tracking-[1.4px]
              "
              style={{
                color: tone.accent,
                borderColor: tone.border,
                background: tone.soft,
              }}
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                "
                style={{
                  backgroundColor: tone.accent,
                  boxShadow: `0 0 10px ${tone.accent}`,
                }}
              />
              {tone.label}
            </div>

            <div
              className="
                mt-5
                border-t
                border-[#D8C2A6]/45
                pt-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between

                  text-[9px]
                  font-bold
                "
              >
                <span className="text-[#876B55]">Release status</span>

                <span className="text-[#6C4A30]">
                  {intelligence.releaseStatus}
                </span>
              </div>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between

                  text-[9px]
                  font-bold
                "
              >
                <span className="text-[#876B55]">Risk profile</span>

                <span
                  style={{
                    color: tone.accent,
                  }}
                >
                  {intelligence.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="
            mt-6
            grid
            grid-cols-3
            gap-4
          "
        >
          <ScoreRing
            label="Quality score"
            value={intelligence.qualityScore}
            icon={Gauge}
            accent="#F6C85F"
          />

          <ScoreRing
            label="AI confidence"
            value={intelligence.confidence}
            icon={Cpu}
            accent="#60A5FA"
          />

          <ScoreRing
            label="Recovery potential"
            value={intelligence.recovery}
            icon={TrendingUp}
            accent="#34D399"
          />
        </div>

        <div className="mt-6">
          <SectionEyebrow icon={Activity}>
            Live Production Snapshot
          </SectionEyebrow>

          <div
            className="
              mt-3
              grid
              grid-cols-3
              gap-3
            "
          >
            <SnapshotCard
              icon={Droplets}
              label="Moisture"
              value={formatValue(currentMoisture)}
              hint="Latest sensor response"
              accentClass="bg-blue-500/10 text-blue-600"
            />

            <SnapshotCard
              icon={Thermometer}
              label="Temperature"
              value={formatValue(currentTemperature)}
              unit="°C"
              hint="Ambient process condition"
              accentClass="bg-red-500/10 text-red-600"
            />

            <SnapshotCard
              icon={Wind}
              label="Humidity"
              value={formatValue(currentHumidity)}
              unit="%"
              hint="Relative atmospheric level"
              accentClass="bg-cyan-500/10 text-cyan-700"
            />
          </div>
        </div>

        <div
          className="
            mt-6
            grid
            grid-cols-[1.1fr_0.9fr]
            gap-4
          "
        >
          <div
            className="
              rounded-[26px]

              border
              border-[#D7BB98]/50

              bg-white/82

              p-5
            "
          >
            <SectionEyebrow icon={Target}>AI Diagnosis</SectionEyebrow>

            <h3
              className="
                mt-3

                text-[19px]
                font-black

                text-[#2A170B]
              "
            >
              Quality Interpretation
            </h3>

            <p
              className="
                mt-2

                text-[10px]
                font-semibold
                leading-[1.7]

                text-[#72523B]
              "
            >
              {intelligence.rootCause}
            </p>
          </div>

          <div
            className="
              rounded-[26px]

              border
              border-[#D5A24F]/42

              bg-gradient-to-br
              from-[#FFF5DC]
              via-[#FCE7B7]
              to-[#F4CF8C]

              p-5
            "
          >
            <SectionEyebrow icon={Zap}>
              Next Production Direction
            </SectionEyebrow>

            <p
              className="
                mt-4

                text-[13px]
                font-black
                leading-[1.55]

                text-[#3A210E]
              "
            >
              {intelligence.recommendationText}
            </p>
          </div>
        </div>

        <div
          className="
            mt-5

            grid
            grid-cols-3
            gap-3
          "
        >
          <StatStrip
            label="Batch ID"
            value={intelligence.batchId}
            sub="Tracked production batch"
          />

          <StatStrip
            label="Started"
            value={formatDateTime(batchState?.started_at)}
            sub="Production lifecycle"
          />

          <StatStrip
            label="Samples"
            value={historyData.length || "--"}
            sub="History records in report"
          />
        </div>
      </PageShell>

      {/* =====================================================
          PAGE 2 - SENSOR ANALYTICS
      ===================================================== */}
      <PageShell
        page={2}
        title="Sensor Intelligence Analytics"
        batchId={intelligence.batchId}
        generatedAt={generatedAt}
      >
        <div className="flex items-end justify-between">
          <div>
            <SectionEyebrow icon={Radio}>
              Environmental Telemetry
            </SectionEyebrow>

            <h2
              className="
                mt-2

                text-[35px]
                font-black
                tracking-[-1px]

                text-[#2A170B]
              "
            >
              Sensor Trend Intelligence
            </h2>

            <p
              className="
                mt-2

                text-[10px]
                font-medium

                text-[#765A47]
              "
            >
              Last {historyData.length || 0} available production readings.
            </p>
          </div>

          <div
            className="
              rounded-2xl

              border
              border-emerald-300/55

              bg-emerald-50/90

              px-4
              py-2
            "
          >
            <div
              className="
                flex
                items-center
                gap-2

                text-[8px]
                font-black
                uppercase
                tracking-[1.5px]

                text-emerald-700
              "
            >
              <span
                className="
                  h-2
                  w-2

                  rounded-full

                  bg-emerald-400

                  shadow-[0_0_12px_rgba(52,211,153,0.8)]
                "
              />
              Sensor Network Active
            </div>
          </div>
        </div>

        <div
          className="
            mt-5
            grid
            grid-cols-3
            gap-3
          "
        >
          <StatStrip
            label="Temperature avg."
            value={`${formatValue(tempStats.avg)} °C`}
            sub={`Min ${formatValue(tempStats.min)} / Max ${formatValue(tempStats.max)}`}
          />

          <StatStrip
            label="Humidity avg."
            value={`${formatValue(humidityStats.avg)} %`}
            sub={`Min ${formatValue(humidityStats.min)} / Max ${formatValue(humidityStats.max)}`}
          />

          <StatStrip
            label="Moisture avg."
            value={formatValue(moistureStats.avg)}
            sub={`Min ${formatValue(moistureStats.min)} / Max ${formatValue(moistureStats.max)}`}
          />
        </div>

        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-4
          "
        >
          <MiniAreaChart
            title="Temperature Trend"
            description="Ambient processing temperature"
            data={historyData}
            dataKey="temperature"
            lineColor="#FB7185"
            gradientId="pdf-temp-gradient"
            unit="°C"
            icon={Thermometer}
          />

          <MiniAreaChart
            title="Humidity Trend"
            description="Relative atmospheric humidity"
            data={historyData}
            dataKey="humidity"
            lineColor="#60A5FA"
            gradientId="pdf-humidity-gradient"
            unit="%"
            icon={Droplets}
          />
        </div>

        <div className="mt-4">
          <MiniAreaChart
            title="Moisture Response Trend"
            description="Coffee moisture sensor response across the monitored sequence"
            data={historyData}
            dataKey="moisture"
            lineColor="#22D3EE"
            gradientId="pdf-moisture-gradient"
            unit=""
            icon={Waves}
          />
        </div>

        <div
          className="
            mt-4

            rounded-[24px]

            border
            border-[#D7BB98]/50

            bg-white/82

            px-4
            py-3.5
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <div
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[2px]

                  text-[#B87529]
                "
              >
                Telemetry Interpretation
              </div>

              <div
                className="
                  mt-1
                  text-[11px]
                  font-bold

                  text-[#5C402E]
                "
              >
                Live sensor history is preserved as a visual production trace.
              </div>
            </div>

            <Activity className="h-5 w-5 text-[#D8A258]" />
          </div>
        </div>
      </PageShell>

      {/* =====================================================
          PAGE 3 - AI SIGNAL TREND
      ===================================================== */}
      <PageShell
        page={3}
        title="AI Signal and Decision Analytics"
        batchId={intelligence.batchId}
        generatedAt={generatedAt}
      >
        <div className="flex items-end justify-between">
          <div>
            <SectionEyebrow icon={Sparkles}>
              2026 Intelligent Analytics Layer
            </SectionEyebrow>

            <h2
              className="
                mt-2
                text-[36px]
                font-black
                tracking-[-1px]
                text-[#2B170D]
              "
            >
              AI Production Pulse
            </h2>

            <p
              className="
                mt-2
                max-w-[590px]
                text-[12px]
                font-semibold
                leading-5
                text-[#765A47]
              "
            >
              A high-visibility view of saved AI quality signals and recent
              production decisions across the current batch history.
            </p>
          </div>

          <div
            className="
              rounded-[20px]
              border
              border-[#D2AD72]/45
              bg-gradient-to-br
              from-[#FFF8EA]
              to-[#F3DDAF]
              px-5
              py-3.5
              shadow-[0_10px_24px_rgba(113,72,32,0.08)]
            "
          >
            <div
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[1.4px]
                text-[#9B682F]
              "
            >
              Decision consistency
            </div>

            <div
              className="
                mt-1
                text-[31px]
                font-black
                tracking-[-0.7px]
                text-[#2B170D]
              "
            >
              {Math.round(getDecisionConsistency(historyData))}%
            </div>
          </div>
        </div>

        <div className="mt-6">
          <AiIntelligenceTrendChart data={historyData} />
        </div>

        <div className="mt-6">
          <DecisionTimeline data={historyData} />
        </div>

        <div
          className="
            mt-6
            grid
            grid-cols-3
            gap-4
          "
        >
          <StatStrip
            label="Current quality"
            value={`${Math.round(intelligence.qualityScore)}%`}
            sub="AI quality score"
          />

          <StatStrip
            label="Model confidence"
            value={`${Math.round(intelligence.confidence)}%`}
            sub="Decision reliability"
          />

          <StatStrip
            label="Recovery outlook"
            value={`${Math.round(intelligence.recovery)}%`}
            sub="Current recovery potential"
          />
        </div>
      </PageShell>

      {/* =====================================================
          PAGE 4 - STABILITY + VARIATION
      ===================================================== */}
      <PageShell
        page={4}
        title="Production Stability Intelligence"
        batchId={intelligence.batchId}
        generatedAt={generatedAt}
      >
        <div>
          <SectionEyebrow icon={Gauge}>
            Derived Operational Visualization
          </SectionEyebrow>

          <h2
            className="
              mt-2
              text-[36px]
              font-black
              tracking-[-1px]
              text-[#2B170D]
            "
          >
            Stability & Variation Matrix
          </h2>

          <p
            className="
              mt-2
              max-w-[620px]
              text-[12px]
              font-semibold
              leading-5
              text-[#765A47]
            "
          >
            A modern report-only visualization of recent sensor spread, history
            continuity and decision consistency. These derived visuals do not
            replace the backend quality decision.
          </p>
        </div>

        <div
          className="
            mt-6
            grid
            grid-cols-2
            gap-5
          "
        >
          <StabilityRadar data={stabilityRadarData} />

          <VariationBarChart data={variationData} />
        </div>

        <div
          className="
            mt-6
            grid
            grid-cols-3
            gap-4
          "
        >
          <StatStrip
            label="Temperature stability"
            value={`${Math.round(getRelativeStability(tempStats))}%`}
            sub="Derived from recent spread"
          />

          <StatStrip
            label="Humidity stability"
            value={`${Math.round(getRelativeStability(humidityStats))}%`}
            sub="Derived from recent spread"
          />

          <StatStrip
            label="Moisture stability"
            value={`${Math.round(getRelativeStability(moistureStats))}%`}
            sub="Derived from recent spread"
          />
        </div>

        <div
          className="
            mt-6
            rounded-[28px]
            border
            border-[#D6B88F]/55
            bg-gradient-to-r
            from-white/95
            via-[#FFF7E9]/95
            to-[#F5DFC0]/90
            p-5
            shadow-[0_14px_34px_rgba(92,55,25,0.07)]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <SectionEyebrow icon={Activity}>
                Production Readability
              </SectionEyebrow>

              <h3
                className="
                  mt-2
                  text-[22px]
                  font-black
                  tracking-[-0.4px]
                  text-[#2B170D]
                "
              >
                Clear operational context at a glance
              </h3>

              <p
                className="
                  mt-2
                  max-w-[560px]
                  text-[11px]
                  font-semibold
                  leading-5
                  text-[#765A47]
                "
              >
                Higher stability bars indicate lower relative spread in the
                latest saved telemetry. Always use the AI decision, risk status
                and quality evidence for the final production action.
              </p>
            </div>

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-[20px]
                border
                border-[#D5A24F]/40
                bg-[#FFF1CF]
              "
            >
              <BarChart3 className="h-6 w-6 text-[#B87529]" />
            </div>
          </div>
        </div>
      </PageShell>

      {/* =====================================================
          PAGE 5 - VISION + DECISION SIGNALS
      ===================================================== */}
      <PageShell
        page={5}
        title="Vision and Decision Intelligence"
        batchId={intelligence.batchId}
        generatedAt={generatedAt}
      >
        <div>
          <SectionEyebrow icon={BarChart3}>
            Multi-Signal Intelligence
          </SectionEyebrow>

          <h2
            className="
              mt-2

              text-[35px]
              font-black
              tracking-[-1px]

              text-[#2A170B]
            "
          >
            Quality Signal Matrix
          </h2>

          <p
            className="
              mt-2

              max-w-[590px]

              text-[10px]
              font-medium
              leading-5

              text-[#755947]
            "
          >
            Computer vision color channels and historical AI outcomes are
            combined into a compact visual decision-support view.
          </p>
        </div>

        <div
          className="
            mt-5

            grid
            grid-cols-[1.2fr_0.8fr]
            gap-4
          "
        >
          <div
            className="
              rounded-[28px]

              border
              border-[#D7BB98]/55

              bg-gradient-to-br
              from-white
              via-[#FFF8EE]
              to-[#F6E4CB]

              p-5
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
              "
            >
              <div>
                <SectionEyebrow icon={Layers3}>
                  Coffee Vision Intelligence
                </SectionEyebrow>

                <h3
                  className="
                    mt-2

                    text-[19px]
                    font-black

                    text-[#2A170B]
                  "
                >
                  RGB Channel Profile
                </h3>
              </div>

              <div
                className="
                  rounded-full

                  border
                  border-[#D5A24F]/40

                  bg-[#D7A14A]/[0.06]

                  px-3
                  py-1.5

                  text-[8px]
                  font-black
                  uppercase
                  tracking-[1px]

                  text-[#A96820]
                "
              >
                Vision verified
              </div>
            </div>

            <div className="mt-7 space-y-6">
              <SignalBar label="Red" value={rgb.red} color="#FB7185" />

              <SignalBar label="Green" value={rgb.green} color="#34D399" />

              <SignalBar label="Blue" value={rgb.blue} color="#60A5FA" />
            </div>

            <div
              className="
                mt-7

                grid
                grid-cols-3
                gap-2.5
              "
            >
              <StatStrip label="Red" value={formatValue(rgb.red, 0)} />

              <StatStrip label="Green" value={formatValue(rgb.green, 0)} />

              <StatStrip label="Blue" value={formatValue(rgb.blue, 0)} />
            </div>
          </div>

          <div
            className="
              rounded-[28px]

              border
              border-[#D7BB98]/55

              bg-white/84

              p-5
            "
          >
            <SectionEyebrow icon={ShieldCheck}>
              Decision Distribution
            </SectionEyebrow>

            <h3
              className="
                mt-2

                text-[18px]
                font-black

                text-[#2A170B]
              "
            >
              Recent AI Outcomes
            </h3>

            <div className="mt-3 h-[215px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={decisionSummaryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={78}
                    paddingAngle={4}
                    isAnimationActive={false}
                  >
                    {decisionSummaryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: "#FFFDF9",
                      border: "1px solid rgba(190,139,81,0.30)",
                      borderRadius: 12,
                      color: "#2B170D",
                      fontSize: 10,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {decisionSummaryData.map((item) => (
                <div
                  key={item.name}
                  className="
                    flex
                    items-center
                    justify-between

                    text-[9px]
                    font-bold
                  "
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span className="text-[#73533D]">{item.name}</span>
                  </div>

                  <span className="text-[#4C3323]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="
            mt-5

            grid
            grid-cols-3
            gap-3
          "
        >
          <StatStrip
            label="Decision"
            value={intelligence.decision}
            sub={tone.label}
          />

          <StatStrip
            label="Risk level"
            value={intelligence.riskLevel}
            sub="Operational risk profile"
          />

          <StatStrip
            label="Release"
            value={intelligence.releaseStatus}
            sub="Current release state"
          />
        </div>

        <div
          className="
            mt-5

            grid
            grid-cols-[0.9fr_1.1fr]
            gap-4
          "
        >
          <div
            className="
              rounded-[26px]

              border
              border-[#D7BB98]/50

              bg-white/82

              p-5
            "
          >
            <SectionEyebrow icon={Database}>
              Latest Sensor Values
            </SectionEyebrow>

            <div className="mt-4 space-y-3">
              {[
                ["Moisture", formatValue(currentMoisture)],
                ["Temperature", `${formatValue(currentTemperature)} °C`],
                ["Humidity", `${formatValue(currentHumidity)} %`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="
                    flex
                    items-center
                    justify-between

                    rounded-xl

                    bg-[#F7E9D8]/85

                    px-3
                    py-2.5
                  "
                >
                  <span
                    className="
                      text-[9px]
                      font-bold

                      text-[#7D604A]
                    "
                  >
                    {label}
                  </span>

                  <span
                    className="
                      text-[12px]
                      font-black

                      text-[#3A2417]
                    "
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="
              rounded-[26px]

              border
              border-[#D5A24F]/40

              bg-gradient-to-br
              from-[#FFF7E7]
              via-[#FCEBD1]
              to-[#F4D8AE]

              p-5
            "
          >
            <SectionEyebrow icon={AlertTriangle}>
              Quality Evidence
            </SectionEyebrow>

            <div className="mt-4">
              <InsightList
                items={intelligence.evidence}
                icon={Activity}
                accent="text-[#F0B75B]"
              />
            </div>
          </div>
        </div>
      </PageShell>

      {/* =====================================================
          PAGE 6 - ACTION + RECOVERY
      ===================================================== */}
      <PageShell
        page={6}
        title="Action and Recovery Intelligence"
        batchId={intelligence.batchId}
        generatedAt={generatedAt}
      >
        <div
          className="
            grid
            grid-cols-[1.1fr_0.9fr]
            gap-5
          "
        >
          <div>
            <SectionEyebrow icon={Zap}>Decision Support Engine</SectionEyebrow>

            <h2
              className="
                mt-2

                text-[35px]
                font-black
                tracking-[-1px]

                text-[#2A170B]
              "
            >
              Recovery and Production Action
            </h2>

            <p
              className="
                mt-2

                text-[10px]
                font-medium
                leading-5

                text-[#765A47]
              "
            >
              Operational direction generated from the latest AI quality state
              and available batch intelligence.
            </p>
          </div>

          <div
            className="
              rounded-[25px]

              border

              p-4
            "
            style={{
              borderColor: tone.border,
              background: tone.soft,
            }}
          >
            <div
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[1.7px]

                text-[#7E604B]
              "
            >
              Release Decision
            </div>

            <div
              className="
                mt-2
                text-[25px]
                font-black
              "
              style={{
                color: tone.accent,
              }}
            >
              {intelligence.releaseStatus}
            </div>

            <div
              className="
                mt-2
                text-[9px]
                font-bold
                text-[#755946]
              "
            >
              Risk level: {intelligence.riskLevel}
            </div>
          </div>
        </div>

        <div
          className="
            mt-5

            rounded-[28px]

            border
            border-[#D5A24F]/45

            bg-gradient-to-br
            from-[#FFF3D3]
            via-[#F9D99A]
            to-[#EEB958]

            p-5
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <SectionEyebrow icon={Target}>Immediate Direction</SectionEyebrow>

              <h3
                className="
                  mt-2

                  text-[20px]
                  font-black

                  text-[#4A2A10]
                "
              >
                Next Production Action
              </h3>
            </div>

            <div
              className="
                flex
                h-12
                w-12

                items-center
                justify-center

                rounded-2xl

                border
                border-[#D6A249]/45

                bg-[#E4B34E]/10
              "
            >
              <Zap className="h-5 w-5 text-[#F0C461]" />
            </div>
          </div>

          <p
            className="
              mt-4

              max-w-[610px]

              text-[16px]
              font-black
              leading-[1.5]

              text-[#3A210E]
            "
          >
            {intelligence.recommendationText}
          </p>
        </div>

        <div
          className="
            mt-5

            grid
            grid-cols-[1.2fr_0.8fr]
            gap-4
          "
        >
          <div
            className="
              rounded-[28px]

              border
              border-[#D7BB98]/50

              bg-white/84

              p-5
            "
          >
            <SectionEyebrow icon={Layers3}>Corrective Workflow</SectionEyebrow>

            <h3
              className="
                mt-2

                text-[18px]
                font-black

                text-[#2A170B]
              "
            >
              Recommended Actions
            </h3>

            <div className="mt-4">
              <InsightList
                items={intelligence.correctiveActions}
                icon={CheckCircle2}
                accent="text-emerald-700"
              />
            </div>
          </div>

          <div
            className="
              rounded-[28px]

              border
              border-[#D7BB98]/50

              bg-white/84

              p-5
            "
          >
            <SectionEyebrow icon={TrendingUp}>
              Recovery Potential
            </SectionEyebrow>

            <div className="mt-4 flex justify-center">
              <svg viewBox="0 0 160 160" className="h-[155px] w-[155px]">
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="none"
                  stroke="rgba(129,89,53,0.10)"
                  strokeWidth="12"
                />

                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(intelligence.recovery / 100) * 389.56} ${389.56 - (intelligence.recovery / 100) * 389.56}`}
                  transform="rotate(-90 80 80)"
                />

                <text
                  x="80"
                  y="77"
                  textAnchor="middle"
                  fontSize="31"
                  fontWeight="900"
                  fill="#FFF0D8"
                >
                  {Math.round(intelligence.recovery)}%
                </text>

                <text
                  x="80"
                  y="99"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fill="#8F7765"
                >
                  RECOVERY
                </text>
              </svg>
            </div>

            <p
              className="
                mt-1
                text-center
                text-[9px]
                font-semibold
                leading-4

                text-[#7B5F4A]
              "
            >
              Estimated recovery potential based on the current AI decision
              payload.
            </p>
          </div>
        </div>

        <div
          className="
            mt-5

            grid
            grid-cols-[1fr_1fr]
            gap-4
          "
        >
          <div
            className="
              rounded-[27px]

              border
              border-[#D7BB98]/50

              bg-white/82

              p-5
            "
          >
            <SectionEyebrow icon={ShieldCheck}>
              Root Cause / Diagnosis
            </SectionEyebrow>

            <p
              className="
                mt-4

                text-[11px]
                font-semibold
                leading-[1.7]

                text-[#654834]
              "
            >
              {intelligence.rootCause}
            </p>
          </div>

          <div
            className="
              rounded-[27px]

              border
              border-[#D7BB98]/50

              bg-white/82

              p-5
            "
          >
            <SectionEyebrow icon={PackageCheck}>
              Future Prevention
            </SectionEyebrow>

            <div className="mt-4">
              <InsightList
                items={intelligence.prevention}
                icon={ShieldCheck}
                accent="text-[#E4B75E]"
              />
            </div>
          </div>
        </div>

        <div
          className="
            mt-5

            rounded-[24px]

            border
            border-[#D3B38E]/45

            bg-[#FFF9F1]/88

            px-5
            py-4
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <div
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[2px]

                  text-[#80624D]
                "
              >
                Report Integrity
              </div>

              <div
                className="
                  mt-1

                  text-[11px]
                  font-bold

                  text-[#644835]
                "
              >
                Generated from CoffeeSense live batch and AI decision data.
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-2

                rounded-full

                border
                border-emerald-300/55

                bg-emerald-50/90

                px-3
                py-2

                text-[8px]
                font-black
                uppercase
                tracking-[1px]

                text-emerald-700
              "
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Digital report ready
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}

export default PremiumCoffeeReport;
