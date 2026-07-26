"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getToken } from "@/utils/auth";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;

  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }

    const load = async () => {
      const res = await fetch(
        `http://localhost:5000/api/hospital/reports/single/${reportId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description ?? "");
      }
      setFetching(false);
    };

    load();
  }, []);

  async function submitReport() {
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
    router.back();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (file) { setShowReplaceConfirm(true); return; }
    submitReport();
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-body">
        <p className="text-body">Loading report...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between sticky top-0 z-10">
        <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
        <button
          onClick={() => router.back()}
          className="border border-border-strong text-body text-sm font-semibold px-4 py-2 rounded-lg hover:border-primary transition-colors"
        >
          ← Cancel
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white border border-border rounded-xl shadow-sm p-10 w-full max-w-2xl flex flex-col gap-8">
          <div>
            <h1 className="font-heading font-bold text-3xl text-primary">Edit Report</h1>
            <p className="font-body text-body text-base mt-1">Update the report details below.</p>
          </div>

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

            <div className="flex flex-col gap-2">
              <label className="font-heading font-semibold text-sm text-primary">Replace File (optional)</label>
              <label className="border-2 border-dashed border-border-strong rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-accent transition-colors bg-bg">
                <span className="text-2xl">📄</span>
                <span className="font-body text-body text-base">
                  {file ? file.name : "Click to upload a new file"}
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
              className="bg-primary text-white font-heading font-semibold text-base py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
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
    </div>
  );
}