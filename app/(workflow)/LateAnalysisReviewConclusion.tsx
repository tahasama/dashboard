import React, { useMemo } from "react";
import { Data, MergedData } from "../types";
import { getDurations, parseDates } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { HelpCircle } from "lucide-react";

const LateAnalysisReviewConclusion: React.FC<{
  chartValuesRealReceivedDocs: number[]; // Cumulative real received review documents count
  chartValuesdocs: number[]; // Cumulative planned review reviews count
  data: MergedData[]; // Additional data for review insights
  isCheckedR: boolean;
}> = ({
  chartValuesRealReceivedDocs = [],
  chartValuesdocs = [],
  data = [],
  isCheckedR = false,
}) => {
  const formatNumber = (num: number) => num.toLocaleString();

  // Total Planned and Real review counts
  const totalPlannedReview = chartValuesdocs.at(-1) || 0;
  const totalRealReview = chartValuesRealReceivedDocs.at(-1) || 0;

  // Calculate review differences
  const reviewDifferences = chartValuesRealReceivedDocs.map((real, index) =>
    chartValuesdocs[index] ? real - chartValuesdocs[index] : 0
  );

  // Function to calculate min, max, and average of an array
  const calculateStats = (arr: number[]) => {
    if (!arr.length) return { min: 0, max: 0, average: 0 };
    return {
      min: Math.min(...arr),
      max: Math.max(...arr),
      average: arr.reduce((sum, val) => sum + val, 0) / arr.length,
    };
  };

  // Calculate lateness of reviews still "Under Review"
  const calculateLateReviews = () => {
    let totalLateDays = 0;
    let lateDocuments = 0;
    const today = new Date();

    data.forEach((doc) => {
      if (doc.stepStatus === "Overdue" && !doc.dateCompleted) {
        const reviewStartDate: any = parseDates(doc.dateIn as string); // Convert Excel date
        if (!reviewStartDate) return;

        const delayDays = getDurations(reviewStartDate, today); // Calculate days delayed
        const delayDaysNumber = parseInt(delayDays as any, 10);

        if (delayDaysNumber > 0) {
          totalLateDays += delayDaysNumber;
          lateDocuments += 1;
        }
      }
    });

    return {
      totalLateDays,
      lateDocuments,
      avgLateDays: lateDocuments ? totalLateDays / lateDocuments : 0,
    };
  };

  // Get late review stats
  const { totalLateDays, lateDocuments, avgLateDays } = calculateLateReviews();

  const completion = useMemo(
    () =>
      (
        (chartValuesRealReceivedDocs[chartValuesRealReceivedDocs.length - 1] /
          chartValuesdocs[chartValuesdocs.length - 1]) *
        100
      ).toFixed(1),
    [totalRealReview, totalPlannedReview]
  );

  // Compute statistics for review differences
  const {
    min,
    max,
    average: avgReviewDifference,
  } = calculateStats(reviewDifferences);

  // **Merged Review & Late Insights**
  let reviewImpactInsight;
  if (lateDocuments > 0) {
    reviewImpactInsight = {
      color: "bg-red-100 ring-red-200/90",
      message: `🔴 Critical Delayed Reviews: Completion rate is ${completion}%, with an average delay of ${avgLateDays.toFixed(
        0
      )} days per document.`,
    };
  } else if (avgReviewDifference === 0) {
    reviewImpactInsight = {
      color: "bg-blue-100 ring-blue-200/90",
      message:
        "🔵 Perfect Alignment: Real reviews matched the planned timeline.",
    };
  } else if (avgReviewDifference < -5) {
    reviewImpactInsight = {
      color: "bg-red-100 ring-red-200/90",
      message: `🔴 Behind Schedule: On average, real reviews lagged by ${Math.abs(
        avgReviewDifference + 5
      ).toFixed(0)} reviews per time point.`,
    };
  } else {
    reviewImpactInsight = {
      color: "bg-green-100 ring-green-200/90",
      message: "🟢 On Track: Reviews are within the planned schedule.",
    };
  }

  // Progression Summary
  const reviewProgressionInsight =
    totalRealReview >= totalPlannedReview
      ? {
          color: "bg-teal-100 ring-teal-200/90",
          message: `🟢 Excellent Progression: Real reviews (${totalRealReview}) met or exceeded the planned reviews (${totalPlannedReview}).`,
        }
      : {
          color: "bg-orange-100 ring-orange-200/90",
          message: `🟠 Needs Improvement: Real reviews fell short by ${Math.abs(
            totalPlannedReview - totalRealReview
          )} document(s).`,
        };

  return (
    <div className="w-3/12 font-thin text-black lg:text-slate-800 text-[11px] mb-3 lg:text-xs scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-300 scrollbar-corner-transparent overflow-y-scroll">
      {/* Impact Insights for Review */}
      <div className="text-end">
        <Popover>
          <PopoverTrigger asChild className=" -pt-4 relative text-end scale-75">
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

      <p className={`p-2 rounded-md mb-2 mx-0.5 ${reviewImpactInsight.color}`}>
        {reviewImpactInsight.message}
      </p>

      {/* Progression Insights for Review */}
      <p
        className={`p-2 rounded-md mb-2 mx-0.5 ${reviewProgressionInsight.color}`}
      >
        {reviewProgressionInsight.message}
      </p>

      {/* Review Statistics */}
      <br />
      <ul className="space-y-1 ml-0.5">
        <li>
          ➡️{" "}
          {isCheckedR ? "Planned Total Reviews" : "Documents Sent For Review"}:{" "}
          <strong>{formatNumber(totalPlannedReview)}</strong>
        </li>
        <li>
          ➡️ {isCheckedR ? "Real Total Reviews" : "Document Reviewed"}:{" "}
          <strong>{formatNumber(totalRealReview)}</strong>
        </li>
        <li>
          ➡️ Average Daily Difference:{" "}
          <strong>{Math.abs(avgReviewDifference).toFixed(0)}</strong>
        </li>
        <li>
          ➡️ Max Diff: <strong>{Math.abs(min)}</strong> docs{" "}
          {min >= 0 ? "ahead" : "behind"}
        </li>
        <li>
          ➡️ Min Diff: <strong>{Math.abs(max)}</strong> docs{" "}
          {max >= 0 ? "ahead" : "behind"}
        </li>
      </ul>
    </div>
  );
};

export default LateAnalysisReviewConclusion;
