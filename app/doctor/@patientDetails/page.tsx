"use client";

import toast from "react-hot-toast";
import { usePatient } from "@/contexts/PatientIdContext";
import { useEffect, useState } from "react";

/**
 * PatientForm Component
 *
 * A form UI for doctors/receptionists to manage a patient's visit details.
 * 
 * Features:
 * - Fetch patient info by patient ID
 * - Fetch visit details for the patient (clinic number, doctor, reason, visit type)
 * - Update visit info (PATCH request)
 * - Manage patient status (seen / waiting)
 * - Fetch list of doctors for selection
 * - Update status of patient  
 */
export default function PatientForm() {
  /**
   * ----------------------------
   * Local State (Form Fields)
   * ----------------------------
   */

  const [pId, setpId] = useState<string>("");              // Patient Id entered by user
  const [patientName, setPatientName] = useState<string>(""); // Patient name
  const [age, setAge] = useState<string>("");              // Patient age
  const [gender, setGender] = useState<string>("");        // Patient gender
  const [visitReason, setVisitReason] = useState<string>(""); // Reason for visit
  const [doctor, setDoctor] = useState<string>("");        // Selected doctor id
  const [VisitType, setVisitType] = useState<string>("");  // Visit type (OPD / Emergency)
  const [clinicNo, setClinicNo] = useState<string>("");    // Clinic number
  const [visitId,setVisitId]=useState<string>("");
  /**
   * ----------------------------
   * Global Context
   * ----------------------------
   */
  const { patientId, setPatientId } = usePatient(); // Shared patient ID across app

  /**
   * ----------------------------
   * Other State
   * ----------------------------
   */
  const [Ischecked, setIsChecked] = useState(false); // Patient status: seen / waiting
  const [doctors, setDoctors] = useState<any[]>([]); // List of doctors fetched from API

  /**
   * Fetch patient info when patient ID is entered.
   */
  useEffect(() => {
    setPatientName("");
    setAge("");
    setClinicNo("");
    setGender("");
    setDoctor("");
    setVisitReason("");
    setVisitType("");
    setIsChecked(false)
   if (patientId) {
    setpId(patientId);
    fetchData();
  }
    //-------problem---
    //if doctor comes from other pages to this page again with change patient id this can fetch info stored in old pid 
    async function fetchData() {
    await getPatientInfo();
  }
 
  }, [patientId]);

  /**
   * Fetch all doctors on mount.
   */
  useEffect(() => {
    async function fetchDoctors() {
      const res = await fetch("api/doctor/getAllDoctors");
      const docs = await res.json();
      setDoctors(docs);
    }
    fetchDoctors();
  }, []);

  /**
   * Fetch patient details by patient id and update state.
   */
  async function getPatientInfo() {
    const res = await fetch(`api/patient/${patientId}`);
    const data = await res.json();
    console.log(data);
    
    if(!res.ok) return;
    setPatientName(data.patient_name || "");
    setAge(data.age);
    setGender(data.gender);

    if (data.patient_name) toast.success("Patient Found");

    // Also fetch today's visit details for this patient
    getPatientVisitInfo(data.patient_name, data.age);
  }

  /**
   * Fetch visit details for the patient and update state.
   *
   * @param patient_name - Patient's name
   * @param age - Patient's age
   */
  async function getPatientVisitInfo(patient_name: string, age: string) {
    if (patient_name && age) {
      const res = await fetch(`api/visit/${patientId}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error("No visit found for today");
        return;
      }

      if (res.ok) {
      
        if (data.clinic_number) {
          // Populate fields with visit info
          setVisitId(data.visit_id);
          setVisitReason(data.visitReason);
          setDoctor(data.doctor_id);
          setVisitType(data.visit_type);
          setClinicNo(data.clinic_number || " ");
          setVisitReason(data.reason);
        } else {
          // Reset fields if no visit found
          toast.error("No visit found for today");
          setVisitReason("");
          setVisitType("");
          setDoctor("");
        }
      }
    }
  }

  /**
   * Update visit information for the patient.
   */
  async function UpdateInfo() {
    const res = await fetch("api/visit", {
      method: "PATCH",
      body: JSON.stringify({
        clinic_number: clinicNo,
        reason: visitReason,
        doctor_id: doctor,
        visit_type: VisitType,
        status: Ischecked ? "seen" : "waiting",
        patient_id: patientId,
      }),
    });

    if (res.ok) {
      toast.success(`P000${patientId} info updated`);
    } else {
      toast.error(`P000${patientId} info not updated`);
    }
  }

  async function updateVisitStatus(status:boolean){


      try{
        const res_status= await fetch('api/visit/status',{
          method:"PATCH",
          body:JSON.stringify({
            visit_id:visitId,
            status: status ? "seen_by_doctor" : "waiting"
          })
        })
        console.log(await res_status.json());

        if(!res_status.ok) {
          toast.error("failed to update status");
          return;
        }
        else{
          toast.success("status updated")
        }
        const res= await fetch('api/visit/visitStatusHistory',{
          method:"POST",
          body:JSON.stringify({
            visit_id:visitId,
            status: status ? "seen_by_doctor" : "waiting",
            updated_by_doctor:doctor,
            updated_by_staff:null
          })
        })
        console.log(await res.json());
        if(!res.ok){
          toast.error("failed to add visit Status History");
          return;
        }else{
          toast.success("visit status history updated");
        }
       
      }catch(err){
        console.log(err);
        
      }
       
  }

  /**
   * ----------------------------
   * JSX (UI Markup)
   * ----------------------------
   */
  return (
    <div className="w-full h-full border-black/30 rounded-4xl">
      <div className="w-2/3 p-4 grid grid-cols-2 space-y-5 rounded-2xl border-black/30">
        
        {/* Patient ID Field */}
        <div className="flex flex-col">
          <label htmlFor="patientId" className="text-sm px-2 pb-1 text-black/70">Patient Id :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            id="patientId"
            type="text"
            placeholder="Enter existing Patient Id"
            onChange={(e) => setpId(e.target.value)}
            value={pId}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                //updating patient id 
                setPatientId(pId);
                e.preventDefault();
                // if(patientId){
                //   getPatientInfo();
                // }
              }
            }}
          />
        </div>

        {/* Clinic Number Field */}
        <div className="flex flex-col">
          <label htmlFor="clinicNo" className="text-sm px-2 pb-1 text-black/70">Clinic No :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            id="clinicNo"
            type="text"
            placeholder="Clinic Number"
            onChange={(e) => setClinicNo(e.target.value)}
            value={clinicNo}
          />
        </div>

        {/* Patient Name */}
        <div className="flex flex-col">
          <label htmlFor="patientName" className="text-sm px-2 pb-1 text-black/70">Patient Name :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            id="patientName"
            type="text"
            placeholder="Patient Name"
            onChange={(e) => setPatientName(e.target.value)}
            value={patientName}
          />
        </div>

        {/* Age */}
        <div className="flex flex-col">
          <label htmlFor="age" className="text-sm px-2 pb-1 text-black/70">Age :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            id="age"
            type="text"
            placeholder="Patient Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col">
          <label htmlFor="gender" className="text-sm px-2 pb-1 text-black/70">Gender :</label>
          <select
            id="gender"
            className="bg-black/10 w-[80%] p-2 rounded-2xl outline-none text-black"
            name="Gender"
            required
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Visit Reason */}
        <div className="flex flex-col">
          <label htmlFor="visitReason" className="text-sm px-2 pb-1 text-black/70">Visit Reason :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            id="visitReason"
            type="text"
            placeholder="Visit Reason"
            value={visitReason}
            onChange={(e) => setVisitReason(e.target.value)}
          />
        </div>

        {/* Doctor Selection */}
        <div className="flex flex-col">
          <label htmlFor="Doctor" className="text-sm px-2 pb-1 text-black/70">Select Doctor :</label>
          <select
            id="Doctor"
            className="bg-black/10 w-[80%] p-2 rounded-2xl outline-none text-black"
            name="Doctors"
            required
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
          >
            <option value="" disabled hidden>Select Doctor</option>
            {doctors.map((d: any) => (
              <option key={d.doctor_id} value={d.doctor_id}>
                {d.doctor_name}
              </option>
            ))}
          </select>
        </div>

        {/* Visit Type */}
        <div className="flex flex-col">
          <label htmlFor="VisitType" className="text-sm px-2 pb-1 text-black/70">Visit Type:</label>
          <select
            id="VisitType"
            className="bg-black/10 w-[80%] p-2 rounded-2xl outline-none text-black"
            name="visit Type"
            required
            value={VisitType}
            onChange={(e) => setVisitType(e.target.value)}
          >
            <option value="OPD">OPD</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        {/* Patient Status */}
        <div className="flex col-span-2 w-[40%] items-center bg-gray-200 rounded-2xl py-1">
          <label htmlFor="patientSeen" className="text-lg px-2 pb-1 text-black">Patient Status :</label>
          <input
            id="patientSeen"
            type="checkbox"
            checked={Ischecked}
            onChange={(e) => {
              setIsChecked(e.target.checked)
              updateVisitStatus(e.target.checked)
            }}
            className="h-2/3 w-1/5 rounded-2xl"
          />
          <span className={`${Ischecked ? "bg-green-300 px-3" : "bg-yellow-300"} py-1 px-1 rounded-xl text-center`}>
            {Ischecked ? "seen" : "waiting"}
          </span>
        </div>

        {/* Update Info Button */}
        <div className="flex space-x-6 pt-4">
          <button
            className="bg-gradient-to-r w-1/2 p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
            onClick={() => UpdateInfo()}
          >
            Update Info
          </button>
        </div>
      </div>
    </div>
  );
}
