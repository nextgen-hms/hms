import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock, getAuthenticatedDoctorMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  getAuthenticatedDoctorMock: vi.fn(),
}));

vi.mock("@/database/db", () => ({
  query: queryMock,
}));

vi.mock("@/src/lib/server/doctor", () => ({
  getAuthenticatedDoctor: getAuthenticatedDoctorMock,
}));

import { GET as getPatientContext } from "@/src/app/api/doctor/patient-context/[patientId]/route";

describe("doctor patient context api", () => {
  beforeEach(() => {
    queryMock.mockReset();
    getAuthenticatedDoctorMock.mockReset();
    getAuthenticatedDoctorMock.mockResolvedValue({
      doctor_id: 7,
      doctor_name: "Dr. Ahmed Khan",
      specialization: "General Medicine",
      user_code: "DR7",
      role: "Doctor",
    });
  });

  it("returns a shared patient context summary with visit-aware women health data", async () => {
    queryMock
      .mockResolvedValueOnce({
        rows: [
          {
            visit_id: 44,
            patient_id: 1,
            doctor_id: 7,
            visit_timestamp: "2026-03-18T12:30:00.000Z",
            visit_type: "OPD",
            clinic_number: 101,
            status: "waiting",
            reason: "Follow up",
            doctor_name: "Dr. Ahmed Khan",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            patient_id: 1,
            patient_name: "Alice Johnson",
            age: 28,
            gender: "Female",
            cnic: "11111-1111111-1",
            contact_number: "03001234567",
            address: "Model Town",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ visit_id: 44, blood_pressure: "120/80" }] })
      .mockResolvedValueOnce({ rows: [{ cycle_length_days: 28, menstrual_regular: "Regular" }] })
      .mockResolvedValueOnce({ rows: [{ gravida: 2, para: 1, abortions: 0 }] })
      .mockResolvedValueOnce({ rows: [{ gestational_age_weeks: 20, complications: "None" }] });

    const response = await getPatientContext({} as any, {
      params: Promise.resolve({ patientId: "1" }),
    } as any);

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queryMock.mock.calls[0]?.[0]).toContain("v.status not in ('completed', 'discharged')");
    expect(queryMock.mock.calls[5]?.[0]).toContain("where visit_id = $1");
    expect(body.patient.contact_number).toBe("03001234567");
    expect(body.womenHealthSummary.obstetricHistory.gravida).toBe(2);
    expect(body.womenHealthSummary.currentPregnancy.gestational_age_weeks).toBe(20);
  });

  it("returns null women health summary when no specialty intake exists", async () => {
    queryMock
      .mockResolvedValueOnce({
        rows: [
          {
            visit_id: 44,
            patient_id: 1,
            doctor_id: 7,
            visit_timestamp: "2026-03-18T12:30:00.000Z",
            visit_type: "OPD",
            clinic_number: 101,
            status: "waiting",
            reason: "Follow up",
            doctor_name: "Dr. Ahmed Khan",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            patient_id: 1,
            patient_name: "Alice Johnson",
            age: 28,
            gender: "Female",
            cnic: null,
            contact_number: null,
            address: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await getPatientContext({} as any, {
      params: Promise.resolve({ patientId: "1" }),
    } as any);

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.womenHealthSummary).toBeNull();
    expect(body.vitals).toBeNull();
  });
});
