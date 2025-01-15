import React from "react";
import { Data, MergedData } from "../types";

const LateAnalysisConclusion: React.FC<{
  chartValues: number[];
  cumulativeValues: number[];
  data: MergedData[]; // Ensure data is passed into the component
}> = ({ chartValues = [], cumulativeValues = [], data = [] }) => {
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

  // Calculate the total number of late documents based on Days Late > 0
  const totalLateDocs = data.filter(
    (row: MergedData) =>
      (row.daysLateSubmission ?? 0) > 0 &&
      row.submissionStatus === "Submission Required"
  ).length;

  // Determine volume category based on totalLateDocs
  const volumeCategory =
    totalLateDocs === 0
      ? "none"
      : totalLateDocs <= 10
      ? "low"
      : totalLateDocs <= 20
      ? "moderate"
      : "high";

  // Insights for Turnaround Time (7-day policy)
  const turnaroundInsight =
    avgDaysLate <= 7
      ? {
          color: "bg-teal-100 ring-teal-400/90",
          message:
            "🟢 Turnaround Time Met: Most submissions adhered to the 7-day policy. Performance is satisfactory.",
        }
      : {
          color: "bg-red-100 ring-red-400/90",
          message: `🔴 Turnaround Time Breached: Average days late (${avgDaysLate.toFixed(
            0
          )} days) Too high. Immediate action is needed.`,
        };

  // Insights for Volume of Late Submissions
  const volumeInsight =
    volumeCategory === "none"
      ? {
          color: "bg-blue-100 ring-blue-400/90",
          message:
            "🔵 No Late Submissions: No delays were recorded. Excellent performance!",
        }
      : volumeCategory === "low"
      ? {
          color: "bg-green-100 ring-green-400/90",
          message: `🟢 Low Volume of Late Submissions: Only ${totalLateDocs} late submissions recorded. Performance is under control.`,
        }
      : volumeCategory === "moderate"
      ? {
          color: "bg-orange-100 ring-orange-400/90",
          message: `🟠 Moderate Volume of Late Submissions: ${totalLateDocs} late submissions recorded. Monitor closely to prevent escalation.`,
        }
      : {
          color: "bg-red-100 ring-red-400/90",
          message: `🔴 High Volume of Late Submissions: Total of ${totalLateDocs}. Immediate corrective measures required.`,
        };

  // Insights for Average Days Late Trends
  const trendInsight =
    avgDaysLate > avgCumulative
      ? {
          color: "bg-orange-100 ring-orange-400/90",
          message: `🟠 Worsening Trends: Average delays (${avgDaysLate.toFixed(
            0
          )} days) are higher than cumulative averages (${avgCumulative.toFixed(
            0
          )} days). This indicates a negative trend.`,
        }
      : avgDaysLate < avgCumulative
      ? {
          color: "bg-teal-100 ring-teal-400/90",
          message: `🟢 Improving Trends: Average delays (${avgDaysLate.toFixed(
            0
          )} days) getting lower. Performance is improving.`,
        }
      : {
          color: "bg-gray-100 ring-gray-400/90",
          message: `⚪ Stable Trends: Average delays (${avgDaysLate.toFixed(
            0
          )} days) are consistent with cumulative averages (${avgCumulative.toFixed(
            0
          )} days). Maintain efforts.`,
        };

  return (
    <div className="w-3/12 font-thin text-slate-800 text-xs grid content-center">
      {/* Turnaround Time Insights */}
      <p className={`p-2 rounded-md mb-2 ${turnaroundInsight.color}`}>
        {turnaroundInsight.message}
      </p>

      {/* Volume Insights */}
      <p className={`p-2 rounded-md mb-2 ${volumeInsight.color}`}>
        {volumeInsight.message}
      </p>

      {/* Trend Insights */}
      <p className={`p-2 rounded-md ${trendInsight.color}`}>
        {trendInsight.message}
      </p>

      <br />
      <ul className="space-y-1">
        <li>
          ➡️ Total documents:{" "}
          {data.length !== 0 &&
            data.filter((x: MergedData) => x.submissionStatus !== "Canceled")
              .length}
          .
        </li>
        <li> ➡️ Average Days Late: {avgDaysLate.toFixed(0)} days</li>
        <li> ➡️ Minimum Days Late: {minDaysLate.toFixed(0)} days</li>
        <li> ➡️ Maximum Days Late: {maxDaysLate.toFixed(0)} days</li>
      </ul>
    </div>
  );
};

export default LateAnalysisConclusion;
