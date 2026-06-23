"use client";
import { useEffect, useState } from "react";
import { getDB, type LocalCashflow } from "@/lib/db";
import { markDirty } from "@/lib/sync";
import { fmtEur, fmtDate } from "@/lib/format";
import { nanoid } from "nanoid";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function CashflowPage() {
  const [entries, setEntries] = useState<LocalCashflow[]>([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "entrata", amount: "", description: "", category: "", paymentMethod: "bonifico", date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ entrate: 0, uscite: 0, saldo: 0 });
  const [chart, setChart] = useState<any[]>([]);

  useEffect(() => { load(); }, [filter]);

  async function load() {
    const db = getDB();
    const all = await db.cashflows.filter((c) => !c._deleted).toArray();
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const entrate = all.filter((c) => c.type === "entrata").reduce((s, x) => s + x.amount, 0);
    const uscite = all.filter((c) => c.type === "uscita").reduce((s, x) => s + x.amount, 0);
    setStats({ entrate, uscite, saldo: entrate - uscite });

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const label = d.toLocaleString("it-IT", { month: "short" });
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return { label, entrate: all.filter((c) => c.type === "entrata" && new Date(c.date) >= d && new Date(c.date) < end).reduce((s, x) => s + x.amount, 0), uscite: all.filter((c) => c.type === "uscita" && new Date(c.date) >= d && new Date(c.date) < end).reduce((s, x) => s + x.amount, 0) };
    });
    setChart(months);

    setEntries(filter === "all" ? all : all.filter((c) => c.type === filter));
  }

  async function del(id: string) {
    if (!confirm("Eliminare?")) return;
    const db = getDB();
    await db.cashflows.update(id, { _deleted: true, _dirty: true });
    markDirty("cashflows", id);
    load();
  }

  async function save() {
    if (!form.description || !form.amount) return;
    setSaving(true);
    const id = nanoid();
    const db = getDB();
    await db.cashflows.add({ id, type: form.type, amount: parseFloat(form.amount) || 0, description: form.description, category: form.category || undefined, paymentMethod: form.paymentMethod || undefined, date: new Date(form.date).toISOString(), createdAt: new Date().toISOString(), _dirty: true });
    markDirty("cashflows", id);
    setShowModal(false);
    setForm({ type: "entrata", amount: "", description: "", category: "", paymentMethod: "bonifico", date: new Date().toISOString().slice(0, 10) });
    setSaving(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cashflow</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Registra Movimento</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card card-body border-green-200 bg-green-50"><p className="kpi-label">Entrate</p><p className="kpi-val text-green-700">{fmtEur(stats.entrate)}</p></div>
        <div className="card card-body border-red-200 bg-red-50"><p className="kpi-label">Uscite</p><p className="kpi-val text-red-600">{fmtEur(stats.uscite)}</p></div>
        <div className={`card card-body ${stats.saldo >= 0 ? "border-blue-200 bg-blue-50" : "border-red-200 bg-red-50"}`}><p className="kpi-label">Saldo</p><p className={`kpi-val ${stats.saldo >= 0 ? "text-blue-700" : "text-red-600"}`}>{fmtEur(stats.saldo)}</p></div>
      </div>

      <div className="card card-body">
        <p className="text-sm font-semibold text-gray-700 mb-4">Ultimi 6 mesi</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chart}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
            <Tooltip formatter={(v: any) => fmtEur(v)} />
            <Legend />
            <Bar dataKey="entrate" name="Entrate" fill="#22c55e" radius={[4,4,0,0]} />
            <Bar dataKey="uscite" name="Uscite" fill="#ef4444" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[["all","Tutti"],["entrata","Entrate"],["uscita","Uscite"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === v ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}>{l}</button>
        ))}
      </div>

      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.id} className="card card-body flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${e.type === "entrata" ? "bg-green-100" : "bg-red-100"}`}>
                {e.type === "entrata" ? "📥" : "📤"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{e.description}</p>
                <p className="text-xs text-gray-400">{fmtDate(e.date)}{e.category ? ` · ${e.category}` : ""}{e.paymentMethod ? ` · ${e.paymentMethod}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className={`text-sm font-bold ${e.type === "entrata" ? "text-green-700" : "text-red-600"}`}>
                {e.type === "entrata" ? "+" : "-"}{fmtEur(e.amount)}
              </p>
              <button className="btn btn-sm btn-danger" onClick={() => del(e.id)}>🗑</button>
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-center py-8 text-gray-400">Nessun movimento</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Nuovo Movimento</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="modal-body space-y-4">
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {[["entrata","📥 Entrata"],["uscita","📤 Uscita"]].map(([v, l]) => (
                  <button key={v} className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type === v ? (v === "entrata" ? "bg-green-600 text-white" : "bg-red-600 text-white") : "bg-white text-gray-600"}`} onClick={() => setForm({...form, type: v})}>{l}</button>
                ))}
              </div>
              <div><label className="label">Importo (€) *</label><input className="input" type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} placeholder="0.00" /></div>
              <div><label className="label">Descrizione *</label><input className="input" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="es. Pagamento fattura cliente" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Categoria</label><input className="input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="es. vendite" /></div>
                <div>
                  <label className="label">Metodo</label>
                  <select className="select" value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})}>
                    {["bonifico","contanti","carta","assegno","altro"].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label">Data</label><input className="input" type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "..." : "Registra"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
