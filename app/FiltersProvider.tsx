"use client";
// FiltersContext.tsx
import { createContext, useContext, useState, useMemo } from "react";
import { MergedData } from "./types";

interface FiltersContextType {
  createdByFilter: string;
  subProjectFilter: string;
  disciplineFilter: string;
  statusFilter: string;
  originalData: MergedData[]; // Add originalData to the context type
  setCreatedByFilter: React.Dispatch<React.SetStateAction<string>>;
  setSubProjectFilter: React.Dispatch<React.SetStateAction<string>>;
  setDisciplineFilter: React.Dispatch<React.SetStateAction<string>>;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  clearFilters: () => void;
}

export const FiltersContext = createContext<FiltersContextType | undefined>(
  undefined // Set default context value to undefined
);

export const FiltersProvider = ({ children, originalData }: any) => {
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
      originalData, // Add originalData here
    }),
    [
      createdByFilter,
      subProjectFilter,
      disciplineFilter,
      statusFilter,
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
