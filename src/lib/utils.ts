// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TXN-${timestamp}-${random}`;
}

export function calculateLineTotal(
  quantity: number,
  subQuantity: number,
  unitPrice: number,
  discountPercent: number
): number {
  const totalQuantity = quantity + (subQuantity / 100);
  const subtotal = totalQuantity * unitPrice;
  const discount = (subtotal * discountPercent) / 100;
  return subtotal - discount;
}

export function getCurrentStaffId(): number {
  // TODO: Get from session/auth
  // For now, return a default value
  return 1;
}