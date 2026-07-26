"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { getAvatarColor, getInitials } from "@/utils/avatar";

export interface PatientPreviewData {
  id: string;
  fullName: string;
  citizenId: string;
  isMinor: boolean;
  dateOfBirth: string;
  avatarUrl: string | null;
  bloodType: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  isLinked: boolean;
  reportCount: number;
  lastReportDate: string | null;
}

interface PatientPreviewModalProps {
  patient: PatientPreviewData | null;
  isOpen: boolean;
  onClose: () => void;
  onLink: () => void;
  linking: boolean;
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

export default function PatientPreviewModal({ patient, isOpen, onClose, onLink, linking }: PatientPreviewModalProps) {
  const linkButtonRef = useRef<HTMLButtonElement>(null);
  const fileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (patient?.isLinked) {
      fileLinkRef.current?.focus();
    } else {
      linkButtonRef.current?.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, patient]);

  if (!isOpen || !patient) return null;

  const { bg, text } = getAvatarColor(patient.fullName);
  const initials = getInitials(patient.fullName);
  const age = calculateAge(patient.dateOfBirth);
  const hasEmergencySummary = !!(patient.allergies || patient.chronicConditions);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,21,53,0.5)] px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-preview-title"
        className="bg-white rounded-xl shadow-lg w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {patient.avatarUrl ? (
                <img
                  src={`http://localhost:5000${patient.avatarUrl}`}
                  alt={patient.fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-soft-blue shrink-0"
                />
              ) : (
                <div
                  className={`w-20 h-20 rounded-full ${bg} ${text} flex items-center justify-center font-heading font-bold text-2xl border-2 border-soft-blue shrink-0`}
                >
                  {initials}
                </div>
              )}
              <div>
                <p id="patient-preview-title" className="font-heading font-semibold text-2xl text-primary">
                  {patient.fullName}
                </p>
                <p className="font-body text-base text-body">ID: {patient.citizenId}</p>
                {patient.isMinor && (
                  <span className="inline-block mt-1 text-xs font-semibold bg-soft-blue text-primary px-2 py-0.5 rounded-full">
                    Minor Account
                  </span>
                )}
              </div>
            </div>
            <span className="shrink-0 bg-[rgba(46,125,50,0.1)] text-[#2e7d32] rounded-full px-3 py-1 text-sm font-semibold">
              ✓ Verified
            </span>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#eceef0] rounded-lg p-4">
              <p className="font-heading font-semibold text-sm text-body">Date of Birth</p>
              <p className="font-body font-bold text-base text-[#191c1e] mt-1">
                {new Date(patient.dateOfBirth).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                ({age})
              </p>
            </div>
            <div className="bg-[#eceef0] rounded-lg p-4">
              <p className="font-heading font-semibold text-sm text-body">Blood Type</p>
              <p className={`font-body font-bold text-base mt-1 ${patient.bloodType ? "text-danger" : "text-muted font-normal"}`}>
                {patient.bloodType || "Not provided"}
              </p>
            </div>
            <div className="bg-[#eceef0] rounded-lg p-4">
              <p className="font-heading font-semibold text-sm text-body">Total Reports</p>
              <p className="font-body font-bold text-base text-[#191c1e] mt-1">{patient.reportCount}</p>
            </div>
            <div className="bg-[#eceef0] rounded-lg p-4">
              <p className="font-heading font-semibold text-sm text-body">Last Report</p>
              <p className="font-body font-bold text-base text-[#191c1e] mt-1">
                {patient.lastReportDate
                  ? new Date(patient.lastReportDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "None"}
              </p>
            </div>
          </div>

          {/* Emergency summary */}
          {hasEmergencySummary && (
            <div className="border border-border rounded-xl p-4 flex flex-col gap-2">
              <p className="font-heading font-semibold text-sm text-primary">Emergency Summary</p>
              {patient.allergies && (
                <div>
                  <p className="font-body text-xs text-muted uppercase tracking-widest">Allergies</p>
                  <p className="font-body text-sm text-body">{patient.allergies}</p>
                </div>
              )}
              {patient.chronicConditions && (
                <div>
                  <p className="font-body text-xs text-muted uppercase tracking-widest">Chronic Conditions</p>
                  <p className="font-body text-sm text-body">{patient.chronicConditions}</p>
                </div>
              )}
              <p className="font-body text-xs text-muted italic">Self-declared by patient — not clinically verified.</p>
            </div>
          )}

          {/* Footer actions */}
          {patient.isLinked ? (
            <div className="flex flex-col gap-3">
              <div className="border border-border-strong rounded-lg py-3 text-center font-body text-sm text-body">
                Already linked to your hospital
              </div>
              <Link
                ref={fileLinkRef}
                href={`/dashboard/hospital/patient/${patient.id}`}
                className="w-full bg-primary text-white text-center rounded-lg py-4 font-heading font-bold hover:opacity-90 transition-opacity"
              >
                Open Patient File
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                ref={linkButtonRef}
                type="button"
                onClick={onLink}
                disabled={linking}
                className="w-full bg-primary text-white rounded-lg py-4 font-heading font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {linking ? "Linking..." : "Link Patient to Hospital"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full border border-border-strong text-body rounded-lg py-3 font-heading font-semibold hover:border-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
