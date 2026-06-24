"use client";
import { useState } from "react";

const MATERIALS_3D = [
  { name: "PLA", costPerKg: 18, density: 1.24 },
  { name: "ABS", costPerKg: 22, density: 1.05 },
  { name: "PETG", costPerKg: 24, density: 1.27 },
  { name: "TPU (flessibile)", costPerKg: 35, density: 1.21 },
  { name: "ASA", costPerKg: 28, density: 1.07 },
  { name: "Nylon", costPerKg: 45, density: 1.15 },
  { name: "Resina Standard", costPerKg: 40, density: 1.1 },
  { name: "Resina ABS-Like", costPerKg: 55, density: 1.12 },
  { name: "Resina Trasparente", costPerKg: 65, density: 1.1 },
];

const FINISHES_3D = [
  { name: "Nessuna", cost: 0 },
  { name: "Levigatura base", cost: 3 },
  { name: "Levigatura fine", cost: 6 },
  { name: "Verniciatura", cost: 8 },
  { name: "Verniciatura + lucidatura", cost: 15 },
  { name: "Primer + vernice", cost: 12 },
];

export default function Print3DPage() {
  const [matName, setMatName] = useState("PLA");
  const [weightG, setWeightG] = useState(50);
  const [printTimeH, setPrintTimeH] = useState(3);
  const [printTimeM, setPrintTimeM] = useState(0);
  const [infill, setInfill] = useState(20);
  const [supports, setSupports] = useState(false);
  const [finish, setFinish] = useState("Nessuna");
  const [qty, setQty] = useState(1);
  const [markup, setMarkup] = useState(2.5);
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");

  // Machine settings
  const [powerKw, setPowerKw] = useState(0.3);
  const [euroKwh, setEuroKwh] = useState(0.28);
  const [maintenanceHourly, setMaintenanceHourly] = useState(0.5);
  const [laborHourly, setLaborHourly] = useState(15);
  const [laborMin, setLaborMin] = useState(20);

  const mat = MATERIALS_3D.find(m => m.name === matName) || MATERIALS_3D[0];
  const finishObj = FINISHES_3D.find(f => f.name === finish) || FINISHES_3D[0];

  const totalHours = printTimeH + printTimeM / 60;
  const supportFactor = supports ? 1.15 : 1;
  const actualWeight = weightG * supportFactor;

  const matCost = (actualWeight / 1000) * mat.costPerKg;
  const electricityCost = totalHours * powerKw * euroKwh;
  const maintenanceCost = totalHours * maintenanceHourly;
  const laborCost = (laborMin / 60) * laborHourly;
  const finishCost = finishObj.cost;

  const unitCost = matCost + electricityCost + maintenanceCost + laborCost + finishCost;
  const unitPrice = unitCost * markup;
  const total = unitPrice * qty;
  const margin = ((unitPrice - unitCost) / unitPrice * 100);

  // Price tiers
  const tiers = [
    { name: "Campione/Prototipo", mult: 3.5, color: "#f59e0b" },
    { name: "Piccola Serie (≤10)", mult: 2.8, color: "#6366f1" },
    { name: "Media Serie (11-50)", mult: 2.2, color: "#22c55e" },
    { name: "Grande Serie (>50)", mult: 1.8, color: "#3b82f6" },
  ];

  const [savedQuotes, setSavedQuotes] = useState<{id:string;clientName:string;projectName:string;material:string;total:number;qty:number;createdAt:string}[]>(() => {
    if (typeof window === "undefined") return [];
    const s = localStorage.getItem("ingly_3d_quotes");
    return s ? JSON.parse(s) : [];
  });

  function saveQuote() {
    const q = { id: Date.now().toString(), clientName, projectName, material: matName, total: parseFloat(total.toFixed(2)), qty, createdAt: new Date().toISOString() };
    const updated = [...savedQuotes, q];
    setSavedQuotes(updated);
    localStorage.setItem("ingly_3d_quotes", JSON.stringify(updated));
    alert(`✅ Preventivo salvato! Totale: €${total.toFixed(2)}`);
  }

  const inp: React.CSSProperties = { background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13 };
  const label = (t: string) => <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{t}</label>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>🖨️ Smart Quote 3D</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Preventivi professionali per stampa 3D FDM / Resina</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Material */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>🧱 Materiale & Progetto</div>
            <div style={{ display: "grid", gap: 10 }}>
              <div>{label("MATERIALE")}<select value={matName} onChange={e => setMatName(e.target.value)} style={{ ...inp, width: "100%" }}>{MATERIALS_3D.map(m => <option key={m.name}>{m.name}</option>)}</select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div>{label("PESO STIMATO (g)")}<input type="number" value={weightG} onChange={e => setWeightG(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
                <div>{label("INFILL %")}<input type="number" min={5} max={100} value={infill} onChange={e => setInfill(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
                <div>{label("QTÀ")}<input type="number" min={1} value={qty} onChange={e => setQty(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>{label("TEMPO STAMPA (ore)")}<input type="number" value={printTimeH} onChange={e => setPrintTimeH(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
                <div>{label("MINUTI")}<input type="number" min={0} max={59} value={printTimeM} onChange={e => setPrintTimeM(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "#94a3b8" }}>
                  <input type="checkbox" checked={supports} onChange={e => setSupports(e.target.checked)} style={{ width: 16, height: 16 }} />
                  Supporti di stampa (+15% materiale)
                </label>
              </div>
              <div>{label("FINITURA")}<select value={finish} onChange={e => setFinish(e.target.value)} style={{ ...inp, width: "100%" }}>{FINISHES_3D.map(f => <option key={f.name}>{f.name}</option>)}</select></div>
            </div>
          </div>

          {/* Machine settings */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>⚙️ Impostazioni Macchina</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>{label("POTENZA (kW)")}<input type="number" step="0.05" value={powerKw} onChange={e => setPowerKw(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              <div>{label("€/kWh")}<input type="number" step="0.01" value={euroKwh} onChange={e => setEuroKwh(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              <div>{label("MANUTENZIONE €/h")}<input type="number" step="0.1" value={maintenanceHourly} onChange={e => setMaintenanceHourly(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              <div>{label("MANODOPERA €/h")}<input type="number" value={laborHourly} onChange={e => setLaborHourly(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              <div>{label("TEMPO LAV. (min)")}<input type="number" value={laborMin} onChange={e => setLaborMin(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              <div>{label("MARKUP ×")}<input type="number" step="0.1" value={markup} onChange={e => setMarkup(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Cost breakdown */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>📊 Analisi Costi (per pezzo)</div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                ["Materiale", `€${matCost.toFixed(3)}`, `${(actualWeight).toFixed(1)}g`],
                ["Elettricità", `€${electricityCost.toFixed(3)}`, `${totalHours.toFixed(1)}h × ${powerKw}kW`],
                ["Manutenzione", `€${maintenanceCost.toFixed(3)}`, `€${maintenanceHourly}/h`],
                ["Manodopera", `€${laborCost.toFixed(3)}`, `${laborMin}min`],
                ["Finitura", `€${finishCost.toFixed(2)}`, finish],
              ].map(([k, v, sub]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1e293b" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{k}</div>
                    {sub && <div style={{ fontSize: 10, color: "#475569" }}>{sub}</div>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "2px solid #334155" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>COSTO UNITARIO</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#f59e0b" }}>€{unitCost.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Price tiers */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>💰 Fasce di Prezzo</div>
            <div style={{ display: "grid", gap: 10 }}>
              {tiers.map(tier => {
                const price = unitCost * tier.mult;
                const m = ((price - unitCost) / price * 100);
                return (
                  <div key={tier.name} style={{ background: "#0a0f1a", border: `1px solid ${tier.color}30`, borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, color: tier.color, fontWeight: 700 }}>{tier.name}</div>
                      <div style={{ fontSize: 10, color: "#475569" }}>Markup ×{tier.mult} · Margine {m.toFixed(0)}%</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: tier.color }}>€{price.toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>×{qty} = €{(price*qty).toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save quote */}
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1a1040)", border: "2px solid #6366f150", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>💾 Salva Preventivo</div>
            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              <input value={clientName} onChange={e => setClientName(e.target.value)} style={{ ...inp, width: "100%", boxSizing: "border-box" }} placeholder="Nome cliente..." />
              <input value={projectName} onChange={e => setProjectName(e.target.value)} style={{ ...inp, width: "100%", boxSizing: "border-box" }} placeholder="Nome progetto..." />
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ ...inp, width: "100%", resize: "none", boxSizing: "border-box" }} placeholder="Note..." />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Prezzo (×{markup}): </span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>€{total.toFixed(2)}</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <button onClick={saveQuote} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>💾 Salva Preventivo 3D</button>
              <button onClick={() => {
                const txt = `PREVENTIVO STAMPA 3D\nCliente: ${clientName}\nProgetto: ${projectName}\nMateriale: ${matName}\nQtà: ${qty} pz\n\nCosto unitario: €${unitCost.toFixed(2)}\nPrezzo unitario: €${unitPrice.toFixed(2)}\nTOTALE: €${total.toFixed(2)}\nMargine: ${margin.toFixed(1)}%`;
                window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
              }} style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 10, padding: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>📱 Invia WhatsApp</button>
            </div>
          </div>

          {/* Saved quotes */}
          {savedQuotes.length > 0 && (
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>📋 Preventivi Salvati</div>
              {savedQuotes.slice().reverse().slice(0, 5).map(q => (
                <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1e293b" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{q.projectName || q.clientName}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{q.material} · {q.qty} pz</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>€{q.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
