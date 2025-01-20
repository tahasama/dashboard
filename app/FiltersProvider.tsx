"use client";
import { filterData } from "@/lib/utils";
// FiltersContext.tsx
import { createContext, useContext, useState, useMemo } from "react";

type FiltersContextType = {
  createdByFilter: string;
  subProjectFilter: string;
  disciplineFilter: string;
  statusFilter: string;
  setCreatedByFilter: React.Dispatch<React.SetStateAction<string>>;
  setSubProjectFilter: React.Dispatch<React.SetStateAction<string>>;
  setDisciplineFilter: React.Dispatch<React.SetStateAction<string>>;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
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

  const clearFilters = () => {
    setCreatedByFilter("");
    setSubProjectFilter("");
    setDisciplineFilter("");
    setStatusFilter("");
  };

  const filtered = useMemo(() => {
    return filterData(
      originalData,
      createdByFilter === "all" ? "" : createdByFilter,
      subProjectFilter === "all" ? "" : subProjectFilter,
      disciplineFilter === "all" ? "" : disciplineFilter,
      statusFilter === "all" ? "" : statusFilter
    );
  }, [
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
      setCreatedByFilter,
      setSubProjectFilter,
      setDisciplineFilter,
      setStatusFilter,
      clearFilters,
      filtered,
      originalData, // Include originalData here
    }),
    [
      createdByFilter,
      subProjectFilter,
      disciplineFilter,
      statusFilter,
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
