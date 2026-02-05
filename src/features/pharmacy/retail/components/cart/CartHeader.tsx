import React from "react";

export const CartHeader: React.FC = () => {
  return (
    <div
      className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr_1fr_1fr_1.2fr] gap-[10px] px-[15px] py-[12px]
                 bg-gray-100 border-b-2 border-gray-300 font-semibold text-[13px] text-gray-600"
    >
      <div className="flex items-center">Product</div>
      <div className="flex items-center">Qty</div>
      <div className="flex items-center">Sub.Qty</div>
      <div className="flex items-center">Price</div>
      <div className="flex items-center">Disc. Price</div>
      <div className="flex items-center">Discount</div>
      <div className="flex items-center">Line Total</div>
    </div>
  );
};
