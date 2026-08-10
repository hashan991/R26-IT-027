import { useState } from "react";

import { predictBeanDefects } from "../../services/beanService";

import ImageUploader from "./ImageUploader";
import DetectionSummary from "./DetectionSummary";
import DetectionResultImage from "./DetectionResultImage";
import DetectionTable from "./DetectionTable";

function PhysicalAnalysis({ onComplete, onBack }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "";

  const getPredictionImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) {
      return path;
    }

    const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

    const imagePath = path.startsWith("/") ? path : `/${path}`;

    return `${base}${imagePath}`;
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));

    // old result එක reset කරනවා
    setResult(null);
  };

  const handleImageChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    handleFile(event.dataTransfer.files?.[0]);
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      alert("Please select a coffee bean image first.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const data = await predictBeanDefects(selectedImage);

      setResult(data.result);
    } catch (error) {
      console.error("Physical analysis failed:", error);

      alert(
        "Physical AI analysis failed. Please check the backend and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!result) return;

    const physicalResult = {
      ...result,

      // temporary score
      // future backend quality fusion එකෙන් replace කරනවා
      physicalScore: 80,

      qualityStatus: "Good",
    };

    onComplete(physicalResult);
  };

  const detections = result?.detections || [];

  return (
    <section className="physical-analysis">
      <div className="physical-main-card">
        {/* Heading */}
        <div className="physical-heading">
          <div>
            <span className="physical-step-label">
              STEP 02 — COMPUTER VISION
            </span>

            <h2>Physical AI Analysis</h2>

            <p>
              Upload a coffee bean sample image and analyze visible physical
              defects using the trained AI models.
            </p>
          </div>

          <span className="physical-status-chip">
            {loading
              ? "AI Processing..."
              : result
                ? "Analysis Completed"
                : "Waiting"}
          </span>
        </div>

        {/* Upload + Summary */}
        <div className="physical-top-grid">
          <div className="physical-section-card">
            <ImageUploader
              selectedImage={selectedImage}
              preview={preview}
              dragActive={dragActive}
              onImageChange={handleImageChange}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />

            <button
              className="run-ai-button"
              onClick={handlePredict}
              disabled={!selectedImage || loading}
            >
              {loading ? (
                <>
                  <span className="physical-spinner"></span>
                  AI is Analyzing...
                </>
              ) : (
                <>⚡ Run Physical AI Analysis</>
              )}
            </button>
          </div>

          <div className="physical-section-card">
            {!result && !loading && (
              <div className="physical-waiting-state">
                <div className="physical-ai-icon">AI</div>

                <h3>Waiting for Bean Sample</h3>

                <p>
                  Upload an image and start the physical analysis to view defect
                  statistics.
                </p>
              </div>
            )}

            {loading && (
              <div className="physical-loading-state">
                <div className="physical-scanner">
                  <div className="physical-scan-line"></div>
                </div>

                <h3>Analyzing Physical Quality</h3>

                <p>The AI model is inspecting visible coffee bean defects.</p>
              </div>
            )}

            {result && !loading && <DetectionSummary result={result} />}
          </div>
        </div>

        {/* Detailed Result */}
        {result && !loading && (
          <div className="physical-result-grid">
            <div className="physical-section-card">
              <DetectionResultImage
                imageUrl={getPredictionImageUrl(result.predicted_image_url)}
              />
            </div>

            <div className="physical-section-card">
              <DetectionTable detections={detections} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="physical-actions">
          <button className="physical-back-button" onClick={onBack}>
            ← Back to Sensor Analysis
          </button>

          <button
            className="physical-continue-button"
            disabled={!result || loading}
            onClick={handleContinue}
          >
            Generate Final Quality Report →
          </button>
        </div>
      </div>

      <style>{`
        .physical-analysis {
          margin-top: 30px;
        }

        .physical-main-card {
          padding: 28px;
          border-radius: 28px;

          border:
            1px solid rgba(255,222,178,0.15);

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

        .physical-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 25px;
        }

        .physical-step-label {
          display: block;
          margin-bottom: 7px;

          color: #dfa15d;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .physical-heading h2 {
          margin: 0;

          color: #fff3e1;
          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .physical-heading p {
          max-width: 680px;
          margin: 9px 0 0;

          color: rgba(255,239,215,0.58);
          font-size: 14px;
          line-height: 1.6;
        }

        .physical-status-chip {
          flex-shrink: 0;

          padding: 8px 12px;

          border-radius: 999px;

          color: #ffd59a;
          background: rgba(255,213,154,0.08);

          border:
            1px solid rgba(255,213,154,0.14);

          font-size: 11px;
          font-weight: 800;
        }

        .physical-top-grid,
        .physical-result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .physical-result-grid {
          margin-top: 18px;
        }

        .physical-section-card {
          padding: 20px;

          border-radius: 22px;

          background: rgba(0,0,0,0.14);

          border:
            1px solid rgba(255,220,170,0.09);
        }

        .run-ai-button {
          width: 100%;

          margin-top: 17px;

          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;

          padding: 14px 18px;

          border: none;
          border-radius: 15px;

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
            0 13px 30px rgba(199,118,57,0.18);
        }

        .run-ai-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .physical-spinner {
          width: 15px;
          height: 15px;

          border-radius: 50%;

          border:
            2px solid rgba(42,22,11,0.25);

          border-top-color: #2a160b;

          animation:
            physicalSpin 0.7s linear infinite;
        }

        .physical-waiting-state,
        .physical-loading-state {
          min-height: 390px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .physical-ai-icon {
          width: 78px;
          height: 78px;

          display: grid;
          place-items: center;

          border-radius: 24px;

          color: #2b170c;

          background:
            linear-gradient(
              135deg,
              #ffe0a4,
              #ca7d3e
            );

          font-weight: 950;

          box-shadow:
            0 16px 35px rgba(204,122,59,0.22);
        }

        .physical-waiting-state h3,
        .physical-loading-state h3 {
          margin: 18px 0 7px;

          color: #fff1db;
        }

        .physical-waiting-state p,
        .physical-loading-state p {
          max-width: 350px;
          margin: 0;

          color: rgba(255,238,212,0.46);

          font-size: 13px;
          line-height: 1.6;
        }

        .physical-scanner {
          width: 170px;
          height: 110px;

          position: relative;
          overflow: hidden;

          border-radius: 18px;

          border:
            1px solid rgba(255,213,154,0.16);

          background:
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.035) 0px,
              rgba(255,255,255,0.035) 1px,
              transparent 1px,
              transparent 18px
            );
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

          box-shadow:
            0 0 18px #ffd18a;

          animation:
            physicalScan 1.4s ease-in-out infinite;
        }

        .physical-actions {
          margin-top: 25px;
          padding-top: 22px;

          display: flex;
          justify-content: space-between;
          gap: 15px;

          border-top:
            1px solid rgba(255,221,177,0.09);
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

          background:
            rgba(255,255,255,0.05);

          border:
            1px solid rgba(255,220,170,0.11);
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
            transform: rotate(360deg);
          }
        }

        @keyframes physicalScan {
          0% {
            top: 0;
          }

          50% {
            top: calc(100% - 3px);
          }

          100% {
            top: 0;
          }
        }

        @media (max-width: 900px) {
          .physical-top-grid,
          .physical-result-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .physical-main-card {
            padding: 18px;
          }

          .physical-heading,
          .physical-actions {
            flex-direction: column;
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
