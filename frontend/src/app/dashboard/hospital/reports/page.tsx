"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken} from "@/utils/auth";
import HospitalLayout from "@/components/HospitalLayout";
import { SkeletonListItem } from "@/components/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import ReportCard from "@/components/ReportCard";

interface Report {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createdAt: string;
  isOwn: boolean;
  patient: { fullName: string; citizenId: string; avatarUrl?: string | null };
  hospital: { name: string };
}

    export default function SearchReportsPage() {
    const router = useRouter();
    const token = getToken();

    const [allReports, setAllReports] = useState<Report[]>([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
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
        const q = debouncedSearch.toLowerCase();
        const matchesSearch = !debouncedSearch.trim() ||
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
              <div className="flex flex-col">
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-[#e6e8ea] flex items-center justify-center text-3xl">
                  🔍
                </div>
                <p className="font-heading font-semibold text-xl text-primary">No reports found</p>
                <p className="font-body text-body text-base">
                  {search ? "Try a different search term." : "No reports exist for your linked patients yet."}
                </p>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-3">
                {filtered.map((report) => (
                  <ReportCard key={report.id} report={report} showPatient showOwnership />
                ))}
              </div>
            )}
          </div>
    </HospitalLayout>
  );
}