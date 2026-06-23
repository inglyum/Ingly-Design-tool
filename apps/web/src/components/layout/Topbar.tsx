"use client";
import { useState, useEffect } from "react";
import { notificationsApi } from "@/lib/api";

export default function Topbar({ title, user }: { title: string; user?: any }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationsApi.unreadCount().then((r) => setUnread(r.count)).catch(() => {});
    const interval = setInterval(() => {
      notificationsApi.unreadCount().then((r) => setUnread(r.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="fixed top-0 right-0 bg-white border-b border-gray-200 z-10 flex items-center justify-between px-6"
      style={{ left: "240px", height: "60px" }}
    >
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <span className="text-xl">🔔</span>
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.fullName?.[0] || "U"}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user?.fullName?.split(" ")[0] || "Utente"}
          </span>
        </div>
      </div>
    </header>
  );
}
