import { supabase } from './supabase';
import * as XLSX from 'xlsx';

export async function generateJobNumber() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('job_number')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return 'FRZ-001';

    const lastNumber = parseInt(data[0].job_number.split('-')[1]) + 1;
    return `FRZ-${String(lastNumber).padStart(3, '0')}`;
  } catch {
    return 'FRZ-001';
  }
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function getUrgency(deadline, isCompleted) {
  if (isCompleted) return { emoji: '✓', label: 'Completed', color: 'text-green-700' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline); dl.setHours(0, 0, 0, 0);
  const days = Math.ceil((dl - today) / 86400000);
  if (days < 0) return { emoji: '🔴', label: 'Overdue', color: 'text-red-600' };
  if (days <= 2) return { emoji: '🟡', label: 'Due soon', color: 'text-amber-600' };
  return { emoji: '🟢', label: 'On track', color: 'text-green-600' };
}

export function calcProfit(order, totalCosts) {
  if (order.pricing_mode === 'fixed') return order.fixed_charge - totalCosts;
  if (order.is_completed && order.final_charge) return order.final_charge - totalCosts;
  return null;
}

export async function exportToExcel(orders, costs) {
  const wb = XLSX.utils.book_new();

  const ordersData = orders.map(o => {
    const oc = costs.filter(c => c.order_id === o.id);
    const tc = oc.reduce((s, c) => s + Number(c.amount), 0);
    const charge = o.pricing_mode === 'fixed' ? Number(o.fixed_charge) : Number(o.final_charge || 0);
    return {
      'Job Number': o.job_number,
      'Client Name': o.client_name,
      'Client Phone': o.client_phone,
      'Deadline': formatDate(o.delivery_deadline),
      'Stage': o.current_stage,
      'Total Cost (₹)': tc.toFixed(2),
      'Charge (₹)': charge.toFixed(2),
      'Profit (₹)': (charge - tc).toFixed(2),
      'Status': o.is_completed ? 'Completed' : 'Active',
      'Pricing': o.pricing_mode === 'fixed' ? 'Fixed' : 'Cost-Based',
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ordersData), 'Orders Summary');

  const costsData = costs.map(c => {
    const o = orders.find(o => o.id === c.order_id);
    return {
      'Job Number': o?.job_number,
      'Client Name': o?.client_name,
      'Stage': c.stage,
      'Amount (₹)': Number(c.amount).toFixed(2),
      'Note': c.note || '',
      'Date': formatDate(c.date),
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(costsData), 'Cost Breakdown');

  XLSX.writeFile(wb, `Firuzeh-${new Date().toISOString().split('T')[0]}.xlsx`);
}
