"use client";
import { useEffect, useState } from "react";
import { getDB } from "@/lib/db";
import { fmtEur } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#8b5cf6"];

export default function AnalyticsPage() {
  const [monthly, setMonthly] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const db = getDB();
    const [sales, orders, clients] = await Promise.all([
      db.sales.filter((s) => !s._deleted).toArray(),
      db.orders.filter((o) => !o._deleted).toArray(),
      db.clients.filter((c) => !c._deleted).toArray(),
    ]);

    const now = new Date();
    // Monthly revenue 12 months
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const revenue = sales.filter((s) => s.status === "pagato" && new Date(s.paidAt || s.createdAt) >= d && new Date(s.paidAt || s.createdAt) < end).reduce((sum, x) => sum + x.totalAmount, 0);
      return { month: d.toLocaleString("it-IT", { month: "short" }), revenue };
    });
    setMonthly(months);

    // Orders by status
    const statusGroups: Record<string, number> = {};
    orders.forEach((o) => { statusGroups[o.status] = (statusGroups[o.status] || 0) + 1; });
    setOrdersByStatus(Object.entries(statusGroups).map(([name, value]) => ({ name, value })));

    // Top clients
    const clientRevenue: Record<string, { name: string; revenue: number; count: number }> = {};
    sales.filter((s) => s.status === "pagato").forEach((s) => {
      if (!clientRevenue[s.clientName]) clientRevenue[s.clientName] = { name: s.clientName, revenue: 0, count: 0 };
      clientRevenue[s.clientName].revenue += s.totalAmount;
      clientRevenue[s.clientName].count++;
    });
    setTopClients(Object.values(clientRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

    // Simple linear regression forecast
    const last6 = months.slice(-6).map((m, i) => ({ x: i, y: m.revenue }));
    const n = last6.length;
    const sumX = last6.reduce((s, p) => s + p.x, 0);
    const sumY = last6.reduce((s, p) => s + p.y, 0);
    const sumXY = last6.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = last6.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
    const intercept = (sumY - slope * sumX) / n;
    const fc = Array.from({ length: 3 }, (_, i) => {
      const pred = Math.max(0, intercept + slope * (n + i));
      const d = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
      return { month: d.toLocaleString("it-IT", { month: "long" }), previsto: pred, ottimistico: pred * 1.15, conservativo: pred * 0.9 };
    });
    setForecast(fc);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="card card-body">
        <p className="text-sm font-semibold text-gray-700 mb-4">Revenue mensile (12 mesi)</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
            <Tooltip formatter={(v: any) => fmtEur(v)} />
            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Previsione AI prossimi 3 mesi</h2>
        <div className="grid grid-cols-3 gap-4">
          {forecast.map((f) => (
            <div key={f.month} className="card card-body">
              <p className="text-xs font-semibold text-gray-500 uppercase">{f.month}</p>
              <p className="text-xl font-bold text-blue-700 mt-1">{fmtEur(f.previsto)}</p>
              <p className="text-xs text-green-600 mt-0.5">Ottimistico: {fmtEur(f.ottimistico)}</p>
              <p className="text-xs text-amber-600">Conservativo: {fmtEur(f.conservativo)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card card-body">
          <p className="text-sm font-semibold text-gray-700 mb-4">Ordini per stato</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${Math.round(percent*100)}%`} labelLine={false}>
                {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-body">
          <p className="text-sm font-semibold text-gray-700 mb-3">Top 5 clienti</p>
          <div className="space-y-2">
            {topClients.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-5">#{i+1}</span>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{c.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-700">{fmtEur(c.revenue)}</p>
                  <p className="text-xs text-gray-400">{c.count} ordini</p>
                </div>
              </div>
            ))}
            {topClients.length === 0 && <p className="text-gray-400 text-sm">Nessun dato</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
