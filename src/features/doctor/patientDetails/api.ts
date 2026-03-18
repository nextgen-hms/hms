import {
  DoctorProfile,
  PatientContextSummary,
  RecentPrescription,
  RecentVisit,
  VisitInfo,
} from "./types";

export async function fetchDoctorProfile(): Promise<DoctorProfile> {
  const res = await fetch("/api/doctor/me");
  if (!res.ok) throw new Error("Failed to fetch doctor profile");
  return res.json();
}

export async function fetchPatientContextSummary(
  patientId: string
): Promise<PatientContextSummary> {
  const res = await fetch(`/api/doctor/patient-context/${patientId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to fetch patient context");
  }
  return res.json();
}

export async function patchVisitInfo(
  visitId: string,
  visit: Partial<Pick<VisitInfo, "reason" | "visit_type" | "clinic_number">>
): Promise<VisitInfo> {
  const res = await fetch(`/api/doctor/visit/${visitId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(visit),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to update visit");
  }

  return res.json();
}

export async function updateVisitStatus(
  visitId: string,
  status: "waiting" | "seen_by_doctor"
): Promise<{ visit: VisitInfo }> {
  const res = await fetch(`/api/doctor/visit/${visitId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to update visit status");
  }

  return res.json();
}

export async function fetchPastVisits(patientId: string): Promise<RecentVisit[]> {
  const res = await fetch(`/api/doctor/past-visits/${patientId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to fetch visit history");
  }

  return res.json();
}

export async function fetchPreviousPrescriptions(
  patientId: string
): Promise<RecentPrescription[]> {
  const res = await fetch(`/api/doctor/prescriptions/${patientId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to fetch prescription history");
  }

  return res.json();
}
