import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const customerLinks = [
  { path: '/customer/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/customer/products', label: 'Products', icon: '🛍️' },
  { path: '/customer/cart', label: 'My Cart', icon: '🛒' },
  { path: '/customer/history', label: 'History', icon: '📜' },
];

export default function CustomerLayout({ children, pageTitle }) {
  return (
    <div className="flex">
      <Sidebar links={customerLinks} title="Customer Portal" />
      <div className="ml-64 flex-1 min-h-screen bg-slate-50">
        <Header pageTitle={pageTitle} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}