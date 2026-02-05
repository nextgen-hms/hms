export interface QueueItem {
  patient_id: string;
  patient_name: string;
  clinic_number: string;
  doctor_name: string;
  visit_type: "OPD" | "Emergency" | "Other";
}
