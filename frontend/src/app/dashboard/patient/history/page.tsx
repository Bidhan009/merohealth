"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, logout } from "@/utils/auth";

interface Report {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createdAt: string;
  hospital: { name: string };
}

interface PatientInfo {
  fullName: string;
  citizenId: string;
  isMinor: boolean;
  dateOfBirth: string;
}

const CATEGORIES = [
  { label: "Blood Tests", icon: "🩸", keywords: ["blood", "cbc", "hemoglobin", "platelet"] },
  { label: "Imaging", icon: "🫁", keywords: ["xray", "x-ray", "mri", "ct", "scan", "ultrasound"] },
  { label: "Vaccination", icon: "💉", keywords: ["vaccine", "vaccination", "immunization", "booster"] },
  { label: "Surgery", icon: "🏥", keywords: ["surgery", "operation", "procedure", "surgical"] },
  { label: "Cardiology", icon: "❤️", keywords: ["heart", "cardiac", "ecg", "echo", "cardio"] },
  { label: "General", icon: "📋", keywords: [] },
];

function categorize(report: Report): string {
  const text = (report.title + " " + (report.description ?? "")).toLowerCase();
  for (const cat of CATEGORIES.slice(0, -1)) {
    if (cat.keywords.some((k) => text.includes(k))) return cat.label;
  }
  return "General";
}

export default function PatientHistoryPage() {
  const router = useRouter();
  const token = getToken();
  const [reports, setReports] = useState<Report[]>([]);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [selected, setSelected] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }

    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/patient/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPatient(data.patient);
          setReports(data.reports);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const categorized = CATEGORIES.map((cat) => ({
    ...cat,
    reports: reports.filter((r) => categorize(r) === cat.label),
  }));

  const displayed = selected === "All"
    ? reports
    : reports.filter((r) => categorize(r) === selected);

  const hospitals = [...new Set(reports.map((r) => r.hospital.name))];

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
          <nav className="flex gap-1">
            {[
              { label: "Home", href: "/dashboard/patient" },
              { label: "Timeline", href: "/dashboard/patient/timeline" },
              { label: "History", href: "/dashboard/patient/history" },
              { label: "Settings", href: "/dashboard/patient/settings" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-heading font-semibold text-sm px-3 py-1 rounded-lg transition-colors ${
                  item.href === "/dashboard/patient/history"
                    ? "bg-mint text-accent-light"
                    : "text-body hover:bg-border"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-danger text-white text-sm font-extrabold tracking-widest px-4 py-2 rounded-lg">
            Emergency ID
          </button>
          <button
            onClick={handleLogout}
            className="border border-border-strong text-body text-sm font-semibold px-4 py-2 rounded-lg hover:border-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-64 bg-[#f2f4f6] border-r border-border-strong flex flex-col gap-2 p-4 min-h-full">
          <div className="flex items-center gap-3 px-2 pb-6">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-heading font-bold text-sm">
              {patient?.fullName?.[0] ?? "P"}
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-primary">{patient?.fullName ?? "Patient"}</p>
              <p className="font-body text-body text-xs">ID: {patient?.citizenId ?? "—"}</p>
            </div>
          </div>
          {[
            { label: "My Records", href: "/dashboard/patient", active: false },
            { label: "Timeline", href: "/dashboard/patient/timeline", active: false },
            { label: "Medical History", href: "/dashboard/patient/history", active: true },
            { label: "Settings", href: "/dashboard/patient/settings", active: false },
            { label: "Help Center", href: "/dashboard/patient/help", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-heading font-semibold text-sm transition-colors ${
                item.active
                  ? "bg-mint text-accent-light"
                  : "text-body hover:bg-border"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-auto">
            <button className="w-full bg-danger text-white font-heading font-extrabold text-sm tracking-widest py-3 rounded-lg shadow">
              Emergency ID
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-primary">Medical History</h1>
              <p className="font-body text-body text-base mt-1">
                All your medical records organized by category.
              </p>
            </div>
            {/* Summary Pills */}
            <div className="flex gap-2">
              <span className="bg-soft-blue text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                {reports.length} Total Reports
              </span>
              <span className="bg-[rgba(139,241,230,0.3)] text-accent-light text-xs font-semibold px-3 py-1.5 rounded-full">
                {hospitals.length} Hospital{hospitals.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Patient Summary Card */}
          {patient && (
            <div className="bg-white border border-border rounded-xl shadow-sm p-6 grid grid-cols-4 gap-6">
              <div className="flex flex-col gap-1">
                <p className="font-body text-muted text-xs uppercase tracking-widest">Full Name</p>
                <p className="font-heading font-semibold text-base text-primary">{patient.fullName}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-body text-muted text-xs uppercase tracking-widest">Citizen ID</p>
                <p className="font-heading font-semibold text-base text-primary">{patient.citizenId}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-body text-muted text-xs uppercase tracking-widest">Date of Birth</p>
                <p className="font-heading font-semibold text-base text-primary">
                  {new Date(patient.dateOfBirth).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-body text-muted text-xs uppercase tracking-widest">Account Type</p>
                <p className="font-heading font-semibold text-base text-primary">
                  {patient.isMinor ? "Minor Account" : "Adult Account"}
                </p>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => setSelected("All")}
              className={`bg-white border rounded-xl p-4 flex items-center gap-3 shadow-sm transition-colors text-left ${
                selected === "All" ? "border-accent" : "border-border hover:border-accent"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-xl">📊</div>
              <div>
                <p className="font-heading font-bold text-sm text-primary">All</p>
                <p className="font-body text-muted text-xs">{reports.length} records</p>
              </div>
            </button>
            {categorized.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelected(cat.label)}
                className={`bg-white border rounded-xl p-4 flex items-center gap-3 shadow-sm transition-colors text-left ${
                  selected === cat.label ? "border-accent" : "border-border hover:border-accent"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-xl">
                  {cat.icon}
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-primary">{cat.label}</p>
                  <p className="font-body text-muted text-xs">{cat.reports.length} records</p>
                </div>
              </button>
            ))}
          </div>

          {/* Reports List */}
          <div className="bg-white border border-border rounded-xl shadow-sm">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-heading font-semibold text-xl text-primary">
                {selected} ({displayed.length})
              </h2>
            </div>
            {loading ? (
              <div className="p-12 text-center">
                <p className="font-body text-muted text-base">Loading...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="p-12 flex flex-col items-center gap-4 text-center">
                <span className="text-5xl">📭</span>
                <p className="font-heading font-semibold text-xl text-primary">
                  No records in this category
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {displayed.map((report) => (
                  <div key={report.id} className="px-6 py-5 flex items-start justify-between">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-lg shrink-0">
                        📄
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-heading font-semibold text-base text-primary">
                          {report.title}
                        </p>
                        {report.description && (
                          <p className="font-body text-body text-sm">{report.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-[rgba(139,241,230,0.3)] text-accent-light text-xs font-semibold px-2 py-0.5 rounded-full">
                            {report.hospital.name}
                          </span>
                          <span className="text-muted text-xs">·</span>
                          <span className="text-muted text-xs">
                            {new Date(report.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {report.fileUrl && (
                      <a
                        href={`http://localhost:5000${report.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-heading font-semibold text-sm text-accent hover:underline shrink-0"
                      >
                        View File →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hospitals Involved */}
          {hospitals.length > 0 && (
            <div className="bg-white border border-border rounded-xl shadow-sm p-6">
              <h2 className="font-heading font-semibold text-lg text-primary mb-4">
                Hospitals in Your Record
              </h2>
              <div className="flex flex-wrap gap-3">
                {hospitals.map((h) => (
                  <div
                    key={h}
                    className="flex items-center gap-2 bg-bg border border-border rounded-lg px-4 py-2"
                  >
                    <span className="text-sm">🏥</span>
                    <span className="font-heading font-semibold text-sm text-primary">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-[#e0e3e5] border-t border-border-strong px-12 py-8 flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-sm text-primary">MeroHealth</p>
          <p className="font-body text-body text-base">© 2024 MeroHealth. Verified by Ministry of Health Nepal.</p>
        </div>
        <div className="flex gap-6">
          <Link href="#" className="font-heading font-semibold text-sm text-body hover:text-primary">Privacy Policy</Link>
          <Link href="#" className="font-heading font-semibold text-sm text-body hover:text-primary">Terms of Service</Link>
          <Link href="#" className="font-heading font-semibold text-sm text-body hover:text-primary">Legal Notice</Link>
        </div>
      </footer>
    </div>
  );
}