"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken} from "@/utils/auth";
import HospitalLayout from "@/components/HospitalLayout";
import { SkeletonListItem } from "@/components/Skeleton";

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

export default function ReportCategoriesPage() {
  const router = useRouter();
  const token = getToken();
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [hospitalName, setHospitalName] = useState("");

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
      const profileRes = await fetch("http://localhost:5000/api/hospital/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setHospitalName(profileData.name);
      }
    };
    load();
  }, []);

  const categorized = CATEGORIES.map((cat) => ({
    ...cat,
    reports: allReports.filter((r) => categorize(r) === cat.label),
  }));

  const displayed = selected === "All"
    ? allReports
    : allReports.filter((r) => categorize(r) === selected);

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
              <div className="p-12 flex flex-col items-center gap-4 text-center">
                <span className="text-5xl">📭</span>
                <p className="font-heading font-semibold text-xl text-primary">No reports in this category</p>
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
                              day: "numeric", month: "short", year: "numeric",
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