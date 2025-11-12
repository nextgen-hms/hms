"use client"
import { useState, useCallback, useEffect } from 'react';
import { PaymentDetails, PaymentType, CartItem } from '../types';
import { calculatePaymentDetails } from '../utils';

export const usePayment = (cart: CartItem[]) => {
  const [payment, setPayment] = useState<PaymentDetails>({
    type: PaymentType.CASH,
    payableAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    changeAmount: 0,
    adjustment: 0,
    adjustmentPercent: 0,
    itemsDiscount: 0,
    totalDiscount: 0
  });

  // Recalculate payment details when cart changes
  useEffect(() => {
    const newPayment = calculatePaymentDetails(
      cart,
      payment.adjustmentPercent,
      payment.paidAmount
    );
    setPayment(prev => ({ ...prev, ...newPayment }));
  }, [cart]);

  const setPaymentType = useCallback((type: PaymentType) => {
    setPayment(prev => ({ ...prev, type }));
  }, []);

  const setPaidAmount = useCallback((amount: number) => {
    setPayment(prev => {
      const changeAmount = Math.max(0, amount - prev.payableAmount);
      const dueAmount = Math.max(0, prev.payableAmount - amount);
      return {
        ...prev,
        paidAmount: amount,
        changeAmount,
        dueAmount
      };
    });
  }, []);

  const setAdjustment = useCallback((percent: number) => {
    const newPayment = calculatePaymentDetails(cart, percent, payment.paidAmount);
    setPayment(prev => ({ ...prev, ...newPayment, adjustmentPercent: percent }));
  }, [cart, payment.paidAmount]);

  const resetPayment = useCallback(() => {
    setPayment({
      type: PaymentType.CASH,
      payableAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      changeAmount: 0,
      adjustment: 0,
      adjustmentPercent: 0,
      itemsDiscount: 0,
      totalDiscount: 0
    });
  }, []);

  return {
    payment,
    setPaymentType,
    setPaidAmount,
    setAdjustment,
    resetPayment
  };
};