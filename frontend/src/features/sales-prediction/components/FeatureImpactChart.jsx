import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell
} from "recharts";

const featureLabels = {
  Year: "Year Trend",
  Prev_Month_Sales: "Previous Month's Sales",
  Rainfall_mm: "Rainfall Amount",
  Humidity_pct: "Humidity Level",
  Avg_High_C: "Average High Temperature",
  Avg_Low_C: "Average Low Temperature",
  Rainy_Days: "Rainy Days",
  Wind_mph: "Wind Speed",
  Month_Num: "Month of Year",
  Month_Sin: "Seasonal Pattern",
  Month_Cos: "Seasonal Cycle"
};

function getLabel(feature) {
  return featureLabels[feature] || feature.replace(/_/g, " ");
}

function getStrength(value, type) {
  const impact = Math.abs(Number(value));

  if (type === "sales") {
    if (impact >= 500) return { label: "High Impact", emoji: "🔴" };
    if (impact >= 100) return { label: "Medium Impact", emoji: "🟡" };
    return { label: "Low Impact", emoji: "🟢" };
  } else {
    if (impact >= 0.15) return { label: "High Impact", emoji: "🔴" };
    if (impact >= 0.05) return { label: "Medium Impact", emoji: "🟡" };
    return { label: "Low Impact", emoji: "🟢" };
  }
}

function getMessage(direction, type) {
  if (type === "sales") {
    if (direction === "positive") return "📈 Increases expected sales";
    if (direction === "negative") return "📉 Decreases expected sales";
    return "➡️ Minor effect on sales";
  } else {
    if (direction === "positive") return "✅ Supports better quality";
    if (direction === "negative") return "⚠️ May reduce quality";
    return "➡️ Minor effect on quality";
  }
}

function getDirectionDescription(direction) {
  if (direction === "positive") return "Positive factor";
  if (direction === "negative") return "Negative factor";
  return "Neutral factor";
}

function FeatureImpactChart({
  data = [],
  title = "Impact Analysis",
  type = "sales"
}) {
  const chartData = data.map(item => ({
    name: getLabel(item.feature),
    value: Number(Math.abs(item.shap_value)),
    strength: getStrength(item.shap_value, type),
    direction: item.direction,
    message: getMessage(item.direction, type),
    rawValue: item.shap_value
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const item = payload[0].payload;
      const directionEmoji = item.direction === "positive" ? "📈" : 
                            item.direction === "negative" ? "📉" : "➡️";
      const directionColor = item.direction === "positive" ? "#2d7d46" : 
                            item.direction === "negative" ? "#c0392b" : "#8a7a2a";

      return (
        <div style={{
          background: "white",
          padding: "16px 20px",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.08)",
          maxWidth: "280px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px"
          }}>
            <span style={{ fontSize: "20px" }}>{directionEmoji}</span>
            <strong style={{ fontSize: "16px", color: "#1a1a1a" }}>
              {item.name}
            </strong>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px"
          }}>
            <span>{item.strength.emoji}</span>
            <span style={{ 
              fontWeight: "600", 
              color: "#2c3e50",
              fontSize: "14px"
            }}>
              {item.strength.label}
            </span>
          </div>

          <div style={{
            color: directionColor,
            fontWeight: "500",
            fontSize: "14px",
            padding: "6px 0",
            borderTop: "1px solid #f0f0f0",
            marginTop: "6px"
          }}>
            {item.message}
          </div>
          
          <div style={{
            fontSize: "12px",
            color: "#7f8c8d",
            marginTop: "4px",
            fontStyle: "italic"
          }}>
            {getDirectionDescription(item.direction)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: "linear-gradient(145deg, #ffffff, #faf8f5)",
      borderRadius: "20px",
      padding: "24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      border: "1px solid rgba(200, 180, 160, 0.15)",
      marginTop: "20px"
    }}>
      {/* Header Section */}
      <div style={{
        marginBottom: "20px",
        borderBottom: "2px solid #f0ebe4",
        paddingBottom: "16px"
      }}>
        <h3 style={{
          margin: 0,
          fontSize: "20px",
          color: "#2c1810",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ fontSize: "24px" }}>🎯</span>
          {title}
        </h3>
        <p style={{
          margin: "6px 0 0 0",
          color: "#6b5a4a",
          fontSize: "14px",
          lineHeight: "1.5"
        }}>
          These factors had the strongest influence on the prediction
        </p>
      </div>

      {/* Chart Section */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "8px 0"
      }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={150}
              tick={{
                fontSize: 13,
                fill: "#3d2a1a",
                fontWeight: "500"
              }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar
              dataKey="value"
              radius={[0, 8, 8, 0]}
              barSize={24}
            >
              {chartData.map((item, index) => {
                let color;
                if (item.direction === "positive") {
                  color = "#3aa76d";
                } else if (item.direction === "negative") {
                  color = "#d9534f";
                } else {
                  color = "#c9a227";
                }
                // Add opacity gradient for visual interest
                const opacity = 0.7 + (item.value / Math.max(...chartData.map(d => d.value), 1)) * 0.3;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={Math.min(opacity, 1)}
                    stroke={color}
                    strokeOpacity={0.3}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Section - More User Friendly */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        justifyContent: "center",
        marginTop: "16px",
        padding: "12px",
        background: "rgba(248, 244, 240, 0.6)",
        borderRadius: "12px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#3d2a1a"
        }}>
          <span style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            borderRadius: "4px",
            background: "#3aa76d"
          }}></span>
          <span>📈 Positive impact</span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#3d2a1a"
        }}>
          <span style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            borderRadius: "4px",
            background: "#d9534f"
          }}></span>
          <span>📉 Negative impact</span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#3d2a1a"
        }}>
          <span style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            borderRadius: "4px",
            background: "#c9a227"
          }}></span>
          <span>➡️ Minor impact</span>
        </div>
      </div>

      {/* Helpful Note */}
      <div style={{
        marginTop: "14px",
        padding: "12px 16px",
        background: "#f8f4ef",
        borderRadius: "10px",
        fontSize: "13px",
        color: "#6b5a4a",
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        border: "1px solid #ede8e0"
      }}>
        <span style={{ fontSize: "18px" }}>💡</span>
        <div>
          <strong style={{ display: "block", color: "#3d2a1a", marginBottom: "2px" }}>
            How to read this chart
          </strong>
          <span>
            Longer bars mean stronger influence. Hover over any bar to see detailed
            explanations of how each factor affected the prediction.
          </span>
        </div>
      </div>
    </div>
  );
}

export default FeatureImpactChart;