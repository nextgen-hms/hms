"use client";
import { usePatient } from "@/contexts/PatientIdContext";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
interface QueueItem {
  patient_id: string;
  patient_name: string;
  clinic_number: string;
  doctor_name: string;
  visit_type: string;
}
export default function Queue() {
  const { patientId, setPatientId } = usePatient();
  const [Alldata, setAllData] = useState<QueueItem[]>([]);
  const [data, setdata] = useState<QueueItem[]>([]);
  const [selectedQueue, setSelectedQueue] = useState("ALL");
  async function getAllQueue() {
    const res = await fetch("api/queue");
    const Qdata = await res.json();
    console.log(Qdata);
    setAllData(Qdata);
  }
  useEffect(() => {
    getAllQueue();

    const interval = setInterval(getAllQueue, 500000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = Alldata;

    if (selectedQueue !== "ALL") {
      filtered = filtered.filter((d) => d.visit_type === selectedQueue);
    }
    setdata(filtered);
  }, [selectedQueue, Alldata]);

  function filterPatients(input: string) {
    if (!input) {
      setdata(Alldata); // reset to all patients
    } else {
      setdata(
        Alldata.filter((d: QueueItem) =>
          d.patient_name.toLowerCase().includes(input.toLowerCase())
        )
      );
    }
  }
  async function deleteVisit(id: string) {
    try {
      const res = await fetch(`/api/visit/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        console.log(res);

        setdata((prev) => prev.filter((d) => d.patient_id !== id));
        setAllData((prev) => prev.filter((d) => d.patient_id !== id));
        toast.success(`patient ${id}  visit delelted`);
      } else {
        console.error("failed to delete");
      }
    } catch (err) {
      console.error("Error deleting visit", err);
    }
  }
  return (
    //delete patient from queue
    <div className=" h-full  p-2 space-y-2   border-black/30   rounded-3xl shadow-2xl   ">
      <div className=" p-2    border-2 border-black/30   rounded-4xl flex items-center ">
        <button
          className={` px-4 text-center ${
            selectedQueue === "ALL"
              ? "bg-green-400 rounded-3xl border-black/30 border-2 "
              : null
          } `}
          onClick={() => {
            setSelectedQueue("ALL");
          }}
        >
          All
        </button>
        <button
          className={` px-4    text-center ${
            selectedQueue === "OPD"
              ? "bg-green-400 rounded-3xl border-black/30 border-2 "
              : null
          }`}
          onClick={() => {
            setSelectedQueue("OPD");
          }}
        >
          OPD
        </button>
        <button
          className={` px-4   text-center ${
            selectedQueue === "Emergency"
              ? "bg-green-400 rounded-3xl border-black/30 border-2 "
              : null
          }`}
          onClick={() => {
            setSelectedQueue("Emergency");
          }}
        >
          Emergency
        </button>
      </div>
      <div className="flex items-center jsutify-center">
        <div className="bg-gray-200  p-2 rounded-tl-2xl rounded-bl-2xl">
          <Search className="" />
        </div>
        <input
          type="text"
          className="bg-gray-200 p-2 rounded-2xl rounded-bl-none rounded-tl-none w-full"
          onChange={(e) => {
            filterPatients(e.target.value);
          }}
          placeholder="Enter Patient id "
        />
      </div>
      <div className=" flex flex-col p-2 space-y-2 h-[670px] custom-scrollbar  overflow-auto border-2 border-black/30  rounded-2xl  ">
        {data.map((d: QueueItem, index) => {
          return (
            <div
              key={`queue-${d.patient_id}`}
              className="   hover:bg-white bg-gray-200 p-2 transform ease-in-out duration-300 relative  border-1 border-black/30 rounded-2xl    shadow-2xl "
              onClick={() => {
                setPatientId(d.patient_id);
              }}
            >
              <span
                className="absolute right-4 top-2  h-6 w-6 text-sm  grid place-items-center hover:bg-red-800 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteVisit(d.patient_id);
                }}
              >
                ✖
              </span>
              <p className="text-black  text-center">
                <strong>Patient Id:</strong> {`${d.patient_id}`}
              </p>
              <p className="text-black  text-center">
                <strong>Patient Name:</strong> {`${d.patient_name}`}
              </p>
              <p className="text-black  text-center">
                <strong>Clinic No:</strong> {`${d.clinic_number}`}
              </p>
              <p className="text-black text-center ">
                <strong>Doctor:</strong> {`${d.doctor_name}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
