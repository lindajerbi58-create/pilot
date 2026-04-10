import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

export async function GET() {
  try {
    await connectToDatabase();

    const tasks = await Task.find({}).lean();

    const now = new Date();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task: any) => task.status === "Completed").length;
    const inProgressTasks = tasks.filter((task: any) => task.status === "In Progress").length;
    const overdueTasks = tasks.filter((task: any) => {
      if (task.status === "Completed") return false;
      return new Date(task.due_date) < now;
    }).length;

    const activeProjects = new Set(tasks.map((task: any) => task.project_name)).size;

    const avgProgress =
      totalTasks > 0
        ? Math.round(
            tasks.reduce((sum: number, task: any) => sum + Number(task.progress || 0), 0) /
              totalTasks
          )
        : 0;

    return NextResponse.json({
      success: true,
      kpis: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        activeProjects,
        avgProgress,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}