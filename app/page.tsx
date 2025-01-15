"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, useState } from "react";
import StatusChart from "./(supplier)/StatusChart";
import LateAnalysis from "./(supplier)/LateAnalysis";
import SubmissionStatus from "./(supplier)/SubmissionStatus";
import StatusOutcomeHeatMap from "./(workflow)/StepStatusOutcomeChart";
import WorkflowStepStatusChart from "./(workflow)/WorkflowStepStatusChart";
import LateAnalysisReview from "./(workflow)/LateAnalysisReview";
// import LineTimeChart from "./LineTimeChart";
import ReviewStatus from "./(supplier)/ReviewStatus";
import HeatX from "./(supplier)/HeatX";
import DocsPerUserChart from "./(workflow)/DocsPerUserChart";
import ExcelForm from "./ExcelForm";

const LazyLineTimeChart = React.lazy(() => import("./LineTimeChart"));

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Filters from "./Filters";
import { AreaH } from "./HomePageCharts/AreaH";
import { BarH } from "./HomePageCharts/BarH";
import { PieH } from "./HomePageCharts/PieH";
import React from "react";

export default function Home() {
  return (
    <div className="">
      <div className="flex flex-col items-center h-screen">
        <h1 className="font-bold text-center mt-4 mb-4">
          Document Data Report Creator
        </h1>
        <h2 className="mt-4 mb-10">
          Create your reports, and generate insightful charts
        </h2>
        <ExcelForm />
        <div className="flex flex-col justify-center w-[75vw] items-center h-full">
          <div className="flex gap-4 w-full">
            <AreaH />
            <BarH />
            <PieH />
          </div>
        </div>
      </div>
    </div>
  );
}
