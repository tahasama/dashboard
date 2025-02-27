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
// import html2pdf from "html2pdf.js";
import { toBlob, toPng } from "html-to-image";
import download from "downloadjs";
import { ArrowDownUp, Download, Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
const LineTimeChart = lazy(() => import("../../LineTimeChart"));

type switchState = "vertical" | "horizontal";

const FiltersAndCharts = () => {
  const { filtered, contentRef, content2Ref } = useFilters();

  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsPhone(window.innerWidth < 1024);
    };

    // Run on mount & listen for resizes
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoize uniqueFiltered to prevent unnecessary recalculations
  const uniqueFiltered = useMemo(() => {
    return Array.from(
      new Map(
        filtered
          .filter((doc) => doc.selectList5.trim() !== "") // Keep only non-empty selectList5
          .map((doc) => [doc.documentNo, doc]) // Map by documentNo
      ).values()
    );
  }, [filtered]); // Only recompute when `filtered` changes

  const { setCurrentPage } = usePagination();

  useEffect(() => {
    setCurrentPage(0);
  }, [filtered, setCurrentPage]);

  return (
    <div className="w-full mt-2">
      {/* Submission Charts */}
      <div
        ref={contentRef}
        className="relative p-2 mx-1 rounded-md flex h-[127vh] lg:h-[calc(100vh-50px)] shadow-md"
      >
        {isPhone ? (
          <ResizablePanelGroup direction="vertical">
            {/* First Row */}
            <ResizablePanel defaultSize={27}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={33}>
                  <Suspense fallback={"Loading..."}>
                    <ReviewStatus data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={34}>
                  <Suspense fallback={"Loading..."}>
                    <SubmissionStatus data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={33}>
                  <Suspense fallback={"Loading..."}>
                    <StatusChart data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Second Row */}
            <ResizablePanel defaultSize={73}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={65}>
                  <Suspense fallback={"Loading..."}>
                    <LateAnalysis data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35}>
                  <Suspense fallback={"Loading..."}>
                    <HeatX data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={24}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={33}>
                  <Suspense fallback={"Loading..."}>
                    <ReviewStatus data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={34}>
                  <Suspense fallback={"Loading..."}>
                    <SubmissionStatus data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={33}>
                  <Suspense fallback={"Loading..."}>
                    <StatusChart data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={76}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70}>
                  <Suspense fallback={"Loading..."}>
                    <LateAnalysis data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30}>
                  <Suspense fallback={"Loading..."}>
                    <HeatX data={uniqueFiltered} />
                  </Suspense>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* Workflow Charts */}
      <div
        ref={content2Ref}
        className="relative p-2 mx-1 rounded-md flex h-[127vh] lg:h-[calc(100vh-50px)] shadow-md"
      >
        {isPhone ? (
          <ResizablePanelGroup direction="vertical">
            {/* First Row */}
            <ResizablePanel defaultSize={27}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>
                  <Suspense fallback={"Loading..."}>
                    <DocsPerUserChart data={filtered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                  <Suspense fallback={"Loading..."}>
                    <WorkflowStepStatusChart data={filtered} />
                  </Suspense>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Second Row */}
            <ResizablePanel defaultSize={73}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={65}>
                  <Suspense fallback={"Loading..."}>
                    <LateAnalysisReview data={filtered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35}>
                  <Suspense fallback={"Loading..."}>
                    <StatusOutcomeHeatMap data={filtered} />
                  </Suspense>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={26}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={65}>
                  <Suspense fallback={"Loading..."}>
                    <DocsPerUserChart data={filtered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35}>
                  <Suspense fallback={"Loading..."}>
                    <WorkflowStepStatusChart data={filtered} />
                  </Suspense>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={74}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70}>
                  <Suspense fallback={"Loading..."}>
                    <LateAnalysisReview data={filtered} />
                  </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30}>
                  <Suspense fallback={"Loading..."}>
                    <StatusOutcomeHeatMap data={filtered} />
                  </Suspense>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* Line Time Chart */}
      <Suspense fallback={<p>Loading LineTimeChart...</p>}>
        <LineTimeChart />
      </Suspense>
    </div>
  );
};

export default FiltersAndCharts;
