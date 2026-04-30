import { connectToDatabase } from "@/src/lib/mongodb";
import Task from "@/src/models/Task";

type KPIData = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  activeProjects: number;
  avgProgress: number;
};

type RiskyProject = {
  title: string;
  reason: string;
  level: "High" | "Medium" | "Low";
  progress: string;
  progressValue: number;
};

type RecentActivityItem = {
  type: string;
  title: string;
  subtitle: string;
  color: string;
};

type AISuggestion = {
  title: string;
  description: string;
};

type ResourceWorkloadItem = {
  assignee: string;
  taskCount: number;
  overdueCount: number;
  avgProgress: number;
  loadLevel: "Critical" | "High" | "Balanced" | "Light";
  riskScore: number;
};

type ExecutionTrendItem = {
  day: string;
  progress: number;
  weekly: number;
};

export type DashboardResponse = {
  success: true;
  kpis: KPIData;
  riskyProjects: RiskyProject[];
  recentActivity: RecentActivityItem[];
  aiSuggestions: AISuggestion[];
  resourceWorkload: ResourceWorkloadItem[];
  executionTrend: ExecutionTrendItem[];
  primaryIssue: "overdue" | "risk" | "workload" | "stable";
};

function normalizeStatus(status?: string) {
  return (status || "").trim().toLowerCase();
}

function isCompleted(status?: string, progress?: number) {
  const s = normalizeStatus(status);
  return s === "done" || s === "completed" || progress === 100;
}

function isInProgress(status?: string, progress?: number) {
  const s = normalizeStatus(status);
  return (
    s === "in progress" ||
    s === "in-progress" ||
    s === "ongoing" ||
    ((progress ?? 0) > 0 && (progress ?? 0) < 100)
  );
}

function isOverdue(dueDate?: string | Date, status?: string, progress?: number) {
  if (!dueDate) return false;
  if (isCompleted(status, progress)) return false;

  const due = new Date(dueDate);
  const now = new Date();

  return due.getTime() < now.getTime();
}

function getRiskLevel(overdueCount: number, avgProgress: number): "High" | "Medium" | "Low" {
  if (overdueCount >= 2 || avgProgress < 40) return "High";
  if (overdueCount >= 1 || avgProgress < 70) return "Medium";
  return "Low";
}

function getRiskReason(overdueCount: number, avgProgress: number): string {
  if (overdueCount >= 2) return `${overdueCount} overdue tasks`;
  if (avgProgress < 40) return "Low execution progress";
  if (avgProgress < 70) return "Execution slowing down";
  return "Needs monitoring";
}

function getLoadLevel(
  taskCount: number,
  overdueCount: number,
  avgProgress: number
): "Critical" | "High" | "Balanced" | "Light" {
  if (overdueCount >= 3 || (taskCount >= 5 && avgProgress < 35)) {
    return "Critical";
  }

  if (overdueCount >= 1 || taskCount >= 4 || avgProgress < 60) {
    return "High";
  }

  if (taskCount >= 2) {
    return "Balanced";
  }

  return "Light";
}
function getRiskScore(
  taskCount: number,
  overdueCount: number,
  avgProgress: number
): number {
  const taskWeight = Math.min(taskCount * 12, 36);
  const overdueWeight = Math.min(overdueCount * 20, 40);
  const progressPenalty = Math.max(0, 100 - avgProgress) * 0.24;

  return Math.min(100, Math.round(taskWeight + overdueWeight + progressPenalty));
}
export async function getDashboardData(companyId: string): Promise<DashboardResponse> {
  await connectToDatabase();

const tasks = await Task.find({ companyId });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) =>
    isCompleted(task.status, task.progress)
  ).length;
const inProgressTasks = tasks.filter((task) => {
  const status = String(task.status || "").toLowerCase().trim();
  return status === "in progress";
}).length;

  const overdueTasks = tasks.filter((task) =>
    isOverdue(task.due_date, task.status, task.progress)
  ).length;

  const activeProjects = new Set(
    tasks
      .map((task) => String(task.project_name || "").trim())
      .filter(Boolean)
  ).size;

  const avgProgress =
    totalTasks > 0
      ? Math.round(
          tasks.reduce((sum, task) => sum + (Number(task.progress) || 0), 0) / totalTasks
        )
      : 0;

  const kpis: KPIData = {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    activeProjects,
    avgProgress,
  };

  const projectMap = new Map<
    string,
    {
      title: string;
      taskCount: number;
      overdueCount: number;
      totalProgress: number;
    }
  >();

  for (const task of tasks) {
    const projectName = String(task.project_name || "Unknown Project").trim();

    if (!projectMap.has(projectName)) {
      projectMap.set(projectName, {
        title: projectName,
        taskCount: 0,
        overdueCount: 0,
        totalProgress: 0,
      });
    }

    const project = projectMap.get(projectName)!;
    project.taskCount += 1;
    project.totalProgress += Number(task.progress) || 0;

    if (isOverdue(task.due_date, task.status, task.progress)) {
      project.overdueCount += 1;
    }
  }

  const riskyProjects: RiskyProject[] = Array.from(projectMap.values())
    .map((project) => {
      const progressValue =
        project.taskCount > 0
          ? Math.round(project.totalProgress / project.taskCount)
          : 0;

      const level = getRiskLevel(project.overdueCount, progressValue);
      const reason = getRiskReason(project.overdueCount, progressValue);

      return {
        title: project.title,
        reason,
        level,
        progress: `${progressValue}%`,
        progressValue,
      };
    })
    .filter((project) => project.level === "High" || project.level === "Medium")
    .sort((a, b) => {
      const levelScore = { High: 3, Medium: 2, Low: 1 };
      return levelScore[b.level] - levelScore[a.level] || a.progressValue - b.progressValue;
    })
    .slice(0, 3);

  const topRiskProject = riskyProjects[0];

  const recentActivity: RecentActivityItem[] = [
    {
      type: "import",
      title: `${totalTasks} tasks currently loaded in Pilot`,
      subtitle: "Workspace data synced from MongoDB",
      color: "#8ea8ff",
    },
    ...(topRiskProject
      ? [
          {
            type: "risk",
            title: `${topRiskProject.title} is currently ${topRiskProject.level} risk`,
            subtitle: "Generated from project risk engine",
            color: "#ff6b6b",
          },
        ]
      : []),
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

  const aiSuggestions: AISuggestion[] = [];

  if (overdueTasks > 0) {
    aiSuggestions.push({
      title: "Escalate overdue execution review",
      description: `${overdueTasks} overdue tasks are affecting delivery reliability. Review blockers and assign owners today.`,
    });
  }

  if (avgProgress < 50) {
    aiSuggestions.push({
      title: "Increase execution focus",
      description: `Average progress is ${avgProgress}%. Re-prioritize active workstreams and reduce low-impact task switching.`,
    });
  }

  if (topRiskProject) {
    aiSuggestions.push({
      title: `Review ${topRiskProject.title} immediately`,
      description: `${topRiskProject.title} is currently ${topRiskProject.level} risk. ${topRiskProject.reason}.`,
    });
  }

  const resourceMap = new Map<
    string,
    {
      assignee: string;
      taskCount: number;
      overdueCount: number;
      totalProgress: number;
    }
  >();

  for (const task of tasks) {
    const assignee = String(task.assignee_email || "Unassigned").trim();

    if (!resourceMap.has(assignee)) {
      resourceMap.set(assignee, {
        assignee,
        taskCount: 0,
        overdueCount: 0,
        totalProgress: 0,
      });
    }

    const resource = resourceMap.get(assignee)!;
    resource.taskCount += 1;
    resource.totalProgress += Number(task.progress) || 0;

    if (isOverdue(task.due_date, task.status, task.progress)) {
      resource.overdueCount += 1;
    }
  }

  const resourceWorkload: ResourceWorkloadItem[] = Array.from(resourceMap.values())
    .map((resource) => {
      const avgProgress =
        resource.taskCount > 0
          ? Math.round(resource.totalProgress / resource.taskCount)
          : 0;
    const riskScore = getRiskScore(
      resource.taskCount,
      resource.overdueCount,
      avgProgress
    );

    return {
      assignee: resource.assignee,
      taskCount: resource.taskCount,
      overdueCount: resource.overdueCount,
      avgProgress,
      loadLevel: getLoadLevel(
        resource.taskCount,
        resource.overdueCount,
        avgProgress
      ),
      riskScore,
    };
    })
    .sort((a, b) => b.riskScore - a.riskScore || b.taskCount - a.taskCount);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const overloadedCount = resourceWorkload.filter(
  (member) => member.loadLevel === "Critical" || member.loadLevel === "High"
).length;

let primaryIssue: "overdue" | "risk" | "workload" | "stable" = "stable";
const highRiskProjects = riskyProjects.filter(
  (project) => project.level === "High"
).length;
if (overdueTasks >= highRiskProjects && overdueTasks >= overloadedCount && overdueTasks > 0) {
  primaryIssue = "overdue";
} else if (highRiskProjects >= overloadedCount && highRiskProjects > 0) {
  primaryIssue = "risk";
} else if (overloadedCount > 0) {
  primaryIssue = "workload";
} else {
  primaryIssue = "stable";
}
const executionTrend = dayLabels.map((day) => {
  const tasksForDay = tasks.filter((task) => {
    const baseDate = new Date(task.start_date || task.due_date || task.createdAt || Date.now());
    return dayLabels[baseDate.getDay()] === day;
  });

  const avgProgressForDay =
    tasksForDay.length > 0
      ? Math.round(
          tasksForDay.reduce((sum, task) => sum + (Number(task.progress) || 0), 0) /
            tasksForDay.length
        )
      : 0;

  const completionRate =
    tasksForDay.length > 0
      ? Math.round(
          (tasksForDay.filter((task) => isCompleted(task.status, task.progress)).length /
            tasksForDay.length) *
            100
        )
      : 0;

  return {
    day,
    progress: avgProgressForDay,
    weekly: completionRate,
  };
});

 return {
  success: true,
  kpis,
  riskyProjects,
  recentActivity,
  aiSuggestions,
  resourceWorkload,
  executionTrend,
  primaryIssue,
};
}