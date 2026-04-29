import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Company from "@/src/models/Company";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { name, code } = await req.json();

    if (!name || !code) {
      return NextResponse.json(
        { success: false, message: "Missing name or code" },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();
    const companyId = `company-${normalizedCode.toLowerCase()}`;

    const existing = await Company.findOne({ code: normalizedCode });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Code already exists" },
        { status: 400 }
      );
    }

    const company = await Company.create({
      name,
      code: normalizedCode,
      companyId,
    });

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Create company error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create company" },
      { status: 500 }
    );
  }
}