"use client";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Briefcase,
  FolderKanban,
  Search,
  Settings,
  Zap,
  Users,
} from "lucide-react";
import Link from "next/link";
import TopNavbar from "@/src/components/TopNavbar";
import { useEffect, useState } from "react";

function RiskRing({ score }: { score: number }) {
  const radius = 72;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = score / 100;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex h-44 w-44 items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="rgba(255,255,255,0.08)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#riskGradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8ab4ff" />
            <stop offset="100%" stopColor="#6f8cff" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight text-white">{score}</span>
        <span className="mt-1 text-sm text-white/60">/ 100</span>
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-[#161a2b] text-white shadow-[0_0_0_1px_rgba(138,180,255,0.12)]"
          : "text-white/55 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </div>
  );
}

function FactorCard({
  title,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border"
          style={{
            backgroundColor: `${color}12`,
            borderColor: `${color}40`,
            color,
          }}
        >
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/45">{subtitle}</p>
        </div>
      </div>

      <ArrowRight size={16} className="text-white/25" />
    </div>
  );
}

function SuggestionCard({
  title,
  description,
  tag,
  primaryHref,
  secondaryHref,
}: {
  title: string;
  description: string;
  tag: string;
  primaryHref?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="rounded-full border border-[#8ab4ff]/25 bg-[#8ab4ff]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9fb9ff]">
          {tag}
        </span>
      </div>

      <p className="text-sm leading-6 text-white/55">{description}</p>

      <div className="mt-4 flex gap-3">
        <Link
          href={primaryHref || "/tasks"}
          className="rounded-xl bg-[#8aa4ff] px-4 py-2 text-sm font-semibold text-[#111629] transition hover:brightness-110"
        >
          Execute Change
        </Link>

        <Link
          href={secondaryHref || "/ai-insights"}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.04] hover:text-white"
        >
          Details
        </Link>
      </div>
    </div>
  );
}

function WorkloadBar({
  name,
  value,
  avatarColor,
}: {
  name: string;
  value: number;
  avatarColor: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full border border-white/10"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), ${avatarColor})`,
            }}
          />
          <span className="font-medium text-white/85">{name}</span>
        </div>
        <span className="text-white/55">{value}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7da2ff] to-[#8ab4ff]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function AIInsightsPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        const data = await res.json();

        if (data.success) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to load AI insights data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05060b] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-center px-6">
          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] px-8 py-6 text-white/70">
            Loading AI insights...
          </div>
        </div>
      </main>
    );
  }

  const overdueTasks = dashboardData?.kpis?.overdueTasks || 0;
  const avgProgress = dashboardData?.kpis?.avgProgress || 0;
  const highRiskProjects = (dashboardData?.riskyProjects || []).filter(
    (project: any) => project.level === "High" || project.level === "Critical"
  ).length;

  const score = Math.max(
    0,
    Math.min(
      100,
      100 - overdueTasks * 6 - highRiskProjects * 10 - (100 - avgProgress) * 0.4
    )
  );

  const roundedScore = Math.round(score);

  const riskLabel =
    roundedScore < 40 ? "High Risk" : roundedScore < 70 ? "Medium Risk" : "Low Risk";

  const riskBadgeClass =
    roundedScore < 40
      ? "border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 text-[#ff7d7d]"
      : roundedScore < 70
      ? "border border-[#ffd56a]/20 bg-[#ffd56a]/10 text-[#ffd56a]"
      : "border border-[#8ab4ff]/20 bg-[#8ab4ff]/10 text-[#9db8ff]";

  const healthTitle =
    roundedScore < 40
      ? "Project Health Needs Immediate Attention"
      : roundedScore < 70
      ? "Project Health is Under Watch"
      : "Project Health is Stable";

  const healthDescription =
    roundedScore < 40
      ? `Operational risk is elevated. ${overdueTasks} overdue tasks and ${highRiskProjects} risky projects require action.`
      : roundedScore < 70
      ? `Execution remains manageable, but ${overdueTasks} overdue tasks and ${highRiskProjects} risky projects still need supervision.`
      : "Execution looks stable. Current delivery rhythm and project risk indicators are under control.";

  const workloadData = (dashboardData?.resourceWorkload || []).slice(0, 4);

  const averageWorkloadProgress =
    workloadData.length > 0
      ? Math.round(
          workloadData.reduce(
            (sum: number, member: any) => sum + (member.avgProgress || 0),
            0
          ) / workloadData.length
        )
      : 0;

  const overloadedCount = workloadData.filter(
    (member: any) => member.loadLevel === "Critical" || member.loadLevel === "High"
  ).length;

  const inProgressTasks = dashboardData?.kpis?.inProgressTasks || 0;

  const pilotFlags = [
    {
      key: "overdue",
      title: "Schedule pressure",
      subtitle: "Delivery slowdown detected",
      description:
        overdueTasks > 0
          ? `${overdueTasks} overdue tasks are reducing delivery confidence and increasing execution pressure across active workstreams.`
          : "No major schedule pressure detected across the current task pipeline.",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "#ff6b6b",
    },
    {
      key: "risk",
      title: "Portfolio risk",
      subtitle: "High-risk initiatives identified",
      description:
        highRiskProjects > 0
          ? `${highRiskProjects} projects are currently marked as high risk, which means they need closer monitoring and faster corrective action.`
          : "No project is currently marked as high risk by Pilot.",
      value: highRiskProjects,
      icon: Briefcase,
      color: "#8aa4ff",
    },
    {
      key: "workload",
      title: "Team load imbalance",
      subtitle: "Capacity tension across the team",
      description:
        overloadedCount > 0
          ? `${overloadedCount} team members are under high or critical workload, increasing the risk of bottlenecks and slower execution.`
          : "Team workload is currently balanced with no major overload signal.",
      value: overloadedCount,
      icon: Users,
      color: "#c28cff",
    },
  ];

  const recentActivity = (dashboardData?.recentActivity || []).slice(0, 5);
  const sortedPilotFlags = [...pilotFlags].sort((a, b) => b.value - a.value);

  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-[220px] border-r border-white/6 bg-[#070910] px-4 py-6 lg:flex lg:flex-col lg:justify-between">
         
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/35">AI status</p>
            <p className="mt-2 text-sm font-semibold text-white">Live analysis enabled</p>
            <p className="mt-1 text-xs leading-5 text-white/45">
              Insights are updating based on project activity and workload changes.
            </p>
          </div>
        </aside>

        <section className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <TopNavbar />
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#8aa4ff]">
              AI Insights
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Real-time project intelligence
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/50">
              Monitor project health, understand risk factors, and surface the best next
              actions with a premium AI-driven control layer.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
            <div className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(138,180,255,0.15),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/30">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                <div className="flex justify-center lg:justify-start">
                  <RiskRing score={roundedScore} />
                </div>

                <div className="flex-1">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${riskBadgeClass}`}
                    >
                      {riskLabel}
                    </span>
                    <span className="rounded-full border border-[#8ab4ff]/20 bg-[#8ab4ff]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9db8ff]">
                      AI Decision
                    </span>
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    {healthTitle}
                  </h2>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
                    {healthDescription}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/tasks?filter=overdue"
                      className="rounded-2xl bg-[#8aa4ff] px-5 py-3 text-sm font-semibold text-[#111629] transition hover:brightness-110"
                    >
                      Review Overdue Tasks
                    </Link>

                    <Link
                      href="/decision-center"
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Go to Decision Center
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
                  Risk Factors
                </h3>
                <span className="text-xs text-white/30">Live</span>
              </div>

              <div className="space-y-4">
                <FactorCard
                  title="Overdue Tasks"
                  subtitle={`${dashboardData?.kpis?.overdueTasks || 0} tasks behind schedule`}
                  icon={AlertTriangle}
                  color="#ff6b6b"
                />

                <FactorCard
                  title="Active Projects"
                  subtitle={`${dashboardData?.kpis?.activeProjects || 0} active portfolios tracked`}
                  icon={Briefcase}
                  color="#8aa4ff"
                />

                <FactorCard
                  title="Team Overload"
                  subtitle={`${
                    (dashboardData?.resourceWorkload || []).filter(
                      (member: any) =>
                        member.loadLevel === "Critical" || member.loadLevel === "High"
                    ).length
                  } team members need attention`}
                  icon={Users}
                  color="#c28cff"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Execution Health</h3>
                    <p className="text-sm text-white/40">
                      Live indicators showing delivery rhythm and operational pressure
                    </p>
                  </div>

                  <span className="rounded-full border border-[#8ab4ff]/20 bg-[#8ab4ff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9db8ff]">
                    Live
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Avg Progress
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">{avgProgress}%</p>
                    <p className="mt-2 text-sm text-white/45">
                      Overall execution average across tracked work
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      In Progress
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {inProgressTasks}
                    </p>
                    <p className="mt-2 text-sm text-white/45">
                      Tasks currently moving through execution
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Overdue
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">{overdueTasks}</p>
                    <p className="mt-2 text-sm text-white/45">
                      Delayed tasks impacting delivery confidence
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Risky Projects
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {highRiskProjects}
                    </p>
                    <p className="mt-2 text-sm text-white/45">
                      Projects currently flagged by Pilot intelligence
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Why Pilot is flagging this
                    </h3>
                    <p className="text-sm text-white/40">
                      Main drivers behind the current health score and AI alerts
                    </p>
                  </div>

                  <span className="rounded-full border border-[#ffcf66]/20 bg-[#ffcf66]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ffcf66]">
                    Dynamic Analysis
                  </span>
                </div>
<div className="mb-5 rounded-2xl border border-white/6 bg-white/[0.03] p-4">
  <p className="text-xs uppercase tracking-[0.18em] text-white/35">
    Primary Driver
  </p>
  <p className="mt-3 text-lg font-semibold text-white">
    {sortedPilotFlags[0].value > 0
      ? sortedPilotFlags[0].title
      : "System currently stable"}
  </p>
  <p className="mt-2 text-sm leading-6 text-white/55">
    {sortedPilotFlags[0].value > 0
      ? sortedPilotFlags[0].description
      : "Pilot is not detecting a major alert driver right now. Current execution, project risk, and workload signals remain under control."}
  </p>

  <div className="mt-4 flex flex-wrap gap-3">
    <Link
      href={
        sortedPilotFlags[0].key === "overdue"
          ? "/tasks?filter=overdue"
          : sortedPilotFlags[0].key === "risk"
          ? "/decision-center"
          : "/resource-hub"
      }
      className="rounded-xl bg-[#8aa4ff] px-4 py-2 text-sm font-semibold text-[#111629] transition hover:brightness-110"
    >
      {sortedPilotFlags[0].key === "overdue"
        ? "Open Overdue Tasks"
        : sortedPilotFlags[0].key === "risk"
        ? "Open Decision Center"
        : "Open Resource Hub"}
    </Link>

    <Link
      href="/dashboard"
      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.04] hover:text-white"
    >
      Back to Dashboard
    </Link>
  </div>
</div>

                <div className="grid gap-4 md:grid-cols-3">
                  {sortedPilotFlags.map((flag) => {
                    const Icon = flag.icon;

                    return (
                      <div
                        key={flag.key}
                        className="rounded-2xl border border-white/6 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-2xl"
                            style={{
                              backgroundColor: `${flag.color}12`,
                              color: flag.color,
                            }}
                          >
                            <Icon size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-white">{flag.title}</p>
                            <p className="text-xs text-white/45">{flag.subtitle}</p>
                          </div>
                        </div>

                        <p className="mt-4 text-2xl font-semibold text-white">
                          {flag.value}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-white/55">
                          {flag.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ab4ff]/10 text-[#9db8ff]">
                      <Brain size={18} />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Smart AI Suggestions
                      </h3>
                      <p className="text-sm text-white/40">
                        Context-aware action proposals
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#8ab4ff]/20 bg-[#8ab4ff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9db8ff]">
                    Live Analysis
                  </span>
                </div>

                <div className="space-y-4">
                  {(dashboardData?.aiSuggestions || []).map(
                    (suggestion: any, index: number) => {
                      let primaryHref = "/tasks";
                      let secondaryHref = "/ai-insights";

                      if (suggestion.title.toLowerCase().includes("overdue")) {
                        primaryHref = "/tasks?filter=overdue";
                        secondaryHref = "/tasks?filter=overdue";
                      } else if (suggestion.title.toLowerCase().includes("review")) {
                        const matchedProject = (dashboardData?.riskyProjects || []).find(
                          (project: any) =>
                            suggestion.title
                              .toLowerCase()
                              .includes(project.title.toLowerCase())
                        );

                        if (matchedProject) {
                          primaryHref = `/tasks?project=${encodeURIComponent(
                            matchedProject.title
                          )}&filter=overdue`;
                          secondaryHref = `/projects`;
                        }
                      } else if (suggestion.title.toLowerCase().includes("focus")) {
                        primaryHref = "/tasks";
                        secondaryHref = "/dashboard";
                      }

                      return (
                        <SuggestionCard
                          key={index}
                          title={suggestion.title}
                          description={suggestion.description}
                          tag={index === 0 ? "High Impact" : index === 1 ? "Efficiency" : "AI"}
                          primaryHref={primaryHref}
                          secondaryHref={secondaryHref}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Workload Distribution
                    </h3>
                    <p className="text-sm text-white/40">
                      Weekly team performance overview
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <span className="h-10 w-1 rounded-full bg-white/10" />
                    <span className="h-7 w-1 rounded-full bg-white/10" />
                    <span className="h-12 w-1 rounded-full bg-[#8ab4ff]" />
                    <span className="h-8 w-1 rounded-full bg-[#8ab4ff]" />
                    <span className="h-14 w-1 rounded-full bg-[#8ab4ff]" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                    Team Execution Average
                  </p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-4xl font-semibold text-white">
                      {averageWorkloadProgress}%
                    </span>
                    <span className="mb-1 text-sm font-medium text-[#8fd19e]">
                      {overloadedCount} under watch
                    </span>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7da2ff] to-[#8ab4ff]"
                      style={{ width: `${averageWorkloadProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {workloadData.map((member: any, index: number) => (
                    <WorkloadBar
                      key={index}
                      name={(member.assignee || "Unknown").split("@")[0]}
                      value={member.avgProgress || 0}
                      avatarColor={
                        member.loadLevel === "Critical"
                          ? "#ff6b6b"
                          : member.loadLevel === "High"
                          ? "#ff8f5a"
                          : "#8a6bff"
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                    <p className="text-sm text-white/40">
                      Latest signals captured across execution
                    </p>
                  </div>

                  <span className="rounded-full border border-[#8ab4ff]/20 bg-[#8ab4ff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9db8ff]">
                    Live Feed
                  </span>
                </div>

                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/6 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {item.title || "Activity detected"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-white/55">
                              {item.description ||
                                "A new execution signal was captured by Pilot."}
                            </p>
                          </div>

                          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/40">
                            {item.time || "Live"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
                      <p className="text-sm font-medium text-white">
                        No recent activity yet
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        Pilot will surface the latest execution signals here as soon as
                        new activity is detected.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 bg-[#070910]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-around">
          <div className="flex flex-col items-center gap-1 text-white/45">
            <FolderKanban size={18} />
            <span className="text-[11px]">Projects</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-[#9db8ff]">
            <Brain size={18} />
            <span className="text-[11px] font-semibold">Insights</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-white/45">
            <Users size={18} />
            <span className="text-[11px]">Team</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-white/45">
            <Settings size={18} />
            <span className="text-[11px]">Settings</span>
          </div>
        </div>
      </nav>
    </main>
  );
}