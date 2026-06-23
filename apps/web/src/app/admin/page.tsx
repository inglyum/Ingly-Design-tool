"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { fmtEur } from "@/lib/format";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"dashboard"|"tenants"|"licenses"|"audit">("dashboard");

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.isAdmin && user?.role !== "superadmin" && user?.role !== "admin") {
      alert("Accesso riservato agli amministratori.");
      router.push("/dashboard");
      return;
    }
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [s, t] = await Promise.all([
        api.get<any>("/api/admin/stats"),
        api.get<any>("/api/admin/tenants"),
      ]);
      setStats(s);
      setTenants(t.data || []);
    } catch (e: any) {
      if (e.statusCode === 403 || e.statusCode === 401) {
        alert("Accesso non autorizzato");
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  async function changeTenantStatus(id: string, status: string) {
    await api.patch(`/api/admin/tenants/${id}/status`, { status });
    await loadAll();
  }

  async function forceLogout(userId: string) {
    await api.post(`/api/admin/users/${userId}/force-logout`);
    alert("Logout forzato eseguito.");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Caricamento Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">A</div>
          <div>
            <span className="font-bold text-white">INGLY OS</span>
            <span className="ml-2 text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full">Super Admin</span>
          </div>
        </div>
        <button className="text-sm text-gray-400 hover:text-white" onClick={() => router.push("/dashboard")}>
          ← Torna all'App
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-gray-900 border-r border-gray-800 min-h-screen p-4 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "tenants", label: "Tenant", icon: "🏢" },
            { id: "licenses", label: "Licenze", icon: "🔑" },
            { id: "audit", label: "Audit Log", icon: "📋" },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${tab === item.id ? "bg-purple-700 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
              onClick={() => setTab(item.id as any)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          {tab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Dashboard Admin</h2>

              {/* KPI */}
              <div className="grid grid-cols-4 gap-4">
                <AdminKpi label="Tenant Totali" value={stats?.tenants?.total || 0} icon="🏢" color="blue" />
                <AdminKpi label="Tenant Attivi" value={stats?.tenants?.active || 0} icon="✅" color="green" />
                <AdminKpi label="In Trial" value={stats?.tenants?.trial || 0} icon="⏳" color="yellow" />
                <AdminKpi label="MRR" value={fmtEur(stats?.mrr || 0)} icon="💰" color="purple" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <AdminKpi label="Utenti Totali" value={stats?.usersTotal || 0} icon="👥" color="blue" />
                <AdminKpi label="Abbonamenti Attivi" value={stats?.subscriptionsActive || 0} icon="📄" color="green" />
                <AdminKpi label="Sospesi" value={stats?.tenants?.suspended || 0} icon="⛔" color="red" />
              </div>
            </div>
          )}

          {tab === "tenants" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Gestione Tenant ({tenants.length})</h2>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-900">
                      {["Azienda","Email","Piano","Status","Utenti","Azioni"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {tenants.map((t: any) => {
                      const plan = t.subscriptions?.[0]?.plan;
                      return (
                        <tr key={t.id} className="hover:bg-gray-900/50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-white">{t.companyName}</p>
                            <p className="text-xs text-gray-500">{t.slug}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{t.email}</td>
                          <td className="px-4 py-3">
                            {plan ? (
                              <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full font-medium">
                                {plan.name}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              t.status === "active" ? "bg-green-900 text-green-400" :
                              t.status === "trial" ? "bg-blue-900 text-blue-400" :
                              t.status === "suspended" ? "bg-red-900 text-red-400" :
                              "bg-gray-800 text-gray-400"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{t._count?.users || 0}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {t.status !== "suspended" ? (
                                <button
                                  className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-2 py-1 rounded"
                                  onClick={() => changeTenantStatus(t.id, "suspended")}
                                >
                                  Sospendi
                                </button>
                              ) : (
                                <button
                                  className="text-xs bg-green-900 hover:bg-green-800 text-green-300 px-2 py-1 rounded"
                                  onClick={() => changeTenantStatus(t.id, "active")}
                                >
                                  Attiva
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "licenses" && <LicensesTab />}
          {tab === "audit" && <AuditTab />}
        </main>
      </div>
    </div>
  );
}

function LicensesTab() {
  const [licenses, setLicenses] = useState<any[]>([]);
  useEffect(() => {
    api.get<any>("/api/admin/licenses").then((r) => setLicenses(Array.isArray(r) ? r : []));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Gestione Licenze ({licenses.length})</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-900">
              {["Tenant","License Key","Status","Devices","Scadenza","Azioni"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {licenses.map((l: any) => (
              <tr key={l.id} className="hover:bg-gray-900/50">
                <td className="px-4 py-3 text-sm text-white">{l.tenant?.companyName || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-purple-400">{l.licenseKey}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === "active" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{l.devices?.length || 0}/{l.maxDevices}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {l.validUntil ? new Date(l.validUntil).toLocaleDateString("it-IT") : "Nessuna"}
                </td>
                <td className="px-4 py-3">
                  {l.status === "active" && (
                    <button
                      className="text-xs bg-red-900 text-red-300 hover:bg-red-800 px-2 py-1 rounded"
                      onClick={async () => {
                        await api.post(`/api/admin/licenses/${l.id}/revoke`);
                        window.location.reload();
                      }}
                    >
                      Revoca
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {licenses.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nessuna licenza</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    api.get<any>("/api/admin/audit-logs").then((r) => setLogs(Array.isArray(r) ? r : []));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Audit Log Admin</h2>
      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">Nessuna azione registrata</p>
        ) : logs.map((l: any) => (
          <div key={l.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-4">
            <div className="w-8 h-8 bg-purple-900 rounded-full flex items-center justify-center text-xs font-bold text-purple-300">
              {l.admin?.fullName?.[0] || "?"}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">
                <span className="font-semibold">{l.admin?.fullName || "Admin"}</span>
                {" · "}<span className="text-purple-400 font-mono">{l.action}</span>
                {l.entityType && <span className="text-gray-500"> on {l.entityType}</span>}
              </p>
              <p className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleString("it-IT")} · {l.ipAddress || "IP sconosciuto"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminKpi({ label, value, icon, color }: { label: string; value: any; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-900/30 text-blue-400",
    green: "bg-green-900/30 text-green-400",
    yellow: "bg-yellow-900/30 text-yellow-400",
    purple: "bg-purple-900/30 text-purple-400",
    red: "bg-red-900/30 text-red-400",
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
