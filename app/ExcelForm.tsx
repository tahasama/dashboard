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
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { useState } from "react";

const ExcelForm = ({
  handleFileUpload,
  labels,
  handleIndexRowChange,
  indexRows,
  handleGenerate,
  isReadyToGenerate,
  error,
}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog visibility

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
                  className="text-sm font-medium block mb-2"
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
