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
import { dataProps } from "../types";

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

const LateCompletionAnalysisByMonth: React.FC<dataProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any | null>(null);

  useEffect(() => {
    const monthsLateData: { [key: string]: number[] } = {};

    data.forEach((row) => {
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
            .map((part) => parseInt(part, 10));
          plannedSubmissionDate = new Date(year, month - 1, day);
        }

        // Ensure plannedSubmissionDate is a Date object before using instanceof
        if (
          plannedSubmissionDate &&
          typeof plannedSubmissionDate === "object" &&
          plannedSubmissionDate instanceof Date &&
          !isNaN(plannedSubmissionDate.getTime())
        ) {
          const formattedMonth = `${plannedSubmissionDate.getFullYear()}-${(
            plannedSubmissionDate.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}`; // Format as YYYY-MM

          if (!isNaN(daysLate)) {
            if (!monthsLateData[formattedMonth]) {
              monthsLateData[formattedMonth] = [];
            }
            monthsLateData[formattedMonth].push(daysLate);
          }
        }
      } catch (error) {
        console.error("Error processing row:", row, error);
      }
    });

    // Convert data into chart data
    try {
      const chartLabels = Object.keys(monthsLateData).sort();
      const chartValues = chartLabels.map((month) => {
        const monthlyLateDays = monthsLateData[month];
        return (
          monthlyLateDays.reduce((acc, val) => acc + val, 0) /
          monthlyLateDays.length
        ); // Average
      });

      let cumulativeDaysLate = 0;
      let cumulativeDocuments = 0;
      const cumulativeValues = chartLabels.map((month) => {
        const monthlyLateDays = monthsLateData[month];
        cumulativeDaysLate += monthlyLateDays.reduce(
          (acc, val) => acc + val,
          0
        );
        cumulativeDocuments += monthlyLateDays.length;
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
            fill: false,
            tension: 0,
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
        text: "Monthly Days Late Analysis", // Chart title
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
          text: "Month", // X-axis label
        },
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
      <h2 className="text-lg font-bold">Monthly Days Late Analysis</h2>
      {chartData ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default LateCompletionAnalysisByMonth;
