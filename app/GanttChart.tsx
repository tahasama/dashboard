import React, { useState } from "react";
import { Chart } from "react-google-charts";

const GanttChart = ({ data }) => {
  const [documentData, workflowData] = data;

  // Helper function to validate and parse date
  const parseDate = (dateString) => {
    const dateStr = String(dateString).trim();
    if (!isNaN(dateStr) && dateStr !== "") {
      const numericValue = parseInt(dateStr, 10);
      if (numericValue > 0) {
        const baseDate = new Date(1899, 11, 30);
        return new Date(
          baseDate.getTime() + numericValue * 24 * 60 * 60 * 1000
        );
      }
    }
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const mergedData = documentData
    .map((doc) => {
      const workflow = workflowData.find(
        (wf) => wf["Document No."] === doc["Document No"]
      );
      const plannedSubmissionDate = parseDate(doc["Planned Submission Date"]);
      if (workflow && workflow["Date Completed"] && plannedSubmissionDate) {
        return {
          "Document Title": doc["Title"],
          "Planned Submission Date": plannedSubmissionDate,
          "Document Days Late": parseInt(doc["Days Late"], 10) || 0,
          "Workflow Days Late": parseInt(workflow["Days Late"], 10) || 0,
          "Original Due Date": parseDate(workflow["Original Due Date"]),
          "Date Completed": parseDate(workflow["Date Completed"]),
        };
      }
      return null;
    })
    .filter((item) => item !== null);

  if (mergedData.length === 0) {
    return <div>No matching data found for Gantt Chart.</div>;
  }

  // Prepare rows for the Gantt chart from mergedData
  const rows = mergedData
    .map((doc) => {
      const submissionStartDate = doc["Planned Submission Date"];

      // Add 'Document Days Late' to calculate the submission end date
      const submissionEndDate = new Date(submissionStartDate);
      submissionEndDate.setDate(
        submissionEndDate.getDate() + doc["Document Days Late"]
      );

      // Define review start and end dates using 'Workflow Days Late'
      const reviewStartDate = new Date(submissionEndDate);
      reviewStartDate.setDate(reviewStartDate.getDate() + 1);
      const reviewEndDate = new Date(reviewStartDate);
      reviewEndDate.setDate(
        reviewStartDate.getDate() + doc["Workflow Days Late"]
      );

      submissionStartDate.setHours(0, 0, 0, 0);
      submissionEndDate.setHours(0, 0, 0, 0);
      reviewStartDate.setHours(0, 0, 0, 0);
      reviewEndDate.setHours(0, 0, 0, 0);

      return [
        [
          doc["Document Title"],
          "submission",
          submissionStartDate,
          submissionEndDate,
        ],
        [doc["Document Title"], "review", reviewStartDate, reviewEndDate],
      ];
    })
    .flat()
    .filter((row) => row.length > 0);

  const options = {
    timeline: {
      showRowLabels: true,
      rowLabelStyle: { fontSize: 14, color: "black" },
      barLabelStyle: { fontSize: 12 },
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
          { type: "string", label: "Task" },
          { type: "string", label: "Document" },
          { type: "date", label: "Start Date" },
          { type: "date", label: "End Date" },
        ]}
        options={options}
      />
    </div>
  );
};

export default GanttChart;
