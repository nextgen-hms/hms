"use client";
import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Globe, 
  Bell, 
  Lock, 
  Database, 
  Cloud, 
  Smartphone,
  Check,
  Save,
  RotateCcw,
  ShieldCheck,
  Zap,
  Layout,
  HardDrive
} from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleUpdateValue = (key: string, value: any) => {
    const updated = settings.map(s => 
      s.setting_key === key ? { ...s, setting_value: value } : s
    );
    setSettings(updated);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const formatted = settings.map(s => ({ key: s.setting_key, value: s.setting_value }));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: formatted, staff_id: 1 }) // Assuming staff_id 1 for now
      });
      if (res.ok) {
        alert("Settings successfully updated");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'general', label: 'Hospital Identity', icon: Globe, color: 'text-blue-500' },
    { id: 'security', label: 'Auth & Security', icon: Lock, color: 'text-indigo-500' },
    { id: 'notifications', label: 'Communication Hub', icon: Bell, color: 'text-amber-500' },
    { id: 'system', label: 'System Architecture', icon: Database, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">System Configuration</h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">Global environment variables and behavioral overrides</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-2xl border-slate-200" onClick={fetchSettings}>
               <RotateCcw className="w-4 h-4 mr-2" />
               Revert Changes
           </Button>
           <Button 
                onClick={saveAll}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 shadow-xl shadow-emerald-100 font-bold text-xs uppercase tracking-wider h-12"
           >
               {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
               Store Configuration
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Navigation */}
         <div className="space-y-2">
            {sections.map(sec => (
               <button key={sec.id} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all text-left ${
                  sec.id === 'general' ? 'bg-white shadow-lg shadow-slate-200/50 text-slate-800 font-black' : 'hover:bg-slate-50 text-slate-400 font-bold'
               }`}>
                  <sec.icon className={`w-5 h-5 ${sec.id === 'general' ? sec.color : 'text-slate-200'}`} />
                  <span className="text-xs uppercase tracking-wider">{sec.label}</span>
               </button>
            ))}
            <div className="pt-8 px-6">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Integrations</p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 grayscale opacity-40">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Fingerprint SDK</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black uppercase text-slate-400">WhatsApp API</span>
                   </div>
                   <div className="flex items-center gap-3 grayscale opacity-40">
                      <Cloud className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-black uppercase text-slate-400">AWS S3 Assets</span>
                   </div>
                </div>
            </div>
         </div>

         {/* Settings Grid */}
         <div className="lg:col-span-3 space-y-8">
            <Card className="p-8 rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white">
                <div className="space-y-12">
                   {loading ? (
                       <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Fetching encrypted store...</p>
                       </div>
                   ) : (
                       settings.map((s, idx) => (
                          <div key={idx} className="group relative">
                             <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-12 border-b border-slate-50 last:border-none last:pb-0">
                                <div className="max-w-md">
                                   <div className="flex items-center gap-2 mb-2">
                                      {idx % 3 === 0 ? <Layout className="w-3.5 h-3.5 text-blue-500" /> : <HardDrive className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400" />}
                                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">{s.setting_key.replace(/_/g, ' ')}</h3>
                                   </div>
                                   <p className="text-xs text-slate-400 font-medium leading-relaxed">System-wide behavioral flag for {s.setting_key}. This control affects all connected hospital branches and API consumers.</p>
                                </div>
                                <div className="w-full md:w-64">
                                   {typeof s.setting_value === 'boolean' ? (
                                      <button 
                                         onClick={() => handleUpdateValue(s.setting_key, !s.setting_value)}
                                         className={`w-full h-12 rounded-2xl flex items-center justify-between px-6 transition-all ${
                                            s.setting_value ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                                         }`}
                                      >
                                         <span className="text-[10px] font-black uppercase tracking-widest">{s.setting_value ? 'Active' : 'Disabled'}</span>
                                         <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${s.setting_value ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            {s.setting_value ? <Check className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                         </div>
                                      </button>
                                   ) : (
                                      <input 
                                         type="text" 
                                         value={s.setting_value}
                                         onChange={(e) => handleUpdateValue(s.setting_key, e.target.value)}
                                         className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-slate-300 font-mono"
                                         placeholder="Enter value..."
                                      />
                                   )}
                                </div>
                             </div>
                          </div>
                       ))
                   )}
                </div>
            </Card>

            <div className="p-8 rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50 flex items-start gap-4">
               <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-1" />
               <div>
                  <h4 className="text-xs font-black text-indigo-900 uppercase tracking-tight">Security Protocol Active</h4>
                  <p className="text-[11px] text-indigo-600/70 mt-1 leading-relaxed font-medium">All configuration changes are cryptographically hashed and stored in the system audit timeline. Modifying these values may require a system warm-restart on high-concurrency environments.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
