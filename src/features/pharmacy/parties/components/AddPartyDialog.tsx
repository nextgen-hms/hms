'use client';

import { useState } from 'react';
import { addParty } from '../api';
import { AddPartyInput } from '../types';
import toast from 'react-hot-toast';
import { X, Building2 } from 'lucide-react';

interface AddPartyDialogProps {
  onClose: () => void;
  onAdded: () => void;
}

export function AddPartyDialog({ onClose, onAdded }: AddPartyDialogProps) {
  const [form, setForm] = useState<AddPartyInput>({
    name: '',
    contact_number: '',
    address: '',
    email: '',
    gst_number: '',
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Party name is required');
    setSaving(true);
    try {
      await addParty(form);
      toast.success(`Party "${form.name}" added successfully`);
      onAdded();
      onClose();
    } catch {
      toast.error('Failed to add party');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Add New Party</h2>
            <p className="text-xs text-slate-400 font-medium">Supplier / Vendor Information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">
              Party Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Sohail Medical Suppliers"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Contact</label>
              <input
                name="contact_number"
                value={form.contact_number}
                onChange={handleChange}
                placeholder="03XX-XXXXXXX"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">GST/NTN No.</label>
              <input
                name="gst_number"
                value={form.gst_number}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="supplier@example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              placeholder="Full address..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 resize-none"
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
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
