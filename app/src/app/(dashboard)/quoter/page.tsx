"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Category = "materiale" | "laser" | "manodopera" | "verniciatura" | "gadget" | "catalogo" | "";

interface QuoteLine {
  id: string;
  desc: string;
  category: Category;
  unitCost: number;
  qty: number;
  subtotalCost: number;
  unitPrice: number;
  subtotalPrice: number;
}

interface Client { id: string; firstName: string; lastName: string; companyName?: string; }
interface Material { id: string; name: string; category: string; costPerUnit: number; pricePerUnit: number; unit: string; }
interface Product { id: string; name: string; category?: string; cost: number; price: number; unit: string; }
interface SavedQuote { id: string; title?: string; clientName: string; totalAmount: number; status: string; createdAt: string; lines?: any; markup?: number; discount?: number; }

const CATEGORIES = [
  { value: "materiale", label: "Materiale (Mq + Sfrido)" },
  { value: "laser", label: "Laser / Macchina (Minuti)" },
  { value: "manodopera", label: "Manodopera / Assemblaggio" },
  { value: "verniciatura", label: "Verniciatura (Superficie)" },
  { value: "gadget", label: "Gadget / LED / Minuteria" },
  { value: "catalogo", label: "Prodotto da Catalogo" },
];

const CURRENCIES = [
  { value: "EUR", symbol: "€" },
  { value: "USD", symbol: "$" },
  { value: "GBP", symbol: "£" },
  { value: "CHF", symbol: "₣" },
];

export default function QuoterPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);

  // Line builder state
  const [category, setCategory] = useState<Category>("");
  const [resourceId, setResourceId] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [waste, setWaste] = useState(15);
  const [minutes, setMinutes] = useState(0);
  const [qty, setQty] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [lineDesc, setLineDesc] = useState("");

  // Quote state
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Media");
  const [notes, setNotes] = useState("");
  const [markup, setMarkup] = useState(100);
  const [discount, setDiscount] = useState(0);
  const [includeVat, setIncludeVat] = useState(true);
  const [currency, setCurrency] = useState("EUR");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const currSymbol = CURRENCIES.find(c => c.value === currency)?.symbol || "€";

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [c, m, p, q] = await Promise.all([
      apiFetch("/api/clients").catch(() => ({ data: [] })),
      apiFetch("/api/materials").catch(() => ({ data: [] })),
      apiFetch("/api/products").catch(() => ({ data: [] })),
      apiFetch("/api/quotes").catch(() => ({ data: [] })),
    ]);
    setClients(c.data || []);
    setMaterials(m.data || []);
    setProducts(p.data || []);
    setSavedQuotes(q.data || []);
  }

  // Get resources for current category
  const resources = useCallback((): Array<{ id: string; label: string; cost: number; price: number; unit: string }> => {
    if (category === "catalogo") {
      return products.map(p => ({ id: p.id, label: p.name, cost: p.cost, price: p.price, unit: p.unit }));
    }
    const catMap: Record<string, string> = {
      materiale: "materiale", laser: "laser", manodopera: "manodopera",
      verniciatura: "verniciatura", gadget: "gadget",
    };
    return materials
      .filter(m => !category || m.category === catMap[category] || m.category === "generico")
      .map(m => ({ id: m.id, label: m.name, cost: m.costPerUnit, price: m.pricePerUnit, unit: m.unit }));
  }, [category, materials, products]);

  function onResourceChange(id: string) {
    setResourceId(id);
    const res = resources().find(r => r.id === id);
    if (res) setUnitCost(res.cost);
  }

  function calcLineCost(): number {
    if (!category) return unitCost * qty;
    if (category === "materiale" || category === "verniciatura") {
      const mq = (width * height) / 10000;
      const withWaste = mq * (1 + waste / 100);
      return unitCost * withWaste * qty;
    }
    if (category === "laser" || category === "manodopera") {
      return unitCost * (minutes / 60) * qty;
    }
    return unitCost * qty;
  }

  function addLine() {
    const res = resources().find(r => r.id === resourceId);
    const cost = calcLineCost();
    const price = cost * (1 + markup / 100);
    const desc = lineDesc || res?.label || (category ? CATEGORIES.find(c => c.value === category)?.label : "Voce manuale") || "Voce";

    const line: QuoteLine = {
      id: Date.now().toString(),
      desc,
      category,
      unitCost,
      qty,
      subtotalCost: cost,
      unitPrice: price / qty,
      subtotalPrice: price,
    };
    setLines(prev => [...prev, line]);
    setLineDesc("");
    setResourceId("");
    setWidth(0); setHeight(0); setMinutes(0); setQty(1);
  }

  function removeLine(id: string) {
    setLines(prev => prev.filter(l => l.id !== id));
  }

  const costTotal = lines.reduce((s, l) => s + l.subtotalCost, 0);
  const subtotal = lines.reduce((s, l) => s + l.subtotalCost, 0) * (1 + markup / 100) * (1 - discount / 100);
  const taxAmount = includeVat ? subtotal * 0.22 : 0;
  const total = subtotal + taxAmount;
  const margin = subtotal > 0 ? ((subtotal - costTotal) / subtotal) * 100 : 0;

  async function saveQuote(status = "bozza") {
    setSaving(true);
    const payload = {
      clientId: clientId || undefined,
      clientName: clients.find(c => c.id === clientId)
        ? `${clients.find(c => c.id === clientId)!.firstName} ${clients.find(c => c.id === clientId)!.lastName}`
        : "—",
      title,
      status,
      lines,
      costTotal,
      subtotal,
      taxAmount,
      totalAmount: total,
      markup,
      discount,
      includeVat,
      currency,
      notes,
      priority,
      validUntil: deadline || undefined,
    };
    const url = editingId ? `/api/quotes/${editingId}` : "/api/quotes";
    const method = editingId ? "PUT" : "POST";
    await apiFetch(url, { method, body: JSON.stringify(payload) });
    setMsg(editingId ? "Preventivo aggiornato!" : "Preventivo salvato!");
    setSaving(false);
    loadAll();
    setTimeout(() => setMsg(""), 3000);
  }

  async function confirmToSale() {
    await saveQuote("confermato");
    // Create sale from quote
    const payload = {
      clientId: clientId || undefined,
      clientName: clients.find(c => c.id === clientId)
        ? `${clients.find(c => c.id === clientId)!.firstName} ${clients.find(c => c.id === clientId)!.lastName}`
        : "—",
      lines,
      subtotal,
      taxAmount,
      totalAmount: total,
      status: "da_pagare",
      notes,
    };
    await apiFetch("/api/sales", { method: "POST", body: JSON.stringify(payload) });
    setMsg("✅ Preventivo confermato e fattura creata!");
    setTimeout(() => { setMsg(""); router.push("/sales"); }, 2000);
  }

  function sendToOrders() {
    router.push(`/orders?fromQuote=${encodeURIComponent(title || "Preventivo")}&amount=${total.toFixed(2)}&clientId=${clientId}`);
  }

  function loadQuote(q: SavedQuote) {
    setLines(q.lines || []);
    setMarkup(q.markup || 100);
    setDiscount(q.discount || 0);
    setEditingId(q.id);
    setTitle(q.title || "");
    const client = clients.find(c => `${c.firstName} ${c.lastName}` === q.clientName);
    if (client) setClientId(client.id);
  }

  function clearAll() {
    setLines([]); setCategory(""); setResourceId(""); setClientId("");
    setTitle(""); setDeadline(""); setNotes(""); setMarkup(100);
    setDiscount(0); setEditingId(null); setUnitCost(0); setQty(1);
    setWidth(0); setHeight(0); setMinutes(0);
  }

  function shareWhatsApp() {
    const clientName = clients.find(c => c.id === clientId)
      ? `${clients.find(c => c.id === clientId)!.firstName} ${clients.find(c => c.id === clientId)!.lastName}`
      : "Cliente";
    const text = `*Preventivo: ${title || "Lavoro"}*\nCliente: ${clientName}\n\n${lines.map(l => `• ${l.desc} x${l.qty} — ${currSymbol}${l.subtotalPrice.toFixed(2)}`).join("\n")}\n\n*Totale: ${currSymbol}${total.toFixed(2)}*\n${includeVat ? "(IVA inclusa)" : "(IVA esclusa)"}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  }

  const fmt = (n: number) => `${currSymbol}${n.toFixed(2)}`;

  return (
    <div style={{ padding: "0 24px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingTop: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>⚡ Smart Quoter</h1>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>Preventivi professionali multi-voce con pricing dinamico</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={selectStyle}>
            {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.symbol} {c.value}</option>)}
          </select>
          <button onClick={clearAll} style={btnSecondary}>🗑️ Nuovo</button>
        </div>
      </div>

      {msg && <div style={{ background: "#22c55e20", border: "1px solid #22c55e40", color: "#22c55e", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr 310px", gap: 16, alignItems: "start" }}>

        {/* COL 1 — Configura Lavorazione */}
        <div style={card}>
          <div style={cardTitle}>⚙️ CONFIGURA LAVORAZIONE</div>

          <label style={label}>CATEGORIA</label>
          <select value={category} onChange={e => { setCategory(e.target.value as Category); setResourceId(""); setUnitCost(0); }} style={{ ...inputStyle, marginBottom: 12 }}>
            <option value="">-- Seleziona tipo --</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <label style={label}>RISORSA DA LISTINO</label>
          <select value={resourceId} onChange={e => onResourceChange(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }}>
            <option value="">-- Scegli risorsa --</option>
            {resources().map(r => <option key={r.id} value={r.id}>{r.label} ({fmt(r.cost)}/{r.unit})</option>)}
          </select>

          {(category === "materiale" || category === "verniciatura") && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={label}>LARG (cm)</label>
                  <input type="number" value={width} onChange={e => setWidth(+e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={label}>ALT (cm)</label>
                  <input type="number" value={height} onChange={e => setHeight(+e.target.value)} style={inputStyle} />
                </div>
              </div>
              <label style={label}>SFRIDO %</label>
              <input type="number" value={waste} onChange={e => setWaste(+e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
            </>
          )}

          {(category === "laser" || category === "manodopera") && (
            <>
              <label style={label}>MINUTI</label>
              <input type="number" value={minutes} onChange={e => setMinutes(+e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
            </>
          )}

          <label style={label}>COSTO UNITARIO €</label>
          <input type="number" value={unitCost} onChange={e => setUnitCost(+e.target.value)} step="0.01" style={{ ...inputStyle, marginBottom: 12 }} />

          <label style={label}>DESCRIZIONE VOCE</label>
          <input type="text" value={lineDesc} onChange={e => setLineDesc(e.target.value)} placeholder="Descrizione personalizzata..." style={{ ...inputStyle, marginBottom: 12 }} />

          <label style={label}>QTÀ</label>
          <input type="number" value={qty} onChange={e => setQty(+e.target.value)} min={1} style={{ ...inputStyle, marginBottom: 16 }} />

          <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#94a3b8" }}>
            Costo stimato voce: <strong style={{ color: "#fff" }}>{fmt(calcLineCost())}</strong>
          </div>

          <button onClick={addLine} disabled={!unitCost && !lineDesc} style={{ ...btnPrimary, width: "100%", padding: "12px", fontSize: 14 }}>
            ＋ AGGIUNGI AL PREVENTIVO
          </button>
        </div>

        {/* COL 2 — Voci */}
        <div style={card}>
          <div style={cardTitle}>📋 VOCI IN PREVENTIVO</div>
          {lines.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#475569" }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📋</div>
              <p style={{ fontSize: 13 }}>Nessuna voce.<br />Configura una lavorazione e aggiungi al preventivo.</p>
            </div>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e293b" }}>
                    {["Descrizione", "Qtà", "Costo unit.", "Prezzo unit.", "Subt.", ""].map(h => (
                      <th key={h} style={{ padding: "8px 6px", textAlign: h === "Descrizione" ? "left" : "right", fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map(l => (
                    <tr key={l.id} style={{ borderBottom: "1px solid #0f172a" }}>
                      <td style={{ padding: "10px 6px", fontSize: 12 }}>{l.desc}</td>
                      <td style={{ padding: "10px 6px", fontSize: 12, textAlign: "right" }}>{l.qty}</td>
                      <td style={{ padding: "10px 6px", fontSize: 12, textAlign: "right", color: "#94a3b8" }}>{fmt(l.unitCost)}</td>
                      <td style={{ padding: "10px 6px", fontSize: 12, textAlign: "right" }}>{fmt(l.unitPrice)}</td>
                      <td style={{ padding: "10px 6px", fontSize: 12, textAlign: "right", fontWeight: 700, color: "#6366f1" }}>{fmt(l.subtotalPrice)}</td>
                      <td style={{ padding: "10px 6px" }}>
                        <button onClick={() => removeLine(l.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #1e293b" }}>
                <div style={statRow}><span style={{ color: "#94a3b8" }}>Costo vivo totale</span><span>{fmt(costTotal)}</span></div>
                <div style={statRow}><span style={{ color: "#94a3b8" }}>Subtotale (markup {markup}%)</span><span>{fmt(subtotal)}</span></div>
                <div style={statRow}><span style={{ color: "#94a3b8" }}>Margine</span>
                  <span style={{ fontWeight: 700, color: margin >= 30 ? "#22c55e" : margin >= 15 ? "#f59e0b" : "#ef4444" }}>{margin.toFixed(1)}%</span>
                </div>
                {includeVat && <div style={statRow}><span style={{ color: "#94a3b8" }}>IVA (22%)</span><span>{fmt(taxAmount)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 20 }}>
                  <span style={{ fontWeight: 700, color: "#fff" }}>TOTALE</span>
                  <span style={{ fontWeight: 900, color: "#6366f1" }}>{fmt(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* COL 3 — Riepilogo & Azioni */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Cliente */}
          <div style={card}>
            <div style={cardTitle}>👤 CLIENTE (CRM)</div>
            <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }}>
              <option value="">-- Seleziona cliente --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.companyName ? ` — ${c.companyName}` : ""}</option>)}
            </select>
            <label style={label}>TITOLO LAVORO</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="es. Insegna LED Plexy" style={{ ...inputStyle, marginBottom: 10 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <label style={label}>SCADENZA</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={label}>PRIORITÀ</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={inputStyle}>
                  <option>Bassa</option><option>Media</option><option>Alta</option><option>Urgente</option>
                </select>
              </div>
            </div>
            <label style={label}>NOTE</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Note aggiuntive..." style={{ ...inputStyle, resize: "none" }} />
          </div>

          {/* Prezzi */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={cardTitle}>💰 RIEPILOGO</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setIncludeVat(true)} style={{ ...btnXs, ...(includeVat ? btnXsActive : {}) }}>+IVA</button>
                <button onClick={() => setIncludeVat(false)} style={{ ...btnXs, ...(!includeVat ? btnXsActive : {}) }}>Esclusa</button>
              </div>
            </div>
            <div style={statRow}><span style={{ color: "#94a3b8", fontSize: 12 }}>Costo vivo</span><span style={{ fontSize: 12 }}>{fmt(costTotal)}</span></div>
            <div style={statRow}><span style={{ color: "#94a3b8", fontSize: 12 }}>Subtotale</span><span style={{ fontSize: 12 }}>{fmt(subtotal)}</span></div>
            {includeVat && <div style={statRow}><span style={{ color: "#94a3b8", fontSize: 12 }}>IVA (22%)</span><span style={{ fontSize: 12 }}>{fmt(taxAmount)}</span></div>}

            <label style={{ ...label, marginTop: 10 }}>MARKUP / RICARICO %</label>
            <input type="number" value={markup} onChange={e => setMarkup(+e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />

            <label style={label}>SCONTO %</label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {[0, 5, 10, 20].map(d => (
                <button key={d} onClick={() => setDiscount(d)} style={{ ...btnXs, ...(discount === d ? btnXsActive : {}) }}>{d}%</button>
              ))}
              <input type="number" value={discount} onChange={e => setDiscount(+e.target.value)} style={{ ...inputStyle, width: 60 }} />
            </div>

            <div style={{ background: "linear-gradient(135deg,#1c1c20,#1a1a1e)", border: "1px solid #6366f130", borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>PREZZO FINALE</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#6366f1" }}>{fmt(total)}</div>
              <div style={{ fontSize: 12, marginTop: 6, color: margin >= 30 ? "#22c55e" : "#f59e0b" }}>Margine: {margin.toFixed(1)}%</div>
            </div>
          </div>

          {/* Azioni */}
          <div style={card}>
            <div style={cardTitle}>⚡ AZIONI</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <button onClick={() => saveQuote("bozza")} disabled={saving || lines.length === 0} style={{ ...btnPrimary, width: "100%", padding: "11px", fontSize: 13 }}>
                💾 Salva Preventivo
              </button>
              <button onClick={() => saveQuote("inviato")} disabled={saving || lines.length === 0} style={{ ...btnSecondary, width: "100%" }}>
                📤 Salva come Inviato
              </button>
              <button onClick={confirmToSale} disabled={saving || lines.length === 0} style={{ ...btnSecondary, width: "100%", color: "#22c55e", borderColor: "#22c55e40" }}>
                ✅ Conferma → Fattura
              </button>
              <button onClick={sendToOrders} disabled={lines.length === 0} style={{ ...btnSecondary, width: "100%" }}>
                🔄 Invia a Produzione
              </button>
              <button onClick={shareWhatsApp} disabled={lines.length === 0} style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                📱 Condividi su WhatsApp
              </button>
            </div>

            <hr style={{ borderColor: "#1e293b", margin: "16px 0" }} />
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>Preventivi salvati</div>
            <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {savedQuotes.length === 0 && <div style={{ fontSize: 12, color: "#475569", padding: "8px 0" }}>Nessun preventivo</div>}
              {savedQuotes.map(q => (
                <div key={q.id} onClick={() => loadQuote(q)} style={{ padding: "8px 10px", borderRadius: 6, background: "#0f172a", cursor: "pointer", border: editingId === q.id ? "1px solid #6366f1" : "1px solid #1e293b" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>{q.title || "—"}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{q.clientName} · {currSymbol}{q.totalAmount?.toFixed(2)} · <span style={{ color: statusColor(q.status) }}>{q.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusColor(s: string) {
  if (s === "confermato") return "#22c55e";
  if (s === "inviato") return "#3b82f6";
  if (s === "rifiutato") return "#ef4444";
  return "#f59e0b";
}

const card: React.CSSProperties = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 };
const cardTitle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 };
const label: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxSizing: "border-box", outline: "none" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };
const btnPrimary: React.CSSProperties = { background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 };
const btnSecondary: React.CSSProperties = { background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13 };
const btnXs: React.CSSProperties = { padding: "4px 10px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#64748b", fontWeight: 700, fontSize: 10, cursor: "pointer" };
const btnXsActive: React.CSSProperties = { background: "#6366f1", color: "#fff", borderColor: "#6366f1" };
const statRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid #0f172a" };
