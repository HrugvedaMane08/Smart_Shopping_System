import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const managerLinks = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/manager/inventory', label: 'Inventory', icon: '📦' },
  { path: '/manager/products', label: 'Products', icon: '🏷️' },
  { path: '/manager/carts', label: 'Active Carts', icon: '🛒' },
  { path: '/manager/transactions', label: 'Transactions', icon: '💳' },
  { path: '/manager/analytics', label: 'Analytics', icon: '📈' },
  { path: '/manager/alerts', label: 'Alerts', icon: '🔔' },
  { path: '/manager/iot-simulator', label: 'IoT Simulator', icon: '📡' },
];

export default function ManagerLayout({ children, pageTitle }) {
  return (
    <div className="flex">
      <Sidebar links={managerLinks} title="Manager Portal" />
      <div className="ml-64 flex-1 min-h-screen bg-slate-50">
        <Header pageTitle={pageTitle} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}