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
import { toCamelCase } from "@/lib/utils";
import { MergedData } from "../../types";
import { useEffect, useMemo } from "react";
import { useFilters } from "../../FiltersProvider";
import { Input } from "@/components/ui/input";

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
    setSearchText, // This is the setter for searchText
    clearFilters,
    filtered, // Get the filtered data here
  } = useFilters();

  const getUniqueValues = (data: MergedData[], column: string) =>
    Array.from(
      new Set(
        data
          .filter((x) => x.reviewStatus !== "Terminated")
          .map((item: any) => item[column])
          .filter(Boolean)
      )
    );

  const uniqueSubProjects = useMemo(
    () => getUniqueValues(filtered, "selectList3"),
    [filtered]
  );
  const uniqueCreatedBy = useMemo(
    () => getUniqueValues(filtered, "selectList5"),
    [filtered]
  );
  const uniqueDisciplines = useMemo(
    () => getUniqueValues(filtered, "selectList1"),
    [filtered]
  );
  const uniqueStatuses = useMemo(
    () => getUniqueValues(filtered, "reviewStatus"),
    [filtered]
  );

  useEffect(() => {
    uniqueSubProjects;
    uniqueCreatedBy;
    uniqueDisciplines;
    uniqueStatuses;
  }, [filtered]);

  return (
    <div className="flex gap-2 my-2 sticky top-0 bg-white z-50 p-2.5 shadow-md">
      {/* Input for search */}

      {/* Filters */}
      <Select value={subProjectFilter} onValueChange={setSubProjectFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Subproject" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={"all"}>All </SelectItem>
            {uniqueSubProjects.map((value: any) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Contractor" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={"all"}>All </SelectItem>
            {uniqueCreatedBy.map((value: any) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Discipline" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={"all"}>All </SelectItem>
            {uniqueDisciplines.map((value: any) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={"all"}>All </SelectItem>
            {uniqueStatuses.map((value: any) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search by Title or Document No."
        className="p-2 border rounded text-sm"
      />

      <Button
        variant="outline"
        onClick={clearFilters}
        className="bg-purple-200 hover:bg-purple-100"
      >
        Clear Filters
      </Button>
    </div>
  );
};

export default Filters;
