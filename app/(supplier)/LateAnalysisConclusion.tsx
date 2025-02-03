import React from "react";
import { Data, MergedData } from "../types";

const LateAnalysisConclusion: React.FC<{
  chartValuesRealReceivedDocs: number[];
  chartValuesdocs: number[];
  data: MergedData[];
}> = ({
  chartValuesRealReceivedDocs = [],
  chartValuesdocs = [],
  data = [],
}) => {
  const formatNumber = (num: number) => num.toLocaleString();

  const totalPlanned = chartValuesdocs.length
    ? chartValuesdocs[chartValuesdocs.length - 1]
    : 0;
  const totalReal = chartValuesRealReceivedDocs.length
    ? chartValuesRealReceivedDocs[chartValuesRealReceivedDocs.length - 1]
    : 0;

  // Correct calculation for differences (real submissions vs planned submissions for each time point)
  const differences = chartValuesRealReceivedDocs.map((real, index) =>
    chartValuesdocs[index] ? real - chartValuesdocs[index] : 0
  );

  // Calculate stats for differences
  const calculateStats = (
    arr: number[]
  ): { min: number; max: number; average: number } => {
    if (arr.length === 0) return { min: 0, max: 0, average: 0 };

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const average = arr.reduce((sum, value) => sum + value, 0) / arr.length;

    return { min, max, average };
  };

  const { min, max, average } = calculateStats(differences);

  // Impact Insight
  const impactInsight =
    average > -20 && average < 0
      ? {
          color: "bg-blue-100 ring-blue-400/90",
          message:
            "🔵 Perfect Alignment: Real submissions matched the planned timeline.",
        }
      : average > 0
      ? {
          color: "bg-green-100 ring-green-400/90",
          message: `🟢 Ahead of Schedule: On average, real submissions exceeded the plan by ${average.toFixed(
            2
          )} documents per time point.`,
        }
      : {
          color: "bg-red-100 ring-red-400/90",
          message: `🔴 Behind Schedule: On average, real submissions lagged behind the plan by ${Math.abs(
            average
          ).toFixed(0)} documents per time point.`,
        };

  // Progression Insight
  const progressionInsight =
    totalReal >= totalPlanned
      ? {
          color: "bg-teal-100 ring-teal-400/90",
          message: `🟢 Excellent Progression: Real submissions met or exceeded the planned submissions${
            totalPlanned - totalReal !== 0
              ? ` by ${Math.abs(totalPlanned - totalReal)} document${
                  Math.abs(totalPlanned - totalReal) > 1 ? "s" : ""
                }`
              : ""
          }`,
        }
      : {
          color: "bg-orange-100 ring-orange-400/90",
          message: `🟠 Needs Improvement: Real submissions did not meet the planned submissions by ${
            totalPlanned - totalReal
          } document.`,
        };

  return (
    <div className="w-3/12 font-thin text-black lg:text-slate-800 mb-2 pt-40 lg:pt-0 lg:mt-0 text-xs grid content-center scrollbar-thin  scrollbar-thumb-slate-600 scrollbar-track-slate-300 rounded-md scrollbar-corner-transparent overflow-y-scroll">
      {/* <div className="w-3/12 font-thin text-black lg:text-slate-800 mb-2 lg:pt-0 lg:mt-0 text-xs grid content-center mr-1"> */}

      <p className={`p-2 rounded-md mb-2 ${impactInsight.color}`}>
        {impactInsight.message}
      </p>

      <p className={`p-2 rounded-md mb-2 ${progressionInsight.color}`}>
        {progressionInsight.message}
      </p>

      <br />
      <ul className="space-y-1">
        <li>
          ➡️ Planned Total Submissions:{" "}
          <strong>{formatNumber(totalPlanned)}</strong>
        </li>
        <li>
          ➡️ Real Total Submissions: <strong>{formatNumber(totalReal)}</strong>
        </li>
        <li>
          ➡️ Average Daily Diff: <strong>{Math.abs(average).toFixed(0)}</strong>{" "}
          docs {average >= 0 ? "ahead" : "behind"}
        </li>
        <li>
          ➡️ Max Diff: <strong>{Math.abs(min)}</strong> docs{" "}
          {min >= 0 ? "ahead" : "behind"}
        </li>
        <li>
          ➡️ Min Diff: <strong>{Math.abs(max)}</strong> docs{" "}
          {max >= 0 ? "ahead" : "behind"}
        </li>
      </ul>
    </div>
  );
};

export default LateAnalysisConclusion;
