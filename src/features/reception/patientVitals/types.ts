// features/patient-vitals/types.ts
export type PatientVitals = {
  visit_id: string;
  patient_id?: string;
  blood_pressure?: string;
  heart_rate?: string;
  temperature?: string;
  weight?: string;
  height?: string;
  blood_group?: string;
};
