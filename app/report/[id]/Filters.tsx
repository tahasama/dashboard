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
import { Menu } from "lucide-react";

const Filters = () => {
  const {
    createdByFilter,
    subProjectFilter,
    disciplineFilter,
    statusFilter,
    searchText,
    setCreatedByFilter,
    setSubProjectFilter,
    setDisciplineFilter,
    setStatusFilter,
    setSearchText,
    clearFilters,
    uniqueSubProjects,
    uniqueCreatedBy,
    uniqueDisciplines,
    uniqueStatuses,
  } = useFilters();

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
      </div>
    </div>
  );
};

export default Filters;
