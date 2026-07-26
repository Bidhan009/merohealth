"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/utils/auth";
import HospitalLayout from "@/components/HospitalLayout";
import { SkeletonCard } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/i18n/LanguageContext";
import PatientPreviewModal, { PatientPreviewData } from "@/components/PatientPreviewModal";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { getRelativeTime } from "@/utils/reports";

interface LinkedPatient {
  id: string;
  fullName: string;
  citizenId: string;
  isMinor: boolean;
  dateOfBirth: string;
  avatarUrl: string | null;
  bloodType: string | null;
  user: { email: string };
  reportCount: number;
  lastReportDate: string | null;
}

interface SearchPatientResult extends LinkedPatient {
  allergies: string | null;
  chronicConditions: string | null;
  medications: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  emergencyRelation: string | null;
  organDonor: boolean;
  isLinked: boolean;
  user: { email: string; status: string };
}

export default function HospitalDashboard() {
  const router = useRouter();
  const token = getToken();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [patients, setPatients] = useState<LinkedPatient[]>([]);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<SearchPatientResult | null>(null);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    setPreviewOpen(true);
  }

  async function handleLink() {
    if (!searchResult) return;
    const linkedPatient = searchResult;
    setLinking(true);
    setPatients((prev) => [linkedPatient, ...prev]);

    const res = await fetch("http://localhost:5000/api/hospital/patients/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ patientId: linkedPatient.id }),
    });
    const data = await res.json();
    setLinking(false);
    if (!res.ok) {
      setPatients((prev) => prev.filter((p) => p.id !== linkedPatient.id));
      showToast(data.error || "Failed to link patient", "error");
      return;
    }
    showToast("Patient linked successfully!", "success");
    setPreviewOpen(false);
    setSearchResult(null);
    setSearchId("");
    fetchPatients();
  }

  function focusSearchInput() {
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    searchInputRef.current?.focus();
  }

  return (
    <HospitalLayout>
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-3xl text-primary">{t.dashboard.hospitalDashboard}</h1>
            <span className="bg-green-100 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              ✓ {t.dashboard.verifiedHospital}
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
          { label: t.dashboard.totalPatients, value: patients.length, badge: "Active", badgeColor: "text-green-700 bg-green-100" },
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

      {/* Hospital Patient Search */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading font-bold text-[32px] leading-10 text-primary">Hospital Patient Search</h2>
          <p className="font-body text-lg text-body mt-1">
            Access secure medical records by entering a patient&apos;s Citizen ID.
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-md p-4">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="relative flex-1">
              <label
                htmlFor="citizenIdSearch"
                className="absolute -top-3 left-3 bg-white px-1 font-heading font-semibold text-sm text-primary"
              >
                Citizen ID Number
              </label>
              <input
                id="citizenIdSearch"
                ref={searchInputRef}
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. 12-34-56-78901"
                className="w-full border border-border-strong rounded-lg px-4 py-4 text-lg font-body text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white rounded-lg px-8 py-4 font-heading font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {searchError && (
            <div className="mt-4 bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
              {searchError}
            </div>
          )}
        </div>

        <div className="bg-[rgba(139,241,230,0.2)] border-l-4 border-accent rounded-r-xl pl-7 pr-6 py-6 flex gap-4">
          <span className="text-accent text-xl shrink-0">ℹ</span>
          <div>
            <p className="font-heading font-semibold text-sm text-accent-light">Privacy &amp; Consent Notice</p>
            <p className="font-body text-base text-body mt-1">
              Searching for a patient grants access to their medical records only after linking. All access is logged and audited by the Ministry of Health.
            </p>
          </div>
        </div>
      </div>

      {/* Linked Patients */}
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading font-semibold text-2xl text-primary">Linked Patients</h2>
            <p className="font-body text-base text-body mt-1">Patients registered with your hospital.</p>
          </div>
          <Link
            href="/dashboard/hospital/reports"
            className="font-body font-bold text-accent flex items-center gap-1 hover:underline shrink-0"
          >
            View All Reports →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {initialLoading ? (
            <>
              <div className="col-span-2 row-span-2"><SkeletonCard /></div>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : patients.length === 0 ? (
            <div className="col-span-4 bg-white border border-border rounded-xl shadow-sm p-12 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e6e8ea] flex items-center justify-center text-3xl">
                👥
              </div>
              <p className="font-heading font-semibold text-xl text-primary">No patients linked yet</p>
              <p className="font-body text-body text-base max-w-sm">
                Search for a patient by their Citizen ID and link them to start managing their records.
              </p>
              <button
                onClick={focusSearchInput}
                className="mt-2 bg-primary text-white font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Search by Citizen ID
              </button>
            </div>
          ) : (
            <>
              {/* Featured card — most recently linked patient */}
              {(() => {
                const featured = patients[0];
                const { bg, text } = getAvatarColor(featured.fullName);
                return (
                  <div className="col-span-2 row-span-2 bg-white border border-border rounded-xl p-8 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {featured.avatarUrl ? (
                            <img
                              src={`http://localhost:5000${featured.avatarUrl}`}
                              alt={featured.fullName}
                              className="w-16 h-16 rounded-full object-cover border-2 border-soft-blue shrink-0"
                            />
                          ) : (
                            <div className={`w-16 h-16 rounded-full ${bg} ${text} flex items-center justify-center font-heading font-bold text-xl border-2 border-soft-blue shrink-0`}>
                              {getInitials(featured.fullName)}
                            </div>
                          )}
                          <div>
                            <p className="font-heading font-semibold text-2xl text-primary">{featured.fullName}</p>
                            <p className="font-body text-base text-body">ID: {featured.citizenId}</p>
                          </div>
                        </div>
                        <span className="bg-[rgba(46,125,50,0.1)] text-[#2e7d32] rounded-full px-3 py-1 text-sm font-semibold shrink-0">
                          ✓ Verified
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-[#eceef0] rounded-lg p-4">
                          <p className="font-heading font-semibold text-sm text-body">Last Report</p>
                          <p className="font-body font-bold text-base text-[#191c1e] mt-1">
                            {featured.lastReportDate
                              ? new Date(featured.lastReportDate).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short", year: "numeric",
                                })
                              : "None"}
                          </p>
                        </div>
                        <div className="bg-[#eceef0] rounded-lg p-4">
                          <p className="font-heading font-semibold text-sm text-body">Blood Type</p>
                          <p className={`font-body font-bold text-base mt-1 ${featured.bloodType ? "text-danger" : "text-muted font-normal"}`}>
                            {featured.bloodType || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/hospital/patient/${featured.id}`}
                      className="w-full bg-primary text-white text-center rounded-lg py-4 font-heading font-bold hover:opacity-90 transition-opacity mt-6"
                    >
                      Open Full Patient File
                    </Link>
                  </div>
                );
              })()}

              {/* Small cards */}
              {patients.slice(1).map((p) => {
                const { bg, text } = getAvatarColor(p.fullName);
                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/hospital/patient/${p.id}`}
                    className="bg-white border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {p.avatarUrl ? (
                        <img
                          src={`http://localhost:5000${p.avatarUrl}`}
                          alt={p.fullName}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full ${bg} ${text} flex items-center justify-center font-heading font-bold text-sm shrink-0`}>
                          {getInitials(p.fullName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-sm text-primary truncate">{p.fullName}</p>
                        <p className="font-body text-xs text-body truncate">ID: {p.citizenId}</p>
                      </div>
                    </div>
                    <p className="font-body text-sm text-body">
                      {p.reportCount} report{p.reportCount !== 1 ? "s" : ""} on file
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="bg-[#eceef0] rounded px-2 py-1 text-xs font-bold text-body">
                        {p.lastReportDate ? getRelativeTime(p.lastReportDate) : "No reports"}
                      </span>
                      <span className="text-accent">→</span>
                    </div>
                  </Link>
                );
              })}

              {/* Action card */}
              <button
                type="button"
                onClick={focusSearchInput}
                className="bg-primary border border-primary rounded-xl flex flex-col items-center justify-center gap-2 p-6 text-center hover:opacity-90 transition-opacity"
              >
                <span className="text-white text-3xl leading-none">+</span>
                <p className="font-heading font-bold text-sm text-white">Find New Patient</p>
                <p className="font-body text-xs text-white opacity-80">Search by Citizen ID</p>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Institutional Trust + Quick Actions */}
      <div className="grid grid-cols-2 gap-6">
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

      <PatientPreviewModal
        patient={searchResult as PatientPreviewData | null}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onLink={handleLink}
        linking={linking}
      />
    </HospitalLayout>
  );
}
