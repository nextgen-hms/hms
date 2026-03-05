import { z } from "zod";

export const patientSchema = z.object({
  patient_name: z.string().min(3, "Enter at least 3 characters"),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Select Gender"),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, "Format: XXXXX-XXXXXXX-X"),
  contact_number: z.string().optional(),
  address: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

export interface PatientRecord {
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  cnic: string;
  contact_number: string;
  address: string;
}

export interface PatientSearchResult {
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  cnic: string;
  contact_number: string;
}
