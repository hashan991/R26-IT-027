import { useState } from "react";
import { predictBeanDefects } from "../services/beanService";

function BeanUploadPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
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

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Coffee Bean Defect Detection</h1>

      <div style={{ marginBottom: "20px" }}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      {preview && (
        <div>
          <h3>Selected Image</h3>
          <img
            src={preview}
            alt="Selected"
            style={{ width: "350px", borderRadius: "10px" }}
          />
        </div>
      )}

      <br />

      <button
        onClick={handlePredict}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#6f4e37",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? "Detecting..." : "Detect Defects"}
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Detection Result</h2>

          <p>
            <strong>Total Defects:</strong> {result.total_defects}
          </p>

          <h3>Defect Counts</h3>
          <table
            border="1"
            cellPadding="10"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Defect Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.defect_counts).map(([defect, count]) => (
                <tr key={defect}>
                  <td>{defect}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Detected Image</h3>
          <img
            src={`${API_URL}${result.predicted_image_url}`}
            alt="Prediction"
            style={{ width: "500px", borderRadius: "10px" }}
          />

          <h3>Detection Details</h3>
          <table
            border="1"
            cellPadding="10"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Class</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {result.detections.map((item, index) => (
                <tr key={index}>
                  <td>{item.class_name}</td>
                  <td>{item.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BeanUploadPage;
