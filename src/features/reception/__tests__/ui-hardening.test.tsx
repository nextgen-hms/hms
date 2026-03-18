import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  value: vi.fn(),
  writable: true,
});

vi.mock("@/src/features/reception/queueManagement/hooks/usePatientForm", () => ({
  usePatientForm: () => ({
    searchQuery: "fatima",
    setSearchQuery: vi.fn(),
    age: "32",
    gender: "Female",
    setGender: vi.fn(),
    visitReason: "",
    setVisitReason: vi.fn(),
    doctor: "",
    setDoctor: vi.fn(),
    visitType: "OPD",
    setVisitType: vi.fn(),
    clinicNo: "101",
    doctors: [],
    patientName: "",
    searchResults: [{ patient_id: "1", patient_name: "Fatima", gender: "Female", age: "32", cnic: "" }],
    highlightedIndex: 0,
    setHighlightedIndex: vi.fn(),
    isExistingVisit: false,
    isSearching: false,
    isProcessing: false,
    getPatientInfo: vi.fn(),
    searchByName: vi.fn(),
    addToQueue: vi.fn(),
    updateInfo: vi.fn(),
    resetInfo: vi.fn(),
    patientId: "1",
    selectedVisitId: "44",
    setPatientId: vi.fn(),
  }),
}));

import { patientSchema } from "@/src/features/reception/patientRegistration/types";
import { PatientForm } from "@/src/features/reception/queueManagement/components/QueueManagement";

describe("reception UI hardening", () => {
  it("allows registration without CNIC", () => {
    const parsed = patientSchema.safeParse({
      patient_name: "Walk In Patient",
      age: "26",
      gender: "Female",
      contact_number: "",
      address: "",
    });

    expect(parsed.success).toBe(true);
  });

  it("renders queue search results without nested buttons", () => {
    const { container } = render(<PatientForm />);

    expect(container.querySelector("button button")).toBeNull();
    expect(container.textContent).toContain("ENTER");
  });
});
