import React from "react";

const LateAnalysisReviewConclusion: React.FC<{
  chartValues: number[];
  cumulativeValues: number[];
}> = ({ chartValues = [], cumulativeValues = [] }) => {
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
  console.log("🚀 ~ cumulativeValues:", cumulativeValues);

  const insights =
    avgDaysLate > avgCumulative
      ? {
          color: "bg-orange-100 ring-orange-400/90",
          message:
            "Recent workflows show increasing delays in review completion, possibly due to high reviewer workloads or complex document requirements.",
        }
      : avgDaysLate > 1.5 * avgCumulative
      ? {
          color: "bg-red-100 ring-red-400/90",
          message:
            "Significant delays in review workflows suggest a critical need for intervention. Review bottlenecks may be impacting project timelines.",
        }
      : {
          color: "bg-teal-100 ring-teal-400/90",
          message:
            "Recent workflows demonstrate efficient review processes, indicating steady progress and manageable reviewer workloads.",
        };

  return (
    <div className="w-3/12 font-thin text-sm mb-4 mt-16 text-slate-800">
      <p className={`p-2  ring-1 rounded-md  ${insights.color}`}>
        {insights.message}
      </p>
      <br />
      <ul className="space-y-1">
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
