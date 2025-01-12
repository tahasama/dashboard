"use client";
import { Suspense, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import Filters from "./Filters";
import { AreaH } from "./HomePageCharts/AreaH";
import { BarH } from "./HomePageCharts/BarH";
import { PieH } from "./HomePageCharts/PieH";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [indexRows, setIndexRows] = useState<number[]>([8, 8, 8]);
  const [data, setData] = useState<any[][]>([]);
  const [originalData, setOriginalData] = useState(data);
  const [error, setError] = useState<string | null>(null);
  const [isReadyToGenerate, setIsReadyToGenerate] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
    // setOpen(false);
  };

  const labels: { [key: number]: string } = {
    0: "Supplier Docs",
    1: "Workflow Docs",
    2: "Other Docs",
  };

  return (
    <div className="">
      {data.length <= 0 && (
        <div className="flex flex-col items-center h-screen">
          <h1 className="font-bold text-center mt-4 mb-4">
            Document Data Report Creator
          </h1>
          <h2 className="mt-4 mb-10">
            Create your reports, and generate insightful charts
          </h2>
          <ExcelForm
            handleFileUpload={handleFileUpload}
            labels={labels}
            handleIndexRowChange={handleIndexRowChange}
            indexRows={indexRows}
            handleGenerate={handleGenerate}
            isReadyToGenerate={isReadyToGenerate}
            error={error}
          />
          <div className="flex flex-col justify-center w-[75vw] items-center h-full">
            <div className="flex gap-4 w-full">
              <AreaH />
              <BarH />
              <PieH />
            </div>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div className="-mt-2">
          <div>
            {/* Chart Display Section */}
            {data.length > 0 && (
              <div className="relative">
                <Filters
                  originalData={originalData}
                  setData={setData}
                  handleFileUpload={handleFileUpload}
                  labels={labels}
                  handleIndexRowChange={handleIndexRowChange}
                  indexRows={indexRows}
                  handleGenerate={handleGenerate}
                  isReadyToGenerate={isReadyToGenerate}
                  error={error}
                  setLoading={setLoading}
                />
                {/* <LineTimeChart
                  data={data}
                  loading={loading}
                  setLoading={setLoading}
                /> */}

                {/* Supplier Documents Charts */}

                <div className="bg-slate- p-2 mx-1 rounded-md -mt-1 flex h-[calc(100vh-60px)] w- shadow-md">
                  <ResizablePanelGroup direction="horizontal" className="">
                    <ResizablePanel defaultSize={24}>
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
                        <ResizablePanel defaultSize={72}>
                          <LateAnalysis data={data[0]} />
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
                <div className="bg-slate- p-2 mx-1 rounded-md mt-4 flex h-[calc(100vh-60px)] w- shadow-md">
                  <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={24}>
                      <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={60}>
                          <DocsPerUserChart data={data[1]} />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel>
                          <WorkflowStepStatusChart data={data[1]} />
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel>
                      <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={72}>
                          <LateAnalysisReview data={data[1]} />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel>
                          <StatusOutcomeHeatMap data={data[1]} />
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>

                {/* Line Time Chart */}
                <Suspense fallback={"........tseeeenna"}>
                  <LineTimeChart
                    data={data}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </Suspense>

                {/* <div className="h-[calc(100vh-60px)] mt-8">
                  <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel>
                      <SankeyChart data={data[0]} />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel>
                      <SankeyChartWorkFlow data={data[1]} />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div> */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
