import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDate, getUrgency, calcProfit } from '../lib/utils';

const STAGES = ['Order Received','Cloth Bought','Dyeing','Tailor (Cutting)','Embroidery','Tailor (Stitching)','Completed'];

export default function OrderDetail({ orderId, order, costs, history, onBack, onUpdate }) {
  const [showAddCost, setShowAddCost] = useState(false);
  const [showSetCharge, setShowSetCharge] = useState(false);
  const [newCost, setNewCost] = useState({ stage: '', amount: '', note: '' });
  const [finalCharge, setFinalCharge] = useState('');
  const [busy, setBusy] = useState(false);

  if (!order) return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="text-brown">Not found</div></div>;

  const total = costs.reduce((s, c) => s + Number(c.amount), 0);
  const charge = order.pricing_mode === 'fixed' ? Number(order.fixed_charge) : Number(order.final_charge || 0);
  const profit = calcProfit(order, total);
  const urg = getUrgency(order.delivery_deadline, order.is_completed);

  async function moveStage(stage) {
    setBusy(true);
    try {
      await Promise.all([
        supabase.from('orders').update({ current_stage: stage, is_completed: stage === 'Completed' }).eq('id', orderId),
        supabase.from('stage_history').insert([{ order_id: orderId, stage, date: new Date().toISOString() }]),
      ]);
      onUpdate();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function addCost(e) {
    e.preventDefault();
    if (!newCost.stage || !newCost.amount) { alert('Fill stage and amount'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from('costs').insert([{ order_id: orderId, stage: newCost.stage, amount: parseFloat(newCost.amount), note: newCost.note, date: new Date().toISOString() }]);
      if (error) throw error;
      setNewCost({ stage: '', amount: '', note: '' });
      setShowAddCost(false);
      onUpdate();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function deleteCost(id) {
    if (!window.confirm('Delete this cost?')) return;
    const { error } = await supabase.from('costs').delete().eq('id', id);
    if (error) alert(error.message); else onUpdate();
  }

  async function setCharge(e) {
    e.preventDefault();
    if (!finalCharge) return;
    setBusy(true);
    try {
      const { error } = await supabase.from('orders').update({ final_charge: parseFloat(finalCharge) }).eq('id', orderId);
      if (error) throw error;
      setShowSetCharge(false); setFinalCharge('');
      onUpdate();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto p-4 pb-10">

        <div className="flex items-center gap-3 pt-6 mb-5">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-brown/5 rounded-xl transition-colors">
            <ChevronLeft size={24} className="text-brown" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-brown">{order.job_number}</h1>
              <span className={`text-sm font-medium ${urg.color}`}>{urg.emoji}</span>
            </div>
            <p className="text-brown/60 text-sm">{order.client_name}</p>
          </div>
          <a href={`tel:${order.client_phone}`} className="p-2 bg-gold/20 rounded-xl text-brown hover:bg-gold/30 transition-colors">
            <Phone size={20} />
          </a>
        </div>

        <div className="card bg-brown text-cream mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-xs opacity-60 uppercase mb-1">Costs</div><div className="text-xl font-bold">&#8377;{total.toFixed(0)}</div></div>
            <div><div className="text-xs opacity-60 uppercase mb-1">Charge</div><div className="text-xl font-bold">&#8377;{charge.toFixed(0)}</div></div>
            <div>
              <div className="text-xs opacity-60 uppercase mb-1">Profit</div>
              <div className={`text-xl font-bold ${profit !== null && profit < 0 ? 'text-red-300' : profit !== null ? 'text-green-300' : ''}`}>
                {profit === null ? 'Pending' : '&#8377;' + profit.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><div className="text-xs text-brown/50 uppercase mb-0.5">Deadline</div><div className="font-semibold text-brown">{formatDate(order.delivery_deadline)}</div></div>
            <div><div className="text-xs text-brown/50 uppercase mb-0.5">Stage</div><div className="font-semibold text-brown">{order.current_stage}</div></div>
            <div><div className="text-xs text-brown/50 uppercase mb-0.5">Cloth</div><div className="font-semibold text-brown">{order.cloth_quantity}m</div></div>
            <div><div className="text-xs text-brown/50 uppercase mb-0.5">Pricing</div><div className="font-semibold text-brown">{order.pricing_mode === 'fixed' ? 'Fixed' : 'Cost-Based'}</div></div>
          </div>
          {order.cloth_description && <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-brown/70">{order.cloth_description}</div>}
          {order.notes && <div className="mt-2 text-sm text-brown/60 italic">{order.notes}</div>}
        </div>

        <div className="card mb-4">
          <h2 className="font-serif font-bold text-brown mb-3">Move Stage</h2>
          <div className="grid grid-cols-2 gap-2">
            {STAGES.map(s => (
              <button key={s} onClick={() => moveStage(s)} disabled={busy}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 text-center ${order.current_stage === s ? 'bg-brown text-cream' : 'bg-gray-100 text-brown hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {order.pricing_mode === 'cost-based' && order.is_completed && !order.final_charge && (
          <div className="card border-gold bg-gold/5 mb-4">
            <h2 className="font-serif font-bold text-brown mb-3">Set Final Charge</h2>
            {!showSetCharge ? (
              <button onClick={() => setShowSetCharge(true)} className="btn-secondary w-full">Set Final Charge</button>
            ) : (
              <form onSubmit={setCharge} className="space-y-3">
                <input type="number" step="0.01" min="0" value={finalCharge} onChange={e => setFinalCharge(e.target.value)} className="input-field" placeholder="Final charge" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowSetCharge(false)} className="btn-ghost flex-1">Cancel</button>
                  <button type="submit" disabled={busy} className="btn-primary flex-1 disabled:opacity-50">Save</button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-bold text-brown">Costs</h2>
            <button onClick={() => setShowAddCost(!showAddCost)} className="flex items-center gap-1.5 text-sm font-medium text-brown bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={16} /> Add
            </button>
          </div>

          {showAddCost && (
            <form onSubmit={addCost} className="mb-4 p-4 bg-cream rounded-xl border border-gold/20 space-y-3">
              <select value={newCost.stage} onChange={e => setNewCost(p => ({...p, stage: e.target.value}))} className="input-field">
                <option value="">Select stage</option>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" step="0.01" min="0" value={newCost.amount} onChange={e => setNewCost(p => ({...p, amount: e.target.value}))} className="input-field" placeholder="Amount" />
              <input value={newCost.note} onChange={e => setNewCost(p => ({...p, note: e.target.value}))} className="input-field" placeholder="Note" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddCost(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={busy} className="btn-primary flex-1 disabled:opacity-50">Add</button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {costs.length === 0 ? (
              <p className="text-sm text-brown/40 text-center py-4">No costs yet</p>
            ) : costs.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-brown">{c.stage}</div>
                  {c.note && <div className="text-xs text-brown/60 truncate">{c.note}</div>}
                  <div className="text-xs text-brown/40">{formatDate(c.date)}</div>
                </div>
                <div className="font-bold text-brown shrink-0">&#8377;{Number(c.amount).toFixed(0)}</div>
                <button onClick={() => deleteCost(c.id)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
          {costs.length > 0 && (
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="font-semibold text-brown">Total</span>
              <span className="text-xl font-bold text-brown">&#8377;{total.toFixed(0)}</span>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-serif font-bold text-brown mb-3">Stage History</h2>
          {history.length === 0 ? <p className="text-sm text-brown/40">No history yet</p> : (
            <div className="space-y-3">
              {[...history].reverse().map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-brown">{h.stage}</div>
                    <div className="text-xs text-brown/50">{formatDate(h.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
