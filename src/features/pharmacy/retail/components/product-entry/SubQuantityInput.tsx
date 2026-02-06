import React from "react";

interface SubQuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  available?: number;
  onEnter?: () => void;
}

export const SubQuantityInput: React.FC<SubQuantityInputProps> = ({
  value,
  onChange,
  label = "Sub-Qty",
  min = 0,
  max = 99,
  available,
  onEnter,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEnter?.();
    }
  };

  return (
    <div className="flex flex-col gap-1.5 flex-1 relative group">
      <div className="flex items-center justify-between px-0.5">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
          {label}
        </label>
        {available !== undefined && (
          <span className="text-[10px] font-bold text-slate-400 opacity-80 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
            Avl: <span className="text-indigo-600">{available}</span>
          </span>
        )}
      </div>

      <div className="flex items-stretch bg-white border-2 border-slate-200/60 rounded-2xl overflow-hidden focus-within:border-indigo-500/50 focus-within:shadow-[0_4px_20px_rgba(99,102,241,0.1)] transition-all">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          className="w-full text-center py-3 text-[16px] font-black text-slate-700 outline-none 
                   [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none placeholder:text-slate-300"
          placeholder="0"
        />
      </div>

      {/* Decorative focus bar */}
      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center rounded-full"></div>
    </div>
  );
};
