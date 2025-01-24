"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Data, MergedData } from "../types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StatusOutcomeHeatMap: React.FC<Data> = memo(({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<any>(null);
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
      .filter((x) => x.dateIn !== "" || x.dateIn !== "")
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
            { min: 0, max: 0, color: "#b3e0ff" }, // Very low (light pastel blue)
            { min: 1, max: 5, color: "#66c2ff" }, // Low (soft blue)
            { min: 6, max: 15, color: "#3385ff" }, // Medium-low (slightly darker blue)
            { min: 16, max: 30, color: "#0073e6" }, // Medium (standard blue)
            { min: 31, max: 60, color: "#0047b3" }, // Medium-high (dark blue)
            { min: 61, max: 120, color: "#003366" }, // High (deep blue)
            { min: 121, max: 180, color: "#001a33" }, // Very high (almost black blue)
            { min: 181, color: "#000000" }, // Deepest (black blue)
          ],
        },
        {
          seriesIndex: 1,
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
    <div className="flex justify-between w-full  h-full relative -ml-6">
      <div
        ref={chartRef}
        style={{
          width: "95.5%",
          height: "100%",
          maxHeight: "350px",
          minHeight: "100px",
        }}
        className=" bg-cyan-00 -ml-4"
      />
      <div className="flex flex-col items-center justify-center ml-10 absolute -right-6 m-1 ">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="scale-75 lg:scale-100">
            <SelectValue placeholder="Years" className="" />
          </SelectTrigger>
          <SelectContent className="">
            <SelectGroup>
              {/* <SelectLabel>Years</SelectLabel> */}

              {years.map((value: any) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
export default StatusOutcomeHeatMap;
