"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/utils/auth";
import HospitalLayout from "@/components/HospitalLayout";
import { SkeletonCard } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

interface Patient {
  id: string;
  fullName: string;
  citizenId: string;
  isMinor: boolean;
  dateOfBirth: string;
  user: { email: string };
}

export default function HospitalDashboard() {
  const router = useRouter();
  const token = getToken();
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<Patient | null>(null);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  

  useEffect(() => {
  if (!token) { router.replace("/login"); return; }
  fetchPatients().finally(() => setInitialLoading(false));
}, []);

  async function fetchPatients() {
    const res = await fetch("http://localhost:5000/api/hospital/patients", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setPatients(data);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError("");
    setSearchResult(null);
    setLoading(true);
    const res = await fetch(
      `http://localhost:5000/api/hospital/patients/search?citizenId=${searchId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setSearchError(data.error); return; }
    setSearchResult(data);
  }

  async function handleLink() {
    if (!searchResult) return;
    const res = await fetch("http://localhost:5000/api/hospital/patients/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ patientId: searchResult.id }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error, "error"); return; }
    showToast("Patient linked successfully!", "success");
    setSearchResult(null);
    setSearchId("");
    fetchPatients();
  }

  return (
    <HospitalLayout>
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-3xl text-primary">Hospital Dashboard</h1>
            <span className="bg-green-100 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              ✓ Verified Hospital
            </span>
          </div>
          <p className="font-body text-body text-base mt-1">
            Central Command for Patient Records and Diagnostics
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {initialLoading ? (
          <>
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ):(
        [
          { label: "Total Patients", value: patients.length, badge: "Active", badgeColor: "text-green-700 bg-green-100" },
          { label: "Reports This Month", value: "—", badge: "Monthly", badgeColor: "text-body bg-[#e6e8ea]" },
          { label: "Added Today", value: "—", badge: "Today", badgeColor: "text-body bg-[#e6e8ea]" },
          { label: "Pending Edits", value: "—", badge: "Action Needed", badgeColor: "text-danger bg-soft-red" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col justify-between h-[160px]">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-primary font-bold">
                {stat.label[0]}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.badgeColor}`}>
                {stat.badge}
              </span>
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-body">{stat.label}</p>
              <p className="font-heading font-bold text-5xl text-primary tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Search + Patients Grid */}
      <div className="grid grid-cols-3 gap-6">

        {/* Search Section */}
        <div className="col-span-2 bg-white border border-border rounded-xl shadow-sm flex flex-col">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-heading font-semibold text-2xl text-primary">Search & Link Patient</h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Citizen ID (e.g. 12-34-56-78901)"
                className="flex-1 border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            {searchError && (
              <div className="bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
                {searchError}
              </div>
            )}
            {searchResult && (
              <div className="border border-border rounded-xl p-5 flex items-center justify-between bg-bg">
                <div>
                  <p className="font-heading font-bold text-lg text-primary">{searchResult.fullName}</p>
                  <p className="font-body text-body text-sm">ID: {searchResult.citizenId}</p>
                  <p className="font-body text-body text-sm">{searchResult.user.email}</p>
                  {searchResult.isMinor && (
                    <span className="text-xs font-semibold bg-soft-blue text-primary px-2 py-0.5 rounded-full mt-1 inline-block">Minor</span>
                  )}
                </div>
                <button
                  onClick={handleLink}
                  className="bg-accent text-white font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90"
                >
                  Link Patient
                </button>
              </div>
            )}
          </div>

          {/* Linked Patients */}
          <div className="border-t border-border px-6 py-5">
            <h3 className="font-heading font-semibold text-lg text-primary mb-4">
              Linked Patients ({patients.length})
            </h3>
            {patients.length === 0 ? (
              <p className="font-body text-muted text-base">
                No patients linked yet. Search by Citizen ID to add patients.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {patients.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/hospital/patient/${p.id}`}
                    className="flex items-center justify-between border border-border rounded-xl p-4 hover:border-accent transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-soft-blue flex items-center justify-center text-primary font-heading font-bold text-sm shrink-0">
                        {p.fullName[0]}
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-base text-primary group-hover:text-accent transition-colors">
                          {p.fullName}
                        </p>
                        <p className="font-body text-body text-sm">ID: {p.citizenId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.isMinor && (
                        <span className="text-xs font-semibold bg-soft-blue text-primary px-2 py-1 rounded-full">Minor</span>
                      )}
                      <span className="font-heading font-semibold text-sm text-accent">View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="flex flex-col gap-6">
          <div className="bg-primary rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-[-16px] right-[-16px] w-24 h-24 rounded-full bg-mint opacity-10 blur-xl" />
            <p className="font-heading font-semibold text-2xl text-white">Institutional Trust</p>
            <p className="font-body text-[#afc7f8] text-base leading-relaxed opacity-90">
              All digital records are cryptographically signed and legally binding under Ministry of Health standards.
            </p>
            <span className="font-body text-mint-bright text-xs tracking-widest uppercase font-semibold">
              ✓ ISO 27001 Certified
            </span>
          </div>
          <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col gap-3">
            <p className="font-heading font-bold text-sm text-primary">Quick Actions</p>
            {[
              { label: "Search Reports", href: "/dashboard/hospital/reports" },
              { label: "View Timeline", href: "/dashboard/hospital/timeline" },
              { label: "Help Center", href: "/dashboard/hospital/help" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-bg transition-colors"
              >
                <span className="font-body text-body text-base">{action.label}</span>
                <span className="text-muted text-sm">›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </HospitalLayout>
  );
}