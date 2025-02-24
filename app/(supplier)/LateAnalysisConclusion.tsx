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

  const totalPlanned = chartValuesdocs.at(-1) || 0;
  const totalReal = chartValuesRealReceivedDocs.at(-1) || 0;

  // Calculate differences (real - planned submissions per time point)
  const differences = chartValuesRealReceivedDocs.map((real, index) =>
    chartValuesdocs[index] ? real - chartValuesdocs[index] : 0
  );

  // Extract delays (negative differences)
  const delays = differences.filter((diff) => diff < 0).map(Math.abs);
  const avgDelay = delays.length
    ? delays.reduce((sum, d) => sum + d, 0) / delays.length
    : 0;

  // Count how many documents are late
  const lateDocuments = delays.length;

  // Completion Rate Calculation (for display)
  const completionRate = totalPlanned ? (totalReal / totalPlanned) * 100 : 100; // Avoid division by zero

  // **Submission Impact Insight**
  let submissionImpactInsight;
  if (lateDocuments > 0 && totalPlanned > totalReal) {
    submissionImpactInsight = {
      color: "bg-red-100 ring-red-200/90",
      message: `🔴 Critical Delayed Submissions: Completion rate is ${completionRate.toFixed(
        1
      )}%, with an average delay of ${avgDelay.toFixed(0)} days per document.`,
    };
  } else if (differences.every((diff) => diff === 0)) {
    submissionImpactInsight = {
      color: "bg-blue-100 ring-blue-200/90",
      message:
        "🔵 Perfect Alignment: Real submissions matched the planned timeline.",
    };
  } else if (differences.reduce((sum, val) => sum + val, 0) < -5) {
    submissionImpactInsight = {
      color: "bg-red-100 ring-red-200/90",
      message: `🔴 Behind Schedule: On average, real submissions lagged by ${Math.abs(
        avgDelay
      ).toFixed(0)} submissions per time point.`,
    };
  } else {
    submissionImpactInsight = {
      color: "bg-green-100 ring-green-200/90",
      message: "🟢 On Track: Submissions are within the planned schedule.",
    };
  }

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

  // Progression Insight
  const progressionInsight =
    totalReal >= totalPlanned
      ? {
          color: "bg-teal-100 ring-teal-200/90",
          message: `🟢 Excellent Progression: Real submissions met or exceeded the planned submissions${
            totalPlanned - totalReal !== 0
              ? ` by ${Math.abs(totalPlanned - totalReal)} document${
                  Math.abs(totalPlanned - totalReal) > 1 ? "s" : ""
                }`
              : ""
          }`,
        }
      : {
          color: "bg-orange-100 ring-orange-200/90",
          message: `🟠 Needs Improvement: Real submissions did not meet the planned submissions by ${
            totalPlanned - totalReal
          } document.`,
        };

  return (
    <div className="w-3/12 font-thin text-black lg:text-slate-800 text-xs pt-24 lg:pt-0 grid content-center scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-300 rounded-md scrollbar-corner-transparent overflow-y-scroll">
      <p
        className={`p-2 rounded-md mb-2 ring- mx-0.5 ${submissionImpactInsight.color}`}
      >
        {submissionImpactInsight.message}
      </p>

      <p
        className={`p-2 rounded-md mb-2 ring- mx-0.5 ${progressionInsight.color}`}
      >
        {progressionInsight.message}
      </p>

      <br />
      <ul className="space-y-1 ml-0.5">
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
