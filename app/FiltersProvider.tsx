"use client";
import { filterData } from "@/lib/utils";
// FiltersContext.tsx
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
};

export const FiltersContext = createContext<FiltersContextType | undefined>(
  undefined
);

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

    // Cleanup the timeout if the searchText changes before the timeout finishes
    return () => clearTimeout(timer);
  }, [searchText]);

  const filtered = useMemo(() => {
    let data = originalData;

    // First apply the debounced search text filter if it's present
    if (debouncedSearchText) {
      data = data.filter(
        (item: MergedData) =>
          item.documentNo.includes(debouncedSearchText) ||
          item.title.toLowerCase().includes(debouncedSearchText.toLowerCase())
      );
    }

    // Then apply the other filters (if they're not set to "all")
    data = filterData(
      data,
      createdByFilter === "all" ? "" : createdByFilter,
      subProjectFilter === "all" ? "" : subProjectFilter,
      disciplineFilter === "all" ? "" : disciplineFilter,
      statusFilter === "all" ? "" : statusFilter
    );

    return data;
  }, [
    createdByFilter,
    subProjectFilter,
    disciplineFilter,
    statusFilter,
    debouncedSearchText,
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
      filtered,
      originalData,
    }),
    [
      createdByFilter,
      subProjectFilter,
      disciplineFilter,
      statusFilter,
      searchText,
      filtered,
      originalData,
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
