"use client";
import Link from "next/link";
import {
  AlertTriangle,
  Brain,
  FolderKanban,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMemo } from "react";
function NavPill({
  label,
  active = false,
  href = "#",
}: {
  label: string;
  active?: boolean;
  href?: string;
}) {
  
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#8ea8ff] text-[#0b1020]"
          : "text-white/65 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function MetricRow({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/45">{label}</span>
      <span className={danger ? "font-semibold text-[#ff6b6b]" : "font-semibold text-white"}>
        {value}
      </span>
    </div>
  );
}

function TeamCard({
  name,
  role,
  workload,
  tasks,
  status,
  statusColor,
  barColor,
}: {
  name: string;
  role: string;
  workload: number;
  tasks: number;
  status: string;
  statusColor: string;
  barColor: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-2xl border border-white/10"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(142,168,255,0.25), rgba(80,92,140,0.8))",
            }}
          />
          <div>
            <h3 className="text-base font-semibold text-white">{name}</h3>
            <p className="text-xs text-white/45">{role}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Status</p>
          <p className="mt-1 text-xs font-semibold uppercase" style={{ color: statusColor }}>
            {status}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-white/45">Capacity</span>
            <span className="font-semibold text-white">{workload}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${workload}%`,
                background: barColor,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-white/45">Active Tasks</span>
          <span className="font-semibold text-white">{tasks}</span>
        </div>

        <button className="mt-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white">
          View Task Board
        </button>
      </div>
    </div>
  );
}

export default function ResourceHubPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const [loadFilter, setLoadFilter] = useState("All");
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        const data = await res.json();

        if (data.success) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to load resource hub data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05060b] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1450px] items-center justify-center px-6">
          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] px-8 py-6 text-white/70">
            Loading resource hub...
          </div>
        </div>
      </main>
    );
  }
  const getLoadLabel = (loadLevel: string) => {
  if (loadLevel === "Critical") return "Overloaded";
  if (loadLevel === "High") return "At Risk";
  return "Stable";
};
const teamMembers = [...(dashboardData?.resourceWorkload || [])].sort((a: any, b: any) => {
  const score = (member: any) =>
    (member.loadLevel === "Critical" ? 3 : member.loadLevel === "High" ? 2 : 1) * 100 +
    (member.overdueCount || 0) * 10 +
    (member.taskCount || 0);

  return score(b) - score(a);
});
const filteredTeamMembers =
  loadFilter === "All"
    ? teamMembers
    : teamMembers.filter((member: any) => member.loadLevel === loadFilter);

const totalMembers = teamMembers.length;

const membersUnderWatch = teamMembers.filter(
  (member: any) => member.loadLevel === "Critical" || member.loadLevel === "High"
).length;

const totalOverdueTasks = teamMembers.reduce(
  (sum: number, member: any) => sum + (member.overdueCount || 0),
  0
);

const averageTeamProgress =
  teamMembers.length > 0
    ? Math.round(
        teamMembers.reduce(
          (sum: number, member: any) => sum + (member.avgProgress || 0),
          0
        ) / teamMembers.length
      )
    : 0;
const getMemberCardStyles = (loadLevel: string) => {
  if (loadLevel === "Critical") {
    return {
      cardClass:
        "border-[#ff6b6b]/20 bg-[radial-gradient(circle_at_top_left,rgba(255,107,107,0.16),transparent_35%),rgba(255,255,255,0.03)]",
      badgeClass:
        "border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 text-[#ff7d7d]",
      barClass: "bg-gradient-to-r from-[#ff6b6b] to-[#ff9b9b]",
    };
  }

  if (loadLevel === "High") {
    return {
      cardClass:
        "border-[#ff8f5a]/20 bg-[radial-gradient(circle_at_top_left,rgba(255,143,90,0.16),transparent_35%),rgba(255,255,255,0.03)]",
      badgeClass:
        "border border-[#ff8f5a]/20 bg-[#ff8f5a]/10 text-[#ff9d6a]",
      barClass: "bg-gradient-to-r from-[#ff8f5a] to-[#ffc27a]",
    };
  }

  return {
    cardClass:
      "border-[#8ea8ff]/20 bg-[radial-gradient(circle_at_top_left,rgba(142,168,255,0.16),transparent_35%),rgba(255,255,255,0.03)]",
    badgeClass:
      "border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 text-[#9eb7ff]",
    barClass: "bg-gradient-to-r from-[#8ea8ff] to-[#d78bff]",
  };
};
  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <div className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-[28px] border border-white/8 bg-[#070910]/90 px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-white">Pilot</div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <NavPill label="Projects" href="/dashboard" />
            <NavPill label="Tasks" href="/tasks" />
            <NavPill label="Activity" href="/activity" />
            <NavPill label="Settings" href="/settings" active />
          </nav>

          <div className="flex items-center gap-3">
            <button className="text-white/60 transition hover:text-white">
              <Search size={16} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#8ea8ff] to-[#6d84ff]" />
          </div>
        </header>

        <section className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#8ea8ff]/15 bg-[#8ea8ff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9eb7ff]">
            <Brain size={12} />
            Live System Health
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Team Resource Matrix
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">
            A real-time visualization of engineering bandwidth, identifying bottlenecks
            and redistributing tasks to maintain healthy delivery balance.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/25">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Total Capacity
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-semibold text-[#9eb7ff]">74</span>
              <span className="mb-1 text-lg text-white/45">%</span>
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-[#7e9eff] to-[#9eb7ff]" />
            </div>

            <div className="mt-8 space-y-4">
              <MetricRow label="Active Sprints" value={12} />
              <MetricRow label="Overloaded Nodes" value={2} danger />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(142,168,255,0.14),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/30">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="h-20 w-20 rounded-[24px] border border-white/10"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), rgba(255,153,122,0.35), rgba(74,82,128,0.82))",
                  }}
                />

                <div>
                  <div className="mb-2 inline-flex rounded-full border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff7d7d]">
                    Urgent Action Required
                  </div>

                  <h2 className="text-2xl font-semibold text-white">Elena Rostova</h2>
                  <p className="mt-1 text-sm text-white/45">Lead Interaction Designer</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:min-w-[280px]">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    Active Load
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#ff7d7d]">96%</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    Active Tasks
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">14</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase text-[#ff6b6b]">
                    Overloaded
                  </p>
                </div>
              </div>
            </div>

           <div className="mt-6 flex flex-wrap gap-3">
  <button className="rounded-2xl bg-[#ff7d7d] px-5 py-3 text-sm font-semibold text-[#180b0b] transition hover:brightness-110">
    Redistribute Tasks
  </button>

  <button className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white">
    View Task Board
  </button>

  <Link
    href="/decision-center"
    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
  >
    Back to Decision Center
  </Link>

  <Link
    href="/ai-insights"
    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
  >
    Back to AI Insights
  </Link>
</div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Core Engineering Team</h2>

            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.05] hover:text-white">
                <Users size={16} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.05] hover:text-white">
                <FolderKanban size={16} />
              </button>
            </div>
          </div>
<section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">Team Members</p>
    <p className="mt-2 text-3xl font-semibold text-white">{totalMembers}</p>
  </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">Under Watch</p>
    <p className="mt-2 text-3xl font-semibold text-white">{membersUnderWatch}</p>
  </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">Overdue Tasks</p>
    <p className="mt-2 text-3xl font-semibold text-white">{totalOverdueTasks}</p>
  </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">Avg Team Progress</p>
    <p className="mt-2 text-3xl font-semibold text-white">{averageTeamProgress}%</p>
  </div>
</section>
<section className="mb-6 flex flex-wrap gap-3">
 {[
  { value: "All", label: "All" },
  { value: "Critical", label: "Overloaded" },
  { value: "High", label: "At Risk" },
  { value: "Balanced", label: "Stable" },
].map((option) => {
  const isActive = loadFilter === option.value;

return (
  <button
    key={option.value}
    type="button"
    onClick={() => setLoadFilter(option.value)}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
          isActive
            ? "border-white/20 bg-white text-[#0b1020]"
            : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
        }`}
      >
        {option.label}
      </button>
    );
  })}
</section>
<div className="mb-4 flex flex-wrap gap-3 text-xs text-white/45">
  <div className="rounded-full border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 px-3 py-1 text-[#ff9a9a]">
    Overloaded = immediate attention needed
  </div>
  <div className="rounded-full border border-[#ff8f5a]/20 bg-[#ff8f5a]/10 px-3 py-1 text-[#ffb27f]">
    At Risk = elevated workload pressure
  </div>
  <div className="rounded-full border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-3 py-1 text-[#b7c8ff]">
    Stable = balanced current workload
  </div>
</div>
<p className="mb-4 text-sm text-white/45">
  Showing {filteredTeamMembers.length} member{filteredTeamMembers.length > 1 ? "s" : ""}
</p>

<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
  {filteredTeamMembers.map((member: any, index: number) => {
  const styles = getMemberCardStyles(member.loadLevel);

  return (
    <Link
  key={index}
  href={`/tasks?assignee=${encodeURIComponent(member.assignee)}`}
  className={`rounded-[24px] border p-5 shadow-xl shadow-black/20 transition hover:scale-[1.01] ${styles.cardClass}`}
>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {(member.assignee || "Unknown").split("@")[0]}
          </h3>
          <p className="mt-1 text-sm text-white/40">{member.assignee}</p>
        </div>

        <span
  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${styles.badgeClass}`}
>
 {getLoadLabel(member.loadLevel)}
</span>
      </div>

      <div className="space-y-3 text-sm text-white/65">
        <div className="flex items-center justify-between">
          <span>Assigned Tasks</span>
          <span className="font-medium text-white">{member.taskCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Overdue</span>
          <span className="font-medium text-white">{member.overdueCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Avg Progress</span>
          <span className="font-medium text-white">{member.avgProgress}%</span>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
  <div
    className={`h-full rounded-full ${styles.barClass}`}
    style={{ width: `${member.avgProgress || 0}%` }}
  />
</div>
    </Link>
    );
  })}</div>
        </section>

        <section className="mt-8">
          <div className="rounded-[28px] border border-[#ffb86a]/15 bg-[#ffb86a]/[0.06] p-5 shadow-xl shadow-black/20">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ffb86a]/15 text-[#ffb86a]">
                <AlertTriangle size={18} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">Resource Recommendation</h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
                  Pilot suggests moving 2 tasks from Elena Rostova to David Park and 1
                  infrastructure review item from Sarah Jenkins to Marcus Chen in order
                  to reduce overload peaks and rebalance execution capacity.
                </p>
              </div>
            </div>
          </div>
           </section>
      </div>
    </main>
  );
}