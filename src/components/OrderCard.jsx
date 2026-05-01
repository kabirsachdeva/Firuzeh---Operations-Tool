import { getUrgency, formatDate, calcProfit } from '../lib/utils';

export default function OrderCard({ order, costs, onClick }) {
  const total = costs.reduce((s, c) => s + Number(c.amount), 0);
  const charge = order.pricing_mode === 'fixed' ? Number(order.fixed_charge) : Number(order.final_charge || 0);
  const profit = calcProfit(order, total);
  const urg = getUrgency(order.delivery_deadline, order.is_completed);

  return (
    <div onClick={onClick}
      className="card cursor-pointer hover:shadow-md hover:border-gold/40 active:scale-[0.99] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-lg font-serif font-bold text-brown">{order.job_number}</span>
            <span className={`text-sm font-medium ${urg.color}`}>{urg.emoji} {urg.label}</span>
          </div>
          <p className="font-semibold text-brown mb-1">{order.client_name}</p>
          <div className="text-sm text-brown/60 space-y-0.5">
            <div>{order.current_stage}</div>
            <div>Due: {formatDate(order.delivery_deadline)}</div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-brown/50 mb-0.5">Cost</div>
          <div className="font-bold text-brown">₹{total.toFixed(0)}</div>
          <div className="text-xs text-brown/50 mt-1 mb-0.5">Charge</div>
          <div className="font-bold text-brown">₹{charge.toFixed(0)}</div>
          {profit !== null && (
            <>
              <div className="text-xs text-brown/50 mt-1 mb-0.5">Profit</div>
              <div className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{profit.toFixed(0)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
