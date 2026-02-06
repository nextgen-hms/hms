"use client"
import React, { useState } from 'react';
import { CartItem, PaymentDetails, PaymentType } from '../../types';
import { CreditCard, Banknote, ShieldCheck, Smartphone, Hash, Save, Printer, Play, RefreshCw, Trash2, Layout } from 'lucide-react';
import { submitTransaction, holdTransaction, printReceipt, openCashDrawer } from '../../api';
import { generateReference, formatCurrency } from '../../utils';
import toast from 'react-hot-toast';

interface CheckoutCardProps {
    cart: CartItem[];
    payment: PaymentDetails;
    onPaymentTypeChange: (type: PaymentType) => void;
    onPaidAmountChange: (amount: number) => void;
    onAdjustmentChange: (percent: number) => void;
    onComplete: () => void;
    onClear: () => void;
}

export const CheckoutCard: React.FC<CheckoutCardProps> = ({
    cart,
    payment,
    onPaymentTypeChange,
    onPaidAmountChange,
    onAdjustmentChange,
    onComplete,
    onClear,
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);

    const handlePayNow = async () => {
        if (cart.length === 0) return toast.error('Cart is empty');

        if (payment.dueAmount > 0) {
            toast.error(`Due amount: ${formatCurrency(payment.dueAmount)}. Please enter full amount.`, {
                duration: 4000,
            });
            return;
        }

        setIsProcessing(true);
        try {
            const transaction = {
                reference: generateReference(),
                items: cart,
                payment,
                cashier: 'Current User',
                status: 'completed' as const,
            };

            const response = await submitTransaction(transaction);
            if (response.success && response.data) {
                setLastTransactionId(response.data.id);
                await printReceipt(response.data.id);
                if (payment.type === PaymentType.CASH) await openCashDrawer();
                toast.success('Transaction completed successfully!');
                onComplete();
            } else toast.error(response.error || 'Transaction failed');
        } catch (err) {
            console.error(err);
            toast.error('Error during transaction');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleHold = async () => {
        if (cart.length === 0) return toast.error('Cart is empty');
        setIsProcessing(true);
        try {
            const transaction = {
                reference: generateReference(),
                items: cart,
                payment,
                cashier: 'Current User',
                status: 'held' as const,
            };

            const response = await holdTransaction(transaction);
            if (response.success && response.data) {
                toast.success(`Transaction held successfully!`);
                onComplete();
            } else toast.error(response.error || 'Failed to hold transaction');
        } catch (err) {
            console.error(err);
            toast.error('Error while holding transaction');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full gap-8">
            {/* 1. Value Summary Area */}
            <div className="space-y-6">
                <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Total Payable</label>
                    <div className="text-5xl font-black text-white tracking-tight">
                        {formatCurrency(payment.payableAmount)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Items Disc</label>
                        <div className="text-xl font-bold text-emerald-400">{formatCurrency(payment.itemsDiscount)}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Total Savings</label>
                        <div className="text-xl font-bold text-emerald-400">{formatCurrency(payment.totalDiscount)}</div>
                    </div>
                </div>
            </div>

            {/* 2. Payment Control Center */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                {/* Payment Type Grid */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: PaymentType.CASH, label: 'Cash', icon: Banknote },
                        { id: PaymentType.CARD, label: 'Card', icon: CreditCard },
                        { id: PaymentType.INSURANCE, label: 'Insure', icon: ShieldCheck },
                    ].map((type) => (
                        <button
                            key={type.id}
                            onClick={() => onPaymentTypeChange(type.id)}
                            className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${payment.type === type.id
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                                : 'bg-transparent border-white/10 text-slate-400 hover:bg-white/5'
                                }`}
                        >
                            <type.icon size={18} />
                            <span className="text-[10px] font-bold uppercase">{type.label}</span>
                        </button>
                    ))}
                </div>

                {/* Amount Received / Change Area */}
                <div className="space-y-4">
                    <div className="relative group">
                        <label className="absolute -top-2 left-4 px-1 bg-slate-900 text-[10px] font-bold text-slate-400 uppercase z-10">Amount Received</label>
                        <input
                            type="number"
                            value={payment.paidAmount || ''}
                            onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border-2 border-white/10 group-hover:border-emerald-500/50 focus:border-emerald-500 rounded-2xl py-5 px-6 text-2xl font-bold text-white outline-none transition-all placeholder:text-white/10"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-slate-400">Change Due</span>
                        <span className={`text-2xl font-black ${payment.changeAmount > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                            {formatCurrency(payment.changeAmount)}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Operational Actions */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button
                    onClick={handlePayNow}
                    data-pay-button
                    disabled={isProcessing || cart.length === 0}
                    className="col-span-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:grayscale text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 text-lg transition-all active:scale-95 uppercase tracking-wider"
                >
                    {isProcessing ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" size={20} />}
                    Process & Print Bill
                </button>

                <button
                    onClick={handleHold}
                    data-hold-button
                    disabled={isProcessing || cart.length === 0}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase transition-all"
                >
                    <Save size={14} />
                    Hold Bill
                </button>

                <button
                    onClick={onClear}
                    disabled={isProcessing || cart.length === 0}
                    className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase transition-all"
                >
                    <Trash2 size={14} />
                    Void
                </button>
            </div>
        </div>
    );
};
