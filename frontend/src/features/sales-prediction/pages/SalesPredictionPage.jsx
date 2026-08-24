import { useMemo, useState } from "react";
import { predictSales } from "../services/salesPredictionApi";
import MonthlyComparisonChart from "../components/MonthlyComparisonChart";
import FeatureImpactChart from "../components/FeatureImpactChart";
import { downloadSalesReport } from "../services/reportApi";

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

const featureLabels = {
  Year: "Year Trend",
  Month_Num: "Month",
  Rainfall_mm: "Rainfall",
  Humidity_pct: "Humidity",
  Avg_High_C: "Average High Temperature",
  Avg_Low_C: "Average Low Temperature",
  Rainy_Days: "Rainy Days",
  Cloud_pct: "Cloud Cover",
  Wind_mph: "Wind Speed",
  Prev_Month_Sales: "Previous Month Sales",
  Month_Sin: "Seasonal Pattern",
  Month_Cos: "Seasonal Pattern",
};

const featureUnits = {
  Rainfall_mm: "mm",
  Humidity_pct: "%",
  Avg_High_C: "°C",
  Avg_Low_C: "°C",
  Rainy_Days: "days",
  Cloud_pct: "%",
  Wind_mph: "mph",
  Prev_Month_Sales: "units",
};

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toLocaleString();
}

function formatDecimal(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toFixed(digits);
}

function getDemandClass(level) {
  if (!level) return "medium";
  const normalized = level.toLowerCase();
  if (normalized.includes("high")) return "high";
  if (normalized.includes("low")) return "low";
  return "medium";
}

function getFeatureLabel(feature) {
  return featureLabels[feature] || feature;
}

function getFeatureUnit(feature) {
  return featureUnits[feature] || "";
}

function getImpactArrow(direction) {
  if (direction === "positive") return "↑";
  if (direction === "negative") return "↓";
  return "→";
}

function getSalesImpactStrength(value) {
  const impact = Math.abs(Number(value));
  if (impact >= 500) return "Strong";
  if (impact >= 100) return "Moderate";
  return "Small";
}

function getQualityImpactStrength(value) {
  const impact = Math.abs(Number(value));
  if (impact >= 0.15) return "Strong";
  if (impact >= 0.05) return "Moderate";
  return "Small";
}

function getSalesImpactText(direction) {
  if (direction === "positive") {
    return "📈 Pushes predicted sales higher";
  }
  if (direction === "negative") {
    return "📉 Pushes predicted sales lower";
  }
  return "➡️ Has little effect on predicted sales";
}

function getQualityImpactText(direction, qualityLabel) {
  if (direction === "positive") {
    return `✅ Supports ${qualityLabel || "the predicted"} quality`;
  }
  if (direction === "negative") {
    return `⚠️ Reduces support for ${qualityLabel || "the predicted"} quality`;
  }
  return "➡️ Has little effect on the quality prediction";
}

function getEmojiForDemand(level) {
  if (!level) return "📊";
  const normalized = level.toLowerCase();
  if (normalized.includes("high")) return "🔥";
  if (normalized.includes("low")) return "❄️";
  return "📊";
}

function getDemandDescription(level) {
  if (!level) return "";
  const normalized = level.toLowerCase();
  if (normalized.includes("high")) {
    return "Strong market demand expected. Consider increasing production capacity.";
  }
  if (normalized.includes("low")) {
    return "Lower demand expected. Optimize inventory to avoid surplus.";
  }
  return "Balanced demand expected. Maintain standard operations.";
}

function getQualityDescription(label) {
  if (!label) return "";
  const descriptions = {
    "Premium": "🌟 Exceptional quality with superior flavor profile and characteristics",
    "Good": "👍 High quality with consistent flavor and good characteristics",
    "Standard": "📊 Acceptable quality meeting basic standards",
    "Average": "📋 Moderate quality with some variations",
    "Low": "⚠️ Below average quality requiring attention"
  };
  return descriptions[label] || "Quality characteristics are within expected ranges";
}

function SalesPredictionPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
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

    const [reportLoading, setReportLoading] = useState(false);


const handleReportDownload = async () => {

  try {

    setReportLoading(true);

    await downloadSalesReport(
      year,
      month
    );


  } catch (error) {

    console.error(
      "Report download failed:",
      error
    );


    setError(
      "Unable to generate report"
    );


  } finally {

    setReportLoading(false);

  }

};



  };

  const handleReportDownload = async () => {

  try {

    setReportLoading(true);

    await downloadSalesReport(
      year,
      month
    );


  } catch (error) {

    console.error(
      "Report download failed:",
      error
    );


    setError(
      "Unable to generate report"
    );


  } finally {

    setReportLoading(false);

  }

};

  const demandClass = getDemandClass(result?.sales_level);
  const demandEmoji = getEmojiForDemand(result?.sales_level);
  const demandDescription = getDemandDescription(result?.sales_level);
  const qualityDescription = getQualityDescription(result?.predicted_quality_label);

  return (
    <div className="sales-page">
      <style>{styles}</style>

      {/* Hero Section */}
      <section className="hero-card">
        <div className="hero-left">
          <p className="eyebrow">☕ Coffee Sales Intelligence</p>
          <h1>Weather-Based Coffee Sales Prediction</h1>
          <p className="hero-text">
            Select a year and month to forecast coffee sales and quality.
            The system automatically uses historical sales, weather patterns,
            seasonality, and trained Random Forest models to generate the result.
          </p>

          <form className="predict-form" onSubmit={handlePredict}>
            <div className="form-group">
              <label>📅 Prediction Year</label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                required
                placeholder="e.g., 2024"
              />
            </div>

            <div className="form-group">
              <label>📆 Prediction Month</label>
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                required
              >
                {months.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

           <div className="button-group">

  <button
    type="submit"
    disabled={loading}
  >

    {
      loading
      ?
      "⏳ Analyzing..."
      :
      "🔮 Predict"
    }

  </button>



  <button

    type="button"

    className="report-button"

    onClick={handleReportDownload}

    disabled={reportLoading}

  >

    {
      reportLoading
      ?
      "⏳ Generating..."
      :
      "📄 Download Report"
    }

  </button>


</div>
          </form>

          {error && (
            <div className="error-box">
              <span style={{ marginRight: "8px" }}>❌</span>
              {error}
            </div>
          )}
        </div>

        <div className="hero-right">
          <div className="glass-card mini-card">
            <span>Selected Period</span>
            <strong>
              {selectedMonthName} {year}
            </strong>
          </div>
          <div className="coffee-orb">☕</div>
          
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <>
          <div className="results-header">
            <h2>📊 Prediction Results for {selectedMonthName} {year}</h2>
            <p className="results-subtitle">
              Here's what the AI predicts for coffee sales and quality based on weather patterns and historical data.
            </p>
          </div>

          <section className="results-grid">
            {/* Sales Card - Enhanced Explanation */}
            <div className={`result-card main-result ${demandClass}`}>
              <div className="card-header">
                <p className="card-label">Predicted Sales</p>
                <span className="demand-emoji">{demandEmoji}</span>
              </div>
              <h2>{formatNumber(result.predicted_sales_units)}</h2>
              <p className="unit-text">coffee units</p>
              <div className="status-pill">
                <span className="status-icon">
                  {demandClass === "high" ? "🔥" : demandClass === "low" ? "❄️" : "📊"}
                </span>
                {result.sales_level || "Moderate"} Demand
              </div>
              
              {/* Enhanced Explanation Section */}
              <div className="explanation-box">
                <div className="explanation-header">
                  <span className="explanation-icon">💡</span>
                  <strong>What this means</strong>
                </div>
                <p className="explanation-text">{result.message || demandDescription}</p>
                <div className="explanation-details">
                  <div className="detail-item">
                    <span className="detail-label">📈 Market Outlook:</span>
                    <span className="detail-value">
                      {demandClass === "high" ? "Strong growth expected" : 
                       demandClass === "low" ? "Cautious outlook" : 
                       "Stable market conditions"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🎯 Action Priority:</span>
                    <span className="detail-value">
                      {demandClass === "high" ? "High - Prepare immediately" : 
                       demandClass === "low" ? "Low - Monitor closely" : 
                       "Medium - Maintain operations"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Card - Enhanced Explanation */}
            <div className="result-card">
              <p className="card-label">⭐ Predicted Coffee Quality</p>
              <h3 className="quality-label">{result.predicted_quality_label || "Not available"}</h3>
              
              {/* Enhanced Quality Description */}
              <div className="quality-explanation">
                <p className="quality-description">{qualityDescription}</p>
                <div className="quality-factors">
                  <span className="factor-tag">🌱 Growing conditions</span>
                  <span className="factor-tag">🌤️ Weather patterns</span>
                  <span className="factor-tag">📊 Processing methods</span>
                </div>
              </div>

              <p className="small-muted">
                Estimated quality category based on the weather conditions used
                by the trained quality model.
              </p>

              {result.predicted_quality_probabilities && (
                <div className="prob-list">
                  <div className="prob-header">
                    <span>Quality Level</span>
                    <span>Probability</span>
                  </div>
                  {Object.entries(result.predicted_quality_probabilities).map(([label, probability]) => (
                    <div key={label} className="prob-row">
                      <span className="prob-label">
                        {label === "Premium" ? "🌟" : 
                         label === "Good" ? "👍" : 
                         label === "Standard" ? "📊" : "📋"} {label}
                      </span>
                      <div className="prob-right">
                        <div className="prob-track">
                          <div
                            className="prob-fill"
                            style={{ width: `${Math.min(probability * 100, 100)}%` }}
                          />
                        </div>
                        <strong>{formatDecimal(probability * 100, 1)}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Comparison Card - Enhanced Explanation */}
            <div className="result-card">
              <p className="card-label">📈 Monthly Comparison</p>
              {result.monthly_comparison ? (
                <>
                  <MonthlyComparisonChart data={result.monthly_comparison} />
                  <div className="comparison-note">
                    <span className="note-icon">📊</span>
                    <span>Comparing with historical sales for {selectedMonthName}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="comparison-value">
                    <span className="comparison-icon">
                      {result.sales_change_vs_monthly_average_pct > 0 ? "📈" : "📉"}
                    </span>
                    <h3>
                      {result.sales_change_vs_monthly_average_pct > 0 ? "+" : ""}
                      {formatDecimal(result.sales_change_vs_monthly_average_pct, 2)}%
                    </h3>
                  </div>
                  
                  {/* Enhanced Comparison Explanation */}
                  <div className="comparison-explanation">
                    <p className="comparison-status">
                      {result.sales_change_vs_monthly_average_pct > 0
                        ? "✅ Above the historical average for this month"
                        : result.sales_change_vs_monthly_average_pct < 0
                        ? "⚠️ Below the historical average for this month"
                        : "➡️ Matches the historical average for this month"}
                    </p>
                    <div className="comparison-details">
                      <div className="detail-item">
                        <span className="detail-label">📊 Historical Average:</span>
                        <span className="detail-value">
                          {formatNumber(result.historical_monthly_average || 0)} units
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📈 Trend Direction:</span>
                        <span className="detail-value">
                          {result.sales_change_vs_monthly_average_pct > 5 ? "Strong upward" :
                           result.sales_change_vs_monthly_average_pct > 0 ? "Moderate upward" :
                           result.sales_change_vs_monthly_average_pct < -5 ? "Strong downward" :
                           result.sales_change_vs_monthly_average_pct < 0 ? "Moderate downward" :
                           "Stable"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="small-muted">
                    {result.sales_change_vs_monthly_average_pct > 0
                      ? "This suggests stronger than usual demand for this month"
                      : result.sales_change_vs_monthly_average_pct < 0
                      ? "This suggests weaker than usual demand for this month"
                      : "This aligns with typical patterns for this month"}
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Details Grid - Enhanced Explanations */}
          <section className="details-grid">
            <div className="detail-card">
              <div className="section-title-row">
                <div>
                  <p className="card-label">🌤️ Model Input</p>
                  <h3>Weather Profile</h3>
                  <p className="input-description">
                    These weather conditions were used by the AI to make its prediction
                  </p>
                </div>
                <span className="info-chip">Estimated</span>
              </div>

              <div className="metric-grid">
                <div>
                  <span>🌧️ Rainfall</span>
                  <strong>{formatDecimal(result.weather_profile?.Rainfall_mm)} mm</strong>
                  <span className="metric-hint">
                    {result.weather_profile?.Rainfall_mm > 100 ? "High rainfall" : 
                     result.weather_profile?.Rainfall_mm > 50 ? "Moderate rainfall" : 
                     "Low rainfall"}
                  </span>
                </div>
                <div>
                  <span>💧 Humidity</span>
                  <strong>{formatDecimal(result.weather_profile?.Humidity_pct)}%</strong>
                  <span className="metric-hint">
                    {result.weather_profile?.Humidity_pct > 70 ? "High humidity" : 
                     result.weather_profile?.Humidity_pct > 50 ? "Moderate humidity" : 
                     "Low humidity"}
                  </span>
                </div>
                <div>
                  <span>🌡️ Avg High</span>
                  <strong>{formatDecimal(result.weather_profile?.Avg_High_C)}°C</strong>
                  <span className="metric-hint">
                    {result.weather_profile?.Avg_High_C > 30 ? "Hot conditions" : 
                     result.weather_profile?.Avg_High_C > 20 ? "Warm conditions" : 
                     "Cool conditions"}
                  </span>
                </div>
                <div>
                  <span>🌡️ Avg Low</span>
                  <strong>{formatDecimal(result.weather_profile?.Avg_Low_C)}°C</strong>
                  <span className="metric-hint">
                    {result.weather_profile?.Avg_Low_C > 20 ? "Warm nights" : 
                     result.weather_profile?.Avg_Low_C > 10 ? "Mild nights" : 
                     "Cool nights"}
                  </span>
                </div>
                <div>
                  <span>☔ Rainy Days</span>
                  <strong>{formatDecimal(result.weather_profile?.Rainy_Days, 1)}</strong>
                  <span className="metric-hint">
                    {result.weather_profile?.Rainy_Days > 15 ? "Frequent rain" : 
                     result.weather_profile?.Rainy_Days > 8 ? "Moderate rain" : 
                     "Few rainy days"}
                  </span>
                </div>
                <div>
                  <span>☁️ Cloud Cover</span>
                  <strong>{formatDecimal(result.weather_profile?.Cloud_pct)}%</strong>
                  <span className="metric-hint">
                    {result.weather_profile?.Cloud_pct > 70 ? "Very cloudy" : 
                     result.weather_profile?.Cloud_pct > 40 ? "Partly cloudy" : 
                     "Clear skies"}
                  </span>
                </div>
                <div>
                  <span>💨 Wind Speed</span>
                  <strong>{formatDecimal(result.weather_profile?.Wind_mph)} mph</strong>
                  <span className="metric-hint">
                    {result.weather_profile?.Wind_mph > 15 ? "Windy conditions" : 
                     result.weather_profile?.Wind_mph > 8 ? "Moderate winds" : 
                     "Calm conditions"}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <p className="card-label">💡 Recommended Action</p>
              <h3>Decision Support Guide</h3>
              <p className="action-subtitle">
                Based on the predicted demand level, here are recommended actions
              </p>

              <div className={`action-box ${demandClass}`}>
                <div className="action-icon">
                  {demandClass === "high" ? "🚀" : demandClass === "low" ? "🛑" : "⚖️"}
                </div>
                <strong>
                  {demandClass === "high" ? "Prepare for high demand" : 
                   demandClass === "low" ? "Avoid overproduction" : 
                   "Maintain normal production"}
                </strong>
                <p>
                  {demandClass === "high" && 
                    "Increase stock availability, verify raw material supply, and prepare production capacity early. Consider hiring temporary staff if needed."}
                  {demandClass === "medium" && 
                    "Keep regular production levels and monitor any demand changes during the month. Maintain standard inventory levels."}
                  {demandClass === "low" && 
                    "Control inventory, reduce unnecessary production, and consider promotional activity if needed. Focus on cost optimization."}
                </p>
                
                {/* Additional Action Details */}
                <div className="action-details">
                  <div className="action-detail-item">
                    <span className="action-detail-icon">📋</span>
                    <div>
                      <strong>Priority Level:</strong>
                      <span className="priority-level">
                        {demandClass === "high" ? "🔴 High" : 
                         demandClass === "low" ? "🟢 Low" : 
                         "🟡 Medium"}
                      </span>
                    </div>
                  </div>
                  <div className="action-detail-item">
                    <span className="action-detail-icon">⏰</span>
                    <div>
                      <strong>Timeline:</strong>
                      <span>
                        {demandClass === "high" ? "Immediate action required" : 
                         demandClass === "low" ? "Monitor over next 2-3 weeks" : 
                         "Standard weekly review"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="source-box">
                <span>📋 Previous sales information</span>
                <strong>
                  {result.data_sources?.previous_month_sales_source || "Not available"}
                </strong>
                <p className="source-hint">
                  This data source was used to understand historical patterns
                </p>
              </div>
            </div>
          </section>

          {/* XAI Section - Enhanced Explanations */}
          {result?.xai && (
            <section className="xai-section">
              <div className="xai-header">
                <div>
                  <div className="xai-title-icon">🧠</div>
                  <h2>Why did the AI make this prediction?</h2>
                  <p className="small-muted">
                    The system highlights the main factors that influenced the
                    prediction so the result is easier to understand and trust.
                  </p>
                </div>
                
              </div>

              <div className="xai-grid">
                {/* Sales Explanation */}
                <div className="xai-card">
                  <div className="xai-card-header">
                    <div>
                      <p className="card-label">Sales Explanation</p>
                      <h3>Why Sales Were Predicted This Way</h3>
                    </div>
                    <span className="sales-icon">📈</span>
                  </div>

                  <p className="xai-intro">
                    These are the five strongest factors affecting the predicted
                    sales value. Hover over the bars for more details.
                  </p>

                  <FeatureImpactChart
                    title="Top Factors Affecting Sales Prediction"
                    data={result.xai.sales_explanation}
                    type="sales"
                  />

                  {/* Enhanced XAI List with Explanations */}
                  {result.xai.sales_explanation?.length ? (
                    <div className="xai-list">
                      <div className="xai-list-header">
                        <span>Rank</span>
                        <span>Factor</span>
                        <span>Impact</span>
                      </div>
                      {result.xai.sales_explanation.map((item, index) => {
                        const strength = getSalesImpactStrength(item.shap_value);
                        return (
                          <div className="friendly-xai-item" key={`${item.feature}-${index}`}>
                            <div className="factor-rank">{index + 1}</div>
                            <div className="factor-content">
                              <div className="factor-heading">
                                <strong>{getFeatureLabel(item.feature)}</strong>
                                <span className={`strength-chip ${strength.toLowerCase()}`}>
                                  {strength} influence
                                </span>
                              </div>
                              <p>{getSalesImpactText(item.direction)}</p>
                              <div className="factor-explanation">
                                <span className="factor-detail">
                                  {item.direction === "positive" ? "📈 Driving sales up" : 
                                   item.direction === "negative" ? "📉 Driving sales down" : 
                                   "➡️ Minimal impact"}
                                </span>
                              </div>
                            </div>
                            <div className={`direction-panel ${item.direction}`}>
                              <span className="direction-arrow">{getImpactArrow(item.direction)}</span>
                              <small>
                                {item.direction === "positive"
                                  ? "Increase"
                                  : item.direction === "negative"
                                  ? "Decrease"
                                  : "Neutral"}
                              </small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="xai-empty">Sales explanation is not available.</div>
                  )}
                </div>

                {/* Quality Explanation */}
                <div className="xai-card">
                  <div className="xai-card-header">
                    <div>
                      <p className="card-label">Quality Explanation</p>
                      <h3>Why Quality Was Predicted {result.predicted_quality_label || ""}</h3>
                    </div>
                    <span className="quality-icon">🌱</span>
                  </div>

                  <p className="xai-intro">
                    These factors had the strongest influence on the predicted
                    coffee quality category.You can undrstand the science behind coffee quality assessment.
                  </p>

                  <FeatureImpactChart
                    title="Environmental Factors Affecting Quality"
                    data={result.xai.quality_explanation}
                    type="quality"
                  />

                  {result.xai.quality_explanation?.length ? (
                    <div className="xai-list">
                      <div className="xai-list-header">
                        <span>Rank</span>
                        <span>Factor</span>
                        <span>Impact</span>
                      </div>
                      {result.xai.quality_explanation.map((item, index) => {
                        const strength = getQualityImpactStrength(item.shap_value);
                        return (
                          <div className="friendly-xai-item" key={`${item.feature}-${index}`}>
                            <div className="factor-rank">{index + 1}</div>
                            <div className="factor-content">
                              <div className="factor-heading">
                                <strong>{getFeatureLabel(item.feature)}</strong>
                                <span className={`strength-chip ${strength.toLowerCase()}`}>
                                  {strength} influence
                                </span>
                              </div>
                              <p>{getQualityImpactText(item.direction, result.predicted_quality_label)}</p>
                              <div className="factor-explanation">
                                <span className="factor-detail">
                                  {item.direction === "positive" ? "✅ Supporting quality" : 
                                   item.direction === "negative" ? "⚠️ Reducing quality" : 
                                   "➡️ Minimal effect"}
                                </span>
                              </div>
                            </div>
                            <div className={`direction-panel ${item.direction}`}>
                              <span className="direction-arrow">{getImpactArrow(item.direction)}</span>
                              <small>
                                {item.direction === "positive"
                                  ? "Supports"
                                  : item.direction === "negative"
                                  ? "Opposes"
                                  : "Neutral"}
                              </small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="xai-empty">Quality explanation is not available.</div>
                  )}
                </div>
              </div>

              <div className="xai-note">
                <div className="note-icon">💡</div>
               <div style={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "28px",
  padding: "0 20px",
  width: "100%"
}}>
  <div style={{
    maxWidth: "850px",
    width: "100%",
    background: "linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)",
    borderRadius: "20px",
    padding: "36px 44px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #ede8e0",
    textAlign: "center",
    margin: "0 auto"
  }}>
    {/* Header */}
    <div style={{
      marginBottom: "20px",
      textAlign: "center"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "8px"
      }}>
        <span style={{ fontSize: "30px" }}>📖</span>
        <h4 style={{
          margin: 0,
          fontSize: "22px",
          color: "#2c1810",
          fontWeight: "700"
        }}>
          How to Read These Explanations
        </h4>
      </div>
      <p style={{
        fontSize: "16px",
        color: "#6b5a4a",
        margin: 0,
        lineHeight: "1.6",
        maxWidth: "600px",
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        The AI identifies and explains the key factors that influenced its prediction
      </p>
    </div>

    {/* Items Container - Centered */}
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      alignItems: "center",
      width: "100%",
      marginBottom: "20px"
    }}>
      {/* Supporting - Centered */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "white",
        padding: "16px 28px",
        borderRadius: "14px",
        width: "100%",
        maxWidth: "550px",
        border: "2px solid #d4e8dc",
        boxShadow: "0 2px 8px rgba(45, 125, 70, 0.06)",
        textAlign: "left"
      }}>
        <span style={{ fontSize: "28px", flexShrink: 0 }}>📈</span>
        <div style={{ textAlign: "left" }}>
          <span style={{ 
            fontSize: "16px", 
            fontWeight: "700", 
            color: "#2d7d46",
            display: "block",
            marginBottom: "2px"
          }}>
            Supporting Factors
          </span>
          <span style={{ 
            fontSize: "14px", 
            color: "#4a3a2a"
          }}>
            Helped move the prediction toward the final result
          </span>
        </div>
      </div>

      {/* Opposing - Centered */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "white",
        padding: "16px 28px",
        borderRadius: "14px",
        width: "100%",
        maxWidth: "550px",
        border: "2px solid #f5d6d4",
        boxShadow: "0 2px 8px rgba(192, 57, 43, 0.06)",
        textAlign: "left"
      }}>
        <span style={{ fontSize: "28px", flexShrink: 0 }}>📉</span>
        <div style={{ textAlign: "left" }}>
          <span style={{ 
            fontSize: "16px", 
            fontWeight: "700", 
            color: "#c0392b",
            display: "block",
            marginBottom: "2px"
          }}>
            Opposing Factors
          </span>
          <span style={{ 
            fontSize: "14px", 
            color: "#4a3a2a"
          }}>
            Had the opposite effect on the prediction
          </span>
        </div>
      </div>

      {/* Neutral - Centered */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "white",
        padding: "16px 28px",
        borderRadius: "14px",
        width: "100%",
        maxWidth: "550px",
        border: "2px solid #e8e0d8",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        textAlign: "left"
      }}>
        <span style={{ fontSize: "28px", flexShrink: 0 }}>➡️</span>
        <div style={{ textAlign: "left" }}>
          <span style={{ 
            fontSize: "16px", 
            fontWeight: "700", 
            color: "#8a7a6a",
            display: "block",
            marginBottom: "2px"
          }}>
            Neutral Factors
          </span>
          <span style={{ 
            fontSize: "14px", 
            color: "#4a3a2a"
          }}>
            Had minimal impact on the prediction
          </span>
        </div>
      </div>
    </div>

    {/* Footer Tip - Centered */}
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "14px 20px",
      background: "#f8f6f4",
      borderRadius: "12px",
      border: "1px solid #ede8e0",
      textAlign: "center"
    }}>
      
    </div>
  </div>
</div>
              </div>
            </section>
          )}
        </>
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
  transition: all 0.2s;
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
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(104, 49, 12, 0.35);
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

.hero-tagline {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
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
  box-shadow: inset 0 0 26px rgba(255, 255, 255, 0.16), 0 24px 50px rgba(0, 0, 0, 0.18);
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

.results-header {
  margin-top: 30px;
  margin-bottom: 16px;
}

.results-header h2 {
  margin: 0;
  font-size: 28px;
  color: #3a1a08;
}

.results-subtitle {
  margin: 8px 0 0;
  color: #70421e;
  font-size: 16px;
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
  transition: all 0.3s;
}

.result-card:hover,
.detail-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 60px rgba(70, 34, 12, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demand-emoji {
  font-size: 28px;
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
  color: #3a1a08;
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.quality-label {
  font-size: 32px !important;
  color: #2d7d46 !important;
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

/* Enhanced Explanation Styles */
.explanation-box {
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(108, 61, 22, 0.12);
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.explanation-icon {
  font-size: 18px;
}

.explanation-text {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #3d2a1a;
}

.explanation-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  background: white;
  border-radius: 10px;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  color: #8b541f;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 13px;
  font-weight: 500;
  color: #3a1a08;
}

.quality-explanation {
  margin: 12px 0;
  padding: 12px;
  background: rgba(45, 125, 70, 0.08);
  border-radius: 12px;
  border-left: 3px solid #2d7d46;
}

.quality-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #1a4a2a;
  font-weight: 500;
}

.quality-factors {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.factor-tag {
  padding: 4px 10px;
  background: white;
  border-radius: 12px;
  font-size: 12px;
  color: #3d2a1a;
  border: 1px solid rgba(108, 61, 22, 0.1);
}

.prob-header {
  display: grid;
  grid-template-columns: 90px 1fr;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #8b541f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.comparison-note {
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(139, 84, 31, 0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #70421e;
}

.comparison-explanation {
  margin: 12px 0;
}

.comparison-status {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #3a1a08;
}

.comparison-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.input-description {
  font-size: 13px;
  color: #70421e;
  margin: 4px 0 0 0;
}

.metric-hint {
  display: block;
  font-size: 11px;
  color: #8b541f;
  margin-top: 4px;
  font-weight: 500;
}

.action-subtitle {
  font-size: 13px;
  color: #70421e;
  margin: -8px 0 16px 0;
}

.action-details {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
}

.action-detail-icon {
  font-size: 16px;
}

.action-detail-item strong {
  display: block;
  font-size: 11px;
  color: #8b541f;
}

.action-detail-item span {
  font-size: 13px;
  color: #3a1a08;
}

.priority-level {
  font-weight: 600;
}

.source-hint {
  font-size: 12px;
  color: #8b541f;
  margin: 4px 0 0 0;
  font-style: italic;
}

.xai-list-header {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  gap: 14px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #8b541f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid rgba(108, 61, 22, 0.1);
  margin-bottom: 8px;
}

.factor-explanation {
  margin-top: 4px;
}

.factor-detail {
  font-size: 12px;
  color: #70421e;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 18px 0 6px;
  padding: 9px 14px;
  border-radius: 999px;
  background: #3d1b09;
  color: white;
  font-weight: 900;
}

.status-icon {
  font-size: 16px;
}

.main-result.high .status-pill {
  background: #12633a;
}

.main-result.medium .status-pill {
  background: #9d650a;
}

.main-result.low .status-pill {
  background: #9b2418;
}

.prob-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.prob-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 14px;
  background: #fff6e8;
  color: #54260c;
}

.prob-label {
  font-weight: 600;
}

.prob-right {
  display: grid;
  grid-template-columns: 1fr 56px;
  align-items: center;
  gap: 10px;
}

.prob-track {
  height: 8px;
  border-radius: 999px;
  background: #ead7bb;
  overflow: hidden;
}

.prob-fill {
  height: 100%;
  border-radius: inherit;
  background: #8f551e;
}

.comparison-value {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comparison-icon {
  font-size: 32px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.info-chip {
  padding: 7px 11px;
  border-radius: 999px;
  background: #f3e1c6;
  color: #734016;
  font-size: 11px;
  font-weight: 900;
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
  transition: all 0.2s;
}

.metric-grid div:hover {
  background: #f5e6d0;
  transform: scale(1.02);
}

.metric-grid span:not(.metric-hint) {
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

.action-box .action-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.action-box strong {
  display: block;
  font-size: 18px;
  margin-bottom: 6px;
}

.action-box.high {
  background: #e7f5ec;
  color: #145531;
}

.action-box.medium {
  background: #fff3d7;
  color: #7a5106;
}

.action-box.low {
  background: #ffe7e2;
  color: #8d271c;
}

.source-box {
  margin-top: 14px;
  background: #f7e3c2;
}

.source-box span {
  display: block;
  font-size: 12px;
  margin-bottom: 5px;
  color: #8b541f;
}

.xai-section {
  margin-top: 22px;
  padding: 30px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 20px 50px rgba(70, 34, 12, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.62);
}

.xai-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.xai-title-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.xai-header h2 {
  margin: 0 0 10px;
  font-size: 32px;
  color: #3a1a08;
}

.xai-badge {
  flex-shrink: 0;
  padding: 10px 18px;
  border-radius: 999px;
  background: #4d250f;
  color: white;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.05em;
}

.xai-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.xai-card {
  padding: 24px;
  border-radius: 24px;
  background: #fff7eb;
  border: 1px solid rgba(108, 61, 22, 0.10);
}

.xai-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.xai-card h3 {
  margin: 0;
  color: #3a1a08;
  font-size: 23px;
}

.sales-icon,
.quality-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: white;
  font-size: 22px;
}

.xai-intro {
  color: #70421e;
  line-height: 1.55;
  margin: 12px 0 0;
}

.xai-list {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.friendly-xai-item {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border-radius: 18px;
  background: white;
  border: 1px solid rgba(108, 61, 22, 0.10);
  transition: all 0.2s;
}

.friendly-xai-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.factor-rank {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f4e4ca;
  color: #6a3716;
  font-size: 13px;
  font-weight: 900;
}

.factor-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.factor-heading > strong {
  color: #351807;
  font-size: 15px;
}

.factor-content p {
  margin: 7px 0;
  color: #70421e;
  font-size: 13px;
  line-height: 1.45;
}

.strength-chip {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
}

.strength-chip.strong {
  background: #f3d7ad;
  color: #6c390e;
}

.strength-chip.moderate {
  background: #fff0c8;
  color: #74530c;
}

.strength-chip.small {
  background: #eee8df;
  color: #65594c;
}

.direction-panel {
  min-width: 86px;
  padding: 10px 12px;
  border-radius: 16px;
  text-align: center;
  font-weight: 900;
}

.direction-panel.positive {
  background: #dcf5e6;
  color: #12633a;
}

.direction-panel.negative {
  background: #ffe3df;
  color: #9b2418;
}

.direction-panel.neutral {
  background: #fff3c7;
  color: #786016;
}

.direction-arrow {
  display: block;
  font-size: 22px;
  line-height: 1;
}

.direction-panel small {
  display: block;
  margin-top: 4px;
  font-size: 10px;
}

.xai-empty {
  margin-top: 20px;
  padding: 18px;
  border-radius: 16px;
  background: white;
  color: #70421e;
}

.xai-note {
  display: flex;
  gap: 14px;
  margin-top: 20px;
  padding: 18px;
  border-radius: 18px;
  background: #f7e3c2;
  color: #5b2f14;
}

.note-icon {
  font-size: 28px;
}

.xai-note strong {
  display: block;
  margin-bottom: 5px;
  font-size: 16px;
}

.xai-note p {
  margin: 0;
  line-height: 1.6;
  font-size: 13px;
}

@media (max-width: 980px) {
  .hero-card,
  .results-grid,
  .details-grid,
  .predict-form,
  .xai-grid {
    grid-template-columns: 1fr;
  }

  .sales-page {
    padding: 18px;
  }

  .metric-grid {
    grid-template-columns: 1fr 1fr;
  }

  .xai-header {
    flex-direction: column;
  }
  
  .explanation-details,
  .comparison-details,
  .action-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .friendly-xai-item {
    grid-template-columns: 34px 1fr;
  }

  .direction-panel {
    grid-column: 2;
    justify-self: start;
  }

  .prob-row,
  .prob-right {
    grid-template-columns: 1fr;
  }

  .comparison-chart-card {
    margin-top: 20px;
    padding: 20px;
    background: #fff7eb;
    border-radius: 22px;
  }

  .comparison-chart-card h3 {
    margin: 0;
    color: #3a1a08;
    font-size: 22px;
  }

  .comparison-description {
    color: #70421e;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .comparison-summary {
    margin-top: 15px;
    padding: 15px;
    background: #f7e3c2;
    border-radius: 15px;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .comparison-summary strong {
    font-size: 24px;
    color: #12633a;
  }

  .comparison-summary span {
    font-size: 13px;
    color: #70421e;
  }

  .results-header h2 {
    font-size: 22px;
  }

  .xai-header h2 {
    font-size: 24px;
  }

  .xai-badge {
    align-self: flex-start;
  }
  
  .xai-list-header {
    display: none;
  }

  .button-group {

  display:flex;

  gap:12px;

  align-items:center;

}



.report-button {

  background:
  linear-gradient(
    135deg,
    #14532d,
    #22c55e
  );


}


.report-button:hover {

  transform:translateY(-2px);

}


@media(max-width:980px){

.button-group{

 flex-direction:column;

 width:100%;

}


.button-group button{

 width:100%;

}

}

}
`;

export default SalesPredictionPage;