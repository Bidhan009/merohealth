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
  isOwn: boolean;
  patient: { fullName: string; citizenId: string };
  hospital: { name: string };
}

interface TimelineGroup {
  month: string;
  reports: Report[];
}

export default function HospitalTimelinePage() {
  const router = useRouter();
  const token = getToken();
  const [groups, setGroups] = useState<TimelineGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }

    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/hospital/reports/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: Report[] = await res.json();
          // Group by month
          const map = new Map<string, Report[]>();
          data.forEach((r) => {
            const month = new Date(r.createdAt).toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            });
            if (!map.has(month)) map.set(month, []);
            map.get(month)!.push(r);
          });
          setGroups(
            Array.from(map.entries()).map(([month, reports]) => ({ month, reports }))
          );
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

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
          <nav className="flex gap-1">
            {[
              { label: "Home", href: "/dashboard/hospital" },
              { label: "Reports", href: "/dashboard/hospital/reports" },
              { label: "Timeline", href: "/dashboard/hospital/timeline" },
              { label: "Categories", href: "/dashboard/hospital/categories" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-heading font-semibold text-sm px-3 py-1 rounded-lg transition-colors ${
                  item.href === "/dashboard/hospital/timeline"
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
          {[
            { label: "Dashboard", href: "/dashboard/hospital", active: false },
            { label: "Search Reports", href: "/dashboard/hospital/reports", active: false },
            { label: "Timeline", href: "/dashboard/hospital/timeline", active: true },
            { label: "Categories", href: "/dashboard/hospital/categories", active: false },
            { label: "Settings", href: "/dashboard/hospital/settings", active: false },
            { label: "Help Center", href: "/dashboard/hospital/help", active: false },
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
              Request Ambulance
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 flex flex-col gap-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-primary">Activity Timeline</h1>
            <p className="font-body text-body text-base mt-1">
              Chronological view of all medical reports across your linked patients.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-muted text-base">Loading timeline...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-5xl">📅</span>
              <p className="font-heading font-semibold text-xl text-primary">No activity yet</p>
              <p className="font-body text-body text-base">Reports will appear here once created.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {groups.map((group) => (
                <div key={group.month} className="flex flex-col gap-4">

                  {/* Month header */}
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-white font-heading font-bold text-sm px-4 py-2 rounded-full">
                      {group.month}
                    </div>
                    <div className="flex-1 h-px bg-border-strong" />
                    <span className="font-body text-muted text-sm">
                      {group.reports.length} report{group.reports.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Reports in this month */}
                  <div className="flex flex-col gap-3 pl-4 border-l-2 border-border-strong ml-4">
                    {group.reports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-start justify-between relative"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-[21px] top-6 w-3 h-3 rounded-full bg-accent border-2 border-white shadow" />

                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-lg shrink-0">
                            📄
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <p className="font-heading font-semibold text-base text-primary">
                                {report.title}
                              </p>
                              {report.isOwn ? (
                                <span className="text-xs font-semibold bg-[rgba(139,241,230,0.3)] text-accent-light px-2 py-0.5 rounded-full">
                                  Your Report
                                </span>
                              ) : (
                                <span className="text-xs font-semibold bg-soft-blue text-primary px-2 py-0.5 rounded-full">
                                  Read Only
                                </span>
                              )}
                            </div>
                            {report.description && (
                              <p className="font-body text-body text-sm">{report.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="bg-[#e6e8ea] text-body text-xs font-semibold px-2 py-0.5 rounded-full">
                                {report.patient.fullName}
                              </span>
                              <span className="text-muted text-xs">·</span>
                              <span className="text-muted text-xs">{report.hospital.name}</span>
                              <span className="text-muted text-xs">·</span>
                              <span className="text-muted text-xs">
                                {new Date(report.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {report.fileUrl && (
                            <a
                              href={`http://localhost:5000${report.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-heading font-semibold text-sm text-accent hover:underline"
                            >
                              View File
                            </a>
                          )}
                          {report.isOwn && (
                            <Link
                              href={`/dashboard/hospital/report/${report.id}/edit`}
                              className="border border-border-strong text-body text-sm font-semibold px-3 py-1.5 rounded-lg hover:border-accent hover:text-accent transition-colors"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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