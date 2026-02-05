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
      className={`grid grid-cols-[2fr_0.8fr_0.8fr_1fr_1fr_1fr_1.2fr] gap-[10px] px-[15px] py-[12px]
                  border-b border-gray-100 cursor-pointer transition-colors duration-200
                  ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""}
                  ${isEditing ? "bg-orange-50" : "hover:bg-gray-50"}`}
    >
      {/* Product Column */}
      <div className="flex flex-col items-start gap-[4px]">
        <span className="font-medium text-gray-800">{item.medicine.brand_name}</span>
        {item.medicine.batchNumber && (
          <span className="text-xs text-gray-600">
            Batch: {item.medicine.batchNumber}
          </span>
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
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center">
            <input
              type="number"
              value={editSubQty}
              onChange={(e) => setEditSubQty(parseInt(e.target.value) || 0)}
              min="0"
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center">${item.price}</div>
          <div className="flex items-center">
            ${item.discountedPrice.toFixed(2)}
          </div>

          <div className="flex items-center">
            <input
              type="number"
              value={editDiscount}
              onChange={(e) => setEditDiscount(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.01"
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
            %
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <button
                className="px-2 py-1 text-green-600 border border-green-500 rounded hover:bg-green-500 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
              >
                ✓
              </button>
              <button
                className="px-2 py-1 text-red-600 border border-red-500 rounded hover:bg-red-500 hover:text-white"
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
          <div className="flex items-center">{item.quantity}</div>
          <div className="flex items-center">{item.subQuantity}</div>
          <div className="flex items-center">
            ${item.price}
          </div>
          <div className="flex items-center">
            ${item.discountedPrice.toFixed(2)}
          </div>
          <div className="flex items-center">
            {item.discountPercent.toFixed(2)}%
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-green-600">
              ${item.lineTotal.toFixed(2)}
            </span>
            <div className="flex gap-1">
              <button
                title="Edit"
                className="px-2 py-1 border border-gray-300 rounded hover:bg-blue-500 hover:text-white hover:border-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                ✎
              </button>
              <button
                title="Remove"
                className="px-2 py-1 border border-gray-300 rounded hover:bg-red-500 hover:text-white hover:border-red-500"
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
