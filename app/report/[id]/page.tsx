import { Button } from "@/components/ui/button";

import Link from "next/link";
import React from "react";
import FiltersAndCharts from "./FiltersAndCharts";
import { getProject } from "@/app/action/actions";

const LazyLineTimeChart = React.lazy(() => import("../../LineTimeChart"));

const Report = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const { project } = await getProject(id);
  console.log("🚀 ~ Report ~ projectData:", project);

  if (!project.project_number) {
    return (
      <div className="w-screen h-screen grid place-content-center gap-6">
        <p>Project data not found. Please check the project ID.</p>
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    );
  }

  const { data } = project;

  //   const data: string | any[] = [];
  return (
    <div className="relative -mt-2">
      {/* <Filters /> */}
      <FiltersAndCharts originalData={data} />
    </div>
  );
};

export default Report;
