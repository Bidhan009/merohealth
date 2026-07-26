export type ReportCategory =
  | "Blood Tests"
  | "Imaging"
  | "Vaccination"
  | "Surgery"
  | "Cardiology"
  | "General";

interface ReportCategoryDef {
  label: ReportCategory;
  keywords: string[];
  icon: string;
  tileBg: string;
  tileText: string;
}

export const REPORT_CATEGORIES: ReportCategoryDef[] = [
  {
    label: "Blood Tests",
    keywords: ["blood", "cbc", "hemoglobin", "platelet"],
    icon: "🩸",
    tileBg: "bg-soft-red",
    tileText: "text-danger",
  },
  {
    label: "Imaging",
    keywords: ["xray", "x-ray", "mri", "ct", "scan", "ultrasound"],
    icon: "🫁",
    tileBg: "bg-soft-blue",
    tileText: "text-primary",
  },
  {
    label: "Vaccination",
    keywords: ["vaccine", "vaccination", "immunization", "booster"],
    icon: "💉",
    tileBg: "bg-[rgba(139,241,230,0.35)]",
    tileText: "text-accent-light",
  },
  {
    label: "Surgery",
    keywords: ["surgery", "operation", "procedure", "surgical"],
    icon: "🏥",
    tileBg: "bg-[rgba(0,21,53,0.08)]",
    tileText: "text-primary",
  },
  {
    label: "Cardiology",
    keywords: ["heart", "cardiac", "ecg", "echo", "cardio"],
    icon: "❤️",
    tileBg: "bg-[rgba(211,47,47,0.10)]",
    tileText: "text-danger",
  },
  {
    label: "General",
    keywords: [],
    icon: "📋",
    tileBg: "bg-[#e6e8ea]",
    tileText: "text-body",
  },
];

export function categorizeReport(title: string, description?: string | null): ReportCategory {
  const text = (title + " " + (description ?? "")).toLowerCase();
  for (const cat of REPORT_CATEGORIES) {
    if (cat.label === "General") continue;
    if (cat.keywords.some((k) => text.includes(k))) return cat.label;
  }
  return "General";
}

export function getFileType(fileUrl: string): "pdf" | "image" | "none" {
  if (!fileUrl) return "none";
  const ext = fileUrl.split(".").pop()?.toLowerCase();
  if (!ext) return "none";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  return "none";
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks <= 4) return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
