"use client";
import { useEffect, useState } from "react";
import { salesApi } from "@/lib/api";
import { fmtEur, fmtDate, statusLabel, statusColor } from "@/lib/format";

const STATUS_FILTERS = [
  { value: "", label: "Tutte" },
  { value: "da_pagare", label: "Da Pagare" },
  { value: "pagato", label: "Pagate" },
  { value: "bozza", label: "Bozze" },
];

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editSale, setEditSale] = useState<any>(null);

  async function load() {
    const params = [
      statusFilter ? `status=${statusFilter}` : "",
      search ? `search=${encodeURIComponent(search)}` : "",
    ].filter(Boolean).join("&");
    const res = await salesApi.list(params || undefined);
    setSales(res.data);
    setTotal(res.total);
    const s = await salesApi.stats();
    setStats(s);
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!loading) load(); }, [statusFilter]);

  async function markPaid(id: string) {
    await salesApi.updateStatus(id, "pagato");
    await load();
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendite & Fatture</h2>
          <p className="text-sm text-gray-500">{total} fatture</p>
        </div>
        <button onClick={() => { setEditSale(null); setShowModal(true); }} className="btn-primary">
          + Nuova Fattura
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-green-600">{fmtEur(stats.revenueThisMonth)}</p>
          <p className="text-xs text-gray-500">Revenue questo mese</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-orange-500">{fmtEur(stats.unpaidAmount)}</p>
          <p className="text-xs text-gray-500">{stats.unpaidCount} da incassare</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-blue-600">{fmtEur(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-500">Revenue totale</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`btn btn-sm ${statusFilter === f.value ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <input
          className="input max-w-xs ml-auto"
          placeholder="Cerca cliente o numero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 skeleton rounded-lg" />)}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="th">N. Fattura</th>
                <th className="th">Cliente</th>
                <th className="th">Data</th>
                <th className="th">Scadenza</th>
                <th className="th">Importo</th>
                <th className="th">Stato</th>
                <th className="th">Azioni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Nessuna fattura trovata
                  </td>
                </tr>
              ) : sales.map((s) => (
                <tr key={s.id} className="tr">
                  <td className="td font-mono font-semibold text-blue-600">{s.invoiceNumber}</td>
                  <td className="td font-medium">{s.clientName || "—"}</td>
                  <td className="td text-gray-500">{fmtDate(s.issueDate)}</td>
                  <td className="td text-gray-500">{fmtDate(s.dueDate)}</td>
                  <td className="td font-bold">{fmtEur(s.totalAmount)}</td>
                  <td className="td">
                    <span className={`badge ${statusColor(s.status)}`}>{statusLabel(s.status)}</span>
                  </td>
                  <td className="td">
                    <div className="flex gap-1">
                      {s.status === "da_pagare" && (
                        <button
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          onClick={() => markPaid(s.id)}
                        >
                          ✓ Pagata
                        </button>
                      )}
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => { setEditSale(s); setShowModal(true); }}
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <SaleModal
          sale={editSale}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            if (editSale) {
              await salesApi.update(editSale.id, data);
            } else {
              await salesApi.create(data);
            }
            setShowModal(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function SaleModal({ sale, onClose, onSave }: { sale?: any; onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const [form, setForm] = useState({
    clientName: sale?.clientName || "",
    totalAmount: sale?.totalAmount || 0,
    taxRate: sale?.taxRate || 22,
    status: sale?.status || "da_pagare",
    paymentMethod: sale?.paymentMethod || "Bonifico",
    notes: sale?.notes || "",
    dueDate: sale?.dueDate ? new Date(sale.dueDate).toISOString().split("T")[0] : "",
  });
  const [saving, setSaving] = useState(false);
  const f = (field: string) => (e: any) => setForm({...form, [field]: e.target.value});

  const subtotal = Number(form.totalAmount) / (1 + Number(form.taxRate) / 100);
  const taxAmount = Number(form.totalAmount) - subtotal;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        totalAmount: Number(form.totalAmount),
        taxRate: Number(form.taxRate),
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
      });
    } finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold">{sale ? "Modifica Fattura" : "Nuova Fattura"}</h3>
          <button onClick={onClose} className="btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Cliente *</label>
              <input className="input" value={form.clientName} onChange={f("clientName")} required />
            </div>
            <div>
              <label className="label">Importo Totale (IVA incl. €)</label>
              <input type="number" className="input" value={form.totalAmount} onChange={f("totalAmount")} step="0.01" required />
            </div>
            <div>
              <label className="label">IVA %</label>
              <select className="select" value={form.taxRate} onChange={f("taxRate")}>
                <option value="22">22%</option>
                <option value="10">10%</option>
                <option value="4">4%</option>
                <option value="0">0% (esente)</option>
              </select>
            </div>
            <div className="col-span-2 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Imponibile:</span><span>{fmtEur(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA {form.taxRate}%:</span><span>{fmtEur(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base mt-1 pt-1 border-t border-gray-200">
                <span>Totale:</span><span>{fmtEur(Number(form.totalAmount))}</span>
              </div>
            </div>
            <div>
              <label className="label">Metodo Pagamento</label>
              <select className="select" value={form.paymentMethod} onChange={f("paymentMethod")}>
                <option>Bonifico</option>
                <option>Contanti</option>
                <option>Carta</option>
                <option>PayPal</option>
                <option>Assegno</option>
              </select>
            </div>
            <div>
              <label className="label">Scadenza Pagamento</label>
              <input type="date" className="input" value={form.dueDate} onChange={f("dueDate")} />
            </div>
            <div>
              <label className="label">Stato</label>
              <select className="select" value={form.status} onChange={f("status")}>
                <option value="bozza">Bozza</option>
                <option value="da_pagare">Da Pagare</option>
                <option value="pagato">Pagato</option>
              </select>
            </div>
            <div>
              <label className="label">Note</label>
              <input className="input" value={form.notes} onChange={f("notes")} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annulla</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Salvataggio..." : "Salva Fattura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
