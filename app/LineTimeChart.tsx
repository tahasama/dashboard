"use client";
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  memo,
  useRef,
} from "react";
import { FixedSizeList as List } from "react-window";
import Chart from "react-google-charts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useFilters } from "./FiltersProvider";
import { MergedData } from "./types";
import PaginationX from "./PaginationX";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "./PaginationProvider";

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

const LineTimeChart: React.FC<{ data: MergedData[] }> = memo(() => {
  const { filtered } = useFilters(); // Get filtered data
  console.log(
    "🚀 ~ ~ filtered DMX:",
    filtered.filter((x) => x.documentNo === "QB230601-00-DM-DMX-00001")
  );
  // let bbb = [...new Set(xxx.filtered)];
  const { currentPage, setCurrentPage, rowsPerPage, setRowsPerPage } =
    usePagination();

  const [rows, setRows] = useState<any[][]>([]);
  console.log(
    "🚀 ~ constLineTimeChart:React.FC<{data:MergedData[]}>=memo ~ rows:",
    rows
  );

  const totalDocs = useMemo(
    () =>
      filtered.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.documentNo === value.documentNo)
      ),
    [filtered]
  );

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize the Web Worker
      workerRef.current = new Worker("/timelineWorker.js");

      // Listen for messages from the worker
      workerRef.current.onmessage = (event) => {
        const xxx = event.data;
        setRows(xxx.flat().filter((x: MergedData) => x !== null)); // Update rows with the filtered and paginated data
      };

      return () => {
        workerRef.current?.terminate();
      };
    }
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      // Send filtered data, currentPage, and rowsPerPage to the worker for processing
      workerRef.current.postMessage({
        filtered,
        currentPage,
        rowsPerPage,
      });
    }
  }, [filtered, currentPage, rowsPerPage]);

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    []
  );

  const handleSelectChange = useCallback((value: string) => {
    setCurrentPage(0); // Reset to first page when rows per page changes
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
      <div className="gap-3 md:gap-0 flex justify-between items-center mb-2 top-1.5 relative">
        <h1 className="md:w-1/3">
          Document&apos;s Timeline: {totalDocs.length}
        </h1>

        <div className="md:w-1/3 flex justify-center">
          <PaginationX
            currentPage={currentPage}
            totalPages={Math.ceil(totalDocs.length / rowsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>

        <div className="md:w-1/3 flex items-center justify-end gap-2">
          <Label
            htmlFor="rowsPerPage"
            className="text-xs md:text-sm font-medium block"
          >
            Rows per page
          </Label>

          <Select
            value={String(rowsPerPage)}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="w-fit px-2 h-8">
              <SelectValue placeholder="Select rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="150">150</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="350">250</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="relative">
        {/* {filtered[0]?.dateCompleted === filtered[0]?.dateIn &&
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
          )} */}
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
