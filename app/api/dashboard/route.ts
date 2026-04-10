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
      const recentActivity = [
  {
    type: "import",
    title: `${totalTasks} tasks currently loaded in Pilot`,
    subtitle: "Workspace data synced from MongoDB",
    color: "#8ea8ff",
  },
  {
    type: "risk",
    title:
      riskyProjects.length > 0
        ? `${riskyProjects[0].title} is currently ${riskyProjects[0].level} risk`
        : "No risky projects detected",
    subtitle: "Generated from project risk engine",
    color: "#ff6b6b",
  },
  {
    type: "overdue",
    title: `${overdueTasks} overdue tasks require attention`,
    subtitle: "Live operational risk signal",
    color: "#d78bff",
  },
  {
    type: "progress",
    title: `Average execution progress is ${avgProgress}%`,
    subtitle: "Computed from imported task data",
    color: "#8ea8ff",
  },
];
const aiSuggestions = [];

if (overdueTasks > 0) {
  aiSuggestions.push({
    title: "Escalate overdue execution review",
    description: `${overdueTasks} overdue tasks are affecting delivery reliability. Review blockers and assign owners today.`,
  });
}

if (avgProgress < 60) {
  aiSuggestions.push({
    title: "Increase execution focus",
    description: `Average progress is ${avgProgress}%. Re-prioritize active workstreams and reduce low-impact task switching.`,
  });
}

if (riskyProjects.length > 0) {
  aiSuggestions.push({
    title: `Review ${riskyProjects[0].title} immediately`,
    description: `${riskyProjects[0].title} is currently ${riskyProjects[0].level} risk. ${riskyProjects[0].reason}.`,
  });
}
const groupedAssignees = tasks.reduce((acc: Record<string, any[]>, task: any) => {
  if (!acc[task.assignee_email]) {
    acc[task.assignee_email] = [];
  }
  acc[task.assignee_email].push(task);
  return acc;
}, {});

const resourceWorkload = Object.entries(groupedAssignees)
  .map(([assignee, assigneeTasks]) => {
    const taskCount = assigneeTasks.length;

    const overdueCount = assigneeTasks.filter((task: any) => {
      if (task.status === "Completed") return false;
      return new Date(task.due_date) < now;
    }).length;

    const avgProgress =
      taskCount > 0
        ? Math.round(
            assigneeTasks.reduce(
              (sum: number, task: any) => sum + Number(task.progress || 0),
              0
            ) / taskCount
          )
        : 0;

    let loadLevel = "Balanced";
    if (taskCount >= 4 || overdueCount >= 2) loadLevel = "High";
    if (taskCount >= 6 || overdueCount >= 3) loadLevel = "Critical";

    return {
      assignee,
      taskCount,
      overdueCount,
      avgProgress,
      loadLevel,
    };
  })
  .sort((a, b) => {
    const order = { Critical: 3, High: 2, Balanced: 1 };
    return (
      order[b.loadLevel as keyof typeof order] -
      order[a.loadLevel as keyof typeof order]
    );
  });
 // -------- REAL EXECUTION TREND (derived from tasks) --------
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffInDays(a: Date, b: Date) {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const today = startOfDay(new Date());

const last7Days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() - (6 - i));
  return d;
});

const executionTrend = last7Days.map((day) => {
  const activeTasks = tasks.filter((task: any) => {
    if (!task.start_date || !task.due_date) return false;

    const start = startOfDay(new Date(task.start_date));
    const due = startOfDay(new Date(task.due_date));

    return start <= day && day <= due;
  });

  if (activeTasks.length === 0) {
    return {
      day: dayNames[day.getDay()],
      progress: 0,
      weekly: 0,
    };
  }

  let plannedSum = 0;
  let actualEstimatedSum = 0;

  activeTasks.forEach((task: any) => {
    const start = startOfDay(new Date(task.start_date));
    const due = startOfDay(new Date(task.due_date));

    const totalSpan = Math.max(1, diffInDays(start, due) + 1);
    const elapsedAtDay = Math.max(0, Math.min(totalSpan, diffInDays(start, day) + 1));

    // Planned % by this day
    const plannedPct = Math.round((elapsedAtDay / totalSpan) * 100);

    // Estimated actual % by this day, reconstructed from current progress
    const currentProgress = Number(task.progress || 0);
    const actualEstimatedPct = Math.round((elapsedAtDay / totalSpan) * currentProgress);

    plannedSum += plannedPct;
    actualEstimatedSum += actualEstimatedPct;
  });

  return {
    day: dayNames[day.getDay()],
    progress: Math.min(100, Math.round(actualEstimatedSum / activeTasks.length)),
    weekly: Math.min(100, Math.round(plannedSum / activeTasks.length)),
  };
});
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
  recentActivity,
  aiSuggestions,
  resourceWorkload,
  executionTrend, 
});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}