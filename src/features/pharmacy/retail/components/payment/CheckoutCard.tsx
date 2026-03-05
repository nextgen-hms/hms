"use client"
import React, { useState } from 'react';
import { CartItem, PaymentDetails, PaymentType } from '../../types';
import { CreditCard, Banknote, ShieldCheck, Smartphone, Hash, Save, Printer, Play, RefreshCw, Trash2, Layout, RotateCcw } from 'lucide-react';
import { submitTransaction, submitReturn, holdTransaction, printReceipt, openCashDrawer } from '../../api';
import { generateReference, formatCurrency } from '../../utils';
import { POSMode } from '../../types';
import toast from 'react-hot-toast';

interface CheckoutCardProps {
    cart: CartItem[];
    payment: PaymentDetails;
    onPaymentTypeChange: (type: PaymentType) => void;
    onPaidAmountChange: (amount: number) => void;
    onAdjustmentChange: (percent: number) => void;
    onComplete: () => void;
    onClear: () => void;
    onBackToSearch?: () => void;
    mode: POSMode;
}

export interface CheckoutCardHandle {
    focusAmountReceived: () => void;
}

export const CheckoutCard = React.forwardRef<CheckoutCardHandle, CheckoutCardProps>(({
    cart,
    payment,
    onPaymentTypeChange,
    onPaidAmountChange,
    onAdjustmentChange,
    onComplete,
    onClear,
    onBackToSearch,
    mode
}, ref) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [autoPrint, setAutoPrint] = useState(true);
    const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);

    const amountInputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => ({
        focusAmountReceived: () => {
            if (mode === 'RETURN' && payment.paidAmount === 0) {
                onPaidAmountChange(payment.payableAmount);
            }
            amountInputRef.current?.focus();
            amountInputRef.current?.select();
        }
    }));

    const handleProcessSale = async () => {
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
                mode
            };

            const response = mode === 'SALE'
                ? await submitTransaction(transaction)
                : await submitReturn(transaction);

            if (response.success && response.data) {
                const newTxId = response.data.id;
                setLastTransactionId(newTxId);

                // Auto-print if enabled
                if (autoPrint) {
                    setIsPrinting(true);
                    await printReceipt(newTxId);
                    setIsPrinting(false);
                }

                if (payment.type === PaymentType.CASH) await openCashDrawer();
                toast.success('Transaction completed successfully!');
                onComplete();
            } else toast.error(response.error || 'Transaction failed');
        } catch (err) {
            console.error(err);
            toast.error('Error during transaction');
        } finally {
            setIsProcessing(false);
            setIsPrinting(false);
        }
    };

    const handleManualPrint = async () => {
        if (!lastTransactionId) {
            toast.error('No recent transaction to print');
            return;
        }
        setIsPrinting(true);
        try {
            await printReceipt(lastTransactionId);
            toast.success('Receipt sent to printer');
        } catch (err) {
            toast.error('Printing failed');
        } finally {
            setIsPrinting(false);
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
                mode
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

    const handleAmountKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleProcessSale();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onBackToSearch?.();
        }
    };

    return (
        <div className="flex flex-col h-full gap-8">
            {/* 1. Value Summary Area */}
            <div className="space-y-6">
                <div>
                    <label className={`text-[11px] font-bold uppercase tracking-widest mb-2 block ${mode === 'SALE' ? 'text-slate-400' : 'text-rose-400'}`}>
                        {mode === 'SALE' ? 'Total Payable' : 'Total Refundable'}
                    </label>
                    <div className={`text-5xl font-black tracking-tight ${mode === 'SALE' ? 'text-white' : 'text-rose-400'}`}>
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
                        <label className="absolute -top-2 left-4 px-1 bg-slate-900 text-[10px] font-bold text-slate-400 uppercase z-10">
                            {mode === 'SALE' ? 'Amount Received' : 'Amount Refunded'}
                        </label>
                        <input
                            ref={amountInputRef}
                            type="number"
                            value={payment.paidAmount || ''}
                            onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                            onKeyDown={handleAmountKeyDown}
                            className="w-full bg-transparent border-2 border-white/10 group-hover:border-emerald-500/50 focus:border-emerald-500 rounded-2xl py-5 px-6 text-2xl font-bold text-white outline-none transition-all placeholder:text-white/10"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-slate-400">
                            {mode === 'SALE' ? 'Change Due' : 'Balance Remaining'}
                        </span>
                        <span className={`text-2xl font-black ${payment.changeAmount > 0 || (mode === 'RETURN' && payment.dueAmount === 0) ? 'text-emerald-400' : 'text-slate-600'}`}>
                            {formatCurrency(mode === 'SALE' ? payment.changeAmount : payment.dueAmount)}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Operational Actions */}
            <div className="flex flex-col gap-4 mt-auto">
                {/* Auto-print Toggle */}
                <div className="flex items-center justify-between px-2 py-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <Printer size={14} className="text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-print receipt</span>
                    </div>
                    <button
                        onClick={() => setAutoPrint(!autoPrint)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${autoPrint ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${autoPrint ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleProcessSale}
                        data-pay-button
                        disabled={isProcessing || cart.length === 0}
                        className={`col-span-2 disabled:opacity-50 disabled:grayscale text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg transition-all active:scale-95 uppercase tracking-wider ${mode === 'SALE'
                            ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                            : 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20'
                            }`}
                    >
                        {isProcessing ? (
                            <RefreshCw className="animate-spin" />
                        ) : mode === 'SALE' ? (
                            <Play fill="currentColor" size={20} />
                        ) : (
                            <RotateCcw size={20} />
                        )}
                        {mode === 'SALE' ? 'Complete Sale' : 'Process Return'}
                    </button>

                    <button
                        onClick={handleManualPrint}
                        disabled={isPrinting || !lastTransactionId}
                        className="col-span-2 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 disabled:opacity-30 text-indigo-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase transition-all"
                    >
                        {isPrinting ? <RefreshCw className="animate-spin" size={14} /> : <Printer size={14} />}
                        Print Last Receipt
                    </button>

                    <button
                        onClick={handleHold}
                        data-hold-button
                        disabled={isProcessing || cart.length === 0}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase transition-all"
                    >
                        <Save size={14} />
                        Hold
                    </button>

                    <button
                        onClick={onClear}
                        disabled={isProcessing || cart.length === 0}
                        className="bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase transition-all"
                    >
                        <Trash2 size={14} />
                        Void
                    </button>
                </div>
            </div>
        </div>
    );
});
