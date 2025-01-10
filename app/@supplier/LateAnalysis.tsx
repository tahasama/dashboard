import React, { useState, useEffect, useRef } from "react";
import LateAnalysisConclusion from "./LateAnalysisConclusion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import * as echarts from "echarts";

// Define the data structure for the input `data` prop
interface DataRow {
  "Planned Submission Date": string | number;
  "Submission Status": string;
  "Days Late": string | number;
}

// Define the props type
interface LateAnalysisProps {
  data: DataRow[];
}

interface LateAnalysisProps {
  data: {
    "Planned Submission Date": string | number;
    "Submission Status": string;
    "Days Late": string | number;
  }[];
}

const LateAnalysis: React.FC<LateAnalysisProps> = ({ data }) => {
  const [view, setView] = useState<boolean>(true);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [monthlyStats, setMonthlyStats] = useState<{
    chartValues: number[];
    cumulativeValues: number[];
  }>({ chartValues: [], cumulativeValues: [] });
  const [totalLateDocuments, setTotalLateDocuments] = useState<number>(0); // Track total late documents

  const chartRef = useRef<HTMLDivElement | null>(null); // Reference for the chart container

  const excelDateToJSDate = (serial: number): string => {
    const utcDays = Math.floor(serial - 25569);
    const date = new Date(utcDays * 86400000);
    return date.toLocaleDateString("en-GB");
  };

  const processData = (groupBy: "daily" | "monthly") => {
    const groupedData: Record<string, { daysLate: number; docs: number }> = {};
    let totalLateDocs = 0;

    data.forEach((row) => {
      let dateKey: string | null = null;
      const rawDate = row["Planned Submission Date"];
      const daysLate = parseFloat(String(row["Days Late"]));

      if (typeof rawDate === "number") {
        dateKey = excelDateToJSDate(rawDate);
      } else if (typeof rawDate === "string") {
        dateKey = rawDate;
      }

      if (dateKey && !isNaN(daysLate)) {
        if (groupBy === "monthly") {
          const [day, month, year] = dateKey.split("/");
          dateKey = `${month}/${year}`;
        }

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { daysLate: 0, docs: 0 };
        }
        groupedData[dateKey].daysLate += daysLate;
        groupedData[dateKey].docs += 1;

        if (daysLate > 0) totalLateDocs += 1; // Count late documents
      }
    });

    setTotalLateDocuments(totalLateDocs); // Update total late documents
    return groupedData;
  };

  const calculateChartValues = (
    groupedData: Record<string, { daysLate: number; docs: number }>
  ) => {
    const chartLabels = Object.keys(groupedData).sort((a, b) => {
      const parseDate = (date: string) => {
        const parts = date.split("/").map(Number);
        return parts.length === 3
          ? new Date(parts[2] + 2000, parts[1] - 1, parts[0])
          : new Date(parts[1], parts[0] - 1); // Monthly format (MM/YYYY)
      };

      return parseDate(a).getTime() - parseDate(b).getTime();
    });

    const chartValues = chartLabels.map((label) => {
      const { daysLate, docs } = groupedData[label];
      return daysLate / docs;
    });

    const cumulativeValues = chartLabels.map((_, index) => {
      const cumulativeDaysLate = chartLabels
        .slice(0, index + 1)
        .reduce((sum, label) => sum + groupedData[label].daysLate, 0);
      const cumulativeDocs = chartLabels
        .slice(0, index + 1)
        .reduce((sum, label) => sum + groupedData[label].docs, 0);
      return cumulativeDaysLate / cumulativeDocs;
    });

    return { chartLabels, chartValues, cumulativeValues };
  };

  useEffect(() => {
    const dailyGroupedData = processData("daily");
    const monthlyGroupedData = processData("monthly");

    const groupedData = view ? dailyGroupedData : monthlyGroupedData;
    const { chartLabels, chartValues, cumulativeValues } =
      calculateChartValues(groupedData);

    const formattedLabels = chartLabels.map((label) => {
      const parts = label.split("/");

      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${day}/${month}/${year.slice(-2)}`;
      }

      return label;
    });

    setChartData({
      labels: formattedLabels,
      datasets: [
        {
          name: "Cumulative Average Days Late (Line)",
          type: "line",
          data: cumulativeValues,
          smooth: true,
          lineStyle: { width: 4, color: "rgba(76, 76, 173, 0.5)" }, // A deep purple to contrast with the bar
          areaStyle: { color: "rgba(76, 76, 173, 0.3)" }, // Soft purple area fill to match the line
        },
        {
          name: "Average Days Late (Bar)",
          type: "bar",
          data: chartValues,
          itemStyle: { color: "#22a7f0" },
        },
      ],
    });

    const monthlyStats = calculateChartValues(monthlyGroupedData);
    setMonthlyStats({
      chartValues: monthlyStats.chartValues,
      cumulativeValues: monthlyStats.cumulativeValues,
    });
  }, [view, data]);

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = echarts.init(chartRef.current, null, {
        renderer: "svg",
        devicePixelRatio: window.devicePixelRatio || 1,
      });

      const chartOptions = {
        title: {
          left: "center", // Can also be 'left', 'right', or percentage like '10%'
          top: "10%", // Position from the top, can use percentage or 'px'
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross", // Use a cross-pointer to indicate where both line and bar points intersect
          },
          formatter: function (params: any) {
            let tooltipContent = "";
            params.forEach((item: any) => {
              // Conditionally format tooltips based on chart type
              if (item.seriesType === "line") {
                tooltipContent += `${item.seriesName}: ${item.data.toFixed(
                  0
                )}<br>`;
              } else if (item.seriesType === "bar") {
                tooltipContent += `${item.seriesName}: ${item.data.toFixed(0)}`;
              }
            });
            return tooltipContent;
          },
        },
        legend: {
          data: [
            "Cumulative Average Days Late (Line)",
            "Average Days Late (Bar)",
          ],
          top: 20,
        },
        xAxis: {
          type: "category",
          data: chartData.labels,
          axisLabel: {
            rotate: 45,
            fontSize: 10,
          },
        },
        yAxis: {
          type: "value",
          // name: "Days Late",
          axisLabel: {
            formatter: (value: number) => value.toFixed(0),
            fontSize: 10,
          },
          min: 0,
        },
        series: chartData.datasets,
      };

      chartInstance.setOption(chartOptions);

      const handleResize = () => {
        chartInstance.resize();
      };

      const observer = new ResizeObserver(handleResize);
      observer.observe(chartRef.current);

      return () => {
        // observer.disconnect();
        chartInstance.dispose();
      };
    }
  }, [chartData]);

  if (data.length === 0) {
    return (
      <span className="grid place-content-center h-full">
        <Alert variant="destructive" className="gap-0 mt-4 w-fit">
          <AlertCircle className="h-5 w-5 text-red-500 -mt-1.5" />
          <AlertDescription className="text-sm text-red-600 mt-1">
            No results were found. Please adjust your filters and try again.
          </AlertDescription>
        </Alert>
      </span>
    );
  }

  return (
    <div className="flex justify-center mt-1 gap-0">
      <div className="w-[67%] h-auto aspect-[16/9]">
        <div className="flex justify-between pr-2">
          <h2>Late Submission Analysis By {view ? "Day" : "Month"}</h2>
          <button
            onClick={() => setView(!view)}
            className="bg-orange-200 p-1 rounded ring-orange-500 ring-1 min-w-32 text-sm"
          >
            Switch to {!view ? "Day" : "Month"}
          </button>
        </div>
        <div
          ref={chartRef}
          style={{ width: "100%", height: "100%" }}
          className="-mt-3"
        />
      </div>
      <LateAnalysisConclusion data={data} {...monthlyStats} />
    </div>
  );
};

export default LateAnalysis;
