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
  return data.filter((row: MergedData) => {
    // Check if each row matches the selected filter values
    const matchesCreatedBy = createdBy ? row.selectList5 === createdBy : true;
    const matchesSubProject = subProject
      ? row.selectList3 === subProject
      : true;
    const matchesDiscipline = discipline
      ? row.selectList1 === discipline
      : true;
    const matchesStatus = status ? row.reviewStatus === status : true;

    // Only include rows that match all active filter criteria
    return (
      matchesCreatedBy &&
      matchesSubProject &&
      matchesDiscipline &&
      matchesStatus
    );
  });
};

export const toCamelCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase());
};
