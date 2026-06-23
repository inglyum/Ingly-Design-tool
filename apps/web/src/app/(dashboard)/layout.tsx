"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getStoredTenant } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    const token = localStorage.getItem("ingly_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const u = getStoredUser();
    const t = getStoredTenant();
    setUser(u);
    setTenant(t);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        companyName={tenant?.companyName}
        planName={tenant?.plan?.name}
      />
      <Topbar title={pageTitle} user={user} />
      <main style={{ marginLeft: "240px", paddingTop: "60px" }}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
