import React, { useState, useEffect } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import * as ReactTooltip from "react-tooltip";
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

interface StatusOutcomeHeatMapProps {
  data: any[];
}

const StatusOutcomeHeatMap: React.FC<StatusOutcomeHeatMapProps> = ({
  data,
}) => {
  const transformDataForHeatmap = () => {
    const submissionCounts: { [key: string]: number } = {};

    data.forEach((row: any) => {
      let plannedSubmissionDate = row["Original Due Date"]; // Date column

      // If the date is a number (Excel date serial), convert it to a Date object
      if (plannedSubmissionDate && typeof plannedSubmissionDate === "number") {
        const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
        plannedSubmissionDate = new Date(
          excelEpoch.getTime() + (plannedSubmissionDate - 2) * 86400000
        ); // Correct the offset
      }

      // If the date is a string (in "DD/MM/YYYY" format), process it
      if (plannedSubmissionDate && typeof plannedSubmissionDate === "string") {
        const [day, month, year] = plannedSubmissionDate
          .split("/")
          .map((part: any) => parseInt(part, 10));
        plannedSubmissionDate = new Date(year, month - 1, day);
      }

      // If the date is still invalid, skip this row
      if (
        !(plannedSubmissionDate instanceof Date) ||
        isNaN(plannedSubmissionDate.getTime())
      ) {
        console.error(`Invalid date format: ${plannedSubmissionDate}`);
        return; // Skip invalid dates
      }

      const isoDate = plannedSubmissionDate.toISOString().split("T")[0];

      // Increment the count for this date
      submissionCounts[isoDate] = (submissionCounts[isoDate] || 0) + 1;
    });

    // Return the transformed data with date and count
    return Object.keys(submissionCounts).map((date) => ({
      date,
      count: submissionCounts[date],
    }));
  };

  const heatmapData = transformDataForHeatmap();

  // Filter out any entries with invalid or zero count
  const filteredData = heatmapData.filter((d) => {
    const date = new Date(d.date);
    return !isNaN(date.getTime()) && d.count > 0;
  });

  const years = Array.from(
    new Set(filteredData.map((d) => new Date(d.date).getFullYear()))
  ).sort();

  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  const startDate = new Date(`${selectedYear}-01-01`);
  const endDate = new Date(`${selectedYear}-12-31`);

  return (
    <div>
      <h2 className="text-lg font-bold">Monthly Planned Submission Dates</h2>
      {/* Year Selector */}
      <div className="mb-4">
        <label htmlFor="year-select" className="mr-2 font-medium">
          Select Year:
        </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="p-2 border rounded text-slate-800"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      {/* Heatmap */}
      <div className="max-w-5xl">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={filteredData} // Ensure this is an array of objects with 'date' and 'count'
          classForValue={(value: any) => {
            if (!value || value.count === 0) {
              return "color-empty"; // Handle empty values
            }
            if (value.count < 5) return "color-scale-1";
            if (value.count < 10) return "color-scale-2";
            if (value.count < 20) return "color-scale-3";
            return "color-scale-4";
          }}
          tooltipDataAttrs={(value: any) => ({
            "data-tooltip-id": "my-tooltip", // Assign tooltip id based on the date
            "data-tooltip-content":
              value && value.count > 0
                ? `${new Date(value.date).toLocaleDateString()}: ${
                    value.count
                  } planned submission(s)`
                : "",
          })}
          showWeekdayLabels={true}
        />
      </div>
      {/* React Tooltip */}
      <ReactTooltip.Tooltip id="my-tooltip" />{" "}
      {/* Correct usage of ReactTooltip */}
    </div>
  );
};

export default StatusOutcomeHeatMap;
