import { MergedData } from "@/app/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const filterData = (
  data: any[],
  createdBy: string,
  subProject: string,
  discipline: string,
  status: string
) => {
  const filterConditions = {
    createdBy: createdBy === "all" ? null : createdBy,
    subProject: subProject === "all" ? null : subProject,
    discipline: discipline === "all" ? null : discipline,
    status: status === "all" ? null : status,
  };

  return data.filter((row: MergedData) => {
    return (
      (!filterConditions.createdBy ||
        row.selectList5 === filterConditions.createdBy) &&
      (!filterConditions.subProject ||
        row.selectList3 === filterConditions.subProject) &&
      (!filterConditions.discipline ||
        row.selectList1 === filterConditions.discipline) &&
      (!filterConditions.status || row.reviewStatus === filterConditions.status)
    );
  });
};

export const toCamelCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase());
};

export const getStatusColor = (status: string): string => {
  switch (status?.trim().toLowerCase()) {
    case "submitted":
      return "#78a8cf"; // Light Blue
    case "completed":
      return "#84C3A3"; // Green
    // return "#84C3A3"; // Green
    case "under review":
      return "#4C9A8F"; // Darker Green
    case "c1 reviewed & accepted as final & certified":
      return "#63A8E6"; // Dark Blue for reviewed and approved
    // return "#4682B4"; // Dark Blue for reviewed and approved
    case "approved":
      return "#4682B4"; // Dark Blue for reviewed and approved
    case "c2 reviewed & accepted as marked revise & resubmi":
      return "#B58ED2"; // Blue for approved with comments
    case "c3 reviewed & returned correct and resubmit":
      return "#FF4D4D"; // Red for rejected
    case "c4 review not required for information only":
      return "#A9A9A9"; // Gray for information only
    case "submission required":
      return "#b0e0e6"; // Light Coral for submission required
    default:
      console.warn("Unknown status:", status); // Log unknown statuses
      return "#CCCCCC"; // Default gray for unknown statuses
  }
};

export const parseDates = (dateString: string) => {
  const excelBaseDate = new Date(1899, 11, 30).getTime();
  if (typeof dateString !== "string" && dateString !== null) {
    dateString = String(dateString);
  }

  if (typeof dateString === "string") {
    const trimmedDate = dateString.trim();
    const excelNumber = Number(trimmedDate);
    if (!isNaN(excelNumber) && excelNumber > 0) {
      return new Date(excelBaseDate + excelNumber * 24 * 60 * 60 * 1000);
    }
    if (trimmedDate.includes("/")) {
      const parts = trimmedDate.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    const date = new Date(trimmedDate);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
};

export const excelDateToJSDate = (serial: number): string => {
  // Handle Excel's leap year bug (1900 is not a leap year but Excel thinks it is)
  const utcDays = Math.floor(serial - 25569); // Adjust for Excel/JS epoch difference
  const utcValue = utcDays * 86400000; // Milliseconds per day
  const dateInfo = new Date(utcValue);

  // Fix date shift for dates after February 28, 1900
  if (serial >= 60) {
    dateInfo.setTime(dateInfo.getTime() - 86400000);
  }

  return dateInfo.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
