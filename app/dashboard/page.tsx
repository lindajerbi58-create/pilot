"use client";
import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Brain,
  Briefcase,
  CalendarDays,
  FolderKanban,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

function TopNavLink({
  label,
  href,
  active = false,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#8ea8ff] text-[#0b1020]"
          : "text-white/65 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}
function SectionHelp({
  english,
  french,
}: {
  english: string;
  french: string;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <button
        type="button"
        className="text-sm font-medium text-[#8ea8ff] transition hover:text-white"
      >
        What does this section do?
      </button>

      <div className="mt-3 space-y-3 text-sm leading-6">
        <div>
          <p className="font-medium text-white">EN</p>
          <p className="text-white/65">{english}</p>
        </div>

        <div>
          <p className="font-medium text-white">FR</p>
          <p className="text-white/65">{french}</p>
        </div>
      </div>
    </div>
  );
}
function SectionHelpToggle({
  english,
  french,
}: {
  english: string;
  french: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
   <button
  type="button"
  onClick={() => setOpen((prev) => !prev)}
  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-[#8ea8ff] transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
>
  <span>{open ? "Hide info" : "What this section does"}</span>
</button>

      {open && (
  <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
    <div className="space-y-3 text-sm leading-6">
      <div className="rounded-xl bg-white/[0.03] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8ea8ff]">
          EN
        </p>
        <p className="text-white/70">{english}</p>
      </div>

      <div className="rounded-xl bg-white/[0.03] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8ea8ff]">
          FR
        </p>
        <p className="text-white/70">{french}</p>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
function KPIBox({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  iconColor,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  iconColor: string;
  href?: string;
}) {
  const content = (
    <div
      className={`rounded-[24px] border border-white/8 bg-white/[0.03] p-5 shadow-xl shadow-black/20 transition ${
        href ? "cursor-pointer hover:scale-[1.02] hover:bg-white/[0.05]" : ""
      }`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${iconColor}15`,
            color: iconColor,
          }}
        >
          <Icon size={18} />
        </div>

        <div className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
          {delta}
        </div>
      </div>

      <p className="text-xs uppercase tracking-[0.16em] text-white/35">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-3xl font-semibold text-white">{value}</span>
        <span className="text-xs text-white/35">{deltaLabel}</span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
function RiskProjectCard({
  title,
  reason,
  level,
  progress,
  bar,
  href,
}: {
  title: string;
  reason: string;
  level: string;
  progress: string;
  bar: string;
  href?: string;
}) {
  const cleanReason =
  reason?.toLowerCase().includes("execution slowing")
    ? "Project progress is slowing down"
    : reason?.toLowerCase().includes("needs monitoring")
    ? "This project needs attention"
    : reason?.toLowerCase().includes("overdue")
    ? reason
    : reason || "This project needs attention";
  const content = (
    <div
      className={`rounded-[24px] border border-white/8 bg-white/[0.03] p-4 shadow-lg shadow-black/20 transition ${
        href ? "cursor-pointer hover:bg-white/[0.05] hover:scale-[1.01]" : ""
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
         <p className="mt-2 text-sm text-white/60">{cleanReason}</p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
            level === "Critical"
              ? "border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 text-[#ff7d7d]"
              : level === "High"
                ? "border border-[#ff8f5a]/20 bg-[#ff8f5a]/10 text-[#ff9d6a]"
                : "border border-[#d78bff]/20 bg-[#d78bff]/10 text-[#df9fff]"
          }`}
        >
          {level}
        </span>
      </div>

      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-white/35">Progress</span>
          <span className="text-white/55">{progress}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full ${bar}`}
            style={{ width: progress }}
          />
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#9eb7ff]">
  Review problem
  <ArrowRight size={14} />
</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
function WorkloadCard({
  assignee,
  taskCount,
  overdueCount,
  avgProgress,
  loadLevel,
  href,
}: {
  assignee: string;
  taskCount: number;
  overdueCount: number;
  avgProgress: number;
  loadLevel: string;
  href?: string;
}) {
  const content = (
    <div
      className={`rounded-[22px] border border-white/8 bg-white/[0.03] p-4 transition ${
        href ? "cursor-pointer hover:bg-white/[0.05] hover:scale-[1.01]" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{assignee}</p>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
            loadLevel === "Critical"
              ? "border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 text-[#ff7d7d]"
              : loadLevel === "High"
              ? "border border-[#ff8f5a]/20 bg-[#ff8f5a]/10 text-[#ff9d6a]"
              : "border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 text-[#9eb7ff]"
          }`}
        >
          {loadLevel}
        </span>
      </div>

      <p className="text-xs leading-6 text-white/45">
        {taskCount} tasks • {overdueCount} overdue • {avgProgress}% avg progress
      </p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function SuggestionMiniCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href?: string;
}) 
{
  const lowerTitle = title.toLowerCase();

let actionText = "View action";

if (lowerTitle.includes("overdue") || lowerTitle.includes("late")) {
  actionText = "View late tasks";
} else if (
  lowerTitle.includes("workload") ||
  lowerTitle.includes("team") ||
  lowerTitle.includes("balance")
) {
  actionText = "Balance workload";
} else if (
  lowerTitle.includes("review") ||
  lowerTitle.includes("risk") ||
  lowerTitle.includes("decision")
) {
  actionText = "Review project";
}
  const content = (
    <div
      className={`rounded-[20px] border border-white/8 bg-white/[0.03] p-4 transition ${
        href ? "cursor-pointer hover:bg-white/[0.05] hover:scale-[1.01]" : ""
      }`}
    >
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-white/45">{description}</p>

      <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#9eb7ff]">
  {actionText}
  <ArrowRight size={14} />
</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
function ActivityItem({
  color,
  title,
  subtitle,
}: {
  color: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-1.5 h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-sm text-white/80">{title}</p>
        <p className="mt-1 text-xs text-white/40">{subtitle}</p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
async function handleResetWorkspace() {
  const confirmed = window.confirm(
    "This will permanently delete all imported tasks from the database. Do you want to continue?"
  );

  if (!confirmed) return;

  try {
    setIsResetting(true);

    const response = await fetch("/api/reset", {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to reset workspace");
    }

    window.location.reload();
  } catch (error) {
    console.error("Reset workspace error:", error);
    alert("Failed to reset workspace.");
  } finally {
    setIsResetting(false);
  }
}
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        if (data.success) {
          setDashboardData(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

const {
  kpis,
  riskyProjects,
  recentActivity,
  aiSuggestions,
  resourceWorkload,
  executionTrend,
} = dashboardData;

const criticalRiskCount = riskyProjects.filter(
  (project: any) => project.level === "Critical"
).length;

const highRiskCount = riskyProjects.filter(
  (project: any) => project.level === "High"
).length;

const totalRiskCount = riskyProjects.filter(
  (project: any) => project.level === "Critical" || project.level === "High"
).length;
const primaryIssue = dashboardData?.primaryIssue || "stable";
const systemRiskLevel =
  criticalRiskCount > 0 ? "Critical" : highRiskCount > 0 ? "High" : "Stable";

const systemRiskText =
  systemRiskLevel === "Critical"
    ? `${criticalRiskCount} project${criticalRiskCount > 1 ? "s have" : " has"} serious issues and need attention now`
    : systemRiskLevel === "High"
    ? `${totalRiskCount} project${totalRiskCount > 1 ? "s need" : " needs"} attention`
    : "Your projects are stable for now";
  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-[28px] border border-white/8 bg-[#070910]/90 px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-white">Pilot</div>

            <nav className="hidden items-center gap-2 md:flex">
              <TopNavLink href="/dashboard" label="Dashboard" active />
              <TopNavLink href="/projects" label="Projects" />
              <TopNavLink href="/tasks" label="Tasks" />
             
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.05] hover:text-white">
              <Search size={16} />
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.05] hover:text-white">
              <Bell size={16} />
            </button>

            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#8ea8ff] to-[#6d84ff]" />
          </div>
        </header>

        <section className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8ea8ff]">
           Project Dashboard
          </p>

          <div className="mt-3 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
  Project Overview
</h1>
<p className="mt-2 max-w-2xl text-sm text-white/45">
  See what’s happening in your projects and what needs attention.
</p>

              <div
  className={`mt-3 flex items-center gap-2 text-sm ${
    systemRiskLevel === "Critical"
      ? "text-[#ff7d7d]"
      : systemRiskLevel === "High"
      ? "text-[#ff9d6a]"
      : "text-[#9eb7ff]"
  }`}
>
  <AlertTriangle size={15} />
  <span>{systemRiskText}</span>
</div>
<SectionHelpToggle
  english="This section gives you a quick view of your overall project situation. It helps you understand the current level of risk and what needs attention first."
  french="Cette section vous donne une vue rapide de la situation générale de vos projets. Elle vous aide à comprendre le niveau de risque actuel et ce qui demande une attention en priorité."
/>
<div className="mt-4 rounded-2xl border border-[#8ea8ff]/15 bg-[#8ea8ff]/10 p-4">
  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8ea8ff]">
  WHAT SHOULD YOU DO NOW?
</p>

<p className="mt-2 text-sm font-semibold text-white">
  {primaryIssue === "overdue"
    ? "Some tasks are late. Check them now."
    : primaryIssue === "risk"
    ? "Some projects have problems. Review them now."
    : primaryIssue === "workload"
    ? "Some team members have too much work."
    : "Everything looks stable for now."}
</p>
<SectionHelpToggle
  english="This section tells you the most important action to take right now. It helps you focus on the next step when tasks, projects, or workload need attention."
  french="Cette section vous indique l’action la plus importante à faire maintenant. Elle vous aide à vous concentrer sur la prochaine étape lorsque des tâches, des projets ou la charge de travail demandent une attention."
/>

  <div className="mt-3">
    <Link
  href={
    primaryIssue === "overdue"
      ? "/tasks?filter=overdue"
      : primaryIssue === "risk"
      ? "/decision-center"
      : primaryIssue === "workload"
      ? "/resource-hub"
      : "/dashboard"
  }
      className="inline-flex items-center gap-2 text-xs font-medium text-[#9eb7ff] hover:text-white"
    >
     {systemRiskLevel === "Critical"
  ? "Open details"
  : systemRiskLevel === "High"
  ? "View problems"
  : "Stay here"}

      <ArrowRight size={14} />
    </Link>
  </div>
</div>
            </div>

            <div className="flex flex-wrap gap-3">
  

  <Link
    href="/import"
    className="rounded-2xl bg-[#8ea8ff] px-5 py-3 text-sm font-semibold text-[#0b1020] transition hover:brightness-110"
  >
    + New Project
  </Link>

  <Link
    href="/import"
    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.05] hover:text-white"
  >
    Import Data
  </Link>
  <button
  type="button"
  onClick={handleResetWorkspace}
  disabled={isResetting}
  className="inline-flex items-center rounded-full border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-2 text-sm font-medium text-[#ff9b9b] transition hover:bg-[#ff6b6b]/20 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isResetting ? "Resetting..." : "Reset Workspace"}
</button>
</div>
            <div className="mt-4">
  <div
    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
      systemRiskLevel === "Critical"
        ? "border-[#ff6b6b]/20 bg-[#ff6b6b]/10 text-[#ff7d7d]"
        : systemRiskLevel === "High"
        ? "border-[#ff8f5a]/20 bg-[#ff8f5a]/10 text-[#ff9d6a]"
        : "border-[#8ea8ff]/20 bg-[#8ea8ff]/10 text-[#9eb7ff]"
    }`}
  >
    <AlertTriangle size={14} />
Risk Level: {systemRiskLevel}
  </div>
</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/ai-insights"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-4 py-3 text-sm font-medium text-[#9eb7ff] transition hover:bg-[#8ea8ff]/15"
            >
              <Brain size={16} />
              View AI Insights
            </Link>

            <Link
              href="/decision-center"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#d78bff]/20 bg-[#d78bff]/10 px-4 py-3 text-sm font-medium text-[#df9fff] transition hover:bg-[#d78bff]/15"
            >
              <Sparkles size={16} />
              Decision Center
            </Link>

            <Link
              href="/resource-hub"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
            >
              <Users size={16} />
              Resource Hub
            </Link>
          </div>
        </section>
 <SectionHelpToggle
  english="This section shows the most important numbers in your workspace. It helps you quickly measure progress, delays, and the amount of work being tracked."
  french="Cette section affiche les chiffres les plus importants de votre espace de travail. Elle vous aide à mesurer rapidement l’avancement, les retards et la quantité de travail suivie."
/>
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
   
     <KPIBox
  icon={FolderKanban}
  label="Active Projects"
  value={String(kpis.activeProjects)}
  delta="current"
  deltaLabel="running"
  iconColor="#8ea8ff"
  href="/projects"
/>

<KPIBox
  icon={AlertTriangle}
  label="Late Tasks"
  value={String(kpis.overdueTasks)}
  delta="need"
  deltaLabel="attention"
  iconColor="#ff6b6b"
  href="/tasks?filter=overdue"
/>

<KPIBox
  icon={Briefcase}
  label="All Tasks"
  value={String(kpis.totalTasks)}
  delta="total"
  deltaLabel="tracked"
  iconColor="#d78bff"
  href="/tasks"
/>

<KPIBox
  icon={Users}
  label="Overall Progress"
  value={`${kpis.avgProgress}%`}
  delta="average"
  deltaLabel="completion"
  iconColor="#8ea8ff"
  href="/dashboard"
/>

        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
               <h2 className="text-lg font-semibold text-white">Project Progress</h2>
<p className="mt-1 text-sm text-white/40">
  See how your projects are moving over time
</p>
<SectionHelpToggle
  english="This section shows how your projects are progressing over time. It helps you see whether work is moving forward normally or slowing down."
  french="Cette section montre comment vos projets avancent au fil du temps. Elle vous aide à voir si le travail progresse normalement ou s’il ralentit."
/>
              </div>

              <div className="text-xs text-white/40">
                <span className="text-[#8ea8ff]">●</span> Progress
                <span className="ml-3 text-white/20">●</span> Weekly
              </div>
            </div>

            <div className="flex h-[250px] items-end justify-between gap-4 rounded-[24px] bg-[#080a12] px-4 py-5">
       {(executionTrend || []).map((item: any) => (
  <div key={item.day} className="flex flex-1 flex-col items-center gap-3">
    <div className="flex h-[180px] items-end gap-1">
      <div
        className="w-6 rounded-t-xl bg-[#8ea8ff]"
        style={{ height: `${item.progress}%` }}
      />
      <div
        className="w-6 rounded-t-xl bg-white/18"
        style={{ height: `${item.weekly}%` }}
      />
    </div>
    <span className="text-[11px] text-white/35">{item.day}</span>
  </div>
))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                <p className="mt-1 text-sm text-white/40">Live operational timeline</p>
                <SectionHelpToggle
  english="This section displays the latest changes in your projects. It helps you follow recent activity without opening every project manually."
  french="Cette section affiche les changements les plus récents dans vos projets. Elle vous aide à suivre l’activité récente sans ouvrir chaque projet manuellement."
/>
              </div>

             
            </div>

           <div className="space-y-5">
  {recentActivity.map((item: any, index: number) => (
    <ActivityItem
      key={index}
      color={item.color}
      title={item.title}
      subtitle={item.subtitle}
    />
  ))}
</div>

            <div className="mt-6 rounded-[22px] border border-[#8ea8ff]/15 bg-[#8ea8ff]/10 p-4">
              <p className="text-sm font-semibold text-white">Project Assistant</p>
<p className="mt-1 text-xs leading-6 text-white/55">
  The system checks project speed, workload, and possible issues.
</p>
              <Link
                href="/ai-insights"
                className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#9eb7ff] hover:text-white"
              >
                Learn More
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
               <h2 className="text-lg font-semibold text-white">Projects with Problems</h2>
<p className="mt-1 text-sm text-white/40">
  These projects need attention
</p>
<SectionHelpToggle
  english="This section highlights the projects that need attention. It helps you quickly identify delays, weak progress, or important issues."
  french="Cette section met en évidence les projets qui demandent de l’attention. Elle vous aide à identifier rapidement les retards, le faible avancement ou les problèmes importants."
/>
              </div>

              <Link
                href="/ai-insights"
                className="text-xs font-medium text-[#9eb7ff] transition hover:text-white"
              >
                View AI Analysis
              </Link>
            </div>

           <div className="grid gap-4 md:grid-cols-3">
 {riskyProjects.map((project: any, index: number) => (
  <RiskProjectCard
    key={index}
    title={project.title}
    reason={project.reason}
    level={project.level}
    progress={project.progress}
    bar={
      project.level === "Critical"
        ? "bg-gradient-to-r from-[#ff6b6b] to-[#ff8f5a]"
        : project.level === "High"
        ? "bg-gradient-to-r from-[#ff8f5a] to-[#d78bff]"
        : "bg-gradient-to-r from-[#8ea8ff] to-[#d78bff]"
    }
    href={`/tasks?project=${encodeURIComponent(project.title)}&filter=overdue`}
  />
))}
</div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between">
                <div>
                 <h2 className="text-lg font-semibold text-white">Suggested Actions</h2>
<p className="mt-1 text-sm text-white/40">
  What you can do to improve your projects
</p>
<SectionHelpToggle
  english="This section gives you simple recommendations to improve your projects. It helps you decide what to do next based on the current situation."
  french="Cette section vous donne des recommandations simples pour améliorer vos projets. Elle vous aide à décider quoi faire ensuite selon la situation actuelle."
/>
                </div>
              </div>

              <div className="space-y-4">
 {aiSuggestions.map((suggestion: any, index: number) => {
  const suggestionTitle = suggestion.title.toLowerCase();
  let href = "/ai-insights";

  if (suggestionTitle.includes("overdue") || suggestionTitle.includes("late")) {
    href = "/tasks?filter=overdue";
  } else if (
    suggestionTitle.includes("workload") ||
    suggestionTitle.includes("balance") ||
    suggestionTitle.includes("team")
  ) {
    href = "/resource-hub";
  } else if (
    suggestionTitle.includes("decision") ||
    suggestionTitle.includes("review") ||
    suggestionTitle.includes("risk")
  ) {
    const matchedProject = riskyProjects.find((project: any) =>
      suggestionTitle.includes(project.title.toLowerCase())
    );

    if (matchedProject) {
      href = `/tasks?project=${encodeURIComponent(matchedProject.title)}&filter=overdue`;
    } else {
      href = "/decision-center";
    }
  }

  return (
    <SuggestionMiniCard
      key={index}
      title={suggestion.title}
      description={suggestion.description}
      href={href}
    />
  );
})}
</div>
            </div>
<div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
  <div className="mb-5 flex items-center justify-between">
    <div>
     <h2 className="text-lg font-semibold text-white">Team Status</h2>
<p className="mt-1 text-sm text-white/40">See who has too much work</p>
<SectionHelpToggle
  english="This section shows the current workload of your team. It helps you see who has too much work and who may need support."
  french="Cette section montre la charge de travail actuelle de votre équipe. Elle vous aide à voir qui a trop de travail et qui peut avoir besoin d’aide."
/>
    </div>
  </div>

 <div className="space-y-4">
  {resourceWorkload
    .sort((a: any, b: any) => {
      const scoreA =
        (a.loadLevel === "Critical" ? 3 : a.loadLevel === "High" ? 2 : 1) * 100 +
        a.overdueCount * 10 +
        a.taskCount;

      const scoreB =
        (b.loadLevel === "Critical" ? 3 : b.loadLevel === "High" ? 2 : 1) * 100 +
        b.overdueCount * 10 +
        b.taskCount;

      return scoreB - scoreA;
    })
    .slice(0, 4)
    .map((member: any, index: number) => (
     <WorkloadCard
  key={index}
  assignee={member.assignee.split("@")[0]}
  taskCount={member.taskCount}
  overdueCount={member.overdueCount}
  avgProgress={member.avgProgress}
  loadLevel={member.loadLevel}
  href={`/tasks?assignee=${encodeURIComponent(member.assignee)}`}
/>
    ))}
</div>
</div>
       
          </div>
        </section>

        <nav className="mt-8 flex justify-center md:hidden">
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-[#070910]/95 px-3 py-2">
            <TopNavLink href="/dashboard" label="Dashboard" active />
            <TopNavLink href="/ai-insights" label="Insights" />
            <TopNavLink href="/decision-center" label="Decision" />
            <TopNavLink href="/resource-hub" label="Resources" />
          </div>
        </nav>
      </div>
    </main>
  );
}