"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", sku: "", quantity: "", minQuantity: "", unit: "pz", location: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get<any>("/api/inventory");
      setItems(r.data || []);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setForm({ name: "", sku: "", quantity: "", minQuantity: "", unit: "pz", location: "", notes: "" });
    setShowModal(true);
  }

  function openEdit(item: any) {
    setEditing(item);
    setForm({ name: item.name, sku: item.sku || "", quantity: String(item.quantity || 0), minQuantity: String(item.minQuantity || 0), unit: item.unit || "pz", location: item.location || "", notes: item.notes || "" });
    setShowModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      const body = { ...form, quantity: parseFloat(form.quantity) || 0, minQuantity: parseFloat(form.minQuantity) || 0 };
      if (editing) await api.put(`/api/inventory/${editing.id}`, body);
      else await api.post("/api/inventory", body);
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Eliminare questo articolo?")) return;
    await api.delete(`/api/inventory/${id}`);
    load();
  }

  const lowStock = items.filter((i) => i.quantity <= (i.minQuantity || 0));

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario / Magazzino</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} articoli · {lowStock.length} sotto scorta minima</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nuovo Articolo</button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-amber-600">⚠️</span>
          <p className="text-sm text-amber-800 font-medium">{lowStock.length} articol{lowStock.length > 1 ? "i" : "o"} sotto la scorta minima: {lowStock.map((i) => i.name).join(", ")}</p>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {["Articolo","SKU","Giacenza","Min. Scorta","Posizione","Status","Azioni"].map((h) => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => {
              const isLow = item.quantity <= (item.minQuantity || 0);
              return (
                <tr key={item.id} className="tr">
                  <td className="td">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
                  </td>
                  <td className="td font-mono text-xs text-gray-500">{item.sku || "—"}</td>
                  <td className="td">
                    <span className={`font-semibold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td className="td text-sm text-gray-500">{item.minQuantity || 0} {item.unit}</td>
                  <td className="td text-sm text-gray-500">{item.location || "—"}</td>
                  <td className="td">
                    {isLow ? (
                      <span className="badge bg-red-100 text-red-700">Scorta Bassa</span>
                    ) : (
                      <span className="badge bg-green-100 text-green-700">OK</span>
                    )}
                  </td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(item)}>Modifica</button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(item.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={7} className="td text-center text-gray-400 py-8">Nessun articolo in magazzino</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">{editing ? "Modifica Articolo" : "Nuovo Articolo"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Nome *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Nome articolo" />
                </div>
                <div>
                  <label className="label">SKU / Codice</label>
                  <input className="input" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} placeholder="ART-001" />
                </div>
                <div>
                  <label className="label">Unità</label>
                  <select className="select" value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})}>
                    {["pz","m","m²","kg","l","rotolo","foglio","set"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Giacenza attuale</label>
                  <input className="input" type="number" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} placeholder="0" />
                </div>
                <div>
                  <label className="label">Scorta minima</label>
                  <input className="input" type="number" value={form.minQuantity} onChange={(e) => setForm({...form, minQuantity: e.target.value})} placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className="label">Posizione in magazzino</label>
                  <input className="input" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} placeholder="es. Scaffale A3" />
                </div>
                <div className="col-span-2">
                  <label className="label">Note</label>
                  <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Note aggiuntive..." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
