"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
function getRecommendedTasks(tasks: TaskItem[], count: number) {
  return [...tasks]
    .filter((task) => !isCompleted(task.status, task.progress))
    .sort((a, b) => {
      const aOverdue = isOverdue(a) ? 1 : 0;
      const bOverdue = isOverdue(b) ? 1 : 0;

      return (
        bOverdue - aOverdue ||
        (a.progress || 0) - (b.progress || 0) ||
        String(b.priority || "").localeCompare(String(a.priority || ""))
      );
    })
    .slice(0, count)
    .map((task) => task._id)
    .filter((id): id is string => Boolean(id));
}
function getTaskRecommendationReasons(task: TaskItem) {
  const reasons: string[] = [];

  if (isOverdue(task)) {
    reasons.push("Overdue");
  }

  if ((task.progress || 0) <= 40) {
    reasons.push("Low progress");
  }

  const priority = String(task.priority || "").trim().toLowerCase();

  if (priority === "critical") {
    reasons.push("Critical priority");
  } else if (priority === "high") {
    reasons.push("High priority");
  }

  if (reasons.length === 0) {
    reasons.push("Best candidate");
  }

  return reasons.slice(0, 2);
}
export default function TasksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
 const filter = searchParams.get("filter");
const project = searchParams.get("project");
const assignee = searchParams.get("assignee");
const countParam = searchParams.get("count");
const recommendedCount = Math.max(1, Number(countParam || 0));
const target = searchParams.get("target");
const mode = searchParams.get("mode");

const isRedistributeMode = mode === "redistribute";
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [redistributing, setRedistributing] = useState(false);
const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
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

  const priorityWeight = (priority?: string) => {
    const p = String(priority || "").trim().toLowerCase();

    if (p === "critical") return 4;
    if (p === "high") return 3;
    if (p === "medium") return 2;
    if (p === "low") return 1;
    return 0;
  };

  return [...result].sort((a, b) => {
    const aOverdue = isOverdue(a) ? 1 : 0;
    const bOverdue = isOverdue(b) ? 1 : 0;

    if (bOverdue !== aOverdue) {
      return bOverdue - aOverdue;
    }

    const priorityDiff = priorityWeight(b.priority) - priorityWeight(a.priority);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const progressDiff = (a.progress || 0) - (b.progress || 0);
    if (progressDiff !== 0) {
      return progressDiff;
    }

    const aDue = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;

    return aDue - bDue;
  });
}, [tasks, filter, project, assignee]);
useEffect(() => {
  if (!isRedistributeMode) return;

  const safeCount = Number.isFinite(recommendedCount) ? recommendedCount : 1;
  const recommended = getRecommendedTasks(filteredTasks, safeCount);
  setSelectedTaskIds(recommended);
}, [isRedistributeMode, filteredTasks, recommendedCount]);
const visibleTaskIds = useMemo(() => {
  return filteredTasks
    .map((task) => task._id)
    .filter((id): id is string => Boolean(id));
}, [filteredTasks]);
const targetCurrentTaskCount = useMemo(() => {
  if (!target) return 0;

  return tasks.filter(
    (task) => String(task.assignee_email || "").trim() === target
  ).length;
}, [tasks, target]);

const projectedTargetTaskCount = targetCurrentTaskCount + selectedTaskIds.length;

const targetLoadImpact = useMemo(() => {
  if (!target) return "Unknown";

  if (projectedTargetTaskCount <= 4) return "Safe";
  if (projectedTargetTaskCount <= 7) return "Watch";
  return "Risk";
}, [target, projectedTargetTaskCount]);
const sourceCurrentTaskCount = useMemo(() => {
  if (!assignee) return 0;

  return tasks.filter(
    (task) => String(task.assignee_email || "").trim() === assignee
  ).length;
}, [tasks, assignee]);

const projectedSourceTaskCount = Math.max(
  0,
  sourceCurrentTaskCount - selectedTaskIds.length
);

const sourceReliefLevel = useMemo(() => {
  const shift = selectedTaskIds.length;

  if (shift >= 3) return "High";
  if (shift === 2) return "Moderate";
  if (shift === 1) return "Low";
  return "None";
}, [selectedTaskIds.length]);
const stats = useMemo(() => {
  const source = filteredTasks;

  const overdue = source.filter(isOverdue).length;
  const completed = source.filter((task) =>
    isCompleted(task.status, task.progress)
  ).length;
  const inProgress = source.filter((task) => {
    const s = normalizeStatus(task.status);
    return (
      !isCompleted(task.status, task.progress) &&
      (s === "in progress" || s === "in-progress" || s === "ongoing")
    );
  }).length;

  return {
    total: source.length,
    overdue,
    completed,
    inProgress,
  };
}, [filteredTasks]);
const handleRedistribute = async () => {
  if (!target) {
    alert("Missing target assignee");
    return;
  }

 if (selectedTaskIds.length === 0) {
  alert("No selected tasks available to redistribute");
  return;
}

 const confirmed = window.confirm(
  `Redistribute ${selectedTaskIds.length} selected task(s) from ${assignee || "current assignee"} to ${target}?`
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
       taskIds: selectedTaskIds,
        targetAssignee: target,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to redistribute tasks");
    }

alert(`Successfully reassigned ${data.updatedCount || selectedTaskIds.length} task(s) to ${target}`);
router.refresh();
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Failed to redistribute tasks");
  } finally {
    setRedistributing(false);
  }
};
const toggleTaskSelection = (taskId: string) => {
  setSelectedTaskIds((prev) =>
    prev.includes(taskId)
      ? prev.filter((id) => id !== taskId)
      : [...prev, taskId]
  );
};

const toggleSelectAllVisible = () => {
  if (selectedTaskIds.length === visibleTaskIds.length) {
    setSelectedTaskIds([]);
    return;
  }

  setSelectedTaskIds(visibleTaskIds);
};

const viewTitle = isRedistributeMode
  ? `Redistribution Tasks (${filteredTasks.length})`
  : project && filter === "overdue"
  ? `${project} — Overdue Tasks (${filteredTasks.length})`
  : project
  ? `${project} — Tasks (${filteredTasks.length})`
  : assignee && filter === "overdue"
  ? `${assignee} — Overdue Tasks (${filteredTasks.length})`
  : assignee
  ? `${assignee} — Tasks (${filteredTasks.length})`
  : filter === "overdue"
  ? `Overdue Tasks (${filteredTasks.length})`
  : `All Tasks (${filteredTasks.length})`;

const viewDescription = isRedistributeMode
  ? `Pilot selected candidate tasks for redistribution${assignee ? ` from ${assignee}` : ""}${target ? ` to ${target}` : ""}.`
  : project && filter === "overdue"
  ? `Showing overdue tasks for project ${project}.`
  : project
  ? `Showing all tasks for project ${project}.`
  : assignee && filter === "overdue"
  ? `Showing overdue tasks assigned to ${assignee}.`
  : assignee
  ? `Showing all tasks assigned to ${assignee}.`
  : filter === "overdue"
  ? "Showing all overdue tasks across the workspace."
  : "Showing all tasks across the workspace.";

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

        <section className="mb-6 grid gap-4 md:grid-cols-4">
  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d78bff]/10 text-[#d78bff]">
      <Briefcase size={18} />
    </div>
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">
      Visible Tasks
    </p>
    <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
  </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff6b6b]/10 text-[#ff6b6b]">
      <AlertTriangle size={18} />
    </div>
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">
      Overdue In View
    </p>
    <p className="mt-2 text-3xl font-semibold">{stats.overdue}</p>
  </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5b942]/10 text-[#f5b942]">
      <FolderKanban size={18} />
    </div>
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">
      In Progress
    </p>
    <p className="mt-2 text-3xl font-semibold">{stats.inProgress}</p>
  </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ea8ff]/10 text-[#8ea8ff]">
      <FolderKanban size={18} />
    </div>
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">
      Completed In View
    </p>
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
  <p className="mt-2 text-xs text-white/50">
    Pilot recommends shifting {recommendedCount} task{recommendedCount > 1 ? "s" : ""} based on current workload pressure.
  </p>
</div>
    </div>

    <div className="mt-4">
      <button
        onClick={handleRedistribute}
        disabled={redistributing || selectedTaskIds.length === 0 || !target}
        className="rounded-2xl bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
       {redistributing
  ? "Reassigning..."
  : selectedTaskIds.length === 0
  ? "No tasks selected"
  : `Reassign ${selectedTaskIds.length} selected task(s) to ${target || "target"}`}
      </button>
      <p className="mt-2 text-xs text-white/50">
  Pilot preselects the best redistribution candidates. You can adjust them below.
</p>
<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
    <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
      Selected Tasks
    </p>
    <p className="mt-2 text-lg font-semibold text-white">
      {selectedTaskIds.length}
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
    <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
      Expected Relief
    </p>
    <p className="mt-2 text-lg font-semibold text-white">
      {selectedTaskIds.length >= 3
        ? "High"
        : selectedTaskIds.length === 2
        ? "Moderate"
        : selectedTaskIds.length === 1
        ? "Low"
        : "None"}
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
    <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
      Target Load Impact
    </p>
   <p className="mt-2 text-lg font-semibold text-white">
  {targetLoadImpact}
</p>
<p className="mt-1 text-xs text-white/45">
  {targetCurrentTaskCount} → {projectedTargetTaskCount} tasks
</p>
  </div>
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
    Source Relief
  </p>
  <p className="mt-2 text-lg font-semibold text-white">
    {sourceReliefLevel}
  </p>
  <p className="mt-1 text-xs text-white/45">
    {sourceCurrentTaskCount} → {projectedSourceTaskCount} tasks
  </p>
</div>
</div>

    </div>
  </div>
)}
<div className="mb-6 rounded-[24px] border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-5 py-4">
  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9eb7ff]">
    Active View
  </p>
  <h2 className="mt-2 text-xl font-semibold text-white">{viewTitle}</h2>
  <p className="mt-2 text-sm text-white/65">{viewDescription}</p>
</div>
       {(project || assignee || filter === "overdue") && (
  <div className="mb-6 rounded-[22px] border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-4 py-3 text-sm font-medium text-[#dbe4ff]">
    {project && filter === "overdue"
      ? `Showing overdue tasks for project: ${project}`
      : project
      ? `Showing all tasks for project: ${project}`
      : assignee && filter === "overdue"
      ? `Showing overdue tasks for assignee: ${assignee}`
      : assignee
      ? `Showing all tasks for assignee: ${assignee}`
     
      : ""}
  </div>
)}

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] shadow-2xl shadow-black/20">
          <div className="border-b border-white/8 px-5 py-4">
   <h2 className="text-lg font-semibold text-white">{viewTitle}</h2>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="px-5 py-10 text-sm text-white/45">
              No tasks found for this view.
            </div>
          ) : (
           <div className="overflow-x-auto">
  <table className="min-w-[1100px] w-full table-fixed">
               <thead className="border-b border-white/8 bg-white/[0.02]">
  <tr className="text-left text-xs uppercase tracking-[0.16em] text-white/35">
    {isRedistributeMode && (
  <th className="px-5 py-4">
    <input
      type="checkbox"
      checked={
        visibleTaskIds.length > 0 &&
        selectedTaskIds.length === visibleTaskIds.length
      }
      onChange={toggleSelectAllVisible}
      className="h-4 w-4 accent-[#8ea8ff]"
    />
  </th>
)}
    <th className="w-[260px] px-5 py-4">Task</th>
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
     {isRedistributeMode && (
  <td className="px-5 py-4">
    {task._id ? (
      <input
        type="checkbox"
        checked={selectedTaskIds.includes(task._id)}
        onChange={() => toggleTaskSelection(task._id!)}
        className="h-4 w-4 accent-[#8ea8ff]"
      />
    ) : null}
  </td>
)}

<td className="px-5 py-4 font-medium text-white">
  <div className="max-w-[220px] break-words leading-6">
    <div className="flex flex-wrap items-center gap-2">
      <span>{task.task_name}</span>
      {task._id && selectedTaskIds.includes(task._id) && (
        <span className="rounded-full border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b7c8ff]">
          Selected
        </span>
      )}
    </div>

    {task._id && selectedTaskIds.includes(task._id) && (
      <div className="mt-2 flex flex-wrap gap-2">
        {getTaskRecommendationReasons(task).map((reason) => (
          <span
            key={reason}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/60"
          >
            {reason}
          </span>
        ))}
      </div>
    )}
  </div>
</td>

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