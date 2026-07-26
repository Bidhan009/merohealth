import { getAvatarColor, getInitials } from "@/utils/avatar";

interface PatientIdentityHeaderProps {
  fullName: string;
  citizenId: string;
  dateOfBirth: string;
  isMinor: boolean;
  avatarUrl?: string | null;
  reportCount: number;
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

export default function PatientIdentityHeader({
  fullName,
  citizenId,
  dateOfBirth,
  isMinor,
  avatarUrl,
  reportCount,
}: PatientIdentityHeaderProps) {
  const { bg, text } = getAvatarColor(fullName);
  const initials = getInitials(fullName);
  const age = calculateAge(dateOfBirth);

  return (
    <div className="bg-white border border-border rounded-xl p-6 flex items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        {avatarUrl ? (
          <img
            src={`http://localhost:5000${avatarUrl}`}
            alt={fullName}
            className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-border"
          />
        ) : (
          <div
            className={`w-20 h-20 rounded-full ${bg} ${text} flex items-center justify-center font-heading font-bold text-2xl shrink-0`}
          >
            {initials}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <p className="font-heading font-bold text-2xl text-primary">{fullName}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-body text-body text-sm">ID: {citizenId}</span>
            <span className="text-muted text-sm">·</span>
            <span className="font-body text-body text-sm">
              {new Date(dateOfBirth).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · Age {age}
            </span>
            {isMinor && (
              <span className="text-xs font-semibold bg-soft-blue text-primary px-2 py-0.5 rounded-full">
                Minor
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center shrink-0">
        <p className="font-heading font-bold text-4xl text-primary tracking-tight">{reportCount}</p>
        <p className="font-body text-muted text-xs uppercase tracking-widest">Reports</p>
      </div>
    </div>
  );
}
