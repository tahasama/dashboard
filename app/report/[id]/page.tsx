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
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import React from "react";
import { Suspense } from "react";

const LazyLineTimeChart = React.lazy(() => import("../../LineTimeChart"));

async function getProjectData(projectNumber: string) {
  const response = await fetch(
    `http://localhost:3000/api/projects/${projectNumber}`,
    {
      cache: "no-store", // Disable caching for dynamic data
    }
  );

  if (!response.ok) {
    return null; // Handle not-found case
  }

  return response.json();
}

const Report = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { data } = await getProjectData(id);

  //   const data: string | any[] = [];
  return (
    <div className="relative -mt-2">
      {/* <Filters /> */}

      {/* Supplier Documents Charts */}

      <div className="bg-slate- p-2 mx-1 rounded-md -mt-1 flex h-[calc(100vh-60px)] w- shadow-md">
        <ResizablePanelGroup direction="horizontal" className="">
          <ResizablePanel defaultSize={24}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel>
                <Suspense fallback={"wa tta tsenna yaaa"}>
                  <ReviewStatus data={data} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"wa tta tsenna yaaa"}>
                  <SubmissionStatus data={data} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"wa tta tsenna yaaa"}>
                  <StatusChart data={data} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={72}>
                <Suspense fallback={"wa tta tsenna yaaa"}>
                  <LateAnalysis data={data} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"wa tta tsenna yaaa"}>
                  <HeatX data={data} />
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
                <Suspense fallback={"wa tta tsenna yaaa"}>
                  <DocsPerUserChart data={data} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"wa tta tsenna yaaa"}>
                  <WorkflowStepStatusChart data={data} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={72}>
                <Suspense fallback={"wa tta tsenna yaaa"}>
                  <LateAnalysisReview data={data} />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <Suspense fallback={"wa tta tsenna yaaa"}>
                  <StatusOutcomeHeatMap data={data} />
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
        <LazyLineTimeChart data={data} />
      </Suspense>
    </div>
  );
};

export default Report;
