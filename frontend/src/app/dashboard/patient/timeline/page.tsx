"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken} from "@/utils/auth";
import PatientLayout from "@/components/PatientLayout";

interface Report {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createdAt: string;
  hospital: { name: string };
}

interface TimelineGroup {
  month: string;
  reports: Report[];
}

export default function PatientTimelinePage() {
  const router = useRouter();
  const token = getToken();
  const [groups, setGroups] = useState<TimelineGroup[]>([]);
  const [patientName, setPatientName] = useState("");
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
          setPatientName(data.patient.fullName);
          const reports: Report[] = data.reports;
          const map = new Map<string, Report[]>();
          reports.forEach((r) => {
            const month = new Date(r.createdAt).toLocaleDateString("en-GB", {
              month: "long", year: "numeric",
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

  return (
    <PatientLayout>
        {/* Main */}
        <main className="flex-1 p-6 flex flex-col gap-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-primary">Health Timeline</h1>
            <p className="font-body text-body text-base mt-1">
              Your complete medical history in chronological order.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-body text-muted text-base">Loading your timeline...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-5xl">📅</span>
              <p className="font-heading font-semibold text-xl text-primary">No records yet</p>
              <p className="font-body text-body text-base max-w-sm">
                Your medical records will appear here once a hospital adds them to your profile.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {groups.map((group) => (
                <div key={group.month} className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-white font-heading font-bold text-sm px-4 py-2 rounded-full">
                      {group.month}
                    </div>
                    <div className="flex-1 h-px bg-border-strong" />
                    <span className="font-body text-muted text-sm">
                      {group.reports.length} record{group.reports.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 pl-4 border-l-2 border-border-strong ml-4">
                    {group.reports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-start justify-between relative"
                      >
                        <div className="absolute -left-[21px] top-6 w-3 h-3 rounded-full bg-accent border-2 border-white shadow" />
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
                                  day: "numeric", month: "short",
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
                </div>
              ))}
            </div>
          )}
        </main>
    </PatientLayout>
  );
}