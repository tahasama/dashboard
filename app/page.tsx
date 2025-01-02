"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import StatusChart from "./@supplier/StatusChart";
import WorkflowStatusChart from "./@workflow/WorkflowStatusChart";
import LateAnalysis from "./@supplier/LateAnalysis";
import ReviewChart from "./@supplier/Review Status";
import SankeyChart from "./@supplier/SankeyChart";
import SubmissionStatus from "./@supplier/SubmissionStatus";
import StatusOutcomeHeatMap from "./@workflow/StepStatusOutcomeChart";
import SankeyChartWorkFlow from "./@workflow/SankeyChartWorkFlow";
import MonthlyPlannedSubmissionDates from "./@workflow/MonthlyPlannedSubmissionDates";
import WorkflowStepStatusChart from "./@workflow/WorkflowStepStatusChart";
import WorkflowOutcomeStatusChart from "./@workflow/WorkflowOutcomeStatusChart";
import LateAnalysisReview from "./@workflow/LateAnalysisReview";
import LineTimeChart from "./LineTimeChart";

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
        } catch (err) {
          setError(`Error processing file ${fileIndex + 1}: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const labels = { 0: "Supplier Docs", 1: "Workflow Docs", 2: "Other Docs" };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Excel to Table and Chart</h1>
      {[0, 1].map((fileIndex) => (
        <div key={fileIndex} className="mb-4">
          <label htmlFor="">{labels[fileIndex]}</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileUpload(e, fileIndex)}
            className="mb-2"
            id={fileIndex}
          />
          <input
            value={indexRows[fileIndex]}
            onChange={(e) => handleIndexRowChange(e, fileIndex)}
            type="number"
            className="text-black"
            placeholder="Header Row Index"
          />
        </div>
      ))}
      <button
        onClick={handleGenerate}
        className={`px-4 py-2 rounded ${
          isReadyToGenerate ? "bg-blue-500 text-white" : "bg-gray-400"
        }`}
        disabled={!isReadyToGenerate}
      >
        Generate
      </button>

      {/* Display Error */}
      {error && <div className="text-red-500 mt-4">{error}</div>}

      {/* Render Charts if data is available */}
      {data.length > 0 && (
        <div className="mt-6">
          <LineTimeChart data={data} />
          <div>
            <div className="flex justify-evenly">
              <StatusChart data={data[0]} />
              <ReviewChart data={data[0]} />
              <SubmissionStatus data={data[0]} />
            </div>
            <LateAnalysis data={data[0]} />
            <SankeyChart data={data[0]} />
            <MonthlyPlannedSubmissionDates data={data[0]} />
          </div>

          <div className="w-full">
            <div className="flex justify-evenly">
              <WorkflowStatusChart data={data[1]} />
              <WorkflowStepStatusChart data={data[1]} />
              <WorkflowOutcomeStatusChart data={data[1]} />
            </div>

            <LateAnalysisReview data={data[1]} />
            <StatusOutcomeHeatMap data={data[1]} />
            <SankeyChartWorkFlow data={data[1]} />
          </div>
        </div>
      )}
    </div>
  );
}
