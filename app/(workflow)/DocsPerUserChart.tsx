"use client";
import React, { memo, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { lightColors, sankeyColorList } from "../colors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Data, MergedData } from "../types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DocsPerUserChart: React.FC<Data> = memo(({ data }) => {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: "Overdue",
        backgroundColor: "#ef4444", // Red for Overdue
        borderColor: lightColors[1],
        borderWidth: 1,
        data: [] as number[],
        barThickness: 16, // Controls bar height
      },
      {
        label: "Current",
        backgroundColor: sankeyColorList[9], // Green for Current
        borderColor: "#388e3c",
        borderWidth: 1,
        data: [] as number[],
        barThickness: 20, // Controls bar height
      },
    ],
  });

  const [chartHeight, setChartHeight] = useState(200); // Start with a default height

  const [additionalInsights, setAdditionalInsights] = useState({
    color: "bg-teal-100 ring-teal-400/90",
    message:
      "Recent workflows demonstrate efficient review processes, indicating steady progress and manageable reviewer workloads.",
  });

  useEffect(() => {
    const userDocCount: {
      [key: string]: { overdue: number; current: number };
    } = {};

    const userDocTracker: { [key: string]: Set<string> } = {}; // Track documents per user to prevent duplicates

    // Step 1: Aggregate document counts for each user without duplication
    data.forEach((row: MergedData) => {
      const user = row.assignedTo ?? ""; // Fallback to an empty string if `assignedTo` is missing
      const status = row.stepStatus;
      const documentNo = row.documentNo; // Unique identifier for each document

      if (!userDocCount[user]) {
        userDocCount[user] = { overdue: 0, current: 0 };
      }

      // Initialize user document tracker for this user if not present
      if (!userDocTracker[user]) {
        userDocTracker[user] = new Set();
      }

      // Skip duplicate document counting for the user
      if (!userDocTracker[user].has(documentNo)) {
        if (status === "Overdue") {
          userDocCount[user].overdue += 1;
        } else if (status === "Current") {
          userDocCount[user].current += 1;
        }

        // Mark the document as counted for this user
        userDocTracker[user].add(documentNo);
      }
    });

    // Step 2: Remove users with no "Overdue" or "Current" counts
    const filteredUserDocCount = Object.entries(userDocCount).filter(
      ([, count]) => count.overdue > 0 || count.current > 0
    );

    // Step 3: Prepare labels and data for the chart
    const labels = filteredUserDocCount.map(([user]) => user);
    const overdueValues = filteredUserDocCount.map(
      ([, count]) => count.overdue
    );
    const currentValues = filteredUserDocCount.map(
      ([, count]) => count.current
    );

    // Step 4: Update chart data
    setChartData((prev) => ({
      ...prev,
      labels,
      datasets: [
        {
          ...prev.datasets[0],
          data: overdueValues,
        },
        {
          ...prev.datasets[1],
          data: currentValues,
        },
      ],
    }));

    // Step 5: Dynamically adjust chart height
    setChartHeight(
      labels.length > 3 ? labels.length * 50 : 200 // Adjust height based on labels
    );

    // Step 6: Debugging total calculations
    const totalOverdue = overdueValues.reduce((sum, val) => sum + val, 0);
    const totalCurrent = currentValues.reduce((sum, val) => sum + val, 0);
    const totalDocuments = overdueValues.reduce((sum, val) => sum + val, 0); // Calculate the total number of overdue documents

    const isTooManyLateDocs = totalDocuments > 30; // Threshold for number of late documents
    // const isTooHighDaysLatePerDoc = avgDaysLate > 7; // Threshold for average days late per document

    if (isTooManyLateDocs) {
      setAdditionalInsights({
        color: "bg-red-100 ring-red-400/90",
        message: `⚠️ Warning: Too many documents are late (${totalDocuments}). This suggests potential bottlenecks in the review process.`,
      });
    }
    // else if (isTooHighDaysLatePerDoc) {
    //   setAdditionalInsights({
    //     color: "bg-orange-100 ring-orange-400/90",
    //     message:
    //       "⚠️ Warning: Average days late per document is too high. Review processes may be taking longer than acceptable.",
    //   });
    // }
    else {
      setAdditionalInsights({
        color: "bg-teal-100 ring-teal-400/90",
        message:
          "Recent workflows demonstrate efficient review processes, indicating steady progress and manageable reviewer workloads.",
      });
    }
  }, [data]);

  // Chart options (do not remove any existing options and styling)
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y", // Horizontal bar chart
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10, // Adjust font size for X-axis
          },
        },
        grid: {
          display: true,
          color: "#ccc",
        },
      },
      y: {
        ticks: {
          display: false,
          padding: 5,
        },
        grid: {
          display: true,
          drawOnChartArea: true,
          color: "#ddd",
          lineWidth: 0.5,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Workflows in action",
        align: "center", // Strictly use allowed values
        position: "top",
        font: {
          size: 16,
          weight: "bold",
        },
        color: "black",
      },
    },
  };

  // Local plugin for custom labels
  const customLabelPlugin = {
    id: "bar-labels-plugin",
    afterDatasetsDraw(chart: any) {
      const { ctx, scales } = chart;
      const dataset = chart.data.datasets[0];

      ctx.save();
      chart.data.labels.forEach((label: string, index: number) => {
        const bar = chart.getDatasetMeta(0).data[index];
        if (bar) {
          const value = dataset.data[index];
          const { x, y } = bar.tooltipPosition();

          ctx.fillStyle = "#000"; // Label color (adjust for contrast)
          ctx.font = "12px Garmond"; // Label font
          ctx.textAlign = "center";

          // Draw the label inside or above the bar
          const labelText = `${label.split("-")[0]} (${value})`;
          const textX = 100; // Adjust position slightly for horizontal alignment
          const textY = y + 4; // Center vertically relative to the bar

          ctx.fillText(labelText, textX, textY);
        }
      });
      ctx.restore();
    },
  };

  if (data.length === 0) {
    return (
      <span className="grid place-content-center h-full">
        <Alert variant="destructive" className="gap-0 mt-4 w-fit">
          <AlertCircle className="h-5 w-5 text-red-500 -mt-1.5" />
          <AlertDescription className="text-xs text-red-600 mt-1">
            No reviews to found.
          </AlertDescription>
        </Alert>
      </span>
    );
  }

  return (
    // <div className="">
    <div className="max-h-[400px] scrollbar-thin  scrollbar-thumb-slate-600 scrollbar-track-slate-300 rounded-md scrollbar-corner-transparent overflow-y-scroll">
      {/* Dynamically rendering criticality text with inline styles */}
      <p
        className={`rounded-md p-2 m-1 font-thin text-xs leading-loose  text-neutral-900 lg:text-slate-800 ${additionalInsights.color}`}
      >
        {additionalInsights.message}
      </p>

      <div
        style={{ width: "100%", height: `${chartHeight}px` }}
        className="-ml-2"
      >
        <Bar data={chartData} options={options} plugins={[customLabelPlugin]} />
      </div>
    </div>
  );
});

export default DocsPerUserChart;
