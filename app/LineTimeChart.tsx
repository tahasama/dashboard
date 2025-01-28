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

const LineTimeChart: React.FC<{ data: MergedData[] }> = memo(() => {
  const { filtered } = useFilters(); // Get filtered data

  const [rows, setRows] = useState<any[][]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);

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

  // Reset currentPage to 0 whenever filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filtered]);

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
          Document&apos;s Timeline: {filtered.length}
        </h1>

        <div className="md:w-1/3 flex justify-center">
          <PaginationX
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / rowsPerPage)}
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
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="300">300</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="relative">
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
