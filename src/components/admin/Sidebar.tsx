"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  IndianRupee, 
  Package, 
  Users, 
  Settings, 
  History,
  LogOut
} from "lucide-react";
import Image from "next/image";

const SidebarItem = ({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
      active 
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
        : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? "text-white" : "group-hover:text-emerald-600"}`} />
    <span className="text-sm font-semibold">{label}</span>
  </Link>
);

export const AdminSidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/attendance", icon: CalendarCheck, label: "Attendance" },
        { href: "/admin/financials", icon: IndianRupee, label: "Financials" },
        { href: "/admin/inventory", icon: Package, label: "Inventory" },
        { href: "/admin/staff", icon: Users, label: "Staff Management" },
        { href: "/admin/settings", icon: Settings, label: "Settings" },
        { href: "/admin/audit", icon: History, label: "Audit Logs" },
    ];

    return (
        <aside className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Image src="/logo.png" alt="Logo" width={24} height={24} className="invert brightness-0" />
                </div>
                <div>
                     <h1 className="text-lg font-bold text-slate-800 leading-tight">Admin Portal</h1>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fouzia Ishaq Clinic</p>
                </div>
               
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {menuItems.map((item) => (
                    <SidebarItem 
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        active={pathname === item.href}
                    />
                ))}
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-6">
                 <button 
                    onClick={() => {
                        // Logic for logout
                        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        window.location.href = "/";
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all w-full"
                 >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-semibold">Logout</span>
                 </button>
            </div>
        </aside>
    );
};
