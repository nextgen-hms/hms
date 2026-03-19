import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NewLabOrderForm from "@/src/features/doctor/labOrder/orderForm/components/NewLabOrderForm";

const { mockUsePatient, mockUseDoctorWorkspace, mockUseLabOrderForm } = vi.hoisted(() => ({
  mockUsePatient: vi.fn(),
  mockUseDoctorWorkspace: vi.fn(),
  mockUseLabOrderForm: vi.fn(),
}));

vi.mock("@/contexts/PatientIdContext", () => ({
  usePatient: () => mockUsePatient(),
}));

vi.mock("@/src/features/doctor/workspace/DoctorWorkspaceContext", () => ({
  useDoctorWorkspace: () => mockUseDoctorWorkspace(),
}));

vi.mock("@/src/features/doctor/labOrder/orderForm/hooks/useLabOrderForm", () => ({
  useLabOrderForm: () => mockUseLabOrderForm(),
}));

describe("doctor labs workspace", () => {
  beforeEach(() => {
    mockUsePatient.mockReturnValue({
      patientId: "1",
      selectedVisitId: "47",
    });
    mockUseDoctorWorkspace.mockReturnValue({
      staleVisitSelection: null,
      selectedVisitStatus: "waiting",
    });
    mockUseLabOrderForm.mockReturnValue({
      handleSubmit: (handler: (values: unknown) => void) => (event: { preventDefault?: () => void }) => {
        event.preventDefault?.();
        return handler({ tests: [] });
      },
      searchQuery: "",
      setSearchQuery: vi.fn(),
      filteredTests: [],
      fields: [],
      watchTests: [],
      addTest: vi.fn(),
      remove: vi.fn(),
      clearTests: vi.fn(),
      isDraftValid: false,
      isVisitActionable: true,
      selectedTestIds: new Set<string>(),
      onSubmit: vi.fn(),
      isSubmitting: false,
    });
  });

  it("shows an explicit blocked state when the selected lab visit is stale", () => {
    mockUseDoctorWorkspace.mockReturnValue({
      staleVisitSelection: {
        visitId: "47",
        message: "The selected visit is no longer in your queue.",
      },
      selectedVisitStatus: null,
    });

    render(<NewLabOrderForm />);

    expect(screen.getByText("Lab ordering is blocked")).toBeTruthy();
    expect(screen.getByText(/no longer in your queue/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit Lab Order" })).toBeNull();
  });
});
