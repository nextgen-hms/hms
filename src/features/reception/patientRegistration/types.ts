import { z } from "zod";

export const patientSchema = z.object({
  patient_id: z.string().min(1, "Patient Id is required"),
  patient_name: z.string().min(3, "Name cannot be too short"),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Select Gender"),
  cnic: z.string().regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, "Invalid CNIC"),
  contact_number: z.string().optional(),
  address: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
