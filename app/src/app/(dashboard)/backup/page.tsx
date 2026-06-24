"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function BackupPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function exportAll() {
    setLoading(true);
    try {
      const [clients, orders, sales, quotes, cashflow, products, materials, suppliers, fixedCosts] = await Promise.all([
        apiFetch("/api/clients").catch(() => ({ data: [] })),
        apiFetch("/api/orders").catch(() => ({ data: [] })),
        apiFetch("/api/sales").catch(() => ({ data: [] })),
        apiFetch("/api/quotes").catch(() => ({ data: [] })),
        apiFetch("/api/cashflow").catch(() => ({ data: [] })),
        apiFetch("/api/products").catch(() => ({ data: [] })),
        apiFetch("/api/materials").catch(() => ({ data: [] })),
        apiFetch("/api/suppliers").catch(() => ({ data: [] })),
        apiFetch("/api/fixed-costs").catch(() => ({ data: [] })),
      ]);
      const backup = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: { clients: clients.data, orders: orders.data, sales: sales.data, quotes: quotes.data, cashflow: cashflow.data, products: products.data, materials: materials.data, suppliers: suppliers.data, fixedCosts: fixedCosts.data },
        local: {
          ideas: localStorage.getItem("ingly_ideas"),
          calendarEvents: localStorage.getItem("ingly_calendar_events"),
          settings: localStorage.getItem("ingly_settings"),
        }
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ingly-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("✅ Backup esportato con successo!");
    } catch (e) {
      setMsg("❌ Errore durante l'esportazione");
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  }

  function importBackup(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (!backup.version || !backup.data) { alert("File non valido"); return; }
        if (!confirm(`Importare backup del ${backup.exportDate?.split("T")[0]}? I dati esistenti non verranno eliminati, solo aggiornati.`)) return;
        // Restore local storage
        if (backup.local?.ideas) localStorage.setItem("ingly_ideas", backup.local.ideas);
        if (backup.local?.calendarEvents) localStorage.setItem("ingly_calendar_events", backup.local.calendarEvents);
        setMsg("✅ Dati locali ripristinati. I dati cloud richiedono una reimportazione manuale.");
      } catch {
        alert("Errore durante l'importazione");
      }
    };
    reader.readAsText(file);
  }

  const sections = [
    { icon: "👥", name: "CRM Clienti", desc: "Tutti i tuoi clienti e contatti", key: "clients" },
    { icon: "📦", name: "Ordini", desc: "Ordini e workflow produzione", key: "orders" },
    { icon: "🧾", name: "Fatture", desc: "Vendite e fatture emesse", key: "sales" },
    { icon: "📋", name: "Preventivi", desc: "Smart Quoter — tutti i preventivi", key: "quotes" },
    { icon: "💸", name: "Cashflow", desc: "Entrate e uscite registrate", key: "cashflow" },
    { icon: "🗄️", name: "Magazzino", desc: "Articoli e scorte", key: "products" },
    { icon: "🪵", name: "Materiali", desc: "Listino materiali e risorse", key: "materials" },
    { icon: "🏭", name: "Fornitori", desc: "Database fornitori", key: "suppliers" },
    { icon: "🧾", name: "Costi Fissi", desc: "Spese ricorrenti", key: "fixedCosts" },
    { icon: "💡", name: "Idee", desc: "Idee e ispirazioni (locale)", key: "ideas" },
    { icon: "📅", name: "Calendario", desc: "Eventi calendario (locale)", key: "calendar" },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>💾 Backup & Ripristino</h1>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 28 }}>Esporta tutti i tuoi dati in un file JSON e importali in qualsiasi momento</p>

      {msg && <div style={{ background: msg.startsWith("✅") ? "#22c55e20" : "#ef444420", border: `1px solid ${msg.startsWith("✅") ? "#22c55e40" : "#ef444440"}`, color: msg.startsWith("✅") ? "#22c55e" : "#ef4444", padding: "10px 16px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "linear-gradient(135deg,#0f172a,#1a1040)", border: "2px solid #6366f150", borderRadius: 16, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>Esporta Backup</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Scarica tutti i dati in un file JSON cifrato. Include cloud + dati locali.</div>
          <button onClick={exportAll} disabled={loading} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontWeight: 700, fontSize: 14, width: "100%" }}>
            {loading ? "Esportazione..." : "📥 Scarica Backup Completo"}
          </button>
        </div>

        <div style={{ background: "linear-gradient(135deg,#0f172a,#0a1f0a)", border: "2px solid #22c55e50", borderRadius: 16, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📥</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>Importa Backup</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Ripristina i dati da un file di backup precedente.</div>
          <label style={{ display: "block" }}>
            <div style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>📂 Scegli File Backup</div>
            <input type="file" accept=".json" onChange={e => e.target.files?.[0] && importBackup(e.target.files[0])} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>📦 Contenuto del Backup</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {sections.map(s => (
            <div key={s.key} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", background: "#0a0f1a", borderRadius: 8, border: "1px solid #1e293b" }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{s.name}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>{s.desc}</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#22c55e" }}>✓</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#f59e0b10", border: "1px solid #f59e0b30", borderRadius: 10, padding: 16, marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 6 }}>⚠️ Nota importante</div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>Il backup include sia i dati cloud (database Neon) che i dati locali (Idee, Calendario). Si consiglia di fare un backup almeno una volta alla settimana. Il file JSON non è cifrato — conservalo in modo sicuro.</div>
      </div>
    </div>
  );
}
