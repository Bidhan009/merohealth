import Link from "next/link";

export default function AboutPage() {
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

      <main className="flex-1 flex flex-col">

        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-12 py-20 gap-6">
          <h1 className="font-heading font-bold text-5xl text-primary leading-tight max-w-3xl">
            About MeroHealth
          </h1>
          <p className="font-body text-body text-xl leading-relaxed max-w-2xl">
            MeroHealth is Nepal&apos;s national digital health record platform, built so
            patients can access their verified medical history across every hospital
            they visit — anytime, anywhere.
          </p>
        </section>

        {/* Our Mission */}
        <section className="px-12 pb-16 max-w-5xl mx-auto w-full">
          <div className="bg-white border border-border rounded-xl p-10 shadow-sm flex flex-col gap-4">
            <h2 className="font-heading font-bold text-3xl text-primary">Our Mission</h2>
            <p className="font-body text-body text-base leading-relaxed max-w-3xl">
              Nepal&apos;s healthcare system has long relied on fragmented, paper-based
              medical records scattered across hospitals and clinics. MeroHealth
              unifies these records into a single, secure digital platform — giving
              every patient true ownership of their own health data, instead of
              leaving it locked away in filing cabinets.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-12 pb-20 max-w-5xl mx-auto w-full">
          <h2 className="font-heading font-bold text-4xl text-primary text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: "🪪",
                title: "Register & Get Verified",
                desc: "Patients register with their Citizen ID and are verified by the Ministry of Health before their account is activated.",
                bg: "bg-soft-blue",
              },
              {
                icon: "🏥",
                title: "Hospitals Link & Report",
                desc: "Verified hospitals link a patient's account and add medical reports directly to their unified health record.",
                bg: "bg-[rgba(139,241,230,0.3)]",
              },
              {
                icon: "📖",
                title: "One Complete History",
                desc: "Patients view their complete medical history in one place — read-only and tamper-proof, across every hospital.",
                bg: "bg-soft-red",
              },
            ].map((step) => (
              <div key={step.title} className="bg-white border border-border rounded-xl p-8 shadow-sm flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center text-2xl`}>
                  {step.icon}
                </div>
                <h3 className="font-heading font-bold text-xl text-primary">{step.title}</h3>
                <p className="font-body text-body text-base leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="px-12 pb-16 max-w-5xl mx-auto w-full">
          <div className="bg-white border border-border rounded-xl p-10 shadow-sm flex flex-col gap-4">
            <h2 className="font-heading font-bold text-3xl text-primary">Privacy &amp; Security</h2>
            <p className="font-body text-body text-base leading-relaxed max-w-3xl">
              Every password is hashed with bcrypt before storage, and access to the
              platform is protected by JWT authentication. Strict role-based access
              control ensures patients, hospitals, and administrators can only see
              and do what their role permits — hospitals, for example, can only edit
              reports they themselves created. All access is audit logged, so every
              action on a patient&apos;s record can be traced.
            </p>
          </div>
        </section>

        {/* Built For Everyone */}
        <section className="px-12 pb-24 max-w-5xl mx-auto w-full">
          <div className="bg-white border border-border rounded-xl p-10 shadow-sm flex flex-col gap-4">
            <h2 className="font-heading font-bold text-3xl text-primary">Built For Everyone</h2>
            <p className="font-body text-body text-base leading-relaxed max-w-3xl">
              MeroHealth is set in Atkinson Hyperlegible, a typeface designed by the
              Braille Institute specifically to improve legibility for readers with
              low vision. Combined with clear layouts and plain language, the
              platform is designed to be usable by patients of all ages and levels
              of technical ability.
            </p>
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
          <Link href="#" className="font-heading font-semibold text-sm text-body hover:text-primary">Legal Notice</Link>
        </div>
      </footer>
    </div>
  );
}
