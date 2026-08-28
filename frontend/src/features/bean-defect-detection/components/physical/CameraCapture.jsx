import { useEffect, useRef, useState } from "react";

function CameraCapture({ disabled = false, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);

  const [capturedPreview, setCapturedPreview] = useState(null);

  const [cameraError, setCameraError] = useState("");

  // =========================================================
  // CAMERA DEVICE STATES
  // =========================================================

  const [cameraDevices, setCameraDevices] = useState([]);

  const [selectedCameraId, setSelectedCameraId] = useState("");

  const [detectingCameras, setDetectingCameras] = useState(false);

  // =========================================================
  // STOP CURRENT CAMERA STREAM
  // =========================================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  // =========================================================
  // ENUMERATE AVAILABLE CAMERAS
  // =========================================================

  const loadCameraDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setCameraError("Camera devices are not supported by this browser.");

        return [];
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      setCameraDevices(videoDevices);

      // -------------------------------------------------------
      // SELECT FIRST CAMERA IF NONE SELECTED
      // -------------------------------------------------------

      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }

      return videoDevices;
    } catch (error) {
      console.error("Camera device detection failed:", error);

      setCameraError("Unable to detect camera devices.");

      return [];
    }
  };

  // =========================================================
  // DETECT CAMERAS
  // =========================================================
  //
  // Browser does not always reveal camera names
  // until camera permission has been granted.
  //
  // This function requests temporary access,
  // immediately stops that stream,
  // then loads the real camera device list.
  // =========================================================

  const detectCameras = async () => {
    if (disabled) {
      return;
    }

    try {
      setDetectingCameras(true);
      setCameraError("");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not available.");
      }

      // -------------------------------------------------------
      // TEMPORARY STREAM FOR PERMISSION
      // -------------------------------------------------------

      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      // -------------------------------------------------------
      // STOP TEMPORARY STREAM
      // -------------------------------------------------------

      permissionStream.getTracks().forEach((track) => {
        track.stop();
      });

      // -------------------------------------------------------
      // NOW DEVICE LABELS SHOULD BE AVAILABLE
      // -------------------------------------------------------

      const devices = await loadCameraDevices();

      if (devices.length === 0) {
        setCameraError("No camera devices were detected.");
      }
    } catch (error) {
      console.error("Camera detection failed:", error);

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access in the browser.",
        );
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera device was found.");
      } else {
        setCameraError(
          "Unable to detect cameras. Please check the camera connection and browser permission.",
        );
      }
    } finally {
      setDetectingCameras(false);
    }
  };

  // =========================================================
  // START SELECTED CAMERA
  // =========================================================

  const startCamera = async () => {
    if (disabled) {
      return;
    }

    try {
      setCameraError("");

      stopCamera();

      // -------------------------------------------------------
      // VIDEO CONSTRAINTS
      // -------------------------------------------------------

      const videoConstraints = selectedCameraId
        ? {
            deviceId: {
              exact: selectedCameraId,
            },

            width: {
              ideal: 1920,
            },

            height: {
              ideal: 1080,
            },
          }
        : {
            width: {
              ideal: 1920,
            },

            height: {
              ideal: 1080,
            },
          };

      // -------------------------------------------------------
      // OPEN CAMERA
      // -------------------------------------------------------

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;

      // -------------------------------------------------------
      // DISPLAY LIVE STREAM
      // -------------------------------------------------------

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setCameraActive(true);

      // -------------------------------------------------------
      // REFRESH DEVICE LIST AFTER PERMISSION
      // -------------------------------------------------------

      await loadCameraDevices();
    } catch (error) {
      console.error("Camera access failed:", error);

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access and try again.",
        );
      } else if (error.name === "NotFoundError") {
        setCameraError("The selected camera could not be found.");
      } else if (error.name === "OverconstrainedError") {
        setCameraError(
          "The selected camera is no longer available. Please detect the cameras again.",
        );
      } else if (error.name === "NotReadableError") {
        setCameraError(
          "The camera is already being used by another application.",
        );
      } else {
        setCameraError(
          "Unable to access the camera. Please check the camera connection and browser permission.",
        );
      }
    }
  };

  // =========================================================
  // CAMERA SELECTION CHANGE
  // =========================================================

  const handleCameraChange = async (event) => {
    const newCameraId = event.target.value;

    setSelectedCameraId(newCameraId);

    // -------------------------------------------------------
    // IF CAMERA IS CURRENTLY ACTIVE
    // RESTART WITH NEW CAMERA
    // -------------------------------------------------------

    if (cameraActive) {
      stopCamera();

      setTimeout(
        async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: {
                  exact: newCameraId,
                },

                width: {
                  ideal: 1920,
                },

                height: {
                  ideal: 1080,
                },
              },

              audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
              videoRef.current.srcObject = stream;

              await videoRef.current.play();
            }

            setCameraActive(true);
          } catch (error) {
            console.error("Camera switch failed:", error);

            setCameraError("Unable to switch to the selected camera.");
          }
        },

        100,
      );
    }
  };

  // =========================================================
  // CAPTURE PHOTO
  // =========================================================

  const capturePhoto = () => {
    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas || !cameraActive) {
      return;
    }

    const width = video.videoWidth;

    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError("Camera frame is not ready yet. Please try again.");

      return;
    }

    canvas.width = width;

    canvas.height = height;

    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, width, height);

    // =======================================================
    // CONVERT CAMERA FRAME TO JPG FILE
    // =======================================================

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Unable to capture the camera frame.");

          return;
        }

        const file = new File([blob], `coffee-bean-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        const previewUrl = URL.createObjectURL(blob);

        // ---------------------------------------------------
        // REMOVE OLD PREVIEW
        // ---------------------------------------------------

        if (capturedPreview) {
          URL.revokeObjectURL(capturedPreview);
        }

        // ---------------------------------------------------
        // SAVE PREVIEW
        // ---------------------------------------------------

        setCapturedPreview(previewUrl);

        // ---------------------------------------------------
        // SEND FILE TO PHYSICAL ANALYSIS
        // ---------------------------------------------------

        if (onCapture) {
          onCapture(file, previewUrl);
        }

        // ---------------------------------------------------
        // STOP LIVE CAMERA AFTER CAPTURE
        // ---------------------------------------------------

        stopCamera();
      },

      "image/jpeg",

      0.95,
    );
  };

  // =========================================================
  // RETAKE PHOTO
  // =========================================================

  const handleRetake = async () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }

    setCapturedPreview(null);

    if (onCapture) {
      onCapture(null, null);
    }

    await startCamera();
  };

  // =========================================================
  // DEVICE CONNECT / DISCONNECT LISTENER
  // =========================================================

  useEffect(() => {
    if (!navigator.mediaDevices) {
      return;
    }

    const handleDeviceChange = async () => {
      await loadCameraDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, []);

  // =========================================================
  // COMPONENT CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  // =========================================================
  // CURRENT SELECTED CAMERA NAME
  // =========================================================

  const selectedCamera = cameraDevices.find(
    (device) => device.deviceId === selectedCameraId,
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="camera-capture">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="camera-header">
        <div>
          <span>LIVE IMAGE CAPTURE</span>

          <h3>Coffee Bean Inspection Camera</h3>
        </div>

        <span className={`camera-status ${cameraActive ? "active" : ""}`}>
          <span className="camera-status-dot"></span>

          {cameraActive ? "Camera Active" : "Camera Off"}
        </span>
      </div>

      <p className="camera-description">
        Select the inspection camera, start the live feed and capture the coffee
        bean sample before running the physical AI analysis.
      </p>

      {/* =====================================================
          WEIGHT NOT CAPTURED
      ===================================================== */}

      {disabled && (
        <div className="camera-disabled-state">
          <div>⚖</div>

          <h4>Capture Sample Weight First</h4>

          <p>
            Complete the load cell measurement before starting the inspection
            camera.
          </p>
        </div>
      )}

      {/* =====================================================
          CAMERA AREA
      ===================================================== */}

      {!disabled && (
        <>
          {/* =================================================
              CAMERA DEVICE SELECTOR
          ================================================= */}

          {!capturedPreview && (
            <div className="camera-device-panel">
              <div className="camera-device-header">
                <div>
                  <span>CAMERA DEVICE</span>

                  <strong>Select Inspection Camera</strong>
                </div>

                <button
                  type="button"
                  className="detect-camera-button"
                  onClick={detectCameras}
                  disabled={detectingCameras || cameraActive}
                >
                  {detectingCameras ? "Detecting..." : "↻ Detect Cameras"}
                </button>
              </div>

              <select
                className="camera-device-select"
                value={selectedCameraId}
                onChange={handleCameraChange}
                disabled={cameraActive || cameraDevices.length === 0}
              >
                {cameraDevices.length === 0 ? (
                  <option value="">No cameras detected yet</option>
                ) : (
                  cameraDevices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))
                )}
              </select>

              {selectedCamera && (
                <div className="selected-camera-info">
                  <span>Selected:</span>

                  <strong>{selectedCamera.label || "Camera Device"}</strong>
                </div>
              )}
            </div>
          )}

          {/* =================================================
              LIVE CAMERA FRAME
          ================================================= */}

          {!capturedPreview && (
            <div className="camera-frame">
              <video ref={videoRef} autoPlay playsInline muted />

              {!cameraActive && (
                <div className="camera-placeholder">
                  <div className="camera-placeholder-icon">📷</div>

                  <h4>Camera Ready</h4>

                  <p>
                    Detect your cameras, select the phone or inspection camera
                    and start the live feed.
                  </p>
                </div>
              )}

              {cameraActive && (
                <div className="camera-live-badge">
                  <span></span>
                  LIVE
                </div>
              )}
            </div>
          )}

          {/* =================================================
              CAPTURED PHOTO PREVIEW
          ================================================= */}

          {capturedPreview && (
            <div className="captured-camera-result">
              <div className="captured-camera-title">
                <span>CAPTURED SAMPLE</span>

                <strong>Photo Ready ✓</strong>
              </div>

              <div className="captured-camera-frame">
                <img src={capturedPreview} alt="Captured coffee bean sample" />
              </div>
            </div>
          )}

          {/* =================================================
              CAMERA ACTIONS
          ================================================= */}

          <div className="camera-actions">
            {!cameraActive && !capturedPreview && (
              <button
                type="button"
                className="start-camera-button"
                onClick={startCamera}
              >
                📷 Start Selected Camera
              </button>
            )}

            {cameraActive && (
              <>
                <button
                  type="button"
                  className="stop-camera-button"
                  onClick={stopCamera}
                >
                  ■ Stop Camera
                </button>

                <button
                  type="button"
                  className="capture-photo-button"
                  onClick={capturePhoto}
                >
                  📸 Capture Photo
                </button>
              </>
            )}

            {capturedPreview && (
              <button
                type="button"
                className="retake-button"
                onClick={handleRetake}
              >
                ↻ Retake Photo
              </button>
            )}
          </div>
        </>
      )}

      {/* =====================================================
          CAMERA ERROR
      ===================================================== */}

      {cameraError && <div className="camera-error">{cameraError}</div>}

      {/* =====================================================
          HIDDEN CAPTURE CANVAS
      ===================================================== */}

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        .camera-capture {
          width: 100%;
        }


        /* ===================================================
           HEADER
        =================================================== */

        .camera-header {
          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 15px;

          margin-bottom: 7px;
        }


        .camera-header > div > span {
          display: block;

          margin-bottom: 4px;

          color: #dca05e;

          font-size: 10px;

          font-weight: 900;

          letter-spacing:
            1.5px;
        }


        .camera-header h3 {
          margin: 0;

          color: #fff2de;

          font-size: 20px;
        }


        .camera-description {
          margin:
            0 0 15px;

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


        .camera-status {
          display: inline-flex;

          align-items:
            center;

          gap: 6px;

          flex-shrink: 0;

          padding:
            6px 9px;

          border-radius:
            999px;

          color:
            rgba(
              255,
              230,
              190,
              0.55
            );

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
              0.09
            );

          font-size: 9px;

          font-weight: 800;
        }


        .camera-status.active {
          color: #9ee2a7;

          background:
            rgba(
              80,
              170,
              92,
              0.08
            );
        }


        .camera-status-dot {
          width: 6px;

          height: 6px;

          border-radius: 50%;

          background:
            currentColor;
        }


        /* ===================================================
           DISABLED
        =================================================== */

        .camera-disabled-state {
          min-height: 260px;

          display: flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          padding: 25px;

          text-align: center;

          border-radius:
            20px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px dashed
            rgba(
              255,
              220,
              170,
              0.12
            );

          opacity: 0.6;
        }


        .camera-disabled-state > div {
          font-size: 32px;
        }


        .camera-disabled-state h4 {
          margin:
            12px 0 5px;

          color: #ffe0b5;
        }


        .camera-disabled-state p {
          max-width: 330px;

          margin: 0;

          color:
            rgba(
              255,
              238,
              212,
              0.45
            );

          font-size: 11px;

          line-height: 1.55;
        }


        /* ===================================================
           CAMERA DEVICE SELECTOR
        =================================================== */

        .camera-device-panel {
          margin-bottom: 14px;

          padding: 14px;

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


        .camera-device-header {
          display: flex;

          justify-content:
            space-between;

          align-items:
            center;

          gap: 15px;

          margin-bottom: 11px;
        }


        .camera-device-header > div > span {
          display: block;

          margin-bottom: 3px;

          color: #dca05e;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            1px;
        }


        .camera-device-header strong {
          color: #ffe8c8;

          font-size: 12px;
        }


        .detect-camera-button {
          padding:
            7px 10px;

          border-radius:
            10px;

          color: #ffdba7;

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

          font-size: 9px;

          font-weight: 850;

          cursor: pointer;
        }


        .detect-camera-button:disabled {
          opacity: 0.45;

          cursor:
            not-allowed;
        }


        .camera-device-select {
          width: 100%;

          padding:
            11px 12px;

          border-radius:
            12px;

          color: #ffe7c3;

          background:
            #291910;

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.14
            );

          outline: none;

          font-size: 11px;

          cursor: pointer;
        }


        .camera-device-select:focus {
          border-color:
            rgba(
              255,
              205,
              135,
              0.55
            );
        }


        .camera-device-select:disabled {
          opacity: 0.45;

          cursor:
            not-allowed;
        }


        .selected-camera-info {
          margin-top: 9px;

          display: flex;

          align-items:
            center;

          gap: 6px;

          color:
            rgba(
              255,
              238,
              212,
              0.45
            );

          font-size: 9px;
        }


        .selected-camera-info strong {
          color: #9fe0a7;

          font-size: 9px;
        }


        /* ===================================================
           LIVE CAMERA
        =================================================== */

        .camera-frame {
          min-height: 320px;

          position: relative;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          overflow: hidden;

          border-radius:
            20px;

          background: #090706;

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.11
            );
        }


        .camera-frame video {
          width: 100%;

          max-height: 500px;

          display: block;

          object-fit: contain;
        }


        .camera-placeholder {
          position: absolute;

          inset: 0;

          display: flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          padding: 20px;

          text-align: center;
        }


        .camera-placeholder-icon {
          font-size: 37px;
        }


        .camera-placeholder h4 {
          margin:
            10px 0 4px;

          color: #fff0d8;
        }


        .camera-placeholder p {
          max-width: 300px;

          margin: 0;

          color:
            rgba(
              255,
              238,
              212,
              0.4
            );

          font-size: 11px;

          line-height: 1.5;
        }


        .camera-live-badge {
          position: absolute;

          top: 12px;

          left: 12px;

          display: inline-flex;

          align-items:
            center;

          gap: 6px;

          padding:
            6px 9px;

          border-radius:
            999px;

          color: #fff;

          background:
            rgba(
              180,
              45,
              35,
              0.78
            );

          font-size: 9px;

          font-weight: 900;
        }


        .camera-live-badge span {
          width: 7px;

          height: 7px;

          border-radius: 50%;

          background: #ffb0a6;
        }


        /* ===================================================
           CAPTURED PHOTO
        =================================================== */

        .captured-camera-result {
          margin-top: 5px;
        }


        .captured-camera-title {
          display: flex;

          justify-content:
            space-between;

          align-items:
            center;

          margin-bottom: 9px;
        }


        .captured-camera-title span {
          color: #dca05e;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .captured-camera-title strong {
          color: #9fe0a7;

          font-size: 10px;
        }


        .captured-camera-frame {
          overflow: hidden;

          border-radius:
            20px;

          background:
            rgba(
              0,
              0,
              0,
              0.2
            );

          border:
            1px solid
            rgba(
              255,
              220,
              170,
              0.1
            );
        }


        .captured-camera-frame img {
          width: 100%;

          max-height: 500px;

          display: block;

          object-fit: contain;
        }


        /* ===================================================
           BUTTONS
        =================================================== */

        .camera-actions {
          display: flex;

          justify-content:
            center;

          gap: 10px;

          margin-top: 14px;
        }


        .camera-actions button {
          padding:
            12px 16px;

          border-radius:
            13px;

          font-size: 11px;

          font-weight: 900;

          cursor: pointer;
        }


        .start-camera-button,
        .capture-photo-button {
          border: none;

          color: #2b170c;

          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d38a46,
              #9e572f
            );
        }


        .stop-camera-button,
        .retake-button {
          color: #ffe1b8;

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


        /* ===================================================
           ERROR
        =================================================== */

        .camera-error {
          margin-top: 12px;

          padding: 11px;

          border-radius:
            12px;

          color: #ffb09a;

          background:
            rgba(
              198,
              70,
              48,
              0.08
            );

          border:
            1px solid
            rgba(
              198,
              70,
              48,
              0.12
            );

          font-size: 11px;

          line-height: 1.5;
        }


        /* ===================================================
           RESPONSIVE
        =================================================== */

        @media (
          max-width: 620px
        ) {
          .camera-header,
          .camera-device-header,
          .camera-actions {
            flex-direction:
              column;

            align-items:
              stretch;
          }


          .camera-actions button,
          .detect-camera-button {
            width: 100%;
          }
        }

      `}</style>
    </div>
  );
}

export default CameraCapture;
