"use client";
import { useState } from "react";

const TECHNIQUES = ["Serigrafia","Sublimazione","DTF (Direct to Film)","Ricamo","Stampa UV","Vinile termoadesivo","Laser su tessuto"];
const PRODUCTS = ["T-Shirt","Polo","Felpa","Felpa con cappuccio","Maglietta tecnica","Tank Top","Gilet","Giacca","Pantaloni","Shorts","Borsa","Zaino","Cappello","Berretto"];
const SIZES = ["XS","S","M","L","XL","XXL","XXXL"];
const COLORS = ["Bianco","Nero","Grigio","Blu Navy","Blu Royal","Rosso","Verde","Giallo","Arancione","Rosa","Viola","Personalizzato"];

interface ApparelLine {
  id: string;
  product: string;
  size: string;
  color: string;
  qty: number;
  baseCost: number;
  printCost: number;
  unitPrice: number;
  subtotal: number;
}

export default function ApparelPage() {
  const [technique, setTechnique] = useState("Serigrafia");
  const [colors, setColors] = useState(1);
  const [printSides, setPrintSides] = useState(1);
  const [setupCost, setSetupCost] = useState(35);
  const [markup, setMarkup] = useState(2.2);
  const [clientName, setClientName] = useState("");
  const [lines, setLines] = useState<ApparelLine[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState<{id:string; clientName: string; technique: string; lines: ApparelLine[]; total: number; createdAt: string}[]>([]);

  // Default base costs per product
  const baseCosts: Record<string,number> = {
    "T-Shirt":4.5,"Polo":9,"Felpa":14,"Felpa con cappuccio":18,"Maglietta tecnica":7,"Tank Top":5,
    "Gilet":20,"Giacca":35,"Pantaloni":22,"Shorts":12,"Borsa":6,"Zaino":12,"Cappello":5,"Berretto":4
  };

  // Print cost by technique
  const techCosts: Record<string,number> = {
    "Serigrafia": colors * 0.8,"Sublimazione": 3.5,"DTF (Direct to Film)": 2.8,"Ricamo": 8,
    "Stampa UV": 4,"Vinile termoadesivo": 2.5,"Laser su tessuto": 3
  };

  function addLine(product: string, size: string, color: string, qty: number) {
    const baseCost = baseCosts[product] || 5;
    const printCost = (techCosts[technique] || 2) * printSides;
    const unitCost = baseCost + printCost;
    const unitPrice = parseFloat((unitCost * markup).toFixed(2));
    setLines(prev => [...prev, {
      id: Date.now().toString(),
      product, size, color, qty,
      baseCost, printCost,
      unitPrice,
      subtotal: parseFloat((unitPrice * qty).toFixed(2))
    }]);
  }

  function removeLine(id: string) { setLines(prev => prev.filter(l => l.id !== id)); }

  const subtotal = lines.reduce((a, b) => a + b.subtotal, 0);
  const setupPerUnit = lines.reduce((a, b) => a + b.qty, 0) > 0 ? setupCost / lines.reduce((a, b) => a + b.qty, 0) : 0;
  const total = subtotal + setupCost;
  const totalQty = lines.reduce((a, b) => a + b.qty, 0);
  const avgMargin = lines.length > 0 ? ((subtotal - lines.reduce((a,b) => a + (b.baseCost + b.printCost) * b.qty, 0)) / subtotal * 100) : 0;

  // Quick add state
  const [qProduct, setQProduct] = useState("T-Shirt");
  const [qSize, setQSize] = useState("M");
  const [qColor, setQColor] = useState("Bianco");
  const [qQty, setQQty] = useState(10);

  function saveQuote() {
    if (!clientName || lines.length === 0) { alert("Inserisci cliente e almeno un articolo"); return; }
    const quotes = JSON.parse(localStorage.getItem("ingly_apparel_quotes") || "[]");
    const q = { id: Date.now().toString(), clientName, technique, lines, total: parseFloat(total.toFixed(2)), createdAt: new Date().toISOString() };
    quotes.push(q);
    localStorage.setItem("ingly_apparel_quotes", JSON.stringify(quotes));
    setSaved(quotes);
    alert(`✅ Preventivo salvato! Totale: €${total.toFixed(2)}`);
  }

  const inp: React.CSSProperties = { background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13 };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>👕 Smart Quote Apparel</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Preventivi personalizzati per abbigliamento e merchandising</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Left: Builder */}
        <div>
          {/* Technique settings */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>⚙️ Impostazioni Stampa</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10 }}>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TECNICA</label>
                <select value={technique} onChange={e => setTechnique(e.target.value)} style={{ ...inp, width: "100%" }}>
                  {TECHNIQUES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>COLORI</label><input type="number" min={1} max={8} value={colors} onChange={e => setColors(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>LATI</label><input type="number" min={1} max={2} value={printSides} onChange={e => setPrintSides(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>SETUP €</label><input type="number" value={setupCost} onChange={e => setSetupCost(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>MARKUP</label><input type="number" step="0.1" value={markup} onChange={e => setMarkup(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
            </div>
          </div>

          {/* Quick add */}
          <div style={{ background: "#0f172a", border: "1px solid #6366f130", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>➕ Aggiungi Articolo</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>PRODOTTO</label>
                <select value={qProduct} onChange={e => setQProduct(e.target.value)} style={{ ...inp, width: "100%" }}>
                  {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TAGLIA</label>
                <select value={qSize} onChange={e => setQSize(e.target.value)} style={{ ...inp, width: "100%" }}>
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>COLORE</label>
                <select value={qColor} onChange={e => setQColor(e.target.value)} style={{ ...inp, width: "100%" }}>
                  {COLORS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>QTÀ</label><input type="number" min={1} value={qQty} onChange={e => setQQty(+e.target.value)} style={{ ...inp, width: "100%" }} /></div>
              <button onClick={() => addLine(qProduct, qSize, qColor, qQty)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>+ Aggiungi</button>
            </div>
          </div>

          {/* Lines table */}
          {lines.length > 0 && (
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0a0f1a" }}>
                    {["Prodotto","Taglia","Colore","Qtà","Base €","Stampa €","Prezzo unit.","Subtotale",""].map(h => (
                      <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 10, color: "#475569", fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map(line => (
                    <tr key={line.id} style={{ borderBottom: "1px solid #1e293b" }}>
                      <td style={{ padding: "9px 12px", fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{line.product}</td>
                      <td style={{ padding: "9px 12px", fontSize: 12, color: "#94a3b8" }}>{line.size}</td>
                      <td style={{ padding: "9px 12px", fontSize: 12, color: "#94a3b8" }}>{line.color}</td>
                      <td style={{ padding: "9px 12px", fontSize: 12, color: "#e2e8f0" }}>{line.qty}</td>
                      <td style={{ padding: "9px 12px", fontSize: 12, color: "#94a3b8" }}>€{line.baseCost.toFixed(2)}</td>
                      <td style={{ padding: "9px 12px", fontSize: 12, color: "#94a3b8" }}>€{line.printCost.toFixed(2)}</td>
                      <td style={{ padding: "9px 12px", fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>€{line.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: "9px 12px", fontSize: 13, fontWeight: 700, color: "#22c55e" }}>€{line.subtotal.toFixed(2)}</td>
                      <td style={{ padding: "9px 12px" }}><button onClick={() => removeLine(line.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }}>✕</button></td>
                    </tr>
                  ))}
                  <tr style={{ background: "#0a0f1a", borderTop: "2px solid #1e293b" }}>
                    <td colSpan={3} style={{ padding: "10px 12px", fontSize: 12, color: "#64748b" }}>{totalQty} articoli totali</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{totalQty}</td>
                    <td colSpan={3} style={{ padding: "10px 12px", fontSize: 12, color: "#64748b" }}>Setup: €{setupCost.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", fontSize: 15, fontWeight: 800, color: "#22c55e" }}>€{total.toFixed(2)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div>
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1a1040)", border: "2px solid #6366f150", borderRadius: 16, padding: 24, position: "sticky", top: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>💰 Riepilogo Preventivo</div>
            <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CLIENTE</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} style={{ ...inp, width: "100%", boxSizing: "border-box" }} placeholder="Nome cliente..." />
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              {[
                ["Tecnica", technique],
                ["Articoli", `${lines.length} tipi, ${totalQty} pz`],
                ["Subtotale", `€${subtotal.toFixed(2)}`],
                ["Setup", `€${setupCost.toFixed(2)}`],
                ["Margine medio", `${avgMargin.toFixed(1)}%`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid #1e293b", paddingBottom: 6 }}>
                  <span style={{ color: "#64748b" }}>{k}</span><span style={{ color: "#e2e8f0", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>TOTALE</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>€{total.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
              <button onClick={saveQuote} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>💾 Salva Preventivo</button>
              <button onClick={() => {
                const txt = `PREVENTIVO APPAREL\nCliente: ${clientName}\nTecnica: ${technique}\n\n${lines.map(l=>`${l.qty}x ${l.product} ${l.size} ${l.color} — €${l.subtotal.toFixed(2)}`).join("\n")}\n\nSetup: €${setupCost.toFixed(2)}\nTOTALE: €${total.toFixed(2)}`;
                const wa = `https://wa.me/?text=${encodeURIComponent(txt)}`;
                window.open(wa, "_blank");
              }} style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 10, padding: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>📱 Invia WhatsApp</button>
            </div>

            <div style={{ marginTop: 16 }}>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...inp, width: "100%", resize: "none", boxSizing: "border-box" }} placeholder="Note aggiuntive..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
