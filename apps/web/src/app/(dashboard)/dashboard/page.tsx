"use client";
import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { fmtEur, statusLabel, statusColor, isOverdue } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
        <div className="h-64 skeleton rounded-xl" />
      </div>
    );
  }

  const kpi = data?.kpi || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => dashboardApi.get().then(setData)}
          className="btn-secondary btn-sm"
        >
          🔄 Aggiorna
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Revenue Mese"
          value={fmtEur(kpi.revenueThisMonth)}
          delta={kpi.revDelta !== undefined ? `${kpi.revDelta >= 0 ? "+" : ""}${kpi.revDelta}% vs mese scorso` : undefined}
          positive={kpi.revDelta >= 0}
          icon="💰"
          color="blue"
        />
        <KpiCard
          label="Profitto"
          value={fmtEur(kpi.profitThisMonth)}
          delta={kpi.marginThisMonth !== undefined ? `Margine ${kpi.marginThisMonth}%` : undefined}
          positive={kpi.marginThisMonth >= 20}
          icon="📈"
          color="green"
        />
        <KpiCard
          label="Ordini Attivi"
          value={String(kpi.ordersActive ?? 0)}
          delta={kpi.ordersOverdue > 0 ? `⚠️ ${kpi.ordersOverdue} in ritardo` : "✅ Nessun ritardo"}
          positive={kpi.ordersOverdue === 0}
          icon="📦"
          color={kpi.ordersOverdue > 0 ? "red" : "blue"}
        />
        <KpiCard
          label="Da Incassare"
          value={fmtEur(kpi.unpaidAmount)}
          delta={`${kpi.unpaidCount} fatture aperte`}
          positive={kpi.unpaidCount === 0}
          icon="🧾"
          color="orange"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{kpi.clientsTotal ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Clienti totali</p>
          {kpi.clientsNew > 0 && <p className="text-xs text-green-600 mt-0.5">+{kpi.clientsNew} questo mese</p>}
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{fmtEur(kpi.expensesThisMonth)}</p>
          <p className="text-sm text-gray-500 mt-1">Uscite mese</p>
        </div>
        <div className="card p-4 text-center">
          <p className={`text-3xl font-bold ${kpi.marginThisMonth >= 20 ? "text-green-600" : "text-red-500"}`}>
            {kpi.marginThisMonth ?? 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Margine</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Revenue ultimi 6 mesi</h3>
          </div>
          <div className="card-body pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.revenueChart || []}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtEur(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Ordini recenti</h3>
            <a href="/orders" className="text-xs text-blue-600 hover:underline">Vedi tutti →</a>
          </div>
          <div className="overflow-hidden">
            {(data?.recentOrders || []).length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">Nessun ordine</div>
            ) : (
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-50">
                  {(data?.recentOrders || []).map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            isOverdue(order.dueDate) && !["completato","delivered"].includes(order.status)
                              ? "bg-red-500" : "bg-green-500"
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{order.clientName || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusColor(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-right">
                        {fmtEur(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {kpi.ordersOverdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800">
              {kpi.ordersOverdue} {kpi.ordersOverdue === 1 ? "ordine in ritardo" : "ordini in ritardo"}
            </p>
            <p className="text-sm text-red-600">
              Controlla il <a href="/orders" className="underline font-medium">kanban ordini</a> e aggiorna i clienti.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label, value, delta, positive, icon, color
}: {
  label: string; value: string; delta?: string; positive?: boolean; icon: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {delta && (
            <p className={`text-xs mt-1 ${positive ? "text-green-600" : "text-red-500"}`}>{delta}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colorMap[color || "blue"]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
