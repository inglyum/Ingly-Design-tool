"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";
import { startAutoSync } from "@/lib/sync";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const user = getUser();

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }
    setReady(true);
    setOnline(navigator.onLine);

    const stop = startAutoSync();
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { stop(); window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  if (!ready) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#060d1a" }}>
      <Sidebar user={user ?? undefined} />
      <div style={{ marginLeft: 220, transition: "margin-left 0.2s" }}>
        {/* Topbar */}
        <header style={{ position: "sticky", top: 0, zIndex: 10, background: "#0a0f1a", borderBottom: "1px solid #1e293b", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
          {!online && (
            <span style={{ fontSize: 11, background: "#f59e0b20", color: "#f59e0b", padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>⚠️ Offline</span>
          )}
          {online && (
            <span style={{ fontSize: 11, background: "#22c55e20", color: "#22c55e", padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>● Online</span>
          )}
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#6366f1,#818cf8)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800 }}>
            {user?.fullName?.[0]?.toUpperCase() || "U"}
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
