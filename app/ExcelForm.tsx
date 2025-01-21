"use client";
import React, { useCallback, useEffect, useMemo } from "react";
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
import { AlertCircle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { MergedData } from "./types";
import {
  createNewProject,
  getProject,
  updateProjectData,
} from "./action/actions";

const ExcelForm = ({}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog visibility
  const [indexRows, setIndexRows] = useState<number[]>([8, 8, 8]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<any>("");
  const [isReadyToGenerate, setIsReadyToGenerate] = useState<boolean>(false);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  // const projectNumber = mergedData[0].documentNo?.split("-")[0];

  // Create new project (POST)

  // Handle opening of the dialog
  // const openDialog = () => setIsDialogOpen(true);

  // Handle closing of the dialog
  const closeDialog = () => setIsDialogOpen(false);

  // Handle "Generate" button click
  const handleGenerateClick = async () => {
    setIsPending(!isPending);
    if (error) {
      return; // Don't close the dialog if there's an error
    }

    // Proceed with the generate logic and close dialog if no error
    const result = await handleGenerate();
    setIsPending(!isPending);
    if (!!error) {
      closeDialog(); // Close dialog only if there's no error
    }
  };

  const expectedHeaders = [
    ["File", "Package Number", "Document No"],
    ["Workflow No.", "Workflow Name", "Document No."],
  ];

  const validateHeaders = (
    headers: string[],
    expectedHeaders: string[]
  ): boolean => {
    return expectedHeaders.every((expectedHeader) =>
      headers.includes(expectedHeader)
    );
  };

  const validateFiles = (currentFiles: File[]) => {
    const allUploaded = expectedHeaders.every(
      (_, index) => !!currentFiles[index]
    );
    setIsReadyToGenerate(allUploaded);
  };

  useEffect(() => {
    validateFiles(files); // Update `isReadyToGenerate` when files or headers change
  }, [files]);

  // Validate headers when indexRows change
  useEffect(() => {
    const validateAllHeaders = () => {
      files.forEach((file, fileIndex) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const binaryStr = event.target?.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const headers: any = sheetData[indexRows[fileIndex]];

          if (!validateHeaders(headers, expectedHeaders[fileIndex])) {
            setError(
              `File ${
                fileIndex + 1
              } has invalid headers. Expected: ${expectedHeaders[
                fileIndex
              ].join(", ")}`
            );
          } else {
            setError(null); // Clear the error if headers are valid
          }
        };
        reader.readAsArrayBuffer(file);
      });
    };

    if (files.length > 0 && indexRows.length > 0) {
      validateAllHeaders();
    }
  }, [indexRows, files]); // Ensure useEffect is triggered for any change in files or indexRows

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileIndex: number
  ) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...files];
      newFiles[fileIndex] = file; // Ensure the file is added to the correct index
      setFiles(newFiles); // Update the files state
    }
  };

  const handleIndexRowChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileIndex: number
  ) => {
    const newIndexRows = [...indexRows];
    newIndexRows[fileIndex] = parseInt(e.target.value, 10);
    setIndexRows(newIndexRows); // This will trigger the useEffect to re-check the headers
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

    try {
      const allData: any[][] = await Promise.all(
        files.map((file, fileIndex) => {
          return new Promise<any[]>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                const sheetData = XLSX.utils.sheet_to_json(sheet, {
                  header: 1,
                });
                const headers = sheetData[indexRows[fileIndex]];
                const rows = sheetData.slice(indexRows[fileIndex] + 1);

                if (!headers || !Array.isArray(headers)) {
                  throw new Error(
                    `File ${fileIndex + 1}: Invalid or missing headers.`
                  );
                }

                const jsonData = rows.map((row: any) =>
                  headers.reduce((acc: any, header: any, colIndex: number) => {
                    acc[header] = row[colIndex] || "";
                    return acc;
                  }, {})
                );

                resolve(jsonData);
              } catch (err) {
                reject(err);
              }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
          });
        })
      );

      // Process allData after all files are read
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
        "Workflow Status",
      ];

      const filteredFirstFileData = filterColumns(allData[0], firstFileColumns);
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
        const existingProjectResponse = await getProject(projectNumber);
        // if (!!existingProjectResponse.project) {
        //   await updateProjectData(projectNumber, mergedData);
        // } else {
        //   await createNewProject(projectNumber, mergedData);
        // }
        // setError(null);
        // router.push(`/report/${projectNumber}`);
      }
      // setIsDialogOpen(!isDialogOpen);
    } catch (err: any) {
      setError(`Error processing files: ${err.message}`);
    }
  };

  // Helper function to merge the data from both files
  const mergeFileData = (file1Data: any[], file2Data: any[]) => {
    // Combine records from file1 and file2
    const mergedData = [
      ...file1Data
        .filter(
          (file1Record) => file1Record["Submission Status"] !== "Canceled"
        ) // Filter for non-canceled records
        .map((file1Record) => {
          // Find matching file2 record
          const matchingFile2Record = file2Data.find(
            (file2Record) =>
              file2Record["Document No."] === file1Record["Document No"]
          );

          // Default file2 record to avoid errors
          const file2Record = matchingFile2Record || {};

          return {
            documentNo: file1Record["Document No"],
            title: file1Record["Title"] || file2Record["Document Title"],
            assignedTo: file2Record["Assigned To"] || "",
            stepStatus: file2Record["Step Status"] || "",
            originalDueDate: file2Record["Original Due Date"] || "",
            daysLateSubmission: file1Record["Days Late"] || 0,
            daysLateReview: file2Record["Days Late"] || 0,
            submissionStatus: file1Record["Submission Status"] || "",
            reviewStatus: file1Record["Review Status"] || "",
            createdBy: file1Record["Created By"] || "",
            plannedSubmissionDate: file1Record["Planned Submission Date"] || "",
            dateIn: file2Record["Date In"] || "",
            dateCompleted: file2Record["Date Completed"] || "",
            selectList1: file1Record["Select List 1"] || "",
            selectList3: file1Record["Select List 3"] || "",
            selectList5: file1Record["Select List 5"] || "",
            status: file1Record["Status"] || "",
            workflowStatus: file2Record["Workflow Status"] || "",
          };
        }),
      // Handle records in file2 but not in file1
      ...(() => {
        const unmatchedFile2Records = file2Data.filter((file2Record) => {
          // Break the codification into parts
          const file2Parts = file2Record["Document No."].split("-");

          // Compare each file1 document against file2 document
          return !file1Data.some((file1Record) => {
            const file1Parts = file1Record["Document No"].split("-");
            // Check if file1 and file2 are the same with one missing element
            const uniqueParts = [...new Set([...file1Parts, ...file2Parts])];
            return uniqueParts.length === file1Parts.length; // Matching if unique parts remain the same
          });
        });

        // Log the count and details of added records
        console.log(
          `Number of records added from file2 but not in file1: ${unmatchedFile2Records.length}`
        );
        console.log("Records added:", unmatchedFile2Records);

        // Map the unmatched records into the merged data structure, excluding "Canceled"
        return unmatchedFile2Records
          .filter(
            (file2Record) => file2Record["Submission Status"] !== "Canceled"
          ) // Exclude canceled records
          .map((file2Record) => ({
            documentNo: file2Record["Document No."],
            title: file2Record["Document Title"] || "",
            assignedTo: file2Record["Assigned To"] || "",
            stepStatus: file2Record["Step Status"] || "",
            originalDueDate: "",
            daysLateSubmission: 0, // No submission data in file2
            daysLateReview: 0,
            submissionStatus: "", // No submission data in file2
            reviewStatus: "",
            createdBy: "", // No createdBy data in file2
            plannedSubmissionDate: "", // No planned submission date in file2
            dateIn: file2Record["Date In"] || "", // to add
            dateCompleted: file2Record["Date Completed"] || "", // to add
            selectList1: "", // No select list data in file2
            selectList3: "", // No select list data in file2
            selectList5: "", // No select list data in file2
            status: "",
            workflowStatus: "",
          }));
      })(),
    ];

    return mergedData;
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
                : "bg-gray-300 text-gray-950 cursor-not-allowed"
            }`}
            disabled={!isReadyToGenerate || !!error} // Disable if error exists
          >
            {!isPending ? (
              "Generate"
            ) : (
              <>
                {/* <Loader2 className="animate-spin" /> */}
                <div className="flex text-white">
                  Report in progress{"  "}
                  <p className="animate-bounce text-[20px]">.</p>{" "}
                  <p className="animate-bounce text-[20px] delay-100">.</p>{" "}
                  <p className="animate-bounce text-[20px] delay-200">.</p>
                </div>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelForm;
