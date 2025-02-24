"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "../../FiltersProvider";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, Loader, Menu } from "lucide-react";
import { toBlob } from "html-to-image";
import download from "downloadjs";
import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Inter,
  Amiri,
  Merriweather,
  Poppins,
  Playfair_Display,
  Work_Sans,
} from "next/font/google";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const inter = Work_Sans({ subsets: ["latin"], weight: ["400"] });

const Filters = ({ projectNumber, projectName }: any) => {
  const {
    createdByFilter,
    subProjectFilter,
    disciplineFilter,
    statusFilter,
    // subStatusFilter,
    searchText,
    setCreatedByFilter,
    setSubProjectFilter,
    setDisciplineFilter,
    setStatusFilter,
    // setSubStatusFilter,
    setSearchText,
    clearFilters,
    selectedStatus,
    setSelectedStatus,
    uniqueSubProjects,
    uniqueCreatedBy,
    uniqueDisciplines,
    // uniqueStatuses,
    // uniqueSubStatuses,
    uniqueReviewStatuses,
    uniqueSubmissionStatuses,
    contentRef,
    content2Ref,
  } = useFilters();

  const statusCategories = {
    "Review Status": uniqueReviewStatuses
      .toSorted()
      .filter((v) => v !== "None"),
    "Submission Status": uniqueSubmissionStatuses
      .toSorted()
      .filter((v) => v !== "None"),
  };
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSelect = (category: string, value: string) => {
    const updatedStatus = {
      ...selectedStatus,
      [category]: selectedStatus[category] === value ? "" : value, // Toggle selection (only one per category)
    };

    setSelectedStatus(updatedStatus);
    setStatusFilter(updatedStatus); // Instantly update filtering
    setTimeout(() => {
      setOpen(!open);
    }, 250);
  };

  // const applyFilter = () => setStatusFilter(selectedStatus);

  const downloadPdf = async () => {
    setLoading(true);
    if (contentRef.current) {
      // pdf
      // html2pdf().from(contentRef.current).save("download.pdf");
      // regular image
      // const dataUrl = await toPng(contentRef.current);
      // download(dataUrl, "screenshot.png");
      const blob = await toBlob(contentRef.current, {
        pixelRatio: 10,
      }); // Increase pixel ratio for better quality
      if (blob) {
        download(blob, "Submissions.png");
      }
    }
    if (content2Ref.current) {
      // pdf
      // html2pdf().from(contentRef.current).save("download.pdf");
      // regular image
      // const dataUrl = await toPng(contentRef.current);
      // download(dataUrl, "screenshot.png");
      const blob = await toBlob(content2Ref.current, {
        pixelRatio: 10,
      }); // Increase pixel ratio for better quality
      if (blob) {
        download(blob, "Reviews.png");
      }
    }
    setLoading(false);
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md w-full h-full flex justify-between items-center gap-2">
      {/* Filters for small screens */}
      <div className="block lg:hidden ml-2.5 scale-75 md:scale-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="bg-purple-200">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="p-4 w-48 flex flex-col gap-3"
          >
            {/* Subproject Filter */}
            <Select
              value={subProjectFilter}
              onValueChange={setSubProjectFilter}
            >
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Subproject" />
              </SelectTrigger>
              <SelectContent side="right">
                <SelectGroup>
                  <SelectItem value={"all"} className="text-xs font-semibold">
                    All
                  </SelectItem>
                  {uniqueSubProjects.map((value: any) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Supplier Filter */}
            <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent side="right">
                <SelectGroup>
                  <SelectItem value={"all"} className="text-xs font-semibold">
                    All
                  </SelectItem>
                  {uniqueCreatedBy.map((value: any) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Discipline Filter */}
            <Select
              value={disciplineFilter}
              onValueChange={setDisciplineFilter}
            >
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent side="right">
                <SelectGroup>
                  <SelectItem value={"all"} className="text-xs font-semibold">
                    All
                  </SelectItem>
                  {uniqueDisciplines.map((value: any) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent side="right">
                <SelectGroup>
                  <SelectItem value="all" className="text-xs font-semibold">
                    All
                  </SelectItem>

                  {/* Review Statuses Group */}
                  <SelectLabel className="text-slate-500 text-xs">
                    Review Status
                  </SelectLabel>
                  {uniqueReviewStatuses.map((value) => (
                    <SelectItem
                      key={value}
                      value={`review:${value}`} // Prefix to distinguish categories
                      className="text-xs"
                    >
                      {value}
                    </SelectItem>
                  ))}

                  {/* Submission Statuses Group */}
                  <SelectLabel className="text-slate-500 text-xs">
                    Submission Status
                  </SelectLabel>
                  {uniqueSubmissionStatuses.map((value) => (
                    <SelectItem
                      key={value}
                      value={`submission:${value}`} // Prefix to distinguish categories
                      className="text-xs"
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex py-[13px] pl-2 gap-2.5 items-center">
        <p
          className={`font-medium min-w-24 text-center text-xs md:text-base text-black bg-gray-00 rounded-sm`}
        >
          {projectName}
        </p>
        <p className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap ">
          N: {projectNumber}
        </p>
      </div>

      <div className="flex justify-between items-center gap-2 xl:gap-3 flex-1 pl-[7px] pr-[5px]">
        {/* Filters for large screens */}
        <div className="hidden lg:flex justify-center gap-2 xl:gap-2.5 w-auto">
          {/* Subproject Filter */}
          <Select value={subProjectFilter} onValueChange={setSubProjectFilter}>
            <SelectTrigger className="max-w-[110px] xl:min-w-[112px] text-xs lg:text-sm">
              <SelectValue placeholder="Subproject" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"all"} className="text-xs font-semibold">
                  All
                </SelectItem>
                {uniqueSubProjects.map((value: any) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Supplier Filter */}
          <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
            <SelectTrigger className="max-w-[110px] xl:min-w-[112px] text-xs lg:text-sm">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"all"} className="text-xs font-semibold">
                  All
                </SelectItem>
                {uniqueCreatedBy.map((value: any) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Discipline Filter */}
          <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
            <SelectTrigger className="max-w-[110px] xl:min-w-[112px] text-xs lg:text-sm">
              <SelectValue placeholder="Discipline" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"all"} className="text-xs font-semibold">
                  All
                </SelectItem>
                {uniqueDisciplines.map((value: any) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="text-xs lg:text-sm w-[115px] flex justify-between"
              >
                <p className="overflow-hidden text-start w-[115px]">
                  {selectedStatus.review ||
                    selectedStatus.submission ||
                    "Status"}
                </p>
                <ChevronDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2" side="bottom" align="start">
              <ScrollArea className="h-[380px]">
                <div className="flex flex-col gap-2">
                  {/* ALL Option */}
                  <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={
                          !selectedStatus.review && !selectedStatus.submission
                        }
                        onCheckedChange={() => {
                          setSelectedStatus({ review: "", submission: "" });
                          setStatusFilter("");
                          setOpen(false); // Close popover after selection
                        }}
                      />
                      <span className="text-xs font-semibold">All</span>
                    </Label>
                  </div>
                  <p className="text-xs mt-1 bg-gray-100 p-1 rounded-sm">
                    <b>Tip: </b>
                    You can combine submission and review status
                  </p>
                  {/* Categories */}
                  {Object.entries(statusCategories)
                    .reverse()
                    .map(([category, options]) => (
                      <div key={category} className="flex flex-col gap-3">
                        <div className="text-slate-500 text-xs mt-1">
                          {category}
                        </div>
                        {options.map((value) => (
                          <Label
                            key={value}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={
                                selectedStatus[
                                  category === "Review Status"
                                    ? "review"
                                    : "submission"
                                ] === value
                              }
                              onCheckedChange={() =>
                                handleSelect(
                                  category === "Review Status"
                                    ? "review"
                                    : "submission",
                                  value
                                )
                              }
                            />
                            <span className="text-xs">{value}</span>
                          </Label>
                        ))}
                      </div>
                    ))}
                </div>
              </ScrollArea>

              {/* <Button onClick={applyFilter} className="mt-2 w-full text-xs">
                Apply
              </Button> */}
            </PopoverContent>
          </Popover>
        </div>

        {/* Search and Clear Filters */}
        <div className="flex items-center gap-3 w-full ">
          <Input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by Title or Document No."
            className="p-2 border rounded text-xs md:text-sm w-full scale-75 md:scale-100"
          />
          <Button
            variant="outline"
            onClick={clearFilters}
            className="bg-purple-200 hover:bg-purple-100 text-xs md:text-sm scale-75 md:scale-100"
          >
            Clear
          </Button>

          <button
            onClick={downloadPdf}
            className=" p-1 text-sky-800 ring-1 ring-sky-600 rounded-sm scale-75 md:scale-100"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {!loading ? (
                    <Download />
                  ) : (
                    <Loader className="animate-spin" />
                  )}
                </TooltipTrigger>
                <TooltipContent className="bg-white shadow-md ring-1 ring-slate-200 p-2.5 text-slate-700">
                  <p>
                    Download 1<sup>st</sup> and 2<sup>nd</sup> pages
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
