"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Data, MergedData } from "../types";

const StatusOutcomeHeatMap: React.FC<Data> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]); // [[day, count]]

  useEffect(() => {
    // Transform data for heatmap
    const workflowCounts: { [key: string]: number } = {};

    data
      .filter((row: MergedData) => row.stepStatus !== "Terminated")
      .forEach((row: MergedData) => {
        const plannedworkflowDate = row.originalDueDate;

        if (plannedworkflowDate) {
          let formattedDate: Date | null = null;

          if (typeof plannedworkflowDate === "string") {
            // Split the date by slashes for string format (DD/MM/YYYY)
            const parts = plannedworkflowDate
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
              console.error(`Invalid date format: ${plannedworkflowDate}`);
            }
          } else if (typeof plannedworkflowDate === "number") {
            // If it's a number (Excel date system), convert it to a valid date
            const baseDate = new Date(1899, 11, 30); // Excel base date is 1899-12-30
            formattedDate = new Date(
              baseDate.getTime() + plannedworkflowDate * 86400000
            );
          }

          // Validate that the date is a valid Date object
          if (
            formattedDate &&
            !isNaN(formattedDate.getTime()) &&
            formattedDate.getFullYear() > 1970
          ) {
            const isoDate = formattedDate.toISOString().split("T")[0];
            workflowCounts[isoDate] = (workflowCounts[isoDate] || 0) + 1;
          } else {
            console.error(`Invalid or unwanted date: ${plannedworkflowDate}`);
          }
        }
      });

    const years = Array.from(
      new Set(
        Object.keys(workflowCounts).map((date) => new Date(date).getFullYear())
      )
    ).filter((year) => year > 1970);

    if (years.length > 0) {
      // Select the latest year by default
      setSelectedYear(Math.max(...years));
    }

    const formattedData = Object.keys(workflowCounts).map((isoDate) => {
      const date = new Date(isoDate);
      return [date.getTime(), workflowCounts[isoDate]];
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

    const chartInstance = echarts.init(chartRef.current, null, {
      renderer: "svg",
      devicePixelRatio: window.devicePixelRatio || 1,
    });
    const option = {
      responsive: true,
      title: {
        text: "Document Workflow Heatmap",
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
        // inRange: {
        //   color: [
        //     "#fef3c7", // Soft yellow
        //     "#fde68a", // Light orange
        //     "#fca5a5", // Pink
        //     "#f87171", // Red
        //     "#34d399", // Bright green
        //     "#60a5fa", // Blue
        //     "#818cf8", // Purple
        //   ],
        // },
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
        cellSize: ["auto", "auto"],
        // cellSize: "100%", // Make cells perfectly square (width = height)
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

    const observer = new ResizeObserver(handleResize);
    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      chartInstance.dispose();
    };
  }, [heatmapData, selectedYear]);

  if (heatmapData.length === 0) {
    return (
      <span className="grid place-content-center h-full">
        <Alert variant="destructive" className="gap-0 mt-4 w-fit">
          <AlertCircle className="h-5 w-5 text-red-500 -mt-1.5" />
          <AlertDescription className="text-xs text-red-600 mt-1">
            Heat map is Empty, no review found.
          </AlertDescription>
        </Alert>
      </span>
    );
  }

  return (
    // <div className="flex justify-around">
    <div className="flex justify-between w-full h-full">
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "350px",
          minHeight: "100px",
        }}
      />
      <div className="flex flex-col items-center justify-center ml-10">
        <span className="font-medium text-sm mb-2 w-24">Select Year:</span>
        <div className="flex flex-col space-y-2">
          {Array.from(
            new Set(
              heatmapData.map(([timestamp]) =>
                new Date(timestamp).getFullYear()
              )
            )
          )
            .reverse()
            .map((year) => (
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