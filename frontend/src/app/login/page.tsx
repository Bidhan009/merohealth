"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.status === 403) {
      if (data.error?.toLowerCase().includes("awaiting")) {
        router.push("/status/pending");
        return;
      }
      if (data.error?.toLowerCase().includes("rejected")) {
        router.push("/status/rejected");
        return;
      }
    }

    if (!res.ok) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    showToast("Logged in successfully!", "success");
    router.push("/dashboard");
  } catch {
    showToast("Something went wrong. Please try again.", "error");
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-heading font-bold text-2xl text-primary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-lg"
          aria-label="MeroHealth home"
        >
          MeroHealth
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-12 py-16">
        <div className="grid grid-cols-2 gap-8 w-full max-w-[1100px]">

          {/* Left: Login Form */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-12 flex flex-col gap-8">

            {/* Heading */}
            <div>
              <h1 className="font-heading font-bold text-3xl text-primary leading-tight">
                {t.auth.welcomeBack}
              </h1>
              <p className="text-body text-base mt-2">
                {t.auth.loginSubtitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-6">

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ram@example.com"
                  required
                  className="border border-border-strong rounded-lg px-4 py-3 text-base font-body text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">
                  {t.auth.password}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border border-border-strong rounded-lg px-4 py-3 text-base font-body text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Forgot password row */}
              <div className="flex items-center justify-end">
                <Link
                  href="#"
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white font-heading font-semibold text-lg py-4 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? t.auth.signingIn : t.auth.secureLogin}
              </button>
            </form>

            {/* Divider + register link */}
            <div className="border-t border-border-strong pt-8 flex flex-col items-center gap-4">
              <p className="text-body text-base">{t.auth.newToMeroHealth}</p>
              <Link
                href="/register/patient"
                className="border border-accent text-accent font-heading font-bold text-sm px-6 py-2 rounded-full hover:bg-accent hover:text-white transition-colors"
              >
                {t.auth.createHealthId}
              </Link>
              <Link
                href="/register/hospital"
                className="text-muted text-sm hover:text-accent transition-colors"
              >
                {t.auth.registerAsHospital} →
              </Link>
            </div>
          </div>

          {/* Right: Security Info */}
          <div className="flex flex-col gap-8 justify-center">

            {/* Hero image placeholder */}
            <div className="relative rounded-xl overflow-hidden h-64 bg-bg-dark flex items-end p-6">
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,21,53,0.7)] to-transparent" />
              <p className="relative font-heading font-semibold text-white text-2xl leading-tight">
                Your health data,<br />secured by the Ministry.
              </p>
            </div>

            {/* Security notice */}
            <div className="bg-[rgba(139,241,230,0.3)] border-l-4 border-accent rounded-xl px-7 py-6 flex flex-col gap-3">
              <p className="font-heading font-semibold text-sm text-accent-light">
                Security Notice
              </p>
              <p className="font-body text-body text-base leading-relaxed">
                MeroHealth uses government-grade encryption to protect your records.
                Access is logged and audited by the Department of Health.
              </p>
            </div>

            {/* Privacy / Legal cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#eceef0] rounded-lg p-4">
                <p className="font-heading font-semibold text-sm text-primary">Privacy Policy</p>
              </div>
              <div className="bg-[#eceef0] rounded-lg p-4">
                <p className="font-heading font-semibold text-sm text-primary">Legal Compliance</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#e0e3e5] border-t border-border-strong px-12 py-8 flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-sm text-primary">MeroHealth</p>
          <p className="font-body text-body text-base">
            © 2024 MeroHealth. Verified by Ministry of Health Nepal.
          </p>
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