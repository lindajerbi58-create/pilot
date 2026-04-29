"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreateCompanyPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setMessage("");
      setCreatedCode("");

      const res = await fetch("/api/company/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, code }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Creation failed");
        return;
      }

      setCreatedCode(data.company.code);
      setMessage("Company workspace created successfully.");
      setName("");
      setCode("");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a13] px-6 py-10 text-white">
      {/* Glow background */}
      <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[#8ea8ff]/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[#5df0b8]/10 blur-[120px]" />

      {/* Centered layout */}
      <div className="relative mx-auto flex min-h-[85vh] max-w-xl flex-col items-center justify-center">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-[#8ea8ff]">
            New workspace
          </div>

          <h1 className="mt-6 text-4xl font-semibold">
            Create a company code
          </h1>

          <p className="mt-4 text-sm text-white/55">
            Generate a private access code for your client or company.
          </p>
        </div>

        {/* Card */}
        <div className="w-full rounded-[34px] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Company name (e.g. Linda Construction)"
            className="w-full rounded-2xl border border-white/10 bg-[#111629] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#8ea8ff]/70"
          />

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code (e.g. LINDA-2026)"
            className="mt-4 w-full rounded-2xl border border-white/10 bg-[#111629] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#8ea8ff]/70"
          />

          {message && (
            <p className="mt-4 text-sm text-white/70">
              {message}
            </p>
          )}

          {createdCode && (
            <div className="mt-4 rounded-2xl border border-[#8ea8ff]/30 bg-[#8ea8ff]/10 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8ea8ff]">
                Your code
              </p>
              <p className="mt-2 text-xl font-semibold">
                {createdCode}
              </p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-[#8ea8ff] px-5 py-3 text-sm font-semibold text-[#101423] hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create company"}
          </button>

          <Link
            href="/login"
            className="mt-4 block text-center text-sm text-[#8ea8ff] hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}