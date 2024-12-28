import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js"; // Import necessary Chart.js elements

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const WorkflowStatusChart = ({ data }) => {
  console.log("🚀 ~ WorkflowStatusChart ~ data:", data);
  // Count the statuses dynamically from the rows prop
  const statusCounts = data.reduce((acc, row) => {
    const status = row["Workflow Status"];
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(statusCounts);
  const dataValues = Object.values(statusCounts);

  const chartDataset = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"], // Add more colors if needed
        hoverBackgroundColor: ["#66BB6A", "#FFD54F", "#E57373"], // Add more hover colors
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: "None",
      },
    },
  };

  return (
    <div className="w-1/4">
      <Doughnut data={chartDataset} options={options} />
    </div>
  );
};

export default WorkflowStatusChart;
