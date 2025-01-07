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
import { lightColorsLineBars } from "../colors";
import LateAnalysisConclusion from "./LateAnalysisConclusion";

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

// Define the data structure for the input `data` prop
interface DataRow {
  "Planned Submission Date": string | number;
  "Submission Status": string;
  "Days Late": string | number;
}

// Define the props type
interface LateAnalysisProps {
  data: DataRow[];
}

interface LateAnalysisProps {
  data: {
    "Planned Submission Date": string | number;
    "Submission Status": string;

    "Days Late": string | number;
  }[];
}

const LateAnalysis: React.FC<LateAnalysisProps> = ({ data }) => {
  console.log("🚀 ~ data44:", data);
  // Default value set to empty array
  const [view, setView] = useState<boolean>(true); // true = daily, false = monthly
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  console.log("🚀 ~ chartData444:", chartData);
  const [monthlyStats, setMonthlyStats] = useState<{
    chartValues: number[];
    cumulativeValues: number[];
  }>({ chartValues: [], cumulativeValues: [] });

  const excelDateToJSDate = (serial: number): string => {
    const utcDays = Math.floor(serial - 25569);
    const date = new Date(utcDays * 86400000);
    return date.toLocaleDateString("en-GB");
  };

  const processData = (groupBy: "daily" | "monthly") => {
    const groupedData: Record<string, { daysLate: number; docs: number }> = {};

    // Ensure data is available before processing
    console.log("🚀 ~ processData ~ data:", data && Array.isArray(data));
    if (data && Array.isArray(data)) {
      data
        .filter((row) => row["Submission Status"] !== "Canceled")
        .forEach((row) => {
          let dateKey: string | null = null;
          const rawDate = row["Planned Submission Date"];
          const daysLate = parseFloat(String(row["Days Late"]));

          if (typeof rawDate === "number") {
            dateKey = excelDateToJSDate(rawDate);
          } else if (typeof rawDate === "string") {
            dateKey = rawDate;
          }

          if (dateKey && !isNaN(daysLate)) {
            if (groupBy === "monthly") {
              const [day, month, year] = dateKey.split("/");
              dateKey = `${month}/${year}`;
            }

            if (!groupedData[dateKey]) {
              groupedData[dateKey] = { daysLate: 0, docs: 0 };
            }
            groupedData[dateKey].daysLate += daysLate;
            groupedData[dateKey].docs += 1;
          }
        });
    }

    return groupedData;
  };

  const calculateChartValues = (
    groupedData: Record<string, { daysLate: number; docs: number }>
  ) => {
    const chartLabels = Object.keys(groupedData).sort((a, b) => {
      const parseDate = (date: string) => {
        const parts = date.split("/").map(Number);
        return parts.length === 3
          ? new Date(parts[2] + 2000, parts[1] - 1, parts[0]) // Use full YYYY format for sorting
          : new Date(parts[1], parts[0] - 1); // Monthly format (MM/YYYY)
      };

      return parseDate(a).getTime() - parseDate(b).getTime();
    });

    // Format labels as DD/MM/YY for display, with validation
    const formattedLabels = chartLabels.map((label) => {
      const parts = label.split("/");

      if (parts.length === 3) {
        // Ensure valid date parts
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${day}/${month}/${year.slice(-2)}`; // Display as DD/MM/YY
      }

      // If the date format is unexpected, return the label unchanged
      return label;
    });

    const chartValues = chartLabels.map((label) => {
      const { daysLate, docs } = groupedData[label];
      return daysLate / docs;
    });

    const cumulativeValues = chartLabels.map((_, index) => {
      const cumulativeDaysLate = chartLabels
        .slice(0, index + 1)
        .reduce((sum, label) => sum + groupedData[label].daysLate, 0);
      const cumulativeDocs = chartLabels
        .slice(0, index + 1)
        .reduce((sum, label) => sum + groupedData[label].docs, 0);
      return cumulativeDaysLate / cumulativeDocs;
    });

    return { chartLabels, chartValues, cumulativeValues };
  };

  useEffect(() => {
    if (!data || data.length === 0) return; // Prevent error if data is empty

    const dailyGroupedData = processData("daily");
    const monthlyGroupedData = processData("monthly");

    // Generate chart data based on view (daily/monthly)
    const groupedData = view ? dailyGroupedData : monthlyGroupedData;
    const { chartLabels, chartValues, cumulativeValues } =
      calculateChartValues(groupedData);
    console.log("🚀 ~ useEffect ~ chartLabels:", groupedData);

    // Format labels as DD/MM/YY for display
    const formattedLabels = chartLabels.map((label) => {
      const parts = label.split("/");

      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${day}/${month}/${year.slice(-2)}`; // Display as DD/MM/YY
      }

      return label;
    });

    setChartData({
      labels: formattedLabels, // Use formatted labels here
      datasets: [
        {
          label: "Cumulative Average Days Late (Line)",
          data: cumulativeValues,
          fill: true,
          borderColor: lightColorsLineBars.line,
          backgroundColor: lightColorsLineBars.lineFil,
          tension: 0.6,
          borderWidth: 4,
          pointRadius: 0,
          type: "line",
        },
        {
          label: "Average Days Late (Bar)",
          data: chartValues,
          backgroundColor: lightColorsLineBars.border,
          borderColor: lightColorsLineBars.border,
          borderWidth: 1,
          type: "bar",
        },
      ],
    });

    // Always calculate monthly stats for the conclusion
    const monthlyStats = calculateChartValues(monthlyGroupedData);
    setMonthlyStats({
      chartValues: monthlyStats.chartValues,
      cumulativeValues: monthlyStats.cumulativeValues,
    });
  }, [view, data]);

  const chartOptions = {
    responsive: true,
    plugins: {
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
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
      x: { title: { display: false } },
      y: { title: { display: true, text: "Days Late" }, beginAtZero: true },
    },
  };

  return (
    <div className="flex justify-around">
      <div className="w-8/12">
        <div className="flex justify-between pr-2">
          <h2>Late Submission Analysis By {view ? "Day" : "Month"}</h2>
          <button
            onClick={() => setView(!view)}
            className="bg-orange-200 p-1 rounded ring-orange-500 ring-1 min-w-32 text-sm"
          >
            Switch to {!view ? "Day" : "Month"}
          </button>
        </div>
        <Line data={chartData} options={chartOptions} />
      </div>
      <LateAnalysisConclusion data={data} {...monthlyStats} />
    </div>
  );
};

export default LateAnalysis;
