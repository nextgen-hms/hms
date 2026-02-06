import React, { useState } from "react";
import { CartItem as CartItemType } from "../../types";
import { formatCurrency } from "../../utils";
import { QuantityInput, SubQuantityInput, DiscountInput, CustomPriceInput } from "../product-entry";

interface CartItemProps {
  item: CartItemType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CartItemType>) => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState(item.quantity);
  const [editSubQty, setEditSubQty] = useState(item.subQuantity);
  const [editDiscount, setEditDiscount] = useState(item.discountPercent);
  const [editPrice, setEditPrice] = useState<number | undefined>(item.price);

  const handleSaveEdit = () => {
    onUpdate({
      quantity: editQty,
      subQuantity: editSubQty,
      discountPercent: editDiscount,
      customPrice: editPrice,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditQty(item.quantity);
    setEditSubQty(item.subQuantity);
    setEditDiscount(item.discountPercent);
    setEditPrice(item.price);
    setIsEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`group grid grid-cols-[2.5fr_1fr_0.8fr_0.8fr_1fr_1fr_1fr_1.2fr_1.5fr] gap-4 px-6 py-5 
                  border-b border-slate-100/50 cursor-pointer transition-all duration-300
                  items-center relative overflow-hidden
                  ${isSelected ? "bg-indigo-50/50 shadow-[inset_4px_0_0_#6366f1]" : "hover:bg-slate-50/50"}
                  ${isEditing ? "bg-amber-50/20" : ""}`}
    >
      {/* Product Column */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-black text-slate-800 text-[14px] tracking-tight truncate">{item.medicine.brand_name}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
            {item.medicine.generic_name}
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest whitespace-nowrap">
            {item.medicine.form}
          </span>
        </div>
      </div>

      {/* Batch Column */}
      <div className="flex items-center">
        {item.batchNumber ? (
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100/50 shadow-sm">
            {item.batchNumber}
          </span>
        ) : (
          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Global</span>
        )}
      </div>

      {isEditing ? (
        <>
          <div className="flex items-center">
            <QuantityInput
              value={editQty}
              onChange={setEditQty}
              label=""
              min={0}
              available={item.medicine.batch_stock_quantity ?? item.medicine.stock_quantity}
            />
          </div>

          <div className="flex items-center">
            <SubQuantityInput
              value={editSubQty}
              onChange={setEditSubQty}
              label=""
              available={item.medicine.batch_stock_sub_quantity ?? item.medicine.stock_sub_quantity}
            />
          </div>

          <div className="flex items-center justify-end pr-2 col-span-2">
            <CustomPriceInput value={editPrice} onChange={setEditPrice} label="" />
          </div>

          <div className="flex items-center justify-center">
            <DiscountInput value={editDiscount} onChange={setEditDiscount} label="" />
          </div>

          <div className="flex items-center justify-end pr-10">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Estimate</span>
              <span className="text-[16px] text-indigo-600 font-black tracking-tighter">
                {formatCurrency(item.lineTotal)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              className="w-10 h-10 flex items-center justify-center text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-90"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveEdit();
              }}
            >
              <span className="font-bold">✓</span>
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center text-slate-400 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all active:scale-90"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelEdit();
              }}
            >
              <span className="font-bold">✗</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center">
            <span className={`text-[18px] font-black tracking-tighter italic ${item.quantity === 0 ? 'text-slate-200' : 'text-slate-900'}`}>
              {item.quantity}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className={`text-[14px] font-black ${item.subQuantity > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>
              {item.subQuantity}
            </span>
          </div>

          <div className="flex items-center justify-end pr-4">
            <span className="text-[14px] text-slate-500 font-medium tracking-tight whitespace-nowrap">{formatCurrency(item.price)}</span>
          </div>

          <div className="flex items-center justify-end pr-4">
            <span className="text-[14px] text-indigo-600 font-bold tracking-tight whitespace-nowrap">{formatCurrency(item.discountedPrice)}</span>
          </div>

          <div className="flex items-center justify-center">
            <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black tracking-tighter flex items-center gap-1">
              {item.discountPercent.toFixed(1)}% <span className="text-[8px] opacity-60">OFF</span>
            </span>
          </div>

          <div className="flex items-center justify-end pr-10">
            <span className="font-black text-slate-900 text-[18px] tracking-tighter whitespace-nowrap">
              {formatCurrency(item.lineTotal)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1">
            <button
              title="Edit"
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <span className="text-lg">✎</span>
            </button>
            <button
              title="Remove"
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <span className="text-lg text-rose-400">🗑</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
