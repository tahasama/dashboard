"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Get Project (equivalent to GET request)

export async function getProjects() {
  try {
    const result = await query("SELECT * FROM projects");

    // Check if the result is an object and contains a `rows` property
    if (result && result.rows && Array.isArray(result.rows)) {
      return {
        projects: result.rows,
        message: "",
      };
    } else {
      console.error("🚨 ~ getProjects ~ Invalid result format", result);
      return {
        message: "No projects found",
        projects: [],
      };
    }
  } catch (error) {
    console.error("Error fetching projects:", error); // Log the error
    return {
      message: "Internal Server Error",
      projects: [],
    };
  }
}

export async function getProject(
  projectNumber: string
): Promise<{ project: any; message: string }> {
  try {
    const result = await query(
      "SELECT project_number, data FROM projects WHERE project_number = $1",
      [projectNumber]
    );

    if (result.rows.length > 0) {
      return {
        project: result.rows[0],
        message: "",
      };
    } else {
      return {
        message: "Project not found",
        project: null,
      };
    }
  } catch (error) {
    return {
      message: "Internal Server Error",
      project: null,
    };
  }
}

// Create or Update Project (equivalent to POST request)
export async function createNewProject(
  projectNumber: string,
  mergedData: any[]
): Promise<{ message: string }> {
  try {
    // Insert or update project data in the database
    await query(
      `
      INSERT INTO projects (project_number, data)
      VALUES ($1, $2)
      ON CONFLICT (project_number)
      DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
      `,
      [projectNumber, JSON.stringify(mergedData)]
    );
    revalidatePath(`/report/${projectNumber}`);
    return {
      message: "Project created or updated successfully",
    };
  } catch (error) {
    return {
      message: "Internal Server Error",
    };
  }
}

// Update existing project (equivalent to PUT request)
export async function updateProjectData(
  projectNumber: string,
  mergedData: any[]
): Promise<{ message: string }> {
  try {
    const result = await query(
      `
      UPDATE projects
      SET data = $2, updated_at = CURRENT_TIMESTAMP
      WHERE project_number = $1
      RETURNING project_number, data
      `,
      [projectNumber, JSON.stringify(mergedData)]
    );
    revalidatePath(`/report/${projectNumber}`);
    if (result.rows.length > 0) {
      return {
        message: "Project updated successfully",
      };
    } else {
      return {
        message: "Project not found",
      };
    }
  } catch (error) {
    return {
      message: "Internal Server Error",
    };
  }
}
