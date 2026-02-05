// features/reception/patientRegistration/obstetricHistory/types.ts

export type ParaDetail = {
  obstetric_history_id?: string | number;
  para_number?: string | number;
  birth_year?: string | number;
  birth_month?: string | number;
  gender?: string;
  delivery_type?: string;
  alive?: string;
  birth_weight_grams?: string | number;
  complications?: string;
  notes?: string;
  gestational_age_weeks?: string | number;
};

export type ParaDetailsFormType = {
  para: ParaDetail[];
};
