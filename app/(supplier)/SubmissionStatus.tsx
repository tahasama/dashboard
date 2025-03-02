"use client";
import React, { useEffect, useState, useRef, memo } from "react";
import * as echarts from "echarts";
import { nightColors } from "../colors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Data, MergedData } from "../types";
import { useFilters } from "../FiltersProvider";

const SubmissionStatus: React.FC<Data> = memo(() => {
  const { filtered } = useFilters(); // Get filtered data

  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const chartRef = useRef<HTMLDivElement>(null);

  // Define custom colors (you can modify these)

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

  // Prepare the data when component mounts
  useEffect(() => {
    const statusCounts: { [key: string]: number } = {};

    filtered
      // .filter(
      //   (row: MergedData) =>
      //     row.submissionStatus !== "Canceled" &&
      //     row.submissionStatus !== "Cancelled"
      // )
      .forEach((row: any) => {
        let status = row.submissionStatus;
        if (status === "Marked As Submitted") {
          status = "Submitted";
        }
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });

    const formattedData = Object.keys(statusCounts).map((key) => ({
      label: key,
      value: statusCounts[key],
    }));

    setChartData(formattedData);
  }, [filtered]);

  // Initialize and render the chart when the data is ready
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const chartInstance = echarts.init(chartRef.current, null, {
      renderer: "svg",
      devicePixelRatio: window.devicePixelRatio || 1,
    });

    const option = {
      title: {
        text: "Submission Status",
        left: "center",
        top: "2%",
        // top: "20%", // Adjust this value to move the title down

        textStyle: {
          fontSize: 14,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `${params.name}: ${params.value} submissions`;
        },
        position: "top",
        textStyle: {
          fontSize: 11,
        },
        padding: 6,
      },

      series: [
        {
          type: "pie",
          // radius: ["40%", "65%"],
          radius: isPhone ? ["26%", "45%"] : ["30%", "54%"],
          center: ["50%", "60%"], // Position of the pie chart
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

    // Resize handler
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
      className="-mt-"
    />
  );
});

export default SubmissionStatus;
