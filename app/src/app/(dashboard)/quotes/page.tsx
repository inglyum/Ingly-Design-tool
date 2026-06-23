"use client";
import { useEffect, useState } from "react";
import { getDB, type LocalQuote } from "@/lib/db";
import { markDirty } from "@/lib/sync";
import { fmtEur, fmtDate, statusLabel, statusBadge } from "@/lib/format";
import { nanoid } from "nanoid";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<LocalQuote[]>([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ clientName: "", totalAmount: "", validUntil: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [filter]);

  async function load() {
    const db = getDB();
    let all = await db.quotes.filter((q) => !q._deleted).toArray();
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setQuotes(filter === "all" ? all : all.filter((q) => q.status === filter));
  }

  async function changeStatus(id: string, status: string) {
    const db = getDB();
    await db.quotes.update(id, { status, _dirty: true });
    markDirty("quotes", id);
    load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare?")) return;
    const db = getDB();
    await db.quotes.update(id, { _deleted: true, _dirty: true });
    markDirty("quotes", id);
    load();
  }

  async function save() {
    if (!form.clientName) return;
    setSaving(true);
    const db = getDB();
    const count = await db.quotes.count();
    const id = nanoid();
    await db.quotes.add({ id, clientName: form.clientName, quoteNumber: `PRV-${new Date().getFullYear()}-${String(count+1).padStart(3,"0")}`, status: "bozza", totalAmount: parseFloat(form.totalAmount) || 0, validUntil: form.validUntil || undefined, notes: form.notes || undefined, createdAt: new Date().toISOString(), _dirty: true });
    markDirty("quotes", id);
    setShowModal(false);
    setForm({ clientName: "", totalAmount: "", validUntil: "", notes: "" });
    setSaving(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Preventivi</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuovo Preventivo</button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[["all","Tutti"],["bozza","Bozza"],["inviato","Inviati"],["accettato","Accettati"],["rifiutato","Rifiutati"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter===v ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}>{l}</button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead><tr>{["N°","Cliente","Importo","Validità","Status","Azioni"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="tr">
                <td className="td font-mono text-xs text-blue-600">{q.quoteNumber || "—"}</td>
                <td className="td font-medium">{q.clientName}</td>
                <td className="td font-semibold">{fmtEur(q.totalAmount)}</td>
                <td className="td text-gray-500 text-xs">{q.validUntil ? fmtDate(q.validUntil) : "—"}</td>
                <td className="td"><span className={`badge ${statusBadge[q.status] || "bg-gray-100 text-gray-600"}`}>{statusLabel[q.status] || q.status}</span></td>
                <td className="td">
                  <div className="flex gap-1">
                    {q.status === "bozza" && <button className="btn btn-sm btn-secondary" onClick={() => changeStatus(q.id, "inviato")}>Invia</button>}
                    {q.status === "inviato" && <>
                      <button className="btn btn-sm" style={{background:"#dcfce7",color:"#166534"}} onClick={() => changeStatus(q.id, "accettato")}>✓</button>
                      <button className="btn btn-sm btn-danger" onClick={() => changeStatus(q.id, "rifiutato")}>✗</button>
                    </>}
                    <button className="btn btn-sm btn-danger" onClick={() => del(q.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && <tr><td colSpan={6} className="td text-center py-8 text-gray-400">Nessun preventivo</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3 className="text-lg font-semibold">Nuovo Preventivo</h3><button onClick={() => setShowModal(false)} className="text-gray-400 text-xl">×</button></div>
            <div className="modal-body space-y-4">
              <div><label className="label">Cliente *</label><input className="input" value={form.clientName} onChange={(e) => setForm({...form, clientName: e.target.value})} /></div>
              <div><label className="label">Importo (€)</label><input className="input" type="number" value={form.totalAmount} onChange={(e) => setForm({...form, totalAmount: e.target.value})} /></div>
              <div><label className="label">Valido fino al</label><input className="input" type="date" value={form.validUntil} onChange={(e) => setForm({...form, validUntil: e.target.value})} /></div>
              <div><label className="label">Note</label><textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "..." : "Salva"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
