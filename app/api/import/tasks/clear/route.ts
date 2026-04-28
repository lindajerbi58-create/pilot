import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();

   const companyId = request.headers.get("x-company-id");

if (!companyId) {
  return NextResponse.json(
    { success: false, error: "Missing company id" },
    { status: 400 }
  );
}

const result = await Task.deleteMany({ companyId });

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