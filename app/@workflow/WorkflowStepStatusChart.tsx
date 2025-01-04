import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js"; // Import necessary Chart.js elements
import { dataProps } from "../types";
import { nightColors, lightColors } from "../colors";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const WorkflowStepStatusChart: React.FC<dataProps> = ({ data }) => {
  // Count the statuses dynamically from the rows prop
  const statusCounts = data
    .filter((wf) => wf["Step Status"] !== "Terminated")
    .reduce((acc, row) => {
      const status = row["Step Status"];
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
        backgroundColor: nightColors, // Add more colors if needed
        hoverBackgroundColor: lightColors, // Add more hover colors
      },
    ],
  };

  const chartOptions = {
    // rotation: -90, // Start at the top of the doughnut
    // circumference: 180, // Show only half the doughnut
    // cutoutPercentage: 50, // Size of the hole in the middle
    // // maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Review Status Chart",
      },
      legend: {
        position: "right" as const, // Correctly specify the type as "bottom"
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw} workflows`;
          },
        },
      },
    },
  };

  return (
    <div className="w-1/4">
      <Doughnut data={chartDataset} options={chartOptions} />
    </div>
  );
};

export default WorkflowStepStatusChart;
