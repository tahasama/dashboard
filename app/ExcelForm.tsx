"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

import { useState } from "react";

import { useRouter } from "next/navigation";

const ExcelForm = ({}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog visibility
  const [indexRows, setIndexRows] = useState<number[]>([8, 8, 8]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<any>("");
  const [isReadyToGenerate, setIsReadyToGenerate] = useState<boolean>(false);
  const router = useRouter();

  // Create new project (POST)
  const createNewProject = async (projectNumber: string, mergedData: any[]) => {
    const response = await fetch(`/api/projects/${projectNumber}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mergedData, // Match API expectation
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create project ${projectNumber}: ${response.statusText}`
      );
    }
  };

  // Update existing project (PUT)
  const updateProjectData = async (
    projectNumber: string,
    mergedData: any[]
  ) => {
    const response = await fetch(`/api/projects/${projectNumber}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mergedData, // Match API expectation
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update project ${projectNumber}: ${response.statusText}`
      );
    }
  };

  // Handle opening of the dialog
  // const openDialog = () => setIsDialogOpen(true);

  // Handle closing of the dialog
  const closeDialog = () => setIsDialogOpen(false);

  // Handle "Generate" button click
  const handleGenerateClick = async () => {
    if (error) {
      return; // Don't close the dialog if there's an error
    }

    // Proceed with the generate logic and close dialog if no error
    const result = await handleGenerate();
    if (!!error) {
      closeDialog(); // Close dialog only if there's no error
    }
  };

  const expectedHeaders = [
    ["File", "Package Number", "Document No"],
    ["Workflow No.", "Workflow Name"],
  ];

  const validateFiles = (currentFiles: File[]) => {
    const allUploaded = expectedHeaders.every(
      (_, index) => !!currentFiles[index]
    );
    setIsReadyToGenerate(allUploaded);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileIndex: number
  ) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...files];
      newFiles[fileIndex] = file;
      setFiles(newFiles);
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

  // Function to filter and retain only necessary columns
  const filterColumns = (data: any[], requiredColumns: string[]) => {
    return data.map((row) =>
      requiredColumns.reduce((filteredRow, column) => {
        filteredRow[column] = row[column] || ""; // Retain only required columns
        return filteredRow;
      }, {} as Record<string, any>)
    );
  };

  const handleGenerate = async () => {
    if (!isReadyToGenerate) {
      setError("Please upload all required files with correct headers.");
      return;
    }

    const allData: any[][] = [];
    let validationFailed = false;

    files.forEach((file, fileIndex) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
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
            const firstFileColumns = [
              "Document No",
              "Title",
              "Submission Status",
              "Review Status",
              "Created By",
              "Days Late",
              "Planned Submission Date",
              "Select List 1",
              "Select List 3",
              "Select List 5",
              "Status",
            ];
            const secondFileColumns = [
              "Document No.",
              "Document Title",
              "Assigned To",
              "Step Status",
              "Original Due Date",
              "Days Late",
              "Date In",
              "Date Completed",
            ];

            const filteredFirstFileData = filterColumns(
              allData[0],
              firstFileColumns
            );
            const filteredSecondFileData = filterColumns(
              allData[1],
              secondFileColumns
            );

            const mergedData = mergeFileData(
              filteredFirstFileData,
              filteredSecondFileData
            );

            const projectNumber = mergedData[0].documentNo?.split("-")[0];

            if (projectNumber) {
              try {
                const existingProjectResponse = await fetch(
                  `/api/projects/${projectNumber}`
                );

                if (existingProjectResponse.ok) {
                  await updateProjectData(projectNumber, mergedData);
                } else {
                  await createNewProject(projectNumber, mergedData);
                }

                setError(null);
                router.push(`/report/${projectNumber}`);
              } catch (err: any) {
                setError(
                  `Error processing project ${projectNumber}: ${err.message}`
                );
              }
            }
          }
        } catch (err: any) {
          setError(`Error processing file ${fileIndex + 1}: ${err.message}`);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  };

  // Helper function to merge the data from both files
  const mergeFileData = (file1Data: any[], file2Data: any[]) => {
    const defaultSecondFileValues = {
      "Assigned To": "",
      "Step Status": "",
      "Original Due Date": "",
      "Days Late": "",
      "Date In": "",
      "Date Completed": "",
    };

    return file1Data.map((file1Record: any) => {
      // Find the corresponding record from the second file
      const matchingFile2Record = file2Data.find(
        (file2Record: any) =>
          file2Record["Document No."] === file1Record["Document No"]
      );

      const file2Record = matchingFile2Record || defaultSecondFileValues;

      // Merge fields from both files
      return {
        documentNo: file1Record["Document No"] || file2Record["Document No."],
        title: file1Record["Title"] || file2Record["Document Title"],
        assignedTo: file2Record["Assigned To"],
        stepStatus: file2Record["Step Status"],
        originalDueDate: file2Record["Original Due Date"],

        // Days Late fields from both files
        daysLateSubmission: file1Record["Days Late"] || "",
        daysLateReview: file2Record["Days Late"],

        // Include all other necessary columns from file1
        submissionStatus: file1Record["Submission Status"] || "",
        reviewStatus: file1Record["Review Status"] || "",
        createdBy: file1Record["Created By"] || "",
        plannedSubmissionDate: file1Record["Planned Submission Date"] || "",
        dateIn: file1Record["Date In"] || "",
        selectList1: file1Record["Select List 1"] || "",
        selectList3: file1Record["Select List 3"] || "",
        selectList5: file1Record["Select List 5"] || "",
        status: file1Record["Status"] || "",
        workflowStatus: file1Record["Workflow Status"] || "",
        dateCompleted: file1Record["Date Completed"] || "",
      };
    });
  };

  const labels: { [key: number]: string } = {
    0: "Supplier Docs",
    1: "Workflow Docs",
    2: "Other Docs",
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {/* Trigger dialog to open */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-black text-white"
          // onClick={openDialog}
        >
          Upload Documents
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload your Supplier Document and Workflow Document with full
            columns to generate your report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {[0, 1].map((fileIndex: number) => (
            <div key={fileIndex} className="space-y-4">
              {/* File Upload Input */}
              <div>
                <Label
                  htmlFor={`file-input-${fileIndex}`}
                  className="text-sm font-medium block mb-2"
                >
                  {labels[fileIndex]}
                </Label>
                <Input
                  type="file"
                  accept=".xlsx, .xls"
                  id={`file-input-${fileIndex}`}
                  onChange={(e) => handleFileUpload(e, fileIndex)}
                  className="border border-input bg-background p-2 rounded-md w-full"
                />
              </div>

              {/* Number of Header Rows Input */}
              <div>
                <Label
                  htmlFor={`lineNo-${fileIndex}`}
                  className="text-sm font-medocument_dium block mb-2"
                >
                  Number of header rows to skip
                </Label>
                <Input
                  type="number"
                  id={`lineNo-${fileIndex}`}
                  value={indexRows[fileIndex]}
                  onChange={(e) => handleIndexRowChange(e, fileIndex)}
                  placeholder="Enter number of rows"
                  className="border border-input bg-background p-2 rounded-md w-full"
                />
              </div>
            </div>
          ))}

          {/* Error Message */}
          {error && (
            <Alert
              variant="destructive"
              className="flex justify-center items-center gap-3 mt-4"
            >
              <AlertCircle className="h-5 w-5 text-red-500 -mt-1" />
              <AlertDescription className="text-xs text-red-600 mt-1">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleGenerateClick} // Click to handle generate logic
            className={`w-full ${
              isReadyToGenerate && !error
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={!isReadyToGenerate || !!error} // Disable if error exists
          >
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelForm;
