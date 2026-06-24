"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function FinancePage() {
  const [cashflows, setCashflows] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [fixedCosts, setFixedCosts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/cashflow").catch(() => ({ data: [] })),
      apiFetch("/api/sales").catch(() => ({ data: [] })),
      apiFetch("/api/fixed-costs").catch(() => ({ data: [] })),
    ]).then(([c, s, f]) => {
      setCashflows(c.data || []);
      setSales(s.data || []);
      setFixedCosts(f.data || []);
    });
  }, []);

  const totalEntrate = cashflows.filter(c => c.type === "entrata").reduce((s, c) => s + c.amount, 0);
  const totalUscite = cashflows.filter(c => c.type === "uscita").reduce((s, c) => s + c.amount, 0);
  const saldo = totalEntrate - totalUscite;
  const fatturato = sales.reduce((s, v) => s + (v.totalAmount || 0), 0);
  const incassato = sales.filter(v => v.status === "pagato").reduce((s, v) => s + (v.totalAmount || 0), 0);
  const daIncassare = sales.filter(v => v.status === "da_pagare").reduce((s, v) => s + (v.totalAmount || 0), 0);
  const costiMensili = fixedCosts.filter(f => f.active && f.frequency === "monthly").reduce((s, f) => s + f.amount, 0);

  const kpis = [
    { label: "Saldo Cashflow", value: `€${saldo.toFixed(2)}`, color: saldo >= 0 ? "#22c55e" : "#ef4444", icon: "💸" },
    { label: "Fatturato Totale", value: `€${fatturato.toFixed(2)}`, color: "#6366f1", icon: "📊" },
    { label: "Incassato", value: `€${incassato.toFixed(2)}`, color: "#22c55e", icon: "✅" },
    { label: "Da Incassare", value: `€${daIncassare.toFixed(2)}`, color: "#f59e0b", icon: "⏳" },
    { label: "Entrate", value: `€${totalEntrate.toFixed(2)}`, color: "#22c55e", icon: "⬆️" },
    { label: "Uscite", value: `€${totalUscite.toFixed(2)}`, color: "#ef4444", icon: "⬇️" },
    { label: "Costi Fissi/Mese", value: `€${costiMensili.toFixed(2)}`, color: "#f97316", icon: "🔒" },
    { label: "Margine Operativo", value: fatturato > 0 ? `${(((fatturato - totalUscite) / fatturato) * 100).toFixed(1)}%` : "—", color: "#818cf8", icon: "📐" },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>📊 Finance Pro</h1>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Panoramica finanziaria completa</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Ultime transazioni */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 14 }}>💸 ULTIME TRANSAZIONI</div>
          {cashflows.slice(0, 10).map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b", fontSize: 12 }}>
              <div>
                <span style={{ fontSize: 14, marginRight: 6 }}>{c.type === "entrata" ? "⬆️" : "⬇️"}</span>
                <span style={{ color: "#e2e8f0" }}>{c.description}</span>
                <span style={{ color: "#475569", fontSize: 10, marginLeft: 6 }}>{c.category}</span>
              </div>
              <span style={{ fontWeight: 700, color: c.type === "entrata" ? "#22c55e" : "#ef4444" }}>
                {c.type === "entrata" ? "+" : "-"}€{c.amount.toFixed(2)}
              </span>
            </div>
          ))}
          {cashflows.length === 0 && <div style={{ color: "#475569", fontSize: 12 }}>Nessuna transazione registrata</div>}
        </div>

        {/* Fatture per stato */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 14 }}>🧾 FATTURE PER STATO</div>
          {[
            { stato: "pagato", label: "Pagate", color: "#22c55e" },
            { stato: "da_pagare", label: "Da Pagare", color: "#f59e0b" },
            { stato: "bozza", label: "Bozze", color: "#64748b" },
            { stato: "scaduto", label: "Scadute", color: "#ef4444" },
          ].map(s => {
            const items = sales.filter(v => v.status === s.stato);
            const tot = items.reduce((sum, v) => sum + v.totalAmount, 0);
            return (
              <div key={s.stato} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{s.label}</span>
                  <span style={{ fontSize: 10, color: "#475569" }}>({items.length})</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>€{tot.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
