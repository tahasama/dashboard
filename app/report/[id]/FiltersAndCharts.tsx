"use client";

import HeatX from "@/app/(supplier)/HeatX";
import LateAnalysis from "@/app/(supplier)/LateAnalysis";
import ReviewStatus from "@/app/(supplier)/ReviewStatus";
import StatusChart from "@/app/(supplier)/StatusChart";
import SubmissionStatus from "@/app/(supplier)/SubmissionStatus";
import DocsPerUserChart from "@/app/(workflow)/DocsPerUserChart";
import LateAnalysisReview from "@/app/(workflow)/LateAnalysisReview";
import StatusOutcomeHeatMap from "@/app/(workflow)/StepStatusOutcomeChart";
import WorkflowStepStatusChart from "@/app/(workflow)/WorkflowStepStatusChart";
import { useFilters } from "@/app/FiltersProvider";
import { PaginationProvider, usePagination } from "@/app/PaginationProvider";
import { Data, MergedData } from "@/app/types";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { filterData } from "@/lib/utils";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
const LineTimeChart = lazy(() => import("../../LineTimeChart"));

const FiltersAndCharts = () => {
  const { filtered } = useFilters();

  const { setCurrentPage } = usePagination();

  useEffect(() => {
    setCurrentPage(0);
  }, [filtered, setCurrentPage]);

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="bg-slate- p-2 mx-1 rounded-md mt-4 flex h-[120vh] lg:h-[calc(100vh-60px)] w- shadow-md">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={24}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={33}>
                <Suspense fallback={"Loading..."}>
                  <ReviewStatus data={filtered} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={34}>
                <Suspense fallback={"Loading..."}>
                  <SubmissionStatus data={filtered} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={33}>
                <Suspense fallback={"Loading..."}>
                  <StatusChart data={filtered} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={76}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={71}>
                <Suspense fallback={"Loading..."}>
                  <LateAnalysis data={filtered} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={29}>
                <Suspense fallback={"Loading..."}>
                  <HeatX data={filtered} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Workflow Charts */}
      <div className="bg-slate- p-2 mx-1 rounded-md mt-4 flex h-[120vh] lg:h-[calc(100vh-60px)] w- shadow-md">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={24}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60}>
                <Suspense fallback={"Loading..."}>
                  <DocsPerUserChart data={filtered} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40}>
                {" "}
                {/* Explicit defaultSize added */}
                <Suspense fallback={"Loading..."}>
                  <WorkflowStepStatusChart data={filtered} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={76}>
            {" "}
            {/* Explicit defaultSize added */}
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={72}>
                <Suspense fallback={"Loading..."}>
                  <LateAnalysisReview data={filtered} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={28}>
                {" "}
                {/* Explicit defaultSize added */}
                <Suspense fallback={"Loading..."}>
                  <StatusOutcomeHeatMap data={filtered} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Line Time Chart */}
      <Suspense
        fallback={
          <div className="w-screen h-screen grid place-content-center">
            Loading LineTimeChart...
          </div>
        }
      >
        <LineTimeChart data={filtered} />
      </Suspense>
    </div>
  );
};

export default FiltersAndCharts;
