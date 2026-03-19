"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Baby, 
  UserPlus, 
  Activity,
  PieChart,
  Calendar,
  ArrowRight,
  User,
  MoreVertical,
  TrendingUp,
  MapPin
} from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

export default function PatientsAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/patients/analytics")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Patient Analytics</h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">Population health & visit demographics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 font-bold text-xs uppercase tracking-wider h-12">
            Export Records
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 shadow-xl font-bold text-xs uppercase tracking-wider h-12">
            Register New Patient
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-[2rem] border-none shadow-xl shadow-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Patients</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{data?.summary?.total_patients}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[2rem] border-none shadow-xl shadow-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">New (30 Days)</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{data?.summary?.recent_registrations}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[2rem] border-none shadow-xl shadow-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Visitors</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{data?.summary?.active_visitors}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[2rem] border-none shadow-xl border border-indigo-100 bg-indigo-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Growth Rate</p>
              <h3 className="text-2xl font-black text-indigo-600 tracking-tight">+12.4%</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart Mockup (Placeholder for visual aesthetic) */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Registration Trend</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">Patient growth over the last 6 months</p>
                 </div>
                 <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Registrations</span>
                 </div>
              </div>

              <div className="h-64 flex items-end justify-between gap-4 px-4 pr-12">
                 {data?.trend?.map((t: any, i: number) => {
                    const maxCount = Math.max(...data.trend.map((x: any) => Number(x.count)));
                    const height = (Number(t.count) / maxCount) * 100;
                    
                    return (
                       <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                          <div className="relative w-full">
                             <div 
                                className="w-full bg-slate-50 rounded-2xl overflow-hidden relative" 
                                style={{ height: '240px' }}
                             >
                                <div 
                                   className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-2xl transition-all duration-1000 group-hover:brightness-110" 
                                   style={{ height: `${height}%` }}
                                >
                                   <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-xl transition-opacity">
                                      {t.count}
                                   </div>
                                </div>
                             </div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap rotate-[-45deg] translate-y-2">
                             {t.month}
                          </span>
                       </div>
                    );
                 })}
              </div>
           </Card>

           {/* Recent Registrations Table */}
           <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recent Onboarding</h3>
                 <Button variant="ghost" className="text-slate-400 hover:text-slate-900 group">
                    <span className="text-[10px] font-black uppercase tracking-widest">Full Directory</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                 </Button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-slate-50 italic">
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Patient</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Demographics</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Address</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Signed Up</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {data?.recentPatients?.map((p: any, i: number) => (
                          <tr key={i} className="group hover:bg-slate-50 transition-colors">
                             <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-inner">
                                      {p.patient_name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-800">{p.patient_name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: #PT-{1000 + i}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                   <span className={`w-1.5 h-1.5 rounded-full ${p.gender === 'Male' ? 'bg-blue-400' : 'bg-rose-400'}`} />
                                   <p className="text-xs font-black text-slate-600">{p.gender}, {p.age}y</p>
                                </div>
                             </td>
                             <td className="py-4 px-4">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                   <MapPin className="w-3 h-3" />
                                   <span className="text-xs font-bold truncate max-w-[120px]">{p.address || 'H-232 Block B, Lahore'}</span>
                                </div>
                             </td>
                             <td className="py-4 px-4 text-xs font-black text-slate-800">{p.registered_at}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>

        {/* Demographic Breakdown */}
        <div className="space-y-8">
           <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Gender Diversity</h3>
              <div className="flex flex-col items-center">
                 <div className="relative w-48 h-48 mb-8">
                    <div className="absolute inset-0 rounded-full border-[1.5rem] border-slate-50" />
                    {/* Visual Mock of Donut Chart segments */}
                    <div className="absolute inset-0 rounded-full border-[1.5rem] border-blue-500 border-r-transparent border-b-transparent rotate-45" />
                    <div className="absolute inset-0 rounded-full border-[1.5rem] border-emerald-500 border-l-transparent border-t-transparent -rotate-45" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</p>
                       <h4 className="text-2xl font-black text-slate-800 tracking-tight">100%</h4>
                    </div>
                 </div>

                 <div className="w-full space-y-4">
                    {data?.genderDist?.map((g: any, i: number) => (
                       <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                          <div className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                             <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{g.gender}</span>
                          </div>
                          <span className="text-sm font-black text-slate-800">{g.count}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </Card>

           <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-3xl" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-8">Patient Age Distribution</h3>
              <div className="space-y-6">
                 {data?.ageGroups?.map((group: any, i: number) => {
                    const maxCount = Math.max(...data.ageGroups.map((x: any) => Number(x.count)));
                    const width = (Number(group.count) / maxCount) * 100;

                    return (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                             <span className="text-slate-400">{group.age_group}</span>
                             <span>{group.count}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                style={{ width: `${width}%` }}
                             />
                          </div>
                       </div>
                    );
                 })}
              </div>

              <div className="mt-12 group cursor-pointer">
                 <div className="p-5 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                       <PieChart className="w-6 h-6 text-indigo-400" />
                       <span className="text-[11px] font-black uppercase tracking-widest">Risk Analysis</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
