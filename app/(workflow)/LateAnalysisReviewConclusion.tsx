import React from "react";
import { Data, MergedData } from "../types";

const LateAnalysisReviewConclusion: React.FC<{
  chartValues: number[];
  cumulativeValues: number[];
  totalDocuments: number; // Add the total documents count as a prop
  data: MergedData[];
}> = ({
  chartValues = [],
  cumulativeValues = [],
  totalDocuments = 0,
  data = [],
}) => {
  const calculateStats = (arr: number[]) => {
    if (!arr.length) return { min: 0, max: 0, average: 0 };

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const average = arr.reduce((sum, value) => sum + value, 0) / arr.length;

    return { min, max, average };
  };

  const {
    min: minDaysLate,
    max: maxDaysLate,
    average: avgDaysLate,
  } = calculateStats(chartValues);
  const { average: avgCumulative } = calculateStats(cumulativeValues);

  // **Turnaround Time Insight**
  const turnaroundInsight =
    avgDaysLate <= 7
      ? {
          color: "bg-teal-100 ring-teal-400/90",
          message:
            "🟢 Turnaround Time Met: Most submissions adhered to the 7-day review policy. Performance is satisfactory.",
        }
      : {
          color: "bg-red-100 ring-red-400/90",
          message: `🔴 Turnaround Time Breached: Average days late (${avgDaysLate.toFixed(
            0
          )} days) is too high. Immediate action is needed.`,
        };

  // **Trend Insight (Improvement, Worsening, Stable)**
  const trendInsight =
    avgDaysLate > avgCumulative
      ? {
          color: "bg-orange-100 ring-orange-400/90",
          message: `🟠 Worsening Trends: Average delays (${avgDaysLate.toFixed(
            0
          )} days) are getting higher. This suggests a negative trend in review performance.`,
        }
      : avgDaysLate < avgCumulative
      ? {
          color: "bg-teal-100 ring-teal-400/90",
          message: `🟢 Improving Trends: Average delays (${avgDaysLate.toFixed(
            0
          )} days) are getting lower, indicating progress in review performance.`,
        }
      : {
          color: "bg-gray-100 ring-gray-400/90",
          message: `⚪ Stable Trends: Average delays (${avgDaysLate.toFixed(
            0
          )} days) are consistent with cumulative averages (${avgCumulative.toFixed(
            0
          )} days).`,
        };

  // Insights based on document count or days late per document

  return (
    <div className="w-3/12 font-thin text-xs leading-relaxed mb-4 text-slate-800">
      {/* Turnaround Time Insight */}
      <p className={`p-2  rounded-md mb-2 ${turnaroundInsight.color}`}>
        {turnaroundInsight.message}
      </p>

      {/* Trend Insight */}
      <p className={`p-2  rounded-md mb-2 ${trendInsight.color}`}>
        {trendInsight.message}
      </p>

      <br />
      <ul className="space-y-1">
        <li>
          ➡️ Total docs for review:{" "}
          {
            data.filter(
              (x: MergedData) =>
                x.stepStatus === "Overdue" || x.stepStatus === "Current"
            ).length
          }
        </li>
        <li>
          ➡️ Current Delay Rate:{" "}
          {chartValues.length !== 0 &&
            chartValues[chartValues.length - 1].toFixed(0)}{" "}
          days
        </li>
        <li> ➡️ Average days late: {avgDaysLate.toFixed(0)} days</li>
        <li> ➡️ Minimum days late: {minDaysLate.toFixed(0)} days</li>
        <li> ➡️ Maximum days late: {maxDaysLate.toFixed(0)} days</li>
      </ul>
    </div>
  );
};

export default LateAnalysisReviewConclusion;
