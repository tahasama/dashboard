import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

const DocsPerUserChart: React.FC<{ data: any[] }> = ({ data }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        backgroundColor: "#4caf50",
        borderColor: "#388e3c",
        borderWidth: 1,
        data: [],
        barThickness: 10, // Controls bar height
      },
    ],
  });

  useEffect(() => {
    // Grouping by "Assigned To" and counting the documents per user
    const userDocCount: { [key: string]: number } = {};

    data
      .filter(
        (row) =>
          row["Step Status"] !== "Completed" &&
          row["Step Status"] !== "Terminated"
      )
      .forEach((row) => {
        const user = row["Assigned To"];
        if (user) {
          userDocCount[user] = (userDocCount[user] || 0) + 1;
        }
      });

    // Filter out users with zero documents
    const filteredUserDocCount = Object.entries(userDocCount).filter(
      ([, count]) => count > 0
    );

    const labels = filteredUserDocCount.map(([user]) => user);
    const values = filteredUserDocCount.map(([, count]) => count);

    setChartData({
      labels,
      datasets: [
        {
          backgroundColor: "#4caf50",
          borderColor: "#388e3c",
          borderWidth: 1,
          data: values,
          barThickness: 10, // Controls bar height
        },
      ],
    });
  }, [data]);

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows the height of the chart to be set manually
    indexAxis: "y", // Horizontal bar chart
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true,
            fontSize: 10, // Adjust font size for X-axis
          },
          gridLines: {
            display: true,
            color: "#ccc", // Grid line color
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontSize: 10, // Smaller Y-axis labels
            padding: 5, // Add some padding
          },
          gridLines: {
            display: false, // Hide grid lines for Y-axis
          },
        },
      ],
    },
    plugins: {
      legend: {
        display: false, // Completely hides the legend
      },
      title: {
        display: false, // Ensures no chart title is displayed
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100px" }}>
      {" "}
      {/* Adjust the height here */}
      {chartData.labels.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p>No documents to review</p>
      )}
    </div>
  );
};

export default DocsPerUserChart;
