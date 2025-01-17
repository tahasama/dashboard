import React from "react";
import { Data, MergedData } from "../types";

const LateAnalysisReviewConclusion: React.FC<{
  chartValuesRealReceivedDocs: number[]; // Cumulative real received review documents count
  chartValuesdocs: number[]; // Cumulative planned review submissions count
  data: MergedData[]; // Additional data for review insights
}> = ({
  chartValuesRealReceivedDocs = [],
  chartValuesdocs = [],
  data = [],
}) => {
  // Total Planned and Real review submissions based on the last value in the cumulative arrays
  const totalPlannedReview = chartValuesdocs.length
    ? chartValuesdocs[chartValuesdocs.length - 1]
    : 0;
  const totalRealReview = chartValuesRealReceivedDocs.length
    ? chartValuesRealReceivedDocs[chartValuesRealReceivedDocs.length - 1]
    : 0;

  // Calculate the differences for each time point between real and planned review submissions
  const reviewDifferences = chartValuesRealReceivedDocs.map(
    (real, index) => real - chartValuesdocs[index]
  );

  // Calculate stats for the review differences
  const calculateStats = (arr: number[]) => {
    if (!arr.length) return { min: 0, max: 0, average: 0 };
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const average: any =
      arr.reduce((sum, value) => sum + value, 0) / arr.length;
    return { min, max, average };
  };

  const {
    min: minReviewDifference,
    max: maxReviewDifference,
    average: avgReviewDifference,
  } = calculateStats(reviewDifferences);

  // Impact Analysis for review process
  const reviewImpactInsight =
    avgReviewDifference === 0
      ? {
          color: "bg-blue-100 ring-blue-400/90",
          message:
            "🔵 Perfect Alignment: Real review submissions matched the planned review timeline.",
        }
      : avgReviewDifference > 0
      ? {
          color: "bg-green-100 ring-green-400/90",
          message: `🟢 Ahead of Schedule: On average, real review submissions exceeded the plan by ${avgReviewDifference.toFixed(
            2
          )} documents per time point.`,
        }
      : {
          color: "bg-red-100 ring-red-400/90",
          message: `🔴 Behind Schedule: On average, real review submissions lagged behind the plan by ${Math.abs(
            avgReviewDifference.toFixed(2)
          )} documents per time point.`,
        };

  // Progression Summary for review process
  const reviewProgressionInsight =
    totalRealReview >= totalPlannedReview
      ? {
          color: "bg-teal-100 ring-teal-400/90",
          message: `🟢 Excellent Progression: Real review submissions (${totalRealReview}) met or exceeded the planned submissions (${totalPlannedReview}).`,
        }
      : {
          color: "bg-orange-100 ring-orange-400/90",
          message: `🟠 Needs Improvement: Real review submissions (${totalRealReview}) did not meet the planned submissions (${totalPlannedReview}).`,
        };

  return (
    <div className="w-3/12 font-thin text-slate-800 text-xs grid content-center">
      {/* Impact Insights for Review */}
      <p className={`p-2 rounded-md mb-2 ${reviewImpactInsight.color}`}>
        {reviewImpactInsight.message}
      </p>

      {/* Progression Insights for Review */}
      <p className={`p-2 rounded-md mb-2 ${reviewProgressionInsight.color}`}>
        {reviewProgressionInsight.message}
      </p>

      <br />
      <ul className="space-y-1">
        <li>
          ➡️ Planned Total Review Submissions:{" "}
          <strong>{totalPlannedReview}</strong>
        </li>
        <li>
          ➡️ Real Total Review Submissions: <strong>{totalRealReview}</strong>
        </li>
        <li>
          ➡️ Average Daily Difference:{" "}
          <strong>{avgReviewDifference.toFixed(2)}</strong> documents
        </li>
        <li>
          ➡️ Maximum Difference: <strong>{maxReviewDifference}</strong>{" "}
          documents
        </li>
        <li>
          ➡️ Minimum Difference: <strong>{minReviewDifference}</strong>{" "}
          documents
        </li>
      </ul>
    </div>
  );
};

export default LateAnalysisReviewConclusion;
