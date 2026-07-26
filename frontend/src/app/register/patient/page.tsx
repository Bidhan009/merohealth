"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { useToast } from "@/components/Toast";

export default function PatientRegistrationPage() {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [citizenId, setCitizenId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Calculate age from date of birth to show minor notice live
  function getAge(dob: string): number {
    if (!dob) return -1;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const hasHadBirthday =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() >= birth.getDate());
    if (!hasHadBirthday) age--;
    return age;
  }

  const age = getAge(dateOfBirth);
  const isMinor = age >= 0 && age < 16;

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("fullName", fullName);
    formData.append("dateOfBirth", dateOfBirth);
    if (!isMinor) formData.append("citizenId", citizenId);
    if (avatarFile) formData.append("avatar", avatarFile);

    const res = await fetch("http://localhost:5000/api/auth/register/patient", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    showToast("Registration submitted! Awaiting Ministry approval.", "success");
    router.push("/register/patient/pending");
  } catch {
    showToast("Something went wrong. Please try again.", "error");
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between">
        <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
        <button className="bg-danger text-white text-sm font-extrabold tracking-widest px-4 py-2 rounded-lg">
          Emergency ID
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-12 py-12">

        {/* Progress Stepper */}
        <div className="w-full max-w-[896px] mb-10">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-body text-base">1</div>
              <span className="font-heading font-semibold text-sm text-primary">Personal</span>
            </div>
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-border-strong mx-4" />
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-10 h-10 rounded-full bg-[#e0e3e5] flex items-center justify-center text-body font-body text-base">2</div>
              <span className="font-heading font-semibold text-sm text-body">Medical</span>
            </div>
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-border-strong mx-4" />
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-10 h-10 rounded-full bg-[#e0e3e5] flex items-center justify-center text-body font-body text-base">3</div>
              <span className="font-heading font-semibold text-sm text-body">Verify</span>
            </div>
          </div>
        </div>

        {/* Registration Card */}
        <div className="w-full max-w-[896px] bg-white border border-border rounded-xl shadow-sm overflow-hidden grid grid-cols-[1fr_2fr]">

          {/* Left Branding Panel */}
          <div className="bg-[#0f2a52] p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <h1 className="font-heading font-bold text-4xl text-white leading-tight">
                Secure<br />Identity<br />Setup
              </h1>
              <p className="font-body text-muted text-base leading-relaxed">
                Your data is protected by Ministry-grade encryption. Providing accurate details ensures seamless medical service access across Nepal.
              </p>
            </div>
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-3">
                <span className="text-muted">✓</span>
                <span className="font-heading font-semibold text-sm text-muted">Government Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted">🔒</span>
                <span className="font-heading font-semibold text-sm text-muted">End-to-end Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="p-12 flex flex-col gap-8">
            <div>
              <h2 className="font-heading font-semibold text-2xl text-primary">Personal Details</h2>
              <p className="font-body text-body text-base mt-1">Step 1: Please enter your primary identification details.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">
                  Full Name (As per Citizenship/Passport)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              {/* Photo Upload */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">
                  Passport-Style Photo
                </label>
                <label className="border-2 border-dashed border-border-strong rounded-xl p-6 flex items-center gap-4 cursor-pointer hover:border-accent transition-colors bg-bg">
                  {avatarFile ? (
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="Preview"
                      className="w-20 h-24 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-20 h-24 rounded-lg bg-[#e6e8ea] flex items-center justify-center text-2xl border border-border">
                      📷
                    </div>
                  )}
                  <div>
                    <p className="font-body text-body text-base">
                      {avatarFile ? avatarFile.name : "Click to upload your photo"}
                    </p>
                    <p className="font-body text-muted text-sm mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Citizen ID — hidden for minors */}
                {!isMinor && (
                  <div className="flex flex-col gap-2">
                    <label className="font-heading font-semibold text-sm text-primary">
                      Citizenship ID / NIN
                    </label>
                    <input
                      type="text"
                      value={citizenId}
                      onChange={(e) => setCitizenId(e.target.value)}
                      placeholder="12-34-56-7890"
                      required={!isMinor}
                      className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )}

                {/* Date of Birth */}
                <div className="flex flex-col gap-2">
                  <label className="font-heading font-semibold text-sm text-primary">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Minor notice — shows live as soon as age < 16 */}
              {isMinor && (
                <div className="bg-soft-blue text-primary text-sm font-semibold px-4 py-3 rounded-lg">
                  Minor detected (age {age}) — a unique Minor ID will be auto-generated for this account. No Citizenship ID required.
                </div>
              )}

              {/* Gender */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Gender</label>
                <div className="flex gap-4">
                  {["Male", "Female", "Other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`border rounded-lg px-4 py-3 font-heading font-semibold text-sm transition-colors ${
                        gender === g
                          ? "border-accent bg-accent text-white"
                          : "border-border-strong text-primary hover:border-accent"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Contact Number</label>
                <div className="flex">
                  <span className="bg-[#e6e8ea] border border-border-strong rounded-l-lg px-4 py-3 font-body text-body text-base">
                    +977
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="flex-1 border border-l-0 border-border-strong rounded-r-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <PasswordStrengthMeter password={password} />

              {/* Confirm Password */}
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Link
                  href="/login"
                  className="font-heading font-semibold text-sm text-body hover:text-primary transition-colors"
                >
                  ← Back to Login
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white font-heading font-semibold text-base px-8 py-3 rounded-lg shadow hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? "Registering..." : "Create Health ID →"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center gap-2 opacity-60">
          <span className="text-body text-sm">🔒</span>
          <span className="font-heading font-semibold text-sm text-body">
            Verified by Nepal Health Digital Authority
          </span>
        </div>
      </main>

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