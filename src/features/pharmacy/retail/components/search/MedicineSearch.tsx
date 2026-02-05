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
      <input
        type="text"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setShowResults(true)}
        onBlur={()=>setTimeout(()=>setShowResults(false),1500)}
        placeholder={placeholder}
        className="
          w-full 
          px-[15px] py-[12px] 
          text-[16px]
          border-2 border-gray-300 
          rounded-md 
          outline-none 
          transition-colors duration-300
          placeholder:text-gray-400 placeholder:italic
          focus:border-blue-500 
          focus:shadow-[0_0_0_3px_rgba(33,150,243,0.1)]
        "
      />

      {/* Loading Spinner */}
      {isSearching && (
        <div className="absolute right-[15px] top-1/2 -translate-y-1/2 text-blue-500 text-sm">
          Searching...
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && (
        <div
          ref={resultsRef}
          className="
            absolute 
            top-[calc(100%+5px)] left-0 right-0 
            max-h-[400px] 
            overflow-y-auto 
            bg-white 
            border border-gray-300 
            rounded-md 
            shadow-[0_4px_12px_rgba(0,0,0,0.15)] 
            z-[1000]
          "
        >

          {results.map((medicine, index) => {
            const expiryDate=new Date(medicine.expiry_date!).toISOString().split("T")[0];
            return <div
              key={medicine.id}
              onClick={() =>{ handleSelect(medicine)
                console.log('clicked'); }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`
                px-[15px] py-[12px] 
                cursor-pointer flex items-center
                border-b border-gray-100 
                transition-colors duration-200
                ${index === focusedIndex ? "bg-gray-100" : "hover:bg-gray-100"}
                last:border-b-0
              `}
            >
              <div className=" text-gray-800 mb-1">
                {medicine.brand_name}
              </div>
              <div className="flex gap-[15px]  text-[13px] text-gray-600">
                <span className="font-mon text-center">   &nbsp;&nbsp;&nbsp;&nbsp;[ {medicine.dosage_value} {medicine.dosage_unit}]</span>
                
                <span className="font-semibold text-green-600">
                {medicine.form}
                </span>
                <span>[QTY: {medicine.stock_quantity}  
                <span className="font-mono">[{medicine.sub_units_per_unit}]</span>
                + </span>
                  <span className="font-mono">Sub: {medicine.stock_sub_quantity}]</span>
                <span className="font-mono">[Expiry: {expiryDate}]</span>
              </div>
            </div>
})}
        </div>
      )}
    </div>
  );
};
