import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import NewOrder from './components/NewOrder';
import OrderDetail from './components/OrderDetail';

function App() {
  const [screen, setScreen] = useState('dashboard');
  const [selectedId, setSelectedId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [costs, setCosts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [o, c, h] = await Promise.all([
        supabase.from('orders').select('*').order('delivery_deadline'),
        supabase.from('costs').select('*'),
        supabase.from('stage_history').select('*'),
      ]);
      if (o.error) throw o.error;
      setOrders(o.data || []);
      setCosts(c.data || []);
      setHistory(h.data || []);
      setDbError(null);
    } catch (err) {
      console.error(err);
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function goTo(s, id = null) { setScreen(s); if (id) setSelectedId(id); }

  if (loading) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-2">
      <div className="text-4xl font-serif font-bold text-brown">Firuzeh</div>
      <div className="text-brown/60">Loading...</div>
    </div>
  );

  if (dbError) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-4xl font-serif font-bold text-brown">Firuzeh</div>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md text-left">
        <p className="font-semibold text-red-700 mb-2">Database connection error</p>
        <p className="text-red-600 text-sm mb-3">{dbError}</p>
        <p className="text-sm text-gray-600">Make sure you have:</p>
        <ol className="text-sm text-gray-600 mt-1 ml-4 list-decimal space-y-1">
          <li>Set <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_KEY</code> in Vercel</li>
          <li>Created the database tables (see README)</li>
        </ol>
      </div>
      <button onClick={loadData} className="btn-primary">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      {screen === 'dashboard' && (
        <Dashboard orders={orders} costs={costs}
          onNewOrder={() => goTo('new')}
          onSelectOrder={(id) => goTo('detail', id)} />
      )}
      {screen === 'new' && (
        <NewOrder onBack={() => goTo('dashboard')} onSuccess={() => { loadData(); goTo('dashboard'); }} />
      )}
      {screen === 'detail' && (
        <OrderDetail
          orderId={selectedId}
          order={orders.find(o => o.id === selectedId)}
          costs={costs.filter(c => c.order_id === selectedId)}
          history={history.filter(h => h.order_id === selectedId)}
          onBack={() => goTo('dashboard')}
          onUpdate={loadData} />
      )}
    </div>
  );
}

export default App;
