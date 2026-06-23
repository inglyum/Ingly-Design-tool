"use client";
import { useState } from "react";
import { getUser, logout, getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const user = getUser();
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseMsg, setLicenseMsg] = useState("");
  const [activating, setActivating] = useState(false);

  async function activateLicense() {
    if (!licenseKey.trim()) return;
    setActivating(true);
    setLicenseMsg("");
    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ key: licenseKey }),
      });
      const data = await res.json();
      if (res.ok) setLicenseMsg("✅ " + data.message);
      else setLicenseMsg("❌ " + data.error);
    } catch {
      setLicenseMsg("❌ Errore di connessione");
    } finally {
      setActivating(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>

      <div className="card card-body space-y-3">
        <h2 className="text-base font-semibold text-gray-800">Profilo Utente</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            {user?.fullName?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.fullName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="card card-body space-y-3">
        <h2 className="text-base font-semibold text-gray-800">Licenza Software</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${user?.licenseValid ? "bg-green-500" : "bg-red-400"}`} />
          <p className="text-sm text-gray-600">{user?.licenseValid ? "Licenza attiva" : "Nessuna licenza attiva"}</p>
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Inserisci chiave licenza (es. INGLY-PRO-2026)"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
          />
          <button className="btn btn-primary" onClick={activateLicense} disabled={activating}>
            {activating ? "..." : "Attiva"}
          </button>
        </div>
        {licenseMsg && <p className={`text-sm ${licenseMsg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{licenseMsg}</p>}
        <p className="text-xs text-gray-400">Chiavi demo disponibili: INGLY-DEMO-2026 · INGLY-PRO-2026 · INGLY-ENT-2026</p>
      </div>

      <div className="card card-body space-y-3">
        <h2 className="text-base font-semibold text-gray-800">Dati & Sincronizzazione</h2>
        <p className="text-sm text-gray-500">I dati vengono salvati automaticamente in locale (offline) e sincronizzati con il cloud quando sei online.</p>
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <span>📱</span>
          <span>App installabile come PWA — funziona senza internet</span>
        </div>
      </div>

      <div className="card card-body border-red-200">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Account</h2>
        <button className="btn btn-danger" onClick={handleLogout}>🚪 Esci dall&apos;account</button>
      </div>
    </div>
  );
}
