import React from "react";

interface DiscountInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
}

export const DiscountInput: React.FC<DiscountInputProps> = ({
  value,
  onChange,
  label = "Disc %",
  min = 0,
  max = 100,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 flex-1 relative group">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] px-0.5">
        {label}
      </label>

      <div className="relative bg-white border-2 border-slate-200/60 rounded-2xl overflow-hidden focus-within:border-emerald-500/50 focus-within:shadow-[0_4px_20px_rgba(16,185,129,0.1)] transition-all">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step="0.01"
          placeholder="0.00"
          className="w-full pl-4 pr-10 py-3 text-[16px] font-black text-emerald-600 outline-none 
                   [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none placeholder:text-slate-300"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm select-none">
          %
        </span>
      </div>

      {/* Decorative focus bar */}
      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center rounded-full"></div>
    </div>
  );
};
