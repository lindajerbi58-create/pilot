"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  FolderKanban,
} from "lucide-react";
import TopNavbar from "@/src/components/TopNavbar";
type TaskItem = {
  _id?: string;
  task_name: string;
  project_name: string;
  assignee_email: string;
  status: string;
  priority: string;
  progress: number;
  start_date?: string;
  due_date?: string;
};

type ProjectSummary = {
  name: string;
  taskCount: number;
  overdueCount: number;
  completedCount: number;
  avgProgress: number;
  assignees: string[];
  riskLevel: "High" | "Medium" | "Low";
};

function normalizeStatus(status?: string) {
  return (status || "").trim().toLowerCase();
}

function isCompleted(status?: string, progress?: number) {
  const s = normalizeStatus(status);
  return s === "done" || s === "completed" || progress === 100;
}

function isOverdue(task: TaskItem) {
  if (!task.due_date) return false;
  if (isCompleted(task.status, task.progress)) return false;

  const due = new Date(task.due_date);
  const now = new Date();

  return due.getTime() < now.getTime();
}

function getRiskLevel(overdueCount: number, avgProgress: number): "High" | "Medium" | "Low" {
  if (overdueCount >= 2 || avgProgress < 40) return "High";
  if (overdueCount >= 1 || avgProgress < 70) return "Medium";
  return "Low";
}

function getRiskBadge(level: "High" | "Medium" | "Low") {
  if (level === "High") {
    return "border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 text-[#ff7d7d]";
  }

  if (level === "Medium") {
    return "border border-[#ff8f5a]/20 bg-[#ff8f5a]/10 text-[#ff9d6a]";
  }

  return "border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 text-[#9eb7ff]";
}

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/tasks", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load projects");
        }

        const taskList = Array.isArray(data) ? data : data.tasks || [];
        setTasks(taskList);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const projects = useMemo<ProjectSummary[]>(() => {
    const map = new Map<string, TaskItem[]>();

    for (const task of tasks) {
      const projectName = String(task.project_name || "Unknown Project").trim();

      if (!map.has(projectName)) {
        map.set(projectName, []);
      }

      map.get(projectName)!.push(task);
    }

    return Array.from(map.entries())
      .map(([name, projectTasks]) => {
        const taskCount = projectTasks.length;
        const overdueCount = projectTasks.filter(isOverdue).length;
        const completedCount = projectTasks.filter((task) =>
          isCompleted(task.status, task.progress)
        ).length;

        const avgProgress =
          taskCount > 0
            ? Math.round(
                projectTasks.reduce((sum, task) => sum + (Number(task.progress) || 0), 0) /
                    taskCount
              )
            : 0;

        const assignees = Array.from(
          new Set(
            projectTasks
              .map((task) => String(task.assignee_email || "Unassigned").trim())
              .filter(Boolean)
          )
        );

        return {
          name,
          taskCount,
          overdueCount,
          completedCount,
          avgProgress,
          assignees,
          riskLevel: getRiskLevel(overdueCount, avgProgress),
        };
      })
      .sort((a, b) => {
        const score = { High: 3, Medium: 2, Low: 1 };
        return score[b.riskLevel] - score[a.riskLevel] || a.avgProgress - b.avgProgress;
      });
  }, [tasks]);

  const stats = useMemo(() => {
    return {
      totalProjects: projects.length,
      highRiskProjects: projects.filter((p) => p.riskLevel === "High").length,
      overdueProjects: projects.filter((p) => p.overdueCount > 0).length,
    };
  }, [projects]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05060b] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-8 text-white/70">
            Loading projects...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#05060b] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-8 text-red-300">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <TopNavbar />
        <div className="mb-6 flex items-center justify-between gap-4">
          
          <div>
         

            <h1 className="text-4xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-2 text-sm text-white/45">
              Portfolio overview generated from live task data
            </p>
          </div>

          <Link
            href="/tasks"
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
          >
            View Tasks
          </Link>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ea8ff]/10 text-[#8ea8ff]">
              <FolderKanban size={18} />
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Active Projects</p>
            <p className="mt-2 text-3xl font-semibold">{stats.totalProjects}</p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff6b6b]/10 text-[#ff6b6b]">
              <AlertTriangle size={18} />
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">High Risk Projects</p>
            <p className="mt-2 text-3xl font-semibold">{stats.highRiskProjects}</p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d78bff]/10 text-[#d78bff]">
              <Briefcase size={18} />
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Projects With Overdue</p>
            <p className="mt-2 text-3xl font-semibold">{stats.overdueProjects}</p>
          </div>
        </section>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] shadow-2xl shadow-black/20">
          <div className="border-b border-white/8 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">
              Portfolio List ({projects.length})
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="px-5 py-10 text-sm text-white/45">
              No projects found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-white/8 bg-white/[0.02]">
                  <tr className="text-left text-xs uppercase tracking-[0.16em] text-white/35">
                    <th className="px-5 py-4">Project</th>
                    <th className="px-5 py-4">Risk</th>
                    <th className="px-5 py-4">Tasks</th>
                    <th className="px-5 py-4">Completed</th>
                    <th className="px-5 py-4">Overdue</th>
                    <th className="px-5 py-4">Avg Progress</th>
                    <th className="px-5 py-4">Assignees</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project, index) => (
                    <tr
                      key={`${project.name}-${index}`}
                      className="border-b border-white/6 text-sm text-white/80 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
  <Link
    href={`/tasks?project=${encodeURIComponent(project.name)}`}
    className="font-medium text-white transition hover:text-[#9eb7ff]"
  >
    {project.name}
  </Link>
</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getRiskBadge(
                            project.riskLevel
                          )}`}
                        >
                          {project.riskLevel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/65">{project.taskCount}</td>
                      <td className="px-5 py-4 text-white/65">{project.completedCount}</td>
                      <td className="px-5 py-4 text-white/65">{project.overdueCount}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#8ea8ff] to-[#d78bff]"
                              style={{ width: `${project.avgProgress}%` }}
                            />
                          </div>
                          <span className="text-white/65">{project.avgProgress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/65">
                        <div className="flex flex-wrap gap-2">
                          {project.assignees.map((assignee) => (
                            <span
                              key={assignee}
                              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px]"
                            >
                              <CalendarDays size={12} />
                              {assignee.split("@")[0]}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}