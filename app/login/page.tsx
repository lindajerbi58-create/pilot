"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const companies = [
  {
    name: "Demo Construction",
    companyId: "company-demo-construction",
  },
  {
    name: "Demo Consulting",
    companyId: "company-demo-consulting",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState(companies[0].companyId);

  const handleLogin = () => {
    localStorage.setItem("pilot_company_id", selectedCompany);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#080b14] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8ea8ff]">
            Pilot
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Company Access
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Select your company workspace to access only your imported projects,
            tasks, insights, and decisions.
          </p>

          <label className="mt-8 block text-sm text-white/60">
            Company workspace
          </label>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111629] px-4 py-3 text-sm text-white outline-none"
          >
            {companies.map((company) => (
              <option key={company.companyId} value={company.companyId}>
                {company.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleLogin}
            className="mt-6 w-full rounded-2xl bg-[#8ea8ff] px-5 py-3 text-sm font-semibold text-[#101423] transition hover:brightness-110"
          >
            Enter Pilot
          </button>
        </div>
      </div>
    </main>
  );
}