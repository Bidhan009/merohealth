"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/utils/auth";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import HospitalLayout from "@/components/HospitalLayout";
import { Skeleton } from "@/components/Skeleton";
import { categorizeReport, getFileType, REPORT_CATEGORIES } from "@/utils/reports";
import { getAvatarColor, getInitials } from "@/utils/avatar";

interface ReportDetail {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  patientId: string;
  hospitalId: string;
  createdAt: string;
  updatedAt: string;
  patient: { fullName: string; citizenId: string; avatarUrl: string | null };
  hospital: { name: string };
}

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;

  const { showToast } = useToast();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [fetching, setFetching] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const token = getToken();

  const hasChanges =
    !!report && (title !== originalTitle || description !== originalDescription || file !== null);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }

    const load = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/hospital/reports/single/${reportId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data: ReportDetail = await res.json();
          setReport(data);
          setTitle(data.title);
          setDescription(data.description ?? "");
          setOriginalTitle(data.title);
          setOriginalDescription(data.description ?? "");
        }
      } finally {
        setFetching(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  function guardedNavigate(action: () => void) {
    if (hasChanges) {
      pendingActionRef.current = action;
      setShowDiscardConfirm(true);
    } else {
      action();
    }
  }

  async function submitReport() {
    if (!report) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("file", file);

    const res = await fetch(
      `http://localhost:5000/api/hospital/reports/${reportId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { showToast(data.error || "Failed to update report", "error"); return; }
    showToast("Report updated successfully!", "success");
    router.push(`/dashboard/hospital/patient/${report.patientId}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (file) { setShowReplaceConfirm(true); return; }
    submitReport();
  }

  if (fetching) {
    return (
      <HospitalLayout>
        <div className="flex flex-col gap-6 max-w-5xl w-full">
          <Skeleton className="w-48 h-10 rounded-lg" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-56 h-8" />
            <Skeleton className="w-72 h-4" />
          </div>
          <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="w-40 h-5" />
              <Skeleton className="w-28 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="bg-white border border-border rounded-xl shadow-sm p-8 flex flex-col gap-5">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-28" />
              <Skeleton className="w-full h-40" />
            </div>
            <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
            </div>
          </div>
        </div>
      </HospitalLayout>
    );
  }

  if (!report) {
    return (
      <HospitalLayout>
        <div className="flex flex-col items-center justify-center gap-3 text-center py-24">
          <div className="w-16 h-16 rounded-full bg-[#e6e8ea] flex items-center justify-center text-3xl">
            🚫
          </div>
          <p className="font-heading font-semibold text-xl text-primary">Report not available</p>
          <p className="font-body text-body text-base max-w-sm">
            You can only edit reports created by your own hospital. This report may not exist or may belong to another hospital.
          </p>
          <Link
            href="/dashboard/hospital"
            className="mt-2 bg-primary text-white font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Dashboard
          </Link>
        </div>
      </HospitalLayout>
    );
  }

  const category = categorizeReport(title, description);
  const categoryDef = REPORT_CATEGORIES.find((c) => c.label === category)!;
  const currentFileType = getFileType(report.fileUrl);
  const { bg: avatarBg, text: avatarText } = getAvatarColor(report.patient.fullName);

  return (
    <HospitalLayout>
      <div className="flex flex-col gap-6 max-w-5xl w-full">
        {/* Breadcrumb */}
        <button
          type="button"
          onClick={() => guardedNavigate(() => router.push(`/dashboard/hospital/patient/${report.patientId}`))}
          className="w-fit border border-border-strong text-body font-heading font-semibold text-sm px-4 py-2 rounded-lg hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          ← Back to Patient File
        </button>

        {/* Heading */}
        <div>
          <h1 className="font-heading font-bold text-3xl text-primary">Edit Report</h1>
          <p className="font-body text-body text-base mt-1">Update the details of this medical report.</p>
        </div>

        {/* Patient context banner */}
        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
          {report.patient.avatarUrl ? (
            <img
              src={`http://localhost:5000${report.patient.avatarUrl}`}
              alt={report.patient.fullName}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className={`w-12 h-12 rounded-full ${avatarBg} ${avatarText} flex items-center justify-center font-heading font-bold text-base shrink-0`}>
              {getInitials(report.patient.fullName)}
            </div>
          )}
          <div>
            <p className="font-heading font-semibold text-base text-primary">{report.patient.fullName}</p>
            <p className="font-body text-muted text-sm">ID: {report.patient.citizenId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Left column — edit form */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Report Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {/* Current file */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Current File</label>
                {currentFileType === "image" ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={`http://localhost:5000${report.fileUrl}`}
                      alt="Current report file"
                      className="w-40 h-40 rounded-lg object-cover border border-border shrink-0"
                    />
                    <a
                      href={`http://localhost:5000${report.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-heading font-semibold text-sm text-accent hover:underline"
                    >
                      View full size →
                    </a>
                  </div>
                ) : currentFileType === "pdf" ? (
                  <div className="border border-border rounded-xl p-4 flex items-center gap-4 bg-bg w-fit">
                    <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center text-2xl shrink-0">
                      📄
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-heading font-semibold text-sm text-primary">PDF Document</p>
                      <a
                        href={`http://localhost:5000${report.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-heading font-semibold text-sm text-accent hover:underline w-fit"
                      >
                        View File →
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-muted text-base">No file attached</p>
                )}
              </div>

              {/* Replace file */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Replace File (optional)</label>
                {file ? (
                  <div className="border border-border-strong rounded-xl p-4 flex items-center gap-4 bg-bg">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="New file preview"
                        className="w-16 h-16 rounded-lg object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-white border border-border flex items-center justify-center text-2xl shrink-0">
                        📄
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-body text-sm truncate">{file.name}</p>
                      <p className="font-body text-muted text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="border border-border-strong text-body font-heading font-semibold text-sm px-3 py-1.5 rounded-lg hover:border-danger hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border-strong rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-accent transition-colors bg-bg">
                    <span className="text-2xl">📄</span>
                    <span className="font-body text-body text-base">Click to upload a new file</span>
                    <span className="font-body text-muted text-sm">PDF, JPG, PNG (Max 20MB)</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-6 border-t border-border">
                <button
                  type="submit"
                  disabled={loading || !hasChanges}
                  className="bg-primary text-white font-heading font-semibold text-base px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => guardedNavigate(() => router.push(`/dashboard/hospital/patient/${report.patientId}`))}
                  className="border border-border-strong text-body font-heading font-semibold text-base px-8 py-3 rounded-lg hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Right column — metadata */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col gap-5 h-fit">
            <h2 className="font-heading font-semibold text-lg text-primary">Report Details</h2>

            <div className="flex flex-col gap-1">
              <p className="font-body text-muted text-xs uppercase tracking-widest">Created</p>
              <p className="font-body text-body text-sm">
                {new Date(report.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-body text-muted text-xs uppercase tracking-widest">Hospital</p>
              <p className="font-body text-body text-sm">{report.hospital.name}</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-body text-muted text-xs uppercase tracking-widest">Category</p>
              <span
                className={`inline-block w-fit text-xs font-semibold px-2 py-1 rounded-full ${categoryDef.tileBg} ${categoryDef.tileText}`}
              >
                {category}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-body text-muted text-xs uppercase tracking-widest">File</p>
              <span className="inline-block w-fit font-mono text-[10px] font-semibold uppercase tracking-wider bg-[#e6e8ea] text-body px-2 py-1 rounded">
                {currentFileType === "none" ? "No file" : currentFileType}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showReplaceConfirm}
        title="Replace report file?"
        message="Replace the existing report file? The current file will no longer be accessible."
        confirmLabel="Replace File"
        cancelLabel="Cancel"
        variant="danger"
        onCancel={() => setShowReplaceConfirm(false)}
        onConfirm={() => {
          setShowReplaceConfirm(false);
          submitReport();
        }}
      />

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard unsaved changes?"
        message="Your edits to this report will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        variant="danger"
        onCancel={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false);
          pendingActionRef.current?.();
        }}
      />
    </HospitalLayout>
  );
}
