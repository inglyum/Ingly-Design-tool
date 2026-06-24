"use client";
import { useState, useEffect } from "react";

const MATERIALS = ["MDF 3mm","MDF 6mm","Compensato 4mm","Plexiglass 3mm","Plexiglass 5mm","Plexiglass 8mm","Legno di balsa","Carta/Cartone","Cuoio","Tessuto","Acrilico specchio","Alluminio anodizzato"];
const FINISHES = ["Nessuna","Verniciatura","Lucidatura","Sabbiatura","Anodizzazione","Stampa UV"];

interface B2BQuote {
  id: string;
  clientName: string;
  companyName: string;
  material: string;
  thickness: number;
  width: number;
  height: number;
  qty: number;
  cutLength: number;
  engravingArea: number;
  finish: string;
  unitCost: number;
  unitPrice: number;
  total: number;
  margin: number;
  notes: string;
  status: string;
  createdAt: string;
}

export default function LaserB2BPage() {
  const [quotes, setQuotes] = useState<B2BQuote[]>([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);

  // Calculator state
  const [material, setMaterial] = useState("MDF 3mm");
  const [thickness, setThickness] = useState(3);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [qty, setQty] = useState(10);
  const [cutLength, setCutLength] = useState(0);
  const [engravingArea, setEngravingArea] = useState(0);
  const [finish, setFinish] = useState("Nessuna");
  const [markup, setMarkup] = useState(2.5);
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [notes, setNotes] = useState("");

  // Machine settings (saved in localStorage)
  const [machineSettings, setMachineSettings] = useState({ euroKwh: 0.28, powerKw: 1.2, laserSpeedCut: 20, laserSpeedEng: 500, setupCost: 8 });

  useEffect(() => {
    const saved = localStorage.getItem("ingly_b2b_quotes"); if (saved) setQuotes(JSON.parse(saved));
    const ms = localStorage.getItem("ingly_b2b_machine"); if (ms) setMachineSettings(JSON.parse(ms));
  }, []);

  function persist(list: B2BQuote[]) { setQuotes(list); localStorage.setItem("ingly_b2b_quotes", JSON.stringify(list)); }

  // Cost calculation
  const area = (width * height) / 1e6; // m²
  const materialCostPerM2: Record<string,number> = { "MDF 3mm":8,"MDF 6mm":12,"Compensato 4mm":10,"Plexiglass 3mm":22,"Plexiglass 5mm":30,"Plexiglass 8mm":42,"Legno di balsa":15,"Carta/Cartone":3,"Cuoio":35,"Tessuto":18,"Acrilico specchio":38,"Alluminio anodizzato":55 };
  const matCost = area * (materialCostPerM2[material] || 10);

  const cutMinutes = cutLength > 0 ? (cutLength / 10) / machineSettings.laserSpeedCut : (width + height) * 2 / 10 / machineSettings.laserSpeedCut;
  const engMinutes = engravingArea > 0 ? (engravingArea / 100) / (machineSettings.laserSpeedEng / 60) * 10 : 0;
  const totalMinutes = cutMinutes + engMinutes;

  const laserCost = (totalMinutes / 60) * machineSettings.powerKw * machineSettings.euroKwh;
  const finishCosts: Record<string,number> = { "Nessuna":0,"Verniciatura":3,"Lucidatura":2,"Sabbiatura":4,"Anodizzazione":8,"Stampa UV":5 };
  const finishCost = finishCosts[finish] || 0;

  const unitCost = matCost + laserCost + finishCost + machineSettings.setupCost / qty;
  const unitPrice = unitCost * markup;
  const total = unitPrice * qty;
  const margin = ((unitPrice - unitCost) / unitPrice * 100);

  function saveQuote() {
    const q: B2BQuote = { id: editId || Date.now().toString(), clientName, companyName, material, thickness, width, height, qty, cutLength, engravingArea, finish, unitCost, unitPrice: parseFloat(unitPrice.toFixed(2)), total: parseFloat(total.toFixed(2)), margin: parseFloat(margin.toFixed(1)), notes, status: "preventivo", createdAt: new Date().toISOString() };
    persist(editId ? quotes.map(q2 => q2.id === editId ? q : q2) : [...quotes, q]);
    setModal(false); setEditId(null); setClientName(""); setCompanyName(""); setNotes("");
  }

  function delQuote(id: string) { if (confirm("Eliminare?")) persist(quotes.filter(q => q.id !== id)); }

  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" };
  const label = (t: string) => <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{t}</label>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>🔆 Laser B2B</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Preventivi laser per clienti business</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Calculator */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>⚡ Calcolatore Costi</div>

          <div style={{ display: "grid", gap: 12 }}>
            <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>MATERIALE</label><select value={material} onChange={e => setMaterial(e.target.value)} style={inp}>{MATERIALS.map(m=><option key={m}>{m}</option>)}</select></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div>{label("LARGHEZZA mm")}<input type="number" value={width} onChange={e => setWidth(+e.target.value)} style={inp} /></div>
              <div>{label("ALTEZZA mm")}<input type="number" value={height} onChange={e => setHeight(+e.target.value)} style={inp} /></div>
              <div>{label("QTÀ")}<input type="number" value={qty} onChange={e => setQty(+e.target.value)} style={inp} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>{label("LUNGHEZZA TAGLIO mm")}<input type="number" value={cutLength} onChange={e => setCutLength(+e.target.value)} style={inp} placeholder="Auto se 0" /></div>
              <div>{label("AREA INCISIONE mm²")}<input type="number" value={engravingArea} onChange={e => setEngravingArea(+e.target.value)} style={inp} /></div>
            </div>
            <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>FINITURA</label><select value={finish} onChange={e => setFinish(e.target.value)} style={inp}>{FINISHES.map(f=><option key={f}>{f}</option>)}</select></div>
            <div>{label("MARKUP ×")}<input type="number" step="0.1" value={markup} onChange={e => setMarkup(+e.target.value)} style={inp} /></div>
          </div>

          {/* Results */}
          <div style={{ background: "#0a0f1a", borderRadius: 12, padding: 16, marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 12 }}>📊 Risultati (per pezzo)</div>
            <div style={{ display: "grid", gap: 6 }}>
              {[
                ["Materiale", `€${matCost.toFixed(3)}`],
                ["Laser (${totalMinutes.toFixed(1)} min)", `€${laserCost.toFixed(3)}`],
                ["Finitura", `€${finishCost.toFixed(2)}`],
                ["Setup (1/${qty})", `€${(machineSettings.setupCost/qty).toFixed(3)}`],
                ["COSTO UNITARIO", `€${unitCost.toFixed(3)}`],
                ["PREZZO UNITARIO", `€${unitPrice.toFixed(2)}`],
                ["MARGINE", `${margin.toFixed(1)}%`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: k.includes("COSTO") || k.includes("PREZZO") || k.includes("MARGINE") ? 14 : 12, fontWeight: k.includes("COSTO") || k.includes("PREZZO") || k.includes("MARGINE") ? 700 : 400, color: k.includes("PREZZO") ? "#22c55e" : k.includes("MARGINE") ? "#f59e0b" : "#94a3b8", borderTop: k.includes("COSTO") ? "1px solid #1e293b" : "none", paddingTop: k.includes("COSTO") ? 8 : 0 }}>
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #1e293b", marginTop: 8, paddingTop: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>TOTALE ({qty} pz)</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#6366f1" }}>€{total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={() => setModal(true)} style={{ marginTop: 16, width: "100%", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>💾 Salva Preventivo B2B</button>
        </div>

        {/* Quotes list */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>📋 Preventivi Salvati ({quotes.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {quotes.slice().reverse().map(q => (
              <div key={q.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{q.companyName || q.clientName}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{q.material} · {q.qty} pz</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#22c55e" }}>€{q.total.toFixed(2)}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Margine {q.margin.toFixed(1)}%</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#475569" }}>{new Date(q.createdAt).toLocaleDateString("it-IT")}</span>
                  <button onClick={() => delQuote(q.id)} style={{ background: "none", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>✕</button>
                </div>
              </div>
            ))}
            {quotes.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 13 }}>Nessun preventivo salvato</div>}
          </div>
        </div>
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 420, maxWidth: "95vw" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>Salva Preventivo B2B</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOME CLIENTE</label><input value={clientName} onChange={e => setClientName(e.target.value)} style={inp} /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>AZIENDA</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} style={inp} /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTE</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{...inp,resize:"none"}} /></div>
              <div style={{ background: "#0a0f1a", borderRadius: 8, padding: 12, fontSize: 12, color: "#94a3b8" }}>
                {material} · {qty} pz · €{unitPrice.toFixed(2)}/pz · Totale €{total.toFixed(2)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={saveQuote} disabled={!clientName} style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 700 }}>Salva</button>
              <button onClick={() => setModal(false)} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
