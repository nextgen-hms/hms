import { act, renderHook, waitFor } from "@testing-library/react";
import React, { useEffect } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { PatientContextProvider, usePatient } from "@/contexts/PatientIdContext";
import { usePatientForm } from "@/src/features/reception/queueManagement/hooks/usePatientForm";

const {
  fetchDoctors,
  fetchNewClinicNo,
  fetchPatientInfo,
  fetchPatientVisit,
  updateVisitInfo,
  createVisit,
  searchPatients,
  toastSuccess,
  toastError,
} = vi.hoisted(() => ({
  fetchDoctors: vi.fn(),
  fetchNewClinicNo: vi.fn(),
  fetchPatientInfo: vi.fn(),
  fetchPatientVisit: vi.fn(),
  updateVisitInfo: vi.fn(),
  createVisit: vi.fn(),
  searchPatients: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: toastSuccess,
    error: toastError,
  },
}));

vi.mock("react-to-print", () => ({
  useReactToPrint: () => vi.fn(),
}));

vi.mock("@/src/features/reception/queueManagement/api", () => ({
  fetchDoctors,
  fetchNewClinicNo,
  fetchPatientInfo,
  fetchPatientVisit,
  updateVisitInfo,
  createVisit,
  searchPatients,
}));

function SeedPatientSelection({ patientId }: { patientId: string }) {
  const { setPatientId } = usePatient();

  useEffect(() => {
    setPatientId(patientId);
  }, [patientId, setPatientId]);

  return null;
}

function HookWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PatientContextProvider>
      <SeedPatientSelection patientId="6" />
      {children}
    </PatientContextProvider>
  );
}

describe("queue management patient selection", () => {
  beforeEach(() => {
    fetchDoctors.mockResolvedValue([]);
    fetchNewClinicNo.mockResolvedValue("101");
    fetchPatientInfo.mockResolvedValue({
      patient_id: 6,
      patient_name: "Sarah Connor",
      age: 28,
      gender: "Female",
    });
    fetchPatientVisit.mockRejectedValue(new Error("No visit found for today"));
    updateVisitInfo.mockReset();
    createVisit.mockReset();
    searchPatients.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  it("loads an externally selected patient only once", async () => {
    const { result } = renderHook(() => usePatientForm(), {
      wrapper: HookWrapper,
    });

    await waitFor(() => expect(result.current.patientName).toBe("Sarah Connor"));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 25));
    });

    expect(fetchPatientInfo).toHaveBeenCalledTimes(1);
    expect(fetchPatientVisit).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.searchQuery).toBe("Sarah Connor");
  });
});
