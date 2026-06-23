"use client";
import { useEffect, useState } from "react";
import { getDB } from "@/lib/db";
import { fmtEur, isOverdue } from "@/lib/format";

export default function KpiPage() {
  const [kpis, setKpis] = useState<any>({});

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  async function load() {
    const db = getDB();
    const [orders, sales, cashflows, clients] = await Promise.all([
      db.orders.filter((o) => !o._deleted).toArray(),
      db.sales.filter((s) => !s._deleted).toArray(),
      db.cashflows.filter((c) => !c._deleted).toArray(),
      db.clients.filter((c) => !c._deleted).toArray(),
    ]);
    const now = new Date();
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lmStart = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const revenue = sales.filter((s) => s.status==="pagato" && new Date(s.paidAt||s.createdAt)>=mStart).reduce((s,x)=>s+x.totalAmount,0);
    const prevRevenue = sales.filter((s) => s.status==="pagato" && new Date(s.paidAt||s.createdAt)>=lmStart && new Date(s.paidAt||s.createdAt)<mStart).reduce((s,x)=>s+x.totalAmount,0);
    const expenses = cashflows.filter((c) => c.type==="uscita" && new Date(c.date)>=mStart).reduce((s,x)=>s+x.amount,0);
    const profit = revenue - expenses;
    const margin = revenue > 0 ? Math.round((profit/revenue)*100) : 0;
    const revDelta = prevRevenue > 0 ? Math.round(((revenue-prevRevenue)/prevRevenue)*100) : null;
    const activeOrders = orders.filter((o) => !["done","delivered","annullato"].includes(o.status)).length;
    const overdueOrders = orders.filter((o) => !["done","delivered","annullato"].includes(o.status) && isOverdue(o.dueDate)).length;
    const unpaid = sales.filter((s) => s.status==="da_pagare").reduce((s,x)=>s+x.totalAmount,0);
    setKpis({ revenue, prevRevenue, profit, margin, revDelta, expenses, activeOrders, overdueOrders, unpaid, clients: clients.length });
  }

  const items = [
    { label:"Revenue Mese", value: fmtEur(kpis.revenue||0), delta: kpis.revDelta, icon:"💰", color:"blue" },
    { label:"Profitto", value: fmtEur(kpis.profit||0), icon:"📈", color:"green" },
    { label:"Margine %", value: `${kpis.margin||0}%`, icon:"🎯", color:"purple" },
    { label:"Ordini Attivi", value: kpis.activeOrders||0, icon:"📦", color:"blue" },
    { label:"Ordini Scaduti", value: kpis.overdueOrders||0, icon:"⚠️", color: kpis.overdueOrders>0?"red":"green" },
    { label:"Da Incassare", value: fmtEur(kpis.unpaid||0), icon:"🧾", color:"yellow" },
    { label:"Uscite Mese", value: fmtEur(kpis.expenses||0), icon:"📤", color:"red" },
    { label:"Clienti", value: kpis.clients||0, icon:"👥", color:"blue" },
  ];

  const colorMap: Record<string, string> = {
    blue:"bg-blue-50 border-blue-100", green:"bg-green-50 border-green-100",
    purple:"bg-purple-50 border-purple-100", red:"bg-red-50 border-red-100", yellow:"bg-amber-50 border-amber-100",
  };
  const valColorMap: Record<string, string> = {
    blue:"text-blue-700", green:"text-green-700", purple:"text-purple-700", red:"text-red-600", yellow:"text-amber-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">KPI Live</h1><p className="text-sm text-gray-500">Aggiornamento ogni 30 secondi</p></div>
        <button className="btn btn-secondary" onClick={load}>↻ Aggiorna</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((k) => (
          <div key={k.label} className={`card border rounded-xl p-5 ${colorMap[k.color]}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{k.label}</p>
              <span className="text-xl">{k.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${valColorMap[k.color]}`}>{k.value}</p>
            {k.delta !== undefined && k.delta !== null && (
              <p className={`text-xs mt-0.5 font-medium ${k.delta>=0?"text-green-600":"text-red-500"}`}>{k.delta>=0?"+":""}{k.delta}% vs mese scorso</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
