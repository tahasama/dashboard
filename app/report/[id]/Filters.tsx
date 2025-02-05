"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
import { Download, Loader, Menu } from "lucide-react";
import { toBlob } from "html-to-image";
import download from "downloadjs";
import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Filters = () => {
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
    uniqueSubProjects,
    uniqueCreatedBy,
    uniqueDisciplines,
    uniqueStatuses,
    // uniqueSubStatuses,
    contentRef,
    content2Ref,
  } = useFilters();
  const [loading, setLoading] = useState(false);
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
    <div className="sticky top-0 z-50 p-2 bg-white shadow-md w-full flex justify-between items-center gap-2 xl:gap-4">
      {/* Filters for large screens */}
      <div className="hidden md:flex gap-2 xl:gap-4 w-full">
        {/* Subproject Filter */}
        <Select value={subProjectFilter} onValueChange={setSubProjectFilter}>
          <SelectTrigger className="text-sm xl:text-md w-min-w-[100px] lg:min-w-[120px]">
            <SelectValue placeholder="Subproject" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"all"}>All</SelectItem>
              {uniqueSubProjects.map((value: any) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Supplier Filter */}
        <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
          <SelectTrigger className="text-sm lg:text-md lg:min-w-[120px]">
            <SelectValue placeholder="Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"all"}>All</SelectItem>
              {uniqueCreatedBy.map((value: any) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Discipline Filter */}
        <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
          <SelectTrigger className="text-sm lg:text-md lg:min-w-[120px]">
            <SelectValue placeholder="Discipline" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"all"}>All</SelectItem>
              {uniqueDisciplines.map((value: any) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
          <SelectTrigger className="text-sm lg:text-md lg:min-w-[120px]">
            <SelectValue placeholder="Submission Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"all"}>All</SelectItem>
              {uniqueSubStatuses.map((value: any) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select> */}

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="text-sm lg:text-md lg:min-w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"all"}>All</SelectItem>
              {uniqueStatuses.map((value: any) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Filters for small screens */}
      <div className="block md:hidden">
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
                  <SelectItem value={"all"}>All</SelectItem>
                  {uniqueSubProjects.map((value: any) => (
                    <SelectItem key={value} value={value}>
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
                  <SelectItem value={"all"}>All</SelectItem>
                  {uniqueCreatedBy.map((value: any) => (
                    <SelectItem key={value} value={value}>
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
                  <SelectItem value={"all"}>All</SelectItem>
                  {uniqueDisciplines.map((value: any) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
              <SelectTrigger className="text-sm lg:text-md lg:min-w-[120px]">
                <SelectValue placeholder="Submission Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"all"}>All</SelectItem>
                  {uniqueSubStatuses.map((value: any) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select> */}

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent side="right">
                <SelectGroup>
                  <SelectItem value={"all"}>All</SelectItem>
                  {uniqueStatuses.map((value: any) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search and Clear Filters */}
      <div className="flex items-center gap-4 w-full">
        <Input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by Title or Document No."
          className="p-2 border rounded text-sm w-full"
        />
        <Button
          variant="outline"
          onClick={clearFilters}
          className="bg-purple-200 hover:bg-purple-100"
        >
          Clear
        </Button>
        <button
          onClick={downloadPdf}
          className=" p-1 text-sky-800 ring-1 ring-sky-600 rounded-sm"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {!loading ? <Download /> : <Loader className="animate-spin" />}
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
  );
};

export default Filters;
