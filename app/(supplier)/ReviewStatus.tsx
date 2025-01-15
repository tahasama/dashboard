"use client";
import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { nightColors } from "../colors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Data, MergedData } from "../types";

const ReviewStatus: React.FC<Data> = ({ data }) => {
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Process the data
    const statusCounts: { [key: string]: number } = {};
    data
      .filter((row: MergedData) => row.reviewStatus !== "Terminated")
      .forEach((row: any) => {
        const status = row.reviewStatus;
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });

    const formattedData = Object.keys(statusCounts).map((key) => ({
      label: key.startsWith("C") ? key.slice(0, 9) : key,
      value: statusCounts[key],
    }));

    setChartData(formattedData);
  }, [data]);

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
        top: "top",
        textStyle: {
          fontSize: 14,
          fontWeight: "bold",
        },
      },

      tooltip: {
        trigger: "item",
        formatter: (params: any) =>
          `${params.name}: ${params.value} submissions`,
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "65%"], // Inner and outer radius for the doughnut chart
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
            length2: 20,
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

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
};

export default ReviewStatus;
