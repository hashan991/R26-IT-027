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
            The system automatically combines historical sales, weather patterns,
            seasonality, and trained Random Forest models to generate a clear business forecast.
          </p>

          <div className="hero-badges">
            <span><i className="badge-dot" /> Weather-aware forecast</span>
            <span>✦ Explainable AI</span>
            <span>◫ Monthly planning</span>
          </div>

          <form className="predict-form" onSubmit={handlePredict}>
            <div className="form-group">
              <label>📅 Prediction Year</label>
              <input
                type="number"
                min="2000"
                max="2027"
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
          <div className="hero-ambient hero-ambient-one" />
          <div className="hero-ambient hero-ambient-two" />

          <div className="roastery-topline">
            <div className="engine-status">
              <span className="live-dot" />
              <span>Forecast engine ready</span>
            </div>
           
          </div>

          <div className="coffee-visual" aria-hidden="true">
            <div className="coffee-ring ring-one" />
            <div className="coffee-ring ring-two" />
            <span className="coffee-bean bean-one" />
            <span className="coffee-bean bean-two" />
            <span className="coffee-bean bean-three" />
            <span className="coffee-bean bean-four" />
            <div className="coffee-orb">
              <span className="steam steam-one">~</span>
              <span className="steam steam-two">~</span>
              <span className="cup-icon">☕</span>
            </div>
          </div>

          <div className="hero-insight-grid">
            <div className="glass-card mini-card">
              <span>Forecast Period</span>
              <strong>{selectedMonthName} {year}</strong>
            </div>
            <div className="glass-card mini-card">
              <span>Prediction Signals</span>
              <strong>Weather + Sales</strong>
            </div>
          </div>

          <div className="hero-mini-note">
            <span>✦</span>
            <p>Built for production planning with transparent, explainable predictions.</p>
          </div>
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
                {result.sales_level || "Moderate"} 
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
                    These weather conditions were used to make the prediction
                  </p>
                </div>
              
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

              <div className="xai-guide">
                <div className="guide-heading">
                  <span className="guide-book">📖</span>
                  <div>
                    <p className="card-label">XAI Reading Guide</p>
                    <h3>How to Read These Explanations</h3>
                    <p><h4>The AI highlights the factors that pushed the final prediction up, down, or had only a small effect.</h4></p>
                  </div>
                </div>

                <div className="guide-grid">
                  <div className="guide-item supporting">
                    <span className="guide-icon">↗</span>
                    <div>
                      <strong>Supporting Factors</strong>
                      <span>Helped move the prediction toward the final result.</span>
                    </div>
                  </div>

                  <div className="guide-item opposing">
                    <span className="guide-icon">↘</span>
                    <div>
                      <strong>Opposing Factors</strong>
                      <span>Worked against the final prediction.</span>
                    </div>
                  </div>

                  <div className="guide-item neutral">
                    <span className="guide-icon">→</span>
                    <div>
                      <strong>Neutral Factors</strong>
                      <span>Had only a small influence on the prediction.</span>
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
:root {
  --coffee-950: #24140f;
  --coffee-900: #2f1b14;
  --coffee-850: #3a2118;
  --coffee-800: #47291e;
  --coffee-700: #5d3829;
  --coffee-600: #765039;
  --coffee-500: #9a6b45;
  --caramel-500: #c58a4d;
  --caramel-400: #d8a46a;
  --cream-50: #fffdf9;
  --cream-100: #fff9f1;
  --cream-150: #fbf2e8;
  --cream-200: #f3e6d7;
  --cream-300: #e8d4bf;
  --sage-700: #3f5d46;
  --sage-600: #4f6f53;
  --sage-100: #e8f0e8;
  --danger-700: #8f4035;
  --danger-100: #f9e8e4;
  --gold-700: #7b5b2b;
  --gold-100: #f7edd9;
  --text: #30231d;
  --muted: #78685f;
  --line: rgba(73, 44, 31, 0.12);
  --shadow-sm: 0 8px 22px rgba(43, 24, 18, 0.07);
  --shadow-md: 0 18px 45px rgba(43, 24, 18, 0.10);
  --shadow-lg: 0 30px 80px rgba(43, 24, 18, 0.15);
}

* { box-sizing: border-box; }

.sales-page {
  min-height: 100vh;
  font-size: 16px;
  padding: 34px;
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at 7% -5%, rgba(197, 138, 77, 0.22), transparent 30%),
    radial-gradient(circle at 95% 12%, rgba(95, 119, 95, 0.12), transparent 28%),
    linear-gradient(145deg, #fffdf9 0%, #f7eee4 48%, #ead4bd 100%);
  position: relative;
  overflow-x: hidden;
}

.sales-page::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.34;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(75, 45, 31, 0.08) 1px, transparent 0);
  background-size: 24px 24px;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,.7), transparent 72%);
}

.sales-page > * { position: relative; z-index: 1; }

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(330px, 0.65fr);
  gap: 30px;
  padding: 38px;
  border-radius: 32px;
  border: 1px solid rgba(88, 55, 38, 0.12);
  background: rgba(255, 253, 249, 0.93);
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.95);
  backdrop-filter: blur(18px);
}

.hero-left { align-self: center; }

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding: 8px 12px;
  border: 1px solid rgba(154, 107, 69, 0.18);
  border-radius: 999px;
  color: var(--coffee-600);
  background: rgba(197, 138, 77, 0.09);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.sales-page h1 {
  max-width: 820px;
  margin: 0;
  color: var(--coffee-950);
  font-size: clamp(42px, 5vw, 70px);
  line-height: 0.98;
  letter-spacing: -0.055em;
}

.hero-text {
  max-width: 790px;
  margin: 22px 0 0;
  color: #6f6057;
  font-size: 19px;
  line-height: 1.72;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 18px;
}

.hero-badges span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 7px 11px;
  border: 1px solid rgba(80, 49, 34, 0.10);
  border-radius: 999px;
  color: #614c40;
  background: rgba(255,255,255,.72);
  font-size: 12px;
  font-weight: 750;
  box-shadow: 0 4px 12px rgba(43,24,18,.035);
}

.badge-dot,
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7fa27f;
  box-shadow: 0 0 0 5px rgba(127,162,127,.14);
}

.predict-form {
  display: grid;
  grid-template-columns: minmax(150px, .7fr) minmax(190px, 1fr) auto;
  gap: 14px;
  align-items: end;
  margin-top: 28px;
  padding: 16px;
  border: 1px solid rgba(79, 47, 32, 0.10);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255,255,255,.82), rgba(251,244,235,.82));
  box-shadow: inset 0 1px 0 #fff, 0 12px 28px rgba(43,24,18,.05);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--coffee-700);
  font-size: 15px;
  font-weight: 900;
  letter-spacing: .01em;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 54px;
  padding: 0 15px;
  border: 1px solid rgba(90,55,38,.17);
  border-radius: 14px;
  outline: none;
  background: var(--cream-50);
  color: var(--text);
  font-size: 17px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
  transition: .2s ease;
}

.form-group input:hover,
.form-group select:hover { border-color: rgba(154,107,69,.38); }

.form-group input:focus,
.form-group select:focus {
  border-color: var(--caramel-500);
  box-shadow: 0 0 0 4px rgba(197,138,77,.13);
}

.button-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.sales-page button {
  height: 54px;
  padding: 0 20px;
  border: 0;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, var(--coffee-800), var(--caramel-500));
  font-size: 16px;
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 13px 30px rgba(64,35,23,.20);
  transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
}

.sales-page button:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: saturate(1.05);
  box-shadow: 0 18px 36px rgba(64,35,23,.24);
}

.sales-page button:active:not(:disabled) { transform: translateY(0); }
.sales-page button:disabled { opacity: .65; cursor: not-allowed; }

.report-button {
  background: linear-gradient(135deg, #35533d, #6f8f73) !important;
  box-shadow: 0 13px 28px rgba(55,86,64,.18) !important;
}

.hero-right {
  min-height: 430px;
  padding: 22px;
  border-radius: 27px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(255,255,255,.10);
  background:
    radial-gradient(circle at 86% 8%, rgba(226,174,111,.24), transparent 31%),
    radial-gradient(circle at 10% 82%, rgba(143,174,143,.12), transparent 32%),
    linear-gradient(148deg, #281610 0%, #4a291d 46%, #805334 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 24px 48px rgba(49,27,19,.18);
}

.hero-right::after {
  content: "";
  position: absolute;
  inset: 12px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,.09);
  pointer-events: none;
}

.hero-ambient {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
}
.hero-ambient-one { width: 190px; height: 190px; right: -60px; top: -65px; background: rgba(220,164,102,.14); }
.hero-ambient-two { width: 150px; height: 150px; left: -52px; bottom: 48px; background: rgba(112,149,119,.10); }

.roastery-topline,
.hero-insight-grid,
.hero-mini-note { position: relative; z-index: 2; }

.roastery-topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.engine-status {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: rgba(255,255,255,.82);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.model-chip {
  padding: 7px 10px;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 999px;
  color: #f7e7d4;
  background: rgba(255,255,255,.08);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .05em;
}

.coffee-visual {
  position: relative;
  min-height: 188px;
  display: grid;
  place-items: center;
  z-index: 1;
}

.coffee-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.10);
}
.ring-one { width: 184px; height: 184px; }
.ring-two { width: 142px; height: 142px; border-style: dashed; opacity: .68; }

.coffee-orb {
  width: 112px;
  height: 112px;
  display: grid;
  place-items: center;
  position: relative;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(255,255,255,.20), rgba(255,255,255,.07));
  border: 1px solid rgba(255,255,255,.20);
  box-shadow: inset 0 0 30px rgba(255,255,255,.10), 0 22px 45px rgba(0,0,0,.22);
}

.cup-icon { font-size: 52px; filter: drop-shadow(0 6px 10px rgba(0,0,0,.18)); }
.steam { position: absolute; top: 6px; color: rgba(255,255,255,.70); font-size: 21px; font-weight: 300; transform: rotate(90deg); }
.steam-one { left: 38px; }
.steam-two { right: 35px; top: 13px; opacity: .55; }

.coffee-bean {
  position: absolute;
  width: 24px;
  height: 38px;
  border-radius: 55% 45% 55% 45%;
  background: linear-gradient(90deg, #c7834e 0%, #8f562f 48%, #4a2a1b 52%, #8e5833 100%);
  box-shadow: 0 8px 16px rgba(0,0,0,.18);
  opacity: .92;
}
.coffee-bean::after { content: ""; position: absolute; left: 50%; top: 5px; bottom: 5px; width: 1px; background: rgba(239,194,145,.45); transform: rotate(8deg); }
.bean-one { left: 18%; top: 24%; transform: rotate(-26deg) scale(.82); }
.bean-two { right: 16%; top: 31%; transform: rotate(28deg) scale(.72); }
.bean-three { left: 27%; bottom: 7%; transform: rotate(42deg) scale(.64); }
.bean-four { right: 25%; bottom: 5%; transform: rotate(-38deg) scale(.60); }

.hero-insight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.glass-card {
  padding: 13px 14px;
  border-radius: 15px;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.08);
  backdrop-filter: blur(10px);
  color: #fff;
}

.mini-card span { display: block; margin-bottom: 5px; color: rgba(255,255,255,.58); font-size: 14px; font-weight: 750; text-transform: uppercase; letter-spacing: .07em; }
.mini-card strong { display: block; color: #fff9f0; font-size: 15px; line-height: 1.3; }

.hero-mini-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 10px;
  padding: 11px 12px;
  border-radius: 14px;
  color: rgba(255,255,255,.72);
  background: rgba(0,0,0,.10);
  font-size: 11px;
  line-height: 1.45;
}
.hero-mini-note p { margin: 0; }
.hero-mini-note > span { color: #e4b477; }

.error-box {
  margin-top: 16px;
  padding: 13px 15px;
  border: 1px solid #efc9c2;
  border-radius: 14px;
  color: var(--danger-700);
  background: var(--danger-100);
  font-size: 13px;
  font-weight: 750;
}

.results-header {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin: 38px 4px 16px;
}
.results-header h2 { margin: 0; color: var(--coffee-950); font-size: 31px; line-height: 1.15; letter-spacing: -.02em; }
.results-subtitle { max-width: 850px; margin: 0; color: var(--muted); font-size: 14px; line-height: 1.6; }

.results-grid,
.details-grid {
  display: grid;
  gap: 20px;
  margin-top: 20px;
}
.results-grid { grid-template-columns: 1.18fr .92fr .82fr; }
.details-grid { grid-template-columns: 1.05fr .95fr; }

.result-card,
.detail-card {
  min-width: 0;
  padding: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: rgba(255,253,249,.96);
  box-shadow: var(--shadow-md);
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}

.result-card::before,
.detail-card::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--coffee-700), var(--caramel-400), transparent 85%);
  opacity: .75;
}

.result-card:hover,
.detail-card:hover { transform: translateY(-3px); box-shadow: 0 23px 52px rgba(43,24,18,.12); border-color: rgba(118,80,57,.18); }

.card-header,
.section-title-row,
.xai-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }

.card-label {
  margin: 0 0 9px;
  color: #8a5b3d;
  font-size: 18px;
  font-weight: 950;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.demand-emoji,
.sales-icon,
.quality-icon,
.xai-title-icon { font-size: 28px; }

.main-result h2 {
  margin: 5px 0 0;
  color: var(--coffee-950);
  font-size: clamp(50px, 6vw, 82px);
  line-height: .92;
  letter-spacing: -.065em;
}

.unit-text,
.small-muted { color: var(--muted); line-height: 1.58; }
.unit-text { margin: 7px 0 0; font-size: 18px; }
.small-muted { font-size: 15px; }

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 16px 0 3px;
  padding: 8px 12px;
  border-radius: 999px;
  color: #fff;
  background: var(--coffee-800);
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(43,24,18,.10);
}
.main-result.high .status-pill { background: var(--sage-600); }
.main-result.medium .status-pill { background: #8b6a3d; }
.main-result.low .status-pill { background: #9b493e; }
.status-icon { font-size: 14px; }

.result-card h3,
.detail-card h3,
.xai-card h3,
.xai-guide h3 { margin: 0; color: var(--coffee-950); line-height: 1.2; letter-spacing: -.02em; }
.result-card h3,
.detail-card h3 { font-size: 28px; }
.quality-label { color: var(--sage-700) !important; font-size: 34px !important; }

.explanation-box {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(87,53,35,.09);
  border-radius: 16px;
  background: linear-gradient(145deg, #fbf4eb, #fffaf4);
}
.explanation-header { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
.explanation-header strong { color: #4a3529; font-size: 16px; }
.explanation-icon { font-size: 16px; }
.explanation-text { margin: 0 0 11px; color: #58483f; font-size: 16px; line-height: 1.6; }

.explanation-details,
.comparison-details,
.action-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding: 9px 11px;
  border: 1px solid rgba(83,50,33,.06);
  border-radius: 11px;
  background: rgba(255,255,255,.78);
}
.detail-label { color: #8a634b; font-size: 14px; font-weight: 800; }
.detail-value { color: #3c2b23; font-size: 14px; font-weight: 650; line-height: 1.4; }

.quality-explanation {
  margin: 13px 0;
  padding: 14px;
  border-left: 4px solid var(--sage-600);
  border-radius: 12px;
  background: rgba(95,119,95,.09);
}
.quality-description { margin: 0 0 9px; color: #405f45; font-size: 16px; line-height: 1.55; font-weight: 650; }
.quality-factors { display: flex; flex-wrap: wrap; gap: 6px; }
.factor-tag { padding: 5px 8px; border: 1px solid rgba(90,55,38,.08); border-radius: 999px; background: #fffdf9; color: #5e4c42; font-size: 15px; }

.prob-list { display: grid; gap: 9px; margin-top: 16px; }
.prob-header { display: grid; grid-template-columns: 88px 1fr; padding: 0 10px; color: #8a5b3d; font-size: 12px; font-weight: 900; letter-spacing: .07em; text-transform: uppercase; }
.prob-row { display: grid; grid-template-columns: 88px 1fr; align-items: center; gap: 10px; padding: 11px; border: 1px solid rgba(90,55,38,.06); border-radius: 12px; background: #fbf4eb; }
.prob-label { color: #4f3c31; font-size: 11px; font-weight: 750; }
.prob-right { display: grid; grid-template-columns: minmax(80px, 1fr) 48px; align-items: center; gap: 8px; }
.prob-right strong { color: #4b3428; font-size: 14px; text-align: right; }
.prob-track { height: 8px; overflow: hidden; border-radius: 999px; background: #e9ddd0; }
.prob-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--coffee-700), var(--caramel-500)); }

.comparison-value { display: flex; align-items: center; gap: 11px; margin: 8px 0 4px; }
.comparison-icon { font-size: 27px; }
.comparison-value h3 { font-size: 34px; }
.comparison-note { display: flex; align-items: center; gap: 8px; margin-top: 11px; padding: 10px 11px; border-radius: 10px; background: #f7efe6; color: #6d5c52; font-size: 11px; }
.comparison-explanation { margin: 11px 0; }
.comparison-status { margin: 0 0 10px; color: #3d2d25; font-size: 16px; font-weight: 750; line-height: 1.45; }

.info-chip { flex-shrink: 0; padding: 7px 10px; border-radius: 999px; color: #6e4932; background: #efe1d1; font-size: 9px; font-weight: 950; letter-spacing: .04em; text-transform: uppercase; }
.input-description,
.action-subtitle { margin: 4px 0 0; color: var(--muted); font-size: 16px; line-height: 1.5; }
.action-subtitle { margin-bottom: 14px; }

.metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
.metric-grid > div { padding: 14px; border: 1px solid rgba(90,55,38,.06); border-radius: 14px; background: linear-gradient(145deg, #fbf4eb, #fffaf4); transition: transform .2s ease, background .2s ease; }
.metric-grid > div:hover { transform: translateY(-2px); background: #f4e7d8; }
.metric-grid span:not(.metric-hint) { display: block; margin-bottom: 7px; color: #81573c; font-size: 15px; font-weight: 900; }
.metric-grid strong { color: var(--text); font-size: 22px; }
.metric-hint { display: block; margin-top: 4px; color: #8b786b; font-size: 12px; font-weight: 650; line-height: 1.35; }

.action-box,
.source-box { padding: 16px; border-radius: 15px; line-height: 1.6; }
.action-box { background: #fffaf3; color: #5a3726; font-size: 12px; }
.action-box.high { background: var(--sage-100); color: #405f45; }
.action-box.medium { background: var(--gold-100); color: #765a32; }
.action-box.low { background: var(--danger-100); color: #8d4338; }
.action-icon { margin-bottom: 7px; font-size: 28px; }
.action-box > strong { display: block; margin-bottom: 5px; font-size: 18px; }
.action-box p { margin: 0; font-size: 14px; line-height: 1.62; }
.action-detail-item { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border-radius: 10px; background: rgba(255,255,255,.55); }
.action-detail-icon { font-size: 15px; }
.action-detail-item strong { display: block; color: #81573c; font-size: 13px; }
.action-detail-item span { color: #3b2a22; font-size: 13px; }
.priority-level { font-weight: 800; }

.source-box { margin-top: 12px; background: #f0e0cc; color: #5a3726; }
.source-box > span { display: block; margin-bottom: 4px; color: #81573c; font-size: 15px; font-weight: 750; }
.source-box > strong { display: block; color: #493327; font-size: 13px; line-height: 1.45; }
.source-hint { margin: 4px 0 0; color: #3f3329; font-size: 12px; font-style: italic; }

.xai-section {
  margin-top: 22px;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 26px;
  background: rgba(255,253,249,.96);
  box-shadow: var(--shadow-md);
}

.xai-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; margin-bottom: 20px; }
.xai-title-icon { margin-bottom: 5px; }
.xai-header h2 { margin: 0 0 7px; color: var(--coffee-950); font-size: 31px; line-height: 1.15; letter-spacing: -.03em; }

.xai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.xai-card { min-width: 0; padding: 21px; border: 1px solid rgba(90,55,38,.09); border-radius: 19px; background: linear-gradient(145deg, #fffaf3, #fffdf9); }
.xai-card h3 { font-size: 21px; }
.xai-intro { margin: 10px 0 16px; color: #72635a; font-size: 14px; line-height: 1.6; }

.xai-list { display: grid; gap: 9px; margin-top: 16px; }
.xai-list-header { display: grid; grid-template-columns: 30px 1fr auto; gap: 10px; padding: 0 10px 7px; border-bottom: 1px solid rgba(90,55,38,.10); color: #876049; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
.friendly-xai-item { display: grid; grid-template-columns: 30px 1fr auto; gap: 10px; align-items: center; padding: 13px; border: 1px solid rgba(90,55,38,.08); border-radius: 13px; background: #fff; box-shadow: 0 4px 12px rgba(43,24,18,.025); }
.factor-rank { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 9px; color: #fff; background: linear-gradient(145deg, var(--coffee-700), var(--caramel-500)); font-size: 12px; font-weight: 950; }
.factor-heading { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.factor-heading > strong { color: #3a2921; font-size: 15px; }
.factor-content p { margin: 4px 0 0; color: #706159; font-size: 14px; line-height: 1.45; }
.factor-explanation { margin-top: 3px; }
.factor-detail { color: #1a239a; font-size: 13px; }
.strength-chip { padding: 4px 6px; border-radius: 999px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
.strength-chip.strong { color: #754321; background: #f2d9bc; }
.strength-chip.moderate { color: #6f5a32; background: #f5ead2; }
.strength-chip.small { color: #617065; background: #e9efea; }

.direction-panel { min-width: 74px; padding: 8px 9px; border-radius: 10px; text-align: center; font-weight: 900; }
.direction-panel.positive { color: #3e5b42; background: #e7f0e8; }
.direction-panel.negative { color: #9a4439; background: #f8e9e6; }
.direction-panel.neutral { color: #806742; background: #f5ead8; }
.direction-arrow { display: block; font-size: 18px; line-height: 1; }
.direction-panel small { display: block; margin-top: 3px; font-size: 10px; }
.xai-empty { margin-top: 16px; padding: 15px; border-radius: 12px; background: #fff; color: var(--muted); font-size: 12px; }

.xai-guide {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid rgba(90,55,38,.10);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(255,255,255,.95), rgba(247,237,225,.92));
  box-shadow: 0 10px 24px rgba(43,24,18,.05);
}
.guide-heading { display: flex; gap: 13px; align-items: flex-start; }
.guide-book { width: 42px; height: 42px; flex-shrink: 0; display: grid; place-items: center; border-radius: 13px; background: #efe0cd; font-size: 21px; }
.guide-heading h3 { font-size: 19px; }
.guide-heading > div > p:last-child { max-width: 740px; margin: 6px 0 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
.guide-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
.guide-item { display: flex; gap: 10px; align-items: center; min-width: 0; padding: 12px; border: 1px solid rgba(90,55,38,.08); border-radius: 13px; background: rgba(255,255,255,.85); }
.guide-icon { width: 32px; height: 32px; flex-shrink: 0; display: grid; place-items: center; border-radius: 10px; font-size: 18px; font-weight: 950; }
.guide-item strong { display: block; margin-bottom: 2px; color: #3d2a22; font-size: 14px; }
.guide-item span:last-child { display: block; color: #7a6960; font-size: 12px; line-height: 1.4; }
.guide-item.supporting .guide-icon { color: #3f6348; background: #e8f1e9; }
.guide-item.opposing .guide-icon { color: #93463d; background: #f8e9e6; }
.guide-item.neutral .guide-icon { color: #806742; background: #f5ead8; }
.guide-tip { display: flex; align-items: center; gap: 9px; margin-top: 10px; padding: 10px 12px; border-radius: 11px; background: #f1e2cf; color: #675346; }
.guide-tip p { margin: 0; font-size: 14px; line-height: 1.45; }

.comparison-chart-card { margin-top: 16px; padding: 16px; border: 1px solid rgba(90,55,38,.08); border-radius: 16px; background: #fffaf3; box-shadow: 0 8px 20px rgba(43,24,18,.035); }
.comparison-chart-card h3 { margin: 0; color: var(--coffee-950); font-size: 18px; }
.comparison-description { color: var(--muted); font-size: 11px; line-height: 1.55; }
.comparison-summary { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 11px; border-radius: 11px; background: #efe0cd; }
.comparison-summary strong { color: var(--sage-600); font-size: 19px; }
.comparison-summary span { color: var(--muted); font-size: 12px; }

@media (max-width: 1180px) {
  .hero-card { grid-template-columns: 1.15fr .85fr; }
  .predict-form { grid-template-columns: 1fr 1fr; }
  .button-group { grid-column: 1 / -1; }
  .button-group button { flex: 1; }
  .results-grid { grid-template-columns: 1fr 1fr; }
  .results-grid .result-card:last-child { grid-column: 1 / -1; }
}

@media (max-width: 980px) {
  .sales-page { padding: 20px; }
  .hero-card,
  .details-grid,
  .xai-grid { grid-template-columns: 1fr; }
  .hero-right { min-height: 390px; }
  .results-grid { grid-template-columns: 1fr; }
  .results-grid .result-card:last-child { grid-column: auto; }
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
  .guide-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .sales-page { padding: 12px; }
  .hero-card { padding: 20px; border-radius: 22px; }
  .sales-page h1 { font-size: 35px; line-height: 1.04; }
  .hero-text { font-size: 16px; }
  .predict-form { grid-template-columns: 1fr; padding: 12px; }
  .button-group { grid-column: auto; flex-direction: column; width: 100%; }
  .button-group button { width: 100%; }
  .hero-right { min-height: 405px; padding: 18px; }
  .hero-insight-grid { grid-template-columns: 1fr; }
  .results-header h2 { font-size: 25px; }
  .result-card,
  .detail-card,
  .xai-section { padding: 18px; border-radius: 18px; }
  .metric-grid { grid-template-columns: 1fr; }
  .explanation-details,
  .comparison-details,
  .action-details { grid-template-columns: 1fr; }
  .prob-header { display: none; }
  .prob-row,
  .prob-right { grid-template-columns: 1fr; }
  .prob-right strong { text-align: left; }
  .xai-header h2 { font-size: 25px; }
  .friendly-xai-item { grid-template-columns: 28px 1fr; }
  .direction-panel { grid-column: 2; justify-self: start; min-width: 68px; }
  .xai-list-header { display: none; }
  .guide-heading { flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; }
}
`;

export default SalesPredictionPage;