import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import {
  Droplets,
  Thermometer,
  Wind,
  Activity,
  LayoutDashboard,
  Package,
  Play,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Download,
} from "lucide-react";

import apiClient from "../api/apiClient";

import SensorCard from "../components/SensorCard";
import QualityStatusCard from "../components/QualityStatusCard";
import RGBCard from "../components/RGBCard";
import SensorAnalytics from "../components/SensorAnalytics";

import RecommendationCard from "../components/RecommendationCard";

import LastUpdated from "../components/LastUpdated";
import SensorConnection from "../components/SensorConnection";

import CoffeePowderQualityCard from "../components/CoffeePowderQualityCard";

function Dashboard() {
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const recommendationRef = useRef(null);

  // PDF report download state / target
  const dashboardReportRef = useRef(null);
  const [reportDownloading, setReportDownloading] = useState(false);

  // =====================================================
  // PRODUCTION BATCH LIFECYCLE STATE
  // =====================================================

  const [batchState, setBatchState] = useState({
    batch_active: false,
    batch_id: null,
    started_at: null,
    completed_at: null,
    last_completed_batch_id: null,
  });

  const [batchLoading, setBatchLoading] = useState(true);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [batchMessage, setBatchMessage] = useState("");
  const [batchError, setBatchError] = useState("");

  // Remount data-driven child sections after a new live reading
  // or lifecycle action so they refresh immediately.
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  const normalizeBatchState = (data = {}) => ({
    batch_active: Boolean(data.batch_active),
    batch_id: data.batch_id ?? null,
    started_at: data.started_at ?? null,
    completed_at: data.completed_at ?? null,
    last_completed_batch_id: data.last_completed_batch_id ?? null,
  });

  const getApiErrorMessage = (err, fallback) => {
    const detail = err?.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (detail?.message) {
      return detail.message;
    }

    return fallback;
  };

  const formatBatchDateTime = (value) => {
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

  // =====================================================
  // DOWNLOAD DASHBOARD AS PDF REPORT
  // Existing dashboard logic and UI remain unchanged.
  // =====================================================

  const handleDownloadReport = async () => {
    if (!dashboardReportRef.current || reportDownloading) {
      return;
    }

    try {
      setReportDownloading(true);

      const reportElement = dashboardReportRef.current;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F7EBDD",
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: reportElement.scrollWidth,
        logging: false,
      });

      const imageData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const margin = 8;
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pdfWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const printableHeight = pdfHeight - margin * 2;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(
        imageData,
        "PNG",
        margin,
        position,
        imageWidth,
        imageHeight,
        undefined,
        "FAST",
      );

      heightLeft -= printableHeight;

      while (heightLeft > 0) {
        pdf.addPage();

        position = margin - (imageHeight - heightLeft);

        pdf.addImage(
          imageData,
          "PNG",
          margin,
          position,
          imageWidth,
          imageHeight,
          undefined,
          "FAST",
        );

        heightLeft -= printableHeight;
      }

      const reportBatchId =
        batchState.batch_id ||
        batchState.last_completed_batch_id ||
        sensor?.batch_id ||
        "dashboard";

      const safeBatchId = String(reportBatchId).replace(/[^a-zA-Z0-9_-]/g, "_");
      const reportDate = new Date().toISOString().slice(0, 10);

      pdf.save(`CoffeeSense_Report_${safeBatchId}_${reportDate}.pdf`);
    } catch (err) {
      console.error("PDF report download error:", err);
    } finally {
      setReportDownloading(false);
    }
  };

  // =====================================================
  // FETCH CURRENT BATCH STATE
  // =====================================================

  const fetchCurrentBatch = async () => {
    try {
      setBatchLoading(true);

      const response = await apiClient.get("/batch/current");
      const nextState = normalizeBatchState(response.data);

      setBatchState(nextState);
      setBatchError("");

      return nextState;
    } catch (err) {
      console.error("Current batch API error:", err);

      setBatchError(
        getApiErrorMessage(
          err,
          "Unable to load the current production batch.",
        ),
      );

      return null;
    } finally {
      setBatchLoading(false);
    }
  };

  // =====================================================
  // FETCH LIVE SENSOR DATA
  //
  // IMPORTANT:
  // /device/read is called only while a production batch is active.
  // This prevents readings from being saved into an old batch.
  // =====================================================

  const fetchSensorData = async (force = false) => {
    if (!force && !batchState.batch_active) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);

      const response = await apiClient.get("/device/read");

      const liveData = response.data?.data || {};
      const aiDecision = response.data?.ai_decision || {};

      setSensor({
        ...liveData,
        batch_id: response.data?.batch_id || liveData.batch_id,
        ai_decision: aiDecision,
      });

      setError(false);
      setLastRefresh(new Date());
      setDataRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.log("Live Arduino Sensor API Error:", err);

      const detail = err?.response?.data?.detail;

      // If the batch was completed from another tab/session,
      // synchronize lifecycle state instead of showing device offline.
      if (detail?.code === "NO_ACTIVE_BATCH") {
        setError(false);
        await fetchCurrentBatch();
        return;
      }

      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // START NEW PRODUCTION BATCH
  // =====================================================

  const handleStartBatch = async () => {
    try {
      setBatchActionLoading(true);
      setBatchMessage("");
      setBatchError("");

      const response = await apiClient.post("/batch/start");

      const nextState = {
        batch_active: true,
        batch_id: response.data?.batch_id ?? null,
        started_at: response.data?.started_at ?? null,
        completed_at: null,
        last_completed_batch_id:
          batchState.last_completed_batch_id ?? null,
      };

      setBatchState(nextState);

      // Never show the previous batch readings as the new batch.
      setSensor(null);
      setError(false);
      setLoading(true);
      setCountdown(60);

      setBatchMessage(
        `${nextState.batch_id || "New batch"} started successfully.`,
      );

      setDataRefreshKey((prev) => prev + 1);

      // Capture the first reading immediately when the device is ready.
      await fetchSensorData(true);
    } catch (err) {
      console.error("Start batch error:", err);

      setBatchError(
        getApiErrorMessage(
          err,
          "Unable to start a new production batch.",
        ),
      );

      // A 409 can happen if another tab has already started a batch.
      if (err?.response?.status === 409) {
        await fetchCurrentBatch();
      }
    } finally {
      setBatchActionLoading(false);
      setLoading(false);
    }
  };

  // =====================================================
  // COMPLETE ACTIVE PRODUCTION BATCH
  // =====================================================

  const handleCompleteBatch = async () => {
    try {
      setBatchActionLoading(true);
      setBatchMessage("");
      setBatchError("");

      const completedBatchId = batchState.batch_id;

      const response = await apiClient.post("/batch/complete");

      setBatchState({
        batch_active: false,
        batch_id: null,
        started_at: null,
        completed_at: response.data?.completed_at ?? null,
        last_completed_batch_id:
          response.data?.batch_id || completedBatchId || null,
      });

      setCountdown(60);
      setRefreshing(false);
      setLoading(false);

      setBatchMessage(
        `${response.data?.batch_id || completedBatchId || "Batch"} completed successfully.`,
      );

      setDataRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Complete batch error:", err);

      setBatchError(
        getApiErrorMessage(
          err,
          "Unable to complete the active production batch.",
        ),
      );

      if (err?.response?.status === 409) {
        await fetchCurrentBatch();
      }
    } finally {
      setBatchActionLoading(false);
    }
  };

  // =====================================================
  // INITIAL DASHBOARD LOAD
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      const currentBatch = await fetchCurrentBatch();

      if (!mounted) {
        return;
      }

      if (currentBatch?.batch_active) {
        await fetchSensorData(true);
      } else {
        setLoading(false);
        setError(false);
      }
    };

    initializeDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // LIVE POLLING — ONLY WHILE A BATCH IS ACTIVE
  // =====================================================

  useEffect(() => {
    if (!batchState.batch_active) {
      setCountdown(60);
      return undefined;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchSensorData(true);
          return 60;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [batchState.batch_active]);

  const liveSensor = sensor || {};

  const aiDecision =
    liveSensor?.ai_decision?.decision?.toUpperCase();

  // =====================================================
  // SENSOR STATUS LOGIC
  // =====================================================

  const sensorStatus =
    aiDecision === "PASS"
      ? {
          moisture: "Optimal",
          temperature: "Stable",
          humidity: "Healthy",
        }
      : aiDecision === "HOLD"
      ? {
          moisture: "Risk Detected",
          temperature: "Check Required",
          humidity: "Attention Required",
        }
      : {
          moisture: "Monitoring",
          temperature: "Monitoring",
          humidity: "Monitoring",
        };

  const getStatusColors = (status) => {
    if (status === "Risk Detected") {
      return {
        color: "text-red-600",
        dot: "bg-red-500",
        value: "text-red-600",
      };
    }

    if (
      status === "Check Required" ||
      status === "Attention Required"
    ) {
      return {
        color: "text-amber-600",
        dot: "bg-amber-500",
        value: "text-amber-600",
      };
    }

    if (
      status === "Optimal" ||
      status === "Stable" ||
      status === "Healthy"
    ) {
      return {
        color: "text-emerald-600",
        dot: "bg-emerald-500",
        value: "text-emerald-600",
      };
    }

    return {
      color: "text-blue-600",
      dot: "bg-blue-500",
      value: "text-blue-600",
    };
  };

  const moistureStatus = !batchState.batch_active
    ? "Standby"
    : error
    ? "Offline"
    : sensorStatus.moisture;

  const tempStatus = !batchState.batch_active
    ? "Standby"
    : error
    ? "Offline"
    : sensorStatus.temperature;

  const humidityStatus = !batchState.batch_active
    ? "Standby"
    : error
    ? "Offline"
    : sensorStatus.humidity;

  const moistureColors =
    getStatusColors(moistureStatus);

  const tempColors =
    getStatusColors(tempStatus);

  const humidityColors =
    getStatusColors(humidityStatus);

  return (
    <div
      ref={dashboardReportRef}
      className="
        min-h-screen
        relative
        overflow-hidden

        bg-gradient-to-br
        from-[#F7EBDD]
        via-[#F1E0C8]
        to-[#E8CFAC]

        text-[#3B2415]

        p-5
        lg:p-7
      "
    >

      {/* =================================================
          PREMIUM COFFEE AMBIENT BACKGROUND
      ================================================= */}

      <div
        className="
          absolute
          top-[-180px]
          right-[-120px]

          w-[520px]
          h-[520px]

          rounded-full

          bg-[#D8A24C]/12

          blur-[150px]

          pointer-events-none
        "
      />

      <div
        className="
          absolute
          bottom-[-180px]
          left-[15%]

          w-[420px]
          h-[420px]

          rounded-full

          bg-[#B8793B]/10

          blur-[140px]

          pointer-events-none
        "
      />

      <div
        className="
          absolute
          top-[35%]
          left-[42%]

          w-[300px]
          h-[300px]

          rounded-full

          bg-[#F0C978]/08

          blur-[120px]

          pointer-events-none
        "
      />

      {/* subtle decorative line */}

      <div
        className="
          absolute
          top-0
          left-0
          right-0
          h-[2px]

          bg-gradient-to-r
          from-transparent
          via-[#C8892E]
          to-transparent

          opacity-70
        "
      />

      <div className="relative z-10 max-w-7xl mx-auto">


          {/* =================================================
              TOP SENSOR CONNECTION STATUS
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              mb-5

              rounded-[28px]

              bg-gradient-to-br
              from-[#3A2114]
              via-[#2A170D]
              to-[#1B0D07]

              border
              border-[#B9782B]/25

              shadow-[0_18px_45px_rgba(40,20,8,0.25)]

              overflow-hidden
            "
          >

            <SensorConnection
              online={!error}
              lastUpdate={lastRefresh}
            />

          </motion.div>



          {/* =================================================
              PRODUCTION BATCH LIFECYCLE CONTROL
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.12,
            }}
            className="
              relative
              mb-5
              overflow-hidden
              rounded-[26px]
              border
              border-[#B9782B]/25
              bg-gradient-to-br
              from-[#3A2114]
              via-[#2B180E]
              to-[#1E1009]
              px-5
              py-5
              shadow-[0_16px_42px_rgba(54,29,12,0.20)]
              sm:px-6
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                -right-16
                -top-20
                h-52
                w-52
                rounded-full
                bg-[#D89D35]/15
                blur-[85px]
              "
            />

            <div
              className="
                relative
                z-10
                flex
                flex-col
                gap-5
                xl:flex-row
                xl:items-center
                xl:justify-between
              "
            >

              <div
                className="
                  flex
                  min-w-0
                  items-start
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#D9A441]/25
                    bg-[#D9A441]/10
                  "
                >
                  <Package
                    className="
                      h-5
                      w-5
                      text-[#F0BC69]
                    "
                  />
                </div>

                <div className="min-w-0">

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[2.5px]
                        text-[#D6A365]
                      "
                    >
                      Production Batch Control
                    </p>

                    {!batchLoading && (
                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          px-2.5
                          py-1
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[1px]
                          ${
                            batchState.batch_active
                              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                              : "border-[#C8A27D]/20 bg-white/[0.04] text-[#BFA58F]"
                          }
                        `}
                      >
                        <span
                          className={`
                            h-1.5
                            w-1.5
                            rounded-full
                            ${
                              batchState.batch_active
                                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                                : "bg-[#8F7764]"
                            }
                          `}
                        />
                        {batchState.batch_active ? "Active" : "Standby"}
                      </span>
                    )}
                  </div>

                  <div
                    className="
                      mt-2
                      flex
                      flex-wrap
                      items-end
                      gap-x-4
                      gap-y-2
                    "
                  >
                    <h3
                      className="
                        text-[24px]
                        font-black
                        tracking-[-0.5px]
                        !text-[#FFF0D6]
                        sm:text-[28px]
                      "
                    >
                      {batchLoading
                        ? "Loading batch..."
                        : batchState.batch_active
                        ? batchState.batch_id
                        : "No Active Batch"}
                    </h3>

                    {batchState.batch_active && (
                      <div
                        className="
                          mb-1
                          flex
                          items-center
                          gap-1.5
                          text-[11px]
                          font-semibold
                          text-[#BFA58F]
                        "
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        Started {formatBatchDateTime(batchState.started_at)}
                      </div>
                    )}
                  </div>

                  <p
                    className="
                      mt-1.5
                      max-w-2xl
                      text-[12px]
                      leading-5
                      text-[#B6957A]
                    "
                  >
                    {batchState.batch_active
                      ? "Live sensor readings and AI decisions are now assigned only to this production batch."
                      : "Start a production batch before live sensor collection. This prevents readings from being stored under a previous batch ID."}
                  </p>

                  {!batchState.batch_active &&
                    batchState.last_completed_batch_id && (
                      <p
                        className="
                          mt-2
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[1px]
                          text-[#8F7661]
                        "
                      >
                        Last completed: {batchState.last_completed_batch_id}
                      </p>
                    )}

                </div>

              </div>

              <div
                className="
                  flex
                  shrink-0
                  flex-col
                  gap-2.5
                  sm:flex-row
                  xl:justify-end
                "
              >

                {batchState.batch_active ? (
                  <motion.button
                    whileHover={{
                      y: -2,
                      scale: 1.01,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={handleCompleteBatch}
                    disabled={batchActionLoading}
                    className="
                      inline-flex
                      h-12
                      items-center
                      justify-center
                      gap-2.5
                      rounded-2xl
                      border
                      border-emerald-400/25
                      bg-emerald-400/10
                      px-5
                      text-[12px]
                      font-black
                      text-emerald-300
                      transition-all
                      duration-300
                      hover:bg-emerald-400/15
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {batchActionLoading
                      ? "Completing..."
                      : "Complete Batch"}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{
                      y: -2,
                      scale: 1.01,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={handleStartBatch}
                    disabled={batchActionLoading || batchLoading}
                    className="
                      inline-flex
                      h-12
                      items-center
                      justify-center
                      gap-2.5
                      rounded-2xl
                      border
                      border-[#E0A64D]/35
                      bg-gradient-to-r
                      from-[#E9B958]
                      via-[#D89D35]
                      to-[#B87325]
                      px-5
                      text-[12px]
                      font-black
                      text-[#2C180A]
                      shadow-[0_10px_24px_rgba(155,88,23,0.18)]
                      transition-all
                      duration-300
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <Play className="h-4 w-4" />
                    {batchActionLoading
                      ? "Starting..."
                      : "Start New Batch"}
                  </motion.button>
                )}

              </div>

            </div>

            {(batchMessage || batchError) && (
              <div
                className={`
                  relative
                  z-10
                  mt-4
                  flex
                  items-start
                  gap-2
                  rounded-xl
                  border
                  px-3.5
                  py-2.5
                  text-[11px]
                  font-semibold
                  ${
                    batchError
                      ? "border-red-400/20 bg-red-400/[0.07] text-red-300"
                      : "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                  }
                `}
              >
                {batchError ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}

                <span>{batchError || batchMessage}</span>
              </div>
            )}

          </motion.div>



          {/* =================================================
              COFFEE POWDER QUALITY INTELLIGENCE
          ================================================= */}

          <CoffeePowderQualityCard />



        {/* =================================================
            PREMIUM DASHBOARD HEADER
            UI ONLY — existing logic unchanged
        ================================================= */}

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
            duration: 0.65,
            ease: "easeOut",
          }}
          className="mb-8"
        >

          <div
            className="
              relative
              overflow-hidden

              rounded-[28px]

              border
              border-[#B9782B]/25

              bg-gradient-to-br
              from-[#3A2114]
              via-[#2A170D]
              to-[#1B0D07]

              shadow-[0_18px_55px_rgba(40,20,8,0.28)]

              px-6
              py-5
              lg:px-7
              lg:py-6
            "
          >

            {/* Ambient coffee glow */}

            <div
              className="
                pointer-events-none
                absolute
                -top-24
                right-[-70px]

                w-64
                h-64

                rounded-full

                bg-[#D39A45]/18

                blur-[85px]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-28
                left-[30%]

                w-72
                h-40

                rounded-full

                bg-[#B87529]/10

                blur-[75px]
              "
            />

            {/* Fine top highlight */}

            <div
              className="
                pointer-events-none
                absolute
                top-0
                left-8
                right-8
                h-px

                bg-gradient-to-r
                from-transparent
                via-[#C8892E]/60
                to-transparent
              "
            />

            <div
              className="
                relative
                z-10

                flex
                flex-col
                xl:flex-row

                xl:items-center
                xl:justify-between

                gap-6
              "
            >

              {/* =================================================
                  LEFT — BRAND / TITLE
              ================================================= */}

              <div className="min-w-0">

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    flex-wrap
                  "
                >

                  <motion.div
                    whileHover={{
                      rotate: 3,
                      scale: 1.04,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="
                      w-11
                      h-11

                      shrink-0

                      rounded-2xl

                      bg-gradient-to-br
                      from-[#FFF7E5]
                      to-[#E8C88F]

                      border
                      border-[#B9782B]/25

                      shadow-[0_8px_24px_rgba(131,76,26,0.14)]

                      flex
                      items-center
                      justify-center
                    "
                  >

                    <LayoutDashboard
                      className="
                        w-5
                        h-5
                        text-[#9B5D19]
                      "
                    />

                  </motion.div>


                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      flex-wrap
                    "
                  >

                    <p
                      className="
                        text-[10px]
                        sm:text-[11px]

                        tracking-[3px]
                        sm:tracking-[4px]

                        uppercase

                        font-black

                        text-[#E7B955]

                        leading-none
                      "
                    >
                      INDUSTRIAL COFFEE INTELLIGENCE
                    </p>


                    <span
                      className="
                        inline-flex
                        items-center
                        justify-center

                        px-3
                        py-1.5

                        rounded-full

                        bg-[#D9A441]/14

                        border
                        border-[#D9A441]/35

                        text-[#F2C66D]

                        text-[9px]

                        font-black

                        tracking-[1.5px]
                      "
                    >
                      AI
                    </span>

                  </div>

                </div>


                <motion.h2
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.65,
                    delay: 0.08,
                  }}
                  className="
                    mt-4

                    text-[25px]
                    sm:text-[28px]
                    lg:text-[31px]

                    font-black

                    tracking-[-0.6px]

                    !text-[#FFF1D6]

                    leading-tight
                  "
                >
                  CoffeeSense Control Center
                </motion.h2>


                <p
                  className="
                    mt-2

                    text-[13px]
                    sm:text-sm

                    text-[#D8B88A]

                    font-medium

                    max-w-2xl

                    leading-relaxed
                  "
                >
                  Real-time coffee quality monitoring powered by
                  IoT sensors and AI-driven production intelligence.
                </p>

              </div>


              {/* =================================================
                  RIGHT — ACTION / TIME
              ================================================= */}

              <div
                className="
                  flex
                  items-center
                  gap-2.5
                  sm:gap-3

                  flex-wrap

                  xl:justify-end
                "
              >

                <motion.button
                  whileHover={{
                    y: -2,
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() => fetchSensorData()}
                  disabled={
                    refreshing ||
                    batchActionLoading ||
                    !batchState.batch_active
                  }
                  className="
                    h-12

                    px-5

                    rounded-2xl

                    bg-gradient-to-br
                    from-[#E8B94F]
                    via-[#D89D35]
                    to-[#B87325]

                    text-[#2C180A]

                    font-black
                    text-sm

                    border
                    border-[#A9651B]/35

                    shadow-[0_10px_24px_rgba(155,88,23,0.20)]

                    hover:shadow-[0_14px_30px_rgba(155,88,23,0.27)]

                    transition-all
                    duration-300

                    flex
                    items-center
                    justify-center
                    gap-2.5

                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  <Activity
                    className="w-4 h-4"
                  />

                  {refreshing
                    ? "Refreshing..."
                    : batchState.batch_active
                    ? "Refresh"
                    : "No Active Batch"}

                </motion.button>


                <div
                  className="
                    h-12
                    min-w-[270px]

                    px-4

                    rounded-2xl

                    bg-gradient-to-r
                    from-[#321B0F]
                    via-[#3A2114]
                    to-[#2B160B]

                    backdrop-blur-xl

                    border
                    border-[#D9A441]/35

                    shadow-[0_10px_28px_rgba(58,33,14,0.30)]

                    flex
                    items-center

                    [&>div]:!bg-transparent
                    [&>div]:!border-0
                    [&>div]:!shadow-none
                    [&>div]:!p-0
                  "
                >

                  <LastUpdated
                    time={lastRefresh}
                  />

                </div>


                <motion.div
                  animate={{
                    boxShadow: [
                      "0 8px 22px rgba(91,52,20,0.06)",
                      "0 10px 28px rgba(170,105,31,0.13)",
                      "0 8px 22px rgba(91,52,20,0.06)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    h-12
                    min-w-[86px]

                    px-4

                    rounded-2xl

                    bg-[#FFF9EF]/90

                    border
                    border-[#C8892E]/22

                    flex
                    flex-col
                    items-center
                    justify-center
                  "
                >

                  <p
                    className="
                      text-[7px]

                      uppercase
                      tracking-[1.8px]

                      text-[#876247]

                      font-bold

                      leading-none
                    "
                  >
                    NEXT UPDATE
                  </p>

                  <p
                    className="
                      mt-1

                      text-[#A9651B]

                      text-base

                      font-black

                      leading-none
                    "
                  >
                    {batchState.batch_active
                      ? `${countdown}s`
                      : "PAUSED"}
                  </p>

                </motion.div>

              </div>

            </div>

          </div>

          

        </motion.div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

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
            delay: 0.2,
          }}
          className="space-y-6"
        >

          {/* =================================================
              AI DECISION
          ================================================= */}

          <div
            className="
              rounded-[28px]

              p-2.5

              bg-gradient-to-br
              from-[#FFF4DF]
              via-[#F4DFC2]
              to-[#E8C99D]

              border
              border-[#B87529]/25

              shadow-[0_18px_45px_rgba(91,52,20,0.12)]
            "
          >

            <QualityStatusCard
                data={liveSensor.ai_decision}
                onViewRecommendation={() => {

                    setShowRecommendation(true);

                    setTimeout(() => {

                        recommendationRef.current?.scrollIntoView({
                            behavior:"smooth",
                            block:"start"
                        });

                    },300);

                }}
            />

          </div>


          {/* =================================================
              SENSOR CARDS
          ================================================= */}

          <div
            className="
              grid

              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-3

              gap-5

              w-full
            "
          >

            <div>

              <SensorCard
                title="MOISTURE LEVEL"

                value={
                  loading
                    ? "---"
                    : liveSensor.moisture ?? "--"
                }

                unit=""

                icon={
                  <Droplets
                    className="
                      w-4
                      h-4
                      text-[#B87325]
                    "
                  />
                }

                status={moistureStatus}

                statusColor={
                  moistureColors.color
                }

                statusDot={
                  moistureColors.dot
                }

                valueColor={
                  moistureColors.value
                }

                color="
                  group-hover:border-[#C8892E]/50
                "

                delay={0}
              />

            </div>


            <div>

              <SensorCard
                title="TEMPERATURE"

                value={
                  loading
                    ? "---"
                    : liveSensor.temperature ?? "--"
                }

                unit="°C"

                icon={
                  <Thermometer
                    className="
                      w-4
                      h-4
                      text-[#B87325]
                    "
                  />
                }

                status={tempStatus}

                statusColor={
                  tempColors.color
                }

                statusDot={
                  tempColors.dot
                }

                valueColor={
                  tempColors.value
                }

                color="
                  group-hover:border-[#C8892E]/50
                "

                delay={0.1}
              />

            </div>


            <div>

              <SensorCard
                title="HUMIDITY"

                value={
                  loading
                    ? "---"
                    : liveSensor.humidity ?? "--"
                }

                unit="%"

                icon={
                  <Wind
                    className="
                      w-4
                      h-4
                      text-[#B87325]
                    "
                  />
                }

                status={humidityStatus}

                statusColor={
                  humidityColors.color
                }

                statusDot={
                  humidityColors.dot
                }

                valueColor={
                  humidityColors.value
                }

                color="
                  group-hover:border-[#C8892E]/50
                "

                delay={0.2}
              />

            </div>

          </div>


          {/* =================================================
              RGB COFFEE INTELLIGENCE
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
            className="
              rounded-[28px]

              p-5

              bg-gradient-to-br
              from-[#FFF7E9]
              via-[#F5E4CA]
              to-[#E8CFAB]

              border
              border-[#B87529]/25

              shadow-[0_18px_45px_rgba(91,52,20,0.11)]
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row

                items-start
                sm:items-center

                justify-between

                mb-4

                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-[10px]

                    tracking-[3px]

                    uppercase

                    text-[#A96820]

                    font-black
                  "
                >
                  COFFEE VISION INTELLIGENCE
                </p>


                <h2
                  className="
                    text-xl

                    font-extrabold

                    mt-0.5

                    tracking-tight

                    !text-[#3B2415]
                  "
                >
                  RGB Coffee Intelligence
                </h2>


                <p
                  className="
                    text-[#76583E]

                    text-xs
                  "
                >
                  Computer Vision Based Coffee Colour Analysis
                </p>

              </div>


              <div
                className="
                  px-4
                  py-2

                  rounded-xl

                  bg-[#FFF8EA]

                  border
                  border-[#C8892E]/30

                  text-[#9A601C]

                  font-bold

                  text-xs

                  shadow-sm
                "
              >
                Vision Intelligence
              </div>

            </div>


            <RGBCard
              red={liveSensor.red || 0}
              green={liveSensor.green || 0}
              blue={liveSensor.blue || 0}
            />

          </motion.div>

        </motion.div>


        {/* =================================================
            LOWER INTELLIGENCE SECTIONS
        ================================================= */}

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
            delay: 0.4,
          }}
          className="
            mt-10

            space-y-9
          "
        >

          {/* =================================================
              SENSOR ANALYTICS
          ================================================= */}

          <section>

            <div className="mb-4">

              <p
                className="
                  text-[10px]

                  uppercase

                  tracking-[3px]

                  text-[#A96820]

                  font-black
                "
              >
                DATA ANALYTICS
              </p>


              <h2
                className="
                  text-xl

                  font-black

                  !text-[#3B2415]

                  mt-1
                "
              >
                Sensor Intelligence Analytics
              </h2>


              <p
                className="
                  text-[#76583E]

                  text-xs

                  mt-1
                "
              >
                Historical sensor behaviour and quality trend monitoring
              </p>

            </div>


            <div
              className="
                rounded-[28px]

                p-4

                bg-[#FFF7E9]/85

                backdrop-blur-xl

                border
                border-[#B87529]/22

                shadow-[0_16px_40px_rgba(91,52,20,0.10)]
              "
            >

              <SensorAnalytics key={`sensor-analytics-${dataRefreshKey}`} />

            </div>

          </section>


          


          {/* =================================================
              AI RECOMMENDATION
          ================================================= */}

          <section ref={recommendationRef}>

            <div
              className="
                rounded-[28px]

                p-5

                bg-gradient-to-br
                from-[#FFF0D0]
                via-[#F4DDBB]
                to-[#E7C89D]

                border
                border-[#C8892E]/30

                shadow-[0_18px_45px_rgba(91,52,20,0.12)]
              "
            >

              {showRecommendation && (
                  <RecommendationCard
                      key={`recommendation-${dataRefreshKey}`}
                  />
              )}

            </div>

          </section>


          


          {/* =================================================
              PDF REPORT
          ================================================= */}

          <section
            data-html2canvas-ignore="true"
            className="flex justify-center pt-1"
          >
            <motion.button
              whileHover={{
                y: -2,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={handleDownloadReport}
              disabled={reportDownloading}
              className="
                inline-flex
                h-12
                items-center
                justify-center
                gap-2.5
                rounded-2xl
                border
                border-[#A9651B]/35
                bg-gradient-to-r
                from-[#E9B958]
                via-[#D89D35]
                to-[#B87325]
                px-6
                text-[12px]
                font-black
                text-[#2C180A]
                shadow-[0_10px_24px_rgba(155,88,23,0.18)]
                transition-all
                duration-300
                hover:shadow-[0_14px_30px_rgba(155,88,23,0.25)]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <Download className="h-4 w-4" />
              {reportDownloading ? "Preparing Report..." : "Download Report"}
            </motion.button>
          </section>

        </motion.div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.8,
          }}
          className="
            mt-10

            pb-5

            text-center
          "
        >

          <div
            className="
              mx-auto

              w-20

              h-px

              bg-[#B87529]/30

              mb-3
            "
          />

          <p
            className="
              text-[8px]

              text-[#795B42]

              tracking-[4px]

              uppercase

              font-semibold
            "
          >
            © 2026 CoffeeSense AI • Powered by Next-Gen Intelligence • v3.0
          </p>

        </motion.div>

      </div>
    </div>
  );
}

export default Dashboard;