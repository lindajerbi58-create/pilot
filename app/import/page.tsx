"use client";

import { useRef, useState } from "react";
import TopNavbar from "@/src/components/TopNavbar";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Brain,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FolderUp,
  Search,
  Sparkles,
  UploadCloud,
  Users,
} from "lucide-react";
import Papa from "papaparse";
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

function MiniInfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8ea8ff]/10 text-[#9eb7ff]">
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-white/45">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 text-sm font-semibold text-[#9eb7ff]">
        {number}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-white/45">{description}</p>
    </div>
  );
}

function TemplateChip({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
      {label}
    </div>
  );
}

export default function ImportPage() {
  const router = useRouter();

useEffect(() => {
  const companyId = localStorage.getItem("pilot_company_id");

  if (!companyId) {
    router.push("/login");
  }
}, [router]);
      const [selectedFile, setSelectedFile] = useState<File | null>(null);
      const [parsedRows, setParsedRows] = useState<any[]>([]);
const [validationMessage, setValidationMessage] = useState("Waiting for file");
const [importStatus, setImportStatus] = useState("Schema check pending");
const [isImporting, setIsImporting] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
const handleResetImport = () => {
  setSelectedFile(null);
  setParsedRows([]);
  setValidationMessage("Waiting for file");
  setImportStatus("Schema check pending");
  setSuccessMessage("");

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

 const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0] || null;
  setSelectedFile(file);
setSuccessMessage("");
  if (!file) {
    setParsedRows([]);
    setValidationMessage("Waiting for file");
    setImportStatus("Schema check pending");
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data as any[];
      const columnMapping: any = {
  task: "task_name",
  name: "task_name",
  title: "task_name",

  project: "project_name",

  assignee: "assignee_email",
  user: "assignee_email",

  state: "status",

  level: "priority",

  start: "start_date",
  due: "due_date",

  completion: "progress",
};
const normalizedRows = rows.map((row) => {
  const newRow: any = {};

  Object.keys(row).forEach((key) => {
    const normalizedKey =
      columnMapping[key.trim().toLowerCase()] || key;

    newRow[normalizedKey] = row[key];
  });

  return newRow;
});
      const requiredColumns = [
        "task_name",
        "project_name",
        "assignee_email",
        "status",
        "priority",
        "start_date",
        "due_date",
        "progress",
      ];

     const columns =
  normalizedRows.length > 0 ? Object.keys(normalizedRows[0]) : [];
      const missingColumns = requiredColumns.filter(
        (col) => !columns.includes(col)
      );

      if (missingColumns.length > 0) {
        setParsedRows([]);
        setValidationMessage("Invalid template");
        setImportStatus(`Missing columns: ${missingColumns.join(", ")}`);
        return;
      }

     setParsedRows(normalizedRows);
      setValidationMessage("Valid template");
      setImportStatus(`${rows.length} rows ready to import`);
    },
    error: () => {
      setParsedRows([]);
      setValidationMessage("Parsing failed");
      setImportStatus("Unable to read CSV file");
    },
  });
};
const handleImportTasks = async () => {
  if (parsedRows.length === 0) return;

  setIsImporting(true);
  setSuccessMessage("");

  try {
  const companyId = localStorage.getItem("pilot_company_id");

const response = await fetch("/api/import/tasks", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-company-id": companyId || "",
  },
  body: JSON.stringify({ tasks: parsedRows }),
});

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Import failed");
    }

    setSuccessMessage(result.message);
  } catch (error) {
    console.error(error);
    setSuccessMessage("Import failed");
  } finally {
    setIsImporting(false);
  }
};
const handleClearAllData = async () => {
  try {
   const companyId = localStorage.getItem("pilot_company_id");

const response = await fetch("/api/import/tasks/clear", {
  method: "DELETE",
  headers: {
    "x-company-id": companyId || "",
  },
});

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Clear failed");
    }

    setSelectedFile(null);
    setParsedRows([]);
    setValidationMessage("Waiting for file");
    setImportStatus("Schema check pending");
    setSuccessMessage(result.message || "All imported data cleared");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } catch (error) {
    console.error(error);
    setSuccessMessage("Failed to clear imported data");
  }
};
  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
       <TopNavbar />
        <section className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8ea8ff]">
            Data Onboarding
          </p>

          <div className="mt-3 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Import Operational Data
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                Upload your task data to activate Pilot intelligence. Our models
                will parse your workflows to identify bottlenecks, delivery
                pressure, and risk vectors automatically.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
  <button
    type="button"
    onClick={handleResetImport}
    className="rounded-2xl bg-[#8ea8ff] px-5 py-3 text-sm font-semibold text-[#0b1020] transition hover:brightness-110"
  >
    Reset Import
  </button>

  <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/[0.05] hover:text-white">
    <Download size={16} />
    Download CSV Template
  </button>
</div>
          </div>
        </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.8fr]">
  <div>
    <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
            Task Data Import
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Upload CSV Workspace Data
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
            Import structured task data to power overdue detection,
            execution monitoring, workload analysis, and AI-based
            operational recommendations.
          </p>
        </div>

        <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          v1.0 task import
        </div>
      </div>

      <div className="rounded-[26px] border border-white/8 bg-[#070910] p-5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-[#05060b] px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#8ea8ff]/10 text-[#9eb7ff]">
            <UploadCloud size={28} />
          </div>

          <h3 className="text-lg font-semibold text-white">
            Drag and drop your CSV file
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
            Supports structured task datasets in CSV format. Keep your
            schema aligned with the Pilot template for clean validation.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="rounded-full border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9eb7ff]">
              CSV
            </div>

            <button
              type="button"
              onClick={handleBrowseClick}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
            >
              <FolderUp size={16} />
              Browse Files
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] p-4 md:grid-cols-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/30">
              File
            </p>
            <p className="mt-2 text-sm text-white/75">
              {selectedFile ? selectedFile.name : "No file selected"}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/30">
              Validation
            </p>
            <p className="mt-2 text-sm text-white/50">{validationMessage}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/30">
              Import Status
            </p>
            <p className="mt-2 text-sm text-white/50">{importStatus}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-white/40">
            Pilot currently supports CSV-based task imports for initial
            workspace activation.
          </p>
          {successMessage && (
  <p className="mt-2 text-xs font-medium text-[#8ea8ff]">
    {successMessage}
  </p>
)}
<button
  type="button"
  onClick={handleImportTasks}
  disabled={parsedRows.length === 0 || isImporting}
  className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
    parsedRows.length > 0 && !isImporting
      ? "bg-[#8ea8ff] text-[#0b1020] hover:brightness-110"
      : "cursor-not-allowed bg-white/10 text-white/35"
  }`}
>
  {isImporting ? "Importing..." : "Import Tasks"}
</button>
        </div>
      </div>
    </div>

    {parsedRows.length > 0 && (
      <div className="mt-6 rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Data Preview</h2>
            <p className="mt-1 text-sm text-white/40">
              {parsedRows.length} rows detected from your dataset
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-white/40">
                {Object.keys(parsedRows[0]).map((col) => (
                  <th key={col} className="pb-3 pr-4 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {parsedRows.slice(0, 3).map((row, index) => (
                <tr key={index} className="border-t border-white/5">
                  {Object.values(row).map((value: any, i) => (
                    <td key={i} className="py-3 pr-4 text-white/70">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>

  <div className="grid gap-6">
    <MiniInfoCard
      icon={Brain}
      title="AI Engine Activation"
      description="Pilot uses your operational task data to activate workload monitoring, execution intelligence, and predictive delivery signals."
    />

    <MiniInfoCard
      icon={FileSpreadsheet}
      title="Upload CSV"
      description="Bring your project execution data into Pilot with a structured CSV file built on the expected template."
    />

    <MiniInfoCard
      icon={CheckCircle2}
      title="Validate Structure"
      description="Pilot checks required fields, formatting readiness, and data consistency before import begins."
    />
  </div>
</section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Expected Template
                </h2>
                <p className="mt-1 text-sm text-white/40">
                  Use the Pilot CSV template to keep your import clean,
                  structured, and validation-ready.
                </p>
              </div>

              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white">
                <Download size={15} />
                Download Template
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <TemplateChip label="task_name" />
              <TemplateChip label="project_name" />
              <TemplateChip label="assignee_email" />
              <TemplateChip label="status" />
              <TemplateChip label="priority" />
              <TemplateChip label="start_date" />
              <TemplateChip label="due_date" />
              <TemplateChip label="progress" />
            </div>

            <div className="mt-6 rounded-[22px] border border-[#8ea8ff]/15 bg-[#8ea8ff]/10 p-4">
              <p className="text-sm font-semibold text-white">
                Template guidance
              </p>
              <p className="mt-2 text-xs leading-6 text-white/55">
                Keep date formats consistent and make sure progress values are
                normalized. This improves validation quality and speeds up import
                readiness.
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">How It Works</h2>
              <p className="mt-1 text-sm text-white/40">
                A simple onboarding flow for operational activation.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StepCard
                number="01"
                title="Upload CSV"
                description="Add your structured task file securely into the import flow."
              />
              <StepCard
                number="02"
                title="Validate Structure"
                description="Pilot checks fields, formatting quality, and schema readiness."
              />
              <StepCard
                number="03"
                title="Activate Intelligence"
                description="Imported data powers dashboards, risk analysis, and AI suggestions."
              />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="rounded-[30px] border border-[#8ea8ff]/15 bg-gradient-to-r from-[#8ea8ff]/10 to-[#d78bff]/10 p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9eb7ff]">
                  Why Task Data Matters
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Operational data is the foundation of Pilot intelligence
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Once task data is imported, Pilot can measure overdue pressure,
                  monitor execution health, detect workload imbalance, surface
                  delivery risk, and generate AI-driven operational
                  recommendations across the workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/ai-insights"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#8ea8ff]/20 bg-[#8ea8ff]/10 px-4 py-3 text-sm font-medium text-[#9eb7ff] transition hover:bg-[#8ea8ff]/15"
                >
                  <Sparkles size={16} />
                  AI Insights
                </Link>

                <Link
                  href="/resource-hub"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Users size={16} />
                  Resource Hub
                </Link>
              </div>
            </div>
          </div>
        </section>

        <nav className="mt-8 flex justify-center md:hidden">
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-[#070910]/95 px-3 py-2">
            <TopNavLink href="/dashboard" label="Dashboard" />
            <TopNavLink href="/import" label="Import" active />
            <TopNavLink href="/ai-insights" label="Insights" />
          </div>
        </nav>
      </div>
    </main>
  );
}