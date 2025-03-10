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
import { filter } from "lodash";
import { ScrollArea } from "@/components/ui/scroll-area";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DocsPerUserChart: React.FC<Data> = memo(({ data }) => {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: "Overdue",
        backgroundColor: "#ff4669", // Red for Overdue eb5b79 ed5574 eb4d6d de4765 EE204D #FF004F
        borderColor: "#ff4669",
        borderWidth: 1,
        data: [] as number[],
        barThickness: 16, // Controls bar height
      },
      {
        label: "Current",
        backgroundColor: "#b9edc1", // Green for Current
        borderColor: "#76db84",
        borderWidth: 1,
        data: [] as number[],
        barThickness: 16, // Controls bar height
      },
    ],
  });

  const [chartHeight, setChartHeight] = useState(180); // Start with a default height

  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsPhone(window.innerWidth < 1024);
    };

    // Run on mount & listen for resizes
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [additionalInsights, setAdditionalInsights] = useState({
    color: "bg-teal-100 ring-teal-400/90",
    message:
      "Recent workflows demonstrate efficient review processes, and indicates steady progress.",
  });

  useEffect(() => {
    const userDocCount: {
      [key: string]: { overdue: number; current: number };
    } = {};
    const userDocTracker: { [key: string]: Set<string> } = {};

    data.forEach((row: MergedData) => {
      const user = row.assignedTo ?? "";
      const status = row.stepStatus;
      const documentNo = row.documentNo;

      if (!userDocCount[user]) {
        userDocCount[user] = { overdue: 0, current: 0 };
      }

      if (!userDocTracker[user]) {
        userDocTracker[user] = new Set();
      }

      // 🔥 Ensure unique documents per user, not across all users
      if (!userDocTracker[user].has(documentNo)) {
        // Track unique documents per user
        if (status === "Overdue") {
          userDocCount[user].overdue += 1;
        } else if (status === "Current") {
          userDocCount[user].current += 1;
        }
      }
    });

    // Remove users with no documents
    const filteredUserDocCount = Object.entries(userDocCount).filter(
      ([, count]) => count.overdue > 0 || count.current > 0
    );

    const labels = filteredUserDocCount.map(([user]) => user);
    const overdueValues = filteredUserDocCount.map(
      ([, count]) => count.overdue
    );
    const currentValues = filteredUserDocCount.map(
      ([, count]) => count.current
    );

    setChartData((prev) => ({
      ...prev,
      labels,
      datasets: [
        { ...prev.datasets[0], data: overdueValues },
        { ...prev.datasets[1], data: currentValues },
      ],
    }));

    setChartHeight(
      labels.length >= 3 ? labels.length * 45 : isPhone ? 100 : 180
    );

    // Calculate the total number of overdue documents
    const totalOverdue = overdueValues.reduce((sum, value) => sum + value, 0);

    // Update additional insights based on the overdue documents
    if (totalOverdue > 100) {
      setAdditionalInsights({
        color: "bg-red-100 ring-red-400/90",
        message: `🔴 Critical Issue: ${totalOverdue} overdue documents, indicating a significant review backlog.`,
      });
    } else if (totalOverdue > 0) {
      setAdditionalInsights({
        color: "bg-orange-100 ring-orange-400/90",
        message: `🟠 Warning: ${totalOverdue} overdue documents, indicating potential review delays.`,
      });
    } else {
      setAdditionalInsights({
        color: "bg-teal-100 ring-teal-400/90",
        message:
          "🟢 On Track: There are no overdue documents, indicating a smooth and efficient review process.",
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
            size: isPhone ? 0 : 10, // Adjust font size for X-axis
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
    <div className="h-full scrollbar-thin  scrollbar-thumb-slate-400  scrollbar-track-gray-100 rounded-md overflow-y-scroll">
      {/* // <ScrollArea className="h-full"> */}
      <p
        className={`rounded-md p-2 m-1 font-thin text-xs lg:leading-loose text-black lg:text-slate-800 ${additionalInsights.color}`}
      >
        {additionalInsights.message}
      </p>

      <div
        style={{ width: "100%", height: `${chartHeight}px` }}
        className="-ml-2"
      >
        <Bar data={chartData} options={options} plugins={[customLabelPlugin]} />
      </div>
      {/* </ScrollArea> */}
    </div>
  );
});

export default DocsPerUserChart;
