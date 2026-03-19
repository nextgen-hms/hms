"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  HandCoins, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Stethoscope,
  Activity,
  Clock,
  CheckCircle2,
  Package,
  Settings
} from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <Card className="p-6 relative overflow-hidden border-none shadow-xl shadow-slate-200/50 rounded-[2rem]">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5 rounded-full ${color}`} />
    <div className="flex items-start justify-between relative z-10">
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <div className="flex items-center gap-1.5">
          <span className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
          <span className="text-[10px] font-bold text-slate-400">vs last month</span>
        </div>
      </div>
      <div className={`p-4 rounded-2xl ${color.replace('bg-', 'bg-')}/10 ${color.replace('bg-', 'text-')}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </Card>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  const recentActivities = [
    { type: 'attendance', staff: 'Dr. Sarah Ahmed', action: 'Late Check-in', time: '10:15 AM', status: 'warning' },
    { type: 'financial', staff: 'Receptionist Ali', action: 'New Payment: #4421', time: '09:45 AM', status: 'success' },
    { type: 'inventory', staff: 'System', action: 'Low Stock: Paracetamol', time: '08:30 AM', status: 'danger' },
    { type: 'patient', staff: 'Dr. Khan', action: 'New Appointment', time: '08:15 AM', status: 'info' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Hospital Overview</h1>
          <p className="text-slate-500 text-sm font-semibold mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            System Status: Healthy • Performance: Optimal
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 font-bold text-xs uppercase tracking-wider">
            Export Report
          </Button>
          <Button className="bg-slate-900 hover:bg-black text-white rounded-2xl px-6 shadow-xl font-bold text-xs uppercase tracking-wider">
            Live Feed
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="PKR 842.5k" 
          change="+12.5%" 
          trend="up" 
          icon={HandCoins} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Daily Patients" 
          value="42" 
          change="+18%" 
          trend="up" 
          icon={Stethoscope} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Staff" 
          value="18/24" 
          change="-2%" 
          trend="down" 
          icon={Users} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Pharmacy Stock" 
          value="94%" 
          change="+0.5%" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-violet-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Placeholder */}
        <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Revenue Trends</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Weekly performance comparison</p>
             </div>
             <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
             </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-4">
             {[65, 45, 75, 55, 90, 70, 85].map((val, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                 <div className="w-full relative">
                    <div 
                        className="w-full bg-slate-50 rounded-full absolute bottom-0 h-full" 
                        style={{ height: '100%' }}
                    />
                    <div 
                        className="w-full bg-emerald-500 rounded-full relative transition-all duration-1000 ease-out group-hover:bg-emerald-600 shadow-lg shadow-emerald-100" 
                        style={{ height: `${loading ? 0 : val}%` }}
                    />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                 </span>
               </div>
             ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50">
           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Pulse Feed</h3>
           <div className="space-y-6">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shadow-sm ${
                    act.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                    act.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                    act.status === 'danger' ? 'bg-rose-50 text-rose-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {act.type === 'attendance' ? <Clock className="w-4 h-4" /> :
                     act.type === 'financial' ? <HandCoins className="w-4 h-4" /> :
                     act.type === 'inventory' ? <AlertCircle className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 leading-none">{act.action}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-1">{act.staff}</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
           </div>
           <Button className="w-full mt-10 bg-slate-50 hover:bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] border-none shadow-none">
              View All Logs
           </Button>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-[2rem] border-none shadow-xl shadow-emerald-100 flex items-center justify-between group cursor-pointer overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-white font-black uppercase tracking-widest text-[10px] opacity-80 mb-1">New Operation</h4>
                <p className="text-sm font-bold">Register New Staff Member</p>
             </div>
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2rem] border-none shadow-xl shadow-blue-100 flex items-center justify-between group cursor-pointer overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-white font-black uppercase tracking-widest text-[10px] opacity-80 mb-1">Stock Control</h4>
                <p className="text-sm font-bold">Initiate Inventory Audit</p>
             </div>
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
          </Card>

          <Card className="p-6 bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-[2rem] border-none shadow-xl shadow-violet-100 flex items-center justify-between group cursor-pointer overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-white font-black uppercase tracking-widest text-[10px] opacity-80 mb-1">System Audit</h4>
                <p className="text-sm font-bold">Review Module Permissions</p>
             </div>
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6" />
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
          </Card>
      </div>
    </div>
  );
}
