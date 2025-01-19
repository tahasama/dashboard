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
import { MergedData } from "../../../../types";
import { useEffect, useMemo } from "react";
import { useFilters } from "../../../../FiltersProvider";

const Filters = () => {
  const {
    createdByFilter,
    subProjectFilter,
    disciplineFilter,
    statusFilter,
    setCreatedByFilter,
    setSubProjectFilter,
    setDisciplineFilter,
    setStatusFilter,
    clearFilters,
    originalData,
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

  useEffect(() => {
    uniqueSubProjects;
    uniqueCreatedBy;
    uniqueDisciplines;
    uniqueStatuses;
  }, [originalData]);

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
