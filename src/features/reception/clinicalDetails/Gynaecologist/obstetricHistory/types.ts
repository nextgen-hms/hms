import { z } from "zod";

// ---------------------------
// Zod schema for validation
// ---------------------------
export const ObstetricHistorySchema = z.object({
  patient_id: z.string(),
  is_first_pregnancy: z.string(),
  married_years: z.string(),
  gravida: z.string(),
  para: z.string(),
  abortions: z.string(),
  edd: z.string(),
  last_menstrual_cycle: z.string(),
  notes: z.string(),
});

// ---------------------------
// TypeScript type inferred
// ---------------------------
export type ObstetricHistoryFormData = z.infer<typeof ObstetricHistorySchema>;
