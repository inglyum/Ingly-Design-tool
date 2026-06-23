"use client";
import { useEffect, useState } from "react";
import { clientsApi } from "@/lib/api";
import { fmtEur, fmtDate } from "@/lib/format";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);

  async function load(q?: string) {
    const params = q ? `search=${encodeURIComponent(q)}` : "";
    const res = await clientsApi.list(params);
    setClients(res.data);
    setTotal(res.total);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await load(search);
  }

  async function handleDelete(id: string) {
    if (!confirm("Archiviare questo cliente?")) return;
    await clientsApi.delete(id);
    await load(search);
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clienti</h2>
          <p className="text-sm text-gray-500">{total} clienti totali</p>
        </div>
        <button onClick={() => { setEditClient(null); setShowModal(true); }} className="btn-primary">
          + Nuovo Cliente
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input max-w-sm"
          placeholder="Cerca per nome, email, telefono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-secondary">🔍 Cerca</button>
        {search && (
          <button type="button" className="btn-ghost" onClick={() => { setSearch(""); load(); }}>
            Cancella
          </button>
        )}
      </form>

      {/* Table */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 skeleton rounded-lg" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-500">Nessun cliente trovato</p>
          <button className="btn-primary mt-4" onClick={() => setShowModal(true)}>
            Aggiungi il primo cliente
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Cliente</th>
                <th className="th">Email / Telefono</th>
                <th className="th">Tipo</th>
                <th className="th">Revenue</th>
                <th className="th">Ordini</th>
                <th className="th">Ultimo Ordine</th>
                <th className="th">Azioni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {clients.map((c) => (
                <tr key={c.id} className="tr">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {(c.companyName || c.firstName || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {c.companyName || `${c.firstName || ""} ${c.lastName || ""}`.trim()}
                        </p>
                        {c.city && <p className="text-xs text-gray-400">{c.city}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="td">
                    <p className="text-sm">{c.email || "—"}</p>
                    <p className="text-xs text-gray-400">{c.phone || c.mobile || ""}</p>
                  </td>
                  <td className="td">
                    <span className={`badge ${c.type === "b2b" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {c.type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="td font-semibold">{fmtEur(c.totalRevenue)}</td>
                  <td className="td">{c.ordersCount}</td>
                  <td className="td text-gray-500">{fmtDate(c.lastOrderAt)}</td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => { setEditClient(c); setShowModal(true); }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-ghost btn-sm text-red-400 hover:text-red-600"
                        onClick={() => handleDelete(c.id)}
                      >
                        🗑️
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
        <ClientModal
          client={editClient}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            if (editClient) {
              await clientsApi.update(editClient.id, data);
            } else {
              await clientsApi.create(data);
            }
            setShowModal(false);
            await load(search);
          }}
        />
      )}
    </div>
  );
}

function ClientModal({ client, onClose, onSave }: { client?: any; onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const [form, setForm] = useState({
    firstName: client?.firstName || "",
    lastName: client?.lastName || "",
    companyName: client?.companyName || "",
    email: client?.email || "",
    phone: client?.phone || "",
    city: client?.city || "",
    type: client?.type || "b2c",
    vatNumber: client?.vatNumber || "",
    notes: client?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const f = (field: string) => (e: any) => setForm({...form, [field]: e.target.value});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold">{client ? "Modifica Cliente" : "Nuovo Cliente"}</h3>
          <button onClick={onClose} className="btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" value={form.firstName} onChange={f("firstName")} />
            </div>
            <div>
              <label className="label">Cognome</label>
              <input className="input" value={form.lastName} onChange={f("lastName")} />
            </div>
            <div className="col-span-2">
              <label className="label">Ragione Sociale</label>
              <input className="input" value={form.companyName} onChange={f("companyName")} placeholder="Per aziende B2B" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={f("email")} />
            </div>
            <div>
              <label className="label">Telefono</label>
              <input className="input" value={form.phone} onChange={f("phone")} />
            </div>
            <div>
              <label className="label">Città</label>
              <input className="input" value={form.city} onChange={f("city")} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="select" value={form.type} onChange={f("type")}>
                <option value="b2c">Privato (B2C)</option>
                <option value="b2b">Azienda (B2B)</option>
              </select>
            </div>
            {form.type === "b2b" && (
              <div className="col-span-2">
                <label className="label">P.IVA</label>
                <input className="input" value={form.vatNumber} onChange={f("vatNumber")} placeholder="IT12345678901" />
              </div>
            )}
            <div className="col-span-2">
              <label className="label">Note</label>
              <textarea className="input" rows={2} value={form.notes} onChange={f("notes")} />
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
