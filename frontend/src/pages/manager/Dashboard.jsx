import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import ManagerLayout from '../../layouts/ManagerLayout';
import StatCard from '../../components/manager/StatCard';

const STATUS_COLORS = { IN_STOCK: '#22c55e', LOW_STOCK: '#f59e0b', OUT_OF_STOCK: '#ef4444' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const [statsRes, revenueRes, bestSellersRes, categoryRes, inventoryRes, recentRes] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getRevenueChart('daily'),
        analyticsService.getBestSellers(5),
        analyticsService.getCategorySales(),
        analyticsService.getInventoryStatus(),
        analyticsService.getRecentTransactions(5),
      ]);

      setStats(statsRes.data.data);
      setRevenue(revenueRes.data.data.chart);
      setBestSellers(bestSellersRes.data.data.bestSellers);
      setCategorySales(categoryRes.data.data.categorySales);
      setInventoryStatus(inventoryRes.data.data.inventoryStatus);
      setRecentTransactions(recentRes.data.data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // Refresh every 15s to reflect activity without needing full Socket.IO wiring here
    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <ManagerLayout pageTitle="Dashboard"><div className="text-slate-500">Loading dashboard...</div></ManagerLayout>;
  }

  const inventoryPieData = inventoryStatus
    ? Object.entries(inventoryStatus).map(([key, value]) => ({ name: key.replace('_', ' '), value, key }))
    : [];

  return (
    <ManagerLayout pageTitle="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Products" value={stats.totalProducts} icon="🏷️" accent="primary" />
        <StatCard label="Total Inventory" value={stats.totalInventory} icon="📦" accent="purple" />
        <StatCard label="Active Carts" value={stats.activeCarts} icon="🛒" accent="primary" />
        <StatCard label="Today's Sales" value={stats.todaysSales} icon="🧾" accent="green" />
        <StatCard label="Today's Revenue" value={`₹${stats.todaysRevenue}`} icon="💰" accent="green" />
        <StatCard label="Low Stock Items" value={stats.lowStockItems} icon="⚠️" accent="amber" />
        <StatCard label="Completed Transactions" value={stats.completedTransactions} icon="✅" accent="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Revenue (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory status pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Inventory Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={inventoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {inventoryPieData.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Best sellers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Best-Selling Products</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bestSellers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="totalQuantitySold" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Category-wise Sales</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categorySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="totalRevenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <h3 className="font-semibold text-slate-800 p-5 pb-0">Recent Transactions</h3>
        <table className="w-full mt-4">
          <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3">Transaction</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentTransactions.map((t) => (
              <tr key={t._id}>
                <td className="px-5 py-3 font-mono text-sm text-slate-700">{t.transactionId}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{t.customer?.name || 'Unknown'}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{t.products.length}</td>
                <td className="px-5 py-3 font-semibold text-slate-800">₹{t.total}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {recentTransactions.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No transactions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ManagerLayout>
  );
}