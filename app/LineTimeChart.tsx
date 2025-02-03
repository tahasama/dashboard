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
import { getStatusColor, parseDates } from "@/lib/utils";
import { statusColorMap, statusPrefixMap } from "./colors";

import {
  DateHeader,
  SidebarHeader,
  Timeline,
  TimelineHeaders,
} from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import { stringify } from "querystring";
import Legend from "./TimeLineLegend";

const LineTimeChart: React.FC<{ data: MergedData[] }> = memo(() => {
  const { filtered } = useFilters(); // Get filtered data
  const { currentPage, setCurrentPage, rowsPerPage, setRowsPerPage } =
    usePagination();
  const timelineRef = useRef<Timeline | null>(null);

  const [loading, setLoading] = useState(true); // ✅ New loading state

  const [timelineItems, setTimelineItems] = useState([]);
  const [timelineGroups, setTimelineGroups] = useState([]);
  const [defaultTimeStart, setDefaultTimeStart] = useState<any>(null); // Change to Date or null
  const [defaultTimeEnd, setDefaultTimeEnd] = useState<any>(null); // Change to Date or null

  // Total unique documents
  const totalDocs = useMemo(
    () =>
      filtered.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.documentNo === value.documentNo)
      ),
    [filtered]
  );

  // Initialize/update timeline
  useEffect(() => {
    if (typeof window !== "undefined") {
      const worker = new Worker("/timelineWorker.js");

      worker.onmessage = (event) => {
        const { items, groups } = event.data;

        setTimelineItems(items); // ✅ Update state

        setTimelineGroups(groups); // ✅ Update state

        // Log to check start_time and end_time values
        const allDates = filtered
          .flatMap(({ plannedSubmissionDate, dateIn, dateCompleted }: any) => {
            return [
              parseDates(plannedSubmissionDate),
              parseDates(dateIn),
              parseDates(dateCompleted),
            ];
          })
          .filter((date) => date !== null);

        // Only update defaultTimeStart and defaultTimeEnd when items are loaded
        if (allDates.length) {
          const minDate = new Date(
            Math.min(...allDates.map((date: any) => new Date(date).getTime()))
          );
          const maxDate = new Date(
            Math.max(...allDates.map((date: any) => new Date(date).getTime()))
          );

          // Update the state with the calculated min/max date range
          setDefaultTimeStart(minDate);
          setDefaultTimeEnd(maxDate);
        }
      };

      setLoading(false); // ✅ Done loading

      worker.postMessage({
        filtered,
        currentPage,
        rowsPerPage,
      });

      return () => {
        worker.terminate();
      };
    }
  }, [filtered, currentPage, rowsPerPage]); // Trigger only when filtered data, currentPage, or rowsPerPage change

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    []
  );
  const handleSelectChange = useCallback((value: string) => {
    setCurrentPage(0); // Reset to first page when rows per page changes
    setRowsPerPage(Number(value));
  }, []);

  if (!filtered.length) {
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
    <div className="snap-start h-[calc(100vh-90px)] my-5 mx-2 lg:mx-7 relative -top-1.5">
      <div className="gap-3 md:gap-0 flex justify-between items-center mb-2 top- relative">
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
      <Legend />

      {!loading && defaultTimeEnd !== null ? (
        <div className="h-[74vh] overflow-auto">
          <Timeline
            ref={timelineRef}
            groups={timelineGroups}
            items={timelineItems}
            defaultTimeStart={defaultTimeStart}
            defaultTimeEnd={defaultTimeEnd}
            canMove={true}
            canResize={false}
            stackItems={true}
            lineHeight={35}
            itemRenderer={({
              item,
              itemContext,
              getItemProps,
              getResizeProps,
            }) => {
              const itemProps = item.itemProps ? item.itemProps : {};
              const leftResizeProps: any = getResizeProps(item as any); // Get left resize props
              const rightResizeProps: any = getResizeProps(item as any); // Get right resize props
              return (
                <div {...getItemProps(itemProps)}>
                  {itemContext.useResizeHandle ? (
                    <div {...leftResizeProps} />
                  ) : (
                    ""
                  )}

                  <div
                    className="rct-item-content overflow-visible text-black h-fit text-xs grid place-content-center"
                    style={{
                      backgroundColor: getStatusColor(
                        String(item?.title)?.split("-")[1]
                      ),
                    }}
                  >
                    {itemContext.title}
                  </div>
                  {itemContext.useResizeHandle ? (
                    <div {...rightResizeProps} />
                  ) : (
                    ""
                  )}
                </div>
              );
            }}
          ></Timeline>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
});

export default LineTimeChart;
