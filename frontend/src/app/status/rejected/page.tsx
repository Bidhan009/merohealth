import Link from "next/link";

export default function RejectedStatusPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">
      <header className="bg-bg border-b border-border-strong px-12 py-4">
        <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="bg-white border border-border rounded-xl shadow-sm p-12 max-w-lg w-full flex flex-col items-center gap-6 text-center">

          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-soft-red flex items-center justify-center text-4xl">
            ✕
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-heading font-bold text-2xl text-primary">
              Registration Rejected
            </h1>
            <p className="font-body text-body text-base leading-relaxed">
              Unfortunately your registration was not approved by the Ministry of Health.
            </p>
          </div>

          {/* Reasons Card */}
          <div className="bg-soft-red border-l-4 border-danger rounded-lg px-6 py-4 text-left w-full">
            <p className="font-heading font-semibold text-sm text-danger">Common Reasons for Rejection</p>
            <ul className="flex flex-col gap-1 mt-2">
              {[
                "Incorrect or unverifiable Citizen ID",
                "Incomplete registration details",
                "Duplicate account detected",
                "Invalid hospital registration number",
              ].map((reason) => (
                <li key={reason} className="font-body text-body text-sm flex items-start gap-2">
                  <span className="text-danger mt-0.5">·</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <p className="font-body text-body text-sm leading-relaxed">
            If you believe this is a mistake, please contact the Ministry of Health support team at{" "}
            <span className="text-accent font-semibold">support@merohealth.gov.np</span>
          </p>

          <div className="flex gap-3 w-full">
            <Link
              href="/register/patient"
              className="flex-1 bg-primary text-white font-heading font-semibold text-sm py-3 rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              Re-register as Patient
            </Link>
            <Link
              href="/login"
              className="flex-1 border border-border-strong text-body font-heading font-semibold text-sm py-3 rounded-lg hover:border-primary transition-colors text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#e0e3e5] border-t border-border-strong px-12 py-6 text-center">
        <p className="font-body text-body text-sm">© 2024 MeroHealth. Verified by Ministry of Health Nepal.</p>
      </footer>
    </div>
  );
}