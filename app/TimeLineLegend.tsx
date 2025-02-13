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
  const [show, setShow] = useState(false);
  return (
    <div className="flex justify-between items-center text-xs -mt-1 mb-0.5 p-1 bg-white shadow-lg rounded-lg">
      <div className="flex flex-wrap gap-y-1 gap-x-4">
        Submissions:
        {statusColorsSubmission.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-center gap-2"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            ></span>
            <span className="text-xs">{status.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-y-1 gap-x-4">
        , Reviews:
        {statusColorsReview.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-center gap-2"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            ></span>
            <span className="text-xs">{status.label}</span>
          </div>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <HelpCircle />
          </Button>
        </PopoverTrigger>
        {/* <PopoverContent className="text-xs grid p-2 gap-2 "></PopoverContent> */}
        <PopoverContent className="text-xs  p-2 gap-2 bg-white w-[375px]">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-slate-950 bg-indigo-200/40 p-2 mb-2 rounded-sm">
                <p className="">
                  <b>Tip:</b> Click on a bar to copy doc number
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <img src="/tips/tip3.gif" alt="Demo GIF" className="" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-slate-950 bg-indigo-200/40 p-2">
                <p className="text-slate-950">
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
