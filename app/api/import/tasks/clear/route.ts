import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function DELETE() {
  try {
    await connectToDatabase();

    const result = await Task.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} task(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Clear import data error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear imported tasks",
      },
      { status: 500 }
    );
  }
}