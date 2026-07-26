"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout, getToken } from "@/utils/auth";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { TranslationKey } from "@/i18n/translations";

interface PatientLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS: { key: keyof TranslationKey["nav"]; href: string }[] = [
  { key: "home", href: "/dashboard/patient" },
  { key: "timeline", href: "/dashboard/patient/timeline" },
  { key: "history", href: "/dashboard/patient/history" },
  { key: "settings", href: "/dashboard/patient/settings" },
];

const SIDEBAR_ITEMS: { key: keyof TranslationKey["nav"]; href: string }[] = [
  { key: "myRecords", href: "/dashboard/patient" },
  { key: "timeline", href: "/dashboard/patient/timeline" },
  { key: "history", href: "/dashboard/patient/history" },
  { key: "settings", href: "/dashboard/patient/settings" },
  { key: "helpCenter", href: "/dashboard/patient/help" },
];

export default function PatientLayout({ children }: PatientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const token = getToken();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [patientName, setPatientName] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

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
      setAvatarUrl(data.patient.avatarUrl ?? "");
    }
  };
  load();
}, []);

  const { bg, text } = getAvatarColor(patientName ?? "");
  const initials = getInitials(patientName || "Patient");

  function handleLogout() {
    showToast("You have been logged out successfully.", "info");
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard/patient"
            className="font-heading font-bold text-2xl text-primary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-lg"
            aria-label="MeroHealth home"
          >
            MeroHealth
          </Link>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`font-heading font-semibold text-sm px-3 py-1 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-mint text-accent-light"
                    : "text-body hover:bg-border"
                }`}
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {avatarUrl ? (
              <img
                src={`http://localhost:5000${avatarUrl}`}
                alt={patientName || "Patient"}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center ${text} font-heading font-bold text-sm shrink-0`}>
                {initials}
              </div>
            )}
          <LanguageSwitcher />
          <button className="bg-danger text-white text-sm font-extrabold tracking-widest px-4 py-2 rounded-lg">
            {t.nav.emergencyId}
          </button>
          <button
            onClick={handleLogout}
            className="border border-border-strong text-body text-sm font-semibold px-4 py-2 rounded-lg hover:border-primary transition-colors"
          >
            {t.nav.logout}
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-64 bg-[#f2f4f6] border-r border-border-strong flex flex-col gap-2 p-4 min-h-full">
          <div className="flex items-center gap-3 px-2 pb-6">
            {avatarUrl ? (
                <img
                  src={`http://localhost:5000${avatarUrl}`}
                  alt={patientName || "Patient"}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${text} font-heading font-bold text-base shrink-0`}>
                  {initials}
                </div>
              )}
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
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-heading font-semibold text-sm transition-colors ${
                pathname === item.href
                  ? "bg-mint text-accent-light"
                  : "text-body hover:bg-border"
              }`}
            >
              {t.nav[item.key]}
            </Link>
          ))}
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
          <p className="font-body text-body text-base">© 2026 MeroHealth. Verified by Ministry of Health Nepal.</p>
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