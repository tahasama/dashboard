import React from "react";

const statusColorsSubmission = [
  { label: "Submission Required", color: "#b0e0e6" },
  { label: "Submitted", color: "#78a8cf" },
  { label: "Completed", color: "#84C3A3" },
];

const statusColorsReview = [
  { label: "C1", color: "#63A8E6" },
  {
    label: "C2",
    color: "#B58ED2",
  },
  { label: "C3", color: "#FF4D4D" },
  { label: "C4", color: "#fd9e97" },
  { label: "Pending", color: "#ffc966" },
  { label: "Under Review", color: "#3A7E72" },
  { label: "Approved", color: "#4682B4" },
];

const Legend = () => {
  return (
    <div className="flex justify-between items-center text-xs -mt-1 mb-1 p-2 bg-white shadow-lg rounded-lg">
      <div className="flex flex-wrap gap-y-1 gap-x-4">
        Submissions:
        {statusColorsSubmission.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-center gap-2"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            ></span>
            <span className="text-xs">{status.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-y-1 gap-x-4">
        , Reviews:
        {statusColorsReview.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-center gap-2"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            ></span>
            <span className="text-xs">{status.label}</span>
          </div>
        ))}
      </div>

      <div className="text-xs place-self-end text-slate-950 bg-indigo-200/55 shadow-md rounded-[2px] py-1 px-1.5">
        <b>Tip:</b> Click on a bar to copy doc number
      </div>
    </div>
  );
};

export default Legend;
