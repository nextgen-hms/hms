import { z } from "zod";

export const CurrentPregnancySchema = z.object({
  patient_id: z.string(),
  visit_id: z.string(),
  multiple_pregnancy: z.string(),
  complications: z.string(),
  ultrasound_findings: z.string(),
  fetal_heart_rate_bpm: z.string(),
  placenta_position: z.string(),
  presentation: z.string(),
  gestational_age_weeks: z.string(),
  notes: z.string(),
});

export type CurrentPregnancyFormData = z.infer<typeof CurrentPregnancySchema>;
