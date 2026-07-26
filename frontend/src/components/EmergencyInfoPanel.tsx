import { Skeleton } from "@/components/Skeleton";

export interface EmergencyInfo {
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

interface EmergencyInfoPanelProps {
  info: EmergencyInfo | null;
  loading: boolean;
  open: boolean;
  onToggleOpen: () => void;
}

export default function EmergencyInfoPanel({ info, loading, open, onToggleOpen }: EmergencyInfoPanelProps) {
  const isEmpty =
    !!info &&
    !info.bloodType &&
    !info.allergies &&
    !info.chronicConditions &&
    !info.medications &&
    !info.emergencyName &&
    !info.emergencyPhone &&
    !info.emergencyRelation;

  return (
    <div id="emergency-info-panel" className="flex flex-col">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-label={open ? "Collapse emergency medical information" : "Expand emergency medical information"}
        className={`bg-danger px-6 py-4 flex items-center justify-between text-white w-full transition-colors ${
          open ? "rounded-t-xl" : "rounded-xl"
        }`}
      >
        <span className="font-heading font-extrabold text-sm tracking-widest">EMERGENCY MEDICAL INFORMATION</span>
        <span className="text-lg">{open ? "▼" : "▶"}</span>
      </button>

      {open && (
        <div className="bg-white border border-border rounded-b-xl p-6 flex flex-col gap-5">
          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="w-full h-14" />
              <Skeleton className="w-full h-16" />
              <Skeleton className="w-full h-16" />
            </div>
          ) : !info ? (
            <p className="font-body text-muted text-base">Unable to load emergency information.</p>
          ) : isEmpty ? (
            <p className="font-body text-muted text-base text-center py-4">
              This patient has not yet added emergency information.
            </p>
          ) : (
            <>
              <div className="bg-[rgba(245,166,35,0.15)] border-l-4 border-[#f5a623] rounded-lg px-5 py-3">
                <p className="font-body text-body text-sm leading-relaxed">
                  Self-declared by patient — not clinically verified. Confirm critical details where possible.
                </p>
              </div>

              <div className="bg-soft-red border border-danger rounded-xl px-6 py-4 flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-danger uppercase tracking-widest">
                  Blood Type
                </span>
                <span className={`font-heading font-extrabold text-4xl ${info.bloodType ? "text-danger" : "text-muted text-base font-body font-normal"}`}>
                  {info.bloodType || "Not provided"}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-heading font-semibold text-sm text-primary mb-1">Allergies</p>
                  <p className={`font-body text-base leading-relaxed ${info.allergies ? "text-body" : "text-muted"}`}>
                    {info.allergies || "None recorded"}
                  </p>
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-primary mb-1">Chronic Conditions</p>
                  <p className={`font-body text-base leading-relaxed ${info.chronicConditions ? "text-body" : "text-muted"}`}>
                    {info.chronicConditions || "None recorded"}
                  </p>
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-primary mb-1">Current Medications</p>
                  <p className={`font-body text-base leading-relaxed ${info.medications ? "text-body" : "text-muted"}`}>
                    {info.medications || "None recorded"}
                  </p>
                </div>
              </div>

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

              <p className="font-body text-muted text-xs text-center border-t border-border pt-4">
                {info.emergencyUpdatedAt
                  ? `Last updated: ${new Date(info.emergencyUpdatedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}`
                  : "Never updated"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
