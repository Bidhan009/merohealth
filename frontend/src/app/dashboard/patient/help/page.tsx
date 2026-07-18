"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken} from "@/utils/auth";
import PatientLayout from "@/components/PatientLayout";

const FAQ = [
  {
    question: "How do I view my medical reports?",
    answer: "Go to 'My Records' from the sidebar or dashboard. All your reports from every linked hospital will appear there in chronological order.",
  },
  {
    question: "Can I edit or delete my medical reports?",
    answer: "No. Patients cannot create, edit, or delete reports. Only verified hospitals can manage your medical records. This ensures the integrity and authenticity of your health data.",
  },
  {
    question: "Why can't I see any reports yet?",
    answer: "Reports appear once a hospital has linked your account and added records. Visit your registered hospital and ask them to link your MeroHealth account if you don't see any reports.",
  },
  {
    question: "What is a Minor Account?",
    answer: "If you registered under the age of 16, your account is classified as a Minor Account. A unique Minor ID (starting with MINOR-) is generated instead of a Citizen ID.",
  },
  {
    question: "How do I change my password?",
    answer: "Go to Settings from the sidebar and scroll to the 'Change Password' section. You'll need your current password to set a new one.",
  },
  {
    question: "Which hospitals can see my records?",
    answer: "Only hospitals that have formally linked your account can view your records. Each hospital can only see all reports but can only edit their own reports.",
  },
  {
    question: "How do I download my medical reports?",
    answer: "Click 'View File →' next to any report that has an attached file. This opens the file in a new tab where you can download it.",
  },
  {
    question: "What is the Emergency ID?",
    answer: "The Emergency ID card shows your critical health information (name, blood type, allergies) to emergency responders without requiring login. It's accessible via the red Emergency ID button.",
  },
  {
    question: "How long does account verification take?",
    answer: "Account verification by the Ministry of Health typically takes 1–2 business days. You'll receive an email once your account is approved or rejected.",
  },
  {
    question: "Is my health data secure?",
    answer: "Yes. All data is encrypted end-to-end and stored on government-grade secure servers. Access is logged and audited by the Department of Health.",
  },
];

const CATEGORIES = [
  { icon: "🚀", label: "Getting Started", desc: "Registration and setup" },
  { icon: "📋", label: "Viewing Records", desc: "Access your health data" },
  { icon: "🔒", label: "Privacy & Security", desc: "Data protection info" },
  { icon: "👤", label: "Account", desc: "Profile and password" },
  { icon: "🏥", label: "Hospitals", desc: "Hospital access and linking" },
  { icon: "🆘", label: "Emergency", desc: "Emergency ID features" },
];
interface PatientInfo {
  fullName: string;
  citizenId: string;
  isMinor: boolean;
  dateOfBirth: string;
  user: { email: string };
}

export default function PatientHelpPage() {
  const router = useRouter();
  const token = getToken();
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [patientName, setPatientName] = useState("");
  const [citizenId, setCitizenId] = useState("");

  useEffect(() => {
  if (!token) { router.replace("/login"); return; }
  const load = async () => {
    const res = await fetch("http://localhost:5000/api/patient/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setPatientName(data.patient.fullName);
      setCitizenId(data.patient.citizenId);
    }
  };
  load();
}, []);

  const filteredFaq = FAQ.filter(
    (f) =>
      search.trim() === "" ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <PatientLayout patientName={patientName} citizenId={citizenId}>
        {/* Main */}
        <main className="flex-1 p-6 flex flex-col gap-8">

          {/* Hero */}
          <div className="bg-primary rounded-xl p-10 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-mint opacity-10 blur-2xl" />
            <h1 className="font-heading font-bold text-4xl text-white">
              Patient Help Center
            </h1>
            <p className="font-body text-white opacity-80 text-base max-w-xl">
              Find answers about viewing your health records, account security, and using MeroHealth as a patient.
            </p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help topics..."
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
                <p className="font-body text-muted text-base">
                  No results found for "{search}"
                </p>
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
      </PatientLayout>
  );
}