"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getToken} from "@/utils/auth";
import { useToast } from "@/components/Toast";
import PatientIdentityHeader from "@/components/PatientIdentityHeader";
import ReportCard from "@/components/ReportCard";
import EmergencyInfoPanel, { EmergencyInfo } from "@/components/EmergencyInfoPanel";
import { Skeleton, SkeletonListItem } from "@/components/Skeleton";

interface Report {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createdAt: string;
  isOwn: boolean;
  hospital: { name: string; id: string };
}

interface PatientInfo {
  id: string;
  fullName: string;
  citizenId: string;
  isMinor: boolean;
  dateOfBirth: string;
  avatarUrl: string | null;
}

export default function PatientFilePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  const { showToast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const token=getToken();

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }

    const load = async () => {
      try {
        const [reportsRes, patientsRes, emergencyRes] = await Promise.all([
          fetch(`http://localhost:5000/api/hospital/reports/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/hospital/patients", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/hospital/patients/${patientId}/emergency`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (reportsRes.ok) setReports(await reportsRes.json());
        if (patientsRes.ok) {
          const patients: PatientInfo[] = await patientsRes.json();
          setPatient(patients.find((p) => p.id === patientId) ?? null);
        }
        if (emergencyRes.ok) setEmergencyInfo(await emergencyRes.json());
      } finally {
        setPageLoading(false);
      }
    };

    load();
  }, []);

  async function fetchReports() {
    const res = await fetch(
      `http://localhost:5000/api/hospital/reports/${patientId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      setReports(data);
    }
  }

  async function handleCreateReport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("patientId", patientId);
    if (file) formData.append("file", file);

    const res = await fetch("http://localhost:5000/api/hospital/reports", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { showToast(data.error || "Failed to create report", "error"); return; }
    showToast("Report created successfully!", "success");
    setTitle("");
    setDescription("");
    setFile(null);
    setShowForm(false);
    fetchReports();
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between sticky top-0 z-10">
        <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/hospital"
            className="border border-border-strong text-body text-sm font-semibold px-4 py-2 rounded-lg hover:border-primary transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={() => {
              setEmergencyOpen(true);
              requestAnimationFrame(() => {
                document.getElementById("emergency-info-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            }}
            className="bg-danger text-white text-sm font-extrabold tracking-widest px-4 py-2 rounded-lg"
          >
            Emergency ID
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

        {/* Patient Identity */}
        {pageLoading ? (
          <div className="bg-white border border-border rounded-xl p-6 flex items-center gap-5">
            <Skeleton className="w-20 h-20 rounded-full shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="w-48 h-7" />
              <Skeleton className="w-64 h-4" />
            </div>
          </div>
        ) : patient ? (
          <PatientIdentityHeader
            fullName={patient.fullName}
            citizenId={patient.citizenId}
            dateOfBirth={patient.dateOfBirth}
            isMinor={patient.isMinor}
            avatarUrl={patient.avatarUrl}
            reportCount={reports.length}
          />
        ) : null}

        {/* Emergency Info (read-only) */}
        <EmergencyInfoPanel
          info={emergencyInfo}
          loading={pageLoading}
          open={emergencyOpen}
          onToggleOpen={() => setEmergencyOpen((o) => !o)}
        />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-3xl text-primary">Patient Medical File</h1>
            <p className="font-body text-body text-base mt-1">View and manage medical reports for this patient.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            {showForm ? "Cancel" : "+ Upload New Report"}
          </button>
        </div>

        {/* Create Report Form */}
        {showForm && (
          <div className="bg-white border border-border rounded-xl shadow-sm p-8">
            <h2 className="font-heading font-semibold text-xl text-primary mb-6">New Report</h2>
            <form onSubmit={handleCreateReport} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Report Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Blood Test Results"
                  required
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the report..."
                  rows={3}
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Attach File (PDF/Image)</label>
                <label className="border-2 border-dashed border-border-strong rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-accent transition-colors bg-bg">
                  <span className="text-2xl">📄</span>
                  <span className="font-body text-body text-base">
                    {file ? file.name : "Click to browse files"}
                  </span>
                  <span className="font-body text-muted text-sm">PDF, JPG, PNG (Max 20MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white font-heading font-semibold text-base py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? "Uploading..." : "Submit Report"}
              </button>
            </form>
          </div>
        )}

        {/* Reports List */}
        <div className="bg-white border border-border rounded-xl shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-heading font-semibold text-xl text-primary">
              Medical Reports ({reports.length})
            </h2>
          </div>
          {pageLoading ? (
            <div className="flex flex-col">
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e6e8ea] flex items-center justify-center text-3xl">
                📋
              </div>
              <p className="font-heading font-semibold text-xl text-primary">No reports yet</p>
              <p className="font-body text-body text-base max-w-sm">
                Create the first medical report for this patient to start their record.
              </p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-2 bg-primary text-white font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Upload First Report
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-3">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} showOwnership />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-[#e0e3e5] border-t border-border-strong px-12 py-8 flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-sm text-primary">MeroHealth</p>
          <p className="font-body text-body text-base">© 2024 MeroHealth. Verified by Ministry of Health Nepal.</p>
        </div>
        <div className="flex gap-6">
          <Link href="#" className="font-heading font-semibold text-sm text-body hover:text-primary">Privacy Policy</Link>
          <Link href="#" className="font-heading font-semibold text-sm text-body hover:text-primary">Terms of Service</Link>
          <Link href="#" className="font-heading font-semibold text-sm text-body hover:text-primary">Legal Notice</Link>
        </div>
      </footer>
    </div>
  );
}
