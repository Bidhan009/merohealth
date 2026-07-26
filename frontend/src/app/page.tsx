import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between">
        <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="font-heading font-semibold text-sm text-body hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register/patient"
            className="bg-primary text-white font-heading font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="flex flex-col items-center justify-center text-center px-12 py-24 gap-8">
          <div className="flex items-center gap-2 bg-[rgba(139,241,230,0.3)] border border-accent rounded-full px-4 py-2">
            <span className="text-accent text-sm">✓</span>
            <span className="font-heading font-semibold text-sm text-accent-light">
              Verified by Ministry of Health Nepal
            </span>
          </div>
          <h1 className="font-heading font-bold text-6xl text-primary leading-tight max-w-3xl">
            Your Health Records,<br />
            <span className="text-accent">Secured & Unified.</span>
          </h1>
          <p className="font-body text-body text-xl leading-relaxed max-w-2xl">
            MeroHealth is Nepal&apos;s national digital health record platform. Access your verified medical history across all hospitals — anytime, anywhere.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/register/patient"
              className="bg-primary text-white font-heading font-bold text-base px-8 py-4 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
            >
              Create Health ID →
            </Link>
            <Link
              href="/login"
              className="border border-border-strong text-primary font-heading font-semibold text-base px-8 py-4 rounded-lg hover:border-primary transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-bg-dark px-12 py-16">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 text-center">
            {[
              { value: "2M+", label: "Registered Patients" },
              { value: "500+", label: "Verified Hospitals" },
              { value: "99.9%", label: "Uptime Guaranteed" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2">
                <p className="font-heading font-bold text-5xl text-mint-bright">{stat.value}</p>
                <p className="font-body text-muted text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-12 py-20 max-w-5xl mx-auto w-full">
          <h2 className="font-heading font-bold text-4xl text-primary text-center mb-12">
            Built for Nepal&apos;s Healthcare System
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: "🔒",
                title: "Government Verified",
                desc: "Every patient and hospital is verified by the Ministry of Health before access is granted.",
                bg: "bg-soft-blue",
              },
              {
                icon: "📋",
                title: "Unified Records",
                desc: "Your reports from every hospital in one place. No more carrying physical files.",
                bg: "bg-[rgba(139,241,230,0.3)]",
              },
              {
                icon: "🏥",
                title: "Hospital Portal",
                desc: "Hospitals can securely create and manage patient reports with strict access controls.",
                bg: "bg-soft-red",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white border border-border rounded-xl p-8 shadow-sm flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center text-2xl`}>
                  {feature.icon}
                </div>
                <h3 className="font-heading font-bold text-xl text-primary">{feature.title}</h3>
                <p className="font-body text-body text-base leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary px-12 py-20 flex flex-col items-center gap-8 text-center">
          <h2 className="font-heading font-bold text-4xl text-white max-w-2xl">
            Ready to take control of your health records?
          </h2>
          <div className="flex items-center gap-4">
            <Link
              href="/register/patient"
              className="bg-mint text-primary font-heading font-bold text-base px-8 py-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              Register as Patient
            </Link>
            <Link
              href="/register/hospital"
              className="border border-white text-white font-heading font-semibold text-base px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors"
            >
              Register as Hospital
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#e0e3e5] border-t border-border-strong px-12 py-8 flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-sm text-primary">MeroHealth</p>
          <p className="font-body text-body text-base">© 2024 MeroHealth. Verified by Ministry of Health Nepal.</p>
        </div>
        <div className="flex gap-6">
          <Link href="#" className="font-heading font-semibold text-sm text-body hover:text-primary">Privacy Policy</Link>
          <Link href="#" className="font-heading font-semibold text-sm text-body hover:text-primary">Terms of Service</Link>
          <Link href="#" className="font-heading font-semibold text-sm text.body hover:text-primary">Legal Notice</Link>
        </div>
      </footer>
    </div>
  );
}