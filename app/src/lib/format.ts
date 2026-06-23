export const fmtEur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n ?? 0);

export const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("it-IT").format(new Date(d));

export const statusLabel: Record<string, string> = {
  backlog: "In Coda", attesa: "In Attesa", working: "In Lavorazione",
  done: "Completato", delivered: "Consegnato", annullato: "Annullato",
  bozza: "Bozza", inviato: "Inviato", accettato: "Accettato",
  rifiutato: "Rifiutato", pagato: "Pagato", da_pagare: "Da Pagare", scaduto: "Scaduto",
};

export const statusBadge: Record<string, string> = {
  backlog: "bg-gray-100 text-gray-600",
  attesa: "bg-yellow-100 text-yellow-700",
  working: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  delivered: "bg-emerald-100 text-emerald-700",
  annullato: "bg-red-100 text-red-600",
  bozza: "bg-gray-100 text-gray-600",
  inviato: "bg-blue-100 text-blue-700",
  accettato: "bg-green-100 text-green-700",
  rifiutato: "bg-red-100 text-red-600",
  pagato: "bg-green-100 text-green-700",
  da_pagare: "bg-yellow-100 text-yellow-700",
  scaduto: "bg-red-100 text-red-600",
};

export function isOverdue(dueDate?: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function priorityEmoji(p: string): string {
  return ({ urgente: "🔴", alta: "🟠", normale: "🟡", bassa: "🟢" })[p] ?? "⚪";
}
