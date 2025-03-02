"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { nightColors } from "../colors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Data, MergedData } from "../types";
import { useFilters } from "../FiltersProvider";

const ReviewStatus: React.FC<Data> = memo(() => {
  const { filtered } = useFilters();
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsPhone(window.innerWidth < 1024);
    };

    // Run on mount & listen for resizes
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!filtered || filtered.length === 0) return;

    const latestRevisions: { [key: string]: any } = {};

    filtered.forEach((row: any) => {
      const docNo = row.documentNo;

      // If revision > 0, track the latest revision per documentNo
      if (row.revision > 0 || row.revision === "A") {
        if (
          !latestRevisions[docNo] ||
          row.revision > latestRevisions[docNo].revision
        ) {
          latestRevisions[docNo] = row;
        }
      }

      // If revision = 0, keep it as is (only if not already overwritten by a newer revision)
      else if (!latestRevisions[docNo]) {
        latestRevisions[docNo] = row;
      }
    });

    // Count occurrences based on stepOutcome (if revision > 0) or reviewStatus (if revision = 0)
    const statusCounts: { [key: string]: number } = {};

    Object.values(latestRevisions).forEach((row: any) => {
      const status =
        (row.revision > 0 || row.revision !== "0" || row.revision === "A") &&
        row.stepOutcome !== ""
          ? row.stepOutcome
          : row.reviewStatus; // Choose status based on revision
      if (status) {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });

    // Format data for the chart
    const formattedData = Object.keys(statusCounts).map((key) => ({
      label: key.startsWith("C") ? key.slice(0, 9) : key, // Trim if needed
      value: statusCounts[key],
    }));

    setChartData(formattedData);
  }, [filtered]);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const chartInstance = echarts.init(chartRef.current, null, {
      renderer: "svg",
      devicePixelRatio: window.devicePixelRatio || 1,
    });

    const option = {
      title: {
        text: "Review Status Chart",
        left: "center",
        top: "0%",

        textStyle: {
          fontSize: 14,
          fontWeight: "bold",
        },
      },

      tooltip: {
        trigger: "item",
        formatter: (params: any) =>
          `${params.name}: ${params.value} submissions`,
        position: "top",
        textStyle: {
          fontSize: 11,
        },
        padding: 6,
      },
      series: [
        {
          type: "pie",
          radius: isPhone ? ["26%", "45%"] : ["30%", "54%"],
          center: ["50%", "60%"],
          data: chartData.map((item, index) => ({
            value: item.value,
            name: item.label,
            itemStyle: {
              color: nightColors[index % nightColors.length], // Use your custom lightColors
            },
          })),
          itemStyle: {
            borderRadius: 7,
            borderColor: "#fff",
            borderWidth: 1,
          },
          label: {
            show: true,
            position: "outside", // Position the label outside the pie
            formatter: (params: any) => `${params.name}\n${params.value}`, // Name on top, value below
            textStyle: {
              fontSize: 9,
            },
          },
          labelLine: {
            show: true,
            length: 10,
            length2: isPhone ? 0 : 20,
            smooth: true,
            lineStyle: {
              color: "#333",
            },
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
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <span className="grid place-content-center h-full">
        <Alert variant="destructive" className="gap-0 mt-4 w-fit">
          <AlertCircle className="h-5 w-5 text-red-500 -mt-1.5" />
          <AlertDescription className="text-xs text-red-600 mt-1">
            No documents to found.
          </AlertDescription>
        </Alert>
      </span>
    );
  }

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: "100%" }}
      // className="mt-2.5"
      className="-mt-1"
    />
  );
});

export default ReviewStatus;
