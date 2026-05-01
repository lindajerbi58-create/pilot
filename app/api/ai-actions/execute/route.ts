import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const companyId = request.headers.get("x-company-id");

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Missing company id" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      projectName,
    } = body;
    const existingAiAction = await Task.findOne({
  companyId,
  task_name: title,
  project_name: projectName || "AI Corrective Action",
  taskId: { $regex: "^AI-ACTION" },
});

if (existingAiAction) {
  return NextResponse.json({
    success: true,
    alreadyExecuted: true,
    message: "AI action already executed",
    task: existingAiAction,
  });
}

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Missing AI action data" },
        { status: 400 }
      );
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const createdTask = await Task.create({
      companyId,
      taskId: `AI-ACTION-${Date.now()}`,
      task_name: title,
      project_name: projectName || "AI Corrective Action",
      assignee_email: "manager@pilot.ai",
      status: "In Progress",
      priority: "High",
      progress: 0,
      start_date: new Date(),
      due_date: tomorrow,
      source: "AI_SUGGESTION",
      aiReason: description,
    });

    return NextResponse.json({
      success: true,
      message: "AI action executed successfully",
      task: createdTask,
    });
  } catch (error) {
    console.error("Execute AI action error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute AI action",
      },
      { status: 500 }
    );
  }
}