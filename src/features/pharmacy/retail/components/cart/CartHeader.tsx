import React from "react";

export const CartHeader: React.FC = () => {
  return (
    <div
      className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_1fr_1fr_1.2fr] gap-[10px] px-[20px] py-[14px]
                 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 
                 font-bold text-[13px] text-slate-600 uppercase tracking-wider sticky top-0 z-10"
    >
      <div className="flex items-center">Product</div>
      <div className="flex items-center">Batch</div>
      <div className="flex items-center">Qty</div>
      <div className="flex items-center">Sub.Qty</div>
      <div className="flex items-center">Price</div>
      <div className="flex items-center">Disc. Price</div>
      <div className="flex items-center">Discount</div>
      <div className="flex items-center">Line Total</div>
    </div>
  );
};
