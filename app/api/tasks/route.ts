import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function GET() {
  try {
    await connectToDatabase();

    const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Tasks API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load tasks",
      },
      { status: 500 }
    );
  }
}