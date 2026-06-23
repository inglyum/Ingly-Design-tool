"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login(email, password);
      if (user.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Credenziali non valide");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">INGLY OS</h1>
          <p className="text-gray-500 mt-1">Gestionale Enterprise per Artigiani</p>
        </div>

        {/* Card */}
        <div className="card shadow-xl border-0">
          <div className="card-body">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Accedi al tuo account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="mario@laserartstudio.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full justify-center py-3 text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  "Accedi"
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-xs font-semibold text-blue-700 mb-2">🧪 CREDENZIALI DEMO</p>
              <div className="space-y-1 text-xs text-blue-600">
                <p><strong>Utente:</strong> mario@laserartstudio.it</p>
                <p><strong>Password:</strong> Demo2026!</p>
                <hr className="border-blue-200 my-2" />
                <p><strong>Super Admin:</strong> superadmin@ingly.app</p>
                <p><strong>Password:</strong> Admin2026!</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex-1"
                  onClick={() => { setEmail("mario@laserartstudio.it"); setPassword("Demo2026!"); }}
                >
                  Usa Demo
                </button>
                <button
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex-1"
                  onClick={() => { setEmail("superadmin@ingly.app"); setPassword("Admin2026!"); }}
                >
                  Usa Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          INGLY OS v1.0 SaaS Enterprise · © 2026
        </p>
      </div>
    </div>
  );
}
