import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { nightColors } from "../colors";

// Custom color array for pie slices

const WorkflowStatusChart: React.FC<any> = ({ data }) => {
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Count the statuses dynamically from the data prop
    const statusCounts: { [key: string]: number } = {};

    data
      .filter(
        (wf: { [x: string]: string }) => wf["Workflow Status"] !== "Terminated"
      )
      .forEach((wf: { [x: string]: any }) => {
        const status = wf["Workflow Status"];
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

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const chartInstance = echarts.init(chartRef.current);

    const option = {
      title: {
        text: "Workflow Status Chart",
        left: "center",
        top: "7%",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `${params.name}: ${params.value} workflows`;
        },
      },
      legend: {
        orient: "vertical",
        left: "left",
        show: false, // Hides the legend
      },
      color: nightColors, // Apply the custom color scheme
      label: {
        show: true,
        position: "outside", // Label outside the pie
        formatter: "{b}: {c}",
        fontSize: 10,
        color: "#333",
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 25,
        smooth: true,
        lineStyle: {
          color: "#333",
        },
      },
      series: [
        {
          name: "Workflow Status",
          type: "pie",
          radius: "50%", // Regular pie chart (no doughnut)
          center: ["50%", "50%"], // Center the pie chart
          data: chartData.map((item, index) => ({
            value: item.value,
            name: item.label,
            itemStyle: {
              color: nightColors[index % nightColors.length], // Apply custom colors
              borderWidth: 4, // Increase the border width of slices
              borderColor: "#fff", // Set the border color to white (or any color)
            },
          })),
          // emphasis: {
          //   itemStyle: {
          //     shadowBlur: 1,
          //     shadowOffsetX: 0,
          //     shadowColor: "rgba(0, 0, 0, 0.5)",
          //   },
          // },
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

export default WorkflowStatusChart;
