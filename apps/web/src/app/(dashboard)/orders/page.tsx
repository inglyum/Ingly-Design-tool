"use client";
import { useEffect, useState } from "react";
import { ordersApi } from "@/lib/api";
import { fmtEur, fmtDate, statusLabel, statusColor, isOverdue } from "@/lib/format";

const COLUMNS = [
  { id: "backlog", label: "In Coda", color: "border-gray-300 bg-gray-50" },
  { id: "attesa", label: "In Attesa", color: "border-yellow-300 bg-yellow-50" },
  { id: "working", label: "In Lavorazione", color: "border-blue-300 bg-blue-50" },
  { id: "done", label: "Completato", color: "border-green-300 bg-green-50" },
  { id: "delivered", label: "Consegnato", color: "border-emerald-300 bg-emerald-50" },
] as const;

const PRIORITY_ICON: Record<string, string> = {
  urgent: "🔴", high: "🟠", normal: "🔵", low: "⚪"
};

export default function OrdersPage() {
  const [kanban, setKanban] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState<any>(null);

  async function load() {
    const data = await ordersApi.kanban();
    setKanban(data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function moveOrder(orderId: string, newStatus: string) {
    await ordersApi.updateStatus(orderId, newStatus);
    await load();
  }

  async function deleteOrder(id: string) {
    if (!confirm("Annullare questo ordine?")) return;
    await ordersApi.delete(id);
    await load();
  }

  const totalOrders = Object.values(kanban).flat().length;
  const overdueOrders = Object.values(kanban).flat().filter(
    (o) => isOverdue(o.dueDate) && !["completato","delivered"].includes(o.status)
  );

  return (
    <div className="space-y-4 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Ordini</h2>
          <p className="text-sm text-gray-500">
            {totalOrders} ordini totali
            {overdueOrders.length > 0 && (
              <span className="ml-2 text-red-600 font-medium">⚠️ {overdueOrders.length} in ritardo</span>
            )}
          </p>
        </div>
        <button onClick={() => { setEditOrder(null); setShowModal(true); }} className="btn-primary">
          + Nuovo Ordine
        </button>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="grid grid-cols-5 gap-3 animate-pulse">
          {COLUMNS.map((c) => <div key={c.id} className="h-64 skeleton rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const orders = kanban[col.id] || [];
            return (
              <div key={col.id} className={`rounded-xl border-2 ${col.color} p-3 min-h-32`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
                  <span className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full font-medium shadow-sm">
                    {orders.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {orders.map((order) => {
                    const overdue = isOverdue(order.dueDate) && !["completato","delivered"].includes(order.status);
                    return (
                      <div
                        key={order.id}
                        className={`kanban-card ${overdue ? "border-red-300 bg-red-50" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-500">{order.orderNumber}</p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {order.clientName || "Cliente"}
                            </p>
                          </div>
                          <span title={order.priority}>{PRIORITY_ICON[order.priority] || "🔵"}</span>
                        </div>

                        {order.notes && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{order.notes}</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-semibold ${overdue ? "text-red-600" : "text-gray-500"}`}>
                            {order.dueDate ? (overdue ? "⚠️ " : "") + fmtDate(order.dueDate) : "—"}
                          </span>
                          <span className="text-xs font-bold text-gray-700">{fmtEur(order.totalAmount)}</span>
                        </div>

                        {/* Move actions */}
                        <div className="flex gap-1 mt-2">
                          {COLUMNS.filter((c) => c.id !== col.id).slice(0, 2).map((target) => (
                            <button
                              key={target.id}
                              className="text-xs px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-gray-500 flex-1"
                              onClick={() => moveOrder(order.id, target.id)}
                              title={`Sposta in ${target.label}`}
                            >
                              → {target.label.split(" ")[0]}
                            </button>
                          ))}
                          <button
                            className="text-xs px-2 py-1 bg-white hover:bg-red-50 border border-gray-200 rounded text-red-400"
                            onClick={() => deleteOrder(order.id)}
                            title="Annulla"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {orders.length === 0 && (
                    <div className="text-center py-6 text-xs text-gray-400">
                      Nessun ordine
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Order Modal */}
      {showModal && (
        <OrderModal
          order={editOrder}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            if (editOrder) {
              await ordersApi.update(editOrder.id, data);
            } else {
              await ordersApi.create(data);
            }
            setShowModal(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function OrderModal({
  order, onClose, onSave
}: {
  order?: any; onClose: () => void; onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    clientName: order?.clientName || "",
    notes: order?.notes || "",
    totalAmount: order?.totalAmount || 0,
    priority: order?.priority || "normal",
    status: order?.status || "backlog",
    dueDate: order?.dueDate ? new Date(order.dueDate).toISOString().split("T")[0] : "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold">{order ? "Modifica Ordine" : "Nuovo Ordine"}</h3>
          <button onClick={onClose} className="btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Cliente *</label>
              <input className="input" value={form.clientName} onChange={(e) => setForm({...form, clientName: e.target.value})} required />
            </div>
            <div>
              <label className="label">Importo (€)</label>
              <input type="number" className="input" value={form.totalAmount} onChange={(e) => setForm({...form, totalAmount: Number(e.target.value)})} step="0.01" />
            </div>
            <div>
              <label className="label">Scadenza</label>
              <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} />
            </div>
            <div>
              <label className="label">Priorità</label>
              <select className="select" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                <option value="low">Bassa</option>
                <option value="normal">Normale</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label className="label">Stato</label>
              <select className="select" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                <option value="backlog">In Coda</option>
                <option value="attesa">In Attesa</option>
                <option value="working">In Lavorazione</option>
                <option value="done">Completato</option>
                <option value="delivered">Consegnato</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Note / Descrizione lavorazione</label>
              <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Descrivi l'ordine..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annulla</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Salvataggio..." : "Salva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
