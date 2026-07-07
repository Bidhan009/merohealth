"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "HOSPITAL") router.replace("/dashboard/hospital");
    else if (role === "PATIENT") router.replace("/dashboard/patient");
    else router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-body">
      <p className="text-body">Redirecting...</p>
    </div>
  );
}