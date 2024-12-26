import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2"; // Import Doughnut chart from react-chartjs-2
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js"; // Import necessary Chart.js elements

// Register necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface ReviewChartProps {
  data: any[]; // Type this according to your actual data structure
}

const ReviewChart: React.FC<ReviewChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    // Combine data from all files and generate chart data
    const statusCounts: { [key: string]: number } = {};

    data.forEach((fileData) => {
      const filteredData = fileData.filter(
        (row: any) => row["Review Status"] !== "Terminated"
      );

      filteredData.forEach((row: any) => {
        const status = row["Review Status"]; // Adjust to match your column name
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });
    });

    const formattedData = Object.keys(statusCounts).map((key) => ({
      label: key.slice(0, 8),
      value: statusCounts[key],
    }));

    setChartData(formattedData);
  }, [data]);

  // Prepare data for the chart
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Review Status Chart",
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

  const chartLabels = chartData.map((item) => item.label);
  const chartValues = chartData.map((item) => item.value);

  const chartDataset = {
    labels: chartLabels,
    datasets: [
      {
        label: "Status Counts",
        data: chartValues,
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ], // Add more colors if you have more statuses
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

  return (
    <div className="">
      <h2 className="text-lg font-bold">Review Status Chart</h2>
      <Doughnut data={chartDataset} options={chartOptions} />
    </div>
  );
};

export default ReviewChart;
