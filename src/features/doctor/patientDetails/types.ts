
export type PatientInfo = {
  patient_id: string;
  patient_name: string;
  age: string;
  gender: string;
};

export type VisitInfo = {
  visit_id: string;
  patient_id: string;
  clinic_number: string;
  doctor_id: string;
  visit_type: string;
  reason: string;
  status: string;
};

export type Doctor = {
  doctor_id: string;
  doctor_name: string;
};
