import React, { useEffect, useState, useRef } from "react";
import * as echarts from "echarts";
import { nightColors } from "../colors";

const SubmissionStatus: React.FC<any> = ({ data }) => {
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const chartRef = useRef<HTMLDivElement>(null);

  // Define custom colors (you can modify these)

  // Prepare the data when component mounts
  useEffect(() => {
    const statusCounts: { [key: string]: number } = {};

    data
      .filter(
        (row: any) =>
          row["Submission Status"] !== "Canceled" &&
          row["Submission Status"] !== "Cancelled"
      )
      .forEach((row: any) => {
        const status = row["Submission Status"];
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });

    const formattedData = Object.keys(statusCounts).map((key) => ({
      label: key,
      value: statusCounts[key],
    }));

    setChartData(formattedData);
  }, [data]);

  // Initialize and render the chart when the data is ready
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const chartInstance = echarts.init(chartRef.current);

    const option = {
      title: {
        text: "Submission Status",
        left: "center",
        top: "top",
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
        position: "top", // Tooltip position
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

    // Resize handler
    const handleResize = () => {
      chartInstance.resize();
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup function to dispose of the chart instance on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.dispose();
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: "180px" }} // Ensuring it has width and height
    />
  );
};

export default SubmissionStatus;
