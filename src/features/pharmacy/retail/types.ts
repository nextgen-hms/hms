// Core Medicine Types
export interface Medicine {
  id: string;
  brand_name: string;
  barcode: string;
  sku: string;
  price: number;
  stock_quantity: number;
  stock_sub_quantity:number;
  sub_unit:string;
  sub_units_per_unit:number;
  sub_unit_price:number;
  allow_sub_unit_sale:boolean;
  subQuantity?: number; // For loose units (e.g., tablets from strips)
  batchNumber?: string;
  expiry_date?: string;
  manufacturer?: string;
  dosage_value:number;
  dosage_unit:string;
  form:string;
  category: 'prescription' | 'otc' | 'controlled';
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