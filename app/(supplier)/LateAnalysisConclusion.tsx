import React from "react";
import { Data, MergedData } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

const LateAnalysisConclusion: React.FC<{
  chartValuesRealReceivedDocs: number[];
  chartValuesdocs: number[];
  data: MergedData[];
  isCheckedS: boolean;
}> = ({
  chartValuesRealReceivedDocs = [],
  chartValuesdocs = [],
  data = [],
  isCheckedS = false,
}) => {
  const formatNumber = (num: number) => num.toLocaleString();

  const totalPlanned = chartValuesdocs.at(-1) || 0;
  const totalReal = chartValuesRealReceivedDocs.at(-1) || 0;

  // Calculate differences (real - planned submissions per time point)
  const differences = chartValuesRealReceivedDocs.map((real, index) =>
    chartValuesdocs[index] ? real - chartValuesdocs[index] : 0
  );

  // Extract delays (negative differences)
  const delays = differences.filter((diff) => diff < 0).map(Math.abs);
  const avgDelay = delays.length
    ? delays.reduce((sum, d) => sum + d, 0) / delays.length
    : 0;

  // Count how many documents are late
  const lateDocuments = delays.length;

  // Completion Rate Calculation (for display)
  const completionRate = totalPlanned ? (totalReal / totalPlanned) * 100 : 100; // Avoid division by zero

  // **Submission Impact Insight**
  let submissionImpactInsight;
  if (lateDocuments > 0 && totalPlanned > totalReal) {
    submissionImpactInsight = {
      color: "bg-red-100 ring-red-200/90",
      message: `🔴 Critical Delayed Submissions: Completion rate is ${completionRate.toFixed(
        1
      )}%, with an average delay of ${avgDelay.toFixed(0)} days per document.`,
    };
  } else if (differences.every((diff) => diff === 0)) {
    submissionImpactInsight = {
      color: "bg-blue-100 ring-blue-200/90",
      message:
        "🔵 Perfect Alignment: Real submissions matched the planned timeline.",
    };
  } else if (differences.reduce((sum, val) => sum + val, 0) < -5) {
    submissionImpactInsight = {
      color: "bg-red-100 ring-red-200/90",
      message: `🔴 Behind Schedule: On average, real submissions lagged by ${Math.abs(
        avgDelay
      ).toFixed(0)} submissions per time point.`,
    };
  } else {
    submissionImpactInsight = {
      color: "bg-green-100 ring-green-200/90",
      message: "🟢 On Track: Submissions are within the planned schedule.",
    };
  }

  const calculateStats = (
    arr: number[]
  ): { min: number; max: number; average: number } => {
    if (arr.length === 0) return { min: 0, max: 0, average: 0 };

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const average = arr.reduce((sum, value) => sum + value, 0) / arr.length;

    return { min, max, average };
  };

  const { min, max, average } = calculateStats(differences);

  // Progression Insight
  const progressionInsight =
    totalReal >= totalPlanned
      ? {
          color: "bg-teal-100 ring-teal-200/90",
          message: `🟢 Excellent Progression: Real submissions met or exceeded the planned submissions${
            totalPlanned - totalReal !== 0
              ? ` by ${Math.abs(totalPlanned - totalReal)} document${
                  Math.abs(totalPlanned - totalReal) > 1 ? "s" : ""
                }`
              : ""
          }`,
        }
      : {
          color: "bg-orange-100 ring-orange-200/90",
          message: `🟠 Needs Improvement: Real submissions did not meet the planned submissions by ${
            totalPlanned - totalReal
          } document.`,
        };

  return (
    <ScrollArea className="w-3/12 font-thin text-black lg:text-slate-800 text-[11px] mb-3 lg:text-xs">
      <div className="text-end">
        <Popover>
          <PopoverTrigger
            asChild
            className=" -pt-4 relative text-end scale-75 lg:scale-90"
          >
            <Button variant="outline">
              <HelpCircle />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="grid p-0 gap-2 bg-white w-[400px]"
            // align="start"
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0 p-1 ">
                <AccordionTrigger className="text-slate-950 bg-indigo-200/40 p-1.5 rounded-sm  text-xs">
                  <p className="">
                    <b>Tip:</b> Click on any legend of any chart to show/hide.
                  </p>
                </AccordionTrigger>
                <AccordionContent>
                  <img src="/tips/tip1.gif" alt="Demo GIF" className="" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </PopoverContent>
        </Popover>
      </div>
      <p
        className={`p-2 rounded-md my-3 ring- mx-0.5 text-[11px] xl:text-xs ${submissionImpactInsight.color}`}
      >
        {submissionImpactInsight.message}
      </p>

      <p
        className={`p-2 rounded-md mb-2 ring- mx-0.5 text-[11px] xl:text-xs ${progressionInsight.color}`}
      >
        {progressionInsight.message}
      </p>

      <br />
      <ul className="space-y-2 ml-1 text-[10.5px] xl:text-xs bg-indigo-50/70 px-1 py-1.5 -mt-1 rounded-md">
        <li className="flex items-center space-x-2">
          <span className="text-green-500">➡️</span>
          <span className="flex items-center justify-center w-full">
            <span className="w-[72.5%]">
              Planned {isCheckedS ? "Submissions" : "Documents"}:{" "}
            </span>
            <strong className="w-[27.5%] text-slate-800 bg-blue-200 rounded-sm px-1.5 py-1 text-center mr-0.5">
              {formatNumber(totalPlanned)}
            </strong>
          </span>
        </li>

        <li className="flex items-center space-x-2">
          <span className="text-green-500">➡️</span>
          <span className="flex items-center justify-center w-full">
            <span className="w-[72.5%]">
              Actual {isCheckedS ? "Submissions" : "Documents"}:{" "}
            </span>
            <strong className="w-[27.5%] text-slate-800 bg-green-200 rounded-sm px-1.5 py-1 text-center mr-0.5">
              {formatNumber(totalReal)}
            </strong>
          </span>
        </li>

        <li className="flex items-center space-x-2 pt-0.5">
          <span className="text-green-500">➡️</span>
          <span>
            Max Diff:{" "}
            <strong className={min >= 0 ? "text-green-600" : "text-red-600"}>
              {Math.abs(min)}
            </strong>{" "}
            docs {min >= 0 ? "ahead" : "behind"}
          </span>
        </li>
        <li className="flex items-center space-x-2 pt-1.5">
          <span className="text-green-500">➡️</span>
          <span>
            Min Diff:{" "}
            <strong className={max >= 0 ? "text-green-600" : "text-red-600"}>
              {Math.abs(max)}
            </strong>{" "}
            docs {max >= 0 ? "ahead" : "behind"}
          </span>
        </li>
      </ul>
    </ScrollArea>
  );
};

export default LateAnalysisConclusion;
