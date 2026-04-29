"use client";

import { useState } from "react";
import Link from "next/link";
export default function CreateCompanyPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    setMessage("");

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

    setMessage(`Company created. Code: ${data.company.code}`);
    setName("");
    setCode("");
  };

  return (
    <main className="min-h-screen bg-[#080b14] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8ea8ff]">
            Pilot
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Create Company Access
          </h1>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Company name"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-[#111629] px-4 py-3 text-sm text-white outline-none"
          />

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code e.g. TESLA-2027"
            className="mt-4 w-full rounded-2xl border border-white/10 bg-[#111629] px-4 py-3 text-sm text-white outline-none"
          />

          {message && <p className="mt-4 text-sm text-white/70">{message}</p>}

          <button
            onClick={handleCreate}
            className="mt-6 w-full rounded-2xl bg-[#8ea8ff] px-5 py-3 text-sm font-semibold text-[#101423]"
          >
            Create Code
          </button>
          <Link
  href="/login"
  className="mt-4 block text-center text-sm font-medium text-[#8ea8ff] hover:underline"
>
  Go to login
</Link>
        </div>
      </div>
    </main>
  );
}