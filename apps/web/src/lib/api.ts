const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ingly_token");
}

export function setToken(token: string) {
  localStorage.setItem("ingly_token", token);
}

export function clearToken() {
  localStorage.removeItem("ingly_token");
  localStorage.removeItem("ingly_user");
  localStorage.removeItem("ingly_tenant");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    // Try to refresh token
    try {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.ok) {
        const { token: newToken } = await refreshRes.json();
        setToken(newToken);
        headers["Authorization"] = `Bearer ${newToken}`;
        const retryRes = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
        if (!retryRes.ok) {
          clearToken();
          if (typeof window !== "undefined") window.location.href = "/login";
          throw new ApiError(401, "Sessione scaduta. Effettua il login.");
        }
        return retryRes.json();
      }
    } catch {
      // ignore
    }
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "Sessione scaduta. Effettua il login.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || "Errore sconosciuto");
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: any; tenant: any }>("/api/auth/login", { email, password }),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get<{ user: any; tenant: any }>("/api/auth/me"),
};

// Dashboard
export const dashboardApi = {
  get: () => api.get<any>("/api/dashboard"),
};

// Clients
export const clientsApi = {
  list: (params?: string) => api.get<any>(`/api/clients${params ? `?${params}` : ""}`),
  get: (id: string) => api.get<any>(`/api/clients/${id}`),
  create: (data: any) => api.post<any>("/api/clients", data),
  update: (id: string, data: any) => api.put<any>(`/api/clients/${id}`, data),
  delete: (id: string) => api.delete<any>(`/api/clients/${id}`),
};

// Orders
export const ordersApi = {
  list: (params?: string) => api.get<any>(`/api/orders${params ? `?${params}` : ""}`),
  kanban: () => api.get<any>("/api/orders/kanban"),
  get: (id: string) => api.get<any>(`/api/orders/${id}`),
  create: (data: any) => api.post<any>("/api/orders", data),
  update: (id: string, data: any) => api.put<any>(`/api/orders/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch<any>(`/api/orders/${id}/status`, { status }),
  delete: (id: string) => api.delete<any>(`/api/orders/${id}`),
};

// Sales
export const salesApi = {
  list: (params?: string) => api.get<any>(`/api/sales${params ? `?${params}` : ""}`),
  get: (id: string) => api.get<any>(`/api/sales/${id}`),
  create: (data: any) => api.post<any>("/api/sales", data),
  update: (id: string, data: any) => api.put<any>(`/api/sales/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch<any>(`/api/sales/${id}/status`, { status }),
  stats: () => api.get<any>("/api/sales/stats/summary"),
};

// Cashflow
export const cashflowApi = {
  list: (params?: string) => api.get<any>(`/api/cashflow${params ? `?${params}` : ""}`),
  create: (data: any) => api.post<any>("/api/cashflow", data),
  update: (id: string, data: any) => api.put<any>(`/api/cashflow/${id}`, data),
  delete: (id: string) => api.delete<any>(`/api/cashflow/${id}`),
  chart: () => api.get<any>("/api/cashflow/chart"),
};

// Products
export const productsApi = {
  list: (params?: string) => api.get<any>(`/api/products${params ? `?${params}` : ""}`),
  get: (id: string) => api.get<any>(`/api/products/${id}`),
  create: (data: any) => api.post<any>("/api/products", data),
  update: (id: string, data: any) => api.put<any>(`/api/products/${id}`, data),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get<any>("/api/analytics/dashboard"),
  forecast: () => api.get<any>("/api/analytics/forecast"),
};

// Notifications
export const notificationsApi = {
  list: () => api.get<any>("/api/notifications"),
  markRead: (id: string) => api.patch<any>(`/api/notifications/${id}/read`),
  markAllRead: () => api.patch<any>("/api/notifications/read-all"),
  unreadCount: () => api.get<any>("/api/notifications/unread-count"),
};
