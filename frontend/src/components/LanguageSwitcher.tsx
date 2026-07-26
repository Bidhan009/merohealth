"use client";

import { useLanguage } from "@/i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center border border-border-strong rounded-lg overflow-hidden shrink-0">
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-label="Switch to English"
        aria-pressed={lang === "en"}
        className={`font-heading font-semibold text-xs px-2.5 py-1.5 transition-colors ${
          lang === "en" ? "bg-primary text-white" : "text-body hover:bg-border"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ne")}
        aria-label="Switch to Nepali"
        aria-pressed={lang === "ne"}
        className={`font-heading font-semibold text-xs px-2.5 py-1.5 transition-colors ${
          lang === "ne" ? "bg-primary text-white" : "text-body hover:bg-border"
        }`}
      >
        नेपाली
      </button>
    </div>
  );
}
