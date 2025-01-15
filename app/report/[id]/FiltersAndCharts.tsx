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
import Filters from "@/app/Filters";
import { Data, MergedData } from "@/app/types";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { filterData } from "@/lib/utils";
import { lazy, Suspense, useEffect, useState } from "react";

const LazyLineTimeChart = lazy(() => import("../../LineTimeChart"));

const FiltersAndCharts = ({ originalData }: { originalData: MergedData[] }) => {
  const [filteredData, setFilteredData] = useState<MergedData[]>(originalData);
  const [loading, setLoading] = useState(false);

  const [createdByFilter, setCreatedByFilter] = useState<string>("all");
  const [subProjectFilter, setSubProjectFilter] = useState<string>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const clearFilters = () => {
    setLoading(true);
    setCreatedByFilter("all");
    setSubProjectFilter("all");
    setDisciplineFilter("all");
  };

  const applyFilters = () => {
    const filtered = filterData(
      originalData,
      createdByFilter === "all" ? "" : createdByFilter,
      subProjectFilter === "all" ? "" : subProjectFilter,
      disciplineFilter === "all" ? "" : disciplineFilter,
      statusFilter === "all" ? "" : statusFilter
    );
    console.log("🚀 ~ applyFilters ~ filtered:", filtered);
    setFilteredData(filtered);
    setLoading(false);
  };

  useEffect(() => {
    applyFilters();
  }, [createdByFilter, subProjectFilter, disciplineFilter, statusFilter]);

  return (
    <div>
      {/* Filters */}
      <Filters
        originalData={originalData}
        createdByFilter={createdByFilter}
        subProjectFilter={subProjectFilter}
        disciplineFilter={disciplineFilter}
        statusFilter={statusFilter}
        setCreatedByFilter={setCreatedByFilter}
        setSubProjectFilter={setSubProjectFilter}
        setDisciplineFilter={setDisciplineFilter}
        setStatusFilter={setStatusFilter}
        clearFilters={clearFilters}
      />
      {/* Supplier Documents Charts */}
      <div className="bg-slate- p-2 mx-1 rounded-md -mt-1 flex h-[calc(100vh-60px)] w- shadow-md">
        <ResizablePanelGroup direction="horizontal" className="">
          <ResizablePanel defaultSize={24}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel>
                <Suspense fallback={"Loading..."}>
                  <ReviewStatus data={filteredData} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"Loading..."}>
                  <SubmissionStatus data={filteredData} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"Loading..."}>
                  <StatusChart data={filteredData} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={72}>
                <Suspense fallback={"Loading..."}>
                  <LateAnalysis data={filteredData} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"Loading..."}>
                  <HeatX data={filteredData} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Workflow Charts */}
      <div className="bg-slate- p-2 mx-1 rounded-md mt-4 flex h-[calc(100vh-60px)] w- shadow-md">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={24}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60}>
                <Suspense fallback={"Loading..."}>
                  <DocsPerUserChart data={filteredData} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"Loading..."}>
                  <WorkflowStepStatusChart data={filteredData} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={72}>
                <Suspense fallback={"Loading..."}>
                  <LateAnalysisReview data={filteredData} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"Loading..."}>
                  <StatusOutcomeHeatMap data={filteredData} />
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
        <LazyLineTimeChart data={filteredData} />
      </Suspense>
    </div>
  );
};

export default FiltersAndCharts;
