"use client";

import React from "react";
import { AreaH } from "./AreaH";
import { BarH } from "./BarH";
import { PieH } from "./PieH";

const Charts = () => {
  return (
    <div className="flex flex-col justify-center w-[75vw] mt-1.5 items-center h-full">
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <AreaH />
        <BarH />
        <PieH />
      </div>
    </div>
  );
};

export default Charts;
