'use client';

import { useState } from 'react';
import { recordPayment } from '../api';
import toast from 'react-hot-toast';
import { X, DollarSign } from 'lucide-react';

interface RecordPaymentDialogProps {
  partyId: number;
  partyName: string;
  onClose: () => void;
  onRecorded: () => void;
}

export function RecordPaymentDialog({ partyId, partyName, onClose, onRecorded }: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [referenceNote, setReferenceNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await recordPayment({
        party_id: partyId,
        amount: numAmount,
        payment_method: paymentMethod,
        reference_note: referenceNote,
      });
      toast.success(`Payment of Rs. ${numAmount.toLocaleString()} recorded`);
      onRecorded();
      onClose();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-teal-500 text-white rounded-2xl shadow-lg shadow-teal-500/20">
            <DollarSign size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Record Payment</h2>
            <p className="text-xs text-slate-400 font-semibold truncate max-w-[180px]">To: {partyName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Amount (Rs.)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xl font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50"
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
              <option>Online</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Reference / Note</label>
            <input
              value={referenceNote}
              onChange={e => setReferenceNote(e.target.value)}
              placeholder="e.g. Cheque #1234, Invoice settlement..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-teal-500 text-white text-sm font-black shadow-lg shadow-teal-500/30 hover:bg-teal-600 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
