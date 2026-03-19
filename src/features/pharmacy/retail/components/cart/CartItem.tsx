import React, { useState } from "react";
import { CartItem as CartItemType } from "../../types";
import { formatCurrency } from "../../utils";
import { QuantityInput, SubQuantityInput, DiscountInput, CustomPriceInput } from "../product-entry";
import toast from "react-hot-toast";

interface CartItemProps {
  item: CartItemType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CartItemType>) => void;
  onRemove: () => void;
  prescriptionMode?: boolean;
  onResolveUnavailable?: (item: CartItemType) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  prescriptionMode = false,
  onResolveUnavailable,
}) => {
  const isPrescriptionItem = prescriptionMode && Boolean(item.prescriptionMedicineId);
  const isUnavailablePrescription =
    isPrescriptionItem &&
    (item.availabilityStatus === "out_of_stock" || item.availabilityStatus === "insufficient_stock") &&
    item.fulfillmentMode !== "override";
  const isOverrideItem = item.fulfillmentMode === "override";
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState(item.quantity);
  const [editSubQty, setEditSubQty] = useState(item.subQuantity);
  const [editDiscount, setEditDiscount] = useState(item.discountPercent);
  const [editPrice, setEditPrice] = useState<number | undefined>(item.price);

  const handleSaveEdit = () => {
    try {
      onUpdate({
        quantity: editQty,
        subQuantity: editSubQty,
        discountPercent: editDiscount,
        customPrice: editPrice,
      });
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update cart item");
    }
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
      className={`group grid grid-cols-[3.5fr_1.2fr_0.8fr_0.8fr_1fr_1fr_1fr_1.2fr_1.5fr] gap-4 px-6 py-5 
                  border-b border-slate-100/50 cursor-pointer transition-all duration-300
                  items-center relative overflow-hidden
                  ${isSelected ? "bg-indigo-50/50 shadow-[inset_4px_0_0_#6366f1]" : "hover:bg-slate-50/50"}
                  ${isEditing ? "bg-amber-50/20" : ""}`}
    >
      {/* Product Column */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-800 text-[14px] tracking-tight truncate">{item.medicine.brand_name}</span>
          {isPrescriptionItem && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
              Rx
            </span>
          )}
          {isUnavailablePrescription && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-rose-700">
              {item.availabilityStatus === "insufficient_stock" ? "Low Stock" : "Out of Stock"}
            </span>
          )}
          {isOverrideItem && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-amber-700">
              Override
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
            {item.medicine.generic_name}
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest whitespace-nowrap">
            {item.medicine.form}
          </span>
        </div>
        {(item.availabilityNote || item.overrideReasonNote) && (
          <div className="truncate text-[10px] text-slate-500">
            {item.overrideReasonNote || item.availabilityNote}
          </div>
        )}
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
              available={item.medicine.batch_stock_quantity ?? (item.medicine as any).total_stock_quantity}
            />
          </div>

          {isPrescriptionItem ? (
            <>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[14px] font-black text-slate-300">{item.subQuantity}</span>
              </div>
              <div className="col-span-2 flex items-center justify-end pr-4">
                <span className="text-[14px] font-medium text-slate-500 whitespace-nowrap">{formatCurrency(item.price)}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black tracking-tighter text-slate-500">
                  Locked
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <SubQuantityInput
                  value={editSubQty}
                  onChange={setEditSubQty}
                  label=""
                  perUnit={item.medicine.sub_units_per_unit}
                  available={
                    ((item.medicine.batch_stock_quantity ?? (item.medicine as any).total_stock_quantity ?? 0) * (item.medicine.sub_units_per_unit || 1)) +
                    (item.medicine.batch_stock_sub_quantity ?? (item.medicine as any).total_stock_sub_quantity ?? 0)
                  }
                />
              </div>

              <div className="flex items-center justify-end pr-2 col-span-2">
                <CustomPriceInput value={editPrice} onChange={setEditPrice} label="" />
              </div>

              <div className="flex items-center justify-center">
                <DiscountInput value={editDiscount} onChange={setEditDiscount} label="" />
              </div>
            </>
          )}

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
            {item.isBillable === false ? (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black tracking-tighter">
                Excluded
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black tracking-tighter flex items-center gap-1">
                {item.discountPercent.toFixed(1)}% <span className="text-[8px] opacity-60">OFF</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-end pr-10">
            <span className="font-black text-slate-900 text-[18px] tracking-tighter whitespace-nowrap">
              {formatCurrency(item.lineTotal)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1">
            {isUnavailablePrescription && onResolveUnavailable ? (
              <button
                title="Include with override"
                className="h-10 rounded-xl border border-amber-200 bg-amber-50 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700 transition-all hover:bg-amber-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolveUnavailable(item);
                }}
              >
                Include
              </button>
            ) : null}
            <button
              title="Edit"
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isUnavailablePrescription}
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
