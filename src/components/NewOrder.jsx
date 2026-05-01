import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateJobNumber } from '../lib/utils';

export default function NewOrder({ onBack, onSuccess }) {
  const [jobNumber, setJobNumber] = useState('');
  const [form, setForm] = useState({
    client_name: '', client_phone: '', cloth_description: '',
    cloth_quantity: '', delivery_deadline: '', pricing_mode: 'fixed',
    fixed_charge: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    generateJobNumber().then(setJobNumber);
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.client_name || !form.client_phone || !form.delivery_deadline) {
      setError('Please fill in all required fields'); return;
    }
    setSubmitting(true); setError('');
    try {
      const { error: err } = await supabase.from('orders').insert([{
        job_number: jobNumber,
        client_name: form.client_name.trim(),
        client_phone: form.client_phone.trim(),
        cloth_description: form.cloth_description.trim(),
        cloth_quantity: parseFloat(form.cloth_quantity) || 0,
        delivery_deadline: form.delivery_deadline,
        pricing_mode: form.pricing_mode,
        fixed_charge: form.pricing_mode === 'fixed' ? parseFloat(form.fixed_charge) || 0 : 0,
        notes: form.notes.trim(),
        current_stage: 'Order Received',
        is_completed: false,
      }]);
      if (err) throw err;
      onSuccess();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto p-4 pb-10">
        {/* Header */}
        <div className="flex items-center gap-3 pt-6 mb-6">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-brown/5 rounded-xl transition-colors">
            <ChevronLeft size={24} className="text-brown" />
          </button>
          <h1 className="text-2xl font-serif font-bold text-brown">New Order</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm">{error}</div>
        )}

        {/* Job Number */}
        <div className="bg-brown text-cream rounded-2xl p-5 mb-5">
          <div className="text-xs font-medium opacity-60 uppercase tracking-wider mb-1">Auto-Generated Job Number</div>
          <div className="text-3xl font-serif font-bold">{jobNumber || 'Loading...'}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client */}
          <div className="card space-y-4">
            <h2 className="font-serif font-bold text-brown text-lg">Client</h2>
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Name *</label>
              <input value={form.client_name} onChange={e => set('client_name', e.target.value)}
                className="input-field" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Phone *</label>
              <input type="tel" value={form.client_phone} onChange={e => set('client_phone', e.target.value)}
                className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>

          {/* Cloth */}
          <div className="card space-y-4">
            <h2 className="font-serif font-bold text-brown text-lg">Cloth Details</h2>
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Description *</label>
              <textarea value={form.cloth_description} onChange={e => set('cloth_description', e.target.value)}
                className="input-field" rows={2} placeholder="e.g. Pure silk, banarasi weave, deep red" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Quantity (meters) *</label>
              <input type="number" step="0.1" min="0" value={form.cloth_quantity}
                onChange={e => set('cloth_quantity', e.target.value)}
                className="input-field" placeholder="6.5" />
            </div>
          </div>

          {/* Delivery & Pricing */}
          <div className="card space-y-4">
            <h2 className="font-serif font-bold text-brown text-lg">Delivery & Pricing</h2>
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Delivery Deadline *</label>
              <input type="date" value={form.delivery_deadline}
                onChange={e => set('delivery_deadline', e.target.value)} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-2">Pricing Mode</label>
              <div className="flex gap-3">
                {[['fixed','Fixed Price'],['cost-based','Cost-Based']].map(([val, label]) => (
                  <label key={val} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 cursor-pointer transition-all ${form.pricing_mode === val ? 'border-brown bg-brown text-cream' : 'border-gray-200 text-brown hover:border-brown/40'}`}>
                    <input type="radio" name="pricing_mode" value={val}
                      checked={form.pricing_mode === val} onChange={e => set('pricing_mode', e.target.value)}
                      className="hidden" />
                    <span className="font-medium text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.pricing_mode === 'fixed' && (
              <div>
                <label className="block text-sm font-medium text-brown mb-1.5">Fixed Charge (₹)</label>
                <input type="number" step="0.01" min="0" value={form.fixed_charge}
                  onChange={e => set('fixed_charge', e.target.value)}
                  className="input-field" placeholder="3500" />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card">
            <label className="block text-sm font-medium text-brown mb-1.5">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              className="input-field" rows={2} placeholder="Any special instructions..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onBack} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={submitting || !jobNumber} className="btn-primary flex-1 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
