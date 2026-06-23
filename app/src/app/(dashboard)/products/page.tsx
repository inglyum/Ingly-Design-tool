"use client";
import { useEffect, useState } from "react";
import { getDB, type LocalProduct } from "@/lib/db";
import { markDirty } from "@/lib/sync";
import { fmtEur } from "@/lib/format";
import { nanoid } from "nanoid";

export default function ProductsPage() {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LocalProduct | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", description: "", price: "", cost: "", category: "", unit: "pz", stock: "0", minStock: "0" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [search]);

  async function load() {
    const db = getDB();
    let all = await db.products.filter((p) => !p._dirty || p._dirty).toArray();
    if (search) { const q = search.toLowerCase(); all = all.filter((p) => p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q)); }
    setProducts(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  function openNew() { setEditing(null); setForm({ name:"", sku:"", description:"", price:"", cost:"", category:"", unit:"pz", stock:"0", minStock:"0" }); setShowModal(true); }
  function openEdit(p: LocalProduct) { setEditing(p); setForm({ name:p.name, sku:p.sku||"", description:p.description||"", price:String(p.price), cost:String(p.cost), category:p.category||"", unit:p.unit, stock:String(p.stock), minStock:String(p.minStock) }); setShowModal(true); }

  async function save() {
    if (!form.name) return;
    setSaving(true);
    const db = getDB();
    const data = { name:form.name, sku:form.sku||undefined, description:form.description||undefined, price:parseFloat(form.price)||0, cost:parseFloat(form.cost)||0, category:form.category||undefined, unit:form.unit, stock:parseFloat(form.stock)||0, minStock:parseFloat(form.minStock)||0, _dirty:true };
    if (editing) { await db.products.update(editing.id, data); markDirty("products", editing.id); }
    else { const id = nanoid(); await db.products.add({ id, ...data, createdAt: new Date().toISOString() }); markDirty("products", id); }
    setShowModal(false); setSaving(false); load();
  }

  async function del(id: string) {
    if (!confirm("Eliminare?")) return;
    const db = getDB();
    await db.products.delete(id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catalogo Prodotti</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Nuovo Prodotto</button>
      </div>
      <input className="input max-w-sm" placeholder="Cerca prodotti..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="card card-body cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(p)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{p.name}</p>
                {p.sku && <p className="text-xs text-gray-400 font-mono">{p.sku}</p>}
                {p.category && <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{p.category}</span>}
              </div>
              <button className="text-gray-300 hover:text-red-400" onClick={(e) => { e.stopPropagation(); del(p.id); }}>🗑</button>
            </div>
            {p.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.description}</p>}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">{fmtEur(p.price)}<span className="text-xs text-gray-400 font-normal">/{p.unit}</span></p>
                {p.cost > 0 && <p className="text-xs text-gray-400">Margine: {p.price > 0 ? Math.round(((p.price-p.cost)/p.price)*100) : 0}%</p>}
              </div>
              {p.minStock > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock <= p.minStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                Stock: {p.stock} {p.unit}
              </span>}
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400"><p className="text-4xl mb-2">🛍️</p><p>Nessun prodotto</p></div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3 className="text-lg font-semibold">{editing?"Modifica":"Nuovo"} Prodotto</h3><button onClick={() => setShowModal(false)} className="text-gray-400 text-xl">×</button></div>
            <div className="modal-body space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="label">Nome *</label><input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
                <div><label className="label">SKU</label><input className="input" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} /></div>
                <div><label className="label">Categoria</label><input className="input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} /></div>
                <div><label className="label">Prezzo (€)</label><input className="input" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} /></div>
                <div><label className="label">Costo (€)</label><input className="input" type="number" value={form.cost} onChange={(e) => setForm({...form, cost: e.target.value})} /></div>
                <div><label className="label">Unità</label><select className="select" value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})}>{["pz","m","m²","kg","ora","set"].map((u) => <option key={u}>{u}</option>)}</select></div>
                <div><label className="label">Stock</label><input className="input" type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} /></div>
                <div className="col-span-2"><label className="label">Descrizione</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
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
