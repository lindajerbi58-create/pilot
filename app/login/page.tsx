"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccess = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/company/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!data.success) {
        setError("Invalid access code");
        return;
      }

      localStorage.setItem("pilot_company_id", data.companyId);
      localStorage.setItem("pilot_company_name", data.companyName);
      localStorage.setItem("pilot_company_code", data.code);

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a13] px-6 py-10 text-white">
      <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[#8ea8ff]/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[#f05d7b]/10 blur-[120px]" />

     <div className="relative mx-auto flex min-h-[85vh] max-w-xl flex-col items-center justify-center">
       <section className="mb-8 text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-[#8ea8ff]">
            Pilot AI Workspace
          </div>

          <h1 className="mt-6 text-5xl font-semibold leading-tight">
            Enter your company workspace.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-white/55">
            Access your private project intelligence dashboard, risk insights,
            decisions, resources and imported datasets using your company code.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-white/60 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              Private data
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              AI insights
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              Company isolated
            </div>
          </div>
        </section>

       <section className="w-full rounded-[34px] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8ea8ff]">
            Secure access
          </p>

          <h2 className="mt-4 text-3xl font-semibold">Login to Pilot</h2>

          <p className="mt-3 text-sm text-white/50">
            Enter the access code created for your company.
          </p>

          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="e.g. LINDA-2026"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-[#111629] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#8ea8ff]/70"
          />

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            onClick={handleAccess}
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-[#8ea8ff] px-5 py-3 text-sm font-semibold text-[#101423] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Opening workspace..." : "Enter workspace"}
          </button>

          <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-white/45">
            No company code yet?{" "}
            <Link href="/company/create" className="font-medium text-[#8ea8ff] hover:underline">
              Create one
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}