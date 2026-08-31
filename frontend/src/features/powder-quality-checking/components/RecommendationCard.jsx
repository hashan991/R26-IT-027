import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import {
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  RefreshCcw,
  Droplets,
  Thermometer,
  Wind,
  Brain,
  ShieldCheck,
  Activity,
  Target,
  TrendingUp,
  ClipboardCheck,
  PackageCheck,
  Sparkles,
  Zap,
  Gauge,
  ArrowRight,
  CircleCheckBig,
  Coffee,
} from "lucide-react";

import apiClient from "../api/apiClient";

function RecommendationCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const cardRef = useRef(null);

  // ======================================================
  // FETCH REAL TIME AI DECISION
  // ======================================================

  const fetchRecommendation = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await apiClient.get(
        "/sensor/recommendation"
      );

      setData(response.data);
    } catch (error) {
      console.log(
        "AI Recommendation Error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ======================================================
  // AUTO REFRESH
  // ======================================================

  useEffect(() => {
    fetchRecommendation();

    const interval = setInterval(
      fetchRecommendation,
      60000
    );

    return () =>
      clearInterval(interval);
  }, [fetchRecommendation]);

  // ======================================================
  // MOUSE TRACKING FOR 3D EFFECT
  // ======================================================

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cardRef.current) {
        const rect =
          cardRef.current.getBoundingClientRect();

        const x =
          (e.clientX - rect.left) /
            rect.width -
          0.5;

        const y =
          (e.clientY - rect.top) /
            rect.height -
          0.5;

        setMousePosition({
          x,
          y,
        });
      }
    };

    const card = cardRef.current;

    if (card) {
      card.addEventListener(
        "mousemove",
        handleMouseMove
      );

      return () =>
        card.removeEventListener(
          "mousemove",
          handleMouseMove
        );
    }
  }, []);

  // ======================================================
  // LIVE BACKEND VALUES
  // ======================================================

  const decision =
    data?.decision ||
    data?.status ||
    "WARN";

  const riskLevel =
    data?.risk_level ||
    "MEDIUM";

  const releaseStatus =
    data?.release_status ||
    "REVIEW_REQUIRED";

  const qualityScore =
    data?.quality_score ?? "--";

  const confidence =
    data?.confidence ?? "--";

  const rootCauses =
    data?.root_cause || [];

  const actions =
    data?.recommended_actions || [];

  const nextAction =
    data?.next_action ||
    "Review production condition";

  // ======================================================
  // INDUSTRIAL DECISION MAPPING
  // ======================================================

  const getDecisionProfile = () => {
    if (decision === "PASS") {
      return {
        type: "PASS",

        title:
          "Production Ready – Packaging Approved",

        description:
          "Intelligent verification confirms that the batch satisfies current quality requirements.",

        risk: "LOW",

        status: "APPROVED",

        theme: "green",

        icon:
          <CheckCircle size={32} />,

        badge:
          "PACKAGING READY",

        summary:
          "CoffeeSense AI recommends immediate packaging release.",

        prevention: [
          "Maintain current production parameter consistency",
          "Continue preventive quality monitoring",
          "Validate every batch before packaging release",
        ],

        glow:
          "shadow-emerald-500/30",

        gradient:
          "from-emerald-400/20 via-emerald-500/5 to-transparent",
      };
    }

    if (decision === "HOLD") {
      return {
        type: "HOLD",

        title:
          "Corrective Action Required Before Release",

        description:
          "Critical quality deviation detected. Batch release is blocked until corrective validation.",

        risk: "HIGH",

        status: "BLOCKED",

        theme: "red",

        icon:
          <ShieldAlert size={32} />,

        badge:
          "RELEASE BLOCKED",

        summary:
          "CoffeeSense Quality Intelligence recommends corrective recovery before packaging.",

        prevention: [
          "Optimize drying duration for future batches",
          "Maintain humidity control during storage",
          "Trigger early warning when moisture increases",
        ],

        glow:
          "shadow-red-500/30",

        gradient:
          "from-red-400/20 via-red-500/5 to-transparent",
      };
    }

    return {
      type: "WARN",

      title:
        "Preventive Monitoring Required",

      description:
        "Quality variation detected. Additional verification is recommended before final release.",

      risk: "MEDIUM",

      status:
        "REVIEW REQUIRED",

      theme:
        "yellow",

      icon:
        <AlertTriangle size={32} />,

      badge:
        "QUALITY REVIEW",

      summary:
        "CoffeeSense Quality Intelligence recommends additional verification.",

      prevention: [
        "Increase monitoring frequency for next batches",
        "Review moisture and environmental trends",
        "Apply early corrective action before quality decline",
      ],

      glow:
        "shadow-amber-500/30",

      gradient:
        "from-amber-400/20 via-amber-500/5 to-transparent",
    };
  };

  const profile =
    getDecisionProfile();

  // ======================================================
  // THEME CONFIGURATION
  // UI ONLY
  // ======================================================

  const themes = {
    green: {
      card: `
        bg-gradient-to-br
        from-emerald-500/[0.12]
        via-[#162219]/95
        to-[#0C1710]/95

        border-emerald-400/25
      `,

      icon: `
        bg-gradient-to-br
        from-emerald-400/20
        to-emerald-500/10

        !text-emerald-200

        border
        border-emerald-400/30

        shadow-[0_12px_35px_rgba(16,185,129,0.14)]
      `,

      text:
        "!text-emerald-200",

      glow:
        "shadow-emerald-500/30",

      bar:
        "from-emerald-400 via-emerald-300 to-green-200",

      badge: `
        bg-emerald-400/15
        !text-emerald-200
        border-emerald-400/30
      `,

      ring:
        "ring-emerald-400/20",
    },

    red: {
      card: `
        bg-gradient-to-br
        from-red-500/[0.12]
        via-[#281717]/95
        to-[#180C0C]/95

        border-red-400/25
      `,

      icon: `
        bg-gradient-to-br
        from-red-400/20
        to-red-500/10

        !text-red-200

        border
        border-red-400/30

        shadow-[0_12px_35px_rgba(248,113,113,0.14)]
      `,

      text:
        "!text-red-200",

      glow:
        "shadow-red-500/30",

      bar:
        "from-red-400 via-red-300 to-orange-200",

      badge: `
        bg-red-400/15
        !text-red-200
        border-red-400/30
      `,

      ring:
        "ring-red-400/20",
    },

    yellow: {
      card: `
        bg-gradient-to-br
        from-amber-500/[0.13]
        via-[#271F12]/95
        to-[#181109]/95

        border-amber-400/25
      `,

      icon: `
        bg-gradient-to-br
        from-amber-400/20
        to-amber-500/10

        !text-amber-200

        border
        border-amber-400/30

        shadow-[0_12px_35px_rgba(251,191,36,0.14)]
      `,

      text:
        "!text-amber-200",

      glow:
        "shadow-amber-500/30",

      bar:
        "from-amber-400 via-yellow-300 to-orange-200",

      badge: `
        bg-amber-400/15
        !text-amber-200
        border-amber-400/30
      `,

      ring:
        "ring-amber-400/20",
    },
  };

  const theme =
    themes[profile.theme];

  // ======================================================
  // RECOVERY / IMPACT CALCULATION
  // ======================================================

  const recoveryScore =
    data?.recommendation
      ?.recovery_probability ??
    (decision === "PASS"
      ? 100
      : decision === "HOLD"
        ? 70
        : 85);

  const recoveryStatus =
    data?.recommendation
      ?.recovery_possible === true
      ? "RECOVERY POSSIBLE"
      : data?.recommendation
            ?.recovery_possible === false
        ? "RECOVERY NOT POSSIBLE"
        : "--";

  const preventionStrategies =
    data?.recommendation
      ?.future_prevention?.length
      ? data.recommendation
          .future_prevention
      : profile.prevention;

  const displayedCauses =
    rootCauses.length
      ? rootCauses
      : [
          "No abnormal production factors detected",
        ];

  const displayedActions =
    actions.length
      ? actions
      : [
          "Continue monitoring production condition",
        ];

  // ======================================================
  // LOADING STATE
  // ======================================================

  if (loading) {
    return (
      <div
        className="
          mt-10
          relative
          overflow-hidden

          rounded-[40px]

          border
          border-[#A87552]/15

          bg-gradient-to-br
          from-[#24140D]
          via-[#1A0F0A]
          to-[#100906]

          p-8

          shadow-[0_35px_100px_rgba(59,32,18,0.25)]
        "
      >
        <div
          className="
            absolute
            -left-24
            -top-28

            w-[400px]
            h-[400px]

            rounded-full

            bg-[#D58A50]/10

            blur-[150px]

            pointer-events-none
          "
        />

        <div
          className="
            relative
            z-10

            flex
            items-center

            gap-5
          "
        >
          <div
            className="
              relative

              w-16
              h-16

              rounded-[20px]

              border
              border-[#D89A64]/20

              bg-gradient-to-br
              from-[#D89A64]/20
              to-[#D89A64]/5

              flex
              items-center
              justify-center
            "
          >
            <Brain
              size={28}
              className="
                text-[#E8A66F]

                animate-pulse
              "
            />
          </div>

          <div>
            <h3
              className="
                !text-[#FFF4DE]

                text-xl

                font-bold

                tracking-tight
              "
            >
              Loading Intelligent
            </h3>

            <p
              className="
                mt-1

                text-sm

                text-[#B89B82]
              "
            >
              Preparing production decision support
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================

  const transformStyle = {
    transform: `
      perspective(1200px)
      rotateX(${mousePosition.y * -8}deg)
      rotateY(${mousePosition.x * 8}deg)
    `,

    transition:
      "transform 0.1s ease-out",
  };

  return (
    <div
      ref={cardRef}
      style={transformStyle}
      className="
        mt-10

        group
        relative

        overflow-hidden

        rounded-[42px]

        border
        border-[#8B5A3C]/15

        bg-gradient-to-br
        from-[#27150D]
        via-[#1D100B]
        to-[#110906]

        p-5
        sm:p-6
        lg:p-8

        shadow-[0_40px_120px_rgba(59,32,18,0.26)]

        backdrop-blur-sm

        transition-all
        duration-700

        hover:shadow-[0_50px_140px_rgba(59,32,18,0.32)]
      "
    >

      {/* ======================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0

          overflow-hidden

          rounded-[42px]
        "
      >
        <div
          className="
            absolute
            -left-32
            -top-32

            w-[600px]
            h-[600px]

            rounded-full

            bg-[#D58A50]/8

            blur-[180px]
          "
        />

        <div
          className="
            absolute
            -right-40
            -top-[10%]

            w-[600px]
            h-[600px]

            rounded-full

            bg-[#B56E42]/6

            blur-[190px]
          "
        />

        <div
          className="
            absolute
            -bottom-40
            left-[20%]

            w-[600px]
            h-[600px]

            rounded-full

            bg-[#E0A16C]/5

            blur-[200px]
          "
        />
      </div>

      {/* mouse glow */}

      <div
        className="
          pointer-events-none

          absolute

          w-72
          h-72

          rounded-full

          bg-[#D58A50]/6

          blur-[110px]

          transition-all
          duration-500
        "
        style={{
          left: `calc(50% + ${mousePosition.x * 100}px)`,
          top: `calc(50% + ${mousePosition.y * 100}px)`,

          transform:
            "translate(-50%, -50%)",
        }}
      />

      <div
        className="
          relative
          z-10
        "
      >

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            mb-8

            flex
            flex-col

            gap-5

            lg:flex-row
            lg:items-center
            lg:justify-between
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
              className="
                relative
              "
            >
              <div
                className={`
                  w-[64px]
                  h-[64px]

                  shrink-0

                  rounded-[22px]

                  flex
                  items-center
                  justify-center

                  shadow-[0_15px_40px_rgba(0,0,0,0.2)]

                  transition-all
                  duration-500

                  group-hover:scale-105

                  ${theme.icon}
                `}
              >
                {profile.icon}
              </div>
            </div>

            <div>

              <div
                className="
                  flex
                  items-center

                  flex-wrap

                  gap-3

                  mb-2
                "
              >

                <span
                  className="
                    text-[10px]

                    font-extrabold

                    uppercase

                    tracking-[0.25em]

                    text-[#DFA46E]
                  "
                >
                  Decision Support Engine
                </span>

                <span
                  className="
                    w-2
                    h-2

                    rounded-full

                    bg-emerald-400

                    shadow-[0_0_15px_rgba(52,211,153,0.85)]

                    animate-pulse
                  "
                />

                <span
                  className="
                    rounded-full

                    border
                    border-[#8B5A3C]/15

                    bg-[#2A1A12]/50

                    px-2
                    py-0.5

                    text-[10px]

                    font-mono

                    tracking-wider

                    text-[#92725D]
                  "
                >
                  v4.2
                </span>

              </div>

              {/* FIXED BLACK TITLE */}

              <h2
                className="
                  flex
                  items-center

                  flex-wrap

                  gap-3

                  text-[27px]
                  sm:text-[31px]

                  font-black

                  tracking-[-0.04em]

                  !text-[#FFF1DC]

                  drop-shadow-[0_2px_10px_rgba(255,240,215,0.08)]
                "
              >
                Quality Recovery Intelligence
                <Sparkles
                  size={20}
                  className="
                    text-[#E3A36D]
                  "
                />
              </h2>

              <p
                className="
                  mt-2

                  flex
                  items-center

                  gap-2

                  text-[13px]

                  leading-6

                  !text-[#C9AD94]
                "
              >
                <Coffee
                  size={14}
                  className="
                    text-[#D58A50]
                  "
                />

                Industrial Coffee Quality Decision Support
              </p>

            </div>

          </div>

          {/* REFRESH */}

          <button
            onClick={fetchRecommendation}
            disabled={refreshing}
            className="
              group/btn

              relative

              flex
              items-center
              justify-center

              gap-2.5

              w-fit

              overflow-hidden

              rounded-2xl

              border
              border-[#B98968]/20

              bg-gradient-to-br
              from-[#3B2418]
              to-[#25140D]

              px-5
              py-3

              !text-[#F8E4CF]

              text-xs

              font-bold

              tracking-wide

              shadow-[0_15px_35px_rgba(35,18,10,0.20)]

              transition-all
              duration-300

              hover:border-[#D39A6A]/35
              hover:bg-[#43291B]

              hover:-translate-y-0.5

              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >

            <RefreshCcw
              size={16}
              className={`
                text-[#E1A16A]

                transition-all
                duration-500

                ${
                  refreshing
                    ? "animate-spin"
                    : "group-hover/btn:rotate-180"
                }
              `}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

        {/* ======================================================
            PRODUCTION STATUS HERO
        ====================================================== */}

        <div
          className={`
            relative

            overflow-hidden

            rounded-[34px]

            border

            p-6
            sm:p-8

            mb-7

            shadow-[0_28px_70px_rgba(29,15,9,0.26)]

            transition-all
            duration-500

            ${theme.card}
          `}
        >

          {/* decorative glows */}

          <div
            className="
              pointer-events-none

              absolute

              -right-20
              -top-24

              w-80
              h-80

              rounded-full

              bg-white/[0.035]

              blur-[80px]
            "
          />

          <div
            className="
              relative
              z-10

              flex
              flex-col

              gap-7

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div
              className="
                min-w-0
              "
            >

              <div
                className="
                  inline-flex

                  items-center

                  gap-2.5

                  mb-5

                  rounded-full

                  border
                  border-[#C58C62]/15

                  bg-[#140C08]/35

                  px-4
                  py-2

                  text-[10px]

                  font-bold

                  uppercase

                  tracking-[0.18em]

                  !text-[#C7AA91]
                "
              >
                <Activity
                  size={14}
                  className="
                    text-[#E5A469]
                  "
                />

                Production Decision Status
              </div>

              {/* ==================================================
                  FIXED PACKAGING READY BLACK COLOR
              ================================================== */}

              <div
                className="
                  flex
                  items-center

                  flex-wrap

                  gap-4
                "
              >

                <h1
                  className={`
                    text-[38px]
                    sm:text-[48px]
                    lg:text-[56px]

                    font-black

                    tracking-[-0.05em]

                    leading-none

                    drop-shadow-[0_3px_20px_rgba(0,0,0,0.18)]

                    ${theme.text}
                  `}
                >
                  {profile.badge}
                </h1>

                <span
                  className={`
                    inline-flex

                    items-center

                    rounded-full

                    border

                    px-3
                    py-1.5

                    text-[10px]

                    font-black

                    uppercase

                    tracking-[0.12em]

                    shadow-[0_8px_20px_rgba(0,0,0,0.12)]

                    ${theme.badge}
                  `}
                >
                  {decision}
                </span>

              </div>

              <p
                className="
                  mt-5

                  max-w-3xl

                  text-[15px]
                  sm:text-[16px]

                  leading-7

                  !text-[#E7D4BF]
                "
              >
                {profile.summary}
              </p>

            </div>

            <div
              className={`
                w-20
                h-20

                shrink-0

                rounded-[24px]

                flex
                items-center
                justify-center

                transition-all
                duration-500

                ${theme.icon}
              `}
            >
              <PackageCheck
                size={37}
              />
            </div>

          </div>

        </div>

        {/* ======================================================
            DECISION SUMMARY
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3

            gap-4

            mb-7
          "
        >

          {[
            {
              label:
                "Intelligent Decision",

              value:
                decision,

              icon:
                <Brain size={18} />,
            },

            {
              label:
                "Quality Score",

              value:
                `${qualityScore}%`,

              icon:
                <Gauge size={18} />,
            },

            {
              label:
                "Intelligent Confidence",

              value:
                `${confidence}%`,

              icon:
                <CircleCheckBig
                  size={18}
                />,
            },
          ].map(
            (
              item,
              idx
            ) => (

              <div
                key={idx}
                className="
                  group/item

                  relative

                  overflow-hidden

                  rounded-[26px]

                  border
                  border-[#A87552]/15

                  bg-gradient-to-br
                  from-[#39251A]/75
                  to-[#24140D]/85

                  p-5

                  shadow-[0_15px_35px_rgba(30,16,10,0.14)]

                  transition-all
                  duration-300

                  hover:border-[#D39A6A]/25
                  hover:-translate-y-1
                "
              >

                <div
                  className="
                    flex
                    items-center

                    gap-3

                    mb-2
                  "
                >

                  <div
                    className="
                      text-[#D29A6E]
                    "
                  >
                    {item.icon}
                  </div>

                  <p
                    className="
                      text-[10px]

                      font-bold

                      uppercase

                      tracking-[0.14em]

                      !text-[#B69A84]
                    "
                  >
                    {item.label}
                  </p>

                </div>

                <h3
                  className={`
                    text-[31px]

                    font-black

                    tracking-[-0.03em]

                    ${
                      idx === 0
                        ? theme.text
                        : "!text-[#FFF1DD]"
                    }
                  `}
                >
                  {item.value}
                </h3>

              </div>

            )
          )}

        </div>

        {/* ======================================================
            AI DIAGNOSIS
        ====================================================== */}

        <div
          className="
            rounded-[30px]

            border
            border-[#A87552]/15

            bg-gradient-to-br
            from-[#38251B]/65
            to-[#25150F]/75

            p-6
            sm:p-7

            mb-7

            backdrop-blur-xl
          "
        >

          <div
            className="
              flex
              items-center

              gap-3

              mb-5
            "
          >

            <div
              className="
                w-11
                h-11

                rounded-xl

                flex
                items-center
                justify-center

                border
                border-[#D39A6A]/20

                bg-[#D39A6A]/10

                text-[#E7A971]
              "
            >
              <Brain size={22} />
            </div>

            <div>

              <p
                className="
                  text-[10px]

                  font-bold

                  uppercase

                  tracking-[0.18em]

                  !text-[#AE9078]
                "
              >
                Decision Explanation
              </p>

              <h3
                className="
                  text-lg
                  font-bold

                  !text-[#FFF1DD]
                "
              >
                Quality Diagnosis
              </h3>

            </div>

          </div>

          <h2
            className="
              text-[22px]
              sm:text-[26px]

              font-bold

              tracking-[-0.02em]

              !text-[#F8E5CF]
            "
          >
            {profile.title}
          </h2>

          <p
            className="
              mt-3

              text-[14px]
              sm:text-[15px]

              leading-7

              !text-[#CCB49D]
            "
          >
            {profile.description}
          </p>

        </div>

        {/* ======================================================
            RISK INTELLIGENCE
        ====================================================== */}

        <div
          className="
            rounded-[30px]

            border
            border-[#A87552]/15

            bg-gradient-to-br
            from-[#38251B]/65
            to-[#25150F]/75

            p-6
            sm:p-7

            mb-7
          "
        >

          <div
            className="
              flex
              items-center

              gap-3

              mb-6
            "
          >

            <div
              className="
                w-11
                h-11

                rounded-xl

                flex
                items-center
                justify-center

                border
                border-[#D39A6A]/20

                bg-[#D39A6A]/10

                text-[#E7A971]
              "
            >
              <ShieldCheck size={22} />
            </div>

            <div>

              <p
                className="
                  text-[10px]

                  font-bold

                  uppercase

                  tracking-[0.18em]

                  !text-[#AE9078]
                "
              >
                Operational Safety
              </p>

              <h3
                className="
                  text-lg
                  font-bold

                  !text-[#FFF1DD]
                "
              >
                Risk Intelligence
              </h3>

            </div>

          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-3

              gap-4
            "
          >

            <div
              className="
                rounded-[22px]

                border
                border-[#A87552]/12

                bg-[#1D100B]/30

                p-4
              "
            >

              <p
                className="
                  text-[10px]

                  uppercase

                  tracking-[0.14em]

                  font-bold

                  !text-[#A58A75]
                "
              >
                Risk Level
              </p>

              <h3
                className={`
                  text-[21px]

                  font-black

                  mt-2

                  ${
                    riskLevel ===
                    "HIGH"
                      ? "!text-red-300"
                      : riskLevel ===
                          "MEDIUM"
                        ? "!text-amber-300"
                        : "!text-emerald-300"
                  }
                `}
              >
                {riskLevel}
              </h3>

            </div>

            <div
              className="
                rounded-[22px]

                border
                border-[#A87552]/12

                bg-[#1D100B]/30

                p-4
              "
            >

              <p
                className="
                  text-[10px]

                  uppercase

                  tracking-[0.14em]

                  font-bold

                  !text-[#A58A75]
                "
              >
                Release Status
              </p>

              <h3
                className="
                  mt-2

                  text-[19px]

                  font-black

                  !text-[#FFF0DD]
                "
              >
                {releaseStatus}
              </h3>

            </div>

            <div
              className="
                rounded-[22px]

                border
                border-[#A87552]/12

                bg-[#1D100B]/30

                p-4
              "
            >

              <p
                className="
                  text-[10px]

                  uppercase

                  tracking-[0.14em]

                  font-bold

                  !text-[#A58A75]
                "
              >
                Recovery Status
              </p>

              <h3
                className="
                  mt-2

                  text-[19px]

                  font-black

                  !text-[#FFF0DD]
                "
              >
                {recoveryStatus}
              </h3>

            </div>

          </div>

        </div>

        {/* ======================================================
            QUALITY EVIDENCE
        ====================================================== */}

        <div
          className="
            rounded-[30px]

            border
            border-[#A87552]/15

            bg-gradient-to-br
            from-[#38251B]/65
            to-[#25150F]/75

            p-6
            sm:p-7

            mb-7
          "
        >

          <div
            className="
              flex
              items-center

              gap-3

              mb-5
            "
          >

            <div
              className="
                w-11
                h-11

                rounded-xl

                flex
                items-center
                justify-center

                border
                border-[#D39A6A]/20

                bg-[#D39A6A]/10

                text-[#E7A971]
              "
            >
              <ClipboardCheck size={22} />
            </div>

            <div>

              <p
                className="
                  text-[10px]

                  font-bold

                  uppercase

                  tracking-[0.18em]

                  !text-[#AE9078]
                "
              >
                Evidence Analysis
              </p>

              <h3
                className="
                  text-lg
                  font-bold

                  !text-[#FFF1DD]
                "
              >
                Quality Evidence
              </h3>

            </div>

          </div>

          <div
            className="
              space-y-3
            "
          >

            {displayedCauses.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center

                    gap-3

                    rounded-[20px]

                    border
                    border-[#A87552]/10

                    bg-[#1B0F0A]/35

                    px-4
                    py-3.5
                  "
                >

                  <div
                    className="
                      w-8
                      h-8

                      shrink-0

                      rounded-xl

                      bg-[#D39A6A]/12

                      flex
                      items-center
                      justify-center

                      text-[#DEA16F]
                    "
                  >
                    <Activity size={16} />
                  </div>

                  <p
                    className="
                      text-[13px]
                      sm:text-[14px]

                      leading-6

                      !text-[#EAD8C5]
                    "
                  >
                    {item}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

        {/* ======================================================
            SENSOR CONDITIONS
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3

            gap-4

            mb-7
          "
        >

          <div
            className="
              rounded-[26px]

              border
              border-blue-400/15

              bg-gradient-to-br
              from-blue-500/10
              via-[#32231D]/80
              to-[#21140E]/90

              p-5
            "
          >

            <div
              className="
                w-11
                h-11

                rounded-xl

                bg-blue-400/10

                flex
                items-center
                justify-center
              "
            >
              <Droplets
                size={20}
                className="
                  text-blue-300
                "
              />
            </div>

            <p
              className="
                mt-4

                text-[11px]

                font-bold

                uppercase

                tracking-[0.12em]

                !text-[#B0A19A]
              "
            >
              Moisture Condition
            </p>

            <h2
              className="
                mt-2

                text-[29px]

                font-black

                !text-[#FFF1DD]
              "
            >
              {data?.moisture ??
                "--"}
            </h2>

          </div>

          <div
            className="
              rounded-[26px]

              border
              border-red-400/15

              bg-gradient-to-br
              from-red-500/10
              via-[#38231D]/80
              to-[#21140E]/90

              p-5
            "
          >

            <div
              className="
                w-11
                h-11

                rounded-xl

                bg-red-400/10

                flex
                items-center
                justify-center
              "
            >
              <Thermometer
                size={20}
                className="
                  text-red-300
                "
              />
            </div>

            <p
              className="
                mt-4

                text-[11px]

                font-bold

                uppercase

                tracking-[0.12em]

                !text-[#B0A19A]
              "
            >
              Temperature
            </p>

            <h2
              className="
                mt-2

                text-[29px]

                font-black

                !text-[#FFF1DD]
              "
            >
              {data?.temperature ??
                "--"}
              °C
            </h2>

          </div>

          <div
            className="
              rounded-[26px]

              border
              border-cyan-400/15

              bg-gradient-to-br
              from-cyan-500/10
              via-[#302820]/80
              to-[#21140E]/90

              p-5
            "
          >

            <div
              className="
                w-11
                h-11

                rounded-xl

                bg-cyan-400/10

                flex
                items-center
                justify-center
              "
            >
              <Wind
                size={20}
                className="
                  text-cyan-300
                "
              />
            </div>

            <p
              className="
                mt-4

                text-[11px]

                font-bold

                uppercase

                tracking-[0.12em]

                !text-[#B0A19A]
              "
            >
              Humidity
            </p>

            <h2
              className="
                mt-2

                text-[29px]

                font-black

                !text-[#FFF1DD]
              "
            >
              {data?.humidity ??
                "--"}%
            </h2>

          </div>

        </div>

        {/* ======================================================
            AI CONFIDENCE
        ====================================================== */}

        <div
          className="
            rounded-[30px]

            border
            border-[#A87552]/15

            bg-gradient-to-br
            from-[#38251B]/65
            to-[#25150F]/75

            p-6
            sm:p-7

            mb-7
          "
        >

          <div
            className="
              flex
              items-center
              justify-between

              gap-4

              mb-4
            "
          >

            <div>

              <p
                className="
                  text-[10px]

                  font-bold

                  uppercase

                  tracking-[0.18em]

                  !text-[#AE9078]
                "
              >
                Model Certainty
              </p>

              <h3
                className="
                  mt-1

                  text-lg

                  font-bold

                  !text-[#FFF1DD]
                "
              >
                Intelligent Confidence Level
              </h3>

            </div>

            <span
              className={`
                text-[26px]

                font-black

                ${theme.text}
              `}
            >
              {confidence}%
            </span>

          </div>

          <div
            className="
              h-3

              rounded-full

              bg-[#160C08]/80

              overflow-hidden
            "
          >
            <div
              className={`
                relative

                h-full

                rounded-full

                bg-gradient-to-r

                ${theme.bar}

                transition-all
                duration-1000
              `}
              style={{
                width: `${confidence}%`,
              }}
            >
              <div
                className="
                  absolute
                  inset-0

                  bg-gradient-to-r
                  from-transparent
                  via-white/25
                  to-transparent
                "
              />
            </div>
          </div>

        </div>

        {/* ======================================================
            RECOVERY WORKFLOW
        ====================================================== */}

        <div
          className="
            rounded-[30px]

            border
            border-[#A87552]/15

            bg-gradient-to-br
            from-[#38251B]/65
            to-[#25150F]/75

            p-6
            sm:p-7

            mb-7
          "
        >

          <div
            className="
              flex
              items-center

              gap-3

              mb-6
            "
          >

            <div
              className="
                w-11
                h-11

                rounded-xl

                flex
                items-center
                justify-center

                border
                border-[#D39A6A]/20

                bg-[#D39A6A]/10

                text-[#E7A971]
              "
            >
              <Target size={22} />
            </div>

            <div>

              <p
                className="
                  text-[10px]

                  font-bold

                  uppercase

                  tracking-[0.18em]

                  !text-[#AE9078]
                "
              >
                Corrective Workflow
              </p>

              <h3
                className="
                  text-lg
                  font-bold

                  !text-[#FFF1DD]
                "
              >
                Intelligent Recovery Workflow
              </h3>

            </div>

          </div>

          <div
            className="
              space-y-3
            "
          >

            {displayedActions.map(
              (
                action,
                index
              ) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center

                    gap-3

                    transition-all
                    duration-300

                    hover:translate-x-1
                  "
                  onMouseEnter={() =>
                    setHoveredAction(
                      index
                    )
                  }
                  onMouseLeave={() =>
                    setHoveredAction(
                      null
                    )
                  }
                >

                  <div
                    className={`
                      w-10
                      h-10

                      shrink-0

                      rounded-full

                      flex
                      items-center
                      justify-center

                      text-sm

                      font-black

                      ${theme.icon}

                      ${
                        hoveredAction ===
                        index
                          ? "scale-110"
                          : ""
                      }
                    `}
                  >
                    {index + 1}
                  </div>

                  <div
                    className="
                      flex-1

                      rounded-[20px]

                      border
                      border-[#A87552]/10

                      bg-[#1B0F0A]/35

                      px-4
                      py-3.5
                    "
                  >
                    <p
                      className="
                        text-[13px]
                        sm:text-[14px]

                        leading-6

                        !text-[#EAD8C5]
                      "
                    >
                      {action}
                    </p>
                  </div>

                  {hoveredAction ===
                    index && (
                    <ArrowRight
                      size={18}
                      className="
                        shrink-0

                        text-[#D99B69]
                      "
                    />
                  )}

                </div>

              )
            )}

          </div>

        </div>

        {/* ======================================================
            RECOVERY ASSESSMENT
        ====================================================== */}

        <div
          className="
            rounded-[30px]

            border
            border-[#A87552]/15

            bg-gradient-to-br
            from-[#38251B]/65
            to-[#25150F]/75

            p-6
            sm:p-7

            mb-7
          "
        >

          <div
            className="
              flex
              items-center
              justify-between

              gap-4

              mb-4
            "
          >

            <div>

              <p
                className="
                  text-[10px]

                  font-bold

                  uppercase

                  tracking-[0.18em]

                  !text-[#AE9078]
                "
              >
                Recovery Potential
              </p>

              <h3
                className="
                  mt-1

                  text-lg

                  font-bold

                  !text-[#FFF1DD]
                "
              >
                Recovery Assessment
              </h3>

            </div>

            <span
              className={`
                text-[26px]

                font-black

                ${theme.text}
              `}
            >
              {recoveryScore}%
            </span>

          </div>

          <div
            className="
              h-3

              rounded-full

              bg-[#160C08]/80

              overflow-hidden
            "
          >

            <div
              className={`
                h-full

                rounded-full

                bg-gradient-to-r

                ${
                  decision ===
                  "HOLD"
                    ? "from-red-400 to-orange-300"
                    : decision ===
                        "WARN"
                      ? "from-amber-400 to-yellow-300"
                      : "from-emerald-400 to-emerald-300"
                }

                transition-all
                duration-1000
              `}
              style={{
                width:
                  `${recoveryScore}%`,
              }}
            />

          </div>

          <p
            className="
              mt-4

              text-[12px]
              sm:text-[13px]

              leading-6

              !text-[#B39882]
            "
          >
            Recovery assessment estimated the possibility based on current batch condition and corrective action availability.
          </p>

        </div>

        {/* ======================================================
            NEXT PRODUCTION ACTION
        ====================================================== */}

        <div
          className="
            relative

            overflow-hidden

            rounded-[30px]

            border
            border-purple-400/20

            bg-gradient-to-br
            from-purple-500/[0.10]
            via-[#34202D]
            to-[#25141E]

            p-6
            sm:p-7

            mb-7

            shadow-[0_25px_60px_rgba(45,25,45,0.14)]
          "
        >

          <div
            className="
              absolute

              -right-20
              -top-20

              w-64
              h-64

              rounded-full

              bg-purple-400/[0.06]

              blur-3xl
            "
          />

          <div
            className="
              relative
              z-10
            "
          >

            <div
              className="
                flex
                items-center

                gap-3

                mb-4
              "
            >

              <div
                className="
                  w-11
                  h-11

                  rounded-xl

                  flex
                  items-center
                  justify-center

                  border
                  border-purple-300/20

                  bg-purple-400/12

                  text-purple-200
                "
              >
                <Zap size={22} />
              </div>

              <div>

                <p
                  className="
                    text-[10px]

                    uppercase

                    tracking-[0.18em]

                    font-bold

                    !text-purple-200/60
                  "
                >
                  Immediate Direction
                </p>

                <h3
                  className="
                    text-lg
                    font-bold

                    !text-[#FFF1DD]
                  "
                >
                  Next Production Action
                </h3>

              </div>

            </div>

            <p
              className="
                text-[20px]
                sm:text-[23px]

                font-semibold

                leading-8

                !text-[#F7EAF7]
              "
            >
              {nextAction}
            </p>

          </div>

        </div>

        {/* ======================================================
            FUTURE PREVENTION STRATEGY
        ====================================================== */}

        <div
          className="
            rounded-[30px]

            border
            border-[#C9954E]/25

            bg-gradient-to-br
            from-[#51341F]/70
            via-[#3C281B]/65
            to-[#281810]/75

            p-6
            sm:p-7
          "
        >

          <div
            className="
              flex
              items-center

              gap-3

              mb-5
            "
          >

            <div
              className="
                w-11
                h-11

                rounded-xl

                flex
                items-center
                justify-center

                border
                border-[#E0A15C]/20

                bg-[#E0A15C]/10

                text-[#F0B575]
              "
            >
              <TrendingUp size={22} />
            </div>

            <div>

              <p
                className="
                  text-[10px]

                  uppercase

                  tracking-[0.18em]

                  font-bold

                  !text-[#C99A72]
                "
              >
                Next-Batch Prevention
              </p>

              <h3
                className="
                  text-lg
                  font-bold

                  !text-[#FFF1DD]
                "
              >
                Future Prevention Strategy
              </h3>

            </div>

          </div>

          <div
            className="
              space-y-3
            "
          >

            {preventionStrategies.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center

                    gap-3

                    rounded-[20px]

                    border
                    border-[#B98A5A]/12

                    bg-[#1C100A]/35

                    px-4
                    py-3.5
                  "
                >

                  <div
                    className="
                      w-7
                      h-7

                      shrink-0

                      rounded-full

                      flex
                      items-center
                      justify-center

                      bg-emerald-400/15

                      !text-emerald-300

                      text-sm

                      font-black
                    "
                  >
                    ✓
                  </div>

                  <p
                    className="
                      text-[13px]
                      sm:text-[14px]

                      leading-6

                      !text-[#ECD8C2]
                    "
                  >
                    {item}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div
          className="
            mt-6

            pt-4

            border-t
            border-[#A87552]/10

            flex
            flex-col

            sm:flex-row
            sm:items-center
            sm:justify-between

            gap-3

            text-[10px]

            !text-[#876D59]
          "
        >

          <span
            className="
              flex
              items-center

              gap-2
            "
          >
            <Coffee
              size={12}
              className="
                text-[#C98A59]
              "
            />

            CoffeeSense Quality Intelligence • Real-time Decision Engine
          </span>

          <span
            className="
              flex
              items-center

              gap-2
            "
          >

            <span
              className="
                w-1.5
                h-1.5

                rounded-full

                bg-emerald-400

                shadow-[0_0_9px_rgba(52,211,153,0.7)]

                animate-pulse
              "
            />

            Live

            <span
              className="
                !text-[#705847]
              "
            >
              • All systems nominal
            </span>

          </span>

        </div>

      </div>
    </div>
  );
}

export default RecommendationCard;