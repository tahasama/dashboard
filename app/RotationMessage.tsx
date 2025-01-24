import React from "react";

const RotationMessage = () => {
  return (
    <div className="flex mt-0 absolute top-0 items-center z-50 justify-center flex-col min-h-screen">
      <div className="relative w-64 h-64 -mt-20">
        <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gray-200" />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <svg
            className="w-20 h-36 text-gray-500 animate-spin-slow transform rotate-180"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 42"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 6H4a2 2 0 00-2 2v26a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2zM12 38h0"
            />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-700 mt-8">
          Please Rotate Your Device
        </h1>
        <p className="text-gray-600 mt-2 text-sm">
          Rotating your device to landscape mode will provide a better viewing
          experience.
        </p>
      </div>
    </div>
  );
};

export default RotationMessage;
