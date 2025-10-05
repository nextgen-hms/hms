

export type OptionType = { value: string; label: string };

export type LabTest = {
  test_id: string;
  test_name: string;
  category: string;
  price: number;
};

export type LabOrderFormValues = {
  tests: {
    category: OptionType | null;
    test: OptionType | null;
  }[];
};
