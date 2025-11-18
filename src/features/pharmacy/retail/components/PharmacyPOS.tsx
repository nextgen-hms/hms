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
  const [itemSearched,setItemSearched]=useState<Medicine>(); //itme selected in medicine search
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
     //addItem(medicine, quantity, subQuantity, discountPercent, customPrice);
      setQuantity(1);
      setSubQuantity(0);
      setDiscountPercent(0);
      setCustomPrice(undefined);
      setCustomPrice(medicine.price);
      setItemSearched(medicine);
      const expiryDate=new Date(medicine.expiry_date!).toISOString().split("T")[0];
      setSearchQuery(`${medicine.brand_name} ${medicine.dosage_value} ${medicine.dosage_unit} ${medicine.form} [QTY :${medicine.stock_quantity} + Sub :${medicine.sub_units_per_unit}] [Expiry:${expiryDate}]`);
     // clearResults();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add item');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search(query);
  };

   const handleSearchSelected = ()=>{
    addItem(itemSearched!, quantity, subQuantity, discountPercent, customPrice);
   }
  return (
    <div className="flex min-h-screen bg-gray-100 font-[Segoe_UI] gap-5 p-5 flex-col xl:flex-row">
      {/* Left Panel */}
      <div className="flex flex-col gap-4 flex-1 bg-white rounded-lg p-5 shadow-md">
        {/* Search Section */}
        <div className="flex flex-col gap-3">
          {/* <BarcodeScanner 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Barcode scanner"
          /> */}
          
          <MedicineSearch
            query={searchQuery}
            results={results}
            isSearching={isSearching}
            onSearch={handleSearch}
            onSelect={handleAddItem}
            placeholder="search for medicine"
          />
        </div>

        {/* Product Entry Section */}
        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-md">
          <div className="flex gap-3">
            <QuantityInput
              value={quantity}
              onChange={setQuantity}
              label="quantity"
            />
            <SubQuantityInput
              value={subQuantity}
              onChange={setSubQuantity}
              label="sub quantity"
            />
          </div>

          <div className="flex gap-3">
            <CustomPriceInput
              value={customPrice}
              onChange={setCustomPrice}
              label="discounted price"
            />
            <DiscountInput
              value={discountPercent}
              onChange={setDiscountPercent}
              label="discounted %"
            />

          </div>

          <div className="flex gap-3">
            <CustomPriceInput
              value={customPrice}
              onChange={setCustomPrice}
              label="Retail price"
            />
          </div>
          <div className='flex gap-3'>
            <AddProductButton handleSearchSelected={handleSearchSelected}/>
          </div>
        </div>

        {/* Cart Table */}
        <CartTable
          items={cart}
          selectedItem={selectedItem}
          onSelectItem={selectItem}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
        />
      </div>

      {/* Right Panel */}
      <div className="flex flex-col gap-4 w-full xl:w-[400px]">
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
  );
};

export default PharmacyPOS;
