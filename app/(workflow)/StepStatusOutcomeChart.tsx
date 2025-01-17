"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Data, MergedData } from "../types";

const StatusOutcomeHeatMap: React.FC<Data> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [actualReviewData, setActualReviewData] = useState<number[][]>([]);
  const [plannedReviewData, setPlannedReviewData] = useState<number[][]>([]);
  const [years, setYears] = useState<number[]>([]);

  const parseDate = (date: string | number | undefined): string | null => {
    if (!date) return null;

    let formattedDate: Date | null = null;
    if (typeof date === "string") {
      const parts = date.split("/").map((part) => parseInt(part, 10));
      if (parts.length === 3) {
        const [day, month, year] = parts;
        formattedDate = new Date(Date.UTC(year, month - 1, day));
      }
    } else if (typeof date === "number") {
      const baseDate = new Date(1899, 11, 30);
      formattedDate = new Date(baseDate.getTime() + date * 86400000);
    }

    if (formattedDate && !isNaN(formattedDate.getTime())) {
      return formattedDate.toISOString().split("T")[0];
    }
    return null;
  };

  useEffect(() => {
    const actualReviewCounts: { [key: string]: number } = {};
    const plannedReviewCounts: { [key: string]: number } = {};

    data
      .filter((x) => x.dateIn !== "" && x.dateIn !== "")
      .forEach((row: MergedData) => {
        const plannedDate = parseDate(row.dateIn);
        const actualDate = parseDate(row.dateCompleted);

        if (plannedDate) {
          plannedReviewCounts[plannedDate] =
            (plannedReviewCounts[plannedDate] || 0) + 1;
        } else {
          plannedReviewCounts["empty"] =
            (plannedReviewCounts["empty"] || 0) + 1;
        }

        if (actualDate) {
          actualReviewCounts[actualDate] =
            (actualReviewCounts[actualDate] || 0) + 1;
        } else {
          actualReviewCounts["empty"] = (actualReviewCounts["empty"] || 0) + 1;
        }
      });

    const formatData = (counts: { [key: string]: number }) =>
      Object.keys(counts).map((isoDate) => {
        const date = isoDate === "empty" ? null : new Date(isoDate);
        const count = counts[isoDate] || 0;
        return [date ? date.getTime() : 0, count];
      });

    const formattedActualData = formatData(actualReviewCounts);
    const formattedPlannedData = formatData(plannedReviewCounts);

    setActualReviewData(formattedActualData);
    setPlannedReviewData(formattedPlannedData);

    const yearsList = Array.from(
      new Set(
        [
          ...Object.keys(actualReviewCounts),
          ...Object.keys(plannedReviewCounts),
        ]
          .map((date) =>
            date !== "empty" ? new Date(date).getFullYear() : null
          )
          .filter((year) => year !== null)
      )
    ).filter((year) => year > 1970);

    setYears(yearsList);
    if (yearsList.length > 0) {
      setSelectedYear(yearsList[0]);
    }
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !actualReviewData || !plannedReviewData) return;

    const chartInstance = echarts.init(chartRef.current);

    const option = {
      title: {
        text: "Document Review Heatmap",
        left: "center",
        top: "7%",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      },
      legend: { show: false },
      tooltip: {
        trigger: "item",
        borderColor: "#dcdbdb",

        formatter: (params: any) => {
          const date = new Date(params.data[0]);
          const count = params.data[1];
          return (
            `${params.seriesName} on ${
              date.toISOString().split("T")[0]
            }: ${count}` || 0
          );
        },
      },
      visualMap: [
        {
          seriesIndex: 0,
          type: "piecewise",
          calculable: true,
          show: false,
          pieces: [
            { min: 0, max: 0, color: "#99e699" },
            { min: 1, max: 5, color: "#66cc66" },
            { min: 6, max: 15, color: "#33b233" },
            { min: 16, max: 30, color: "#009900" },
            { min: 31, max: 60, color: "#006600" },
            { min: 61, max: 120, color: "#004d00" },
            { min: 121, max: 180, color: "#003300" },
            { min: 181, color: "#002200" },
          ],
        },
        {
          seriesIndex: 1,
          type: "piecewise",
          calculable: true,
          show: false,
          pieces: [
            { min: 0, max: 0, color: "#ff9999" }, // Very low (light-medium red)
            { min: 1, max: 5, color: "#ff6666" }, // Medium red
            { min: 6, max: 15, color: "#ff3333" }, // Medium-dark red
            { min: 16, max: 30, color: "#ff0000" }, // Dark red
            { min: 31, max: 60, color: "#cc0000" }, // Very dark red
            { min: 61, max: 120, color: "#990000" }, // Deep red
            { min: 121, max: 180, color: "#660000" }, // Deeper red
            { min: 181, color: "#330000" }, // Deepest red for high values
          ],
        },
      ],
      calendar: {
        range: selectedYear,
        cellSize: ["auto", "auto"],
        top: "32.5%",
        itemStyle: {
          borderWidth: 1.2,
          borderColor: "white",
          color: "#dcdbdb",
        },
        dayLabel: {
          nameMap: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
      },
      series: [
        {
          name: "Actual Review",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: actualReviewData.map(([timestamp, count]) => [
            new Date(timestamp).toISOString().split("T")[0],
            count || 0,
          ]),
        },
        {
          name: "Planned Review",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: plannedReviewData.map(([timestamp, count]) => [
            new Date(timestamp).toISOString().split("T")[0],
            count || 0,
          ]),
        },
      ],
    };

    chartInstance.setOption(option);
    const handleResize = () => chartInstance.resize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      chartInstance.dispose();
    };
  }, [actualReviewData, plannedReviewData, selectedYear]);

  if (actualReviewData.length === 0 && plannedReviewData.length === 0) {
    return (
      <span className="grid place-content-center h-full">
        <Alert variant="destructive" className="gap-0 mt-4 w-fit">
          <AlertCircle className="h-5 w-5 text-red-500 -mt-1.5" />
          <AlertDescription className="text-xs text-red-600 mt-1">
            Heat map is Empty, no document found.
          </AlertDescription>
        </Alert>
      </span>
    );
  }

  return (
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
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`py-1 px-3 text-xs rounded-md cursor-pointer ${
                year === selectedYear
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-black"
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
