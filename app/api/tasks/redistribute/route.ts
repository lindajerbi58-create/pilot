import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { taskIds, targetAssignee } = body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "taskIds is required" },
        { status: 400 }
      );
    }

    if (!targetAssignee || typeof targetAssignee !== "string") {
      return NextResponse.json(
        { success: false, error: "targetAssignee is required" },
        { status: 400 }
      );
    }

    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: { assignee_email: targetAssignee } }
    );

    return NextResponse.json({
      success: true,
      updatedCount: result.modifiedCount ?? 0,
      targetAssignee,
    });
  } catch (error) {
    console.error("Redistribute tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to redistribute tasks",
      },
      { status: 500 }
    );
  }
}