"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";
import PatientLayout from "@/components/PatientLayout";
import { getInitials } from "@/utils/avatar";

interface PatientInfo {
  fullName: string;
  citizenId: string;
  isMinor: boolean;
  dateOfBirth: string;
  avatarUrl?: string;
}

export default function PatientSettingsPage() {
  const router = useRouter();
  const token = getToken();
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);

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
          setAvatarUrl(data.patient.avatarUrl ?? "");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/patient/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || "Failed to change password"); return; }
      setPwSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPwError("Something went wrong.");
    } finally {
      setPwLoading(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch("http://localhost:5000/api/patient/avatar", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (res.ok) setAvatarUrl(data.avatarUrl);
    setAvatarLoading(false);
  }

  return (
    <PatientLayout>
      <div>
        <h1 className="font-heading font-bold text-3xl text-primary">Settings</h1>
        <p className="font-body text-body text-base mt-1">
          Manage your account and security preferences.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <p className="font-body text-muted text-base">Loading...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl">

          {/* Avatar Upload */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-8">
            <h2 className="font-heading font-semibold text-xl text-primary mb-6">
              Profile Photo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={`http://localhost:5000${avatarUrl}`}
                    alt="Patient avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-heading font-bold text-2xl border-2 border-border">
                    {getInitials(patient?.fullName ?? "P")}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-7 h-7 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity border-2 border-white">
                  <span className="text-white text-xs">✎</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <div>
                <p className="font-heading font-bold text-base text-primary">
                  {patient?.fullName ?? "Patient"}
                </p>
                <p className="font-body text-muted text-sm">
                  {avatarLoading ? "Uploading..." : "Click the pencil icon to update your photo"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Info (read only) */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-8">
            <h2 className="font-heading font-semibold text-xl text-primary mb-6">
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Full Name", value: patient?.fullName },
                { label: "Citizen ID", value: patient?.citizenId },
                {
                  label: "Date of Birth",
                  value: patient?.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })
                    : "—",
                },
                {
                  label: "Account Type",
                  value: patient?.isMinor ? "Minor Account" : "Adult Account",
                },
              ].map((field) => (
                <div key={field.label} className="flex flex-col gap-2">
                  <label className="font-heading font-semibold text-sm text-primary">
                    {field.label}
                  </label>
                  <div className="border border-border rounded-lg px-4 py-3 bg-[#f2f4f6]">
                    <p className="font-body text-muted text-base">{field.value ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="font-body text-muted text-xs mt-4">
              Personal information is managed by the Ministry of Health and cannot be changed here.
            </p>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-8">
            <h2 className="font-heading font-semibold text-xl text-primary mb-6">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {pwError && (
                <div className="bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="bg-[rgba(139,241,230,0.3)] text-accent-light text-sm font-semibold px-4 py-3 rounded-lg">
                  {pwSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="bg-primary text-white font-heading font-semibold text-base py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 w-fit px-8"
              >
                {pwLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Security Info */}
          <div className="bg-[rgba(139,241,230,0.2)] border-l-4 border-accent rounded-xl px-7 py-5 flex flex-col gap-2">
            <p className="font-heading font-semibold text-sm text-accent-light">
              Your Data is Protected
            </p>
            <p className="font-body text-body text-base leading-relaxed">
              All your health records are encrypted and access is logged by the Ministry of Health.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="bg-white border border-danger rounded-xl shadow-sm p-8">
            <h2 className="font-heading font-semibold text-xl text-danger mb-2">
              Danger Zone
            </h2>
            <p className="font-body text-body text-base mb-6">
              Sign out from all active sessions on this device.
            </p>
            <button
              onClick={() => { localStorage.clear(); router.replace("/login"); }}
              className="border border-danger text-danger font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:bg-soft-red transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}