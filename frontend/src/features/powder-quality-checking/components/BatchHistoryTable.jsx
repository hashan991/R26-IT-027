import { motion } from "framer-motion";

import { useEffect, useState } from "react";

import {
  Activity,
  History,
  Sparkles,
  Database,
  Clock3,
  ShieldCheck,
  Gauge,
  Radio,
  AlertTriangle,
} from "lucide-react";

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

  const hasTimezone =
    timestamp.endsWith("Z") ||
    /[+-]\d{2}:\d{2}$/.test(timestamp);

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

const getMinuteKey = (
  timestamp,
  batchId
) => {

  if (!timestamp) {
    return null;
  }

  let normalizedTimestamp = timestamp;

  const hasTimezone =
    timestamp.endsWith("Z") ||
    /[+-]\d{2}:\d{2}$/.test(timestamp);

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


// =====================================================
// PRODUCTION HISTORY
// =====================================================

export default function BatchHistoryTable() {

  const [batches, setBatches] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const refreshContext =
    useRefresh();

  const refreshSignal =
    refreshContext?.refreshSignal || 0;


  // =====================================================
  // FETCH SAVED SENSOR / AI HISTORY
  // =====================================================

  const fetchBatchHistory = async () => {

    try {

      const response =
        await apiClient.get(
          "/sensor/history?limit=500"
        );

      const records =
        response.data?.data || [];


      // =====================================================
      // ONE SAVED RESULT PER MINUTE
      // =====================================================

      const minuteRecords =
        new Map();


      records.forEach((item) => {

        const minuteKey =
          getMinuteKey(
            item.time,
            item.batch_id
          );

        if (!minuteKey) {
          return;
        }

        minuteRecords.set(
          minuteKey,
          item
        );

      });


      // =====================================================
      // NEWEST MINUTE FIRST
      // =====================================================

      const latestRecords =
        Array.from(
          minuteRecords.values()
        )
          .reverse()
          .slice(0, 20);


      // =====================================================
      // FORMAT BACKEND DATA
      // =====================================================

      const formatted =
        latestRecords.map((item) => {

          const aiDecision =
            item.ai_decision || {};

          return {

            id:
              item.batch_id ??
              "LIVE-ARDUINO",

            time:
              formatBackendTime(
                item.time
              ),

            decision:
              aiDecision.decision ??
              aiDecision.status ??
              item.status ??
              "HOLD",

            release:
              aiDecision.release_status ??
              "REVIEW_REQUIRED",

            condition:
              Number(
                aiDecision.condition_score ??
                aiDecision.quality_score ??
                item.quality_score ??
                0
              ),

            confidence:
              Number(
                aiDecision.confidence ??
                0
              ),

            risk:
              aiDecision.risk_level ??
              item.risk_level ??
              "UNKNOWN",

            rootCause:
              aiDecision.root_cause ??
              aiDecision.root_causes ??
              [],

            actions:
              aiDecision.recommended_actions ??
              aiDecision.recovery_actions ??
              [],

          };

        });


      setBatches(formatted);

      setError("");

    }

    catch (err) {

      console.error(
        "Batch history error:",
        err
      );

      setError(
        "Unable to load production history"
      );

    }

    finally {

      setLoading(false);

    }

  };


  // =====================================================
  // HISTORY AUTO REFRESH
  // =====================================================

  useEffect(() => {

    fetchBatchHistory();


    const interval =
      setInterval(() => {

        fetchBatchHistory();

      }, 60000);


    return () => {

      clearInterval(interval);

    };

  }, [refreshSignal]);


  // =====================================================
  // DECISION STYLE
  // =====================================================

  const decisionStyle = (status) => {

    switch (status) {

      case "PASS":

        return `
          border
          border-emerald-400/20
          bg-emerald-400/10
          text-emerald-300
        `;


      case "WARN":

        return `
          border
          border-amber-400/20
          bg-amber-400/10
          text-amber-300
        `;


      case "HOLD":

        return `
          border
          border-red-400/20
          bg-red-400/10
          text-red-300
        `;


      default:

        return `
          border
          border-[#B69A84]/20
          bg-[#B69A84]/10
          text-[#BDA592]
        `;

    }

  };


  // =====================================================
  // RELEASE STYLE
  // =====================================================

  const releaseStyle = (status) => {

    switch (status) {

      case "APPROVED":

        return `
          border
          border-emerald-400/20
          bg-emerald-400/[0.08]
          text-emerald-300
        `;


      case "BLOCKED":

        return `
          border
          border-red-400/20
          bg-red-400/[0.08]
          text-red-300
        `;


      case "REVIEW_REQUIRED":

        return `
          border
          border-amber-400/20
          bg-amber-400/[0.08]
          text-amber-300
        `;


      default:

        return `
          border
          border-[#B69A84]/20
          bg-[#B69A84]/10
          text-[#BDA592]
        `;

    }

  };


  // =====================================================
  // RISK STYLE
  // =====================================================

  const riskStyle = (risk) => {

    switch (risk) {

      case "HIGH":

        return `
          border
          border-red-400/20
          bg-red-400/[0.08]
          text-red-300
        `;


      case "MEDIUM":

        return `
          border
          border-amber-400/20
          bg-amber-400/[0.08]
          text-amber-300
        `;


      case "LOW":

        return `
          border
          border-emerald-400/20
          bg-emerald-400/[0.08]
          text-emerald-300
        `;


      default:

        return `
          border
          border-[#9D8877]/20
          bg-[#9D8877]/10
          text-[#B39B88]
        `;

    }

  };


  // =====================================================
  // CONFIDENCE BAR COLOR
  // =====================================================

  const confidenceColor = (
    confidence
  ) => {

    if (confidence >= 90) {

      return `
        bg-gradient-to-r
        from-[#D3905D]
        via-[#E6AA74]
        to-[#F2C18F]
      `;

    }

    if (confidence >= 70) {

      return `
        bg-gradient-to-r
        from-amber-500
        to-yellow-300
      `;

    }

    return `
      bg-gradient-to-r
      from-red-500
      to-orange-400
    `;

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <section
      className="
        mt-10

        w-full
        max-w-full
        min-w-0
      "
    >

      <motion.div

        initial={{
          opacity: 0,
          y: 30,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}

        className="
          relative

          box-border

          w-full
          max-w-full
          min-w-0

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
            BACKGROUND GLOW
        ===================================================== */}

        <div
          className="
            pointer-events-none

            absolute

            -left-28
            -top-36

            h-[380px]
            w-[380px]

            rounded-full

            bg-[#D58A50]/15

            blur-[120px]
          "
        />


        <div
          className="
            pointer-events-none

            absolute

            -bottom-48
            right-[-100px]

            h-[430px]
            w-[430px]

            rounded-full

            bg-[#B56E42]/12

            blur-[130px]
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

          <div
            className="
              min-w-0
            "
          >

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

                  shrink-0

                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-[#D99861]/30

                  bg-[#D99861]/15
                "
              >

                <History
                  size={15}
                  className="
                    text-[#F0B27B]
                  "
                />

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
                Production Intelligence
              </span>

            </div>


            <div
              className="
                flex
                items-center

                gap-3
              "
            >

              <h2
                className="
                  text-[26px]

                  font-black

                  tracking-[-0.035em]

                  text-[#FFF3DE]

                  sm:text-[30px]
                "
              >
                AI Production History
              </h2>


              <Sparkles
                size={18}
                className="
                  hidden
                  shrink-0

                  text-[#DCA170]

                  sm:block
                "
              />

            </div>


            <p
              className="
                mt-2

                max-w-xl

                text-[13px]

                leading-6

                text-[#B49C89]
              "
            >
              Explainable coffee quality decisions,
              release status and production risk intelligence.
            </p>

          </div>


          {/* LIVE MONITORING */}

          <div
            className="
              flex

              w-fit
              shrink-0

              items-center

              gap-3

              rounded-full

              border
              border-emerald-400/20

              bg-emerald-400/[0.07]

              px-4
              py-2.5

              shadow-[0_0_30px_rgba(52,211,153,0.06)]
            "
          >

            <div
              className="
                relative
              "
            >

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


            <Radio
              size={15}
              className="
                shrink-0

                text-emerald-400
              "
            />


            <span
              className="
                whitespace-nowrap

                text-[11px]

                font-extrabold

                uppercase

                tracking-[0.14em]

                text-emerald-400
              "
            >
              Live Monitoring
            </span>

          </div>

        </div>


        {/* =====================================================
            INFORMATION CARDS
        ===================================================== */}

        <div
          className="
            relative
            z-10

            mb-6

            grid

            min-w-0

            grid-cols-1

            gap-3

            md:grid-cols-3
          "
        >

          {/* RECORDS */}

          <div
            className="
              flex

              min-w-0

              items-center

              gap-3

              rounded-2xl

              border
              border-[#A87552]/15

              bg-[#3A261C]/55

              px-4
              py-3

              backdrop-blur-xl
            "
          >

            <div
              className="
                flex

                h-10
                w-10

                shrink-0

                items-center
                justify-center

                rounded-xl

                bg-[#D69863]/10
              "
            >

              <Database
                size={17}
                className="
                  text-[#DBA06E]
                "
              />

            </div>


            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  text-[9px]

                  font-bold

                  uppercase

                  tracking-[0.16em]

                  text-[#917967]
                "
              >
                Records
              </p>


              <p
                className="
                  mt-0.5

                  truncate

                  text-sm

                  font-bold

                  text-[#F7E5D1]
                "
              >
                {batches.length} recent results
              </p>

            </div>

          </div>


          {/* REFRESH */}

          <div
            className="
              flex

              min-w-0

              items-center

              gap-3

              rounded-2xl

              border
              border-[#A87552]/15

              bg-[#3A261C]/55

              px-4
              py-3

              backdrop-blur-xl
            "
          >

            <div
              className="
                flex

                h-10
                w-10

                shrink-0

                items-center
                justify-center

                rounded-xl

                bg-[#D69863]/10
              "
            >

              <Clock3
                size={17}
                className="
                  text-[#DBA06E]
                "
              />

            </div>


            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  text-[9px]

                  font-bold

                  uppercase

                  tracking-[0.16em]

                  text-[#917967]
                "
              >
                Refresh
              </p>


              <p
                className="
                  mt-0.5

                  truncate

                  text-sm

                  font-bold

                  text-[#F7E5D1]
                "
              >
                Every 60 seconds
              </p>

            </div>

          </div>


          {/* AI ENGINE */}

          <div
            className="
              flex

              min-w-0

              items-center

              gap-3

              rounded-2xl

              border
              border-[#A87552]/15

              bg-[#3A261C]/55

              px-4
              py-3

              backdrop-blur-xl
            "
          >

            <div
              className="
                flex

                h-10
                w-10

                shrink-0

                items-center
                justify-center

                rounded-xl

                bg-emerald-400/[0.07]
              "
            >

              <ShieldCheck
                size={17}
                className="
                  text-emerald-400
                "
              />

            </div>


            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  text-[9px]

                  font-bold

                  uppercase

                  tracking-[0.16em]

                  text-[#917967]
                "
              >
                AI Engine
              </p>


              <p
                className="
                  mt-0.5

                  truncate

                  text-sm

                  font-bold

                  text-emerald-300
                "
              >
                Decision monitoring
              </p>

            </div>

          </div>

        </div>


        {/* =====================================================
            TABLE OUTER CONTAINER
        ===================================================== */}

        <div
          className="
            relative
            z-10

            box-border

            w-full
            max-w-full
            min-w-0

            overflow-hidden

            rounded-[26px]

            border
            border-[#A46F4D]/20

            bg-gradient-to-br
            from-[#3A271E]/85
            via-[#302018]/90
            to-[#281A14]/95

            shadow-[0_20px_55px_rgba(45,24,15,0.22)]

            backdrop-blur-2xl
          "
        >

          {/* =====================================================
              LOADING
          ===================================================== */}

          {loading && (

            <div
              className="
                flex

                min-h-[300px]

                flex-col

                items-center
                justify-center

                py-10
              "
            >

              <div
                className="
                  relative

                  mb-4

                  flex

                  h-14
                  w-14

                  items-center
                  justify-center

                  rounded-full

                  border
                  border-[#D0925D]/25

                  bg-[#D0925D]/10
                "
              >

                <Activity
                  size={23}
                  className="
                    animate-pulse

                    text-[#E6A56D]
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


              <p
                className="
                  text-sm

                  font-semibold

                  text-[#D2B7A0]
                "
              >
                Loading production intelligence...
              </p>

            </div>

          )}


          {/* =====================================================
              ERROR
          ===================================================== */}

          {!loading && error && (

            <div
              className="
                flex

                min-h-[250px]

                flex-col

                items-center
                justify-center

                py-10

                text-center
              "
            >

              <div
                className="
                  mb-4

                  flex

                  h-12
                  w-12

                  items-center
                  justify-center

                  rounded-2xl

                  border
                  border-red-400/15

                  bg-red-400/[0.08]
                "
              >

                <AlertTriangle
                  size={21}
                  className="
                    text-red-400
                  "
                />

              </div>


              <p
                className="
                  font-semibold

                  text-red-300
                "
              >
                {error}
              </p>

            </div>

          )}


          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {!loading &&
            !error &&
            batches.length === 0 && (

              <div
                className="
                  flex

                  min-h-[260px]

                  flex-col

                  items-center
                  justify-center

                  px-6

                  text-center
                "
              >

                <Database
                  size={28}
                  className="
                    mb-4

                    text-[#A78670]
                  "
                />


                <p
                  className="
                    font-semibold

                    text-[#E6CEB8]
                  "
                >
                  No production history available
                </p>


                <p
                  className="
                    mt-2

                    text-xs

                    text-[#967D6A]
                  "
                >
                  New AI decisions will appear here automatically.
                </p>

              </div>

            )}


          {/* =====================================================
              TABLE
          ===================================================== */}

          {!loading &&
            !error &&
            batches.length > 0 && (

              <div
                className="
                  box-border

                  max-h-[470px]

                  w-full
                  max-w-full
                  min-w-0

                  overflow-y-auto
                  overflow-x-hidden

                  custom-scroll
                "
              >

                <table
                  className="
                    w-full
                    max-w-full

                    table-fixed

                    border-collapse

                    text-left
                  "
                >

                  {/* ===============================================
                      EXACT COLUMN WIDTH DISTRIBUTION
                  =============================================== */}

                  <colgroup>

                    <col className="w-[18%]" />

                    <col className="w-[10%]" />

                    <col className="w-[12%]" />

                    <col className="w-[15%]" />

                    <col className="w-[12%]" />

                    <col className="w-[21%]" />

                    <col className="w-[12%]" />

                  </colgroup>


                  {/* =================================================
                      TABLE HEADER
                  ================================================= */}

                  <thead
                    className="
                      sticky
                      top-0

                      z-20
                    "
                  >

                    <tr
                      className="
                        border-b

                        border-[#B98968]/20

                        bg-[#2B1C15]/95

                        backdrop-blur-xl
                      "
                    >

                      {/* BATCH */}

                      <th
                        className="
                          px-2.5
                          py-4

                          lg:px-3
                          xl:px-4
                        "
                      >

                        <div
                          className="
                            flex

                            min-w-0

                            items-center

                            gap-1.5
                          "
                        >

                          <Database
                            size={13}
                            className="
                              shrink-0

                              text-[#C99872]
                            "
                          />


                          <span
                            className="
                              truncate

                              text-[8px]

                              font-extrabold

                              uppercase

                              tracking-[0.1em]

                              text-[#BBA08B]

                              lg:text-[9px]
                              xl:text-[10px]
                            "
                          >
                            Batch ID
                          </span>

                        </div>

                      </th>


                      {/* TIME */}

                      <th
                        className="
                          px-2
                          py-4

                          lg:px-3
                        "
                      >

                        <div
                          className="
                            flex

                            items-center

                            gap-1.5
                          "
                        >

                          <Clock3
                            size={13}
                            className="
                              shrink-0

                              text-[#C99872]
                            "
                          />


                          <span
                            className="
                              whitespace-nowrap

                              text-[8px]

                              font-extrabold

                              uppercase

                              tracking-[0.08em]

                              text-[#BBA08B]

                              lg:text-[9px]
                              xl:text-[10px]
                            "
                          >
                            Time
                          </span>

                        </div>

                      </th>


                      {/* DECISION */}

                      <th
                        className="
                          px-2
                          py-4

                          lg:px-3
                        "
                      >
                        <span
                          className="
                            whitespace-nowrap

                            text-[8px]

                            font-extrabold

                            uppercase

                            tracking-[0.08em]

                            text-[#BBA08B]

                            lg:text-[9px]
                            xl:text-[10px]
                          "
                        >
                          Decision
                        </span>
                      </th>


                      {/* RELEASE */}

                      <th
                        className="
                          px-2
                          py-4

                          lg:px-3
                        "
                      >
                        <span
                          className="
                            whitespace-nowrap

                            text-[8px]

                            font-extrabold

                            uppercase

                            tracking-[0.08em]

                            text-[#BBA08B]

                            lg:text-[9px]
                            xl:text-[10px]
                          "
                        >
                          Release
                        </span>
                      </th>


                      {/* CONDITION */}

                      <th
                        className="
                          px-2
                          py-4

                          lg:px-3
                        "
                      >

                        <div
                          className="
                            flex

                            items-center

                            gap-1
                          "
                        >

                          <Gauge
                            size={13}
                            className="
                              shrink-0

                              text-[#C99872]
                            "
                          />

                          <span
                            className="
                              whitespace-nowrap

                              text-[8px]

                              font-extrabold

                              uppercase

                              tracking-[0.05em]

                              text-[#BBA08B]

                              lg:text-[9px]
                              xl:text-[10px]
                            "
                          >
                            Condition
                          </span>

                        </div>

                      </th>


                      {/* CONFIDENCE */}

                      <th
                        className="
                          px-2
                          py-4

                          lg:px-3
                        "
                      >
                        <span
                          className="
                            whitespace-nowrap

                            text-[8px]

                            font-extrabold

                            uppercase

                            tracking-[0.05em]

                            text-[#BBA08B]

                            lg:text-[9px]
                            xl:text-[10px]
                          "
                        >
                          Confidence
                        </span>
                      </th>


                      {/* RISK */}

                      <th
                        className="
                          px-2
                          py-4

                          text-center

                          lg:px-3
                        "
                      >
                        <span
                          className="
                            whitespace-nowrap

                            text-[8px]

                            font-extrabold

                            uppercase

                            tracking-[0.08em]

                            text-[#BBA08B]

                            lg:text-[9px]
                            xl:text-[10px]
                          "
                        >
                          Risk
                        </span>
                      </th>

                    </tr>

                  </thead>


                  {/* =================================================
                      TABLE BODY
                  ================================================= */}

                  <tbody>

                    {batches.map(
                      (batch, index) => (

                        <motion.tr

                          key={`${batch.id}-${batch.time}-${index}`}

                          initial={{
                            opacity: 0,
                            y: 8,
                          }}

                          animate={{
                            opacity: 1,
                            y: 0,
                          }}

                          transition={{
                            duration: 0.3,
                            delay:
                              Math.min(
                                index * 0.025,
                                0.3
                              ),
                          }}

                          className="
                            group

                            border-b
                            border-[#A87552]/10

                            transition-all
                            duration-300

                            last:border-b-0

                            hover:bg-[#6A422D]/20
                          "
                        >

                          {/* ==========================================
                              BATCH ID
                          ========================================== */}

                          <td
                            className="
                              px-2.5
                              py-[17px]

                              lg:px-3
                              xl:px-4
                            "
                          >

                            <div
                              className="
                                flex

                                min-w-0

                                items-center

                                gap-2
                              "
                            >

                              <div
                                className="
                                  flex

                                  h-8
                                  w-8

                                  shrink-0

                                  items-center
                                  justify-center

                                  rounded-xl

                                  border
                                  border-[#BC835B]/15

                                  bg-[#C98C60]/10

                                  text-[9px]

                                  font-extrabold

                                  text-[#D9A576]

                                  xl:text-[10px]
                                "
                              >

                                {String(
                                  index + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}

                              </div>


                              <span
                                className="
                                  min-w-0

                                  truncate

                                  text-[10px]

                                  font-bold

                                  tracking-[0.01em]

                                  text-[#F8E6D2]

                                  lg:text-[11px]
                                  xl:text-[12px]
                                  2xl:text-[13px]
                                "
                              >
                                {batch.id}
                              </span>

                            </div>

                          </td>


                          {/* ==========================================
                              TIME
                          ========================================== */}

                          <td
                            className="
                              whitespace-nowrap

                              px-2
                              py-[17px]

                              text-[10px]

                              font-medium

                              text-[#C2AA96]

                              lg:px-3
                              lg:text-[11px]

                              xl:text-[12px]
                            "
                          >
                            {batch.time}
                          </td>


                          {/* ==========================================
                              DECISION
                          ========================================== */}

                          <td
                            className="
                              px-2
                              py-[17px]

                              lg:px-3
                            "
                          >

                            <span
                              className={`
                                inline-flex

                                max-w-full

                                items-center
                                justify-center

                                whitespace-nowrap

                                rounded-full

                                px-2.5
                                py-1.5

                                text-[8px]

                                font-extrabold

                                uppercase

                                tracking-[0.06em]

                                lg:text-[9px]
                                xl:px-3
                                xl:text-[10px]

                                ${decisionStyle(
                                  batch.decision
                                )}
                              `}
                            >
                              {batch.decision}
                            </span>

                          </td>


                          {/* ==========================================
                              RELEASE
                          ========================================== */}

                          <td
                            className="
                              px-2
                              py-[17px]

                              lg:px-3
                            "
                          >

                            <span
                              className={`
                                inline-flex

                                max-w-full

                                items-center
                                justify-center

                                whitespace-nowrap

                                rounded-full

                                px-2
                                py-1.5

                                text-[7px]

                                font-extrabold

                                uppercase

                                tracking-[0.03em]

                                lg:text-[8px]

                                xl:px-2.5
                                xl:text-[9px]

                                2xl:text-[10px]

                                ${releaseStyle(
                                  batch.release
                                )}
                              `}
                            >
                              {batch.release.replaceAll(
                                "_",
                                " "
                              )}
                            </span>

                          </td>


                          {/* ==========================================
                              CONDITION
                          ========================================== */}

                          <td
                            className="
                              px-2
                              py-[17px]

                              lg:px-3
                            "
                          >

                            <span
                              className="
                                whitespace-nowrap

                                text-[12px]

                                font-black

                                text-[#FFF0DD]

                                lg:text-[13px]
                                xl:text-[14px]
                                2xl:text-[15px]
                              "
                            >
                              {batch.condition}%
                            </span>

                          </td>


                          {/* ==========================================
                              CONFIDENCE
                          ========================================== */}

                          <td
                            className="
                              px-2
                              py-[17px]

                              lg:px-3
                            "
                          >

                            <div
                              className="
                                flex

                                w-full
                                min-w-0

                                items-center

                                gap-2
                              "
                            >

                              <span
                                className="
                                  shrink-0

                                  text-[10px]

                                  font-bold

                                  text-[#F4DDC9]

                                  lg:text-[11px]
                                  xl:text-[12px]
                                "
                              >
                                {batch.confidence}%
                              </span>


                              <div
                                className="
                                  relative

                                  h-[7px]

                                  min-w-0

                                  flex-1

                                  overflow-hidden

                                  rounded-full

                                  bg-[#1B100C]/60
                                "
                              >

                                <motion.div

                                  initial={{
                                    width: 0,
                                  }}

                                  animate={{
                                    width: `${Math.min(
                                      Math.max(
                                        batch.confidence,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}

                                  transition={{
                                    duration: 0.8,
                                    delay: 0.15,
                                  }}

                                  className={`
                                    h-full

                                    rounded-full

                                    shadow-[0_0_12px_rgba(220,150,95,0.25)]

                                    ${confidenceColor(
                                      batch.confidence
                                    )}
                                  `}
                                />

                              </div>

                            </div>

                          </td>


                          {/* ==========================================
                              RISK
                          ========================================== */}

                          <td
                            className="
                              px-1.5
                              py-[17px]

                              text-center

                              lg:px-2
                            "
                          >

                            <span
                              className={`
                                inline-flex

                                max-w-full

                                items-center
                                justify-center

                                whitespace-nowrap

                                rounded-full

                                px-2.5
                                py-1.5

                                text-[8px]

                                font-extrabold

                                uppercase

                                tracking-[0.06em]

                                lg:text-[9px]

                                xl:px-3
                                xl:text-[10px]

                                ${riskStyle(
                                  batch.risk
                                )}
                              `}
                            >
                              {batch.risk}
                            </span>

                          </td>

                        </motion.tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </div>


        {/* =====================================================
            FOOT NOTE
        ===================================================== */}

        {!loading &&
          !error &&
          batches.length > 0 && (

            <div
              className="
                relative
                z-10

                mt-4

                flex

                min-w-0

                flex-col

                gap-2

                text-[10px]

                font-medium

                text-[#8F7766]

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <span
                className="
                  truncate
                "
              >
                Showing the latest AI production decisions
              </span>


              <span
                className="
                  flex

                  min-w-0

                  items-center

                  gap-1.5
                "
              >

                <Activity
                  size={12}
                  className="
                    shrink-0
                  "
                />

                <span
                  className="
                    truncate
                  "
                >
                  Automatically synchronized with sensor history
                </span>

              </span>

            </div>

          )}

      </motion.div>

    </section>

  );

}