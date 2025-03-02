"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFilters } from "../FiltersProvider";
import { eachDayOfInterval, format } from "date-fns";

interface MergedData {
  plannedSubmissionDate: string | number | undefined;
  dateIn: string | number | undefined;
}

interface Data {
  data: MergedData[];
}

const HeatX: React.FC<Data> = memo(({ data }) => {
  const { filtered, isCheckedS } = useFilters();
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [actualSubmissionData, setActualSubmissionData] = useState<number[][]>(
    []
  );
  const [plannedSubmissionData, setPlannedSubmissionData] = useState<
    number[][]
  >([]);
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

  const getAllDates = (year: number) => {
    return eachDayOfInterval({
      start: new Date(year, 0, 1), // January 1st
      end: new Date(year, 11, 31), // December 31st
    }).map((date) => format(date, "yyyy-MM-dd")); // Format as "YYYY-MM-DD"
  };

  const allDates = getAllDates(selectedYear);

  useEffect(() => {
    const actualSubmissionCounts: { [key: string]: number } = {};
    const plannedSubmissionCounts: { [key: string]: number } = {};

    (!isCheckedS ? data : filtered)
      .filter((x) => x.dateIn !== "" || x.plannedSubmissionDate !== "")
      .forEach((row: MergedData) => {
        const plannedDate = parseDate(row.plannedSubmissionDate);
        const actualDate = parseDate(row.dateIn);

        if (plannedDate) {
          plannedSubmissionCounts[plannedDate] =
            (plannedSubmissionCounts[plannedDate] || 0) + 1;
        } else {
          plannedSubmissionCounts["empty"] =
            (plannedSubmissionCounts["empty"] || 0) + 1;
        }

        if (actualDate) {
          actualSubmissionCounts[actualDate] =
            (actualSubmissionCounts[actualDate] || 0) + 1;
        } else {
          actualSubmissionCounts["empty"] =
            (actualSubmissionCounts["empty"] || 0) + 1;
        }
      });

    const formatData = (counts: { [key: string]: number }) =>
      Object.keys(counts).map((isoDate) => {
        const date = isoDate === "empty" ? null : new Date(isoDate);
        const count = counts[isoDate] || 0;
        return [date ? date.getTime() : 0, count];
      });

    const formattedActualData = formatData(actualSubmissionCounts);
    const formattedPlannedData = formatData(plannedSubmissionCounts);

    setActualSubmissionData(formattedActualData);
    setPlannedSubmissionData(formattedPlannedData);

    const yearsList = Array.from(
      new Set(
        [
          ...Object.keys(actualSubmissionCounts),
          ...Object.keys(plannedSubmissionCounts),
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
  }, [filtered, isCheckedS]);

  const combinedData = actualSubmissionData.map(([timestamp, actualCount]) => {
    const plannedCount =
      plannedSubmissionData.find(
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
    if (!chartRef.current || !actualSubmissionData || !plannedSubmissionData)
      return;

    const chartInstance = echarts.init(chartRef.current, null, {
      renderer: "svg",
      devicePixelRatio: window.devicePixelRatio || 1,
    });

    const option = {
      title: {
        text: "Document Submission Distribution",
        left: "center",
        top: "7%",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      },
      legend: {
        show: true,
        orient: "vertical",
        left: "90.8%",
        top: "32%",
        align: "left",
        icon: "rect",
        textStyle: {
          fontSize: 11.5,
          color: "#333",
        },

        formatter: (name: string) => {
          console.log("🚀 ~ useEffect ~ name:", name);
          if (name === "Planned Submission") return "Planned";
          if (name === "Actual Submission") return "Actual";
          if (name === "Overlap Submission") return "Overlaps";
          if (name === "Empty Cells") return "";
          return name;
        },
      },
      tooltip: {
        trigger: "item",
        textStyle: { fontSize: 12 },
        formatter: (params: any) => {
          const date = new Date(params.data[0]).toISOString().split("T")[0];
          const actualCount =
            actualSubmissionData.find(
              (d) => new Date(d[0]).toISOString().split("T")[0] === date
            )?.[1] || 0;
          const plannedCount =
            plannedSubmissionData.find(
              (d) => new Date(d[0]).toISOString().split("T")[0] === date
            )?.[1] || 0;

          let tooltipContent = `Date: ${date}<br/>`;
          if (actualCount > 0)
            tooltipContent += `Actual Submissions: ${actualCount}<br/>`;
          if (plannedCount > 0)
            tooltipContent += `Planned Submissions: ${plannedCount}<br/>`;
          if (actualCount === 0 && plannedCount === 0)
            tooltipContent += `<span style="color: red;">No Submissions</span>`;

          return tooltipContent.trim();
        },
      },
      visualMap: [
        {
          seriesIndex: 0, // Empty Cells
          type: "piecewise",
          show: false,
          pieces: [{ min: -1, max: -1, color: "#D6DEE8" }], // Red for Empty Cells #cbd5e1
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
        {
          seriesIndex: 2,
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
          seriesIndex: 3, // Overlap series
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
          borderWidth: 1,
          borderColor: "white",
          borderRadius: 2.15, // Rounded Corners
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
        yearLabel: { show: false },
      },
      series: [
        {
          name: "Empty Cells",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: allDates.map((date) => [date, -1]), // Marks empty cells
          itemStyle: {
            color: "transparent",
            borderRadius: 2.15, // Ensures rounded corners
          },
        },
        {
          name: "Planned Submission",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: plannedSubmissionData.map(([timestamp, count]) => [
            new Date(timestamp).toISOString().split("T")[0],
            count ?? -1, // Ensures empty values are handled
          ]),
          itemStyle: {
            borderRadius: 2.15,
          },
        },
        {
          name: "Actual Submission",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: actualSubmissionData.map(([timestamp, count]) => [
            new Date(timestamp).toISOString().split("T")[0],
            count ?? -1, // Ensures empty values are handled
          ]),
          itemStyle: {
            borderRadius: 2.15,
          },
        },
        {
          name: "Overlap Submission", // Add this series for overlap
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
  }, [actualSubmissionData, plannedSubmissionData, selectedYear]);

  if (actualSubmissionData.length === 0 && plannedSubmissionData.length === 0) {
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
        className="lg:ml- scale-90 lg:scale-95"
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

export default HeatX;
