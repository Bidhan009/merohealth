"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken,logout } from "@/utils/auth";

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<Patient | null>(null);
  const [searchError, setSearchError] = useState("");
  const [linkMessage, setLinkMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    fetchPatients();
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
    setLinkMessage("");
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
    setLinkMessage("");
    const res = await fetch("http://localhost:5000/api/hospital/patients/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ patientId: searchResult.id }),
    });
    const data = await res.json();
    if (!res.ok) { setLinkMessage(data.error); return; }
    setLinkMessage("Patient linked successfully!");
    setSearchResult(null);
    setSearchId("");
    fetchPatients();
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
            {["Home", "Reports", "Timeline", "Insights"].map((item) => (
              <span key={item} className="font-heading font-semibold text-sm text-body px-3 py-1 rounded-lg hover:bg-border cursor-pointer">
                {item}
              </span>
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
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-heading font-bold text-sm">H</div>
            <div>
              <p className="font-heading font-bold text-sm text-primary">MeroHealth Portal</p>
              <p className="font-body text-body text-xs">Digital Health ID</p>
            </div>
          </div>
          {[
            { label: "Dashboard", active: true },
            { label: "Settings", active: false },
            { label: "Help Center", active: false },
            { label: "Verification", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer font-heading font-semibold text-sm transition-colors ${
                item.active
                  ? "bg-mint text-accent-light"
                  : "text-body hover:bg-border"
              }`}
            >
              {item.label}
            </div>
          ))}
          <div className="mt-auto">
            <button className="w-full bg-danger text-white font-heading font-extrabold text-sm tracking-widest py-3 rounded-lg shadow">
              Request Ambulance
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 flex flex-col gap-8">

          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading font-bold text-3xl text-primary">Hospital Dashboard</h1>
                <span className="bg-green-100 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  ✓ Verified Hospital
                </span>
              </div>
              <p className="font-body text-body text-base mt-1">Central Command for Patient Records and Diagnostics</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth" })}
                className="border border-[#74777f] bg-white text-primary font-heading font-bold text-sm px-5 py-3 rounded-lg flex items-center gap-2 hover:border-primary transition-colors"
              >
                + Search / Add Patient
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: "Total Patients", value: patients.length, badge: "+12%", badgeColor: "text-green-700 bg-green-100" },
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
            ))}
          </div>

          {/* Search + Patients Grid */}
          <div className="grid grid-cols-3 gap-6">

            {/* Search Section */}
            <div id="search-section" className="col-span-2 bg-white border border-border rounded-xl shadow-sm flex flex-col">
              <div className="border-b border-border px-6 py-5 flex items-center justify-between">
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
                    className="bg-primary text-white font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </form>

                {searchError && (
                  <div className="bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
                    {searchError}
                  </div>
                )}

                {linkMessage && (
                  <div className="bg-[rgba(139,241,230,0.3)] text-accent-light text-sm font-semibold px-4 py-3 rounded-lg">
                    {linkMessage}
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
                      className="bg-accent text-white font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Link Patient
                    </button>
                  </div>
                )}
              </div>

              {/* Linked Patients List */}
              <div className="border-t border-border px-6 py-5">
                <h3 className="font-heading font-semibold text-lg text-primary mb-4">Linked Patients ({patients.length})</h3>
                {patients.length === 0 ? (
                  <p className="font-body text-muted text-base">No patients linked yet. Search by Citizen ID to add patients.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {patients.map((p) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/hospital/patient/${p.id}`}
                        className="flex items-center justify-between border border-border rounded-xl p-4 hover:border-accent transition-colors group"
                      >
                        <div>
                          <p className="font-heading font-semibold text-base text-primary group-hover:text-accent transition-colors">
                            {p.fullName}
                          </p>
                          <p className="font-body text-body text-sm">ID: {p.citizenId}</p>
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
              <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
                <p className="font-heading font-bold text-sm text-primary">Quick Actions</p>
                {["Search Patient", "View Reports", "Help Center"].map((action) => (
                  <div key={action} className="flex items-center justify-between p-3 rounded-lg hover:bg-bg cursor-pointer">
                    <span className="font-body text-body text-base">{action}</span>
                    <span className="text-muted text-sm">›</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
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