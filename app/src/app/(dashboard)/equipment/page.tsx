"use client";
import { useState, useEffect } from "react";

const CATS = ["Tutte","Laser","Stampa 3D","CNC","Utensili","PC & Software","Strumenti di misura","Altro"];
const STATUS_COLOR: Record<string,string> = { "operativa":"#22c55e","manutenzione":"#f59e0b","guasta":"#ef4444","dismessa":"#475569" };

interface Equipment {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: "operativa"|"manutenzione"|"guasta"|"dismessa";
  location: string;
  notes: string;
  lastMaintenance: string;
  nextMaintenance: string;
  warrantyExpiry: string;
  powerW: number;
  hoursUsed: number;
}

const EMPTY: Equipment = { id:"", name:"", category:"Laser", brand:"", model:"", serialNumber:"", purchaseDate:"", purchasePrice:0, currentValue:0, status:"operativa", location:"", notes:"", lastMaintenance:"", nextMaintenance:"", warrantyExpiry:"", powerW:0, hoursUsed:0 };

export default function EquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [catFilter, setCatFilter] = useState("Tutte");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Equipment>({ ...EMPTY });
  const [editId, setEditId] = useState<string|null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ingly_equipment");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  function persist(list: Equipment[]) {
    setItems(list);
    localStorage.setItem("ingly_equipment", JSON.stringify(list));
  }

  function save() {
    const item = { ...form, id: editId || Date.now().toString() };
    persist(editId ? items.map(i => i.id === editId ? item : i) : [...items, item]);
    setModal(false); setEditId(null); setForm({ ...EMPTY });
  }

  function del(id: string) {
    if (!confirm("Eliminare attrezzatura?")) return;
    persist(items.filter(i => i.id !== id));
  }

  function openEdit(eq: Equipment) {
    setForm({ ...eq }); setEditId(eq.id); setModal(true);
  }

  const filtered = catFilter === "Tutte" ? items : items.filter(i => i.category === catFilter);
  const totalValue = items.reduce((a, b) => a + (b.currentValue || 0), 0);
  const totalCost = items.reduce((a, b) => a + (b.purchasePrice || 0), 0);
  const depreciazione = totalCost > 0 ? ((totalCost - totalValue) / totalCost * 100) : 0;
  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>🔧 Attrezzature</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{items.length} attrezzature · Valore totale €{totalValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setModal(true); }} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ Aggiungi</button>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Costo Totale", val: `€${totalCost.toLocaleString("it-IT",{minimumFractionDigits:2})}`, color: "#6366f1" },
          { label: "Valore Attuale", val: `€${totalValue.toLocaleString("it-IT",{minimumFractionDigits:2})}`, color: "#22c55e" },
          { label: "Deprezzamento", val: `${depreciazione.toFixed(1)}%`, color: "#f59e0b" },
          { label: "In Manutenzione", val: items.filter(i => i.status === "manutenzione").length.toString(), color: "#ef4444" },
        ].map(k => (
          <div key={k.label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Cat filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {CATS.map(c => <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #334155", background: catFilter === c ? "#6366f1" : "transparent", color: catFilter === c ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: 11, fontWeight: catFilter === c ? 700 : 500 }}>{c}</button>)}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {filtered.map(eq => (
          <div key={eq.id} style={{ background: "#0f172a", border: `1px solid ${STATUS_COLOR[eq.status]}30`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, padding: "2px 8px", background: `${STATUS_COLOR[eq.status]}20`, color: STATUS_COLOR[eq.status], borderRadius: 10, fontWeight: 700 }}>{eq.status}</span>
              <span style={{ fontSize: 10, color: "#64748b" }}>{eq.category}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>{eq.name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>{eq.brand} {eq.model}{eq.serialNumber ? ` · SN: ${eq.serialNumber}` : ""}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
              <div style={{ background: "#0a0f1a", borderRadius: 6, padding: "6px 10px" }}>
                <div style={{ fontSize: 9, color: "#475569" }}>Acquisto</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>€{(eq.purchasePrice||0).toFixed(0)}</div>
              </div>
              <div style={{ background: "#0a0f1a", borderRadius: 6, padding: "6px 10px" }}>
                <div style={{ fontSize: 9, color: "#475569" }}>Valore</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>€{(eq.currentValue||0).toFixed(0)}</div>
              </div>
            </div>
            {eq.nextMaintenance && <div style={{ fontSize: 10, color: new Date(eq.nextMaintenance) < new Date() ? "#ef4444" : "#f59e0b", marginBottom: 8 }}>🔧 Manutenzione: {new Date(eq.nextMaintenance).toLocaleDateString("it-IT")}</div>}
            {eq.location && <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>📍 {eq.location}</div>}
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button onClick={() => openEdit(eq)} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>✏️ Modifica</button>
              <button onClick={() => del(eq.id)} style={{ background: "none", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}>✕</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#475569" }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>🔧</div>
          <p style={{ fontSize: 13 }}>Nessuna attrezzatura. Aggiungi la tua prima macchina!</p>
        </div>}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 600, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>{editId ? "Modifica" : "Nuova"} Attrezzatura</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOME *</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} style={inp} placeholder="es. Laser CO2 100W" /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CATEGORIA</label><select value={form.category} onChange={e => setForm({...form,category:e.target.value})} style={inp}>{CATS.filter(c=>c!=="Tutte").map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>BRAND</label><input value={form.brand} onChange={e => setForm({...form,brand:e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>MODELLO</label><input value={form.model} onChange={e => setForm({...form,model:e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>SERIALE</label><input value={form.serialNumber} onChange={e => setForm({...form,serialNumber:e.target.value})} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>COSTO ACQUISTO €</label><input type="number" value={form.purchasePrice} onChange={e => setForm({...form,purchasePrice:+e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>VALORE ATTUALE €</label><input type="number" value={form.currentValue} onChange={e => setForm({...form,currentValue:+e.target.value})} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>DATA ACQUISTO</label><input type="date" value={form.purchaseDate} onChange={e => setForm({...form,purchaseDate:e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>GARANZIA</label><input type="date" value={form.warrantyExpiry} onChange={e => setForm({...form,warrantyExpiry:e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>STATUS</label><select value={form.status} onChange={e => setForm({...form,status:e.target.value as Equipment["status"]})} style={inp}>{Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}</select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>ULTIMA MANUTENZIONE</label><input type="date" value={form.lastMaintenance} onChange={e => setForm({...form,lastMaintenance:e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>PROSSIMA MANUTENZIONE</label><input type="date" value={form.nextMaintenance} onChange={e => setForm({...form,nextMaintenance:e.target.value})} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>POTENZA (W)</label><input type="number" value={form.powerW} onChange={e => setForm({...form,powerW:+e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>ORE UTILIZZATE</label><input type="number" value={form.hoursUsed} onChange={e => setForm({...form,hoursUsed:+e.target.value})} style={inp} /></div>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>POSIZIONE</label><input value={form.location} onChange={e => setForm({...form,location:e.target.value})} style={inp} placeholder="es. Laboratorio A" /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTE</label><textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} rows={3} style={{...inp,resize:"none"}} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={save} disabled={!form.name} style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 700 }}>{editId ? "Salva" : "Aggiungi"}</button>
              <button onClick={() => { setModal(false); setEditId(null); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
