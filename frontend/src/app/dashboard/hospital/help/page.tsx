"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, logout } from "@/utils/auth";

const FAQ = [
  {
    question: "How do I add a new patient to my hospital?",
    answer: "Go to the Dashboard and use the 'Search & Link Patient' section. Enter the patient's Citizen ID to find them, then click 'Link Patient' to add them to your hospital.",
  },
  {
    question: "Can I edit reports from other hospitals?",
    answer: "No. You can only view reports created by other hospitals (marked as 'Read Only'). You can only create and edit reports that belong to your hospital.",
  },
  {
    question: "How do I upload a medical report?",
    answer: "Go to a patient's file page by clicking their name in the Dashboard. Click 'Upload New Report', fill in the title, description, and attach a PDF or image file.",
  },
  {
    question: "What file types are supported for reports?",
    answer: "PDF, JPG, JPEG, and PNG files are supported. Maximum file size is 20MB per upload.",
  },
  {
    question: "How long does hospital verification take?",
    answer: "Hospital accounts are verified by the Ministry of Health. This typically takes 2–5 business days after registration.",
  },
  {
    question: "How do I update my hospital's profile information?",
    answer: "Go to Settings from the sidebar. You can update your hospital name and address. Registration number and email cannot be changed after verification.",
  },
  {
    question: "What is the Emergency ID button for?",
    answer: "The Emergency ID button provides quick access to a patient's critical health information in emergency situations, without requiring full login.",
  },
  {
    question: "How do I search for a specific report?",
    answer: "Use the Search Reports page from the sidebar. You can search by report title, patient name, or citizen ID. You can also filter by 'Your Reports' or 'Other Hospitals'.",
  },
];

const CATEGORIES = [
  { icon: "🚀", label: "Getting Started", desc: "Setup and first steps" },
  { icon: "📋", label: "Managing Reports", desc: "Create, edit, and view reports" },
  { icon: "👥", label: "Patient Management", desc: "Linking and managing patients" },
  { icon: "🔒", label: "Security", desc: "Access control and data protection" },
  { icon: "⚙️", label: "Account Settings", desc: "Profile and preferences" },
  { icon: "🆘", label: "Emergency Features", desc: "Emergency ID and ambulance" },
];

export default function HospitalHelpPage() {
  const router = useRouter();
  const token = getToken();
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const filteredFaq = FAQ.filter(
    (f) =>
      search.trim() === "" ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">

      {/* Header */}
      <header className="bg-bg border-b border-border-strong px-12 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <span className="font-heading font-bold text-2xl text-primary">MeroHealth</span>
          <nav className="flex gap-1">
            {[
              { label: "Home", href: "/dashboard/hospital" },
              { label: "Reports", href: "/dashboard/hospital/reports" },
              { label: "Timeline", href: "/dashboard/hospital/timeline" },
              { label: "Categories", href: "/dashboard/hospital/categories" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-heading font-semibold text-sm px-3 py-1 rounded-lg text-body hover:bg-border transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-danger text-white text-sm font-extrabold tracking-widest px-4 py-2 rounded-lg">
            Emergency ID
          </button>
          <button
            onClick={handleLogout}
            className="border border-border-strong text-body text-sm font-semibold px-4 py-2 rounded-lg hover:border-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-64 bg-[#f2f4f6] border-r border-border-strong flex flex-col gap-2 p-4 min-h-full">
          {[
            { label: "Dashboard", href: "/dashboard/hospital", active: false },
            { label: "Search Reports", href: "/dashboard/hospital/reports", active: false },
            { label: "Timeline", href: "/dashboard/hospital/timeline", active: false },
            { label: "Categories", href: "/dashboard/hospital/categories", active: false },
            { label: "Settings", href: "/dashboard/hospital/settings", active: false },
            { label: "Help Center", href: "/dashboard/hospital/help", active: true },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-heading font-semibold text-sm transition-colors ${
                item.active
                  ? "bg-mint text-accent-light"
                  : "text-body hover:bg-border"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-auto">
            <button className="w-full bg-danger text-white font-heading font-extrabold text-sm tracking-widest py-3 rounded-lg shadow">
              Request Ambulance
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 flex flex-col gap-8">

          {/* Hero */}
          <div className="bg-primary rounded-xl p-10 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-mint opacity-10 blur-2xl" />
            <h1 className="font-heading font-bold text-4xl text-white">
              How can we help?
            </h1>
            <p className="font-body text-white opacity-80 text-base max-w-xl">
              Find answers to common questions about managing patient records and using the MeroHealth hospital portal.
            </p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help topics..."
              className="w-full max-w-xl border-0 rounded-lg px-5 py-3 font-body text-base text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-mint bg-white"
            />
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="bg-white border border-border rounded-xl p-5 shadow-sm flex items-center gap-4 hover:border-accent transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-2xl shrink-0">
                  {cat.icon}
                </div>
                <div>
                  <p className="font-heading font-bold text-base text-primary">{cat.label}</p>
                  <p className="font-body text-muted text-sm">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="bg-white border border-border rounded-xl shadow-sm">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-heading font-semibold text-xl text-primary">
                Frequently Asked Questions
              </h2>
            </div>
            {filteredFaq.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-body text-muted text-base">No results found for "{search}"</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {filteredFaq.map((faq, i) => (
                  <div key={i} className="px-6 py-5">
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      className="w-full flex items-center justify-between text-left gap-4"
                    >
                      <p className="font-heading font-semibold text-base text-primary">
                        {faq.question}
                      </p>
                      <span className="text-muted text-xl shrink-0">
                        {openIndex === i ? "−" : "+"}
                      </span>
                    </button>
                    {openIndex === i && (
                      <p className="font-body text-body text-base leading-relaxed mt-3">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "💬", label: "Live Chat", desc: "Chat with our support team", action: "Start Chat" },
              { icon: "📧", label: "Email Support", desc: "support@merohealth.gov.np", action: "Send Email" },
              { icon: "📞", label: "24/7 Help Desk", desc: "+977-1-XXXXXXX", action: "Call Now" },
            ].map((channel) => (
              <div key={channel.label} className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col gap-3">
                <span className="text-3xl">{channel.icon}</span>
                <div>
                  <p className="font-heading font-bold text-base text-primary">{channel.label}</p>
                  <p className="font-body text-body text-sm">{channel.desc}</p>
                </div>
                <button className="border border-accent text-accent font-heading font-semibold text-sm px-4 py-2 rounded-lg hover:bg-accent hover:text-white transition-colors w-fit">
                  {channel.action}
                </button>
              </div>
            ))}
          </div>

          {/* System Status */}
          <div className="bg-[rgba(139,241,230,0.2)] border border-accent rounded-xl px-6 py-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
            <p className="font-heading font-semibold text-sm text-accent-light">
              All medical systems operational
            </p>
            <span className="font-body text-muted text-sm ml-auto">Last checked: just now</span>
          </div>
        </main>
      </div>

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