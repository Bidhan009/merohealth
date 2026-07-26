"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";
import PatientLayout from "@/components/PatientLayout";
import { SkeletonCard, SkeletonListItem } from "@/components/Skeleton";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const token = getToken();
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }

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

  if (loading) {
    return (
      <PatientLayout>
        <div className="grid grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col mt-6">
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-primary">
            {t.dashboard.welcome}, {patient?.fullName?.split(" ")[0] ?? "Patient"}
          </h1>
          <p className="font-body text-body text-base mt-1">
            Your verified medical records across all hospitals.
          </p>
        </div>
        {patient?.isMinor && (
          <span className="bg-soft-blue text-primary text-sm font-semibold px-4 py-2 rounded-full">
            {t.settings.minorAccount}
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6">
        {[
          {
            label: t.dashboard.totalReports,
            value: reports.length,
            badge: "All time",
            color: "bg-soft-blue text-primary",
          },
          {
            label: t.dashboard.hospitals,
            value: [...new Set(reports.map((r) => r.hospital.name))].length,
            badge: "Linked",
            color: "bg-[rgba(139,241,230,0.3)] text-accent-light",
          },
          {
            label: t.dashboard.latestReport,
            value: reports.length > 0
              ? new Date(reports[0].createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short",
                })
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
          <h2 className="font-heading font-semibold text-2xl text-primary">{t.dashboard.medicalReports}</h2>
          <span className="font-body text-muted text-sm">Read only — managed by your hospitals</span>
        </div>

        {error && (
          <div className="m-6 bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">{error}</div>
        )}

        {reports.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">📋</span>
            <p className="font-heading font-semibold text-xl text-primary">{t.dashboard.noReportsYet}</p>
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
                      <span className="text-muted text-xs">·</span>
                      <span className="text-muted text-xs">
                        {new Date(report.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
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
                    {t.common.viewFile} →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-[rgba(139,241,230,0.2)] border-l-4 border-accent rounded-xl px-7 py-5 flex flex-col gap-2">
        <p className="font-heading font-semibold text-sm text-accent-light">{t.dashboard.yourDataIsProtected}</p>
        <p className="font-body text-body text-base leading-relaxed">
          All records are encrypted and access is logged by the Ministry of Health. You can only view your records — only verified hospitals can add or edit reports.
        </p>
      </div>
    </PatientLayout>
  );
}