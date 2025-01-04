import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { lightColors, nightColors } from "../colors";

const ReviewStatus: React.FC<any> = ({ data }) => {
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Combine data from all files and generate chart data
    const statusCounts: { [key: string]: number } = {};

    data
      .filter((row: any) => row["Review Status"] !== "Terminated")
      .forEach((row: any) => {
        const status = row["Review Status"]; // Adjust to match your column name
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });

    const formattedData = Object.keys(statusCounts).map((key) => ({
      label: key.startsWith("C") ? key.slice(0, 9) : key, // Slice the label to 8 characters
      value: statusCounts[key],
    }));

    setChartData(formattedData);
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const chartInstance = echarts.init(chartRef.current);

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
        formatter: (params: any) => {
          return `${params.name}: ${params.value} submissions`;
        },
        position: "top",
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"], // Inner and outer radius for the doughnut chart
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
            position: "outside", // Label outside the pie
            formatter: "{b}: {c}",
            fontSize: 10,
            color: "#333",
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

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.dispose();
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return <div>No data available</div>;
  }

  return <div ref={chartRef} style={{ width: "100%", height: "180px" }} />;
};

export default ReviewStatus;
