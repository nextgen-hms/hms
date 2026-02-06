export interface Medicine {
  id: number;
  generic_name: string;
  brand_name: string;
  category: string;
  dosage_value: number;
  dosage_unit: string;
  form: string;
  stock_quantity: number;
  price: number;
  barcode?: string;
  sku?: string;
  manufacturer?: string;
  expiry_date?: string;
  min_stock_level: number;
  max_stock_level: number;
  is_active: boolean;
  requires_prescription: boolean;

  // Batch specific fields
  batch_id?: number;
  batch_number?: string;
  batch_stock_quantity?: number;
  batch_stock_sub_quantity?: number;
  batch_sale_price?: number;
  batch_sale_sub_unit_price?: number;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
  subQuantity: number;
  price: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  batchId?: number;
  batchNumber?: string;
}

export interface PaymentDetails {
  type: 'CASH' | 'CARD' | 'INSURANCE' | 'MOBILE' | 'SPLIT';
  payableAmount: number;
  paidAmount: number;
  dueAmount: number;
  changeAmount: number;
  adjustmentPercent: number;
  adjustment: number;
  itemsDiscount: number;
  totalDiscount: number;
}

export interface Transaction {
  reference: string;
  items: CartItem[];
  payment: PaymentDetails;
  cashier: string;
  customer?: {
    name?: string;
    phone?: string;
  };
  status: 'completed' | 'pending' | 'cancelled' | 'held';
  visitId?: number;
  billId?: number;
  customerId?: number;
  prescriptionId?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}