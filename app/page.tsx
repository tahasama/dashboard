import React from "react";
import ExcelForm from "./ExcelForm";
import Charts from "./HomePageCharts/page";
import Search from "./Search";
import { getProjects } from "./action/actions";

export default async function Home() {
  const { projects } = await getProjects();
  return (
    <div className="flex flex-col items-center h-screen">
      <img
        className="w-[70px] lg:w-[86px] mb-3 bg-gradient-to-br from-slate-950 to-slate-600 scale-[0.83] rounded-sm py-[1.1px]"
        src="/logo/logo.png"
        alt="Doxara Logo"
      />

      <p className="font-semibold text-center mb-4 tracking-wide">
        Welcome to{" "}
        <span className="text-[#63A8E6] text-[17.5px] font-bold tracking-widest">
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
