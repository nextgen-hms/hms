"use client"
import React, { useState, useRef, useEffect } from 'react';
import { BarcodeScanner, MedicineSearch } from './search';
import { QuantityInput, SubQuantityInput, DiscountInput, CustomPriceInput } from './product-entry';
import { CartTable } from './cart';
import { CheckoutCard, CheckoutCardHandle } from './payment/CheckoutCard';
import { useCart, usePayment, useMedicineSearch, useBarcode } from '../hooks';
import { Medicine, POSMode } from '../types';
import AddProductButton from './product-entry/AddProductButton';
import { Maximize, Minimize, Layout, ShoppingCart, Activity, RefreshCcw, ArrowRightLeft, RotateCcw } from 'lucide-react';
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
  const [posMode, setPosMode] = useState<POSMode>('SALE');

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
  const subQtyInputRef = useRef<HTMLInputElement>(null);
  const discInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const checkoutRef = useRef<CheckoutCardHandle>(null);

  // Ordered refs for arrow-key navigation between entry fields
  const fieldRefs = [qtyInputRef, subQtyInputRef, discInputRef, priceInputRef];

  // Navigate between entry fields with Left/Right arrows
  useEffect(() => {
    const handleArrowNav = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const activeEl = document.activeElement;
      const currentIdx = fieldRefs.findIndex(ref => ref.current === activeEl);
      if (currentIdx === -1) return; // Not in an entry field

      e.preventDefault();
      if (e.key === 'ArrowRight' && currentIdx < fieldRefs.length - 1) {
        fieldRefs[currentIdx + 1].current?.focus();
      } else if (e.key === 'ArrowLeft' && currentIdx > 0) {
        fieldRefs[currentIdx - 1].current?.focus();
      } else if (e.key === 'ArrowLeft' && currentIdx === 0) {
        // Jump back to search
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleArrowNav);
    return () => window.removeEventListener('keydown', handleArrowNav);
  }, []);

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
      // F10: Toggle Mode
      if (e.key === 'F10') {
        e.preventDefault();
        setPosMode(prev => prev === 'SALE' ? 'RETURN' : 'SALE');
        toast(`Switched to ${posMode === 'SALE' ? 'RETURN' : 'SALE'} Mode`, {
          icon: posMode === 'SALE' ? '♻️' : '🛒'
        });
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [clearCart]);

  // Handle add item to cart
  const handleAddItem = (medicine: Medicine) => {
    try {
      // Check if medicine with this batch is already in cart
      const existingInCart = cart.find(item =>
        item.medicine.id === medicine.id &&
        item.batchId === medicine.batch_id
      );

      if (existingInCart) {
        setQuantity(existingInCart.quantity);
        setSubQuantity(existingInCart.subQuantity);
        setDiscountPercent(existingInCart.discountPercent);
        setCustomPrice(existingInCart.customPrice);
        toast(`Editing existing item in cart`, { icon: '📝' });
      } else {
        setQuantity(1);
        setSubQuantity(0);
        setDiscountPercent(0);
        const priceToUse = medicine.batch_sale_price ?? medicine.price;
        setCustomPrice(priceToUse);
      }

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

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      checkoutRef.current?.focusAmountReceived();
      toast('Payment Panel Focused', { icon: '💳', duration: 1000 });
    }
  };

  const handleSearchSelected = () => {
    if (!itemSearched) return;
    addItem(itemSearched, quantity, subQuantity, discountPercent, customPrice);

    // Reset all fields for the next entry
    setSearchQuery('');
    setItemSearched(undefined);
    clearResults();
    setQuantity(1);
    setSubQuantity(0);
    setDiscountPercent(0);
    setCustomPrice(undefined);

    // Refocus search for next item
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  return (
    <div
      ref={containerRef}
      className={`flex min-h-screen bg-slate-50 font-sans gap-6 p-6 flex-col xl:flex-row backdrop-blur-sm ${isFullscreen ? 'bg-white p-10 overflow-auto h-screen w-screen fixed inset-0 z-[9999]' : ''}`}
    >
      {/* Main Content Area: Entry and Cart stacked vertically */}
      <div className="flex flex-col gap-6 flex-1 min-w-0">
        {/* 1. Medicine Entry (Top) - Higher z-index for search dropdown */}
        <div className={`flex flex-col gap-4 bg-white/80 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all duration-500 relative z-20 ${posMode === 'SALE' ? 'border-white/60' : 'border-rose-200/60 shadow-rose-500/5'
          }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                <Layout size={18} />
              </div>
              Medicine Entry
            </h2>

            <div className="flex items-center gap-3">
              {/* Mode Toggle Indicator */}
              <div
                onClick={() => setPosMode(prev => prev === 'SALE' ? 'RETURN' : 'SALE')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all duration-300 ${posMode === 'SALE'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
              >
                {posMode === 'SALE' ? <ShoppingCart size={16} /> : <RotateCcw size={16} />}
                <span className="text-xs font-black uppercase tracking-widest">
                  {posMode === 'SALE' ? 'Sale Mode' : 'Return Mode'}
                </span>
                <span className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded font-mono">F10</span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-slate-100/80 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all border border-slate-200/50"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>

          {/* Search Bar - Full Width */}
          <MedicineSearch
            inputRef={searchInputRef}
            query={searchQuery}
            results={results}
            isSearching={isSearching}
            onSearch={handleSearch}
            onSelect={handleAddItem}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search Medicine (F1)"
          />

          {/* Fields Row - All in one horizontal line */}
          <div className={`flex flex-wrap lg:flex-nowrap items-end gap-3 p-4 rounded-2xl border transition-all duration-500 ${itemSearched
            ? (posMode === 'SALE' ? 'bg-indigo-50/30 border-indigo-100' : 'bg-rose-50/30 border-rose-100')
            : 'bg-slate-50/50 border-slate-100 border-dashed opacity-60'
            }`}>
            <div className="w-28 shrink-0">
              <QuantityInput
                ref={qtyInputRef}
                value={quantity}
                onChange={setQuantity}
                label="Qty"
                min={0}
                available={itemSearched?.batch_stock_quantity ?? (itemSearched as any)?.total_stock_quantity}
                onEnter={handleSearchSelected}
              />
            </div>
            <div className="w-40 shrink-0">
              <SubQuantityInput
                ref={subQtyInputRef}
                value={subQuantity}
                onChange={setSubQuantity}
                label="Sub-Qty"
                perUnit={itemSearched?.sub_units_per_unit}
                available={
                  itemSearched
                    ? ((itemSearched.batch_stock_quantity ?? 0) * (itemSearched.sub_units_per_unit || 1)) + (itemSearched.batch_stock_sub_quantity ?? 0)
                    : (itemSearched as any)?.total_stock_sub_quantity
                }
                onEnter={handleSearchSelected}
              />
            </div>
            <div className="w-36 shrink-0">
              <DiscountInput ref={discInputRef} value={discountPercent} onChange={setDiscountPercent} label="Disc %" onEnter={handleSearchSelected} />
            </div>
            <div className="w-28 shrink-0">
              <CustomPriceInput ref={priceInputRef} value={customPrice} onChange={setCustomPrice} label="Price" onEnter={handleSearchSelected} />
            </div>

            {/* Matched Medicine Info */}
            {itemSearched && (
              <div className="flex-1 min-w-[160px] p-2 bg-white rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">Match</p>
                  <p className="text-sm font-bold text-indigo-600 truncate">{itemSearched.brand_name}</p>
                </div>
                {itemSearched.batch_number && (
                  <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded shrink-0">
                    BN: {itemSearched.batch_number}
                  </span>
                )}
              </div>
            )}

            {/* Add Button */}
            <div className="shrink-0">
              <AddProductButton handleSearchSelected={handleSearchSelected} />
            </div>
          </div>
        </div>

        {/* 2. Active Billing Cart (Bottom) */}
        <div className="flex flex-col flex-1 bg-white/70 backdrop-blur-xl rounded-[2rem] px-6 py-6 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/40 overflow-hidden min-h-[400px]">
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
              ref={checkoutRef}
              mode={posMode}
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
              onBackToSearch={() => searchInputRef.current?.focus()}
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
