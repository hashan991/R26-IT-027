import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteBeanQualityReport,
  getBeanQualityReportHistory,
} from "../services/qualityService";


function clampPercentage(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, number),
  );
}


function AnalyticsLineChart({
  series = [],
  labels = [],
  emptyText = "Not enough historical data yet.",
}) {
  const width = 920;
  const height = 250;

  const padding = {
    top: 22,
    right: 24,
    bottom: 42,
    left: 42,
  };

  const plotWidth =
    width -
    padding.left -
    padding.right;

  const plotHeight =
    height -
    padding.top -
    padding.bottom;

  const pointCount = Math.max(
    1,
    labels.length,
  );

  const xForIndex = (index) => {
    if (pointCount <= 1) {
      return (
        padding.left +
        plotWidth / 2
      );
    }

    return (
      padding.left +
      (index /
        (pointCount - 1)) *
        plotWidth
    );
  };

  const yForValue = (value) =>
    padding.top +
    plotHeight -
    (clampPercentage(value) /
      100) *
      plotHeight;

  const validSeries =
    series.filter(
      (item) =>
        Array.isArray(item?.values) &&
        item.values.some(
          (value) =>
            Number.isFinite(
              Number(value),
            ),
        ),
    );

  if (
    labels.length === 0 ||
    validSeries.length === 0
  ) {
    return (
      <div className="analytics-chart-empty">
        {emptyText}
      </div>
    );
  }

  const gridValues = [
    100,
    75,
    50,
    25,
    0,
  ];

  const visibleLabelIndexes =
    labels.length <= 7
      ? labels.map(
          (_, index) => index,
        )
      : [
          0,
          Math.floor(
            (labels.length - 1) / 2,
          ),
          labels.length - 1,
        ];

  return (
    <div className="analytics-svg-wrap">
      <svg
        className="analytics-line-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Historical quality trend chart"
      >
        {gridValues.map(
          (gridValue) => {
            const y =
              yForValue(
                gridValue,
              );

            return (
              <g key={gridValue}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={
                    width -
                    padding.right
                  }
                  y2={y}
                  className="analytics-grid-line"
                />

                <text
                  x={
                    padding.left -
                    10
                  }
                  y={y + 4}
                  textAnchor="end"
                  className="analytics-axis-label"
                >
                  {gridValue}
                </text>
              </g>
            );
          },
        )}

        {validSeries.map(
          (item) => {
            const points =
              item.values
                .map(
                  (
                    value,
                    index,
                  ) => {
                    const number =
                      Number(value);

                    if (
                      !Number.isFinite(
                        number,
                      )
                    ) {
                      return null;
                    }

                    return {
                      x: xForIndex(
                        index,
                      ),
                      y: yForValue(
                        number,
                      ),
                      value:
                        number,
                      index,
                    };
                  },
                )
                .filter(Boolean);

            const polyline =
              points
                .map(
                  (point) =>
                    `${point.x},${point.y}`,
                )
                .join(" ");

            return (
              <g key={item.key}>
                {points.length > 1 && (
                  <polyline
                    points={
                      polyline
                    }
                    fill="none"
                    stroke={
                      item.color
                    }
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {points.map(
                  (point) => (
                    <g
                      key={`${item.key}-${point.index}`}
                    >
                      <circle
                        cx={
                          point.x
                        }
                        cy={
                          point.y
                        }
                        r="6"
                        fill={
                          item.color
                        }
                        stroke="#fffaf4"
                        strokeWidth="3"
                      >
                        <title>
                          {item.label}:{" "}
                          {point.value.toFixed(
                            2,
                          )}
                        </title>
                      </circle>
                    </g>
                  ),
                )}
              </g>
            );
          },
        )}

        {visibleLabelIndexes.map(
          (index) => (
            <text
              key={index}
              x={xForIndex(index)}
              y={
                height -
                13
              }
              textAnchor="middle"
              className="analytics-x-label"
            >
              {labels[index]}
            </text>
          ),
        )}
      </svg>
    </div>
  );
}


function AnalyticsLegend({
  items = [],
}) {
  return (
    <div className="analytics-legend">
      {items.map((item) => (
        <span key={item.label}>
          <i
            style={{
              background:
                item.color,
            }}
          />

          {item.label}
        </span>
      ))}
    </div>
  );
}


function DefectDistribution({
  items = [],
}) {
  const maximum =
    Math.max(
      1,
      ...items.map(
        (item) =>
          Number(
            item.count || 0,
          ),
      ),
    );

  return (
    <div className="defect-distribution">
      {items.map((item) => {
        const width =
          (Number(
            item.count || 0,
          ) /
            maximum) *
          100;

        return (
          <div
            className="defect-bar-row"
            key={item.key}
          >
            <div className="defect-bar-label">
              <span>
                {item.label}
              </span>

              <strong>
                {item.count}
              </strong>
            </div>

            <div className="defect-bar-track">
              <div
                className={`defect-bar-fill ${item.key}`}
                style={{
                  width: `${width}%`,
                }}
              />
            </div>

            <small>
              {item.percentage.toFixed(
                1,
              )}
              % of classified beans
            </small>
          </div>
        );
      })}
    </div>
  );
}


function ReportHistoryPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [deletingReportId, setDeletingReportId] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBeanQualityReportHistory(100);
      const history = Array.isArray(response?.data) ? response.data : [];

      setReports(history);
    } catch (loadError) {
      console.error("Unable to load report history:", loadError);

      setError(
        loadError?.response?.data?.detail ||
          "Unable to load saved quality reports.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const normalizeValue = (value) =>
    String(value || "")
      .trim()
      .toUpperCase();

  const humanize = (value) =>
    String(value || "")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const getReportDate = (report) => {
    const value =
      report?.saved_at ||
      report?.generated_at ||
      report?.updated_at;

    if (!value) {
      return null;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  };

  const formatDate = (report) => {
    const date = getReportDate(report);

    if (!date) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getScore = (report) => {
    const score = Number(report?.final_score ?? 0);

    return Number.isFinite(score) ? score : 0;
  };

  const getTotalBeans = (report) =>
    Number(
      report?.physical_assessment?.total_beans ??
        report?.physical_result?.total_beans ??
        report?.physical_result?.total_count ??
        0,
    );

  const getActiveProcessingModules = (report) => {
    const processing = report?.processing_intelligence;

    if (!processing || typeof processing !== "object") {
      return 0;
    }

    const modules = [
      processing.roasting_recommendation,
      processing.pre_roast_plan,
      processing.roast_quality_risk,
      processing.batch_usage,
      processing.usable_yield,
      processing.storage_handling,
      processing.preventive_process_guidance,
    ];

    return modules.filter(Boolean).length;
  };

  const scoreClass = (score) => {
    if (score >= 85) {
      return "excellent";
    }

    if (score >= 70) {
      return "good";
    }

    if (score >= 55) {
      return "review";
    }

    return "poor";
  };

  const statusClass = (status) => {
    const normalized = normalizeValue(status);

    if (normalized === "EXCELLENT" || normalized === "GOOD") {
      return "good";
    }

    if (normalized.includes("REVIEW") || normalized === "CONDITIONAL") {
      return "review";
    }

    if (
      normalized === "POOR" ||
      normalized === "REJECT" ||
      normalized.includes("HOLD")
    ) {
      return "poor";
    }

    return "neutral";
  };

  const gradeOptions = useMemo(() => {
    const values = new Set(
      reports
        .map((report) => normalizeValue(report?.grade))
        .filter(Boolean),
    );

    return ["ALL", ...Array.from(values).sort()];
  }, [reports]);

  const statusOptions = useMemo(() => {
    const values = new Set(
      reports
        .map((report) => normalizeValue(report?.quality_status))
        .filter(Boolean),
    );

    return ["ALL", ...Array.from(values).sort()];
  }, [reports]);

  const visibleReports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = reports.filter((report) => {
      const reportId = String(report?.report_id || "").toLowerCase();
      const grade = normalizeValue(report?.grade);
      const qualityStatus = normalizeValue(report?.quality_status);
      const inspectionType = String(
        report?.inspection_type || "",
      ).toLowerCase();

      const matchesSearch =
        !query ||
        reportId.includes(query) ||
        grade.toLowerCase().includes(query) ||
        qualityStatus.toLowerCase().includes(query) ||
        inspectionType.includes(query);

      const matchesGrade =
        gradeFilter === "ALL" || grade === gradeFilter;

      const matchesStatus =
        statusFilter === "ALL" || qualityStatus === statusFilter;

      return matchesSearch && matchesGrade && matchesStatus;
    });

    return [...filtered].sort((first, second) => {
      if (sortBy === "SCORE_HIGH") {
        return getScore(second) - getScore(first);
      }

      if (sortBy === "SCORE_LOW") {
        return getScore(first) - getScore(second);
      }

      const firstDate = getReportDate(first)?.getTime() || 0;
      const secondDate = getReportDate(second)?.getTime() || 0;

      if (sortBy === "OLDEST") {
        return firstDate - secondDate;
      }

      return secondDate - firstDate;
    });
  }, [reports, searchTerm, gradeFilter, statusFilter, sortBy]);

  const chronologicalReports = useMemo(
    () =>
      [...reports].sort(
        (first, second) =>
          (
            getReportDate(first)
              ?.getTime() || 0
          ) -
          (
            getReportDate(second)
              ?.getTime() || 0
          ),
      ),
    [reports],
  );


  const analytics = useMemo(() => {
    const total =
      reports.length;

    if (total === 0) {
      return {
        total: 0,
        averageScore: 0,
        bestScore: 0,
        lowestScore: 0,
        acceptable: 0,
        passRate: 0,
        rejectCount: 0,
        rejectRate: 0,
        needsAttention: 0,
        averageSensorScore: null,
        averagePhysicalScore: null,
        trend: "NO_DATA",
        trendDifference: 0,
        mostCommonDefect: null,
        defectItems: [],
        totalClassifiedBeans: 0,
        averageCleanYield: null,
        averageRecoverableYield: null,
        averageRejectYield: null,
      };
    }

    const scores =
      reports.map(
        (report) =>
          getScore(report),
      );

    const sumScores =
      scores.reduce(
        (totalScore, score) =>
          totalScore + score,
        0,
      );

    const acceptable =
      reports.filter(
        (report) =>
          getScore(report) >= 70,
      ).length;

    const rejectCount =
      reports.filter(
        (report) =>
          normalizeValue(
            report?.grade,
          ) === "REJECT",
      ).length;

    const sensorScores =
      reports
        .map((report) =>
          Number(
            report
              ?.sensor_assessment
              ?.sensor_score,
          ),
        )
        .filter(
          (value) =>
            Number.isFinite(
              value,
            ),
        );

    const physicalScores =
      reports
        .map((report) =>
          Number(
            report
              ?.physical_assessment
              ?.physical_score,
          ),
        )
        .filter(
          (value) =>
            Number.isFinite(
              value,
            ),
        );

    const defectTotals = {
      good: 0,
      broken: 0,
      black: 0,
      black_and_broken: 0,
    };

    reports.forEach(
      (report) => {
        const counts =
          report
            ?.physical_assessment
            ?.counts ||
          report
            ?.physical_result
            ?.defect_counts ||
          {};

        Object.keys(
          defectTotals,
        ).forEach(
          (key) => {
            const value =
              Number(
                counts?.[key] ||
                  0,
              );

            if (
              Number.isFinite(
                value,
              )
            ) {
              defectTotals[key] +=
                value;
            }
          },
        );
      },
    );

    const totalClassifiedBeans =
      Object.values(
        defectTotals,
      ).reduce(
        (
          totalBeans,
          value,
        ) =>
          totalBeans +
          value,
        0,
      );

    const defectItems = [
      {
        key: "good",
        label: "Good Beans",
      },
      {
        key: "broken",
        label: "Broken Beans",
      },
      {
        key: "black",
        label: "Black Beans",
      },
      {
        key:
          "black_and_broken",
        label:
          "Black + Broken",
      },
    ].map((item) => ({
      ...item,

      count:
        defectTotals[
          item.key
        ],

      percentage:
        totalClassifiedBeans >
        0
          ? (
              defectTotals[
                item.key
              ] /
              totalClassifiedBeans
            ) *
            100
          : 0,
    }));

    const defectOnly =
      defectItems.filter(
        (item) =>
          item.key !==
          "good",
      );

    const mostCommonDefect =
      [...defectOnly].sort(
        (first, second) =>
          second.count -
          first.count,
      )[0] || null;

    const cleanYieldValues = [];
    const recoverableYieldValues = [];
    const rejectYieldValues = [];

    reports.forEach(
      (report) => {
        const yieldData =
          report
            ?.processing_intelligence
            ?.usable_yield ||
          {};

        const clean =
          Number(
            yieldData
              ?.clean_usable_percentage ??
              yieldData
                ?.clean_good_percentage,
          );

        const recoverable =
          Number(
            yieldData
              ?.potential_recoverable_percentage,
          );

        const reject =
          Number(
            yieldData
              ?.severe_reject_percentage,
          );

        if (
          Number.isFinite(
            clean,
          )
        ) {
          cleanYieldValues.push(
            clean,
          );
        }

        if (
          Number.isFinite(
            recoverable,
          )
        ) {
          recoverableYieldValues.push(
            recoverable,
          );
        }

        if (
          Number.isFinite(
            reject,
          )
        ) {
          rejectYieldValues.push(
            reject,
          );
        }
      },
    );

    const average = (
      values,
    ) => {
      if (
        values.length === 0
      ) {
        return null;
      }

      return (
        values.reduce(
          (
            totalValue,
            value,
          ) =>
            totalValue +
            value,
          0,
        ) /
        values.length
      );
    };

    const chronologicalScores =
      chronologicalReports.map(
        (report) =>
          getScore(report),
      );

    const trendDifference =
      chronologicalScores.length >
      1
        ? chronologicalScores[
            chronologicalScores.length -
              1
          ] -
          chronologicalScores[0]
        : 0;

    let trend =
      "INSUFFICIENT_DATA";

    if (
      chronologicalScores.length >
      1
    ) {
      if (
        trendDifference >= 3
      ) {
        trend =
          "IMPROVING";
      } else if (
        trendDifference <= -3
      ) {
        trend =
          "DECLINING";
      } else {
        trend =
          "STABLE";
      }
    }

    return {
      total,

      averageScore:
        sumScores / total,

      bestScore:
        Math.max(
          ...scores,
        ),

      lowestScore:
        Math.min(
          ...scores,
        ),

      acceptable,

      passRate:
        (acceptable /
          total) *
        100,

      rejectCount,

      rejectRate:
        (rejectCount /
          total) *
        100,

      needsAttention:
        total -
        acceptable,

      averageSensorScore:
        average(
          sensorScores,
        ),

      averagePhysicalScore:
        average(
          physicalScores,
        ),

      trend,

      trendDifference,

      mostCommonDefect:
        mostCommonDefect &&
        mostCommonDefect.count >
          0
          ? mostCommonDefect
          : null,

      defectItems,

      totalClassifiedBeans,

      averageCleanYield:
        average(
          cleanYieldValues,
        ),

      averageRecoverableYield:
        average(
          recoverableYieldValues,
        ),

      averageRejectYield:
        average(
          rejectYieldValues,
        ),
    };
  }, [
    reports,
    chronologicalReports,
  ]);


  const trendLabels =
    chronologicalReports.map(
      (report, index) =>
        `R${index + 1}`,
    );


  const finalScoreTrend =
    chronologicalReports.map(
      (report) =>
        getScore(report),
    );


  const sensorScoreTrend =
    chronologicalReports.map(
      (report) => {
        const value =
          Number(
            report
              ?.sensor_assessment
              ?.sensor_score,
          );

        return Number.isFinite(
          value,
        )
          ? value
          : null;
      },
    );


  const physicalScoreTrend =
    chronologicalReports.map(
      (report) => {
        const value =
          Number(
            report
              ?.physical_assessment
              ?.physical_score,
          );

        return Number.isFinite(
          value,
        )
          ? value
          : null;
      },
    );


  const cleanYieldTrend =
    chronologicalReports.map(
      (report) => {
        const yieldData =
          report
            ?.processing_intelligence
            ?.usable_yield ||
          {};

        const value =
          Number(
            yieldData
              ?.clean_usable_percentage ??
              yieldData
                ?.clean_good_percentage,
          );

        return Number.isFinite(
          value,
        )
          ? value
          : null;
      },
    );


  const recoverableYieldTrend =
    chronologicalReports.map(
      (report) => {
        const value =
          Number(
            report
              ?.processing_intelligence
              ?.usable_yield
              ?.potential_recoverable_percentage,
          );

        return Number.isFinite(
          value,
        )
          ? value
          : null;
      },
    );


  const rejectYieldTrend =
    chronologicalReports.map(
      (report) => {
        const value =
          Number(
            report
              ?.processing_intelligence
              ?.usable_yield
              ?.severe_reject_percentage,
          );

        return Number.isFinite(
          value,
        )
          ? value
          : null;
      },
    );


  const historicalSummaryText =
    useMemo(() => {
      if (
        analytics.total === 0
      ) {
        return (
          "No saved report data is available for historical analysis yet."
        );
      }

      const parts = [
        `${analytics.total} saved coffee bean ${
          analytics.total === 1
            ? "batch has"
            : "batches have"
        } been included in the current history analysis.`,

        `The average final quality score is ${analytics.averageScore.toFixed(
          2,
        )}, with ${analytics.acceptable} ${
          analytics.acceptable ===
          1
            ? "batch"
            : "batches"
        } at or above the 70-point acceptance level.`,
      ];

      if (
        analytics.total > 1
      ) {
        if (
          analytics.trend ===
          "IMPROVING"
        ) {
          parts.push(
            `The chronological quality trend is improving, with the latest score ${Math.abs(
              analytics.trendDifference,
            ).toFixed(
              2,
            )} points above the earliest saved score.`,
          );
        } else if (
          analytics.trend ===
          "DECLINING"
        ) {
          parts.push(
            `The chronological quality trend is declining, with the latest score ${Math.abs(
              analytics.trendDifference,
            ).toFixed(
              2,
            )} points below the earliest saved score.`,
          );
        } else {
          parts.push(
            "The overall quality trend is currently stable across the available saved reports.",
          );
        }
      }

      if (
        analytics.averageSensorScore !==
          null &&
        analytics.averagePhysicalScore !==
          null
      ) {
        const difference =
          analytics.averageSensorScore -
          analytics.averagePhysicalScore;

        if (
          difference >= 5
        ) {
          parts.push(
            `Average physical inspection performance is ${Math.abs(
              difference,
            ).toFixed(
              2,
            )} points lower than average sensor performance, so physical bean quality is the weaker assessment dimension in the current history.`,
          );
        } else if (
          difference <= -5
        ) {
          parts.push(
            `Average sensor performance is ${Math.abs(
              difference,
            ).toFixed(
              2,
            )} points lower than average physical inspection performance.`,
          );
        }
      }

      if (
        analytics.mostCommonDefect
      ) {
        parts.push(
          `${analytics.mostCommonDefect.label} are the most frequently recorded physical defect category across the saved reports.`,
        );
      }

      return parts.join(
        " ",
      );
    }, [analytics]);



  const handleView = (reportId) => {
    if (!reportId) {
      return;
    }

    navigate(`/beans/reports/${encodeURIComponent(reportId)}`);
  };

  const handleDownload = (reportId) => {
    if (!reportId) {
      return;
    }

    navigate(
      `/beans/reports/${encodeURIComponent(reportId)}?download=1`,
    );
  };

  const handleDelete = async (report) => {
    const reportId = report?.report_id;

    if (!reportId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete saved report ${reportId}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingReportId(reportId);

      await deleteBeanQualityReport(reportId);

      setReports((previousReports) =>
        previousReports.filter((item) => item.report_id !== reportId),
      );
    } catch (deleteError) {
      console.error("Unable to delete report:", deleteError);

      alert(
        deleteError?.response?.data?.detail ||
          "Unable to delete the report.",
      );
    } finally {
      setDeletingReportId("");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setGradeFilter("ALL");
    setStatusFilter("ALL");
    setSortBy("NEWEST");
  };

  return (
    <div className="bean-report-history-page">
      <style>{`
        .bean-report-history-page {
          --coffee-950: #1d130e;
          --coffee-900: #2a1b13;
          --coffee-800: #3b271b;
          --coffee-700: #593b28;
          --coffee-600: #755039;
          --coffee-500: #966c4d;
          --cream-50: #fffdf9;
          --cream-100: #fbf7f0;
          --cream-200: #f2e8db;
          --cream-300: #e7d7c5;
          --text-main: #2e241e;
          --text-soft: #7a6a5f;
          --line: rgba(92, 62, 42, 0.13);
          --shadow: 0 18px 55px rgba(70, 45, 29, 0.09);
          min-height: 100vh;
          padding: 34px clamp(18px, 4vw, 52px) 70px;
          color: var(--text-main);
          background:
            radial-gradient(
              circle at top right,
              rgba(145, 98, 65, 0.10),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #f8f3eb 0%,
              #f4eee5 100%
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

        .bean-report-history-page * {
          box-sizing: border-box;
        }

        .history-container {
          width: min(1500px, 100%);
          margin: 0 auto;
        }

        .history-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
        }

        .history-back-button,
        .history-refresh-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 850;
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease;
        }

        .history-back-button {
          border: 1px solid rgba(75, 50, 34, 0.14);
          color: #5d4434;
          background: rgba(255,255,255,0.72);
        }

        .history-back-button:hover,
        .history-refresh-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(66, 43, 29, 0.08);
        }

        .history-refresh-button {
          border: none;
          color: white;
          background:
            linear-gradient(
              135deg,
              #5e3e2b,
              #7b5439
            );
          box-shadow:
            0 8px 20px
            rgba(75, 49, 32, 0.17);
        }

        .history-refresh-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .history-hero {
          position: relative;
          overflow: hidden;
          padding: 30px clamp(22px, 4vw, 38px);
          border-radius: 26px;
          color: white;
          background:
            radial-gradient(
              circle at 88% 10%,
              rgba(255,255,255,0.10),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #2a1b13 0%,
              #4d3121 55%,
              #70492f 100%
            );
          box-shadow:
            0 22px 55px
            rgba(61, 39, 25, 0.16);
        }

        .history-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            );
          background-size: 26px 26px;
          mask-image: linear-gradient(to bottom, black, transparent);
        }

        .history-hero-content {
          position: relative;
          z-index: 1;
        }

        .history-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 10px;
          color: #ddc8b5;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .history-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e4ba91;
          box-shadow:
            0 0 0 5px
            rgba(228, 186, 145, 0.12);
        }

        .history-title {
          margin: 0;
          color: #fffaf4;
          font-size: clamp(30px, 4vw, 46px);
          line-height: 1.05;
          letter-spacing: -0.045em;
        }

        .history-description {
          max-width: 780px;
          margin: 13px 0 0;
          color: #e7dbd1;
          font-size: 14px;
          line-height: 1.75;
        }

        .history-summary-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 24px;
        }

        .history-summary-card {
          padding: 15px 16px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.065);
          backdrop-filter: blur(8px);
        }

        .history-summary-card span {
          display: block;
          color: #cdb9aa;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .history-summary-card strong {
          display: block;
          margin-top: 6px;
          color: white;
          font-size: 22px;
        }

        .history-summary-card small {
          display: block;
          margin-top: 5px;
          color: rgba(239, 221, 205, 0.63);
          font-size: 9px;
          line-height: 1.4;
        }


        /* ================================================
           HISTORICAL ANALYTICS
        ================================================ */

        .analytics-section {
          margin-top: 22px;
          padding: 24px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.90),
              rgba(250, 245, 238, 0.82)
            );
          box-shadow: var(--shadow);
        }

        .analytics-section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .analytics-section-heading > div:first-child {
          max-width: 760px;
        }

        .analytics-section-heading span,
        .analytics-card-heading span,
        .analytics-summary-card span,
        .analytics-mini-card span,
        .analytics-callout span,
        .analytics-yield-summary span {
          display: block;
          color: #9a704f;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .analytics-section-heading h2 {
          margin: 5px 0 0;
          color: #3d2a1f;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .analytics-section-heading p,
        .analytics-card-heading p {
          margin: 6px 0 0;
          color: #857469;
          font-size: 11px;
          line-height: 1.6;
        }

        .analytics-trend-pill {
          min-width: 145px;
          padding: 11px 14px;
          border-radius: 14px;
          text-align: right;
          border: 1px solid rgba(92, 62, 42, 0.10);
          background: #f7efe5;
        }

        .analytics-trend-pill span {
          display: block;
          color: #9b8677;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .analytics-trend-pill strong {
          display: block;
          margin-top: 5px;
          color: #5d4433;
          font-size: 12px;
        }

        .analytics-trend-pill.improving {
          background: #eaf4ea;
          border-color: rgba(63, 126, 72, 0.14);
        }

        .analytics-trend-pill.improving strong {
          color: #3c7246;
        }

        .analytics-trend-pill.declining {
          background: #fff0eb;
          border-color: rgba(161, 67, 50, 0.14);
        }

        .analytics-trend-pill.declining strong {
          color: #9d493c;
        }

        .analytics-summary-card {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr);
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 16px;
          padding: 17px 18px;
          border-radius: 18px;
          background:
            linear-gradient(
              135deg,
              #3c281c,
              #6a4630
            );
          box-shadow:
            0 14px 30px
            rgba(66, 43, 28, 0.12);
        }

        .analytics-summary-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #3b2416;
          background:
            linear-gradient(
              135deg,
              #f1d3a3,
              #d7a165
            );
          font-size: 18px;
          font-weight: 900;
        }

        .analytics-summary-card span {
          color: #d9b890;
        }

        .analytics-summary-card p {
          margin: 7px 0 0;
          color: #f1e5da;
          font-size: 12px;
          line-height: 1.75;
        }

        .analytics-mini-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 11px;
          margin-bottom: 16px;
        }

        .analytics-mini-card {
          padding: 14px;
          border: 1px solid rgba(92, 62, 42, 0.10);
          border-radius: 15px;
          background: #fffdf9;
        }

        .analytics-mini-card strong {
          display: block;
          margin-top: 6px;
          color: #4c3425;
          font-size: 20px;
        }

        .analytics-mini-card small {
          display: block;
          margin-top: 4px;
          color: #998579;
          font-size: 8px;
          line-height: 1.4;
        }

        .analytics-card {
          min-width: 0;
          padding: 18px;
          border: 1px solid rgba(92, 62, 42, 0.10);
          border-radius: 19px;
          background: rgba(255,255,255,0.77);
          box-shadow:
            0 10px 28px
            rgba(72, 47, 31, 0.055);
        }

        .analytics-wide-card {
          margin-top: 15px;
        }

        .analytics-two-column {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
          gap: 15px;
          margin-top: 15px;
        }

        .analytics-card-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 12px;
        }

        .analytics-card-heading h3 {
          margin: 5px 0 0;
          color: #493225;
          font-size: 16px;
        }

        .analytics-card-heading > strong {
          flex-shrink: 0;
          padding: 7px 10px;
          border-radius: 10px;
          color: #6c4a33;
          background: #f4e8da;
          font-size: 10px;
        }

        .analytics-svg-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .analytics-line-chart {
          display: block;
          width: 100%;
          min-width: 520px;
          height: auto;
        }

        .analytics-grid-line {
          stroke: rgba(92, 62, 42, 0.10);
          stroke-width: 1;
        }

        .analytics-axis-label,
        .analytics-x-label {
          fill: #9b887b;
          font-size: 10px;
          font-weight: 700;
        }

        .analytics-chart-empty {
          min-height: 190px;
          display: grid;
          place-items: center;
          padding: 20px;
          text-align: center;
          color: #9a887b;
          font-size: 11px;
          line-height: 1.6;
          border-radius: 14px;
          background: #faf6f0;
        }

        .analytics-legend {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin: 2px 0 8px;
        }

        .analytics-legend span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #7c6a5e;
          font-size: 9px;
          font-weight: 800;
        }

        .analytics-legend i {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .defect-distribution {
          display: grid;
          gap: 16px;
          margin-top: 17px;
        }

        .defect-bar-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }

        .defect-bar-label span {
          color: #594438;
          font-size: 10px;
          font-weight: 800;
        }

        .defect-bar-label strong {
          color: #4b3223;
          font-size: 11px;
        }

        .defect-bar-track {
          height: 9px;
          overflow: hidden;
          border-radius: 999px;
          background: #eee4d8;
        }

        .defect-bar-fill {
          height: 100%;
          min-width: 2px;
          border-radius: inherit;
          transition: width 350ms ease;
        }

        .defect-bar-fill.good {
          background: #5f865f;
        }

        .defect-bar-fill.broken {
          background: #c08d4e;
        }

        .defect-bar-fill.black {
          background: #5a493f;
        }

        .defect-bar-fill.black_and_broken {
          background: #9f5648;
        }

        .defect-bar-row small {
          display: block;
          margin-top: 5px;
          color: #a08d80;
          font-size: 8px;
        }

        .analytics-callout {
          margin-top: 18px;
          padding: 13px;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #f5e9dc,
              #fffaf4
            );
          border: 1px solid rgba(102, 68, 45, 0.10);
        }

        .analytics-callout strong {
          display: block;
          margin-top: 5px;
          color: #5c3d2b;
          font-size: 12px;
        }

        .analytics-callout small {
          display: block;
          margin-top: 3px;
          color: #927d6e;
          font-size: 8px;
        }

        .analytics-yield-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .analytics-yield-summary > div {
          padding: 12px;
          border-radius: 13px;
          background: #faf5ee;
        }

        .analytics-yield-summary strong {
          display: block;
          margin-top: 5px;
          color: #543a29;
          font-size: 14px;
        }


        .history-panel {
          margin-top: 22px;
          padding: 20px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: rgba(255,255,255,0.75);
          box-shadow: var(--shadow);
          backdrop-filter: blur(10px);
        }

        .history-filter-grid {
          display: grid;
          grid-template-columns:
            minmax(260px, 2fr)
            minmax(150px, 1fr)
            minmax(170px, 1fr)
            minmax(180px, 1fr)
            auto;
          gap: 11px;
          align-items: center;
        }

        .history-control {
          width: 100%;
          min-height: 44px;
          padding: 0 13px;
          border: 1px solid rgba(93, 63, 43, 0.14);
          border-radius: 12px;
          outline: none;
          color: #42342b;
          background: #fff;
          font: inherit;
          font-size: 12px;
          font-weight: 650;
        }

        .history-control:focus {
          border-color: rgba(117, 80, 57, 0.45);
          box-shadow: 0 0 0 4px rgba(117, 80, 57, 0.08);
        }

        .history-reset-button {
          min-height: 44px;
          padding: 0 15px;
          border: 1px solid rgba(93, 63, 43, 0.14);
          border-radius: 12px;
          color: #664a38;
          background: #f7efe5;
          cursor: pointer;
          font-size: 11px;
          font-weight: 850;
        }

        .history-result-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--line);
        }

        .history-result-bar p {
          margin: 0;
          color: #7d6c60;
          font-size: 11px;
        }

        .history-result-bar strong {
          color: #4c382b;
        }

        .history-state {
          margin-top: 22px;
          padding: 42px 22px;
          border: 1px dashed rgba(91, 61, 40, 0.24);
          border-radius: 20px;
          text-align: center;
          background: rgba(255,255,255,0.62);
        }

        .history-state h3 {
          margin: 0;
          color: #513a2b;
          font-size: 17px;
        }

        .history-state p {
          max-width: 620px;
          margin: 8px auto 0;
          color: #7d6c60;
          font-size: 12px;
          line-height: 1.65;
        }

        .history-state.error {
          border-color: rgba(174, 71, 52, 0.27);
          background: #fff4f0;
        }

        .history-table-card {
          margin-top: 22px;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: rgba(255,255,255,0.83);
          box-shadow: var(--shadow);
        }

        .history-table-scroll {
          overflow-x: auto;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1040px;
        }

        .history-table thead {
          background:
            linear-gradient(
              180deg,
              #f3e9dc,
              #eee0d0
            );
        }

        .history-table th {
          padding: 14px 16px;
          text-align: left;
          color: #725541;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.075em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(91, 61, 40, 0.11);
          white-space: nowrap;
        }

        .history-table td {
          padding: 15px 16px;
          vertical-align: middle;
          border-bottom: 1px solid rgba(91, 61, 40, 0.08);
          color: #54463d;
          font-size: 11px;
        }

        .history-table tbody tr:hover {
          background: rgba(247, 239, 229, 0.64);
        }

        .history-table tbody tr:last-child td {
          border-bottom: none;
        }

        .history-report-id {
          display: block;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #3f2d23;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }

        .history-date {
          color: #84756a;
          white-space: nowrap;
        }

        .history-score {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 58px;
          min-height: 34px;
          padding: 0 9px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 950;
        }

        .history-score.excellent,
        .history-score.good {
          color: #376b43;
          background: #e7f2e8;
        }

        .history-score.review {
          color: #886019;
          background: #fff0d7;
        }

        .history-score.poor {
          color: #9b3e31;
          background: #fde5df;
        }

        .history-badge {
          display: inline-flex;
          align-items: center;
          min-height: 27px;
          padding: 0 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.045em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .history-badge.grade {
          color: #5f4431;
          background: #f1e5d7;
        }

        .history-badge.good {
          color: #357043;
          background: #e7f2e8;
        }

        .history-badge.review {
          color: #886019;
          background: #fff0d7;
        }

        .history-badge.poor {
          color: #9b3e31;
          background: #fde5df;
        }

        .history-badge.neutral {
          color: #655d57;
          background: #eeeae6;
        }

        .history-module-count {
          font-weight: 900;
          color: #644832;
        }

        .history-actions {
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }

        .history-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 0 10px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.035em;
          text-transform: uppercase;
          transition:
            transform 150ms ease,
            box-shadow 150ms ease,
            opacity 150ms ease;
        }

        .history-action:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 7px 16px rgba(67, 43, 28, 0.10);
        }

        .history-action.view {
          border: 1px solid rgba(82, 59, 43, 0.14);
          color: #fff;
          background:
            linear-gradient(
              135deg,
              #5e3e2b,
              #76513a
            );
        }

        .history-action.download {
          border: 1px solid #d9c5ae;
          color: #674831;
          background: #f3e8da;
        }

        .history-action.delete {
          border: 1px solid #ecc7be;
          color: #9b3e31;
          background: #fff0ec;
        }

        .history-action:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .history-mobile-list {
          display: none;
          margin-top: 22px;
          gap: 13px;
        }

        .history-mobile-card {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 19px;
          background: rgba(255,255,255,0.83);
          box-shadow: 0 12px 28px rgba(67, 43, 28, 0.07);
        }

        .history-mobile-head {
          padding: 15px;
          background:
            linear-gradient(
              135deg,
              #f5ecdf,
              #fff
            );
          border-bottom: 1px solid var(--line);
        }

        .history-mobile-head strong {
          display: block;
          color: #453226;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .history-mobile-head span {
          display: block;
          margin-top: 5px;
          color: #87776b;
          font-size: 10px;
        }

        .history-mobile-body {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          padding: 15px;
        }

        .history-mobile-stat {
          padding: 11px;
          border-radius: 12px;
          background: #faf6f0;
        }

        .history-mobile-stat span {
          display: block;
          color: #978477;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .history-mobile-stat strong {
          display: block;
          margin-top: 4px;
          color: #4f3a2c;
          font-size: 12px;
        }

        .history-mobile-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 7px;
          padding: 0 15px 15px;
        }

        @media (max-width: 1100px) {
          .history-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .analytics-mini-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .analytics-two-column {
            grid-template-columns: 1fr;
          }

          .history-filter-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .history-reset-button {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .bean-report-history-page {
            padding: 20px 14px 50px;
          }

          .history-topbar {
            align-items: stretch;
          }

          .history-back-button,
          .history-refresh-button {
            flex: 1;
          }

          .history-hero {
            padding: 24px 19px;
          }

          .analytics-section {
            padding: 17px;
          }

          .analytics-section-heading,
          .analytics-card-heading {
            align-items: stretch;
            flex-direction: column;
          }

          .analytics-trend-pill {
            width: 100%;
            text-align: left;
          }

          .analytics-summary-card {
            grid-template-columns: 1fr;
          }

          .analytics-summary-icon {
            width: 42px;
            height: 42px;
          }

          .analytics-yield-summary {
            grid-template-columns: 1fr;
          }

          .history-summary-grid,
          .history-filter-grid {
            grid-template-columns: 1fr;
          }

          .history-reset-button {
            grid-column: auto;
          }

          .history-result-bar {
            align-items: flex-start;
            flex-direction: column;
          }

          .history-table-card {
            display: none;
          }

          .history-mobile-list {
            display: grid;
          }
        }

        @media (max-width: 480px) {
          .analytics-mini-grid {
            grid-template-columns: 1fr;
          }

          .history-mobile-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="history-container">
        <div className="history-topbar">
          <button
            type="button"
            className="history-back-button"
            onClick={() => navigate("/beans")}
          >
            ← Bean Quality
          </button>

          <button
            type="button"
            className="history-refresh-button"
            onClick={loadReports}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh Reports"}
          </button>
        </div>

        <section className="history-hero">
          <div className="history-hero-content">
            <div className="history-kicker">
              <span className="history-kicker-dot" />
              Coffee Quality Intelligence
            </div>

            <h1 className="history-title">
              Quality Report History
            </h1>

            <p className="history-description">
              Review previously saved coffee bean quality assessments,
              inspect decision-support results, download report PDFs,
              and manage historical inspection records.
            </p>

            <div className="history-summary-grid">
              <div className="history-summary-card">
                <span>Total Reports</span>

                <strong>
                  {analytics.total}
                </strong>

                <small>
                  Saved assessments
                </small>
              </div>

              <div className="history-summary-card">
                <span>Average Score</span>

                <strong>
                  {analytics.averageScore.toFixed(
                    2,
                  )}
                </strong>

                <small>
                  Best{" "}
                  {analytics.bestScore.toFixed(
                    2,
                  )}
                </small>
              </div>

              <div className="history-summary-card">
                <span>Pass Rate</span>

                <strong>
                  {analytics.passRate.toFixed(
                    1,
                  )}
                  %
                </strong>

                <small>
                  {analytics.acceptable} /{" "}
                  {analytics.total} score ≥
                  70
                </small>
              </div>

              <div className="history-summary-card">
                <span>Reject Rate</span>

                <strong>
                  {analytics.rejectRate.toFixed(
                    1,
                  )}
                  %
                </strong>

                <small>
                  {analytics.rejectCount} rejected{" "}
                  {analytics.rejectCount === 1
                    ? "batch"
                    : "batches"}
                </small>
              </div>
            </div>
          </div>
        </section>

        {!loading &&
          !error &&
          reports.length > 0 && (
            <section className="analytics-section">

              <div className="analytics-section-heading">
                <div>
                  <span>
                    HISTORICAL QUALITY ANALYTICS
                  </span>

                  <h2>
                    Batch Performance Overview
                  </h2>

                  <p>
                    Descriptive analytics calculated from all
                    currently loaded saved quality reports.
                  </p>
                </div>

                <div
                  className={`analytics-trend-pill ${
                    analytics.trend ===
                    "IMPROVING"
                      ? "improving"
                      : analytics.trend ===
                          "DECLINING"
                        ? "declining"
                        : "stable"
                  }`}
                >
                  <span>
                    Quality Trend
                  </span>

                  <strong>
                    {analytics.trend ===
                    "IMPROVING"
                      ? "↑ Improving"
                      : analytics.trend ===
                          "DECLINING"
                        ? "↓ Declining"
                        : analytics.trend ===
                            "STABLE"
                          ? "→ Stable"
                          : "Not Enough Data"}
                  </strong>
                </div>
              </div>


              <div className="analytics-summary-card">
                <div className="analytics-summary-icon">
                  ✦
                </div>

                <div>
                  <span>
                    AUTOMATIC HISTORICAL SUMMARY
                  </span>

                  <p>
                    {historicalSummaryText}
                  </p>
                </div>
              </div>


              <div className="analytics-mini-grid">

                <div className="analytics-mini-card">
                  <span>
                    Best Score
                  </span>

                  <strong>
                    {analytics.bestScore.toFixed(
                      2,
                    )}
                  </strong>

                  <small>
                    Highest saved final score
                  </small>
                </div>

                <div className="analytics-mini-card">
                  <span>
                    Lowest Score
                  </span>

                  <strong>
                    {analytics.lowestScore.toFixed(
                      2,
                    )}
                  </strong>

                  <small>
                    Lowest saved final score
                  </small>
                </div>

                <div className="analytics-mini-card">
                  <span>
                    Avg Sensor
                  </span>

                  <strong>
                    {analytics.averageSensorScore ===
                    null
                      ? "N/A"
                      : analytics.averageSensorScore.toFixed(
                          2,
                        )}
                  </strong>

                  <small>
                    Sensor assessment score
                  </small>
                </div>

                <div className="analytics-mini-card">
                  <span>
                    Avg Physical
                  </span>

                  <strong>
                    {analytics.averagePhysicalScore ===
                    null
                      ? "N/A"
                      : analytics.averagePhysicalScore.toFixed(
                          2,
                        )}
                  </strong>

                  <small>
                    Physical AI score
                  </small>
                </div>

              </div>


              <div className="analytics-card analytics-wide-card">
                <div className="analytics-card-heading">
                  <div>
                    <span>
                      QUALITY PERFORMANCE
                    </span>

                    <h3>
                      Final Quality Score Trend
                    </h3>

                    <p>
                      Chronological final score from earliest
                      to latest saved assessment.
                    </p>
                  </div>

                  <strong>
                    {analytics.averageScore.toFixed(
                      2,
                    )}{" "}
                    avg
                  </strong>
                </div>

                <AnalyticsLineChart
                  labels={
                    trendLabels
                  }
                  series={[
                    {
                      key:
                        "final-score",
                      label:
                        "Final Score",
                      color:
                        "#7b4f34",
                      values:
                        finalScoreTrend,
                    },
                  ]}
                />
              </div>


              <div className="analytics-two-column">

                <div className="analytics-card">
                  <div className="analytics-card-heading">
                    <div>
                      <span>
                        ASSESSMENT COMPARISON
                      </span>

                      <h3>
                        Sensor vs Physical Quality
                      </h3>

                      <p>
                        Compare the two assessment dimensions
                        that feed the final quality result.
                      </p>
                    </div>
                  </div>

                  <AnalyticsLegend
                    items={[
                      {
                        label:
                          "Sensor Score",
                        color:
                          "#507758",
                      },
                      {
                        label:
                          "Physical Score",
                        color:
                          "#a5643f",
                      },
                    ]}
                  />

                  <AnalyticsLineChart
                    labels={
                      trendLabels
                    }
                    series={[
                      {
                        key:
                          "sensor",
                        label:
                          "Sensor Score",
                        color:
                          "#507758",
                        values:
                          sensorScoreTrend,
                      },
                      {
                        key:
                          "physical",
                        label:
                          "Physical Score",
                        color:
                          "#a5643f",
                        values:
                          physicalScoreTrend,
                      },
                    ]}
                  />
                </div>


                <div className="analytics-card">
                  <div className="analytics-card-heading">
                    <div>
                      <span>
                        PHYSICAL DEFECT PROFILE
                      </span>

                      <h3>
                        Aggregate Bean Distribution
                      </h3>

                      <p>
                        Combined physical classifications
                        across all saved reports.
                      </p>
                    </div>

                    <strong>
                      {
                        analytics.totalClassifiedBeans
                      }{" "}
                      beans
                    </strong>
                  </div>

                  <DefectDistribution
                    items={
                      analytics.defectItems
                    }
                  />

                  {analytics.mostCommonDefect && (
                    <div className="analytics-callout">
                      <span>
                        Most Common Defect
                      </span>

                      <strong>
                        {
                          analytics
                            .mostCommonDefect
                            .label
                        }
                      </strong>

                      <small>
                        {
                          analytics
                            .mostCommonDefect
                            .count
                        }{" "}
                        detected across saved reports
                      </small>
                    </div>
                  )}
                </div>

              </div>


              <div className="analytics-card analytics-wide-card">
                <div className="analytics-card-heading">
                  <div>
                    <span>
                      PROCESSING INTELLIGENCE — MODULE 5
                    </span>

                    <h3>
                      Usable Yield Trend
                    </h3>

                    <p>
                      Historical clean usable, potential
                      recoverable, and severe reject yield
                      percentages.
                    </p>
                  </div>
                </div>

                <AnalyticsLegend
                  items={[
                    {
                      label:
                        "Clean Usable",
                      color:
                        "#4e7555",
                    },
                    {
                      label:
                        "Potential Recoverable",
                      color:
                        "#b07b43",
                    },
                    {
                      label:
                        "Severe Reject",
                      color:
                        "#9d4f43",
                    },
                  ]}
                />

                <AnalyticsLineChart
                  labels={
                    trendLabels
                  }
                  series={[
                    {
                      key:
                        "clean-yield",
                      label:
                        "Clean Usable",
                      color:
                        "#4e7555",
                      values:
                        cleanYieldTrend,
                    },
                    {
                      key:
                        "recoverable-yield",
                      label:
                        "Potential Recoverable",
                      color:
                        "#b07b43",
                      values:
                        recoverableYieldTrend,
                    },
                    {
                      key:
                        "reject-yield",
                      label:
                        "Severe Reject",
                      color:
                        "#9d4f43",
                      values:
                        rejectYieldTrend,
                    },
                  ]}
                  emptyText="Yield analytics will appear when Module 5 usable-yield percentages are available in saved reports."
                />

                <div className="analytics-yield-summary">
                  <div>
                    <span>
                      Avg Clean Usable
                    </span>

                    <strong>
                      {analytics.averageCleanYield ===
                      null
                        ? "N/A"
                        : `${analytics.averageCleanYield.toFixed(
                            1,
                          )}%`}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Avg Recoverable
                    </span>

                    <strong>
                      {analytics.averageRecoverableYield ===
                      null
                        ? "N/A"
                        : `${analytics.averageRecoverableYield.toFixed(
                            1,
                          )}%`}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Avg Severe Reject
                    </span>

                    <strong>
                      {analytics.averageRejectYield ===
                      null
                        ? "N/A"
                        : `${analytics.averageRejectYield.toFixed(
                            1,
                          )}%`}
                    </strong>
                  </div>
                </div>
              </div>

            </section>
          )}


        <section className="history-panel">
          <div className="history-filter-grid">
            <input
              className="history-control"
              type="search"
              placeholder="Search report ID, grade or status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              className="history-control"
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
            >
              {gradeOptions.map((grade) => (
                <option value={grade} key={grade}>
                  {grade === "ALL"
                    ? "All Grades"
                    : `Grade ${humanize(grade)}`}
                </option>
              ))}
            </select>

            <select
              className="history-control"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((status) => (
                <option value={status} key={status}>
                  {status === "ALL"
                    ? "All Statuses"
                    : humanize(status)}
                </option>
              ))}
            </select>

            <select
              className="history-control"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="SCORE_HIGH">Highest Score</option>
              <option value="SCORE_LOW">Lowest Score</option>
            </select>

            <button
              type="button"
              className="history-reset-button"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>

          <div className="history-result-bar">
            <p>
              Showing <strong>{visibleReports.length}</strong> of{" "}
              <strong>{reports.length}</strong> saved reports
            </p>

            <p>
              MongoDB collection: <strong>bean_quality_reports</strong>
            </p>
          </div>
        </section>

        {loading && (
          <div className="history-state">
            <h3>Loading saved quality reports...</h3>
            <p>
              Retrieving coffee bean assessment history from the database.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="history-state error">
            <h3>Unable to Load Reports</h3>
            <p>{error}</p>

            <div style={{ marginTop: "14px" }}>
              <button
                type="button"
                className="history-refresh-button"
                onClick={loadReports}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && visibleReports.length === 0 && (
          <div className="history-state">
            <h3>No Quality Reports Found</h3>

            <p>
              {reports.length === 0
                ? "No coffee bean quality reports have been saved yet. Generate a quality report and use Save Report first."
                : "No saved report matches the current search and filter settings."}
            </p>
          </div>
        )}

        {!loading && !error && visibleReports.length > 0 && (
          <div className="history-table-card">
            <div className="history-table-scroll">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Saved Date</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Beans</th>
                    <th>AI Modules</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleReports.map((report) => {
                    const reportId = report?.report_id;
                    const score = getScore(report);
                    const grade = report?.grade || "N/A";
                    const qualityStatus =
                      report?.quality_status || "Unknown";
                    const moduleCount =
                      getActiveProcessingModules(report);

                    return (
                      <tr key={reportId}>
                        <td>
                          <span
                            className="history-report-id"
                            title={reportId}
                          >
                            {reportId}
                          </span>
                        </td>

                        <td>
                          <span className="history-date">
                            {formatDate(report)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`history-score ${scoreClass(score)}`}
                          >
                            {score.toFixed(2)}
                          </span>
                        </td>

                        <td>
                          <span className="history-badge grade">
                            {humanize(grade)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`history-badge ${statusClass(
                              qualityStatus,
                            )}`}
                          >
                            {humanize(qualityStatus)}
                          </span>
                        </td>

                        <td>{getTotalBeans(report)}</td>

                        <td>
                          <span className="history-module-count">
                            {moduleCount} / 7
                          </span>
                        </td>

                        <td>
                          <div className="history-actions">
                            <button
                              type="button"
                              className="history-action view"
                              onClick={() => handleView(reportId)}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="history-action download"
                              onClick={() => handleDownload(reportId)}
                            >
                              PDF
                            </button>

                            <button
                              type="button"
                              className="history-action delete"
                              disabled={deletingReportId === reportId}
                              onClick={() => handleDelete(report)}
                            >
                              {deletingReportId === reportId
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && visibleReports.length > 0 && (
          <div className="history-mobile-list">
            {visibleReports.map((report) => {
              const reportId = report?.report_id;
              const score = getScore(report);

              return (
                <article
                  className="history-mobile-card"
                  key={`mobile-${reportId}`}
                >
                  <div className="history-mobile-head">
                    <strong>{reportId}</strong>
                    <span>{formatDate(report)}</span>
                  </div>

                  <div className="history-mobile-body">
                    <div className="history-mobile-stat">
                      <span>Score</span>
                      <strong>{score.toFixed(2)}</strong>
                    </div>

                    <div className="history-mobile-stat">
                      <span>Grade</span>
                      <strong>{humanize(report?.grade || "N/A")}</strong>
                    </div>

                    <div className="history-mobile-stat">
                      <span>Status</span>
                      <strong>
                        {humanize(report?.quality_status || "Unknown")}
                      </strong>
                    </div>

                    <div className="history-mobile-stat">
                      <span>Beans</span>
                      <strong>{getTotalBeans(report)}</strong>
                    </div>

                    <div className="history-mobile-stat">
                      <span>AI Modules</span>
                      <strong>
                        {getActiveProcessingModules(report)} / 7
                      </strong>
                    </div>

                    <div className="history-mobile-stat">
                      <span>Inspection</span>
                      <strong>
                        {humanize(
                          report?.inspection_type || "Bean Quality",
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="history-mobile-actions">
                    <button
                      type="button"
                      className="history-action view"
                      onClick={() => handleView(reportId)}
                    >
                      View
                    </button>

                    <button
                      type="button"
                      className="history-action download"
                      onClick={() => handleDownload(reportId)}
                    >
                      PDF
                    </button>

                    <button
                      type="button"
                      className="history-action delete"
                      disabled={deletingReportId === reportId}
                      onClick={() => handleDelete(report)}
                    >
                      {deletingReportId === reportId
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportHistoryPage;
