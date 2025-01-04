import React from "react";

const LateAnalysisConclusion: React.FC<{
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
            "Recent trends indicate a rise in document submission delays, especially during peak periods. This suggests a backlog is forming.",
        }
      : avgDaysLate > 1.5 * avgCumulative
      ? {
          color: "bg-red-100 ring-red-400/90",
          message:
            "Document submission delays are concerning and require immediate attention to prevent further backlogs.",
        }
      : {
          color: "bg-teal-100 ring-teal-400/90",
          message:
            "The recent trend shows improvements in submission timelines, significantly reducing the risk of backlogs.",
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

export default LateAnalysisConclusion;
