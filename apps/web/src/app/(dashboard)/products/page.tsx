"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fmtEur } from "@/lib/format";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", sku: "", description: "", price: "", cost: "", category: "", unit: "pz" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get<any>(`/api/products${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      setProducts(r.data || []);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setForm({ name: "", sku: "", description: "", price: "", cost: "", category: "", unit: "pz" });
    setShowModal(true);
  }

  function openEdit(p: any) {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku || "", description: p.description || "", price: String(p.price || ""), cost: String(p.cost || ""), category: p.category || "", unit: p.unit || "pz" });
    setShowModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      const body = { ...form, price: parseFloat(form.price) || 0, cost: parseFloat(form.cost) || 0 };
      if (editing) await api.put(`/api/products/${editing.id}`, body);
      else await api.post("/api/products", body);
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Eliminare questo prodotto?")) return;
    await api.delete(`/api/products/${id}`);
    load();
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogo Prodotti</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} prodotti</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nuovo Prodotto</button>
      </div>

      <div className="flex gap-3">
        <input
          className="input max-w-sm"
          placeholder="Cerca prodotti..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button className="btn btn-secondary" onClick={load}>Cerca</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p: any) => (
          <div key={p.id} className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(p)}>
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  {p.sku && <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku}</p>}
                  {p.category && <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{p.category}</span>}
                </div>
                <button className="text-red-400 hover:text-red-600 text-sm p-1" onClick={(e) => { e.stopPropagation(); del(p.id); }}>🗑</button>
              </div>
              {p.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description}</p>}
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{fmtEur(p.price)}</p>
                  {p.cost > 0 && <p className="text-xs text-gray-400">Costo: {fmtEur(p.cost)} · Margine: {p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0}%</p>}
                </div>
                <span className="text-xs text-gray-400">/{p.unit || "pz"}</span>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🛍️</p>
            <p>Nessun prodotto nel catalogo</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">{editing ? "Modifica Prodotto" : "Nuovo Prodotto"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Nome *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Nome prodotto" />
                </div>
                <div>
                  <label className="label">SKU / Codice</label>
                  <input className="input" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} placeholder="SKU-001" />
                </div>
                <div>
                  <label className="label">Categoria</label>
                  <input className="input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="es. Lavorazioni Laser" />
                </div>
                <div>
                  <label className="label">Prezzo (€) *</label>
                  <input className="input" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="0.00" />
                </div>
                <div>
                  <label className="label">Costo (€)</label>
                  <input className="input" type="number" value={form.cost} onChange={(e) => setForm({...form, cost: e.target.value})} placeholder="0.00" />
                </div>
                <div>
                  <label className="label">Unità</label>
                  <select className="select" value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})}>
                    {["pz","m","m²","kg","ora","set","kit"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Descrizione</label>
                  <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Descrizione prodotto..." />
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
