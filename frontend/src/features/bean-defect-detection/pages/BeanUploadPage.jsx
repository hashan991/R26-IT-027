import { useState } from "react";
import { predictBeanDefects } from "../services/beanService";

function BeanUploadPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "";

  const getPredictionImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    const imagePath = path.startsWith("/") ? path : `/${path}`;

    return `${base}${imagePath}`;
  };

  const formatConfidence = (confidence) => {
    if (confidence === undefined || confidence === null) return "N/A";

    const value = Number(confidence);

    if (Number.isNaN(value)) return confidence;
    if (value <= 1) return `${(value * 100).toFixed(1)}%`;

    return `${value.toFixed(1)}%`;
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    try {
      setLoading(true);
      const data = await predictBeanDefects(selectedImage);
      setResult(data.result);
    } catch (error) {
      console.error(error);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const defectCounts = result?.defect_counts || {};
  const detections = result?.detections || [];

  return (
    <div className="bean-page">
      <div className="bg-glow glow-one"></div>
      <div className="bg-glow glow-two"></div>
      <div className="coffee-particle particle-one">☕</div>
      <div className="coffee-particle particle-two">●</div>
      <div className="coffee-particle particle-three">◆</div>

      <main className="bean-container">
        <section className="hero-section">
          <div className="badge-row">
            <span className="ai-badge">AI Powered</span>
            <span className="ai-badge">YOLO Detection</span>
            <span className="ai-badge">Computer Vision</span>
          </div>

          <h1>Coffee Bean Defect Detection</h1>
          <p>
            Upload a coffee bean image and let the AI model identify detected
            defect types with confidence-based analysis.
          </p>
        </section>

        <section className="dashboard-grid">
          <div className="glass-card upload-panel">
            <div className="card-header">
              <div>
                <span className="section-label">Image Upload</span>
                <h2>Bean Sample Input</h2>
              </div>
              <div className="status-dot"></div>
            </div>

            <label
              className={`upload-box ${dragActive ? "drag-active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />

              <div className="upload-icon">{preview ? "✓" : "⬆"}</div>

              <h3>
                {selectedImage
                  ? "Image Selected"
                  : "Drop your coffee bean image"}
              </h3>

              <p>
                {selectedImage
                  ? selectedImage.name
                  : "Drag & drop or click here to upload JPG, PNG, or WEBP image"}
              </p>

              <span className="upload-action">Choose Image</span>
            </label>

            {preview && (
              <div className="preview-card">
                <div className="preview-header">
                  <span>Selected Preview</span>
                  <span className="file-chip">{selectedImage?.type}</span>
                </div>

                <div className="image-frame">
                  <img src={preview} alt="Selected coffee bean" />
                </div>
              </div>
            )}

            <button
              className="detect-button"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Detecting Defects...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  Detect Defects
                </>
              )}
            </button>
          </div>

          <div className="glass-card analysis-panel">
            <div className="card-header">
              <div>
                <span className="section-label">AI Analysis</span>
                <h2>Detection Summary</h2>
              </div>
              <span className="scan-chip">
                {loading ? "Scanning..." : result ? "Completed" : "Waiting"}
              </span>
            </div>

            {!result && !loading && (
              <div className="empty-state">
                <div className="radar">
                  <span></span>
                </div>
                <h3>No Detection Yet</h3>
                <p>
                  Upload a coffee bean image and click Detect Defects to view AI
                  detection results here.
                </p>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="scanner-box">
                  <div className="scan-line"></div>
                  <div className="scanner-grid"></div>
                </div>
                <h3>AI model is analyzing...</h3>
                <p>
                  Detecting coffee bean defect patterns and confidence values.
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="result-content">
                <div className="summary-cards">
                  <div className="metric-card">
                    <span>Total Defects</span>
                    <strong>{result.total_defects ?? 0}</strong>
                  </div>

                  <div className="metric-card">
                    <span>Defect Types</span>
                    <strong>{Object.keys(defectCounts).length}</strong>
                  </div>

                  <div className="metric-card">
                    <span>Detections</span>
                    <strong>{detections.length}</strong>
                  </div>
                </div>

                <div className="defect-section">
                  <h3>Defect Counts</h3>

                  {Object.keys(defectCounts).length > 0 ? (
                    <div className="defect-list">
                      {Object.entries(defectCounts).map(([defect, count]) => (
                        <div className="defect-card" key={defect}>
                          <div className="defect-icon">●</div>
                          <div>
                            <h4>{defect}</h4>
                            <p>{count} detected</p>
                          </div>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="small-muted">
                      No defect count data available.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {result && !loading && (
          <section className="result-section">
            <div className="glass-card result-image-card">
              <div className="card-header">
                <div>
                  <span className="section-label">Visual Output</span>
                  <h2>Detected Image</h2>
                </div>
                <span className="ai-badge">Prediction Result</span>
              </div>

              <div className="detected-image-wrap">
                <img
                  src={getPredictionImageUrl(result.predicted_image_url)}
                  alt="Prediction result"
                />
              </div>
            </div>

            <div className="glass-card details-card">
              <div className="card-header">
                <div>
                  <span className="section-label">Confidence Data</span>
                  <h2>Detection Details</h2>
                </div>
              </div>

              {detections.length > 0 ? (
                <div className="details-table-wrap">
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Class</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detections.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <span className="class-pill">
                              {item.class_name}
                            </span>
                          </td>
                          <td>
                            <div className="confidence-cell">
                              <span>{formatConfidence(item.confidence)}</span>
                              <div className="confidence-bar">
                                <div
                                  style={{
                                    width: `${
                                      Number(item.confidence) <= 1
                                        ? Number(item.confidence) * 100
                                        : Number(item.confidence)
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="small-muted">No detection details available.</p>
              )}
            </div>
          </section>
        )}
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .bean-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          font-family: Inter, Poppins, Arial, sans-serif;
          color: #fff8ee;
          background:
            radial-gradient(circle at top left, rgba(214, 147, 77, 0.28), transparent 35%),
            radial-gradient(circle at bottom right, rgba(111, 78, 55, 0.45), transparent 35%),
            linear-gradient(135deg, #130b07 0%, #24130b 45%, #3b2114 100%);
        }

        .bean-container {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 42px 0 70px;
          position: relative;
          z-index: 2;
        }

        .bg-glow {
          position: fixed;
          width: 360px;
          height: 360px;
          border-radius: 999px;
          filter: blur(70px);
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
          animation: floatGlow 7s ease-in-out infinite;
        }

        .glow-one {
          top: 8%;
          left: 7%;
          background: rgba(199, 125, 55, 0.45);
        }

        .glow-two {
          right: 6%;
          bottom: 10%;
          background: rgba(255, 204, 122, 0.25);
          animation-delay: 1.5s;
        }

        .coffee-particle {
          position: fixed;
          opacity: 0.18;
          z-index: 1;
          animation: floatParticle 8s ease-in-out infinite;
          pointer-events: none;
        }

        .particle-one {
          left: 8%;
          top: 32%;
          font-size: 42px;
        }

        .particle-two {
          right: 12%;
          top: 24%;
          font-size: 32px;
          color: #e8b26a;
          animation-delay: 1s;
        }

        .particle-three {
          left: 18%;
          bottom: 16%;
          font-size: 28px;
          color: #c47b43;
          animation-delay: 2s;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 34px;
          animation: fadeUp 0.8s ease both;
        }

        .badge-row {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .ai-badge,
        .scan-chip,
        .file-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 13px;
          border-radius: 999px;
          border: 1px solid rgba(255, 214, 154, 0.24);
          background: rgba(255, 255, 255, 0.08);
          color: #ffdca8;
          font-size: 13px;
          font-weight: 700;
          backdrop-filter: blur(14px);
          box-shadow: 0 0 22px rgba(255, 186, 96, 0.08);
        }

        .hero-section h1 {
          margin: 0;
          font-size: clamp(42px, 6vw, 76px);
          line-height: 0.95;
          letter-spacing: -3px;
          background: linear-gradient(90deg, #fff4de, #d99655, #ffe1ab);
          -webkit-background-clip: text;
          color: transparent;
          text-shadow: 0 0 40px rgba(255, 199, 125, 0.16);
        }

        .hero-section p {
          max-width: 700px;
          margin: 20px auto 0;
          color: rgba(255, 244, 224, 0.78);
          font-size: 17px;
          line-height: 1.7;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 24px;
          align-items: stretch;
        }

        .glass-card {
          position: relative;
          border: 1px solid rgba(255, 225, 186, 0.16);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.045)),
            rgba(42, 24, 14, 0.72);
          border-radius: 28px;
          padding: 24px;
          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          overflow: hidden;
          animation: fadeUp 0.9s ease both;
        }

        .glass-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255, 226, 176, 0.45), transparent, rgba(171, 96, 44, 0.35));
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }

        .section-label {
          display: block;
          margin-bottom: 5px;
          color: #e8a85f;
          text-transform: uppercase;
          letter-spacing: 1.8px;
          font-size: 12px;
          font-weight: 800;
        }

        .card-header h2 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -0.6px;
          color: #fff7ea;
        }

        .status-dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #ffc36f;
          box-shadow: 0 0 18px #ffc36f;
          animation: pulse 1.7s ease-in-out infinite;
        }

        .upload-box {
          min-height: 230px;
          border: 1.5px dashed rgba(255, 211, 154, 0.42);
          border-radius: 24px;
          background:
            radial-gradient(circle at center, rgba(216, 145, 75, 0.18), transparent 55%),
            rgba(255, 255, 255, 0.055);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 28px;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .upload-box:hover,
        .upload-box.drag-active {
          transform: translateY(-4px);
          border-color: rgba(255, 203, 130, 0.85);
          box-shadow: 0 0 36px rgba(255, 178, 92, 0.18);
          background:
            radial-gradient(circle at center, rgba(216, 145, 75, 0.28), transparent 60%),
            rgba(255, 255, 255, 0.08);
        }

        .upload-icon {
          width: 68px;
          height: 68px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          font-size: 28px;
          color: #2a160c;
          background: linear-gradient(135deg, #ffd89d, #b96d36);
          box-shadow: 0 18px 34px rgba(185, 109, 54, 0.32);
          margin-bottom: 17px;
        }

        .upload-box h3 {
          margin: 0 0 8px;
          font-size: 22px;
          color: #fff7e8;
        }

        .upload-box p {
          max-width: 400px;
          margin: 0;
          color: rgba(255, 241, 215, 0.66);
          line-height: 1.5;
          font-size: 14px;
          word-break: break-word;
        }

        .upload-action {
          margin-top: 18px;
          padding: 9px 16px;
          border-radius: 999px;
          background: rgba(255, 219, 166, 0.12);
          border: 1px solid rgba(255, 219, 166, 0.18);
          color: #ffd99f;
          font-size: 13px;
          font-weight: 800;
        }

        .preview-card {
          margin-top: 20px;
          border-radius: 22px;
          padding: 14px;
          background: rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 222, 178, 0.12);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          color: #ffe8bf;
          font-weight: 700;
          font-size: 14px;
        }

        .file-chip {
          font-size: 11px;
          padding: 6px 10px;
          color: #f8c47c;
        }

        .image-frame,
        .detected-image-wrap {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 220, 170, 0.18);
          background: rgba(255, 255, 255, 0.05);
        }

        .image-frame img,
        .detected-image-wrap img {
          width: 100%;
          display: block;
          object-fit: contain;
          max-height: 420px;
        }

        .image-frame::after,
        .detected-image-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08), transparent 70%);
          transform: translateX(-120%);
          animation: shine 4s ease-in-out infinite;
          pointer-events: none;
        }

        .detect-button {
          width: 100%;
          margin-top: 22px;
          border: none;
          border-radius: 18px;
          padding: 16px 20px;
          color: #2a160c;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #ffe0a3, #d28a47, #8b4b27);
          box-shadow: 0 18px 36px rgba(205, 124, 60, 0.26);
          transition: 0.25s ease;
        }

        .detect-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 22px 46px rgba(255, 174, 82, 0.32);
        }

        .detect-button:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(43, 22, 11, 0.25);
          border-top-color: #2b160b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .analysis-panel {
          min-height: 520px;
        }

        .empty-state,
        .loading-state {
          min-height: 390px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: rgba(255, 240, 216, 0.74);
        }

        .empty-state h3,
        .loading-state h3 {
          margin: 20px 0 8px;
          color: #fff4e2;
          font-size: 24px;
        }

        .empty-state p,
        .loading-state p {
          max-width: 390px;
          margin: 0;
          line-height: 1.6;
        }

        .radar {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          border: 1px solid rgba(255, 210, 142, 0.25);
          position: relative;
          display: grid;
          place-items: center;
          background:
            repeating-radial-gradient(circle, rgba(255, 214, 155, 0.08) 0 2px, transparent 2px 22px);
        }

        .radar span {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, rgba(255, 194, 104, 0.75), transparent 60%);
          animation: spin 2s linear infinite;
        }

        .scanner-box {
          width: min(100%, 360px);
          height: 220px;
          border-radius: 22px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 218, 161, 0.18);
          background:
            linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.03)),
            radial-gradient(circle at center, rgba(220, 143, 72, 0.22), transparent 60%);
        }

        .scanner-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 210, 150, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 210, 150, 0.08) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, #ffd28a, transparent);
          box-shadow: 0 0 25px #ffd28a;
          animation: scanMove 1.6s ease-in-out infinite;
          z-index: 2;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .metric-card {
          padding: 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.075);
          border: 1px solid rgba(255, 225, 182, 0.12);
          transition: 0.25s ease;
        }

        .metric-card:hover,
        .defect-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.1);
        }

        .metric-card span {
          display: block;
          color: rgba(255, 234, 204, 0.65);
          font-size: 12px;
          margin-bottom: 8px;
        }

        .metric-card strong {
          color: #ffd28a;
          font-size: 30px;
        }

        .defect-section h3 {
          margin: 0 0 14px;
          color: #fff5e6;
        }

        .defect-list {
          display: grid;
          gap: 12px;
        }

        .defect-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 14px;
          padding: 15px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 220, 172, 0.12);
          transition: 0.25s ease;
        }

        .defect-icon {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #f7b56c;
          background: rgba(247, 181, 108, 0.12);
          box-shadow: inset 0 0 18px rgba(247, 181, 108, 0.08);
        }

        .defect-card h4 {
          margin: 0;
          color: #fff4df;
          text-transform: capitalize;
        }

        .defect-card p {
          margin: 3px 0 0;
          color: rgba(255, 238, 211, 0.58);
          font-size: 13px;
        }

        .defect-card strong {
          color: #ffd28a;
          font-size: 22px;
        }

        .result-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 24px;
          animation: fadeUp 0.8s ease both;
        }

        .detected-image-wrap {
          min-height: 300px;
          display: grid;
          place-items: center;
        }

        .details-table-wrap {
          width: 100%;
          overflow-x: auto;
          border-radius: 18px;
          border: 1px solid rgba(255, 222, 180, 0.12);
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
          overflow: hidden;
        }

        .details-table th,
        .details-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 222, 180, 0.1);
        }

        .details-table th {
          background: rgba(255, 255, 255, 0.075);
          color: #ffd99f;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .details-table td {
          color: rgba(255, 245, 229, 0.86);
        }

        .class-pill {
          display: inline-flex;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(255, 218, 159, 0.1);
          color: #ffe0ae;
          text-transform: capitalize;
          font-weight: 800;
          font-size: 13px;
        }

        .confidence-cell {
          min-width: 170px;
        }

        .confidence-cell span {
          display: block;
          margin-bottom: 7px;
          color: #fff4df;
          font-weight: 800;
        }

        .confidence-bar {
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .confidence-bar div {
          height: 100%;
          max-width: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #b96d36, #ffd28a);
          box-shadow: 0 0 16px rgba(255, 210, 138, 0.38);
        }

        .small-muted {
          color: rgba(255, 239, 216, 0.62);
          line-height: 1.6;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatGlow {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(20px, -18px, 0) scale(1.08);
          }
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-22px) rotate(12deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.65;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes scanMove {
          0% {
            top: 0;
          }
          50% {
            top: calc(100% - 4px);
          }
          100% {
            top: 0;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-120%);
          }
          45%, 100% {
            transform: translateX(120%);
          }
        }

        @media (max-width: 980px) {
          .dashboard-grid,
          .result-section {
            grid-template-columns: 1fr;
          }

          .analysis-panel {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .bean-container {
            width: min(100% - 22px, 1180px);
            padding-top: 28px;
          }

          .hero-section h1 {
            letter-spacing: -1.5px;
          }

          .hero-section p {
            font-size: 15px;
          }

          .glass-card {
            padding: 18px;
            border-radius: 22px;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .card-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .upload-box {
            min-height: 210px;
            padding: 22px;
          }

          .result-section {
            gap: 18px;
          }
        }
      `}</style>
    </div>
  );
}

export default BeanUploadPage;
