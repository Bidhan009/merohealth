"use client";

import { checkPasswordStrength } from "@/utils/passwordStrength";

interface Props {
  password: string;
}

export default function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const { score, label, color, checks } = checkPasswordStrength(password);

  return (
    <div className="flex flex-col gap-2 mt-1">
      {/* Strength bar - Visibility of System Status */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? color : "bg-border-strong"
            }`}
          />
        ))}
      </div>
      <p className={`font-heading font-semibold text-xs ${
        score <= 1 ? "text-danger" : score === 2 ? "text-[#e67e22]" : "text-accent-light"
      }`}>
        {label}
      </p>
      {/* Error Prevention - show exactly what's needed */}
      <div className="flex flex-col gap-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2">
            <span className={`text-xs ${check.passed ? "text-accent" : "text-muted"}`}>
              {check.passed ? "✓" : "○"}
            </span>
            <span className={`font-body text-xs ${check.passed ? "text-body" : "text-muted"}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}