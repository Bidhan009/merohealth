"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken} from "@/utils/auth";
import PatientLayout from "@/components/PatientLayout";
import { SkeletonListItem } from "@/components/Skeleton";
import ReportCard from "@/components/ReportCard";
import { categorizeReport, REPORT_CATEGORIES } from "@/utils/reports";

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

  const categorized = REPORT_CATEGORIES.map((cat) => ({
    ...cat,
    reports: reports.filter((r) => categorizeReport(r.title, r.description) === cat.label),
  }));

  const displayed = selected === "All"
    ? reports
    : reports.filter((r) => categorizeReport(r.title, r.description) === selected);

  const hospitals = [...new Set(reports.map((r) => r.hospital.name))];

  return (
      <PatientLayout>
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
                <p className="font-heading font-semibold text-xl text-primary">
                  No records in this category
                </p>
                <p className="font-body text-body text-base max-w-sm">
                  Try selecting a different category, or check back after your next hospital visit.
                </p>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-3">
                {displayed.map((report) => (
                  <ReportCard key={report.id} report={report} />
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
      </PatientLayout>
  );
}