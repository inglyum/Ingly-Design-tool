"use client";
import { getDB } from "./db";

const TABLES = ["clients", "orders", "sales", "quotes", "cashflows", "products"] as const;

function getToken(): string | null {
  try { return localStorage.getItem("ingly_token"); } catch { return null; }
}

async function apiFetch(path: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function syncAll(): Promise<void> {
  if (!navigator.onLine) return;
  const token = getToken();
  if (!token) return;

  try {
    // Push dirty records
    for (const table of TABLES) {
      const db = getDB();
      const dirty = await (db as any)[table].filter((r: any) => r._dirty).toArray();
      for (const record of dirty) {
        try {
          const { _dirty, _deleted, ...data } = record;
          if (_deleted) {
            await apiFetch(`/api/sync/${table}/${record.id}`, { method: "DELETE" });
          } else {
            await apiFetch(`/api/sync/${table}`, { method: "POST", body: JSON.stringify(data) });
          }
          await (db as any)[table].update(record.id, { _dirty: false, _deleted: false });
        } catch {}
      }
    }

    // Pull latest data from server
    const data = await apiFetch("/api/sync/pull");
    const db = getDB();
    for (const table of TABLES) {
      if (data[table]) {
        await (db as any)[table].clear();
        await (db as any)[table].bulkPut(data[table].map((r: any) => ({ ...r, _dirty: false })));
      }
    }
  } catch (e) {
    // Silent fail — offline or auth issue
    console.warn("Sync failed:", e);
  }
}

export async function markDirty(table: string, id: string): Promise<void> {
  const db = getDB();
  await (db as any)[table].update(id, { _dirty: true });
  if (navigator.onLine) syncAll();
}

export function startAutoSync(intervalMs = 60000): () => void {
  if (navigator.onLine) syncAll();
  const id = setInterval(() => { if (navigator.onLine) syncAll(); }, intervalMs);
  window.addEventListener("online", syncAll);
  return () => { clearInterval(id); window.removeEventListener("online", syncAll); };
}
