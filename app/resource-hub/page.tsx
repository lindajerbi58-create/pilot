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

import { useRouter, useSearchParams } from "next/navigation";
import TopNavbar from "@/src/components/TopNavbar";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFilter = searchParams.get("filter");

useEffect(() => {
  const companyId = localStorage.getItem("pilot_company_id");

  if (!companyId) {
    router.push("/login");
  }
}, []);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const [loadFilter, setLoadFilter] = useState(
  urlFilter === "overloaded" ? "Overloaded" : "All"
);
const [sortMode, setSortMode] = useState("overloaded");

const [searchQuery, setSearchQuery] = useState("");
const [lastUpdated, setLastUpdated] = useState("");
const [refreshing, setRefreshing] = useState(false);
const fetchDashboardData = async () => {
  try {
    const storedCompanyId = localStorage.getItem("pilot_company_id");

    if (!storedCompanyId) {
      router.push("/login");
      return;
    }

    const res = await fetch("/api/dashboard", {
      cache: "no-store",
      headers: {
        "x-company-id": storedCompanyId,
      },
    });

    const data = await res.json();

    if (data.success) {
      setDashboardData(data);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  } catch (error) {
    console.error("Failed to load resource hub data:", error);
  } finally {
    setLoading(false);
  }
};
const handleRefresh = async () => {
  setRefreshing(true);
  await fetchDashboardData();
  setRefreshing(false);
};

useEffect(() => {
  const storedCompanyId = localStorage.getItem("pilot_company_id");

  if (!storedCompanyId) {
    router.push("/login");
    return;
  }

  fetchDashboardData();

  const interval = setInterval(fetchDashboardData, 60000);

  return () => clearInterval(interval);
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
const resetResourceHubView = () => {
  setLoadFilter("All");
  setSortMode("overloaded");
  setSearchQuery("");
};
const getActiveFilterLabel = () => {
  if (loadFilter === "Overloaded") return "Overloaded";
  if (loadFilter === "High") return "At Risk";
  if (loadFilter === "Balanced") return "Stable";
  return "All";
};

const getActiveSortLabel = () => {
  if (sortMode === "overdue") return "Most Overdue";
  if (sortMode === "progress") return "Best Progress";
  return "Most Overloaded";
};
const teamMembers = [...(dashboardData?.resourceWorkload || [])].sort((a: any, b: any) => {
  if (sortMode === "overdue") {
    return (
      (b.overdueCount || 0) - (a.overdueCount || 0) ||
      (b.riskScore || 0) - (a.riskScore || 0) ||
      (b.taskCount || 0) - (a.taskCount || 0)
    );
  }

  if (sortMode === "progress") {
    return (
      (b.avgProgress || 0) - (a.avgProgress || 0) ||
      (b.riskScore || 0) - (a.riskScore || 0) ||
      (b.taskCount || 0) - (a.taskCount || 0)
    );
  }

  return (
    (b.riskScore || 0) - (a.riskScore || 0) ||
    (b.overdueCount || 0) - (a.overdueCount || 0) ||
    (b.taskCount || 0) - (a.taskCount || 0)
  );
});
const filteredTeamMembers =
  loadFilter === "All"
    ? teamMembers
    : loadFilter === "Overloaded"
    ? teamMembers.filter(
        (member: any) =>
          member.loadLevel === "Critical" || member.loadLevel === "High"
      )
    : teamMembers.filter((member: any) => member.loadLevel === loadFilter);
const searchedTeamMembers = filteredTeamMembers.filter((member: any) => {
  const assignee = (member.assignee || "").toLowerCase();
  const displayName = assignee.split("@")[0];
  const query = searchQuery.toLowerCase().trim();

  if (!query) return true;

  return assignee.includes(query) || displayName.includes(query);
});
const totalMembers = teamMembers.length;

const membersUnderWatch = teamMembers.filter(
  (member: any) => member.loadLevel === "Critical" || member.loadLevel === "High"
).length;

const totalOverdueTasks = teamMembers.reduce(
  (sum: number, member: any) => sum + (member.overdueCount || 0),
  0
);
const lastUpdatedLabel = lastUpdated || "Not available";
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
const averageExecutionProgress =
  teamMembers.length > 0
    ? Math.round(
        teamMembers.reduce(
          (sum: number, member: any) => sum + (member.avgProgress || 0),
          0
        ) / teamMembers.length
      )
    : 0;

const overloadedNodes = teamMembers.filter(
  (member: any) => member.loadLevel === "Critical"
).length;

const activeSprints = teamMembers.reduce(
  (sum: number, member: any) => sum + (member.taskCount || 0),
  0
);
const executionPanelHint =
  averageExecutionProgress >= 75
    ? "healthy execution pace"
    : averageExecutionProgress >= 50
    ? "moderate delivery momentum"
    : "delivery pace needs attention";
const totalMembersHint = "live team size";
const membersUnderWatchHint =
  membersUnderWatch > 0 ? "members needing attention" : "no active pressure detected";
const totalOverdueTasksHint =
  totalOverdueTasks > 0 ? "total delayed items" : "no overdue tasks";
const averageTeamProgressHint = "current team average";
const mostCriticalMember =
  [...teamMembers].sort(
    (a: any, b: any) =>
      (b.riskScore || 0) - (a.riskScore || 0) ||
      (b.overdueCount || 0) - (a.overdueCount || 0) ||
      (a.avgProgress || 0) - (b.avgProgress || 0)
  )[0] || null;

const urgentMemberName = mostCriticalMember?.assignee
  ? mostCriticalMember.assignee.split("@")[0]
  : "No critical member";

const urgentMemberRole = mostCriticalMember?.assignee || "No active assignee";

const urgentMemberLoad =
  mostCriticalMember?.loadLevel === "Critical"
    ? "Overloaded"
    : mostCriticalMember?.loadLevel === "High"
    ? "At Risk"
    : "Stable";

const urgentMemberLoadValue = mostCriticalMember?.avgProgress || 0;
const urgentMemberTasks = mostCriticalMember?.taskCount || 0;
const urgentMemberEmail = mostCriticalMember?.assignee || "";
const overloadedMembers = [...teamMembers]
  .filter((member: any) => member.loadLevel === "Critical" || member.loadLevel === "High")
  .sort((a: any, b: any) => (b.riskScore || 0) - (a.riskScore || 0));

const balancedMembers = [...teamMembers]
  .filter((member: any) => member.loadLevel === "Balanced" || member.loadLevel === "Light")
  .sort((a: any, b: any) => (a.riskScore || 0) - (b.riskScore || 0));

const sourceMember = overloadedMembers[0] || null;
const targetMember = balancedMembers[0] || null;
const sourceMemberEmail = sourceMember?.assignee || "";
const targetMemberEmail = targetMember?.assignee || "";

const sourceMemberName = sourceMemberEmail
  ? sourceMemberEmail.split("@")[0]
  : "";

const targetMemberName = targetMemberEmail
  ? targetMemberEmail.split("@")[0]
  : "";
const suggestedTaskShift =
  sourceMember && targetMember
    ? Math.max(1, Math.min(2, Math.ceil((sourceMember.overdueCount || 0) / 2)))
    : 0;

const recommendationTitle =
  sourceMember && targetMember
    ? "Resource Recommendation"
    : "Workload Recommendation";
    const recommendationIsCalm = !sourceMember || !targetMember;
const sortedByLoad = [...teamMembers].sort(
  (a: any, b: any) => (b.taskCount || 0) - (a.taskCount || 0)
);

const lightestMember = [...teamMembers].sort(
  (a: any, b: any) => (a.taskCount || 0) - (b.taskCount || 0)
)[0];

const optimizationSource = sortedByLoad[0];
const optimizationTarget = lightestMember;

const canOptimize =
  recommendationIsCalm &&
  optimizationSource &&
  optimizationTarget &&
  optimizationSource.assignee !== optimizationTarget.assignee &&
  (optimizationSource.taskCount || 0) - (optimizationTarget.taskCount || 0) >= 2;

const recommendationText =
  sourceMember && targetMember
    ? `Pilot suggests moving ${suggestedTaskShift} task${
        suggestedTaskShift > 1 ? "s" : ""
      } from ${sourceMemberName} to ${targetMemberName} to reduce delivery pressure and rebalance execution.`
    : canOptimize
    ? `System is stable, but minor optimization is possible. Pilot suggests shifting 1 low-impact task from ${
        optimizationSource.assignee.split("@")[0]
      } to ${
        optimizationTarget.assignee.split("@")[0]
      } to further balance workload.`
    : "System is currently balanced. No immediate redistribution required.";


  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <div className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6 lg:px-8">
       <TopNavbar />
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
  Team Execution
</p>

  <div className="mt-4 flex items-end gap-2">
    <span className="text-5xl font-semibold text-[#9eb7ff]">{averageExecutionProgress}</span>
    <span className="mb-1 text-lg text-white/45">%</span>
  </div>

  <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
    <div
      className="h-full rounded-full bg-gradient-to-r from-[#7e9eff] to-[#9eb7ff]"
      style={{ width: `${averageExecutionProgress}%` }}
    />
  </div>
  <p className="mt-3 text-xs text-white/40">{executionPanelHint}</p>

  <div className="mt-8 space-y-4">
    <MetricRow label="Active Tasks" value={activeSprints} />
    <MetricRow label="Overloaded Nodes" value={overloadedNodes} danger />
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

        {urgentMemberEmail ? (
  <Link
    href={`/tasks?assignee=${encodeURIComponent(urgentMemberEmail)}`}
    className="inline-block"
  >
    <h2 className="text-2xl font-semibold text-white transition hover:text-[#9eb7ff]">
      {urgentMemberName}
    </h2>
  </Link>
) : (
  <h2 className="text-2xl font-semibold text-white">{urgentMemberName}</h2>
)}

<p className="mt-1 text-sm text-white/45">{urgentMemberRole}</p>
      </div>
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:min-w-[280px]">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
          Avg Progress
        </p>
        <p className="mt-2 text-3xl font-semibold text-[#ff7d7d]">
          {urgentMemberLoadValue}%
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
          Active Tasks
        </p>
        <p className="mt-2 text-3xl font-semibold text-white">{urgentMemberTasks}</p>
      </div>

      <div className="sm:col-span-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
          Status
        </p>
        <p className="mt-2 text-sm font-semibold uppercase text-[#ff6b6b]">
          {urgentMemberLoad}
        </p>
      </div>
    </div>
  </div>

  <div className="mt-6 flex flex-wrap gap-3">
 {urgentMemberEmail ? (
  <Link
   href={`/tasks?assignee=${encodeURIComponent(
  urgentMemberEmail
)}&target=${encodeURIComponent(
  targetMemberEmail || ""
)}&mode=redistribute&count=${suggestedTaskShift}`}
    className="rounded-2xl bg-[#ff7d7d] px-5 py-3 text-sm font-semibold text-[#180b0b] transition hover:brightness-110"
  >
    Redistribute Tasks
  </Link>
) : (
  <button
    disabled
    className="rounded-2xl bg-[#ff7d7d]/60 px-5 py-3 text-sm font-semibold text-[#180b0b]/70"
  >
    Redistribute Tasks
  </button>
)}
   {urgentMemberEmail ? (
  <Link
    href={`/tasks?assignee=${encodeURIComponent(urgentMemberEmail)}`}
    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
  >
    View Task Board
  </Link>
) : (
  <button
    disabled
    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/35"
  >
    View Task Board
  </button>
)}

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
    <p className="mt-2 text-xs text-white/40">{totalMembersHint}</p>
  </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">Under Watch</p>
    <p className="mt-2 text-3xl font-semibold text-white">{membersUnderWatch}</p>
    <p className="mt-2 text-xs text-white/40">{membersUnderWatchHint}</p>
  </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">Overdue Tasks</p>
    <p className="mt-2 text-3xl font-semibold text-white">{totalOverdueTasks}</p>
    <p className="mt-2 text-xs text-white/40">{totalOverdueTasksHint}</p>
  </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
    <p className="text-xs uppercase tracking-[0.16em] text-white/35">Avg Team Progress</p>
    <p className="mt-2 text-3xl font-semibold text-white">{averageTeamProgress}%</p>
    <p className="mt-2 text-xs text-white/40">{averageTeamProgressHint}</p>
  </div>
</section>
<section className="mb-6 flex flex-wrap gap-3">
{[
  { value: "All", label: "All" },
  { value: "Overloaded", label: "Overloaded" },
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
<section className="mb-4 flex flex-wrap items-center gap-3">
  <p className="text-xs uppercase tracking-[0.16em] text-white/35">Sort by</p>

  {[
    { value: "overloaded", label: "Most Overloaded" },
    { value: "overdue", label: "Most Overdue" },
    { value: "progress", label: "Best Progress" },
  ].map((option) => {
    const isActive = sortMode === option.value;

    return (
      <button
        key={option.value}
        type="button"
        onClick={() => setSortMode(option.value)}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
          isActive
            ? "border-[#8ea8ff]/30 bg-[#8ea8ff] text-[#0b1020]"
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
<div className="mb-4">
  <div className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
    <Search size={16} className="text-white/35" />
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search by member name or email..."
      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
    />
  </div>
</div>
<div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/70">
    Status: {getActiveFilterLabel()}
  </div>

  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/70">
    Sort: {getActiveSortLabel()}
  </div>

  {searchQuery.trim() && (
    <div className="rounded-full border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-3 py-1 text-[#b7c8ff]">
      Search: {searchQuery}
    </div>
  )}

  <button
    type="button"
    onClick={resetResourceHubView}
    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/70 transition hover:bg-white/[0.06] hover:text-white"
  >
    Reset all
  </button>
</div>
<p className="mb-4 text-sm text-white/45">
 Showing {searchedTeamMembers.length} member{searchedTeamMembers.length > 1 ? "s" : ""}
</p>

{searchedTeamMembers.length === 0? (
  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-8 text-center shadow-xl shadow-black/20">
    <p className="text-sm uppercase tracking-[0.16em] text-white/35">
      No team members found
    </p>
    <h3 className="mt-3 text-xl font-semibold text-white">
      No members match this filter
    </h3>
<p className="mt-2 text-sm leading-7 text-white/50">
  Try changing the workload filter, sort mode, or search query to find the team member you are looking for.
</p>

    <button
      type="button"
   onClick={resetResourceHubView}
      className="mt-5 inline-flex items-center rounded-xl bg-[#8ea8ff] px-4 py-2 text-sm font-semibold text-[#0b1020] transition hover:brightness-110"
    >
      Show all members
    </button>
  </div>
) : (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
   {searchedTeamMembers.map((member: any, index: number) => {
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
            <div className="flex items-center justify-between">
  <span>Risk Score</span>
  <span className="font-medium text-white">{member.riskScore ?? 0}/100</span>
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
    })}
  </div>
)}
        </section>

        <section className="mt-8">
  <div
    className={`rounded-[28px] p-5 shadow-xl shadow-black/20 ${
      recommendationIsCalm
        ? "border border-[#8ea8ff]/15 bg-[#8ea8ff]/[0.06]"
        : "border border-[#ffb86a]/15 bg-[#ffb86a]/[0.06]"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${
          recommendationIsCalm
            ? "bg-[#8ea8ff]/15 text-[#8ea8ff]"
            : "bg-[#ffb86a]/15 text-[#ffb86a]"
        }`}
      >
        <AlertTriangle size={18} />
      </div>

      <div>
        <h3 className="text-base font-semibold text-white">{recommendationTitle}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
          {recommendationText}
        </p>
        {sourceMember && targetMember && (
  <div className="mt-4 flex flex-wrap gap-2">
    <div className="rounded-full border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-3 py-1 text-xs font-medium text-[#b7c8ff]">
      {suggestedTaskShift} Task{suggestedTaskShift > 1 ? "s" : ""} to Shift
    </div>

    <div className="rounded-full border border-[#ff8f5a]/20 bg-[#ff8f5a]/10 px-3 py-1 text-xs font-medium text-[#ffb27f]">
      From {sourceMemberName}
    </div>

    <div className="rounded-full border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 px-3 py-1 text-xs font-medium text-[#bae6fd]">
      To {targetMemberName}
    </div>
  </div>
)}

    <div className="mt-4 flex flex-wrap gap-3">
  {sourceMemberEmail && targetMemberEmail ? (
  <Link
    href={`/tasks?assignee=${encodeURIComponent(
      sourceMemberEmail
    )}&target=${encodeURIComponent(
      targetMemberEmail
    )}&mode=redistribute&count=${suggestedTaskShift}`}
    className="inline-flex items-center gap-2 rounded-xl bg-[#ffb86a] px-4 py-2 text-sm font-semibold text-[#1a0f00] transition hover:brightness-110"
  >
    Redistribute from {sourceMemberName} → {targetMemberName}
  </Link>
) : canOptimize ? (
  <Link
    href={`/tasks?assignee=${encodeURIComponent(
      optimizationSource.assignee
    )}&target=${encodeURIComponent(
      optimizationTarget.assignee
    )}&mode=redistribute&count=1`}
    className="inline-flex items-center gap-2 rounded-xl bg-[#8ea8ff] px-4 py-2 text-sm font-semibold text-[#0b1020] transition hover:brightness-110"
  >
    Optimize workload →
  </Link>
) : (
  <Link
    href="/tasks"
    className="inline-flex items-center gap-2 rounded-xl bg-[#8ea8ff] px-4 py-2 text-sm font-semibold text-[#0b1020] transition hover:brightness-110"
  >
    View All Tasks →
  </Link>
)}

  {sourceMemberEmail && (
    <Link
      href={`/tasks?assignee=${encodeURIComponent(sourceMemberEmail)}`}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.05] hover:text-white"
    >
      View {sourceMemberName}&apos;s Tasks →
    </Link>
  )}

  {targetMemberEmail && (
    <Link
      href={`/tasks?assignee=${encodeURIComponent(targetMemberEmail)}`}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.05] hover:text-white"
    >
      View {targetMemberName}&apos;s Tasks →
    </Link>
  )}
</div>
      </div>
    </div>
  </div>
</section>
      </div>
    </main>
  );
}