"use client";
import { useEffect, useState } from "react";
import { cashflowApi } from "@/lib/api";
import { fmtEur, fmtDate } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function CashflowPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [chart, setChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);

  async function load() {
    const params = typeFilter ? `type=${typeFilter}` : "";
    const res = await cashflowApi.list(params || undefined);
    setEntries(res.data);
    setSummary(res.summary || {});
    const c = await cashflowApi.chart();
    setChart(c);
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!loading) load(); }, [typeFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa voce?")) return;
    await cashflowApi.delete(id);
    await load();
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Cashflow</h2>
        <button onClick={() => { setEditEntry(null); setShowModal(true); }} className="btn-primary">
          + Registra Movimento
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center border-green-200">
          <p className="text-xl font-bold text-green-600">{fmtEur(summary.entrate)}</p>
          <p className="text-xs text-gray-500">Entrate totali</p>
        </div>
        <div className="card p-4 text-center border-red-200">
          <p className="text-xl font-bold text-red-500">{fmtEur(summary.uscite)}</p>
          <p className="text-xs text-gray-500">Uscite totali</p>
        </div>
        <div className={`card p-4 text-center ${(summary.saldo || 0) >= 0 ? "border-blue-200" : "border-red-300"}`}>
          <p className={`text-xl font-bold ${(summary.saldo || 0) >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {fmtEur(summary.saldo)}
          </p>
          <p className="text-xs text-gray-500">Saldo netto</p>
        </div>
      </div>

      {/* Chart */}
      {chart.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold">Andamento ultimi 6 mesi</h3></div>
          <div className="card-body pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtEur(v)} />
                <Legend />
                <Bar dataKey="entrate" fill="#10b981" name="Entrate" radius={[4,4,0,0]} />
                <Bar dataKey="uscite" fill="#ef4444" name="Uscite" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters + Table */}
      <div className="flex gap-2">
        {[{v:"",l:"Tutti"},{v:"entrata",l:"Entrate"},{v:"uscita",l:"Uscite"}].map(f => (
          <button key={f.v} className={`btn btn-sm ${typeFilter===f.v?"btn-primary":"btn-secondary"}`} onClick={()=>setTypeFilter(f.v)}>
            {f.l}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead><tr>
            <th className="th">Data</th>
            <th className="th">Tipo</th>
            <th className="th">Categoria</th>
            <th className="th">Descrizione</th>
            <th className="th">Metodo</th>
            <th className="th">Importo</th>
            <th className="th">Azioni</th>
          </tr></thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {entries.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Nessun movimento</td></tr>
            ) : entries.map((e) => (
              <tr key={e.id} className="tr">
                <td className="td text-gray-500">{fmtDate(e.date)}</td>
                <td className="td">
                  <span className={`badge ${e.type==="entrata" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {e.type === "entrata" ? "↑ Entrata" : "↓ Uscita"}
                  </span>
                </td>
                <td className="td text-gray-500">{e.category || "—"}</td>
                <td className="td font-medium">{e.description}</td>
                <td className="td text-gray-500 text-xs">{e.paymentMethod || "—"}</td>
                <td className={`td font-bold ${e.type==="entrata"?"text-green-600":"text-red-500"}`}>
                  {e.type==="entrata" ? "+" : "-"}{fmtEur(e.amount)}
                </td>
                <td className="td">
                  <div className="flex gap-1">
                    <button className="btn-ghost btn-sm" onClick={() => { setEditEntry(e); setShowModal(true); }}>✏️</button>
                    <button className="btn-ghost btn-sm text-red-400" onClick={() => handleDelete(e.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CashflowModal
          entry={editEntry}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            if (editEntry) await cashflowApi.update(editEntry.id, data);
            else await cashflowApi.create(data);
            setShowModal(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function CashflowModal({ entry, onClose, onSave }: { entry?: any; onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    type: entry?.type || "entrata",
    category: entry?.category || "",
    description: entry?.description || "",
    amount: entry?.amount || "",
    date: entry?.date ? new Date(entry.date).toISOString().split("T")[0] : today,
    paymentMethod: entry?.paymentMethod || "Bonifico",
    notes: entry?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const f = (field: string) => (e: any) => setForm({...form, [field]: e.target.value});

  const categories = form.type === "entrata"
    ? ["Vendite","Anticipo","Rimborso","Altro"]
    : ["Materiali","Costi fissi","Marketing","Attrezzature","Consulenze","Tasse","Utenze","Affitto","Altro"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSave({ ...form, amount: Number(form.amount) }); } finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold">{entry ? "Modifica Voce" : "Nuovo Movimento"}</h3>
          <button onClick={onClose} className="btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Tipo *</label>
              <div className="flex gap-2">
                <button type="button" className={`flex-1 py-2 rounded-lg text-sm font-medium border ${form.type==="entrata"?"bg-green-50 border-green-400 text-green-700":"border-gray-200 text-gray-500"}`} onClick={() => setForm({...form, type:"entrata"})}>↑ Entrata</button>
                <button type="button" className={`flex-1 py-2 rounded-lg text-sm font-medium border ${form.type==="uscita"?"bg-red-50 border-red-400 text-red-700":"border-gray-200 text-gray-500"}`} onClick={() => setForm({...form, type:"uscita"})}>↓ Uscita</button>
              </div>
            </div>
            <div>
              <label className="label">Importo (€) *</label>
              <input type="number" className="input" value={form.amount} onChange={f("amount")} step="0.01" required />
            </div>
            <div>
              <label className="label">Data *</label>
              <input type="date" className="input" value={form.date} onChange={f("date")} required />
            </div>
            <div className="col-span-2">
              <label className="label">Descrizione *</label>
              <input className="input" value={form.description} onChange={f("description")} required />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="select" value={form.category} onChange={f("category")}>
                <option value="">— Seleziona —</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Metodo Pagamento</label>
              <select className="select" value={form.paymentMethod} onChange={f("paymentMethod")}>
                {["Bonifico","Contanti","Carta","PayPal","Assegno"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annulla</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
