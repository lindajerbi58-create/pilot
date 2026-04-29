import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const companyId = req.headers.get("x-company-id");

    if (!companyId) {
      return NextResponse.json(
        { success: false, message: "Missing company id" },
        { status: 400 }
      );
    }

    await Task.deleteMany({ companyId });

    return NextResponse.json({
      success: true,
      message: "Company data cleared successfully",
    });
  } catch (error) {
    console.error("Clear import failed:", error);

    return NextResponse.json(
      { success: false, message: "Clear import failed" },
      { status: 500 }
    );
  }
}