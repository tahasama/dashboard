"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import StatusChart from "./@supplier/StatusChart";
import LateAnalysis from "./@supplier/LateAnalysis";
import SankeyChart from "./@supplier/SankeyChart";
import SubmissionStatus from "./@supplier/SubmissionStatus";
import StatusOutcomeHeatMap from "./@workflow/StepStatusOutcomeChart";
import SankeyChartWorkFlow from "./@workflow/SankeyChartWorkFlow";

import WorkflowStepStatusChart from "./@workflow/WorkflowStepStatusChart";
import LateAnalysisReview from "./@workflow/LateAnalysisReview";
import LineTimeChart from "./LineTimeChart";
import ReviewStatus from "./@supplier/ReviewStatus";
import HeatX from "./@supplier/HeatX";
import DocsPerUserChart from "./@workflow/DocsPerUserChart";
import ExcelForm from "./ExcelForm";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [indexRows, setIndexRows] = useState<number[]>([8, 8, 8]);
  const [data, setData] = useState<any[][]>([]);
  const [originalData, setOriginalData] = useState(data);
  const [error, setError] = useState<string | null>(null);
  const [isReadyToGenerate, setIsReadyToGenerate] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [createdByFilter, setCreatedByFilter] = useState<string>("");
  const [subProjectFilter, setSubProjectFilter] = useState<string>("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyFilters();
  }, [createdByFilter, subProjectFilter, disciplineFilter]);

  const getUniqueValues = (data: any[][], column: string) => {
    const allValues = data.flatMap((fileData) =>
      fileData.map((row) => row[column])
    );
    return Array.from(new Set(allValues.filter(Boolean)));
  };

  const filterData = (
    data: any[][],
    createdBy: string,
    subProject: string,
    discipline: string
  ) => {
    // Define helper to filter and create a Set of matching keys
    const getMatchingPackages = (
      key: string,
      value: string,
      mapKey: string
    ): Set<string> =>
      new Set(
        data
          .flatMap((fileData) =>
            fileData
              .filter((row: any) => row[key] === value)
              .map((row: any) => row[mapKey])
          )
          .filter((value) => value)
      );

    // Filter based on the input conditions
    const createdByPackages = createdBy
      ? getMatchingPackages("Select List 5", createdBy, "Package Number")
      : null;

    const subProjectPackages = subProject
      ? getMatchingPackages("Select List 3", subProject, "Document No")
      : null;

    const disciplinePackages = discipline
      ? getMatchingPackages("Select List 1", discipline, "Document No")
      : null;

    // Combine filters
    const combineFilters = (row: any) => {
      const packageNumber = row["Package Number"];
      const relatedPackage = row["Related Package"];
      const documentNo = row["Document No"];
      const documentNoDot = row["Document No."];
      const documentKeys = [documentNo, documentNoDot].filter(Boolean);

      return (
        (!createdByPackages ||
          createdByPackages.has(packageNumber) ||
          createdByPackages.has(relatedPackage)) &&
        (!subProjectPackages ||
          documentKeys.some((doc) => subProjectPackages.has(doc))) &&
        (!disciplinePackages ||
          documentKeys.some((doc) => disciplinePackages.has(doc)))
      );
    };

    // Filter the data
    return data.map((fileData) => fileData.filter(combineFilters));
  };

  // const filterData = (data, createdBy, subProject, discipline) => {
  //   return data.map((fileData) =>
  //     fileData.filter((row) => {
  //       const matchesCreatedBy = createdBy
  //         ? row["Select List 5"] === createdBy
  //         : true;
  //       const matchesSubProject = subProject
  //         ? row["Select List 3"] === subProject
  //         : true;
  //       const matchesDiscipline = discipline
  //         ? row["Select List 1"] === discipline
  //         : true;

  //       // Row must match all selected filters
  //       return matchesCreatedBy && matchesSubProject && matchesDiscipline;
  //     })
  //   );
  // };

  const applyFilters = () => {
    setLoading(true);
    const filteredData = filterData(
      originalData,
      createdByFilter,
      subProjectFilter,
      disciplineFilter
    );
    setData(filteredData);
  };

  const expectedHeaders = [
    ["File", "Package Number", "Document No"],
    ["Workflow No.", "Workflow Name"],
  ];

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...files];
      newFiles[fileIndex] = file;
      setFiles(newFiles);
      setError(null);
      validateFiles(newFiles);
    }
  };

  const handleIndexRowChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileIndex: number
  ) => {
    const newIndexRows = [...indexRows];
    newIndexRows[fileIndex] = Number(e.target.value);
    setIndexRows(newIndexRows);
  };

  const validateFiles = (currentFiles: File[]) => {
    const allUploaded = expectedHeaders.every(
      (_, index) => !!currentFiles[index]
    );
    setIsReadyToGenerate(allUploaded);
  };

  const handleGenerate = () => {
    setLoading(true);
    setCreatedByFilter("");
    setSubProjectFilter("");
    setDisciplineFilter("");
    if (!isReadyToGenerate) {
      setError("Please upload all required files with correct headers.");
      return;
    }

    const allData: any[][] = [];
    let validationFailed = false;

    files.forEach((file, fileIndex) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const binaryStr = event.target?.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const headers: any = sheetData[indexRows[fileIndex]];
          const rows = sheetData.slice(indexRows[fileIndex] + 1);

          const isValidHeaders = expectedHeaders[fileIndex].every(
            (header, idx) => headers[idx] === header
          );

          if (!isValidHeaders) {
            validationFailed = true;
            setError(
              `File ${
                fileIndex + 1
              } has incorrect headers. Expected: ${expectedHeaders[
                fileIndex
              ].join(", ")}`
            );
            return;
          }

          const jsonData = rows.map((row: any) =>
            headers.reduce((acc: any, header: any, colIndex: number) => {
              acc[header] = row[colIndex] || "";
              return acc;
            }, {})
          );

          allData[fileIndex] = jsonData;

          if (fileIndex === files.length - 1 && !validationFailed) {
            setData(allData);
            setOriginalData(allData);
            setError(null);
          }
        } catch (err: any) {
          setError(`Error processing file ${fileIndex + 1}: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const labels: { [key: number]: string } = {
    0: "Supplier Docs",
    1: "Workflow Docs",
    2: "Other Docs",
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-5">
        <h1 className="text-xl font-semibold">Upload Your Documents</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 text-white rounded-md p-2"
        >
          {showForm ? "Hide Form" : "Upload"}
        </button>
      </div>

      {showForm && (
        <ExcelForm
          handleFileUpload={handleFileUpload}
          labels={labels}
          handleIndexRowChange={handleIndexRowChange}
          indexRows={indexRows}
          handleGenerate={handleGenerate}
          isReadyToGenerate={isReadyToGenerate}
          error={error}
        />
      )}

      {data.length > 0 && (
        <div className="mt-6">
          <div className="mb-4">
            <label>
              Filter by Created By:
              <select
                value={createdByFilter}
                onChange={(e) => setCreatedByFilter(e.target.value)}
              >
                <option value="">All</option>
                {getUniqueValues(originalData, "Select List 5").map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="ml-4">
              Filter by SubProject:
              <select
                value={subProjectFilter}
                onChange={(e) => setSubProjectFilter(e.target.value)}
              >
                <option value="">All</option>
                {getUniqueValues(originalData, "Select List 3").map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="ml-4">
              Filter by Discipline:
              <select
                value={subProjectFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
              >
                <option value="">All</option>
                {getUniqueValues(originalData, "Select List 1").map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={applyFilters}
              className="ml-4 bg-blue-500 text-white rounded-md px-4 py-2"
            >
              Apply Filters
            </button>
          </div>

          <ResizablePanelGroup direction="vertical">
            <ResizablePanel className="bg-slate-600 h-40">One</ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="bg-slate-400 h-40">Two</ResizablePanel>
          </ResizablePanelGroup>

          <div>
            {/* Chart Display Section */}
            {data.length > 0 && (
              <div className="space-y-12 mt-6">
                {/* Line Time Chart */}
                {/* <LineTimeChart
                  data={data}
                  loading={loading}
                  setLoading={setLoading}
                /> */}
                {/* Supplier Documents Charts */}

                <div className="h-screen flex flex-col">
                  <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={26}>
                      <ResizablePanelGroup direction="vertical">
                        <ResizablePanel>
                          <ReviewStatus data={data[0]} />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel>
                          <SubmissionStatus data={data[0]} />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel>
                          <StatusChart data={data[0]} />
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel>
                      <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={70}>
                          <LateAnalysis data={data[0]} />
                          {/* <HeatX data={data[0]} /> */}
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel>
                          <HeatX data={data[0]} />
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>

                {/* Workflow Charts */}

                <div className="bg-slate-300 flex w-full gap-0">
                  {/* Left Column: Doughnut Charts */}
                  <div className="flex flex-col justify-center w-3/12 py-1 pl-0.5">
                    <div className="m-[1px] bg-white rounded-md h-[66%]">
                      <DocsPerUserChart data={data[1]} />
                    </div>
                    <div className="m-[1px] bg-white rounded-md h-[33%]">
                      <WorkflowStepStatusChart data={data[1]} />
                    </div>
                  </div>
                  {/* Right Column: Detailed Charts */}
                  <div className="flex flex-col justify-between gap-0 mt-0.5 w-9/12 py-0.5 pr-0.5">
                    <div className="pt-4 pb-[3px] my-[1.5px] bg-white shadow-md rounded-md">
                      <LateAnalysisReview data={data[1]} />
                    </div>
                    <div className="pt-[0px] mb-1 bg-white shadow-md rounded-md">
                      <StatusOutcomeHeatMap data={data[1]} />
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <SankeyChart data={data[0]} />
                  <SankeyChartWorkFlow data={data[1]} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
