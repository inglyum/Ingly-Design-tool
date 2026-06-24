"use client";
import { useState, useEffect } from "react";

const CATS = ["📋 Tutte","💡 Prodotto","🎨 Design","🌐 Marketing","⚙️ Processo","🤝 Clienti","💰 Business","🔬 R&D","📱 Social","🛒 Etsy"];
const PRIOS = ["Alta","Media","Bassa"];
const STATI = ["idea","studio","pianificato","in corso","fatto","archiviato"];
const STATI_COLOR: Record<string,string> = { idea:"#6366f1",studio:"#f59e0b","in corso":"#22c55e",pianificato:"#3b82f6",fatto:"#10b981",archiviato:"#475569" };

interface Idea { id: string; title: string; desc: string; category: string; priority: string; status: string; tags: string; createdAt: string; }

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [catFilter, setCatFilter] = useState("📋 Tutte");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", category: "💡 Prodotto", priority: "Media", status: "idea", tags: "" });
  const [editId, setEditId] = useState<string|null>(null);
  const [expandId, setExpandId] = useState<string|null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ingly_ideas");
    if (saved) setIdeas(JSON.parse(saved));
  }, []);

  function persist(list: Idea[]) {
    setIdeas(list);
    localStorage.setItem("ingly_ideas", JSON.stringify(list));
  }

  function save() {
    const list = editId
      ? ideas.map(i => i.id === editId ? { ...i, ...form } : i)
      : [...ideas, { id: Date.now().toString(), ...form, createdAt: new Date().toISOString() }];
    persist(list);
    setModal(false); setEditId(null);
    setForm({ title: "", desc: "", category: "💡 Prodotto", priority: "Media", status: "idea", tags: "" });
  }

  function del(id: string) {
    if (!confirm("Eliminare idea?")) return;
    persist(ideas.filter(i => i.id !== id));
  }

  function changeStatus(id: string, status: string) {
    persist(ideas.map(i => i.id === id ? { ...i, status } : i));
  }

  const filtered = ideas.filter(i => {
    const catOk = catFilter === "📋 Tutte" || i.category === catFilter;
    const srch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.tags?.toLowerCase().includes(search.toLowerCase());
    return catOk && srch;
  });

  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24", margin: 0 }}>💡 Idee & Ispirazione</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{ideas.length} idee registrate</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cerca..." style={{ ...inp, width: 200 }} />
          <button onClick={() => { setForm({ title: "", desc: "", category: "💡 Prodotto", priority: "Media", status: "idea", tags: "" }); setEditId(null); setModal(true); }} style={{ background: "#fbbf24", color: "#000", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ Nuova Idea</button>
        </div>
      </div>

      {/* Cat filters */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #334155", background: catFilter === c ? "#fbbf24" : "transparent", color: catFilter === c ? "#000" : "#94a3b8", cursor: "pointer", fontSize: 11, fontWeight: catFilter === c ? 700 : 500 }}>{c}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {STATI.map(st => {
          const count = ideas.filter(i => i.status === st).length;
          return <div key={st} style={{ background: "#0f172a", border: `1px solid ${STATI_COLOR[st]}40`, borderRadius: 8, padding: "8px 14px", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATI_COLOR[st], display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "capitalize" }}>{st}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: STATI_COLOR[st] }}>{count}</span>
          </div>;
        })}
      </div>

      {/* Ideas grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {filtered.map(idea => (
          <div key={idea.id} style={{ background: "#0f172a", border: `1px solid ${STATI_COLOR[idea.status] || "#1e293b"}30`, borderRadius: 12, padding: 18, cursor: "pointer", transition: "border-color 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, padding: "2px 8px", background: `${STATI_COLOR[idea.status]}20`, color: STATI_COLOR[idea.status], borderRadius: 10, fontWeight: 700, textTransform: "capitalize" }}>{idea.status}</span>
              <span style={{ fontSize: 10, color: idea.priority === "Alta" ? "#ef4444" : idea.priority === "Media" ? "#f59e0b" : "#64748b", fontWeight: 600 }}>{"▲".repeat(idea.priority === "Alta" ? 3 : idea.priority === "Media" ? 2 : 1)} {idea.priority}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{idea.title}</div>
            {idea.desc && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10, lineHeight: 1.5, display: expandId === idea.id ? "block" : "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }} onClick={() => setExpandId(expandId === idea.id ? null : idea.id)}>{idea.desc}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 10, color: "#475569" }}>{idea.category}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <select value={idea.status} onChange={e => changeStatus(idea.id, e.target.value)} onClick={e => e.stopPropagation()} style={{ fontSize: 10, background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 6, padding: "3px 6px", cursor: "pointer" }}>
                  {STATI.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={e => { e.stopPropagation(); setForm({ title: idea.title, desc: idea.desc, category: idea.category, priority: idea.priority, status: idea.status, tags: idea.tags || "" }); setEditId(idea.id); setModal(true); }} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 10 }}>✏️</button>
                <button onClick={e => { e.stopPropagation(); del(idea.id); }} style={{ background: "none", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 10 }}>✕</button>
              </div>
            </div>
            {idea.tags && <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {idea.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => <span key={t} style={{ fontSize: 9, padding: "1px 7px", background: "#1e293b", borderRadius: 10, color: "#64748b" }}>{t}</span>)}
            </div>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#475569" }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>💡</div>
            <p style={{ fontSize: 13 }}>Nessuna idea. Inizia a registrare le tue ispirazioni!</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 520, maxWidth: "95vw" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fbbf24", marginBottom: 20 }}>{editId ? "Modifica" : "Nuova"} Idea</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TITOLO *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inp} placeholder="Descrivi l'idea in una riga..." /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>DESCRIZIONE</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={4} style={{ ...inp, resize: "none" }} placeholder="Dettagli, ispirazione, note..." /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CATEGORIA</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                    {CATS.filter(c => c !== "📋 Tutte").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>PRIORITÀ</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inp}>
                    {PRIOS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>STATO</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inp}>
                    {STATI.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TAG (separati da virgola)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} style={inp} placeholder="laser, portachiavi, etsy..." /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={save} disabled={!form.title} style={{ flex: 1, background: "#fbbf24", color: "#000", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontWeight: 700 }}>{editId ? "Salva" : "Aggiungi"}</button>
              <button onClick={() => { setModal(false); setEditId(null); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
