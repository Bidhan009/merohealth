import Link from "next/link";
import { categorizeReport, getFileType, getRelativeTime, REPORT_CATEGORIES } from "@/utils/reports";
import { getAvatarColor, getInitials } from "@/utils/avatar";

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    description: string | null;
    fileUrl: string;
    createdAt: string;
    hospital: { name: string };
    patient?: { fullName: string; citizenId: string; avatarUrl?: string | null };
    isOwn?: boolean;
  };
  showPatient?: boolean;
  showOwnership?: boolean;
}

export default function ReportCard({ report, showPatient = false, showOwnership = false }: ReportCardProps) {
  const category = categorizeReport(report.title, report.description);
  const categoryDef = REPORT_CATEGORIES.find((c) => c.label === category)!;
  const fileType = getFileType(report.fileUrl);
  const relativeTime = getRelativeTime(report.createdAt);
  const fullDate = new Date(report.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const isOwn = report.isOwn ?? false;

  return (
    <div
      className={`bg-white border rounded-xl p-5 shadow-sm flex items-start gap-4 transition-all hover:border-accent hover:shadow-md focus-within:ring-2 focus-within:ring-accent ${
        showOwnership && isOwn ? "border-border border-l-4 border-l-accent" : "border-border"
      }`}
    >
      {/* Category tile / image thumbnail */}
      {fileType === "image" ? (
        <img
          src={`http://localhost:5000${report.fileUrl}`}
          alt={`${report.title} attachment preview`}
          className="w-14 h-14 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div
          className={`w-14 h-14 rounded-lg ${categoryDef.tileBg} ${categoryDef.tileText} flex items-center justify-center text-2xl shrink-0`}
        >
          {categoryDef.icon}
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {showPatient && report.patient && (
          <div className="flex items-center gap-2 mb-1">
            {report.patient.avatarUrl ? (
              <img
                src={`http://localhost:5000${report.patient.avatarUrl}`}
                alt={report.patient.fullName}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full ${getAvatarColor(report.patient.fullName).bg} ${getAvatarColor(report.patient.fullName).text} flex items-center justify-center font-heading font-bold text-xs shrink-0`}
              >
                {getInitials(report.patient.fullName)}
              </div>
            )}
            <span className="font-body text-body text-sm truncate">
              {report.patient.fullName}{" "}
              <span className="text-muted">· {report.patient.citizenId}</span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-heading font-semibold text-base text-primary">{report.title}</p>
          {showOwnership &&
            (isOwn ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[rgba(139,241,230,0.3)] text-accent-light px-2 py-0.5 rounded-full">
                ✎ Your Report
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-soft-blue text-primary px-2 py-0.5 rounded-full">
                🔒 Read Only
              </span>
            ))}
          {fileType !== "none" && (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider bg-[#e6e8ea] text-body px-1.5 py-0.5 rounded">
              {fileType}
            </span>
          )}
        </div>

        {report.description && (
          <p className="font-body text-sm text-body line-clamp-2">{report.description}</p>
        )}

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryDef.tileBg} ${categoryDef.tileText}`}>
            {category}
          </span>
          <span className="text-muted text-xs">·</span>
          <span className="text-muted text-xs">{report.hospital.name}</span>
          <span className="text-muted text-xs">·</span>
          <span className="text-muted text-xs" title={fullDate}>
            {relativeTime}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {report.fileUrl && (
          <a
            href={`http://localhost:5000${report.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border-strong text-body font-heading font-semibold text-sm px-4 py-2 rounded-lg hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            View File
          </a>
        )}
        {isOwn && (
          <Link
            href={`/dashboard/hospital/report/${report.id}/edit`}
            className="border border-border-strong text-body font-heading font-semibold text-sm px-4 py-2 rounded-lg hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Edit
          </Link>
        )}
      </div>
    </div>
  );
}
