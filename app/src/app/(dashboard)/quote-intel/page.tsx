"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Quote { id: string; quoteNumber: string; clientName: string; title?: string; total: number; status: string; createdAt: string; taxRate?: number; markup?: number; discount?: number; }
interface Sale { id: string; invoiceNumber: string; clientName: string; total: number; status: string; createdAt: string; }

export default function QuoteIntelPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/quotes").catch(() => ({ data: [] })),
      apiFetch("/api/sales").catch(() => ({ data: [] })),
    ]).then(([q, s]) => {
      setQuotes(q.data || []);
      setSales(s.data || []);
      setLoading(false);
    });
  }, []);

  const total = quotes.length;
  const confirmed = quotes.filter(q => q.status === "confirmed").length;
  const sent = quotes.filter(q => q.status === "sent").length;
  const draft = quotes.filter(q => q.status === "draft").length;
  const convRate = total > 0 ? (confirmed / total * 100) : 0;
  const avgValue = total > 0 ? quotes.reduce((a, b) => a + b.total, 0) / total : 0;
  const totalRevenue = quotes.filter(q => q.status === "confirmed").reduce((a, b) => a + b.total, 0);
  const lostRevenue = quotes.filter(q => q.status === "rejected").reduce((a, b) => a + b.total, 0);
  const avgMarkup = quotes.filter(q => q.markup).reduce((a, b) => a + (b.markup || 0), 0) / (quotes.filter(q => q.markup).length || 1);
  const avgDiscount = quotes.filter(q => q.discount).reduce((a, b) => a + (b.discount || 0), 0) / (quotes.filter(q => q.discount).length || 1);

  // Monthly trend
  const months: Record<string,{ count: number; revenue: number }> = {};
  quotes.forEach(q => {
    const m = q.createdAt.slice(0, 7);
    if (!months[m]) months[m] = { count: 0, revenue: 0 };
    months[m].count++;
    if (q.status === "confirmed") months[m].revenue += q.total;
  });
  const trend = Object.entries(months).sort().slice(-6);

  // Top clients
  const clientMap: Record<string,{ count: number; revenue: number }> = {};
  quotes.filter(q => q.status === "confirmed").forEach(q => {
    if (!clientMap[q.clientName]) clientMap[q.clientName] = { count: 0, revenue: 0 };
    clientMap[q.clientName].count++;
    clientMap[q.clientName].revenue += q.total;
  });
  const topClients = Object.entries(clientMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);

  const STATUS_COLOR: Record<string,string> = { draft:"#6366f1", sent:"#f59e0b", confirmed:"#22c55e", rejected:"#ef4444" };
  const STATUS_IT: Record<string,string> = { draft:"Bozza", sent:"Inviato", confirmed:"Confermato", rejected:"Rifiutato" };

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Caricamento analytics...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>🧠 Quote Intelligence</h1>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Analisi avanzata dei preventivi e conversioni</p>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Preventivi Totali", val: total, color: "#6366f1", icon: "📋" },
          { label: "Tasso Conversione", val: `${convRate.toFixed(1)}%`, color: "#22c55e", icon: "✅" },
          { label: "Valore Medio", val: `€${avgValue.toFixed(0)}`, color: "#f59e0b", icon: "💰" },
          { label: "Revenue Confermata", val: `€${totalRevenue.toFixed(0)}`, color: "#10b981", icon: "📈" },
        ].map(k => (
          <div key={k.label} style={{ background: "#0f172a", border: `1px solid ${k.color}30`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>{k.icon} {k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Status breakdown */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>📊 Distribuzione Status</div>
          {[
            { key: "draft", label: "Bozza", count: draft },
            { key: "sent", label: "Inviati", count: sent },
            { key: "confirmed", label: "Confermati", count: confirmed },
            { key: "rejected", label: "Rifiutati", count: quotes.filter(q => q.status === "rejected").length },
          ].map(s => (
            <div key={s.key} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[s.key] }}>{s.count} ({total ? (s.count/total*100).toFixed(0) : 0}%)</span>
              </div>
              <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${total ? s.count/total*100 : 0}%`, background: STATUS_COLOR[s.key], borderRadius: 3, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>💡 Metriche Chiave</div>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { label: "Markup Medio", val: `${avgMarkup.toFixed(1)}%`, color: "#6366f1" },
              { label: "Sconto Medio", val: `${avgDiscount.toFixed(1)}%`, color: "#f59e0b" },
              { label: "Revenue Persa (rifiutati)", val: `€${lostRevenue.toFixed(0)}`, color: "#ef4444" },
              { label: "Preventivi Attivi", val: sent, color: "#22c55e" },
            ].map(m => (
              <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{m.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Monthly trend */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>📅 Trend Mensile (ultimi 6 mesi)</div>
          {trend.length === 0 && <div style={{ color: "#475569", fontSize: 12 }}>Dati insufficienti</div>}
          {trend.map(([month, data]) => {
            const maxRev = Math.max(...trend.map(t => t[1].revenue), 1);
            return (
              <div key={month} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{month}</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{data.count} prev · <span style={{ color: "#22c55e", fontWeight: 700 }}>€{data.revenue.toFixed(0)}</span></span>
                </div>
                <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${data.revenue / maxRev * 100}%`, background: "linear-gradient(90deg,#6366f1,#22c55e)", borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Top clients */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>🏆 Top Clienti (per revenue)</div>
          {topClients.length === 0 && <div style={{ color: "#475569", fontSize: 12 }}>Nessun dato disponibile</div>}
          {topClients.map(([name, data], i) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: i === 0 ? "#f59e0b" : "#475569" }}>#{i+1}</span>
                <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{name}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>€{data.revenue.toFixed(0)}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{data.count} ordini</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent quotes table */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e293b", fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>📋 Ultimi Preventivi</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0a0f1a" }}>
              {["#","Cliente","Titolo","Totale","Status","Data"].map(h => <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, color: "#475569", fontWeight: 700 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {quotes.slice().reverse().slice(0, 10).map(q => (
              <tr key={q.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "9px 14px", fontSize: 11, color: "#6366f1", fontWeight: 700 }}>#{q.quoteNumber}</td>
                <td style={{ padding: "9px 14px", fontSize: 12, color: "#e2e8f0" }}>{q.clientName}</td>
                <td style={{ padding: "9px 14px", fontSize: 12, color: "#94a3b8" }}>{q.title || "—"}</td>
                <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: 700, color: "#22c55e" }}>€{q.total.toFixed(2)}</td>
                <td style={{ padding: "9px 14px" }}><span style={{ fontSize: 10, padding: "2px 8px", background: `${STATUS_COLOR[q.status] || "#475569"}20`, color: STATUS_COLOR[q.status] || "#475569", borderRadius: 8, fontWeight: 700 }}>{STATUS_IT[q.status] || q.status}</span></td>
                <td style={{ padding: "9px 14px", fontSize: 11, color: "#475569" }}>{new Date(q.createdAt).toLocaleDateString("it-IT")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
