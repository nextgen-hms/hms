

export type Visit = {
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  clinicNo: string;
  doctor: string;
  status: string;
  visitReason: string;
  visitType: string;
};

export type Prescription = {
  patientId: string;
  orderDate: string;
  category: string;
  generic: string;
  brandName: string;
  dose: string;
  frequency: string;
  duration: string;
  unit: string;
  quantity:string;
  prescribedBy: string;
};
