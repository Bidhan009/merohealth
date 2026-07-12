"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, logout } from "@/utils/auth";

interface PatientInfo {
  fullName: string;
  citizenId: string;
  isMinor: boolean;
  dateOfBirth: string;
  user: { email: string };
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

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }

    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/patient/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPatient({ ...data.patient, user: { email: data.email ?? "" } });
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

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
          <nav className="flex gap-1">
            {[
              { label: "Home", href: "/dashboard/patient" },
              { label: "Timeline", href: "/dashboard/patient/timeline" },
              { label: "History", href: "/dashboard/patient/history" },
              { label: "Settings", href: "/dashboard/patient/settings" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-heading font-semibold text-sm px-3 py-1 rounded-lg transition-colors ${
                  item.href === "/dashboard/patient/settings"
                    ? "bg-mint text-accent-light"
                    : "text-body hover:bg-border"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-danger text-white text-sm font-extrabold tracking-widest px-4 py-2 rounded-lg">
            Emergency ID
          </button>
          <button
            onClick={handleLogout}
            className="border border-border-strong text-body text-sm font-semibold px-4 py-2 rounded-lg hover:border-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-64 bg-[#f2f4f6] border-r border-border-strong flex flex-col gap-2 p-4 min-h-full">
          <div className="flex items-center gap-3 px-2 pb-6">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-heading font-bold text-sm">
              {patient?.fullName?.[0] ?? "P"}
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-primary">{patient?.fullName ?? "Patient"}</p>
              <p className="font-body text-body text-xs">ID: {patient?.citizenId ?? "—"}</p>
            </div>
          </div>
          {[
            { label: "My Records", href: "/dashboard/patient", active: false },
            { label: "Timeline", href: "/dashboard/patient/timeline", active: false },
            { label: "Medical History", href: "/dashboard/patient/history", active: false },
            { label: "Settings", href: "/dashboard/patient/settings", active: true },
            { label: "Help Center", href: "/dashboard/patient/help", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-heading font-semibold text-sm transition-colors ${
                item.active
                  ? "bg-mint text-accent-light"
                  : "text-body hover:bg-border"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-auto">
            <button className="w-full bg-danger text-white font-heading font-extrabold text-sm tracking-widest py-3 rounded-lg shadow">
              Emergency ID
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 flex flex-col gap-6 max-w-3xl">
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
            <div className="flex flex-col gap-6">

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
                    { label: "Account Type", value: patient?.isMinor ? "Minor Account" : "Adult Account" },
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
                  Personal information is managed by the Ministry of Health and cannot be changed here. Contact your registered hospital for updates.
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
                  All your health records are encrypted and access is logged by the Ministry of Health. You can only view your records — hospitals manage your medical reports.
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
                  onClick={handleLogout}
                  className="border border-danger text-danger font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:bg-soft-red transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

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