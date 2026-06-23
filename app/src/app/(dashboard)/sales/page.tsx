"use client";
import { useEffect, useState } from "react";
import { getDB, type LocalSale } from "@/lib/db";
import { markDirty } from "@/lib/sync";
import { fmtEur, fmtDate, statusLabel, statusBadge } from "@/lib/format";
import { nanoid } from "nanoid";

export default function SalesPage() {
  const [sales, setSales] = useState<LocalSale[]>([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ clientName: "", subtotal: "", taxRate: "22", dueDate: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, unpaid: 0 });

  useEffect(() => { load(); }, [filter]);

  async function load() {
    const db = getDB();
    let all = await db.sales.filter((s) => !s._deleted).toArray();
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const revenue = all.filter((s) => s.status === "pagato").reduce((s, x) => s + x.totalAmount, 0);
    const unpaid = all.filter((s) => s.status === "da_pagare").reduce((s, x) => s + x.totalAmount, 0);
    setStats({ revenue, unpaid });
    setSales(filter === "all" ? all : all.filter((s) => s.status === filter));
  }

  async function markPaid(id: string) {
    const db = getDB();
    await db.sales.update(id, { status: "pagato", paidAt: new Date().toISOString(), _dirty: true });
    markDirty("sales", id);
    load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare questa fattura?")) return;
    const db = getDB();
    await db.sales.update(id, { _deleted: true, _dirty: true });
    markDirty("sales", id);
    load();
  }

  async function save() {
    if (!form.clientName || !form.subtotal) return;
    setSaving(true);
    const db = getDB();
    const subtotal = parseFloat(form.subtotal) || 0;
    const taxRate = parseFloat(form.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    const count = await db.sales.count();
    const year = new Date().getFullYear();
    const id = nanoid();
    await db.sales.add({
      id, clientName: form.clientName, subtotal, taxAmount, totalAmount,
      status: "bozza", invoiceNumber: `FT-${year}-${String(count + 1).padStart(3, "0")}`,
      issueDate: new Date().toISOString(), dueDate: form.dueDate || undefined,
      notes: form.notes || undefined, createdAt: new Date().toISOString(), _dirty: true,
    });
    markDirty("sales", id);
    setShowModal(false);
    setForm({ clientName: "", subtotal: "", taxRate: "22", dueDate: "", notes: "" });
    setSaving(false);
    load();
  }

  const subtotal = parseFloat(form.subtotal) || 0;
  const taxAmt = subtotal * (parseFloat(form.taxRate) / 100 || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fatture</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuova Fattura</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card card-body"><p className="kpi-label">Revenue Totale</p><p className="kpi-val">{fmtEur(stats.revenue)}</p></div>
        <div className="card card-body"><p className="kpi-label">Da Incassare</p><p className="kpi-val text-amber-600">{fmtEur(stats.unpaid)}</p></div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[["all","Tutte"],["da_pagare","Da Pagare"],["pagato","Pagate"],["bozza","Bozze"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === v ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{l}</button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>{["N° Fattura","Cliente","Data","Scadenza","Importo","IVA","Totale","Status","Azioni"].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="tr">
                <td className="td font-mono text-xs text-blue-600">{s.invoiceNumber || "—"}</td>
                <td className="td font-medium">{s.clientName}</td>
                <td className="td text-gray-500 text-xs">{fmtDate(s.issueDate)}</td>
                <td className="td text-gray-500 text-xs">{s.dueDate ? fmtDate(s.dueDate) : "—"}</td>
                <td className="td">{fmtEur(s.subtotal)}</td>
                <td className="td text-gray-500">{fmtEur(s.taxAmount)}</td>
                <td className="td font-semibold">{fmtEur(s.totalAmount)}</td>
                <td className="td"><span className={`badge ${statusBadge[s.status] || "bg-gray-100 text-gray-600"}`}>{statusLabel[s.status] || s.status}</span></td>
                <td className="td">
                  <div className="flex gap-1">
                    {s.status === "da_pagare" && <button className="btn btn-sm" style={{background:"#dcfce7",color:"#166534"}} onClick={() => markPaid(s.id)}>✓ Pagata</button>}
                    <button className="btn btn-sm btn-danger" onClick={() => del(s.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan={9} className="td text-center py-8 text-gray-400">Nessuna fattura</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Nuova Fattura</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="modal-body space-y-4">
              <div><label className="label">Cliente *</label><input className="input" value={form.clientName} onChange={(e) => setForm({...form, clientName: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Imponibile (€)</label><input className="input" type="number" value={form.subtotal} onChange={(e) => setForm({...form, subtotal: e.target.value})} placeholder="0.00" /></div>
                <div><label className="label">IVA %</label><select className="select" value={form.taxRate} onChange={(e) => setForm({...form, taxRate: e.target.value})}>{["0","4","10","22"].map((r) => <option key={r} value={r}>{r}%</option>)}</select></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Imponibile</span><span>{fmtEur(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">IVA {form.taxRate}%</span><span>{fmtEur(taxAmt)}</span></div>
                <div className="flex justify-between font-bold mt-1 pt-1 border-t border-gray-200"><span>Totale</span><span>{fmtEur(subtotal + taxAmt)}</span></div>
              </div>
              <div><label className="label">Scadenza pagamento</label><input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} /></div>
              <div><label className="label">Note</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
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
