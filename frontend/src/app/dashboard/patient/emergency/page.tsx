"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";
import PatientLayout from "@/components/PatientLayout";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { getInitials } from "@/utils/avatar";
import { QRCodeSVG } from "qrcode.react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface EmergencyInfo {
  fullName: string;
  citizenId: string;
  dateOfBirth: string;
  isMinor: boolean;
  avatarUrl: string | null;
  bloodType: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  medications: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  emergencyRelation: string | null;
  organDonor: boolean;
  emergencyUpdatedAt: string | null;
}

function calculateAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthday) age--;
  return age;
}

export default function EmergencyIdPage() {
  const router = useRouter();
  const token = getToken();
  const { showToast } = useToast();

  const [info, setInfo] = useState<EmergencyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [organDonor, setOrganDonor] = useState(false);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }

    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/patient/emergency", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInfo(data);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  function syncFormFromInfo(data: EmergencyInfo) {
    setBloodType(data.bloodType ?? "");
    setAllergies(data.allergies ?? "");
    setChronicConditions(data.chronicConditions ?? "");
    setMedications(data.medications ?? "");
    setEmergencyName(data.emergencyName ?? "");
    setEmergencyPhone(data.emergencyPhone ?? "");
    setEmergencyRelation(data.emergencyRelation ?? "");
    setOrganDonor(data.organDonor);
  }

  function handleEdit() {
    if (info) syncFormFromInfo(info);
    setEditing(true);
  }

  function handleCancel() {
    if (info) syncFormFromInfo(info);
    setEditing(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/patient/emergency", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bloodType,
          allergies,
          chronicConditions,
          medications,
          emergencyName,
          emergencyPhone,
          emergencyRelation,
          organDonor,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to save", "error"); return; }
      setInfo(data);
      showToast("Emergency ID updated successfully!", "success");
      setEditing(false);
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PatientLayout>
        <div className="max-w-[600px] mx-auto w-full flex flex-col gap-4">
          <Skeleton className="w-full h-16 rounded-xl" />
          <div className="bg-white border border-border rounded-xl shadow-sm p-8 flex flex-col gap-5">
            <Skeleton className="w-32 h-32 rounded-2xl" />
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (!info) {
    return (
      <PatientLayout>
        <div className="max-w-[600px] mx-auto w-full text-center py-12">
          <p className="font-body text-muted text-base">Unable to load your Emergency ID.</p>
        </div>
      </PatientLayout>
    );
  }

  const age = calculateAge(info.dateOfBirth);
  const initials = getInitials(info.fullName || "Patient");

  const qrText = [
    "MEROHEALTH EMERGENCY ID",
    `Name: ${info.fullName}`,
    `ID: ${info.citizenId}`,
    `DOB: ${new Date(info.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
    `Blood: ${info.bloodType || "Not provided"}`,
    `Allergies: ${info.allergies || "None recorded"}`,
    `Conditions: ${info.chronicConditions || "None recorded"}`,
    `Medications: ${info.medications || "None recorded"}`,
    `Emergency contact: ${info.emergencyName || "N/A"} (${info.emergencyRelation || "N/A"}) ${info.emergencyPhone || "N/A"}`,
    `Organ donor: ${info.organDonor ? "Yes" : "No"}`,
  ].join("\n");

  return (
    <PatientLayout>
      <div className="max-w-[600px] mx-auto w-full flex flex-col gap-6">
        {!editing && (
          <div className="no-print bg-[rgba(245,166,35,0.15)] border-l-4 border-[#f5a623] rounded-lg px-5 py-3">
            <p className="font-body text-body text-sm leading-relaxed">
              <span className="font-heading font-semibold">Self-declared information</span> — not clinically verified. Always confirm critical details where possible.
            </p>
          </div>
        )}

        {!editing ? (
          <div className="print-card bg-white border border-border rounded-xl shadow-lg overflow-hidden">
            {/* Header strip */}
            <div className="bg-danger px-8 py-4">
              <p className="font-heading font-extrabold text-white text-lg tracking-widest text-center">
                EMERGENCY MEDICAL ID
              </p>
            </div>

            <div className="p-8 flex flex-col gap-6">
              {/* Identity row */}
              <div className="flex items-center gap-5">
                {info.avatarUrl ? (
                  <img
                    src={`http://localhost:5000${info.avatarUrl}`}
                    alt={info.fullName}
                    className="w-24 h-24 rounded-xl object-cover border-2 border-border shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-primary flex items-center justify-center text-white font-heading font-bold text-3xl shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <p className="font-heading font-bold text-2xl text-primary">{info.fullName}</p>
                  <p className="font-body text-body text-sm">ID: {info.citizenId}</p>
                  <p className="font-body text-body text-sm">
                    {new Date(info.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · Age {age}
                  </p>
                </div>
              </div>

              {/* Blood type - most critical field */}
              <div className="bg-soft-red border border-danger rounded-xl px-6 py-4 flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-danger uppercase tracking-widest">Blood Type</span>
                {info.bloodType ? (
                  <span className="font-heading font-extrabold text-5xl text-danger">{info.bloodType}</span>
                ) : (
                  <span className="font-body text-muted text-base">Not provided</span>
                )}
              </div>

              {/* Medical details */}
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-heading font-semibold text-sm text-primary mb-1">Allergies</p>
                  <p className="font-body text-body text-base leading-relaxed">{info.allergies || "None recorded"}</p>
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-primary mb-1">Chronic Conditions</p>
                  <p className="font-body text-body text-base leading-relaxed">{info.chronicConditions || "None recorded"}</p>
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-primary mb-1">Current Medications</p>
                  <p className="font-body text-body text-base leading-relaxed">{info.medications || "None recorded"}</p>
                </div>
              </div>

              {/* Emergency contact */}
              <div className="border border-border rounded-xl p-5 flex flex-col gap-1 bg-bg">
                <p className="font-heading font-semibold text-sm text-primary mb-1">Emergency Contact</p>
                {info.emergencyName ? (
                  <>
                    <p className="font-body text-body text-base">
                      {info.emergencyName} {info.emergencyRelation && `(${info.emergencyRelation})`}
                    </p>
                    {info.emergencyPhone && (
                      <a
                        href={`tel:${info.emergencyPhone}`}
                        className="font-heading font-semibold text-accent text-base hover:underline w-fit"
                      >
                        {info.emergencyPhone}
                      </a>
                    )}
                  </>
                ) : (
                  <p className="font-body text-muted text-base">None recorded</p>
                )}
              </div>

              {/* Organ donor */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-heading font-semibold text-sm text-primary">Organ Donor</span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    info.organDonor ? "bg-[rgba(139,241,230,0.3)] text-accent-light" : "bg-[#e6e8ea] text-body"
                  }`}
                >
                  {info.organDonor ? "Yes" : "No"}
                </span>
              </div>

              {/* QR code */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <QRCodeSVG value={qrText} size={140} />
                <p className="font-body text-muted text-xs">Scan for a plain-text summary</p>
              </div>

              {/* Footer line */}
              <p className="font-body text-muted text-xs text-center border-t border-border pt-4">
                {info.emergencyUpdatedAt
                  ? `Last updated: ${new Date(info.emergencyUpdatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                  : "Never updated"}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white border border-border rounded-xl shadow-sm p-8 flex flex-col gap-6">
            <h2 className="font-heading font-bold text-2xl text-primary">Edit Emergency ID</h2>

            <div className="flex flex-col gap-2">
              <label className="font-heading font-semibold text-sm text-primary">Blood Type</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Not sure</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-heading font-semibold text-sm text-primary">Allergies</label>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, peanuts — separate with commas"
                rows={3}
                className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-heading font-semibold text-sm text-primary">Chronic Conditions</label>
              <textarea
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="e.g. Diabetes, asthma — separate with commas"
                rows={3}
                className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-heading font-semibold text-sm text-primary">Current Medications</label>
              <textarea
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="e.g. Metformin 500mg twice daily"
                rows={3}
                className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            <div className="border-t border-border pt-6 flex flex-col gap-5">
              <h3 className="font-heading font-semibold text-lg text-primary">Emergency Contact</h3>
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Sita Sharma"
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="e.g. Spouse, Parent, Sibling"
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-heading font-semibold text-sm text-primary">Phone Number</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. 98XXXXXXXX"
                  className="border border-border-strong rounded-lg px-4 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={organDonor}
                onChange={(e) => setOrganDonor(e.target.checked)}
                className="w-5 h-5 accent-accent"
              />
              <span className="font-heading font-semibold text-sm text-primary">I am a registered organ donor</span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white font-heading font-semibold text-base px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="border border-border-strong text-body font-heading font-semibold text-base px-8 py-3 rounded-lg hover:border-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!editing && (
          <div className="no-print flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="bg-primary text-white font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Edit Details
            </button>
            <button
              onClick={() => window.print()}
              className="border border-border-strong text-body font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:border-primary transition-colors"
            >
              Print Card
            </button>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
