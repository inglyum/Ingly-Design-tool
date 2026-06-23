"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSession } from "@/lib/auth";
import { syncAll } from "@/lib/sync";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Errore di accesso"); return; }
      setSession(data.token, data.user);
      await syncAll();
      router.push("/dashboard");
    } catch {
      setError("Errore di connessione. Controlla la tua connessione internet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">IO</div>
          <h1 className="text-2xl font-bold text-gray-900">INGLY OS</h1>
          <p className="text-sm text-gray-500 mt-1">Gestionale per artigiani</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@esempio.it" required autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" className="btn btn-primary w-full justify-center py-2.5" disabled={loading}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700 mb-2">Account Demo</p>
          <button className="w-full text-left" onClick={() => { setEmail("mario@laserartstudio.it"); setPassword("Demo2026!"); }}>
            <p className="text-xs text-gray-600">📧 mario@laserartstudio.it</p>
            <p className="text-xs text-gray-600">🔑 Demo2026!</p>
          </button>
        </div>
      </div>
    </div>
  );
}
