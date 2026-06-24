"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function SuppliersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ name: "", contactName: "", email: "", phone: "", city: "", category: "", notes: "", rating: 0 });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await apiFetch("/api/suppliers").catch(() => ({ data: [] }));
    setItems(res.data || []);
  }

  async function save() {
    if (editId) await apiFetch(`/api/suppliers/${editId}`, { method: "PUT", body: JSON.stringify(form) });
    else await apiFetch("/api/suppliers", { method: "POST", body: JSON.stringify(form) });
    setModal(false); setEditId(null);
    setForm({ name: "", contactName: "", email: "", phone: "", city: "", category: "", notes: "", rating: 0 });
    load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare fornitore?")) return;
    await apiFetch(`/api/suppliers/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase()));
  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>🏭 Fornitori</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{items.length} fornitori registrati</p>
        </div>
        <button onClick={() => { setForm({ name: "", contactName: "", email: "", phone: "", city: "", category: "", notes: "", rating: 0 }); setEditId(null); setModal(true); }} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
          + Aggiungi Fornitore
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cerca fornitore..." style={{ ...inp, marginBottom: 16, maxWidth: 320 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map(item => (
          <div key={item.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>{item.name}</div>
                {item.category && <span style={{ fontSize: 10, padding: "2px 8px", background: "#1e293b", borderRadius: 4, color: "#94a3b8", marginTop: 4, display: "inline-block" }}>{item.category}</span>}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {"★".repeat(item.rating || 0).split("").map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 12 }}>★</span>)}
                {"☆".repeat(5 - (item.rating || 0)).split("").map((_, i) => <span key={i} style={{ color: "#334155", fontSize: 12 }}>☆</span>)}
              </div>
            </div>
            {item.contactName && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>👤 {item.contactName}</div>}
            {item.email && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>✉️ {item.email}</div>}
            {item.phone && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>📞 {item.phone}</div>}
            {item.city && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>📍 {item.city}</div>}
            {item.notes && <div style={{ fontSize: 11, color: "#475569", padding: "6px 8px", background: "#0a0f1a", borderRadius: 6, marginBottom: 10 }}>{item.notes}</div>}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {item.email && <a href={`mailto:${item.email}`} style={{ flex: 1, background: "#1e293b", color: "#6366f1", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11, textAlign: "center", textDecoration: "none" }}>✉️ Email</a>}
              {item.phone && <a href={`tel:${item.phone}`} style={{ flex: 1, background: "#1e293b", color: "#22c55e", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11, textAlign: "center", textDecoration: "none" }}>📞 Chiama</a>}
              <button onClick={() => { setForm({ name: item.name, contactName: item.contactName || "", email: item.email || "", phone: item.phone || "", city: item.city || "", category: item.category || "", notes: item.notes || "", rating: item.rating || 0 }); setEditId(item.id); setModal(true); }} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11 }}>✏️</button>
              <button onClick={() => del(item.id)} style={{ background: "none", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11 }}>✕</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🏭</div>
            <p style={{ fontSize: 13 }}>Nessun fornitore. Aggiungi i tuoi fornitori per gestirli facilmente.</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 500, maxWidth: "95vw" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 20 }}>{editId ? "Modifica" : "Nuovo"} Fornitore</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {[["Nome *", "name", "es. Orafal Italia"], ["Contatto", "contactName", "Nome referente"], ["Email", "email", "info@fornitore.it"], ["Telefono", "phone", "+39 02 1234567"], ["Città", "city", "Milano"], ["Categoria", "category", "es. materiali, macchinari..."]].map(([lbl, key, ph]) => (
                <div key={key}>
                  <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{lbl.toUpperCase()}</label>
                  <input value={form[key] || ""} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>VALUTAZIONE</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setForm({ ...form, rating: n })} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: n <= form.rating ? "#f59e0b" : "#334155" }}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTE</label>
                <textarea value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inp, resize: "none" }} />
              </div>
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
