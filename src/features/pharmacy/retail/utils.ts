import { CartItem, PaymentDetails, Medicine } from './types';

/**
 * Calculate line total for a cart item
 */
export const calculateLineTotal = (
  quantity: number,
  subQuantity: number,
  unitPrice: number,
  discountPercent: number,
  subUnitPrice?: number,
  subUnitsPerUnit: number = 1
): number => {
  // Use explicit subUnitPrice if available, otherwise calculate it
  const effectiveSubPrice = subUnitPrice || (unitPrice / (subUnitsPerUnit || 1));

  const subtotal = (quantity * unitPrice) + (subQuantity * effectiveSubPrice);
  const discount = (subtotal * discountPercent) / 100;

  return Number((subtotal - discount).toFixed(2));
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

  const itemsDiscount = items.reduce((sum, item) => {
    const subUnitsPerUnit = item.medicine.sub_units_per_unit || 1;
    const subUnitPrice = item.medicine.batch_sale_sub_unit_price ?? item.medicine.sub_unit_price ?? (item.price / subUnitsPerUnit);
    const totalBeforeDiscount = (item.quantity * item.price) + (item.subQuantity * subUnitPrice);
    return sum + (totalBeforeDiscount - item.lineTotal);
  }, 0);

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
export const formatCurrency = (amount: number, currency: string = 'Rs'): string => {
  return `${currency}${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  // Use batch stock if it's a batch-specific medicine object, otherwise use global stock
  const availableQty = medicine.batch_stock_quantity ?? medicine.stock_quantity;
  const availableSubQty = medicine.batch_stock_sub_quantity ?? medicine.stock_sub_quantity;

  const totalAvailable =
    (availableQty * subUnitsPerUnit) + (availableSubQty || 0);

  const totalRequested =
    (requestedQty * subUnitsPerUnit) + requestedSubQty;

  if (totalRequested > totalAvailable) {
    const totalShortage = totalRequested - totalAvailable;
    const shortageQty = Math.floor(totalShortage / subUnitsPerUnit);
    const shortageSubQty = totalShortage % subUnitsPerUnit;

    const availableDisplay = availableSubQty > 0
      ? `${availableQty} ${medicine.form || 'units'} + ${availableSubQty} ${medicine.sub_unit || 'sub-units'}`
      : `${availableQty} ${medicine.form || 'units'}`;

    const shortageDisplay = shortageSubQty > 0
      ? `${shortageQty} ${medicine.form || 'units'} + ${shortageSubQty} ${medicine.sub_unit || 'sub-units'}`
      : `${shortageQty} ${medicine.form || 'units'}`;

    return {
      valid: false,
      message: `Insufficient stock${medicine.batch_number ? ' for batch ' + medicine.batch_number : ''}. Available: ${availableDisplay}. Short by: ${shortageDisplay}`,
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