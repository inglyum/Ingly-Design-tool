"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const CATEGORIES = ["materiale", "laser", "manodopera", "verniciatura", "gadget", "generico"];

export default function MaterialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ name: "", category: "materiale", unit: "mq", costPerUnit: 0, pricePerUnit: 0, stock: 0, minStock: 0 });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await apiFetch("/api/materials").catch(() => ({ data: [] }));
    setItems(res.data || []);
  }

  async function save() {
    setLoading(true);
    if (editId) await apiFetch(`/api/materials/${editId}`, { method: "PUT", body: JSON.stringify(form) });
    else await apiFetch("/api/materials", { method: "POST", body: JSON.stringify(form) });
    setModal(false); setEditId(null); setForm({ name: "", category: "materiale", unit: "mq", costPerUnit: 0, pricePerUnit: 0, stock: 0, minStock: 0 });
    setLoading(false); load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare?")) return;
    await apiFetch(`/api/materials/${id}`, { method: "DELETE" });
    load();
  }

  function openEdit(item: any) {
    setForm({ name: item.name, category: item.category, unit: item.unit, costPerUnit: item.costPerUnit, pricePerUnit: item.pricePerUnit, stock: item.stock, minStock: item.minStock, notes: item.notes || "" });
    setEditId(item.id); setModal(true);
  }

  const filtered = items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()));

  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>🪵 Materiali & Risorse</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Listino per Smart Quoter — {items.length} risorse</p>
        </div>
        <button onClick={() => { setForm({ name: "", category: "materiale", unit: "mq", costPerUnit: 0, pricePerUnit: 0, stock: 0, minStock: 0 }); setEditId(null); setModal(true); }} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
          + Aggiungi Risorsa
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cerca risorsa..." style={{ ...inp, marginBottom: 16, maxWidth: 320 }} />

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["Nome", "Categoria", "Unità", "Costo/Unit", "Prezzo/Unit", "Stock", "Margine", ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const margin = item.pricePerUnit > 0 ? ((item.pricePerUnit - item.costPerUnit) / item.pricePerUnit * 100) : 0;
              const lowStock = item.stock > 0 && item.stock <= item.minStock;
              return (
                <tr key={item.id} style={{ borderBottom: "1px solid #0f172a" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>
                    {lowStock && <span style={{ color: "#f59e0b", marginRight: 4 }}>⚠️</span>}
                    {item.name}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 10, padding: "3px 8px", background: "#1e293b", borderRadius: 4, color: "#94a3b8" }}>{item.category}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{item.unit}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#f59e0b" }}>€{item.costPerUnit?.toFixed(2)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#22c55e" }}>€{item.pricePerUnit?.toFixed(2)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: lowStock ? "#f59e0b" : "#64748b" }}>{item.stock} {item.unit}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: margin >= 30 ? "#22c55e" : margin >= 15 ? "#f59e0b" : "#ef4444" }}>{margin.toFixed(0)}%</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(item)} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>Modifica</button>
                      <button onClick={() => del(item.id)} style={{ background: "none", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🪵</div>
            <p style={{ fontSize: 13 }}>Nessun materiale. Aggiungi le risorse per usarle nello Smart Quoter.</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 480, maxWidth: "95vw" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 20 }}>{editId ? "Modifica" : "Nuova"} Risorsa</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Nome *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="es. MDF 3mm, Laser 50W..." style={inp} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Categoria</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Unità</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={inp}>
                    {["mq", "pz", "ml", "ora", "min", "kg", "g", "lt"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Costo/Unità €</label>
                  <input type="number" step="0.01" value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: +e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Prezzo/Unità €</label>
                  <input type="number" step="0.01" value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: +e.target.value })} style={inp} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Stock attuale</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Stock minimo</label>
                  <input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: +e.target.value })} style={inp} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Note</label>
                <input value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} style={inp} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={save} disabled={loading || !form.name} style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontWeight: 700 }}>
                {loading ? "..." : editId ? "Salva Modifiche" : "Aggiungi"}
              </button>
              <button onClick={() => { setModal(false); setEditId(null); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
