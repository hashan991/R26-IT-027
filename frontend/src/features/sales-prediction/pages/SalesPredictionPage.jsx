import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import html2pdf from "html2pdf.js";

import {
  generateYearForecast,
  getCurrentMonthWeather,
  getPreviousSalesEntry,
  saveSalesEntry,
} from "../services/salesPredictionApi";


// ============================================================
// MONTHS
// ============================================================

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


// ============================================================
// FORMAT HELPERS
// ============================================================

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat().format(
    Math.round(number)
  );
}


function formatDecimal(
  value,
  decimals = 1
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(decimals);
}


function getErrorMessage(
  error,
  fallback
) {
  return (
    error?.response?.data?.detail ||
    error?.message ||
    fallback
  );
}


// ============================================================
// QUALITY HELPERS
// ============================================================

function normalizeQualityLabel(
  label
) {
  if (!label) {
    return "N/A";
  }

  return String(label)
    .trim()
    .toUpperCase();
}


function getQualityClass(
  label
) {
  const quality =
    normalizeQualityLabel(label);

  if (quality === "HIGH") {
    return "quality-high";
  }

  if (quality === "MEDIUM") {
    return "quality-medium";
  }

  if (quality === "LOW") {
    return "quality-low";
  }

  return "quality-unknown";
}


function getQualityConfidence(
  label,
  probabilities
) {
  if (
    !label ||
    !probabilities
  ) {
    return null;
  }

  const target =
    normalizeQualityLabel(
      label
    );

  const found =
    Object.entries(
      probabilities
    ).find(
      ([key]) =>
        normalizeQualityLabel(
          key
        ) === target
    );

  if (!found) {
    return null;
  }

  const probability =
    Number(found[1]);

  if (
    !Number.isFinite(
      probability
    )
  ) {
    return null;
  }

  return probability * 100;
}


function getQualityProbability(
  probabilities,
  target
) {
  if (!probabilities) {
    return 0;
  }

  const found =
    Object.entries(
      probabilities
    ).find(
      ([key]) =>
        normalizeQualityLabel(
          key
        ) === target
    );

  if (!found) {
    return 0;
  }

  const probability =
    Number(found[1]);

  if (
    !Number.isFinite(
      probability
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      probability * 100,
      100
    )
  );
}


// ============================================================
// NEXT MONTH DECISION SUPPORT
// ============================================================

function buildDecisionSupport(
  forecast,
  currentActualSales
) {
  if (!forecast?.length) {
    return null;
  }

  // Immediate next month only
  const nextMonth =
    forecast[0];

  const nextMonthSales =
    Number(
      nextMonth.predicted_sales
    ) || 0;

  const actualSales =
    Number(
      currentActualSales
    ) || 0;


  const salesChangePct =
    actualSales > 0
      ? (
          (
            nextMonthSales -
            actualSales
          ) /
          actualSales
        ) * 100
      : 0;


  const quality =
    normalizeQualityLabel(
      nextMonth
        .predicted_quality_label
    );


  const rainfall =
    Number(
      nextMonth
        .weather_profile
        ?.Rainfall_mm
    ) || 0;


  const humidity =
    Number(
      nextMonth
        .weather_profile
        ?.Humidity_pct
    ) || 0;


  const avgHigh =
    Number(
      nextMonth
        .weather_profile
        ?.Avg_High_C
    ) || 0;


  const avgLow =
    Number(
      nextMonth
        .weather_profile
        ?.Avg_Low_C
    ) || 0;


  const rainyDays =
    Number(
      nextMonth
        .weather_profile
        ?.Rainy_Days
    ) || 0;


  // ==========================================================
  // DEMAND STATUS
  // ==========================================================

  let demandStatus =
    "STABLE";

  let demandClass =
    "decision-stable";


  if (
    salesChangePct >= 8
  ) {
    demandStatus =
      "INCREASING";

    demandClass =
      "decision-positive";

  } else if (
    salesChangePct <= -8
  ) {
    demandStatus =
      "DECREASING";

    demandClass =
      "decision-warning";
  }


  // ==========================================================
  // PRODUCTION
  // ==========================================================

  let productionRecommendation =
    `Maintain the current production level for ${nextMonth.month_name} ${nextMonth.year}. ` +
    `Predicted sales are approximately ${formatNumber(
      nextMonthSales
    )} units.`;


  if (
    salesChangePct >= 8
  ) {
    productionRecommendation =
      `Increase production capacity for ${nextMonth.month_name} ${nextMonth.year}. ` +
      `Sales are predicted to increase by approximately ${formatDecimal(
        salesChangePct
      )}% compared with the previous month's actual sales.`;

  } else if (
    salesChangePct <= -8
  ) {
    productionRecommendation =
      `Use a controlled production plan for ${nextMonth.month_name} ${nextMonth.year}. ` +
      `Sales are predicted to decrease by approximately ${formatDecimal(
        Math.abs(
          salesChangePct
        )
      )}% compared with the previous month.`;
  }


  // ==========================================================
  // INVENTORY
  // ==========================================================

  let inventoryRecommendation =
    `Maintain normal inventory levels for ${nextMonth.month_name} ${nextMonth.year}.`;


  if (
    salesChangePct >= 8
  ) {
    inventoryRecommendation =
      `Increase inventory before ${nextMonth.month_name} ${nextMonth.year} to support the expected increase in demand and reduce the risk of stock shortages.`;

  } else if (
    salesChangePct <= -8
  ) {
    inventoryRecommendation =
      `Keep inventory controlled during ${nextMonth.month_name} ${nextMonth.year} to reduce excess stock and unnecessary storage costs.`;
  }


  // ==========================================================
  // DISTRIBUTION
  // ==========================================================

  let distributionRecommendation =
    `Maintain the normal distribution plan for ${nextMonth.month_name} ${nextMonth.year}.`;


  if (
    salesChangePct >= 8
  ) {
    distributionRecommendation =
      `Prepare additional distribution capacity for ${nextMonth.month_name} ${nextMonth.year} because predicted sales are higher than the previous month's actual sales.`;

  } else if (
    salesChangePct <= -8
  ) {
    distributionRecommendation =
      `Use a more conservative distribution plan for ${nextMonth.month_name} ${nextMonth.year} because predicted sales are lower than the previous month.`;
  }


  // ==========================================================
  // QUALITY
  // ==========================================================

  let qualityRecommendation =
    `Predicted coffee quality for ${nextMonth.month_name} ${nextMonth.year} is ${quality}.`;


  if (
    quality === "HIGH"
  ) {
    qualityRecommendation =
      `Coffee quality is predicted to be HIGH in ${nextMonth.month_name} ${nextMonth.year}. ` +
      `Maintain current handling, storage, and quality-control procedures.`;

  } else if (
    quality === "MEDIUM"
  ) {
    qualityRecommendation =
      `Coffee quality is predicted to be MEDIUM in ${nextMonth.month_name} ${nextMonth.year}. ` +
      `Increase quality monitoring and review storage and environmental conditions before distribution.`;

  } else if (
    quality === "LOW"
  ) {
    qualityRecommendation =
      `Coffee quality is predicted to be LOW in ${nextMonth.month_name} ${nextMonth.year}. ` +
      `Prioritize quality inspection, storage control, and weather-related risk monitoring before production and distribution decisions.`;
  }


  // ==========================================================
  // WEATHER
  // ==========================================================

  let weatherRecommendation =
    `${nextMonth.month_name} ${nextMonth.year} has approximately ` +
    `${formatDecimal(
      rainfall
    )} mm rainfall, ` +
    `${formatDecimal(
      humidity
    )}% humidity, and temperatures between ` +
    `${formatDecimal(
      avgLow
    )}°C and ${formatDecimal(
      avgHigh
    )}°C. Continue normal weather monitoring.`;


  if (
    rainfall >= 200 ||
    humidity >= 80 ||
    rainyDays >= 15
  ) {
    weatherRecommendation =
      `${nextMonth.month_name} ${nextMonth.year} shows relatively wet or humid conditions ` +
      `with ${formatDecimal(
        rainfall
      )} mm rainfall and ${formatDecimal(
        humidity
      )}% humidity. Strengthen moisture control, storage checks, and coffee-quality monitoring.`;
  }


  // ==========================================================
  // PRIORITY
  // ==========================================================

  let priorityMessage =
    `${nextMonth.month_name} ${nextMonth.year} is predicted to reach ` +
    `${formatNumber(
      nextMonthSales
    )} sales units with ${quality} coffee quality.`;


  if (
    salesChangePct >= 8 &&
    quality === "HIGH"
  ) {
    priorityMessage =
      `${nextMonth.month_name} ${nextMonth.year} shows increasing demand together with HIGH predicted coffee quality. ` +
      `Prepare additional production and inventory to support the expected demand.`;

  } else if (
    salesChangePct >= 8 &&
    quality === "MEDIUM"
  ) {
    priorityMessage =
      `${nextMonth.month_name} ${nextMonth.year} shows increasing demand while coffee quality is predicted as MEDIUM. ` +
      `Increase supply carefully while strengthening quality monitoring.`;

  } else if (
    salesChangePct >= 8 &&
    quality === "LOW"
  ) {
    priorityMessage =
      `${nextMonth.month_name} ${nextMonth.year} shows increasing demand, but predicted coffee quality is LOW. ` +
      `Prioritize quality control before increasing production or distribution.`;

  } else if (
    quality === "LOW"
  ) {
    priorityMessage =
      `The main concern for ${nextMonth.month_name} ${nextMonth.year} is LOW predicted coffee quality. ` +
      `Focus on quality inspection, storage conditions, and weather-related risks.`;
  }


  return {
    nextMonth,
    nextMonthSales,
    actualSales,
    salesChangePct,
    quality,
    demandStatus,
    demandClass,
    productionRecommendation,
    inventoryRecommendation,
    distributionRecommendation,
    qualityRecommendation,
    weatherRecommendation,
    priorityMessage,
  };
}


// ============================================================
// SALES FORECAST CHART
// ============================================================

function ForecastChart({
  data,
}) {
  if (!data?.length) {
    return (
      <div className="empty-state">
        Generate the forecast to
        display the sales trend.
      </div>
    );
  }


  const width = 920;
  const height = 280;

  const paddingX = 55;
  const paddingY = 35;


  const values =
    data.map(
      (item) =>
        Number(
          item.predicted_sales
        ) || 0
    );


  const minimum =
    Math.min(...values);

  const maximum =
    Math.max(...values);


  const range =
    Math.max(
      maximum - minimum,
      1
    );


  const points =
    data.map(
      (
        item,
        index
      ) => {

        const x =
          paddingX +
          (
            index *
            (
              width -
              paddingX * 2
            )
          ) /
          Math.max(
            data.length - 1,
            1
          );


        const normalized =
          (
            Number(
              item.predicted_sales
            ) -
            minimum
          ) /
          range;


        const y =
          height -
          paddingY -
          normalized *
            (
              height -
              paddingY * 2
            );


        return {
          x,
          y,

          value:
            item.predicted_sales,

          label:
            `${
              MONTHS[
                item.month - 1
              ].slice(
                0,
                3
              )
            } ${
              String(
                item.year
              ).slice(-2)
            }`,
        };
      }
    );


  const polyline =
    points
      .map(
        (point) =>
          `${point.x},${point.y}`
      )
      .join(" ");


  return (
    <div className="chart-scroll">

      <svg
        className="forecast-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="12 month sales forecast"
      >

        <line
          x1={paddingX}
          y1={
            height -
            paddingY
          }
          x2={
            width -
            paddingX
          }
          y2={
            height -
            paddingY
          }
          className="chart-axis"
        />


        <polyline
          points={polyline}
          fill="none"
          className="sales-line"
        />


        {points.map(
          (
            point,
            index
          ) => (
            <g
              key={
                `${point.label}-${index}`
              }
            >

              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                className="sales-dot"
              />


              <text
                x={point.x}
                y={
                  point.y - 13
                }
                textAnchor="middle"
                className="chart-value"
              >
                {formatNumber(
                  point.value
                )}
              </text>


              <text
                x={point.x}
                y={
                  height - 10
                }
                textAnchor="middle"
                className="chart-label"
              >
                {point.label}
              </text>

            </g>
          )
        )}

      </svg>

    </div>
  );
}


// ============================================================
// USER-FRIENDLY QUALITY OUTLOOK
// ============================================================

function QualityForecastChart({
  data,
}) {
  if (!data?.length) {
    return null;
  }

  const summary = data.reduce(
    (acc, item) => {
      const label = normalizeQualityLabel(
        item.predicted_quality_label
      );

      if (label === "HIGH") acc.high += 1;
      if (label === "MEDIUM") acc.medium += 1;
      if (label === "LOW") acc.low += 1;

      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return (
    <div className="quality-outlook">

      <div className="quality-chart-heading">
        <div>
          <p className="section-kicker">
            Quality Forecast
          </p>

          <h2>
            12-Month Quality Outlook
          </h2>

          <p>
            A simple month-by-month view of the most likely coffee quality.
            each month shows the predicted status,
            confidence, and the key weather values.
          </p>
        </div>
      </div>

      <div className="quality-summary-grid">
        <div className="quality-summary-card quality-summary-high">
          <span>HIGH quality months</span>
          <strong>{summary.high}</strong>
        </div>

        <div className="quality-summary-card quality-summary-medium">
          <span>MEDIUM quality months</span>
          <strong>{summary.medium}</strong>
        </div>

        <div className="quality-summary-card quality-summary-low">
          <span>LOW quality months</span>
          <strong>{summary.low}</strong>
        </div>
      </div>

      <div className="quality-outlook-grid">
        {data.map((item, index) => {
          const predicted = normalizeQualityLabel(
            item.predicted_quality_label
          );

          const confidence = getQualityConfidence(
            item.predicted_quality_label,
            item.predicted_quality_probabilities
          );

          const isForecastWeather = String(
            item.weather_source || ""
          )
            .toLowerCase()
            .includes("seasonal");

          return (
            <article
              className={`quality-outlook-card ${
                index === 0 ? "quality-outlook-next" : ""
              }`}
              key={`${item.year}-${item.month}`}
            >
              <div className="quality-outlook-top">
                <div>
                  <span className="quality-outlook-month">
                    {MONTHS[item.month - 1]}
                  </span>
                  <small>{item.year}</small>
                </div>

                {index === 0 && (
                  <span className="quality-next-badge">
                    NEXT MONTH
                  </span>
                )}
              </div>

              <div className="quality-outlook-status">
                <span
                  className={`quality-pill ${getQualityClass(
                    predicted
                  )}`}
                >
                  {predicted}
                </span>

                <div>
                  <strong>
                    {confidence !== null
                      ? `${formatDecimal(confidence, 0)}%`
                      : "—"}
                  </strong>
                  <small>confidence</small>
                </div>
              </div>

              <div className="quality-weather-mini">
                <div>
                  <span>Humidity</span>
                  <strong>
                    {formatDecimal(
                      item.weather_profile?.Humidity_pct
                    )}%
                  </strong>
                </div>

                <div>
                  <span>Rainfall</span>
                  <strong>
                    {formatDecimal(
                      item.weather_profile?.Rainfall_mm
                    )} mm
                  </strong>
                </div>
              </div>

              <div
                className={`quality-weather-source ${
                  isForecastWeather
                    ? "quality-weather-live"
                    : "quality-weather-fallback"
                }`}
              >
                <i />
                {isForecastWeather
                  ? "Forecast weather used"
                  : "Climate average fallback"}
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}


// ============================================================
// PDF SALES CHART
// ============================================================

function ReportSalesChart({
  data,
}) {
  if (!data?.length) {
    return null;
  }


  const width = 680;
  const height = 220;

  const paddingX = 45;
  const paddingTop = 30;
  const paddingBottom = 35;


  const values =
    data.map(
      (item) =>
        Number(
          item.predicted_sales
        ) || 0
    );


  const minValue =
    Math.min(...values);

  const maxValue =
    Math.max(...values);


  const range =
    Math.max(
      maxValue -
        minValue,
      1
    );


  const points =
    data.map(
      (
        item,
        index
      ) => {

        const x =
          paddingX +
          (
            index *
            (
              width -
              paddingX * 2
            )
          ) /
          Math.max(
            data.length - 1,
            1
          );


        const ratio =
          (
            Number(
              item.predicted_sales
            ) -
            minValue
          ) /
          range;


        const y =
          height -
          paddingBottom -
          ratio *
            (
              height -
              paddingTop -
              paddingBottom
            );


        return {
          x,
          y,

          value:
            item.predicted_sales,

          label:
            MONTHS[
              item.month - 1
            ].slice(
              0,
              3
            ),
        };
      }
    );


  const line =
    points
      .map(
        (point) =>
          `${point.x},${point.y}`
      )
      .join(" ");


  return (
    <svg
      className="report-sales-chart"
      viewBox={`0 0 ${width} ${height}`}
    >

      <line
        x1={paddingX}
        y1={
          height -
          paddingBottom
        }
        x2={
          width -
          paddingX
        }
        y2={
          height -
          paddingBottom
        }
        className="report-chart-axis"
      />


      <polyline
        points={line}
        fill="none"
        className="report-chart-line"
      />


      {points.map(
        (
          point,
          index
        ) => (
          <g
            key={
              `${point.label}-${index}`
            }
          >

            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              className="report-chart-dot"
            />


            <text
              x={point.x}
              y={
                point.y - 10
              }
              textAnchor="middle"
              className="report-chart-value"
            >
              {formatNumber(
                point.value
              )}
            </text>


            <text
              x={point.x}
              y={
                height - 12
              }
              textAnchor="middle"
              className="report-chart-month"
            >
              {point.label}
            </text>

          </g>
        )
      )}

    </svg>
  );
}


// ============================================================
// PDF REPORT
// ============================================================

function ForecastPdfReport({
  currentYear,
  currentMonthName,
  savedCurrent,
  weather,
  weatherProfile,
  forecast,
  forecastSummary,
  decisionSupport,
  weatherSource,
}) {
  if (
    !forecast?.length ||
    !decisionSupport
  ) {
    return null;
  }


  return (
    <div className="pdf-report">


      {/* HEADER */}

      <div className="pdf-header">

        <div>

          <span className="pdf-brand">
            Coffee Production Intelligence
          </span>

          <h1>
            Sales & Coffee Quality
            Forecast Report
          </h1>

          <p>
            Forecasting and operational
            decision-support report
          </p>

        </div>


        <div className="pdf-generated">

          <span>
            Generated
          </span>

          <strong>
            {new Date()
              .toLocaleString()}
          </strong>

        </div>

      </div>


      {/* BASIC INFORMATION */}

      <div className="pdf-report-info">

        <div>
          <span>
            Base Period
          </span>

          <strong>
            {currentMonthName}{" "}
            {currentYear}
          </strong>
        </div>


        <div>
          <span>
            Actual Sales
          </span>

          <strong>
            {formatNumber(
              savedCurrent
                ?.sales_count
            )}{" "}
            units
          </strong>
        </div>


        <div>
          <span>
            Decision Period
          </span>

          <strong>
            {
              decisionSupport
                .nextMonth
                .month_name
            }{" "}
            {
              decisionSupport
                .nextMonth
                .year
            }
          </strong>
        </div>


        <div>
          <span>
            Forecast Horizon
          </span>

          <strong>
            12 Months
          </strong>
        </div>

      </div>


      {/* EXECUTIVE SUMMARY */}

      <section className="pdf-section">

        <div className="pdf-section-title">

          <span>
            01
          </span>

          <h2>
            Executive Summary
          </h2>

        </div>


        <div className="pdf-summary-grid">

          <div>

            <span>
              Next Month Sales
            </span>

            <strong>
              {formatNumber(
                decisionSupport
                  .nextMonthSales
              )}
            </strong>

            <small>
              predicted units
            </small>

          </div>


          <div>

            <span>
              Sales Change
            </span>

            <strong>
              {decisionSupport
                .salesChangePct >=
              0
                ? "+"
                : ""}

              {formatDecimal(
                decisionSupport
                  .salesChangePct
              )}
              %
            </strong>

            <small>
              vs current actual
            </small>

          </div>


          <div>

            <span>
              Demand Status
            </span>

            <strong>
              {
                decisionSupport
                  .demandStatus
              }
            </strong>

            <small>
              next month outlook
            </small>

          </div>


          <div>

            <span>
              Coffee Quality
            </span>

            <strong>
              {
                decisionSupport
                  .quality
              }
            </strong>

            <small>
              predicted class
            </small>

          </div>

        </div>


        <div className="pdf-priority">

          <span>
            Priority Insight
          </span>

          <p>
            {
              decisionSupport
                .priorityMessage
            }
          </p>

        </div>

      </section>


      {/* WEATHER */}

      <section className="pdf-section pdf-avoid">

        <div className="pdf-section-title">

          <span>
            02
          </span>

          <h2>
            Current Weather Profile
          </h2>

        </div>


        <div className="pdf-location">

          <strong>
            {weather?.location ||
              "Weather location"}
          </strong>

          {weather?.source && (
            <span>
              {weather.source}
            </span>
          )}

        </div>


        <div className="pdf-weather-grid">

          <div>

            <span>
              Rainfall
            </span>

            <strong>
              {formatDecimal(
                weatherProfile
                  ?.Rainfall_mm
              )}{" "}
              mm
            </strong>

          </div>


          <div>

            <span>
              Humidity
            </span>

            <strong>
              {formatDecimal(
                weatherProfile
                  ?.Humidity_pct
              )}
              %
            </strong>

          </div>


          <div>

            <span>
              Avg High
            </span>

            <strong>
              {formatDecimal(
                weatherProfile
                  ?.Avg_High_C
              )}
              °C
            </strong>

          </div>


          <div>

            <span>
              Avg Low
            </span>

            <strong>
              {formatDecimal(
                weatherProfile
                  ?.Avg_Low_C
              )}
              °C
            </strong>

          </div>


          <div>

            <span>
              Rainy Days
            </span>

            <strong>
              {formatDecimal(
                weatherProfile
                  ?.Rainy_Days,
                0
              )}
            </strong>

          </div>


          <div>

            <span>
              Cloud Cover
            </span>

            <strong>
              {formatDecimal(
                weatherProfile
                  ?.Cloud_pct
              )}
              %
            </strong>

          </div>


          <div>

            <span>
              Wind
            </span>

            <strong>
              {formatDecimal(
                weatherProfile
                  ?.Wind_mph
              )}{" "}
              mph
            </strong>

          </div>

        </div>

      </section>


      {/* SALES FORECAST */}

      <section className="pdf-section">

        <div className="pdf-section-title">

          <span>
            03
          </span>

          <h2>
            12-Month Sales Forecast
          </h2>

        </div>


        {weatherSource && (
          <div className="pdf-source">
            <strong>
              Future weather source:
            </strong>{" "}
            {weatherSource}
          </div>
        )}


        <div className="pdf-sales-summary">

          <div>

            <span>
              Average
            </span>

            <strong>
              {formatNumber(
                forecastSummary
                  ?.average
              )}
            </strong>

          </div>


          <div>

            <span>
              Highest
            </span>

            <strong>
              {formatNumber(
                forecastSummary
                  ?.highest
                  ?.predicted_sales
              )}
            </strong>

            <small>
              {
                forecastSummary
                  ?.highest
                  ?.month_name
              }
            </small>

          </div>


          <div>

            <span>
              Lowest
            </span>

            <strong>
              {formatNumber(
                forecastSummary
                  ?.lowest
                  ?.predicted_sales
              )}
            </strong>

            <small>
              {
                forecastSummary
                  ?.lowest
                  ?.month_name
              }
            </small>

          </div>

        </div>


        <ReportSalesChart
          data={forecast}
        />

      </section>


      {/* FORECAST TABLE */}

      <section className="pdf-section">

        <div className="pdf-section-title">

          <span>
            04
          </span>

          <h2>
            Monthly Forecast Details
          </h2>

        </div>


        <table className="pdf-table">

          <thead>

            <tr>

              <th>
                Month
              </th>

              <th>
                Prev. Sales
              </th>

              <th>
                Forecast
              </th>

            </tr>

          </thead>


          <tbody>

            {forecast.map(
              (item) => (

                <tr
                  key={
                    `pdf-${item.year}-${item.month}`
                  }
                >

                  <td>
                    <strong>
                      {
                        item.month_name
                      }{" "}
                      {item.year}
                    </strong>
                  </td>


                  <td>
                    {formatNumber(
                      item
                        .previous_sales_used
                    )}
                  </td>


                  <td>
                    {formatNumber(
                      item
                        .predicted_sales
                    )}
                  </td>


                </tr>
              )
            )}

          </tbody>

        </table>

      </section>


      {/* QUALITY */}

      <section className="pdf-section">

        <div className="pdf-section-title">

          <span>
            05
          </span>

          <h2>
            Coffee Quality Forecast
          </h2>

        </div>


        <div className="pdf-quality-list">

          {forecast.map(
            (item) => {

              const high =
                getQualityProbability(
                  item
                    .predicted_quality_probabilities,
                  "HIGH"
                );


              const medium =
                getQualityProbability(
                  item
                    .predicted_quality_probabilities,
                  "MEDIUM"
                );


              const low =
                getQualityProbability(
                  item
                    .predicted_quality_probabilities,
                  "LOW"
                );


              return (
                <div
                  className="pdf-quality-row"
                  key={
                    `quality-report-${item.year}-${item.month}`
                  }
                >

                  <div className="pdf-quality-month">

                    <strong>
                      {
                        item.month_name
                      }
                    </strong>

                    <span>
                      {item.year}
                    </span>

                  </div>


                  <div className="pdf-quality-track">

                    <div
                      className="pdf-high"
                      style={{
                        width:
                          `${high}%`,
                      }}
                    />


                    <div
                      className="pdf-medium"
                      style={{
                        width:
                          `${medium}%`,
                      }}
                    />


                    <div
                      className="pdf-low"
                      style={{
                        width:
                          `${low}%`,
                      }}
                    />

                  </div>


                  <strong className="pdf-quality-label">
                    {normalizeQualityLabel(
                      item
                        .predicted_quality_label
                    )}
                  </strong>

                </div>
              );
            }
          )}

        </div>


        <div className="pdf-quality-legend">

          <span>
            <i className="pdf-high-dot" />
            HIGH
          </span>

          <span>
            <i className="pdf-medium-dot" />
            MEDIUM
          </span>

          <span>
            <i className="pdf-low-dot" />
            LOW
          </span>

        </div>

      </section>


      {/* DECISION SUPPORT */}

      <section className="pdf-section">

        <div className="pdf-section-title">

          <span>
            06
          </span>

          <h2>
            Next Month Decision Support
          </h2>

        </div>


        <div className="pdf-decision-period">

          Recommendations for{" "}

          <strong>
            {
              decisionSupport
                .nextMonth
                .month_name
            }{" "}
            {
              decisionSupport
                .nextMonth
                .year
            }
          </strong>

        </div>


        <div className="pdf-recommendations">


          <PdfRecommendation
            title="Production"
            text={
              decisionSupport
                .productionRecommendation
            }
          />


          <PdfRecommendation
            title="Inventory"
            text={
              decisionSupport
                .inventoryRecommendation
            }
          />


          <PdfRecommendation
            title="Distribution"
            text={
              decisionSupport
                .distributionRecommendation
            }
          />


          <PdfRecommendation
            title="Coffee Quality"
            text={
              decisionSupport
                .qualityRecommendation
            }
          />


          <PdfRecommendation
            title="Weather & Quality"
            text={
              decisionSupport
                .weatherRecommendation
            }
          />

        </div>

      </section>


      {/* FOOTER */}

      <div className="pdf-footer">

        <strong>
          Coffee Sales Forecasting System
        </strong>

        <p>
          This report provides forecasting
          and decision-support information
          based on the configured sales,
          weather, and coffee-quality models.
        </p>

      </div>

    </div>
  );
}


// ============================================================
// PDF RECOMMENDATION
// ============================================================

function PdfRecommendation({
  title,
  text,
}) {
  return (
    <div className="pdf-recommendation pdf-avoid">

      <span>
        {title}
      </span>

      <p>
        {text}
      </p>

    </div>
  );
}


// ============================================================
// NORMAL RECOMMENDATION CARD
// ============================================================

function RecommendationCard({
  number,
  title,
  category,
  text,
  wide = false,
}) {
  return (
    <div
      className={`recommendation-card ${
        wide
          ? "recommendation-wide"
          : ""
      }`}
    >

      <div className="recommendation-number">
        {number}
      </div>


      <div>

        <span className="recommendation-category">
          {category}
        </span>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}


// ============================================================
// MAIN PAGE
// ============================================================

function SalesPredictionPage() {

  const reportRef =
    useRef(null);


  const now =
    new Date();


  const currentYear =
    now.getFullYear();


  const currentMonth =
    now.getMonth() + 1;


  const currentMonthName =
    MONTHS[
      currentMonth - 1
    ];


  const previousDate =
    new Date(currentYear, currentMonth - 2, 1);

  const previousYear =
    previousDate.getFullYear();

  const previousMonth =
    previousDate.getMonth() + 1;

  const previousMonthName =
    MONTHS[previousMonth - 1];


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    salesCount,
    setSalesCount,
  ] = useState("");


  const [
    savedCurrent,
    setSavedCurrent,
  ] = useState(null);


  const [
    weather,
    setWeather,
  ] = useState(null);


  const [
    forecastResult,
    setForecastResult,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    weatherLoading,
    setWeatherLoading,
  ] = useState(false);


  const [
    forecastLoading,
    setForecastLoading,
  ] = useState(false);


  const [
    downloadingReport,
    setDownloadingReport,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    weatherError,
    setWeatherError,
  ] = useState("");


  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const forecast =
    useMemo(
      () =>
        forecastResult
          ?.forecast ??
        [],
      [forecastResult]
    );


  const weatherProfile =
    weather
      ?.weather_profile ||
    {};


  const currentQuality =
    weather
      ?.predicted_quality_label;


  const currentQualityConfidence =
    getQualityConfidence(
      currentQuality,
      weather
        ?.predicted_quality_probabilities
    );


  // ==========================================================
  // FORECAST SUMMARY
  // ==========================================================

  const forecastSummary =
    useMemo(
      () => {

        if (
          !forecast.length
        ) {
          return null;
        }


        const values =
          forecast.map(
            (item) =>
              Number(
                item.predicted_sales
              ) || 0
          );


        const maximum =
          Math.max(...values);


        const minimum =
          Math.min(...values);


        return {

          average:
            values.reduce(
              (
                sum,
                value
              ) =>
                sum + value,
              0
            ) /
            values.length,


          highest:
            forecast[
              values.indexOf(
                maximum
              )
            ],


          lowest:
            forecast[
              values.indexOf(
                minimum
              )
            ],

        };
      },

      [forecast]
    );


  // ==========================================================
  // DECISION SUPPORT
  // ==========================================================

  const decisionSupport =
    useMemo(
      () =>
        buildDecisionSupport(
          forecast,
          forecastResult
            ?.base_period
            ?.actual_sales
        ),

      [
        forecast,
        forecastResult,
      ]
    );


  // ==========================================================
  // WEATHER
  // ==========================================================

  const loadWeather =
    async () => {

      setWeatherLoading(
        true
      );

      setWeatherError("");


      try {

        const data =
          await getCurrentMonthWeather();


        setWeather(data);


      } catch (err) {

        setWeatherError(
          getErrorMessage(
            err,
            "Unable to load current weather data."
          )
        );


      } finally {

        setWeatherLoading(
          false
        );
      }
    };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    const load =
      async () => {

        setLoading(true);


        const salesRequest =
          (async () => {

            try {

              const currentEntry =
                await getPreviousSalesEntry();


              if (
                currentEntry
              ) {

                setSavedCurrent(
                  currentEntry
                );


                setSalesCount(
                  String(
                    currentEntry
                      .sales_count
                  )
                );
              }


            } catch (err) {

              // Previous month has not been created yet.
              if (
                err?.response
                  ?.status !== 404
              ) {
                setError(
                  getErrorMessage(
                    err,
                    "Unable to load previous month sales data."
                  )
                );
              }

            }

          })();


        await Promise.allSettled(
          [
            salesRequest,
            loadWeather(),
          ]
        );


        setLoading(false);
      };


    load();

  }, []);


  // ==========================================================
  // SAVE SALES
  // ==========================================================

  const handleSaveCurrent =
    async (event) => {

      event.preventDefault();


      const sales =
        Number(
          salesCount
        );


      if (
        !Number.isFinite(
          sales
        ) ||
        sales < 0
      ) {

        setError(
          "Please enter a valid sales count."
        );

        return;
      }


      setSaving(true);

      setError("");

      setMessage("");


      try {

        const saved =
          await saveSalesEntry({

            year:
              previousYear,

            month:
              previousMonth,

            salesCount:
              Math.round(
                sales
              ),

          });


        setSavedCurrent(
          saved
        );


        setSalesCount(
          String(
            saved.sales_count
          )
        );


        // Previous forecast becomes outdated
        setForecastResult(
          null
        );


        await loadWeather();


        setMessage(
          `${previousMonthName} ${previousYear} actual sales saved successfully.`
        );


      } catch (err) {

        setError(
          getErrorMessage(
            err,
            "Unable to save sales data."
          )
        );


      } finally {

        setSaving(false);
      }
    };


  // ==========================================================
  // GENERATE FORECAST
  // ==========================================================

  const handleGenerateForecast =
    async () => {

      if (
        !savedCurrent
      ) {

        setError(
          `Save ${previousMonthName} ${previousYear} actual sales first.`
        );

        return;
      }


      setForecastLoading(
        true
      );

      setError("");

      setMessage("");


      try {

        const data =
          await generateYearForecast({

            startYear:
              currentYear,

            startMonth:
              currentMonth,

          });


        setForecastResult(
          data
        );


        const next =
          data
            ?.forecast
            ?.[0];


        if (
          next
        ) {

          setMessage(
            `${next.month_name} ${next.year} forecast and decision support generated successfully.`
          );

        } else {

          setMessage(
            "12-month forecast generated successfully."
          );
        }


      } catch (err) {

        setError(
          getErrorMessage(
            err,
            "Unable to generate forecast."
          )
        );


      } finally {

        setForecastLoading(
          false
        );
      }
    };


  // ==========================================================
  // DOWNLOAD PDF REPORT
  // ==========================================================

  const handleDownloadReport =
    async () => {

      if (
        !forecast.length ||
        !decisionSupport ||
        !reportRef.current
      ) {

        setError(
          "Generate the forecast before downloading the report."
        );

        return;
      }


      setDownloadingReport(
        true
      );


      setError("");

      setMessage("");


      try {

        const nextMonth =
          forecast[0];


        const filename =
          `Coffee_Forecast_Report_${nextMonth.month_name}_${nextMonth.year}.pdf`;


        const options = {

          margin: [
            8,
            8,
            8,
            8,
          ],


          filename,


          image: {
            type:
              "jpeg",

            quality:
              0.98,
          },


          html2canvas: {

            scale:
              2,

            useCORS:
              true,

            logging:
              false,

            backgroundColor:
              "#ffffff",

          },


          jsPDF: {

            unit:
              "mm",

            format:
              "a4",

            orientation:
              "portrait",

          },


          pagebreak: {

            mode: [
              "css",
              "legacy",
            ],

            avoid:
              ".pdf-avoid",

          },

        };


        await html2pdf()
          .set(options)
          .from(
            reportRef.current
          )
          .save();


        setMessage(
          "Forecast report downloaded successfully."
        );


      } catch (err) {

        console.error(
          "PDF generation error:",
          err
        );


        setError(
          "Unable to generate the PDF report."
        );


      } finally {

        setDownloadingReport(
          false
        );
      }
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading
  ) {
    return (
      <div className="sales-page">

        <style>
          {styles}
        </style>

        <div className="loading-card">
          Loading sales forecasting dashboard...
        </div>

      </div>
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="sales-page">

      <style>
        {styles}
      </style>


      {/* =================================================== */}
      {/* HERO */}
      {/* =================================================== */}

      <section className="hero">


        <div>

          <p className="eyebrow">
            Coffee Sales Forecasting
          </p>

          <h1>
            Sales & Coffee Quality Forecast
          </h1>

          <p className="hero-text">
            Enter the previous month&apos;s actual sales,
            predict 12 months starting from the current month,
            monitor coffee quality,
            and receive decision-support
            guidance for the immediate next month.
          </p>

        </div>


        <div className="hero-right">


          <div className="current-period">

            <span>
              Current Period
            </span>

            <strong>
              {currentMonthName}{" "}
              {currentYear}
            </strong>

           

          </div>


          <Link
            to="/sales-history"
            className="history-button"
          >
            Manage Sales History →
          </Link>


        </div>

      </section>


      {/* =================================================== */}
      {/* MESSAGE */}
      {/* =================================================== */}

      {(message || error) && (

        <div
          className={`notice ${
            error
              ? "notice-error"
              : "notice-success"
          }`}
        >
          {error || message}
        </div>

      )}


      {/* =================================================== */}
      {/* SALES + WEATHER */}
      {/* =================================================== */}

      <section className="top-grid">


        {/* SALES INPUT */}

        <div className="panel">


          <div className="panel-heading">

            <div>

              <p className="section-kicker">
                Step 1
              </p>

              <h2>
                Previous Month Sales
              </h2>

            </div>

          </div>


          <form
            className="sales-form"
            onSubmit={
              handleSaveCurrent
            }
          >


            <label
              htmlFor="sales"
            >
              Actual sales count for{" "}
              {previousMonthName}{" "}
              {previousYear}
            </label>


            <div className="sales-input-row">


              <input
                id="sales"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 12500"
                value={
                  salesCount
                }
                onChange={
                  (event) =>
                    setSalesCount(
                      event
                        .target
                        .value
                    )
                }
                required
              />


              <button
                type="submit"
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : savedCurrent
                  ? "Update Sales"
                  : "Save Sales"}
              </button>


            </div>

          </form>


          <div className="sales-data-status">

            <div className="sales-data-status-heading">
              <span>
                Sales Data Status
              </span>
            </div>

            <div className="sales-data-status-grid">

              <div>
                <span>
                  Period
                </span>
                <strong>
                  {previousMonthName} {previousYear}
                </strong>
              </div>

              <div>
                <span>
                  Saved Sales
                </span>
                <strong>
                  {savedCurrent
                    ? `${formatNumber(savedCurrent.sales_count)} units`
                    : "Not saved"}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong
                  className={
                    savedCurrent
                      ? "sales-ready"
                      : "sales-not-ready"
                  }
                >
                  {savedCurrent
                    ? "✓ Ready for Forecast"
                    : "Save sales to continue"}
                </strong>
              </div>

            </div>

          </div>

        </div>


        {/* WEATHER */}

        <div className="panel">


          <div className="panel-heading">

            <div>

              <p className="section-kicker">
                Weather API
              </p>

              <h2>
                Current Weather Profile
              </h2>

            </div>


            <button
              type="button"
              className="secondary-button"
              onClick={
                loadWeather
              }
              disabled={
                weatherLoading
              }
            >
              {weatherLoading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>


          {weatherError ? (

            <div className="error-box">
              {weatherError}
            </div>

          ) : weather ? (

            <>


              <div className="weather-location">

                <strong>
                  {weather.location}
                </strong>

                <span>
                  {weather.source}
                </span>

              </div>


              <div className="weather-grid">


                <div>

                  <span>
                    Rainfall
                  </span>

                  <strong>
                    {formatDecimal(
                      weatherProfile
                        .Rainfall_mm
                    )}{" "}
                    mm
                  </strong>

                </div>


                <div>

                  <span>
                    Humidity
                  </span>

                  <strong>
                    {formatDecimal(
                      weatherProfile
                        .Humidity_pct
                    )}
                    %
                  </strong>

                </div>


                <div>

                  <span>
                    Avg High
                  </span>

                  <strong>
                    {formatDecimal(
                      weatherProfile
                        .Avg_High_C
                    )}
                    °C
                  </strong>

                </div>


                <div>

                  <span>
                    Avg Low
                  </span>

                  <strong>
                    {formatDecimal(
                      weatherProfile
                        .Avg_Low_C
                    )}
                    °C
                  </strong>

                </div>


                <div>

                  <span>
                    Rainy Days
                  </span>

                  <strong>
                    {formatDecimal(
                      weatherProfile
                        .Rainy_Days,
                      0
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Cloud Cover
                  </span>

                  <strong>
                    {formatDecimal(
                      weatherProfile
                        .Cloud_pct
                    )}
                    %
                  </strong>

                </div>


                <div>

                  <span>
                    Wind
                  </span>

                  <strong>
                    {formatDecimal(
                      weatherProfile
                        .Wind_mph
                    )}{" "}
                    mph
                  </strong>

                </div>


              </div>


              <div className="current-quality">


                <div>

                  <span>
                    Current Coffee Quality
                  </span>

                  <strong
                    className={`quality-pill ${getQualityClass(
                      currentQuality
                    )}`}
                  >
                    {normalizeQualityLabel(
                      currentQuality
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Confidence
                  </span>

                  <strong>
                    {currentQualityConfidence !==
                    null
                      ? `${formatDecimal(
                          currentQualityConfidence
                        )}%`
                      : "—"}
                  </strong>

                </div>


              </div>


            </>

          ) : (

            <div className="empty-state">
              Weather data not loaded.
            </div>

          )}


        </div>


      </section>


      {/* =================================================== */}
      {/* SALES FORECAST */}
      {/* =================================================== */}

      <section className="panel main-panel">


        <div className="forecast-heading">


          <div>

            <p className="section-kicker">
              Step 2
            </p>

            <h2>
              12-Month Sales Forecast
            </h2>

            <p>
              The current actual sales value
              becomes the first previous-month
              sales input. Each generated
              prediction then becomes the input
              for the following month.
            </p>

          </div>


          <div className="forecast-actions">


            <button
              type="button"
              className="forecast-button"
              onClick={
                handleGenerateForecast
              }
              disabled={
                !savedCurrent ||
                forecastLoading
              }
            >
              {forecastLoading
                ? "Generating..."
                : "Generate 12-Month Forecast"}
            </button>


            <button
              type="button"
              className="download-report-button"
              onClick={
                handleDownloadReport
              }
              disabled={
                !forecast.length ||
                downloadingReport
              }
            >
              {downloadingReport
                ? "Creating PDF..."
                : "↓ Download Report"}
            </button>


          </div>


        </div>


        {forecastResult && (

          <div className="weather-source">

            <strong>
              Future Weather Source:
            </strong>{" "}

            {
              forecastResult
                .weather_source
            }

          </div>

        )}


        {forecastSummary && (

          <div className="summary-grid">


            <div>

              <span>
                Base Sales
              </span>

              <strong>
                {formatNumber(
                  forecastResult
                    ?.base_period
                    ?.actual_sales
                )}
              </strong>

              <small>
                {
                  forecastResult
                    ?.base_period
                    ?.month_name
                }{" "}
                {
                  forecastResult
                    ?.base_period
                    ?.year
                }
              </small>

            </div>


            <div>

              <span>
                Average Forecast
              </span>

              <strong>
                {formatNumber(
                  forecastSummary
                    .average
                )}
              </strong>

              <small>
                units / month
              </small>

            </div>


            <div>

              <span>
                Highest Forecast
              </span>

              <strong>
                {formatNumber(
                  forecastSummary
                    .highest
                    ?.predicted_sales
                )}
              </strong>

              <small>
                {
                  forecastSummary
                    .highest
                    ?.month_name
                }
              </small>

            </div>


            <div>

              <span>
                Lowest Forecast
              </span>

              <strong>
                {formatNumber(
                  forecastSummary
                    .lowest
                    ?.predicted_sales
                )}
              </strong>

              <small>
                {
                  forecastSummary
                    .lowest
                    ?.month_name
                }
              </small>

            </div>


          </div>

        )}


        <ForecastChart
          data={
            forecast
          }
        />


        {/* FORECAST TABLE */}

        {forecast.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Month Name</th>
                  <th>Predicted Sales Count</th>
                  <th>Sales Trend</th>
                </tr>
              </thead>

              <tbody>
                {forecast.map((item, index) => {
                  const previousSales =
                    Number(item.previous_sales_used) || 0;

                  const predictedSales =
                    Number(item.predicted_sales) || 0;

                  const difference =
                    predictedSales - previousSales;

                  const changePercentage =
                    previousSales > 0
                      ? (difference / previousSales) * 100
                      : 0;

                  let trendText = "No Change";
                  let trendClass = "trend-stable";
                  let trendIcon = "→";

                  if (difference > 0) {
                    trendText = "Increased";
                    trendClass = "trend-increase";
                    trendIcon = "↑";
                  } else if (difference < 0) {
                    trendText = "Decreased";
                    trendClass = "trend-decrease";
                    trendIcon = "↓";
                  }

                  return (
                    <tr
                      key={`${item.year}-${item.month}`}
                      className={
                        index === 0
                          ? "next-row"
                          : ""
                      }
                    >
                      <td>
                        <strong>
                          {item.month_name}
                        </strong>

                        <span className="table-year">
                          {item.year}
                        </span>

                        {index === 0 && (
                          <span className="next-label">
                            Next
                          </span>
                        )}
                      </td>

                      <td>
                        <strong className="predicted-sales-value">
                          {formatNumber(
                            item.predicted_sales
                          )}
                        </strong>
                      </td>

                      <td>
                        <div
                          className={`sales-trend ${trendClass}`}
                        >
                          <span className="trend-icon">
                            {trendIcon}
                          </span>

                          <div>
                            <strong>
                              {trendText}
                            </strong>

                            <small>
                              {difference !== 0
                                ? `${Math.abs(
                                    changePercentage
                                  ).toFixed(1)}%`
                                : "0%"}
                            </small>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}


      </section>


      {/* =================================================== */}
      {/* QUALITY CHART */}
      {/* =================================================== */}

      {forecast.length >
        0 && (

        <section className="panel main-panel">

          <QualityForecastChart
            data={
              forecast
            }
          />

        </section>

      )}


      {/* =================================================== */}
      {/* DECISION SUPPORT */}
      {/* =================================================== */}

      {decisionSupport && (

        <section className="panel main-panel decision-panel">


          <div className="decision-heading">


            <div>

              <p className="section-kicker">
                Step 3
              </p>

              <h2>
                Next Month Decision Support
              </h2>

              <p>
                Operational recommendations
                specifically generated for{" "}

                <strong>
                  {
                    decisionSupport
                      .nextMonth
                      .month_name
                  }{" "}
                  {
                    decisionSupport
                      .nextMonth
                      .year
                  }
                </strong>
                .
              </p>

            </div>


            <span
              className={`decision-status ${decisionSupport.demandClass}`}
            >
              {
                decisionSupport
                  .demandStatus
              }{" "}
              DEMAND
            </span>


          </div>


          {/* OVERVIEW */}

          <div className="decision-overview">


            <div className="decision-period">

              <span>
                Decision Period
              </span>

              <strong>
                {
                  decisionSupport
                    .nextMonth
                    .month_name
                }{" "}
                {
                  decisionSupport
                    .nextMonth
                    .year
                }
              </strong>

            </div>


            <div>

              <span>
                Current Sales
              </span>

              <strong>
                {formatNumber(
                  decisionSupport
                    .actualSales
                )}
              </strong>

            </div>


            <div>

              <span>
                Predicted Sales
              </span>

              <strong>
                {formatNumber(
                  decisionSupport
                    .nextMonthSales
                )}
              </strong>

            </div>


            <div>

              <span>
                Change
              </span>

              <strong>
                {decisionSupport
                  .salesChangePct >= 0
                  ? "+"
                  : ""}

                {formatDecimal(
                  decisionSupport
                    .salesChangePct
                )}
                %
              </strong>

            </div>


            <div>

              <span>
                Quality
              </span>

              <strong
                className={`quality-pill ${getQualityClass(
                  decisionSupport
                    .quality
                )}`}
              >
                {
                  decisionSupport
                    .quality
                }
              </strong>

            </div>


          </div>


          {/* PRIORITY */}

          <div className="priority-box">

            <strong>
              Priority Insight
            </strong>

            <p>
              {
                decisionSupport
                  .priorityMessage
              }
            </p>

          </div>


          {/* RECOMMENDATIONS */}

          <div className="recommendation-grid">


            <RecommendationCard
              number="01"
              title="Production Recommendation"
              category="Production"
              text={
                decisionSupport
                  .productionRecommendation
              }
            />


            <RecommendationCard
              number="02"
              title="Inventory Recommendation"
              category="Inventory"
              text={
                decisionSupport
                  .inventoryRecommendation
              }
            />


            <RecommendationCard
              number="03"
              title="Distribution Recommendation"
              category="Distribution"
              text={
                decisionSupport
                  .distributionRecommendation
              }
            />


            <RecommendationCard
              number="04"
              title="Quality Recommendation"
              category="Coffee Quality"
              text={
                decisionSupport
                  .qualityRecommendation
              }
            />


            <RecommendationCard
              number="05"
              title="Weather & Quality Insight"
              category="Weather"
              text={
                decisionSupport
                  .weatherRecommendation
              }
              wide
            />


          </div>


        </section>

      )}


      {/* =================================================== */}
      {/* OFF-SCREEN PDF REPORT */}
      {/* =================================================== */}

      <div className="pdf-staging">

        <div
          ref={
            reportRef
          }
        >

          <ForecastPdfReport

            currentYear={
              currentYear
            }

            currentMonthName={
              currentMonthName
            }

            savedCurrent={
              savedCurrent
            }

            weather={
              weather
            }

            weatherProfile={
              weatherProfile
            }

            forecast={
              forecast
            }

            forecastSummary={
              forecastSummary
            }

            decisionSupport={
              decisionSupport
            }

            weatherSource={
              forecastResult
                ?.weather_source
            }

          />

        </div>

      </div>


    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  .sales-page {
    min-height: 100vh;

    padding: 32px;

    color: #2b1a10;

    background:
      radial-gradient(
        circle at top right,
        rgba(139,90,43,.12),
        transparent 32%
      ),
      radial-gradient(
        circle at bottom left,
        rgba(101,67,33,.08),
        transparent 38%
      ),
      linear-gradient(
        180deg,
        #faf6f1 0%,
        #f2e9dd 55%,
        #e8ddcd 100%
      );

    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }


  /* ======================================================== */
  /* HERO */
  /* ======================================================== */

  .hero {
    max-width: 1250px;

    margin:
      0 auto 20px;

    padding: 34px;

    display: grid;

    grid-template-columns:
      1fr auto;

    gap: 25px;

    align-items: center;

    color: #fdf8f1;

    border-radius: 27px;

    background:
      radial-gradient(
        circle at 90% 10%,
        rgba(210,165,110,.18),
        transparent 45%
      ),
      linear-gradient(
        135deg,
        #2b1a10 0%,
        #4a2f1e 45%,
        #7a4a28 100%
      );

    box-shadow:
      0 24px 60px
      rgba(43,26,16,.28);
  }


  .eyebrow,
  .section-kicker {
    margin:
      0 0 7px;

    font-size: 11px;

    font-weight: 850;

    text-transform:
      uppercase;

    letter-spacing:
      .12em;
  }


  .eyebrow {
    color: #e6c79c;
  }


  .section-kicker {
    color: #8b5a2b;
  }


  .hero h1 {
    margin: 0;

    font-size:
      clamp(
        30px,
        4vw,
        48px
      );

    letter-spacing:
      -.5px;

        color: #ffffff;

  }


  .hero-text {
    max-width: 780px;

    margin:
      14px 0 0;

    color: #d8c3a5;

    line-height: 1.65;
  }


  .hero-right {
    min-width: 250px;
  }


  .current-period {
    padding: 19px;

    display: flex;

    flex-direction:
      column;

    gap: 5px;

    border-radius: 17px;

    background:
      rgba(
        255,
        255,
        255,
        .08
      );

    border:
      1px solid
      rgba(
        232,
        201,
        160,
        .18
      );
  }


  .current-period span,
  .current-period small {
    color: #d8c3a5;
  }


  .current-period strong {
    font-size: 21px;
  }


  .history-button {
    margin-top: 10px;

    padding:
      11px 14px;

    display: block;

    color: #fdf8f1;

    text-align: center;

    text-decoration:
      none;

    font-size: 12px;

    font-weight: 800;

    border-radius: 11px;

    background:
      rgba(
        232,
        201,
        160,
        .13
      );

    border:
      1px solid
      rgba(
        232,
        201,
        160,
        .19
      );

    transition:
      .2s ease;
  }


  .history-button:hover {
    background:
      rgba(
        232,
        201,
        160,
        .22
      );

    transform:
      translateY(-1px);
  }


  /* ======================================================== */
  /* NOTICES */
  /* ======================================================== */

  .notice {
    max-width: 1250px;

    margin:
      0 auto 20px;

    padding:
      13px 16px;

    border-radius: 12px;

    font-weight: 700;
  }


  .notice-success {
    color: #3f6a2e;

    background: #eaf4e2;

    border:
      1px solid #b8d6a4;
  }


  .notice-error,
  .error-box {
    color: #8f322b;

    background: #faeaea;

    border:
      1px solid #eab5b0;
  }


  .error-box {
    margin-top: 15px;

    padding: 13px;

    border-radius: 11px;
  }


  /* ======================================================== */
  /* PANELS */
  /* ======================================================== */

  .top-grid,
  .main-panel {
    max-width: 1250px;

    margin-left: auto;

    margin-right: auto;
  }


  .top-grid {
    margin-bottom: 20px;

    display: grid;

    grid-template-columns:
      1fr 1fr;

    gap: 20px;
  }


  .panel {
    padding: 24px;

    background:
      linear-gradient(
        180deg,
        #fffdfa 0%,
        #fdf8f1 100%
      );

    border:
      1px solid #e3d5c2;

    border-radius: 22px;

    box-shadow:
      0 12px 34px
      rgba(61,43,31,.08);
  }


  .main-panel {
    margin-bottom: 20px;
  }


  .panel-heading,
  .forecast-heading,
  .decision-heading,
  .quality-chart-heading {
    display: flex;

    justify-content:
      space-between;

    align-items:
      flex-start;

    gap: 20px;
  }


  h2 {
    margin: 0;

    color: #2b1a10;

    font-size: 23px;
  }


  .badge {
    padding:
      6px 10px;

    color: #6b4423;

    background: #f2e5d2;

    border:
      1px solid #e6d3b8;

    border-radius: 999px;

    font-size: 10px;

    font-weight: 850;
  }


  /* ======================================================== */
  /* SALES INPUT */
  /* ======================================================== */

  .sales-form {
    margin-top: 22px;
  }


  .sales-form label {
    display: block;

    margin-bottom: 8px;

    font-size: 13px;

    font-weight: 750;
  }


  .sales-input-row {
    display: grid;

    grid-template-columns:
      1fr auto;

    gap: 9px;
  }


  input,
  button {
    font: inherit;
  }


  .sales-input-row input {
    padding:
      12px 13px;

    border:
      1px solid #d8c6ae;

    border-radius: 11px;

    color: #2b1a10;

    background: #fffdfa;

    outline: none;
  }


  .sales-input-row input:focus {
    border-color: #8b5a2b;

    box-shadow:
      0 0 0 3px
      rgba(139,90,43,.12);
  }


  .sales-input-row button,
  .forecast-button {
    padding:
      12px 16px;

    color: #fdf8f1;

    background:
      linear-gradient(
        135deg,
        #4a2f1e,
        #7a4a28
      );

    border: 0;

    border-radius: 11px;

    font-weight: 800;

    cursor: pointer;
  }


  button:disabled {
    opacity: .55;

    cursor:
      not-allowed;
  }


  .secondary-button {
    padding:
      8px 11px;

    color: #6b4423;

    background: #f2e5d2;

    border:
      1px solid #e2ceb0;

    border-radius: 9px;

    font-weight: 750;

    cursor: pointer;
  }


  .sales-data-status {
    margin-top: 18px;
    overflow: hidden;
    border: 1px solid #eadcca;
    border-radius: 14px;
    background: #faf5ed;
  }

  .sales-data-status-heading {
    padding: 10px 14px;
    border-bottom: 1px solid #eadcca;
    background: #f5ede1;
  }

  .sales-data-status-heading span {
    color: #8b5a2b;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .sales-data-status-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .sales-data-status-grid > div {
    min-width: 0;
    padding: 14px;
  }

  .sales-data-status-grid > div + div {
    border-left: 1px solid #eadcca;
  }

  .sales-data-status-grid span {
    display: block;
    margin-bottom: 5px;
    color: #8a7360;
    font-size: 9px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .sales-data-status-grid strong {
    display: block;
    color: #3b2516;
    font-size: 12px;
    line-height: 1.35;
  }

  .sales-data-status-grid .sales-ready {
    color: #2f6f47;
  }

  .sales-data-status-grid .sales-not-ready {
    color: #9a5c24;
  }


  /* ======================================================== */
  /* WEATHER */
  /* ======================================================== */

  .weather-location {
    margin:
      18px 0 13px;

    display: flex;

    flex-direction:
      column;

    gap: 3px;
  }


  .weather-location span {
    color: #8a7360;

    font-size: 10px;
  }


  .weather-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        1fr
      );

    gap: 8px;
  }


  .weather-grid div,
  .summary-grid div {
    padding: 12px;

    background: #faf5ed;

    border:
      1px solid #eadcca;

    border-radius: 12px;
  }


  .weather-grid span,
  .summary-grid span {
    display: block;

    margin-bottom: 4px;

    color: #8a7360;

    font-size: 10px;
  }


  .weather-grid strong,
  .summary-grid strong {
    color: #3b2516;

    font-size: 16px;
  }


  .current-quality {
    margin-top: 14px;

    padding: 13px;

    display: grid;

    grid-template-columns:
      1fr 1fr;

    gap: 12px;

    background: #faf6ef;

    border:
      1px solid #e6d8c6;

    border-radius: 12px;
  }


  .current-quality div {
    display: flex;

    flex-direction:
      column;

    gap: 6px;
  }


  .current-quality span {
    color: #8a7360;

    font-size: 10px;
  }


  /* ======================================================== */
  /* QUALITY */
  /* ======================================================== */

  .quality-pill {
    width: fit-content;

    padding:
      5px 9px;

    display: inline-flex;

    align-items:
      center;

    justify-content:
      center;

    border-radius: 999px;

    font-size: 10px;

    font-weight: 900;
  }


  .quality-high {
    color: #236b43;

    background: #dff3e5;
  }


  .quality-medium {
    color: #80601b;

    background: #fff0c9;
  }


  .quality-low {
    color: #943c34;

    background: #f7d9d4;
  }


  .quality-unknown {
    color: #6f665e;

    background: #eee9e3;
  }


  /* ======================================================== */
  /* FORECAST */
  /* ======================================================== */

  .forecast-heading p,
  .decision-heading p,
  .quality-chart-heading p {
    max-width: 720px;

    margin:
      7px 0 0;

    color: #806b59;

    font-size: 13px;

    line-height: 1.55;
  }


  .forecast-actions {
    min-width: 250px;

    display: flex;

    flex-direction:
      column;

    gap: 9px;
  }


  .download-report-button {
    padding:
      12px 16px;

    border:
      1px solid #7a4a28;

    border-radius: 11px;

    color: #5b371f;

    background: #fff8ef;

    font-weight: 850;

    cursor: pointer;

    transition:
      .2s ease;
  }


  .download-report-button:hover:not(:disabled) {
    background: #f2e5d2;

    transform:
      translateY(-1px);
  }


  .weather-source {
    margin-top: 17px;

    padding:
      11px 13px;

    color: #654a34;

    background: #f5ece0;

    border-radius: 11px;

    font-size: 11px;
  }


  .summary-grid {
    margin-top: 18px;

    display: grid;

    grid-template-columns:
      repeat(
        4,
        1fr
      );

    gap: 10px;
  }


  .summary-grid small {
    display: block;

    margin-top: 3px;

    color: #9b8775;

    font-size: 10px;
  }


  /* ======================================================== */
  /* SALES CHART */
  /* ======================================================== */

  .chart-scroll {
    margin-top: 20px;

    overflow-x: auto;

    border:
      1px solid #e5d7c5;

    border-radius: 14px;

    background: #fffdfa;
  }


  .forecast-chart {
    width: 100%;

    min-width: 850px;
  }


  .chart-axis {
    stroke: #d7c8b7;
  }


  .sales-line {
    stroke: #7a4a28;

    stroke-width: 4;
  }


  .sales-dot {
    fill: white;

    stroke: #7a4a28;

    stroke-width: 4;
  }


  .chart-value {
    fill: #4a2f1e;

    font-size: 10px;

    font-weight: 800;
  }


  .chart-label {
    fill: #806b59;

    font-size: 10px;
  }


  /* ======================================================== */
  /* TABLE */
  /* ======================================================== */

  .table-wrap {
    width: 100%;

    margin: 20px auto 0;

    overflow-x: auto;

    border:
      1px solid #e5d7c5;

    border-radius: 12px;
  }


  table {
    width: 100%;

    min-width: 620px;

    table-layout: fixed;

    border-collapse:
      collapse;

    background: #fffdfa;
  }


  th,
  td {
    padding: 12px;

    text-align: center;

    vertical-align:
      middle;

    border-bottom:
      1px solid #f0e5d8;
  }


  th {
    color: #463930;

    background: #f5ede1;

    font-size: 15px;

    text-transform:
      uppercase;

    white-space:
      nowrap;
  }


  td {
    color: #4d3b2f;

    font-size: 15px;
  }


  .next-row {
    background: #fbf1e5;
  }


  .next-label {
    margin-left: 6px;

    padding:
      2px 5px;

    color: #6b4423;

    background: #ead6b9;

    border-radius: 999px;

    font-size: 12px;

    font-weight: 900;
  }


  .quality-table-cell {
    display: flex;

    flex-direction:
      column;

    gap: 3px;

    align-items:
      flex-start;
  }


  .quality-table-cell small {
    color: #8b7b6d;

    font-size: 15px;
  }


  .table-year {
    margin-left: 6px;

    color: #8a7360;

    font-size: 10px;

    font-weight: 600;
  }


  .predicted-sales-value {
    color: #3b2516;

    font-size: 14px;

    font-weight: 900;
  }


  .sales-trend {
    width: fit-content;

    margin: 0 auto;

    display: inline-flex;

    align-items: center;

    gap: 8px;

    padding: 7px 11px;

    border-radius: 10px;

    font-size: 13px;

    font-weight: 800;
  }


  .sales-trend > div {
    display: flex;

    flex-direction: column;

    gap: 1px;
  }


  .sales-trend small {
    font-size: 12px;

    opacity: .8;
  }


  .trend-icon {
    font-size: 17px;

    font-weight: 900;
  }


  .trend-increase {
    color: #25633f;

    background: #e2f3e8;

    border: 1px solid #b9dec7;
  }


  .trend-decrease {
    color: #963a31;

    background: #fae3df;

    border: 1px solid #edc0ba;
  }


  .trend-stable {
    color: #80601b;

    background: #fff1ce;

    border: 1px solid #ead79d;
  }


  /* ======================================================== */
  /* QUALITY CHART */
  /* ======================================================== */

  .quality-legend {
    display: flex;

    gap: 13px;

    flex-wrap: wrap;
  }


  .quality-legend span {
    display: flex;

    align-items: center;

    gap: 5px;

    font-size: 10px;

    font-weight: 800;
  }


  .quality-legend i {
    width: 9px;

    height: 9px;

    display: inline-block;

    border-radius: 3px;
  }


  .legend-high {
    background: #449267;
  }


  .legend-medium {
    background: #d4a63e;
  }


  .legend-low {
    background: #bd5b54;
  }


  .quality-summary-grid {
    margin-top: 22px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .quality-summary-card {
    padding: 16px 18px;
    border: 1px solid #eadfd3;
    border-radius: 14px;
    background: #fffdf9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .quality-summary-card span {
    color: #77685c;
    font-size: 12px;
    font-weight: 800;
  }

  .quality-summary-card strong {
    font-size: 28px;
    line-height: 1;
  }

  .quality-summary-high strong { color: #327653; }
  .quality-summary-medium strong { color: #9a7117; }
  .quality-summary-low strong { color: #a44843; }

  .quality-outlook-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .quality-outlook-card {
    min-width: 0;
    padding: 16px;
    border: 1px solid #eadfd3;
    border-radius: 16px;
    background: #fffdf9;
  }

  .quality-outlook-next {
    border: 2px solid rgba(139, 90, 43, .42);
    background: rgba(139, 90, 43, .045);
  }

  .quality-outlook-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .quality-outlook-top > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .quality-outlook-month {
    color: #33291f;
    font-size: 15px;
    font-weight: 900;
  }

  .quality-outlook-top small {
    color: #8b7c70;
    font-size: 10px;
    font-weight: 700;
  }

  .quality-next-badge {
    padding: 5px 7px;
    border-radius: 999px;
    background: #efe3d4;
    color: #77502c;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .04em;
  }

  .quality-outlook-status {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .quality-outlook-status > div {
    text-align: right;
    display: flex;
    flex-direction: column;
  }

  .quality-outlook-status > div strong {
    color: #33291f;
    font-size: 19px;
  }

  .quality-outlook-status > div small {
    color: #938476;
    font-size: 9px;
  }

  .quality-weather-mini {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #eee5dd;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .quality-weather-mini div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .quality-weather-mini span {
    color: #948578;
    font-size: 9px;
    font-weight: 700;
  }

  .quality-weather-mini strong {
    color: #4a3d31;
    font-size: 12px;
  }

  .quality-weather-source {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #7e7064;
    font-size: 9px;
    font-weight: 800;
  }

  .quality-weather-source i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #9a8c80;
  }

  .quality-weather-live i { background: #449267; }
  .quality-weather-live { color: #3d7758; }

  @media (max-width: 1050px) {
    .quality-outlook-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .quality-summary-grid,
    .quality-outlook-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .quality-summary-grid,
    .quality-outlook-grid {
      grid-template-columns: 1fr;
    }
  }


  .quality-chart-scroll {
    margin-top: 22px;

    overflow-x: auto;
  }


  .quality-chart {
    min-width: 900px;

    height: 360px;

    display: grid;

    grid-template-columns:
      repeat(
        12,
        1fr
      );

    gap: 10px;

    align-items: end;
  }


  .quality-column {
    height: 100%;

    padding: 6px;

    display: flex;

    flex-direction:
      column;

    justify-content:
      flex-end;

    align-items:
      center;

    gap: 7px;

    border-radius: 11px;
  }


  .quality-column-next {
    background:
      rgba(
        139,
        90,
        43,
        .07
      );

    border:
      1px solid
      rgba(
        139,
        90,
        43,
        .16
      );
  }


  .quality-column-label {
    min-height: 40px;

    display: flex;

    flex-direction:
      column;

    align-items:
      center;

    gap: 3px;
  }


  .quality-column-label small {
    color: #806f60;

    font-size: 9px;
  }


  .quality-bar-container {
    height: 230px;
  }


  .quality-bar {
    width: 42px;

    height: 220px;

    overflow: hidden;

    display: flex;

    flex-direction:
      column;

    border-radius:
      9px 9px 3px 3px;

    background: #eee8e1;
  }


  .quality-segment {
    width: 100%;

    display: flex;

    align-items:
      center;

    justify-content:
      center;

    flex-shrink: 0;
  }


  .quality-segment span {
    color: white;

    font-size: 8px;

    font-weight: 900;
  }


  .segment-high {
    background: #449267;
  }


  .segment-medium {
    background: #d4a63e;
  }


  .segment-low {
    background: #bd5b54;
  }


  .quality-month {
    min-height: 45px;

    display: flex;

    flex-direction:
      column;

    align-items:
      center;

    font-size: 10px;
  }


  .quality-month span {
    color: #938172;

    font-size: 8px;
  }


  .quality-month small {
    margin-top: 2px;

    padding:
      2px 5px;

    color: #6b4423;

    background: #ead6b9;

    border-radius: 999px;

    font-size: 7px;

    font-weight: 900;
  }


  /* ======================================================== */
  /* DECISION SUPPORT */
  /* ======================================================== */

  .decision-panel {
    border-color: #dbc5aa;
  }


  .decision-status {
    padding:
      8px 12px;

    border-radius: 999px;

    font-size: 10px;

    font-weight: 900;
  }


  .decision-positive {
    color: #21633e;

    background: #def4e7;
  }


  .decision-warning {
    color: #963a31;

    background: #f8deda;
  }


  .decision-stable {
    color: #7d5e19;

    background: #fff0c9;
  }


  .decision-overview {
    margin-top: 18px;

    display: grid;

    grid-template-columns:
      repeat(
        5,
        1fr
      );

    gap: 9px;
  }


  .decision-overview > div {
    padding: 13px;

    background: #faf5ed;

    border:
      1px solid #eadcca;

    border-radius: 12px;
  }


  .decision-overview span {
    display: block;

    margin-bottom: 5px;

    color: #8a7360;

    font-size: 9px;
  }


  .decision-period {
    color: #fdf8f1 !important;

    background:
      linear-gradient(
        135deg,
        #3a2416,
        #704323
      ) !important;

    border-color:
      transparent !important;
  }


  .decision-period span {
    color: #d9c2a4;
  }


  .priority-box {
    margin-top: 15px;

    padding: 16px;

    color: #fdf8f1;

    background:
      linear-gradient(
        135deg,
        #2b1a10,
        #704323
      );

    border-radius: 14px;
  }


  .priority-box strong {
    color: #e6c79c;

    font-size: 10px;

    text-transform:
      uppercase;
  }


  .priority-box p {
    margin:
      6px 0 0;

    line-height: 1.55;

    font-size: 13px;
  }


  .recommendation-grid {
    margin-top: 15px;

    display: grid;

    grid-template-columns:
      repeat(
        2,
        1fr
      );

    gap: 11px;
  }


  .recommendation-card {
    padding: 15px;

    display: flex;

    gap: 12px;

    border:
      1px solid #e5d7c5;

    border-radius: 14px;

    background: #fffdfa;
  }


  .recommendation-wide {
    grid-column:
      1 / -1;
  }


  .recommendation-number {
    width: 37px;

    height: 37px;

    min-width: 37px;

    display: flex;

    align-items:
      center;

    justify-content:
      center;

    color: #6b4423;

    background: #f2e5d2;

    border-radius: 10px;

    font-size: 10px;

    font-weight: 900;
  }


  .recommendation-category {
    color: #8b5a2b;

    font-size: 9px;

    font-weight: 850;

    text-transform:
      uppercase;
  }


  .recommendation-card h3 {
    margin:
      3px 0 6px;

    font-size: 15px;
  }


  .recommendation-card p {
    margin: 0;

    color: #76604e;

    font-size: 12px;

    line-height: 1.6;
  }


  /* ======================================================== */
  /* EMPTY / LOADING */
  /* ======================================================== */

  .empty-state {
    margin-top: 16px;

    padding: 25px;

    text-align: center;

    color: #8a7360;

    border:
      1px dashed #d7c5ae;

    border-radius: 12px;

    background: #fdf8f1;
  }


  .loading-card {
    max-width: 600px;

    margin: 80px auto;

    padding: 27px;

    color: #4a2f1e;

    background: white;

    text-align: center;

    border-radius: 17px;
  }


  /* ======================================================== */
  /* OFF SCREEN PDF */
  /* ======================================================== */

  .pdf-staging {
    position: fixed;

    left: -12000px;

    top: 0;

    width: 794px;

    background: white;

    pointer-events: none;
  }


  /* ======================================================== */
  /* PDF DOCUMENT */
  /* ======================================================== */

  .pdf-report {
    width: 760px;

    padding: 30px;

    color: #2b1a10;

    background: #ffffff;

    font-family:
      Arial,
      Helvetica,
      sans-serif;
  }


  .pdf-header {
    padding: 26px;

    display: flex;

    justify-content:
      space-between;

    align-items:
      flex-start;

    gap: 20px;

    color: white;

    background:
      linear-gradient(
        135deg,
        #2b1a10,
        #704323
      );

    border-radius: 14px;
  }


  .pdf-brand {
    display: block;

    margin-bottom: 7px;

    color: #e8cda9;

    font-size: 10px;

    font-weight: 800;

    text-transform:
      uppercase;

    letter-spacing:
      .12em;
  }


  .pdf-header h1 {
    max-width: 470px;

    margin: 0;

    color: white;

    font-size: 27px;

    line-height: 1.12;
  }


  .pdf-header p {
    margin:
      8px 0 0;

    color: #dcc6ab;

    font-size: 11px;
  }


  .pdf-generated {
    min-width: 145px;

    text-align: right;

    font-size: 9px;
  }


  .pdf-generated span {
    display: block;

    margin-bottom: 3px;

    color: #ddc8ad;
  }


  .pdf-generated strong {
    font-size: 10px;
  }


  .pdf-report-info {
    margin-top: 14px;

    display: grid;

    grid-template-columns:
      repeat(
        4,
        1fr
      );

    gap: 8px;
  }


  .pdf-report-info > div {
    padding: 11px;

    background: #f8f3ec;

    border:
      1px solid #ebdfd0;

    border-radius: 8px;
  }


  .pdf-report-info span {
    display: block;

    margin-bottom: 4px;

    color: #8a7360;

    font-size: 8px;

    text-transform:
      uppercase;
  }


  .pdf-report-info strong {
    font-size: 11px;
  }


  .pdf-section {
    margin-top: 22px;
  }


  .pdf-section-title {
    margin-bottom: 12px;

    display: flex;

    align-items: center;

    gap: 9px;

    padding-bottom: 7px;

    border-bottom:
      1px solid #e7dbcd;
  }


  .pdf-section-title > span {
    width: 27px;

    height: 27px;

    display: flex;

    align-items:
      center;

    justify-content:
      center;

    color: white;

    background: #704323;

    border-radius: 7px;

    font-size: 8px;

    font-weight: 900;
  }


  .pdf-section-title h2 {
    margin: 0;

    color: #3b2516;

    font-size: 16px;
  }


  .pdf-summary-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        1fr
      );

    gap: 8px;
  }


  .pdf-summary-grid > div {
    padding: 12px;

    background: #faf7f2;

    border:
      1px solid #ebdfd0;

    border-radius: 8px;
  }


  .pdf-summary-grid span,
  .pdf-sales-summary span,
  .pdf-weather-grid span {
    display: block;

    margin-bottom: 4px;

    color: #8b7663;

    font-size: 8px;

    text-transform:
      uppercase;
  }


  .pdf-summary-grid strong {
    font-size: 15px;
  }


  .pdf-summary-grid small {
    display: block;

    margin-top: 3px;

    color: #9a8877;

    font-size: 8px;
  }


  .pdf-priority {
    margin-top: 10px;

    padding: 13px;

    color: white;

    background: #49301f;

    border-radius: 8px;
  }


  .pdf-priority span {
    color: #e5c79e;

    font-size: 8px;

    font-weight: 800;

    text-transform:
      uppercase;
  }


  .pdf-priority p {
    margin:
      5px 0 0;

    font-size: 10px;

    line-height: 1.5;
  }


  .pdf-location {
    margin-bottom: 9px;

    display: flex;

    flex-direction:
      column;

    gap: 2px;

    color: #6c513d;

    font-size: 10px;
  }


  .pdf-location span {
    color: #988372;

    font-size: 8px;
  }


  .pdf-weather-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        1fr
      );

    gap: 7px;
  }


  .pdf-weather-grid > div {
    padding: 10px;

    background: #faf7f2;

    border:
      1px solid #ebdfd0;

    border-radius: 7px;
  }


  .pdf-weather-grid strong {
    font-size: 11px;
  }


  .pdf-source {
    margin-bottom: 9px;

    padding: 8px;

    color: #745b48;

    background: #faf5ef;

    border-radius: 6px;

    font-size: 8px;
  }


  .pdf-sales-summary {
    margin-bottom: 9px;

    display: grid;

    grid-template-columns:
      repeat(
        3,
        1fr
      );

    gap: 7px;
  }


  .pdf-sales-summary > div {
    padding: 10px;

    background: #faf7f2;

    border:
      1px solid #ebdfd0;

    border-radius: 7px;
  }


  .pdf-sales-summary strong {
    font-size: 13px;
  }


  .pdf-sales-summary small {
    display: block;

    margin-top: 2px;

    color: #978575;

    font-size: 8px;
  }


  .report-sales-chart {
    width: 100%;

    margin-top: 8px;

    background: #fff;

    border:
      1px solid #eee4d8;

    border-radius: 8px;
  }


  .report-chart-axis {
    stroke: #d7c9b9;

    stroke-width: 1;
  }


  .report-chart-line {
    stroke: #704323;

    stroke-width: 3;
  }


  .report-chart-dot {
    fill: #ffffff;

    stroke: #704323;

    stroke-width: 3;
  }


  .report-chart-value {
    fill: #49301f;

    font-size: 8px;

    font-weight: 700;
  }


  .report-chart-month {
    fill: #84705f;

    font-size: 8px;
  }


  .pdf-table {
    width: 100%;

    min-width: 0;

    border-collapse:
      collapse;

    font-size: 8px;
  }


  .pdf-table th {
    padding: 7px;

    text-align: left;

    color: #5d4938;

    background: #f3eadf;

    border:
      1px solid #e5d8c9;
  }


  .pdf-table td {
    padding: 7px;

    color: #493b31;

    border:
      1px solid #ece2d7;
  }


  .pdf-table tbody tr:nth-child(even) {
    background: #fcfaf7;
  }


  .pdf-quality-list {
    display: grid;

    gap: 7px;
  }


  .pdf-quality-row {
    display: grid;

    grid-template-columns:
      95px 1fr 70px;

    gap: 9px;

    align-items: center;
  }


  .pdf-quality-month {
    display: flex;

    flex-direction:
      column;
  }


  .pdf-quality-month strong {
    font-size: 9px;
  }


  .pdf-quality-month span {
    color: #968372;

    font-size: 7px;
  }


  .pdf-quality-track {
    height: 11px;

    display: flex;

    overflow: hidden;

    background: #eee;

    border-radius: 999px;
  }


  .pdf-high {
    height: 100%;

    background: #449267;
  }


  .pdf-medium {
    height: 100%;

    background: #d4a63e;
  }


  .pdf-low {
    height: 100%;

    background: #bd5b54;
  }


  .pdf-quality-label {
    font-size: 8px;

    text-align: right;
  }


  .pdf-quality-legend {
    margin-top: 10px;

    display: flex;

    justify-content:
      flex-end;

    gap: 13px;
  }


  .pdf-quality-legend span {
    display: flex;

    align-items: center;

    gap: 4px;

    font-size: 7px;

    font-weight: 700;
  }


  .pdf-quality-legend i {
    width: 7px;

    height: 7px;

    display: inline-block;

    border-radius: 2px;
  }


  .pdf-high-dot {
    background: #449267;
  }


  .pdf-medium-dot {
    background: #d4a63e;
  }


  .pdf-low-dot {
    background: #bd5b54;
  }


  .pdf-decision-period {
    margin-bottom: 10px;

    padding: 9px;

    color: #5b422e;

    background: #f7f0e8;

    border-radius: 7px;

    font-size: 9px;
  }


  .pdf-recommendations {
    display: grid;

    grid-template-columns:
      1fr 1fr;

    gap: 8px;
  }


  .pdf-recommendation {
    padding: 11px;

    border:
      1px solid #eadfd2;

    border-radius: 8px;

    background: #fdfbf8;
  }


  .pdf-recommendation span {
    color: #704323;

    font-size: 8px;

    font-weight: 800;

    text-transform:
      uppercase;
  }


  .pdf-recommendation p {
    margin:
      5px 0 0;

    color: #58483c;

    font-size: 9px;

    line-height: 1.5;
  }


  .pdf-footer {
    margin-top: 25px;

    padding-top: 12px;

    color: #84705f;

    text-align: center;

    font-size: 8px;

    border-top:
      1px solid #e5d9cc;
  }


  .pdf-footer p {
    max-width: 580px;

    margin:
      4px auto 0;

    line-height: 1.5;
  }


  .pdf-avoid {
    page-break-inside:
      avoid;

    break-inside:
      avoid;
  }


  /* ======================================================== */
  /* RESPONSIVE */
  /* ======================================================== */

  @media (
    max-width: 1000px
  ) {

    .hero,
    .top-grid {
      grid-template-columns:
        1fr;
    }


    .summary-grid,
    .weather-grid {
      grid-template-columns:
        repeat(
          2,
          1fr
        );
    }


    .decision-overview {
      grid-template-columns:
        repeat(
          3,
          1fr
        );
    }

  }


  @media (
    max-width: 700px
  ) {

    .sales-page {
      padding: 16px;
    }


    .hero {
      padding: 22px;
    }


    .sales-input-row,
    .summary-grid,
    .weather-grid,
    .decision-overview,
    .current-quality {
      grid-template-columns:
        1fr;
    }


    .sales-data-status-grid {
      grid-template-columns: 1fr;
    }

    .sales-data-status-grid > div + div {
      border-left: 0;
      border-top: 1px solid #eadcca;
    }


    .recommendation-grid {
      grid-template-columns:
        1fr;
    }


    .recommendation-wide {
      grid-column: auto;
    }


    .forecast-heading,
    .decision-heading,
    .quality-chart-heading {
      flex-direction:
        column;
    }


    .forecast-actions {
      width: 100%;

      min-width: 0;
    }


    .forecast-button,
    .download-report-button {
      width: 100%;
    }

  }
`;


export default SalesPredictionPage;