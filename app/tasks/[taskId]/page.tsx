"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Task = {
  taskId: string;
  task_name: string;
  project_name: string;
  assignee_email: string;
  status: string;
  priority: string;
  start_date: string;
  due_date: string;
  progress: number;
};

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
const [progressInput, setProgressInput] = useState("");
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");
  useEffect(() => {
    const fetchTask = async () => {
      const companyId = localStorage.getItem("pilot_company_id");

      if (!companyId) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/tasks/${taskId}`, {
        cache: "no-store",
        headers: {
          "x-company-id": companyId,
        },
      });

      const data = await res.json();

      if (data.success) {
    
        setTask(data.task);
setProgressInput(String(data.task.progress));
      }


      setLoading(false);
    };

    fetchTask();
  }, []);
const updateProgress = async () => {
  if (!task) return;

  try {
    setSaving(true);
    setMessage("");

    const companyId = localStorage.getItem("pilot_company_id");

    if (!companyId) {
      router.push("/login");
      return;
    }

    const res = await fetch(`/api/tasks/${task.taskId || taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-company-id": companyId,
      },
      body: JSON.stringify({
        progress: Number(progressInput),
        status: task.status,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setMessage(data.error || "Failed to update progress");
      return;
    }

    setTask(data.task);
    setProgressInput(String(data.task.progress));
    setMessage("Progress updated successfully.");
  } catch {
    setMessage("Something went wrong.");
  } finally {
    setSaving(false);
  }
};
  if (loading) {
    return (
      <main className="min-h-screen bg-[#080b14] p-8 text-white">
        Loading task...
      </main>
    );
  }

  if (!task) {
    return (
      <main className="min-h-screen bg-[#080b14] p-8 text-white">
        Task not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b14] p-8 text-white">
      <Link href="/tasks" className="text-sm text-[#8ea8ff] hover:underline">
        ← Back to tasks
      </Link>

      <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-[#8ea8ff]">
          {task.taskId}
        </p>

        <h1 className="mt-4 text-4xl font-semibold">{task.task_name}</h1>

        <p className="mt-3 text-white/50">{task.project_name}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Detail label="Assignee" value={task.assignee_email} />
          <Detail label="Status" value={task.status} />
          <Detail label="Priority" value={task.priority} />
          <Detail label="Progress" value={`${task.progress}%`} />
          <Detail label="Start date" value={task.start_date} />
          <Detail label="Due date" value={task.due_date} />
        </div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
  <p className="text-xs uppercase tracking-[0.2em] text-white/35">
    Update progress
  </p>

  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
    <input
      type="number"
      min="0"
      max="100"
      value={progressInput}
      onChange={(e) => setProgressInput(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-[#111629] px-4 py-3 text-sm text-white outline-none"
    />

    <button
      onClick={updateProgress}
      disabled={saving}
      className="rounded-2xl bg-[#8ea8ff] px-5 py-3 text-sm font-semibold text-[#101423] disabled:opacity-60"
    >
      {saving ? "Saving..." : "Save progress"}
    </button>
  </div>

  {message && <p className="mt-3 text-sm text-white/60">{message}</p>}
</div>  
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-sm text-white/80">{value}</p>
    </div>
  );
}