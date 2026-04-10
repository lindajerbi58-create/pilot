"use client";
import Link from "next/link";
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

function KPIBox({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 shadow-xl shadow-black/20">
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
}

function RiskProjectCard({
  title,
  reason,
  level,
  progress,
  bar,
}: {
  title: string;
  reason: string;
  level: string;
  progress: string;
  bar: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 shadow-lg shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs text-white/45">{reason}</p>
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
          <div className={`h-full rounded-full ${bar}`} />
        </div>
      </div>

      <Link
        href="/ai-insights"
        className="inline-flex items-center gap-2 text-xs font-medium text-[#9eb7ff] transition hover:text-white"
      >
        View Details
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function SuggestionMiniCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-white/45">{description}</p>
    </div>
  );
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
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        if (data.success) {
          setKpis(data.kpis);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);
  if (!kpis) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Loading dashboard...
    </div>
  );
}
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
              <TopNavLink href="/activity" label="Activity" />
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
            Operational Control
          </p>

          <div className="mt-3 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Executive Command
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm text-[#ff7d7d]">
                <AlertTriangle size={15} />
                <span>AI detected 3 critical risks in active portfolios</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white">
                <CalendarDays size={16} />
                Last 30 Days
              </button>

              <button className="rounded-2xl bg-[#8ea8ff] px-5 py-3 text-sm font-semibold text-[#0b1020] transition hover:brightness-110">
                + New Project
              </button>
              <Link
  href="/import"
  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/70 hover:bg-white/[0.05]"
>
  Import Data
</Link>
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

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KPIBox
  icon={FolderKanban}
  label="Active Projects"
  value={String(kpis.activeProjects)}
  delta="+ real"
  deltaLabel="live"
  iconColor="#8ea8ff"
/>
         <KPIBox
  icon={AlertTriangle}
  label="Overdue Tasks"
  value={String(kpis.overdueTasks)}
  delta="live"
  deltaLabel="attention"
  iconColor="#ff6b6b"
/>
        <KPIBox
  icon={Briefcase}
  label="Total Tasks"
  value={String(kpis.totalTasks)}
  delta="live"
  deltaLabel="tracked"
  iconColor="#d78bff"
/>
          <KPIBox
  icon={Users}
  label="Avg Progress"
  value={`${kpis.avgProgress}%`}
  delta="live"
  deltaLabel="execution"
  iconColor="#8ea8ff"
/>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Project Health Summary</h2>
                <p className="mt-1 text-sm text-white/40">
                  Weekly and risk distribution across portfolios
                </p>
              </div>

              <div className="text-xs text-white/40">
                <span className="text-[#8ea8ff]">●</span> Progress
                <span className="ml-3 text-white/20">●</span> Weekly
              </div>
            </div>

            <div className="flex h-[250px] items-end justify-between gap-4 rounded-[24px] bg-[#080a12] px-4 py-5">
              {[
                { day: "Mon", h1: "h-[30%]", h2: "h-[22%]" },
                { day: "Tue", h1: "h-[42%]", h2: "h-[34%]" },
                { day: "Wed", h1: "h-[78%]", h2: "h-[64%]" },
                { day: "Thu", h1: "h-[24%]", h2: "h-[48%]" },
                { day: "Fri", h1: "h-[60%]", h2: "h-[74%]" },
                { day: "Sat", h1: "h-[48%]", h2: "h-[38%]" },
                { day: "Sun", h1: "h-[72%]", h2: "h-[80%]" },
              ].map((item) => (
                <div key={item.day} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-[180px] items-end gap-1">
                    <div className={`w-6 rounded-t-xl bg-[#8ea8ff] ${item.h1}`} />
                    <div className={`w-6 rounded-t-xl bg-white/18 ${item.h2}`} />
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
              </div>

              <Link href="/activity" className="text-xs font-medium text-[#9eb7ff] hover:text-white">
                View All
              </Link>
            </div>

            <div className="space-y-5">
              <ActivityItem
                color="#8ea8ff"
                title="Sarah M. approved new Design Scope"
                subtitle="About 10 min ago"
              />
              <ActivityItem
                color="#d78bff"
                title="AI generated 3 smart recommendations"
                subtitle="System intelligence update"
              />
              <ActivityItem
                color="#8ea8ff"
                title="Vanguard Residential moved to High Risk"
                subtitle="Risk score changed after issue spike"
              />
              <ActivityItem
                color="#ff6b6b"
                title="System Alert: overdue tasks exceeded threshold"
                subtitle="Action required"
              />
            </div>

            <div className="mt-6 rounded-[22px] border border-[#8ea8ff]/15 bg-[#8ea8ff]/10 p-4">
              <p className="text-sm font-semibold text-white">Pilot AI Pro</p>
              <p className="mt-1 text-xs leading-6 text-white/55">
                AI is actively monitoring project velocity, workload balance, and
                issue escalation.
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
                <h2 className="text-lg font-semibold text-white">Portfolios at Risk</h2>
                <p className="mt-1 text-sm text-white/40">
                  Critical initiatives needing immediate attention
                </p>
              </div>

              <Link
                href="/ai-insights"
                className="text-xs font-medium text-[#9eb7ff] transition hover:text-white"
              >
                View AI Analysis
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <RiskProjectCard
                title="Project Titan"
                reason="Three blocked tasks"
                level="Critical"
                progress="72%"
                bar="w-[72%] bg-gradient-to-r from-[#8ea8ff] to-[#ff6b6b]"
              />
              <RiskProjectCard
                title="Vanguard Residential"
                reason="QA blocked by delay"
                level="High"
                progress="54%"
                bar="w-[54%] bg-gradient-to-r from-[#ff6b6b] to-[#ff8f5a]"
              />
              <RiskProjectCard
                title="Global Expansion"
                reason="Velocity dip (-11%)"
                level="Medium"
                progress="91%"
                bar="w-[91%] bg-gradient-to-r from-[#d78bff] to-[#ff8be3]"
              />
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Smart AI Suggestions</h2>
                  <p className="mt-1 text-sm text-white/40">
                    Generated by Pilot Intelligence
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <SuggestionMiniCard
                  title="Reassign API integration to David"
                  description="Reduce overload on Sarah and lower sprint bottleneck risk by 18%."
                />
                <SuggestionMiniCard
                  title="Increase priority for QA Sprint"
                  description="Current release timing suggests downstream delivery pressure."
                />
              </div>
            </div>

            <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Today’s Priorities</h2>
                  <p className="mt-1 text-sm text-white/40">Immediate operational actions</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Finalize Q3 Infrastructure Audit</p>
                    <span className="rounded-full border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 px-2 py-1 text-[10px] font-semibold uppercase text-[#ff7d7d]">
                      Urgent
                    </span>
                  </div>
                  <p className="text-xs leading-6 text-white/45">
                    Review final compliance gaps and submit action notes before EOD.
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Resolve API Gateway Latency</p>
                    <span className="rounded-full border border-[#ff8f5a]/20 bg-[#ff8f5a]/10 px-2 py-1 text-[10px] font-semibold uppercase text-[#ff9d6a]">
                      Priority
                    </span>
                  </div>
                  <p className="text-xs leading-6 text-white/45">
                    Blocked systems are affecting release validation and client staging.
                  </p>
                </div>
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