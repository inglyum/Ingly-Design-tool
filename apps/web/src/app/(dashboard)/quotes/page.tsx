"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fmtEur, fmtDate, statusColor, statusLabel } from "@/lib/format";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ clientName: "", totalAmount: "", validUntil: "", notes: "", status: "bozza" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get<any>("/api/quotes");
      setQuotes(r.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await api.post("/api/quotes", { ...form, totalAmount: parseFloat(form.totalAmount) || 0 });
      setShowModal(false);
      setForm({ clientName: "", totalAmount: "", validUntil: "", notes: "", status: "bozza" });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id: string, status: string) {
    await api.patch(`/api/quotes/${id}/status`, { status });
    load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare questo preventivo?")) return;
    await api.delete(`/api/quotes/${id}`);
    load();
  }

  const filtered = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preventivi</h1>
          <p className="text-sm text-gray-500 mt-1">{quotes.length} preventivi totali</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuovo Preventivo</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[["all","Tutti"],["bozza","Bozza"],["inviato","Inviato"],["accettato","Accettato"],["rifiutato","Rifiutato"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === v ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {["N°","Cliente","Importo","Validità","Status","Azioni"].map((h) => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((q: any) => (
              <tr key={q.id} className="tr">
                <td className="td font-mono text-sm text-blue-600">{q.quoteNumber || "—"}</td>
                <td className="td font-medium text-gray-900">{q.clientName}</td>
                <td className="td font-semibold">{fmtEur(q.totalAmount)}</td>
                <td className="td text-sm text-gray-500">{q.validUntil ? fmtDate(q.validUntil) : "—"}</td>
                <td className="td">
                  <span className={`badge ${statusColor(q.status)}`}>{statusLabel(q.status)}</span>
                </td>
                <td className="td">
                  <div className="flex gap-1">
                    {q.status === "bozza" && (
                      <button className="btn btn-sm btn-secondary" onClick={() => changeStatus(q.id, "inviato")}>Invia</button>
                    )}
                    {q.status === "inviato" && (
                      <>
                        <button className="btn btn-sm" style={{background:"#dcfce7",color:"#166534"}} onClick={() => changeStatus(q.id, "accettato")}>✓ Accetta</button>
                        <button className="btn btn-sm btn-danger" onClick={() => changeStatus(q.id, "rifiutato")}>✗ Rifiuta</button>
                      </>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => del(q.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="td text-center text-gray-400 py-8">Nessun preventivo</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Nuovo Preventivo</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="label">Cliente *</label>
                <input className="input" value={form.clientName} onChange={(e) => setForm({...form, clientName: e.target.value})} placeholder="Nome cliente" />
              </div>
              <div>
                <label className="label">Importo (€) *</label>
                <input className="input" type="number" value={form.totalAmount} onChange={(e) => setForm({...form, totalAmount: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <label className="label">Validità fino al</label>
                <input className="input" type="date" value={form.validUntil} onChange={(e) => setForm({...form, validUntil: e.target.value})} />
              </div>
              <div>
                <label className="label">Note</label>
                <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Descrizione servizi..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Salvataggio..." : "Salva Preventivo"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
