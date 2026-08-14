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
import DetectionTable from "./DetectionTable";

import PhysicalWeightCard from "./PhysicalWeightCard";


function PhysicalAnalysis({
  onComplete,
  onBack,
}) {
  // =========================================================
  // IMAGE SOURCE
  // =========================================================
  //
  // phone  = Native phone camera through USB + ADB
  // upload = Existing image upload
  // =========================================================

  const [
    imageSource,
    setImageSource,
  ] = useState("phone");


  // =========================================================
  // UPLOAD IMAGE
  // =========================================================

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);


  // =========================================================
  // UPLOAD PREVIEW
  // =========================================================

  const [
    preview,
    setPreview,
  ] = useState(null);


  // =========================================================
  // DRAG STATE
  // =========================================================

  const [
    dragActive,
    setDragActive,
  ] = useState(false);


  // =========================================================
  // PHYSICAL AI RESULT
  // =========================================================

  const [
    result,
    setResult,
  ] = useState(null);


  // =========================================================
  // AI LOADING
  // =========================================================

  const [
    loading,
    setLoading,
  ] = useState(false);


  // =========================================================
  // LOAD CELL WEIGHT
  // =========================================================

  const [
    capturedWeight,
    setCapturedWeight,
  ] = useState(null);


  // =========================================================
  // PHONE CAMERA STATES
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
  // API URL
  // =========================================================

  const API_URL =
    import.meta.env.VITE_API_URL || "";


  // =========================================================
  // PREDICTION IMAGE URL
  // =========================================================

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
  // CHECK PHONE CAMERA / ADB CONNECTION
  // =========================================================

  const checkPhoneStatus =
    async () => {
      try {
        setCheckingPhone(
          true,
        );

        setPhoneError("");


        const data =
          await getPhoneCameraStatus();


        setPhoneStatus(
          data,
        );


        if (
          !data.connected
        ) {
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
          error.response?.status !==
          401
        ) {
          setPhoneError(
            "Unable to check the phone camera connection.",
          );
        }

      } finally {
        setCheckingPhone(
          false,
        );
      }
    };


  // =========================================================
  // CHECK PHONE WHEN PHONE SOURCE IS SELECTED
  // =========================================================

  useEffect(() => {
    if (
      imageSource ===
      "phone"
    ) {
      checkPhoneStatus();
    }
  }, [imageSource]);


  // =========================================================
  // CHANGE IMAGE SOURCE
  // =========================================================

  const handleSourceChange = (
    source,
  ) => {
    if (
      source ===
      imageSource
    ) {
      return;
    }


    // ---------------------------------------------------------
    // REMOVE OLD UPLOAD PREVIEW
    // ---------------------------------------------------------

    if (preview) {
      URL.revokeObjectURL(
        preview,
      );
    }


    // ---------------------------------------------------------
    // RESET CURRENT INPUT / AI RESULT
    // ---------------------------------------------------------

    setImageSource(
      source,
    );

    setSelectedImage(
      null,
    );

    setPreview(
      null,
    );

    setDragActive(
      false,
    );

    setResult(
      null,
    );

    setPhoneCapture(
      null,
    );

    setPhoneError("");
  };


  // =========================================================
  // HANDLE UPLOADED IMAGE
  // =========================================================

  const handleFile = (
    file,
  ) => {
    if (!file) {
      return;
    }


    // ---------------------------------------------------------
    // VALIDATE IMAGE
    // ---------------------------------------------------------

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


    // ---------------------------------------------------------
    // REMOVE OLD PREVIEW
    // ---------------------------------------------------------

    if (preview) {
      URL.revokeObjectURL(
        preview,
      );
    }


    // ---------------------------------------------------------
    // SAVE IMAGE
    // ---------------------------------------------------------

    setSelectedImage(
      file,
    );


    setPreview(
      URL.createObjectURL(
        file,
      ),
    );


    // ---------------------------------------------------------
    // RESET OLD RESULT
    // ---------------------------------------------------------

    setResult(
      null,
    );
  };


  // =========================================================
  // IMAGE INPUT CHANGE
  // =========================================================

  const handleImageChange = (
    event,
  ) => {
    handleFile(
      event.target.files?.[0],
    );
  };


  // =========================================================
  // DRAG OVER
  // =========================================================

  const handleDragOver = (
    event,
  ) => {
    event.preventDefault();

    setDragActive(
      true,
    );
  };


  // =========================================================
  // DRAG LEAVE
  // =========================================================

  const handleDragLeave =
    () => {
      setDragActive(
        false,
      );
    };


  // =========================================================
  // DROP IMAGE
  // =========================================================

  const handleDrop = (
    event,
  ) => {
    event.preventDefault();


    setDragActive(
      false,
    );


    handleFile(
      event.dataTransfer
        .files?.[0],
    );
  };


  // =========================================================
  // PHONE CAPTURE + AI ANALYSIS
  // =========================================================

  const handlePhoneCaptureAnalyze =
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
        setLoading(
          true,
        );

        setResult(
          null,
        );

        setPhoneCapture(
          null,
        );

        setPhoneError("");


        // =====================================================
        // BACKEND FLOW
        //
        // ADB
        // ↓
        // Native Samsung Camera
        // ↓
        // Capture JPG
        // ↓
        // Find latest photo
        // ↓
        // adb pull
        // ↓
        // Detector
        // ↓
        // Color classifier
        // ↓
        // Shape classifier
        // =====================================================

        const data =
          await captureAndAnalyzePhonePhoto();


        setPhoneCapture(
          data.capture,
        );


        setResult(
          data.result,
        );

      } catch (error) {
        console.error(
          "Phone capture + AI failed:",
          error,
        );


        if (
          error.response?.status !==
          401
        ) {
          const message =
            error.response
              ?.data
              ?.detail ||
            "Phone camera capture or Physical AI analysis failed.";


          setPhoneError(
            message,
          );


          alert(
            message,
          );
        }

      } finally {
        setLoading(
          false,
        );
      }
    };


  // =========================================================
  // UPLOADED IMAGE AI ANALYSIS
  // =========================================================

  const handleUploadPredict =
    async () => {
      if (
        !selectedImage
      ) {
        alert(
          "Please upload a coffee bean sample image first.",
        );

        return;
      }


      try {
        setLoading(
          true,
        );

        setResult(
          null,
        );


        const data =
          await predictBeanDefects(
            selectedImage,
          );


        setResult(
          data.result,
        );

      } catch (error) {
        console.error(
          "Physical analysis failed:",
          error,
        );


        if (
          error.response?.status !==
          401
        ) {
          alert(
            "Physical AI analysis failed. Please check the backend and try again.",
          );
        }

      } finally {
        setLoading(
          false,
        );
      }
    };


  // =========================================================
  // RUN AI BASED ON CURRENT IMAGE SOURCE
  // =========================================================

  const handlePredict =
    async () => {
      // =======================================================
      // TEMPORARY WEIGHT BYPASS
      //
      // Arduino currently disconnected.
      //
      // Later enable:
      //
      // if (
      //   capturedWeight === null ||
      //   capturedWeight === undefined
      // ) {
      //   alert(
      //     "Please capture the sample weight first."
      //   );
      //   return;
      // }
      // =======================================================


      if (
        imageSource ===
        "phone"
      ) {
        await handlePhoneCaptureAnalyze();

        return;
      }


      await handleUploadPredict();
    };


  // =========================================================
  // CONTINUE TO FINAL REPORT
  // =========================================================

  const handleContinue =
    () => {
      if (!result) {
        return;
      }


      const physicalResult = {
        // -------------------------------------------------------
        // COMPLETE AI RESULT
        // -------------------------------------------------------

        ...result,


        // -------------------------------------------------------
        // IMAGE SOURCE
        // -------------------------------------------------------

        imageSource:
          imageSource,


        // -------------------------------------------------------
        // PHONE CAPTURE METADATA
        // -------------------------------------------------------

        phoneCapture:
          imageSource ===
          "phone"
            ? phoneCapture
            : null,


        // -------------------------------------------------------
        // LOAD CELL
        // -------------------------------------------------------

        sampleWeight:
          capturedWeight,


        weightUnit:
          "g",


        // -------------------------------------------------------
        // LOAD CELL CURRENTLY NOT CALIBRATED
        // -------------------------------------------------------

        weightCalibrated:
          false,


        // -------------------------------------------------------
        // TEMPORARY PHYSICAL SCORE
        // -------------------------------------------------------

        physicalScore:
          80,


        qualityStatus:
          "Good",
      };


      onComplete(
        physicalResult,
      );
    };


  // =========================================================
  // DETECTIONS
  // =========================================================

  const detections =
    result?.detections || [];


  // =========================================================
  // TEMPORARY WEIGHT BYPASS
  // =========================================================

  const inputDisabled =
    false;


  // =========================================================
  // PHONE CAN RUN
  // =========================================================

  const phoneReady =
    phoneStatus.connected &&
    !checkingPhone;


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
              Capture the coffee bean sample
              using the connected Android
              phone camera or analyze an
              existing uploaded image using
              the trained AI models.
            </p>

          </div>


          <span className="physical-status-chip">

            {loading
              ? "AI Processing..."
              : result
                ? "Analysis Completed"
                : imageSource ===
                    "phone" &&
                  phoneReady
                  ? "Phone Ready"
                  : "Waiting"}

          </span>

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
            STEP 2.2 - IMAGE SOURCE
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
            Capture an original
            high-resolution image using the
            phone's native camera through USB
            and ADB, or select an existing
            coffee bean sample image.
          </p>


          <div className="image-source-buttons">

            {/* ===============================================
                PHONE CAMERA
            =============================================== */}

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
            >

              <span className="source-icon">
                📱
              </span>


              <div>

                <strong>
                  Phone Camera
                </strong>


                <small>
                  Native camera via USB + ADB
                </small>

              </div>

            </button>


            {/* ===============================================
                IMAGE UPLOAD
            =============================================== */}

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
            >

              <span className="source-icon">
                🖼
              </span>


              <div>

                <strong>
                  Upload Image
                </strong>


                <small>
                  Select existing image
                </small>

              </div>

            </button>

          </div>

        </div>


        {/* ===================================================
            STEP 2.3 - INPUT + AI SUMMARY
        =================================================== */}

        <div className="physical-top-grid">

          {/* =================================================
              INPUT CARD
          ================================================= */}

          <div className="physical-section-card">

            {/* ===============================================
                PHONE CAMERA
            =============================================== */}

            {imageSource ===
              "phone" && (

              <div className="phone-camera-panel">

                {/* ===========================================
                    PHONE HEADER
                =========================================== */}

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


                {/* ===========================================
                    DESCRIPTION
                =========================================== */}

                <p className="phone-camera-description">
                  The system uses ADB to
                  control the phone's native
                  camera, capture the original
                  high-resolution JPG, transfer
                  it directly to the laptop,
                  and run the Physical AI
                  models.
                </p>


                {/* ===========================================
                    PHONE DEVICE
                =========================================== */}

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
                      USB Debugging • Android
                      Debug Bridge
                    </small>

                  </div>


                  {phoneStatus.connected && (
                    <div className="phone-device-check">
                      ✓
                    </div>
                  )}

                </div>


                {/* ===========================================
                    ERROR
                =========================================== */}

                {phoneError && (
                  <div className="phone-camera-error">
                    {phoneError}
                  </div>
                )}


                {/* ===========================================
                    REFRESH CONNECTION
                =========================================== */}

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


                {/* ===========================================
                    CAPTURE INFO
                =========================================== */}

                {phoneCapture && (
                  <div className="phone-capture-success">

                    <div className="capture-success-heading">

                      <span>
                        ORIGINAL PHOTO CAPTURED
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


                    <div className="capture-meta-row">

                      <span>
                        Size
                      </span>


                      <strong>
                        {(
                          phoneCapture.file_size_bytes /
                          1024 /
                          1024
                        ).toFixed(
                          2,
                        )}{" "}
                        MB
                      </strong>

                    </div>


                    <div className="capture-meta-row">

                      <span>
                        Source
                      </span>


                      <strong>
                        Native Phone JPG
                      </strong>

                    </div>

                  </div>
                )}


                {/* ===========================================
                    CAPTURE + ANALYZE BUTTON
                =========================================== */}

                <button
                  type="button"
                  className="phone-capture-button"
                  onClick={
                    handlePredict
                  }
                  disabled={
                    !phoneReady ||
                    inputDisabled ||
                    loading
                  }
                >

                  {loading ? (
                    <>

                      <span className="physical-spinner">
                      </span>

                      Capturing & Analyzing...

                    </>

                  ) : !phoneStatus.connected ? (
                    <>
                      📱 Connect Android Phone
                    </>

                  ) : (
                    <>
                      📸 Capture & Analyze
                    </>
                  )}

                </button>


                <div className="phone-process-flow">

                  <span>
                    Native Camera
                  </span>

                  <b>
                    →
                  </b>

                  <span>
                    Original JPG
                  </span>

                  <b>
                    →
                  </b>

                  <span>
                    ADB Pull
                  </span>

                  <b>
                    →
                  </b>

                  <span>
                    AI
                  </span>

                </div>

              </div>

            )}


            {/* ===============================================
                IMAGE UPLOAD
            =============================================== */}

            {imageSource ===
              "upload" && (

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
                    inputDisabled ||
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
                      ⚡ Run Physical AI Analysis
                    </>
                  )}

                </button>

              </>

            )}

          </div>


          {/* =================================================
              AI SUMMARY
          ================================================= */}

          <div className="physical-section-card">

            {/* WAITING */}

            {!result &&
              !loading && (

                <div className="physical-waiting-state">

                  <div className="physical-ai-icon">
                    AI
                  </div>


                  <h3>
                    Waiting for Bean Sample
                  </h3>


                  <p>

                    {imageSource ===
                    "phone"
                      ? phoneStatus.connected
                        ? "Phone is connected. Position the coffee bean sample and click Capture & Analyze."
                        : "Connect the Android phone using USB and enable USB debugging."
                      : "Upload a coffee bean sample image and run the physical AI analysis."}

                  </p>

                </div>

              )}


            {/* LOADING */}

            {loading && (

              <div className="physical-loading-state">

                <div className="physical-scanner">

                  <div className="physical-scan-line">
                  </div>

                </div>


                <h3>

                  {imageSource ===
                  "phone"
                    ? "Capturing & Analyzing"
                    : "Analyzing Physical Quality"}

                </h3>


                <p>

                  {imageSource ===
                  "phone"
                    ? "The phone camera is capturing the original image and the AI pipeline is analyzing bean color and shape."
                    : "The AI pipeline is detecting coffee beans and analyzing their color and shape."}

                </p>

              </div>

            )}


            {/* RESULT */}

            {result &&
              !loading && (

                <DetectionSummary
                  result={
                    result
                  }
                />

              )}

          </div>

        </div>


        {/* ===================================================
            STEP 2.4 - DETAILED RESULT
        =================================================== */}

        {result &&
          !loading && (

            <div className="physical-result-grid">

              {/* ANNOTATED IMAGE */}

              <div className="physical-section-card">

                <DetectionResultImage
                  imageUrl={
                    getPredictionImageUrl(
                      result.predicted_image_url,
                    )
                  }
                />

              </div>


              {/* DETECTION TABLE */}

              <div className="physical-section-card">

                <DetectionTable
                  detections={
                    detections
                  }
                />

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

          border:
            1px solid
            rgba(
              255,
              222,
              178,
              0.15
            );

          background:
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.095
              ),
              rgba(
                255,
                255,
                255,
                0.035
              )
            ),
            rgba(
              39,
              22,
              13,
              0.78
            );

          backdrop-filter:
            blur(20px);

          box-shadow:
            0 25px 70px
            rgba(
              0,
              0,
              0,
              0.3
            ),
            inset
            0 1px 0
            rgba(
              255,
              255,
              255,
              0.08
            );
        }


        /* ===================================================
           HEADING
        =================================================== */

        .physical-heading {
          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 25px;

          margin-bottom: 25px;
        }


        .physical-step-label {
          display: block;

          margin-bottom: 7px;

          color: #dfa15d;

          font-size: 11px;

          font-weight: 900;

          letter-spacing:
            1.7px;
        }


        .physical-heading h2 {
          margin: 0;

          color: #fff3e1;

          font-size: 28px;

          letter-spacing:
            -0.5px;
        }


        .physical-heading p {
          max-width: 680px;

          margin:
            9px 0 0;

          color:
            rgba(
              255,
              239,
              215,
              0.58
            );

          font-size: 14px;

          line-height: 1.6;
        }


        .physical-status-chip {
          flex-shrink: 0;

          padding:
            8px 12px;

          border-radius:
            999px;

          color: #ffd59a;

          background:
            rgba(
              255,
              213,
              154,
              0.08
            );

          border:
            1px solid
            rgba(
              255,
              213,
              154,
              0.14
            );

          font-size: 11px;

          font-weight: 800;
        }


        /* ===================================================
           IMAGE SOURCE
        =================================================== */

        .image-source-card {
          margin-bottom: 18px;

          padding: 20px;

          border-radius: 22px;

          background:
            rgba(
              0,
              0,
              0,
              0.14
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.09
            );
        }


        .image-source-heading {
          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-start;

          gap: 15px;
        }


        .image-source-heading > div > span {
          display: block;

          margin-bottom: 5px;

          color: #dca05e;

          font-size: 9px;

          font-weight: 900;

          letter-spacing:
            1.3px;
        }


        .image-source-heading h3 {
          margin: 0;

          color: #fff1db;

          font-size: 18px;
        }


        .image-source-status {
          padding:
            6px 10px;

          border-radius:
            999px;

          color: #ffd396;

          background:
            rgba(
              255,
              211,
              150,
              0.07
            );

          border:
            1px solid
            rgba(
              255,
              211,
              150,
              0.12
            );

          font-size: 9px;

          font-weight: 800;
        }


        .image-source-description {
          margin:
            7px 0 15px;

          max-width: 700px;

          color:
            rgba(
              255,
              238,
              212,
              0.46
            );

          font-size: 11px;

          line-height: 1.6;
        }


        .image-source-buttons {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 12px;
        }


        .image-source-button {
          display: flex;

          align-items:
            center;

          gap: 12px;

          padding: 15px;

          text-align: left;

          border-radius:
            15px;

          color:
            rgba(
              255,
              236,
              207,
              0.66
            );

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.09
            );

          cursor: pointer;

          transition:
            0.2s ease;
        }


        .image-source-button:hover {
          transform:
            translateY(-1px);

          border-color:
            rgba(
              255,
              206,
              138,
              0.25
            );
        }


        .image-source-button.active {
          color: #2b170c;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d38a46,
              #a35a30
            );

          border-color:
            transparent;

          box-shadow:
            0 12px 30px
            rgba(
              199,
              118,
              57,
              0.15
            );
        }


        .source-icon {
          width: 38px;

          height: 38px;

          flex-shrink: 0;

          display: grid;

          place-items:
            center;

          border-radius:
            11px;

          font-size: 18px;

          background:
            rgba(
              255,
              255,
              255,
              0.08
            );
        }


        .image-source-button.active
        .source-icon {
          background:
            rgba(
              43,
              23,
              12,
              0.12
            );
        }


        .image-source-button strong {
          display: block;

          margin-bottom: 3px;

          font-size: 12px;

          font-weight: 900;
        }


        .image-source-button small {
          display: block;

          opacity: 0.65;

          font-size: 9px;
        }


        /* ===================================================
           GRID
        =================================================== */

        .physical-top-grid,
        .physical-result-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 18px;
        }


        .physical-result-grid {
          margin-top: 18px;
        }


        .physical-section-card {
          padding: 20px;

          border-radius: 22px;

          background:
            rgba(
              0,
              0,
              0,
              0.14
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.09
            );
        }


        /* ===================================================
           PHONE CAMERA
        =================================================== */

        .phone-camera-panel {
          width: 100%;
        }


        .phone-camera-header {
          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-start;

          gap: 15px;

          margin-bottom: 7px;
        }


        .phone-camera-header > div > span {
          display: block;

          margin-bottom: 4px;

          color: #dca05e;

          font-size: 9px;

          font-weight: 900;

          letter-spacing:
            1.3px;
        }


        .phone-camera-header h3 {
          margin: 0;

          color: #fff0da;

          font-size: 19px;
        }


        .phone-camera-description {
          margin:
            0 0 16px;

          color:
            rgba(
              255,
              238,
              212,
              0.46
            );

          font-size: 11px;

          line-height: 1.6;
        }


        .phone-connection-chip {
          display: inline-flex;

          align-items:
            center;

          gap: 6px;

          padding:
            7px 10px;

          border-radius:
            999px;

          font-size: 9px;

          font-weight: 850;
        }


        .phone-connection-chip.connected {
          color: #a4e9ac;

          background:
            rgba(
              76,
              167,
              90,
              0.09
            );

          border:
            1px solid
            rgba(
              76,
              167,
              90,
              0.15
            );
        }


        .phone-connection-chip.disconnected {
          color: #ffad96;

          background:
            rgba(
              196,
              69,
              47,
              0.08
            );

          border:
            1px solid
            rgba(
              196,
              69,
              47,
              0.13
            );
        }


        .phone-status-dot {
          width: 7px;

          height: 7px;

          border-radius: 50%;

          background:
            currentColor;

          box-shadow:
            0 0 8px
            currentColor;
        }


        .phone-device-box {
          display: flex;

          align-items:
            center;

          gap: 13px;

          padding: 15px;

          border-radius:
            16px;

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.09
            );
        }


        .phone-device-icon {
          width: 48px;

          height: 48px;

          flex-shrink: 0;

          display: grid;

          place-items:
            center;

          border-radius:
            14px;

          background:
            rgba(
              255,
              210,
              147,
              0.1
            );

          font-size: 23px;
        }


        .phone-device-details {
          min-width: 0;

          flex: 1;
        }


        .phone-device-details span {
          display: block;

          margin-bottom: 3px;

          color:
            rgba(
              255,
              232,
              198,
              0.4
            );

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1px;
        }


        .phone-device-details strong {
          display: block;

          color: #ffe6c1;

          font-size: 13px;

          word-break:
            break-word;
        }


        .phone-device-details small {
          display: block;

          margin-top: 4px;

          color:
            rgba(
              255,
              238,
              212,
              0.35
            );

          font-size: 8px;
        }


        .phone-device-check {
          width: 29px;

          height: 29px;

          flex-shrink: 0;

          display: grid;

          place-items:
            center;

          border-radius: 50%;

          color: #203021;

          background:
            #9ce0a6;

          font-size: 13px;

          font-weight: 950;
        }


        .phone-camera-error {
          margin-top: 12px;

          padding: 10px 12px;

          border-radius:
            12px;

          color: #ffad96;

          background:
            rgba(
              196,
              69,
              47,
              0.08
            );

          border:
            1px solid
            rgba(
              196,
              69,
              47,
              0.13
            );

          font-size: 10px;

          line-height: 1.5;
        }


        .refresh-phone-button {
          width: 100%;

          margin-top: 12px;

          padding:
            10px 12px;

          border-radius:
            12px;

          color: #ffdeb0;

          background:
            rgba(
              255,
              255,
              255,
              0.045
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.1
            );

          font-size: 10px;

          font-weight: 850;

          cursor: pointer;
        }


        .refresh-phone-button:disabled {
          opacity: 0.45;

          cursor:
            not-allowed;
        }


        .phone-capture-button {
          width: 100%;

          margin-top: 14px;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          gap: 8px;

          padding:
            14px 16px;

          border: none;

          border-radius:
            14px;

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


        .phone-capture-button:disabled {
          opacity: 0.4;

          cursor:
            not-allowed;
        }


        .phone-capture-success {
          margin-top: 13px;

          padding: 13px;

          border-radius:
            14px;

          background:
            rgba(
              80,
              170,
              92,
              0.07
            );

          border:
            1px solid
            rgba(
              80,
              170,
              92,
              0.13
            );
        }


        .capture-success-heading {
          display: flex;

          justify-content:
            space-between;

          align-items:
            center;

          gap: 10px;

          margin-bottom: 10px;
        }


        .capture-success-heading span {
          color: #95da9e;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1px;
        }


        .capture-success-heading strong {
          color: #a5e7ac;

          font-size: 9px;
        }


        .capture-meta-row {
          display: flex;

          justify-content:
            space-between;

          gap: 15px;

          padding:
            5px 0;

          color:
            rgba(
              255,
              238,
              212,
              0.42
            );

          font-size: 9px;
        }


        .capture-meta-row strong {
          color: #e9d6b8;

          text-align: right;

          word-break:
            break-all;
        }


        .phone-process-flow {
          margin-top: 12px;

          display: flex;

          justify-content:
            center;

          align-items:
            center;

          flex-wrap: wrap;

          gap: 6px;

          color:
            rgba(
              255,
              235,
              204,
              0.34
            );

          font-size: 8px;
        }


        .phone-process-flow b {
          color: #d99b5b;
        }


        /* ===================================================
           RUN AI
        =================================================== */

        .run-ai-button {
          width: 100%;

          margin-top: 17px;

          display: flex;

          justify-content:
            center;

          align-items:
            center;

          gap: 9px;

          padding:
            14px 18px;

          border: none;

          border-radius:
            15px;

          color: #2b170c;

          background:
            linear-gradient(
              135deg,
              #ffe1a5,
              #d58b46,
              #a35a30
            );

          font-size: 13px;

          font-weight: 900;

          cursor: pointer;

          box-shadow:
            0 13px 30px
            rgba(
              199,
              118,
              57,
              0.18
            );
        }


        .run-ai-button:disabled {
          opacity: 0.4;

          cursor:
            not-allowed;
        }


        /* ===================================================
           SPINNER
        =================================================== */

        .physical-spinner {
          width: 15px;

          height: 15px;

          border-radius: 50%;

          border:
            2px solid
            rgba(
              42,
              22,
              11,
              0.25
            );

          border-top-color:
            #2a160b;

          animation:
            physicalSpin
            0.7s
            linear
            infinite;
        }


        /* ===================================================
           WAITING / LOADING
        =================================================== */

        .physical-waiting-state,
        .physical-loading-state {
          min-height: 390px;

          display: flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          text-align:
            center;
        }


        .physical-ai-icon {
          width: 78px;

          height: 78px;

          display: grid;

          place-items:
            center;

          border-radius:
            24px;

          color: #2b170c;

          background:
            linear-gradient(
              135deg,
              #ffe0a4,
              #ca7d3e
            );

          font-weight: 950;

          box-shadow:
            0 16px 35px
            rgba(
              204,
              122,
              59,
              0.22
            );
        }


        .physical-waiting-state h3,
        .physical-loading-state h3 {
          margin:
            18px 0 7px;

          color: #fff1db;
        }


        .physical-waiting-state p,
        .physical-loading-state p {
          max-width: 350px;

          margin: 0;

          color:
            rgba(
              255,
              238,
              212,
              0.46
            );

          font-size: 13px;

          line-height: 1.6;
        }


        /* ===================================================
           AI SCANNER
        =================================================== */

        .physical-scanner {
          width: 170px;

          height: 110px;

          position: relative;

          overflow: hidden;

          border-radius:
            18px;

          border:
            1px solid
            rgba(
              255,
              213,
              154,
              0.16
            );

          background:
            repeating-linear-gradient(
              0deg,
              rgba(
                255,
                255,
                255,
                0.035
              )
              0px,
              rgba(
                255,
                255,
                255,
                0.035
              )
              1px,
              transparent
              1px,
              transparent
              18px
            );
        }


        .physical-scan-line {
          position:
            absolute;

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

          box-shadow:
            0 0 18px
            #ffd18a;

          animation:
            physicalScan
            1.4s
            ease-in-out
            infinite;
        }


        /* ===================================================
           ACTIONS
        =================================================== */

        .physical-actions {
          margin-top: 25px;

          padding-top: 22px;

          display: flex;

          justify-content:
            space-between;

          gap: 15px;

          border-top:
            1px solid
            rgba(
              255,
              221,
              177,
              0.09
            );
        }


        .physical-back-button,
        .physical-continue-button {
          padding:
            13px 18px;

          border-radius:
            14px;

          font-size: 12px;

          font-weight: 850;

          cursor: pointer;
        }


        .physical-back-button {
          color: #ffe0b5;

          background:
            rgba(
              255,
              255,
              255,
              0.05
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.11
            );
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

          cursor:
            not-allowed;
        }


        /* ===================================================
           ANIMATIONS
        =================================================== */

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


        /* ===================================================
           RESPONSIVE
        =================================================== */

        @media (
          max-width: 900px
        ) {
          .physical-top-grid,
          .physical-result-grid {
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
          .physical-actions,
          .image-source-heading,
          .phone-camera-header {
            flex-direction:
              column;
          }


          .image-source-buttons {
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