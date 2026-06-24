"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const DAYS = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
const EVENT_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#ec4899","#8b5cf6"];
const EVENT_TYPES = ["ordine","scadenza","pagamento","appuntamento","consegna","altro"];

interface Event { id: string; title: string; date: string; type: string; color: string; notes?: string; clientName?: string; amount?: number; }

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<Event[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [selDate, setSelDate] = useState("");
  const [form, setForm] = useState({ title: "", type: "appuntamento", color: "#6366f1", notes: "", amount: 0 });
  const [editId, setEditId] = useState<string|null>(null);
  const [detail, setDetail] = useState<Event[]>([]);
  const [detailDate, setDetailDate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ingly_calendar_events");
    if (saved) setEvents(JSON.parse(saved));
    Promise.all([
      apiFetch("/api/orders").catch(() => ({ data: [] })),
      apiFetch("/api/sales").catch(() => ({ data: [] })),
    ]).then(([o, s]) => {
      setOrders(o.data || []);
      setSales(s.data || []);
    });
  }, []);

  function persist(list: Event[]) {
    setEvents(list);
    localStorage.setItem("ingly_calendar_events", JSON.stringify(list));
  }

  function save() {
    const list = editId
      ? events.map(e => e.id === editId ? { ...e, ...form, date: selDate } : e)
      : [...events, { id: Date.now().toString(), ...form, date: selDate }];
    persist(list);
    setModal(false); setEditId(null);
    setForm({ title: "", type: "appuntamento", color: "#6366f1", notes: "", amount: 0 });
  }

  // Build calendar events from DB + manual
  const allEvents: Event[] = [
    ...events,
    ...orders.filter(o => o.dueDate).map(o => ({
      id: `ord_${o.id}`, title: `📦 ${o.orderNumber || "Ordine"}: ${o.clientName}`,
      date: o.dueDate!.split("T")[0], type: "ordine", color: "#6366f1", amount: o.totalAmount,
    })),
    ...sales.filter(s => s.dueDate && s.status === "da_pagare").map(s => ({
      id: `sal_${s.id}`, title: `💰 Scad. ${s.invoiceNumber || "Fattura"}: ${s.clientName}`,
      date: s.dueDate!.split("T")[0], type: "scadenza", color: "#ef4444", amount: s.totalAmount,
    })),
  ];

  function getDaysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function getFirstDay(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }

  function formatDate(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function clickDay(d: number) {
    const date = formatDate(year, month, d);
    const dayEvents = allEvents.filter(e => e.date === date);
    setDetailDate(date);
    setDetail(dayEvents);
    setSelDate(date);
    if (dayEvents.length === 0) { setModal(true); }
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const todayStr = today.toISOString().split("T")[0];

  const inp: React.CSSProperties = { width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" };

  // Upcoming events (next 30 days)
  const futureDate = new Date(today); futureDate.setDate(futureDate.getDate() + 30);
  const upcoming = allEvents
    .filter(e => e.date >= todayStr && e.date <= futureDate.toISOString().split("T")[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  return (
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>📅 Calendario</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 14 }}>‹</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", minWidth: 160, textAlign: "center" }}>{MONTHS[month]} {year}</span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 14 }}>›</button>
            <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Oggi</button>
          </div>
        </div>

        {/* Calendar grid */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {DAYS.map(d => <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#475569", borderBottom: "1px solid #1e293b" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {Array.from({ length: firstDay }, (_, i) => <div key={`empty_${i}`} style={{ minHeight: 90, borderRight: "1px solid #0f172a", borderBottom: "1px solid #0f172a" }} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const dateStr = formatDate(year, month, d);
              const dayEvs = allEvents.filter(e => e.date === dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div key={d} onClick={() => clickDay(d)} style={{ minHeight: 90, borderRight: "1px solid #1e293b", borderBottom: "1px solid #1e293b", padding: "6px 8px", cursor: "pointer", background: isToday ? "#6366f115" : "transparent", transition: "background 0.15s" }}>
                  <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: isToday ? "#6366f1" : "#94a3b8", marginBottom: 4, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: isToday ? "#6366f130" : "transparent" }}>{d}</div>
                  {dayEvs.slice(0, 3).map(ev => (
                    <div key={ev.id} style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: `${ev.color}30`, color: ev.color, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                  ))}
                  {dayEvs.length > 3 && <div style={{ fontSize: 9, color: "#475569" }}>+{dayEvs.length - 3} altri</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        {detail.length > 0 && detailDate && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>📅 {detailDate}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setSelDate(detailDate); setModal(true); }} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11 }}>+ Evento</button>
                <button onClick={() => { setDetail([]); setDetailDate(""); }} style={{ background: "none", border: "1px solid #334155", color: "#64748b", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11 }}>✕</button>
              </div>
            </div>
            {detail.map(ev => (
              <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: `${ev.color}15`, border: `1px solid ${ev.color}30`, marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{ev.title}</div>
                  {ev.notes && <div style={{ fontSize: 11, color: "#64748b" }}>{ev.notes}</div>}
                </div>
                {ev.amount ? <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>€{ev.amount.toFixed(2)}</span> : null}
                {!ev.id.startsWith("ord_") && !ev.id.startsWith("sal_") && (
                  <button onClick={() => { persist(events.filter(e => e.id !== ev.id)); setDetail(d => d.filter(e => e.id !== ev.id)); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }}>✕</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar prossimi eventi */}
      <div>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>📌 PROSSIMI 30 GIORNI</div>
          {upcoming.length === 0 && <div style={{ fontSize: 12, color: "#475569" }}>Nessun evento in programma</div>}
          {upcoming.map(ev => (
            <div key={ev.id} style={{ padding: "8px 0", borderBottom: "1px solid #1e293b", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 3, height: 36, background: ev.color, borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>{ev.date}</div>
              </div>
              {ev.amount ? <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>€{ev.amount.toFixed(0)}</span> : null}
            </div>
          ))}
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>LEGENDA</div>
          {[["📦 Ordini", "#6366f1"], ["💰 Scadenze", "#ef4444"], ["📅 Appuntamenti", "#f59e0b"], ["✅ Consegne", "#22c55e"]].map(([l, c]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />{l}
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 460, maxWidth: "95vw" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>+ Nuovo Evento</h2>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>📅 {selDate}</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TITOLO *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inp} placeholder="es. Consegna lavoro..." /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TIPO</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inp}>
                    {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>COLORE</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 4 }}>
                    {EVENT_COLORS.map(c => <div key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: form.color === c ? "3px solid #fff" : "2px solid transparent" }} />)}
                  </div>
                </div>
              </div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>NOTE</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inp} /></div>
              <div><label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>IMPORTO €</label><input type="number" step={0.01} value={form.amount || ""} onChange={e => setForm({ ...form, amount: +e.target.value })} style={inp} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={save} disabled={!form.title} style={{ flex: 1, background: form.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontWeight: 700 }}>Aggiungi</button>
              <button onClick={() => setModal(false)} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
