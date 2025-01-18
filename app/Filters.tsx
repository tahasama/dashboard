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
import { MergedData } from "./types";
import { useMemo } from "react";
import { FiltersContextType, useFilters } from "./FiltersProvider";

const Filters = ({ clearFilters, originalData }: any) => {
  // console.log("🚀 ~ Filters ~ originalData:", originalData);
  const {
    createdByFilter,
    subProjectFilter,
    disciplineFilter,
    statusFilter,
    setCreatedByFilter,
    setSubProjectFilter,
    setDisciplineFilter,
    setStatusFilter,
  } = useFilters();

  const getUniqueValues = (data: any, column: string) => {
    const uniqueValues = new Set<string>();
    data
      .filter((x: MergedData) => x.reviewStatus !== "Terminated")
      .forEach((fileData: any) => {
        if (fileData[column]) uniqueValues.add(fileData[column]);
      });
    return Array.from(uniqueValues);
  };

  const uniqueSubProjects = useMemo(
    () => getUniqueValues(originalData, "selectList3"),
    [originalData]
  );
  const uniqueCreatedBy = useMemo(
    () => getUniqueValues(originalData, "selectList5"),
    [originalData]
  );
  const uniqueDisciplines = useMemo(
    () => getUniqueValues(originalData, "selectList1"),
    [originalData]
  );
  const uniqueStatuses = useMemo(
    () => getUniqueValues(originalData, "reviewStatus"),
    [originalData]
  );

  return (
    <div className="flex gap-2 my-2 sticky top-0 bg-white z-50 p-2.5 shadow-md">
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
