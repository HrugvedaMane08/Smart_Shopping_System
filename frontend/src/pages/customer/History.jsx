import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import CustomerLayout from '../../layouts/CustomerLayout';

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await transactionService.getMyHistory();
        setTransactions(res.data.data.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <CustomerLayout pageTitle="Shopping History">
      {loading ? (
        <div className="text-slate-500">Loading history...</div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          No purchases yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Transaction ID</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td className="px-5 py-4 font-mono text-sm text-slate-700">{t.transactionId}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{t.products.length} items</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">₹{t.total}</td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/customer/receipt?transactionId=${t.transactionId}`}
                      className="text-primary-600 text-sm font-medium hover:underline"
                    >
                      View Receipt
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CustomerLayout>
  );
}