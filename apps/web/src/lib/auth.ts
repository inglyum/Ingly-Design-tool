import { authApi, setToken, clearToken } from "./api";

export interface User {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export interface Tenant {
  id: string;
  slug: string;
  companyName: string;
  logoUrl?: string;
  status: string;
  plan?: {
    id: string;
    name: string;
    slug: string;
    modulesList: string[];
    features: Record<string, boolean>;
  };
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem("ingly_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function getStoredTenant(): Tenant | null {
  if (typeof window === "undefined") return null;
  try {
    const t = localStorage.getItem("ingly_tenant");
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ user: User; tenant: Tenant | null }> {
  const res = await authApi.login(email, password);
  setToken(res.token);
  localStorage.setItem("ingly_user", JSON.stringify(res.user));
  if (res.tenant) localStorage.setItem("ingly_tenant", JSON.stringify(res.tenant));
  return { user: res.user, tenant: res.tenant };
}

export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // ignore
  }
  clearToken();
}

export function hasModule(moduleId: string, tenant: Tenant | null): boolean {
  if (!tenant?.plan) return false;
  return tenant.plan.modulesList?.includes(moduleId) ?? true;
}

export function isAdmin(user: User | null): boolean {
  return user?.isAdmin === true || user?.role === "superadmin" || user?.role === "admin";
}
