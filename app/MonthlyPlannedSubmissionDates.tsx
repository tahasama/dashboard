import React, { useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import * as ReactTooltip from "react-tooltip"; // Import react-tooltip as a namespace
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

interface MonthlyPlannedSubmissionDatesProps {
  data: any[];
}

const MonthlyPlannedSubmissionDates: React.FC<
  MonthlyPlannedSubmissionDatesProps
> = ({ data }) => {
  const transformDataForHeatmap = () => {
    const submissionCounts: { [key: string]: number } = {};

    data.forEach((fileData) => {
      fileData.forEach((row: any) => {
        const plannedSubmissionDate = row["Planned Submission Date"]; // Replace with your dataset's key

        if (plannedSubmissionDate) {
          const [day, month, year] = plannedSubmissionDate
            .split("/")
            .map((part: any) => parseInt(part, 10));
          const formattedDate = new Date(year, month - 1, day);

          if (isNaN(formattedDate.getTime())) {
            console.error(`Invalid date: ${plannedSubmissionDate}`);
            return; // Skip invalid dates
          }

          const isoDate = formattedDate.toISOString().split("T")[0];
          submissionCounts[isoDate] = (submissionCounts[isoDate] || 0) + 1;
        }
      });
    });

    return Object.keys(submissionCounts).map((date) => ({
      date,
      count: submissionCounts[date],
    }));
  };

  const heatmapData = transformDataForHeatmap();

  const years = Array.from(
    new Set(heatmapData.map((d) => new Date(d.date).getFullYear()))
  ).sort();

  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  const filteredData = heatmapData.filter(
    (d) => new Date(d.date).getFullYear() === selectedYear
  );

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
            <option key={year} value={year} className=" ">
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
          values={filteredData}
          classForValue={(value: any) => {
            if (!value || value.count === 0) {
              return "color-empty";
            }
            if (value.count < 5) return "color-scale-1";
            if (value.count < 10) return "color-scale-2";
            if (value.count < 20) return "color-scale-3";
            return "color-scale-4";
          }}
          tooltipDataAttrs={(value: any) => ({
            "data-tooltip-id": "my-tooltip", // Assign tooltip id based on the date
            "data-tooltip-content": value
              ? `${value.date}: ${value.count} planned submissions`
              : "No data",
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

export default MonthlyPlannedSubmissionDates;
