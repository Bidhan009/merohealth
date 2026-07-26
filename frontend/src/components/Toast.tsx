"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  leaving?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const TOAST_STYLES = {
  success: {
    accent: "bg-accent",
    icon: "✓",
    iconBg: "bg-[rgba(139,241,230,0.25)]",
    iconText: "text-accent",
    title: "Success",
  },
  error: {
    accent: "bg-danger",
    icon: "✕",
    iconBg: "bg-[rgba(211,47,47,0.12)]",
    iconText: "text-danger",
    title: "Something went wrong",
  },
  info: {
    accent: "bg-[#7b92c0]",
    icon: "ℹ",
    iconBg: "bg-soft-blue",
    iconText: "text-primary",
    title: "Notice",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  function dismissEarly(id: number) {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type];
          return (
            <div
              key={toast.id}
              onMouseEnter={() => dismissEarly(toast.id)}
              className={`pointer-events-auto relative flex items-start gap-3 bg-white border border-border rounded-xl shadow-lg overflow-hidden min-w-[320px] max-w-sm ${toast.leaving ? "animate-toast-out" : "animate-toast-in"}`}
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.accent}`} />

              <div className="flex items-start gap-3 pl-5 pr-4 py-4 w-full">
                {/* Icon badge */}
                <div className={`w-8 h-8 rounded-lg ${style.iconBg} ${style.iconText} flex items-center justify-center text-sm font-bold shrink-0 mt-0.5`}>
                  {style.icon}
                </div>

                {/* Text */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <p className="font-heading font-bold text-sm text-primary">
                    {style.title}
                  </p>
                  <p className="font-body text-body text-sm leading-relaxed break-words">
                    {toast.message}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={() => dismissEarly(toast.id)}
                  className="text-muted hover:text-primary transition-colors text-lg leading-none shrink-0 -mt-1"
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>

              {/* Progress bar showing auto-dismiss countdown */}
              <div className={`absolute bottom-0 left-0 h-0.5 ${style.accent} animate-toast-progress`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
