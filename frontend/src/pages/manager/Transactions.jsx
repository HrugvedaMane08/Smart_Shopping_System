import { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import ManagerLayout from '../../layouts/ManagerLayout';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getAll({ page, limit: 15 });
      setTransactions(res.data.data.transactions);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [page]);

  return (
    <ManagerLayout pageTitle="Transactions">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3">Transaction ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Cart</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No transactions yet</td></tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id}>
                  <td className="px-5 py-3 font-mono text-sm text-slate-700">{t.transactionId}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{t.customer?.name || 'Unknown'}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{t.cartId}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{t.products.length}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">₹{t.total}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      {t.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}