function DetectionResultImage({ imageUrl }) {
  if (!imageUrl) return null;

  return (
    <div className="detection-result-image">
      <div className="result-image-header">
        <div>
          <span>AI VISUAL OUTPUT</span>
          <h3>Detected Image</h3>
        </div>

        <span className="prediction-chip">Prediction Result</span>
      </div>

      <div className="result-image-frame">
        <img src={imageUrl} alt="Coffee bean AI detection result" />
      </div>

      <style>{`
        .detection-result-image {
          height: 100%;
        }

        .result-image-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .result-image-header > div > span {
          display: block;
          margin-bottom: 4px;
          color: #dca05e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .result-image-header h3 {
          margin: 0;
          color: #fff2de;
          font-size: 20px;
        }

        .prediction-chip {
          padding: 6px 10px;
          border-radius: 999px;
          color: #ffd69a;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,220,170,0.1);
          font-size: 10px;
          font-weight: 800;
        }

        .result-image-frame {
          overflow: hidden;
          border-radius: 18px;
          background: rgba(0,0,0,0.17);
          border: 1px solid rgba(255,220,170,0.1);
        }

        .result-image-frame img {
          width: 100%;
          max-height: 460px;
          display: block;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}

export default DetectionResultImage;
