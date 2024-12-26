"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import StatusChart from "./StatusChart";
import SubmissionStatus from "./SubmissionStatus";
import ReviewChart from "./Review Status";
import DaysLateAnalysis from "./DaysLateAnalysis";
import MonthlyPlannedSubmissionDates from "./MonthlyPlannedSubmissionDates";
import DaysLateAnalysisByMonth from "./DaysLateAnalysisByMonth";
import LateAnalysis from "./LateAnalysis";
import SankeyChart from "./SankeyChart";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]); // Store the uploaded files
  const [indexRows, setIndexRows] = useState<number[]>([0, 0, 0]); // Index for headers for each file
  const [data, setData] = useState<any[][]>([]); // Holds table data for all files

  // Handle file upload
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...files];
      newFiles[fileIndex] = file;
      setFiles(newFiles);
    }
  };

  // Handle row index input change
  const handleIndexRowChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileIndex: number
  ) => {
    const newIndexRows = [...indexRows];
    newIndexRows[fileIndex] = Number(e.target.value);
    setIndexRows(newIndexRows);
  };

  // Process all files and generate tables and charts
  const handleGenerate = () => {
    const allData: any[][] = [];

    files.forEach((file, fileIndex) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target?.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers: any = sheetData[indexRows[fileIndex]]; // Use indexRow for the current file
        const rows = sheetData.slice(indexRows[fileIndex] + 1);

        // Map rows to JSON objects
        const jsonData = rows.map((row: any) =>
          headers.reduce((acc: any, header: any, colIndex: number) => {
            acc[header] = row[colIndex] || "";
            return acc;
          }, {})
        );

        // Add table data
        allData[fileIndex] = jsonData;
        // Update state
        if (fileIndex === files.length - 1) {
          setData(allData);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Excel to Table and Chart</h1>
      {[0, 1, 2].map((fileIndex) => (
        <div key={fileIndex} className="mb-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileUpload(e, fileIndex)}
            className="mb-2"
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
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate
      </button>

      {/* Render SubmissionStatusChart only if chartData is available */}
      {data.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-evenly">
            <StatusChart data={data} />
            <SubmissionStatus data={data} />
            <ReviewChart data={data} />
          </div>
          <div className="w-full">
            <LateAnalysis data={data} />
            <MonthlyPlannedSubmissionDates data={data} />
            <SankeyChart data={data} />
          </div>
        </div>
      )}
    </div>
  );
}
