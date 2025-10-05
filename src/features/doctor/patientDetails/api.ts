
import { PatientInfo, VisitInfo, Doctor } from "./types";

export async function fetchPatientInfo(patientId: string): Promise<PatientInfo> {
  const res = await fetch(`api/patient/${patientId}`);
  if (!res.ok) throw new Error("Failed to fetch patient info");
  return await res.json();
}

export async function fetchVisitInfo(patientId: string): Promise<VisitInfo> {
  const res = await fetch(`api/visit/${patientId}`);
  if (!res.ok) throw new Error("No visit found for today");
  return await res.json();
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const res = await fetch("api/doctor/getAllDoctors");
  if (!res.ok) throw new Error("Failed to fetch doctors");
  return await res.json();
}

export async function patchVisitInfo(visit: Partial<VisitInfo> & { patient_id: string }) {
  const res = await fetch("api/visit", {
    method: "PATCH",
    body: JSON.stringify(visit),
  });
  if (!res.ok) throw new Error("Failed to update visit info");
  return await res.json();
}

export async function updateVisitStatusAPI(visit_id: string, status: string, updated_by_doctor: string) {
  // Update visit status
  const res_status = await fetch("api/visit/status", {
    method: "PATCH",
    body: JSON.stringify({ visit_id, status }),
  });
  if (!res_status.ok) throw new Error("Failed to update status");

  // Add status history
  const res_history = await fetch("api/visit/visitStatusHistory", {
    method: "POST",
    body: JSON.stringify({ visit_id, status, updated_by_doctor, updated_by_staff: null }),
  });
  if (!res_history.ok) throw new Error("Failed to add visit status history");

  return { statusUpdated: true };
}
