"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatient } from "@/contexts/PatientIdContext";
import { patientSchema, PatientFormData } from "../types";
import { usePatientRegistration } from "../hooks/usePatientRegistration";
import { formatCNIC, formatPhone } from "../utils";
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";
import { Button } from "@/src/components/ui/Button";

export default function PatientRegistrationForm() {
  const { register, handleSubmit, control, reset, formState: { errors }, setValue } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    mode: "onChange",
  });

  const {
    isEditMode, loadedPatientId,
    searchQuery, setSearchQuery, searchResults, isSearching, showResults, setShowResults,
    selectSearchResult, loadPatient, clearPatient, addPatient, updateInfo,
  } = usePatientRegistration();

  const { patientId } = usePatient();
  const lastLoadedIdRef = useRef<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Load patient from context
  useEffect(() => {
    if (patientId && patientId !== lastLoadedIdRef.current) {
      loadPatient(patientId).then((data) => {
        if (data) {
          populateForm(data);
          lastLoadedIdRef.current = patientId;
        }
      });
    } else if (!patientId) {
      lastLoadedIdRef.current = null;
    }
  }, [patientId, reset, loadPatient]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setShowResults]);

  /** Populate form with patient data — handles Controller fields explicitly */
  function populateForm(data: any) {
    // Reset all register-based fields
    reset({
      patient_name: data.patient_name || "",
      age: data.age != null ? String(data.age) : "",
      gender: data.gender || "",
      cnic: data.cnic || "",
      contact_number: data.contact_number || "",
      address: data.address || "",
    });
    // Explicitly set Controller-managed fields (they sometimes don't pick up reset)
    setValue("cnic", data.cnic || "", { shouldValidate: true });
    setValue("contact_number", data.contact_number || "", { shouldValidate: true });
    // Focus the first form field
    setTimeout(() => firstFieldRef.current?.focus(), 100);
  }

  function handleSelectResult(patient: any) {
    selectSearchResult(patient);
    setHighlightedIndex(-1);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < searchResults.length - 1 ? prev + 1 : 0;
        scrollToItem(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : searchResults.length - 1;
        scrollToItem(next);
        return next;
      });
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectResult(searchResults[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowResults(false);
      setHighlightedIndex(-1);
    }
  }

  function scrollToItem(index: number) {
    const container = dropdownRef.current;
    if (!container) return;
    const item = container.children[index] as HTMLElement;
    if (item) item.scrollIntoView({ block: "nearest" });
  }

  function handleNewPatient() {
    clearPatient();
    reset({ patient_name: "", age: "", gender: "", cnic: "", contact_number: "", address: "" });
    setValue("cnic", "");
    setValue("contact_number", "");
    lastLoadedIdRef.current = null;
    setTimeout(() => firstFieldRef.current?.focus(), 100);
  }

  async function onSubmit(data: PatientFormData) {
    if (isEditMode) {
      await updateInfo(data);
    } else {
      const result = await addPatient(data);
      if (result?.patient_id) {
        lastLoadedIdRef.current = String(result.patient_id);
      }
    }
  }

  /** Arrow Left/Right navigates between form fields, Up/Down reserved for value changes */
  function handleFormKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;

    const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement;

    // For text inputs and textareas: only navigate when cursor is at the boundary
    // Number inputs don't support selectionStart, so always allow navigation
    if ((active?.tagName === "INPUT" && (active as HTMLInputElement).type !== "number") || active?.tagName === "TEXTAREA") {
      const pos = active.selectionStart ?? 0;
      const len = (active.value || "").length;
      if (e.key === "ArrowLeft" && pos > 0) return;
      if (e.key === "ArrowRight" && pos < len) return;
    }

    const form = formRef.current;
    if (!form) return;

    const focusable = Array.from(
      form.querySelectorAll<HTMLElement>('input:not([type="hidden"]), select, textarea')
    ).filter((el) => !el.hasAttribute("disabled"));

    const idx = focusable.indexOf(active);
    if (idx === -1) return;

    e.preventDefault();
    const next = e.key === "ArrowRight"
      ? focusable[(idx + 1) % focusable.length]
      : focusable[(idx - 1 + focusable.length) % focusable.length];
    next.focus();
  }

  return (
    <div className="w-full h-full p-2 space-y-4">
      {/* ═══════ SEARCH PANEL ═══════ */}
      <div ref={searchRef} className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg shadow-slate-200/40 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-indigo-100 rounded-xl flex items-center justify-center text-lg">🔍</div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Find Existing Patient</p>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setHighlightedIndex(-1); }}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by name, CNIC, or patient ID..."
              autoComplete="off"
              className="w-full h-12 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 px-4 pr-24 rounded-xl outline-none text-sm font-medium transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isSearching && (
                <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              )}
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                LIVE SEARCH
              </span>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div ref={dropdownRef} className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-300/50 max-h-60 overflow-y-auto">
              {searchResults.map((p, index) => (
                <button
                  key={p.patient_id}
                  type="button"
                  onClick={() => handleSelectResult(p)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full flex items-center gap-4 px-4 py-3 transition-colors text-left border-b border-slate-50 last:border-0 ${index === highlightedIndex ? "bg-indigo-50" : "hover:bg-indigo-50"}`}
                >
                  <div className="h-9 w-9 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-black text-emerald-700 shrink-0">
                    {p.patient_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.patient_name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      ID: {p.patient_id} · {p.gender} · Age {p.age} · CNIC: {p.cnic || "N/A"}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
                    SELECT
                  </span>
                </button>
              ))}
            </div>
          )}
          {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
              <p className="text-sm text-slate-400">No patients found</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ REGISTRATION FORM ═══════ */}
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={handleFormKeyDown}
        className="max-w-4xl mx-auto bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {isEditMode ? "Update Patient Profile" : "Register New Patient"}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditMode
                ? `Editing record for Patient ID: ${loadedPatientId}`
                : "Fill out the details below to create a new patient record"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditMode && (
              <span className="text-xs font-black bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl tracking-wide">
                ID: {loadedPatientId}
              </span>
            )}
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center p-2 shadow-inner ${isEditMode ? "bg-amber-100" : "bg-emerald-100"}`}>
              <span className="text-2xl">{isEditMode ? "✏️" : "👤"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Patient Name — first field, gets focus after patient load */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="pname" className="text-slate-600 font-semibold ml-1">Patient Name</Label>
            <Input
              id="pname"
              type="text"
              placeholder="Full Name"
              autoComplete="off"
              className="h-12 bg-white/70 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-2xl transition-all shadow-sm hover:bg-white"
              {...register("patient_name")}
              ref={(el) => {
                register("patient_name").ref(el);
                (firstFieldRef as any).current = el;
              }}
            />
            {errors.patient_name?.message && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.patient_name?.message}</p>}
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Age" id="age" type="number" {...register("age")} err={errors.age?.message} placeholder="Years" />
            <div className="flex flex-col space-y-1.5">
              <Label className="text-slate-600 font-semibold ml-1">Gender</Label>
              <select
                {...register("gender")}
                className="h-12 bg-white/70 border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 outline-none text-sm transition-all shadow-sm hover:bg-white"
              >
                <option value="" hidden>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender?.message && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.gender?.message}</p>}
            </div>
          </div>

          {/* ═══ CNIC — Masked Input ═══ */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="cnic" className="text-slate-600 font-semibold ml-1">CNIC / Identity No.</Label>
            <Controller
              name="cnic"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  {/* Static mask overlay */}
                  <div className="absolute inset-0 h-12 flex items-center px-4 pointer-events-none font-mono tracking-[0.25em] text-slate-300 text-sm select-none">
                    {(() => {
                      const digits = (field.value || "").replace(/\D/g, "");
                      // Show mask only for unfilled positions
                      const filled = formatCNIC(field.value || "");
                      const mask = "_____-_______-_";
                      let result = "";
                      for (let i = 0; i < mask.length; i++) {
                        if (i < filled.length) {
                          result += "\u00A0"; // invisible space for filled chars
                        } else {
                          result += mask[i];
                        }
                      }
                      return result;
                    })()}
                  </div>
                  <input
                    id="cnic"
                    type="text"
                    autoComplete="off"
                    maxLength={15}
                    className="w-full h-12 bg-white/70 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 px-4 rounded-2xl outline-none text-sm transition-all shadow-sm hover:bg-white font-mono tracking-[0.25em]"
                    value={formatCNIC(field.value || "")}
                    onChange={(e) => {
                      const formatted = formatCNIC(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </div>
              )}
            />
            {errors.cnic?.message && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.cnic?.message}</p>}
          </div>

          {/* ═══ Contact Number — 03 prefix ═══ */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="contact" className="text-slate-600 font-semibold ml-1">Contact Number</Label>
            <Controller
              name="contact_number"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  {/* Static 03 prefix badge */}
                  <div className="absolute left-0 top-0 h-12 flex items-center pl-4 pointer-events-none">
                    <span className="font-mono text-sm font-bold text-emerald-600 tracking-wider">03</span>
                  </div>
                  <input
                    id="contact"
                    type="text"
                    autoComplete="off"
                    maxLength={12}
                    placeholder="XX-XXXXXXX"
                    className="w-full h-12 bg-white/70 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl outline-none text-sm transition-all shadow-sm hover:bg-white font-mono tracking-wider pl-12"
                    value={(() => {
                      // Display without the "03" prefix since it's shown as a badge
                      const formatted = formatPhone(field.value || "");
                      return formatted.startsWith("03") ? formatted.slice(2) : formatted;
                    })()}
                    onChange={(e) => {
                      // Prepend 03 to whatever user types
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
                      const full = "03" + raw;
                      const formatted = formatPhone(full);
                      field.onChange(formatted);
                    }}
                  />
                </div>
              )}
            />
            {errors.contact_number?.message && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.contact_number?.message}</p>}
          </div>

          {/* Address */}
          <div className="flex flex-col col-span-2 space-y-1.5">
            <Label className="text-slate-600 font-semibold ml-1">Permanent Address</Label>
            <textarea
              id="address"
              {...register("address")}
              placeholder="House, Street, Area, City..."
              autoComplete="off"
              className="w-full bg-white/70 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 p-4 rounded-2xl outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm h-24 resize-none hover:bg-white"
            />
            {errors.address?.message && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.address?.message}</p>}
          </div>

          {/* ═══════ ACTION BUTTONS ═══════ */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <button
              type="submit"
              className={`h-14 rounded-2xl font-bold text-lg transition-all active:scale-95 ${isEditMode
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
                }`}
            >
              {isEditMode ? "Update Patient" : "Add Patient"}
            </button>
            <button
              type="button"
              onClick={handleNewPatient}
              className="h-14 rounded-2xl font-bold text-lg transition-all bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              New Patient
            </button>
            <button
              type="button"
              onClick={handleNewPatient}
              className="h-14 rounded-2xl font-bold text-lg transition-all border-2 border-slate-200 hover:bg-slate-50 text-slate-500"
            >
              Reset Form
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// --- Reusable Components ---

function InputField({ label, id, err, type = "text", placeholder, autoComplete = "off", ...rest }: any) {
  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor={id} className="text-slate-600 font-semibold ml-1">{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 bg-white/70 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-2xl transition-all shadow-sm hover:bg-white"
        {...rest}
      />
      {err && <p className="text-red-500 text-[10px] mt-1 ml-1">{err}</p>}
    </div>
  );
}
