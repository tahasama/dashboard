import React from "react";
import { Chart } from "react-google-charts"; // Assuming you're using this chart library

// Extend the DocumentData interface to include optional "Review Status"
interface DocumentData {
  "Document No": string;
  "Planned Submission Date": string;
  "Submission Status": string;
  Title: string;
  "Review Status"?: string; // Make "Review Status" optional
}

interface WorkflowData {
  "Document No.": string;
  "Date In": string;
  "Date Completed": string;
  "Workflow Status": string;
}

interface MergedData {
  "Document Title": string;
  submissionStartDate: Date;
  submissionEndDate: Date;
  reviewStartDate: Date;
  reviewEndDate: Date;
  "Submission Status": string;
  "Review Status": string;
}

// interface LineTimeChartProps {
//   data: [DocumentData[], WorkflowData[]];
// }

const LineTimeChart: React.FC<any> = ({ data }) => {
  const [documentData, workflowData] = data;

  const parseDate = (dateString: string): Date | null => {
    const dateStr = String(dateString).trim(); // Ensure it is a string
    if (!isNaN(Number(dateStr)) && dateStr !== "") {
      // Ensure we check numeric conversion correctly
      const numericValue = parseInt(dateStr, 10);
      if (numericValue > 0) {
        const baseDate = new Date(1899, 11, 30); // Excel's base date
        return new Date(
          baseDate.getTime() + numericValue * 24 * 60 * 60 * 1000
        );
      }
    }

    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.log(`Invalid date string: ${dateString}`);
      return null; // Return null for invalid date strings
    }
    return date;
  };

  const filteredDocumentData = React.useMemo(
    () =>
      documentData.filter(
        (doc: any) => doc["Submission Status"] !== "Canceled"
      ),
    [documentData]
  );

  const filteredWorkflowData = React.useMemo(
    () =>
      workflowData.filter((wf: any) => wf["Workflow Status"] !== "Terminated"),
    [workflowData]
  );

  const mergedData = React.useMemo(() => {
    return filteredDocumentData
      .map((doc: any) => {
        const workflow = filteredWorkflowData.find(
          (wf: any) => wf["Document No."] === doc["Document No"]
        );

        if (!workflow || !workflow["Date In"]) {
          return null; // Exclude entries with empty "Date In"
        }

        const plannedSubmissionDate = parseDate(doc["Planned Submission Date"]);
        const workflowDateIn = parseDate(workflow["Date In"]);

        // Use workflowDateIn if it's earlier than plannedSubmissionDate
        let submissionStartDate =
          plannedSubmissionDate &&
          workflowDateIn &&
          workflowDateIn < plannedSubmissionDate
            ? workflowDateIn
            : plannedSubmissionDate;

        if (!submissionStartDate) {
          return null; // Exclude entries with invalid submissionStartDate
        }

        // Calculate submissionEndDate
        const submissionEndDate = workflowDateIn || new Date();

        // Ensure submissionStartDate <= submissionEndDate
        if (submissionStartDate > submissionEndDate) {
          submissionStartDate = submissionEndDate;
        }

        // Calculate reviewStartDate
        const reviewStartDate = new Date(submissionEndDate);
        reviewStartDate.setDate(reviewStartDate.getDate() + 1);

        // Calculate reviewEndDate
        const workflowDateCompleted = parseDate(workflow["Date Completed"]);
        const reviewEndDate = workflowDateCompleted || new Date();

        // Ensure reviewStartDate <= reviewEndDate
        if (reviewStartDate > reviewEndDate) {
          reviewStartDate.setTime(reviewEndDate.getTime());
        }

        return {
          "Document Title": doc["Title"],
          submissionStartDate,
          submissionEndDate,
          reviewStartDate,
          reviewEndDate,
          "Submission Status": doc["Submission Status"],
          "Review Status": doc["Review Status"] || "Approved", // Default to "Approved"
        };
      })
      .filter((item: any) => item !== null);
  }, [filteredDocumentData, filteredWorkflowData]);

  if (mergedData.length === 0) {
    return <div>No matching data found for Gantt Chart.</div>;
  }

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  const rows = mergedData
    .map((doc: any) => {
      const {
        submissionStartDate,
        submissionEndDate,
        reviewStartDate,
        reviewEndDate,
        "Document Title": title,
        "Submission Status": submissionStatus,
        "Review Status": ReviewStatus,
      } = doc;

      submissionStartDate.setHours(0, 0, 0, 0);
      submissionEndDate.setHours(0, 0, 0, 0);
      reviewStartDate.setHours(0, 0, 0, 0);
      reviewEndDate.setHours(0, 0, 0, 0);

      const formattedSubmissionStart = formatDate(submissionStartDate);
      const formattedSubmissionEnd = formatDate(submissionEndDate);
      const formattedReviewStart = formatDate(reviewStartDate);
      const formattedReviewEnd = formatDate(reviewEndDate);

      const rows = [
        [
          title,
          `Submission: ${formattedSubmissionStart} - ${formattedSubmissionEnd} ${submissionStatus}`,
          submissionStartDate,
          submissionEndDate,
        ],
      ];

      rows.push([
        title,
        `Review: ${formattedReviewStart} - ${formattedReviewEnd} ${
          ReviewStatus.startsWith("C") ? ReviewStatus.slice(0, 2) : ReviewStatus
        }`,
        reviewStartDate,
        reviewEndDate,
      ]);

      return rows;
    })
    .flat();

  const options = {
    timeline: {
      showRowLabels: true,
      rowLabelStyle: {
        fontSize: 11,
        color: "#191919",
        width: 20,
        whiteSpace: "normal",
      },
      barLabelStyle: { fontSize: 11 },
      groupByRowLabel: true,
    },
    hAxis: {
      format: "MMM dd, yyyy",
      textStyle: {
        color: "#4A90E2",
        fontSize: 14,
        fontName: "Arial",
        bold: true,
      },
    },
    colors: ["#A7C7E7", "#C4E5D1"],
    tooltip: { isHtml: true },
  };

  const handleChartClick = (e: any) => {
    const chart = e.chartWrapper.getChart();
    const selection = chart.getSelection();
    if (selection.length > 0) {
      const selectedRow = selection[0].row;
      const selectedDoc = mergedData[selectedRow];
      console.log("🚀 ~ handleChartClick ~ selectedDoc:", selectedDoc);
    }
  };

  return (
    <div>
      <h1>Gantt Chart</h1>
      <Chart
        chartType="Timeline"
        width="100%"
        height="400px"
        rows={rows}
        columns={[
          { type: "string" },
          { type: "string" },
          { type: "date" },
          { type: "date" },
        ]}
        options={options}
        chartEvents={[
          {
            eventName: "select",
            callback: handleChartClick,
          },
        ]}
      />
    </div>
  );
};

export default LineTimeChart;
