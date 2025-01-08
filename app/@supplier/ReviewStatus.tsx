import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { lightColors, nightColors } from "../colors";

const ReviewStatus: React.FC<any> = ({ data }) => {
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Process the data
    const statusCounts: { [key: string]: number } = {};
    data
      .filter((row: any) => row["Review Status"] !== "Terminated")
      .forEach((row: any) => {
        const status = row["Review Status"];
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
        formatter: (params: any) =>
          `${params.name}: ${params.value} submissions`,
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "60%"],
          data: chartData.map((item, index) => ({
            value: item.value,
            name: item.label,
            itemStyle: {
              color: nightColors[index % nightColors.length],
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
          })),
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
    return <div>No data available</div>;
  }

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
};

export default ReviewStatus;
