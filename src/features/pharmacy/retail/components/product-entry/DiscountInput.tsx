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
  label = "Discount %",
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
    <div className="flex flex-col gap-[5px]">
      <label className="text-[13px] font-medium text-gray-600 lowercase">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step="0.01"
          placeholder="0.00"
          className="w-full px-[12px] py-[10px] pr-[35px] text-[14px] border border-gray-300 rounded 
                     outline-none focus:border-blue-500 transition-colors 
                     [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-gray-600 font-medium">
          %
        </span>
      </div>
    </div>
  );
};
