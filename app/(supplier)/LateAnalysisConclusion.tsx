import React from "react";
import { Data, MergedData } from "../types";

const LateAnalysisConclusion: React.FC<{
  chartValuesRealReceivedDocs: number[]; // Cumulative real submissions count
  chartValuesdocs: number[]; // Cumulative planned submissions count
  data: MergedData[]; // Additional data for document insights
}> = ({
  chartValuesRealReceivedDocs = [],
  chartValuesdocs = [],
  data = [],
}) => {
  // Total Planned and Real submissions based on the last value in the cumulative arrays
  const totalPlanned = chartValuesdocs.length
    ? chartValuesdocs[chartValuesdocs.length - 1]
    : 0;
  const totalReal = chartValuesRealReceivedDocs.length
    ? chartValuesRealReceivedDocs[chartValuesRealReceivedDocs.length - 1]
    : 0;

  // Calculate the differences for each time point between real and planned
  const differences = chartValuesRealReceivedDocs.map(
    (real, index) => real - chartValuesdocs[index]
  );

  // Calculate stats for the differences
  const calculateStats = (arr: number[]) => {
    if (!arr.length) return { min: 0, max: 0, average: 0 };
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const average = arr.reduce((sum, value) => sum + value, 0) / arr.length;
    return { min, max, average };
  };

  const {
    min: minDifference,
    max: maxDifference,
    average: avgDifference,
  }: any = calculateStats(differences);

  // Impact Analysis
  const impactInsight =
    avgDifference === 0
      ? {
          color: "bg-blue-100 ring-blue-400/90",
          message:
            "🔵 Perfect Alignment: Real submissions matched the planned timeline.",
        }
      : avgDifference > 0
      ? {
          color: "bg-green-100 ring-green-400/90",
          message: `🟢 Ahead of Schedule: On average, real submissions exceeded the plan by ${avgDifference.toFixed(
            2
          )} documents per time point.`,
        }
      : {
          color: "bg-red-100 ring-red-400/90",
          message: `🔴 Behind Schedule: On average, real submissions lagged behind the plan by ${Math.abs(
            avgDifference.toFixed(2)
          )} documents per time point.`,
        };

  // Progression Summary
  const progressionInsight =
    totalReal >= totalPlanned
      ? {
          color: "bg-teal-100 ring-teal-400/90",
          message: `🟢 Excellent Progression: Real submissions (${totalReal}) met or exceeded the planned submissions (${totalPlanned}).`,
        }
      : {
          color: "bg-orange-100 ring-orange-400/90",
          message: `🟠 Needs Improvement: Real submissions (${totalReal}) did not meet the planned submissions (${totalPlanned}).`,
        };

  return (
    <div className="w-3/12 font-thin text-slate-800 text-xs grid content-center">
      {/* Impact Insights */}
      <p className={`p-2 rounded-md mb-2 ${impactInsight.color}`}>
        {impactInsight.message}
      </p>

      {/* Progression Insights */}
      <p className={`p-2 rounded-md mb-2 ${progressionInsight.color}`}>
        {progressionInsight.message}
      </p>

      <br />
      <ul className="space-y-1">
        <li>
          ➡️ Planned Total Submissions: <strong>{totalPlanned}</strong>
        </li>
        <li>
          ➡️ Real Total Submissions: <strong>{totalReal}</strong>
        </li>
        <li>
          ➡️ Average Daily Difference:{" "}
          <strong>{avgDifference.toFixed(2)}</strong> documents
        </li>
        <li>
          ➡️ Maximum Difference: <strong>{maxDifference}</strong> documents
        </li>
        <li>
          ➡️ Minimum Difference: <strong>{minDifference}</strong> documents
        </li>
      </ul>
    </div>
  );
};

export default LateAnalysisConclusion;
