"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const NAV_SECTIONS = [
  {
    title: "Dashboard",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "📊" },
      { id: "kpi", label: "KPI Live", href: "/kpi", icon: "⚡" },
    ],
  },
  {
    title: "Vendite",
    items: [
      { id: "orders", label: "Ordini", href: "/orders", icon: "📦" },
      { id: "sales", label: "Fatture", href: "/sales", icon: "🧾" },
      { id: "quotes", label: "Preventivi", href: "/quotes", icon: "📋" },
      { id: "cashflow", label: "Cashflow", href: "/cashflow", icon: "💰" },
    ],
  },
  {
    title: "Clienti & CRM",
    items: [
      { id: "clients", label: "Clienti", href: "/clients", icon: "👥" },
    ],
  },
  {
    title: "Prodotti",
    items: [
      { id: "products", label: "Catalogo", href: "/products", icon: "🛍️" },
      { id: "inventory", label: "Inventario", href: "/inventory", icon: "📦" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { id: "analytics", label: "Analytics", href: "/analytics", icon: "📈" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { id: "settings", label: "Impostazioni", href: "/settings", icon: "⚙️" },
    ],
  },
];

export default function Sidebar({
  companyName,
  planName,
}: {
  companyName?: string;
  planName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-200 flex flex-col z-20 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            IO
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">INGLY OS</p>
            <p className="text-xs text-gray-400">{companyName || "Azienda"}</p>
          </div>
        </div>
        {planName && (
          <span className="mt-2 inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            Piano {planName}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === `/${item.id}` || pathname.startsWith(`/${item.id}/`);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`sidebar-link ${active ? "active" : ""}`}
                    >
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

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <Link href="/admin" className="sidebar-link text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 mb-1">
          <span>🛡️</span>
          <span>Admin Panel</span>
        </Link>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
