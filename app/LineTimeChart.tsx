"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { Chart } from "react-google-charts";
import { MergedData } from "./types";

const LineTimeChart: React.FC<any> = ({ data }) => {
  console.log(
    "🚀 ~ data0:",
    data.filter(
      (x: MergedData) =>
        x.submissionStatus !== "Canceled" && x.stepStatus !== "Terminated"
    ).length
  );
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

  const formatDate = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return ""; // Check if the date is valid
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
  const filteredOutDocuments: any[] = []; // To store the filtered-out documents

  const rows = data
    .filter(
      (x: MergedData) =>
        x.submissionStatus !== "Canceled" && x.stepStatus !== "Terminated"
    )
    .map((item: MergedData) => {
      const {
        title,
        plannedSubmissionDate,
        dateIn,
        dateCompleted,
        submissionStatus,
        reviewStatus,
      } = item;

      // Parse dates
      const submissionEndDate = parseDate(dateIn); // Can be null or undefined
      const reviewStartDate = submissionEndDate
        ? new Date(submissionEndDate.getTime() + 24 * 60 * 60 * 1000)
        : null;
      const reviewEndDate = parseDate(dateCompleted);

      let validSubmissionStartDate =
        parseDate(plannedSubmissionDate) || new Date(); // Default to today's date if null
      let validSubmissionEndDate = submissionEndDate || new Date(); // Default to today's date if null
      let validReviewStartDate = reviewStartDate || new Date();
      let validReviewEndDate = reviewEndDate || new Date();

      // Check if plannedSubmissionDate > today's date
      if (plannedSubmissionDate && validSubmissionStartDate > new Date()) {
        // If plannedSubmissionDate is greater than today's date, use it for all four dates
        validSubmissionStartDate =
          validSubmissionEndDate =
          validReviewStartDate =
          validReviewEndDate =
            validSubmissionStartDate;
      } else {
        // Otherwise, use plannedSubmissionDate for submissionStartDate and today's date for the other three dates
        if (!validSubmissionEndDate) validSubmissionEndDate = new Date();
        if (!validReviewStartDate) validReviewStartDate = new Date();
        if (!validReviewEndDate) validReviewEndDate = new Date();
      }

      // Adjust submissionStartDate to not exceed submissionEndDate
      if (validSubmissionStartDate > validSubmissionEndDate) {
        validSubmissionStartDate = validSubmissionEndDate;
      }

      // Adjust reviewStartDate to not exceed reviewEndDate
      if (validReviewStartDate > validReviewEndDate) {
        validReviewStartDate = validReviewEndDate;
      }

      // Format the dates for display
      const formattedSubmissionStart = formatDate(validSubmissionStartDate);
      const formattedSubmissionEnd = formatDate(validSubmissionEndDate);
      const formattedReviewStart = formatDate(validReviewStartDate);
      const formattedReviewEnd = formatDate(validReviewEndDate);

      const rowsToReturn = [
        [
          title,
          `Submission: ${formattedSubmissionStart} - ${formattedSubmissionEnd} ${submissionStatus}`,
          validSubmissionStartDate, // Use the adjusted start date
          validSubmissionEndDate,
        ],
      ];

      // Only include review if valid dates are available
      if (validReviewStartDate && validReviewEndDate) {
        rowsToReturn.push([
          title,
          `Review: ${formattedReviewStart} - ${formattedReviewEnd} ${
            reviewStatus || "Approved"
          }`,
          validReviewStartDate,
          validReviewEndDate,
        ]);
      }

      return rowsToReturn;
    })
    .flat()
    .filter((row: any) => {
      const isValid = row.length > 0;
      if (!isValid) {
        // Capture the filtered-out rows here
        filteredOutDocuments.push(row);
      }
      return isValid;
    });

  console.log("Filtered out documents:", filteredOutDocuments);

  const options = {
    timeline: {
      groupByRowLabel: true,
      rowLabelStyle: {
        fontName: "Arial",
        fontSize: 12,
        color: "#282a30",
      },
      barLabelStyle: { fontName: "Arial", fontSize: 10 },
    },
    colors: ["#A7C7E7", "#C4E5D1"],
  };

  if (data.length === 0) {
    return (
      <span className="grid place-content-center h-[calc(100vh-90px)]">
        <Alert variant="destructive" className="gap-0 mt-4 w-fit">
          <AlertCircle className="h-5 w-5 text-red-500 -mt-1.5" />
          <AlertDescription className="text-xs text-red-600 mt-1">
            No matching data found for the Time Line.
          </AlertDescription>
        </Alert>
      </span>
    );
  }

  return (
    <div className="snap-start h-[calc(100vh-90px)] my-4 mx-10">
      <h1 className="mb-2">
        Document&apos;s Time Line: {rows.length / 2} result.
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
