"use client";
import { filterData } from "@/lib/utils";
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { MergedData } from "./types";

type FiltersContextType = {
  createdByFilter: string;
  subProjectFilter: string;
  disciplineFilter: string;
  statusFilter: string;
  searchText: string;
  setCreatedByFilter: React.Dispatch<React.SetStateAction<string>>;
  setSubProjectFilter: React.Dispatch<React.SetStateAction<string>>;
  setDisciplineFilter: React.Dispatch<React.SetStateAction<string>>;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  clearFilters: () => void;
  filtered: any[]; // Assuming your filtered data is an array
  originalData: any[]; // Add originalData here to match its expected type
  uniqueSubProjects: string[]; // Add this
  uniqueCreatedBy: string[]; // Add this
  uniqueDisciplines: string[]; // Add this
  uniqueStatuses: string[]; // Add this
};

export const FiltersContext = createContext<FiltersContextType | undefined>(
  undefined
);

// FiltersProvider component
export const FiltersProvider = ({
  children,
  originalData,
}: {
  children: React.ReactNode;
  originalData: any[];
}) => {
  const [createdByFilter, setCreatedByFilter] = useState<string>("");
  const [subProjectFilter, setSubProjectFilter] = useState<string>("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");

  const [filteredData, setFilteredData] = useState<any[]>(originalData);

  const getUniqueValues = (data: any[], column: string) =>
    Array.from(new Set(data.map((item) => item[column]).filter(Boolean)));

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

  const clearFilters = () => {
    setCreatedByFilter("");
    setSubProjectFilter("");
    setDisciplineFilter("");
    setStatusFilter("");
    setSearchText(""); // Clear the searchText as well
  };

  // Debounce the search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // Debounce time (500ms)

    return () => clearTimeout(timer); // Cleanup the timeout if the searchText changes before the timeout finishes
  }, [searchText]);

  // Web Worker filtering logic
  useEffect(() => {
    const worker = new Worker("/filterWorker.js");

    // Send the filtering data to the worker
    worker.postMessage({
      data: originalData,
      filters: {
        searchText: debouncedSearchText,
        createdByFilter,
        subProjectFilter,
        disciplineFilter,
        statusFilter,
      },
    });

    // Listen for the result of the filtering from the worker
    worker.onmessage = (e) => {
      setFilteredData(e.data); // Update filtered data
    };

    return () => {
      worker.terminate(); // Cleanup worker on component unmount
    };
  }, [
    debouncedSearchText,
    createdByFilter,
    subProjectFilter,
    disciplineFilter,
    statusFilter,
    originalData,
  ]);

  const filters = useMemo(
    () => ({
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
      filtered: filteredData,
      originalData,
      uniqueSubProjects, // Add uniqueSubProjects here
      uniqueCreatedBy, // Add uniqueCreatedBy here
      uniqueDisciplines, // Add uniqueDisciplines here
      uniqueStatuses, // Add uniqueStatuses here
    }),
    [
      createdByFilter,
      subProjectFilter,
      disciplineFilter,
      statusFilter,
      searchText,
      filteredData,
      originalData,
      uniqueSubProjects,
      uniqueCreatedBy,
      uniqueDisciplines,
      uniqueStatuses,
    ]
  );

  return (
    <FiltersContext.Provider value={filters}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
};
