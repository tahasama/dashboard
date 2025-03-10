"use client";

import React from "react";
import { AreaH } from "./AreaH";
import { BarH } from "./BarH";
import { PieH } from "./PieH";

const Charts = () => {
  return (
    <div className="flex flex-col justify-center w-[70vw] items-center h-full scale-90 -mt-">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <AreaH />
        <BarH />
        <PieH />
      </div>
    </div>
  );
};

export default Charts;
