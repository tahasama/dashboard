import React from "react";
import ExcelForm from "./ExcelForm";
import Charts from "./HomePageCharts/page";
import Search from "./Search";
import { getProjects } from "./action/actions";

export default async function Home() {
  const { projects } = await getProjects();
  return (
    <div className="flex flex-col items-center h-screen">
      <h1 className="font-bold text-center mt-4 mb-4">
        Document Data Report Creator
      </h1>
      <h2 className="mt-4 mb-10 text-center">
        Create your reports, and generate insightful charts
      </h2>
      <ExcelForm />
      <Search projects={projects} />
      <Charts />
    </div>
  );
}
