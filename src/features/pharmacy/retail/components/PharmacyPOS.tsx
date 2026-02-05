"use client"
import React, { useState } from 'react';
import { BarcodeScanner, MedicineSearch } from './search';
import { QuantityInput, SubQuantityInput, DiscountInput, CustomPriceInput } from './product-entry';
import { CartTable } from './cart';
import { PaymentPanel } from './payment';
import { ActionButtons } from './actions';
import { useCart, usePayment, useMedicineSearch, useBarcode } from '../hooks';
import { Medicine } from '../types';
import AddProductButton from './product-entry/AddProductButton';

const PharmacyPOS: React.FC = () => {
  const { cart, selectedItem, addItem, updateItem, removeItem, clearCart, selectItem } = useCart();
  const { payment, setPaymentType, setPaidAmount, setAdjustment, resetPayment } = usePayment(cart);
  const { results, isSearching, search, clearResults } = useMedicineSearch();

  // Product entry state
  const [quantity, setQuantity] = useState<number>(1);
  const [subQuantity, setSubQuantity] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemSearched, setItemSearched] = useState<Medicine>(); //itme selected in medicine search
  // Handle barcode scan
  useBarcode({
    onScan: (barcode) => {
      setSearchQuery(barcode);
      search(barcode);
    },
    enabled: true
  });

  // Handle add item to cart
  const handleAddItem = (medicine: Medicine) => {
    try {
      setQuantity(1);
      setSubQuantity(0);
      setDiscountPercent(0);

      // Use batch price if available, otherwise global price
      const priceToUse = medicine.batch_sale_price ?? medicine.price;
      setCustomPrice(priceToUse);
      setItemSearched(medicine);

      const expiryDate = medicine.expiry_date
        ? new Date(medicine.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A';

      const batchInfo = medicine.batch_number ? ` [Batch: ${medicine.batch_number}]` : '';
      setSearchQuery(`${medicine.brand_name} ${medicine.dosage_value}${medicine.dosage_unit}${batchInfo} (Exp: ${expiryDate})`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to select item');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search(query);
  };

  const handleSearchSelected = () => {
    if (!itemSearched) return;
    addItem(itemSearched, quantity, subQuantity, discountPercent, customPrice);
    setSearchQuery('');
    setItemSearched(undefined);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans gap-6 p-6 flex-col xl:flex-row backdrop-blur-sm">
      {/* Left Panel */}
      <div className="flex flex-col gap-6 flex-1 bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40">
        {/* Search Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
            Medicine Search
          </h2>
          <MedicineSearch
            query={searchQuery}
            results={results}
            isSearching={isSearching}
            onSearch={handleSearch}
            onSelect={handleAddItem}
            placeholder="Search by name, generic, or scan barcode..."
          />
        </div>

        {/* Product Entry Section */}
        <div className="flex flex-col gap-6 p-6 bg-slate-50/50 backdrop-blur-md rounded-2xl border border-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                label="Quantity"
              />
              <SubQuantityInput
                value={subQuantity}
                onChange={setSubQuantity}
                label="Sub-Quantity"
              />
            </div>

            <div className="flex gap-4">
              <DiscountInput
                value={discountPercent}
                onChange={setDiscountPercent}
                label="Discount %"
              />
              <CustomPriceInput
                value={customPrice}
                onChange={setCustomPrice}
                label="Sale Price"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
            {itemSearched && (
              <div className="text-sm text-slate-500 italic">
                Selected: <span className="font-semibold text-slate-700">{itemSearched.brand_name}</span>
                {itemSearched.batch_number && <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">Batch: {itemSearched.batch_number}</span>}
              </div>
            )}
            <div className="ml-auto">
              <AddProductButton handleSearchSelected={handleSearchSelected} />
            </div>
          </div>
        </div>

        {/* Cart Table */}
        <div className="flex-1 min-h-[400px]">
          <CartTable
            items={cart}
            selectedItem={selectedItem}
            onSelectItem={selectItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col gap-6 w-full xl:w-[420px]">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 sticky top-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Checkout
          </h2>

          <div className="space-y-6">
            <PaymentPanel
              payment={payment}
              onPaymentTypeChange={setPaymentType}
              onPaidAmountChange={setPaidAmount}
              onAdjustmentChange={setAdjustment}
            />

            <ActionButtons
              cart={cart}
              payment={payment}
              onComplete={() => {
                clearCart();
                resetPayment();
              }}
              onClear={clearCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyPOS;
