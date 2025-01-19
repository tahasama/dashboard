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
