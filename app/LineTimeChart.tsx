"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import Chart from "react-google-charts";
import { debounce } from "lodash";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MergedData {
  title: string;
  plannedSubmissionDate: string;
  dateIn: string;
  dateCompleted: string;
  submissionStatus: string;
  reviewStatus: string;
  stepStatus: string;
}

const LineTimeChart: React.FC<{ data: MergedData[] }> = ({ data }) => {
  const [rows, setRows] = useState<any[][]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag for initial load

  // Function to parse date
  const parseDate = (dateString: any): Date | null => {
    const excelBaseDate = new Date(1899, 11, 30).getTime();
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

  // Function to format date
  const formatDate = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return "";
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

  // Optimized data update
  const updateRows = useCallback(
    debounce((data: MergedData[]) => {
      const newRows: any[] = [];

      data.forEach((item) => {
        const {
          title,
          plannedSubmissionDate,
          dateIn,
          dateCompleted,
          submissionStatus,
          reviewStatus,
        } = item;

        const submissionEndDate = parseDate(dateIn);
        const reviewStartDate = submissionEndDate
          ? new Date(submissionEndDate.getTime() + 24 * 60 * 60 * 1000)
          : null;
        const reviewEndDate = parseDate(dateCompleted);

        let validSubmissionStartDate =
          parseDate(plannedSubmissionDate) || new Date();
        let validSubmissionEndDate = submissionEndDate || new Date();
        let validReviewStartDate = reviewStartDate || new Date();
        let validReviewEndDate = reviewEndDate || new Date();

        if (plannedSubmissionDate && validSubmissionStartDate > new Date()) {
          validSubmissionStartDate =
            validSubmissionEndDate =
            validReviewStartDate =
            validReviewEndDate =
              validSubmissionStartDate;
        }

        if (validSubmissionStartDate > validSubmissionEndDate) {
          validSubmissionStartDate = validSubmissionEndDate;
        }
        if (validReviewStartDate > validReviewEndDate) {
          validReviewStartDate = validReviewEndDate;
        }

        const formattedSubmissionStart = formatDate(validSubmissionStartDate);
        const formattedSubmissionEnd = formatDate(validSubmissionEndDate);
        const formattedReviewStart = formatDate(validReviewStartDate);
        const formattedReviewEnd = formatDate(validReviewEndDate);

        // Skip rows where submissionStatus is "Canceled"
        if (submissionStatus === "Canceled") {
          return;
        }

        // Add submission row
        newRows.push([
          title,
          `Submission: ${formattedSubmissionStart} - ${formattedSubmissionEnd} ${submissionStatus}`,
          validSubmissionStartDate,
          validSubmissionEndDate,
        ]);

        // Add review row only if validReviewStartDate and validReviewEndDate exist
        if (validReviewStartDate && validReviewEndDate) {
          newRows.push([
            title,
            `Review: ${formattedReviewStart} - ${formattedReviewEnd} ${
              reviewStatus || "Approved"
            }`,
            validReviewStartDate,
            validReviewEndDate,
          ]);
        }
      });

      setRows(newRows);
      setIsInitialLoad(false); // Mark as not initial load anymore after first render
    }, 300),
    []
  );

  useEffect(() => {
    if (isInitialLoad) {
      // Immediate update for the first load (without debounce)
      const newRows: any[] = [];
      data.forEach((item) => {
        const {
          title,
          plannedSubmissionDate,
          dateIn,
          dateCompleted,
          submissionStatus,
          reviewStatus,
        } = item;
        const submissionEndDate = parseDate(dateIn);
        const reviewStartDate = submissionEndDate
          ? new Date(submissionEndDate.getTime() + 24 * 60 * 60 * 1000)
          : null;
        const reviewEndDate = parseDate(dateCompleted);

        let validSubmissionStartDate =
          parseDate(plannedSubmissionDate) || new Date();
        let validSubmissionEndDate = submissionEndDate || new Date();
        let validReviewStartDate = reviewStartDate || new Date();
        let validReviewEndDate = reviewEndDate || new Date();

        if (plannedSubmissionDate && validSubmissionStartDate > new Date()) {
          validSubmissionStartDate =
            validSubmissionEndDate =
            validReviewStartDate =
            validReviewEndDate =
              validSubmissionStartDate;
        }

        if (validSubmissionStartDate > validSubmissionEndDate) {
          validSubmissionStartDate = validSubmissionEndDate;
        }
        if (validReviewStartDate > validReviewEndDate) {
          validReviewStartDate = validReviewEndDate;
        }

        const formattedSubmissionStart = formatDate(validSubmissionStartDate);
        const formattedSubmissionEnd = formatDate(validSubmissionEndDate);
        const formattedReviewStart = formatDate(validReviewStartDate);
        const formattedReviewEnd = formatDate(validReviewEndDate);

        // Skip rows where submissionStatus is "Canceled"
        if (submissionStatus === "Canceled") {
          return;
        }

        // Add submission row
        newRows.push([
          title,
          `Submission: ${formattedSubmissionStart} - ${formattedSubmissionEnd} ${submissionStatus}`,
          validSubmissionStartDate,
          validSubmissionEndDate,
        ]);

        // Add review row only if validReviewStartDate and validReviewEndDate exist
        if (validReviewStartDate && validReviewEndDate) {
          newRows.push([
            title,
            `Review: ${formattedReviewStart} - ${formattedReviewEnd} ${
              reviewStatus || "Approved"
            }`,
            validReviewStartDate,
            validReviewEndDate,
          ]);
        }
      });
      setRows(newRows);
    } else {
      updateRows(data); // Continue debouncing after the first load
    }

    return () => updateRows.cancel();
  }, [data, updateRows, isInitialLoad]);

  // Chart options memoized for performance
  const options = useMemo(
    () => ({
      timeline: {
        groupByRowLabel: true,
        showRowLabels: true,
        rowLabelStyle: {
          fontName: "Arial",
          fontSize: 11.5,
          color: "#222",
        },
        barLabelStyle: { fontName: "Arial", fontSize: 10 },
        barHeight: 25,
      },
      // colors: ["#1E88E5", "#43A047"],
      // colors: ["#A7C7E7", "#C4E5D1"],
      colors: ["#63A8E6", "#84C3A3"],
    }),
    []
  );

  if (rows.length === 0) {
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
        Document&apos;s Time Line: {rows.length / 2} results.
      </h1>
      <List height={480} itemCount={1} itemSize={400} width={"100%"}>
        {() => (
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
            height="470px"
          />
        )}
      </List>
    </div>
  );
};
export default LineTimeChart;
