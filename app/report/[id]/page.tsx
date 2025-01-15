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
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import Link from "next/link";
import React from "react";
import { Suspense } from "react";
import FiltersAndCharts from "./FiltersAndCharts";

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

  const projectData = await getProjectData(id);

  if (!projectData) {
    return (
      <div className="w-screen h-screen grid place-content-center gap-6">
        <p>Project data not found. Please check the project ID.</p>
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    );
  }

  const { data } = projectData;

  //   const data: string | any[] = [];
  return (
    <div className="relative -mt-2">
      {/* <Filters /> */}
      <FiltersAndCharts originalData={data} />
    </div>
  );
};

export default Report;
