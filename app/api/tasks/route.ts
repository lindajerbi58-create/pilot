export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const companyId = request.headers.get("x-company-id");

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Missing company id" },
        { status: 400 }
      );
    }

    const tasks = await Task.find({ companyId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      tasks,
    });