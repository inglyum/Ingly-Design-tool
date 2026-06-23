"use client";
import { useEffect, useState } from "react";
import { getDB, type LocalOrder } from "@/lib/db";
import { markDirty } from "@/lib/sync";
import { fmtEur, fmtDate, isOverdue, priorityEmoji, statusLabel } from "@/lib/format";
import { nanoid } from "nanoid";

const COLUMNS = [
  { id: "backlog", label: "In Coda", color: "bg-gray-100" },
  { id: "attesa", label: "In Attesa", color: "bg-yellow-100" },
  { id: "working", label: "In Lavorazione", color: "bg-blue-100" },
  { id: "done", label: "Completato", color: "bg-green-100" },
  { id: "delivered", label: "Consegnato", color: "bg-emerald-100" },
];

const STATUS_FLOW: Record<string, string[]> = {
  backlog: ["attesa","working"],
  attesa: ["working","done"],
  working: ["done","delivered"],
  done: ["delivered"],
  delivered: [],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ clientName: "", totalAmount: "", dueDate: "", priority: "normale", notes: "", status: "backlog" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const db = getDB();
    const all = await db.orders.filter((o) => !o._deleted).toArray();
    setOrders(all);
  }

  async function move(id: string, newStatus: string) {
    const db = getDB();
    await db.orders.update(id, { status: newStatus, _dirty: true });
    markDirty("orders", id);
    load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare questo ordine?")) return;
    const db = getDB();
    await db.orders.update(id, { _deleted: true, _dirty: true });
    markDirty("orders", id);
    load();
  }

  async function save() {
    if (!form.clientName) return;
    setSaving(true);
    const db = getDB();
    const id = nanoid();
    const count = await db.orders.count();
    const year = new Date().getFullYear();
    await db.orders.add({
      id,
      clientName: form.clientName,
      orderNumber: `ORD-${year}-${String(count + 1).padStart(3, "0")}`,
      status: form.status,
      priority: form.priority,
      totalAmount: parseFloat(form.totalAmount) || 0,
      dueDate: form.dueDate || undefined,
      notes: form.notes || undefined,
      createdAt: new Date().toISOString(),
      _dirty: true,
    });
    markDirty("orders", id);
    setShowModal(false);
    setForm({ clientName: "", totalAmount: "", dueDate: "", priority: "normale", notes: "", status: "backlog" });
    setSaving(false);
    load();
  }

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = orders.filter((o) => o.status === col.id);
    return acc;
  }, {} as Record<string, LocalOrder[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ordini</h1>
          <p className="text-sm text-gray-500">{orders.length} ordini totali</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuovo Ordine</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-64">
            <div className={`${col.color} rounded-xl px-3 py-2 mb-2 flex items-center justify-between`}>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{col.label}</p>
              <span className="text-xs bg-white/80 text-gray-600 px-1.5 py-0.5 rounded-full">{grouped[col.id]?.length || 0}</span>
            </div>
            <div className="space-y-2">
              {(grouped[col.id] || []).map((order) => (
                <div key={order.id} className="card card-body hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-900">{priorityEmoji(order.priority)} {order.clientName}</p>
                    <button className="text-gray-300 hover:text-red-400 text-xs" onClick={() => del(order.id)}>✕</button>
                  </div>
                  {order.orderNumber && <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber}</p>}
                  <p className="text-sm font-semibold text-blue-700 mt-1">{fmtEur(order.totalAmount)}</p>
                  {order.dueDate && (
                    <p className={`text-xs mt-1 ${isOverdue(order.dueDate) ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      {isOverdue(order.dueDate) ? "⚠️ " : ""}Scade {fmtDate(order.dueDate)}
                    </p>
                  )}
                  {order.notes && <p className="text-xs text-gray-500 mt-1 truncate">{order.notes}</p>}
                  {STATUS_FLOW[order.status]?.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {STATUS_FLOW[order.status].map((next) => (
                        <button key={next} className="btn btn-sm btn-secondary text-xs" onClick={() => move(order.id, next)}>
                          → {statusLabel[next]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(grouped[col.id] || []).length === 0 && (
                <div className="text-center py-6 text-gray-300 text-xs">Vuoto</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Nuovo Ordine</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="label">Cliente *</label>
                <input className="input" value={form.clientName} onChange={(e) => setForm({...form, clientName: e.target.value})} placeholder="Nome cliente" />
              </div>
              <div>
                <label className="label">Importo (€)</label>
                <input className="input" type="number" value={form.totalAmount} onChange={(e) => setForm({...form, totalAmount: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <label className="label">Scadenza</label>
                <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} />
              </div>
              <div>
                <label className="label">Priorità</label>
                <select className="select" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                  {["urgente","alta","normale","bassa"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Note</label>
                <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Dettagli lavoro..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "..." : "Crea Ordine"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
