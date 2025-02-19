import React from "react";
import ExcelForm from "./ExcelForm";
import Charts from "./HomePageCharts/page";
import Search from "./Search";
import { getProjects } from "./action/actions";

export default function Home() {
  // const projetcs = await getProjects();
  // console.log("🚀 ~ Home ~ projetcs:", projetcs);
  return (
    <div className="flex flex-col items-center h-screen">
      <h1 className="font-bold text-center mt-4 mb-4">
        Document Data Report Creator
      </h1>
      <h2 className="mt-4 mb-10">
        Create your reports, and generate insightful charts
      </h2>
      <ExcelForm />
      <Search />
      <Charts />
    </div>
  );
}
