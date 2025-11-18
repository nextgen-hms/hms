"use client"
import { useState, useCallback } from 'react';

export const useDiscount = () => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const calculateDiscount = useCallback((baseAmount: number): number => {
    if (discountType === 'percentage') {
      return (baseAmount * discountValue) / 100;
    }
    return Math.min(discountValue, baseAmount);
  }, [discountType, discountValue]);

  const resetDiscount = useCallback(() => {
    setDiscountValue(0);
  }, []);

  return {
    discountType,
    discountValue,
    setDiscountType,
    setDiscountValue,
    calculateDiscount,
    resetDiscount
  };
};