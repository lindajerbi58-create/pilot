"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Import", href: "/import" },
  { label: "Projects", href: "/projects" },
  { label: "Tasks", href: "/tasks" },
  { label: "AI Insights", href: "/ai-insights" },
  { label: "Decision Center", href: "/decision-center" },
  { label: "Resource Hub", href: "/resource-hub" },
];

export default function TopNavbar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("pilot_company_id");
    window.location.href = "/login";
  };

  return (
    <header className="mb-8 flex items-center justify-between rounded-[28px] border border-white/8 bg-[#070910]/90 px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold text-white">Pilot</div>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#8ea8ff] text-[#0b1020]"
                    : "text-white/65 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white"
      >
        Logout
      </button>
    </header>
  );
}