import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import ManagerLayout from '../../layouts/ManagerLayout';

export default function Analytics() {
  const [period, setPeriod] = useState('daily');
  const [revenue, setRevenue] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revenueRes, bestSellersRes, categoryRes] = await Promise.all([
        analyticsService.getRevenueChart(period),
        analyticsService.getBestSellers(10),
        analyticsService.getCategorySales(),
      ]);
      setRevenue(revenueRes.data.data.chart);
      setBestSellers(bestSellersRes.data.data.bestSellers);
      setCategorySales(categoryRes.data.data.categorySales);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [period]);

  const totalRevenue = revenue.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = revenue.reduce((sum, d) => sum + d.orders, 0);

  return (
    <ManagerLayout pageTitle="Analytics">
      <div className="flex gap-3 mb-6">
        {['daily', 'weekly', 'monthly'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 capitalize transition-colors ${
              period === p ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-500">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Total Revenue ({period})</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">₹{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Total Orders ({period})</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{totalOrders}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Top 10 Best-Selling Products</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={bestSellers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="totalQuantitySold" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={320}>
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
        </>
      )}
    </ManagerLayout>
  );
}