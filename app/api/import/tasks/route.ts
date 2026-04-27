import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const companyId = req.headers.get("x-company-id");

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Missing company id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { tasks } = body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { success: false, message: "No tasks provided" },
        { status: 400 }
      );
    }

    const normalizedTasks = tasks.map((task: any) => ({
      ...task,
      companyId,
      progress: Number(task.progress || 0),
    }));

    await Task.insertMany(normalizedTasks);

    return NextResponse.json({
      success: true,
      message: `${normalizedTasks.length} tasks imported successfully`,
    });
  } catch (error) {
    console.error("Task import failed:", error);

    return NextResponse.json(
      { success: false, message: "Task import failed" },
      { status: 500 }
    );
  }
}