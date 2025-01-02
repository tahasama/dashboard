import React, { useState } from "react";
import DaysLateAnalysis from "./DaysLateAnalysis";
import DaysLateAnalysisByMonth from "./DaysLateAnalysisByMonth";
import { dataProps } from "../types";

const LateAnalysis: React.FC<dataProps> = ({ data }) => {
  const [byDay, setByDay] = useState<boolean>(true);

  return (
    <div>
      <button
        onClick={() => setByDay(!byDay)}
        className="rounded-md bg-cyan-800 p-2"
      >
        {byDay ? "Switch to Months" : "Switch to Days"}
      </button>
      <div style={{ display: byDay ? "block" : "none" }}>
        <DaysLateAnalysis data={data} />
      </div>
      <div style={{ display: byDay ? "none" : "block" }}>
        <DaysLateAnalysisByMonth data={data} />
      </div>
    </div>
  );
};

export default LateAnalysis;
