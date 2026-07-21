"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, logout } from "@/utils/auth";
import HospitalLayout from "@/components/HospitalLayout";
import { getInitials } from "@/utils/avatar";

interface HospitalProfile {
  name: string;
  registrationNumber: string;
  address: string;
  user: { email: string };
}

export default function HospitalSettingsPage() {
  const router = useRouter();
  const token = getToken();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  

  useEffect(() => {
  if (!token) { router.replace("/login"); return; }

  const load = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/hospital/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setAvatarUrl(data.avatarUrl ?? "");
        setName(data.name);
        setAddress(data.address);
      }
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("http://localhost:5000/api/hospital/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, address }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      setSuccess("Profile updated successfully!");
      setProfile((prev) => prev ? { ...prev, name, address } : prev);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;
  setAvatarLoading(true);
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetch("http://localhost:5000/api/hospital/avatar", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (res.ok) setAvatarUrl(data.avatarUrl);
  setAvatarLoading(false);
}
  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <HospitalLayout>
          <div>
            <h1 className="font-heading font-bold text-3xl text-primary">Settings</h1>
            <p className="font-body text-body text-base mt-1">
              Manage your hospital profile and account details.
            </p>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <p className="font-body text-muted text-base">Loading profile...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* Profile Card */}
            {/* Avatar Upload */}
<div className="flex items-start gap-8 pb-8 border-b border-border mb-2">
  {/* Large photo display */}
  <div className="relative shrink-0">
    {avatarUrl ? (
      <img
        src={`http://localhost:5000${avatarUrl}`}
        alt="Hospital avatar"
        className="w-40 h-48 rounded-xl object-cover border-2 border-border shadow-md"
      />
    ) : (
      <div className="w-40 h-48 rounded-xl bg-primary flex items-center justify-center text-white font-heading font-bold text-5xl border-2 border-border shadow-md">
        {getInitials(profile?.name ?? "H")}
      </div>
    )}
    <label className="absolute bottom-2 right-2 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow flex items-center gap-1">
      <span>✎</span> Change
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleAvatarUpload}
      />
    </label>
  </div>

  {/* Info beside photo */}
  <div className="flex flex-col gap-3 pt-2">
    <div>
      <p className="font-heading font-bold text-xl text-primary">
        {profile?.name ?? "Hospital"}
      </p>
      <p className="font-body text-body text-sm mt-1">
        Reg: {profile?.registrationNumber ?? "—"}
      </p>
    </div>
    <div className="bg-bg border border-border rounded-lg px-4 py-3 max-w-xs">
      <p className="font-body text-body text-sm leading-relaxed">
        {avatarLoading
          ? "Uploading your photo..."
          : "Upload your hospital's official logo or front entrance photo. Accepted: JPG, PNG, WEBP. Max: 5MB."}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-accent" />
      <p className="font-body text-muted text-xs">
        Verified by Ministry of Health Nepal
      </p>
    </div>
  </div>
</div>
              <div className="bg-white border border-border rounded-xl shadow-sm p-8">
                <h2 className="font-heading font-semibold text-xl text-primary mb-6">
                  Hospital Profile
                </h2>
                <form onSubmit={handleSave} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-heading font-semibold text-sm text-primary">
                      Hospital Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-heading font-semibold text-sm text-primary">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={profile?.registrationNumber ?? ""}
                      disabled
                      className="border border-border rounded-lg px-4 py-3 font-body text-base text-muted bg-[#f2f4f6] cursor-not-allowed"
                    />
                    <p className="font-body text-muted text-xs">
                      Registration number cannot be changed after verification.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-heading font-semibold text-sm text-primary">
                      Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-heading font-semibold text-sm text-primary">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile?.user.email ?? ""}
                      disabled
                      className="border border-border rounded-lg px-4 py-3 font-body text-base text-muted bg-[#f2f4f6] cursor-not-allowed"
                    />
                    <p className="font-body text-muted text-xs">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-[rgba(139,241,230,0.3)] text-accent-light text-sm font-semibold px-4 py-3 rounded-lg">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-white font-heading font-semibold text-base py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 w-fit px-8"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-white border border-danger rounded-xl shadow-sm p-8">
                <h2 className="font-heading font-semibold text-xl text-danger mb-2">
                  Danger Zone
                </h2>
                <p className="font-body text-body text-base mb-6">
                  These actions are irreversible. Please be certain before proceeding.
                </p>
                <button
                  onClick={handleLogout}
                  className="border border-danger text-danger font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:bg-soft-red transition-colors"
                >
                  Sign Out of All Devices
                </button>
              </div>
            </div>
          )}
    </HospitalLayout>
  );
}