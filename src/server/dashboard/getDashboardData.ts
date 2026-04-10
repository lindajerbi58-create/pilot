import {connectToDatabase }from "../../lib/mongodb";
import Task from "../../models/Task";

export async function getDashboardData() {
  await connectToDatabase();

  const tasks = await Task.find();

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (t) => t.status?.toLowerCase() === "done"
  ).length;

  const inProgressTasks = tasks.filter(
    (t) => t.status?.toLowerCase() === "in progress"
  ).length;

  const now = new Date();

  const overdueTasks = tasks.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date) < now &&
      t.status?.toLowerCase() !== "done"
  ).length;

  const projectsSet = new Set(tasks.map((t) => t.project_name));
  const activeProjects = projectsSet.size;

  const avgProgress =
    totalTasks > 0
      ? Math.round(
          tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / totalTasks
        )
      : 0;

  // -------- RISKY PROJECTS --------
  const projectMap: Record<string, any[]> = {};

  tasks.forEach((t) => {
    if (!projectMap[t.project_name]) {
      projectMap[t.project_name] = [];
    }
    projectMap[t.project_name].push(t);
  });

  const riskyProjects = Object.entries(projectMap).map(
    ([projectName, projectTasks]) => {
      const total = projectTasks.length;

      const overdue = projectTasks.filter(
        (t) =>
          t.due_date &&
          new Date(t.due_date) < now &&
          t.status?.toLowerCase() !== "done"
      ).length;

      const progress =
        total > 0
          ? Math.round(
              projectTasks.reduce((sum, t) => sum + (t.progress || 0), 0) /
                total
            )
          : 0;

      let level = "Low";
      let reason = "Stable execution";

      if (overdue > total * 0.3) {
        level = "High";
        reason = "Execution slowing down";
      } else if (progress < 50) {
        level = "Medium";
        reason = "Needs monitoring";
      }

      return {
        title: projectName,
        reason,
        level,
        progress: `${progress}%`,
        progressValue: progress,
      };
    }
  );

  // -------- RECENT ACTIVITY --------
  const recentActivity = [
    {
      type: "import",
      title: `${totalTasks} tasks currently loaded in Pilot`,
      subtitle: "Workspace data synced from MongoDB",
      color: "#8ea8ff",
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

  // -------- AI SUGGESTIONS --------
  const aiSuggestions = [];

  if (overdueTasks > 0) {
    aiSuggestions.push({
      title: "Escalate overdue execution review",
      description: `${overdueTasks} overdue tasks are affecting delivery reliability.`,
    });
  }

  if (avgProgress < 60) {
    aiSuggestions.push({
      title: "Increase execution focus",
      description: `Average progress is ${avgProgress}%. Re-prioritize execution.`,
    });
  }

  if (riskyProjects.length > 0) {
    const worst = riskyProjects[0];
    aiSuggestions.push({
      title: `Review ${worst.title}`,
      description: `${worst.title} is currently ${worst.level} risk.`,
    });
  }

  // -------- WORKLOAD --------
  const workloadMap: Record<string, any[]> = {};

  tasks.forEach((t) => {
    if (!workloadMap[t.assignee_email]) {
      workloadMap[t.assignee_email] = [];
    }
    workloadMap[t.assignee_email].push(t);
  });

  const resourceWorkload = Object.entries(workloadMap).map(
    ([email, userTasks]) => {
      const taskCount = userTasks.length;

      const overdueCount = userTasks.filter(
        (t) =>
          t.due_date &&
          new Date(t.due_date) < now &&
          t.status?.toLowerCase() !== "done"
      ).length;

      const avg =
        taskCount > 0
          ? Math.round(
              userTasks.reduce((sum, t) => sum + (t.progress || 0), 0) /
                taskCount
            )
          : 0;

      let loadLevel = "Balanced";

      if (taskCount > 5 || overdueCount > 2) {
        loadLevel = "High";
      }

      if (taskCount > 8 || overdueCount > 4) {
        loadLevel = "Critical";
      }

      return {
        email,
        taskCount,
        overdueCount,
        avgProgress: avg,
        loadLevel,
      };
    }
  );

  return {
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
  };
}