"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, logout } from "@/utils/auth";

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
              { label: "Home", href: "/dashboard/hospital" },
              { label: "Reports", href: "/dashboard/hospital/reports" },
              { label: "Timeline", href: "/dashboard/hospital/timeline" },
              { label: "Categories", href: "/dashboard/hospital/categories" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-heading font-semibold text-sm px-3 py-1 rounded-lg text-body hover:bg-border transition-colors"
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
          {[
            { label: "Dashboard", href: "/dashboard/hospital", active: false },
            { label: "Search Reports", href: "/dashboard/hospital/reports", active: false },
            { label: "Timeline", href: "/dashboard/hospital/timeline", active: false },
            { label: "Categories", href: "/dashboard/hospital/categories", active: false },
            { label: "Settings", href: "/dashboard/hospital/settings", active: true },
            { label: "Help Center", href: "/dashboard/hospital/help", active: false },
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
              Request Ambulance
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 flex flex-col gap-6 max-w-3xl">
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