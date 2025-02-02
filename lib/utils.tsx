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
      return "#63A8E6"; // Light Blue
    case "completed":
      return "#84C3A3"; // Green
    case "under review":
      return "#4C9A8F"; // Darker Green
    case "c1 reviewed & accepted as final & certified":
      return "#4682B4"; // Dark Blue for reviewed and approved
    case "approved":
      return "#4682B4"; // Dark Blue for reviewed and approved
    case "c2 reviewed & accepted as marked revise & resubmi":
      return "#5F9EA0"; // Blue for approved with comments
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
