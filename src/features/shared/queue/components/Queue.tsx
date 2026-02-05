"use client";
import { useQueue } from "../hooks/useQueue";
import { usePatient } from "@/contexts/PatientIdContext";
import { Search } from "lucide-react";

export function Queue() {
  const { setPatientId } = usePatient();
  const {
    queue,
    loading,
    selectedQueue,
    setSelectedQueue,
    filterByName,
    deleteVisit,
  } = useQueue();

  return (
    <div className="h-full p-2 space-y-2 border-black/30 rounded-3xl shadow-2xl">
      {/* Queue Filters */}
      <div className="p-2 border-2 border-black/30 rounded-4xl flex items-center">
        {["ALL", "OPD", "Emergency"].map((type) => (
          <button
            key={type}
            className={`px-4 ${
              selectedQueue === type
                ? "bg-green-400 rounded-3xl border-black/30 border-2"
                : ""
            }`}
            onClick={() => setSelectedQueue(type as any)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center">
        <div className="bg-gray-200 p-2 rounded-tl-2xl rounded-bl-2xl">
          <Search />
        </div>
        <input
          type="text"
          className="bg-gray-200 p-2 rounded-2xl rounded-bl-none rounded-tl-none w-full"
          placeholder="Search patient..."
          onChange={(e) => filterByName(e.target.value)}
        />
      </div>

      {/* Queue List */}
      <div className="flex flex-col p-2 space-y-2 h-[670px] custom-scrollbar overflow-auto border-2 border-black/30 rounded-2xl">
        {loading ? (
          <p className="text-center text-gray-500">Loading queue...</p>
        ) : queue.length === 0 ? (
          <p className="text-center text-gray-400">No patients in queue</p>
        ) : (
          queue.map((p) => (
            <div
              key={p.patient_id}
              className="hover:bg-white bg-gray-200 p-2 relative border-1 border-black/30 rounded-2xl shadow-2xl cursor-pointer"
              onClick={() => setPatientId(p.patient_id)}
            >
              <span
                className="absolute right-4 top-2 h-6 w-6 text-sm grid place-items-center hover:bg-red-800 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteVisit(p.patient_id);
                }}
              >
                ✖
              </span>
              <p className="text-center">
                <strong>Patient:</strong> {p.patient_name}
              </p>
              <p className="text-center">
                <strong>Clinic:</strong> {p.clinic_number}
              </p>
              <p className="text-center">
                <strong>Doctor:</strong> {p.doctor_name}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
