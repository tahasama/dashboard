"use client";
import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import { FixedSizeList as List } from "react-window";
import Chart from "react-google-charts";
import { debounce } from "lodash";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useFilters } from "./FiltersProvider";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MergedData } from "./types";
import PaginationX from "./PaginationX";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "./hooks";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

const LineTimeChart: React.FC<{ data: MergedData[] }> = memo(() => {
  const { filtered, clearFilters } = useFilters();

  // Filter and deduplicate by documentNo
  const uniqueData = useMemo(
    () => [
      ...new Set(
        filtered
          .filter(
            (x: MergedData) =>
              x.submissionStatus !== "Canceled" &&
              // x.reviewStatus !== "Terminated" &&
              x.stepStatus !== "Terminated"
          )
          .map((x: MergedData) => x.documentNo) // Extract unique documentNo
      ),
    ],
    [filtered]
  );

  const [rows, setRows] = useState<any[][]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(200);

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    []
  );

  useEffect(() => {
    setCurrentPage(0); // Reset to the first page when filters change
  }, [filtered]);

  const paginatedRows = useMemo(() => {
    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return uniqueData.slice(startIndex, endIndex).map((docNo) => {
      const item = filtered.find((x) => x.documentNo === docNo);
      if (!item) return null;

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

      if (submissionStatus === "Canceled") {
        return null;
      }

      const rowSet = [
        [
          title,
          `Submission: ${formattedSubmissionStart} - ${formattedSubmissionEnd} ${submissionStatus}`,
          validSubmissionStartDate,
          validSubmissionEndDate,
        ],
      ];

      if (validReviewStartDate && validReviewEndDate) {
        rowSet.push([
          title,
          `Review: ${formattedReviewStart} - ${formattedReviewEnd} ${
            reviewStatus || "Approved"
          }`,
          validReviewStartDate,
          validReviewEndDate,
        ]);
      }

      return rowSet;
    });
  }, [uniqueData, currentPage, filtered, rowsPerPage]);

  const updateRows = useCallback(() => {
    const flatRows: any[] = paginatedRows.flat().filter(Boolean);
    setRows(flatRows);
  }, [paginatedRows, filtered]);

  useEffect(() => {
    updateRows();
  }, [updateRows]);

  const handleSelectChange = useCallback((value: string) => {
    setCurrentPage(0);
    setRowsPerPage(Number(value));
  }, []);

  const options = {
    timeline: {
      groupByRowLabel: true,
      showRowLabels: true,
      rowLabelStyle: {
        fontName: "Arial",
        fontSize: 11,
        color: "#333",
      },
      barLabelStyle: { fontName: "Arial", fontSize: 10 },
      barHeight: 25,
    },
    colors: ["#63A8E6", "#84C3A3"],
  };

  if (!rows.length) {
    return (
      <span className="grid place-content-center h-[calc(100vh-90px)]">
        <Alert variant="destructive" className="gap-0 mt-4 w-fit">
          <AlertCircle className="h-5 w-5 text-red-500 -mt-1.5" />
          <AlertDescription className="text-xs text-red-600 mt-1">
            No matching data found for the Timeline.
          </AlertDescription>
        </Alert>
      </span>
    );
  }

  return (
    <div className="snap-start h-[calc(100vh-90px)] my-4 mx-2 lg:mx-10">
      <div className="flex lg:justify-between items-center mb-2 top-1.5 relative">
        <h1 className="w-1/3">Document&apos;s Timeline: {uniqueData.length}</h1>

        <div className="w-1/3 flex justify-center">
          <PaginationX
            currentPage={currentPage}
            totalPages={Math.ceil(uniqueData.length / rowsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
        <div className="w-1/3 flex items-center justify-end gap-2">
          <Label htmlFor="rowsPerPage" className="text-sm font-medium block">
            Rows per page
          </Label>

          <Select
            value={String(rowsPerPage)}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="w-fit px-2 h-8">
              <SelectValue placeholder="Select rows" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="250">250</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="relative">
        {filtered[0]?.dateCompleted === filtered[0]?.dateIn &&
          !filtered[0]?.plannedSubmissionDate && (
            <p className="absolute left-60 top-[0.99px] z-50 w-3/4 bg-sky-200 p-2 text-neutral-700 text-xs">
              This document was uploaded and reviewed on:{" "}
              {parseDate(filtered[0]?.dateCompleted)?.toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              ) || "Invalid Date"}
            </p>
          )}
        <List height={485} itemCount={1} itemSize={100} width="100%">
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
    </div>
  );
});

export default LineTimeChart;
