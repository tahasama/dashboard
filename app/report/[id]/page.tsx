import { Button } from "@/components/ui/button";

import Link from "next/link";
import React from "react";
import { getProject } from "@/app/action/actions";
import { FiltersProvider } from "@/app/FiltersProvider";
import FiltersAndCharts from "./parallels/@charts/page";
import Testing from "./parallels/page";

const Report = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const { project } = await getProject(id);

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

  return (
    <div className="relative -mt-2">
      {/* <Filters /> */}

      <FiltersProvider originalData={data}>
        <Testing />
      </FiltersProvider>
    </div>
  );
};

export default Report;
