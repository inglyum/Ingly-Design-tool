"use client";
import { useState, useEffect } from "react";

const TYPES = ["Tutte","Entrata","Uscita","Trasferimento"];
const CATS = ["Vendite","Stipendi","Fornitori","Tasse","Affitto","Utenze","Marketing","Investimenti","Rimborsi","Altro"];
const ACC_TYPES = ["Conto Corrente","Cassa","PayPal","Satispay","Stripe","Altro"];

interface Account { id: string; name: string; type: string; balance: number; color: string; }
interface Transaction { id: string; date: string; description: string; amount: number; type: "Entrata"|"Uscita"|"Trasferimento"; category: string; accountId: string; toAccountId?: string; note?: string; }

const ACC_COLORS = ["#6366f1","#22c55e","#f59e0b","#3b82f6","#a855f7","#ef4444"];

export default function BankFundsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [typeFilter, setTypeFilter] = useState("Tutte");
  const [accFilter, setAccFilter] = useState("Tutti");
  const [txModal, setTxModal] = useState(false);
  const [accModal, setAccModal] = useState(false);
  const [editTxId, setEditTxId] = useState<string|null>(null);
  const [editAccId, setEditAccId] = useState<string|null>(null);
  const [txForm, setTxForm] = useState({ date: new Date().toISOString().split("T")[0], description: "", amount: 0, type: "Entrata" as Transaction["type"], category: "Vendite", accountId: "", toAccountId: "", note: "" });
  const [accForm, setAccForm] = useState({ name: "", type: "Conto Corrente", balance: 0, color: "#6366f1" });

  useEffect(() => {
    const a = localStorage.getItem("ingly_accounts"); if (a) setAccounts(JSON.parse(a));
    const t = localStorage.getItem("ingly_bank_txs"); if (t) setTxs(JSON.parse(t));
  }, []);

  function persistAcc(list: Account[]) { setAccounts(list); localStorage.setItem("ingly_accounts", JSON.stringify(list)); }
  function persistTx(list: Transaction[]) { setTxs(list); localStorage.setItem("ingly_bank_txs", JSON.stringify(list)); }

  function saveAcc() {
    const acc = { ...accForm, id: editAccId || Date.now().toString() };
    persistAcc(editAccId ? accounts.map(a => a.id === editAccId ? acc : a) : [...accounts, acc]);
    setAccModal(false); setEditAccId(null); setAccForm({ name: "", type: "Conto Corrente", balance: 0, color: "#6366f1" });
  }

  function saveTx() {
    const tx = { ...txForm, id: editTxId || Date.now().toString() };
    // Update account balances for new transactions
    if (!editTxId) {
      let updatedAccounts = [...accounts];
      if (tx.type === "Entrata") updatedAccounts = updatedAccounts.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a);
      else if (tx.type === "Uscita") updatedAccounts = updatedAccounts.map(a => a.id === tx.accountId ? { ...a, balance: a.balance - tx.amount } : a);
      else if (tx.type === "Trasferimento") updatedAccounts = updatedAccounts.map(a => {
        if (a.id === tx.accountId) return { ...a, balance: a.balance - tx.amount };
        if (a.id === tx.toAccountId) return { ...a, balance: a.balance + tx.amount };
        return a;
      });
      persistAcc(updatedAccounts);
    }
    persistTx(editTxId ? txs.map(t => t.id === editTxId ? tx as Transaction : t) : [...txs, tx as Transaction]);
    setTxModal(false); setEditTxId(null);
    setTxForm({ date: new Date().toISOString().split("T")[0], description: "", amount: 0, type: "Entrata", category: "Vendite", accountId: accounts[0]?.id || "", toAccountId: "", note: "" });
  }

  function delTx(id: string) {
    if (!confirm("Eliminare transazione?")) return;
    persistTx(txs.filter(t => t.id !== id));
  }

  const totalAssets = accounts.reduce((a, b) => a + b.balance, 0);
  const monthTxs = txs.filter(t => t.date.startsWith(new Date().toISOString().slice(0,7)));
  const monthIn = monthTxs.filter(t => t.type === "Entrata").reduce((a, b) => a + b.amount, 0);
  const monthOut = monthTxs.filter(t => t.type === "Uscita").reduce((a, b) => a + b.amount, 0);

  const filtered = txs.filter(t => {
    const typeOk = typeFilter === "Tutte" || t.type === typeFilter;
    const accOk = accFilter === "Tutti" || t.accountId === accFilter;
    return typeOk && accOk;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>🏦 Bank & Funds</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Gestione conti correnti e liquidità</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setAccForm({ name: "", type: "Conto Corrente", balance: 0, color: "#6366f1" }); setEditAccId(null); setAccModal(true); }} style={{ background: "transparent", color: "#6366f1", border: "1px solid #6366f1", borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>+ Conto</button>
          <button onClick={() => { setTxForm({ date: new Date().toISOString().split("T")[0], description: "", amount: 0, type: "Entrata", category: "Vendite", accountId: accounts[0]?.id || "", toAccountId: "", note: "" }); setEditTxId(null); setTxModal(true); }} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ Transazione</button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Liquidità Totale", val: `€${totalAssets.toLocaleString("it-IT",{minimumFractionDigits:2})}`, color: "#6366f1", icon: "🏦" },
          { label: "Entrate (mese)", val: `€${monthIn.toLocaleString("it-IT",{minimumFractionDigits:2})}`, color: "#22c55e", icon: "📈" },
          { label: "Uscite (mese)", val: `€${monthOut.toLocaleString("it-IT",{minimumFractionDigits:2})}`, color: "#ef4444", icon: "📉" },
        ].map(k => (
          <div key={k.label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>{k.icon} {k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Accounts */}
      {accounts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
          {accounts.map(acc => (
            <div key={acc.id} style={{ background: "#0f172a", border: `1px solid ${acc.color}40`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: acc.color }} />
                <button onClick={() => { setAccForm({ name: acc.name, type: acc.type, balance: acc.balance, color: acc.color }); setEditAccId(acc.id); setAccModal(true); }} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12 }}>✏️</button>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>{acc.name}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>{acc.type}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: acc.balance >= 0 ? "#22c55e" : "#ef4444" }}>€{acc.balance.toLocaleString("it-IT",{minimumFractionDigits:2})}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {TYPES.map(t => <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #334155", background: typeFilter === t ? "#6366f1" : "transparent", color: typeFilter === t ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: 11, fontWeight: typeFilter === t ? 700 : 500 }}>{t}</button>)}
        <select value={accFilter} onChange={e => setAccFilter(e.target.value)} style={{ ...inp, width: "auto", padding: "5px 12px", fontSize: 11 }}>
          <option value="Tutti">Tutti i conti</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Transactions table */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0a0f1a", borderBottom: "1px solid #1e293b" }}>
              {["Data","Descrizione","Categoria","Conto","Importo",""].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => {
              const acc = accounts.find(a => a.id === tx.accountId);
              return (
                <tr key={tx.id} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8" }}>{new Date(tx.date).toLocaleDateString("it-IT")}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{tx.description}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "#64748b" }}>{tx.category}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {acc && <span style={{ fontSize: 10, padding: "2px 8px", background: `${acc.color}20`, color: acc.color, borderRadius: 8 }}>{acc.name}</span>}
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: tx.type === "Entrata" ? "#22c55e" : tx.type === "Uscita" ? "#ef4444" : "#6366f1" }}>
                    {tx.type === "Entrata" ? "+" : tx.type === "Uscita" ? "-" : "⇄"}€{tx.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => delTx(tx.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 13 }}>✕</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#475569", fontSize: 13 }}>Nessuna transazione. Aggiungi la prima!</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Account Modal */}
      {accModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 400, maxWidth: "95vw" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>{editAccId ? "Modifica" : "Nuovo"} Conto</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOME</label><input value={accForm.name} onChange={e => setAccForm({...accForm,name:e.target.value})} style={inp} placeholder="es. Conto BancaSella" /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TIPO</label><select value={accForm.type} onChange={e => setAccForm({...accForm,type:e.target.value})} style={inp}>{ACC_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>SALDO INIZIALE €</label><input type="number" value={accForm.balance} onChange={e => setAccForm({...accForm,balance:+e.target.value})} style={inp} /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>COLORE</label>
                <div style={{ display: "flex", gap: 8 }}>{ACC_COLORS.map(c => <button key={c} onClick={() => setAccForm({...accForm,color:c})} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: accForm.color === c ? "3px solid #fff" : "2px solid transparent", cursor: "pointer" }} />)}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={saveAcc} disabled={!accForm.name} style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 700 }}>Salva</button>
              <button onClick={() => { setAccModal(false); setEditAccId(null); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {txModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 480, maxWidth: "95vw" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>Nuova Transazione</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TIPO</label><select value={txForm.type} onChange={e => setTxForm({...txForm,type:e.target.value as Transaction["type"]})} style={inp}><option>Entrata</option><option>Uscita</option><option>Trasferimento</option></select></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>DATA</label><input type="date" value={txForm.date} onChange={e => setTxForm({...txForm,date:e.target.value})} style={inp} /></div>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>DESCRIZIONE</label><input value={txForm.description} onChange={e => setTxForm({...txForm,description:e.target.value})} style={inp} placeholder="es. Pagamento fattura #123" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>IMPORTO €</label><input type="number" value={txForm.amount} onChange={e => setTxForm({...txForm,amount:+e.target.value})} style={inp} /></div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CATEGORIA</label><select value={txForm.category} onChange={e => setTxForm({...txForm,category:e.target.value})} style={inp}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CONTO {txForm.type === "Trasferimento" ? "DA" : ""}</label><select value={txForm.accountId} onChange={e => setTxForm({...txForm,accountId:e.target.value})} style={inp}>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
              {txForm.type === "Trasferimento" && <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CONTO A</label><select value={txForm.toAccountId} onChange={e => setTxForm({...txForm,toAccountId:e.target.value})} style={inp}>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>}
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTE</label><input value={txForm.note||""} onChange={e => setTxForm({...txForm,note:e.target.value})} style={inp} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={saveTx} disabled={!txForm.description || !txForm.amount} style={{ flex: 1, background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 700 }}>Aggiungi</button>
              <button onClick={() => setTxModal(false)} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
