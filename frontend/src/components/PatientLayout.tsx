"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout, getToken } from "@/utils/auth";
import { getAvatarColor, getInitials } from "@/utils/avatar";

interface PatientLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard/patient" },
  { label: "Timeline", href: "/dashboard/patient/timeline" },
  { label: "History", href: "/dashboard/patient/history" },
  { label: "Settings", href: "/dashboard/patient/settings" },
];

const SIDEBAR_ITEMS = [
  { label: "My Records", href: "/dashboard/patient" },
  { label: "Timeline", href: "/dashboard/patient/timeline" },
  { label: "Medical History", href: "/dashboard/patient/history" },
  { label: "Settings", href: "/dashboard/patient/settings" },
  { label: "Help Center", href: "/dashboard/patient/help" },
];

export default function PatientLayout({ children }: PatientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const token = getToken();
  const [patientName, setPatientName] = useState("");
  const [citizenId, setCitizenId] = useState("");

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const res = await fetch("http://localhost:5000/api/patient/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPatientName(data.patient.fullName);
        setCitizenId(data.patient.citizenId);
      }
    };
    load();
  }, []);

  const { bg, text } = getAvatarColor(patientName ?? "");
  const initials = getInitials(patientName || "Patient");

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <Link href="/dashboard/patient">
            <span className="font-heading font-bold text-2xl text-primary cursor-pointer">
              MeroHealth
            </span>
          </Link>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-heading font-semibold text-sm px-3 py-1 rounded-lg transition-colors ${
                  pathname === item.href
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
          <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center ${text} font-heading font-bold text-sm shrink-0`}>
            {initials}
          </div>
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
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${text} font-heading font-bold text-base shrink-0`}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="font-heading font-bold text-sm text-primary truncate">
                {patientName || "Patient"}
              </p>
              <p className="font-body text-body text-xs truncate">
                {citizenId ? `ID: ${citizenId}` : "Health Record"}
              </p>
            </div>
          </div>

          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-heading font-semibold text-sm transition-colors ${
                pathname === item.href
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

        {/* Page Content */}
        <main className="flex-1 p-6 flex flex-col gap-6">
          {children}
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