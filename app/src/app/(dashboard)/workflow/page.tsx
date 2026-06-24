"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const STAGES = ["preventivo","confermato","in lavorazione","controllo qualità","pronto","spedito","consegnato","annullato"];
const STAGE_COLOR: Record<string,string> = {
  "preventivo":"#6366f1","confermato":"#3b82f6","in lavorazione":"#f59e0b",
  "controllo qualità":"#a855f7","pronto":"#22c55e","spedito":"#06b6d4",
  "consegnato":"#10b981","annullato":"#ef4444"
};

interface Order { id: string; orderNumber: string; clientName: string; status: string; title?: string; total: number; deadline?: string; tags?: string; createdAt: string; }

export default function WorkflowPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string|null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/api/orders").then(r => { setOrders(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function moveOrder(id: string, status: string) {
    await apiFetch(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  const filtered = orders.filter(o => !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.clientName.toLowerCase().includes(search.toLowerCase()) || (o.title||"").toLowerCase().includes(search.toLowerCase()));

  const byStage = STAGES.map(s => ({ stage: s, orders: filtered.filter(o => o.status === s) }));
  const totalActive = orders.filter(o => !["consegnato","annullato"].includes(o.status)).length;
  const totalValue = orders.filter(o => !["annullato"].includes(o.status)).reduce((a, b) => a + (b.total || 0), 0);

  return (
    <div style={{ padding: 24, height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>📋 Workflow Overview</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{totalActive} ordini attivi · €{totalValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cerca ordine..." style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "8px 14px", fontSize: 13, width: 220 }} />
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexShrink: 0, flexWrap: "wrap" }}>
        {STAGES.map(s => {
          const cnt = orders.filter(o => o.status === s).length;
          if (!cnt) return null;
          return <div key={s} style={{ background: "#0f172a", border: `1px solid ${STAGE_COLOR[s]}40`, borderRadius: 8, padding: "6px 12px", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLOR[s], display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "capitalize" }}>{s}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: STAGE_COLOR[s] }}>{cnt}</span>
          </div>;
        })}
      </div>

      {/* Kanban */}
      {loading ? <div style={{ color: "#475569", textAlign: "center", padding: 60 }}>Caricamento...</div> : (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", flex: 1, paddingBottom: 16 }}>
          {byStage.map(({ stage, orders: stageOrders }) => (
            <div key={stage}
              style={{ minWidth: 220, maxWidth: 240, background: "#0a0f1a", border: `1px solid ${STAGE_COLOR[stage]}30`, borderRadius: 12, display: "flex", flexDirection: "column", flexShrink: 0 }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => dragging && moveOrder(dragging, stage)}
            >
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${STAGE_COLOR[stage]}30`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: STAGE_COLOR[stage], textTransform: "capitalize" }}>{stage}</span>
                <span style={{ fontSize: 11, background: `${STAGE_COLOR[stage]}20`, color: STAGE_COLOR[stage], borderRadius: 10, padding: "1px 8px", fontWeight: 700 }}>{stageOrders.length}</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {stageOrders.map(order => (
                  <div key={order.id}
                    draggable
                    onDragStart={() => setDragging(order.id)}
                    onDragEnd={() => setDragging(null)}
                    style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 12, cursor: "grab", opacity: dragging === order.id ? 0.5 : 1, transition: "opacity 0.1s" }}
                  >
                    <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, marginBottom: 4 }}>#{order.orderNumber}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{order.title || order.clientName}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{order.clientName}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>€{(order.total||0).toFixed(2)}</span>
                      {order.deadline && (
                        <span style={{ fontSize: 9, color: new Date(order.deadline) < new Date() ? "#ef4444" : "#64748b" }}>
                          {new Date(order.deadline).toLocaleDateString("it-IT")}
                        </span>
                      )}
                    </div>
                    {order.tags && <div style={{ marginTop: 6, display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {order.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => <span key={t} style={{ fontSize: 9, padding: "1px 5px", background: "#1e293b", borderRadius: 8, color: "#64748b" }}>{t}</span>)}
                    </div>}
                    {/* Quick move */}
                    <div style={{ marginTop: 8, display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {STAGES.filter(s => s !== stage).slice(0, 2).map(s => (
                        <button key={s} onClick={() => moveOrder(order.id, s)} style={{ fontSize: 9, padding: "2px 6px", background: `${STAGE_COLOR[s]}15`, color: STAGE_COLOR[s], border: `1px solid ${STAGE_COLOR[s]}30`, borderRadius: 5, cursor: "pointer" }}>→ {s}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {stageOrders.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#334155", fontSize: 11 }}>Nessun ordine</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
