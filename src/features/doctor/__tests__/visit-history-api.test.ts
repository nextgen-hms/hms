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

import { GET as getVisitContext } from "@/src/app/api/doctor/visit/[visitId]/route";
import { GET as getVisitHistory } from "@/src/app/api/doctor/history/patient/[patientId]/visits/route";
import { GET as getPrescriptionHistory } from "@/src/app/api/doctor/history/patient/[patientId]/prescriptions/route";
import { GET as getLabOrderHistory } from "@/src/app/api/doctor/history/patient/[patientId]/lab-orders/route";

describe("doctor visit and history apis", () => {
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

  it("returns visit-explicit doctor context for the selected visit", async () => {
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
      .mockResolvedValueOnce({
        rows: [
          {
            visit_id: 44,
            patient_id: 1,
            doctor_id: 7,
            reception_complaint: "Follow up",
            doctor_note: "Continue monitoring",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ visit_id: 44, blood_pressure: "120/80" }] })
      .mockResolvedValueOnce({ rows: [{ cycle_length_days: 28, menstrual_regular: "Regular" }] })
      .mockResolvedValueOnce({ rows: [{ gravida: 2, para: 1, abortions: 0 }] })
      .mockResolvedValueOnce({ rows: [{ gestational_age_weeks: 20, complications: "None" }] });

    const response = await getVisitContext({} as any, {
      params: Promise.resolve({ visitId: "44" }),
    } as any);

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queryMock.mock.calls[0]?.[0]).toContain("where v.visit_id = $1");
    expect(body.patient.contact_number).toBe("03001234567");
    expect(body.encounterNote.doctor_note).toBe("Continue monitoring");
    expect(body.womenHealthSummary.obstetricHistory.gravida).toBe(2);
    expect(body.womenHealthSummary.currentPregnancy.gestational_age_weeks).toBe(20);
  });

  it("returns 404 when the selected doctor visit no longer exists", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const response = await getVisitContext({} as any, {
      params: Promise.resolve({ visitId: "999" }),
    } as any);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "Visit not found for this doctor",
    });
  });

  it("returns doctor-scoped visit history with reception complaint ordering", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          visit_id: 44,
          patient_id: 1,
          patient_name: "Alice Johnson",
          age: 28,
          gender: "Female",
          clinic_number: 101,
          doctor_name: "Dr. Ahmed Khan",
          visit_type: "OPD",
          reason: "Reception complaint",
          status: "completed",
          visit_timestamp: "2026-03-18 12:30",
        },
      ],
    });

    const response = await getVisitHistory({} as any, {
      params: Promise.resolve({ patientId: "1" }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queryMock.mock.calls[0]?.[0]).toContain("order by v.visit_timestamp desc, v.visit_id desc");
    expect(body[0].reason).toBe("Reception complaint");
  });

  it("returns prescription history with persisted dosage on the renamed route", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          prescription_id: 11,
          prescription_medicine_id: 99,
          order_date: "2026-03-12",
          brand_name: "Panadol",
          generic_name: "Paracetamol",
          dosage: "1 tablet",
          frequency: "BD",
          duration: "5 days",
        },
      ],
    });

    const response = await getPrescriptionHistory({} as any, {
      params: Promise.resolve({ patientId: "1" }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body[0].dosage).toBe("1 tablet");
  });

  it("returns lab history with stored urgency/status and deterministic ordering", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          order_id: 23,
          order_date: "2026-03-12",
          test_name: "CBC",
          urgency: "Urgent",
          status: "Pending",
        },
      ],
    });

    const response = await getLabOrderHistory({} as any, {
      params: Promise.resolve({ patientId: "1" }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queryMock.mock.calls[0]?.[0]).toContain("order by v.visit_timestamp desc, lo.order_id desc");
    expect(body[0]).toMatchObject({
      urgency: "Urgent",
      status: "Pending",
    });
  });
});
