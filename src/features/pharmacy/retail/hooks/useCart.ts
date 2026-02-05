"use client"
import { useState, useCallback } from 'react';
import { CartItem, Medicine } from '../types';
import { calculateLineTotal, validateStockClientSide as validateStock } from '../utils';
import { v4 as uuidv4 } from 'uuid';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  const addItem = useCallback((
    medicine: Medicine,
    quantity: number = 1,
    subQuantity: number = 0,
    discountPercent: number = 0,
    customPrice?: number
  ) => {
    // Validate stock
    console.log(medicine);

    const stockValidation = validateStock(medicine, quantity, subQuantity);
    if (!stockValidation.valid) {
      throw new Error(stockValidation.message);
    }

    const price = customPrice ?? medicine.price;
    const discountedPrice = price - (price * discountPercent / 100);
    const lineTotal = calculateLineTotal(
      quantity,
      subQuantity,
      price,
      discountPercent,
      customPrice
    );

    const newItem: CartItem = {
      id: uuidv4(),
      medicine,
      quantity,
      subQuantity,
      price,
      discountedPrice,
      discountPercent,
      customPrice,
      lineTotal,
      batchId: medicine.batch_id,
      batchNumber: medicine.batch_number
    };

    setCart(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback((
    itemId: string,
    updates: Partial<Pick<CartItem, 'quantity' | 'subQuantity' | 'discountPercent' | 'customPrice'>>
  ) => {
    setCart(prev => prev.map(item => {
      if (item.id !== itemId) return item;

      const updatedItem = { ...item, ...updates };
      updatedItem.lineTotal = calculateLineTotal(
        updatedItem.quantity,
        updatedItem.subQuantity,
        updatedItem.price,
        updatedItem.discountPercent,
        updatedItem.customPrice
      );

      return updatedItem;
    }));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  }, [selectedItem]);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedItem(null);
  }, []);

  const selectItem = useCallback((itemId: string | null) => {
    if (!itemId) {
      setSelectedItem(null);
      return;
    }
    const item = cart.find(i => i.id === itemId);
    setSelectedItem(item || null);
  }, [cart]);

  return {
    cart,
    selectedItem,

    addItem,
    updateItem,
    removeItem,
    clearCart,
    selectItem
  };
};