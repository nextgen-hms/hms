export type Test={
  test_id:number;
  test_name:string;
  category:string;
  price:number;
  description:string;
}

export type TestParameters={
  parameter_id:number;
  test_id:number;
  parameter_name:string;
  parameter_code:string;
  unit:string;
  input_type:string;
  reference_range_min:number;
  reference_range_max:number;
  reference_value_text:string;
  display_order:number;
  is_critical:boolean;
  is_required:boolean;
}

export type LabResult={
  result_id:number;
  order_id:number;
  parameter_id:number;
  result_value:number;
  is_abnormal:boolean;
  technician_notes:string;
  entered_by:number;
  verified_by:number;
}