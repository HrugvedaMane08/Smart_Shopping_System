import { NavLink } from 'react-router-dom';

export default function Sidebar({ links, title }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="px-6 py-5 border-b border-slate-800">
        <h1 className="text-white font-bold text-lg">Smart Shopping</h1>
        <p className="text-slate-500 text-xs mt-0.5">{title}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-slate-800 text-slate-300'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}