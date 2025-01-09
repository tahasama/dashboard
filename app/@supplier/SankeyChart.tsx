import React from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import { Chart } from "react-chartjs-2";
import { sankeyColorList } from "../colors";

// Register necessary Chart.js components
ChartJS.register(...registerables, SankeyController, Flow);

// Define the type for a single data item
type DataItem = {
  "Submission Status": string;
  "Review Status": string;
  Status: string;
};

// Define the type for the dataProps
export type dataProps = {
  data: DataItem[]; // Expecting an array of DataItem objects
};

// Define the possible keys for labelMap
type LabelKey =
  | "C1 Reviewed & accepted as final & certified"
  | "C2 Reviewed & accepted as marked revise & resubmi"
  | "C2 Reviewed & accepted as marked revise & resubmit"
  | "C3 Reviewed & returned Correct and resubmit"
  | "C4 Review not required for information only";

// Define the labelMap with an explicit type
const labelMap: Record<LabelKey, string> = {
  "C1 Reviewed & accepted as final & certified": "C1 Accepted",
  "C2 Reviewed & accepted as marked revise & resubmi": "C2 with Comments",
  "C3 Reviewed & returned Correct and resubmit": "C3 Rejected",
  "C4 Review not required for information only": "C4 for Information",
  "C2 Reviewed & accepted as marked revise & resubmit": "C2 with Comments",
};

// Get color from colorList based on the index
const getColor = (index: number) =>
  sankeyColorList[index % sankeyColorList.length]; // Loop through the color list

// Type the return value of prepareDataset
type DatasetItem = {
  from: string;
  to: string;
  flow: number;
};

const prepareDataset = (data: DataItem[]) => {
  const tempDataset: DatasetItem[] = [];
  const labelsSet = new Set<string>();

  data.forEach((item) => {
    // Add flow: Submission → Review → Status
    tempDataset.push({
      from:
        labelMap[item["Submission Status"] as LabelKey] ||
        item["Submission Status"], // Use type assertion here
      to: labelMap[item["Review Status"] as LabelKey] || item["Review Status"], // Use type assertion here
      flow: 1,
    });
    tempDataset.push({
      from:
        labelMap[item["Review Status"] as LabelKey] || item["Review Status"], // Use type assertion here
      to: labelMap[item["Status"] as LabelKey] || item["Status"], // Use type assertion here
      flow: 1,
    });

    // Add the mapped labels to the set
    labelsSet.add(
      labelMap[item["Submission Status"] as LabelKey] ||
        item["Submission Status"]
    );
    labelsSet.add(
      labelMap[item["Review Status"] as LabelKey] || item["Review Status"]
    );
    labelsSet.add(labelMap[item["Status"] as LabelKey] || item["Status"]);
  });

  // Aggregate duplicate flows for better performance
  const flowMap: { [key: string]: DatasetItem } = {};
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

const SankeyChart: React.FC<dataProps> = ({ data }) => {
  const dataset = prepareDataset(data);

  const chartData = {
    datasets: [
      {
        label: "Status Flow",
        data: dataset.dataset,
        colorFrom: (c: any) => getColor(c.dataIndex), // Use color from colorList
        colorTo: (c: any) => getColor(c.dataIndex + 1), // Use color from colorList
        hoverColorFrom: (c: any) => getColor(c.dataIndex),
        hoverColorTo: (c: any) => getColor(c.dataIndex + 1),
      },
    ],
  };

  return (
    <div
      style={{ width: "100%", margin: "auto", height: "100%" }}
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
