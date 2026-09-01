import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Thermometer,
  Droplets,
  Waves,
  Activity,
  Database,
  Clock3,
  Radio,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { motion } from "framer-motion";

import { useEffect, useState } from "react";

import apiClient from "../api/apiClient";

// =====================================================
// CUSTOM CHART TOOLTIP
// =====================================================

function SensorTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className="
        min-w-[150px]

        rounded-2xl

        border
        border-[#C99B76]/20

        bg-[#2D1D16]/95

        px-4
        py-3

        shadow-[0_18px_50px_rgba(54,29,17,0.35)]

        backdrop-blur-xl
      "
    >
      <p
        className="
          mb-2

          text-[11px]
          font-semibold

          uppercase
          tracking-[0.14em]

          text-[#C6A993]
        "
      >
        {label}
      </p>

      <div className="flex items-end gap-1">
        <span
          className="
            text-xl
            font-black
            tracking-tight

            text-[#FFF3DE]
          "
        >
          {payload[0]?.value}
        </span>

        <span
          className="
            pb-[2px]

            text-xs
            font-semibold

            text-[#D2B49A]
          "
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

// =====================================================
// INFORMATION CARD
// =====================================================

function InfoCard({
  icon: Icon,
  label,
  value,
  valueClassName = "text-[#FFF3DE]",
  delay = 0,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
      whileHover={{
        y: -4,
      }}
      className="
        group

        relative
        overflow-hidden

        rounded-[24px]

        border
        border-[#A87552]/20

        bg-gradient-to-br
        from-[#3A261C]/85
        via-[#302018]/80
        to-[#291A14]/85

        p-5

        backdrop-blur-xl

        shadow-[0_16px_40px_rgba(38,20,12,0.20)]

        transition-all
        duration-300

        hover:border-[#D39A6A]/30

        hover:from-[#432C20]/90
        hover:via-[#352219]/90
        hover:to-[#2D1C15]/90

        hover:shadow-[0_20px_55px_rgba(39,20,12,0.30)]
      "
    >
      {/* SUBTLE HOVER GLOW */}

      <div
        className="
          pointer-events-none

          absolute
          -right-10
          -top-10

          h-28
          w-28

          rounded-full

          bg-[#D18A50]/0

          blur-3xl

          transition-all
          duration-500

          group-hover:bg-[#D18A50]/15
        "
      />

      <div
        className="
          relative
          z-10

          flex
          items-start
          justify-between

          gap-4
        "
      >
        <div>
          <div
            className="
              mb-4

              flex
              items-center

              gap-2

              text-[12px]
              font-bold

              uppercase
              tracking-[0.16em]

              text-[#B19A88]
            "
          >
            <Icon size={17} strokeWidth={1.8} className="text-[#D8A06F]" />

            {label}
          </div>

          <p
            className={`
              text-[27px]

              font-black

              leading-none
              tracking-[-0.03em]

              ${valueClassName}
            `}
          >
            {value}
          </p>
        </div>

        <div
          className="
            flex

            h-10
            w-10

            shrink-0

            items-center
            justify-center

            rounded-2xl

            border
            border-[#B98968]/15

            bg-[#4A3023]/55
          "
        >
          <TrendingUp
            size={16}
            className="
              text-[#917866]

              transition-colors
              duration-300

              group-hover:text-[#DAA174]
            "
          />
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// CHART CARD
// =====================================================

function ChartCard({
  title,
  description,
  icon: Icon,
  data,
  dataKey,
  unit,
  gradientId,
  lineColor,
  iconColor,
  iconBackground,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 28,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.55,
        delay,
        ease: "easeOut",
      }}
      whileHover={{
        y: -6,
      }}
      className="
        group

        relative

        min-w-0

        overflow-hidden

        rounded-[30px]

        border
        border-[#A46F4D]/20

        bg-gradient-to-br
        from-[#3A271E]/90
        via-[#302018]/90
        to-[#281A14]/95

        p-5

        shadow-[0_20px_55px_rgba(45,24,15,0.22)]

        backdrop-blur-2xl

        transition-all
        duration-500

        hover:border-[#C98A5C]/30

        hover:shadow-[0_25px_65px_rgba(52,28,17,0.30)]

        sm:p-6
      "
    >
      {/* TOP GLOW */}

      <div
        className="
          pointer-events-none

          absolute

          -right-20
          -top-24

          h-52
          w-52

          rounded-full

          bg-[#E0A16C]/[0.07]

          blur-3xl
        "
      />

      {/* HEADER */}

      <div
        className="
          relative
          z-10

          mb-6

          flex
          items-start
          justify-between

          gap-4
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
              flex

              h-[52px]
              w-[52px]

              shrink-0

              items-center
              justify-center

              rounded-[18px]

              border
              border-[#B98968]/20

              ${iconBackground}
            `}
          >
            <Icon size={24} strokeWidth={2} className={iconColor} />
          </div>

          <div>
            <h3
              className="
                text-[17px]
                font-bold

                tracking-[-0.015em]

                text-[#FFF3DE]

                sm:text-[18px]
              "
            >
              {title}
            </h3>

            <p
              className="
                mt-1

                text-[11px]
                font-medium

                text-[#A58B78]
              "
            >
              {description}
            </p>
          </div>
        </div>

        {/* LIVE MINI BADGE */}

        <div
          className="
            hidden

            items-center

            gap-2

            rounded-full

            border
            border-[#A88770]/15

            bg-[#4B3024]/55

            px-3
            py-1.5

            text-[10px]
            font-bold

            uppercase
            tracking-[0.12em]

            text-[#B19A89]

            sm:flex
          "
        >
          <span
            className="
              h-1.5
              w-1.5

              rounded-full

              bg-emerald-400

              shadow-[0_0_10px_rgba(52,211,153,0.8)]
            "
          />
          Live
        </div>
      </div>

      {/* CHART */}

      <div
        className="
          relative

          h-[290px]

          w-full
        "
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 8,
              left: -15,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.32} />

                <stop offset="60%" stopColor={lineColor} stopOpacity={0.1} />

                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 7"
              vertical={false}
              stroke="rgba(235,190,155,0.10)"
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              minTickGap={50}
              tick={{
                fill: "#B69A84",
                fontSize: 11,
                fontWeight: 500,
              }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={52}
              tick={{
                fill: "#B69A84",
                fontSize: 11,
                fontWeight: 500,
              }}
            />

            <Tooltip
              cursor={{
                stroke: "rgba(231,180,139,0.20)",
                strokeDasharray: "4 4",
              }}
              content={<SensorTooltip unit={unit} />}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={lineColor}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 3,
                stroke: "#2D1D16",
                fill: lineColor,
              }}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// =====================================================
// SENSOR ANALYTICS
// =====================================================

function SensorAnalytics() {
  const [sensorData, setSensorData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [lastUpdate, setLastUpdate] = useState(null);

  // =====================================================
  // FETCH REAL-TIME SENSOR HISTORY
  // =====================================================

  const fetchSensorData = async () => {
    try {
      const response = await apiClient.get("/sensor/history");

      const records = response.data?.data || [];

      const formattedData = records

        .slice(-30)

        .map((item) => ({
          time: new Date(item.time).toLocaleTimeString([], {
            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit",
          }),

          temperature: Number(item.temperature) || 0,

          humidity: Number(item.humidity) || 0,

          moisture: Number(item.moisture) || 0,
        }));

      setSensorData(formattedData);

      setLastUpdate(new Date());

      setError("");
    } catch (err) {
      console.error("Sensor Analytics Error:", err);

      setError("Sensor analytics connection lost");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // AUTO LIVE UPDATE
  // =====================================================

  useEffect(() => {
    fetchSensorData();

    const interval = setInterval(() => {
      fetchSensorData();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="mt-10 w-full">
        <div
          className="
            flex

            min-h-[420px]

            w-full

            flex-col

            items-center
            justify-center

            rounded-[32px]

            border
            border-[#A87552]/20

            bg-gradient-to-br
            from-[#2F1E16]
            via-[#281911]
            to-[#20130E]

            text-center

            shadow-[0_25px_70px_rgba(54,29,17,0.24)]
          "
        >
          <div
            className="
              relative

              mb-5

              flex

              h-16
              w-16

              items-center
              justify-center

              rounded-full

              border
              border-[#D0925D]/25

              bg-[#D0925D]/15
            "
          >
            <Activity
              size={27}
              className="
                animate-pulse

                text-[#E3A46D]
              "
            />

            <span
              className="
                absolute
                inset-0

                animate-ping

                rounded-full

                border
                border-[#D0925D]/15
              "
            />
          </div>

          <h3
            className="
              text-lg
              font-bold

              text-[#FFF3DE]
            "
          >
            Loading Sensor Intelligence
          </h3>

          <p
            className="
              mt-2

              text-sm

              text-[#B09A88]
            "
          >
            Connecting to live sensor data...
          </p>
        </div>
      </section>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && sensorData.length === 0) {
    return (
      <section className="mt-10 w-full">
        <div
          className="
            flex

            min-h-[300px]

            items-center
            justify-center

            rounded-[30px]

            border
            border-red-500/15

            bg-gradient-to-br
            from-[#3C221B]
            to-[#2B1813]

            text-center
          "
        >
          <div>
            <Activity
              size={30}
              className="
                mx-auto
                mb-3

                text-red-400
              "
            />

            <p
              className="
                font-semibold

                text-red-300
              "
            >
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <section
      className="
        mt-10
        w-full
      "
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="
          relative

          overflow-hidden

          rounded-[36px]

          border
          border-[#8B5A3C]/20

          bg-gradient-to-br
          from-[#2B1A12]
          via-[#21140E]
          to-[#180E0A]

          p-4

          shadow-[0_35px_100px_rgba(59,32,18,0.28)]

          sm:p-6

          lg:p-8
        "
      >
        {/* =====================================================
            BACKGROUND DECORATION
        ===================================================== */}

        <div
          className="
            pointer-events-none

            absolute

            -left-32
            -top-32

            h-[420px]
            w-[420px]

            rounded-full

            bg-[#D58A50]/18

            blur-[120px]
          "
        />

        <div
          className="
            pointer-events-none

            absolute

            -bottom-44
            right-0

            h-[500px]
            w-[500px]

            rounded-full

            bg-[#B56E42]/14

            blur-[130px]
          "
        />

        <div
          className="
            pointer-events-none

            absolute

            left-[45%]
            top-[-180px]

            h-[350px]
            w-[350px]

            rounded-full

            bg-[#E0A16C]/10

            blur-[120px]
          "
        />

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            relative
            z-10

            mb-7

            flex
            flex-col

            gap-5

            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                mb-3

                flex
                items-center

                gap-2
              "
            >
              <div
                className="
                  flex

                  h-8
                  w-8

                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-[#D99861]/30

                  bg-[#D99861]/15
                "
              >
                <Sparkles size={15} className="text-[#F0B27B]" />
              </div>

              <span
                className="
                  text-[10px]

                  font-extrabold

                  uppercase
                  tracking-[0.22em]

                  text-[#D7A174]
                "
              >
                Live Sensor Intelligence
              </span>
            </div>

            <h2
              className="
                text-[26px]

                font-black

                tracking-[-0.035em]

                !text-[#FFE4A3]

                drop-shadow-[0_0_12px_rgba(255,196,86,0.38)]

                sm:text-[32px]
              "
            >
              Sensor Analytics
            </h2>

            <p
              className="
                mt-2

                max-w-2xl

                text-[13px]

                leading-6

                text-[#B49C89]
              "
            >
              Real-time environmental monitoring and intelligent analysis of
              coffee quality sensor data.
            </p>
          </div>

          {/* LIVE BADGE */}

          <div
            className="
              flex

              w-fit

              items-center

              gap-3

              rounded-full

              border
              border-emerald-400/25

              bg-emerald-400/[0.08]

              px-4
              py-2.5

              shadow-[0_0_30px_rgba(52,211,153,0.08)]
            "
          >
            <div className="relative">
              <span
                className="
                  block

                  h-2.5
                  w-2.5

                  rounded-full

                  bg-emerald-400

                  shadow-[0_0_12px_rgba(52,211,153,0.9)]
                "
              />

              <span
                className="
                  absolute
                  inset-0

                  animate-ping

                  rounded-full

                  bg-emerald-400

                  opacity-50
                "
              />
            </div>

            <Radio size={15} className="text-emerald-400" />

            <span
              className="
                text-[11px]

                font-extrabold

                uppercase
                tracking-[0.14em]

                text-emerald-400
              "
            >
              Live Stream
            </span>
          </div>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div
          className="
            relative
            z-10

            mb-7

            grid
            grid-cols-1

            gap-4

            md:grid-cols-3
          "
        >
          <InfoCard
            icon={Database}
            label="Samples"
            value={sensorData.length}
            delay={0.08}
          />

          <InfoCard
            icon={Clock3}
            label="Last Update"
            value={lastUpdate ? lastUpdate.toLocaleTimeString() : "--"}
            delay={0.14}
          />

          <InfoCard
            icon={Activity}
            label="Status"
            value="Monitoring"
            valueClassName="text-emerald-400"
            delay={0.2}
          />
        </div>

        {/* =====================================================
            SMALL SECTION HEADER
        ===================================================== */}

        <div
          className="
            relative
            z-10

            mb-5

            flex
            items-center
            justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]

                font-bold

                uppercase
                tracking-[0.18em]

                text-[#A88D78]
              "
            >
              Environmental Telemetry
            </p>

            <h3
              className="
                mt-1

                text-lg
                font-bold

                text-[#F7E4CE]
              "
            >
              Live Sensor Trends
            </h3>
          </div>

          <div
            className="
              hidden

              items-center

              gap-2

              text-xs

              text-[#A68C79]

              md:flex
            "
          >
            <Clock3 size={14} />
            Auto refresh every 60 sec
          </div>
        </div>

        {/* =====================================================
            CHARTS
        ===================================================== */}

        <div
          className="
            relative
            z-10

            grid
            grid-cols-1

            gap-5

            xl:grid-cols-3
          "
        >
          {/* TEMPERATURE */}

          <ChartCard
            title="Temperature Trend"
            description="Ambient processing temperature"
            icon={Thermometer}
            data={sensorData}
            dataKey="temperature"
            unit="°C"
            gradientId="temperatureGradient"
            lineColor="#F87171"
            iconColor="text-[#FF7575]"
            iconBackground="bg-red-500/10"
            delay={0.24}
          />

          {/* HUMIDITY */}

          <ChartCard
            title="Humidity Trend"
            description="Relative atmospheric humidity"
            icon={Droplets}
            data={sensorData}
            dataKey="humidity"
            unit="%"
            gradientId="humidityGradient"
            lineColor="#60A5FA"
            iconColor="text-[#60A5FA]"
            iconBackground="bg-blue-500/10"
            delay={0.31}
          />

          {/* MOISTURE */}

          <ChartCard
            title="Moisture Trend"
            description="Coffee moisture sensor response"
            icon={Waves}
            data={sensorData}
            dataKey="moisture"
            unit=""
            gradientId="moistureGradient"
            lineColor="#22D3EE"
            iconColor="text-[#22D3EE]"
            iconBackground="bg-cyan-500/10"
            delay={0.38}
          />
        </div>
      </motion.div>
    </section>
  );
}

export default SensorAnalytics;
