"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatient } from "@/contexts/PatientIdContext";
import { patientSchema, PatientFormData } from "../types";
import { usePatientRegistration } from "../hooks/usePatientRegistration";

export default function PatientRegistrationForm() {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const { pId, setpId, setPatientId, getPatientInfo, addPatient, updateInfo } = usePatientRegistration();
  const { patientId } = usePatient();
  const lastLoadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch if context ID changes and we haven't already loaded it
    if (patientId && patientId !== lastLoadedIdRef.current) {
      getPatientInfo(patientId).then((data) => {
        if (data) {
          reset(data);
          setpId(patientId);
          lastLoadedIdRef.current = patientId;
        }
      });
    } else if (!patientId) {
      lastLoadedIdRef.current = null;
    }
  }, [patientId, reset, getPatientInfo, setpId]);

  return (
    <div className="w-full h-full p-2">
      <form className="max-w-4xl mx-auto bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 p-8">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Master Patient Registry</h2>
            <p className="text-sm text-slate-500">Register new or update existing patient profile</p>
          </div>
          <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center p-2 shadow-inner">
            <span className="text-2xl">👤</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Patient ID Search */}
          <div className="flex flex-col col-span-2 md:col-span-1 space-y-1.5">
            <Label className="text-slate-600 font-semibold ml-1">Patient ID (Search)</Label>
            <Controller
              name="patient_id"
              control={control}
              render={({ field }) => (
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Enter existing ID"
                    className="w-full h-12 bg-white/70 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 p-4 rounded-2xl outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setpId(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setPatientId(pId);
                        getPatientInfo().then(data => reset(data));
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    PRESS ENTER TO LOAD
                  </div>
                </div>
              )}
            />
            <ErrorMsg msg={errors.patient_id?.message} />
          </div>

          <div className="hidden md:block" /> {/* Spacing */}

          {/* Core Info */}
          <InputField label="Patient Name" id="pname" {...register("patient_name")} err={errors.patient_name?.message} placeholder="Full Name" />

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

          <InputField label="CNIC / Identity No." id="cnic" {...register("cnic")} err={errors.cnic?.message} placeholder="00000-0000000-0" />
          <InputField label="Contact Number" id="contact" {...register("contact_number")} err={errors.contact_number?.message} placeholder="+92 XXX XXXXXXX" />

          <div className="flex flex-col col-span-2 space-y-1.5">
            <Label className="text-slate-600 font-semibold ml-1">Permanent Address</Label>
            <textarea
              id="address"
              {...register("address")}
              placeholder="House, Street, Area, City..."
              className="w-full bg-white/70 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 p-4 rounded-2xl outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm h-24 resize-none hover:bg-white"
            />
            {errors.address?.message && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.address?.message}</p>}
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Button
              variant="default"
              onClick={handleSubmit(addPatient)}
              className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-100 transition-transform active:scale-95"
            >
              Add Patient
            </Button>
            <Button
              variant="secondary"
              onClick={handleSubmit(updateInfo)}
              className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg"
            >
              Update Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => reset()}
              className="h-14 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-lg"
            >
              Reset Form
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// --- Reusable Components (Unified Design) ---

function InputField({ label, id, err, type = "text", placeholder, ...rest }: any) {
  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor={id} className="text-slate-600 font-semibold ml-1">{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        className="h-12 bg-white/70 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-2xl transition-all shadow-sm hover:bg-white"
        {...rest}
      />
      {err && <p className="text-red-500 text-[10px] mt-1 ml-1">{err}</p>}
    </div>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  return <div className="min-h-[14px] mt-1">{msg && <p className="text-red-500 text-[10px] ml-1">{msg}</p>}</div>;
}

// Re-using UI Kit components for consistency
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";
import { Button } from "@/src/components/ui/Button";
