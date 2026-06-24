"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const CATEGORIES = [
  { group: "🪵 Materiali Grezzi", cats: ["Legno","MDF","Plexiglass","Sughero","Carta & Cartone","Feltro & Tessuto","Pelle","Metallo"] },
  { group: "💡 Elettronica", cats: ["LED & Illuminazione"] },
  { group: "🔧 Accessori", cats: ["Magneti","Minuteria","Colori & Finitura","Adesivi","Packaging"] },
  { group: "🎁 Gadget", cats: ["Portachiavi","Frame & Cornici","Lightbox","Gadget"] },
  { group: "⚙️ Altro", cats: ["Macchinari","Altro"] },
];
const ALL_CATS = ["Tutti", ...CATEGORIES.flatMap(g => g.cats)];
const UNITS = ["pz","mq","ml","kg","g","lt","m","rotolo","foglio"];

function avail(item: any) {
  const qty = +(item.stock ?? 0);
  const min = +(item.minStock ?? 1);
  if (qty <= 0) return { label: "❌ Esaurito", color: "#ef4444" };
  if (qty <= min) return { label: "⚠️ Scorta Bassa", color: "#f59e0b" };
  return { label: "✅ OK", color: "#22c55e" };
}

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [catFilter, setCatFilter] = useState("Tutti");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ name: "", category: "MDF", unit: "pz", cost: 0, price: 0, stock: 0, minStock: 5, supplier: "", sku: "", notes: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [view, setView] = useState<"grid"|"table">("table");

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await apiFetch("/api/products").catch(() => ({ data: [] }));
    setItems(res.data || []);
  }

  async function save() {
    if (editId) await apiFetch(`/api/products/${editId}`, { method: "PUT", body: JSON.stringify(form) });
    else await apiFetch("/api/products", { method: "POST", body: JSON.stringify(form) });
    setModal(false); setEditId(null);
    setForm({ name: "", category: "MDF", unit: "pz", cost: 0, price: 0, stock: 0, minStock: 5, supplier: "", sku: "", notes: "" });
    load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare?")) return;
    await apiFetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = items.filter(i => {
    const catOk = catFilter === "Tutti" || i.category === catFilter;
    const searchOk = !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.sku?.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  const totalItems = items.length;
  const lowStock = items.filter(i => avail(i).label !== "✅ OK").length;
  const totalValue = items.reduce((s, i) => s + (i.cost || 0) * (i.stock || 0), 0);

  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar categorie */}
      <div style={{ width: 200, background: "#0a0f1a", borderRight: "1px solid #1e293b", overflowY: "auto", flexShrink: 0, padding: "12px 0" }}>
        <div style={{ padding: "8px 12px 4px", fontSize: 9, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 0.8 }}>Categorie</div>
        <div onClick={() => setCatFilter("Tutti")} style={{ padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: catFilter === "Tutti" ? 700 : 500, color: catFilter === "Tutti" ? "#38bdf8" : "#94a3b8", background: catFilter === "Tutti" ? "#38bdf812" : "transparent", borderLeft: `2px solid ${catFilter === "Tutti" ? "#38bdf8" : "transparent"}`, display: "flex", justifyContent: "space-between" }}>
          <span>📋 Tutti</span><span style={{ fontSize: 9, background: "#1e293b", borderRadius: 10, padding: "1px 6px" }}>{items.length}</span>
        </div>
        {CATEGORIES.map(grp => (
          <div key={grp.group}>
            <div style={{ padding: "8px 12px 3px", fontSize: 9, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5 }}>{grp.group}</div>
            {grp.cats.map(cat => {
              const count = items.filter(i => i.category === cat).length;
              if (count === 0) return null;
              const active = catFilter === cat;
              return (
                <div key={cat} onClick={() => setCatFilter(cat)} style={{ padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "#38bdf8" : "#64748b", background: active ? "#38bdf812" : "transparent", borderLeft: `2px solid ${active ? "#38bdf8" : "transparent"}`, display: "flex", justifyContent: "space-between" }}>
                  <span>{cat}</span><span style={{ fontSize: 9, background: "#1e293b", borderRadius: 10, padding: "1px 5px" }}>{count}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#38bdf8", margin: 0 }}>🗄️ Magazzino</h1>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{totalItems} articoli · {lowStock} sotto scorta · Valore: €{totalValue.toFixed(0)}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cerca..." style={{ ...inp, width: 200 }} />
            <button onClick={() => { setForm({ name: "", category: catFilter !== "Tutti" ? catFilter : "MDF", unit: "pz", cost: 0, price: 0, stock: 0, minStock: 5, supplier: "", sku: "", notes: "" }); setEditId(null); setModal(true); }} style={{ background: "#38bdf8", color: "#000", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
              + Aggiungi
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Totale Articoli", val: totalItems, color: "#38bdf8" },
            { label: "Scorte Basse", val: items.filter(i => avail(i).label === "⚠️ Scorta Bassa").length, color: "#f59e0b" },
            { label: "Esauriti", val: items.filter(i => avail(i).label === "❌ Esaurito").length, color: "#ef4444" },
            { label: "Valore Totale", val: `€${totalValue.toFixed(0)}`, color: "#22c55e" },
          ].map(k => (
            <div key={k.label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{k.val}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                {["Articolo", "SKU", "Categoria", "Costo", "Prezzo", "Stock", "Min", "Stato", ""].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const st = avail(item);
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #0f172a" }}>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: "11px 14px", fontSize: 11, color: "#475569" }}>{item.sku || "—"}</td>
                    <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 10, padding: "2px 8px", background: "#1e293b", borderRadius: 4, color: "#94a3b8" }}>{item.category}</span></td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "#f59e0b" }}>€{(item.cost||0).toFixed(2)}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "#22c55e" }}>€{(item.price||0).toFixed(2)}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: st.color }}>{item.stock || 0} {item.unit}</td>
                    <td style={{ padding: "11px 14px", fontSize: 11, color: "#475569" }}>{item.minStock || 0}</td>
                    <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 10, color: st.color, fontWeight: 700 }}>{st.label}</span></td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { setForm({ name: item.name, category: item.category || "Altro", unit: item.unit || "pz", cost: item.cost || 0, price: item.price || 0, stock: item.stock || 0, minStock: item.minStock || 0, supplier: item.supplier || "", sku: item.sku || "", notes: item.description || "" }); setEditId(item.id); setModal(true); }} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                        <button onClick={() => del(item.id)} style={{ background: "none", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 13 }}>Nessun articolo in magazzino. Aggiungi il primo!</div>}
        </div>
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 560, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", marginBottom: 20 }}>{editId ? "Modifica" : "Nuovo"} Articolo</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOME *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} placeholder="es. MDF 3mm 60x40cm" /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} style={inp} placeholder="es. MDF-3MM-001" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CATEGORIA</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                    {CATEGORIES.flatMap(g => g.cats).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>UNITÀ</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={inp}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>COSTO €</label><input type="number" step={0.01} value={form.cost} onChange={e => setForm({ ...form, cost: +e.target.value })} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>PREZZO €</label><input type="number" step={0.01} value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>STOCK</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>MINIMO</label><input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: +e.target.value })} style={inp} /></div>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>FORNITORE</label><input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} style={inp} placeholder="es. Orafal Italia" /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTE</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inp} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={save} disabled={!form.name} style={{ flex: 1, background: "#38bdf8", color: "#000", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontWeight: 700 }}>{editId ? "Salva" : "Aggiungi"}</button>
              <button onClick={() => { setModal(false); setEditId(null); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
