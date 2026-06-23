export function fmtEur(n: number | string | undefined | null): string {
  const num = Number(n || 0);
  return "€" + num.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d: string | Date | undefined | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("it-IT");
  } catch {
    return String(d);
  }
}

export function fmtDateTime(d: string | Date | undefined | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(d);
  }
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    backlog: "In coda",
    attesa: "In attesa",
    working: "In lavorazione",
    done: "Completato",
    delivered: "Consegnato",
    completato: "Completato",
    annullato: "Annullato",
    pagato: "Pagato",
    da_pagare: "Da pagare",
    bozza: "Bozza",
    draft: "Bozza",
    sent: "Inviato",
    accepted: "Accettato",
    rejected: "Rifiutato",
    expired: "Scaduto",
    active: "Attivo",
    inactive: "Inattivo",
    suspended: "Sospeso",
    trial: "Trial",
  };
  return map[status] || status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    backlog: "bg-gray-100 text-gray-700",
    attesa: "bg-yellow-100 text-yellow-700",
    working: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
    delivered: "bg-emerald-100 text-emerald-700",
    completato: "bg-emerald-100 text-emerald-700",
    annullato: "bg-red-100 text-red-700",
    pagato: "bg-green-100 text-green-700",
    da_pagare: "bg-orange-100 text-orange-700",
    bozza: "bg-gray-100 text-gray-600",
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    normal: "bg-gray-100 text-gray-700",
    low: "bg-gray-50 text-gray-500",
    active: "bg-green-100 text-green-700",
    trial: "bg-purple-100 text-purple-700",
    suspended: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function daysUntil(date: string | null | undefined): number {
  if (!date) return 0;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}
