import React from "react";
import {
  Chart as ChartJS,
  ScatterController,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  TimeScale,
} from "chart.js";
import { Chart, Line } from "react-chartjs-2";
import SankeyChart from "./SankeyChart";
import { Flow, SankeyController } from "chartjs-chart-sankey";
import "chartjs-adapter-date-fns"; // Import the date-fns adapter

// Register necessary Chart.js components
ChartJS.register(
  ScatterController,
  CategoryScale,
  LinearScale,
  PointElement,
  LinearScale,
  LineController,
  LineElement,
  SankeyController,
  Flow,
  TimeScale,
  Tooltip,
  Legend
);

// Function to get color based on whether the task is completed on time or late
// const getColor = (daysLate) => {
//   if (daysLate > 0) {
//     return "#FF5733"; // Red for late tasks
//   } else {
//     return "#33FF57"; // Green for on-time tasks
//   }
// };

const getColor = (daysLate) => {
  console.log("🚀 ~ getColor ~ daysLate:", daysLate > 100);
  if (daysLate > 200) return "#b52b27"; // On time
  if (daysLate > 100) return "#c9302c"; // On time
  if (daysLate > 50) return "#d9534f"; // On time
  if (daysLate > 20) return "#fcb329"; // On time
  if (daysLate > 10) return "#ffe55d"; // On time
  if (daysLate > 5) return "#cfd959"; // Slightly late
  return "#85d254"; // Very late
};

const LateCompletionAnalysis = ({ data }) => {
  const sampleData = data[0];

  const ggg = sampleData.map((item) => {
    return {
      y: !item["Days Late"] ? 0 : Number(item["Days Late"].split(" ")[0]),
      x: Math.round((item["Date Due"] - 25569) * 864e5),
      backgroundColor: getColor(item["Days Late"].split(" ")[0]),
    };
  });

  // console.log("🚀 ~ LateCompletionAnalysis ~ ggg:", ggg);
  const chartData = {
    datasets: [
      {
        label: "Late Completion",
        data: ggg,
        // backgroundColor: "red", // Add more hover colors
        backgroundColor: ggg.map((item) => item.backgroundColor), // Set individual colors
        hoverBackgroundColor: ggg.map((item) => item.backgroundColor), // Consistent hover colors
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].raw.tooltip, // Tooltip showing the message
        },
      },
      legend: {
        display: true,
        position: "bottom",
      },
    },

    scales: {
      x: {
        type: "time", // Set x-axis type to 'time'
        time: {
          // Customize time formatting as needed
          unit: "day", // Display dates in days
          // parser: 'YYYY-MM-DD', // If your dates are in a specific format
          displayFormats: {
            day: "MMM d", // Display dates as "Jan 1", "Feb 5", etc.
          },
        },
        title: {
          display: true,
          text: "Original Due Date", // Label for Y-axis
          // color: "blue", // Set label color to blue
        },
        grid: {
          color: "#191919", // Set grid color to gray
        },
      },
      y: {
        title: {
          display: true,
          text: "Days Late", // Label for X-axis
          // color: "green", // Set label color to green
        },
        grid: {
          color: "#191919", // Set grid color to light gray
        },
      },
    },
  };

  return (
    <div style={{ width: "80%", margin: "auto", height: "500px" }}>
      <Chart
        type="scatter"
        data={chartData}
        options={options}
        // className="bg-white"
      />
    </div>
  );
};

export default LateCompletionAnalysis;
