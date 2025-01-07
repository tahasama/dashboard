import React from "react";

const ExcelForm = ({
  handleFileUpload,
  labels,
  handleIndexRowChange,
  indexRows,
  handleGenerate,
  isReadyToGenerate,
  error,
}: any) => {
  return (
    <div className="flex flex-col items-center justify-center max-h-screen bg-gray-50 mt-10">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-2">
        {/* File Upload Section */}
        {[0, 1].map((fileIndex: number) => (
          <div key={fileIndex} className="mb-3">
            <label
              htmlFor={`file-input-${fileIndex}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {labels[fileIndex]}
            </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => handleFileUpload(e, fileIndex)}
              id={`file-input-${fileIndex}`}
              className="block w-full mb-4 p-1.5 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <label
              htmlFor={`lineNo`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              num of lines to remove from excel
            </label>
            <input
              value={indexRows[fileIndex]}
              onChange={(e) => handleIndexRowChange(e, fileIndex)}
              type="number"
              className="p-1.5 w-full border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Header Row Index"
              id="lineNo"
            />
          </div>
        ))}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className={`w-full py-1.5 text-lg rounded-md font-semibold transition-colors ${
            isReadyToGenerate
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          disabled={!isReadyToGenerate}
        >
          Generate
        </button>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-center mt-4 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
};

export default ExcelForm;
