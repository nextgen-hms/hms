// features/patient-registration/types.ts
export type Doctor = {
  doctor_id: string;
  doctor_name: string;
};

export type Patient = {
  patient_id: string;
  patient_name: string;
  age: string;
  gender: string;
  cnic?: string;
};

export type Visit = {
  clinic_number: string;
  reason: string;
  doctor_id: string;
  visit_type: string;
};
