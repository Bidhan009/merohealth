"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken} from "@/utils/auth";
import PatientLayout from "@/components/PatientLayout";
import { SkeletonListItem } from "@/components/Skeleton";
import ReportCard from "@/components/ReportCard";

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
            <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col">
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e6e8ea] flex items-center justify-center text-3xl">
                📅
              </div>
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
                      <div key={report.id} className="relative">
                        <div className="absolute -left-[25px] top-6 w-3 h-3 rounded-full bg-accent border-2 border-white shadow" />
                        <ReportCard report={report} />
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