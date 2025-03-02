import HeatX from "@/app/(supplier)/HeatX";
import LateAnalysis from "@/app/(supplier)/LateAnalysis";
import ReviewStatus from "@/app/(supplier)/ReviewStatus";
import StatusChart from "@/app/(supplier)/StatusChart";
import SubmissionStatus from "@/app/(supplier)/SubmissionStatus";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div>
      <div className="sticky top-0 z-50 bg-white h-12 shadow-md w-full flex justify-between items-center gap-10">
        <Skeleton className="h-10 w-10 ml-3" />{" "}
        <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-4 w-1/4" />{" "}
        <Skeleton className="h-4 w-1/4 mr-3" />
      </div>
      <div className="relative p-2 mx-1 rounded-md flex h-[128vh] lg:h-[calc(100vh-50px)] shadow-md">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={26}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={33}>
                <Suspense fallback={"Loading..."}>
                  <div className="flex flex-col justify-center items-center space-y-3 mt-2">
                    <Skeleton className="h-[3vh] w-[20vw]" />
                    <Skeleton className="h-[21vh] w-[9.5vw] rounded-full" />
                  </div>
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={34}>
                <Suspense fallback={"Loading..."}>
                  <div className="flex flex-col justify-center items-center space-y-3 mt-2">
                    <Skeleton className="h-[3vh] w-[20vw]" />
                    <Skeleton className="h-[21vh] w-[9.5vw] rounded-full" />
                  </div>
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={33}>
                <Suspense fallback={"Loading..."}>
                  <div className="flex flex-col justify-center items-center space-y-3 mt-2">
                    <Skeleton className="h-[3vh] w-[20vw]" />
                    <Skeleton className="h-[21vh] w-[9.5vw] rounded-full" />
                  </div>
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={74}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <Suspense fallback={"Loading..."}>
                  <div className="flex w-full gap-5">
                    <div className="flex flex-col space-y-3 w-9/12 ml-5">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[40vw]" />
                        <Skeleton className="h-4 w-[30vw]" />
                      </div>
                      <Skeleton className="h-[45vh] w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-[45vh]  w-3/12 rounded-xl mt-[50px]" />
                  </div>
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30}>
                <Suspense fallback={"Loading..."}>
                  <div className="flex flex-col justify-center items-center space-y-3 mt-3 w-full">
                    <Skeleton className="h-4 w-[40vw]" />
                    <Skeleton className="h-[18vh] w-[65vw] rounded-xl" />
                  </div>
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
