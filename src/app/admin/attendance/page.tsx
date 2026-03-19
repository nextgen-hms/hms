"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Edit2,
  Filter
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";

export default function AttendancePage() {
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [showManualModal, setShowManualModal] = useState(false);
    const [manualEntry, setManualEntry] = useState({
        staff_id: "",
        date: new Date().toISOString().split('T')[0],
        status: "Present",
        check_in_time: "",
        check_out_time: ""
    });

    useEffect(() => {
        fetchAttendance();
    }, [selectedDate]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/attendance?date=${selectedDate}`);
            const data = await res.json();
            setAttendanceData(data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/attendance/manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(manualEntry)
            });
            if (res.ok) {
                setShowManualModal(false);
                fetchAttendance();
            } else {
                alert("Failed to save attendance");
            }
        } catch (err) {
            console.error("Manual Entry Error:", err);
        }
    };

    const stats = [
        { label: "Total Staff", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Present Today", value: attendanceData.filter(a => a.status === 'Present').length || 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Absent", value: "2", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Late / Half Day", value: "1", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const filteredData = attendanceData.filter(item => 
        item.staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.user_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Attendance & Time Tracking</h1>
                    <p className="text-slate-500 text-sm font-semibold mt-1">Monitor staff presence and daily working hours</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl border-slate-200">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button 
                        onClick={() => setShowManualModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-6 shadow-lg shadow-emerald-100"
                    >
                        Manual Entry Override
                    </Button>
                </div>
            </div>

            {/* Manual Entry Modal */}
            {showManualModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Manual Attendance Entry</h2>
                            <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 transition-all p-2 bg-slate-50 rounded-xl">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleManualSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Staff Member ID</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Staff ID (e.g., 1)" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={manualEntry.staff_id}
                                    onChange={(e) => setManualEntry({...manualEntry, staff_id: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={manualEntry.date}
                                        onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={manualEntry.status}
                                        onChange={(e) => setManualEntry({...manualEntry, status: e.target.value})}
                                    >
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Half-Day">Half-Day</option>
                                        <option value="Leave">Leave</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Check In</label>
                                    <input 
                                        type="time" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={manualEntry.check_in_time}
                                        onChange={(e) => setManualEntry({...manualEntry, check_in_time: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Check Out</label>
                                    <input 
                                        type="time" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={manualEntry.check_out_time}
                                        onChange={(e) => setManualEntry({...manualEntry, check_out_time: e.target.value})}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl shadow-xl mt-4 font-black uppercase tracking-widest text-[11px]">
                                Save Record
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="p-6 border-none shadow-sm bg-white rounded-[2rem] flex items-center gap-5">
                        <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-800 mt-0.5">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl w-full md:w-96">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search staff by name or code..." 
                            className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl">
                             <Calendar className="w-4 h-4 text-emerald-600" />
                             <input 
                                type="date" 
                                className="bg-transparent border-none focus:outline-none text-xs font-black text-slate-600 uppercase"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                             />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Staff Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Check In</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Check Out</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching daily logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Calendar className="w-12 h-12 text-slate-300" />
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No attendance records found for this date</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.map((record) => (
                                <tr key={record.attendance_id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center font-black text-emerald-700 text-xs shadow-sm">
                                                {record.staff_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm leading-none">{record.staff_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{record.user_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                            record.status === 'Present' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                : 'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-xs font-bold font-mono tracking-tight">
                                                {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-xs font-bold font-mono tracking-tight">
                                                {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
