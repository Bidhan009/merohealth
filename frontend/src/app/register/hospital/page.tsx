"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const INSTITUTION_TYPES = [
  "Government Hospital",
  "Private Hospital",
  "Community Hospital",
  "Teaching Hospital",
  "Clinic",
  "Diagnostic Center",
];

export default function HospitalRegistrationPage() {
  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [beds, setBeds] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const router = useRouter();

  const fullAddress = [streetAddress, municipality, district, province]
    .filter(Boolean)
    .join(", ");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register/hospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          registrationNumber,
          address: fullAddress || streetAddress,
        }),
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
  const sectionHeadingClass = "font-heading font-semibold text-2xl text-primary";

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

        {/* Progress Stepper */}
        <div className="w-full max-w-[1024px] mb-10">
          <div className="flex items-center justify-center gap-0 max-w-[672px] mx-auto relative">
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-body text-base">1</div>
              <span className="font-heading font-semibold text-sm text-primary whitespace-nowrap">Institutional Info</span>
            </div>
            <div className="flex-1 h-0.5 bg-border-strong mx-4 mb-6" />
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-10 h-10 rounded-full bg-[#e0e3e5] flex items-center justify-center text-body font-body text-base">2</div>
              <span className="font-heading font-semibold text-sm text-body whitespace-nowrap">Review & Verify</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1024px] grid grid-cols-[1fr_2.5fr] gap-6">

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
                  Join Nepal&apos;s official digital health network. Gain access to verified medical records, integrated emergency services, and the national health ID database.
                </p>
              </div>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-start gap-3">
                  <span className="text-mint mt-0.5">✓</span>
                  <div>
                    <p className="font-body text-white text-sm font-semibold">MoH Verified</p>
                    <p className="font-body text-white opacity-80 text-xs">Ministry of Health standards compliance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-mint mt-0.5">🔒</span>
                  <div>
                    <p className="font-body text-white text-sm font-semibold">Secure Infrastructure</p>
                    <p className="font-body text-white opacity-80 text-xs">End-to-end encrypted patient data.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Documents Card */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <p className="font-body text-primary text-sm font-semibold tracking-widest uppercase">
                Required Documents
              </p>
              <ul className="flex flex-col gap-3">
                {["Operation License", "Tax Clearance (PAN/VAT)", "Admin ID Proof"].map((doc) => (
                  <li key={doc} className="flex items-center gap-3">
                    <span className="text-accent text-sm">✓</span>
                    <span className="font-body text-body text-base">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-8 flex flex-col gap-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">

              {/* Section 1: Institutional Info */}
              <div className="flex flex-col gap-6">
                <h2 className={sectionHeadingClass}>🏥 Official Hospital Information</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Official Hospital Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tribhuvan University Teaching Hospital"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Registration ID (MoH)</label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="MOH-REG-XXXXXX"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Institution Type</label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Type</option>
                      {INSTITUTION_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Number of Beds</label>
                    <input
                      type="number"
                      value={beds}
                      onChange={(e) => setBeds(e.target.value)}
                      placeholder="Total bed capacity"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Section 2: Physical Address */}
              <div className="flex flex-col gap-6">
                <h2 className={sectionHeadingClass}>📍 Physical Address</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Province</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Province</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Kathmandu"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Municipality / Ward</label>
                    <input
                      type="text"
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      placeholder="e.g. Ward 3"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Street Address / Landmarks</label>
                  <textarea
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Detailed street address and nearest landmark"
                    required
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Section 3: Admin Contact */}
              <div className="flex flex-col gap-6">
                <h2 className={sectionHeadingClass}>👤 Administrative Head</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Full Name (Admin/Director)</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Official legal name"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Official Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@hospital.gov.np"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Primary Contact Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977-XXXXXXXXXX"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Designation</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Medical Director"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Section 4: Account Credentials */}
              <div className="flex flex-col gap-6">
                <h2 className={sectionHeadingClass}>🔐 Account Credentials</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload Zone (visual only for now) */}
              <div className="border-2 border-dashed border-border-strong rounded-xl p-10 flex flex-col items-center gap-4 bg-[#f2f4f6]">
                <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center text-2xl">📄</div>
                <p className="font-body text-body text-lg text-center">Upload Verification Bundle</p>
                <p className="font-body text-body text-base text-center">Drag and drop or browse to upload your ZIP/PDF files.</p>
                <label className="border border-border-strong rounded-full px-6 py-2 font-heading font-semibold text-sm text-primary hover:border-accent transition-colors cursor-pointer">
                Browse Files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.zip"
                  className="hidden"
                  onChange={(e) => setUploadedFiles(Array.from(e.target.files || []))}
                />
              </label>
              {uploadedFiles.length > 0 && (
                <div className="flex flex-col gap-1 w-full">
                  {uploadedFiles.map((f, i) => (
                    <p key={i} className="font-body text-accent text-sm text-center">✓ {f.name}</p>
                  ))}
                </div>
              )}
                <p className="font-body text-body text-xs text-center opacity-70">Accepted: PDF, JPG, PNG (Max 20MB per file)</p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-soft-red text-danger text-sm font-semibold px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="font-body text-body text-base italic">
                  Note: All information will be verified by MoH administrators.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white font-heading font-semibold text-base px-8 py-4 rounded-lg shadow hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? "Submitting..." : "Proceed to Review →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
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