import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center font-body px-6 text-center gap-6">
      <p className="font-heading font-bold text-8xl text-primary">404</p>
      <h1 className="font-heading font-bold text-3xl text-primary">Page Not Found</h1>
      <p className="font-body text-body text-base max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-white font-heading font-semibold text-base px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  );
}