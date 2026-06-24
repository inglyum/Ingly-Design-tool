export async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("ingly_token") : null;
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Errore richiesta");
  }
  return res.json();
}
