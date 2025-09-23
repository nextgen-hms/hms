"use client";
import toast from "react-hot-toast";
import { usePatient } from "@/contexts/PatientIdContext";
import { useEffect, useState } from "react";
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
 const  [Ischecked,setIsChecked]=useState(false);
 const [doctors,setDoctors]=useState([]);
  useEffect(() => {
  if(!pId) return;
   getPatientInfo();
  }, []);

 useEffect(() => {

    async function fetchDoctors() {
      const res = await fetch("api/doctor/getAllDoctors");
      const docs = await res.json();
      console.log(docs);
      setDoctors(docs);
    }
   
    fetchDoctors();
  }, []);
   async function getPatientInfo() {
    const res = await fetch(`api/patient/${pId}`);
    const data = await res.json();

    setPatientName(data.patient_name);
    setAge(data.age);
    setGender(data.gender);
    if (data.patient_name) toast.success("patient Found");
    getPatientVisitInfo(data.patient_name, data.age);
  }
  async function getPatientVisitInfo(patient_name: string, age: string) {
    if (patient_name && age) {
      const res = await fetch(`api/visit/${pId}`);
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

 
  return (
    <>
      <div className="w-full h-full  border-black/30 rounded-4xl  ">
        <div className=" w-2/3 p-4 grid grid-cols-2  space-y-5  rounded-2xl border-black/30 ">
        
          <div className="flex flex-col ">
            <label htmlFor="patientId" className="text-sm px-2 pb-1 text-black/70">Patient Id :</label>
            <input
              className="bg-gray-200 rounded-2xl  w-[80%] p-2  "
              id="patientId"
              type="text"
              placeholder="Enter existing Patient Id"
              onChange={(e) => setpId(e.target.value)}
              value={pId}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPatientId(pId)
                  e.preventDefault();
                  getPatientInfo();
                }
              }}
            />
          </div>
          <div className="flex flex-col ">
            <label htmlFor="clinicNo" className="text-sm px-2 pb-1 text-black/70">Clinic No :</label>
            <input
              className="bg-gray-200 rounded-2xl  w-[80%] p-2    "
              id="clinicNo"
              type="text"
              placeholder="Clinic Number"
              onChange={(e) => setClinicNo(e.target.value)}
              value={clinicNo}
            />
          </div>
          <div className="flex flex-col ">
            <label htmlFor="patientName" className="text-sm px-2 pb-1 text-black/70">Patient Name :</label>
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
            <label htmlFor="age" className="text-sm px-2 pb-1 text-black/70">Age :</label>
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
            <label htmlFor="gender" className="text-sm px-2 pb-1 text-black/70">Gender :</label>
            <select
              id="gender"
              className="bg-black/10 w-[80%] p-2  rounded-2xl outline-none text-black "
              name="Gender"
              required
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
             
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="flex flex-col ">
            <label htmlFor="visitReason" className="text-sm px-2 pb-1 text-black/70">Visit Reason :</label>
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
            <label htmlFor="Doctor" className="text-sm px-2 pb-1 text-black/70">Select Doctor :</label>
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
            <label htmlFor="VisitType" className="text-sm px-2 pb-1 text-black/70">Visit Type:</label>
            <select
              id="VisitType"
              className="bg-black/10 w-[80%] p-2  rounded-2xl outline-none text-black"
              name="visit Type"
              required
              value={VisitType}
              onChange={(e) => setVisitType(e.target.value)}
            >
              <option value="OPD">OPD</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div className="flex col-span-2 w-[40%] items-center bg-gray-200 rounded-2xl py-1 ">
             <label htmlFor="patientSeen" className="text-lg px-2 pb-1 text-black">Patient Status :</label>
            <input
            id="patientSeen"
            type="checkbox"
            checked={Ischecked}
            onChange={(e)=> setIsChecked(e.target.checked)}
              className="h-2/3 w-1/5 rounded-2xl"
            />
            <span className={`${Ischecked ? "bg-green-300 px-3" : "bg-yellow-300" } py-1 px-1 rounded-xl text-center`}>{Ischecked === true ? "seen":"waiting"}</span>
          </div>
          <div className="  flex space-x-6 pt-4">
            
            <button
              className="bg-gradient-to-r w-1/2 p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
              onClick={() => UpdateInfo()}
            >
              Update Info
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
