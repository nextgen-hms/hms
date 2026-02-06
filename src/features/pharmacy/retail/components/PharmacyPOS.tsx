"use client"
import React, { useState, useRef, useEffect } from 'react';
import { BarcodeScanner, MedicineSearch } from './search';
import { QuantityInput, SubQuantityInput, DiscountInput, CustomPriceInput } from './product-entry';
import { CartTable } from './cart';
import { CheckoutCard } from './payment/CheckoutCard';
import { useCart, usePayment, useMedicineSearch, useBarcode } from '../hooks';
import { Medicine } from '../types';
import AddProductButton from './product-entry/AddProductButton';
import { Maximize, Minimize, Layout, ShoppingCart, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [itemSearched, setItemSearched] = useState<Medicine>();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes (e.g. Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const payInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // F1: Focus Search
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        toast('Search Focused', { icon: '🔍', duration: 1000 });
      }
      // F2: Complete / Pay
      if (e.key === 'F2') {
        e.preventDefault();
        const payBtn = document.querySelector('[data-pay-button]') as HTMLButtonElement;
        payBtn?.click();
      }
      // F3: Hold
      if (e.key === 'F3') {
        e.preventDefault();
        const holdBtn = document.querySelector('[data-hold-button]') as HTMLButtonElement;
        holdBtn?.click();
      }
      // F4: New Sale / Clear
      if (e.key === 'F4') {
        e.preventDefault();
        clearCart();
        setItemSearched(undefined);
        setSearchQuery('');
        toast.success('New Sale Started');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [clearCart]);

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

      // Focus quantity input for fast entry
      setTimeout(() => qtyInputRef.current?.focus(), 100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to select item');
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
    <div
      ref={containerRef}
      className={`flex min-h-screen bg-slate-50 font-sans gap-6 p-6 flex-col xl:flex-row backdrop-blur-sm ${isFullscreen ? 'bg-white p-10 overflow-auto h-screen w-screen fixed inset-0 z-[9999]' : ''}`}
    >
      {/* 1. Left Column: Search & Batch (Command Center) */}
      <div className="flex flex-col gap-6 w-full xl:w-[380px]">
        <div className="flex flex-col gap-6 bg-white/80 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                <Layout size={18} />
              </div>
              Stock Quick
            </h2>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-slate-100/80 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all border border-slate-200/50"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>

          <MedicineSearch
            inputRef={searchInputRef}
            query={searchQuery}
            results={results}
            isSearching={isSearching}
            onSearch={handleSearch}
            onSelect={handleAddItem}
            placeholder="Search Medicine (F1)"
          />

          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border transition-all ${itemSearched ? 'bg-indigo-50/50 border-indigo-100 ring-4 ring-indigo-50/20' : 'bg-slate-50/50 border-slate-100 border-dashed opacity-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Line Config</p>
                {itemSearched && <Activity size={14} className="text-indigo-400 animate-pulse" />}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <QuantityInput
                  ref={qtyInputRef}
                  value={quantity}
                  onChange={setQuantity}
                  label="Qty"
                  min={0}
                  available={itemSearched?.batch_stock_quantity ?? itemSearched?.stock_quantity}
                  onEnter={handleSearchSelected}
                />
                <SubQuantityInput
                  value={subQuantity}
                  onChange={setSubQuantity}
                  label="Sub-Qty"
                  available={itemSearched?.batch_stock_sub_quantity ?? itemSearched?.stock_sub_quantity}
                  onEnter={handleSearchSelected}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <DiscountInput value={discountPercent} onChange={setDiscountPercent} label="Disc %" />
                <CustomPriceInput value={customPrice} onChange={setCustomPrice} label="Price" />
              </div>

              {itemSearched && (
                <div className="mb-4 p-3 bg-white rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <p className="text-[11px] text-slate-400 font-medium">Auto-Locked Match</p>
                  <p className="text-sm font-bold text-indigo-600 truncate">{itemSearched.brand_name}</p>
                  {itemSearched.batch_number && (
                    <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded mt-1 inline-block">
                      BN: {itemSearched.batch_number}
                    </span>
                  )}
                </div>
              )}

              <AddProductButton handleSearchSelected={handleSearchSelected} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center Column: Live Billing Detail */}
      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col flex-1 bg-white/70 backdrop-blur-xl rounded-[2rem] px-6 py-6 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/40 overflow-hidden">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                <ShoppingCart size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Billing Cart</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black ring-1 ring-slate-200 uppercase tracking-wider">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <CartTable
              items={cart}
              selectedItem={selectedItem}
              onSelectItem={selectItem}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
            />
          </div>
        </div>
      </div>

      {/* 3. Right Column: Real-Store Checkout Panel */}
      <div className="flex flex-col gap-6 w-full xl:w-[420px]">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl ring-1 ring-white/10 flex flex-col h-full relative overflow-hidden">
          {/* Subtle Ambient Background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] -mr-16 -mt-16"></div>

          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
            <div className="w-2 h-8 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
            Finalize Sale
          </h2>

          <div className="flex-1 relative z-10">
            <CheckoutCard
              cart={cart}
              payment={payment}
              onPaymentTypeChange={setPaymentType}
              onPaidAmountChange={setPaidAmount}
              onAdjustmentChange={setAdjustment}
              onComplete={() => {
                clearCart();
                resetPayment();
              }}
              onClear={clearCart}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Secure Terminal
              </span>
              <span className="text-slate-600 font-mono">v1.2 // OPS-PRO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyPOS;
