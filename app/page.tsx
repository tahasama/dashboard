import React from "react";
import ExcelForm from "./ExcelForm";
import Charts from "./HomePageCharts/page";
import Search from "./Search";
import { getProjects } from "./action/actions";

export default async function Home() {
  const { projects } = await getProjects();
  return (
    <div className="flex flex-col items-center h-screen">
      <img className="w-[86px] mb-3" src="/logo/logo.png" alt="Doxara Logo" />

      <p className="font-bold text-center mb-4">
        Welcome to <span className="text-[#63A8E6]">Doxara</span>, your Data
        Report Creator
      </p>
      <p></p>
      <p className="mb-4 text-center text-[16px]">
        Generate and browse insightful reports
      </p>
      <ExcelForm />
      <Search projects={projects} />
      <Charts />
    </div>
  );
}
