import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    await connectToDatabase();

    const companyId = req.headers.get("x-company-id");

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Missing company id" },
        { status: 400 }
      );
    }

    const { taskId } = await context.params;

    const task = await Task.findOne({
      companyId,
      taskId,
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Task detail API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load task" },
      { status: 500 }
    );
  }
}