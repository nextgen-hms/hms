export type LabTest = {
  test_id: string;
  test_name: string;
  category: string;
  price: number;
};

export type LabOrderFormValues = {
  tests: {
    test_id: string;
    test_name: string;
    category: string;
    price: number;
  }[];
};
