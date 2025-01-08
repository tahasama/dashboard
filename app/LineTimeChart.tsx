import React, { useState, useEffect, useMemo } from "react";
import { Chart } from "react-google-charts";

const LineTimeChart: React.FC<any> = ({ data, loading, setLoading }) => {
  const [documentData, workflowData] = data;
  const [mergedData, setMergedData] = useState<any[]>([]);

  // Function to parse dates
  const parseDate = useMemo(() => {
    const excelBaseDate = new Date(1899, 11, 30).getTime();

    return (dateString: any): Date | null => {
      if (typeof dateString !== "string" && dateString !== null) {
        dateString = String(dateString); // Convert non-string values to string
      }

      if (typeof dateString === "string") {
        const trimmedDate = dateString.trim();
        const excelNumber = Number(trimmedDate);
        if (!isNaN(excelNumber) && excelNumber > 0) {
          return new Date(excelBaseDate + excelNumber * 24 * 60 * 60 * 1000);
        }

        if (trimmedDate.includes("/")) {
          const parts = trimmedDate.split("/");
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
            const year = parseInt(parts[2], 10);
            const parsedDate = new Date(year, month, day);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          }
        }

        const date = new Date(trimmedDate);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      return null;
    };
  }, []);

  // Delayed processing of merged data
  useEffect(() => {
    // setLoading(true); // Start loading
    if (loading) {
      const delay = setTimeout(() => {
        const filteredDocumentData = documentData.filter(
          (doc: any) => doc["Submission Status"] !== "Canceled"
        );

        const filteredWorkflowData = workflowData.filter(
          (wf: any) => wf["Workflow Status"] !== "Terminated"
        );

        const merged = filteredDocumentData
          .map((doc: any) => {
            const workflow = filteredWorkflowData.find(
              (wf: any) => wf["Document No."] === doc["Document No"]
            );

            if (!workflow || !workflow["Date In"]) {
              return null; // Exclude entries with empty "Date In"
            }

            const plannedSubmissionDate = parseDate(
              doc["Planned Submission Date"]
            );
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

        setMergedData(merged);
        setLoading(false); // Stop loading
      }, 5000); // 5-second delay
      return () => clearTimeout(delay); // Clear timeout on unmount or data change
    }
  }, [documentData, workflowData, parseDate, loading]);

  if (loading) {
    return <div>Loading Gantt Chart data...</div>;
  }

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

      const formattedSubmissionStart = formatDate(submissionStartDate);
      const formattedSubmissionEnd = formatDate(submissionEndDate);
      const formattedReviewStart = formatDate(reviewStartDate);
      const formattedReviewEnd = formatDate(reviewEndDate);

      return [
        [
          title,
          `Submission: ${formattedSubmissionStart} - ${formattedSubmissionEnd} ${submissionStatus}`,
          submissionStartDate,
          submissionEndDate,
        ],
        [
          title,
          `Review: ${formattedReviewStart} - ${formattedReviewEnd} ${ReviewStatus}`,
          reviewStartDate,
          reviewEndDate,
        ],
      ];
    })
    .flat();

  const options = {
    timeline: {
      groupByRowLabel: true,
    },
    colors: ["#A7C7E7", "#C4E5D1"],
  };

  return (
    <div>
      <h1>Gantt Chart</h1>
      <Chart
        chartType="Timeline"
        rows={rows}
        columns={[
          { type: "string" },
          { type: "string" },
          { type: "date" },
          { type: "date" },
        ]}
        options={options}
        width="100%"
        height="400px"
      />
    </div>
  );
};

export default LineTimeChart;
