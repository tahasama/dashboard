import React from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import { Chart } from "react-chartjs-2";
import { TooltipDataAttrs } from "react-calendar-heatmap";
import { dataProps } from "../types";

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

const labelMap: Record<string, string> = {
  "C1 Reviewed & accepted as final & certified": "C1 Accepted",
  "C2 Reviewed & accepted as marked revise & resubmi": "C2 with Comments",
  "C3 Reviewed & returned Correct and resubmit": "C3 Rejected",
  Terminated: "Status Terminated", // Update 'Terminated' to 'Status Terminated'
  Completed: "Status Complete", // Update 'Completed' to 'Status Complete'
};

const getColor = (index: number) => colorList[index % colorList.length]; // Loop through the color list

type DataItem = {
  "Step Status": string;
  "Step Outcome": string;
  "Workflow Status": string;
};

type SankeyFlow = {
  from: string;
  to: string;
  flow: number;
};

const prepareDataset = (data: DataItem[]) => {
  const tempDataset: SankeyFlow[] = [];
  const labelsSet = new Set<string>();

  data.forEach((item) => {
    const stepStatus = item["Step Status"];
    const stepOutcome = labelMap[item["Step Outcome"]] || item["Step Outcome"];
    const workflowStatus =
      labelMap[item["Workflow Status"]] || item["Workflow Status"];

    // Flow from Step Status → Step Outcome
    tempDataset.push({
      from: stepStatus,
      to: stepOutcome,
      flow: 1,
    });

    // Flow from Step Outcome → Workflow Status
    if (stepOutcome !== workflowStatus) {
      tempDataset.push({
        from: stepOutcome,
        to: workflowStatus,
        flow: 1,
      });
    }

    // Add to the labels set
    labelsSet.add(stepStatus);
    labelsSet.add(stepOutcome);
    labelsSet.add(workflowStatus);
  });

  // Aggregate duplicate flows
  const flowMap: Record<string, SankeyFlow> = {};
  tempDataset.forEach(({ from, to, flow }) => {
    const key = `${from}->${to}`;
    if (flowMap[key]) {
      flowMap[key].flow += flow;
    } else {
      flowMap[key] = { from, to, flow };
    }
  });

  return {
    dataset: Object.values(flowMap), // Aggregated data
    labels: Array.from(labelsSet), // Extracted labels
  };
};

const SankeyChart: React.FC<dataProps> = ({ data }) => {
  const { dataset } = prepareDataset(data);

  const chartData = {
    datasets: [
      {
        label: "Status Flow",
        data: dataset,
        colorFrom: (context: { dataIndex: number }) =>
          getColor(context.dataIndex),
        colorTo: (context: { dataIndex: number }) =>
          getColor(context.dataIndex + 1),
        hoverColorFrom: (context: { dataIndex: number }) =>
          getColor(context.dataIndex),
        hoverColorTo: (context: { dataIndex: number }) =>
          getColor(context.dataIndex + 1),
      },
    ],
  };

  return (
    <div
      style={{ width: "80%", margin: "auto", height: "500px" }}
      // className="bg-slate-500"
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
