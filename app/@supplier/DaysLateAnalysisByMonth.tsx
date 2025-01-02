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

interface DaysLateAnalysisProps {
  data: any[];
}

const DaysLateAnalysisByMonth: React.FC<dataProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const daysLateData: { [key: string]: { daysLate: number; docs: number } } =
      {}; // { "12/2024": { daysLate: 50, docs: 10 } }

    const excelDateToJSDate = (serial: number) => {
      // Excel date starts at Jan 1, 1900, with a bug that includes 1900 as a leap year
      const utcDays = Math.floor(serial - 25569); // 25569 is the number of days from 1/1/1900 to 1/1/1970
      const date = new Date(utcDays * 86400000); // 86400000 ms in a day
      return date.toLocaleDateString("en-GB"); // Format as DD/MM/YYYY
    };

    data.forEach((row: any) => {
      const rawDate = row["Planned Submission Date"];

      const daysLate = parseFloat(row["Days Late"]);

      let formattedDate: string | null = null;

      if (typeof rawDate === "number") {
        // Convert serialized date
        formattedDate = excelDateToJSDate(rawDate);
      } else if (typeof rawDate === "string") {
        formattedDate = rawDate; // Assume already in DD/MM/YYYY format
      }

      if (formattedDate && !isNaN(daysLate)) {
        const [day, month, year] = formattedDate.split("/"); // Assuming DD/MM/YYYY
        const monthYear = `${month}/${year}`; // Group by MM/YYYY

        if (!daysLateData[monthYear]) {
          daysLateData[monthYear] = { daysLate: 0, docs: 0 };
        }
        daysLateData[monthYear].daysLate += daysLate;
        daysLateData[monthYear].docs += 1;
      }
    });

    // Sort by chronological order
    const chartLabels = Object.keys(daysLateData).sort((a, b) => {
      const [monthA, yearA] = a.split("/");
      const [monthB, yearB] = b.split("/");
      return (
        new Date(`${yearA}-${monthA}-01`).getTime() -
        new Date(`${yearB}-${monthB}-01`).getTime()
      );
    });

    // Calculate averages and cumulative values
    const chartValues = chartLabels.map((monthYear) => {
      const { daysLate, docs } = daysLateData[monthYear];
      return daysLate / docs; // Average days late for the month
    });

    const cumulativeValues = chartLabels.map((_, index) => {
      const totalDaysLate = chartLabels
        .slice(0, index + 1)
        .reduce((sum, label) => sum + daysLateData[label].daysLate, 0);
      const totalDocs = chartLabels
        .slice(0, index + 1)
        .reduce((sum, label) => sum + daysLateData[label].docs, 0);

      return totalDaysLate / totalDocs; // Cumulative average
    });

    setChartData({
      labels: chartLabels,
      datasets: [
        {
          label: "Cumulative Days Late (Line)",
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
        text: "Days Late Analysis by Month",
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (context.dataset.type === "line") {
              return `${context.label}: ${context.raw.toFixed(
                2
              )} days cumulative`;
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
          text: "Month/Year",
        },
      },
      y: {
        title: {
          display: true,
          text: "Days Late",
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

export default DaysLateAnalysisByMonth;
