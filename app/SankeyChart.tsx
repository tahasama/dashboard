import React, { useMemo } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import { Chart } from "react-chartjs-2";

// Register necessary Chart.js components
ChartJS.register(...registerables, SankeyController, Flow);

// const colorList = [
//   "#66BB6A", // Completed: Green
//   "#42A5F5", // Submitted: Blue
//   "#FF9800", // Under Review: Orange
//   "#81D4FA", // For Information: Light Blue
//   "#FFEB3B", // For Review: Yellow
//   "#EF5350", // Canceled: Red
//   "#F48FB1", // Terminated: Pink
//   "#388E3C", // Approved: Dark Green
//   "#D32F2F", // Rejected: Dark Red
// ];

// const colorList = [
//   "#AEDFF7", // Light Blue
//   "#74C0E3", // Sky Blue
//   "#4FAFD3", // Medium Blue
//   "#2894C2", // Deep Blue
//   "#9FE2B2", // Mint Green
//   "#5ECBA4", // Sea Green
//   "#3AB489", // Emerald Green
//   "#C7B5E4", // Lavender
//   "#A38FCB", // Soft Purple
//   "#7D6FB3", // Deep Purple
// ];

const colorList = [
  "#0D47A1", // Bold Blue
  "#2196F3", // Medium Blue
  "#BBDEFB", // Light Blue
  "#1B5E20", // Bold Green
  "#4CAF50", // Medium Green
  "#C8E6C9", // Light Green
  "#4A148C", // Bold Purple
  "#9C27B0", // Medium Purple
  "#E1BEE7", // Light Purple
  "#7D6FB3", // Deep Purple
];

const labelMap = {
  "C1 Reviewed & accepted as final & certified": "C1 Accepted",
  "C2 Reviewed & accepted as marked revise & resubmi":
    "C2 with Comments                       ",
  "C3 Reviewed & returned Correct and resubmit": "C3 Rejected",
};

const getColor = (index) => colorList[index % colorList.length]; // Loop through the color list

const SankeyChart = ({ data }) => {
  const dataset = useMemo(() => {
    const tempDataset = [];
    const labelsSet = new Set();

    data.forEach((element) => {
      element.forEach((item) => {
        // Add flow: Submission → Review → Status
        tempDataset.push({
          from:
            labelMap[item["Submission Status"]] || item["Submission Status"],
          to: labelMap[item["Review Status"]] || item["Review Status"],
          flow: 1,
        });
        tempDataset.push({
          from: labelMap[item["Review Status"]] || item["Review Status"],
          to: labelMap[item["Status"]] || item["Status"],
          flow: 1,
        });

        // Add the mapped labels to the set
        labelsSet.add(
          labelMap[item["Submission Status"]] || item["Submission Status"]
        );
        labelsSet.add(labelMap[item["Review Status"]] || item["Review Status"]);
        labelsSet.add(labelMap[item["Status"]] || item["Status"]);
      });
    });

    // Aggregate duplicate flows for better performance
    const flowMap = {};
    tempDataset.forEach(({ from, to, flow }) => {
      const key = `${from}->${to}`;
      if (flowMap[key]) {
        flowMap[key].flow += flow;
      } else {
        flowMap[key] = { from, to, flow };
      }
    });

    return {
      dataset: Object.values(flowMap), // Return aggregated data
      labels: Array.from(labelsSet), // Extracted labels
    };
  }, [data]);

  const chartData = useMemo(() => {
    return {
      datasets: [
        {
          label: "Status Flow",
          data: dataset.dataset,
          colorFrom: (c) => getColor(c.dataIndex), // Use color from colorList
          colorTo: (c) => getColor(c.dataIndex + 1), // Use color from colorList
          hoverColorFrom: (c) => getColor(c.dataIndex),
          hoverColorTo: (c) => getColor(c.dataIndex + 1),
        },
      ],
    };
  }, [dataset]);

  return (
    <div
      style={{ width: "80%", margin: "auto", height: "500px" }}
      className="bg-slate-500"
    >
      <Chart
        type="sankey"
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              //   labels: {
              //     // Display the label name, not color hex codes
              //     generateLabels: () =>
              //       dataset.labels.map((label, index) => ({
              //         text: label,
              //         fillStyle: getColor(index),
              //       })),
              //   },
            },
          },
        }}
      />
    </div>
  );
};

export default SankeyChart;
