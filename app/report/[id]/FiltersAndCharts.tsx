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
import LineTimeChart from "@/app/LineTimeChart";
import { Data, MergedData } from "@/app/types";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { filterData } from "@/lib/utils";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

const FiltersAndCharts = ({ originalData }: { originalData: MergedData[] }) => {
  const [filteredData, setFilteredData] = useState<any[]>(originalData);
  const [loading, setLoading] = useState(false);

  const [createdByFilter, setCreatedByFilter] = useState<string>("");
  const [subProjectFilter, setSubProjectFilter] = useState<string>("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const clearFilters = () => {
    setLoading(true);
    setCreatedByFilter("all");
    setSubProjectFilter("all");
    setDisciplineFilter("all");
    setStatusFilter("all");
  };

  const filtered = useMemo(() => {
    return filterData(
      originalData,
      createdByFilter === "all" ? "" : createdByFilter,
      subProjectFilter === "all" ? "" : subProjectFilter,
      disciplineFilter === "all" ? "" : disciplineFilter,
      statusFilter === "all" ? "" : statusFilter
    );
  }, [
    createdByFilter,
    subProjectFilter,
    disciplineFilter,
    statusFilter,
    originalData,
  ]);

  const applyFilters = () => {
    filtered;
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
              <ResizablePanel defaultSize={33}>
                <Suspense fallback={"Loading..."}>
                  <ReviewStatus data={filteredData} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={34}>
                <Suspense fallback={"Loading..."}>
                  <SubmissionStatus data={filteredData} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={33}>
                <Suspense fallback={"Loading..."}>
                  <StatusChart data={filteredData} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={76}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={72}>
                <Suspense fallback={"Loading..."}>
                  <LateAnalysis data={filteredData} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={28}>
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
        <LineTimeChart data={filteredData} />
      </Suspense>
    </div>
  );
};

export default FiltersAndCharts;
