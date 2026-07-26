import Link from "next/link";

export default function PendingStatusPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">
      <header className="bg-bg border-b border-border-strong px-12 py-4">
        <Link
          href="/"
          className="font-heading font-bold text-2xl text-primary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-lg"
          aria-label="MeroHealth home"
        >
          MeroHealth
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="bg-white border border-border rounded-xl shadow-sm p-12 max-w-lg w-full flex flex-col items-center gap-6 text-center">

          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-soft-blue flex items-center justify-center text-4xl">
            ⏳
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-heading font-bold text-2xl text-primary">
              Verification Pending
            </h1>
            <p className="font-body text-body text-base leading-relaxed">
              Your account has been submitted and is currently under review by the Ministry of Health.
            </p>
          </div>

          {/* Status Steps */}
          <div className="w-full flex flex-col gap-3">
            {[
              { label: "Account Created", done: true },
              { label: "Under Ministry Review", done: true, active: true },
              { label: "Account Activated", done: false },
            ].map((step) => (
              <div
                key={step.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  step.active
                    ? "bg-soft-blue border border-accent"
                    : step.done
                    ? "bg-[rgba(139,241,230,0.2)]"
                    : "bg-[#f2f4f6]"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step.active
                    ? "bg-accent text-white"
                    : step.done
                    ? "bg-accent text-white"
                    : "bg-border-strong text-muted"
                }`}>
                  {step.done ? "✓" : "○"}
                </div>
                <p className={`font-heading font-semibold text-sm ${
                  step.active ? "text-accent-light" : step.done ? "text-primary" : "text-muted"
                }`}>
                  {step.label}
                </p>
                {step.active && (
                  <span className="ml-auto text-xs font-semibold text-accent bg-white px-2 py-0.5 rounded-full border border-accent">
                    In Progress
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Info Card */}
          <div className="bg-[rgba(139,241,230,0.2)] border-l-4 border-accent rounded-lg px-6 py-4 text-left w-full">
            <p className="font-heading font-semibold text-sm text-accent-light">What happens next?</p>
            <p className="font-body text-body text-sm mt-1 leading-relaxed">
              A Ministry of Health officer will review your details within 1–2 business days. You&apos;ll receive an email at your registered address once a decision is made.
            </p>
          </div>

          <Link
            href="/login"
            className="border border-border-strong text-body font-heading font-semibold text-sm px-6 py-3 rounded-lg hover:border-primary transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </main>

      <footer className="bg-[#e0e3e5] border-t border-border-strong px-12 py-6 text-center">
        <p className="font-body text-body text-sm">© 2024 MeroHealth. Verified by Ministry of Health Nepal.</p>
      </footer>
    </div>
  );
}