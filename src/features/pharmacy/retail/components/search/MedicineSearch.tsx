"use client"
import React, { useState, useRef, useEffect } from "react";
import { Medicine } from "../../types";

interface MedicineSearchProps {
  query: string;
  results: Medicine[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onSelect: (medicine: Medicine) => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const MedicineSearch: React.FC<MedicineSearchProps> = ({
  query,
  results,
  isSearching,
  onSearch,
  onSelect,
  placeholder = "Search for medicine",
  inputRef,
}) => {
  const [showResults, setShowResults] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowResults(results.length > 0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && results[focusedIndex]) {
          handleSelect(results[focusedIndex]);
        }
        break;
      case "Escape":
        setShowResults(false);
        break;
    }
  };

  const handleSelect = (medicine: Medicine) => {
    onSelect(medicine);
    setShowResults(false);
    setFocusedIndex(-1);
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 1500)}
          placeholder={placeholder}
          className="
            w-full 
            px-[15px] py-[12px] 
            text-[16px]
            bg-white/70 backdrop-blur-md
            border-2 border-slate-200/50
            rounded-xl 
            outline-none 
            transition-all duration-300
            placeholder:text-slate-400 placeholder:italic
            focus:border-indigo-500/50
            focus:bg-white/90
            focus:shadow-[0_8px_30px_rgb(0,0,0,0.04),0_0_0_4px_rgba(99,102,241,0.1)]
            group-hover:border-slate-300/50
          "
        />
        {isSearching && (
          <div className="absolute right-[15px] top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div
          ref={resultsRef}
          className="
            absolute 
            top-[calc(100%+8px)] left-0 right-0 
            max-h-[450px] 
            overflow-y-auto 
            bg-white/80 backdrop-blur-xl
            border border-slate-200/50
            rounded-2xl
            shadow-[0_20px_50px_rgba(0,0,0,0.1)]
            z-[1000]
            p-2
            animate-in fade-in zoom-in-95 duration-200
          "
        >
          {results.map((medicine, index) => {
            const expiryDate = medicine.expiry_date
              ? new Date(medicine.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'N/A';

            return (
              <div
                key={`${medicine.id}-${medicine.batch_id || index}`}
                onClick={() => handleSelect(medicine)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`
                  mb-2 last:mb-0
                  px-5 py-4
                  cursor-pointer rounded-[1.25rem]
                  transition-all duration-300
                  flex flex-col gap-2 border
                  ${index === focusedIndex
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_15px_30px_rgba(79,70,229,0.3)] scale-[1.02] z-10"
                    : "bg-white/50 border-slate-100 hover:bg-white hover:border-indigo-100 text-slate-800 shadow-sm hover:shadow-md"}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-black text-[15px] tracking-tight leading-none mb-1">
                      {medicine.brand_name}
                    </span>
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${index === focusedIndex ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {medicine.generic_name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter ${index === focusedIndex ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {medicine.dosage_value} {medicine.dosage_unit} // {medicine.form}
                    </span>
                    {medicine.batch_number && (
                      <div className={`text-[10px] font-mono px-2 py-0.5 rounded shadow-inner ${index === focusedIndex ? 'bg-black/20 text-indigo-100' : 'bg-indigo-50 text-indigo-600'}`}>
                        B# {medicine.batch_number}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 pt-2 border-t border-current/10">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${index === focusedIndex ? 'text-indigo-200' : 'text-slate-400'}`}>Availability</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${(medicine.batch_stock_quantity ?? medicine.stock_quantity) > 10 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
                        <span className="text-xs font-black">
                          {medicine.batch_stock_quantity ?? medicine.stock_quantity} <span className="opacity-60 font-medium lowercase">{medicine.form || 'units'}</span>
                          {(medicine.batch_stock_sub_quantity ?? medicine.stock_sub_quantity) > 0 && (
                            <span className="ml-1 text-[10px] opacity-80">
                              + {medicine.batch_stock_sub_quantity ?? medicine.stock_sub_quantity} <span className="lowercase">{medicine.sub_unit || 'sub-units'}</span>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${index === focusedIndex ? 'text-indigo-200' : 'text-slate-400'}`}>Expiry</span>
                      <div className="flex items-center gap-1.5 text-rose-500">
                        <div className={`w-2 h-2 rounded-full ${index === focusedIndex ? 'bg-white' : 'bg-rose-500'}`}></div>
                        <span className={`text-xs font-black ${index === focusedIndex ? 'text-white' : ''}`}>{expiryDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`px-4 py-1.5 rounded-xl flex items-center justify-center font-black text-lg tracking-tighter ${index === focusedIndex ? 'bg-white text-indigo-600 shadow-xl' : 'bg-emerald-50 text-emerald-600'}`}>
                    PKR {typeof (medicine.batch_sale_price ?? medicine.price) === 'number'
                      ? (medicine.batch_sale_price ?? medicine.price).toFixed(2)
                      : Number(medicine.batch_sale_price ?? medicine.price ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
