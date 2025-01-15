// app/api/projects/[projectNumber]/route.ts
import { getClient } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectNumber: string }> }
) {
  const { projectNumber } = await params;
  const client = await getClient();

  try {
    const result = await client.query(
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
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectNumber: string }> }
) {
  const { projectNumber } = await params;
  const { mergedData } = await req.json();
  const client = await getClient();

  try {
    await client.query(
      `INSERT INTO projects (project_number, data)
       VALUES ($1, $2)
       ON CONFLICT (project_number)
       DO UPDATE SET data = $2`,
      [projectNumber, JSON.stringify(mergedData)]
    );

    return NextResponse.json(
      { message: "Project created or updated successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectNumber: string }> }
) {
  const { projectNumber } = await params;
  const { mergedData } = await req.json();
  const client = await getClient();

  try {
    const result = await client.query(
      `UPDATE projects
       SET data = $2, updated_at = CURRENT_TIMESTAMP
       WHERE project_number = $1
       RETURNING project_number, data`,
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
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
