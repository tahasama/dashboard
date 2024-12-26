import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

// Register necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface SubmissionStatusProps {
  data: any[]; // Type this according to your actual data structure
}

const SubmissionStatus: React.FC<SubmissionStatusProps> = ({ data }) => {
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    const statusCounts: { [key: string]: number } = {};
    data.forEach((fileData) => {
      const filteredData = fileData.filter(
        (row: any) =>
          row["Submission Status"] !== "Canceled" &&
          row["Submission Status"] !== "Cancelled"
      );

      filteredData.forEach((row: any) => {
        const status = row["Submission Status"]; // Replace with your actual status key
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });
    });

    const formattedData = Object.keys(statusCounts).map((key) => ({
      label: key,
      value: statusCounts[key],
    }));

    setChartData(formattedData);
  }, [data]);

  const chartLabels = chartData.map((item) => item.label);
  const chartValues = chartData.map((item) => item.value);

  const chartDataset = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: [
          "rgba(75, 192, 192, 0.3)",
          "rgba(255, 99, 132, 0.3)",
          "rgba(54, 162, 235, 0.3)",
          "rgba(153, 102, 255, 0.3)",
          "rgba(255, 159, 64, 0.3)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Submission Status Distribution",
      },
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw} submissions`;
          },
        },
      },
    },
  };

  return (
    <div className="">
      <h2 className="text-lg font-bold">Submission Status Distribution</h2>
      <Pie data={chartDataset} options={chartOptions} />
    </div>
  );
};

export default SubmissionStatus;
