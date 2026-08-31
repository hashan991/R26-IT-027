import {
  useEffect,
  useState,
} from "react";

import {
  predictBeanDefects,
  getPhoneCameraStatus,
  captureAndAnalyzePhonePhoto,
} from "../../services/beanService";

import ImageUploader from "./ImageUploader";
import DetectionSummary from "./DetectionSummary";
import DetectionResultImage from "./DetectionResultImage";
import PhysicalWeightCard from "./PhysicalWeightCard";


const REQUIRED_VIEWS = 3;

const ANALYSIS_MODES = {
  SINGLE: "single",
  MULTI: "multi",
};


function PhysicalAnalysis({
  onComplete,
  onBack,
}) {
  // =========================================================
  // ANALYSIS MODE
  // =========================================================
  //
  // single = default, one image only
  // multi  = optional 3-view analysis
  // =========================================================

  const [
    analysisMode,
    setAnalysisMode,
  ] = useState(
    ANALYSIS_MODES.SINGLE,
  );


  // =========================================================
  // IMAGE SOURCE
  // =========================================================

  const [
    imageSource,
    setImageSource,
  ] = useState("phone");


  // =========================================================
  // SINGLE IMAGE UPLOAD
  // =========================================================

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    preview,
    setPreview,
  ] = useState(null);

  const [
    dragActive,
    setDragActive,
  ] = useState(false);


  // =========================================================
  // MULTI IMAGE UPLOAD
  // =========================================================

  const [
    multiImages,
    setMultiImages,
  ] = useState([
    null,
    null,
    null,
  ]);

  const [
    multiPreviews,
    setMultiPreviews,
  ] = useState([
    null,
    null,
    null,
  ]);

  const [
    multiDragActive,
    setMultiDragActive,
  ] = useState([
    false,
    false,
    false,
  ]);


  // =========================================================
  // PHYSICAL AI RESULT
  // =========================================================

  const [
    result,
    setResult,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    processingView,
    setProcessingView,
  ] = useState(null);


  // =========================================================
  // LOAD CELL
  // =========================================================

  const [
    capturedWeight,
    setCapturedWeight,
  ] = useState(null);


  // =========================================================
  // PHONE CAMERA
  // =========================================================

  const [
    phoneStatus,
    setPhoneStatus,
  ] = useState({
    connected: false,
    device_id: null,
  });

  const [
    checkingPhone,
    setCheckingPhone,
  ] = useState(false);

  const [
    phoneError,
    setPhoneError,
  ] = useState("");

  const [
    phoneCapture,
    setPhoneCapture,
  ] = useState(null);


  // =========================================================
  // MULTI-VIEW RESULTS
  // =========================================================

  const [
    viewResults,
    setViewResults,
  ] = useState([]);

  const [
    viewCaptures,
    setViewCaptures,
  ] = useState([]);


  // =========================================================
  // API URL
  // =========================================================

  const API_URL =
    import.meta.env.VITE_API_URL || "";


  const getPredictionImageUrl = (
    path,
  ) => {
    if (!path) {
      return "";
    }

    if (
      path.startsWith("http")
    ) {
      return path;
    }

    const base =
      API_URL.endsWith("/")
        ? API_URL.slice(
            0,
            -1,
          )
        : API_URL;

    const imagePath =
      path.startsWith("/")
        ? path
        : `/${path}`;

    return `${base}${imagePath}`;
  };


  // =========================================================
  // PHONE STATUS
  // =========================================================

  const checkPhoneStatus =
    async () => {
      try {
        setCheckingPhone(true);
        setPhoneError("");

        const data =
          await getPhoneCameraStatus();

        setPhoneStatus(data);

        if (!data.connected) {
          setPhoneError(
            data.error ||
              "Android phone is not connected through ADB.",
          );
        }
      } catch (error) {
        console.error(
          "Phone camera status failed:",
          error,
        );

        setPhoneStatus({
          connected: false,
          device_id: null,
        });

        if (
          error.response?.status !== 401
        ) {
          setPhoneError(
            "Unable to check the phone camera connection.",
          );
        }
      } finally {
        setCheckingPhone(false);
      }
    };


  useEffect(() => {
    if (
      imageSource === "phone"
    ) {
      checkPhoneStatus();
    }
  }, [imageSource]);


  // =========================================================
  // HELPERS
  // =========================================================

  const getResultCounts = (
    analysisResult,
  ) => {
    const categoryCounts =
      analysisResult?.category_counts ||
      {};

    const defectCounts =
      analysisResult?.defect_counts ||
      {};

    const good = Number(
      analysisResult?.good_count ??
        categoryCounts.good ??
        0,
    );

    const broken = Number(
      analysisResult?.broken_count ??
        categoryCounts.broken ??
        defectCounts.broken ??
        0,
    );

    const black = Number(
      analysisResult?.black_count ??
        categoryCounts.black ??
        defectCounts.black ??
        0,
    );

    const blackAndBroken =
      Number(
        analysisResult
          ?.black_and_broken_count ??
          analysisResult
            ?.black_broken_count ??
          categoryCounts
            .black_and_broken ??
          defectCounts
            .black_and_broken ??
          0,
      );

    const unknown = Number(
      analysisResult?.unknown_count ??
        categoryCounts.unknown ??
        defectCounts.unknown ??
        0,
    );

    const calculatedTotal =
      good +
      broken +
      black +
      blackAndBroken +
      unknown;

    const reportedTotal =
      Number(
        analysisResult?.total_beans ??
          analysisResult
            ?.total_count ??
          0,
      );

    return {
      total:
        reportedTotal > 0
          ? reportedTotal
          : calculatedTotal,
      good,
      broken,
      black,
      blackAndBroken,
      unknown,
    };
  };


  const buildMultiViewAverageResult = (
    results,
  ) => {
    if (
      !Array.isArray(results) ||
      results.length === 0
    ) {
      return null;
    }

    const snapshots =
      results.map(
        getResultCounts,
      );

    const averageCount = (
      key,
    ) => {
      const sum =
        snapshots.reduce(
          (
            total,
            snapshot,
          ) =>
            total +
            Number(
              snapshot[key] || 0,
            ),
          0,
        );

      return Math.round(
        sum / snapshots.length,
      );
    };

    const good =
      averageCount("good");

    const broken =
      averageCount("broken");

    const black =
      averageCount("black");

    const blackAndBroken =
      averageCount(
        "blackAndBroken",
      );

    const unknown =
      averageCount("unknown");

    const totalBeans =
      good +
      broken +
      black +
      blackAndBroken +
      unknown;

    const totalDefects =
      broken +
      black +
      blackAndBroken +
      unknown;

    const goodPercentage =
      totalBeans > 0
        ? Number(
            (
              (good /
                totalBeans) *
              100
            ).toFixed(2),
          )
        : 0;

    const defectPercentage =
      totalBeans > 0
        ? Number(
            (
              (totalDefects /
                totalBeans) *
              100
            ).toFixed(2),
          )
        : 0;

    const lastResult =
      results[
        results.length - 1
      ];

    return {
      ...lastResult,

      // No single combined image exists,
      // because bean positions differ
      // between the three views.
      predicted_image_url: null,

      multi_view_images:
        results.map(
          (
            item,
            index,
          ) => ({
            view_number:
              index + 1,
            predicted_image_url:
              item
                ?.predicted_image_url ||
              null,
          }),
        ),

      total_beans: totalBeans,
      total_count: totalBeans,

      good_count: good,
      broken_count: broken,
      black_count: black,

      black_broken_count:
        blackAndBroken,

      black_and_broken_count:
        blackAndBroken,

      unknown_count: unknown,

      total_good: good,
      total_defects:
        totalDefects,

      good_percentage:
        goodPercentage,

      defect_percentage:
        defectPercentage,

      defect_counts: {
        broken,
        black,
        black_and_broken:
          blackAndBroken,
        unknown,
      },

      category_counts: {
        good,
        broken,
        black,
        black_and_broken:
          blackAndBroken,
        unknown,
      },

      analysis_mode:
        "MULTI_VIEW",

      multi_view: {
        enabled: true,

        required_views:
          REQUIRED_VIEWS,

        completed_views:
          results.length,

        aggregation_method:
          "AVERAGE_CATEGORY_COUNTS",

        orientation_method:
          "MULTIPLE_TOP_VIEW_ORIENTATIONS",

        views:
          snapshots.map(
            (
              snapshot,
              index,
            ) => ({
              view_number:
                index + 1,

              total_beans:
                snapshot.total,

              good:
                snapshot.good,

              broken:
                snapshot.broken,

              black:
                snapshot.black,

              black_and_broken:
                snapshot.blackAndBroken,

              unknown:
                snapshot.unknown,
            }),
          ),
      },
    };
  };


  const calculatePhysicalAssessment =
    (
      analysisResult,
    ) => {
      if (!analysisResult) {
        return {
          score: 0,
          status: "No Data",
          weightedDefects: 0,
          defectLoadPercent: 0,
        };
      }

      const categoryCounts =
        analysisResult
          .category_counts || {};

      const totalBeans = Number(
        analysisResult
          .total_beans ??
          analysisResult
            .total_count ??
          0,
      );

      const black = Number(
        analysisResult
          .black_count ??
          categoryCounts.black ??
          0,
      );

      const blackAndBroken =
        Number(
          analysisResult
            .black_and_broken_count ??
            analysisResult
              .black_broken_count ??
            categoryCounts
              .black_and_broken ??
            0,
        );

      const broken = Number(
        analysisResult
          .broken_count ??
          categoryCounts.broken ??
          0,
      );

      const unknown = Number(
        analysisResult
          .unknown_count ??
          categoryCounts.unknown ??
          0,
      );

      if (
        !totalBeans ||
        totalBeans <= 0
      ) {
        return {
          score: 0,
          status: "No Data",
          weightedDefects: 0,
          defectLoadPercent: 0,
        };
      }

      const weightedDefects =
        black * 1.0 +
        blackAndBroken * 1.0 +
        broken * 0.35 +
        unknown * 0.5;

      const defectLoad =
        weightedDefects /
        totalBeans;

      const rawScore =
        100 *
        (1 - defectLoad);

      const score = Math.max(
        0,
        Math.min(
          100,
          rawScore,
        ),
      );

      let status = "Poor";

      if (score >= 90) {
        status = "Excellent";
      } else if (
        score >= 75
      ) {
        status = "Good";
      } else if (
        score >= 60
      ) {
        status = "Review";
      }

      return {
        score: Number(
          score.toFixed(2),
        ),

        status,

        weightedDefects:
          Number(
            weightedDefects.toFixed(
              2,
            ),
          ),

        defectLoadPercent:
          Number(
            (
              defectLoad * 100
            ).toFixed(2),
          ),
      };
    };


  const revokePreview = (
    url,
  ) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  };


  const clearSingleUpload =
    () => {
      revokePreview(preview);

      setSelectedImage(null);
      setPreview(null);
      setDragActive(false);
    };


  const clearMultiUploads =
    () => {
      multiPreviews.forEach(
        revokePreview,
      );

      setMultiImages([
        null,
        null,
        null,
      ]);

      setMultiPreviews([
        null,
        null,
        null,
      ]);

      setMultiDragActive([
        false,
        false,
        false,
      ]);
    };


  const resetAnalysisData =
    () => {
      setResult(null);

      setViewResults([]);
      setViewCaptures([]);

      setPhoneCapture(null);
      setPhoneError("");

      setProcessingView(null);
    };


  // =========================================================
  // ANALYSIS MODE CHANGE
  // =========================================================

  const handleAnalysisModeChange =
    (mode) => {
      if (
        mode === analysisMode
      ) {
        return;
      }

      clearSingleUpload();
      clearMultiUploads();
      resetAnalysisData();

      setAnalysisMode(mode);
    };


  // =========================================================
  // IMAGE SOURCE CHANGE
  // =========================================================

  const handleSourceChange = (
    source,
  ) => {
    if (
      source === imageSource
    ) {
      return;
    }

    clearSingleUpload();
    clearMultiUploads();
    resetAnalysisData();

    setImageSource(source);
  };


  // =========================================================
  // SINGLE IMAGE FILE HANDLING
  // =========================================================

  const handleSingleFile = (
    file,
  ) => {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      alert(
        "Please select a valid image file.",
      );
      return;
    }

    revokePreview(preview);

    setSelectedImage(file);

    setPreview(
      URL.createObjectURL(file),
    );

    setResult(null);
    setViewResults([]);
    setViewCaptures([]);
  };


  const handleImageChange = (
    event,
  ) => {
    handleSingleFile(
      event.target.files?.[0],
    );
  };


  const handleDragOver = (
    event,
  ) => {
    event.preventDefault();
    setDragActive(true);
  };


  const handleDragLeave =
    () => {
      setDragActive(false);
    };


  const handleDrop = (
    event,
  ) => {
    event.preventDefault();

    setDragActive(false);

    handleSingleFile(
      event.dataTransfer
        .files?.[0],
    );
  };


  // =========================================================
  // MULTI IMAGE FILE HANDLING
  // =========================================================

  const handleMultiFile = (
    index,
    file,
  ) => {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      alert(
        `View ${
          index + 1
        }: Please select a valid image file.`,
      );
      return;
    }

    const oldPreview =
      multiPreviews[index];

    revokePreview(oldPreview);

    setMultiImages(
      (previous) => {
        const updated = [
          ...previous,
        ];

        updated[index] =
          file;

        return updated;
      },
    );

    setMultiPreviews(
      (previous) => {
        const updated = [
          ...previous,
        ];

        updated[index] =
          URL.createObjectURL(
            file,
          );

        return updated;
      },
    );

    setResult(null);
    setViewResults([]);
    setViewCaptures([]);
  };


  const handleMultiImageChange =
    (
      index,
      event,
    ) => {
      handleMultiFile(
        index,
        event.target.files?.[0],
      );
    };


  const handleMultiDragOver =
    (
      index,
      event,
    ) => {
      event.preventDefault();

      setMultiDragActive(
        (previous) => {
          const updated = [
            ...previous,
          ];

          updated[index] =
            true;

          return updated;
        },
      );
    };


  const handleMultiDragLeave =
    (index) => {
      setMultiDragActive(
        (previous) => {
          const updated = [
            ...previous,
          ];

          updated[index] =
            false;

          return updated;
        },
      );
    };


  const handleMultiDrop = (
    index,
    event,
  ) => {
    event.preventDefault();

    handleMultiDragLeave(
      index,
    );

    handleMultiFile(
      index,
      event.dataTransfer
        .files?.[0],
    );
  };


  // =========================================================
  // VALIDATE WEIGHT
  // =========================================================

  const validateWeight = () => {
    if (
      capturedWeight === null ||
      capturedWeight ===
        undefined
    ) {
      alert(
        "Please zero the scale, add the coffee bean sample, and capture the sample weight first.",
      );

      return false;
    }

    return true;
  };


  // =========================================================
  // SINGLE IMAGE ANALYSIS - PHONE
  // =========================================================

  const handleSinglePhoneAnalysis =
    async () => {
      if (
        !phoneStatus.connected
      ) {
        alert(
          "Please connect the Android phone through USB and enable ADB first.",
        );

        return;
      }

      try {
        setLoading(true);

        setResult(null);
        setViewResults([]);
        setViewCaptures([]);

        setPhoneError("");

        const data =
          await captureAndAnalyzePhonePhoto();

        if (!data?.result) {
          throw new Error(
            "Physical AI result was not returned.",
          );
        }

        setPhoneCapture(
          data.capture || null,
        );

        setResult({
          ...data.result,

          analysis_mode:
            "SINGLE_IMAGE",
        });
      } catch (error) {
        console.error(
          "Single phone analysis failed:",
          error,
        );

        if (
          error.response?.status !==
          401
        ) {
          const message =
            error.response?.data
              ?.detail ||
            error.message ||
            "Phone camera capture or Physical AI analysis failed.";

          setPhoneError(message);

          alert(message);
        }
      } finally {
        setLoading(false);
      }
    };


  // =========================================================
  // SINGLE IMAGE ANALYSIS - UPLOAD
  // =========================================================

  const handleSingleUploadAnalysis =
    async () => {
      if (!selectedImage) {
        alert(
          "Please upload one coffee bean sample image first.",
        );

        return;
      }

      try {
        setLoading(true);

        setResult(null);
        setViewResults([]);
        setViewCaptures([]);

        const data =
          await predictBeanDefects(
            selectedImage,
          );

        if (!data?.result) {
          throw new Error(
            "Physical AI result was not returned.",
          );
        }

        setResult({
          ...data.result,

          analysis_mode:
            "SINGLE_IMAGE",
        });
      } catch (error) {
        console.error(
          "Single upload analysis failed:",
          error,
        );

        if (
          error.response?.status !==
          401
        ) {
          alert(
            error.response?.data
              ?.detail ||
              error.message ||
              "Physical AI analysis failed. Please check the backend and try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };


  // =========================================================
  // MULTI VIEW ANALYSIS - PHONE
  // =========================================================
  //
  // Phone mode stays as 3 separate capture clicks because the
  // user must manually change / shake the bean orientation
  // between each capture.
  // =========================================================

  const handleMultiPhoneAnalysis =
    async () => {
      if (
        !phoneStatus.connected
      ) {
        alert(
          "Please connect the Android phone through USB and enable ADB first.",
        );

        return;
      }

      if (
        viewResults.length >=
        REQUIRED_VIEWS
      ) {
        return;
      }

      const currentView =
        viewResults.length + 1;

      try {
        setLoading(true);
        setProcessingView(
          currentView,
        );

        setResult(null);
        setPhoneError("");

        const data =
          await captureAndAnalyzePhonePhoto();

        if (!data?.result) {
          throw new Error(
            `Physical AI result was not returned for View ${currentView}.`,
          );
        }

        const nextResults = [
          ...viewResults,
          data.result,
        ];

        const nextCaptures = [
          ...viewCaptures,
          data.capture || null,
        ];

        setViewResults(
          nextResults,
        );

        setViewCaptures(
          nextCaptures,
        );

        setPhoneCapture(
          data.capture || null,
        );

        if (
          nextResults.length <
          REQUIRED_VIEWS
        ) {
          setResult(null);
          return;
        }

        const combinedResult =
          buildMultiViewAverageResult(
            nextResults,
          );

        setResult(
          combinedResult,
        );
      } catch (error) {
        console.error(
          "Multi-view phone analysis failed:",
          error,
        );

        if (
          error.response?.status !==
          401
        ) {
          const message =
            error.response?.data
              ?.detail ||
            error.message ||
            "Phone camera capture or Physical AI analysis failed.";

          setPhoneError(message);

          alert(message);
        }
      } finally {
        setLoading(false);
        setProcessingView(null);
      }
    };


  // =========================================================
  // MULTI VIEW ANALYSIS - UPLOAD
  // =========================================================
  //
  // Upload 3 images first, then click Analyze All 3 Views once.
  // =========================================================

  const handleMultiUploadAnalysis =
    async () => {
      const allImagesSelected =
        multiImages.every(
          Boolean,
        );

      if (!allImagesSelected) {
        alert(
          "Please upload all 3 coffee bean views first.",
        );

        return;
      }

      try {
        setLoading(true);

        setResult(null);
        setViewResults([]);
        setViewCaptures([]);

        const results = [];
        const captures = [];

        for (
          let index = 0;
          index <
          REQUIRED_VIEWS;
          index += 1
        ) {
          setProcessingView(
            index + 1,
          );

          const file =
            multiImages[index];

          const data =
            await predictBeanDefects(
              file,
            );

          if (!data?.result) {
            throw new Error(
              `Physical AI result was not returned for View ${
                index + 1
              }.`,
            );
          }

          results.push(
            data.result,
          );

          captures.push({
            source: "upload",

            filename:
              file.name,

            file_size_bytes:
              file.size,

            view_number:
              index + 1,
          });
        }

        setViewResults(
          results,
        );

        setViewCaptures(
          captures,
        );

        const combinedResult =
          buildMultiViewAverageResult(
            results,
          );

        setResult(
          combinedResult,
        );
      } catch (error) {
        console.error(
          "Multi-view upload analysis failed:",
          error,
        );

        if (
          error.response?.status !==
          401
        ) {
          alert(
            error.response?.data
              ?.detail ||
              error.message ||
              "Multi-view Physical AI analysis failed.",
          );
        }
      } finally {
        setLoading(false);
        setProcessingView(null);
      }
    };


  // =========================================================
  // RUN AI
  // =========================================================

  const handlePredict =
    async () => {
      if (!validateWeight()) {
        return;
      }

      if (
        analysisMode ===
        ANALYSIS_MODES.SINGLE
      ) {
        if (
          imageSource ===
          "phone"
        ) {
          await handleSinglePhoneAnalysis();
        } else {
          await handleSingleUploadAnalysis();
        }

        return;
      }

      if (
        imageSource ===
        "phone"
      ) {
        await handleMultiPhoneAnalysis();
      } else {
        await handleMultiUploadAnalysis();
      }
    };


  // =========================================================
  // RESET MULTI VIEW
  // =========================================================

  const resetMultiViewInspection =
    () => {
      setResult(null);

      setViewResults([]);
      setViewCaptures([]);

      setPhoneCapture(null);
      setPhoneError("");

      setProcessingView(null);

      if (
        imageSource ===
        "upload"
      ) {
        clearMultiUploads();
      }
    };


  // =========================================================
  // DERIVED VALUES
  // =========================================================

  const physicalAssessment =
    calculatePhysicalAssessment(
      result,
    );

  const completedViewCount =
    viewResults.length;

  const nextViewNumber =
    Math.min(
      completedViewCount + 1,
      REQUIRED_VIEWS,
    );

  const multiViewComplete =
    analysisMode ===
      ANALYSIS_MODES.MULTI &&
    completedViewCount >=
      REQUIRED_VIEWS &&
    Boolean(result);

  const phoneReady =
    phoneStatus.connected &&
    !checkingPhone;

  const allMultiImagesSelected =
    multiImages.every(
      Boolean,
    );


  // =========================================================
  // CONTINUE TO FINAL REPORT
  // =========================================================

  const handleContinue =
    () => {
      if (!result) {
        return;
      }

      const isMulti =
        analysisMode ===
        ANALYSIS_MODES.MULTI;

      const physicalResult = {
        ...result,

        imageSource,

        analysisMode,

        inspectionMethod:
          isMulti
            ? "MULTI_VIEW_TOP_AVERAGE"
            : "SINGLE_IMAGE_TOP_VIEW",

        multiViewEnabled:
          isMulti,

        multiViewViewCount:
          isMulti
            ? completedViewCount
            : 1,

        multiViewCaptures:
          isMulti
            ? viewCaptures
            : [],

        phoneCapture:
          imageSource ===
          "phone"
            ? phoneCapture
            : null,

        sampleWeight:
          capturedWeight,

        weightUnit: "g",

        weightCalibrated:
          true,

        physicalScore:
          physicalAssessment.score,

        qualityStatus:
          physicalAssessment.status,
      };

      onComplete(
        physicalResult,
      );
    };


  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="physical-analysis">

      <div className="physical-main-card">

        {/* ===================================================
            HEADING
        =================================================== */}

        <div className="physical-heading">

          <div>
            <span className="physical-step-label">
              STEP 02 — COMPUTER VISION
            </span>

            <h2>
              Physical AI Analysis
            </h2>

            <p>
              Choose a quick single-image inspection or an optional
              3-view inspection for broader top-surface coverage.
            </p>
          </div>


          <span className="physical-status-chip">
            {loading
              ? processingView
                ? `Analyzing View ${processingView}...`
                : "AI Processing..."
              : result
                ? "Analysis Completed"
                : analysisMode ===
                    ANALYSIS_MODES.MULTI &&
                  completedViewCount > 0
                  ? `${completedViewCount} / ${REQUIRED_VIEWS} Views Completed`
                  : imageSource ===
                      "phone" &&
                    phoneReady
                    ? "Phone Ready"
                    : "Waiting"}
          </span>

        </div>


        {/* ===================================================
            PHYSICAL ANALYSIS QUICK GUIDE
            UI guidance only - no workflow logic changed.
        =================================================== */}

        <div className="physical-quick-guide">
          <div className="physical-quick-guide-heading">
            <div>
              <span>HOW THIS STEP WORKS</span>
              <h3>Complete the physical inspection in four clear actions</h3>
            </div>

            <span className="physical-guide-note">Same coffee sample</span>
          </div>

          <div className="physical-guide-grid">
            <div className="physical-guide-item">
              <span className="physical-guide-number">01</span>
              <div>
                <strong>Measure Sample</strong>
                <p>Zero the empty tray, add beans and capture the sample weight.</p>
              </div>
            </div>

            <div className="physical-guide-item">
              <span className="physical-guide-number">02</span>
              <div>
                <strong>Choose Inspection</strong>
                <p>Use one image for a quick check or three views for broader coverage.</p>
              </div>
            </div>

            <div className="physical-guide-item">
              <span className="physical-guide-number">03</span>
              <div>
                <strong>Capture Bean Image</strong>
                <p>Take a phone photo or upload a clear top-view coffee bean image.</p>
              </div>
            </div>

            <div className="physical-guide-item">
              <span className="physical-guide-number">04</span>
              <div>
                <strong>Review AI Result</strong>
                <p>Check bean categories, defects and the physical quality score.</p>
              </div>
            </div>
          </div>
        </div>


        {/* ===================================================
            STEP 2.1 - SAMPLE WEIGHT
        =================================================== */}

        <PhysicalWeightCard
          capturedWeight={
            capturedWeight
          }
          onCaptureWeight={
            setCapturedWeight
          }
        />


        {/* ===================================================
            STEP 2.2 - ANALYSIS MODE
        =================================================== */}

        <div className="analysis-mode-card">

          <div className="analysis-mode-heading">

            <div>
              <span>
                ANALYSIS MODE
              </span>

              <h3>
                Choose Physical Inspection Method
              </h3>

              <p>
                Single Image is the default. Select Multi-View only
                when you want to inspect three different top-view
                orientations of the same coffee bean sample.
              </p>
            </div>

            <span className="analysis-mode-current">
              {analysisMode ===
              ANALYSIS_MODES.SINGLE
                ? "Default"
                : "3 Views"}
            </span>

          </div>


          <div className="analysis-mode-options">

            <button
              type="button"
              className={`analysis-mode-option ${
                analysisMode ===
                ANALYSIS_MODES.SINGLE
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleAnalysisModeChange(
                  ANALYSIS_MODES.SINGLE,
                )
              }
              disabled={
                loading
              }
            >

              <div className="analysis-mode-icon">
                1
              </div>

              <div className="analysis-mode-text">
                <strong>
                  Single Image
                </strong>

                <small>
                  Analyze one top-view image
                </small>
              </div>

              <span className="analysis-mode-badge">
                Default
              </span>

            </button>


            <button
              type="button"
              className={`analysis-mode-option ${
                analysisMode ===
                ANALYSIS_MODES.MULTI
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleAnalysisModeChange(
                  ANALYSIS_MODES.MULTI,
                )
              }
              disabled={
                loading
              }
            >

              <div className="analysis-mode-icon">
                3
              </div>

              <div className="analysis-mode-text">
                <strong>
                  Multi-View
                </strong>

                <small>
                  Analyze three top-view orientations
                </small>
              </div>

              <span className="analysis-mode-badge">
                Optional
              </span>

            </button>

          </div>

        </div>


        {/* ===================================================
            STEP 2.3 - IMAGE SOURCE
        =================================================== */}

        <div className="image-source-card">

          <div className="image-source-heading">

            <div>
              <span>
                IMAGE INPUT
              </span>

              <h3>
                Choose Image Source
              </h3>
            </div>


            <span className="image-source-status">
              {imageSource ===
              "phone"
                ? "Phone Camera"
                : "Image Upload"}
            </span>

          </div>


          <p className="image-source-description">
            {analysisMode ===
            ANALYSIS_MODES.SINGLE
              ? "Use the connected phone camera or upload one coffee bean image."
              : imageSource ===
                  "phone"
                ? "Capture three views with the phone. Change bean orientation between each capture."
                : "Upload three different top-view images first, then analyze all three with one button click."}
          </p>


          <div className="image-source-buttons">

            <button
              type="button"
              className={`image-source-button ${
                imageSource ===
                "phone"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleSourceChange(
                  "phone",
                )
              }
              disabled={
                loading
              }
            >
              <span className="source-icon">
                📱
              </span>

              <div>
                <strong>
                  Phone Camera
                </strong>

                <small>
                  USB + ADB native capture
                </small>
              </div>
            </button>


            <button
              type="button"
              className={`image-source-button ${
                imageSource ===
                "upload"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleSourceChange(
                  "upload",
                )
              }
              disabled={
                loading
              }
            >
              <span className="source-icon">
                🖼
              </span>

              <div>
                <strong>
                  Upload Image
                </strong>

                <small>
                  Select existing sample image
                </small>
              </div>
            </button>

          </div>

        </div>


        {/* ===================================================
            OPTIONAL MULTI-VIEW STATUS
        =================================================== */}

        {analysisMode ===
          ANALYSIS_MODES.MULTI && (

          <div
            className={`multi-view-card ${
              multiViewComplete
                ? "complete"
                : ""
            }`}
          >

            <div className="multi-view-heading">

              <div>
                <span>
                  MULTI-VIEW INSPECTION
                </span>

                <h3>
                  3-View Top-Surface Analysis
                </h3>

                <p>
                  Each view is analyzed independently. Raw detections
                  from different views are not added together; the
                  category counts are averaged for the final result.
                </p>
              </div>


              <button
                type="button"
                className="multi-view-reset-button"
                onClick={
                  resetMultiViewInspection
                }
                disabled={
                  loading ||
                  (completedViewCount ===
                    0 &&
                    !multiImages.some(
                      Boolean,
                    ))
                }
              >
                ↻ Restart Views
              </button>

            </div>


            <div className="multi-view-progress-grid">

              {Array.from({
                length:
                  REQUIRED_VIEWS,
              }).map(
                (_, index) => {
                  const viewNumber =
                    index + 1;

                  const completed =
                    index <
                    completedViewCount;

                  const uploaded =
                    imageSource ===
                      "upload" &&
                    Boolean(
                      multiImages[index],
                    );

                  const active =
                    imageSource ===
                      "phone" &&
                    !multiViewComplete &&
                    viewNumber ===
                      nextViewNumber;

                  return (
                    <div
                      className={`multi-view-progress-item ${
                        completed
                          ? "completed"
                          : uploaded
                            ? "uploaded"
                            : active
                              ? "active"
                              : "pending"
                      }`}
                      key={
                        viewNumber
                      }
                    >

                      <span className="multi-view-number">
                        {completed
                          ? "✓"
                          : viewNumber}
                      </span>

                      <div>
                        <strong>
                          View {viewNumber}
                        </strong>

                        <small>
                          {completed
                            ? "Analyzed"
                            : uploaded
                              ? "Image selected"
                              : active
                                ? "Ready to capture"
                                : "Waiting"}
                        </small>
                      </div>

                    </div>
                  );
                },
              )}

            </div>


            {imageSource ===
              "phone" &&
              completedViewCount >
                0 &&
              !multiViewComplete && (

              <div className="multi-view-instruction">
                <span>
                  ↔
                </span>

                <div>
                  <strong>
                    Change bean orientation before View {nextViewNumber}
                  </strong>

                  <p>
                    Gently shake the tray for about 2–3 seconds,
                    place it back in the same camera position,
                    allow the beans to settle, then capture the
                    next view.
                  </p>
                </div>
              </div>

            )}


            {multiViewComplete && (

              <div className="multi-view-complete-box">
                <strong>
                  ✓ Multi-view inspection completed
                </strong>

                <span>
                  View 1, View 2 and View 3 were analyzed
                  independently and combined using representative
                  average category counts.
                </span>
              </div>

            )}

          </div>

        )}


        {/* ===================================================
            INPUT + AI SUMMARY
        =================================================== */}

        <div className="physical-run-heading">
          <div>
            <span>CAPTURE & ANALYZE</span>
            <h3>Run the Physical AI Inspection</h3>
            <p>Prepare one clear top-view image, run the AI, then review the result beside your input.</p>
          </div>

          <span className="physical-run-status">
            {result && !loading ? "AI Result Ready" : loading ? "Analyzing..." : "Ready for Input"}
          </span>
        </div>

        <div className="physical-top-grid">

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="physical-section-card">

            {/* PHONE */}

            {imageSource ===
              "phone" && (

              <div className="phone-camera-panel">

                <div className="phone-camera-header">

                  <div>
                    <span>
                      ANDROID CAMERA
                    </span>

                    <h3>
                      Native Phone Camera
                    </h3>
                  </div>


                  <span
                    className={`phone-connection-chip ${
                      phoneStatus.connected
                        ? "connected"
                        : "disconnected"
                    }`}
                  >
                    <span className="phone-status-dot">
                    </span>

                    {checkingPhone
                      ? "Checking..."
                      : phoneStatus.connected
                        ? "Connected"
                        : "Disconnected"}
                  </span>

                </div>


                <p className="phone-camera-description">
                  {analysisMode ===
                  ANALYSIS_MODES.SINGLE
                    ? "Capture one original phone image and run the trained Physical AI models."
                    : "Capture three separate phone images. Change bean orientation manually between View 1, View 2 and View 3."}
                </p>


                <div className="phone-device-box">

                  <div className="phone-device-icon">
                    📱
                  </div>

                  <div className="phone-device-details">
                    <span>
                      CONNECTED DEVICE
                    </span>

                    <strong>
                      {phoneStatus.connected
                        ? phoneStatus.device_id
                        : "No Android Phone"}
                    </strong>

                    <small>
                      USB Debugging • Android Debug Bridge
                    </small>
                  </div>

                  {phoneStatus.connected && (
                    <div className="phone-device-check">
                      ✓
                    </div>
                  )}

                </div>


                {phoneError && (
                  <div className="phone-camera-error">
                    {phoneError}
                  </div>
                )}


                <button
                  type="button"
                  className="refresh-phone-button"
                  onClick={
                    checkPhoneStatus
                  }
                  disabled={
                    checkingPhone ||
                    loading
                  }
                >
                  {checkingPhone
                    ? "Checking Phone..."
                    : "↻ Refresh Phone Connection"}
                </button>


                {phoneCapture && (
                  <div className="phone-capture-success">

                    <div className="capture-success-heading">
                      <span>
                        {analysisMode ===
                        ANALYSIS_MODES.MULTI
                          ? `VIEW ${completedViewCount} CAPTURED`
                          : "PHOTO CAPTURED"}
                      </span>

                      <strong>
                        ✓ Success
                      </strong>
                    </div>

                    <div className="capture-meta-row">
                      <span>
                        File
                      </span>

                      <strong>
                        {
                          phoneCapture.phone_filename
                        }
                      </strong>
                    </div>

                    {phoneCapture
                      .file_size_bytes && (
                      <div className="capture-meta-row">
                        <span>
                          Size
                        </span>

                        <strong>
                          {(
                            phoneCapture.file_size_bytes /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </strong>
                      </div>
                    )}

                  </div>
                )}


                <button
                  type="button"
                  className="phone-capture-button"
                  onClick={
                    handlePredict
                  }
                  disabled={
                    !phoneReady ||
                    loading ||
                    (analysisMode ===
                      ANALYSIS_MODES.MULTI &&
                      multiViewComplete)
                  }
                >

                  {loading ? (
                    <>
                      <span className="physical-spinner">
                      </span>

                      {analysisMode ===
                      ANALYSIS_MODES.MULTI
                        ? `Capturing & Analyzing View ${processingView || nextViewNumber}...`
                        : "Capturing & Analyzing..."}
                    </>
                  ) : !phoneStatus.connected ? (
                    <>
                      📱 Connect Android Phone
                    </>
                  ) : analysisMode ===
                      ANALYSIS_MODES.MULTI &&
                    multiViewComplete ? (
                    <>
                      ✓ 3 Views Completed
                    </>
                  ) : analysisMode ===
                    ANALYSIS_MODES.MULTI ? (
                    <>
                      📸 Capture & Analyze View {nextViewNumber} / {REQUIRED_VIEWS}
                    </>
                  ) : (
                    <>
                      📸 Capture & Analyze Single Image
                    </>
                  )}

                </button>

              </div>

            )}


            {/* UPLOAD - SINGLE */}

            {imageSource ===
              "upload" &&
              analysisMode ===
                ANALYSIS_MODES.SINGLE && (

              <>

                <ImageUploader
                  selectedImage={
                    selectedImage
                  }
                  preview={
                    preview
                  }
                  dragActive={
                    dragActive
                  }
                  onImageChange={
                    handleImageChange
                  }
                  onDragOver={
                    handleDragOver
                  }
                  onDragLeave={
                    handleDragLeave
                  }
                  onDrop={
                    handleDrop
                  }
                />


                <button
                  type="button"
                  className="run-ai-button"
                  onClick={
                    handlePredict
                  }
                  disabled={
                    !selectedImage ||
                    loading
                  }
                >
                  {loading ? (
                    <>
                      <span className="physical-spinner">
                      </span>

                      AI is Analyzing...
                    </>
                  ) : !selectedImage ? (
                    <>
                      🖼 Upload Bean Image
                    </>
                  ) : (
                    <>
                      ⚡ Analyze Single Image
                    </>
                  )}
                </button>

              </>

            )}


            {/* UPLOAD - MULTI */}

            {imageSource ===
              "upload" &&
              analysisMode ===
                ANALYSIS_MODES.MULTI && (

              <div className="multi-upload-panel">

                <div className="multi-upload-intro">
                  <span>
                    THREE IMAGE INPUTS
                  </span>

                  <h3>
                    Upload View 1, View 2 and View 3
                  </h3>

                  <p>
                    Select all three images first. Then click
                    Analyze All 3 Views once.
                  </p>
                </div>


                <div className="multi-upload-grid">

                  {Array.from({
                    length:
                      REQUIRED_VIEWS,
                  }).map(
                    (_, index) => (

                      <div
                        className="multi-upload-item"
                        key={`upload-view-${index + 1}`}
                      >

                        <div className="multi-upload-label">
                          <strong>
                            View {index + 1}
                          </strong>

                          <span>
                            {multiImages[index]
                              ? "✓ Selected"
                              : "Required"}
                          </span>
                        </div>


                        <ImageUploader
                          selectedImage={
                            multiImages[index]
                          }
                          preview={
                            multiPreviews[index]
                          }
                          dragActive={
                            multiDragActive[index]
                          }
                          onImageChange={(
                            event,
                          ) =>
                            handleMultiImageChange(
                              index,
                              event,
                            )
                          }
                          onDragOver={(
                            event,
                          ) =>
                            handleMultiDragOver(
                              index,
                              event,
                            )
                          }
                          onDragLeave={() =>
                            handleMultiDragLeave(
                              index,
                            )
                          }
                          onDrop={(
                            event,
                          ) =>
                            handleMultiDrop(
                              index,
                              event,
                            )
                          }
                        />

                      </div>

                    ),
                  )}

                </div>


                <button
                  type="button"
                  className="run-ai-button"
                  onClick={
                    handlePredict
                  }
                  disabled={
                    !allMultiImagesSelected ||
                    loading
                  }
                >
                  {loading ? (
                    <>
                      <span className="physical-spinner">
                      </span>

                      Analyzing View {processingView || 1} / {REQUIRED_VIEWS}...
                    </>
                  ) : !allMultiImagesSelected ? (
                    <>
                      🖼 Upload All 3 Views First
                    </>
                  ) : (
                    <>
                      ⚡ Analyze All 3 Views
                    </>
                  )}
                </button>

              </div>

            )}

          </div>


          {/* =================================================
              AI SUMMARY
          ================================================= */}

          <div className="physical-section-card">

            {!result &&
              !loading && (

              <div className="physical-waiting-state">

                <div className="physical-ai-icon">
                  AI
                </div>

                <h3>
                  {analysisMode ===
                  ANALYSIS_MODES.SINGLE
                    ? "Ready for Single Image Analysis"
                    : imageSource ===
                        "phone" &&
                      completedViewCount >
                        0
                      ? `Prepare View ${nextViewNumber}`
                      : "Ready for Multi-View Analysis"}
                </h3>

                <p>
                  {analysisMode ===
                  ANALYSIS_MODES.SINGLE
                    ? "Analyze one top-view image to generate the physical quality result."
                    : imageSource ===
                        "phone"
                      ? completedViewCount >
                        0
                        ? `View ${completedViewCount} is complete. Change bean orientation and capture View ${nextViewNumber}.`
                        : "Capture View 1, then change bean orientation before each next view."
                      : "Upload all three top-view images and click Analyze All 3 Views."}
                </p>

              </div>

            )}


            {loading && (

              <div className="physical-loading-state">

                <div className="physical-scanner">
                  <div className="physical-scan-line">
                  </div>
                </div>

                <h3>
                  {analysisMode ===
                  ANALYSIS_MODES.MULTI
                    ? `Analyzing View ${processingView || nextViewNumber}`
                    : "Analyzing Physical Quality"}
                </h3>

                <p>
                  The AI pipeline is detecting coffee beans and
                  analyzing their color and shape.
                </p>

              </div>

            )}


            {result &&
              !loading && (

              <div className="final-result-summary">

                <div className="final-result-summary-heading">
                  <span>
                    {analysisMode ===
                    ANALYSIS_MODES.MULTI
                      ? "FINAL MULTI-VIEW RESULT"
                      : "SINGLE IMAGE RESULT"}
                  </span>

                  <h3>
                    {analysisMode ===
                    ANALYSIS_MODES.MULTI
                      ? "Representative 3-View Average"
                      : "Physical AI Result"}
                  </h3>

                  <p>
                    {analysisMode ===
                    ANALYSIS_MODES.MULTI
                      ? "The category counts below are the representative average of the three independently analyzed views."
                      : "The category counts below were calculated from the selected single image."}
                  </p>
                </div>


                <DetectionSummary
                  result={
                    result
                  }
                />

              </div>

            )}

          </div>

        </div>


        {/* ===================================================
            SINGLE ANNOTATED IMAGE
        =================================================== */}

        {analysisMode ===
          ANALYSIS_MODES.SINGLE &&
          result &&
          !loading &&
          result
            .predicted_image_url && (

          <div className="single-image-result-section">

            <div className="section-title-row">
              <div>
                <span>
                  ANNOTATED AI RESULT
                </span>

                <h3>
                  Single Image Detection
                </h3>
              </div>
            </div>


            <div className="physical-section-card">
              <DetectionResultImage
                imageUrl={
                  getPredictionImageUrl(
                    result.predicted_image_url,
                  )
                }
              />
            </div>

          </div>

        )}


        {/* ===================================================
            INDIVIDUAL MULTI-VIEW RESULTS
            (after image input, before physical assessment)
        =================================================== */}

        {analysisMode ===
          ANALYSIS_MODES.MULTI &&
          completedViewCount >
            0 && (

          <div className="individual-view-results-section">

            <div className="individual-view-results-heading">

              <div>
                <span>
                  INDIVIDUAL VIEW RESULTS
                </span>

                <h3>
                  Independent Physical AI Results
                </h3>

                <p>
                  Each top-view image is shown separately because
                  bean positions can change between View 1, View 2
                  and View 3.
                </p>
              </div>


              <span className="individual-view-count-chip">
                {completedViewCount} / {REQUIRED_VIEWS} Completed
              </span>

            </div>


            <div className="individual-view-results-grid">

              {viewResults.map(
                (
                  viewResult,
                  index,
                ) => {
                  const counts =
                    getResultCounts(
                      viewResult,
                    );

                  const assessment =
                    calculatePhysicalAssessment(
                      viewResult,
                    );

                  return (

                    <div
                      className="individual-view-result-card"
                      key={`physical-view-${index + 1}`}
                    >

                      <div className="individual-view-result-header">

                        <div>
                          <span>
                            VIEW {index + 1}
                          </span>

                          <h4>
                            Top-Surface Inspection
                          </h4>
                        </div>


                        <span className="individual-view-status">
                          {assessment.status}
                        </span>

                      </div>


                      <div className="individual-view-image-wrapper">

                        <div className="individual-view-image-label">
                          Annotated AI Image — View {index + 1}
                        </div>

                        {viewResult
                          ?.predicted_image_url ? (

                          <DetectionResultImage
                            imageUrl={
                              getPredictionImageUrl(
                                viewResult
                                  .predicted_image_url,
                              )
                            }
                          />

                        ) : (

                          <div className="individual-view-image-missing">
                            Annotated image is not available for this view.
                          </div>

                        )}

                      </div>


                      <div className="individual-view-category-grid">

                        <div className="individual-view-category-item">
                          <span>
                            Good
                          </span>

                          <strong>
                            {counts.good}
                          </strong>
                        </div>


                        <div className="individual-view-category-item">
                          <span>
                            Broken
                          </span>

                          <strong>
                            {counts.broken}
                          </strong>
                        </div>


                        <div className="individual-view-category-item">
                          <span>
                            Black
                          </span>

                          <strong>
                            {counts.black}
                          </strong>
                        </div>


                        <div className="individual-view-category-item">
                          <span>
                            Black + Broken
                          </span>

                          <strong>
                            {counts.blackAndBroken}
                          </strong>
                        </div>

                      </div>


                      <div className="individual-view-metrics">

                        <div>
                          <span>
                            Total Beans
                          </span>

                          <strong>
                            {counts.total}
                          </strong>
                        </div>


                        <div>
                          <span>
                            Physical Score
                          </span>

                          <strong>
                            {assessment.score.toFixed(
                              2,
                            )}
                            <small>
                              /100
                            </small>
                          </strong>
                        </div>


                        <div>
                          <span>
                            Defect Load
                          </span>

                          <strong>
                            {assessment.defectLoadPercent.toFixed(
                              2,
                            )}
                            %
                          </strong>
                        </div>

                      </div>

                    </div>

                  );
                },
              )}

            </div>


            {multiViewComplete && (

              <div className="final-multi-view-note">
                <strong>
                  Final result combines numbers, not annotated images.
                </strong>

                <span>
                  View 1, View 2 and View 3 have separate annotated
                  images. The final multi-view result uses averaged
                  category counts and the resulting physical score.
                </span>
              </div>

            )}

          </div>

        )}


        {/* ===================================================
            PHYSICAL QUALITY ASSESSMENT
        =================================================== */}

        {result &&
          !loading && (

          <div
            className={`physical-quality-card physical-quality-${physicalAssessment.status
              .toLowerCase()
              .replace(
                /\s+/g,
                "-",
              )}`}
          >

            <div className="physical-quality-heading">

              <div>
                <span>
                  PHYSICAL QUALITY ASSESSMENT
                </span>

                <h3>
                  {analysisMode ===
                  ANALYSIS_MODES.MULTI
                    ? "Final Multi-View Physical Quality"
                    : "Single Image Physical Quality"}
                </h3>

                <p>
                  {analysisMode ===
                  ANALYSIS_MODES.MULTI
                    ? "Weighted physical defect severity calculated from the representative average counts across three views."
                    : "Weighted physical defect severity calculated from the AI-detected bean categories in the single image."}
                </p>
              </div>


              <span className="physical-quality-status">
                {physicalAssessment.status}
              </span>

            </div>


            <div className="physical-quality-grid">

              <div className="physical-score-main">
                <span className="physical-score-label">
                  {analysisMode ===
                  ANALYSIS_MODES.MULTI
                    ? "Multi-View Physical Score"
                    : "Physical Quality Score"}
                </span>

                <div className="physical-score-value">
                  <strong>
                    {physicalAssessment.score.toFixed(
                      2,
                    )}
                  </strong>

                  <span>
                    / 100
                  </span>
                </div>
              </div>


              <div className="physical-score-detail">
                <span>
                  Quality Status
                </span>

                <strong>
                  {physicalAssessment.status}
                </strong>
              </div>


              <div className="physical-score-detail">
                <span>
                  Weighted Defect Load
                </span>

                <strong>
                  {physicalAssessment.weightedDefects}
                </strong>
              </div>


              <div className="physical-score-detail">
                <span>
                  Defect Load
                </span>

                <strong>
                  {physicalAssessment.defectLoadPercent.toFixed(
                    2,
                  )}
                  %
                </strong>
              </div>

            </div>

          </div>

        )}


        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="physical-actions">

          <button
            type="button"
            className="physical-back-button"
            onClick={
              onBack
            }
          >
            ← Back to Sensor Analysis
          </button>


          <button
            type="button"
            className="physical-continue-button"
            disabled={
              !result ||
              loading
            }
            onClick={
              handleContinue
            }
          >
            Generate Final Quality Report →
          </button>

        </div>

      </div>


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        .physical-analysis {
          margin-top: 30px;
        }

        .physical-main-card {
          padding: 28px;
          border-radius: 28px;
          border: 1px solid rgba(255, 222, 178, 0.15);
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.095),
              rgba(255,255,255,0.035)
            ),
            rgba(39,22,13,0.78);
          backdrop-filter: blur(20px);
          box-shadow:
            0 25px 70px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .physical-heading,
        .analysis-mode-heading,
        .image-source-heading,
        .multi-view-heading,
        .phone-camera-header,
        .individual-view-results-heading,
        .physical-quality-heading,
        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
        }

        .physical-heading {
          margin-bottom: 24px;
        }

        .physical-step-label,
        .analysis-mode-heading > div > span,
        .image-source-heading > div > span,
        .multi-view-heading > div > span,
        .phone-camera-header > div > span,
        .individual-view-results-heading > div > span,
        .physical-quality-heading > div > span,
        .section-title-row > div > span,
        .multi-upload-intro > span,
        .final-result-summary-heading > span {
          display: block;
          margin-bottom: 6px;
          color: #dca05e;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .physical-step-label {
          font-size: 11px;
          letter-spacing: 1.7px;
        }

        .physical-heading h2 {
          margin: 0;
          color: #fff3e1;
          font-size: 28px;
        }

        .physical-heading p,
        .analysis-mode-heading p,
        .image-source-description,
        .multi-view-heading p,
        .phone-camera-description,
        .individual-view-results-heading p,
        .physical-quality-heading p,
        .multi-upload-intro p,
        .final-result-summary-heading p {
          margin: 7px 0 0;
          color: rgba(255,238,212,0.48);
          font-size: 11px;
          line-height: 1.6;
        }

        .physical-heading p {
          max-width: 700px;
          font-size: 14px;
        }

        .physical-status-chip,
        .analysis-mode-current,
        .image-source-status,
        .individual-view-count-chip {
          flex-shrink: 0;
          padding: 7px 11px;
          border-radius: 999px;
          color: #ffd59a;
          background: rgba(255,213,154,0.08);
          border: 1px solid rgba(255,213,154,0.14);
          font-size: 10px;
          font-weight: 850;
        }

        .analysis-mode-card,
        .image-source-card,
        .multi-view-card,
        .physical-section-card,
        .individual-view-results-section,
        .physical-quality-card,
        .single-image-result-section {
          margin-top: 18px;
          padding: 20px;
          border-radius: 22px;
          background: rgba(0,0,0,0.14);
          border: 1px solid rgba(255,220,170,0.09);
        }

        .analysis-mode-heading h3,
        .image-source-heading h3,
        .multi-view-heading h3,
        .phone-camera-header h3,
        .individual-view-results-heading h3,
        .physical-quality-heading h3,
        .section-title-row h3,
        .multi-upload-intro h3,
        .final-result-summary-heading h3 {
          margin: 0;
          color: #fff1db;
          font-size: 18px;
        }

        .analysis-mode-options,
        .image-source-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        .analysis-mode-option,
        .image-source-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border-radius: 15px;
          text-align: left;
          color: rgba(255,236,207,0.68);
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,220,170,0.09);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .analysis-mode-option:hover,
        .image-source-button:hover {
          transform: translateY(-1px);
          border-color: rgba(255,206,138,0.25);
        }

        .analysis-mode-option.active,
        .image-source-button.active {
          color: #2b170c;
          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d38a46,
              #a35a30
            );
          border-color: transparent;
        }

        .analysis-mode-option:disabled,
        .image-source-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .analysis-mode-icon,
        .source-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(255,255,255,0.09);
          font-size: 18px;
          font-weight: 950;
        }

        .analysis-mode-text {
          min-width: 0;
          flex: 1;
        }

        .analysis-mode-option strong,
        .image-source-button strong {
          display: block;
          margin-bottom: 3px;
          font-size: 12px;
          font-weight: 900;
        }

        .analysis-mode-option small,
        .image-source-button small {
          display: block;
          opacity: 0.68;
          font-size: 9px;
        }

        .analysis-mode-badge {
          margin-left: auto;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
          background: rgba(255,255,255,0.12);
        }

        .multi-view-card.complete {
          border-color: rgba(92,199,105,0.2);
        }

        .multi-view-reset-button,
        .refresh-phone-button {
          padding: 9px 12px;
          border-radius: 12px;
          color: #ffdeb0;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,220,170,0.1);
          font-size: 10px;
          font-weight: 850;
          cursor: pointer;
        }

        .multi-view-reset-button:disabled,
        .refresh-phone-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .multi-view-progress-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
          margin-top: 16px;
        }

        .multi-view-progress-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-radius: 14px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,220,170,0.08);
        }

        .multi-view-progress-item.completed {
          border-color: rgba(92,199,105,0.18);
        }

        .multi-view-progress-item.active,
        .multi-view-progress-item.uploaded {
          border-color: rgba(255,202,124,0.24);
        }

        .multi-view-number {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #2b170c;
          background: #e1a15e;
          font-size: 10px;
          font-weight: 950;
        }

        .multi-view-progress-item strong {
          display: block;
          color: #ffe5bf;
          font-size: 10px;
        }

        .multi-view-progress-item small {
          display: block;
          margin-top: 2px;
          color: rgba(255,238,212,0.42);
          font-size: 8px;
        }

        .multi-view-instruction,
        .multi-view-complete-box,
        .final-multi-view-note {
          margin-top: 14px;
          padding: 13px;
          border-radius: 14px;
          background: rgba(255,190,104,0.07);
          border: 1px solid rgba(255,190,104,0.12);
        }

        .multi-view-instruction {
          display: flex;
          gap: 10px;
        }

        .multi-view-instruction > span {
          font-size: 20px;
        }

        .multi-view-instruction strong,
        .multi-view-complete-box strong,
        .final-multi-view-note strong {
          display: block;
          color: #ffd79e;
          font-size: 10px;
        }

        .multi-view-instruction p,
        .multi-view-complete-box span,
        .final-multi-view-note span {
          display: block;
          margin: 4px 0 0;
          color: rgba(255,238,212,0.48);
          font-size: 9px;
          line-height: 1.55;
        }

        .physical-top-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 18px;
        }

        .phone-camera-description {
          margin-bottom: 15px;
        }

        .phone-connection-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 850;
        }

        .phone-connection-chip.connected {
          color: #a4e9ac;
          background: rgba(76,167,90,0.09);
          border: 1px solid rgba(76,167,90,0.15);
        }

        .phone-connection-chip.disconnected {
          color: #ffad96;
          background: rgba(196,69,47,0.08);
          border: 1px solid rgba(196,69,47,0.13);
        }

        .phone-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .phone-device-box {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border-radius: 16px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,220,170,0.09);
        }

        .phone-device-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: rgba(255,210,147,0.1);
          font-size: 23px;
        }

        .phone-device-details {
          min-width: 0;
          flex: 1;
        }

        .phone-device-details span {
          display: block;
          color: rgba(255,232,198,0.4);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .phone-device-details strong {
          display: block;
          margin-top: 3px;
          color: #ffe6c1;
          font-size: 13px;
          word-break: break-word;
        }

        .phone-device-details small {
          display: block;
          margin-top: 4px;
          color: rgba(255,238,212,0.35);
          font-size: 8px;
        }

        .phone-device-check {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #203021;
          background: #9ce0a6;
          font-size: 13px;
          font-weight: 950;
        }

        .phone-camera-error {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          color: #ffad96;
          background: rgba(196,69,47,0.08);
          border: 1px solid rgba(196,69,47,0.13);
          font-size: 10px;
        }

        .refresh-phone-button {
          width: 100%;
          margin-top: 12px;
        }

        .phone-capture-success {
          margin-top: 13px;
          padding: 13px;
          border-radius: 14px;
          background: rgba(80,170,92,0.07);
          border: 1px solid rgba(80,170,92,0.13);
        }

        .capture-success-heading,
        .capture-meta-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .capture-success-heading {
          margin-bottom: 8px;
        }

        .capture-success-heading span,
        .capture-success-heading strong {
          color: #a5e7ac;
          font-size: 8px;
          font-weight: 900;
        }

        .capture-meta-row {
          padding: 4px 0;
          color: rgba(255,238,212,0.42);
          font-size: 9px;
        }

        .capture-meta-row strong {
          color: #e9d6b8;
          text-align: right;
          word-break: break-all;
        }

        .phone-capture-button,
        .run-ai-button {
          width: 100%;
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 16px;
          border: none;
          border-radius: 14px;
          color: #2b170c;
          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d38a46,
              #9e572f
            );
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .phone-capture-button:disabled,
        .run-ai-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .multi-upload-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 12px;
          margin-top: 15px;
        }

        .multi-upload-item {
          padding: 10px;
          border-radius: 16px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,220,170,0.08);
        }

        .multi-upload-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .multi-upload-label strong {
          color: #ffe3bb;
          font-size: 10px;
        }

        .multi-upload-label span {
          color: #dca05e;
          font-size: 8px;
          font-weight: 850;
        }

        .physical-waiting-state,
        .physical-loading-state {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .physical-ai-icon {
          width: 74px;
          height: 74px;
          display: grid;
          place-items: center;
          border-radius: 22px;
          color: #2b170c;
          background:
            linear-gradient(
              135deg,
              #ffe0a4,
              #ca7d3e
            );
          font-weight: 950;
        }

        .physical-waiting-state h3,
        .physical-loading-state h3 {
          margin: 16px 0 7px;
          color: #fff1db;
        }

        .physical-waiting-state p,
        .physical-loading-state p {
          max-width: 360px;
          margin: 0;
          color: rgba(255,238,212,0.46);
          font-size: 12px;
          line-height: 1.6;
        }

        .physical-scanner {
          width: 170px;
          height: 110px;
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(255,213,154,0.16);
          background: rgba(255,255,255,0.03);
        }

        .physical-scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #ffd18a,
              transparent
            );
          box-shadow: 0 0 18px #ffd18a;
          animation:
            physicalScan
            1.4s
            ease-in-out
            infinite;
        }

        .physical-spinner {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid rgba(42,22,11,0.25);
          border-top-color: #2a160b;
          animation:
            physicalSpin
            0.7s
            linear
            infinite;
        }

        .single-image-result-section {
          padding: 0;
          background: transparent;
          border: none;
        }

        .section-title-row {
          margin-bottom: 10px;
        }

        .individual-view-results-section {
          margin-top: 18px;
        }

        .individual-view-results-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 14px;
          margin-top: 16px;
        }

        .individual-view-result-card {
          min-width: 0;
          padding: 14px;
          border-radius: 17px;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,220,170,0.08);
        }

        .individual-view-result-header {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
        }

        .individual-view-result-header > div > span {
          color: #dca05e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .individual-view-result-header h4 {
          margin: 4px 0 0;
          color: #fff0da;
          font-size: 13px;
        }

        .individual-view-status {
          padding: 5px 8px;
          border-radius: 999px;
          color: #ffd59a;
          background: rgba(255,213,154,0.08);
          border: 1px solid rgba(255,213,154,0.14);
          font-size: 8px;
          font-weight: 900;
        }

        .individual-view-image-wrapper {
          margin-top: 12px;
        }

        .individual-view-image-label {
          margin-bottom: 7px;
          color: rgba(255,235,207,0.48);
          font-size: 8px;
          font-weight: 800;
        }

        .individual-view-image-missing {
          padding: 24px 10px;
          text-align: center;
          border-radius: 12px;
          color: rgba(255,238,212,0.4);
          background: rgba(255,255,255,0.025);
          font-size: 9px;
        }

        .individual-view-category-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .individual-view-category-item {
          padding: 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.035);
        }

        .individual-view-category-item span,
        .individual-view-metrics span {
          display: block;
          color: rgba(255,235,207,0.44);
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .individual-view-category-item strong {
          display: block;
          margin-top: 5px;
          color: #ffe1b7;
          font-size: 16px;
        }

        .individual-view-metrics {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 7px;
          margin-top: 8px;
        }

        .individual-view-metrics > div {
          padding: 9px;
          border-radius: 11px;
          background: rgba(255,255,255,0.025);
        }

        .individual-view-metrics strong {
          display: block;
          margin-top: 5px;
          color: #ffe1b7;
          font-size: 12px;
        }

        .individual-view-metrics small {
          font-size: 8px;
        }

        .final-result-summary {
          width: 100%;
        }

        .final-result-summary-heading {
          margin-bottom: 14px;
        }

        .physical-quality-card {
          margin-top: 18px;
        }

        .physical-quality-grid {
          display: grid;
          grid-template-columns:
            1.25fr
            1fr
            1fr
            1fr;
          gap: 12px;
          margin-top: 18px;
        }

        .physical-score-main,
        .physical-score-detail {
          padding: 16px;
          border-radius: 16px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,220,170,0.08);
        }

        .physical-score-label,
        .physical-score-detail span {
          display: block;
          color: rgba(255,235,207,0.44);
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .physical-score-value {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          margin-top: 10px;
        }

        .physical-score-value strong {
          color: #fff2dd;
          font-size: 30px;
          line-height: 1;
          font-weight: 950;
        }

        .physical-score-value span {
          color: rgba(255,235,207,0.45);
          font-size: 11px;
          padding-bottom: 3px;
        }

        .physical-score-detail strong {
          display: block;
          margin-top: 10px;
          color: #ffe1b7;
          font-size: 16px;
        }

        .physical-quality-status {
          flex-shrink: 0;
          padding: 8px 12px;
          border-radius: 999px;
          color: #ffd59a;
          background: rgba(255,213,154,0.08);
          border: 1px solid rgba(255,213,154,0.14);
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .physical-quality-excellent
        .physical-quality-status,
        .physical-quality-good
        .physical-quality-status {
          color: #9ee7a8;
          background: rgba(62,167,76,0.11);
          border-color: rgba(92,199,105,0.18);
        }

        .physical-quality-review
        .physical-quality-status {
          color: #ffd18c;
          background: rgba(215,145,52,0.1);
          border-color: rgba(229,160,69,0.16);
        }

        .physical-quality-poor
        .physical-quality-status {
          color: #ffad96;
          background: rgba(196,69,47,0.09);
          border-color: rgba(196,69,47,0.15);
        }

        .physical-actions {
          margin-top: 25px;
          padding-top: 22px;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          border-top: 1px solid rgba(255,221,177,0.09);
        }

        .physical-back-button,
        .physical-continue-button {
          padding: 13px 18px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .physical-back-button {
          color: #ffe0b5;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,220,170,0.11);
        }

        .physical-continue-button {
          border: none;
          color: #2a160b;
          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d38a46,
              #9e572f
            );
        }

        .physical-continue-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @keyframes physicalSpin {
          to {
            transform:
              rotate(360deg);
          }
        }

        @keyframes physicalScan {
          0% {
            top: 0;
          }

          50% {
            top:
              calc(
                100% - 3px
              );
          }

          100% {
            top: 0;
          }
        }

        @media (
          max-width: 1100px
        ) {
          .multi-upload-grid,
          .individual-view-results-grid {
            grid-template-columns:
              1fr;
          }
        }

        @media (
          max-width: 900px
        ) {
          .physical-top-grid,
          .physical-quality-grid,
          .multi-view-progress-grid {
            grid-template-columns:
              1fr;
          }
        }

        @media (
          max-width: 620px
        ) {
          .physical-main-card {
            padding: 18px;
          }

          .physical-heading,
          .analysis-mode-heading,
          .image-source-heading,
          .multi-view-heading,
          .phone-camera-header,
          .individual-view-results-heading,
          .physical-quality-heading,
          .physical-actions {
            flex-direction:
              column;
          }

          .analysis-mode-options,
          .image-source-buttons,
          .individual-view-category-grid,
          .individual-view-metrics {
            grid-template-columns:
              1fr;
          }

          .physical-back-button,
          .physical-continue-button {
            width: 100%;
          }
        }

      `}</style>

    </section>
  );
}


export default PhysicalAnalysis;
