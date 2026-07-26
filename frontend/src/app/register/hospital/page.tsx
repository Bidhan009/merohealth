"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";

const PROVINCES = [
  "Koshi Province", "Madhesh Province", "Bagmati Province", "Gandaki Province",
  "Lumbini Province", "Karnali Province", "Sudurpashchim Province",
];

const INSTITUTION_TYPES = [
  "Government Hospital", "Private Hospital", "Community Hospital",
  "Teaching Hospital", "Clinic", "Diagnostic Center",
];

const STEPS = [
  { number: 1, label: "Institution" },
  { number: 2, label: "Address" },
  { number: 3, label: "Admin & Security" },
  { number: 4, label: "Review" },
];

export default function HospitalRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");

  // Step 1
  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [beds, setBeds] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Step 2
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  // Step 3
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fullAddress = [streetAddress, municipality, district, province].filter(Boolean).join(", ");

  function validateStep(current: number): boolean {
    setStepError("");
    if (current === 1) {
      if (!name.trim() || !registrationNumber.trim()) {
        setStepError("Hospital name and registration ID are required.");
        return false;
      }
    }
    if (current === 2) {
      if (!streetAddress.trim()) {
        setStepError("Street address is required.");
        return false;
      }
    }
    if (current === 3) {
      if (!email.trim()) {
        setStepError("Official email is required.");
        return false;
      }
      if (password.length < 8) {
        setStepError("Password must be at least 8 characters.");
        return false;
      }
      if (password !== confirmPassword) {
        setStepError("Passwords do not match.");
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  function goBack() {
    setStepError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", name);
      formData.append("registrationNumber", registrationNumber);
      formData.append("address", fullAddress || streetAddress);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch("http://localhost:5000/api/auth/register/hospital", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/register/hospital/pending");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputClass = "border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent w-full";
  const labelClass = "font-heading font-semibold text-sm text-body";

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between">
        <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
        <button className="bg-danger text-white text-sm font-extrabold tracking-widest px-4 py-2 rounded-lg">
          Emergency ID
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-12 py-12">

        {/* Functional Progress Stepper — Zeigarnik Effect: visible progress drives completion */}
        <div className="w-full max-w-[900px] mb-10">
          <div className="flex items-center justify-between relative">
            {STEPS.map((s, i) => (
              <div key={s.number} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-body text-base font-semibold transition-colors ${
                      s.number < step
                        ? "bg-accent text-white"
                        : s.number === step
                        ? "bg-primary text-white"
                        : "bg-[#e0e3e5] text-body"
                    }`}
                  >
                    {s.number < step ? "✓" : s.number}
                  </div>
                  <span
                    className={`font-heading font-semibold text-sm whitespace-nowrap ${
                      s.number <= step ? "text-primary" : "text-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 mb-6 transition-colors ${
                      s.number < step ? "bg-accent" : "bg-border-strong"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-[900px] grid grid-cols-[1fr_2.5fr] gap-6">

          {/* Left Branding Panel */}
          <div className="flex flex-col gap-6">
            <div
              className="rounded-xl p-8 flex flex-col gap-6 shadow-md"
              style={{ background: "linear-gradient(135deg, #001535 0%, #0f2a52 100%)" }}
            >
              <div>
                <h1 className="font-heading font-bold text-4xl text-white leading-tight">
                  Register Your<br />Institution
                </h1>
                <p className="font-body text-white opacity-90 text-base leading-relaxed mt-4">
                  Join Nepal&apos;s official digital health network.
                </p>
              </div>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-start gap-3">
                  <span className="text-mint mt-0.5">✓</span>
                  <p className="font-body text-white text-sm font-semibold">MoH Verified</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-mint mt-0.5">🔒</span>
                  <p className="font-body text-white text-sm font-semibold">Secure Infrastructure</p>
                </div>
              </div>
            </div>

            {/* Step-relevant helper card — changes per step, reduces cognitive load */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              {step === 1 && (
                <>
                  <p className="font-heading font-bold text-sm text-primary mb-2">Step 1 of 4</p>
                  <p className="font-body text-body text-sm leading-relaxed">
                    Tell us about your institution. This information is publicly visible to patients.
                  </p>
                </>
              )}
              {step === 2 && (
                <>
                  <p className="font-heading font-bold text-sm text-primary mb-2">Step 2 of 4</p>
                  <p className="font-body text-body text-sm leading-relaxed">
                    Your physical location helps patients and emergency services find you.
                  </p>
                </>
              )}
              {step === 3 && (
                <>
                  <p className="font-heading font-bold text-sm text-primary mb-2">Step 3 of 4</p>
                  <p className="font-body text-body text-sm leading-relaxed">
                    This becomes your login. Choose a strong password to protect patient data.
                  </p>
                </>
              )}
              {step === 4 && (
                <>
                  <p className="font-heading font-bold text-sm text-primary mb-2">Step 4 of 4</p>
                  <p className="font-body text-body text-sm leading-relaxed">
                    Review your details carefully. You can go back to fix anything before submitting.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-8 flex flex-col gap-6 min-h-[500px]">

            {/* STEP 1 — Institution Info */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <h2 className="font-heading font-semibold text-2xl text-primary">🏥 Institution Information</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className={labelClass}>Official Hospital Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tribhuvan University Teaching Hospital" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Registration ID (MoH)</label>
                    <input type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="MOH-REG-XXXXXX" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Institution Type</label>
                    <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value)} className={inputClass}>
                      <option value="">Select Type</option>
                      {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Number of Beds</label>
                    <input type="number" value={beds} onChange={(e) => setBeds(e.target.value)}
                      placeholder="Total bed capacity" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Hospital Logo / Photo</label>
                    <label className="border-2 border-dashed border-border-strong rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-accent transition-colors">
                      {avatarFile ? (
                        <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <span className="text-xl">📷</span>
                      )}
                      <span className="font-body text-body text-sm truncate">
                        {avatarFile ? avatarFile.name : "Upload logo"}
                      </span>
                      <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Address */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <h2 className="font-heading font-semibold text-2xl text-primary">📍 Physical Address</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Province</label>
                    <select value={province} onChange={(e) => setProvince(e.target.value)} className={inputClass}>
                      <option value="">Select Province</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>District</label>
                    <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Kathmandu" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Municipality / Ward</label>
                    <input type="text" value={municipality} onChange={(e) => setMunicipality(e.target.value)}
                      placeholder="e.g. Ward 3" className={inputClass} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Street Address / Landmarks</label>
                  <textarea value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Detailed street address and nearest landmark" rows={4}
                    className={`${inputClass} resize-none`} />
                </div>
              </div>
            )}

            {/* STEP 3 — Admin & Security */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <h2 className="font-heading font-semibold text-2xl text-primary">👤 Administrative Head & Security</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Full Name (Admin/Director)</label>
                    <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Official legal name" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Designation</label>
                    <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Medical Director" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Official Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@hospital.gov.np" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Primary Contact Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977-XXXXXXXXXX" className={inputClass} />
                  </div>
                </div>
                <div className="border-t border-border pt-6 flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters" className={inputClass} />
                      <PasswordStrengthMeter password={password} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Confirm Password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password" className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 — Review */}
            {step === 4 && (
              <div className="flex flex-col gap-6">
                <h2 className="font-heading font-semibold text-2xl text-primary">✅ Review Your Details</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Hospital Name", value: name },
                    { label: "Registration ID", value: registrationNumber },
                    { label: "Institution Type", value: institutionType || "—" },
                    { label: "Address", value: fullAddress || streetAddress },
                    { label: "Admin Name", value: adminName || "—" },
                    { label: "Designation", value: designation || "—" },
                    { label: "Email", value: email },
                    { label: "Phone", value: phone || "—" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-border pb-3">
                      <span className="font-body text-muted text-sm">{item.label}</span>
                      <span className="font-heading font-semibold text-sm text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[rgba(139,241,230,0.2)] border-l-4 border-accent rounded-lg px-5 py-4">
                  <p className="font-body text-body text-sm leading-relaxed">
                    By submitting, you confirm this information is accurate. Your registration will be reviewed by the Ministry of Health.
                  </p>
                </div>
              </div>
            )}

            {/* Step-level error — Error Prevention, shown immediately at point of failure */}
            {stepError && (
              <div className="bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
                {stepError}
              </div>
            )}
            {error && (
              <div className="bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="border border-border-strong text-body font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:border-primary transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <Link
                  href="/login"
                  className="font-heading font-semibold text-sm text-body hover:text-primary transition-colors"
                >
                  ← Back to Login
                </Link>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="bg-primary text-white font-heading font-semibold text-base px-8 py-3 rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-accent text-white font-heading font-semibold text-base px-8 py-3 rounded-lg shadow hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? "Submitting..." : "Submit Registration ✓"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#e0e3e5] border-t border-border-strong px-12 py-8 flex items-center justify-between mt-12">
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