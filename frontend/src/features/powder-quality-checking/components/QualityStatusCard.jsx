import { useEffect, useState, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Coffee,
  ShieldAlert,
  Zap,
  Sparkles,
  TrendingUp,
  Gauge,
  Shield,
  ArrowRight,
  Cpu,
  Brain,
  Database,
  Wifi,
  Signal,
  BarChart3,
  Hexagon,
  Orbit,
  LayoutGrid,
  RefreshCw,
  Globe,
  Compass,
  Star,
  Flame,
  AlertOctagon,
  BadgeCheck,
} from "lucide-react";

import apiClient from "../api/apiClient";

function QualityStatusCard() {
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [rotation, setRotation] = useState(0);

  const containerRef = useRef(null);
  const glowRef = useRef(null);

  const fetchLatestSensor = async () => {
    try {
      const response = await apiClient.get("/sensor/latest");

      setSensor(response.data);
      setError("");
    } catch (err) {
      console.log(err);
      setError("Unable to load AI production decision");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestSensor();

    const interval = setInterval(() => {
      fetchLatestSensor();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const rect =
        containerRef.current.getBoundingClientRect();

      const x =
        ((e.clientX - rect.left) / rect.width - 0.5) * 2;

      const y =
        ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      containerRef.current.style.transform =
        `perspective(1200px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;

      containerRef.current.style.transition =
        "transform 0.1s ease-out";

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate(${x * 30}px, ${y * 30}px)`;
      }
    };

    const handleMouseLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.transform =
          "perspective(1200px) rotateY(0deg) rotateX(0deg)";

        containerRef.current.style.transition =
          "transform 0.5s ease-out";
      }

      if (glowRef.current) {
        glowRef.current.style.transform =
          "translate(0, 0)";
      }
    };

    const element = containerRef.current;

    if (element) {
      element.addEventListener(
        "mousemove",
        handleMouseMove
      );

      element.addEventListener(
        "mouseleave",
        handleMouseLeave
      );

      return () => {
        element.removeEventListener(
          "mousemove",
          handleMouseMove
        );

        element.removeEventListener(
          "mouseleave",
          handleMouseLeave
        );
      };
    }
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        className="
          rounded-3xl
          p-8

          bg-gradient-to-br
          from-[#E8D4B8]
          via-[#DFC2A0]
          to-[#D0AA7C]

          border
          border-[#9A642D]/35

          text-[#4A2814]

          shadow-[0_20px_50px_rgba(76,43,18,0.18)]
        "
      >
        <div className="flex items-center gap-4">

          <div className="relative">

            <div
              className="
                w-12
                h-12
                rounded-full

                border-2
                border-[#8B572A]/30
                border-t-[#B97832]

                animate-spin
              "
            />

            <div
              className="
                absolute
                inset-0

                w-12
                h-12

                rounded-full

                border-2
                border-[#F6C85F]/20

                animate-pulse
              "
            />

          </div>

          <div>

            <span
              className="
                text-lg
                font-semibold
                text-[#4A2814]
              "
            >
              ☕ Loading CoffeeSense AI Decision...
            </span>

            <div className="flex gap-1 mt-2">

              <div
                className="
                  w-2
                  h-2
                  rounded-full
                  bg-[#B97832]/50
                  animate-bounce
                "
                style={{
                  animationDelay: "0ms"
                }}
              />

              <div
                className="
                  w-2
                  h-2
                  rounded-full
                  bg-[#B97832]/50
                  animate-bounce
                "
                style={{
                  animationDelay: "150ms"
                }}
              />

              <div
                className="
                  w-2
                  h-2
                  rounded-full
                  bg-[#B97832]/50
                  animate-bounce
                "
                style={{
                  animationDelay: "300ms"
                }}
              />

            </div>

          </div>

        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div
        className="
          rounded-3xl
          p-8

          bg-[#F1D8D0]

          border
          border-red-500/40

          text-red-800

          animate-shake

          shadow-[0_20px_50px_rgba(100,30,20,0.15)]
        "
      >
        <div className="flex items-center gap-3">

          <div className="relative">

            <AlertTriangle
              className="
                w-6
                h-6
                animate-pulse
              "
            />

            <div
              className="
                absolute
                inset-0
                w-6
                h-6
                rounded-full
                bg-red-500/20
                animate-ping
              "
            />

          </div>

          <span className="font-semibold">
            {error}
          </span>

        </div>
      </div>
    );
  }

  const ai = sensor?.ai_decision;

  if (!ai) return null;

  const decision =
    ai.decision?.toUpperCase();

  // ============================================================
  // DYNAMIC STATUS THEME
  // PASS = GREEN
  // WARN = YELLOW
  // HOLD = RED
  // ============================================================

  const getTheme = () => {

    // ==========================================================
    // PASS
    // ==========================================================

    if (decision === "PASS") {
      return {

        primary:
          "!text-emerald-400",

        primaryDark:
          "!text-emerald-500",

        primaryBg:
          "bg-emerald-500/10",

        border:
          "border-emerald-400/45",

        borderLight:
          "border-emerald-400/20",

        glow:
          "shadow-[0_0_60px_rgba(52,211,153,0.35)]",

        glowBg:
          "from-emerald-500/25 via-emerald-700/15 to-transparent",

        glowLight:
          "bg-emerald-500/25",

        dot:
          "bg-emerald-400",

        dotGlow:
          "shadow-[0_0_20px_#34d399]",

        textGlow:
          "drop-shadow-[0_0_30px_rgba(52,211,153,0.65)]",

        mainIcon:
          <BadgeCheck
            className="
              w-14
              h-14
              !text-emerald-400
              animate-pulse-slow
            "
          />,

        decisionIcon:
          <CheckCircle
            className="
              w-8
              h-8
              !text-emerald-400
              animate-pulse
            "
          />,

        badgeIcon:
          <Star className="w-4 h-4" />,

        statusText:
          "✓ APPROVED",

        riskLevel:
          "LOW",

        riskColor:
          "!text-emerald-400",

        riskBg:
          "bg-emerald-500/15",

        panelBg:
          "from-emerald-950/90 via-[#28180E] to-[#130A06]",

        panelBorder:
          "border-emerald-400/45",

        ringColor:
          "border-emerald-400/25",

        message:
          "AI approved batch quality - ready for production release.",

        badge:
          "bg-emerald-500/15 border-emerald-400/45 !text-emerald-400",

        badgeHover:
          "group-hover:bg-emerald-500/25",
      };
    }

    // ==========================================================
    // WARN
    // ==========================================================

    if (decision === "WARN") {
      return {

        primary:
          "!text-yellow-400",

        primaryDark:
          "!text-yellow-500",

        primaryBg:
          "bg-yellow-500/10",

        border:
          "border-yellow-400/45",

        borderLight:
          "border-yellow-400/20",

        glow:
          "shadow-[0_0_60px_rgba(250,204,21,0.35)]",

        glowBg:
          "from-yellow-500/25 via-amber-700/15 to-transparent",

        glowLight:
          "bg-yellow-500/25",

        dot:
          "bg-yellow-400",

        dotGlow:
          "shadow-[0_0_20px_#facc15]",

        textGlow:
          "drop-shadow-[0_0_30px_rgba(250,204,21,0.65)]",

        mainIcon:
          <AlertTriangle
            className="
              w-14
              h-14
              !text-yellow-400
              animate-pulse-slow
            "
          />,

        decisionIcon:
          <AlertTriangle
            className="
              w-8
              h-8
              !text-yellow-400
              animate-pulse
            "
          />,

        badgeIcon:
          <AlertOctagon className="w-4 h-4" />,

        statusText:
          "⚠ REVIEW REQUIRED",

        riskLevel:
          "MODERATE",

        riskColor:
          "!text-yellow-400",

        riskBg:
          "bg-yellow-500/15",

        panelBg:
          "from-yellow-950/85 via-[#291A0C] to-[#130A06]",

        panelBorder:
          "border-yellow-400/45",

        ringColor:
          "border-yellow-400/25",

        message:
          "AI flagged quality concerns - review required before release.",

        badge:
          "bg-yellow-500/15 border-yellow-400/45 !text-yellow-400",

        badgeHover:
          "group-hover:bg-yellow-500/25",
      };
    }

    // ==========================================================
    // HOLD
    // ==========================================================

    return {

      primary:
        "!text-rose-400",

      primaryDark:
        "!text-rose-500",

      primaryBg:
        "bg-rose-500/10",

      border:
        "border-rose-400/50",

      borderLight:
        "border-rose-400/20",

      glow:
        "shadow-[0_0_60px_rgba(244,63,94,0.38)]",

      glowBg:
        "from-rose-600/30 via-red-900/20 to-transparent",

      glowLight:
        "bg-rose-500/25",

      dot:
        "bg-rose-400",

      dotGlow:
        "shadow-[0_0_20px_#f43f5e]",

      textGlow:
        "drop-shadow-[0_0_35px_rgba(244,63,94,0.75)]",

      mainIcon:
        <Flame
          className="
            w-14
            h-14
            !text-rose-400
            animate-pulse-slow
          "
        />,

      decisionIcon:
        <ShieldAlert
          className="
            w-8
            h-8
            !text-rose-400
            animate-pulse
          "
        />,

      badgeIcon:
        <AlertOctagon className="w-4 h-4" />,

      statusText:
        "⚠ CRITICAL",

      riskLevel:
        "CRITICAL",

      riskColor:
        "!text-rose-400",

      riskBg:
        "bg-rose-500/15",

      panelBg:
        "from-[#3A1115] via-[#28120E] to-[#130A06]",

      panelBorder:
        "border-rose-400/50",

      ringColor:
        "border-rose-400/30",

      message:
        "AI detected production risk and restricted batch release automatically.",

      badge:
        "bg-rose-500/15 border-rose-400/50 !text-rose-400",

      badgeHover:
        "group-hover:bg-rose-500/25",
    };
  };

  const theme = getTheme();

  // ============================================================
  // METRICS
  // ============================================================

  const metrics = [
    {
      id: "condition",
      title: "Condition Score",
      value: `${ai.condition_score ?? 0}%`,
      icon: (
        <Gauge className="w-8 h-8" />
      ),
      description:
        "Quality stability index",

      color:
        "from-[#8B572A]/20 to-[#D9A441]/10",

      progress:
        ai.condition_score ?? 0,

      gradient:
        "from-[#D9A441] to-[#F6C85F]",
    },

    {
      id: "confidence",
      title: "AI Confidence",
      value: `${ai.confidence ?? 0}%`,

      icon: (
        <Brain className="w-8 h-8" />
      ),

      description:
        "Prediction reliability",

      color:
        "from-[#6B4325]/20 to-[#C18A43]/10",

      progress:
        ai.confidence ?? 0,

      gradient:
        "from-[#C18A43] to-[#F6C85F]",
    },

    {
      id: "recovery",
      title: "Recovery Probability",

      value:
        ai.recovery_probability !== undefined
          ? `${ai.recovery_probability}%`
          : "70%",

      icon: (
        <TrendingUp className="w-8 h-8" />
      ),

      description:
        "Batch recovery potential",

      color:
        "from-[#7B4B25]/20 to-[#D9A441]/10",

      progress:
        ai.recovery_probability ?? 70,

      gradient:
        "from-[#B97832] to-[#F6C85F]",
    },
  ];

  // ============================================================
  // MAIN UI
  // ============================================================

  return (

    <div
      ref={containerRef}

      className="
        relative
        overflow-hidden

        rounded-[42px]

        p-8

        bg-gradient-to-br
        from-[#3A2417]
        via-[#2B180E]
        to-[#170B06]

        border
        border-[#A66A2C]/45

        shadow-[0_40px_100px_rgba(65,34,12,0.35)]

        transition-all
        duration-300

        hover:shadow-[0_60px_120px_rgba(65,34,12,0.48)]
      "

      style={{
        transformStyle:
          "preserve-3d"
      }}
    >

      {/* ======================================================
          ROTATING COFFEE GLOW
          ====================================================== */}

      <div
        className="
          absolute
          inset-0
          opacity-20
          pointer-events-none
        "

        style={{
          background:
            `conic-gradient(
              from ${rotation}deg at 50% 50%,
              rgba(246,200,95,0.12) 0%,
              rgba(139,69,19,0.04) 25%,
              rgba(246,200,95,0.10) 50%,
              rgba(139,69,19,0.04) 75%,
              rgba(246,200,95,0.12) 100%
            )`,

          transition:
            "background 0.1s linear",
        }}
      />


      {/* ======================================================
          PARTICLES
          ====================================================== */}

      <div
        className="
          absolute
          inset-0
          overflow-hidden
          pointer-events-none
        "
      >

        {[...Array(20)].map(
          (_, i) => (

            <div
              key={i}

              className="
                absolute
                rounded-full
                bg-[#F6C85F]/8
              "

              style={{
                width:
                  Math.random() * 4 +
                  2 +
                  "px",

                height:
                  Math.random() * 4 +
                  2 +
                  "px",

                left:
                  Math.random() *
                    100 +
                  "%",

                top:
                  Math.random() *
                    100 +
                  "%",

                animation:
                  `float-particle ${
                    Math.random() * 10 +
                    10
                  }s linear infinite`,

                animationDelay:
                  `${
                    Math.random() * 10
                  }s`,

                opacity:
                  Math.random() * 0.5 +
                  0.1,
              }}
            />

          )
        )}

      </div>


      {/* ======================================================
          MOUSE GLOW
          ====================================================== */}

      <div
        ref={glowRef}

        className="
          absolute
          pointer-events-none

          w-[500px]
          h-[500px]

          rounded-full

          bg-gradient-to-r
          from-[#F6C85F]/8
          to-[#B97832]/6

          blur-[120px]

          transition-all
          duration-300
        "

        style={{
          transform:
            "translate(0, 0)"
        }}
      />


      <div
        className="
          relative
          z-10
        "
      >

        {/* ====================================================
            HEADER
            ==================================================== */}

        <div
          className="
            flex
            justify-between
            items-start
            mb-8
          "
        >

          <div
            className="
              flex
              items-center
              gap-5
              group
            "
          >

            {/* COFFEE ICON */}

            <div className="relative">

              <div
                className="
                  absolute
                  inset-0

                  w-20
                  h-20

                  rounded-[28px]

                  bg-gradient-to-br
                  from-[#F6C85F]
                  to-[#8B4513]

                  blur-xl

                  opacity-45

                  group-hover:opacity-70

                  transition-opacity
                  duration-500
                "
              />

              <div
                className="
                  relative

                  w-20
                  h-20

                  rounded-[28px]

                  bg-gradient-to-br
                  from-[#F6C85F]
                  to-[#8B4513]

                  flex
                  items-center
                  justify-center

                  shadow-[0_0_40px_rgba(246,200,95,0.28)]

                  group-hover:shadow-[0_0_60px_rgba(246,200,95,0.40)]

                  transition-all
                  duration-500

                  animate-float
                "
              >

                <Coffee
                  size={42}
                  className="text-white"
                />

              </div>

            </div>


            {/* HEADER TEXT */}

            <div>

              <p
                className="
                  text-xs

                  tracking-[5px]

                  uppercase

                  font-black

                  !text-[#F6C85F]

                  flex
                  items-center
                  gap-2
                "
              >

                <Zap
                  className="
                    w-3
                    h-3

                    !text-[#F6C85F]

                    animate-pulse
                  "
                />

                AI PRODUCTION ENGINE

                <span
                  className="
                    relative
                    flex
                    h-2
                    w-2
                  "
                >

                  <span
                    className="
                      animate-ping

                      absolute
                      inline-flex

                      h-full
                      w-full

                      rounded-full

                      bg-[#F6C85F]

                      opacity-75
                    "
                  />

                  <span
                    className="
                      relative
                      inline-flex

                      rounded-full

                      h-2
                      w-2

                      bg-[#F6C85F]
                    "
                  />

                </span>

              </p>


              <h2
                className="
                  text-3xl

                  font-black

                  mt-2

                  tracking-tight

                  !text-[#FFF4DE]

                  drop-shadow-[0_2px_12px_rgba(255,244,222,0.18)]
                "
              >
                AI Production Intelligence
              </h2>


              <p
                className="
                  !text-[#D6B58B]

                  mt-2

                  text-lg

                  flex
                  items-center
                  gap-2
                "
              >

                <span
                  className="
                    w-2
                    h-2

                    rounded-full

                    bg-[#D9A441]/70

                    animate-pulse
                  "
                />

                Coffee batch decision engine

              </p>

            </div>

          </div>


          {/* ==================================================
              RISK BADGE
              ================================================== */}

          <div
            className={`
              px-7
              py-4

              rounded-full

              border

              ${theme.riskBg}
              ${theme.border}

              bg-[#160B06]/85

              font-black

              flex
              items-center
              gap-3

              backdrop-blur-sm

              hover:scale-105

              transition-transform
              duration-300

              shadow-[0_10px_30px_rgba(0,0,0,0.25)]
            `}
          >

            <span
              className="
                relative
                flex
                h-3
                w-3
              "
            >

              <span
                className={`
                  animate-ping

                  absolute
                  inline-flex

                  h-full
                  w-full

                  rounded-full

                  ${theme.dot}

                  opacity-75
                `}
              />

              <span
                className={`
                  relative
                  inline-flex

                  rounded-full

                  h-3
                  w-3

                  ${theme.dot}

                  ${theme.dotGlow}
                `}
              />

            </span>


            <span
              className={`
                text-sm
                font-black
                ${theme.riskColor}
              `}
            >
              {theme.riskLevel} RISK
            </span>

          </div>

        </div>


        {/* ====================================================
            AI DECISION PANEL
            ==================================================== */}

        <div
          className={`
            relative
            overflow-hidden

            rounded-[40px]

            p-10

            border

            bg-gradient-to-br

            ${theme.panelBg}

            ${theme.panelBorder}

            shadow-[0_25px_80px_rgba(40,18,7,0.55)]

            mb-8

            transition-all
            duration-500

            hover:shadow-[0_35px_100px_rgba(40,18,7,0.70)]

            group
          `}
        >

          {/* STATUS GLOW */}

          <div
            className={`
              absolute

              top-[-100px]
              right-[-80px]

              w-[320px]
              h-[320px]

              rounded-full

              ${theme.glowLight}

              blur-[100px]

              animate-pulse-slow
            `}
          />


          <div
            className={`
              absolute

              bottom-[-80px]
              left-[-60px]

              w-[250px]
              h-[250px]

              rounded-full

              bg-gradient-to-r

              ${theme.glowBg}

              blur-[100px]

              animate-pulse-slower
            `}
          />


          <div
            className={`
              absolute
              inset-0

              rounded-[40px]

              border-2

              ${theme.ringColor}

              opacity-0

              group-hover:opacity-100

              transition-opacity
              duration-500
            `}
          />


          <div className="relative z-10">


            {/* =================================================
                TOP LABEL
                ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-xs

                    tracking-[6px]

                    uppercase

                    font-black

                    !text-[#F6C85F]

                    flex
                    items-center
                    gap-2
                  "
                >

                  <Shield
                    className="
                      w-4
                      h-4

                      !text-[#F6C85F]
                    "
                  />

                  AI DECISION V3.0

                  <span
                    className="
                      !text-[#D9A441]/60
                      text-[8px]
                    "
                  >
                    PREMIUM
                  </span>

                </p>


                <p
                  className="
                    text-sm

                    !text-[#D6B58B]

                    mt-2

                    flex
                    items-center
                    gap-2
                  "
                >

                  <Signal
                    className="
                      w-3
                      h-3

                      !text-emerald-400

                      animate-pulse
                    "
                  />

                  Automated production quality judgement

                </p>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                {/* STATUS */}

                <div
                  className={`
                    px-6
                    py-3

                    rounded-full

                    ${theme.badge}

                    border

                    font-bold

                    text-sm

                    flex
                    items-center
                    gap-2

                    shadow-[0_8px_25px_rgba(0,0,0,0.25)]

                    ${theme.badgeHover}

                    transition-all
                    duration-300
                  `}
                >

                  {theme.badgeIcon}

                  <span
                    className="
                      font-black
                    "
                  >
                    {theme.statusText}
                  </span>

                </div>


                {/* AI ENGINE */}

                <div
                  className="
                    px-5
                    py-2

                    rounded-full

                    bg-[#130904]/90

                    border
                    border-[#B97832]/30

                    text-xs

                    tracking-widest

                    !text-[#FFE8B5]

                    font-bold

                    flex
                    items-center
                    gap-2

                    backdrop-blur-sm
                  "
                >

                  <Sparkles
                    className="
                      w-3
                      h-3

                      !text-[#F6C85F]

                      animate-spin-slow
                    "
                  />

                  AI ENGINE

                  <Cpu
                    className="
                      w-3
                      h-3

                      !text-[#D9A441]/60
                    "
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                MAIN DECISION CONTENT
                ================================================= */}

            <div
              className="
                mt-10

                flex
                justify-between
                items-center
              "
            >

              <div>

                <div className="relative">

                  <div
                    className={`
                      absolute
                      inset-0

                      bg-gradient-to-r

                      ${theme.glowBg}

                      rounded-2xl

                      blur-3xl

                      opacity-70
                    `}
                  />


                  <div
                    className="
                      relative

                      flex
                      items-center

                      gap-4
                    "
                  >

                    {/* STATUS ICON */}

                    <div
                      className="
                        flex
                        items-center
                        justify-center

                        w-12
                        h-12

                        rounded-2xl

                        bg-[#130904]/70

                        border
                        border-white/10
                      "
                    >
                      {theme.decisionIcon}
                    </div>


                    <div>

                      {/* DECISION LABEL */}

                      <p
                        className="
                          text-xs

                          uppercase

                          tracking-widest

                          !text-[#D8B58D]

                          font-black

                          flex
                          items-center
                          gap-2
                        "
                      >

                        AI DECISION STATUS

                        <span
                          className={`
                            text-[8px]

                            font-black

                            ${theme.primary}
                          `}
                        >
                          {decision === "PASS"
                            ? "✓ CLEAR"
                            : decision === "WARN"
                              ? "⚠ REVIEW"
                              : "⚠ URGENT"}
                        </span>

                      </p>


                      {/* DECISION */}

                      <div className="relative mt-1">

                        {/* DECISION GLOW */}

                        <div
                          className={`
                            absolute

                            inset-0

                            blur-3xl

                            opacity-45

                            text-[85px]

                            font-black

                            ${theme.primary}

                            animate-pulse-slow

                            flex
                            items-center

                            pointer-events-none
                          `}
                        >
                          {decision}
                        </div>


                        {/* ACTUAL DECISION */}

                        <h1
                          className={`
                            relative

                            !text-[85px]

                            !leading-none

                            font-black

                            tracking-[6px]

                            select-none

                            ${theme.primary}

                            ${theme.textGlow}

                            transition-all
                            duration-500

                            hover:scale-105

                            cursor-default
                          `}
                        >
                          {decision}
                        </h1>

                      </div>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    BATCH RELEASE STATUS
                    ================================================= */}

                <div
                  className="
                    mt-8

                    inline-flex

                    items-center
                    gap-4

                    px-7
                    py-4

                    rounded-2xl

                    bg-[#130904]/90

                    border
                    border-[#9C632D]/35

                    backdrop-blur-sm

                    hover:bg-[#1D0D06]

                    transition-all
                    duration-300

                    group
                  "
                >

                  <div className="relative">

                    <RefreshCw
                      className={`
                        w-5
                        h-5

                        ${theme.primary}

                        group-hover:rotate-180

                        transition-transform
                        duration-500
                      `}
                    />

                    <div
                      className={`
                        absolute
                        inset-0

                        w-5
                        h-5

                        rounded-full

                        ${theme.primaryBg}

                        animate-ping
                      `}
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs

                        uppercase

                        tracking-widest

                        !text-[#C9A57A]

                        flex
                        items-center
                        gap-2
                      "
                    >

                      BATCH RELEASE STATUS

                      <span
                        className="
                          !text-[#D9A441]/50
                          text-[8px]
                        "
                      >
                        LIVE
                      </span>

                    </p>


                    <p
                      className={`
                        text-2xl

                        font-black

                        mt-1

                        ${theme.primary}
                      `}
                    >
                      {ai.release_status}
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  DECISION ORBIT
                  ================================================= */}

              <div
                className="
                  relative

                  flex
                  items-center
                  justify-center

                  w-52
                  h-52
                "
              >

                <div
                  className={`
                    absolute

                    w-48
                    h-48

                    rounded-full

                    ${theme.glowLight}

                    blur-2xl

                    animate-ping-slow
                  `}
                />


                <div
                  className="
                    relative

                    flex
                    items-center
                    justify-center

                    w-full
                    h-full
                  "
                >

                  <div
                    className="
                      absolute
                      inset-0

                      flex
                      items-center
                      justify-center
                    "
                  >

                    <div
                      className={`
                        w-40
                        h-40

                        rounded-full

                        border-2

                        ${theme.ringColor}

                        animate-spin-slow
                      `}
                    />

                    <div
                      className={`
                        absolute

                        w-32
                        h-32

                        rounded-full

                        border-2

                        ${theme.ringColor}

                        animate-spin-slower
                      `}
                    />

                    <div
                      className={`
                        absolute

                        w-24
                        h-24

                        rounded-full

                        border-2

                        ${theme.ringColor}

                        animate-spin-slow
                      `}
                      style={{
                        animationDirection:
                          "reverse"
                      }}
                    />

                  </div>


                  <div
                    className="
                      relative
                      z-10
                    "
                  >

                    <div
                      className={`
                        w-28
                        h-28

                        rounded-full

                        bg-gradient-to-br

                        ${theme.glowBg}

                        flex
                        items-center
                        justify-center

                        border-2

                        ${theme.border}

                        shadow-[0_0_80px_rgba(0,0,0,0.4)]
                      `}
                    >

                      {theme.mainIcon}

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                FOOTER
                ================================================= */}

            <div
              className="
                mt-10
                pt-6

                border-t
                border-[#B97832]/25

                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <span
                  className={`
                    w-3
                    h-3

                    rounded-full

                    ${theme.dot}

                    animate-pulse

                    ${theme.dotGlow}
                  `}
                />


                <p
                  className="
                    !text-[#F2DEC8]

                    font-semibold

                    flex
                    items-center
                    gap-2
                  "
                >

                  <span>
                    {theme.message}
                  </span>

                  <ArrowRight
                    className={`
                      w-4
                      h-4

                      ${theme.primary}

                      animate-pulse
                    `}
                  />

                </p>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2

                    text-xs

                    !text-[#C7A77B]
                  "
                >

                  <Globe className="w-3 h-3" />

                  <span>
                    Global
                  </span>

                  <Compass
                    className="
                      w-3
                      h-3
                      ml-2
                    "
                  />

                  <span>
                    Active
                  </span>

                </div>


                <div
                  className="
                    flex
                    items-center
                    gap-2

                    text-xs

                    !text-[#C7A77B]
                  "
                >

                  <Database
                    className="w-3 h-3"
                  />

                  <span>
                    Real-time
                  </span>

                  <Wifi
                    className="
                      w-3
                      h-3

                      ml-2

                      !text-emerald-400

                      animate-pulse
                    "
                  />

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
            QUALITY METRICS
            ==================================================== */}

        <div
          className="
            grid

            grid-cols-1
            md:grid-cols-3

            gap-6
          "
        >

          {metrics.map(
            (metric, index) => (

              <MetricCard
                key={metric.id}

                {...metric}

                index={index}

                isHovered={
                  hoveredMetric ===
                  metric.id
                }

                onHover={() =>
                  setHoveredMetric(
                    metric.id
                  )
                }

                onLeave={() =>
                  setHoveredMetric(
                    null
                  )
                }
              />

            )
          )}

        </div>

      </div>


      {/* ========================================================
          ANIMATIONS
          ======================================================== */}

      <style jsx>{`

        @keyframes float {

          0%, 100% {
            transform:
              translateY(0px)
              rotate(0deg);
          }

          50% {
            transform:
              translateY(-10px)
              rotate(3deg);
          }

        }


        @keyframes float-particle {

          0% {
            transform:
              translateY(0)
              translateX(0);

            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          90% {
            opacity: 1;
          }

          100% {
            transform:
              translateY(-100vh)
              translateX(50px);

            opacity: 0;
          }

        }


        @keyframes pulse-slow {

          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.1);
          }

        }


        @keyframes pulse-slower {

          0%, 100% {
            opacity: 0.4;
          }

          50% {
            opacity: 0.8;
          }

        }


        @keyframes ping-slow {

          0% {
            transform: scale(1);
            opacity: 0.6;
          }

          100% {
            transform: scale(1.5);
            opacity: 0;
          }

        }


        @keyframes spin-slow {

          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }

        }


        @keyframes spin-slower {

          0% {
            transform: rotate(360deg);
          }

          100% {
            transform: rotate(0deg);
          }

        }


        @keyframes shake {

          0%, 100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-5px);
          }

          75% {
            transform: translateX(5px);
          }

        }


        .animate-float {
          animation:
            float 6s ease-in-out infinite;
        }


        .animate-pulse-slow {
          animation:
            pulse-slow 4s ease-in-out infinite;
        }


        .animate-pulse-slower {
          animation:
            pulse-slower 6s ease-in-out infinite;
        }


        .animate-ping-slow {
          animation:
            ping-slow 3s ease-in-out infinite;
        }


        .animate-spin-slow {
          animation:
            spin-slow 20s linear infinite;
        }


        .animate-spin-slower {
          animation:
            spin-slower 30s linear infinite;
        }


        .animate-shake {
          animation:
            shake 0.5s ease-in-out 3;
        }

      `}</style>

    </div>
  );
}


// ================================================================
// METRIC CARD
// ================================================================

function MetricCard({
  title,
  value,
  icon,
  description,
  color,
  progress,
  index,
  isHovered,
  onHover,
  onLeave,
  gradient,
}) {

  const [progressAnim, setProgressAnim] =
    useState(0);


  useEffect(() => {

    if (isHovered) {

      const timer =
        setTimeout(
          () =>
            setProgressAnim(
              progress
            ),
          100
        );

      return () =>
        clearTimeout(timer);

    } else {

      setProgressAnim(0);

    }

  }, [
    isHovered,
    progress
  ]);


  return (

    <div
      className={`
        group

        relative
        overflow-hidden

        rounded-[32px]

        p-7

        bg-gradient-to-br

        from-[#4A3020]
        via-[#382116]
        to-[#24130B]

        border

        border-[#8B5A2B]/45

        shadow-[0_20px_50px_rgba(52,27,10,0.38)]

        transition-all
        duration-500

        hover:-translate-y-3

        hover:border-[#D9A441]/60

        cursor-default

        ${
          isHovered
            ? "scale-[1.02]"
            : ""
        }
      `}

      onMouseEnter={onHover}
      onMouseLeave={onLeave}

      style={{
        transitionDelay:
          `${index * 50}ms`
      }}
    >

      {/* TOP GLOW */}

      <div
        className="
          absolute

          right-[-40px]
          top-[-40px]

          w-32
          h-32

          rounded-full

          bg-[#F6C85F]/8

          blur-3xl

          group-hover:bg-[#F6C85F]/18

          transition-all
          duration-500
        "
      />


      <div
        className={`
          absolute
          inset-0

          bg-gradient-to-br

          ${color}

          opacity-0

          group-hover:opacity-100

          transition-opacity
          duration-500
        `}
      />


      {/* PROGRESS */}

      <div
        className="
          absolute

          bottom-0
          left-0
          right-0

          h-1

          bg-[#FFF4DE]/5

          overflow-hidden
        "
      >

        <div
          className={`
            h-full

            transition-all
            duration-1000
            ease-out

            bg-gradient-to-r

            ${gradient}
          `}

          style={{
            width:
              `${progressAnim}%`
          }}
        >

          <div
            className="
              absolute
              inset-0

              bg-gradient-to-r

              from-transparent
              via-white/20
              to-transparent

              animate-shimmer
            "
          />

        </div>

      </div>


      <div className="relative z-10">


        {/* HEADER */}

        <div
          className="
            flex
            justify-between
            items-start

            mb-6
          "
        >

          <div
            className={`
              text-4xl

              !text-[#D9A441]

              transition-all
              duration-500

              ${
                isHovered
                  ? "scale-110 rotate-6"
                  : ""
              }
            `}
          >
            {icon}
          </div>


          <div
            className="
              px-3
              py-1

              rounded-full

              bg-[#160B06]/85

              border
              border-[#B97832]/30

              text-[10px]

              tracking-[3px]

              !text-[#D9A441]

              font-bold

              group-hover:bg-[#D9A441]/10

              transition-all
              duration-300

              flex
              items-center
              gap-1
            "
          >

            <Hexagon
              className="w-2 h-2"
            />

            AI

            <Orbit
              className="w-2 h-2"
            />

          </div>

        </div>


        {/* TITLE */}

        <p
          className="
            text-sm

            font-semibold

            !text-[#D4B083]

            group-hover:!text-[#F0C76B]

            transition-colors
            duration-300

            flex
            items-center
            gap-2
          "
        >

          <LayoutGrid
            className="w-3 h-3"
          />

          {title}

        </p>


        {/* VALUE */}

        <h3
          className={`
            text-5xl

            font-black

            mt-3

            !text-[#FFF4DE]

            tracking-tight

            drop-shadow-[0_0_18px_rgba(255,244,222,0.20)]

            transition-all
            duration-500

            ${
              isHovered
                ? "scale-105"
                : ""
            }
          `}
        >
          {value}
        </h3>


        {/* DESCRIPTION */}

        <p
          className="
            text-sm

            !text-[#BFA78A]

            mt-3

            group-hover:!text-[#D9A441]

            transition-colors
            duration-300

            flex
            items-center
            gap-2
          "
        >

          <BarChart3
            className="w-3 h-3"
          />

          {description}

        </p>

      </div>


      <style jsx>{`

        @keyframes shimmer {

          0% {
            transform:
              translateX(-100%);
          }

          100% {
            transform:
              translateX(100%);
          }

        }

        .animate-shimmer {
          animation:
            shimmer 2s infinite;
        }

      `}</style>

    </div>

  );
}


export default QualityStatusCard;