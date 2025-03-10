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

import Image from "next/image";
import Link from "next/link";

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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelect = (category: string, value: string) => {
    const updatedStatus = {
      ...selectedStatus,
      [category]: selectedStatus[category] === value ? "" : value, // Toggle selection (only one per category)
    };

    setSelectedStatus(updatedStatus);
    setStatusFilter(updatedStatus); // Instantly update filtering
    setTimeout(() => {
      setOpen(false);
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
    <div className="sticky top-0 z-50 bg-white max-h-12 shadow-md w-full h-full flex justify-between items-center gap-">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={"/"}
              className="relative flex flex-col w-[60px] pl-1 bg-gradient-to-br from-slate-950 to-slate-600 scale-[0.675] rounded-sm py-[1.1px] justify-center items-center "
            >
              <img className="scale- z-10" src="/logo/logo.png" />
              {/* <p className="text-xs text-center -mt-1 z-50">doxara </p> */}
            </Link>

            {/* <Link
              href={"/"}
              className="relative flex flex-col w-14 pl-1 bg-gradient-to-br from-slate-950 to-slate-600 scale-[0.83] rounded-sm py-[1px] justify-center items-center "
            >
              <img
                className="w-[20px] lg:w-[40px]    "
                src="/logo/logo.png"
                alt="Doxara Logo"
              />
              <p className="text-[#FFCA18] text-[11px] font-thin -mt-1 text-center">
                Doxara
              </p>

            </Link> */}
          </TooltipTrigger>
          {/* <TooltipContent className="text-xs bg-gray-400 max-w-xs"> */}
          <TooltipContent className="bg-white font-medium tracking-widest shadow-md ring-1 ring-slate-200 px-2.5 text-slate-800">
            Doxara
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Filters for small screens */}

      <div className="flex py-[13px] pl-0 gap-2.5 items-center">
        <p
          className={`font-medium min-w-24 text-center text-xs md:text-base text-black bg-gray-00 rounded-sm`}
        >
          {projectName}
        </p>
        <p className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap ">
          N: {projectNumber}
        </p>
      </div>
      <div className="flex justify-between items-center gap-2 lg:gap-0 flex-1 pl-[7px] pr-[5px]">
        {/* Filters for large screens */}
        <div className="hidden lg:flex justify-center gap-2 lg:gap-0.5 w-auto">
          {/* Subproject Filter */}
          <Select value={subProjectFilter} onValueChange={setSubProjectFilter}>
            <SelectTrigger className="max-w-[110px] xl:min-w-[112px] text-xs lg:text-sm hover:bg-slate-100 duration-300 scale-95">
              <SelectValue placeholder="Subproject" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
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
            <SelectTrigger className="max-w-[110px] xl:min-w-[112px] text-xs lg:text-sm hover:bg-slate-100 duration-300 scale-95">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
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
            <SelectTrigger className="max-w-[110px] xl:min-w-[112px] text-xs lg:text-sm hover:bg-slate-100 duration-300 scale-95">
              <SelectValue placeholder="Discipline" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
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
                className="text-xs lg:text-sm w-[115px] flex justify-between  duration-300 scale-95"
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
              <ScrollArea className="h-[350px]">
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
                      <div key={category} className="flex flex-col gap-0">
                        <div className="text-slate-500 text-xs pb-1.5">
                          {category}
                        </div>
                        {options.map((value) => (
                          <Label
                            key={value}
                            className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 py-1.5"
                          >
                            <Checkbox
                              checked={
                                selectedStatus[
                                  category === "Review Status"
                                    ? "review"
                                    : "submission"
                                ] === value
                              }
                              onCheckedChange={() => {
                                handleSelect(
                                  category === "Review Status"
                                    ? "review"
                                    : "submission",
                                  value
                                );
                              }}
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
        <div className="flex items-center gap-1 w-full -ml-1">
          <div className="flex justify-between w-full gap-2 scale-75 md:scale-95">
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by Title or Document No."
              className="p-2 border rounded text-xs md:text-sm w-full"
            />
            <Button
              variant="outline"
              onClick={clearFilters}
              className="bg-purple-200 hover:bg-purple-100 text-xs md:text-sm lg:-mr-1 xl:-mr-2"
            >
              Clear
            </Button>
          </div>

          <button
            onClick={downloadPdf}
            className=" p-1 text-sky-800 ring-1 hover:bg-sky-700 hover:text-white duration-500 ring-sky-600 rounded-sm scale-75 md:scale-100"
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
                <TooltipContent className="bg-white shadow-md ring-1 ring-slate-200 p-2.5 mt-1.5 mr-1 text-slate-700">
                  <p>
                    Download 1<sup>st</sup> and 2<sup>nd</sup> pages
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </button>
        </div>
      </div>
      <div className="block lg:hidden mx-2 scale-75 md:scale-100">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="bg-purple-200">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="p-4 w-48 flex flex-col gap-3 mx-1"
          >
            {/* Subproject Filter */}
            <Select
              value={subProjectFilter}
              onValueChange={(value) => {
                setSubProjectFilter(value);
                setMenuOpen(false);
              }}
            >
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Subproject" />
              </SelectTrigger>
              <SelectContent side="right" className="max-h-80">
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
            <Select
              value={createdByFilter}
              onValueChange={(value) => {
                setCreatedByFilter(value);
                setMenuOpen(false);
              }}
            >
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent side="right" className="max-h-80">
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
              onValueChange={(value) => {
                setDisciplineFilter(value);
                setMenuOpen(false);
              }}
            >
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>

              <SelectContent side="right" className="max-h-80">
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
            {/* Submission Status Select */}
            <Select
              value={selectedStatus.submission}
              onValueChange={(value) => {
                setSelectedStatus((prev: any) => ({
                  ...prev,
                  submission: value,
                }));
                setStatusFilter((prev: any) => ({
                  ...prev,
                  submission: value,
                }));
              }}
            >
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Submission Status" />
              </SelectTrigger>
              <SelectContent side="right" className="max-h-80">
                <SelectGroup>
                  <SelectItem value={"all"} className="text-xs font-semibold">
                    All
                  </SelectItem>
                  {statusCategories["Submission Status"].map((value) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Review Status Select */}
            <Select
              value={selectedStatus.review}
              onValueChange={(value) => {
                setSelectedStatus((prev: any) => ({
                  ...prev,
                  review: value,
                }));
                setStatusFilter((prev: any) => ({
                  ...prev,
                  review: value,
                }));
              }}
            >
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Review Status" />
              </SelectTrigger>
              <SelectContent side="right" className="max-h-80">
                <SelectGroup>
                  <SelectItem value={"all"} className="text-xs font-semibold">
                    All
                  </SelectItem>
                  {statusCategories["Review Status"].map((value) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Filters;
