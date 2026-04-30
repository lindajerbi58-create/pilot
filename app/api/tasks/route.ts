import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const companyId = req.headers.get("x-company-id");

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Missing company id" },
        { status: 400 }
      );
    }

    const tasks = await Task.find({ companyId });

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Tasks API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load tasks" },
      { status: 500 }
    );
  }
}