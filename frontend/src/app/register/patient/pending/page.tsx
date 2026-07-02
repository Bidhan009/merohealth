import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center font-body px-6">
      <div className="bg-white border border-border rounded-xl shadow-sm p-12 max-w-lg w-full flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-soft-blue flex items-center justify-center text-3xl">
          📋
        </div>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Registration Submitted
        </h1>
        <p className="font-body text-body text-base leading-relaxed">
          Your registration has been submitted and is awaiting verification by the Ministry of Health. You will receive an email once your account is approved.
        </p>
        <div className="bg-[rgba(139,241,230,0.3)] border-l-4 border-accent rounded-lg px-6 py-4 text-left w-full">
          <p className="font-heading font-semibold text-sm text-accent-light">What happens next?</p>
          <p className="font-body text-body text-sm mt-1 leading-relaxed">
            A government officer will review your details. This typically takes 1–2 business days. Once approved, you can log in with your email and password.
          </p>
        </div>
        <Link
          href="/login"
          className="bg-primary text-white font-heading font-semibold text-base px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}