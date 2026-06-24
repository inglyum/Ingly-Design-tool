"use client";
import { useState, useEffect } from "react";

const CATS = ["Tutte","Materiali","Utensili","Componenti","Prodotti Chimici","Elettronica","Imballaggio","Ufficio","Altro"];
const PRIOS = ["Alta","Media","Bassa"];

interface LabItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  supplier: string;
  estimatedPrice: number;
  link: string;
  notes: string;
  purchased: boolean;
  priority: string;
  addedAt: string;
}

interface LabTool {
  id: string;
  name: string;
  category: string;
  status: "disponibile"|"in uso"|"rotto"|"in riparazione";
  location: string;
  notes: string;
}

const EMPTY_ITEM: LabItem = { id:"", name:"", category:"Materiali", brand:"", quantity:1, unit:"pz", minQuantity:1, supplier:"", estimatedPrice:0, link:"", notes:"", purchased:false, priority:"Media", addedAt:"" };

export default function LabSetupPage() {
  const [items, setItems] = useState<LabItem[]>([]);
  const [tools, setTools] = useState<LabTool[]>([]);
  const [tab, setTab] = useState<"shopping"|"tools">("shopping");
  const [catFilter, setCatFilter] = useState("Tutte");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<LabItem>({ ...EMPTY_ITEM });
  const [editId, setEditId] = useState<string|null>(null);
  const [showPurchased, setShowPurchased] = useState(false);

  useEffect(() => {
    const a = localStorage.getItem("ingly_lab_items"); if (a) setItems(JSON.parse(a));
    const t = localStorage.getItem("ingly_lab_tools"); if (t) setTools(JSON.parse(t));
  }, []);

  function persistItems(list: LabItem[]) { setItems(list); localStorage.setItem("ingly_lab_items", JSON.stringify(list)); }
  function persistTools(list: LabTool[]) { setTools(list); localStorage.setItem("ingly_lab_tools", JSON.stringify(list)); }

  function saveItem() {
    const item = { ...form, id: editId || Date.now().toString(), addedAt: editId ? form.addedAt : new Date().toISOString() };
    persistItems(editId ? items.map(i => i.id === editId ? item : i) : [...items, item]);
    setModal(false); setEditId(null); setForm({ ...EMPTY_ITEM });
  }

  function delItem(id: string) { if (confirm("Eliminare?")) persistItems(items.filter(i => i.id !== id)); }
  function togglePurchased(id: string) { persistItems(items.map(i => i.id === id ? { ...i, purchased: !i.purchased } : i)); }

  // AI suggestion (simulate)
  function aiSuggest() {
    const lowStock = items.filter(i => !i.purchased && i.quantity <= i.minQuantity);
    if (lowStock.length === 0) { alert("✅ Nessun articolo da ordinare urgentemente!"); return; }
    alert(`🔔 ${lowStock.length} articoli da ordinare:\n${lowStock.map(i => `• ${i.name} (${i.quantity}/${i.minQuantity} ${i.unit})`).join("\n")}`);
  }

  const filtered = items.filter(i => {
    const catOk = catFilter === "Tutte" || i.category === catFilter;
    const purchOk = showPurchased || !i.purchased;
    return catOk && purchOk;
  });

  const totalBudget = items.filter(i => !i.purchased).reduce((a, b) => a + b.estimatedPrice * b.quantity, 0);
  const toBuy = items.filter(i => !i.purchased).length;

  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" };
  const PRIO_COLOR: Record<string,string> = { Alta: "#ef4444", Media: "#f59e0b", Bassa: "#64748b" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>🔬 Lab & Lista Acquisti</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{toBuy} articoli da acquistare · Budget stimato €{totalBudget.toFixed(2)}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={aiSuggest} style={{ background: "#f59e0b20", color: "#f59e0b", border: "1px solid #f59e0b40", borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>🤖 AI Check</button>
          <button onClick={() => { setForm({ ...EMPTY_ITEM }); setEditId(null); setModal(true); }} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ Aggiungi</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["shopping","tools"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #334155", background: tab === t ? "#6366f1" : "transparent", color: tab === t ? "#fff" : "#94a3b8", cursor: "pointer", fontWeight: tab === t ? 700 : 500, fontSize: 13 }}>
            {t === "shopping" ? "🛒 Lista Acquisti" : "🔧 Setup Lab"}
          </button>
        ))}
      </div>

      {tab === "shopping" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {CATS.map(c => <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #334155", background: catFilter === c ? "#6366f1" : "transparent", color: catFilter === c ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: 11, fontWeight: catFilter === c ? 700 : 500 }}>{c}</button>)}
            <button onClick={() => setShowPurchased(!showPurchased)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #334155", background: showPurchased ? "#22c55e" : "transparent", color: showPurchased ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: 11 }}>{showPurchased ? "✓ Acquistati" : "Acquistati"}</button>
          </div>

          {/* Items */}
          <div style={{ display: "grid", gap: 8 }}>
            {filtered.sort((a,b) => PRIOS.indexOf(a.priority) - PRIOS.indexOf(b.priority)).map(item => (
              <div key={item.id} style={{ background: "#0f172a", border: `1px solid ${item.purchased ? "#22c55e30" : PRIO_COLOR[item.priority]+"30"}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, opacity: item.purchased ? 0.6 : 1 }}>
                <input type="checkbox" checked={item.purchased} onChange={() => togglePurchased(item.id)} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.purchased ? "#475569" : "#f1f5f9", textDecoration: item.purchased ? "line-through" : "none" }}>{item.name}</span>
                    <span style={{ fontSize: 9, padding: "1px 6px", background: `${PRIO_COLOR[item.priority]}20`, color: PRIO_COLOR[item.priority], borderRadius: 8, fontWeight: 700 }}>{item.priority}</span>
                    <span style={{ fontSize: 10, color: "#64748b" }}>{item.category}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{item.brand && `${item.brand} · `}{item.quantity} {item.unit}{item.supplier && ` · ${item.supplier}`}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>€{(item.estimatedPrice * item.quantity).toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>€{item.estimatedPrice.toFixed(2)}/{item.unit}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ background: "none", border: "1px solid #334155", color: "#6366f1", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, textDecoration: "none" }}>🔗</a>}
                  <button onClick={() => { setForm({ ...item }); setEditId(item.id); setModal(true); }} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>✏️</button>
                  <button onClick={() => delItem(item.id)} style={{ background: "none", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>✕</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>🛒</div>
              <p style={{ fontSize: 13 }}>Lista acquisti vuota. Aggiungi il primo articolo!</p>
            </div>}
          </div>
        </>
      )}

      {tab === "tools" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {/* Static lab setup info */}
          {[
            { name: "Laser CO2", desc: "Incisione e taglio materiali", status: "Impostazioni macchina →", href: "/laser-calc" },
            { name: "Attrezzature", desc: "Macchine e strumenti del laboratorio", status: "Gestisci →", href: "/equipment" },
            { name: "Risorse Laser", desc: "Listino materiali e costi", status: "Gestisci →", href: "/materials" },
            { name: "Magazzino", desc: "Inventario articoli finiti e semilavorati", status: "Gestisci →", href: "/items" },
          ].map(card => (
            <a key={card.name} href={card.href} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20, textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{card.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{card.desc}</div>
              <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>{card.status}</div>
            </a>
          ))}
        </div>
      )}

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 540, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>{editId ? "Modifica" : "Nuovo"} Articolo</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOME *</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CATEGORIA</label><select value={form.category} onChange={e => setForm({...form,category:e.target.value})} style={inp}>{CATS.filter(c=>c!=="Tutte").map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>QTÀ</label><input type="number" value={form.quantity} onChange={e => setForm({...form,quantity:+e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>UNITÀ</label><input value={form.unit} onChange={e => setForm({...form,unit:e.target.value})} style={inp} placeholder="pz, kg, m..." /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>QTÀ MIN</label><input type="number" value={form.minQuantity} onChange={e => setForm({...form,minQuantity:+e.target.value})} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>BRAND</label><input value={form.brand} onChange={e => setForm({...form,brand:e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>FORNITORE</label><input value={form.supplier} onChange={e => setForm({...form,supplier:e.target.value})} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>PREZZO STIM. €</label><input type="number" step="0.01" value={form.estimatedPrice} onChange={e => setForm({...form,estimatedPrice:+e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>PRIORITÀ</label><select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})} style={inp}>{PRIOS.map(p=><option key={p}>{p}</option>)}</select></div>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>LINK (Amazon, sito fornitore...)</label><input value={form.link} onChange={e => setForm({...form,link:e.target.value})} style={inp} placeholder="https://..." /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTE</label><textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} rows={2} style={{...inp,resize:"none"}} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={saveItem} disabled={!form.name} style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 700 }}>{editId ? "Salva" : "Aggiungi"}</button>
              <button onClick={() => { setModal(false); setEditId(null); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
