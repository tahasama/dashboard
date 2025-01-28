"use client";
import React, { createContext, useContext, useState } from "react";

interface PaginationContextProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
}

const PaginationContext = createContext<PaginationContextProps | undefined>(
  undefined
);

export const usePagination = () => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error("usePagination must be used within PaginationProvider");
  }
  return context;
};

export const PaginationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);

  return (
    <PaginationContext.Provider
      value={{ currentPage, setCurrentPage, rowsPerPage, setRowsPerPage }}
    >
      {children}
    </PaginationContext.Provider>
  );
};
