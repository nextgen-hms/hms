import { CartItem, PaymentDetails, Medicine } from './types';

/**
 * Calculate line total for a cart item
 */
////fix it
export const calculateLineTotal = (
  quantity: number,
  subQuantity: number,
  unitPrice: number,
  discountPercent: number,
  customPrice?: number
): number => {
  const effectivePrice = customPrice ?? unitPrice;
  const totalQuantity = quantity + (subQuantity / 100); // Assuming 100 sub-units per unit
  const subtotal = totalQuantity * effectivePrice;
  const discount = (subtotal * discountPercent) / 100;
  return subtotal - discount;
};

/**
 * Calculate total payment details from cart items
 */
export const calculatePaymentDetails = (
  items: CartItem[],
  globalDiscountPercent: number = 0,
  paidAmount: number = 0
): PaymentDetails => {
  const itemsTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemsDiscount = items.reduce(
    (sum, item) => sum + (item.quantity * item.price - item.lineTotal),
    0
  );
  
  const globalDiscount = (itemsTotal * globalDiscountPercent) / 100;
  const totalDiscount = itemsDiscount + globalDiscount;
  
  const payableAmount = itemsTotal - globalDiscount;
  const changeAmount = Math.max(0, paidAmount - payableAmount);
  const dueAmount = Math.max(0, payableAmount - paidAmount);

  return {
    type: 'CASH' as any,
    payableAmount,
    paidAmount,
    dueAmount,
    changeAmount,
    adjustment: globalDiscount,
    adjustmentPercent: globalDiscountPercent,
    itemsDiscount,
    totalDiscount
  };
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency: string = '$'): string => {
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * Generate unique transaction reference
 */
export const generateReference = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TXN-${timestamp}-${random}`;
};

/**
 * Validate medicine stock availability
 */
///fix it 
// Quick client-side validation (use cached medicine data)
export const validateStockClientSide = (
  medicine: Medicine,
  requestedQty: number,
  requestedSubQty: number = 0
): { 
  valid: boolean; 
  message?: string; 
  totalAvailable?: number;
  totalRequested?: number;
} => {
  
  const subUnitsPerUnit = medicine.sub_units_per_unit || 1;
  
  const totalAvailable = 
    (medicine.stock_quantity * subUnitsPerUnit) + (medicine.stock_sub_quantity || 0);
  
  const totalRequested = 
    (requestedQty * subUnitsPerUnit) + requestedSubQty;
  
  if (totalRequested > totalAvailable) {
    const totalShortage = totalRequested - totalAvailable;
    const shortageQty = Math.floor(totalShortage / subUnitsPerUnit);
    const shortageSubQty = totalShortage % subUnitsPerUnit;
    
    const availableDisplay = medicine.stock_sub_quantity > 0
      ? `${medicine.stock_quantity} ${medicine.form || 'units'} + ${medicine.stock_sub_quantity} ${medicine.sub_unit || 'sub-units'}`
      : `${medicine.stock_quantity} ${medicine.form || 'units'}`;
    
    const shortageDisplay = shortageSubQty > 0
      ? `${shortageQty} ${medicine.form || 'units'} + ${shortageSubQty} ${medicine.sub_unit || 'sub-units'}`
      : `${shortageQty} ${medicine.form || 'units'}`;
    
    return {
      valid: false,
      message: `Insufficient stock. Available: ${availableDisplay}. Short by: ${shortageDisplay}`,
      totalAvailable,
      totalRequested
    };
  }
  
  return { 
    valid: true,
    totalAvailable,
    totalRequested
  };
};

/**
 * Parse barcode input
 */
export const parseBarcode = (input: string): {
  type: 'barcode' | 'sku' | 'name';
  value: string;
} => {
  // Simple heuristic - can be enhanced
  if (/^\d{8,13}$/.test(input)) {
    return { type: 'barcode', value: input };
  }
  if (/^[A-Z0-9-]{6,}$/.test(input)) {
    return { type: 'sku', value: input };
  }
  return { type: 'name', value: input };
};

/**
 * Check if medicine requires prescription
 */
export const requiresPrescription = (medicine: Medicine): boolean => {
  return medicine.category === 'prescription' || medicine.category === 'controlled';
};

/**
 * Calculate expiry warning
 */
export const getExpiryWarning = (expiryDate: string): {
  isExpired: boolean;
  isNearExpiry: boolean;
  daysRemaining: number;
} => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysRemaining = Math.floor(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    isExpired: daysRemaining < 0,
    isNearExpiry: daysRemaining > 0 && daysRemaining <= 90,
    daysRemaining
  };
};