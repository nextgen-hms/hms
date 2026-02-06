export interface Medicine {
  id: number; // Standardized to match v_medicine_pos
  brand_name: string;
  generic_name: string; // Critical for medical accuracy
  barcode: string;
  sku: string;
  price: number;
  stock_quantity: number;
  stock_sub_quantity: number;
  sub_unit: string;
  sub_units_per_unit: number;
  sub_unit_price: number;
  allow_sub_unit_sale: boolean;
  subQuantity?: number;
  batchNumber?: string;
  expiry_date?: string | Date;
  manufacturer?: string;
  dosage_value: number;
  dosage_unit: string;
  form: string;
  category: 'prescription' | 'otc' | 'controlled';

  // Batch specific fields from v_medicine_pos (merged at runtime)
  batch_id?: number;
  batch_number?: string;
  batch_stock_quantity?: number;
  batch_stock_sub_quantity?: number;
  batch_sale_price?: number;
  batch_sale_sub_unit_price?: number;
  global_price?: number;
  total_stock_quantity?: number;
  total_stock_sub_quantity?: number;
}

// Cart Item Types
export interface CartItem {
  id: string;
  medicine: Medicine;
  quantity: number;
  subQuantity: number;
  price: number;
  discountedPrice: number;
  discountPercent: number;
  customPrice?: number;
  lineTotal: number;
  batchId?: number;
  batchNumber?: string;
}

// Payment Types
export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  INSURANCE = 'INSURANCE',
  MOBILE = 'MOBILE',
  SPLIT = 'SPLIT'
}

export interface PaymentDetails {
  type: PaymentType;
  payableAmount: number;
  paidAmount: number;
  dueAmount: number;
  changeAmount: number;
  adjustment: number;
  adjustmentPercent: number;
  itemsDiscount: number;
  totalDiscount: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  reference: string;
  items: CartItem[];
  payment: PaymentDetails;
  timestamp: Date;
  cashier: string;
  customer?: Customer;
  status: 'completed' | 'pending' | 'cancelled' | 'held';
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  prescriptionNumber?: string;
}

// UI State Types
export interface POSState {
  cart: CartItem[];
  payment: PaymentDetails;
  selectedItem: CartItem | null;
  searchQuery: string;
  isProcessing: boolean;
  currentTransaction?: Transaction;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchResponse {
  medicines: Medicine[];
  total: number;
}