function ImageUploader({
  selectedImage,
  preview,
  dragActive,
  onImageChange,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  return (
    <div className="image-uploader">
      <label
        className={`physical-upload-box ${dragActive ? "drag-active" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input type="file" accept="image/*" onChange={onImageChange} hidden />

        <div className="physical-upload-icon">{preview ? "✓" : "⬆"}</div>

        <h3>
          {selectedImage
            ? "Coffee Bean Image Selected"
            : "Upload Coffee Bean Sample"}
        </h3>

        <p>
          {selectedImage
            ? selectedImage.name
            : "Drag & drop or click here to select JPG, PNG or WEBP image"}
        </p>

        <span className="choose-image-button">
          {selectedImage ? "Change Image" : "Choose Image"}
        </span>
      </label>

      {preview && (
        <div className="physical-preview">
          <div className="preview-title">
            <span>Original Sample</span>

            <span className="preview-file-type">{selectedImage?.type}</span>
          </div>

          <div className="preview-image-frame">
            <img src={preview} alt="Coffee bean sample" />
          </div>
        </div>
      )}

      <style>{`
        .image-uploader {
          width: 100%;
        }

        .physical-upload-box {
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;

          padding: 30px;

          cursor: pointer;

          border-radius: 22px;
          border: 1.5px dashed rgba(255, 212, 154, 0.32);

          background:
            radial-gradient(
              circle at center,
              rgba(215, 143, 72, 0.12),
              transparent 60%
            ),
            rgba(255, 255, 255, 0.035);

          transition: 0.25s ease;
        }

        .physical-upload-box:hover,
        .physical-upload-box.drag-active {
          border-color: rgba(255, 205, 135, 0.75);

          background:
            radial-gradient(
              circle at center,
              rgba(215, 143, 72, 0.2),
              transparent 60%
            ),
            rgba(255, 255, 255, 0.055);

          transform: translateY(-2px);
        }

        .physical-upload-icon {
          width: 65px;
          height: 65px;

          display: grid;
          place-items: center;

          margin-bottom: 18px;

          border-radius: 19px;

          color: #2b170c;
          font-size: 25px;
          font-weight: 900;

          background: linear-gradient(
            135deg,
            #ffe1a6,
            #d48b47
          );

          box-shadow:
            0 14px 30px rgba(204, 121, 58, 0.22);
        }

        .physical-upload-box h3 {
          margin: 0 0 8px;

          color: #fff3df;
          font-size: 20px;
        }

        .physical-upload-box p {
          max-width: 420px;

          margin: 0;

          color: rgba(255, 238, 212, 0.5);
          font-size: 13px;
          line-height: 1.6;

          word-break: break-word;
        }

        .choose-image-button {
          margin-top: 17px;

          display: inline-flex;

          padding: 9px 15px;

          border-radius: 999px;

          color: #ffd69b;
          font-size: 12px;
          font-weight: 850;

          border: 1px solid rgba(255, 218, 166, 0.14);

          background: rgba(255, 255, 255, 0.055);
        }

        .physical-preview {
          margin-top: 18px;

          padding: 14px;

          border-radius: 20px;

          background: rgba(0, 0, 0, 0.18);

          border:
            1px solid rgba(255, 220, 170, 0.1);
        }

        .preview-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;

          margin-bottom: 12px;

          color: #ffe7c2;
          font-size: 13px;
          font-weight: 800;
        }

        .preview-file-type {
          padding: 5px 9px;

          border-radius: 999px;

          color: #dca467;
          font-size: 10px;

          background: rgba(255, 255, 255, 0.05);

          border:
            1px solid rgba(255, 220, 170, 0.09);
        }

        .preview-image-frame {
          overflow: hidden;

          border-radius: 17px;

          background: rgba(255, 255, 255, 0.03);

          border:
            1px solid rgba(255, 220, 170, 0.1);
        }

        .preview-image-frame img {
          width: 100%;
          max-height: 440px;

          display: block;

          object-fit: contain;
        }
      `}</style>
    </div>
  );
}

export default ImageUploader;
