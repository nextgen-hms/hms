import React from "react";

interface SubQuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
}

export const SubQuantityInput: React.FC<SubQuantityInputProps> = ({
  value,
  onChange,
  label = "Sub Quantity",
  min = 0,
  max = 99,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[13px] font-medium text-gray-600 lowercase">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        placeholder="0"
        className="px-[12px] py-[10px] text-[14px] border border-gray-300 rounded 
                   outline-none focus:border-blue-500 transition-colors 
                   [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
};
