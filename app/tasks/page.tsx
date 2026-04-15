"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Briefcase, CalendarDays, FolderKanban } from "lucide-react";

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

function getStatusBadge(status?: string, progress?: number) {
  if (isCompleted(status, progress)) {
    return "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  const s = normalizeStatus(status);

  if (s === "in progress" || s === "in-progress" || s === "ongoing") {
    return "border border-amber-500/20 bg-amber-500/10 text-amber-300";
  }

  return "border border-white/10 bg-white/[0.04] text-white/70";
}

function getPriorityBadge(priority?: string) {
  const p = (priority || "").trim().toLowerCase();

  if (p === "critical") {
    return "border border-red-500/20 bg-red-500/10 text-red-300";
  }

  if (p === "high") {
    return "border border-orange-500/20 bg-orange-500/10 text-orange-300";
  }

  if (p === "medium") {
    return "border border-violet-500/20 bg-violet-500/10 text-violet-300";
  }

  return "border border-white/10 bg-white/[0.04] text-white/70";
}

export default function TasksPage() {
  const searchParams = useSearchParams();
 const filter = searchParams.get("filter");
const project = searchParams.get("project");
const assignee = searchParams.get("assignee");
const target = searchParams.get("target");
const mode = searchParams.get("mode");

const isRedistributeMode = mode === "redistribute";
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [redistributing, setRedistributing] = useState(false);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/tasks", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load tasks");
        }

        const taskList = Array.isArray(data) ? data : data.tasks || [];
        setTasks(taskList);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

const filteredTasks = useMemo(() => {
  let result = tasks;

  if (project) {
    result = result.filter(
      (task) => String(task.project_name || "").trim() === project
    );
  }

  if (assignee) {
    result = result.filter(
      (task) => String(task.assignee_email || "").trim() === assignee
    );
  }

  if (filter === "overdue") {
    result = result.filter(isOverdue);
  }

  return result;
}, [tasks, filter, project, assignee]);
const visibleTaskIds = useMemo(() => {
  return filteredTasks
    .map((task) => task._id)
    .filter((id): id is string => Boolean(id));
}, [filteredTasks]);
  const stats = useMemo(() => {
    const overdue = tasks.filter(isOverdue).length;
    const completed = tasks.filter((task) => isCompleted(task.status, task.progress)).length;

    return {
      total: tasks.length,
      overdue,
      completed,
    };
  }, [tasks]);
const handleRedistribute = async () => {
  if (!target) {
    alert("Missing target assignee");
    return;
  }

  if (visibleTaskIds.length === 0) {
    alert("No tasks available to redistribute");
    return;
  }

  const confirmed = window.confirm(
    `Redistribute ${visibleTaskIds.length} task(s) from ${assignee || "current assignee"} to ${target}?`
  );

  if (!confirmed) return;

  try {
    setRedistributing(true);

    const res = await fetch("/api/tasks/redistribute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskIds: visibleTaskIds,
        targetAssignee: target,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to redistribute tasks");
    }

    setTasks((prev) =>
      prev.map((task) =>
        visibleTaskIds.includes(task._id || "")
          ? { ...task, assignee_email: target }
          : task
      )
    );

    alert(`Successfully reassigned ${data.updatedCount || visibleTaskIds.length} task(s) to ${target}`);
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Failed to redistribute tasks");
  } finally {
    setRedistributing(false);
  }
};
  if (loading) {
    return (
      <main className="min-h-screen bg-[#05060b] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-8 text-white/70">
            Loading tasks...
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-4xl font-semibold tracking-tight">Tasks</h1>
            <p className="mt-2 text-sm text-white/45">
              Live task data loaded from MongoDB
            </p>
          </div>

          <Link
            href="/import"
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
          >
            Import Data
          </Link>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d78bff]/10 text-[#d78bff]">
              <Briefcase size={18} />
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Total Tasks</p>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff6b6b]/10 text-[#ff6b6b]">
              <AlertTriangle size={18} />
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Overdue Tasks</p>
            <p className="mt-2 text-3xl font-semibold">{stats.overdue}</p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ea8ff]/10 text-[#8ea8ff]">
              <FolderKanban size={18} />
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Completed Tasks</p>
            <p className="mt-2 text-3xl font-semibold">{stats.completed}</p>
          </div>
        </section>
 {isRedistributeMode && (
  <div className="mb-6 rounded-[24px] border border-amber-500/20 bg-amber-500/10 px-5 py-4">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300/80">
          Redistribution Mode
        </p>
        <p className="mt-1 text-sm text-white/80">
          Review tasks before reassigning workload.
        </p>
      </div>

      <div className="flex flex-col gap-1 text-sm md:text-right">
        <span className="text-white/65">
          From: <span className="font-medium text-white">{assignee || "-"}</span>
        </span>
        <span className="text-white/65">
          To: <span className="font-medium text-white">{target || "-"}</span>
        </span>
      </div>
    </div>

    <div className="mt-4">
      <button
        onClick={handleRedistribute}
        disabled={redistributing || visibleTaskIds.length === 0 || !target}
        className="rounded-2xl bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {redistributing
          ? "Reassigning..."
          : `Reassign ${visibleTaskIds.length} task(s) to ${target || "target"}`}
      </button>
    </div>
  </div>
)}
{project && (
  <div className="mb-6 rounded-[22px] border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-4 py-3 text-sm font-medium text-[#9eb7ff]">
    Showing tasks for project: {project}
  </div>
)}
{assignee && (
  <div className="mb-6 rounded-[22px] border border-[#d78bff]/20 bg-[#d78bff]/10 px-4 py-3 text-sm font-medium text-[#df9fff]">
    Showing tasks for assignee: {assignee}
  </div>
)}
        {filter === "overdue" && (
          <div className="mb-6 rounded-[22px] border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 px-4 py-3 text-sm font-medium text-[#ff9d6a]">
            Showing overdue tasks only
          </div>
        )}

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] shadow-2xl shadow-black/20">
          <div className="border-b border-white/8 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">
              {isRedistributeMode
  ? `Redistribution Tasks (${filteredTasks.length})`
  : filter === "overdue"
  ? `Overdue Tasks (${filteredTasks.length})`
  : `All Tasks (${filteredTasks.length})`}
            </h2>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="px-5 py-10 text-sm text-white/45">
              No tasks found for this view.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-white/8 bg-white/[0.02]">
                  <tr className="text-left text-xs uppercase tracking-[0.16em] text-white/35">
                    <th className="px-5 py-4">Task</th>
                    <th className="px-5 py-4">Project</th>
                    <th className="px-5 py-4">Assignee</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Progress</th>
                    <th className="px-5 py-4">Due Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task, index) => (
                    <tr
                      key={task._id || `${task.task_name}-${index}`}
                      className="border-b border-white/6 text-sm text-white/80 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-medium text-white">{task.task_name}</td>
                      <td className="px-5 py-4 text-white/65">{task.project_name}</td>
                      <td className="px-5 py-4 text-white/65">{task.assignee_email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusBadge(
                            task.status,
                            task.progress
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#8ea8ff] to-[#d78bff]"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-white/65">{task.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-white/65">
                          <CalendarDays size={14} />
                          <span>{task.due_date || "-"}</span>
                          {isOverdue(task) && (
                            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-300">
                              Overdue
                            </span>
                          )}
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