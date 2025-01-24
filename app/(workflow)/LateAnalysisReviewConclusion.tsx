import React from "react";
import { Data, MergedData } from "../types";

const LateAnalysisReviewConclusion: React.FC<{
  chartValuesRealReceivedDocs: number[]; // Cumulative real received review documents count
  chartValuesdocs: number[]; // Cumulative planned review reviews count
  data: MergedData[]; // Additional data for review insights
}> = ({
  chartValuesRealReceivedDocs = [],
  chartValuesdocs = [],
  data = [],
}) => {
  const formatNumber = (num: number) => num.toLocaleString();

  // Total Planned and Real review reviews based on the last value in the cumulative arrays
  const totalPlannedReview = chartValuesdocs.length
    ? chartValuesdocs[chartValuesdocs.length - 1]
    : 0;
  const totalRealReview = chartValuesRealReceivedDocs.length
    ? chartValuesRealReceivedDocs[chartValuesRealReceivedDocs.length - 1]
    : 0;

  // Correct calculation for differences (real review reviews vs planned review reviews for each time point)
  const reviewDifferences = chartValuesRealReceivedDocs.map((real, index) =>
    chartValuesdocs[index] ? real - chartValuesdocs[index] : 0
  );

  // Calculate stats for the review differences
  const calculateStats = (
    arr: number[]
  ): { min: number; max: number; average: number } => {
    if (arr.length === 0) return { min: 0, max: 0, average: 0 };

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const average = arr.reduce((sum, value) => sum + value, 0) / arr.length;

    return { min, max, average };
  };

  const differences = chartValuesRealReceivedDocs.map((real, index) =>
    chartValuesdocs[index] ? real - chartValuesdocs[index] : 0
  );
  const { min, max, average } = calculateStats(differences);

  const {
    min: minReviewDifference,
    max: maxReviewDifference,
    average: avgReviewDifference,
  } = calculateStats(reviewDifferences);

  // Impact Insight for review process
  const reviewImpactInsight =
    avgReviewDifference === 0
      ? {
          color: "bg-blue-100 ring-blue-400/90",
          message:
            "🔵 Perfect Alignment: Real reviews matched the planned review timeline.",
        }
      : avgReviewDifference < -5 // Threshold of -5 days for being late
      ? {
          color: "bg-red-100 ring-red-400/90",
          message: `🔴 Behind Schedule: On average, real reviews lagged behind the plan by ${Math.abs(
            avgReviewDifference + 5
          ).toFixed(
            0
          )} reviews per time point (considering the 5-day threshold).`,
        }
      : {
          color: "bg-green-100 ring-green-400/90",
          message:
            "🟢 On Track: Reviews are within the 5-day threshold of the planned schedule.",
        };

  // Progression Summary for review process
  const reviewProgressionInsight =
    totalRealReview >= totalPlannedReview
      ? {
          color: "bg-teal-100 ring-teal-400/90",
          message: `🟢 Excellent Progression: Real reviews (${totalRealReview}) met or exceeded the planned reviews (${totalPlannedReview}).`,
        }
      : {
          color: "bg-orange-100 ring-orange-400/90",
          message: `🟠 Needs Improvement: Real reviews did not meet the planned reviews${
            totalPlannedReview - totalRealReview !== 0
              ? ` by ${Math.abs(
                  totalPlannedReview - totalRealReview
                )} document${
                  Math.abs(totalPlannedReview - totalRealReview) > 1 ? "s" : ""
                }`
              : ""
          }.`,
        };

  return (
    <div className="w-3/12 font-thin text-neutral-900 lg:text-slate-800 mb-2 pt-40 lg:mt-0 text-xs grid content-center scrollbar-thin  scrollbar-thumb-slate-600 scrollbar-track-slate-300 rounded-md scrollbar-corner-transparent overflow-y-scroll">
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
          ➡️ Planned Total Reviews:{" "}
          <strong>{formatNumber(totalPlannedReview)}</strong>
        </li>
        <li>
          ➡️ Real Total Reviews:{" "}
          <strong>{formatNumber(totalRealReview)}</strong>
        </li>
        <li>
          ➡️ Average Daily Difference:{" "}
          <strong>{Math.abs(avgReviewDifference).toFixed(0)}</strong> documents{" "}
          {max >= 0 ? "ahead" : "behind"}
        </li>
        <li>
          ➡️ Max Difference: <strong>{Math.abs(minReviewDifference)}</strong>{" "}
          reviews
        </li>
        <li>
          ➡️ Min Difference: <strong>{Math.abs(maxReviewDifference)}</strong>{" "}
          reviews
        </li>
      </ul>
    </div>
  );
};

export default LateAnalysisReviewConclusion;
