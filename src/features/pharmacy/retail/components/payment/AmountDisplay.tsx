import React from 'react';
import { formatCurrency } from '../../utils';

interface AmountDisplayProps {
  label: string;
  amount: number;
  className?: string;
  compact?: boolean;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  label,
  amount,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col rounded-md ${compact ? 'py-2 px-3' : 'p-3'} ${className}`}
    >
      <label className="text-white mb-1">{label}</label>
      <div className={`text-white font-bold ${compact ? 'text-lg' : 'text-2xl'}`}>
        {formatCurrency(amount)}
      </div>
    </div>
  );
};
