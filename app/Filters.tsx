import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import ExcelForm from "./ExcelForm";

const Filters = ({
  originalData,
  setData,
  handleFileUpload,
  labels,
  handleIndexRowChange,
  indexRows,
  handleGenerate,
  isReadyToGenerate,
  error,
  setLoading,
}: any) => {
  const [createdByFilter, setCreatedByFilter] = useState<string>("all");
  const [subProjectFilter, setSubProjectFilter] = useState<string>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const clearFilters = () => {
    if (
      createdByFilter !== "" ||
      subProjectFilter !== "" ||
      disciplineFilter !== ""
    ) {
      setLoading(true);
      setCreatedByFilter("");
      setSubProjectFilter("");
      setDisciplineFilter("");
    }
  };

  useEffect(() => {
    if (createdByFilter === "all") {
      setCreatedByFilter("");
    }
    if (subProjectFilter === "all") {
      setSubProjectFilter("");
    }
    if (disciplineFilter === "all") {
      setDisciplineFilter("");
    }

    applyFilters();
  }, [createdByFilter, subProjectFilter, disciplineFilter]);
  const applyFilters = () => {
    // setLoading(true);
    const filteredData = filterData(
      originalData,
      createdByFilter,
      subProjectFilter,
      disciplineFilter
    );
    setData(filteredData);
  };

  const getUniqueValues = (data: any[][], column: string) => {
    const allValues = data.flatMap((fileData) =>
      fileData.map((row) => row[column])
    );
    return Array.from(new Set(allValues.filter(Boolean)));
  };

  const filterData = (
    data: any[][],
    createdBy: string,
    subProject: string,
    discipline: string
  ) => {
    // Define helper to filter and create a Set of matching keys
    const getMatchingPackages = (
      key: string,
      value: string,
      mapKey: string
    ): Set<string> =>
      new Set(
        data
          .flatMap((fileData) =>
            fileData
              .filter((row: any) => row[key] === value)
              .map((row: any) => row[mapKey])
          )
          .filter((value) => value)
      );

    // Filter based on the input conditions
    const createdByPackages = createdBy
      ? getMatchingPackages("Select List 5", createdBy, "Package Number")
      : null;

    const subProjectPackages = subProject
      ? getMatchingPackages("Select List 3", subProject, "Document No")
      : null;

    const disciplinePackages = discipline
      ? getMatchingPackages("Select List 1", discipline, "Document No")
      : null;

    // Combine filters
    const combineFilters = (row: any) => {
      const packageNumber = row["Package Number"];
      const relatedPackage = row["Related Package"];
      const documentNo = row["Document No"];
      const documentNoDot = row["Document No."];
      const documentKeys = [documentNo, documentNoDot].filter(Boolean);

      return (
        (!createdByPackages ||
          createdByPackages.has(packageNumber) ||
          createdByPackages.has(relatedPackage)) &&
        (!subProjectPackages ||
          documentKeys.some((doc) => subProjectPackages.has(doc))) &&
        (!disciplinePackages ||
          documentKeys.some((doc) => disciplinePackages.has(doc)))
      );
    };

    // Filter the data
    return data.map((fileData) => fileData.filter(combineFilters));
  };

  const handleFilterChangeA = (value: string) => {
    setLoading(true); // Set loading to true
    setCreatedByFilter(value); // Update the filter value
  };

  const handleFilterChangeB = (value: string) => {
    setLoading(true); // Set loading to true
    setSubProjectFilter(value); // Update the filter value
  };

  const handleFilterChangeC = (value: string) => {
    setLoading(true); // Set loading to true
    setDisciplineFilter(value); // Update the filter value
  };

  return (
    <div className="flex gap-2 my-2 sticky top-0 bg-white z-50 p-2.5 shadow-md">
      <Select value={subProjectFilter} onValueChange={handleFilterChangeB}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Subproject" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={"all"}>All </SelectItem>
            {getUniqueValues(originalData, "Select List 3").map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={createdByFilter} onValueChange={handleFilterChangeA}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Contractor" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={"all"}>All </SelectItem>
            {getUniqueValues(originalData, "Select List 5").map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={disciplineFilter} onValueChange={handleFilterChangeC}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Discipline" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={"all"}>All </SelectItem>
            {getUniqueValues(originalData, "Select List 1").map((value) => (
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

      <ExcelForm
        handleFileUpload={handleFileUpload}
        labels={labels}
        handleIndexRowChange={handleIndexRowChange}
        indexRows={indexRows}
        handleGenerate={handleGenerate}
        isReadyToGenerate={isReadyToGenerate}
        error={error}
      />
    </div>
  );
};

export default Filters;
