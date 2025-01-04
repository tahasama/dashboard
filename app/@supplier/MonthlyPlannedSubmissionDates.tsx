import React, { useState } from "react";
import CalendarHeatmap, { TooltipDataAttrs } from "react-calendar-heatmap";
import * as ReactTooltip from "react-tooltip"; // Import react-tooltip as a namespace
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";
import { dataProps } from "../types";

type ExtendedTooltipDataAttrs = TooltipDataAttrs & {
  "data-tooltip-id"?: string;
  "data-tooltip-content"?: string;
};

const MonthlyPlannedSubmissionDates: React.FC<dataProps> = ({ data }) => {
  const transformDataForHeatmap = () => {
    const submissionCounts: { [key: string]: number } = {};

    data.forEach((row: any) => {
      const plannedSubmissionDate = row["Planned Submission Date"];
      if (plannedSubmissionDate) {
        let formattedDate: Date | null = null;

        if (typeof plannedSubmissionDate === "string") {
          // Handle string date in DD/MM/YYYY format
          const parts = plannedSubmissionDate
            .split("/")
            .map((part: any) => parseInt(part, 10));
          if (parts.length === 3) {
            const [day, month, year] = parts;
            formattedDate = new Date(year, month - 1, day);
          }
        } else if (typeof plannedSubmissionDate === "number") {
          // Handle numeric serial date (Excel-style)
          const baseDate = new Date(1899, 11, 30); // Excel's base date is Dec 30, 1899
          formattedDate = new Date(
            baseDate.getTime() + plannedSubmissionDate * 86400000
          ); // Add days in milliseconds
        }

        if (
          formattedDate &&
          !isNaN(formattedDate.getTime()) &&
          formattedDate.getFullYear() > 1970
        ) {
          const isoDate = formattedDate.toISOString().split("T")[0];
          submissionCounts[isoDate] = (submissionCounts[isoDate] || 0) + 1;
        } else {
          console.error(`Invalid or unwanted date: ${plannedSubmissionDate}`);
        }
      }
    });

    return Object.keys(submissionCounts).map((date) => ({
      date,
      count: submissionCounts[date],
    }));
  };

  const heatmapData = transformDataForHeatmap();

  const years = Array.from(
    new Set(heatmapData.map((d) => new Date(d.date).getFullYear()))
  )
    .filter((year) => year > 1970) // Exclude years <= 1970
    .sort();

  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  const filteredData = heatmapData.filter(
    (d) => new Date(d.date).getFullYear() === selectedYear
  );

  const startDate = new Date(`${selectedYear}-01-01`);
  const endDate = new Date(`${selectedYear}-12-31`);

  return (
    <div className="flex justify-around">
      <div className="w-full">
        <div className="max-w-[50rem] relative">
          {/* // <div className=""> */}

          {/* Heatmap */}
          <div>
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
              tooltipDataAttrs={(value: any): ExtendedTooltipDataAttrs => {
                if (!value || !value.date) {
                  return {};
                }

                return {
                  "data-tooltip-id": "my-tooltip",
                  "data-tooltip-content": value
                    ? `${value.date}: ${value.count} planned submissions`
                    : "No data",
                };
              }}
              showWeekdayLabels={true}
            />
          </div>
          <p className="text-md font-semibold absolute left-1/2 -translate-x-1/2 bottom-2">
            Document Submission Heatmap
          </p>

          {/* React Tooltip */}
          <ReactTooltip.Tooltip id="my-tooltip" />
        </div>
      </div>
      <div className="flex flex-col items-start">
        <span className="font-medium text-sm mb-2 w-24">Select Year:</span>
        <div className="flex flex-col space-y-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                selectedYear === year
                  ? "bg-blue-500 text-white"
                  : "text-blue-500 hover:bg-blue-100"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyPlannedSubmissionDates;
