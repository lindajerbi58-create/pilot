import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

function getRiskLevel(params: {
  overdueTasks: number;
  totalTasks: number;
  avgProgress: number;
}) {
  const { overdueTasks, totalTasks, avgProgress } = params;

  let score = 0;

  if (totalTasks > 0) {
    score += (overdueTasks / totalTasks) * 60;
  }

  if (avgProgress < 30) score += 30;
  else if (avgProgress < 60) score += 15;

  if (score >= 70) return "Critical";
  if (score >= 45) return "High";
  return "Medium";
}

function getRiskReason(params: {
  overdueTasks: number;
  avgProgress: number;
}) {
  const { overdueTasks, avgProgress } = params;

  if (overdueTasks >= 3) return `${overdueTasks} overdue tasks`;
  if (avgProgress < 30) return "Low execution progress";
  if (avgProgress < 60) return "Execution slowing down";
  return "Needs monitoring";
}

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

    const groupedProjects = tasks.reduce((acc: Record<string, any[]>, task: any) => {
      if (!acc[task.project_name]) {
        acc[task.project_name] = [];
      }
      acc[task.project_name].push(task);
      return acc;
    }, {});

    const riskyProjects = Object.entries(groupedProjects)
      .map(([projectName, projectTasks]) => {
        const total = projectTasks.length;
        const overdue = projectTasks.filter((task: any) => {
          if (task.status === "Completed") return false;
          return new Date(task.due_date) < now;
        }).length;

        const progress =
          total > 0
            ? Math.round(
                projectTasks.reduce(
                  (sum: number, task: any) => sum + Number(task.progress || 0),
                  0
                ) / total
              )
            : 0;

        const riskLevel = getRiskLevel({
          overdueTasks: overdue,
          totalTasks: total,
          avgProgress: progress,
        });

        const reason = getRiskReason({
          overdueTasks: overdue,
          avgProgress: progress,
        });

        return {
          title: projectName,
          reason,
          level: riskLevel,
          progress: `${progress}%`,
          progressValue: progress,
        };
      })
      .sort((a, b) => {
        const order = { Critical: 3, High: 2, Medium: 1 };
        return order[b.level as keyof typeof order] - order[a.level as keyof typeof order];
      })
      .slice(0, 3);

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
      riskyProjects,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}