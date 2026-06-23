"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fmtEur } from "@/lib/format";

export default function KpiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  async function load() {
    try {
      const r = await api.get<any>("/api/dashboard");
      setData(r);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Caricamento KPI...</div>;

  const kpis = [
    { label: "Revenue Mese", value: fmtEur(data?.revenueThisMonth || 0), delta: data?.revDelta, icon: "💰", color: "blue" },
    { label: "Profitto", value: fmtEur(data?.profit || 0), icon: "📈", color: "green" },
    { label: "Margine %", value: `${data?.margin || 0}%`, icon: "🎯", color: "purple" },
    { label: "Ordini Attivi", value: data?.activeOrders || 0, icon: "📦", color: "blue" },
    { label: "Ordini Scaduti", value: data?.overdueOrders || 0, icon: "⚠️", color: "red" },
    { label: "Da Incassare", value: fmtEur(data?.unpaidInvoices || 0), icon: "🧾", color: "yellow" },
    { label: "Clienti Totali", value: data?.clientsTotal || 0, icon: "👥", color: "blue" },
    { label: "Nuovi Clienti (mese)", value: data?.clientsNew || 0, icon: "✨", color: "green" },
    { label: "Uscite Mese", value: fmtEur(data?.expensesThisMonth || 0), icon: "📤", color: "red" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Live</h1>
          <p className="text-sm text-gray-500 mt-1">Aggiornamento automatico ogni 30 secondi</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>↻ Aggiorna</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {data?.overdueOrders > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-red-700">⚠️ {data.overdueOrders} ordine/i scaduto/i — richiede attenzione immediata</p>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, delta, icon, color }: { label: string; value: any; delta?: number; icon: string; color: string }) {
  const bg: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-green-50 border-green-100",
    purple: "bg-purple-50 border-purple-100",
    red: "bg-red-50 border-red-100",
    yellow: "bg-amber-50 border-amber-100",
  };
  const iconBg: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-amber-100 text-amber-600",
  };
  return (
    <div className={`rounded-xl border p-5 ${bg[color] || bg.blue}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${iconBg[color]}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {delta !== undefined && (
        <p className={`text-xs mt-1 font-medium ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
          {delta >= 0 ? "+" : ""}{delta}% vs mese scorso
        </p>
      )}
    </div>
  );
}
