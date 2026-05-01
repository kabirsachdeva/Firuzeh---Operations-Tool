import { useState } from 'react';
import { Plus, Download, Search } from 'lucide-react';
import OrderCard from './OrderCard';
import { exportToExcel } from '../lib/utils';

const STAGES = ['Order Received','Cloth Bought','Dyeing','Tailor (Cutting)','Embroidery','Tailor (Stitching)','Completed'];

export default function Dashboard({ orders, costs, onNewOrder, onSelectOrder }) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [tab, setTab] = useState('active');
  const [exporting, setExporting] = useState(false);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = o.client_name.toLowerCase().includes(q) || o.job_number.toLowerCase().includes(q);
    const matchStage = stageFilter === 'all' || o.current_stage === stageFilter;
    const matchTab = tab === 'active' ? !o.is_completed : o.is_completed;
    return matchSearch && matchStage && matchTab;
  }).sort((a, b) => new Date(a.delivery_deadline) - new Date(b.delivery_deadline));

  async function handleExport() {
    setExporting(true);
    try { await exportToExcel(orders, costs); }
    catch (e) { alert('Export error: ' + e.message); }
    finally { setExporting(false); }
  }

  const activeCount = orders.filter(o => !o.is_completed).length;
  const doneCount = orders.filter(o => o.is_completed).length;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto p-4 pb-8">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-4xl font-serif font-bold text-brown">Firuzeh</h1>
          <p className="text-brown/50 text-sm mt-0.5">Order Management</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-5">
          <button onClick={onNewOrder} className="btn-primary flex items-center gap-2 flex-1 justify-center">
            <Plus size={18} /> New Order
          </button>
          <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2 px-4 py-3 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50">
            <Download size={18} /> {exporting ? '...' : 'Export'}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/40" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search client name or job number..."
            className="input-field pl-11"
          />
        </div>

        {/* Stage filter */}
        <div className="mb-4">
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="input-field">
            <option value="all">All Stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 mb-5 border border-gray-100">
          {[['active', `Active (${activeCount})`], ['completed', `Completed (${doneCount})`]].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === val ? 'bg-brown text-cream' : 'text-brown/60 hover:text-brown'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-brown/40">
              <p className="text-lg font-serif">{tab === 'active' ? 'No active orders' : 'No completed orders'}</p>
              <p className="text-sm mt-1">{tab === 'active' ? 'Create one to get started' : 'Completed orders appear here'}</p>
            </div>
          ) : filtered.map(o => (
            <OrderCard key={o.id} order={o} costs={costs.filter(c => c.order_id === o.id)} onClick={() => onSelectOrder(o.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
