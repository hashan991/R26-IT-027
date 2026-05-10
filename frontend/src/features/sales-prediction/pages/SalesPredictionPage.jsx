import { useMemo, useState } from "react";
import { predictSales } from "../services/salesPredictionApi";

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString();
}

function formatDecimal(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toFixed(digits);
}

function getDemandClass(level) {
  if (!level) return "medium";
  const normalized = level.toLowerCase();
  if (normalized.includes("high")) return "high";
  if (normalized.includes("low")) return "low";
  return "medium";
}

function SalesPredictionPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedMonthName = useMemo(
    () => months.find((item) => item.value === Number(month))?.label || "Selected month",
    [month]
  );

  const handlePredict = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictSales({ year, month });
      setResult(data);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Prediction failed. Please check whether the backend is running.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const demandClass = getDemandClass(result?.sales_level);

  return (
    <div className="sales-page">
      <style>{styles}</style>

      <section className="hero-card">
        <div className="hero-left">
          <p className="eyebrow">Coffee Sales Intelligence</p>
          <h1>Time-Based Coffee Sales Prediction</h1>
          <p className="hero-text">
            Enter only the prediction year and month. The system automatically uses the trained model,
            historical sales patterns, weather profile, and monthly seasonality features to predict sales.
          </p>

          <form className="predict-form" onSubmit={handlePredict}>
            <div className="form-group">
              <label>Prediction Year</label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Prediction Month</label>
              <select value={month} onChange={(event) => setMonth(event.target.value)} required>
                {months.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Predicting..." : "Predict Sales"}
            </button>
          </form>

          {error && <div className="error-box">{error}</div>}
        </div>

        <div className="hero-right">
          <div className="glass-card mini-card">
            <span>Input</span>
            <strong>
              {selectedMonthName} {year}
            </strong>
          </div>
          <div className="coffee-orb">☕</div>
          <div className="glass-card mini-card">
            <span>Model</span>
            <strong>Random Forest</strong>
          </div>
        </div>
      </section>

      {result && (
        <section className="results-grid">
          <div className={`result-card main-result ${demandClass}`}>
            <p className="card-label">Predicted Sales</p>
            <h2>{formatNumber(result.predicted_sales_units)}</h2>
            <p className="unit-text">coffee units</p>
            <div className="status-pill">{result.sales_level}</div>
            <p className="small-muted">{result.message}</p>
          </div>

          <div className="result-card">
            <p className="card-label">Predicted Quality</p>
            <h3>{result.predicted_quality_label || "Not available"}</h3>
            <p className="small-muted">
              This is calculated automatically from the quality model stored in the same PKL bundle.
            </p>
            {result.predicted_quality_probabilities && (
              <div className="prob-list">
                {Object.entries(result.predicted_quality_probabilities).map(([label, probability]) => (
                  <div key={label} className="prob-row">
                    <span>{label}</span>
                    <strong>{formatDecimal(probability * 100, 1)}%</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="result-card">
            <p className="card-label">Monthly Comparison</p>
            <h3>
              {result.sales_change_vs_monthly_average_pct > 0 ? "+" : ""}
              {formatDecimal(result.sales_change_vs_monthly_average_pct, 2)}%
            </h3>
            <p className="small-muted">Compared with the historical average for this month.</p>
          </div>
        </section>
      )}

      {result && (
        <section className="details-grid">
          <div className="detail-card">
            <h3>Weather Profile Used by Model</h3>
            <div className="metric-grid">
              <div>
                <span>Rainfall</span>
                <strong>{formatDecimal(result.weather_profile.Rainfall_mm)} mm</strong>
              </div>
              <div>
                <span>Humidity</span>
                <strong>{formatDecimal(result.weather_profile.Humidity_pct)}%</strong>
              </div>
              <div>
                <span>Avg High</span>
                <strong>{formatDecimal(result.weather_profile.Avg_High_C)}°C</strong>
              </div>
              <div>
                <span>Avg Low</span>
                <strong>{formatDecimal(result.weather_profile.Avg_Low_C)}°C</strong>
              </div>
              <div>
                <span>Rainy Days</span>
                <strong>{formatDecimal(result.weather_profile.Rainy_Days, 1)}</strong>
              </div>
              <div>
                <span>Cloud</span>
                <strong>{formatDecimal(result.weather_profile.Cloud_pct)}%</strong>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Decision Support Guide</h3>
            <div className="action-box">
              {demandClass === "high" && (
                <p>
                  High expected demand. Prepare more stock, check raw material availability, and plan
                  production capacity early.
                </p>
              )}
              {demandClass === "medium" && (
                <p>
                  Medium expected demand. Maintain normal production and monitor demand changes during
                  the month.
                </p>
              )}
              {demandClass === "low" && (
                <p>
                  Low expected demand. Avoid overproduction, control inventory, and plan promotions if
                  needed.
                </p>
              )}
            </div>

            <div className="source-box">
              <p>
                <strong>Previous sales source:</strong>{" "}
                {result.data_sources.previous_month_sales_source}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const styles = `
.sales-page {
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(244, 180, 90, 0.35), transparent 34%),
    radial-gradient(circle at top right, rgba(98, 55, 28, 0.30), transparent 28%),
    linear-gradient(135deg, #fff7ed 0%, #f7e4ca 45%, #d6aa72 100%);
  color: #2d1608;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.55fr);
  gap: 28px;
  padding: 34px;
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 28px 80px rgba(70, 34, 12, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(18px);
}

.eyebrow {
  margin: 0 0 10px;
  color: #a15c17;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 12px;
}

h1 {
  margin: 0;
  max-width: 760px;
  font-size: clamp(36px, 5vw, 68px);
  line-height: 0.96;
  letter-spacing: -0.055em;
  color: #3a1a08;
}

.hero-text {
  max-width: 760px;
  margin: 22px 0 0;
  color: #70421e;
  font-size: 17px;
  line-height: 1.65;
}

.predict-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  align-items: end;
  margin-top: 30px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #5b2f14;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 54px;
  border: 1px solid rgba(108, 61, 22, 0.18);
  border-radius: 18px;
  padding: 0 16px;
  background: #fffaf3;
  color: #351807;
  font-size: 16px;
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.form-group input:focus,
.form-group select:focus {
  border-color: #b66a24;
  box-shadow: 0 0 0 4px rgba(182, 106, 36, 0.16);
}

button {
  height: 54px;
  border: none;
  border-radius: 18px;
  padding: 0 24px;
  background: linear-gradient(135deg, #7a3c13, #c87924);
  color: white;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(104, 49, 12, 0.28);
}

button:disabled {
  opacity: 0.68;
  cursor: not-allowed;
}

.hero-right {
  display: grid;
  place-items: center;
  gap: 18px;
  border-radius: 30px;
  background: linear-gradient(160deg, #5a2a10 0%, #9a551d 56%, #e2a45b 100%);
  padding: 26px;
  min-height: 340px;
  position: relative;
  overflow: hidden;
}

.hero-right::before {
  content: "";
  position: absolute;
  inset: 18px;
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-card {
  width: 100%;
  position: relative;
  z-index: 1;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.16);
  color: white;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.24);
}

.mini-card span {
  display: block;
  opacity: 0.78;
  font-size: 13px;
  margin-bottom: 6px;
}

.mini-card strong {
  font-size: 20px;
}

.coffee-orb {
  width: 132px;
  height: 132px;
  display: grid;
  place-items: center;
  position: relative;
  z-index: 1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  color: white;
  font-size: 58px;
  box-shadow: inset 0 0 26px rgba(255, 255, 255, 0.16), 0 24px 50px rgba(0,0,0,0.18);
}

.error-box {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  color: #8a1f11;
  background: #ffe2dc;
  border: 1px solid #ffc2b6;
  font-weight: 700;
}

.results-grid,
.details-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 0.7fr;
  gap: 20px;
  margin-top: 22px;
}

.details-grid {
  grid-template-columns: 1fr 1fr;
}

.result-card,
.detail-card {
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 20px 50px rgba(70, 34, 12, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.62);
}

.card-label {
  margin: 0 0 10px;
  color: #8b541f;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  font-size: 12px;
  font-weight: 900;
}

.main-result h2 {
  margin: 0;
  font-size: clamp(48px, 7vw, 86px);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.result-card h3,
.detail-card h3 {
  margin: 0 0 12px;
  font-size: 26px;
  color: #3a1a08;
}

.unit-text,
.small-muted {
  color: #70421e;
  line-height: 1.55;
}

.status-pill {
  display: inline-flex;
  margin: 18px 0 6px;
  padding: 9px 14px;
  border-radius: 999px;
  background: #3d1b09;
  color: white;
  font-weight: 900;
}

.main-result.high .status-pill { background: #12633a; }
.main-result.medium .status-pill { background: #9d650a; }
.main-result.low .status-pill { background: #9b2418; }

.prob-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.prob-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: #fff6e8;
  color: #54260c;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 18px;
}

.metric-grid div {
  padding: 16px;
  border-radius: 18px;
  background: #fff6e8;
}

.metric-grid span {
  display: block;
  color: #8b541f;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 8px;
}

.metric-grid strong {
  font-size: 20px;
  color: #351807;
}

.action-box,
.source-box {
  padding: 18px;
  border-radius: 18px;
  background: #fff6e8;
  color: #5b2f14;
  line-height: 1.65;
}

.source-box {
  margin-top: 14px;
  background: #f7e3c2;
}

@media (max-width: 980px) {
  .hero-card,
  .results-grid,
  .details-grid,
  .predict-form {
    grid-template-columns: 1fr;
  }

  .sales-page {
    padding: 18px;
  }

  .metric-grid {
    grid-template-columns: 1fr 1fr;
  }
}
`;

export default SalesPredictionPage;
