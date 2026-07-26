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

  return (
    <HospitalLayout>
        {/* Main */}
          <div>
            <h1 className="font-heading font-bold text-3xl text-primary">Activity Timeline</h1>
            <p className="font-body text-body text-base mt-1">
              Chronological view of all medical reports across your linked patients.
            </p>
          </div>

          {loading ? (
            <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col">
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
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
      </HospitalLayout>
  );
}