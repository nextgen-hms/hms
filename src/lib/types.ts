export interface Medicine {
  medicine_id: number;
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
  batch_number?: string;
  expiry_date?: string;
  min_stock_level: number;
  max_stock_level: number;
  is_active: boolean;
  requires_prescription: boolean;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
  subQuantity: number;
  price: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
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
  prescriptionId?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}