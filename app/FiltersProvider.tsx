"use client";
import React, { createContext, useContext, useState, useMemo } from "react";

export type FiltersContextType = {
  createdByFilter: string;
  subProjectFilter: string;
  disciplineFilter: string;
  statusFilter: string;
  setCreatedByFilter: React.Dispatch<React.SetStateAction<string>>;
  setSubProjectFilter: React.Dispatch<React.SetStateAction<string>>;
  setDisciplineFilter: React.Dispatch<React.SetStateAction<string>>;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  clearFilters: () => void;
};

const FiltersContext = createContext<FiltersContextType | null>(null);

export const useFilters: any = () => {
  return useContext(FiltersContext);
};

export const FiltersProvider = ({ children }: any) => {
  const [createdByFilter, setCreatedByFilter] = useState<string>("");
  const [subProjectFilter, setSubProjectFilter] = useState<string>("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const clearFilters = () => {
    setCreatedByFilter("all");
    setSubProjectFilter("all");
    setDisciplineFilter("all");
    setStatusFilter("all");
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
    }),
    [createdByFilter, subProjectFilter, disciplineFilter, statusFilter]
  );

  return (
    <FiltersContext.Provider value={filters}>
      {children}
    </FiltersContext.Provider>
  );
};
