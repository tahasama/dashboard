"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
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
import { useFilters } from "../FiltersProvider";

const StatusOutcomeHeatMap: React.FC<Data> = memo(({ data }) => {
  const { filtered, isCheckedR } = useFilters();

  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [actualReviewData, setActualReviewData] = useState<number[][]>([]);
  const [plannedReviewData, setPlannedReviewData] = useState<number[][]>([]);
  const [years, setYears] = useState<number[]>([]);

  const uniqueFiltered = useMemo(() => {
    const map = new Map();

    filtered.forEach((doc) => {
      if (
        !map.has(doc.documentNo) ||
        map.get(doc.documentNo).revision < doc.revision // Keep the latest revision
      ) {
        map.set(doc.documentNo, doc);
      }
    });

    return Array.from(map.values()); // Return only the latest unique documents
  }, [filtered]);

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

    (!isCheckedR ? uniqueFiltered : filtered)

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
  }, [data, isCheckedR]);

  const combinedData = actualReviewData.map(([timestamp, actualCount]) => {
    const plannedCount =
      plannedReviewData.find(
        ([plannedTimestamp]) => plannedTimestamp === timestamp
      )?.[1] || 0;

    const combinedValue = (actualCount + plannedCount) / 2; // This is the combined value

    return {
      date: new Date(timestamp).toISOString().split("T")[0],
      actualCount,
      plannedCount,
      combinedValue, // Ensure this is being used for coloring
      isOverlap: actualCount > 0 && plannedCount > 0,
    };
  });

  useEffect(() => {
    if (!chartRef.current || !actualReviewData || !plannedReviewData) return;

    const chartInstance = echarts.init(chartRef.current, null, {
      renderer: "svg",
      devicePixelRatio: window.devicePixelRatio || 1,
    });

    const option = {
      // backgroundColor: "black",
      // width: "100%",
      title: {
        text: "Document Review Heatmap",
        left: "center",
        top: "7%",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      },
      legend: {
        show: true,
        orient: "vertical",
        left: "90.8%",
        top: "42%",
        align: "left",
        icon: "rect",
        data: ["Planned Review", "Actual Review", "Overlap Review"],
        textStyle: {
          fontSize: 11.5,
          color: "#333",
          // fontWeight: "bold" , // Optional: Adjust font weight
        },
        formatter: (name: string) => {
          if (name === "Planned Review") return "Planned";
          if (name === "Actual Review") return "Actual";
          if (name === "Overlap Review") return "Overlaps";
          return name;
        },
      },
      tooltip: {
        trigger: "item",
        textStyle: {
          fontSize: 12,
        },
        formatter: (params: any) => {
          const date = new Date(params.data[0]).toISOString().split("T")[0];
          const actualCount =
            actualReviewData.find(
              (d) => new Date(d[0]).toISOString().split("T")[0] === date
            )?.[1] || 0;
          const plannedCount =
            plannedReviewData.find(
              (d) => new Date(d[0]).toISOString().split("T")[0] === date
            )?.[1] || 0;

          let tooltipContent = `Date: ${date}<br/>`;

          if (actualCount > 0) {
            tooltipContent += `Actual Reviews: ${actualCount}<br/>`;
          }
          if (plannedCount > 0) {
            tooltipContent += `Planned Reviews: ${plannedCount}<br/>`;
          }

          return tooltipContent.trim(); // Ensures no empty tooltip is shown
        },
      },
      visualMap: [
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
        {
          seriesIndex: 0,
          type: "piecewise",
          calculable: true,
          show: false,
          pieces: [
            { min: 0, max: 0, color: "#b3e0ff" },
            { min: 1, max: 5, color: "#66c2ff" },
            { min: 6, max: 15, color: "#3385ff" },
            { min: 16, max: 30, color: "#0073e6" },
            { min: 31, max: 60, color: "#0047b3" },
            { min: 61, max: 120, color: "#003366" },
            { min: 121, max: 180, color: "#001a33" },
            { min: 181, color: "#000000" },
          ],
        },
        {
          seriesIndex: 2, // Overlap series
          type: "piecewise",
          calculable: true,
          show: false,
          pieces: [
            { min: 0, max: 0, color: "#FAE1A3" }, // Lightest Shade
            { min: 1, max: 5, color: "#FAC858" }, // Light Shade
            { min: 6, max: 15, color: "#F79C00" }, // Medium Shade
            { min: 16, max: 30, color: "#D87B00" }, // Dark Shade
            { min: 31, max: 60, color: "#B96A00" }, // Darker Shade
            { min: 61, max: 120, color: "#9E5700" }, // Very Dark
            { min: 121, max: 180, color: "#7F4700" }, // Almost Black
            { min: 181, color: "#663F00" }, // Deepest Dark
          ],
        },
      ],

      calendar: {
        range: selectedYear,
        cellSize: ["auto", "auto"],
        left: "5%",
        right: "10%",
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
          name: "Planned Review",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: plannedReviewData.map(([timestamp, count]) => [
            new Date(timestamp).toISOString().split("T")[0],
            count || 0,
          ]),
        },
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
          name: "Overlap Review", // Add this series for overlap
          type: "heatmap",
          coordinateSystem: "calendar",
          data: combinedData
            .filter(({ isOverlap }) => isOverlap)
            .map(({ date, combinedValue }) => [
              date,
              combinedValue, // Use combinedValue for coloring
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
    <div className="flex justify-between w-full  h-full relative -ml-6 -mt-0.5">
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "350px",
          minHeight: "100px",
        }}
        className="lg:ml-5 scale-90 lg:scale-100"
      />
      <div className="flex flex-col items-center justify-center absolute -right-3 m-1 ">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="scale-75 lg:scale-90">
            <SelectValue placeholder="Years" />
          </SelectTrigger>
          <SelectContent className="scale-75 lg:scale-90">
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
        {/* <div className="flex flex-col items-center justify-center my-5">
          <span className="text-xs">Planned</span>
          <span className="w-10 lg:w-16 h-3 bg-gradient-to-r from-[#b3e0ff] to-[#0047b3] block"></span>
          <span className="text-xs">Actual</span>
          <span className="w-10 lg:w-16 h-3 bg-gradient-to-r from-[#99e699] to-[#006600] block"></span>
        </div> */}
      </div>
    </div>
  );
});
export default StatusOutcomeHeatMap;
