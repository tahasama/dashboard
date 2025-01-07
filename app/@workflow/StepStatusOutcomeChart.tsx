import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { dataProps } from "../types";

const StatusOutcomeHeatMap: React.FC<dataProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]); // [[day, count]]

  useEffect(() => {
    // Transform data for heatmap
    const submissionCounts: { [key: string]: number } = {};

    data
      .filter((row) => row["Step Status"] !== "Terminated")
      .forEach((row: any) => {
        const plannedSubmissionDate = row["Original Due Date"];

        if (plannedSubmissionDate) {
          let formattedDate: Date | null = null;

          if (typeof plannedSubmissionDate === "string") {
            // Split the date by slashes for string format (DD/MM/YYYY)
            const parts = plannedSubmissionDate
              .split("/")
              .map((part: string) => parseInt(part, 10));

            // Check if the split resulted in exactly 3 parts (day, month, year)
            if (parts.length === 3) {
              const [day, month, year] = parts;

              // Ensure that the parsed date makes sense (day and month within range)
              if (day > 0 && day <= 31 && month > 0 && month <= 12) {
                formattedDate = new Date(year, month - 1, day);
              } else {
                console.error(`Invalid day/month: ${day}/${month}`);
              }
            } else {
              console.error(`Invalid date format: ${plannedSubmissionDate}`);
            }
          } else if (typeof plannedSubmissionDate === "number") {
            // If it's a number (Excel date system), convert it to a valid date
            const baseDate = new Date(1899, 11, 30); // Excel base date is 1899-12-30
            formattedDate = new Date(
              baseDate.getTime() + plannedSubmissionDate * 86400000
            );
          }

          // Validate that the date is a valid Date object
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

    console.log("Final Submission Counts:", submissionCounts); // Debugging final counts

    const years = Array.from(
      new Set(
        Object.keys(submissionCounts).map((date) =>
          new Date(date).getFullYear()
        )
      )
    ).filter((year) => year > 1970);

    if (years.length > 0) {
      setSelectedYear(years[0]);
    }

    const formattedData = Object.keys(submissionCounts).map((isoDate) => {
      const date = new Date(isoDate);
      return [date.getTime(), submissionCounts[isoDate]];
    });

    setHeatmapData(formattedData);
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !selectedYear || heatmapData.length === 0) return;

    const startDate = new Date(`${selectedYear}-01-01`).getTime();
    const endDate = new Date(`${selectedYear}-12-31`).getTime();

    const filteredData = heatmapData.filter(
      ([timestamp]) => timestamp >= startDate && timestamp <= endDate
    );

    const daysOfYear = Array.from(
      { length: (endDate - startDate) / 86400000 + 1 },
      (_, i) => startDate + i * 86400000
    );

    const seriesData = daysOfYear.map((timestamp) => {
      const match = filteredData.find(([ts]) => ts === timestamp);
      return [
        timestamp,
        match ? match[1] : 0, // Use 0 if no data for this day
      ];
    });

    const chartInstance = echarts.init(chartRef.current);

    const option = {
      title: {
        text: "Document Workflows Heatmap",
        left: "center",
        top: "7%",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const date = new Date(params.data[0]);
          const count = params.data[1];
          return `${
            date.toISOString().split("T")[0]
          }: ${count} planned workflows`;
        },
      },
      visualMap: {
        show: false,
        min: 0,
        max: Math.max(...seriesData.map(([, count]) => count)),
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "5%",
        // backgroundColor: "red",
        inRange: {
          color: [
            "#fef3c7", // Soft yellow
            "#fde68a", // Light orange
            "#fca5a5", // Pink
            "#f87171", // Red
            "#34d399", // Bright green
            "#60a5fa", // Blue
            "#818cf8", // Purple
          ],
        },
        type: "piecewise", // Use piecewise for categorical color mapping
        pieces: [
          { min: 0, max: 0, color: "#dcdbdb" }, // Neutral for 0 workflows
          { min: 1, max: 4, color: "#99e699" }, // Light green
          { min: 5, max: 9, color: "#b2df8a" }, // Slightly darker green
          { min: 10, max: 19, color: "#66cc66" }, // Mid-green
          { min: 20, max: 49, color: "#34a853" }, // Darker green
          { min: 50, max: 99, color: "#2e7d32" }, // Deep green
          { min: 100, max: 199, color: "#004d40" }, // Teal-green
          { min: 200, color: "#00251a" }, // Very dark green
        ],
      },
      calendar: {
        range: selectedYear,
        // cellSize: ["auto", 20],
        cellSize: 14, // Make cells perfectly square (width = height)
        // backgroundColor: "red", // General calendar background
        top: "32.5%", // Adjust the space from the top
        // left: "center",
        // right: "5%", // Optional: Adjust right margin if needed
        // bottom: "0%", // Reduce space at the bottom
        itemStyle: {
          borderWidth: 1.2,
          borderColor: "white",
        },

        dayLabel: {
          nameMap: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Map to 3-letter day names
          fontSize: 9,
          color: "#0f172a",
        },

        monthLabel: {
          nameMap: "en",
          fontSize: 9,
          color: "#0f172a",
        },
        yearLabel: {
          show: false,
        },
        splitLine: {
          show: true, // Show the border lines between months
          lineStyle: {
            width: 1, // Adjust width for more prominent lines
            color: "#334155", // Customize the color of the month separators
          },
        },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: seriesData.map(([timestamp, count]) => [
            new Date(timestamp).toISOString().split("T")[0],
            count,
          ]),
          itemStyle: {
            borderRadius: 2,
            // borderWidth: 0.5,
            // borderColor: "#bbbbbb",
          },
        },
      ],
    };

    chartInstance.setOption(option);

    const handleResize = () => {
      chartInstance.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.dispose();
    };
  }, [heatmapData, selectedYear]);

  return (
    <div className="flex justify-around">
      <div className="w-full h-full">
        <div ref={chartRef} style={{ width: "100%", height: "180px" }} />
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="font-medium text-sm mb-2 w-24">Select Year:</span>
        <div className="flex flex-col space-y-2">
          {Array.from(
            new Set(
              heatmapData.map(([timestamp]) =>
                new Date(timestamp).getFullYear()
              )
            )
          ).map((year) => (
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

export default StatusOutcomeHeatMap;
