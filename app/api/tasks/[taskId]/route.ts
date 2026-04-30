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
export async function PATCH(
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
    const body = await req.json();

    const progress = Number(body.progress);

    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid progress" },
        { status: 400 }
      );
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        companyId,
        $or: [{ taskId }, { _id: taskId }],
      },
      {
        $set: {
          progress,
          status: progress === 100 ? "Complete" : body.status,
        },
      },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update task" },
      { status: 500 }
    );
  }
}