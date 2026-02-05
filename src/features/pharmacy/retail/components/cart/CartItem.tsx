import React, { useState } from "react";
import { CartItem as CartItemType } from "../../types";

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

  const handleSaveEdit = () => {
    onUpdate({
      quantity: editQty,
      subQuantity: editSubQty,
      discountPercent: editDiscount,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditQty(item.quantity);
    setEditSubQty(item.subQuantity);
    setEditDiscount(item.discountPercent);
    setIsEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`grid grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_1fr_1fr_1.2fr] gap-[10px] px-[20px] py-[16px]
                  border-b border-slate-100/50 cursor-pointer transition-all duration-300
                  items-center
                  ${isSelected ? "bg-indigo-50/50 border-l-4 border-indigo-500 shadow-sm" : "hover:bg-slate-50/80"}
                  ${isEditing ? "bg-amber-50/50 backdrop-blur-sm" : ""}`}
    >
      {/* Product Column */}
      <div className="flex flex-col items-start gap-[2px]">
        <span className="font-semibold text-slate-800 text-[15px]">{item.medicine.brand_name}</span>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          {item.medicine.dosage_value} {item.medicine.dosage_unit} • {item.medicine.form}
        </span>
      </div>

      {/* Batch Column */}
      <div className="flex items-center">
        {item.batchNumber ? (
          <span className="text-[12px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/50">
            {item.batchNumber}
          </span>
        ) : (
          <span className="text-[12px] text-slate-400 italic">No Batch</span>
        )}
      </div>

      {isEditing ? (
        <>
          <div className="flex items-center">
            <input
              type="number"
              value={editQty}
              onChange={(e) => setEditQty(parseInt(e.target.value) || 1)}
              min="1"
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center">
            <input
              type="number"
              value={editSubQty}
              onChange={(e) => setEditSubQty(parseInt(e.target.value) || 0)}
              min="0"
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center text-slate-600 font-medium">PKR {item.price}</div>
          <div className="flex items-center text-indigo-600 font-semibold">
            PKR {item.discountedPrice.toFixed(2)}
          </div>

          <div className="flex items-center gap-1">
            <input
              type="number"
              value={editDiscount}
              onChange={(e) => setEditDiscount(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.01"
              onClick={(e) => e.stopPropagation()}
              className="w-16 px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-slate-400 font-medium">%</span>
          </div>

          <div className="flex items-center justify-end">
            <div className="flex gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
              >
                ✓
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
              >
                ✗
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center text-slate-700 font-medium">{item.quantity}</div>
          <div className="flex items-center text-slate-500">{item.subQuantity}</div>
          <div className="flex items-center text-slate-600 tracking-tight">
            PKR {item.price}
          </div>
          <div className="flex items-center text-indigo-600 font-semibold tracking-tight">
            PKR {item.discountedPrice.toFixed(2)}
          </div>
          <div className="flex items-center">
            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[11px] font-bold">
              {item.discountPercent.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-bold text-slate-900 text-[15px] tracking-tight">
              PKR {item.lineTotal.toFixed(2)}
            </span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                title="Edit"
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                ✎
              </button>
              <button
                title="Remove"
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                🗑
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
