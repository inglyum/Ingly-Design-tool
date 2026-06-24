"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const CATEGORIES = ["affitto", "macchinari", "utenze", "personale", "software", "marketing", "trasporto", "altro"];
const FREQUENCIES = [
  { value: "monthly", label: "Mensile" },
  { value: "quarterly", label: "Trimestrale" },
  { value: "yearly", label: "Annuale" },
  { value: "weekly", label: "Settimanale" },
];

function toMonthly(amount: number, freq: string) {
  if (freq === "monthly") return amount;
  if (freq === "quarterly") return amount / 3;
  if (freq === "yearly") return amount / 12;
  if (freq === "weekly") return amount * 4.33;
  return amount;
}

export default function FixedCostsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ name: "", amount: 0, frequency: "monthly", category: "altro", active: true, notes: "" });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await apiFetch("/api/fixed-costs").catch(() => ({ data: [] }));
    setItems(res.data || []);
  }

  async function save() {
    if (editId) await apiFetch(`/api/fixed-costs/${editId}`, { method: "PUT", body: JSON.stringify(form) });
    else await apiFetch("/api/fixed-costs", { method: "POST", body: JSON.stringify(form) });
    setModal(false); setEditId(null);
    setForm({ name: "", amount: 0, frequency: "monthly", category: "altro", active: true });
    load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare?")) return;
    await apiFetch(`/api/fixed-costs/${id}`, { method: "DELETE" });
    load();
  }

  const activeItems = items.filter(i => i.active);
  const totalMonthly = activeItems.reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0);
  const totalYearly = totalMonthly * 12;

  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>🧾 Costi Fissi</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Gestione costi fissi ricorrenti</p>
        </div>
        <button onClick={() => { setForm({ name: "", amount: 0, frequency: "monthly", category: "altro", active: true }); setEditId(null); setModal(true); }} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
          + Aggiungi Costo
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>COSTI MENSILI ATTIVI</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ef4444" }}>€{totalMonthly.toFixed(2)}</div>
        </div>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>COSTI ANNUALI</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f97316" }}>€{totalYearly.toFixed(2)}</div>
        </div>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>VOCI ATTIVE</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#6366f1" }}>{activeItems.length}</div>
        </div>
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["", "Nome", "Categoria", "Importo", "Frequenza", "Equiv. Mensile", ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid #0f172a", opacity: item.active ? 1 : 0.4 }}>
                <td style={{ padding: "12px 16px" }}>
                  <input type="checkbox" checked={item.active} onChange={async () => {
                    await apiFetch(`/api/fixed-costs/${item.id}`, { method: "PUT", body: JSON.stringify({ active: !item.active }) });
                    load();
                  }} style={{ cursor: "pointer" }} />
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 10, padding: "3px 8px", background: "#1e293b", borderRadius: 4, color: "#94a3b8" }}>{item.category}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>€{item.amount?.toFixed(2)}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{FREQUENCIES.find(f => f.value === item.frequency)?.label}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#ef4444", fontWeight: 600 }}>€{toMonthly(item.amount, item.frequency).toFixed(2)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { setForm({ name: item.name, amount: item.amount, frequency: item.frequency, category: item.category, active: item.active, notes: item.notes || "" }); setEditId(item.id); setModal(true); }} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>Modifica</button>
                    <button onClick={() => del(item.id)} style={{ background: "none", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#475569", fontSize: 13 }}>
            Nessun costo fisso. Aggiungi le spese ricorrenti (affitto, software, utenze...).
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 460, maxWidth: "95vw" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 20 }}>{editId ? "Modifica" : "Nuovo"} Costo Fisso</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOME *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} placeholder="es. Affitto laboratorio" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>IMPORTO €</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>FREQUENZA</label>
                  <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} style={inp}>
                    {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CATEGORIA</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTE</label>
                <input value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} style={inp} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#94a3b8" }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Attivo
              </label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={save} disabled={!form.name} style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontWeight: 700 }}>
                {editId ? "Salva" : "Aggiungi"}
              </button>
              <button onClick={() => { setModal(false); setEditId(null); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
