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

    export default function SearchReportsPage() {
    const router = useRouter();
    const token = getToken();

    const [allReports, setAllReports] = useState<Report[]>([]);
    const [search, setSearch] = useState("");
    const [filterOwn, setFilterOwn] = useState<"all" | "own" | "others">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) { router.replace("/login"); return; }
        const load = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/hospital/reports/all", {
            headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
            const data = await res.json();
            setAllReports(data);
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

    const filtered = allReports.filter((r) => {
        const q = search.toLowerCase();
        const matchesSearch = !search.trim() ||
        r.title.toLowerCase().includes(q) ||
        r.patient.fullName.toLowerCase().includes(q) ||
        r.patient.citizenId.toLowerCase().includes(q);
        const matchesFilter =
        filterOwn === "all" ||
        (filterOwn === "own" && r.isOwn) ||
        (filterOwn === "others" && !r.isOwn);
        return matchesSearch && matchesFilter;
    });

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
                  item.href === "/dashboard/hospital/reports"
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
            { label: "Search Reports", href: "/dashboard/hospital/reports", active: true },
            { label: "Timeline", href: "/dashboard/hospital/timeline", active: false },
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

          {/* Page Header */}
          <div>
            <h1 className="font-heading font-bold text-3xl text-primary">Search Medical Reports</h1>
            <p className="font-body text-body text-base mt-1">
              Search across all reports for your linked patients.
            </p>
          </div>

          {/* Search + Filter Bar */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by report title, patient name, or citizen ID..."
              className="w-full border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-3">
              {[
                { label: "All Reports", value: "all" },
                { label: "Your Reports", value: "own" },
                { label: "Other Hospitals", value: "others" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterOwn(f.value as "all" | "own" | "others")}
                  className={`font-heading font-semibold text-sm px-4 py-2 rounded-lg border transition-colors ${
                    filterOwn === f.value
                      ? "bg-primary text-white border-primary"
                      : "border-border-strong text-body hover:border-accent"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <span className="ml-auto font-body text-muted text-sm self-center">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white border border-border rounded-xl shadow-sm">
            {loading ? (
              <div className="p-12 text-center">
                <p className="font-body text-muted text-base">Loading reports...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 flex flex-col items-center gap-4 text-center">
                <span className="text-5xl">🔍</span>
                <p className="font-heading font-semibold text-xl text-primary">No reports found</p>
                <p className="font-body text-body text-base">
                  {search ? "Try a different search term." : "No reports exist for your linked patients yet."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {filtered.map((report) => (
                  <div key={report.id} className="px-6 py-5 flex items-start justify-between">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-lg shrink-0">
                        📄
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <p className="font-heading font-semibold text-base text-primary">{report.title}</p>
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
                              day: "numeric", month: "short", year: "numeric"
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
            )}
          </div>
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