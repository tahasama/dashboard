import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

const Filters = ({ originalData, setData }: any) => {
  const [createdByFilter, setCreatedByFilter] = useState<string>("all");
  const [subProjectFilter, setSubProjectFilter] = useState<string>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [clear, setClear] = useState(true);
  const clearFilters = () => {
    setCreatedByFilter("");
    setSubProjectFilter("");
    setDisciplineFilter("");
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
  return (
    <div className="flex gap-2 my-2 sticky top-0 bg-white z-50 p-2.5 shadow-md">
      <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
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

      <Select value={subProjectFilter} onValueChange={setSubProjectFilter}>
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

      <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
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
      <Button variant="destructive" onClick={clearFilters}>
        Clear Filters
      </Button>
      <Alert
        variant="destructive"
        className="w-fit px-2 py-0 flex items-center justify-center gap-20"
      >
        <AlertCircle className="-mt-3" />
        <AlertDescription className="ml-2 mt-0.5 text-xs">
          If no results are displayed. Please adjust your filters and try again.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Filters;
