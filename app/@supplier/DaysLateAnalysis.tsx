import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Ticks,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface DaysLateAnalysisProps {
  data: any[];
}

const DaysLateAnalysis: React.FC<DaysLateAnalysisProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const daysLateData: { [key: string]: number[] } = {}; // { "2024-12-01": [3, 5], "2024-12-02": [1, 0], ... }

    // Ensure proper handling of data and ignore invalid daysLate values
    data.forEach((row: any) => {
      const submissionDate = row["Planned Submission Date"];
      const daysLate = parseFloat(row["Days Late"]);

      // Only add valid daysLate values
      if (!isNaN(daysLate)) {
        if (!daysLateData[submissionDate]) {
          daysLateData[submissionDate] = [];
        }
        daysLateData[submissionDate].push(daysLate); // Store days late for each date
      }
    });

    // Step 2: Convert date strings to Date objects for sorting
    const chartLabels = Object.keys(daysLateData).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split("/").map(Number);
      const [dayB, monthB, yearB] = b.split("/").map(Number);

      const dateA = new Date(yearA, monthA - 1, dayA); // monthA - 1 because Date months are 0-indexed
      const dateB = new Date(yearB, monthB - 1, dayB);

      return dateA.getTime() - dateB.getTime();
    });

    // Step 3: Calculate the average days late for each date (for bar chart)
    const chartValues = chartLabels.map((date) => {
      const dailyLateDays = daysLateData[date];
      const averageLateDays =
        dailyLateDays.reduce((acc, val) => acc + val, 0) / dailyLateDays.length; // Calculate average
      return averageLateDays;
    });

    // Step 4: Calculate the cumulative average for the line chart
    let cumulativeDaysLate = 0;
    let cumulativeDocuments = 0;

    const cumulativeValues = chartLabels.map((date) => {
      const dailyLateDays = daysLateData[date];
      const dailyDocumentCount = dailyLateDays.length;

      // Update cumulative total days late and documents
      cumulativeDaysLate += dailyLateDays.reduce((acc, val) => acc + val, 0);
      cumulativeDocuments += dailyDocumentCount;

      // Calculate the cumulative average for this date
      const cumulativeAvg = cumulativeDaysLate / cumulativeDocuments;

      return cumulativeAvg;
    });

    // Step 5: Prepare the chart data
    setChartData({
      labels: chartLabels,
      datasets: [
        {
          label: "Cumulative Average Days Late (Line)",
          data: cumulativeValues,
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.1,
          type: "line",
        },
        {
          label: "Average Days Late (Bar)",
          data: chartValues,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          type: "bar",
        },
      ],
    });
  }, [data]);

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Days Late Analysis", // Chart title
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (context.dataset.type === "line") {
              return `${context.label}: ${context.raw.toFixed(
                2
              )} days cumulative (Average)`;
            } else {
              return `${context.label}: ${context.raw.toFixed(
                2
              )} days late (Average)`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Planned Submission Date", // X-axis label
        },
        // ticks: {
        //   callback: function (value: any) {
        //     // Ensure the value is a string
        //     if (typeof value === "string") {
        //       const [day, month, year] = value.split("/");
        //       return `${day}/${month}/${year}`;
        //     } else {
        //       // If the value is not a string, return it as is
        //       return value;
        //     }
        //   },
        // },
      },
      y: {
        title: {
          display: true,
          text: "Days Late", // Y-axis label
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-lg font-bold">Days Late Analysis</h2>
      {chartData ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default DaysLateAnalysis;
