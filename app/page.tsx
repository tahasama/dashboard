import React from "react";
import ExcelForm from "./ExcelForm";
import Charts from "./HomePageCharts/page";
import Search from "./Search";
import { getProjects } from "./action/actions";

export default async function Home() {
  const { projects } = await getProjects();
  return (
    <div className="flex flex-col items-center max-h-screen mt-4 ">
      <img
        className="w-[70px] lg:w-[86px]  bg-gradient-to-br from-slate-950 to-slate-600 scale-[0.83    ] py-[1.1px] mb-3 rounded-md "
        src="/logo/logo.png"
        alt="Doxara Logo"
      />
      {/* <div className="relative bg-gradient-to-br from-slate-950 to-slate-600 scale-[0.83] px-3 py-[1.1px] mb-3 rounded-sm">
        <img
          className="w-[70px] lg:w-[50px]    "
          src="/logo/logo.png"
          alt="Doxara Logo"
        />
        <p className="text-yellow-300/80 text-xs -mt-1 text-center">Doxara</p>
      </div> */}

      <p className="font-semibold text-[15px] text-center mb-4 tracking-wide">
        Welcome to{" "}
        <span className="bg-gradient-to-br from-slate-950 via-yellow-700 to-yellow-400 bg-clip-text text-transparent text-[18px] font-bold tracking-widest">
          Doxara
        </span>
        , your smart solution for project documentation insights.
      </p>
      <p className="mb-4 text-center text-[14.5px] text-slate-700 font-sans">
        Track submissions, analyze workflows, and generate powerful reports
        effortlessly.
      </p>

      <ExcelForm />
      <Search projects={projects} />
      <Charts />
    </div>
  );
}
