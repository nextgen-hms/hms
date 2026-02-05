import { z } from "zod";

export const MenstrualHistorySchema = z.object({
  patient_id: z.string(),
  menarch_age: z.string(),
  cycle_length_days: z.string(),
  bleeding_days: z.string(),
  menstrual_regular: z.string(),
  contraception_history: z.string(),
  gynecologic_surgeries: z.string(),
  medical_conditions: z.string(),
  menopause_status: z.string(),
});

export type MenstrualHistoryFormData = z.infer<typeof MenstrualHistorySchema>;
