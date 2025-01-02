import React, { useState } from "react";

import LateCompletionAnalysis from "./LateCompletionAnalysis";
import LateCompletionAnalysisByMonth from "./LateCompletionAnalysisByMonth";

const LateAnalysisReview = ({ data }: any) => {
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
        <LateCompletionAnalysis data={data} />
      </div>
      <div style={{ display: byDay ? "none" : "block" }}>
        <LateCompletionAnalysisByMonth data={data} />
        OOOOOOOOOOOOOOOOOOO
      </div>
    </div>
  );
};

export default LateAnalysisReview;
