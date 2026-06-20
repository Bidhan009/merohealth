"use client";

import { useEffect, useState } from "react";
export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>("Loading...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.message))
      .catch(() => setHealthStatus("Failed to connect to backend"));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">MeroHealth</h1>
      <p className="ml-4">{healthStatus}</p>
    </main>
  );
}