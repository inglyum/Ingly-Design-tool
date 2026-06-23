"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

const NAV = [
  { section: "Principale", items: [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "KPI Live", href: "/kpi", icon: "⚡" },
  ]},
  { section: "Vendite", items: [
    { label: "Ordini", href: "/orders", icon: "📦" },
    { label: "Fatture", href: "/sales", icon: "🧾" },
    { label: "Preventivi", href: "/quotes", icon: "📋" },
    { label: "Cashflow", href: "/cashflow", icon: "💰" },
  ]},
  { section: "Clienti & Prodotti", items: [
    { label: "Clienti", href: "/clients", icon: "👥" },
    { label: "Catalogo", href: "/products", icon: "🛍️" },
  ]},
  { section: "Analisi", items: [
    { label: "Analytics", href: "/analytics", icon: "📈" },
    { label: "Impostazioni", href: "/settings", icon: "⚙️" },
  ]},
];

export default function Sidebar({ user }: { user?: { fullName: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 flex flex-col z-20 overflow-y-auto">
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">IO</div>
          <div>
            <p className="text-sm font-bold text-gray-900">INGLY OS</p>
            <p className="text-xs text-gray-400 truncate max-w-[120px]">{user?.fullName || "Utente"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-4">
        {NAV.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">{section.section}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`sidebar-link ${active ? "active" : ""}`}>
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-700 hover:bg-red-50">
          <span>🚪</span>
          <span>Esci</span>
        </button>
      </div>
    </aside>
  );
}
