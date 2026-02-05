import React from "react";

interface CustomPriceInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  label?: string;
}

export const CustomPriceInput: React.FC<CustomPriceInputProps> = ({
  value,
  onChange,
  label = "Retail Price",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === "") {
      onChange(undefined);
    } else {
      const parsed = parseFloat(newValue);
      if (!isNaN(parsed) && parsed >= 0) {
        onChange(parsed);
      }
    }
  };

  return (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[13px] font-medium text-gray-600 lowercase">
        {label}
      </label>
      <div className="relative">
        {/* <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-600 font-medium">
          
        </span> */}
        <input
          type="number"
          value={value ?? ""}
          onChange={handleChange}
          min="0"
          step="0.01"
          placeholder="0.00"
          className="w-full px-[12px] py-[10px] pl-[10px] text-[14px] border border-gray-300 rounded 
                     outline-none focus:border-blue-500 transition-colors 
                     [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
};
