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
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user ?? undefined} />
      <div className="ml-56">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            {!online && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                ⚠️ Offline — i dati si sincronizzano al ripristino
              </span>
            )}
            {online && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">● Online</span>
            )}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
