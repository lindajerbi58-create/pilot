"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COMPANY_CODES: Record<string, string> = {
  "CONSTRUCT-2026": "company-construction",
  "CONSULT-2026": "company-consulting",
};

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleAccess = () => {
    const companyId = COMPANY_CODES[code.trim().toUpperCase()];

    if (!companyId) {
      setError("Invalid access code");
      return;
    }

    localStorage.setItem("pilot_company_id", companyId);
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

          <p className="mt-3 text-sm text-white/50">
            Enter your company access code to open your workspace.
          </p>

          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="e.g. CONSTRUCT-2026"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-[#111629] px-4 py-3 text-sm text-white outline-none"
          />

          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={handleAccess}
            className="mt-6 w-full rounded-2xl bg-[#8ea8ff] px-5 py-3 text-sm font-semibold text-[#101423] transition hover:brightness-110"
          >
            Enter Pilot
          </button>

        </div>
      </div>
    </main>
  );
}