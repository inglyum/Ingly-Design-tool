"use client";
import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { fmtEur } from "@/lib/format";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

export default function AnalyticsPage() {
  const [dash, setDash] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.dashboard(), analyticsApi.forecast()])
      .then(([d, f]) => { setDash(d); setForecast(f); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4 animate-pulse">{[...Array(4)].map((_,i)=><div key={i} className="h-48 skeleton rounded-xl"/>)}</div>;

  const ordersByStatus = (dash?.ordersByStatus || []).map((s: any) => ({
    name: s.status, value: s._count.id
  }));

  const clientsByType = (dash?.clientsByType || []).map((c: any) => ({
    name: c.type?.toUpperCase(), value: c._count.id
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className={`badge ${forecast?.trend === "crescita" ? "bg-green-100 text-green-700" : forecast?.trend === "calo" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
          Trend: {forecast?.trend || "—"} {forecast?.trendValue > 0 ? "📈" : "📉"}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div className="card-header"><h3 className="font-semibold">Revenue mensile (ultimi 12 mesi)</h3></div>
        <div className="card-body pt-2">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dash?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmtEur(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast */}
      {forecast?.forecast && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">🔮 Previsioni AI prossimi 3 mesi</h3>
            <p className="text-xs text-gray-400 mt-0.5">Basato su regressione lineare dati storici</p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-3 gap-4">
              {forecast.forecast.map((f: any, i: number) => (
                <div key={i} className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">{f.month}</p>
                  <p className="text-xl font-bold text-gray-900">{fmtEur(f.predicted)}</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-green-600">Ottimista</span>
                      <span className="font-medium">{fmtEur(f.optimistic)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-500">Conservativo</span>
                      <span className="font-medium">{fmtEur(f.conservative)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by status */}
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-sm">Ordini per stato</h3></div>
          <div className="card-body flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {ordersByStatus.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clients by type */}
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-sm">Clienti per tipo</h3></div>
          <div className="card-body flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={clientsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  {clientsByType.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients */}
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-sm">Top 5 Clienti</h3></div>
          <div className="card-body p-0">
            {(dash?.topClients || []).map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {c.companyName || `${c.firstName || ""} ${c.lastName || ""}`.trim()}
                  </p>
                  <p className="text-xs text-gray-400">{c.ordersCount} ordini</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{fmtEur(c.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
