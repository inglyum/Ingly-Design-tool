"use client";
import { useEffect, useState } from "react";
import { getDB } from "@/lib/db";
import { fmtEur, fmtDate, statusLabel, statusBadge, isOverdue, priorityEmoji } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, prevRevenue: 0, expenses: 0, profit: 0, margin: 0, activeOrders: 0, overdueOrders: 0, unpaid: 0, clients: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chart, setChart] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const db = getDB();
    const [orders, sales, cashflows, clients] = await Promise.all([
      db.orders.filter((o) => !o._deleted).toArray(),
      db.sales.filter((s) => !s._deleted).toArray(),
      db.cashflows.filter((c) => !c._deleted).toArray(),
      db.clients.filter((c) => !c._deleted).toArray(),
    ]);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const paidThisMonth = sales.filter((s) => s.status === "pagato" && new Date(s.paidAt || s.createdAt) >= thisMonthStart);
    const paidLastMonth = sales.filter((s) => s.status === "pagato" && new Date(s.paidAt || s.createdAt) >= lastMonthStart && new Date(s.paidAt || s.createdAt) < thisMonthStart);
    const revenue = paidThisMonth.reduce((s, x) => s + x.totalAmount, 0);
    const prevRevenue = paidLastMonth.reduce((s, x) => s + x.totalAmount, 0);
    const expenseThisMonth = cashflows.filter((c) => c.type === "uscita" && new Date(c.date) >= thisMonthStart).reduce((s, x) => s + x.amount, 0);
    const profit = revenue - expenseThisMonth;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    const activeOrders = orders.filter((o) => !["done","delivered","annullato"].includes(o.status)).length;
    const overdueOrders = orders.filter((o) => !["done","delivered","annullato"].includes(o.status) && isOverdue(o.dueDate)).length;
    const unpaid = sales.filter((s) => s.status === "da_pagare").reduce((s, x) => s + x.totalAmount, 0);

    setStats({ revenue, prevRevenue, expenses: expenseThisMonth, profit, margin, activeOrders, overdueOrders, unpaid, clients: clients.length });

    const recent = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    setRecentOrders(recent);

    // Chart last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { month: d.toLocaleString("it-IT", { month: "short" }), start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 1) };
    });
    setChart(months.map(({ month, start, end }) => ({
      month,
      entrate: sales.filter((s) => s.status === "pagato" && new Date(s.paidAt || s.createdAt) >= start && new Date(s.paidAt || s.createdAt) < end).reduce((s, x) => s + x.totalAmount, 0),
    })));
  }

  const delta = stats.prevRevenue > 0 ? Math.round(((stats.revenue - stats.prevRevenue) / stats.prevRevenue) * 100) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {stats.overdueOrders > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <span>⚠️</span>
          <p className="text-sm font-medium text-red-700">{stats.overdueOrders} ordine/i scaduto/i — richiede attenzione</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Revenue Mese" value={fmtEur(stats.revenue)} delta={delta} icon="💰" />
        <Kpi label="Profitto" value={fmtEur(stats.profit)} icon="📈" />
        <Kpi label="Ordini Attivi" value={stats.activeOrders} icon="📦" />
        <Kpi label="Da Incassare" value={fmtEur(stats.unpaid)} icon="🧾" warn={stats.unpaid > 0} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Kpi label="Margine %" value={`${stats.margin}%`} icon="🎯" />
        <Kpi label="Uscite Mese" value={fmtEur(stats.expenses)} icon="📤" />
        <Kpi label="Clienti" value={stats.clients} icon="👥" />
      </div>

      <div className="card">
        <div className="card-body">
          <p className="text-sm font-semibold text-gray-700 mb-4">Revenue ultimi 6 mesi</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chart}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
              <Tooltip formatter={(v: any) => fmtEur(v)} />
              <Area type="monotone" dataKey="entrate" stroke="#2563eb" fill="#eff6ff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <p className="text-sm font-semibold text-gray-700 mb-3">Ordini recenti</p>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{priorityEmoji(o.priority)} {o.clientName}</p>
                  <p className="text-xs text-gray-400">{o.orderNumber} · {fmtDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${statusBadge[o.status] || "bg-gray-100 text-gray-600"}`}>{statusLabel[o.status] || o.status}</span>
                  <span className="text-sm font-semibold text-gray-900">{fmtEur(o.totalAmount)}</span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nessun ordine</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, icon, warn }: { label: string; value: any; delta?: number | null; icon: string; warn?: boolean }) {
  return (
    <div className={`card card-body ${warn ? "border-amber-200 bg-amber-50" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="kpi-label">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="kpi-val">{value}</p>
      {delta !== null && delta !== undefined && (
        <p className={delta >= 0 ? "kpi-delta-pos" : "kpi-delta-neg"}>{delta >= 0 ? "+" : ""}{delta}% vs mese scorso</p>
      )}
    </div>
  );
}
