function DetectionResultImage({ imageUrl }) {
  if (!imageUrl) return null;

  return (
    <div className="detection-result-image">
      {/* HEADER */}
      <div className="result-image-header">
        <div>
          <span>AI VISUAL OUTPUT</span>

          <h3>Physical AI Classification Result</h3>
        </div>

        <span className="prediction-chip">3-Model AI Result</span>
      </div>

      {/* DESCRIPTION */}
      <p className="result-image-description">
        Each detected coffee bean is classified using color and shape AI models,
        then assigned to its final physical quality category.
      </p>

      {/* IMAGE */}
      <div className="result-image-frame">
        <img
          src={imageUrl}
          alt="Coffee bean physical AI classification result"
        />
      </div>

      {/* LEGEND */}
      <div className="result-legend">
        <span className="legend-title">Classification Legend</span>

        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot good-dot"></span>
            Good
          </div>

          <div className="legend-item">
            <span className="legend-dot broken-dot"></span>
            Broken
          </div>

          <div className="legend-item">
            <span className="legend-dot black-dot"></span>
            Black
          </div>

          <div className="legend-item">
            <span className="legend-dot black-broken-dot"></span>
            Black + Broken
          </div>

          <div className="legend-item">
            <span className="legend-dot unknown-dot"></span>
            Unknown
          </div>
        </div>
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
          margin-bottom: 8px;
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
          flex-shrink: 0;

          padding: 6px 10px;

          border-radius: 999px;

          color: #ffd69a;

          background:
            rgba(255,255,255,0.05);

          border:
            1px solid rgba(255,220,170,0.1);

          font-size: 10px;
          font-weight: 800;
        }

        .result-image-description {
          margin:
            0 0 15px;

          color:
            rgba(255,238,212,0.46);

          font-size: 11px;
          line-height: 1.55;
        }

        .result-image-frame {
          overflow: hidden;

          border-radius: 18px;

          background:
            rgba(0,0,0,0.17);

          border:
            1px solid rgba(255,220,170,0.1);
        }

        .result-image-frame img {
          width: 100%;
          max-height: 520px;

          display: block;

          object-fit: contain;
        }

        .result-legend {
          margin-top: 15px;
        }

        .legend-title {
          display: block;

          margin-bottom: 9px;

          color:
            rgba(255,238,212,0.45);

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.8px;
        }

        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          padding: 6px 9px;

          border-radius: 999px;

          color:
            rgba(255,240,218,0.76);

          background:
            rgba(255,255,255,0.04);

          border:
            1px solid
            rgba(255,220,170,0.08);

          font-size: 9px;
          font-weight: 750;
        }

        .legend-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;
        }

        .good-dot {
          background: rgb(0,255,0);
        }

        .broken-dot {
          background: rgb(255,165,0);
        }

        .black-dot {
          background: rgb(255,0,0);
        }

        .black-broken-dot {
          background: rgb(255,0,255);
        }

        .unknown-dot {
          background: rgb(0,255,255);
        }

        @media (max-width: 620px) {
          .result-image-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .legend-items {
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
}

export default DetectionResultImage;
