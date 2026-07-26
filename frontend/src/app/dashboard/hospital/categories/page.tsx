"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken} from "@/utils/auth";
import HospitalLayout from "@/components/HospitalLayout";
import { SkeletonListItem } from "@/components/Skeleton";
import ReportCard from "@/components/ReportCard";
import { categorizeReport, REPORT_CATEGORIES } from "@/utils/reports";

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

export default function ReportCategoriesPage() {
  const router = useRouter();
  const token = getToken();
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<string>("All");
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

  const categorized = REPORT_CATEGORIES.map((cat) => ({
    ...cat,
    reports: allReports.filter((r) => categorizeReport(r.title, r.description) === cat.label),
  }));

  const displayed = selected === "All"
    ? allReports
    : allReports.filter((r) => categorizeReport(r.title, r.description) === selected);

  return (
    <HospitalLayout>
          <div>
            <h1 className="font-heading font-bold text-3xl text-primary">Report Categories</h1>
            <p className="font-body text-body text-base mt-1">
              Browse reports organized by medical category.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setSelected("All")}
              className={`bg-white border rounded-xl p-5 flex items-center gap-4 shadow-sm transition-colors text-left ${
                selected === "All" ? "border-accent" : "border-border hover:border-accent"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-2xl">📊</div>
              <div>
                <p className="font-heading font-bold text-base text-primary">All Reports</p>
                <p className="font-body text-muted text-sm">{allReports.length} total</p>
              </div>
            </button>
            {categorized.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelected(cat.label)}
                className={`bg-white border rounded-xl p-5 flex items-center gap-4 shadow-sm transition-colors text-left ${
                  selected === cat.label ? "border-accent" : "border-border hover:border-accent"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-2xl">
                  {cat.icon}
                </div>
                <div>
                  <p className="font-heading font-bold text-base text-primary">{cat.label}</p>
                  <p className="font-body text-muted text-sm">{cat.reports.length} reports</p>
                </div>
              </button>
            ))}
          </div>

          {/* Reports in selected category */}
          <div className="bg-white border border-border rounded-xl shadow-sm">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-heading font-semibold text-xl text-primary">
                {selected} ({displayed.length})
              </h2>
            </div>
            {loading ? (
              <div className="flex flex-col">
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </div>
            ) : displayed.length === 0 ? (
              <div className="p-12 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-[#e6e8ea] flex items-center justify-center text-3xl">
                  📭
                </div>
                <p className="font-heading font-semibold text-xl text-primary">No reports in this category</p>
                <p className="font-body text-body text-base max-w-sm">
                  Try selecting a different category.
                </p>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-3">
                {displayed.map((report) => (
                  <ReportCard key={report.id} report={report} showPatient showOwnership />
                ))}
              </div>
            )}
          </div>
          </HospitalLayout>
  );
}