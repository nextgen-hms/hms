import React from "react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  label = "Quantity",
  min = 1,
  max = 9999,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[13px] font-medium text-gray-600 lowercase">
        {label}
      </label>
      <div className="flex gap-[5px]">
        <button
          type="button"
          onClick={decrement}
          className="w-[35px] py-2 bg-gray-100 border border-gray-300 rounded font-bold 
                     hover:bg-gray-200 active:bg-gray-300 transition-colors"
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          className="flex-1 text-center px-[12px] py-[10px] text-[14px] border border-gray-300 rounded 
                     outline-none focus:border-blue-500 transition-colors 
                     [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={increment}
          className="w-[35px] py-2 bg-gray-100 border border-gray-300 rounded font-bold 
                     hover:bg-gray-200 active:bg-gray-300 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};
