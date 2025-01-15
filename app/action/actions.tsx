"use server";

import { query } from "@/lib/db";

// Get Project (equivalent to GET request)
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
    console.error("Database query error:", error);
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

    return {
      message: "Project created or updated successfully",
    };
  } catch (error) {
    console.error("Error in POST /projects:", error);
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
    console.error("Error in PUT /projects:", error);
    return {
      message: "Internal Server Error",
    };
  }
}
