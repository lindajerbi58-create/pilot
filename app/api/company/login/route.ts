import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Company from "@/src/models/Company";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Missing code" },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    const company = await Company.findOne({
      code: normalizedCode,
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Invalid access code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      companyId: company.companyId,
      companyName: company.name,
      code: company.code,
    });
  } catch (error) {
    console.error("Company login error:", error);

    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}