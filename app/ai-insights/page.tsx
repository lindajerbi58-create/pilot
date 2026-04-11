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
}: {
  title: string;
  description: string;
  tag: string;
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
        <button className="rounded-xl bg-[#8aa4ff] px-4 py-2 text-sm font-semibold text-[#111629] transition hover:brightness-110">
          Execute Change
        </button>
        <button className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.04] hover:text-white">
          Details
        </button>
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
              background:
                `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), ${avatarColor})`,
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

  const score = 45;

  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-[220px] border-r border-white/6 bg-[#070910] px-4 py-6 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-10 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8ab4ff] to-[#667cff] text-[#0b1020] shadow-lg shadow-[#6f8cff]/20">
                <Brain size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pilot</p>
                <p className="text-xs text-white/40">AI Project Control</p>
              </div>
            </div>

  <div className="space-y-2">
  <Link href="/dashboard">
    <NavItem icon={FolderKanban} label="Projects" />
  </Link>

  <Link href="/ai-insights">
    <NavItem icon={Brain} label="Insights" active />
  </Link>

  <Link href="/decision-center">
    <NavItem icon={Zap} label="Decision" />
  </Link>

  <Link href="/resource-hub">
    <NavItem icon={Users} label="Resources" />
  </Link>

  <Link href="/settings">
    <NavItem icon={Settings} label="Settings" />
  </Link>
</div>
</div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/35">AI status</p>
            <p className="mt-2 text-sm font-semibold text-white">Live analysis enabled</p>
            <p className="mt-1 text-xs leading-5 text-white/45">
              Insights are updating based on project activity and workload changes.
            </p>
          </div>
        </aside>

        <section className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8ab4ff] to-[#667cff] text-[#0b1020]">
                <Brain size={20} />
              </div>
              <span className="text-lg font-semibold">Pilot</span>
            </div>

            <div className="ml-auto flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-white/50">
              <Search size={16} />
              <span className="hidden sm:inline">Search insights</span>
            </div>
          </header>

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
                  <RiskRing score={score} />
                </div>

                <div className="flex-1">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#ffd56a]/20 bg-[#ffd56a]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ffd56a]">
                      Medium Risk
                    </span>
                    <span className="rounded-full border border-[#8ab4ff]/20 bg-[#8ab4ff]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9db8ff]">
                      AI Decision
                    </span>
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    Project Health is Stabilizing
                  </h2>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
                    The risk score has decreased by <span className="font-semibold text-[#9fb9ff]">12 points</span> since last week.
                    Current bottlenecks remain manageable, but team overload and blocked
                    work items still require active supervision.
                  </p>

                 <div className="mt-6 flex flex-wrap gap-3">
  <button className="rounded-2xl bg-[#8aa4ff] px-5 py-3 text-sm font-semibold text-[#111629] transition hover:brightness-110">
    View Detailed Report
  </button>

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
                  subtitle="14 tasks behind schedule"
                  icon={AlertTriangle}
                  color="#ff6b6b"
                />
                <FactorCard
                  title="Open Issues"
                  subtitle="3 critical blockers found"
                  icon={Briefcase}
                  color="#8aa4ff"
                />
                <FactorCard
                  title="Team Overload"
                  subtitle="80% average bandwidth"
                  icon={Users}
                  color="#c28cff"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ab4ff]/10 text-[#9db8ff]">
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Smart AI Suggestions</h3>
                    <p className="text-sm text-white/40">Context-aware action proposals</p>
                  </div>
                </div>

                <span className="rounded-full border border-[#8ab4ff]/20 bg-[#8ab4ff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9db8ff]">
                  Live Analysis
                </span>
              </div>

             <div className="space-y-4">
  {(dashboardData?.aiSuggestions || []).map((suggestion: any, index: number) => (
    <SuggestionCard
      key={index}
      title={suggestion.title}
      description={suggestion.description}
      tag={index === 0 ? "High Impact" : index === 1 ? "Efficiency" : "AI"}
    />
  ))}
</div>
            </div>

            <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Workload Distribution</h3>
                  <p className="text-sm text-white/40">Weekly team performance overview</p>
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
                  Weekly Velocity
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-4xl font-semibold text-white">84%</span>
                  <span className="mb-1 text-sm font-medium text-[#8fd19e]">+4%</span>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-[#7da2ff] to-[#8ab4ff]" />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <WorkloadBar name="Alex Rivers" value={92} avatarColor="#ff6b6b" />
                <WorkloadBar name="Maya Chen" value={45} avatarColor="#8a6bff" />
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