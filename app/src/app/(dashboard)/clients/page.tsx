"use client";
import { useEffect, useState } from "react";
import { getDB, type LocalClient } from "@/lib/db";
import { markDirty } from "@/lib/sync";
import { nanoid } from "nanoid";

export default function ClientsPage() {
  const [clients, setClients] = useState<LocalClient[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LocalClient | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", companyName: "", email: "", phone: "", city: "", type: "b2c", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [search]);

  async function load() {
    const db = getDB();
    let all = await db.clients.filter((c) => !c._deleted).toArray();
    if (search) {
      const q = search.toLowerCase();
      all = all.filter((c) => [c.firstName, c.lastName, c.companyName, c.email, c.phone].join(" ").toLowerCase().includes(q));
    }
    setClients(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  function openNew() {
    setEditing(null);
    setForm({ firstName: "", lastName: "", companyName: "", email: "", phone: "", city: "", type: "b2c", notes: "" });
    setShowModal(true);
  }

  function openEdit(c: LocalClient) {
    setEditing(c);
    setForm({ firstName: c.firstName, lastName: c.lastName, companyName: c.companyName || "", email: c.email || "", phone: c.phone || "", city: c.city || "", type: c.type, notes: c.notes || "" });
    setShowModal(true);
  }

  async function save() {
    if (!form.firstName && !form.companyName) return;
    setSaving(true);
    const db = getDB();
    if (editing) {
      await db.clients.update(editing.id, { ...form, _dirty: true });
      markDirty("clients", editing.id);
    } else {
      const id = nanoid();
      await db.clients.add({ id, ...form, createdAt: new Date().toISOString(), _dirty: true });
      markDirty("clients", id);
    }
    setShowModal(false);
    setSaving(false);
    load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare questo cliente?")) return;
    const db = getDB();
    await db.clients.update(id, { _deleted: true, _dirty: true });
    markDirty("clients", id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clienti</h1>
          <p className="text-sm text-gray-500">{clients.length} clienti</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nuovo Cliente</button>
      </div>

      <input className="input max-w-sm" placeholder="Cerca..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>{["Cliente","Email","Telefono","Città","Tipo","Azioni"].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="tr">
                <td className="td">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {(c.firstName?.[0] || c.companyName?.[0] || "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                      {c.companyName && <p className="text-xs text-gray-400">{c.companyName}</p>}
                    </div>
                  </div>
                </td>
                <td className="td text-gray-500">{c.email || "—"}</td>
                <td className="td text-gray-500">{c.phone || "—"}</td>
                <td className="td text-gray-500">{c.city || "—"}</td>
                <td className="td">
                  <span className={`badge ${c.type === "b2b" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                    {c.type?.toUpperCase()}
                  </span>
                </td>
                <td className="td">
                  <div className="flex gap-1">
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(c)}>Modifica</button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(c.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && <tr><td colSpan={6} className="td text-center py-8 text-gray-400">Nessun cliente</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">{editing ? "Modifica Cliente" : "Nuovo Cliente"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Nome</label><input className="input" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} /></div>
                <div><label className="label">Cognome</label><input className="input" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} /></div>
                <div className="col-span-2"><label className="label">Azienda</label><input className="input" value={form.companyName} onChange={(e) => setForm({...form, companyName: e.target.value})} /></div>
                <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
                <div><label className="label">Telefono</label><input className="input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
                <div><label className="label">Città</label><input className="input" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} /></div>
                <div>
                  <label className="label">Tipo</label>
                  <select className="select" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                    <option value="b2c">B2C (Privato)</option>
                    <option value="b2b">B2B (Azienda)</option>
                  </select>
                </div>
                <div className="col-span-2"><label className="label">Note</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
              </div>
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
