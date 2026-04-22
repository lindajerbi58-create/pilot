import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function DELETE() {
  try {
    await connectToDatabase();

    const result = await Task.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Workspace reset successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Reset API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset workspace",
      },
      { status: 500 }
    );
  }
}