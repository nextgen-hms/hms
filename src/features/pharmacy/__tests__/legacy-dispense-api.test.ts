import { describe, expect, it } from "vitest";

import { POST as postLegacyDispense } from "@/src/app/api/medicine/dispenseMedicine/route";
import { GET as getLegacyDispenseCurrentMeds } from "@/src/app/api/medicine/dispenseMedicine/currentMeds/[patientId]/route";

describe("legacy dispense APIs", () => {
  it("rejects the retired dispense endpoint", async () => {
    const response = await postLegacyDispense({} as any);
    const body = await response.json();

    expect(response.status).toBe(410);
    expect(body.error).toContain("retired");
    expect(body.error).toContain("/api/transactions");
  });

  it("rejects the retired current meds endpoint", async () => {
    const response = await getLegacyDispenseCurrentMeds({} as any, {
      params: Promise.resolve({ patientId: "123" }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(410);
    expect(body.error).toContain("retired");
  });
});
