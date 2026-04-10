import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ success: true, message: "MongoDB connected" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Database connection failed" },
      { status: 500 }
    );
  }
}