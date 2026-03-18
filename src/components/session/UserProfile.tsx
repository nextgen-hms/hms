"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

type UserData = {
  name: string;
  role: string;
  user_code: string;
};

export function UserProfile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user");

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          setError(errorData?.error || "Failed to fetch user");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/50">
        <div className="text-[11px] font-bold text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100/50 shadow-sm">
      <div className="p-2 bg-white rounded-lg shadow-sm border border-indigo-100/50">
        <User size={16} className="text-indigo-600" />
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-black text-slate-800 leading-none">{user.name}</span>
        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{user.role}</span>
      </div>
    </div>
  );
}
