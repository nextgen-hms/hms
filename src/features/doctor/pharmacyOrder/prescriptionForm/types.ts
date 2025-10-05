

export type OptionType = { value: string; label: string };

export type Medicine = {
  medicine_id: string;
  category: string;
  generic_name: string;
  brand_name: string;
  dosage_value: number;
  dosage_unit: string;
};

export type Prescription = {
  category: OptionType | null;
  generic: OptionType | null;
  brandName: OptionType | null;
  dosage: OptionType | null;
  instructions: string;
  prescribed_quantity: number;
  dispensed_quantity: number;
  frequency: string;
  duration: string;
  unit: OptionType | null;
};

export type FormValues = {
  prescriptions: Prescription[];
};
