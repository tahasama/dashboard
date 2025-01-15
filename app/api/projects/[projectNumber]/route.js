import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { projectNumber } = params;

  try {
    const result = await query(
      "SELECT project_number, data FROM projects WHERE project_number = $1",
      [projectNumber]
    );

    if (result.rows.length > 0) {
      return NextResponse.json({
        projectNumber: result.rows[0].project_number,
        data: result.rows[0].data,
      });
    } else {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create or Update Project
export async function POST(req, { params }) {
  const { projectNumber } = params;
  const body = await req.json();
  const mergedData = body?.mergedData;

  if (!projectNumber || !mergedData) {
    return NextResponse.json(
      { message: "Invalid request: Missing projectNumber or mergedData" },
      { status: 400 }
    );
  }

  try {
    await query(
      `
      INSERT INTO projects (project_number, data)
      VALUES ($1, $2)
      ON CONFLICT (project_number)
      DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
      `,
      [projectNumber, JSON.stringify(mergedData)]
    );

    return NextResponse.json(
      { message: "Project created or updated successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /projects:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Update Project
export async function PUT(req, { params }) {
  const { projectNumber } = params;
  const body = await req.json();
  const mergedData = body?.mergedData;

  if (!projectNumber || !mergedData) {
    return NextResponse.json(
      { message: "Invalid request: Missing projectNumber or mergedData" },
      { status: 400 }
    );
  }

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
      return NextResponse.json(
        {
          message: "Project updated successfully",
          project: result.rows[0],
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in PUT /projects:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
