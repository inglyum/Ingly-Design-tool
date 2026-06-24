"use client";
import { useState, useEffect, useCallback } from "react";

interface CalcState {
  kwh: number; kw: number; depr: number; labor: number;
  mk1: number; mkit: number; mstock: number;
  name: string; mat: number; w: number; h: number;
  perim: number; engr: number;
  hasCut: boolean; hasEngr: boolean; hasLabor: boolean; hasExtra: boolean;
  cutMin: number; engrMin: number; laborMin: number; extra: number;
  showSettings: boolean;
}

const DEF: CalcState = {
  kwh: 0.28, kw: 1.2, depr: 0.80, labor: 15,
  mk1: 3.5, mkit: 2.8, mstock: 2.2,
  name: "", mat: 0.50, w: 0, h: 0, perim: 0, engr: 0,
  hasCut: true, hasEngr: true, hasLabor: true, hasExtra: false,
  cutMin: 0, engrMin: 0, laborMin: 5, extra: 0, showSettings: false,
};

function calc(s: CalcState) {
  const machinePerMin = (s.kwh * s.kw + s.depr) / 60;
  const laborPerMin = s.labor / 60;
  const autoPerim = s.w && s.h ? 2 * (s.w + s.h) : 0;
  const autoEngr = s.w && s.h ? Math.round(s.w * s.h * 0.6) : 0;
  const perim = s.perim || autoPerim;
  const engrArea = s.engr || autoEngr;
  const cutMin = s.cutMin || (perim ? +(perim / 360).toFixed(2) : 0);
  const engrMin = s.engrMin || (engrArea ? +(engrArea / 10000).toFixed(2) : 0);
  const costCut = s.hasCut ? cutMin * machinePerMin : 0;
  const costEngr = s.hasEngr ? engrMin * machinePerMin : 0;
  const costLabor = s.hasLabor ? s.laborMin * laborPerMin : 0;
  const costExtra = s.hasExtra ? s.extra : 0;
  const totalCost = s.mat + costCut + costEngr + costLabor + costExtra;
  return {
    totalCost,
    costCut, costEngr, costLabor, costMat: s.mat, costExtra,
    cutMin, engrMin, perim, engrArea,
    camp: totalCost * s.mk1,
    kit: totalCost * s.mkit,
    stock: totalCost * s.mstock,
    machinePerMin,
  };
}

const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" };
const card: React.CSSProperties = { background: "linear-gradient(135deg,#0f172a,#1a1040)", border: "1.5px solid #6366f130", borderRadius: 12, padding: 20, marginBottom: 14 };
const lbl: React.CSSProperties = { fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: 4, textTransform: "uppercase" };

export default function LaserCalcPage() {
  const [s, setS] = useState<CalcState>(DEF);
  const [sentMsg, setSentMsg] = useState("");

  const r = calc(s);
  const upd = (k: keyof CalcState, v: any) => setS(prev => ({ ...prev, [k]: v }));

  function sendToQuoter() {
    const data = { name: s.name || "Lavorazione Laser", cost: r.totalCost, camp: r.camp, kit: r.kit, stock: r.stock };
    localStorage.setItem("lcp_last_result", JSON.stringify(data));
    setSentMsg("✅ Dati inviati! Vai su Smart Quoter.");
    setTimeout(() => setSentMsg(""), 3000);
  }

  const fmt = (n: number) => `€${n.toFixed(2)}`;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#a5b4fc", margin: 0 }}>⚡ Calcolatore Laser P3</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Calcola il costo reale e genera prezzi di vendita competitivi</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setS(DEF); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12 }}>↺ Reset</button>
          <button onClick={sendToQuoter} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>→ Invia a Quoter</button>
        </div>
      </div>
      {sentMsg && <div style={{ background: "#22c55e20", border: "1px solid #22c55e40", color: "#22c55e", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{sentMsg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
        <div>
          {/* Settings */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: s.showSettings ? 16 : 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>⚙️ Impostazioni Macchina P3</div>
              <button onClick={() => upd("showSettings", !s.showSettings)} style={{ background: "#6366f120", border: "1px solid #6366f140", borderRadius: 6, color: "#a5b4fc", cursor: "pointer", fontSize: 11, padding: "3px 10px" }}>
                {s.showSettings ? "▲ Nascondi" : "▼ Mostra"}
              </button>
            </div>
            {s.showSettings && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 10 }}>
                  {([["€/kWh bolletta", "kwh", 0.01, "Media IT: 0.24–0.32"], ["kW consumo", "kw", 0.1, "P3 80W ≈ 1.0–1.5 kW"], ["€/h ammortamento", "depr", 0.1, "~800€/1000h"], ["€/h tuo lavoro", "labor", 1, "Freelance: 15–25€/h"]] as [string, keyof CalcState, number, string][]).map(([label, key, step, hint]) => (
                    <div key={key}>
                      <label style={lbl}>{label}</label>
                      <input type="number" step={step} value={s[key] as number} onChange={e => upd(key, +e.target.value)} style={inp} />
                      <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>{hint}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {([["× Campione", "mk1", "Singolo: 3–4×"], ["× Kit 25-30pz", "mkit", "Kit: 2.5–3×"], ["× Stock 100+", "mstock", "Stock: 2–2.5×"]] as [string, keyof CalcState, string][]).map(([label, key, hint]) => (
                    <div key={key}>
                      <label style={lbl}>{label}</label>
                      <input type="number" step={0.1} value={s[key] as number} onChange={e => upd(key, +e.target.value)} style={inp} />
                      <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>{hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prodotto */}
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc", marginBottom: 14 }}>🪵 Prodotto da calcolare</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Nome prodotto</label>
                <input value={s.name} onChange={e => upd("name", e.target.value)} placeholder="es. Portachiavi inciso legno" style={inp} />
              </div>
              <div>
                <label style={lbl}>Costo materiale €/pz</label>
                <input type="number" step={0.05} value={s.mat} onChange={e => upd("mat", +e.target.value)} style={inp} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
              {([["↔ Largh. mm", "w"], ["↕ Alt. mm", "h"], ["↗ Perim. taglio mm", "perim"], ["⬜ Area incis. mm²", "engr"]] as [string, keyof CalcState][]).map(([label, key]) => (
                <div key={key}>
                  <label style={lbl}>{label}</label>
                  <input type="number" value={s[key] as number || ""} onChange={e => upd(key, +e.target.value)} placeholder={
                    key === "perim" && s.w && s.h ? `${2*(s.w+s.h)} (auto)` :
                    key === "engr" && s.w && s.h ? `${Math.round(s.w*s.h*0.6)} (auto)` : ""
                  } style={inp} />
                </div>
              ))}
            </div>

            {/* Lavorazioni */}
            <div style={{ background: "#0a0e1a", borderRadius: 10, padding: 14, border: "1px solid #1e293b" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>⚙️ Lavorazioni</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[
                  { id: "hasCut", minKey: "cutMin" as keyof CalcState, color: "#3b82f6", icon: "✂️", label: "TAGLIO", hint: r.cutMin ? `~${r.cutMin.toFixed(1)} min` : "inserisci perim." },
                  { id: "hasEngr", minKey: "engrMin" as keyof CalcState, color: "#8b5cf6", icon: "🎨", label: "INCISIONE", hint: r.engrMin ? `~${r.engrMin.toFixed(1)} min` : "inserisci area" },
                  { id: "hasLabor", minKey: "laborMin" as keyof CalcState, color: "#22c55e", icon: "👤", label: "MANODOPERA", hint: `${s.laborMin} min setup` },
                  { id: "hasExtra", minKey: "extra" as keyof CalcState, color: "#f59e0b", icon: "🔧", label: "EXTRA", hint: "costi aggiuntivi" },
                ].map(item => (
                  <div key={item.id} style={{ background: "#0f172a", borderRadius: 8, padding: 10, border: `1px solid ${item.color}30` }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", marginBottom: 8 }}>
                      <input type="checkbox" checked={s[item.id as keyof CalcState] as boolean} onChange={e => upd(item.id as keyof CalcState, e.target.checked)} style={{ accentColor: item.color }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.icon} {item.label}</span>
                    </label>
                    <label style={{ fontSize: 9, color: "#64748b", display: "block", marginBottom: 3 }}>Minuti / €</label>
                    <input type="number" step={0.5} value={s[item.minKey] as number || ""} onChange={e => upd(item.minKey, +e.target.value)} style={{ ...inp, fontSize: 14, fontWeight: 700, color: item.color, padding: "5px" }} />
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 4 }}>{item.hint}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Results */}
        <div>
          <div style={{ background: "linear-gradient(135deg,#0a0312,#1a0a2e)", border: "2px solid #6366f160", borderRadius: 16, padding: 24, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>💰 COSTO DI PRODUZIONE</div>
            {[
              ["🪵 Materiale", r.costMat, "#e2e8f0"],
              ["✂️ Taglio laser", r.costCut, "#60a5fa"],
              ["🎨 Incisione", r.costEngr, "#a78bfa"],
              ["👤 Manodopera", r.costLabor, "#4ade80"],
              ["🔧 Extra", r.costExtra, "#fbbf24"],
            ].map(([label, val, color]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1e293b", fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>{label as string}</span>
                <span style={{ fontWeight: 700, color: color as string }}>{fmt(val as number)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", fontSize: 18 }}>
              <span style={{ fontWeight: 800, color: "#fff" }}>COSTO TOTALE</span>
              <span style={{ fontWeight: 900, color: "#6366f1" }}>{fmt(r.totalCost)}</span>
            </div>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>💎 PREZZI DI VENDITA SUGGERITI</div>
            {[
              { label: "🎁 Campione (×" + s.mk1 + ")", price: r.camp, color: "#f59e0b", desc: "Prezzo singolo pezzo" },
              { label: "📦 Kit 25-30pz (×" + s.mkit + ")", price: r.kit, color: "#22c55e", desc: "Volume medio" },
              { label: "🏭 Stock 100+ (×" + s.mstock + ")", price: r.stock, color: "#60a5fa", desc: "Produzione in serie" },
            ].map(item => (
              <div key={item.label} style={{ background: "#0a0f1a", borderRadius: 10, padding: "14px 16px", marginBottom: 10, border: `1px solid ${item.color}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{item.desc}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: item.color }}>{fmt(item.price)}</div>
                </div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>
                  Margine: {r.totalCost > 0 ? (((item.price - r.totalCost) / item.price) * 100).toFixed(0) : 0}% · Profitto: {fmt(item.price - r.totalCost)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>⚙️ MACCHINA</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Costo macchina/min: <strong style={{ color: "#a5b4fc" }}>{fmt(r.machinePerMin)}</strong></div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>Taglio stimato: <strong style={{ color: "#60a5fa" }}>{r.cutMin.toFixed(1)} min</strong></div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>Incisione stimata: <strong style={{ color: "#a78bfa" }}>{r.engrMin.toFixed(1)} min</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
