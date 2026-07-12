"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken,logout } from "@/utils/auth";

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

export default function PatientDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = getToken();

  useEffect(() => {
  if (!token) {
    router.replace("/login");
    return;
  }

  const load = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/patient/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { router.replace("/login"); return; }
      const data = await res.json();
      setPatient(data.patient);
      setReports(data.reports);
    } catch {
      setError("Failed to load your records.");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-body">
        <p className="text-body text-base">Loading your health records...</p>
      </div>
    );
  }

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
                    item.href === "/dashboard/patient"
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
              { label: "My Records", href: "/dashboard/patient", active: true },
              { label: "Timeline", href: "/dashboard/patient/timeline", active: false },
              { label: "Medical History", href: "/dashboard/patient/history", active: false },
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

        {/* Main Content */}
        <main className="flex-1 p-6 flex flex-col gap-8">

          {/* Welcome Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-primary">
                Welcome, {patient?.fullName?.split(" ")[0] ?? "Patient"}
              </h1>
              <p className="font-body text-body text-base mt-1">
                Your verified medical records across all hospitals.
              </p>
            </div>
            {patient?.isMinor && (
              <span className="bg-soft-blue text-primary text-sm font-semibold px-4 py-2 rounded-full">
                Minor Account
              </span>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                label: "Total Reports",
                value: reports.length,
                badge: "All time",
                color: "bg-soft-blue text-primary",
              },
              {
                label: "Hospitals",
                value: [...new Set(reports.map((r) => r.hospital.name))].length,
                badge: "Linked",
                color: "bg-[rgba(139,241,230,0.3)] text-accent-light",
              },
              {
                label: "Latest Report",
                value: reports.length > 0
                  ? new Date(reports[0].createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                  : "None",
                badge: "Recent",
                color: "bg-[#e6e8ea] text-body",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col justify-between h-[140px]">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-primary font-bold text-lg">
                    {stat.label[0]}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.color}`}>
                    {stat.badge}
                  </span>
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-body">{stat.label}</p>
                  <p className="font-heading font-bold text-4xl text-primary tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reports List */}
          <div className="bg-white border border-border rounded-xl shadow-sm">
            <div className="border-b border-border px-6 py-5 flex items-center justify-between">
              <h2 className="font-heading font-semibold text-2xl text-primary">
                Medical Reports
              </h2>
              <span className="font-body text-muted text-sm">Read only — managed by your hospitals</span>
            </div>

            {error && (
              <div className="m-6 bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">{error}</div>
            )}

            {reports.length === 0 ? (
              <div className="p-12 flex flex-col items-center gap-4 text-center">
                <span className="text-5xl">📋</span>
                <p className="font-heading font-semibold text-xl text-primary">No reports yet</p>
                <p className="font-body text-body text-base max-w-sm">
                  Your medical reports will appear here once a hospital adds them to your profile.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {reports.map((report) => (
                  <div key={report.id} className="px-6 py-5 flex items-start justify-between">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-primary font-bold shrink-0">
                        📄
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-heading font-semibold text-base text-primary">{report.title}</p>
                        {report.description && (
                          <p className="font-body text-body text-sm">{report.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-[rgba(139,241,230,0.3)] text-accent-light text-xs font-semibold px-2 py-0.5 rounded-full">
                            {report.hospital.name}
                          </span>
                          <span className="text-muted text-xs">
                            {new Date(report.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
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
                        className="font-heading font-semibold text-sm text-accent hover:underline shrink-0 mt-1"
                      >
                        View File →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-[rgba(139,241,230,0.2)] border-l-4 border-accent rounded-xl px-7 py-5 flex flex-col gap-2">
            <p className="font-heading font-semibold text-sm text-accent-light">Your Data is Protected</p>
            <p className="font-body text-body text-base leading-relaxed">
              All records are encrypted and access is logged by the Ministry of Health. You can only view your records — only verified hospitals can add or edit reports.
            </p>
          </div>
        </main>
      </div>

      {/* Footer */}
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