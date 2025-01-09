import React, { useState, useEffect, useMemo } from "react";
import { Chart } from "react-google-charts";

const LineTimeChart: React.FC<any> = ({ data, loading, setLoading }) => {
  const [mergedData, setMergedData] = useState<any[]>([]);

  const parseDate = useMemo(() => {
    const excelBaseDate = new Date(1899, 11, 30).getTime();

    return (dateString: any): Date | null => {
      if (typeof dateString !== "string" && dateString !== null) {
        dateString = String(dateString);
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
            const month = parseInt(parts[1], 10) - 1;
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

  useEffect(() => {
    // Process new data immediately when data changes
    setLoading(true);
    const [documentData, workflowData] = data;

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
          return null;
        }

        const plannedSubmissionDate = parseDate(doc["Planned Submission Date"]);
        const workflowDateIn = parseDate(workflow["Date In"]);

        let submissionStartDate =
          plannedSubmissionDate &&
          workflowDateIn &&
          workflowDateIn < plannedSubmissionDate
            ? workflowDateIn
            : plannedSubmissionDate;

        if (!submissionStartDate) {
          return null;
        }

        const submissionEndDate = workflowDateIn || new Date();

        if (submissionStartDate > submissionEndDate) {
          submissionStartDate = submissionEndDate;
        }

        const reviewStartDate = new Date(submissionEndDate);
        reviewStartDate.setDate(reviewStartDate.getDate() + 1);

        const workflowDateCompleted = parseDate(workflow["Date Completed"]);
        const reviewEndDate = workflowDateCompleted || new Date();

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
          "Review Status": doc["Review Status"] || "Approved",
        };
      })
      .filter((item: any) => item !== null);

    setMergedData(merged);
    setLoading(false);
  }, [data, parseDate, setLoading]);

  if (loading) {
    return (
      <div className="w-screen h-screen grid place-content-center">
        Loading Time Line data...
      </div>
    );
  }

  if (mergedData.length === 0) {
    return (
      <div className="w-screen h-screen grid place-content-center">
        No matching data found for the Time Line.
      </div>
    );
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
    <div className="snap-start h-[calc(100vh-90px)] my-4 mx-10">
      <h1 className="mb-2">
        Document's Time Line: {mergedData.length} result.
      </h1>
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
        height="100%"
      />
    </div>
  );
};

export default LineTimeChart;
