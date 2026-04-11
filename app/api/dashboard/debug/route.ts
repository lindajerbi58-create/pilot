import { NextResponse } from "next/server";
import { getDashboardData } from "@/src/server/dashboard/getDashboardData";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard data",
      },
      { status: 500 }
    );
  }
}