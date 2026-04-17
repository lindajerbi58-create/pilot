"use client";

import {
  AlertTriangle,
  Brain,
  Briefcase,
  FolderKanban,
  Plus,
  Search,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import TopNavbar from "@/src/components/TopNavbar";
import { useEffect, useState } from "react";
import Link from "next/link";

import { useRouter } from "next/navigation";
function SidebarItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#8ea8ff] text-[#0b1020]"
          : "text-white/65 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function MiniDecisionCard({
  title,
  icon: Icon,
  score,
  sublabel,
  color,
  href,
}: {
  title: string;
  icon: React.ElementType;
  score: string;
  sublabel: string;
  color: string;
  href?: string;
}) {
  const content = (
    <div
      className={`rounded-[24px] border border-white/8 bg-white/[0.03] p-4 shadow-xl shadow-black/20 transition ${
        href ? "cursor-pointer hover:bg-white/[0.05] hover:scale-[1.01]" : ""
      }`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${color}15`,
            color,
          }}
        >
          <Icon size={18} />
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-white">{score}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            {sublabel}
          </p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function DecisionCenterPage() {
  const router = useRouter();

useEffect(() => {
  const companyId = localStorage.getItem("pilot_company_id");

  if (!companyId) {
    router.push("/login");
  }
}, [router]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
       const storedCompanyId = localStorage.getItem("pilot_company_id");

    const res = await fetch("/api/dashboard", {
      cache: "no-store",
      headers: {
        "x-company-id": storedCompanyId || "",
      },
    });
        const data = await res.json();

        if (data.success) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to load decision center data:", error);
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
            Loading decision center...
          </div>
        </div>
      </main>
    );
  }
  
const pendingDecisions =
  (dashboardData?.kpis?.overdueTasks || 0) +
  (dashboardData?.riskyProjects?.length || 0) +
  (dashboardData?.resourceWorkload || []).filter(
    (member: any) => member.loadLevel === "Critical" || member.loadLevel === "High"
  ).length;
  const topRiskProject = dashboardData?.riskyProjects?.[0] || null;
const topOverloadedMember =
  (dashboardData?.resourceWorkload || []).find(
    (member: any) =>
      member.loadLevel === "Critical" || member.loadLevel === "High"
  ) || null;
const primaryDecisionTitle = topRiskProject
  ? `Review ${topRiskProject.title}`
  : topOverloadedMember
  ? `Rebalance ${String(topOverloadedMember.assignee || "team member").split("@")[0]} workload`
  : (dashboardData?.kpis?.overdueTasks || 0) > 0
  ? "Review overdue tasks"
  : "No urgent decision required";

const primaryDecisionReasoning = topRiskProject
  ? `${topRiskProject.title} is currently marked ${topRiskProject.level} risk. ${topRiskProject.reason}. Current progress is ${topRiskProject.progress}.`
  : "No major project risk detected right now. Continue monitoring delivery execution and team workload.";

const primaryDecisionConfidence = topRiskProject
  ? Math.min(98, Math.max(65, 60 + (100 - (topRiskProject.progressValue || 0)) / 2))
  : topOverloadedMember
  ? Math.min(94, 70 + topOverloadedMember.overdueCount * 5)
  : (dashboardData?.kpis?.overdueTasks || 0) > 0
  ? Math.min(92, 68 + dashboardData.kpis.overdueTasks * 4)
  : 0;

const projectedImpactLabel = topRiskProject
  ? `${topRiskProject.level} Priority`
  : "Stable";

const projectedImpactValue = topRiskProject
  ? `${topRiskProject.progress}`
  : "0%";
const miniDecisions = [
  ...(dashboardData?.riskyProjects || []).slice(0, 2).map((project: any) => ({
    title: project.title,
    score: `${project.progressValue || 0}%`,
    sublabel: project.level,
    color:
      project.level === "High"
        ? "#ff6b6b"
        : project.level === "Medium"
        ? "#ff8f5a"
        : "#8ea8ff",
    icon: AlertTriangle,
    href: `/tasks?project=${encodeURIComponent(project.title)}&filter=overdue`,
  })),
  ...(dashboardData?.aiSuggestions || []).slice(0, 1).map((suggestion: any) => {
    let href = "/ai-insights";

    if (suggestion.title.toLowerCase().includes("overdue")) {
      href = "/tasks?filter=overdue";
    } else if (suggestion.title.toLowerCase().includes("review")) {
      const matchedProject = (dashboardData?.riskyProjects || []).find((project: any) =>
        suggestion.title.toLowerCase().includes(project.title.toLowerCase())
      );

      if (matchedProject) {
        href = `/tasks?project=${encodeURIComponent(matchedProject.title)}&filter=overdue`;
      }
    }

    return {
      title: suggestion.title,
      score: "AI",
      sublabel: "Recommendation",
      color: "#8ea8ff",
      icon: Brain,
      href,
    };
  }),
];
const secondaryRiskProject = dashboardData?.riskyProjects?.[1] || null;


const secondaryDecisionTitle = secondaryRiskProject
  ? `Review ${secondaryRiskProject.title}`
  : topOverloadedMember
  ? `Inspect ${String(topOverloadedMember.assignee || "team member").split("@")[0]} workload`
  : "Monitor Execution";

const secondaryDecisionDescription = secondaryRiskProject
  ? `${secondaryRiskProject.title} is currently ${secondaryRiskProject.level} risk. ${secondaryRiskProject.reason}. Progress is ${secondaryRiskProject.progress}.`
  : topOverloadedMember
  ? `${String(topOverloadedMember.assignee || "This team member").split("@")[0]} is marked ${topOverloadedMember.loadLevel}. Review assigned tasks and rebalance workload if needed.`
  : "No secondary recommendation available right now.";

const secondaryDecisionScore = secondaryRiskProject
  ? Math.min(95, Math.max(55, 60 + (100 - (secondaryRiskProject.progressValue || 0)) / 2))
  : topOverloadedMember
  ? 82
  : 70;

const secondaryDecisionHref = secondaryRiskProject
  ? `/tasks?project=${encodeURIComponent(secondaryRiskProject.title)}&filter=overdue`
  : topOverloadedMember
  ? `/tasks?assignee=${encodeURIComponent(topOverloadedMember.assignee)}`
  : "/tasks";
  const recommendedActions = [
  ...(topRiskProject
    ? [
        {
          title: `Escalate ${topRiskProject.title}`,
          description: `${topRiskProject.title} is flagged ${topRiskProject.level} risk and requires immediate review.`,
          priority: topRiskProject.level,
          href: `/tasks?project=${encodeURIComponent(topRiskProject.title)}&filter=overdue`,
        },
      ]
    : []),

  ...(topOverloadedMember
    ? [
        {
          title: `Rebalance ${String(topOverloadedMember.assignee || "team member").split("@")[0]} workload`,
          description: `${String(topOverloadedMember.assignee || "This team member").split("@")[0]} is currently marked ${topOverloadedMember.loadLevel}. Review assignments and redistribute work.`,
          priority: topOverloadedMember.loadLevel,
          href: `/tasks?assignee=${encodeURIComponent(topOverloadedMember.assignee)}`,
        },
      ]
    : []),

  ...((dashboardData?.kpis?.overdueTasks || 0) > 0
    ? [
        {
          title: "Review overdue tasks",
          description: `${dashboardData.kpis.overdueTasks} overdue task(s) need immediate operational follow-up.`,
          priority: "High",
          href: "/tasks?filter=overdue",
        },
      ]
    : []),

  ...((dashboardData?.aiSuggestions || []).slice(0, 1).map((suggestion: any) => ({
    title: suggestion.title,
    description:
      suggestion.description ||
      "Pilot generated this recommendation from live delivery, workload, and risk signals.",
    priority: "AI",
    href: "/ai-insights",
  }))),
].slice(0, 4);
const decisionStats = [
  {
    label: "High Risk Projects",
    value: (dashboardData?.riskyProjects || []).filter(
      (project: any) => project.level === "High"
    ).length,
    tone: "danger",
    href: topRiskProject
      ? `/tasks?project=${encodeURIComponent(topRiskProject.title)}&filter=overdue`
      : "/tasks?filter=overdue",
  },
  {
    label: "Overdue Tasks",
    value: dashboardData?.kpis?.overdueTasks || 0,
    tone: "warning",
    href: "/tasks?filter=overdue",
  },
  {
    label: "Overloaded Members",
    value: (dashboardData?.resourceWorkload || []).filter(
      (member: any) =>
        member.loadLevel === "Critical" || member.loadLevel === "High"
    ).length,
    tone: "info",
    href: "/resource-hub",
  },
  {
    label: "AI Recommendations",
    value: (dashboardData?.aiSuggestions || []).length,
    tone: "primary",
    href: "/ai-insights",
  },
];
  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <div className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6 lg:px-8">
    <TopNavbar />
        <section className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#8ea8ff]/15 bg-[#8ea8ff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9eb7ff]">
          <Zap size={12} />
{pendingDecisions > 0 ? "Live Decision Signals" : "Workspace Stable"}
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Decision Center
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">
              {pendingDecisions > 0
  ? "Pilot detected operational signals that may need action. Review risks, delays, workload pressure, and AI recommendations from your live workspace data."
  : "No urgent decision is required right now. Pilot will continue monitoring your workspace as new project data changes."}
              </p>
            </div>

  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-6 py-4 text-right shadow-xl shadow-black/20">
  <p className="text-3xl font-semibold text-[#9eb7ff]">{pendingDecisions}</p>
  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
    Pending Decisions
  </p>
  
</div>
          </div>
        </section>
<section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {decisionStats.map((stat, index) => (
    <Link
      key={index}
      href={stat.href}
      className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 shadow-xl shadow-black/20 transition hover:bg-white/[0.05] hover:scale-[1.01]"
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
        {stat.label}
      </p>

      <div className="mt-4 flex items-end justify-between gap-3">
        <span className="text-3xl font-semibold text-white">{stat.value}</span>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
            stat.tone === "danger"
              ? "bg-[#ff6b6b]/15 text-[#ff9a9a]"
              : stat.tone === "warning"
              ? "bg-[#ffb86b]/15 text-[#ffd089]"
              : stat.tone === "info"
              ? "bg-[#7dd3fc]/15 text-[#9fe3ff]"
              : "bg-[#8ea8ff]/15 text-[#9eb7ff]"
          }`}
        >
          Live
        </span>
      </div>
    </Link>
  ))}
</section>
        <section className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
          <div className="rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(142,168,255,0.16),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/30">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
               <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
  Live Priority Recommendation
</p>
<span className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
  topRiskProject?.level === "High"
    ? "bg-[#ff6b6b]/15 text-[#ff8e8e]"
    : topRiskProject?.level === "Medium"
    ? "bg-[#ffb86b]/15 text-[#ffc98f]"
    : "bg-[#8ea8ff]/15 text-[#9eb7ff]"
}`}>
  {topRiskProject ? `${topRiskProject.level} Priority` : "Stable"}
</span>
<h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
  {primaryDecisionTitle}
</h2>
              </div>

              <div className="rounded-2xl border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
  <Zap size={14} className="text-[#9eb7ff]" />
  <span className="text-lg font-semibold text-[#9eb7ff]">
    {primaryDecisionConfidence}%
  </span>
</div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Confidence
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr]">
              <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-5">
                <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Reasoning
                </p>
  <p className="text-sm leading-7 text-white/70">
  {primaryDecisionReasoning}
</p>      </div>

              <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-5">
                <p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Projected Impact
                </p>

                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-white/65">Project Progress</span>
<span className="font-semibold text-[#9eb7ff]">{projectedImpactValue}</span>
                    </div>
                  <div className="h-2 rounded-full bg-white/[0.06]">
  <div
    className="h-2 rounded-full bg-gradient-to-r from-[#7e9eff] to-[#9eb7ff]"
    style={{ width: projectedImpactValue }}
  />
</div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-white/65">Decision Priority</span>
<span className="font-semibold text-[#ff8fb1]">{projectedImpactLabel}</span>
                    </div>
                   <div className="h-2 rounded-full bg-white/[0.06]">
  <div
    className="h-2 rounded-full bg-gradient-to-r from-[#ff73a5] to-[#ff9bbd]"
    style={{
      width:
        topRiskProject?.level === "High"
          ? "85%"
          : topRiskProject?.level === "Medium"
          ? "60%"
          : "35%",
    }}
  />
</div>
                  </div>
                </div>
              </div>
            </div>
<div className="mt-6 flex flex-wrap gap-3">
  <Link
    href={
      topRiskProject
        ? `/tasks?project=${encodeURIComponent(topRiskProject.title)}&filter=overdue`
        : "/tasks?filter=overdue"
    }
    className="rounded-2xl bg-[#8ea8ff] px-6 py-3 text-sm font-semibold text-[#0b1020] transition hover:brightness-110"
  >
    Open Risk Tasks
  </Link>

 <Link
  href="/dashboard"
  className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
>
  Open Dashboard
</Link>

  <Link
    href="/resource-hub"
    className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
  >
    Open Resource Hub
  </Link>

  <Link
    href="/ai-insights"
    className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
  >
    Back to AI Insights
  </Link>
</div>
          </div>

          <div className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/25">
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-full border border-[#ff8bd8]/20 bg-[#ff8bd8]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff9ce0]">
                Network Update
              </span>
            </div>

<h3 className="text-2xl font-semibold text-white">{secondaryDecisionTitle}</h3>

            <p className="mt-4 text-sm leading-7 text-white/60">
  {secondaryDecisionDescription}
</p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
              <span className="text-4xl font-semibold text-white">{secondaryDecisionScore}%</span>
                <span className="text-sm text-white/45">Success likelihood</span>
              </div>

             <div className="h-2 w-full rounded-full bg-white/[0.06]">
  <div
    className="h-2 rounded-full bg-gradient-to-r from-[#ff8bd8] to-[#9eb7ff]"
    style={{ width: `${secondaryDecisionScore}%` }}
  />
</div>
            </div>
<div className="mt-8 flex flex-wrap gap-3">
  <Link
    href={secondaryDecisionHref}
    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0b1020] transition hover:opacity-90"
  >
    Open Recommendation
  </Link>

  <Link
    href="/tasks"
    className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.04] hover:text-white"
  >
    Open Tasks
  </Link>
</div>
          </div>
        </section>

       <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
  {miniDecisions.map((decision: any, index: number) => (
   <MiniDecisionCard
  key={index}
  title={decision.title}
  icon={decision.icon}
  score={decision.score}
  sublabel={decision.sublabel}
  color={decision.color}
  href={decision.href}
/>
  ))}


</section>
<section className="mt-6 rounded-[32px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/25">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
        Recommended Actions
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">
        What Pilot suggests next
      </h2>
    </div>

    <div className="rounded-2xl border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-4 py-2 text-sm font-medium text-[#9eb7ff]">
      {recommendedActions.length} active
    </div>
  </div>

  <div className="grid gap-4 lg:grid-cols-2">
    {recommendedActions.map((action, index) => (
      <div
        key={index}
        className="rounded-[24px] border border-white/8 bg-[#0b0e17]/80 p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {action.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {action.description}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
              action.priority === "High" || action.priority === "Critical"
                ? "bg-[#ff6b6b]/15 text-[#ff8e8e]"
                : action.priority === "Medium"
                ? "bg-[#ffb86b]/15 text-[#ffc98f]"
                : action.priority === "AI"
                ? "bg-[#8ea8ff]/15 text-[#9eb7ff]"
                : "bg-white/10 text-white/60"
            }`}
          >
            {action.priority}
          </span>
        </div>

        <div className="mt-5">
          <Link
            href={action.href}
            className="inline-flex rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1020] transition hover:opacity-90"
          >
            Open action
          </Link>
        </div>
      </div>
    ))}
  </div>

  {recommendedActions.length === 0 && (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
      No urgent action detected right now. Pilot will keep monitoring incoming signals.
    </div>
  )}
</section>

        <nav className="mt-8 flex justify-center md:hidden">
  <div className="flex flex-wrap items-center justify-center gap-2 rounded-[24px] border border-white/8 bg-[#070910]/95 px-3 py-3">
    <Link href="/dashboard">
      <SidebarItem label="Dashboard" />
    </Link>

    <Link href="/ai-insights">
      <SidebarItem label="AI Insights" />
    </Link>

    <Link href="/decision-center">
      <SidebarItem label="Decision Center" active />
    </Link>

    <Link href="/resource-hub">
      <SidebarItem label="Resources" />
    </Link>
  </div>
</nav>
      </div>
    </main>
  );
}