"use client";
import { useState, useEffect } from "react";

const TEMPLATE_TYPES = ["Tutti","Preventivo","Fattura","Contratto","Email","Lettera","Altro"];

interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
  variables: string;
  createdAt: string;
  usageCount: number;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "1", name: "Preventivo Standard", type: "Preventivo", usageCount: 0, createdAt: new Date().toISOString(), variables: "nome_cliente,totale,scadenza",
    content: `Gentile {{nome_cliente}},

In riferimento alla Sua richiesta, siamo lieti di sottoporre il seguente preventivo:

DESCRIZIONE LAVORI:
{{descrizione}}

IMPORTO TOTALE: €{{totale}} + IVA 22%

Il preventivo ha validità fino al {{scadenza}}.

Cordiali saluti,
Ingly Design`
  },
  {
    id: "2", name: "Email Conferma Ordine", type: "Email", usageCount: 0, createdAt: new Date().toISOString(), variables: "nome_cliente,numero_ordine,data_consegna",
    content: `Oggetto: Conferma Ordine #{{numero_ordine}}

Gentile {{nome_cliente}},

La informiamo che il Suo ordine #{{numero_ordine}} è stato confermato.

Data di consegna prevista: {{data_consegna}}

Per qualsiasi informazione non esiti a contattarci.

Cordiali saluti,
Ingly Design`
  },
  {
    id: "3", name: "Richiesta Pagamento", type: "Email", usageCount: 0, createdAt: new Date().toISOString(), variables: "nome_cliente,importo,numero_fattura",
    content: `Oggetto: Promemoria Pagamento Fattura #{{numero_fattura}}

Gentile {{nome_cliente}},

Le ricordiamo che risulta ancora in sospeso il pagamento della fattura #{{numero_fattura}} per l'importo di €{{importo}}.

La preghiamo di procedere al pagamento entro 7 giorni.

IBAN: IT00 0000 0000 0000 0000 0000 000
Causale: Fattura #{{numero_fattura}}

Grazie per la collaborazione.

Cordiali saluti,
Ingly Design`
  },
  {
    id: "4", name: "Contratto Collaborazione", type: "Contratto", usageCount: 0, createdAt: new Date().toISOString(), variables: "nome_fornitore,data_inizio,valore_contratto",
    content: `CONTRATTO DI COLLABORAZIONE

Tra: Ingly Design (di seguito "Committente")
E: {{nome_fornitore}} (di seguito "Fornitore")

DATA INIZIO: {{data_inizio}}
VALORE STIMATO: €{{valore_contratto}}

OGGETTO:
Le parti concordano di collaborare per la fornitura di prodotti/servizi come specificato negli allegati tecnici.

CONDIZIONI:
- Pagamento a 30 giorni dalla fattura
- Qualità certificata secondo standard Ingly Design
- Riservatezza su prezzi e processi produttivi

Firma Committente: _________________
Firma Fornitore: _________________`
  },
];

export default function TemplateDocsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [typeFilter, setTypeFilter] = useState("Tutti");
  const [modal, setModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [selected, setSelected] = useState<Template|null>(null);
  const [form, setForm] = useState({ name: "", type: "Preventivo", content: "", variables: "" });
  const [varValues, setVarValues] = useState<Record<string,string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("ingly_templates");
    setTemplates(saved ? JSON.parse(saved) : DEFAULT_TEMPLATES);
  }, []);

  function persist(list: Template[]) { setTemplates(list); localStorage.setItem("ingly_templates", JSON.stringify(list)); }

  function save() {
    const t: Template = { ...form, id: editId || Date.now().toString(), createdAt: editId ? (templates.find(t=>t.id===editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(), usageCount: editId ? (templates.find(t=>t.id===editId)?.usageCount || 0) : 0 };
    persist(editId ? templates.map(t2 => t2.id === editId ? t : t2) : [...templates, t]);
    setModal(false); setEditId(null); setForm({ name: "", type: "Preventivo", content: "", variables: "" });
  }

  function del(id: string) { if (confirm("Eliminare template?")) persist(templates.filter(t => t.id !== id)); }

  function openPreview(t: Template) {
    setSelected(t);
    const vars: Record<string,string> = {};
    t.variables.split(",").map(v => v.trim()).filter(Boolean).forEach(v => vars[v] = "");
    setVarValues(vars);
    setPreviewModal(true);
    persist(templates.map(t2 => t2.id === t.id ? { ...t2, usageCount: t2.usageCount + 1 } : t2));
  }

  function renderContent() {
    if (!selected) return "";
    return Object.entries(varValues).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v || `[${k}]`), selected.content);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(renderContent());
    alert("✅ Copiato negli appunti!");
  }

  const filtered = typeFilter === "Tutti" ? templates : templates.filter(t => t.type === typeFilter);
  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" };
  const TYPE_COLOR: Record<string,string> = { Preventivo:"#6366f1", Fattura:"#22c55e", Contratto:"#f59e0b", Email:"#3b82f6", Lettera:"#a855f7", Altro:"#475569" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>📄 Template Documenti</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{templates.length} template disponibili</p>
        </div>
        <button onClick={() => { setForm({ name: "", type: "Preventivo", content: "", variables: "" }); setEditId(null); setModal(true); }} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ Nuovo Template</button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {TEMPLATE_TYPES.map(t => <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #334155", background: typeFilter === t ? "#6366f1" : "transparent", color: typeFilter === t ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: 11, fontWeight: typeFilter === t ? 700 : 500 }}>{t}</button>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {filtered.map(t => (
          <div key={t.id} style={{ background: "#0f172a", border: `1px solid ${TYPE_COLOR[t.type] || "#1e293b"}30`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 10, padding: "2px 8px", background: `${TYPE_COLOR[t.type] || "#475569"}20`, color: TYPE_COLOR[t.type] || "#475569", borderRadius: 8, fontWeight: 700 }}>{t.type}</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginTop: 6 }}>{t.name}</div>
              </div>
              <span style={{ fontSize: 10, color: "#475569" }}>Usato {t.usageCount}×</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12, height: 48, overflow: "hidden", lineHeight: 1.6 }}>{t.content.slice(0, 100)}...</div>
            {t.variables && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                {t.variables.split(",").map(v => v.trim()).filter(Boolean).map(v => (
                  <span key={v} style={{ fontSize: 9, padding: "1px 7px", background: "#1e293b", borderRadius: 8, color: "#6366f1", fontFamily: "monospace" }}>{`{{${v}}}`}</span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openPreview(t)} style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 7, padding: "7px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📝 Usa Template</button>
              <button onClick={() => { setForm({ name: t.name, type: t.type, content: t.content, variables: t.variables }); setEditId(t.id); setModal(true); }} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontSize: 12 }}>✏️</button>
              <button onClick={() => del(t.id)} style={{ background: "none", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#475569" }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📄</div>
          <p>Nessun template. Creane uno o seleziona un tipo diverso.</p>
        </div>}
      </div>

      {/* Edit/Create Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 640, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>{editId ? "Modifica" : "Nuovo"} Template</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOME</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TIPO</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value})} style={inp}>{TEMPLATE_TYPES.filter(t=>t!=="Tutti").map(t=><option key={t}>{t}</option>)}</select></div>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>VARIABILI (separate da virgola)</label><input value={form.variables} onChange={e => setForm({...form,variables:e.target.value})} style={inp} placeholder="nome_cliente,importo,data..." /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CONTENUTO (usa {"{{variabile}}"} per inserire valori dinamici)</label><textarea value={form.content} onChange={e => setForm({...form,content:e.target.value})} rows={12} style={{...inp, resize:"vertical", fontFamily:"monospace", fontSize:12}} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={save} disabled={!form.name || !form.content} style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 700 }}>{editId ? "Salva" : "Crea Template"}</button>
              <button onClick={() => { setModal(false); setEditId(null); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && selected && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 720, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>{selected.name}</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Compila le variabili per personalizzare il documento</p>
            {Object.keys(varValues).length > 0 && (
              <div style={{ background: "#0a0f1a", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 10 }}>VARIABILI</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                  {Object.keys(varValues).map(v => (
                    <div key={v}>
                      <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{v.replace(/_/g," ").toUpperCase()}</label>
                      <input value={varValues[v]} onChange={e => setVarValues({...varValues,[v]:e.target.value})} style={inp} placeholder={`Inserisci ${v}...`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ background: "#060d1a", border: "1px solid #1e293b", borderRadius: 10, padding: 20, fontFamily: "monospace", fontSize: 13, color: "#e2e8f0", whiteSpace: "pre-wrap", lineHeight: 1.8, marginBottom: 16 }}>
              {renderContent()}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={copyToClipboard} style={{ flex: 1, background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 700 }}>📋 Copia negli Appunti</button>
              <button onClick={() => { const win = window.open("","_blank"); win?.document.write(`<pre style="font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto">${renderContent()}</pre>`); win?.print(); }} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 600 }}>🖨️ Stampa</button>
              <button onClick={() => setPreviewModal(false)} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
