"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken} from "@/utils/auth";
import HospitalLayout from "@/components/HospitalLayout";

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
    <HospitalLayout>
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
    </HospitalLayout>
  );
}