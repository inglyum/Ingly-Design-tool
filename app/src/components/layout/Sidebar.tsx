"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useState } from "react";

const NAV = [
  { section: "Principale", items: [
    { label: "Dashboard ROI", href: "/dashboard", icon: "📊" },
    { label: "KPI Live", href: "/kpi", icon: "⚡" },
    { label: "Analytics", href: "/analytics", icon: "📈" },
  ]},
  { section: "Pipeline", items: [
    { label: "Smart Quoter", href: "/quoter", icon: "🧮" },
    { label: "Ordini & Workflow", href: "/orders", icon: "🔄" },
    { label: "Vendite & Fatture", href: "/sales", icon: "💰" },
  ]},
  { section: "Finanza", items: [
    { label: "Cashflow", href: "/cashflow", icon: "💸" },
    { label: "Finance Pro", href: "/finance", icon: "📊" },
    { label: "Costi Fissi", href: "/fixed-costs", icon: "🧾" },
  ]},
  { section: "CRM & Magazzino", items: [
    { label: "CRM Clienti", href: "/clients", icon: "👥" },
    { label: "Catalogo", href: "/products", icon: "🛍️" },
    { label: "Materiali", href: "/materials", icon: "🪵" },
    { label: "Fornitori", href: "/suppliers", icon: "🏭" },
  ]},
  { section: "Impostazioni", items: [
    { label: "Impostazioni", href: "/settings", icon: "⚙️" },
  ]},
];

export default function Sidebar({ user }: { user?: { fullName: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, bottom: 0,
      width: collapsed ? 56 : 220,
      background: "#0a0f1a",
      borderRight: "1px solid #1e293b",
      display: "flex", flexDirection: "column",
      zIndex: 20, overflowY: "auto", overflowX: "hidden",
      transition: "width 0.2s ease",
    }}>
      {/* Logo */}
      <div style={{ padding: "16px 12px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#6366f1,#818cf8)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>IO</div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>INGLY OS</p>
            <p style={{ fontSize: 10, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{user?.fullName || "Utente"}</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
        {NAV.map((section) => (
          <div key={section.section} style={{ marginBottom: 4 }}>
            {!collapsed && (
              <p style={{ fontSize: 9, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 1, padding: "8px 8px 4px", margin: 0 }}>{section.section}</p>
            )}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link href={item.href} title={item.label} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: collapsed ? "8px 12px" : "7px 10px",
                      borderRadius: 7, textDecoration: "none",
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      color: active ? "#818cf8" : "#94a3b8",
                      background: active ? "#6366f115" : "transparent",
                      borderLeft: active ? "2px solid #6366f1" : "2px solid transparent",
                      transition: "all 0.15s",
                      marginBottom: 1,
                      justifyContent: collapsed ? "center" : "flex-start",
                    }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                      {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div style={{ padding: "8px", borderTop: "1px solid #1e293b" }}>
        <button onClick={handleLogout} title="Esci" style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: collapsed ? "8px 12px" : "7px 10px",
          borderRadius: 7, border: "none", background: "transparent",
          color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600,
          width: "100%", justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <span style={{ fontSize: 14 }}>🚪</span>
          {!collapsed && <span>Esci</span>}
        </button>
      </div>
    </aside>
  );
}
