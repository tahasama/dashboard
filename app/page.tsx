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

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [indexRows, setIndexRows] = useState<number[]>([8, 8, 8]);
  const [data, setData] = useState<any[][]>([]);
  const [error, setError] = useState<string | null>(null); // Error state
  const [isReadyToGenerate, setIsReadyToGenerate] = useState<boolean>(false); // Generate button readiness

  const expectedHeaders = [
    ["File", "Package Number", "Document No"], // Expected headers for file 1
    ["Workflow No.", "Workflow Name"], // Expected headers for file 2
    // ["Other A", "Other B", "Other C"], // Expected headers for file 3
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
      setError(null); // Reset error when uploading a new file
      validateFiles(newFiles); // Validate files on every upload
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
          const headers: any = sheetData[indexRows[fileIndex]]; // Use indexRow for the current file
          const rows = sheetData.slice(indexRows[fileIndex] + 1);

          // Validate headers
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

          // Map rows to JSON objects
          const jsonData = rows.map((row: any) =>
            headers.reduce((acc: any, header: any, colIndex: number) => {
              acc[header] = row[colIndex] || "";
              return acc;
            }, {})
          );

          // Add table data
          allData[fileIndex] = jsonData;

          if (fileIndex === files.length - 1 && !validationFailed) {
            setData(allData);
            setError(null); // Reset error if validation passes
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
    <div className="p-0 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-6">
        Excel to Table and Chart
      </h1>
      <div>
        {/* File Upload Section */}
        {[0, 1].map((fileIndex: number) => (
          <div key={fileIndex} className="mb-6">
            <label
              htmlFor={`file-input-${fileIndex}`}
              className="block font-medium text-gray-700 mb-2"
            >
              {labels[fileIndex]}
            </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => handleFileUpload(e, fileIndex)}
              id={`file-input-${fileIndex}`}
              className="block mb-2 p-2 border rounded w-full"
            />
            <input
              value={indexRows[fileIndex]}
              onChange={(e) => handleIndexRowChange(e, fileIndex)}
              type="number"
              className="p-2 border rounded w-full"
              placeholder="Header Row Index"
            />
          </div>
        ))}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className={`px-6 py-3 text-lg rounded w-full transition-colors ${
            isReadyToGenerate
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
          disabled={!isReadyToGenerate}
        >
          Generate
        </button>

        {/* Error Message */}
        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
      </div>
      <div>
        {/* Chart Display Section */}
        {data.length > 0 && (
          <div className="space-y-12 mt-6">
            {/* Line Time Chart */}
            {/* <LineTimeChart data={data} /> */}
            {/* <PieChartWithLabels /> */}
            {/* <SubmissionStatus data={data[0]} /> */}

            {/* Supplier Documents Charts */}
            <div className="bg-slate-300 flex w-full gap-0">
              {/* Left Column: Doughnut Charts */}
              {/* <div className="flex w-full justify-center gap-4"> */}
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
                  {/* <MonthlyPlannedSubmissionDates data={data[0]} /> */}
                  <HeatX data={data[0]} />
                </div>
                {/* </div> */}
              </div>
            </div>

            {/* Workflow Charts */}

            <div className="bg-slate-300 flex w-full gap-0">
              {/* Left Column: Doughnut Charts */}
              {/* <div className="flex w-full justify-center gap-4"> */}
              <div className="flex flex-col justify-center w-3/12 py-1 pl-0.5">
                {/* <div className="m-[1px] bg-white rounded-md">
                </div> */}
                <div className="m-[1px] bg-white rounded-md h-[66%]">
                  <DocsPerUserChart data={data[1]} />
                </div>

                <div className="m-[1px] bg-white rounded-md h-[33%]">
                  <WorkflowStepStatusChart data={data[1]} />
                </div>

                {/* <div className="m-[1px] bg-white rounded-md">
                  <WorkflowStatusChart data={data[1]} />
                </div> */}
              </div>
              {/* Right Column: Detailed Charts */}
              <div className="flex flex-col justify-between gap-0 mt-0.5 w-9/12 py-0.5 pr-0.5">
                <div className="pt-4 pb-[3px] my-[1.5px] bg-white shadow-md rounded-md">
                  <LateAnalysisReview data={data[1]} />
                </div>
                {/* <div className=" my-[1.5px] bg-white shadow-md rounded-md">
                  <DocsPerUserChart data={data[1]} />
                </div> */}

                <div className="pt-[0px] mb-1 bg-white shadow-md rounded-md">
                  <StatusOutcomeHeatMap data={data[1]} />
                </div>
                {/* </div> */}
              </div>
            </div>
            <SankeyChart data={data[0]} />
            <SankeyChartWorkFlow data={data[1]} />
          </div>
        )}
      </div>
    </div>
  );
}
