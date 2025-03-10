"use client";
import { filterData } from "@/lib/utils";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { MergedData } from "./types";

type FiltersContextType = {
  createdByFilter: string;
  subProjectFilter: string;
  disciplineFilter: string;
  statusFilter: string;
  // subStatusFilter: string;
  searchText: string;
  isCheckedS: boolean;
  setisCheckedS: React.Dispatch<React.SetStateAction<boolean>>;
  isCheckedR: boolean;
  setIsCheckedR: React.Dispatch<React.SetStateAction<boolean>>;
  selectedStatus: any;
  setSelectedStatus: any;
  setCreatedByFilter: React.Dispatch<React.SetStateAction<string>>;
  setSubProjectFilter: React.Dispatch<React.SetStateAction<string>>;
  setDisciplineFilter: React.Dispatch<React.SetStateAction<string>>;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  // setSubStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  clearFilters: () => void;
  filtered: any[];
  originalData: any[];
  uniqueSubProjects: string[];
  uniqueCreatedBy: string[];
  uniqueDisciplines: string[];
  // uniqueStatuses: string[];
  // uniqueSubStatuses: string[];
  uniqueReviewStatuses: string[];
  uniqueSubmissionStatuses: string[];
  contentRef: any;
  content2Ref: any;
};

export const FiltersContext = createContext<FiltersContextType | undefined>(
  undefined
);

// FiltersProvider component
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
  const [subStatusFilter, setSubStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");

  const [selectedStatus, setSelectedStatus] = useState<any>(
    statusFilter || { review: "", submission: "" }
  );

  const [filteredData, setFilteredData] = useState<any[]>(originalData);

  const [isCheckedS, setisCheckedS] = useState(false);
  const [isCheckedR, setIsCheckedR] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const content2Ref = useRef<HTMLDivElement>(null);

  const getUniqueValues = (data: any[], column: string) =>
    Array.from(new Set(data.map((item) => item[column]).filter(Boolean)));

  const uniqueSubProjects = useMemo(
    () => getUniqueValues(originalData, "selectList3"),
    [originalData]
  );
  const uniqueCreatedBy = useMemo(
    () => getUniqueValues(originalData, "selectList5"),
    [originalData]
  );
  const uniqueDisciplines = useMemo(
    () => getUniqueValues(originalData, "selectList1"),
    [originalData]
  );
  // const uniqueStatuses = useMemo(() => {
  //   const reviewStatuses = new Set(
  //     getUniqueValues(originalData, "reviewStatus")
  //   );
  //   const stepStatuses = new Set(getUniqueValues(originalData, "stepOutcome"));
  //   const submissionStatuses = new Set(
  //     getUniqueValues(originalData, "submissionStatus")
  //   );

  //   return Array.from(
  //     new Set([...reviewStatuses, ...stepStatuses, ...submissionStatuses])
  //   );
  // }, [originalData]);

  // const uniqueSubStatuses = useMemo(
  //   () => getUniqueValues(originalData, "submissionStatus"),
  //   [originalData]
  // );

  const uniqueReviewStatuses = useMemo(() => {
    return Array.from(
      new Set(
        getUniqueValues(originalData, "reviewStatus").concat(
          getUniqueValues(originalData, "stepOutcome")
        )
      )
    ).filter((value) => value !== "None"); // Exclude "None"
  }, [originalData]);

  const uniqueSubmissionStatuses = useMemo(() => {
    return getUniqueValues(originalData, "submissionStatus").filter(
      (value) => value !== "None"
    );
  }, [originalData]);

  const clearFilters = () => {
    setCreatedByFilter("");
    setSubProjectFilter("");
    setDisciplineFilter("");
    setStatusFilter("");
    setSearchText(""); // Clear the searchText as well
    setSubStatusFilter("");
    setSelectedStatus({ review: "", submission: "" });
  };

  // Debounce the search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // Debounce time (500ms)

    return () => clearTimeout(timer); // Cleanup the timeout if the searchText changes before the timeout finishes
  }, [searchText]);

  // Web Worker filtering logic
  useEffect(() => {
    const worker = new Worker("/filterWorker.js");

    // Send the filtering data to the worker
    worker.postMessage({
      data: originalData,
      filters: {
        searchText: debouncedSearchText,
        createdByFilter,
        subProjectFilter,
        disciplineFilter,
        statusFilter,
        selectedStatus,
        // subStatusFilter,
      },
    });

    // Listen for the result of the filtering from the worker
    worker.onmessage = (e) => {
      setFilteredData(e.data); // Update filtered data
    };

    return () => {
      worker.terminate(); // Cleanup worker on component unmount
    };
  }, [
    debouncedSearchText,
    createdByFilter,
    subProjectFilter,
    disciplineFilter,
    statusFilter,
    subStatusFilter,
    originalData,
    selectedStatus,
  ]);

  const filters = useMemo(
    () => ({
      createdByFilter,
      subProjectFilter,
      disciplineFilter,
      statusFilter,
      searchText,
      subStatusFilter,
      selectedStatus,
      isCheckedS,
      setisCheckedS,
      isCheckedR,
      setIsCheckedR,
      setCreatedByFilter,
      setSubProjectFilter,
      setDisciplineFilter,
      setStatusFilter,
      setSearchText,
      setSubStatusFilter,
      setSelectedStatus,
      clearFilters,
      filtered: filteredData,
      originalData,
      uniqueSubProjects, // Add uniqueSubProjects here
      uniqueCreatedBy, // Add uniqueCreatedBy here
      uniqueDisciplines, // Add uniqueDisciplines here
      // uniqueStatuses, // Add uniqueStatuses here
      // uniqueSubStatuses,
      uniqueReviewStatuses,
      uniqueSubmissionStatuses,
      contentRef,
      content2Ref,
    }),
    [
      createdByFilter,
      subProjectFilter,
      disciplineFilter,
      statusFilter,
      searchText,
      filteredData,
      originalData,
      uniqueSubProjects,
      uniqueCreatedBy,
      uniqueDisciplines,
      // uniqueStatuses,
      uniqueReviewStatuses,
      uniqueSubmissionStatuses,
      contentRef,
      content2Ref,
      // uniqueSubStatuses,
      isCheckedS,
      isCheckedR,
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
