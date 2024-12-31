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

interface LateCompletionAnalysisProps {
  data: any[];
}

const LateCompletionAnalysis: React.FC<LateCompletionAnalysisProps> = ({
  data,
}) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const daysLateData: { [key: string]: number[] } = {};

    data.forEach((row: any) => {
      try {
        let plannedSubmissionDate = row["Original Due Date"];
        const daysLate = parseFloat(row["Days Late"]);

        // Convert Excel date or string date to a consistent Date object
        if (
          plannedSubmissionDate &&
          typeof plannedSubmissionDate === "number"
        ) {
          const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
          plannedSubmissionDate = new Date(
            excelEpoch.getTime() + (plannedSubmissionDate - 2) * 86400000
          );
        }

        if (
          plannedSubmissionDate &&
          typeof plannedSubmissionDate === "string"
        ) {
          const [day, month, year] = plannedSubmissionDate
            .split("/")
            .map((part: any) => parseInt(part, 10));
          plannedSubmissionDate = new Date(year, month - 1, day);
        }

        if (
          plannedSubmissionDate instanceof Date &&
          !isNaN(plannedSubmissionDate.getTime())
        ) {
          const formattedDate = plannedSubmissionDate
            .toISOString()
            .split("T")[0]; // Format as YYYY-MM-DD
          if (!isNaN(daysLate)) {
            if (!daysLateData[formattedDate]) {
              daysLateData[formattedDate] = [];
            }
            daysLateData[formattedDate].push(daysLate);
          }
        }
      } catch (error) {
        console.error("Error processing row:", row, error);
      }
    });

    // Step 2: Convert data into chart data
    try {
      const chartLabels = Object.keys(daysLateData).sort();
      const chartValues = chartLabels.map((date) => {
        const dailyLateDays = daysLateData[date];
        return (
          dailyLateDays.reduce((acc, val) => acc + val, 0) /
          dailyLateDays.length
        ); // Average
      });

      let cumulativeDaysLate = 0;
      let cumulativeDocuments = 0;
      const cumulativeValues = chartLabels.map((date) => {
        const dailyLateDays = daysLateData[date];
        cumulativeDaysLate += dailyLateDays.reduce((acc, val) => acc + val, 0);
        cumulativeDocuments += dailyLateDays.length;
        return cumulativeDaysLate / cumulativeDocuments; // Cumulative average
      });

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
    } catch (error) {
      console.error("Error preparing chart data:", error);
    }
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

export default LateCompletionAnalysis;
