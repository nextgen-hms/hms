import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock, getCurrentStaffIdMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  getCurrentStaffIdMock: vi.fn(() => 1),
}));

vi.mock("@/database/db", () => ({
  query: queryMock,
}));

vi.mock("@/src/lib/utils", () => ({
  getCurrentStaffId: getCurrentStaffIdMock,
}));

import { POST as printReceipt } from "@/src/app/api/print/receipt/route";

describe("print receipt route", () => {
  beforeEach(() => {
    queryMock.mockReset();
    getCurrentStaffIdMock.mockReset();
    getCurrentStaffIdMock.mockReturnValue(1);
  });

  it("reads receipt items from unified pharmacy_sale_detail rows only", async () => {
    queryMock
      .mockResolvedValueOnce({
        rows: [{
          sale_id: 21,
          handled_by: 1,
          payment_reference: "TXN-001",
          patient_name: "Jane Doe",
        }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            medicine_name: "Metformin",
            generic_name: "Metformin",
            qty: 1,
            unit_price: "50.00",
            discount_percent: "0.00",
            total_price: "50.00",
            is_override: false,
          },
          {
            medicine_name: "Augmentin",
            generic_name: "Amoxicillin",
            qty: 1,
            unit_price: "60.00",
            discount_percent: "0.00",
            total_price: "60.00",
            is_override: true,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await printReceipt({
      json: async () => ({ transactionId: 21, printerName: "Front Desk" }),
    } as any);

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(queryMock.mock.calls[1]?.[0]).toContain("FROM pharmacy_sale_detail psd");
    expect(queryMock.mock.calls.some((call) => String(call[0]).includes("pharmacy_sale_override_detail"))).toBe(false);
  });
});

