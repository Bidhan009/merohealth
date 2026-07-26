export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Contains uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Contains number", passed: /[0-9]/.test(password) },
    { label: "Contains special character", passed: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedCount = checks.filter((c) => c.passed).length;

  const levels = [
    { label: "Very Weak", color: "bg-danger" },
    { label: "Weak", color: "bg-[#e67e22]" },
    { label: "Fair", color: "bg-[#f1c40f]" },
    { label: "Good", color: "bg-[#8bf1e6]" },
    { label: "Strong", color: "bg-accent" },
  ];

  const score = password.length === 0 ? 0 : passedCount;

  return {
    score,
    label: levels[score].label,
    color: levels[score].color,
    checks,
  };
}