import { Button } from "@/components/ui/button";
import {
  BookOpenTextIcon,
  FileQuestion,
  HelpCircle,
  Option,
  OptionIcon,
  Star,
  TicketsPlane,
} from "lucide-react";
import React, { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const statusColorsSubmission = [
  { label: "Submission Required", color: "#b0e0e6" },
  { label: "Submitted", color: "#78a8cf" },
  { label: "Completed", color: "#84C3A3" },
];

const statusColorsReview = [
  { label: "C1", color: "#63A8E6" },
  {
    label: "C2",
    color: "#B58ED2",
  },
  { label: "C3", color: "#FF4D4D" },
  { label: "C4", color: "#fd9e97" },
  { label: "Pending", color: "#ffc966" },
  { label: "Under Review", color: "#3A7E72" },
  { label: "Approved", color: "#4682B4" },
];

const Legend = () => {
  return (
    <div className="flex justify-between items-center text-xs  pb-4">
      <div className="flex flex-wrap gap-y-1 gap-x-2 lg:gap-x-3 text-[9px] lg:text-[10px]">
        Submissions:
        {statusColorsSubmission.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-center gap-1 lg:gap-2"
          >
            <span
              className="w-1.5 h-1.5 lg:w-3 lg:h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            ></span>
            <span className="">{status.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-y-1 gap-x-2 lg:gap-x-3 text-[9px] lg:text-[10px]">
        , Reviews:
        {statusColorsReview.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-center gap-1 lg:gap-2"
          >
            <span
              className="w-1.5 h-1.5 lg:w-3 lg:h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            ></span>
            <span className="">{status.label}</span>
          </div>
        ))}
      </div>

      <Popover>
        <PopoverTrigger
          asChild
          className="absolute top-2 right-32 lg:top-0 lg:right-44"
        >
          <Button variant="outline" className="scale-50 lg:scale-75">
            <HelpCircle className="scale-110" />
          </Button>
        </PopoverTrigger>
        {/* <PopoverContent className="text-xs grid p-2 gap-2 "></PopoverContent> */}
        <PopoverContent className="grid p-0 gap-2 bg-white w-[400px]">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-0 px-1 pt-1">
              <AccordionTrigger className="text-slate-950 bg-indigo-200/40 p-1.5 rounded-sm  text-xs">
                <p className="">
                  <b>Tip:</b> Click on a bar to copy doc number
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <img src="/tips/tip3.gif" alt="Demo GIF" className="" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-0 p-1 ">
              <AccordionTrigger className="text-slate-950 bg-indigo-200/40 p-1.5 rounded-sm  text-xs">
                <p className="">
                  <b>Tip:</b> Pinch to zoom in / zoom out
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <img src="/tips/tip2.gif" alt="Demo GIF" className="" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Legend;
