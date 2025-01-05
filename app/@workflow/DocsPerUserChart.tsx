import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  lightColors,
  lightColorsLineBars,
  nightColors,
  sankeyColorList,
} from "../colors";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DocsPerUserChart: React.FC<{ data: any[] }> = ({ data }) => {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: "Overdue",
        backgroundColor: "#ef4444", // Red for Overdue
        borderColor: lightColors[1],
        borderWidth: 1,
        data: [] as number[],
        barThickness: 20, // Controls bar height
      },
      {
        label: "Current",
        backgroundColor: sankeyColorList[9], // Green for Current
        borderColor: "#388e3c",
        borderWidth: 1,
        data: [] as number[],
        barThickness: 20, // Controls bar height
      },
    ],
  });

  useEffect(() => {
    const userDocCount: {
      [key: string]: { overdue: number; current: number };
    } = {};

    data
      .filter(
        (row) =>
          row["Step Status"] !== "Completed" &&
          row["Step Status"] !== "Terminated"
      )
      .forEach((row) => {
        const user = row["Assigned To"];
        const status = row["Step Status"];

        if (user) {
          if (!userDocCount[user]) {
            userDocCount[user] = { overdue: 0, current: 0 };
          }
          if (status === "Overdue") {
            userDocCount[user].overdue += 1;
          } else if (status === "Current") {
            userDocCount[user].current += 1;
          }
        }
      });

    const filteredUserDocCount = Object.entries(userDocCount).filter(
      ([, count]) => count.overdue > 0 || count.current > 0
    );

    const labels = filteredUserDocCount.map(([user]) => user);
    const overdueValues = filteredUserDocCount.map(
      ([, count]) => count.overdue
    );
    const currentValues = filteredUserDocCount.map(
      ([, count]) => count.current
    );

    setChartData((prev) => ({
      ...prev,
      labels,
      datasets: [
        {
          ...prev.datasets[0],
          data: overdueValues,
        },
        {
          ...prev.datasets[1],
          data: currentValues,
        },
      ],
    }));
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const, // Horizontal bar chart
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10, // Reducing the padding for chart area
      },
    },
    scales: {
      x: {
        ticks: {
          beginAtZero: true,
          font: {
            size: 10, // Adjust font size for X-axis
          },
        },
        grid: {
          display: true,
          color: "#ccc", // Grid line color
        },
      },
      y: {
        ticks: {
          display: false, // Hides the default Y-axis labels
          padding: 2, // Reduce the space between bars and grid lines
        },
        grid: {
          display: true,
          drawOnChartArea: true, // Draw grid lines only on the chart area
          color: "#ddd", // Lighter grid line color
          lineWidth: 0.5, // Thinner grid lines
        },
        // Control the height of the grid cells
        categoryPercentage: 0.9, // Reducing space between the bars vertically
        barPercentage: 1, // Make the bars wider to occupy the space better
      },
    },
    plugins: {
      legend: {
        display: false, // Completely hides the legend
      },

      title: {
        display: true, // Set to true to show the title
        text: "Workflows in action", // Title text
        align: "center", // Align the title horizontally (use 'center', 'left', or 'right')
        position: "top", // Position the title at the top
        font: {
          size: 16, // Font size for the title
          weight: "600", // Use '600' for semibold
        },
        color: "#3f3f46", // Title color
      },
    },
  };

  // Local plugin for custom labels
  const customLabelPlugin = {
    id: "bar-labels-plugin",
    afterDatasetsDraw(chart: any) {
      const { ctx, scales } = chart;
      const dataset = chart.data.datasets[0];

      ctx.save();
      chart.data.labels.forEach((label: string, index: number) => {
        const bar = chart.getDatasetMeta(0).data[index];
        if (bar) {
          const value = dataset.data[index];
          const { x, y } = bar.tooltipPosition();

          ctx.fillStyle = "#000"; // Label color (adjust for contrast)
          ctx.font = "12px Arial"; // Label font
          ctx.textAlign = "center";

          // Draw the label inside or above the bar
          const labelText = `${label} (${value})`;
          const textX = 150; // Adjust position slightly for horizontal alignment
          const textY = y + 5; // Center vertically relative to the bar

          ctx.fillText(labelText, textX, textY);
        }
      });
      ctx.restore();
    },
  };

  return (
    // <div style={{ width: "100%", height: "180px" }}>
    <div style={{ width: "100%", height: "100%" }}>
      {/* Adjust height for container */}
      {chartData.labels.length > 0 ? (
        <Bar data={chartData} options={options} plugins={[customLabelPlugin]} />
      ) : (
        <p>No documents to review</p>
      )}
    </div>
  );
};

export default DocsPerUserChart;
