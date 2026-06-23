export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  licenseValid: boolean;
}

export function getToken(): string | null {
  try { return localStorage.getItem("ingly_token"); } catch { return null; }
}

export function getUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem("ingly_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(token: string, user: CurrentUser): void {
  localStorage.setItem("ingly_token", token);
  localStorage.setItem("ingly_user", JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem("ingly_token");
  localStorage.removeItem("ingly_user");
}

export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    try { await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch {}
  }
  clearSession();
}
