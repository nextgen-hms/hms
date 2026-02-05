"use client";
import { ChangeEvent, KeyboardEvent } from "react";
import { usePatientForm } from "../hooks/usePatientForm";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";

export function PatientForm() {
  const {
    pId,
    setpId,
    searchName,
    setSearchName,
    age,
    setAge,
    gender,
    setGender,
    visitReason,
    setVisitReason,
    doctor,
    setDoctor,
    visitType,
    setVisitType,
    clinicNo,
    doctors,
    searchResults, isExistingVisit, isSearching,
    getPatientInfo, searchByName, addToQueue, updateInfo, resetInfo,
    patientId,
    setPatientId,
  } = usePatientForm();

  const handlePatientIdKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!pId) return;
      console.log(pId);

      getPatientInfo(pId);
    }
  };



  return (
    <div className="w-full h-full p-2">
      <div className="max-w-4xl mx-auto bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 p-8">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Visit Registration</h2>
            <p className="text-sm text-slate-500">Assign a patient to a doctor&apos;s queue</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md tracking-wider">
              Today&apos;s Clinic No
            </span>
            <p className="text-3xl font-black text-slate-900 leading-none mt-1">
              #{clinicNo || "---"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Patient ID */}
          <div className="space-y-1.5">
            <Label className="text-slate-600 font-semibold ml-1">Patient ID</Label>
            <div className="relative group">
              <Input
                value={pId}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setpId(e.target.value)}
                onKeyDown={handlePatientIdKeyDown}
                placeholder="Ex: 1001"
                className="bg-white/70 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-12 rounded-2xl transition-all shadow-sm group-hover:bg-white"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                Press Enter
              </div>
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <Label className="text-slate-600 font-semibold ml-1">Patient Name</Label>
            <div className="relative group">
              <Input
                value={searchName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setSearchName(e.target.value);
                  searchByName(e.target.value);
                }}
                placeholder="Patient Name"
                className="bg-white/70 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-12 rounded-2xl transition-all shadow-sm hover:bg-white"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>

            {/* Dropdown for search results */}
            {searchResults && searchResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden ring-1 ring-slate-900/5 py-2 scrollbar-thin scrollbar-thumb-slate-200">
                {searchResults.map((p) => (
                  <button
                    key={p.patient_id}
                    onClick={() => {
                      getPatientInfo(p.patient_id);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-none group flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{p.patient_name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">CNIC: {p.cnic || "N/A"} • ID: {p.patient_id}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{p.gender}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{p.age} Yrs</span>
                    </div>
                  </button>
                ))}
              </div>
            )}          </div>

          {/* Age & Gender Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-600 font-semibold ml-1">Age</Label>
              <Input
                type="number"
                value={age}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAge(e.target.value)}
                placeholder="Years"
                className="bg-white/70 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-12 rounded-2xl transition-all shadow-sm hover:bg-white"
              />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-slate-600 font-semibold ml-1">Gender</Label>
              <select
                className="bg-white/70 border-slate-200 border rounded-2xl h-12 px-4 shadow-sm hover:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                value={gender}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Visit Type */}
          <div className="space-y-1.5 flex flex-col">
            <Label className="text-slate-600 font-semibold ml-1">Visit Type</Label>
            <div className="flex p-1 bg-slate-100 rounded-2xl h-12 items-center gap-1">
              {["OPD", "Emergency"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVisitType(type)}
                  className={`flex-1 h-full rounded-xl text-sm font-bold transition-all ${visitType === type
                    ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Select Doctor */}
          <div className="space-y-1.5 flex flex-col">
            <Label className="text-slate-600 font-semibold ml-1">Assign Doctor</Label>
            <select
              className="bg-white/70 border-slate-200 border rounded-2xl h-12 px-4 shadow-sm hover:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              value={doctor}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setDoctor(e.target.value)}
            >
              <option value="">Select Practitioner</option>
              {doctors.map((d: { doctor_name: string; doctor_id: string }) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  Dr. {d.doctor_name}
                </option>
              ))}
            </select>
          </div>

          {/* Visit Reason */}
          <div className="space-y-1.5 flex flex-col">
            <Label className="text-slate-600 font-semibold ml-1">Chief Complaint</Label>
            <Input
              value={visitReason}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setVisitReason(e.target.value)}
              placeholder="Reason for visit..."
              className="bg-white/70 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-12 rounded-2xl transition-all shadow-sm hover:bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Button
              variant="default"
              onClick={() => isExistingVisit ? updateInfo() : addToQueue()}
              className={`h-14 rounded-2xl font-bold text-lg transition-transform active:scale-95 shadow-lg ${isExistingVisit
                ? "bg-slate-800 hover:bg-slate-900 text-white shadow-slate-200"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                }`}
            >
              {isExistingVisit ? "Update Today's Visit" : "Add to Queue"}
            </Button>
            <Button
              variant="outline"
              onClick={() => resetInfo()}
              className="h-14 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-lg"
            >
              Reset / New Patient
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔹 Select Field (Keep this for now, can be moved to components/ui later)
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700 px-2">{label}</label>
      <select
        className="bg-gray-100 w-[80%] px-4 py-2 rounded-lg border border-gray-300 outline-none text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={value ?? ""}
        onChange={onChange}
      >
        <option value="" disabled hidden>
          Select
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}