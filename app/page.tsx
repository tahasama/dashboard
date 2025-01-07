"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import StatusChart from "./@supplier/StatusChart";
import WorkflowStatusChart from "./@workflow/WorkflowStatusChart";
import LateAnalysis from "./@supplier/LateAnalysis";
import SankeyChart from "./@supplier/SankeyChart";
import SubmissionStatus from "./@supplier/SubmissionStatus";
import StatusOutcomeHeatMap from "./@workflow/StepStatusOutcomeChart";
import SankeyChartWorkFlow from "./@workflow/SankeyChartWorkFlow";
import MonthlyPlannedSubmissionDates from "./@supplier/MonthlyPlannedSubmissionDates";

import WorkflowStepStatusChart from "./@workflow/WorkflowStepStatusChart";
import WorkflowOutcomeStatusChart from "./@workflow/WorkflowOutcomeStatusChart";
import LateAnalysisReview from "./@workflow/LateAnalysisReview";
import LineTimeChart from "./LineTimeChart";
import ReviewStatus from "./@supplier/ReviewStatus";
import HeatX from "./@supplier/HeatX";
import DocsPerUserChart from "./@workflow/DocsPerUserChart";
import ExcelForm from "./ExcelForm";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [indexRows, setIndexRows] = useState<number[]>([8, 8, 8]);
  const [data, setData] = useState<any[][]>([]);
  console.log("🚀 ~ Home ~ data:", data);
  const [error, setError] = useState<string | null>(null);
  const [isReadyToGenerate, setIsReadyToGenerate] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [createdByFilter, setCreatedByFilter] = useState<string>("");
  const [subProjectFilter, setSubProjectFilter] = useState<string>("");

  const getUniqueValues = (data: any[][], column: string) => {
    const allValues = data.flatMap((fileData) =>
      fileData.map((row) => row[column])
    );
    return Array.from(new Set(allValues.filter(Boolean)));
  };

  const filterData = (data: any[][], createdBy: string, subProject: string) => {
    // Handle "createdBy" filter
    const matchingPackages0 = new Set(
      data
        .flatMap((fileData) =>
          fileData
            .filter((row: any) => row["Select List 5"] === createdBy)
            .map((row: any) => row["Package Number"] || row["Related Package"])
        )
        .filter((value) => value)
    );

    const matchingPackages0result = data.map((fileData) =>
      fileData.filter((row: any) => {
        const packageNumber = row["Package Number"];
        const relatedPackage = row["Related Package"];
        return (
          matchingPackages0.has(packageNumber) ||
          matchingPackages0.has(relatedPackage)
        );
      })
    );

    // Handle "subProject" filter
    const matchingPackages1 = new Set(
      data
        .flatMap((fileData) =>
          fileData
            .filter((row: any) => row["Select List 3"] === subProject)
            .map((row: any) => row["Document No"] || row["Document No."])
        )
        .filter((value) => value)
    );

    const matchingPackages1result = data.map((fileData) =>
      fileData.filter((row: any) => {
        const documentNo = row["Document No"];
        const documentNoDot = row["Document No."];
        return (
          matchingPackages1.has(documentNo) ||
          matchingPackages1.has(documentNoDot)
        );
      })
    );

    // Combine filters if both are provided
    if (createdBy && subProject) {
      return matchingPackages0result.map((fileData, index) =>
        fileData.filter((row) =>
          matchingPackages1result[index].some(
            (filteredRow) => filteredRow === row
          )
        )
      );
    }

    // Return results for one filter
    if (createdBy) return matchingPackages0result;
    if (subProject) return matchingPackages1result;

    // Return original data if no filter
    return data;
  };

  const applyFilters = () => {
    const filteredData = filterData(data, createdByFilter, subProjectFilter);
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
                {getUniqueValues(data, "Select List 5").map((value) => (
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
                {getUniqueValues(data, "Select List 3").map((value) => (
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

          <div>
            {/* Chart Display Section */}
            {data.length > 0 && (
              <div className="space-y-12 mt-6">
                {/* Line Time Chart */}
                {/* <LineTimeChart data={data} /> */}
                {/* Supplier Documents Charts */}
                <div className="bg-slate-300 flex w-full gap-0">
                  {/* Left Column: Doughnut Charts */}
                  <div className="flex flex-col justify-center w-3/12 pl-0.5">
                    <div className="m-[1px] bg-white rounded-md">
                      <ReviewStatus data={data[0]} />
                    </div>
                    <div className="m-[1px] bg-white rounded-md">
                      <SubmissionStatus data={data[0]} />
                    </div>
                    <div className="m-[1px] bg-white rounded-md">
                      <StatusChart data={data[0]} />
                    </div>
                  </div>
                  {/* Right Column: Detailed Charts */}
                  <div className="flex flex-col justify-between gap-0 mt-0.5 w-9/12 py-0.5 pr-0.5">
                    <div className="pt-4 pb-[3px] my-[1.5px] bg-white shadow-md rounded-md">
                      <LateAnalysis data={data[0]} />
                    </div>
                    <div className="pt-[0px] mb-1 bg-white shadow-md rounded-md">
                      <HeatX data={data[0]} />
                    </div>
                    {/* </div> */}
                  </div>
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
