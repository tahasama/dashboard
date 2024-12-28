import React from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import { Chart } from "react-chartjs-2";

// Register necessary Chart.js components
ChartJS.register(...registerables, SankeyController, Flow);

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
  "C2 Reviewed & accepted as marked revise & resubmi": "C2 with Comments",
  "C3 Reviewed & returned Correct and resubmit": "C3 Rejected",
  Terminated: "Status Terminated", // Update 'Terminated' to 'Status Terminated'
  Completed: "Status Complete", // Update 'Completed' to 'Status Complete'
};

const getColor = (index) => colorList[index % colorList.length]; // Loop through the color list

const prepareDataset = (data) => {
  const tempDataset = [];
  const labelsSet = new Set();

  data.forEach((item) => {
    // Step Status remains unchanged
    const stepStatus = item["Step Status"];

    // Apply labelMap to Step Outcome and Workflow Status
    const stepOutcome = labelMap[item["Step Outcome"]] || item["Step Outcome"];
    const workflowStatus =
      labelMap[item["Workflow Status"]] || item["Workflow Status"];

    // Flow from Step Status → Step Outcome (Step Outcome now has the updated label)
    tempDataset.push({
      from: stepStatus,
      to: stepOutcome,
      flow: 1,
    });

    // Flow from Step Outcome → Workflow Status (Workflow Status will have the updated label)
    if (stepOutcome !== workflowStatus) {
      tempDataset.push({
        from: stepOutcome,
        to: workflowStatus,
        flow: 1,
      });
    }

    // Add to the labels set
    labelsSet.add(stepStatus);
    labelsSet.add(stepOutcome); // Updated Step Outcome label added
    labelsSet.add(workflowStatus); // Updated Workflow Status label added
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
};

const SankeyChart = ({ data }) => {
  const dataset = prepareDataset(data);

  const chartData = {
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
            },
          },
        }}
      />
    </div>
  );
};

export default SankeyChart;
