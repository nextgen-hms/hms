"use client";
import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieIcon,
  ShoppingBag,
  Activity,
  CreditCard,
  FileText
} from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

export default function FinancialsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/financials")
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

  const totalPaid = data?.revenue?.find((r: any) => r.payment_status === 'Paid')?.total || 0;
  const totalPending = data?.revenue?.filter((r: any) => r.payment_status !== 'Paid')
                          .reduce((acc: number, r: any) => acc + Number(r.total), 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Financial Analytics</h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">Real-time revenue & expenditure auditing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 font-bold text-xs uppercase tracking-wider h-12">
            Download PDF
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-6 shadow-xl font-bold text-xs uppercase tracking-wider h-12">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl shadow-emerald-50 bg-emerald-500 text-white">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Net Revenue</p>
                 <h3 className="text-4xl font-black tracking-tight">PKR {Number(totalPaid).toLocaleString()}</h3>
                 <div className="flex items-center gap-2 mt-4 text-[11px] font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    +14.2% Growth
                 </div>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                 <DollarSign className="w-6 h-6" />
              </div>
           </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl shadow-slate-100 bg-white">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Operating Expenses</p>
                 <h3 className="text-4xl font-black tracking-tight text-slate-800">PKR {Number(data?.expenses).toLocaleString()}</h3>
                 <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-rose-500 bg-rose-50 w-fit px-3 py-1 rounded-full">
                    <ArrowDownRight className="w-3 h-3" />
                    Increased 8%
                 </div>
              </div>
              <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100">
                 <TrendingDown className="w-6 h-6" />
              </div>
           </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl shadow-amber-50 bg-white border border-amber-100">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Arrears / Pending</p>
                 <h3 className="text-4xl font-black tracking-tight text-slate-800">PKR {Number(totalPending).toLocaleString()}</h3>
                 <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-amber-600 bg-amber-50 w-fit px-3 py-1 rounded-full">
                    <Activity className="w-3 h-3" />
                    12 Unpaid Bills
                 </div>
              </div>
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                 <CreditCard className="w-6 h-6" />
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Trend */}
        <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white">
          <div className="flex items-center justify-between mb-10">
             <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Revenue Pulse</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Growth tracking over 7 days</p>
             </div>
             <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Paid</span>
                </div>
             </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-6 px-4">
             {data?.trend?.map((t: any, i: number) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                 <div className="relative w-full h-full flex items-end">
                    <div className="w-full bg-slate-50 rounded-2xl absolute bottom-0 h-full" style={{ height: '100%' }} />
                    <div 
                        className="w-full bg-emerald-500 rounded-2xl relative transition-all duration-1000 ease-out group-hover:bg-emerald-600 shadow-lg shadow-emerald-100" 
                        style={{ height: `${(Number(t.total) / Math.max(...data.trend.map((tr: any) => Number(tr.total)))) * 100}%` }}
                    >
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {Number(t.total).toLocaleString()}
                       </div>
                    </div>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.day}</span>
               </div>
             ))}
          </div>
        </Card>

        {/* Breakdown */}
        <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Departmental Share</h3>
           <div className="space-y-8">
              {data?.breakdown?.map((item: any, i: number) => {
                const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-slate-400'];
                const total = data.breakdown.reduce((acc: number, curr: any) => acc + Number(curr.total), 0);
                const percent = (Number(item.total) / total) * 100;

                return (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                       <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                          <span className="text-sm font-black text-slate-700">{item.category}</span>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-800">PKR {Number(item.total).toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-400">{percent.toFixed(1)}% weight</p>
                       </div>
                    </div>
                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div 
                          className={`h-full rounded-full ${colors[i % colors.length]}`} 
                          style={{ width: `${percent}%` }}
                       />
                    </div>
                  </div>
                );
              })}
           </div>

           <div className="mt-10 p-5 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <PieIcon className="w-5 h-5 text-indigo-600" />
                 </div>
                 <div>
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Growth Forecast</h5>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">Predicted +5.8% increase in Lab revenue next month based on patient intake.</p>
                 </div>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
