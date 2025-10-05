
"use client";
import { usePatientForm } from "../hooks/usePatientForm";

export default function PatientForm() {
  const {
    pId, setpId, patientInfo, visitInfo, doctors,
    isChecked, setIsChecked, setPatientId,
    updateVisitInfo, updateVisitStatus
  } = usePatientForm();

  return (
    <div className="w-full h-full border-black/30 rounded-4xl p-4">
      <div className="w-2/3 grid grid-cols-2 gap-4">
        {/* Patient ID Input */}
        <div className="flex flex-col">
          <label htmlFor="patientId" className="text-sm px-2 pb-1 text-black/70">Patient Id :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            id="patientId"
            type="text"
            placeholder="Enter existing Patient Id"
            value={pId}
            onChange={(e) => setpId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPatientId(pId);
                e.preventDefault();
              }
            }}
          />
        </div>

        {/* Patient Name */}
        <div className="flex flex-col">
          <label className="text-sm px-2 pb-1 text-black/70">Patient Name :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            value={patientInfo?.patient_name || ""}
            readOnly
          />
        </div>

        {/* Age */}
        <div className="flex flex-col">
          <label className="text-sm px-2 pb-1 text-black/70">Age :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            value={patientInfo?.age || ""}
            readOnly
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col">
          <label className="text-sm px-2 pb-1 text-black/70">Gender :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            value={patientInfo?.gender || ""}
            readOnly
          />
        </div>

        {/* Visit Reason */}
        <div className="flex flex-col">
          <label className="text-sm px-2 pb-1 text-black/70">Visit Reason :</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            value={visitInfo?.reason || ""}
            onChange={(e) => updateVisitInfo({ reason: e.target.value })}
          />
        </div>

        {/* Doctor Selection */}
        <div className="flex flex-col">
          <label className="text-sm px-2 pb-1 text-black/70">Select Doctor :</label>
          <select
            className="bg-black/10 w-[80%] p-2 rounded-2xl"
            value={visitInfo?.doctor_id || ""}
            onChange={(e) => updateVisitInfo({ doctor_id: e.target.value })}
          >
            <option value="" disabled hidden>Select Doctor</option>
            {doctors.map((d) => (
              <option key={d.doctor_id} value={d.doctor_id}>{d.doctor_name}</option>
            ))}
          </select>
        </div>

        {/* Visit Type */}
        <div className="flex flex-col">
          <label className="text-sm px-2 pb-1 text-black/70">Visit Type:</label>
          <input
            className="bg-gray-200 rounded-2xl w-[80%] p-2"
            value={visitInfo?.visit_type || ""}
            onChange={(e) => updateVisitInfo({ visit_type: e.target.value })}
          />
        </div>

        {/* Patient Status */}
        <div className="flex items-center col-span-2 w-[40%] bg-gray-200 rounded-2xl py-1">
          <label className="text-lg px-2 text-black">Patient Status :</label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => updateVisitStatus(e.target.checked)}
            className="h-2/3 w-1/5 rounded-2xl"
          />
          <span className={`${isChecked ? "bg-green-300" : "bg-yellow-300"} py-1 px-3 rounded-xl text-center`}>
            {isChecked ? "seen" : "waiting"}
          </span>
        </div>

        {/* Update Info Button */}
        <div className="flex space-x-6 pt-4 col-span-2">
          <button
            className="bg-gradient-to-r w-1/2 p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
            onClick={() => updateVisitInfo({})}
          >
            Update Info
          </button>
        </div>
      </div>
    </div>
  );
}
