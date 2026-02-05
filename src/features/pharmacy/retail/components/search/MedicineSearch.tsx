import React, { useState, useRef, useEffect } from "react";
import { Medicine } from "../../types";

interface MedicineSearchProps {
  query: string;
  results: Medicine[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onSelect: (medicine: Medicine) => void;
  placeholder?: string;
}

export const MedicineSearch: React.FC<MedicineSearchProps> = ({
  query,
  results,
  isSearching,
  onSearch,
  onSelect,
  placeholder = "Search for medicine",
}) => {
  const [showResults, setShowResults] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);
  console.log(results);

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
  console.log(results);

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative group">
        <input
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
                  mb-1 last:mb-0
                  px-4 py-3
                  cursor-pointer rounded-xl
                  transition-all duration-200
                  flex flex-col gap-1
                  ${index === focusedIndex
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.01]"
                    : "hover:bg-slate-50 text-slate-800"}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-[15px]">
                    {medicine.brand_name}
                    <span className={`ml-2 text-[12px] px-2 py-0.5 rounded-full ${index === focusedIndex ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                      {medicine.dosage_value} {medicine.dosage_unit}
                    </span>
                  </div>
                  {medicine.batch_number && (
                    <div className={`text-[11px] font-mono px-2 py-0.5 rounded ${index === focusedIndex ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                      Batch: {medicine.batch_number}
                    </div>
                  )}
                </div>

                <div className={`flex flex-wrap gap-x-4 gap-y-1 text-[12px] ${index === focusedIndex ? 'text-white/80' : 'text-slate-500'}`}>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Stock:</span>
                    <span>
                      {medicine.batch_stock_quantity ?? medicine.stock_quantity} {medicine.form}
                      {(medicine.batch_stock_sub_quantity ?? medicine.stock_sub_quantity) > 0 && (
                        <> + {(medicine.batch_stock_sub_quantity || medicine.stock_sub_quantity)} subunits</>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-rose-500">
                    <span className={`font-medium ${index === focusedIndex ? 'text-white/90' : ''}`}>Exp:</span>
                    <span className={index === focusedIndex ? 'text-white/80' : ''}>{expiryDate}</span>
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <span className={`font-bold text-[14px] ${index === focusedIndex ? 'text-white' : 'text-emerald-600'}`}>
                      PKR {(medicine.batch_sale_price ?? medicine.price).toFixed(2)}
                    </span>
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
