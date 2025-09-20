"use client";
import { usePatient } from "@/contexts/PatientIdContext";
import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";

type Doctor = {
  doctor_id: string;
  doctor_name: string;
};
export default function PatientForm() {
  const [pId, setpId] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [visitReason, setVisitReason] = useState<string>("");
  const [doctor, setDoctor] = useState<string>("");
  const [VisitType, setVisitType] = useState<string>("");
  const [clinicNo, setClinicNo] = useState<string>("");
  const { patientId, setPatientId } = usePatient();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `QueueSlip ${patientId}`, // optional: sets PDF/print title
  });
  useEffect(() => {
    if (!patientId) return;
    setpId(patientId);
    getPatientInfo();
  }, [patientId]);
  async function fetchClininNo() {
    const res_clinic_no = await fetch("api/patient/getNewClinicNo");
    const p_clininc_no = (await res_clinic_no.json()).clinicNo;
    setClinicNo(p_clininc_no || "");
  }
  useEffect(() => {
    fetchClininNo();
    async function fetchDoctors() {
      const res = await fetch("api/doctor/getAllDoctors");
      const docs = await res.json();
      console.log(docs);
      setDoctors(docs);
    }
    fetchClininNo();
    fetchDoctors();
  }, []);

  async function getPatientInfo() {
    const res = await fetch(`api/patient/${patientId}`);
    const data = await res.json();

    setPatientName(data.patient_name);
    setAge(data.age);
    setGender(data.gender);
    if (data.patient_name) toast.success("patient Found");
    getPatientVisitInfo(data.patient_name, data.age);
  }
  async function getPatientVisitInfo(patient_name: string, age: string) {
    if (patient_name && age) {
      const res = await fetch(`api/visit/${patientId}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error("no visit dound for today");
        return;
      }
      console.log(data);
      if (res.ok) {
        console.log(data);
        if (data.clinic_number) {
          setVisitReason(data.visitReason);
          setDoctor(data.doctor_id);
          setVisitType(data.visit_type);
          setClinicNo(data.clinic_number || " ");
          setVisitReason(data.reason);
        } else {
          toast.error("no visit dound for today");
          fetchClininNo();
          setVisitReason("");
          setVisitType("");
          setDoctor("");
        }
      }
    }
  }
  async function UpdateInfo() {
    const res = await fetch("api/visit", {
      method: "PATCH",
      body: JSON.stringify({
        clinic_number: clinicNo,
        reason: visitReason,
        doctor_id: doctor,
        visit_type: VisitType,
        status: "waiting",
        patient_id: patientId,
      }),
    });
    if (res.ok) {
      toast.success(`P000${patientId} info updated `);
    } else {
      toast.error(`P000${patientId} info  not updated `);
    }
  }
  async function addToQueue() {
    if (!visitReason || !doctor || !VisitType) {
      console.log({
        patient_id: patientId,
        clinic_number: clinicNo,
        reason: visitReason,
        doctor_id: doctor,
        visit_type: VisitType,
        gender: gender,
      });

      toast.error("incomplete form");
      return;
    }
    const res = await fetch("api/visit", {
      method: "POST",
      body: JSON.stringify({
        patient_id: patientId,
        clinic_number: clinicNo,
        reason: visitReason,
        doctor_id: doctor,
        visit_type: VisitType,
      }),
    });
    toast.success("Patient added to Queue");
  }
  function resetInfo() {
    setAge("");
    fetchClininNo();
    setDoctor("");
    setGender("");
    setPatientId("");
    setPatientName("");
    setVisitReason("");
    setVisitType("");
    setPatientId("");
    setpId("");
  }
  return (
    <>
      <div className="w-full h-full  border-black/30 rounded-4xl  ">
        <div className=" w-2/3 p-4 grid grid-cols-2  space-y-5  rounded-2xl border-black/30 ">
          <div className="flex flex-col ">
            <label
              htmlFor="patientId"
              className="text-sm px-2 pb-1 text-black/70"
            >
              Patient Id :
            </label>
            <input
              className="bg-gray-200 rounded-2xl  w-[80%] p-2  "
              id="patientId"
              type="text"
              placeholder="Enter existing Patient Id"
              onChange={(e) => setpId(e.target.value)}
              value={pId}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPatientId(pId);
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div className="flex flex-col ">
            <label
              htmlFor="clinicNo"
              className="text-sm px-2 pb-1 text-black/70"
            >
              Clinic No :
            </label>
            <input
              className="bg-gray-200 rounded-2xl  w-[80%] p-2    "
              id="clinicNo"
              type="text"
              placeholder="Clinic Number"
              disabled
              value={clinicNo}
            />
          </div>
          <div className="flex flex-col ">
            <label
              htmlFor="patientName"
              className="text-sm px-2 pb-1 text-black/70"
            >
              Patient Name :
            </label>
            <input
              className="bg-gray-200 rounded-2xl w-[80%] p-2  "
              id="patientName"
              type="text"
              placeholder="Patient Name"
              onChange={(e) => setPatientName(e.target.value)}
              value={patientName}
            />
          </div>
          <div className="flex flex-col ">
            <label htmlFor="age" className="text-sm px-2 pb-1 text-black/70">
              Age :
            </label>
            <input
              className="bg-gray-200 rounded-2xl w-[80%] p-2    "
              id="age"
              type="text"
              placeholder="Patient Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="gender" className="text-sm px-2 pb-1 text-black/70">
              Gender :
            </label>
            <select
              id="gender"
              className="bg-black/10 w-[80%] p-2  rounded-2xl outline-none text-black "
              name="Gender"
              required
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="" disabled hidden>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="flex flex-col ">
            <label
              htmlFor="visitReason"
              className="text-sm px-2 pb-1 text-black/70"
            >
              Visit Reason :
            </label>
            <input
              className="bg-gray-200 rounded-2xl w-[80%] p-2    "
              id="visitReason"
              type="text"
              placeholder="Visit Reason"
              value={visitReason}
              onChange={(e) => setVisitReason(e.target.value)}
            />
          </div>
          <div className="flex flex-col  ">
            <label htmlFor="Doctor" className="text-sm px-2 pb-1 text-black/70">
              Select Doctor :
            </label>
            <select
              id="Doctor"
              className="bg-black/10 w-[80%] p-2  rounded-2xl outline-none  text-black"
              name="Doctors"
              required
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
            >
              <option value="" disabled hidden>
                Select Doctor
              </option>
              {doctors.map((d: any) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {d.doctor_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col  ">
            <label
              htmlFor="VisitType"
              className="text-sm px-2 pb-1 text-black/70"
            >
              Visit Type:
            </label>
            <select
              id="VisitType"
              className="bg-black/10 w-[80%] p-2  rounded-2xl outline-none text-black"
              name="visit Type"
              required
              value={VisitType}
              onChange={(e) => setVisitType(e.target.value)}
            >
              <option value="" disabled hidden>
                Select Visit Type
              </option>
              <option value="OPD">OPD</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div className=" col-span-2 flex space-x-6 pt-4">
            <button
              className="bg-gradient-to-r w-1/2 p-2  from-[#BBF6AB] to-[#36F5D4]  shadow-2xl  rounded-2xl"
              onClick={() => addToQueue()}
            >
              Add To Queue
            </button>
            <button
              className="bg-gradient-to-r w-1/2 p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
              onClick={(e) => {
                UpdateInfo();
                e.preventDefault();
              }}
            >
              Update Info
            </button>
            <button
              className="bg-gradient-to-r w-1/2 p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
              onClick={() => resetInfo()}
            >
              Reset Info
            </button>

       
            {/* Print Html here... */}
            <div
              ref={contentRef}
              className="hidden print:block p-4 bg-white text-black w-[80mm]" // 80mm = receipt width
            >
              {/* Header */}
              <div className="text-center border-b pb-2 mb-2">
                <h1 className="text-lg font-bold">🏥 Dr Bablu Clinic</h1>
                <p className="text-xs text-gray-600">Patient Queue Slip</p>
              </div>

              {/* Token Number Big */}
              <div className="text-center my-4">
                <p className="text-sm font-semibold">Clinic No</p>
                <p className="text-4xl font-extrabold">{clinicNo}</p>
              </div>

              {/* Patient Info */}
              <div className="text-sm space-y-1 flex flex-col items-center border-t">
                <p>
                  <span className="font-semibold">Patient ID:</span> P000{pId}
                </p>
                <p>
                  <span className="font-semibold">Name:</span> {patientName}
                </p>
                <p>
                  <span className="font-semibold">Age/Gender:</span> {age} /{" "}
                  {gender}
                </p>
                <p>
                  <span className="font-semibold">Visit Type:</span> {VisitType}
                </p>
                <p>
                  <span className="font-semibold">Reason:</span> {visitReason}
                </p>
                <p>
                  <span className="font-semibold">Doctor:</span>
                  {doctors.find((d: any) => d.doctor_id === doctor)
                    ?.doctor_name || "N/A"}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 text-center text-xs border-t pt-2">
                <p>Please present this slip at reception</p>
                <p suppressHydrationWarning>{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
