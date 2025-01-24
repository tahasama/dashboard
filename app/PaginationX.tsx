import {
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationContent,
} from "@/components/ui/pagination";
import React, { memo, useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationX: React.FC<PaginationProps> = memo(
  ({ currentPage, totalPages, onPageChange }) => {
    const handlePreviousPage = () => {
      if (currentPage > 0) {
        onPageChange(currentPage - 1);
      }
    };

    const handleNextPage = () => {
      if (currentPage < totalPages - 1) {
        onPageChange(currentPage + 1);
      }
    };

    const renderPageLinks = () => {
      const paginationItems = [];

      // Add "1" always
      paginationItems.push(
        <button
          key="1"
          className={`px-3 py-1.5 rounded-lg border ${
            currentPage === 0
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          onClick={() => onPageChange(0)}
        >
          1
        </button>
      );

      // Add ellipsis if needed
      if (currentPage > 2) {
        paginationItems.push(<span key="startEllipsis">...</span>);
      }

      // Render middle pages near the current page
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(currentPage + 1, totalPages - 2);
        i++
      ) {
        paginationItems.push(
          <button
            key={i + 1}
            className={`px-3 py-1.5 rounded-lg border ${
              currentPage === i
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
            onClick={() => onPageChange(i)}
          >
            {i + 1}
          </button>
        );
      }

      // Add ellipsis if needed
      if (currentPage < totalPages - 3) {
        paginationItems.push(<span key="endEllipsis">...</span>);
      }

      // Add last page
      if (totalPages > 1) {
        paginationItems.push(
          <button
            key={totalPages}
            className={`px-3 py-1.5 rounded-lg border ${
              currentPage === totalPages - 1
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
            onClick={() => onPageChange(totalPages - 1)}
          >
            {totalPages}
          </button>
        );
      }

      return paginationItems;
    };

    return (
      <div className="flex items-center justify-between gap-0 w-[30vw] xl:w-[27vw] mb-0.5 text-sm">
        <button
          onClick={handlePreviousPage}
          className={`px-3 py-1.5 rounded-lg border ${
            currentPage === 0 ? "opacity-50" : "hover:bg-gray-200 text-gray-700"
          }`}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        {renderPageLinks()}
        <button
          onClick={handleNextPage}
          className={`px-3 py-1.5 rounded-lg border ${
            currentPage === totalPages - 1
              ? "opacity-50"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </button>
      </div>
    );
  }
);

export default PaginationX;
