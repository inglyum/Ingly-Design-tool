"use client";
import { useEffect, useState } from "react";
import { getStoredUser, getStoredTenant } from "@/lib/auth";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
    setTenant(getStoredTenant());
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const plan = tenant?.plan;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Impostazioni</h2>

      {/* Account */}
      <div className="card">
        <div className="card-header"><h3 className="font-semibold">Il mio account</h3></div>
        <div className="card-body space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {user?.fullName?.[0] || "U"}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.fullName}</p>
              <p className="text-gray-500">{user?.email}</p>
              <span className={`badge mt-1 ${user?.role === "owner" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <hr className="border-gray-100" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Email:</span> <span className="font-medium">{user?.email}</span></div>
            <div><span className="text-gray-500">Username:</span> <span className="font-medium">{user?.username || "—"}</span></div>
            <div><span className="text-gray-500">MFA:</span> <span className={user?.mfaEnabled ? "text-green-600 font-medium" : "text-red-500"}>
              {user?.mfaEnabled ? "✓ Attivo" : "✗ Non attivo"}
            </span></div>
          </div>
        </div>
      </div>

      {/* Azienda */}
      <div className="card">
        <div className="card-header"><h3 className="font-semibold">La tua azienda</h3></div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{tenant?.companyName}</span></div>
            <div><span className="text-gray-500">Status:</span> <span className="font-medium capitalize">{tenant?.status}</span></div>
            <div><span className="text-gray-500">Piano:</span>
              <span className={`badge ml-2 ${plan?.slug === "enterprise" ? "bg-purple-100 text-purple-700" : plan?.slug === "business" ? "bg-blue-100 text-blue-700" : plan?.slug === "pro" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {plan?.name || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Piano */}
      {plan && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold">Piano abbonamento</h3></div>
          <div className="card-body space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div>
                <p className="font-bold text-blue-900 text-lg">{plan.name}</p>
                <p className="text-blue-600 text-sm">Piano attivo</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                €{plan.priceMonthly}<span className="text-sm font-normal">/mese</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <FeatureRow label="Moduli" value={`${plan.modulesCount} disponibili`} ok />
              <FeatureRow label="Utenti max" value={plan.maxUsers === -1 ? "Illimitati" : String(plan.maxUsers)} ok />
              <FeatureRow label="Storage" value={`${plan.maxStorageGb} GB`} ok />
              <FeatureRow label="AI tokens/mese" value={plan.aiTokensMonthly === -1 ? "Illimitati" : plan.aiTokensMonthly?.toLocaleString("it-IT")} ok />
              <FeatureRow label="Excel export" value={plan.features?.excel_export ? "Incluso" : "Non incluso"} ok={plan.features?.excel_export} />
              <FeatureRow label="XML SDI" value={plan.features?.xml_sdi ? "Incluso" : "Non incluso"} ok={plan.features?.xml_sdi} />
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="card border-red-200">
        <div className="card-header border-red-100"><h3 className="font-semibold text-red-700">Zona pericolosa</h3></div>
        <div className="card-body">
          <button onClick={handleLogout} className="btn-danger">
            🚪 Logout da tutti i dispositivi
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${ok ? "text-green-600" : "text-gray-400"}`}>
        {ok ? "✓ " : "✗ "}{value}
      </span>
    </div>
  );
}
