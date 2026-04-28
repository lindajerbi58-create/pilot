import { NextResponse } from "next/server";
import { getDashboardData } from "@/src/server/dashboard/getDashboardData";

export async function GET(request: Request) {
  try {
    const companyId = request.headers.get("x-company-id");

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Missing company id" },
        { status: 400 }
      );
    }

    const data = await getDashboardData(companyId);

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